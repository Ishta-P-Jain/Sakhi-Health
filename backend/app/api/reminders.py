"""Reminder CRUD for medication and preventive care. Supports scheduling, frequency,
active status, and completion tracking. All endpoints are per-user."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

import app.auth as auth
from app.database import get_db
from app.models import Reminder
from app.schemas.reminders import ReminderCreate, ReminderOut, ReminderUpdate

router = APIRouter(prefix="/reminders", tags=["reminders"])


def _get_reminder_or_404(db: Session, reminder_id: str, user_id: str) -> Reminder:
    reminder = (
        db.query(Reminder)
        .filter(Reminder.id == reminder_id, Reminder.user_id == user_id)
        .first()
    )
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="reminder_not_found")
    return reminder


@router.post("", response_model=ReminderOut, status_code=status.HTTP_201_CREATED)
def create_reminder(
    reminder_in: ReminderCreate,
    db: Session = Depends(get_db),
    user=Depends(auth.current_user),
):
    reminder = Reminder(
        id=auth.new_id(),
        user_id=user.id,
        title=reminder_in.title,
        kind=reminder_in.kind,
        frequency=reminder_in.frequency,
        time_of_day=reminder_in.time_of_day,
        active=reminder_in.active,
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.get("", response_model=list[ReminderOut])
def list_reminders(
    db: Session = Depends(get_db),
    user=Depends(auth.current_user),
    active: Optional[bool] = Query(None, description="filter by active status"),
    kind: Optional[str] = Query(None, description="filter by medication or preventive_care"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    q = db.query(Reminder).filter(Reminder.user_id == user.id)
    if active is not None:
        q = q.filter(Reminder.active == active)
    if kind:
        q = q.filter(Reminder.kind == kind)
    return q.order_by(Reminder.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/{reminder_id}", response_model=ReminderOut)
def get_reminder(
    reminder_id: str,
    db: Session = Depends(get_db),
    user=Depends(auth.current_user),
):
    return _get_reminder_or_404(db, reminder_id, user.id)


@router.put("/{reminder_id}", response_model=ReminderOut)
def update_reminder(
    reminder_id: str,
    reminder_in: ReminderUpdate,
    db: Session = Depends(get_db),
    user=Depends(auth.current_user),
):
    reminder = _get_reminder_or_404(db, reminder_id, user.id)
    data = reminder_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(reminder, field, value)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(
    reminder_id: str,
    db: Session = Depends(get_db),
    user=Depends(auth.current_user),
):
    reminder = _get_reminder_or_404(db, reminder_id, user.id)
    db.delete(reminder)
    db.commit()
    return None
