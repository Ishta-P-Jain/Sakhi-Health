"""Tests for symptom-log CRUD and per-user authorization. No diagnosis inferred."""
from conftest import auth_headers, login_user, register_user


def _token(client, email="user@example.com", password="password123"):
    _, body = login_user(client, email=email, password=password)
    return body["access_token"]


def test_create_and_list_symptom_log(auth_client):
    r = auth_client.post(
        "/api/symptoms",
        json={"symptom": "headache", "severity": "mild",
              "notes": "occasional", "occurred_at": "2024-01-10T08:00:00"},
    )
    assert r.status_code == 201, r.text
    log = r.json()
    assert log["symptom"] == "headache"
    assert log["severity"] == "mild"

    r = auth_client.get("/api/symptoms")
    assert r.status_code == 200
    assert len(r.json()) == 1


def test_create_symptom_invalid_severity(client):
    register_user(client)
    token = _token(client)
    r = client.post(
        "/api/symptoms",
        json={"symptom": "x", "severity": "critical", "occurred_at": "2024-01-10T08:00:00"},
        headers=auth_headers(token),
    )
    assert r.status_code == 422

    r = client.post(
        "/api/symptoms",
        json={"symptom": "   ", "severity": "mild", "occurred_at": "2024-01-10T08:00:00"},
        headers=auth_headers(token),
    )
    assert r.status_code == 422


def test_get_update_delete_symptom_log(auth_client):
    r = auth_client.post(
        "/api/symptoms",
        json={"symptom": "fatigue", "severity": "moderate", "occurred_at": "2024-02-01T08:00:00"},
    )
    assert r.status_code == 201
    log_id = r.json()["id"]

    r = auth_client.get(f"/api/symptoms/{log_id}")
    assert r.status_code == 200

    r = auth_client.put(
        f"/api/symptoms/{log_id}",
        json={"severity": "severe", "notes": "worsening"},
    )
    assert r.status_code == 200
    assert r.json()["severity"] == "severe"

    r = auth_client.delete(f"/api/symptoms/{log_id}")
    assert r.status_code == 204

    r = auth_client.get(f"/api/symptoms/{log_id}")
    assert r.status_code == 404


def test_symptom_requires_auth(client):
    r = client.post("/api/symptoms", json={"symptom": "x", "severity": "mild", "occurred_at": "2024-01-10T08:00:00"})
    assert r.status_code == 401


def test_user_cannot_access_another_users_symptom(client):
    register_user(client)
    token_a = _token(client)
    register_user(client, email="other@example.com")
    token_b = _token(client, email="other@example.com")

    r = client.post(
        "/api/symptoms",
        json={"symptom": "nausea", "severity": "mild", "occurred_at": "2024-03-01T08:00:00"},
        headers=auth_headers(token_a),
    )
    log_id = r.json()["id"]

    r = client.get(f"/api/symptoms/{log_id}", headers=auth_headers(token_b))
    assert r.status_code == 404

    r = client.delete(f"/api/symptoms/{log_id}", headers=auth_headers(token_b))
    assert r.status_code == 404

    r = client.get(f"/api/symptoms/{log_id}", headers=auth_headers(token_a))
    assert r.status_code == 200
