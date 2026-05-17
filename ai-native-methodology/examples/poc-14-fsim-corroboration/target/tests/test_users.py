"""TC-USER-FSIM-001 + TC-USER-FSIM-002 — pytest tests.

★ chain 3 (RED): impl 부재 → ModuleNotFoundError (Beck-canonical RED).
★ chain 4 (GREEN): target/src/* impl 작성 후 모두 pass 의무.
"""
import pytest


def test_tc_user_fsim_001_register_with_duplicate_email_raises():
    """TC-USER-FSIM-001 / AC-USER-FSIM-001 / BHV-USER-FSIM-001 / BR-USER-DATA-FSIM-001 + AP-FSIM-DATA-001 fix."""
    from target.src.user_service import UserService, EmailDuplicateError
    from target.src.user_store import InMemoryUserStore

    store = InMemoryUserStore()
    svc = UserService(store=store)
    svc.register(email="alice@example.com", password="secret123")

    with pytest.raises(EmailDuplicateError):
        svc.register(email="alice@example.com", password="another456")


def test_tc_user_fsim_001_register_happy_path():
    """TC-USER-FSIM-001 happy path — 신규 email 등록 정상."""
    from target.src.user_service import UserService
    from target.src.user_store import InMemoryUserStore

    svc = UserService(store=InMemoryUserStore())
    user = svc.register(email="bob@example.com", password="strong_pw_8")
    assert user.id is not None
    assert user.email == "bob@example.com"


def test_tc_user_fsim_002_login_match_returns_token():
    """TC-USER-FSIM-002 / AC-USER-FSIM-002 happy path — JWT 발급."""
    from target.src.user_service import UserService
    from target.src.user_store import InMemoryUserStore

    svc = UserService(store=InMemoryUserStore())
    svc.register(email="charlie@example.com", password="mypass789")
    token = svc.login(email="charlie@example.com", password="mypass789")
    assert token is not None
    assert token.access_token
    assert token.token_type == "bearer"


def test_tc_user_fsim_002_login_mismatch_returns_none():
    """TC-USER-FSIM-002 negative — 불일치 시 None."""
    from target.src.user_service import UserService
    from target.src.user_store import InMemoryUserStore

    svc = UserService(store=InMemoryUserStore())
    svc.register(email="dave@example.com", password="correct_pw")
    token = svc.login(email="dave@example.com", password="wrong")
    assert token is None
