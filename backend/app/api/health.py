"""Health-log (menstrual-cycle / general health) CRUD. All endpoints are per-user."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

import app.auth as auth
from app.database import get_db
from app.models import HealthLog
from app.schemas.health import (
    HealthLogCreate,
    HealthLogOut,
    HealthLogUpdate,
)

router = APIRouter(prefix="/health", tags=["health"])


def _get_log_or_404(db: Session, log_id: str, user_id: str) -> HealthLog:
    log = (
        db.query(HealthLog)
        .filter(HealthLog.id == log_id, HealthLog.user_id == user_id)
        .first()
    )
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="health_log_not_found")
    return log


@router.post("/logs", response_model=HealthLogOut, status_code=status.HTTP_201_CREATED)
def create_health_log(
    log_in: HealthLogCreate,
    db: Session = Depends(get_db),
    user=Depends(auth.current_user),
):
    log = HealthLog(
        id=auth.new_id(),
        user_id=user.id,
        cycle_start_date=log_in.cycle_start_date,
        cycle_end_date=log_in.cycle_end_date,
        flow_level=log_in.flow_level,
        notes=log_in.notes,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/logs", response_model=list[HealthLogOut])
def list_health_logs(
    db: Session = Depends(get_db),
    user=Depends(auth.current_user),
    start: Optional[str] = Query(None, description="filter cycle_start_date >= ISO date"),
    end: Optional[str] = Query(None, description="filter cycle_start_date <= ISO date"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    q = db.query(HealthLog).filter(HealthLog.user_id == user.id)
    if start:
        q = q.filter(HealthLog.cycle_start_date >= start)
    if end:
        q = q.filter(HealthLog.cycle_start_date <= end)
    return q.order_by(HealthLog.cycle_start_date.desc()).offset(offset).limit(limit).all()


@router.get("/logs/{log_id}", response_model=HealthLogOut)
def get_health_log(
    log_id: str,
    db: Session = Depends(get_db),
    user=Depends(auth.current_user),
):
    return _get_log_or_404(db, log_id, user.id)


@router.put("/logs/{log_id}", response_model=HealthLogOut)
def update_health_log(
    log_id: str,
    log_in: HealthLogUpdate,
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


@router.delete("/logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_health_log(
    log_id: str,
    db: Session = Depends(get_db),
    user=Depends(auth.current_user),
):
    log = _get_log_or_404(db, log_id, user.id)
    db.delete(log)
    db.commit()
    return None
