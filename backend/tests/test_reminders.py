"""Tests for reminder CRUD: scheduling, frequency, active status, completion tracking."""
from conftest import auth_headers, login_user, register_user


def _token(client, email="user@example.com", password="password123"):
    _, body = login_user(client, email=email, password=password)
    return body["access_token"]


def test_create_and_list_reminder(auth_client):
    r = auth_client.post(
        "/api/reminders",
        json={"title": "Iron tablet", "kind": "medication", "frequency": "daily",
              "time_of_day": "08:00", "active": True},
    )
    assert r.status_code == 201, r.text
    rem = r.json()
    assert rem["title"] == "Iron tablet"
    assert rem["kind"] == "medication"
    assert rem["active"] is True

    r = auth_client.get("/api/reminders")
    assert r.status_code == 200
    assert len(r.json()) == 1


def test_create_reminder_invalid_kind_and_frequency(client):
    register_user(client)
    token = _token(client)
    r = client.post(
        "/api/reminders",
        json={"title": "x", "kind": "vitamin", "frequency": "daily"},
        headers=auth_headers(token),
    )
    assert r.status_code == 422

    r = client.post(
        "/api/reminders",
        json={"title": "x", "kind": "medication", "frequency": "hourly"},
        headers=auth_headers(token),
    )
    assert r.status_code == 422


def test_filter_reminders_by_active_and_kind(auth_client):
    auth_client.post(
        "/api/reminders",
        json={"title": "Iron", "kind": "medication", "frequency": "daily", "active": True},
    )
    auth_client.post(
        "/api/reminders",
        json={"title": "Checkup", "kind": "preventive_care", "frequency": "monthly", "active": False},
    )

    r = auth_client.get("/api/reminders?active=true")
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["title"] == "Iron"

    r = auth_client.get("/api/reminders?kind=preventive_care")
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["title"] == "Checkup"


def test_mark_reminder_taken_and_update(auth_client):
    r = auth_client.post(
        "/api/reminders",
        json={"title": "Pill", "kind": "medication", "frequency": "daily"},
    )
    rem_id = r.json()["id"]

    r = auth_client.put(
        f"/api/reminders/{rem_id}",
        json={"last_taken": "2024-01-15T08:00:00", "active": False},
    )
    assert r.status_code == 200
    assert r.json()["active"] is False
    assert r.json()["last_taken"] == "2024-01-15T08:00:00"


def test_delete_reminder(auth_client):
    r = auth_client.post(
        "/api/reminders",
        json={"title": "Temp", "kind": "medication", "frequency": "daily"},
    )
    rem_id = r.json()["id"]

    r = auth_client.delete(f"/api/reminders/{rem_id}")
    assert r.status_code == 204

    r = auth_client.get(f"/api/reminders/{rem_id}")
    assert r.status_code == 404


def test_reminder_requires_auth(client):
    r = client.post("/api/reminders", json={"title": "x", "kind": "medication", "frequency": "daily"})
    assert r.status_code == 401


def test_user_cannot_access_another_users_reminder(client):
    register_user(client)
    token_a = _token(client)
    register_user(client, email="other@example.com")
    token_b = _token(client, email="other@example.com")

    r = client.post(
        "/api/reminders",
        json={"title": "Mine", "kind": "medication", "frequency": "daily"},
        headers=auth_headers(token_a),
    )
    rem_id = r.json()["id"]

    r = client.get(f"/api/reminders/{rem_id}", headers=auth_headers(token_b))
    assert r.status_code == 404

    r = client.delete(f"/api/reminders/{rem_id}", headers=auth_headers(token_b))
    assert r.status_code == 404

    r = client.get(f"/api/reminders/{rem_id}", headers=auth_headers(token_a))
    assert r.status_code == 200
