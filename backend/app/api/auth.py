"""Authentication endpoints: register and login."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import app.auth as auth
from app.database import get_db
from app.models import User
from app.schemas.user import Token, UserCreate, UserOut

router = APIRouter(tags=["auth"])


@router.post("/auth/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if auth.get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="email_already_registered")
    user = User(
        id=auth.new_id(),
        email=user_in.email.lower(),
        password_hash=auth.hash_password(user_in.password),
        full_name=user_in.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/auth/login", response_model=Token)
def login(user_in: UserCreate, db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, user_in.email, user_in.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid_credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return Token(access_token=auth.create_access_token(subject=user.email))


@router.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(auth.current_user)):
    return user
