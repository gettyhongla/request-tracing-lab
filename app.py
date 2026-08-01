from datetime import datetime, timedelta, timezone
from functools import wraps
import json
import logging
import os
import time
import uuid

import redis
import jwt
import psycopg
from psycopg import errors
from psycopg.rows import dict_row
from flask import Flask, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash

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

TICKET_CATEGORIES = {
    "bug",
    "technical_question",
    "feature_request",
    "project_feedback",
    "access_issue",
    "performance_issue"
}
TICKET_PRIORITIES = {"low", "medium", "high", "critical"}
TICKET_STATUSES = {
    "open",
    "in_progress",
    "waiting_on_customer",
    "resolved",
    "closed"
}

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


def json_error(message, status, category=None):
    payload = {
        "error": message,
        "request_id": request.request_id
    }
    if category:
        payload["category"] = category
    return jsonify(payload), status


def current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    return {
        "id": user_id,
        "username": session.get("username"),
        "role": session.get("role", "customer")
    }


def require_login(view_func):
    @wraps(view_func)
    def wrapped(*args, **kwargs):
        if not current_user():
            return json_error("authentication required", 401, "unauthenticated")
        return view_func(*args, **kwargs)
    return wrapped


def require_admin(view_func):
    @wraps(view_func)
    def wrapped(*args, **kwargs):
        user = current_user()
        if not user:
            return json_error("authentication required", 401, "unauthenticated")
        if user["role"] != "admin":
            return json_error("administrator access required", 403, "unauthorized")
        return view_func(*args, **kwargs)
    return wrapped


def validate_required(data, fields):
    missing = [field for field in fields if not str(data.get(field, "")).strip()]
    if missing:
        return f"missing required field: {', '.join(missing)}"
    return None


def generate_ticket_number():
    return f"TCK-{uuid.uuid4().hex[:8].upper()}"


def log_ticket_operation(operation, user_id=None, ticket_id=None, result="ok",
                         error_category=None, elapsed_ms=None):
    logging.info(
        "ticket_operation request_id=%s operation=%s user_id=%s ticket_id=%s "
        "result=%s error_category=%s elapsed_ms=%s",
        request.request_id,
        operation,
        user_id,
        ticket_id,
        result,
        error_category,
        elapsed_ms
    )


def serialize_user(user):
    return {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "is_active": user["is_active"],
        "created_at": user["created_at"].isoformat()
    }


def serialize_ticket(ticket):
    return {
        "id": ticket["id"],
        "ticket_number": ticket["ticket_number"],
        "created_by": ticket["created_by"],
        "assigned_to": ticket["assigned_to"],
        "title": ticket["title"],
        "description": ticket["description"],
        "category": ticket["category"],
        "priority": ticket["priority"],
        "status": ticket["status"],
        "created_at": ticket["created_at"].isoformat(),
        "updated_at": ticket["updated_at"].isoformat(),
        "resolved_at": ticket["resolved_at"].isoformat() if ticket["resolved_at"] else None,
        "closed_at": ticket["closed_at"].isoformat() if ticket["closed_at"] else None
    }


def serialize_message(message):
    return {
        "id": message["id"],
        "ticket_id": message["ticket_id"],
        "author_id": message["author_id"],
        "body": message["body"],
        "message_type": message["message_type"],
        "created_at": message["created_at"].isoformat()
    }


def add_ticket_event(cur, ticket_id, actor_id, action, old_value=None, new_value=None):
    cur.execute(
        """
        INSERT INTO ticket_events (
            ticket_id, actor_id, action, old_value, new_value, request_id
        )
        VALUES (%s, %s, %s, %s, %s, %s);
        """,
        (ticket_id, actor_id, action, old_value, new_value, request.request_id)
    )


