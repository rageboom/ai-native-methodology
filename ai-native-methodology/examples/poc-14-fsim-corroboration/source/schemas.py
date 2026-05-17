"""Pydantic v2 request/response schemas."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from .models import TodoStatus


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str

    model_config = {"from_attributes": True}


class AuthToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TodoCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    body: Optional[str] = None
    due_date: Optional[datetime] = None


class TodoUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    body: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[TodoStatus] = None


class TodoResponse(BaseModel):
    id: int
    user_id: int
    title: str
    body: Optional[str] = None
    due_date: Optional[datetime] = None
    status: TodoStatus
    created_at: datetime

    model_config = {"from_attributes": True}
