"""Symptom-log CRUD. Records symptoms + severity; no diagnosis is inferred. All endpoints are per-user."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

import app.auth as auth
from app.database import get_db
from app.models import SymptomLog
from app.schemas.health import SymptomLogCreate, SymptomLogOut, SymptomLogUpdate

router = APIRouter(prefix="/symptoms", tags=["symptoms"])


def _get_log_or_404(db: Session, log_id: str, user_id: str) -> SymptomLog:
    log = (
        db.query(SymptomLog)
        .filter(SymptomLog.id == log_id, SymptomLog.user_id == user_id)
        .first()
    )
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="symptom_log_not_found")
    return log


@router.post("", response_model=SymptomLogOut, status_code=status.HTTP_201_CREATED)
def create_symptom_log(
    log_in: SymptomLogCreate,
    db: Session = Depends(get_db),
    user=Depends(auth.current_user),
):
    log = SymptomLog(
        id=auth.new_id(),
        user_id=user.id,
        symptom=log_in.symptom,
        severity=log_in.severity,
        notes=log_in.notes,
        occurred_at=log_in.occurred_at,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("", response_model=list[SymptomLogOut])
def list_symptom_logs(
    db: Session = Depends(get_db),
    user=Depends(auth.current_user),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    return (
        db.query(SymptomLog)
        .filter(SymptomLog.user_id == user.id)
        .order_by(SymptomLog.occurred_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/{log_id}", response_model=SymptomLogOut)
def get_symptom_log(
    log_id: str,
    db: Session = Depends(get_db),
    user=Depends(auth.current_user),
):
    return _get_log_or_404(db, log_id, user.id)


@router.put("/{log_id}", response_model=SymptomLogOut)
def update_symptom_log(
    log_id: str,
    log_in: SymptomLogUpdate,
    db: Session = Depends(get_db),
    user=Depends(auth.current_user),
):
    log = _get_log_or_404(db, log_id, user.id)
    data = log_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(log, field, value)
    db.commit()
    db.refresh(log)
    return log


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_symptom_log(
    log_id: str,
    db: Session = Depends(get_db),
    user=Depends(auth.current_user),
):
    log = _get_log_or_404(db, log_id, user.id)
    db.delete(log)
    db.commit()
    return None