def load_ticket_for_user(cur, ticket_id, user):
    cur.execute("SELECT * FROM tickets WHERE id = %s;", (ticket_id,))
    ticket = cur.fetchone()
    if not ticket:
        return None, "missing"
    if user["role"] != "admin" and ticket["created_by"] != user["id"]:
        return None, "forbidden"
    return ticket, None


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

        <h2>Support Ticket Portal</h2>
        <input id="supportUsername" placeholder="username" value="getty">
        <input id="supportEmail" placeholder="email" value="getty@example.com">
        <input id="supportPassword" placeholder="password" type="password" value="cloudpass">
        <button onclick="registerSupportUser()">Register</button>
        <button onclick="loginSupportUser()">Login</button>
        <button onclick="logoutSupportUser()">Logout</button>
        <button onclick="showCurrentUser()">GET /api/auth/me</button>

        <br><br>
        <input id="ticketTitle" placeholder="ticket title" value="Cannot trace request">
        <select id="ticketCategory">
            <option value="bug">bug</option>
            <option value="technical_question">technical_question</option>
            <option value="feature_request">feature_request</option>
            <option value="project_feedback">project_feedback</option>
            <option value="access_issue">access_issue</option>
            <option value="performance_issue">performance_issue</option>
        </select>
        <select id="ticketPriority">
            <option value="low">low</option>
            <option value="medium" selected>medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
        </select>
        <br>
        <textarea id="ticketDescription" placeholder="description">I need help understanding where this request failed.</textarea>
        <br>
        <button onclick="createSupportTicket()">Create Ticket</button>
        <button onclick="listMyTickets()">List My Tickets</button>
        <button onclick="listAdminTickets()">Admin: List All Tickets</button>

        <br><br>
        <input id="ticketId" placeholder="ticket id">
        <input id="ticketReply" placeholder="reply" value="Adding more evidence from my request.">
        <button onclick="viewTicket()">View Ticket</button>
        <button onclick="replyToTicket()">Reply</button>
        <button onclick="adminResolveTicket()">Admin: Resolve</button>
        <button onclick="adminInternalNote()">Admin: Internal Note</button>

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

            function credentials() {
                return {
                    username: document.getElementById("supportUsername").value,
                    email: document.getElementById("supportEmail").value,
                    password: document.getElementById("supportPassword").value
                };
            }

            async function registerSupportUser() {
                const response = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(credentials())
                });
                display({status: response.status, body: await response.json()});
            }

            async function loginSupportUser() {
                const login = credentials();
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        username: login.username,
                        password: login.password
                    })
                });
                display({status: response.status, body: await response.json()});
            }

            async function logoutSupportUser() {
                const response = await fetch("/api/auth/logout", {method: "POST"});
                display({status: response.status, body: await response.json()});
            }

            async function showCurrentUser() {
                const response = await fetch("/api/auth/me");
                display({status: response.status, body: await response.json()});
            }

            async function createSupportTicket() {
                const response = await fetch("/api/tickets", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        title: document.getElementById("ticketTitle").value,
                        description: document.getElementById("ticketDescription").value,
                        category: document.getElementById("ticketCategory").value,
                        priority: document.getElementById("ticketPriority").value
                    })
                });
                const body = await response.json();
                if (body.ticket) {
                    document.getElementById("ticketId").value = body.ticket.id;
                }
                display({status: response.status, body: body});
            }

            async function listMyTickets() {
                const response = await fetch("/api/tickets");
                display({status: response.status, body: await response.json()});
            }

            async function listAdminTickets() {
                const response = await fetch("/api/admin/tickets");
                display({status: response.status, body: await response.json()});
            }

            async function viewTicket() {
                const ticketId = document.getElementById("ticketId").value;
                const response = await fetch(`/api/tickets/${ticketId}`);
                display({status: response.status, body: await response.json()});
            }

            async function replyToTicket() {
                const ticketId = document.getElementById("ticketId").value;
                const response = await fetch(`/api/tickets/${ticketId}/messages`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        body: document.getElementById("ticketReply").value
                    })
                });
                display({status: response.status, body: await response.json()});
            }

            async function adminResolveTicket() {
                const ticketId = document.getElementById("ticketId").value;
                const response = await fetch(`/api/admin/tickets/${ticketId}`, {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        status: "resolved",
                        priority: document.getElementById("ticketPriority").value
                    })
                });
                display({status: response.status, body: await response.json()});
            }

            async function adminInternalNote() {
                const ticketId = document.getElementById("ticketId").value;
                const response = await fetch(`/api/admin/tickets/${ticketId}/internal-notes`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({body: "Internal note: reviewed support evidence."})
                });
                display({status: response.status, body: await response.json()});
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


