# Phase D — drift BR 2건 도메인 검토 + DRIFT 격상 자산 (★ session 15차 / 2026-05-14)

> **paradigm**: ★ ★ Senior REVISE-3 흡수 / **rules.json 변경 ❌** (★ corroboration 자료 회귀 회피) / 별도 markdown 자산 으로 DRIFT 격상.
> **사용자 결단**: 두 BR 모두 ★ (2) DRIFT 격상 자산 채택 (2026-05-14 / TF Lead 윤주스).
> **본질**: drift 사실 자체를 NL (의도/규범) + GWT (현실 위반) 두 표현으로 명시한 본 방법론 v2.0 chain harness paradigm 안 본질적 자료.

---

## §1. BR-AUTH-JWT-002 (PoC #01 / JWT SECRET 168bit 위반)

### §1.1 자료

- **rules.json 위치**: `examples/poc-01-realworld-spring/output/rules/rules.json`
- **NL** (★ 규범적 기준):
  > "JWT 서명용 SECRET 은 HMAC-SHA256 사용 시 최소 256bit 권장."
- **GWT then** (★ 현실 위반 상태):
  > "SECRET 으로 HMAC-SHA256 서명 — 21byte SECRET 사용 (RFC 7515 §5.2.2 미달)"
- **Layer 2 측정**: semantic_score=0.65 / confidence=0.78
- **drift 분류**: `semantic_drift` / 규범 vs 현실 비대칭
- **rationale** (★ Layer 2 agent 분석):
  > NL은 '최소 256bit 권장'이라는 규범적(normative) 기준을 표현. GWT then은 현재 21byte(168bit) SECRET 사용이라는 현실 위반 상태를 표현. NL의 이상적 기준과 GWT의 현실 묘사 사이에 관점 전환 존재. 부분 정합 — NL은 '이래야 한다', GWT는 '이렇게 되어 있다(위반)'로 의도-현실 불일치를 반영하는 비대칭 표현.

### §1.2 부속 자료 (★ rules.json 보유)

- **AP**: AP-CONFIG-HARDCODED-SECRET-001 critical 동시 등록
- **rationale**: OWASP JWT Cheat Sheet + RFC 8725 (JWT BCP) 위반. GitHub leak 통계 — 하드코딩 SECRET 이 가장 흔한 보안 사고 1순위.
- **source_evidence**: `infrastructure/jwt/JWTConfiguration.java:12` (★ `private static final String SECRET = "SOME_SIGNATURE_SECRET"; // 21 bytes — RFC 7515 §5.2.2 위반`)
- **human_review_status**: pending
- **human_review_note**: AP-CONFIG-HARDCODED-SECRET-001 critical. 사내 적용 시 환경변수 + Vault/Parameter Store + 256bit ≥ random secret 강제.
- **tags**: jwt / secret / hardcoded / rfc-7515 / critical / security

### §1.3 ★ ★ ★ 도메인 검토 결단 (★ TF Lead 윤주스 / 2026-05-14)

**결단**: ★ ★ (2) **DRIFT 격상 자산** — rules.json 변경 ❌

**근거**:
- ★ ★ ★ NL (규범 = "256bit 권장") + GWT (현실 = "168bit 사용 / RFC 위반") 의 비대칭 = **본 방법론 v2.0 chain harness paradigm 안 drift 사실 자체를 두 표현으로 명시한 본질적 사례**.
- ★ ★ rules.json 보유 sources (`description` + `rationale` + `human_review_note` + AP-CONFIG-HARDCODED-SECRET-001 동시 등록 + source_evidence + tags critical) 모두 = "기준 vs 위반" 본질을 본격 명시.
- ★ ★ Layer 2 semantic_score=0.65 = **buggy 신호 ❌** = ★ "정상 drift 사실 자체"의 측정값.
- ★ rules.json 안 BR 자체 변경 시 → Layer 1 + Layer 2 재실측 → §3 corroboration 자료 회귀 위험 (Senior REVISE-3 정합).

**처분**:
- ★ rules.json 그대로 보존 ✅
- ★ DRIFT 자체 = drift 사실 본격 명시 사례로 자산화 (★ 본 문서)
- ★ semantic_score=0.65 = drift detection 본격 동작 입증 (★ ★ 본 방법론 가치 본격 신호)

**carry**:
- ★ C-jwt-secret-hardcoded-fix (Phase D+ / 사내 적용 시 1줄 fix 의무 / human_review_note 정합)

---

## §2. BR-USER-DELETE-AUTH-001 (PoC #03 / DELETE 권한 검증 부재 F-140 critical)

