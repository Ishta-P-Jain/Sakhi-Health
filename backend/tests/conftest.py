"""Test configuration: in-memory SQLite DB + dependency override for the FastAPI app."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import app.database as database_module
from app.database import Base, get_db
from app.main import app

# Import all models so they are registered on Base.metadata
from app import models  # noqa: F401

TEST_DB_URL = "sqlite:///:memory:"

test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def register_user(client, email="user@example.com", password="password123", full_name="Test User"):
    r = client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "full_name": full_name},
    )
    assert r.status_code == 201, r.text
    return r.json()


def login_user(client, email="user@example.com", password="password123"):
    r = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert r.status_code == 200, r.text
    return r.json()["access_token"], r.json()


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def new_user(client):
    return register_user(client)


@pytest.fixture
def user_token(client, new_user):
    token, _ = login_user(client)
    return token


@pytest.fixture
def auth_client(client, user_token):
    client.headers.update(auth_headers(user_token))
    return client
