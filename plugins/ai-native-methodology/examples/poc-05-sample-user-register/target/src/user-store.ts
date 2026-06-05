// chain 4 IMPL — in-memory store. PoC scope (production = DB / Repository pattern).

export interface User {
  readonly id: number;
  readonly email: string;
  readonly password: string;  // NOTE: PoC 은 plaintext (AP-USER-003 carry / v2.x bcrypt)
}

export class UserStore {
  private users: User[] = [];
  private nextId = 1;

  add(email: string, password: string): User {
    const u: User = { id: this.nextId++, email, password };
    this.users.push(u);
    return u;
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email);
  }

  size(): number {
    return this.users.length;
  }

  clear(): void {
    this.users = [];
    this.nextId = 1;
  }
}
