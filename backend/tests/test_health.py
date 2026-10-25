"""Tests for health-log CRUD and per-user authorization."""
from conftest import auth_headers, login_user, register_user


def _headers(client, email="user@example.com", password="password123"):
    _, body = login_user(client, email=email, password=password)
    return auth_headers(body["access_token"])


def test_create_and_list_health_log(auth_client):
    r = auth_client.post(
        "/api/health/logs",
        json={"cycle_start_date": "2024-01-01", "cycle_end_date": "2024-01-05",
              "flow_level": "medium", "notes": "cramps"},
    )
    assert r.status_code == 201, r.text
    log = r.json()
    assert log["flow_level"] == "medium"
    assert log["id"]

    r = auth_client.get("/api/health/logs")
    assert r.status_code == 200
    assert len(r.json()) == 1


def test_create_health_log_invalid_flow(client):
    register_user(client)
    token, _ = login_user(client)
    r = client.post(
        "/api/health/logs",
        json={"flow_level": "super-heavy"},
        headers=auth_headers(token),
    )
    assert r.status_code == 422


def test_get_update_delete_health_log(auth_client):
    r = auth_client.post(
        "/api/health/logs",
        json={"cycle_start_date": "2024-02-01", "notes": "initial"},
    )
    assert r.status_code == 201
    log_id = r.json()["id"]

    r = auth_client.get(f"/api/health/logs/{log_id}")
    assert r.status_code == 200
    assert r.json()["notes"] == "initial"

    r = auth_client.put(
        f"/api/health/logs/{log_id}",
        json={"notes": "updated", "flow_level": "heavy"},
    )
    assert r.status_code == 200
    assert r.json()["notes"] == "updated"
    assert r.json()["flow_level"] == "heavy"

    r = auth_client.delete(f"/api/health/logs/{log_id}")
    assert r.status_code == 204

    r = auth_client.get(f"/api/health/logs/{log_id}")
    assert r.status_code == 404


def test_health_log_requires_auth(client):
    r = client.post("/api/health/logs", json={"notes": "x"})
    assert r.status_code == 401
    r = client.get("/api/health/logs")
    assert r.status_code == 401


def test_user_cannot_access_another_users_health_log(client):
    register_user(client)
    token_a, _ = login_user(client)
    register_user(client, email="other@example.com")
    token_b, _ = login_user(client, email="other@example.com")

    r = client.post(
        "/api/health/logs",
        json={"cycle_start_date": "2024-03-01", "notes": "mine"},
        headers=auth_headers(token_a),
    )
    log_id = r.json()["id"]

    r = client.get(f"/api/health/logs/{log_id}", headers=auth_headers(token_b))
    assert r.status_code == 404

    r = client.put(
        f"/api/health/logs/{log_id}",
        json={"notes": "hacked"},
        headers=auth_headers(token_b),
    )
    assert r.status_code == 404

    r = client.delete(f"/api/health/logs/{log_id}", headers=auth_headers(token_b))
    assert r.status_code == 404

    # Owner still intact
    r = client.get(f"/api/health/logs/{log_id}", headers=auth_headers(token_a))
    assert r.status_code == 200
