"""In-memory user store — test 전용 fix."""
from dataclasses import dataclass
from typing import Optional


@dataclass
class User:
    id: int
    email: str
    password: str  # AP-FSIM-SEC-001 carry — bcrypt fix 는 v2.x scope


class InMemoryUserStore:
    def __init__(self):
        self._users: list[User] = []
        self._next_id = 1

    def find_by_email(self, email: str) -> Optional[User]:
        for u in self._users:
            if u.email == email:
                return u
        return None

    def add(self, email: str, password: str) -> User:
        user = User(id=self._next_id, email=email, password=password)
        self._next_id += 1
        self._users.append(user)
        return user
