"""Authentication — register + login + JWT.

의도된 결함:
  - AP-FSIM-SEC-001 (critical): password plaintext 저장 (bcrypt/argon2 부재)
  - AP-FSIM-AUTH-001 (medium): JWT 'exp' claim 부재 (무기한 유효)
"""
from datetime import datetime
from jose import jwt
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from .database import get_db
from .models import User

SECRET_KEY = "fsim-poc-14-insecure-key"  # demo only
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")


def register_user(db: Session, email: str, password: str) -> User:
    # AP-FSIM-DATA-001: email 중복 검사 미수행 (의도된 결함)
    # AP-FSIM-SEC-001: password 를 hash 없이 그대로 저장 (의도된 결함)
    user = User(email=email, password=password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    # AP-FSIM-SEC-001 (continued): plaintext 비교
    if user.password != password:
        return None
    return user


def create_access_token(user_id: int) -> str:
    # AP-FSIM-AUTH-001: 'exp' claim 부재 (의도된 결함)
    payload = {"sub": str(user_id), "iat": datetime.utcnow().timestamp()}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise credentials_exception
        user_id = int(user_id_str)
    except Exception:
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise credentials_exception
    return user