@app.post("/api/auth/register")
def api_register():
    data = request.get_json(silent=True) or {}
    error = validate_required(data, ["username", "email", "password"])
    if error:
        return json_error(error, 400, "invalid_input")

    username = data["username"].strip()
    email = data["email"].strip().lower()
    password = data["password"]
    if len(password) < 8:
        return json_error("password must be at least 8 characters", 400, "invalid_input")

    role = "admin" if username.lower() == "getty" else "customer"
    started = time.monotonic()

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO users (username, email, password_hash, role)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id, username, email, role, is_active, created_at;
                    """,
                    (username, email, generate_password_hash(password), role)
                )
                user = cur.fetchone()
    except errors.UniqueViolation:
        log_ticket_operation(
            "register",
            result="error",
            error_category="duplicate_account",
            elapsed_ms=round((time.monotonic() - started) * 1000, 2)
        )
        return json_error("username or email already exists", 409, "duplicate_account")
    except psycopg.Error:
        logging.exception("database_error request_id=%s operation=register", request.request_id)
        return json_error("database unavailable", 503, "database_unavailable")

    session["user_id"] = user["id"]
    session["username"] = user["username"]
    session["role"] = user["role"]
    log_ticket_operation(
        "register",
        user_id=user["id"],
        elapsed_ms=round((time.monotonic() - started) * 1000, 2)
    )

    return jsonify({
        "user": serialize_user(user),
        "request_id": request.request_id
    }), 201


@app.post("/api/auth/login")
def api_login():
    data = request.get_json(silent=True) or {}
    error = validate_required(data, ["username", "password"])
    if error:
        return json_error(error, 400, "invalid_input")

    started = time.monotonic()
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, username, email, password_hash, role, is_active, created_at
                    FROM users
                    WHERE LOWER(username) = LOWER(%s);
                    """,
                    (data["username"].strip(),)
                )
                user = cur.fetchone()
    except psycopg.Error:
        logging.exception("database_error request_id=%s operation=login", request.request_id)
        return json_error("database unavailable", 503, "database_unavailable")

    if not user or not user["is_active"] or not check_password_hash(
        user["password_hash"],
        data["password"]
    ):
        log_ticket_operation(
            "login",
            result="error",
            error_category="invalid_credentials",
            elapsed_ms=round((time.monotonic() - started) * 1000, 2)
        )
        return json_error("invalid credentials", 401, "invalid_credentials")

    session["user_id"] = user["id"]
    session["username"] = user["username"]
    session["role"] = user["role"]
    log_ticket_operation(
        "login",
        user_id=user["id"],
        elapsed_ms=round((time.monotonic() - started) * 1000, 2)
    )

    return jsonify({
        "user": serialize_user(user),
        "request_id": request.request_id
    })


@app.post("/api/auth/logout")
def api_logout():
    user = current_user()
    session.clear()
    log_ticket_operation(
        "logout",
        user_id=user["id"] if user else None
    )
    return jsonify({
        "message": "logged out",
        "request_id": request.request_id
    })


@app.get("/api/auth/me")
def api_me():
    user = current_user()
    if not user:
        return json_error("authentication required", 401, "unauthenticated")
    return jsonify({
        "user": user,
        "request_id": request.request_id
    })


@app.post("/api/tickets")
@require_login
def api_create_ticket():
    user = current_user()
    data = request.get_json(silent=True) or {}
    error = validate_required(data, ["title", "description", "category"])
    if error:
        return json_error(error, 400, "invalid_input")

    category = data["category"].strip()
    priority = data.get("priority", "medium").strip()
    if category not in TICKET_CATEGORIES:
        return json_error("invalid ticket category", 400, "invalid_input")
    if priority not in TICKET_PRIORITIES:
        return json_error("invalid ticket priority", 400, "invalid_input")

    started = time.monotonic()
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO tickets (
                        ticket_number, created_by, title, description, category, priority
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING *;
                    """,
                    (
                        generate_ticket_number(),
                        user["id"],
                        data["title"].strip(),
                        data["description"].strip(),
                        category,
                        priority
                    )
                )
                ticket = cur.fetchone()
                cur.execute(
                    """
                    INSERT INTO ticket_messages (
                        ticket_id, author_id, body, message_type
                    )
                    VALUES (%s, %s, %s, 'customer_reply');
                    """,
                    (ticket["id"], user["id"], data["description"].strip())
                )
                add_ticket_event(cur, ticket["id"], user["id"], "ticket_created")
    except psycopg.Error:
        logging.exception(
            "database_error request_id=%s operation=create_ticket user_id=%s",
            request.request_id,
            user["id"]
        )
        return json_error("database unavailable", 503, "database_unavailable")

    log_ticket_operation(
        "create_ticket",
        user_id=user["id"],
        ticket_id=ticket["id"],
        elapsed_ms=round((time.monotonic() - started) * 1000, 2)
    )
    return jsonify({
        "ticket": serialize_ticket(ticket),
        "request_id": request.request_id
    }), 201


@app.get("/api/tickets")
@require_login
def api_list_tickets():
    user = current_user()
    started = time.monotonic()
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT *
                    FROM tickets
                    WHERE created_by = %s
                    ORDER BY created_at DESC;
                    """,
                    (user["id"],)
                )
                tickets = cur.fetchall()
    except psycopg.Error:
        logging.exception(
            "database_error request_id=%s operation=list_tickets user_id=%s",
            request.request_id,
            user["id"]
        )
        return json_error("database unavailable", 503, "database_unavailable")

    log_ticket_operation(
        "list_tickets",
        user_id=user["id"],
        elapsed_ms=round((time.monotonic() - started) * 1000, 2)
    )
    return jsonify({
        "tickets": [serialize_ticket(ticket) for ticket in tickets],
        "request_id": request.request_id
    })


