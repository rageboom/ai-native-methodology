"""SQLAlchemy models — DDL definition.

의도된 결함 (AP-FSIM-DATA-001 / high):
  User.email 에 unique=True 부재 → DB level 중복 허용. service level 에서도 검사 누락.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
import enum

from .database import Base


class TodoStatus(str, enum.Enum):
    pending = "pending"
    done = "done"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    # AP-FSIM-DATA-001: email 에 unique=True 가 없음 (의도된 결함)
    email = Column(String, nullable=False, index=True)
    # AP-FSIM-SEC-001: password 를 plaintext 로 저장 (의도된 결함 / bcrypt/argon2 부재)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    todos = relationship("Todo", back_populates="owner", cascade="all, delete-orphan")


class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    body = Column(String, nullable=True)
    due_date = Column(DateTime, nullable=True)
    status = Column(SAEnum(TodoStatus), default=TodoStatus.pending, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="todos")
