# Migration Cautions — poc-14

> ★ analysis-quality-antipattern 사이드 산출. 향후 동형 회피 가이드.

## 회피 목록 (다른 PoC 적용 시)

### 1. 비밀번호 plaintext 저장 (AP-FSIM-SEC-001)

- **회피 방법**: bcrypt or argon2 hash + salt. Python `passlib[bcrypt]` 또는 `argon2-cffi`.
- **DB column**: `password_hash` (또는 `pwd`) 명명 + 길이 ≥ 60 (bcrypt 표준).
- **Verify 절차**: `from passlib.context import CryptContext` 사용.

### 2. Email unique constraint 부재 (AP-FSIM-DATA-001)

- **회피 방법**: 두 레벨 안전망 의무.
  - DB level: `Column(String, unique=True, index=True)` + `__table_args__ = (UniqueConstraint('email'),)` (가능 시).
  - Service level: 사전 `db.query(User).filter(User.email == email).first()` 검사 + 409 Conflict 반환.
- **이유**: race condition 회피 + 명시적 에러 메시지.

### 3. JWT 만료 부재 (AP-FSIM-AUTH-001)

- **회피 방법**: `exp` claim 의무 (기본 15~60분) + refresh token 분리.
- **example**: `payload = {"sub": ..., "exp": datetime.utcnow() + timedelta(minutes=30)}`.
- **추가**: refresh token (long-lived) + access token (short-lived) 분리 / token revocation list.

## 본 PoC 채택 carry

- AP-FSIM-SEC-001 + AP-FSIM-AUTH-001 = **scope-out** (v2.x carry / sample scale 본질이 아님)
- AP-FSIM-DATA-001 = **chain 4 GREEN 시 fix 의무** (F-SIM-001 lane 검증대)

→ planning-spec `excluded_antipatterns[]` 에 명시 (chain-coverage-validator F-SIM-001 lane 통과 의무).
