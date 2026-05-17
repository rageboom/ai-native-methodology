# absent BR GWT-NL 합성 paradigm (★ ★ v2.5.0 industry-first 본격)

> **status**: 승인됨 (★ session 15차 / 2026-05-14)
> **scope**: BR (Business Rule) chain 1 stage 안 NL ↔ GWT dual representation paradigm 안 **absent/결함 BR** 영역 특수 사실 영역
> **본격 사실**: 본 paradigm = ★ ★ ★ ★ 본 방법론 v2.5.0 안 industry-first 자격 핵심 영역 / Spec Kit (90K) / AWS Q / DMN / Spectral / Drools / AutoUAT 모두 부재

---

## §1. 본 paradigm 본질 (★ ★ 본 방법론 v2.0 chain harness 가치 본격 사례)

### §1.1 dual representation paradigm 정합 (★ ADR-CHAIN-011 정합)

본 방법론 v2.4.0+ business-rules.json BR 안 ★ 두 표현 동시 보존:

| 표현 | 영역 | 사용자 |
|---|---|---|
| `natural_language` | 자연어 BR statement (★ 1~2 문장) | 사람 눈 (★ 도메인 전문가 검토) |
| `given/when/then` | Gherkin 3축 | AI 눈 (★ test 합성 + Layer 1/2 cross-validation) |

★ ★ ★ 본 paradigm 본격 가치 = Adzic SBE 10년 폐기 함정 회피 도구 (★ LL-i-26 정합 / Layer 2 LL-i-40 본격 입증).

### §1.2 ★ ★ absent/결함 BR 영역 특수 사실

★ ★ ★ 본 paradigm 안 ★ 특수 사실 영역 = **legacy 코드 안 BR 부재 / 결함 상태** 자체를 BR 등록 영역:

```json
{
  "id": "BR-USER-DELETE-AUTH-001",
  "natural_language": "사용자 계정 삭제는 인증된 본인만 수행할 수 있어야 하며, 미인증 요청은 거부되어야 한다.",
  "given": ["(★ AuthMiddleware 미적용 — F-140 critical)"],
  "when": ["DELETE /api/users/:slug"],
  "then": ["(★★ 권한 검증 부재 — 누구나 삭제 가능)"],
  "current_state": "★★ absent (F-140 critical 신규)",
  "concerns": "★★ 즉시 수정 권고 (사내 적용 시 1줄 fix)"
}
```

★ ★ 본 영역 안 본격 paradigm 사실:

- ★ ★ `natural_language` = ★ ★ **의도/규범** (★ 올바른 비즈니스 정책)
- ★ ★ `given/when/then` = ★ ★ **현 결함 상태** (★ legacy 코드 안 실 동작 / AuthMiddleware 부재)
- ★ ★ ★ **NL ↔ GWT 의미 방향 상반** → ★ Layer 2 semantic_inversion 본격 검출

→ ★ ★ ★ ★ **본 paradigm = 본 방법론 가치 본격 사례** (★ drift 사실 자체를 자산화).

---

## §2. ★ ★ ★ industry-first 자격 본격 입증

### §2.1 industry 5+ 곳 cross-validation 부재 사실

| 도구 | scale | absent BR paradigm 지원 |
|---|---|---|
| GitHub Spec Kit | 90K stars | ❌ 부재 |
| AWS Q Developer | enterprise scale | ❌ 부재 |
| DMN (OMG standard) | industry standard | ❌ 부재 |
| Spectral (Stoplight) | OpenAPI lint industry standard | ❌ 부재 |
| Drools | mature business rule engine | ❌ 부재 (★ "현 상태 BR" 영역 자체 ❌) |
| AutoUAT/TestFlow | LLM 기반 UAT 도구 | ❌ 부재 |
| Cucumber Rule (2018) | Gherkin 표준 dual representation | ❌ 부재 (★ "intent vs reality" 분리 미지원) |

★ ★ ★ **본 방법론 v2.5.0 = absent BR GWT-NL paradigm industry-first 자격 본격**.

### §2.2 본 paradigm 안 본격 검출 자료 (★ session 13차 + session 15차)

