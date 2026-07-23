from datetime import datetime, timedelta, timezone
import logging
import uuid

import jwt
from flask import Flask, jsonify, request, session

app = Flask(__name__)

# Used to sign Flask session cookies.
# This is acceptable for a local lab only.
app.secret_key = "local-lab-secret-key"

JWT_SECRET = "local-jwt-secret-for-request-tracing-lab"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s"
)


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
    app.run(host="127.0.0.1", port=5000, debug=True)
