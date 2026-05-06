// chain 3/4 — UserService unit tests. TC-USER-001 + TC-USER-002.
// chain 3 (RED) = source 미존재 시 자동 fail (test-impl-pass-validator detect).
// chain 4 (GREEN) = 100% pass 의무.

import { describe, it, expect, beforeEach } from 'vitest';
import { UserService, EmailDuplicateError, PasswordTooShortError } from './user.service.js';
import { UserStore } from './user-store.js';

let svc: UserService;
let store: UserStore;

beforeEach(() => {
  store = new UserStore();
  svc = new UserService(store);
});

describe('TC-USER-001 — register (UC-USER-001 / AC-USER-001 / BHV-USER-001)', () => {
  it('happy path — 신규 등록 성공 시 user.id 반환', () => {
    const user = svc.register('alice@example.com', 'secret123');
    expect(user.id).toBeGreaterThan(0);
    expect(user.email).toBe('alice@example.com');
    expect(store.size()).toBe(1);
  });

  it('이메일 중복 시 EmailDuplicateError throw + store 크기 변화 ❌ (BR-USER-DATA-001)', () => {
    svc.register('alice@example.com', 'secret123');
    const before = store.size();
    expect(() => svc.register('alice@example.com', 'another456')).toThrow(EmailDuplicateError);
    expect(store.size()).toBe(before);
  });

  it('비밀번호 < 8자 시 PasswordTooShortError throw (BR-USER-VALIDATION-001)', () => {
    expect(() => svc.register('bob@example.com', 'short')).toThrow(PasswordTooShortError);
    expect(store.size()).toBe(0);
  });
});

describe('TC-USER-002 — login (UC-USER-002 / AC-USER-002 / BHV-USER-002)', () => {
  it('happy path — 일치 시 user 반환', () => {
    svc.register('alice@example.com', 'secret123');
    const user = svc.login('alice@example.com', 'secret123');
    expect(user).not.toBeNull();
    expect(user?.email).toBe('alice@example.com');
  });

  it('비밀번호 불일치 시 null 반환', () => {
    svc.register('alice@example.com', 'secret123');
    const user = svc.login('alice@example.com', 'wrong-password');
    expect(user).toBeNull();
  });

  it('사용자 없음 시 null 반환', () => {
    const user = svc.login('nonexistent@example.com', 'anything12');
    expect(user).toBeNull();
  });
});
