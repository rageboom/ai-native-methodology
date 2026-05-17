"""In-memory todo store."""
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Todo:
    id: int
    user_id: int
    title: str
    status: str = "pending"
    body: Optional[str] = None
    due_date: Optional[str] = None


class InMemoryTodoStore:
    def __init__(self):
        self._todos: dict[int, Todo] = {}
        self._next_id = 1

    def add(self, user_id: int, title: str, body: Optional[str] = None, due_date: Optional[str] = None) -> Todo:
        todo = Todo(id=self._next_id, user_id=user_id, title=title, body=body, due_date=due_date)
        self._todos[todo.id] = todo
        self._next_id += 1
        return todo

    def get(self, todo_id: int) -> Optional[Todo]:
        return self._todos.get(todo_id)

    def update(self, todo: Todo) -> Todo:
        self._todos[todo.id] = todo
        return todo
