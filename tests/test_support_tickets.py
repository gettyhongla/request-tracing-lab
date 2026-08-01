import os
from pathlib import Path

import psycopg
import pytest


TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL")

pytestmark = pytest.mark.skipif(
    not TEST_DATABASE_URL,
    reason="set TEST_DATABASE_URL to run support-ticket integration tests"
)


@pytest.fixture()
def client(monkeypatch):
    import app as app_module

    monkeypatch.setattr(app_module, "DATABASE_URL", TEST_DATABASE_URL)
    app_module.app.config.update(TESTING=True, SECRET_KEY="test-secret")

    migration = Path("migrations/001_support_tickets.sql").read_text()
    with psycopg.connect(TEST_DATABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(migration)
            cur.execute(
                """
                TRUNCATE ticket_events, ticket_messages, tickets, users
                RESTART IDENTITY CASCADE;
                """
            )

    return app_module.app.test_client()


def register(client, username, email=None, password="cloudpass"):
    return client.post(
        "/api/auth/register",
        json={
            "username": username,
            "email": email or f"{username}@example.com",
            "password": password
        }
    )


def login(client, username, password="cloudpass"):
    return client.post(
        "/api/auth/login",
        json={"username": username, "password": password}
    )


def create_ticket(client, title="Cannot trace request"):
    return client.post(
        "/api/tickets",
        json={
            "title": title,
            "description": "I need help reading request logs.",
            "category": "technical_question",
            "priority": "medium"
        }
    )


def test_successful_registration(client):
    response = register(client, "alice")

    assert response.status_code == 201
    assert response.get_json()["user"]["username"] == "alice"


def test_duplicate_registration(client):
    register(client, "alice")
    response = register(client, "alice", email="alice2@example.com")

    assert response.status_code == 409
    assert response.get_json()["category"] == "duplicate_account"


def test_login_success_and_failure(client):
    register(client, "alice")
    client.post("/api/auth/logout")

    assert login(client, "alice").status_code == 200
    client.post("/api/auth/logout")

    response = login(client, "alice", password="wrongpass")
    assert response.status_code == 401


def test_ticket_creation_and_owner_view(client):
    register(client, "alice")
    created = create_ticket(client)
    ticket_id = created.get_json()["ticket"]["id"]

    response = client.get(f"/api/tickets/{ticket_id}")

    assert created.status_code == 201
    assert response.status_code == 200
    assert response.get_json()["ticket"]["id"] == ticket_id


def test_user_blocked_from_another_users_ticket(client):
    register(client, "alice")
    ticket_id = create_ticket(client).get_json()["ticket"]["id"]
    client.post("/api/auth/logout")

    register(client, "bob")
    response = client.get(f"/api/tickets/{ticket_id}")

    assert response.status_code == 403


def test_admin_can_view_all_tickets(client):
    register(client, "alice")
    create_ticket(client)
    client.post("/api/auth/logout")

    register(client, "getty")
    response = client.get("/api/admin/tickets")

    assert response.status_code == 200
    assert len(response.get_json()["tickets"]) == 1


def test_internal_note_hidden_from_regular_user(client):
    register(client, "alice")
    ticket_id = create_ticket(client).get_json()["ticket"]["id"]
    client.post("/api/auth/logout")

    register(client, "getty")
    client.post(
        f"/api/admin/tickets/{ticket_id}/internal-notes",
        json={"body": "Internal support-only note."}
    )
    client.post("/api/auth/logout")

    login(client, "alice")
    response = client.get(f"/api/tickets/{ticket_id}")
    message_types = [
        message["message_type"]
        for message in response.get_json()["messages"]
    ]

    assert "internal_note" not in message_types


def test_database_failure_returns_safe_error(client, monkeypatch):
    import app as app_module

    register(client, "alice")

    def broken_connection():
        raise psycopg.OperationalError("simulated database outage")

    monkeypatch.setattr(app_module, "get_db_connection", broken_connection)
    response = create_ticket(client)

    assert response.status_code == 503
    assert response.get_json()["error"] == "database unavailable"
