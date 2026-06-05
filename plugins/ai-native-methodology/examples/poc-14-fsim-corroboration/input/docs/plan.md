# Todo API — 기획 문서 (외부 사용자 기획)

> 개발자 A 의 사이드 프로젝트. Production 직전 외부 컨설팅 의뢰.

## 목적

email 기반 단일 사용자 인증 + 개인 Todo CRUD REST API.

## Use Case

### UC-1. 사용자 등록 (POST /users)

- email + password 로 신규 사용자 등록
- 응답 = user.id (201 Created)
- 이메일 중복 시 → 409 Conflict (현 구현 미수행 / antipattern 후보)
- password 8자 미만 시 → 400 Bad Request

### UC-2. 로그인 (POST /users/login)

- email + password 검증
- 일치 시 JWT 발급 (200 OK)
- 불일치 시 → 401 Unauthorized
- JWT 만료 시간 = 명시 부재 (현 구현 누락 — refresh token 부재)

### UC-3. Todo 생성 (POST /todos)

- 인증 필요 (JWT bearer)
- title (required, 1~200자) + body (optional) + due_date (ISO 8601, optional)
- 응답 = todo.id (201 Created)

### UC-4. Todo 목록 조회 (GET /todos)

- 인증 필요
- 본인 todos 만 (user_id filter)
- 페이징: `?offset=N&limit=N` (default limit=20)

### UC-5. Todo 수정 (PUT /todos/{id})

- 인증 + 본인 소유 확인
- title / body / due_date / status (pending → done)

### UC-6. Todo 삭제 (DELETE /todos/{id})

- 인증 + 본인 소유 확인
- soft delete (deleted_at) — 본 sample 은 hard delete 로 임시 시행

## Business Rules (후보)

- **BR-USER-DATA-001**: email = 시스템 내 unique (DB UQ + service 사전 검사 양쪽)
- **BR-USER-VALIDATION-001**: password 최소 8자 + 영문/숫자 혼합
- **BR-AUTH-001**: 인증 실패 시 비밀번호 hint 제공 ❌ (보안)
- **BR-TODO-OWNERSHIP-001**: todo 는 작성자 본인만 read/update/delete
- **BR-TODO-VALIDATION-001**: title 1~200자 / status ∈ {pending, done}

## NFR (비기능)

- 응답 시간 95p ≤ 200ms (small scale 가정)
- SQLite 인메모리 (production 시 PostgreSQL 마이그레이션 계획)

## Scope-out

- 비밀번호 재설정 / 이메일 인증 메일
- 다중 인증 (OAuth 등)
- 다국어 (i18n) — 현 phase scope ❌
- 관리자 권한 분리

## Out-of-scope antipattern (의도된 carry)

- **AP-FSIM-SEC-001**: 비밀번호 plaintext 저장 — bcrypt/argon2 마이그레이션 별도 sprint
- **AP-FSIM-AUTH-001**: JWT 만료 부재 — refresh token + expiry 설계 별도 sprint
