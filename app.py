from datetime import datetime, timedelta, timezone
import logging
import os
import uuid
import json
import redis
import jwt
import psycopg
from psycopg.rows import dict_row
from flask import Flask, jsonify, request, session

app = Flask(__name__)

# Used to sign Flask session cookies.
# This is acceptable for a local lab only.
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "local-lab-secret-key")

JWT_SECRET = os.environ.get(
    "JWT_SECRET",
    "local-jwt-secret-for-request-tracing-lab"
)
DATABASE_URL = os.environ.get("DATABASE_URL", "dbname=request_tracing_lab")
REDIS_URL = os.environ.get("REDIS_URL", "redis://127.0.0.1:6379/0")
NOTES_CACHE_KEY = "notes:latest"
NOTES_CACHE_TTL_SECONDS = 30

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s"
)


def get_db_connection():
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)


def get_redis_client():
    return redis.Redis.from_url(REDIS_URL, decode_responses=True)


def read_notes_from_postgres():
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, message, created_at
                FROM request_notes
                ORDER BY id DESC
                LIMIT 10;
                """
            )
            return cur.fetchall()


def serialize_notes(notes):
    return [
        {
            "id": note["id"],
            "message": note["message"],
            "created_at": note["created_at"].isoformat()
        }
        for note in notes
    ]


@app.before_request
def begin_request():
    request.request_id = request.headers.get(
        "X-Request-ID",
        str(uuid.uuid4())
    )

    logging.info(
        "request_started request_id=%s method=%s path=%s remote_ip=%s user_agent=%s",
        request.request_id,
        request.method,
        request.path,
        request.remote_addr,
        request.headers.get("User-Agent")
    )


@app.after_request
def finish_request(response):
    response.headers["X-Request-ID"] = request.request_id

    logging.info(
        "request_finished request_id=%s status=%s",
        request.request_id,
        response.status_code
    )

    return response


@app.get("/")
def home():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Request Tracing Lab</title>
    </head>
    <body>
        <h1>Request Tracing Lab</h1>

        <button onclick="checkHealth()">GET /health</button>
        <button onclick="loginSession()">Session Login</button>
        <button onclick="viewSessionProfile()">Session Profile</button>
        <button onclick="loginJwt()">JWT Login</button>
        <button onclick="viewJwtProfile()">JWT Profile</button>
        <button onclick="checkSlow()">GET /slow</button>
        <button onclick="triggerError()">Trigger 500</button>

        <pre id="output"></pre>

        <script>
            let jwtToken = null;

            function display(data) {
                document.getElementById("output").textContent =
                    JSON.stringify(data, null, 2);
            }

            async function checkHealth() {
                const response = await fetch("/health");

                display({
                    status: response.status,
                    headers: Object.fromEntries(response.headers.entries()),
                    body: await response.json()
                });
            }

            async function loginSession() {
                const response = await fetch("/session/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Client-Name": "browser-lab"
                    },
                    body: JSON.stringify({
                        username: "getty",
                        password: "cloud"
                    })
                });

                display({
                    status: response.status,
                    headers: Object.fromEntries(response.headers.entries()),
                    body: await response.json()
                });
            }

            async function viewSessionProfile() {
                const response = await fetch("/session/profile");

                display({
                    status: response.status,
                    headers: Object.fromEntries(response.headers.entries()),
                    body: await response.json()
                });
            }

            async function loginJwt() {
                const response = await fetch("/jwt/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: "getty",
                        password: "cloud"
                    })
                });

                const body = await response.json();
                jwtToken = body.token;

                display({
                    status: response.status,
                    headers: Object.fromEntries(response.headers.entries()),
                    body: body
                });
            }

            async function viewJwtProfile() {
                const response = await fetch("/jwt/profile", {
                    headers: {
                        "Authorization": `Bearer ${jwtToken}`
                    }
                });

                display({
                    status: response.status,
                    headers: Object.fromEntries(response.headers.entries()),
                    body: await response.json()
                });
            }

            async function checkSlow() {
                const response = await fetch("/slow");

                display({
                    status: response.status,
                    headers: Object.fromEntries(response.headers.entries()),
                    body: await response.json()
                });
            }

            async function triggerError() {
                const response = await fetch("/error");

                display({
                    status: response.status,
                    headers: Object.fromEntries(response.headers.entries()),
                    body: await response.json()
                });
            }
        </script>
    </body>
    </html>
    """


@app.get("/health")
def health():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })


