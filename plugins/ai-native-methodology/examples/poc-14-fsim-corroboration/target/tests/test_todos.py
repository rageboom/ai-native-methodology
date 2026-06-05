"""TC-TODO-FSIM-001 + TC-TODO-FSIM-002 — pytest tests.

chain 3 (RED): impl 부재 → ModuleNotFoundError.
chain 4 (GREEN): target/src/* impl 작성 후 모두 pass.
"""
import pytest


def test_tc_todo_fsim_001_create_happy_path():
    """TC-TODO-FSIM-001 / AC-TODO-FSIM-001 — todo 생성 + user_id 매핑."""
    from target.src.user_service import UserService
    from target.src.user_store import InMemoryUserStore
    from target.src.todo_service import TodoService
    from target.src.todo_store import InMemoryTodoStore

    user_svc = UserService(store=InMemoryUserStore())
    alice = user_svc.register(email="alice@example.com", password="pwd_xxx_8")
    todo_svc = TodoService(store=InMemoryTodoStore())
    todo = todo_svc.create(user=alice, title="Buy milk")
    assert todo.id is not None
    assert todo.user_id == alice.id
    assert todo.title == "Buy milk"
    assert todo.status == "pending"


def test_tc_todo_fsim_002_update_by_owner():
    """TC-TODO-FSIM-002 / AC-TODO-FSIM-002 — 본인 todo update 정상."""
    from target.src.user_service import UserService
    from target.src.user_store import InMemoryUserStore
    from target.src.todo_service import TodoService
    from target.src.todo_store import InMemoryTodoStore

    user_svc = UserService(store=InMemoryUserStore())
    alice = user_svc.register(email="alice@example.com", password="pwd_xxx_8")
    todo_svc = TodoService(store=InMemoryTodoStore())
    todo = todo_svc.create(user=alice, title="Original")
    updated = todo_svc.update(user=alice, todo_id=todo.id, title="Updated", status="done")
    assert updated is not None
    assert updated.title == "Updated"
    assert updated.status == "done"


def test_tc_todo_fsim_002_update_by_non_owner_rejected():
    """TC-TODO-FSIM-002 / AC-TODO-FSIM-002 — 타인 todo update 차단."""
    from target.src.user_service import UserService
    from target.src.user_store import InMemoryUserStore
    from target.src.todo_service import TodoService, TodoNotFoundError
    from target.src.todo_store import InMemoryTodoStore

    user_store = InMemoryUserStore()
    user_svc = UserService(store=user_store)
    alice = user_svc.register(email="alice@example.com", password="pwd_xxx_8")
    bob = user_svc.register(email="bob@example.com", password="pwd_yyy_8")

    todo_svc = TodoService(store=InMemoryTodoStore())
    alice_todo = todo_svc.create(user=alice, title="Alice's secret")

    with pytest.raises(TodoNotFoundError):
        todo_svc.update(user=bob, todo_id=alice_todo.id, title="hijacked")