- ★ Layer 2 LLM (Sonnet 4.6) 안 본격 검출: BR-USER-DELETE-AUTH-001 = semantic_score 0.55 / drift_type=semantic_inversion
- ★ Layer 2 LLM (Haiku 4.5 retrospect) 안 본격 검출: BR-USER-DELETE-AUTH-001 = semantic_score 0.45
- ★ ★ ★ **양쪽 model corroboration ✅** = model 무관 검출 본격 사실 (★ LL-i-47 정합 / session 15차 self-eval bias retrospect)

---

## §3. ★ ★ BR 등록 paradigm (★ 본격 명세)

### §3.1 BR 안 absent 영역 명시 의무 필드

| 필드 | 의무 | 예시 |
|---|---|---|
| `current_state` | ★ ★ 의무 | "★★ absent (F-{id} critical 신규)" |
| `concerns` | ★ ★ 권장 | "★★ 즉시 수정 권고 (사내 적용 시 1줄 fix)" |
| `verification_location` | ★ 의무 | "src/.../foo.controller.ts:39 @Delete + module.ts:17 forRoutes (DELETE 누락)" |
| `rejection_method` | ★ optional | "(없음)" 또는 명시 method |

### §3.2 natural_language 합성 paradigm

★ ★ **올바른 비즈니스 정책** statement (★ 의도 영역) 형식:

```
[entity] [action] [actor 영역] 만 [permission] 할 수 있어야 하며, [exclusion 영역] 은 거부되어야 한다.
```

예시:
- ★ "사용자 계정 삭제 = 인증된 본인 만 수행 / 미인증 요청 = 거부"
- ★ "관리자 영역 접근 = role=admin 만 / 일반 사용자 = 거부"

### §3.3 given/when/then 합성 paradigm

★ ★ **현 결함 상태** statement (★ 현실 영역) 형식:

```
given: [legacy 코드 안 현 보호 부재 상태]
when: [public 사용자 trigger action]
then: [현 결함 결과 / 권한 검증 부재 / 누구나 가능]
```

★ ★ ★ 단 ★ ★ ★ NL ↔ GWT 의미 방향 상반 의무 (★ semantic_inversion 본격 영역).

---

## §4. ★ ★ Layer 1 / Layer 2 검출 paradigm

### §4.1 Layer 1 (deterministic) 동작 영역

- ★ Layer 1 = keyword overlap structural sanity check (★ session 11차 paradigm)
- ★ absent BR 영역 안 Layer 1 = "non-empty + overlap > 0" 일반 BR 동일 동작 (★ ★ 차별 영역 ❌)
- ★ 단 ★ ★ absent BR 안 NL ↔ GWT 의미 방향 상반 → Layer 1 sanity check 만으로 검출 ❌ (★ Layer 2 의무 영역)

### §4.2 Layer 2 (LLM advisory) 본격 검출

- ★ ★ ★ Layer 2 = NL ↔ GWT semantic 정합 본격 검증
- ★ absent BR = semantic_score < 0.6 본격 검출 자격 (★ semantic_inversion drift_type)
- ★ ★ semantic_drift_detected finding 안 본격 등록 의무

### §4.3 chain 1 gate 영역

- ★ session 14차 chain-driver gate-eval.js Layer 2 통합 (★ LL-i-42+43 정합)
- ★ absent BR semantic_drift = severityRank rank 2 (★ coverage_threshold 수준)
- ★ user go → go-with-warnings 허용 (★ Phase D 도메인 전문가 검토 carry 정합)

---

## §5. ★ ★ DRIFT 격상 자산 paradigm (★ session 15차 LL-i-44 정합)

### §5.1 paradigm 본격 영역

★ ★ **business-rules.json 변경 ❌** + **별도 markdown 자산** paradigm (★ Senior REVISE-3 흡수 / session 15차 본격):

- ★ business-rules.json 안 absent BR 자체 = drift 사실 본격 자료 (★ 변경 시 drift 사실 자체 소실 위험)
- ★ DRIFT 격상 자산 = `tools/br-cross-consistency-validator/PHASE-D-{date}-drift-domain-review.md` 형식
- ★ ★ ★ corroboration 자료 보존 의무 (★ Layer 1 + Layer 2 score 보존)

