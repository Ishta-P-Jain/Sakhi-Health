"""Tests for medical-report upload/list/retrieve/delete with authorization and storage safety."""
import io
from conftest import auth_headers, login_user, register_user


def _token(client, email="user@example.com", password="password123"):
    _, body = login_user(client, email=email, password=password)
    return body["access_token"]


def _upload_file(client, token, filename, content, content_type):
    return client.post(
        "/api/reports/upload",
        files={"file": (filename, io.BytesIO(content), content_type)},
        headers=auth_headers(token),
    )


def test_upload_valid_pdf(auth_client):
    content = b"%PDF-1.4 fake"
    r = _upload_file(auth_client, _token(auth_client), "report.pdf", content, "application/pdf")
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["original_filename"] == "report.pdf"
    assert body["file_type"] == "application/pdf"
    assert body["file_size"] == len(content)
    assert body["id"]
    # stored filename should be safe (uuid + .pdf), not the original name
    assert body["filename"] != "report.pdf"
    assert body["filename"].endswith(".pdf")


def test_upload_valid_image(auth_client):
    r = _upload_file(auth_client, _token(auth_client), "scan.png", b"\x89PNG fake", "image/png")
    assert r.status_code == 201, r.text
    assert r.json()["file_type"] == "image/png"


def test_upload_invalid_file_type(client):
    register_user(client)
    token = _token(client)
    r = _upload_file(client, token, "notes.txt", b"hello", "text/plain")
    assert r.status_code == 400
    assert "file_type_not_allowed" in r.json()["detail"]

    r = _upload_file(client, token, "script.sh", b"#!/bin/bash", "application/x-shellscript")
    assert r.status_code == 400


def test_upload_empty_file(client):
    register_user(client)
    token = _token(client)
    r = _upload_file(client, token, "empty.pdf", b"", "application/pdf")
    assert r.status_code == 400
    assert r.json()["detail"] == "empty_file"


def test_upload_requires_auth(client):
    r = _upload_file(client, None, "x.pdf", b"%PDF", "application/pdf")
    assert r.status_code == 401


def test_upload_no_filename(client):
    register_user(client)
    token = _token(client)
    r = client.post(
        "/api/reports/upload",
        files={"file": ("", io.BytesIO(b"%PDF"), "application/pdf")},
        headers=auth_headers(token),
    )
    assert r.status_code == 422


def test_list_and_get_report(auth_client):
    r = _upload_file(auth_client, _token(auth_client), "report.pdf", b"%PDF-1.4 fake", "application/pdf")
    report_id = r.json()["id"]

    r = auth_client.get("/api/reports")
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["id"] == report_id

    r = auth_client.get(f"/api/reports/{report_id}")
    assert r.status_code == 200
    assert r.json()["original_filename"] == "report.pdf"


def test_download_report_file(auth_client):
    r = _upload_file(auth_client, _token(auth_client), "scan.png", b"\x89PNG fake", "image/png")
    report_id = r.json()["id"]

    r = auth_client.get(f"/api/reports/{report_id}/file")
    assert r.status_code == 200
    assert r.content == b"\x89PNG fake"
    assert r.headers["content-type"].startswith("image/png")


def test_delete_report_removes_file_and_metadata(auth_client, db):
    from app.models import MedicalReport
    import os

    r = _upload_file(auth_client, _token(auth_client), "report.pdf", b"%PDF-1.4 fake", "application/pdf")
    report_id = r.json()["id"]
    stored_path = db.query(MedicalReport).filter(MedicalReport.id == report_id).first().file_path

    r = auth_client.delete(f"/api/reports/{report_id}")
    assert r.status_code == 204

    r = auth_client.get(f"/api/reports/{report_id}")
    assert r.status_code == 404

    assert not os.path.exists(stored_path)


def test_delete_report_storage_failure_preserves_metadata(auth_client, db, monkeypatch, tmp_path):
    from pathlib import Path
    from app.models import MedicalReport

    r = _upload_file(auth_client, _token(auth_client), "report.pdf", b"%PDF-1.4 fake", "application/pdf")
    report_id = r.json()["id"]
    stored_path = tmp_path / "report.pdf"
    stored_path.write_bytes(b"%PDF-1.4 fake")
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    report.file_path = str(stored_path)
    db.commit()

    def fail_unlink(self, missing_ok=False):
        raise OSError("disk error")

    monkeypatch.setattr(Path, "unlink", fail_unlink)
    r = auth_client.delete(f"/api/reports/{report_id}")

    assert r.status_code == 500
    assert r.json()["detail"] == "storage_error"
    assert auth_client.get(f"/api/reports/{report_id}").status_code == 200


def test_report_requires_auth(client):
    r = client.get("/api/reports")
    assert r.status_code == 401
    r = client.post("/api/reports/upload", files={"file": ("x.pdf", io.BytesIO(b"%PDF"), "application/pdf")})
    assert r.status_code == 401


def test_user_cannot_access_another_users_report(client, db):
    from app.models import MedicalReport
    import os

    register_user(client)
    token_a = _token(client)
    register_user(client, email="other@example.com")
    token_b = _token(client, email="other@example.com")

    r = _upload_file(client, token_a, "report.pdf", b"%PDF-1.4 fake", "application/pdf")
    report_id = r.json()["id"]
    stored_path = db.query(MedicalReport).filter(MedicalReport.id == report_id).first().file_path

    # Other user cannot list, get, or download
    r = client.get(f"/api/reports/{report_id}", headers=auth_headers(token_b))
    assert r.status_code == 404
    r = client.get(f"/api/reports/{report_id}/file", headers=auth_headers(token_b))
    assert r.status_code == 404
    r = client.delete(f"/api/reports/{report_id}", headers=auth_headers(token_b))
    assert r.status_code == 404

    # Owner still intact and file present
    assert os.path.exists(stored_path)
    r = client.get(f"/api/reports/{report_id}", headers=auth_headers(token_a))
    assert r.status_code == 200
