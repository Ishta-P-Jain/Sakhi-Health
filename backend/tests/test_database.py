"""Database model tests: relationships, constraints, and cascading deletes."""
import datetime as dt
import pytest

from app.models import HealthLog, MedicalReport, Reminder, SymptomLog, User


def test_create_user_and_related_records(db):
    user = User(id="user-1", email="user@example.com", password_hash="hashed", full_name="Test User")
    db.add(user)
    db.add(HealthLog(id="log-1", user_id=user.id, cycle_start_date="2024-01-01", flow_level="medium"))
    db.add(
        SymptomLog(
            id="sym-1",
            user_id=user.id,
            symptom="cramp",
            severity="mild",
            occurred_at=dt.datetime(2024, 1, 2, 8, 0, 0),
        )
    )
    db.add(Reminder(id="rem-1", user_id=user.id, title="Pill", kind="medication", frequency="daily"))
    db.add(
        MedicalReport(
            id="rep-1",
            user_id=user.id,
            filename="x.pdf",
            original_filename="x.pdf",
            file_path="/tmp/x.pdf",
            file_type="application/pdf",
            file_size=10,
        )
    )
    db.commit()

    assert len(user.health_logs) == 1
    assert len(user.symptom_logs) == 1
    assert len(user.reminders) == 1
    assert len(user.reports) == 1
    assert db.query(HealthLog).filter(HealthLog.user_id == user.id).count() == 1


def test_deleting_user_cascades_to_related_records(db):
    user = User(id="user-1", email="user@example.com", password_hash="hashed")
    db.add(user)
    db.add(HealthLog(id="log-1", user_id=user.id, cycle_start_date="2024-01-01"))
    db.add(
        SymptomLog(
            id="sym-1",
            user_id=user.id,
            symptom="x",
            severity="mild",
            occurred_at=dt.datetime(2024, 1, 1),
        )
    )
    db.add(Reminder(id="rem-1", user_id=user.id, title="t", kind="medication", frequency="daily"))
    db.add(
        MedicalReport(
            id="rep-1",
            user_id=user.id,
            filename="x.pdf",
            original_filename="x.pdf",
            file_path="/tmp/x.pdf",
            file_type="application/pdf",
            file_size=1,
        )
    )
    db.commit()

    db.delete(user)
    db.commit()

    assert db.query(HealthLog).count() == 0
    assert db.query(SymptomLog).count() == 0
    assert db.query(Reminder).count() == 0
    assert db.query(MedicalReport).count() == 0


def test_email_is_unique(db):
    db.add(User(id="a", email="a@example.com", password_hash="h"))
    db.commit()
    db.add(User(id="b", email="a@example.com", password_hash="h"))
    with pytest.raises(Exception):
        db.commit()
    db.rollback()