### §5.2 자산 본격 영역

- ★ 본 사례 = `PHASE-D-2026-05-14-drift-domain-review.md` (★ session 15차 본격 자산)
- ★ BR-AUTH-JWT-002 (PoC #01 / semantic_drift / 규범 vs 현실 비대칭)
- ★ BR-USER-DELETE-AUTH-001 (PoC #03 / semantic_inversion / absent BR)

---

## §6. ★ ★ 본 paradigm 영향 영역

### §6.1 사내 적용 시 본격 영역 (★ Phase E)

- ★ legacy 분석 시 = ★ ★ absent BR 영역 본격 등록 의무 (★ current_state="absent" 명시)
- ★ NL = ★ "올바른 정책" 합성 / GWT = "현 결함 상태" 합성 (★ §3 paradigm 정합)
- ★ 사내 적용 시 1줄 fix carry = ★ ★ avoid-list 영역 자산화 (★ ★ ★ 본 방법론 가치 본격 사례)

### §6.2 외부 publish 영역

- ★ "본 방법론 = absent BR GWT-NL paradigm industry-first" 본격 자격 (★ §2.1 정합)
- ★ Adzic SBE 10년 폐기 함정 회피 도구 본격 사례 (★ LL-i-26 + LL-i-40 정합)

---

## §7. 참조

### §7.1 ADR / DEC

- `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` (★ 본 paradigm origin)
- `docs/adr/ADR-CHAIN-008-paradigm-cross-corroboration-policy.md` (★ ≥ 2 PoC corroboration paradigm)
- `decisions/DEC-2026-05-14-v2.5.0-minor-final.md` (★ 본 paradigm 자산화 신설)

### §7.2 본격 사례 (★ session 13차 + session 15차)

- `tools/br-cross-consistency-validator/PHASE-D-2026-05-14-corroboration-final.md` (★ 31 BR 통합)
- `tools/br-cross-consistency-validator/PHASE-D-2026-05-14-drift-domain-review.md` (★ 2 drift BR DRIFT 격상 자산)
- `tools/br-cross-consistency-validator/PHASE-D-2026-05-14-self-eval-bias-retrospect.md` (★ multi-model 본격 자료)
- `examples/poc-01-realworld-spring/output/rules/business-rules.json` (★ BR-AUTH-JWT-002 보유)
- `examples/poc-03-realworld-nestjs/output/rules/business-rules.json` (★ BR-USER-DELETE-AUTH-001 보유)

### §7.3 Layer 2 paradigm 자료

- `tools/br-cross-consistency-validator/docs/layer-2-prompt-spec.md` (★ session 12차 / prompt 본격)
- `tools/br-cross-consistency-validator/layer-2-results/` (★ 5 + 2 자료 = Sonnet 4.6 + Haiku 4.5)

### §7.4 Lessons Learned 정합

- ★ ★ **LL-i-44** (★ drift BR DRIFT 격상 자산 paradigm = business-rules.json 변경 ❌ 본격 본질)
- ★ ★ **LL-i-45** (★ absent BR semantic_inversion 본격 검출 = 본 방법론 가치 본격 입증)
- ★ ★ **LL-i-46** (★ self-eval bias 단방향 가설 정면 부정 / model 별 검출 영역 차이)
- ★ ★ **LL-i-47** (★ critical drift = model 무관 검출 본격 신호 / Layer 2 paradigm 신뢰도 강력)

---

## §8. version handling

- ★ session 15차 = v2.5.0 MINOR FINAL release 직후 본 자산 신설 (★ ★ 본 release 안 본격 포함 ❌ / v2.5.1 PATCH 자격 영역)
- ★ ★ 본 자산 = methodology-spec/ 안 sub-rule 자격 (★ industry-first paradigm 본격 명세)
- ★ ★ ★ 다음 PATCH release 시 본 자산 본격 포함 의무 (★ 본 자산 자체 = 본 방법론 v2.5.0 industry-first 자격 핵심 영역)