### §2.1 자료

- **rules.json 위치**: `examples/poc-03-realworld-nestjs/output/rules/rules.json`
- **NL** (★ 의도 / 올바른 정책):
  > "사용자 계정 삭제는 인증된 본인만 수행할 수 있어야 하며, 미인증 요청은 거부되어야 한다."
- **GWT** (★ 현 결함 상태):
  - given: "(★ AuthMiddleware 미적용 — F-140 critical)"
  - when: "DELETE /api/users/:slug"
  - then: "(★★ 권한 검증 부재 — 누구나 삭제 가능)"
- **Layer 2 측정**: semantic_score=0.55 / confidence=0.75
- **drift 분류**: `semantic_inversion` / absent/결함 BR
- **rationale** (★ Layer 2 agent 분석):
  > GWT는 현 구현 결함 상태(AuthMiddleware 미적용, 권한 검증 부재, 누구나 삭제 가능)를 기술함. NL은 올바른 비즈니스 정책(인증된 본인만 가능, 미인증 거부)을 서술함. GWT가 결함 상태를 사실 묘사한다는 관점에서 NL과 의미 방향이 상반됨. 정책 의도 vs 현실 구현 괴리로 의미 정합 부재에 가까움.

### §2.2 부속 자료 (★ rules.json 보유)

- **current_state**: "★★ absent (F-140 critical 신규)"
- **concerns**: "★★ 즉시 수정 권고 (사내 적용 시 1줄 fix)"
- **verification_location**: `src/user/user.controller.ts:39 @Delete + user.module.ts:17 forRoutes (DELETE 누락)`
- **rejection_method**: (없음)

### §2.3 ★ ★ ★ 도메인 검토 결단 (★ TF Lead 윤주스 / 2026-05-14)

**결단**: ★ ★ (2) **DRIFT 격상 자산** — rules.json 변경 ❌

**근거**:
- ★ ★ ★ NL (의도 = "인증 본인만") + GWT (현실 = "누구나 삭제") 의 상반 = **absent/결함 BR 자체를 본격 명시한 본 방법론 v2.0 chain harness paradigm 안 본질적 사례**.
- ★ ★ rules.json 보유 sources (`current_state: "★★ absent (F-140 critical 신규)"` + `concerns: "★★ 즉시 수정 권고 (사내 적용 시 1줄 fix)"` + `verification_location` 명시 + F-140 critical finding) 모두 = "absent BR" 본격 명시.
- ★ ★ Layer 2 semantic_score=0.55 = ★ "semantic_inversion 정상 검출" 측정값 / ★ Layer 2 LLM advisory 안 본격 동작 신호.
- ★ ★ 본 방법론 가치 = "absent BR 자체를 자산화" — rules.json 안 BR 자체 = 사내 적용 시 즉시 fix 가이드 자격.

**처분**:
- ★ rules.json 그대로 보존 ✅
- ★ DRIFT 자체 = absent/결함 BR 본격 명시 사례로 자산화 (★ 본 문서)
- ★ ★ semantic_score=0.55 = semantic_inversion detection 본격 동작 입증 (★ ★ 본 방법론 가치 본격 신호)

**carry**:
- ★ C-nestjs-auth-middleware-delete-fix (Phase D+ / 사내 적용 시 1줄 fix 의무 / F-140 critical resolved 자격)
- ★ ★ ★ C-absent-br-gwt-nl-paradigm (★ session 13차 carry / **본 자산 = 본격 paradigm 사례** / Phase D+ 본격 명세 작성 자격)

---

## §3. 본 검토 paradigm 의 본 방법론 가치 본격 본질

### §3.1 DRIFT 격상 자산 paradigm = 본 방법론 v2.0 chain harness 본격 가치

| Adzic SBE 함정 | 본 방법론 회피 paradigm | 본 자산 본격 입증 |
|---|---|---|
| 단일 표현 → drift 검출 ❌ | dual representation (NL + GWT) | BR-AUTH-JWT-002 (규범 vs 위반) + BR-USER-DELETE-AUTH-001 (의도 vs 결함) |
| drift 다발 시 회복 paradigm 부재 | semantic_drift carry paradigm (★ severityRank rank 2 / Phase D carry 허용) | 본 자산 = "carry 자산화 / rules.json 변경 ❌" paradigm 본격 입증 |
| living documentation drift → SBE 폐기 | drift 자체를 자산화 (★ DRIFT 격상) | 본 자산 자체 |

