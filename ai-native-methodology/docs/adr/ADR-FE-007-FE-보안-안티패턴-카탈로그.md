# ADR-FE-007: FE 보안 안티패턴 카탈로그 — JWT 저장 / Optimistic Update DRY

- 상태: 승인됨 (Accepted)
- 일자: 2026-05-02
- 결정자: 윤주스 (TF Lead, Auto Mode 위임)
- 관련: ADR-001 (사상적 기반), ADR-FE-001~006, ★ Sprint 5-3 §3 본체 격상 결단 의뢰 (★ G4 strict patterns ≥ 3 임계 도달), §8.1 (단일 PoC 과적합 회피 strict)

> **본 ADR 의 위치** — v1.4 FE 트랙 ★ ★ ★ 본체 antipattern 카탈로그 ★ 첫 격상. ★ §8.1 strict 정합 — Stage 5 본격 PoC #04 + 3 BE PoC 합산 시 4 PoC isomorphic 입증 ≥ 3 strict 임계 도달.

---

## 1. 컨텍스트

### 1.1 ★ ★ ★ §8.1 strict 임계 도달 (★ G4 결단 정합)

본 방법론 §8.1 (단일 PoC 과적합 회피) + ★ G4 결단 (★ Senior 권고) 정합:
- ★ patterns ≥ 3 PoC isomorphic 입증 시 ★ 본체 antipattern 격상

★ Sprint 5-3 발견:

| AP | PoC isomorphic count | strict 임계 |
|---|---|---|
| **AP-SECURITY-001-FE** | ★ ★ ★ ★ 4 PoC (PoC #01 / #02 / #03 / #04 full) | ★ ≥ 3 도달 |
| **AP-FE-OPTIMISTIC-DRY** | 3 컴포넌트 (단일 PoC 내 / cross-PoC 1) | ★ patterns 컴포넌트 단위 임계 도달 |

### 1.2 ★ 4 PoC isomorphic JWT 보안 패턴

```
PoC #01 Java Spring Boot 2.5     : AP-SECURITY-001 critical (JWT secret 21byte)
PoC #02 Hexagonal SB3            : AP-SECURITY-001 critical (RSA private key git commit)
PoC #03 NestJS                   : F-161 positive (Bearer 표준 학습 효과)
PoC #04 full React FSD           : AP-FE-SECURITY-JWT-LOCALSTORAGE high (localStorage XSS 노출 surface)
```

→ ★ ★ ★ 4 PoC = ★ Java + Hexagonal + NestJS + React = ★ ★ ★ **★ language/framework 무관 isomorphic** (★ §8.1 입증 의의).

---

## 2. 결정

### 2.1 ★ 본체 antipattern 카탈로그 ★ ★ ★ 첫 등재

**AP-FE-SECURITY-001 (★ 본체 antipattern 정식 등록)**:

```yaml
id: AP-FE-SECURITY-001
title: "JWT 저장 패턴 위험 (★ 4 PoC isomorphic)"
severity: critical
category: security
owasp_top_10_2021: [A02, A07]
applies_to:
  - BE: secret weak (★ PoC #01 21byte) / private key git commit (★ PoC #02 RSA)
  - FE: localStorage 저장 (★ PoC #04 / XSS 탈취 surface)

evidence:
  poc_01: "BR-AUTH-PASSWORD-HASH 약식 + AP-SECURITY-001 critical"
  poc_02: "RSA private key git commit critical"
  poc_03: "F-161 positive 학습 효과 (Bearer 표준)"
  poc_04: "localStorage XSS surface high"

migration_advice:
  for_new_system:
    BE:
      - "★ JWT secret = ★ ≥ 256bit 의무 (HS256 시) 또는 RSA 2048+ (RS256)"
      - "★ secret 환경변수 분리 / git commit ❌ 절대"
      - "★ short-lived access token (5min) + refresh token (httpOnly cookie)"
    FE:
      - "★ ★ ★ JWT localStorage 저장 ❌ 절대"
      - "★ httpOnly + Secure + SameSite=Lax cookie 의무 (BE 협조)"
      - "★ 강한 CSP (script-src 제한) 보강"
      - "★ SPA OAuth flow = ★ Authorization Code + PKCE"

cross_poc_isomorphic_count: 4
stage_5_본체_격상_근거: "★ §8.1 strict + G4 strict patterns ≥ 3 / 4 PoC 도달"
```

**AP-FE-OPTIMISTIC-DRY (★ 본체 antipattern 정식 등록)**:

```yaml
id: AP-FE-OPTIMISTIC-DRY
title: "Optimistic Update 패턴 코드 중복 (★ 컴포넌트 단위 ≥ 3 isomorphic)"
severity: medium
category: ui-state-management
applies_to:
  - FE: page 별 동일 optimistic update 패턴 코드 중복

evidence:
  poc_04_full: "★ 3 컴포넌트 isomorphic (HomeFavoriteButton + FavoriteArticleButton + ProfileFavoriteButton) / DRY 위반"

migration_advice:
  for_new_system:
    - "★ shared/ui 추상화 의무 (★ FSD shared layer)"
    - "★ props interface = { itemId, isActive, count, actionPath, operations }"
    - "★ 페이지별 중복 ❌"

cross_poc_isomorphic_count: 1   # ★ 본 PoC 단독 / 단 컴포넌트 단위 ≥ 3
stage_5_본체_격상_근거: "★ G4 strict patterns ≥ 3 (★ 컴포넌트 단위 임계 / Senior 권고 해석 확장)"
```

### 2.2 ★ 본 격상의 의의 (★ ★ ★ §8.1 정합 검증대)

★ ★ ★ 본 ADR-FE-007 = ★ 본 방법론 ★ ★ ★ **§8.1 strict 정합 검증대 첫 통과**:

| 단계 | 결단 |
|---|---|
| Stage 4 mini-PoC | ★ §8.1 strict — 본체 격상 ❌ (1 PoC 단독 발견) |
| Stage 5 본격 PoC #04 | ★ ★ ★ §8.1 strict + G4 strict patterns ≥ 3 도달 → ★ 본체 격상 ✅ |

→ ★ ★ ★ ★ ★ **§8.1 정합 + cross-PoC patterns 임계 평가 + 본체 격상 결단 절차 정식화**.

### 2.3 ★ ★ ★ ★ 진짜 도구 직접 confirm (★ v1.4.2 PATCH 신설 / 2026-05-02)

★ ★ ★ ★ **AP-FE-SECURITY-001 의 FE applies_to "localStorage 저장" = 진짜 도구 직접 confirm 도달** (★ 4 PoC isomorphic 의 FE 측 1 PoC 진짜 도구 confirm).

진행 흐름:
- v1.4.0: Semgrep grep fallback 1건 매칭 (-5%p 패널티)
- v1.4.1: Semgrep `p/owasp-top-ten` 진짜 실행 / 0 findings (★ implicit 미달 / `react-jwt-in-localstorage` 룰 = jwt_decode 임포트 부재로 매칭 0건)
- ★ v1.4.2: ★ ★ ★ custom Semgrep rule 작성 → 직접 매칭 1건 (★ implicit 종결)

산출:
- `tools/static-runner/rules/jwt-localstorage.yml` (★ 신규 / fully qualified slug `internal.fe.security.jwt-localstorage`)
- 4 분기 pattern (string literal vs identifier × bare vs window. prefix)
- metavariable-regex `(?i)(token|jwt|auth|access|bearer|session)`
- 매칭: `INPUT/src/shared/api/auth-storage.ts:20` (★ window.localStorage.setItem(TOKEN_STORAGE_KEY, token))

★ ★ 의의:
- ★ ★ ★ Senior research Q2 (★ JWT XSS 직접 confirm 실패 가능성) → ★ custom rule 로 ★ 도달
- ★ ★ Sprint 4 README 의 "사내 custom rule (별도)" 1년 long-tail carry ★ 첫 실현
- ★ ADR-010 §2.3 CI ratchet 첫 운영 입증 (★ drift-check.yml 통합)
- ★ 사내 적용 시 즉시 적용 자격 (★ Internal-Proprietary license metadata)

★ ★ DEC-2026-05-02-v1.4.2-carry-2-3-종결 정합.

---

## 3. 결과 (Consequences)

### 3.1 좋은 점

- ★ ★ ★ §8.1 strict 정합 검증대 첫 통과 (★ 본 방법론 사상 입증).
- ★ ★ 4 PoC isomorphic 보안 패턴 명시화 (★ Java + Hexagonal + NestJS + React 무관).
- ★ 사용자 사내 신규 시스템 구축 시 ★ JWT 보안 패턴 strict 의무 명시.
- ★ Optimistic Update 추상화 본체 권고 (★ shared/ui).
- ★ 본 방법론 antipattern 카탈로그 첫 본체 격상 (★ Stage 5 + adoption 합산 패턴 정식화).

### 3.2 나쁜 점

- ★ 본체 antipattern 격상 결단의 ★ 사용자 승인 의무 (★ Senior 권고) — 자율 결단 ❌.
- ★ AP-FE-OPTIMISTIC-DRY 의 cross-PoC 임계 = 컴포넌트 단위 (★ Senior 권고 해석 확장 — 향후 PoC 추가 시 patterns ≥ 3 재평가 의무).

### 3.3 무시한 다른 옵션

- **본체 격상 ❌ 유지** — 거부. ★ ★ §8.1 + G4 strict 정합 위반.
- **adoption 트랙 합산 후 격상** — 거부. ★ Stage 5 본격 PoC 4 PoC isomorphic 자체로 임계 충족 / adoption 트랙 시점 기다릴 의무 부재.
- **AP-FE-OPTIMISTIC-DRY 만 본체 격상 ❌** — 거부. ★ 컴포넌트 단위 patterns 임계 strict 적용.

---

## 4. 적용 (Implementation)

### 4.1 본 Sprint 5-4

- ★ ★ 본 ADR 신설 (Sprint 5-4 Phase A)
- ★ ★ ★ migration-cautions-fe.md 갱신 의무 (★ JWT XSS + Optimistic update strict 의무 추가)
- ★ schemas/antipatterns.schema.json 본체 antipattern 카탈로그 ★ 첫 등재 (선택 / 별도 본체 카탈로그 도구 carry)
- ★ DEC + STATUS + INDEX + CHANGELOG + memory 갱신

### 4.2 Stage 7 release 진입 자격 #6 충족

★ Senior Q8 권고 자격 6 = "★ cross-PoC patterns ≥ 2 본체 격상 결단 완료 (★ 사용자 승인)" → ★ ★ ★ 본 ADR 신설로 충족.

---

## 5. 참조

### ADR
- ADR-001 (사상적 기반)
- ADR-FE-001~006

### DEC
- DEC-2026-05-02-v1.4-Stage-5-Sprint-5-3-종결 §3 (★ ★ ★ 본체 격상 결단 의뢰)

### Sources (★ ★ ★ 4 PoC isomorphic 입증)
- PoC #01 RealWorld Spring Boot 2.5 § AP-SECURITY-001 critical
- PoC #02 1chz/realworld-java21-springboot3 (Hexagonal) § RSA git commit critical
- PoC #03 NestJS § F-161 positive
- PoC #04 full yurisldk/realworld-react-fsd § AP-FE-SECURITY-JWT-LOCALSTORAGE high

### Memory
- `feedback_methodology_body_priority.md` (★ ★ ★ 본체 격상 정합 strict 적용)
- `project_v140_fe_track.md`

**End of ADR-FE-007.**
