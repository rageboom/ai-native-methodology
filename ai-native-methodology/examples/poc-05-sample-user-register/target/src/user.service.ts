// chain 4 IMPL-USER-001 + IMPL-USER-002 — UserService (register + login).

import { UserStore, type User } from './user-store.js';
import { EmailUniquenessGuard, EmailDuplicateError } from './email-uniqueness-guard.js';

export class PasswordTooShortError extends Error {
  constructor() { super('password must be ≥ 8 characters'); this.name = 'PasswordTooShortError'; }
}

const MIN_PASSWORD_LENGTH = 8;

export class UserService {
  private readonly guard: EmailUniquenessGuard;

  constructor(private readonly store: UserStore = new UserStore()) {
    this.guard = new EmailUniquenessGuard(store);
  }

  // IMPL-USER-001 — register
  register(email: string, password: string): User {
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new PasswordTooShortError();
    }
    this.guard.assertAvailable(email);  // BR-USER-DATA-001
    return this.store.add(email, password);
  }

  // IMPL-USER-002 — login
  login(email: string, password: string): User | null {
    const user = this.store.findByEmail(email);
    if (!user) return null;
    if (user.password !== password) return null;
    return user;
  }
}

export { EmailDuplicateError };
