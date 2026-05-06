// chain 4 IMPL-USER-001 partial — BR-USER-DATA-001 enforcement.

import type { UserStore } from './user-store.js';

export class EmailDuplicateError extends Error {
  constructor(email: string) {
    super(`email '${email}' already registered`);
    this.name = 'EmailDuplicateError';
  }
}

export class EmailUniquenessGuard {
  constructor(private readonly store: UserStore) {}

  assertAvailable(email: string): void {
    if (this.store.findByEmail(email)) {
      throw new EmailDuplicateError(email);
    }
  }
}
