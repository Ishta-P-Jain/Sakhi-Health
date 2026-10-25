"""Tests for authentication: register, login, current user."""
from conftest import auth_headers, login_user, register_user


def test_register_and_login(client):
    register_user(client)
    token, body = login_user(client)
    assert token and body["access_token"] == token


def test_register_duplicate_email(client):
    register_user(client)
    r = client.post(
        "/api/auth/register",
        json={"email": "user@example.com", "password": "password123"},
    )
    assert r.status_code == 409
    assert r.json()["detail"] == "email_already_registered"


def test_register_validation(client):
    r = client.post(
        "/api/auth/register",
        json={"email": "not-an-email", "password": "short"},
    )
    assert r.status_code == 422


def test_login_invalid_credentials(client):
    register_user(client)
    r = client.post(
        "/api/auth/login",
        json={"email": "user@example.com", "password": "wrongpassword"},
    )
    assert r.status_code == 401


def test_me_requires_auth(client):
    r = client.get("/api/auth/me")
    assert r.status_code == 401


def test_me_returns_user(client):
    register_user(client)
    token, _ = login_user(client)
    r = client.get("/api/auth/me", headers=auth_headers(token))
    assert r.status_code == 200
    body = r.json()
    assert body["email"] == "user@example.com"
    assert "password_hash" not in body
