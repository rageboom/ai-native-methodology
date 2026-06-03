// PoC #05 legacy — 의도된 결함 포함 (이메일 중복 검사 ❌ / 비밀번호 plaintext 비교).
// chain harness 의 chain 1 (planning) 가 본 source 로부터 BR-001/BR-002 도출 의무.

interface User { id: number; email: string; password: string; }

const users: User[] = [];
let nextId = 1;

export function register(email: string, password: string): User {
  // 결함: 이메일 중복 검사 누락 (BR-001 위반 source)
  // 결함: 비밀번호 길이 검증 누락 (BR-002 위반 source)
  const u: User = { id: nextId++, email, password };
  users.push(u);
  return u;
}

export function login(email: string, password: string): User | null {
  const u = users.find((x) => x.email === email);
  if (!u) return null;
  // 결함: plaintext 비교 (별개 antipattern — chain 2 주의 사항)
  if (u.password !== password) return null;
  return u;
}
