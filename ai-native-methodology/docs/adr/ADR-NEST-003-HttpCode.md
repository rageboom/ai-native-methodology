# ADR-NEST-003: @HttpCode 명시 의무 — RFC 9110 정합

- 상태: 승인됨 (Accepted) — 묶음 R #3
- 일자: 2026-04-30
- 관련: ADR-NEST-001 (sibling 묶음 R #1 — Auth scope) / ADR-NEST-002 (sibling 묶음 R #2 — class-validator) / ADR-NEST-004 (sibling 묶음 R #4 — TypeORM 무결성) / PoC #03 AP-API-001 (high) / F-158 (5 op cumul) / RFC 9110 §15.3.2 + §15.3.5 + §6.5

---

## 1. 컨텍스트

PoC #03 NestJS 의 default HTTP status 가 RFC 9110 위반 5건:
- `@Post` default = **201** → login 시 신규 자원 ❌ (§15.3.2 위반) → 200 권고
- `@Delete` default = **200** → DELETE → §15.3.5 권고 **204 No Content**
- `@ApiResponse({status: 201})` 데코 = Article DELETE 데코 도 201 (★ spec drift)

→ **AP-API-001 high** (★ PoC #02 F-070 + F-083 + F-085 isomorphic).

## 2. 결정

### 2.1 ★ @HttpCode 명시 의무 — NestJS default 절대 의존 금지

```typescript
@HttpCode(200)  // ★ login (신규 자원 ❌ — §15.3.2)
@Post('users/login')
async login(...) {}

@HttpCode(204)  // ★ DELETE — §15.3.5
@Delete(':slug')
async delete(...) {}

@HttpCode(200)  // ★ idempotent toggle — §15.3.1
@Post(':slug/favorite')
async favorite(...) {}
```

### 2.2 ★ @ApiResponse status = 실 @HttpCode 정합 의무

```typescript
@HttpCode(204)
@ApiResponse({status: 204, description: 'Article deleted'})  // ★ 정합
@Delete(':slug')
```

→ spec/runtime drift 자동 회피.

### 2.3 RFC 9110 status 매트릭스 (사내 표준)

| 시나리오 | status | RFC |
|---|---|---|
| 신규 자원 생성 (POST + Location 헤더) | **201 Created** | §15.3.2 |
| 로그인 / token 발급 (자원 생성 ❌) | **200 OK** | §15.3.1 |
| Update 성공 | **200 OK** | §6.5 |
| DELETE 성공 (body 없음) | **204 No Content** | §15.3.5 |
| Idempotent toggle (favorite 등) | **200 OK** | §15.3.1 |
| Validation 실패 | **400 Bad Request** | §15.5.1 |
| Auth 실패 (anonymous) | **401 Unauthorized** | §11.6.1 |
| Authz 실패 (non-owner) | **403 Forbidden** | §15.5.4 |
| Resource 없음 | **404 Not Found** | §15.5.5 |
| 중복 (UQ 위반) | **409 Conflict** | §15.5.10 |
| Validation semantic | **422 Unprocessable Entity** | §15.5.21 |

## 3. 결과

### 3.1 Positive 효과

- ★ NestJS default 함정 (Post 201 / Delete 200) 자연 회피
- ★ spec/runtime drift 자동 회피
- ★ RFC 9110 정합 — 산업 표준 (GitHub / Stripe / Twitter API 정합)

### 3.2 트레이드오프

- ★ 매 endpoint @HttpCode 명시 의무 — 빠뜨리면 default 폴백
- ★ 코드 리뷰 + ts-morph rule 의무

## 4. 검증

- supertest E2E — 모든 endpoint status assertion
- OpenAPI breaking change (oasdiff) — spec/runtime drift 자동 검출
- ts-morph rule — controller method 가 @HttpCode 또는 default 의도 명시

## 5. 본 방법론 적용

`migration-cautions.md` § C-1 — 신규 NestJS 프로젝트 의무.

---

**End of ADR-NEST-003.**