@app.post("/notes")
def create_note():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "").strip()

    if not message:
        return jsonify({
            "error": "message is required",
            "request_id": request.request_id
        }), 400

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO request_notes (message)
                    VALUES (%s)
                    RETURNING id, message, created_at;
                    """,
                    (message,)
                )
                note = cur.fetchone()
    except psycopg.Error:
        logging.exception(
            "database_error request_id=%s operation=create_note",
            request.request_id
        )
        return jsonify({
            "error": "database unavailable",
            "request_id": request.request_id
        }), 503

    logging.info(
        "database_write request_id=%s table=request_notes row_id=%s",
        request.request_id,
        note["id"]
    )

    try:
        get_redis_client().delete(NOTES_CACHE_KEY)
        logging.info(
            "cache_invalidated request_id=%s key=%s",
            request.request_id,
            NOTES_CACHE_KEY
        )
    except redis.RedisError:
        logging.exception(
            "cache_invalidation_error request_id=%s key=%s",
            request.request_id,
            NOTES_CACHE_KEY
        )

    return jsonify({
        "note": note,
        "request_id": request.request_id
    }), 201


@app.get("/notes")
def list_notes():
    cache_status = "miss"

    try:
        cached_notes = get_redis_client().get(NOTES_CACHE_KEY)
        if cached_notes:
            notes = json.loads(cached_notes)
            logging.info(
                "cache_hit request_id=%s key=%s rows=%s",
                request.request_id,
                NOTES_CACHE_KEY,
                len(notes)
            )
            return jsonify({
                "cache": "hit",
                "notes": notes,
                "request_id": request.request_id
            })
        logging.info(
            "cache_miss request_id=%s key=%s",
            request.request_id,
            NOTES_CACHE_KEY
        )
    except redis.RedisError:
        cache_status = "unavailable"
        logging.exception(
            "cache_error request_id=%s key=%s",
            request.request_id,
            NOTES_CACHE_KEY
        )

    try:
        notes = read_notes_from_postgres()
    except psycopg.Error:
        logging.exception(
            "database_error request_id=%s operation=list_notes",
            request.request_id
        )
        return jsonify({
            "error": "database unavailable",
            "request_id": request.request_id
        }), 503

    logging.info(
        "database_read request_id=%s table=request_notes rows=%s",
        request.request_id,
        len(notes)
    )

    serialized_notes = serialize_notes(notes)

    if cache_status == "miss":
        try:
            get_redis_client().setex(
                NOTES_CACHE_KEY,
                NOTES_CACHE_TTL_SECONDS,
                json.dumps(serialized_notes)
            )
            logging.info(
                "cache_store request_id=%s key=%s ttl_seconds=%s rows=%s",
                request.request_id,
                NOTES_CACHE_KEY,
                NOTES_CACHE_TTL_SECONDS,
                len(serialized_notes)
            )
        except redis.RedisError:
            cache_status = "unavailable"
            logging.exception(
                "cache_store_error request_id=%s key=%s",
                request.request_id,
                NOTES_CACHE_KEY
            )

    return jsonify({
        "cache": cache_status,
        "notes": serialized_notes,
        "request_id": request.request_id
    })


@app.post("/session/login")
def session_login():
    data = request.get_json(silent=True) or {}

    if data.get("username") != "getty" or data.get("password") != "cloud":
        return jsonify({
            "error": "invalid credentials",
            "request_id": request.request_id
        }), 401

    session["username"] = data["username"]

    return jsonify({
        "message": "session login successful",
        "request_id": request.request_id
    })


@app.get("/session/profile")
def session_profile():
    username = session.get("username")

    if not username:
        return jsonify({
            "error": "session missing or expired",
            "request_id": request.request_id
        }), 401

    return jsonify({
        "username": username,
        "authentication": "session cookie",
        "request_id": request.request_id
    })


@app.post("/jwt/login")
def jwt_login():
    data = request.get_json(silent=True) or {}

    if data.get("username") != "getty" or data.get("password") != "cloud":
        return jsonify({
            "error": "invalid credentials",
            "request_id": request.request_id
        }), 401

    payload = {
        "sub": data["username"],
        "role": "customer",
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=10)
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    return jsonify({
        "token": token,
        "request_id": request.request_id
    })


@app.get("/jwt/profile")
def jwt_profile():
    authorization = request.headers.get("Authorization", "")

    if not authorization.startswith("Bearer "):
        return jsonify({
            "error": "missing bearer token",
            "request_id": request.request_id
        }), 401

    token = authorization.removeprefix("Bearer ")

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )
    except jwt.ExpiredSignatureError:
        return jsonify({
            "error": "token expired",
            "request_id": request.request_id
        }), 401
    except jwt.InvalidTokenError:
        return jsonify({
            "error": "invalid token",
            "request_id": request.request_id
        }), 401

    return jsonify({
        "username": payload["sub"],
        "role": payload["role"],
        "authentication": "JWT",
        "request_id": request.request_id
    })


@app.get("/error")
def error():
    try:
        raise RuntimeError("Simulated application failure")
    except RuntimeError:
        logging.exception(
            "application_error request_id=%s",
            request.request_id
        )

        return jsonify({
            "error": "internal server error",
            "request_id": request.request_id
        }), 500


@app.get("/slow")
def slow():
    import time
    time.sleep(3)

    return jsonify({
        "message": "slow response completed",
        "request_id": request.request_id
    })


if __name__ == "__main__":
    app.run(
        host=os.environ.get("FLASK_RUN_HOST", "127.0.0.1"),
        port=int(os.environ.get("FLASK_RUN_PORT", "5000")),
        debug=os.environ.get("FLASK_DEBUG", "true").lower() == "true"
    )