@app.get("/api/tickets/<int:ticket_id>")
@require_login
def api_get_ticket(ticket_id):
    user = current_user()
    started = time.monotonic()
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                ticket, failure = load_ticket_for_user(cur, ticket_id, user)
                if failure == "missing":
                    return json_error("ticket not found", 404, "missing_ticket")
                if failure == "forbidden":
                    return json_error("ticket access denied", 403, "unauthorized")
                message_filter = "" if user["role"] == "admin" else "AND message_type <> 'internal_note'"
                cur.execute(
                    f"""
                    SELECT *
                    FROM ticket_messages
                    WHERE ticket_id = %s {message_filter}
                    ORDER BY created_at ASC;
                    """,
                    (ticket_id,)
                )
                messages = cur.fetchall()
    except psycopg.Error:
        logging.exception(
            "database_error request_id=%s operation=get_ticket user_id=%s ticket_id=%s",
            request.request_id,
            user["id"],
            ticket_id
        )
        return json_error("database unavailable", 503, "database_unavailable")

    log_ticket_operation(
        "get_ticket",
        user_id=user["id"],
        ticket_id=ticket_id,
        elapsed_ms=round((time.monotonic() - started) * 1000, 2)
    )
    return jsonify({
        "ticket": serialize_ticket(ticket),
        "messages": [serialize_message(message) for message in messages],
        "request_id": request.request_id
    })


@app.post("/api/tickets/<int:ticket_id>/messages")
@require_login
def api_add_ticket_message(ticket_id):
    user = current_user()
    data = request.get_json(silent=True) or {}
    error = validate_required(data, ["body"])
    if error:
        return json_error(error, 400, "invalid_input")

    started = time.monotonic()
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                ticket, failure = load_ticket_for_user(cur, ticket_id, user)
                if failure == "missing":
                    return json_error("ticket not found", 404, "missing_ticket")
                if failure == "forbidden":
                    return json_error("ticket access denied", 403, "unauthorized")
                message_type = "support_reply" if user["role"] == "admin" else "customer_reply"
                cur.execute(
                    """
                    INSERT INTO ticket_messages (ticket_id, author_id, body, message_type)
                    VALUES (%s, %s, %s, %s)
                    RETURNING *;
                    """,
                    (ticket_id, user["id"], data["body"].strip(), message_type)
                )
                message = cur.fetchone()
                add_ticket_event(cur, ticket_id, user["id"], "message_added", None, message_type)
    except psycopg.Error:
        logging.exception(
            "database_error request_id=%s operation=add_message user_id=%s ticket_id=%s",
            request.request_id,
            user["id"],
            ticket_id
        )
        return json_error("database unavailable", 503, "database_unavailable")

    log_ticket_operation(
        "add_message",
        user_id=user["id"],
        ticket_id=ticket_id,
        elapsed_ms=round((time.monotonic() - started) * 1000, 2)
    )
    return jsonify({
        "message": serialize_message(message),
        "request_id": request.request_id
    }), 201


@app.get("/api/admin/tickets")
@require_admin
def api_admin_list_tickets():
    user = current_user()
    started = time.monotonic()
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM tickets ORDER BY created_at DESC;")
                tickets = cur.fetchall()
    except psycopg.Error:
        logging.exception(
            "database_error request_id=%s operation=admin_list_tickets user_id=%s",
            request.request_id,
            user["id"]
        )
        return json_error("database unavailable", 503, "database_unavailable")

    log_ticket_operation(
        "admin_list_tickets",
        user_id=user["id"],
        elapsed_ms=round((time.monotonic() - started) * 1000, 2)
    )
    return jsonify({
        "tickets": [serialize_ticket(ticket) for ticket in tickets],
        "request_id": request.request_id
    })