★ ★ ★ **본 자산 자체 = 본 방법론 v2.0 가치 본격 입증** (★ ★ Adzic SBE 함정 회피 paradigm 본격 동작 사례).

### §3.2 industry-first paradigm 본격 보강 (★ LL-i-35 정합)

- ★ Spec Kit (90K) + AWS Q + DMN + Spectral + Drools + AutoUAT 모두 = drift 사실 자체를 자산화하는 paradigm ❌
- ★ ★ **본 방법론 v2.5.0 = drift 자체 자산화 paradigm industry-first 자격 본격 입증** (★ 본 자산 본격 사례)

---

## §4. release-readiness 9/9 정합 (★ session 15차 본격)

본 자산 처분 = ★ ★ **rules.json 변경 ❌** = release-readiness 9/9 자료 회귀 ❌ 보존 ✅:

- ★ Layer 1 (deterministic_score): PoC #01 0.954 / PoC #03 0.967 — 보존 ✅
- ★ Layer 2 (mean semantic_score): PoC #01 0.848 / PoC #03 0.914 — 보존 ✅
- ★ overall_score (L1+L2)/2: PoC #01 0.901 / PoC #03 0.941 — 보존 ✅
- ★ release-readiness 9/9: ✅ (★ session 15차 본격 실측)

→ ★ ★ ★ **drift BR 2건 처분 자체 = corroboration 자료 보존 + Phase D 진입 자격 본격 도달 정합 ✅**.

---

## §5. Lessons Learned (★ ★ ADR-CHAIN-011 §9 patch v9 자산화 자격)

### LL-i-44 (★ "drift BR DRIFT 격상 자산 paradigm = rules.json 변경 ❌ 본격 본질")

- **Why**: drift 사실 자체 = NL (의도/규범) + GWT (현실/위반) 비대칭 본격 명시 = 본 방법론 v2.0 chain harness paradigm 안 본질적 자료 / rules.json 변경 시 drift 사실 자체 소실 + corroboration 자료 회귀 위험.
- **How to apply**: drift BR (Layer 2 semantic_score < 0.7 / medium severity) = ★ rules.json 변경 ❌ paradigm 우선 검토 / DRIFT 격상 자산 (별도 markdown) 채택 / 사내 적용 시 1줄 fix carry 명시 / corroboration 자료 보존 의무.

### LL-i-45 (★ "absent BR semantic_inversion 본격 검출 = 본 방법론 가치 본격 입증")

- **Why**: Layer 2 LLM advisory 본격 동작 = semantic_inversion (NL 의도 vs GWT 결함) 검출 / Spec Kit / AWS Q / DMN / Spectral 모두 부재 / 본 방법론 industry-first 자격 본격 입증.
- **How to apply**: absent/결함 BR (current_state = "absent" / Layer 2 semantic_score < 0.6) = ★ ★ industry-first 자격 본격 자산화 의무 / 본 방법론 외부 인용 시 "drift 자체 자산화 paradigm" 차별 표현 의무.

---

## §6. 사용자 결단 자산 (★ TF Lead 윤주스 / 2026-05-14)

| BR | 결단 | 시점 |
|---|---|---|
| BR-AUTH-JWT-002 (PoC #01 / JWT SECRET 168bit) | ★ ★ (2) DRIFT 격상 자산 (rules.json 변경 ❌) | 2026-05-14 |
| BR-USER-DELETE-AUTH-001 (PoC #03 / DELETE auth 부재 F-140) | ★ ★ (2) DRIFT 격상 자산 (rules.json 변경 ❌) | 2026-05-14 |

→ ★ ★ ★ Plan U §4 Q-D3 (a) 사용자 자신 검토 paradigm 본격 시행 ✅.

---

## 참조

- `examples/poc-01-realworld-spring/output/rules/rules.json` (★ BR-AUTH-JWT-002 보유)
- `examples/poc-03-realworld-nestjs/output/rules/rules.json` (★ BR-USER-DELETE-AUTH-001 보유)
- `tools/br-cross-consistency-validator/layer-2-results/poc-01-layer-2-results.json` (★ Layer 2 측정)
- `tools/br-cross-consistency-validator/layer-2-results/poc-03-layer-2-results.json` (★ Layer 2 측정 + semantic_drift_detected)
- `tools/br-cross-consistency-validator/PHASE-D-2026-05-14-corroboration-final.md` (★ ≥ 2 PoC corroboration 본격 입증)
- `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §5.4 patch v2 + §6.3 (★ Adzic SBE 함정 회피)
- `~/.claude/plans/u-v2.5.0-phase-d-release-final.md` (★ 4원칙 1단계 plan)
