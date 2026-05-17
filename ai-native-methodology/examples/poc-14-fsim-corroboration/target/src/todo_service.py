"""Todo service — chain 4 GREEN impl.

★ ownership 검사 정상 (legacy 동일 / BR-TODO-OWNERSHIP-FSIM-001 정합).
"""
from typing import Optional

from .todo_store import InMemoryTodoStore, Todo
from .user_store import User


class TodoNotFoundError(Exception):
    """본인 소유 todo 가 아니거나 부재 시."""


class TodoService:
    def __init__(self, store: InMemoryTodoStore):
        self.store = store

    def create(self, user: User, title: str, body: Optional[str] = None) -> Todo:
        if not title or len(title) > 200:
            raise ValueError("Title must be 1~200 chars")
        return self.store.add(user_id=user.id, title=title, body=body)

    def _get_for_user(self, user: User, todo_id: int) -> Optional[Todo]:
        todo = self.store.get(todo_id)
        if not todo or todo.user_id != user.id:
            return None
        return todo

    def update(self, user: User, todo_id: int, **fields) -> Todo:
        todo = self._get_for_user(user, todo_id)
        if not todo:
            raise TodoNotFoundError(f"Todo {todo_id} not found or not owned by user {user.id}")
        for k, v in fields.items():
            if hasattr(todo, k):
                setattr(todo, k, v)
        return self.store.update(todo)

    def delete(self, user: User, todo_id: int) -> bool:
        todo = self._get_for_user(user, todo_id)
        if not todo:
            return False
        del self.store._todos[todo_id]
        return True
