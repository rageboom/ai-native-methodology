"""FastAPI app — Todo REST API.

의도된 결함은 auth.py / models.py 안. 본 파일 = endpoint dispatch.
"""
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import User
from .schemas import (
    UserCreate, UserLogin, UserResponse, AuthToken,
    TodoCreate, TodoUpdate, TodoResponse,
)
from . import auth, todos

# DDL 자동 생성 (production 시 alembic 권장)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Todo API (poc-14 / external-user simulation)")


@app.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    # 정상이라면 여기서 email 중복 검사 + password hash 의무.
    # 현 구현은 의도된 antipattern 보유 (AP-FSIM-DATA-001 / AP-FSIM-SEC-001).
    user = auth.register_user(db, payload.email, payload.password)
    return user


@app.post("/users/login", response_model=AuthToken)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    token = auth.create_access_token(user.id)
    return AuthToken(access_token=token)


@app.get("/todos", response_model=List[TodoResponse])
def list_todos_endpoint(
    offset: int = 0, limit: int = 20,
    db: Session = Depends(get_db), current: User = Depends(auth.get_current_user)
):
    return todos.list_todos(db, current, offset=offset, limit=limit)


@app.post("/todos", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo_endpoint(
    payload: TodoCreate,
    db: Session = Depends(get_db), current: User = Depends(auth.get_current_user)
):
    return todos.create_todo(db, current, payload)


@app.put("/todos/{todo_id}", response_model=TodoResponse)
def update_todo_endpoint(
    todo_id: int, payload: TodoUpdate,
    db: Session = Depends(get_db), current: User = Depends(auth.get_current_user)
):
    updated = todos.update_todo(db, current, todo_id, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    return updated


@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo_endpoint(
    todo_id: int,
    db: Session = Depends(get_db), current: User = Depends(auth.get_current_user)
):
    ok = todos.delete_todo(db, current, todo_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    return None