@app.patch("/api/admin/tickets/<int:ticket_id>")
@require_admin
def api_admin_update_ticket(ticket_id):
    user = current_user()
    data = request.get_json(silent=True) or {}
    allowed_updates = {}
    if "status" in data:
        if data["status"] not in TICKET_STATUSES:
            return json_error("invalid ticket status", 400, "invalid_input")
        allowed_updates["status"] = data["status"]
    if "priority" in data:
        if data["priority"] not in TICKET_PRIORITIES:
            return json_error("invalid ticket priority", 400, "invalid_input")
        allowed_updates["priority"] = data["priority"]
    if "assigned_to" in data:
        allowed_updates["assigned_to"] = data["assigned_to"]
    if not allowed_updates:
        return json_error("no supported ticket fields provided", 400, "invalid_input")

    started = time.monotonic()
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM tickets WHERE id = %s;", (ticket_id,))
                old_ticket = cur.fetchone()
                if not old_ticket:
                    return json_error("ticket not found", 404, "missing_ticket")

                set_parts = []
                values = []
                for field, value in allowed_updates.items():
                    set_parts.append(f"{field} = %s")
                    values.append(value)
                    add_ticket_event(
                        cur,
                        ticket_id,
                        user["id"],
                        f"{field}_changed",
                        str(old_ticket[field]),
                        str(value)
                    )
                if allowed_updates.get("status") == "resolved":
                    set_parts.append("resolved_at = COALESCE(resolved_at, NOW())")
                if allowed_updates.get("status") == "closed":
                    set_parts.append("closed_at = COALESCE(closed_at, NOW())")
                set_parts.append("updated_at = NOW()")
                values.append(ticket_id)
                cur.execute(
                    f"""
                    UPDATE tickets
                    SET {', '.join(set_parts)}
                    WHERE id = %s
                    RETURNING *;
                    """,
                    values
                )
                ticket = cur.fetchone()
    except psycopg.Error:
        logging.exception(
            "database_error request_id=%s operation=admin_update_ticket user_id=%s ticket_id=%s",
            request.request_id,
            user["id"],
            ticket_id
        )
        return json_error("database unavailable", 503, "database_unavailable")

    log_ticket_operation(
        "admin_update_ticket",
        user_id=user["id"],
        ticket_id=ticket_id,
        elapsed_ms=round((time.monotonic() - started) * 1000, 2)
    )
    return jsonify({
        "ticket": serialize_ticket(ticket),
        "request_id": request.request_id
    })


@app.post("/api/admin/tickets/<int:ticket_id>/messages")
@require_admin
def api_admin_add_message(ticket_id):
    return add_admin_ticket_message(ticket_id, "support_reply")


@app.post("/api/admin/tickets/<int:ticket_id>/internal-notes")
@require_admin
def api_admin_add_internal_note(ticket_id):
    return add_admin_ticket_message(ticket_id, "internal_note")


def add_admin_ticket_message(ticket_id, message_type):
    user = current_user()
    data = request.get_json(silent=True) or {}
    error = validate_required(data, ["body"])
    if error:
        return json_error(error, 400, "invalid_input")

    started = time.monotonic()
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                ticket, failure = load_ticket_for_user(cur, ticket_id, user)
                if failure == "missing":
                    return json_error("ticket not found", 404, "missing_ticket")
                cur.execute(
                    """
                    INSERT INTO ticket_messages (ticket_id, author_id, body, message_type)
                    VALUES (%s, %s, %s, %s)
                    RETURNING *;
                    """,
                    (ticket_id, user["id"], data["body"].strip(), message_type)
                )
                message = cur.fetchone()
                add_ticket_event(cur, ticket_id, user["id"], "message_added", None, message_type)
    except psycopg.Error:
        logging.exception(
            "database_error request_id=%s operation=admin_add_message user_id=%s ticket_id=%s",
            request.request_id,
            user["id"],
            ticket_id
        )
        return json_error("database unavailable", 503, "database_unavailable")

    log_ticket_operation(
        "admin_add_message",
        user_id=user["id"],
        ticket_id=ticket_id,
        elapsed_ms=round((time.monotonic() - started) * 1000, 2)
    )
    return jsonify({
        "message": serialize_message(message),
        "request_id": request.request_id
    }), 201


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
