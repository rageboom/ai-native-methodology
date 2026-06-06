"""Todo CRUD service."""
from sqlalchemy.orm import Session

from .models import Todo, User, TodoStatus
from .schemas import TodoCreate, TodoUpdate


def create_todo(db: Session, user: User, payload: TodoCreate) -> Todo:
    todo = Todo(
        user_id=user.id,
        title=payload.title,
        body=payload.body,
        due_date=payload.due_date,
        status=TodoStatus.pending,
    )
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


def list_todos(db: Session, user: User, offset: int = 0, limit: int = 20):
    return (
        db.query(Todo)
        .filter(Todo.user_id == user.id)
        .order_by(Todo.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def get_todo_for_user(db: Session, user: User, todo_id: int) -> Todo | None:
    todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not todo:
        return None
    # ownership 검사
    if todo.user_id != user.id:
        return None
    return todo


def update_todo(db: Session, user: User, todo_id: int, payload: TodoUpdate) -> Todo | None:
    todo = get_todo_for_user(db, user, todo_id)
    if not todo:
        return None
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(todo, k, v)
    db.commit()
    db.refresh(todo)
    return todo


def delete_todo(db: Session, user: User, todo_id: int) -> bool:
    todo = get_todo_for_user(db, user, todo_id)
    if not todo:
        return False
    db.delete(todo)
    db.commit()
    return True
