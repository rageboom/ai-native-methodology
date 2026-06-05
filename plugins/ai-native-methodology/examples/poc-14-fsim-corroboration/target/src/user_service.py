"""User service — chain 4 GREEN impl.

AP-FSIM-DATA-001 fix: 이메일 중복 검사 추가 (service level).
AP-FSIM-SEC-001: plaintext carry (planning.excluded_antipatterns / v2.x sprint).
AP-FSIM-AUTH-001: JWT exp claim 부재 carry (planning.excluded_antipatterns).
"""
from dataclasses import dataclass
from typing import Optional
import secrets

from .user_store import InMemoryUserStore, User


class EmailDuplicateError(Exception):
    pass


@dataclass
class AuthToken:
    access_token: str
    token_type: str = "bearer"


class UserService:
    def __init__(self, store: InMemoryUserStore):
        self.store = store

    def register(self, email: str, password: str) -> User:
        if self.store.find_by_email(email) is not None:
            raise EmailDuplicateError(f"Email {email} already exists")
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters")
        return self.store.add(email, password)

    def login(self, email: str, password: str) -> Optional[AuthToken]:
        user = self.store.find_by_email(email)
        if user is None:
            return None
        if user.password != password:  # AP-FSIM-SEC-001 carry: plaintext 비교
            return None
        return AuthToken(access_token=secrets.token_urlsafe(32))
