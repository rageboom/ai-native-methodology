# plan-q1-alias-4중첩-폐기.md

> ★ ★ 묶음 Q ① — rules.json top-level alias 4중첩 폐기 → 단일 canonical `business_rules`.
> Work Principles 4원칙 (1 plan → 2 3-에이전트 research → 3 사용자 결단 → 4 시행).
> ★ ★ breaking change / cooling-off 대상 — 본 plan + research + Senior critique = 심의 장치 (코드 착수 = 사용자 결단 후).
>
> **session**: 2026-05-17 (★ session 25차 연속 — 단 breaking이므로 시행은 cooling-off 후 권고 / plan·research는 진행)
> **target version**: v4.2.0 MINOR 또는 MAJOR 후보 (★ §8 사용자 결단 — breaking API surface)
> **타입**: schema breaking + 2 PoC 데이터 마이그레이션 + validator 코드 변경
> **회귀 risk**: ★ ★ 中~高 (schema anyOf 축소 = breaking / 2 PoC migration / 11 PoC 회귀 풀이 0 의무)

---

## §0. 컨텍스트 + scope 확정

묶음 Q ① 정의 = "alias 4중첩 폐기 (rules / rules_manual_authored / rules_auto_extracted_reference + 모든 alias)". 사용자 "1" → 묶음 Q 잔여 risk 오름차순 첫 항목. ④(additive)는 v4.1.1로 종결, ①②⑦ = breaking carry. risk 오름차순 권고 = ① (2 PoC) 먼저.

---

## §1. 현 상태 정밀 (★ 사실 점검 grep 완료)

### §1.1. alias 구조 (rules.schema.json)

| top-level key | type | 역할 | 실사용 |
|---|---|---|---|
| `business_rules` | array<businessRule> | ★ v2.4.0 canonical | 9 PoC |
| `rules` | array<businessRule> | v1.x deprecated alias | 1 PoC (poc-01) |
| `rules_manual_authored` | array<businessRule> | FE 트랙 alias | 1 PoC (poc-04) |
| `rules_auto_extracted_reference` | **object** (array|object) | ★ ★ 별개 개념 — 타 산출물(form-validation-spec/state-map) 자동추출 BR **참조** / BR list 아님 | 1 PoC (poc-04) |
| `rule_summary` | string|object | `summary` alias | poc-02 |
| `rules_summary` | string|object | `summary` alias | poc-04 |

top-level `anyOf` = business_rules | rules | rules_manual_authored 중 1 required (3-way). `rules_auto_extracted_reference`/summary aliases 는 anyOf 외 보조.

### §1.2. 마이그레이션 실측

- **poc-01**: `rules`(array N=13) → `business_rules` 순수 rename. `rule_conflicts` 유지.
- **poc-04** (FE / paradigm:FE): `rules_manual_authored`(array[3]) → `business_rules` rename / `rules_summary`(obj)→`summary` / ★ `rules_auto_extracted_reference`(obj) = 별개 개념 (§1.3 결단 의제).

### §1.3. ★ ★ consumer 코드 (잠재 결함 발견)

- `tools/br-cross-consistency-validator/src/validator.js` `extractRules()` = `business_rules` → `rules` fallback만 / ★ **`rules_manual_authored` 미처리 → poc-04 3 BR 현재 validator 비가시 (return [])**. ① migration 이 본 gap 을 **수정** (poc-04 BR validator 가시화) = ① 강한 정당화.
- `tools/planning-extraction-validator/src/validator.js:31` = `analysis.rules.business_rules` (canonical 가정).
- `tools/chain-driver/src/work-unit.js:70` = `canonical.rules` (work-unit 내부 / rules.json top-level 아님 — 별개 / 영향 ❌ 검증 의무).
- skill/doc/template 참조 = **0** (grep empty) → blast radius = schema + 2 PoC + validator 코드 한정.

---

## §2. 설계 쟁점

### §2.1. ★ `rules_auto_extracted_reference` 처리 (★ 핵심 쟁점)

순수 alias 아님 (object / 타 산출물 자동추출 BR 참조 = 의미 구분). 옵션:
- **(a) 유지 (alias 폐기 scope 외)** — BR-list alias 아니므로 ① 대상 ❌. 별도 명확한 이름(예: `auto_extracted_br_refs`)은 별도 carry.
- **(b) 명확 rename** — `rules_auto_extracted_reference` → `auto_extracted_br_refs` (의미 보존 / 이름만 정리). poc-04 1곳.
- **(c) business_rules 흡수** — ❌ 비추천 (shape·의미 상이 / 정보 손실 risk).

### §2.2. summary aliases (`rule_summary`/`rules_summary` → `summary`)

묶음 Q ① "모든 alias" 포함. poc-02·poc-04 2곳 rename. ① 동반 vs 별도.

### §2.3. deprecation 전략 (★ research 의제)

- **(A) hard 폐기** — anyOf = `business_rules` only. 즉시 breaking. 2 PoC migration 동반 필수.
- **(B) deprecation period** — schema 는 alias 계속 accept + validator WARN finding 신설 + 차기 MAJOR 에서 hard 폐기. round-trip 안전.
- 산업 패턴(JSON Schema deprecated keyword / API deprecation) = research 확인.

---

## §3. 시행 범위 (★ 사용자 결단 후 확정)

1. **rules.schema.json** — anyOf 축소 (`business_rules` 단일) + `rules`/`rules_manual_authored` properties 제거 또는 `deprecated:true` 표기 + summary aliases 처리 + `rules_auto_extracted_reference` §2.1 결단 반영
2. **poc-01** — `rules`→`business_rules` rename (13 BR / 의미 변경 ❌)
3. **poc-04** — `rules_manual_authored`→`business_rules` (3 BR) + `rules_summary`→`summary` + `rules_auto_extracted_reference` §2.1 결단 반영
4. **br-cross-consistency-validator** — extractRules() 정리 (canonical 단일 / 잠재 결함 수정 = poc-04 가시화) + 회귀 test
5. **drift-validator** — 신규 test (alias 폐기 정합 / canonical 단일 검증)
6. **deliverables/5-business-rules.md + schemas 문서** — canonical 단일 명문화
7. **ADR-CHAIN-011 patch + DEC + INDEX + CHANGELOG + plugin.json + CLAUDE.md + STATUS + LL**

---

## §4. 회귀 검증 계획

| # | 검증 |
|---|---|
| **0-pre** | ★ Senior STOP-1 — poc-04 3 BR canonical 변환 br-cross-consistency = **실측 완료: findings 3 전부 `low` / critical·high=0 / gate pass** → release-readiness 11/11 안전 / 가시화=개선 확정 |
| 0 | poc-01·poc-04 migration 후 schema-validator VALID (★ 핵심) |
| 1 | 11 PoC rules.json 전수 schema valid (회귀 풀이 0) |
| 2 | workspace test 381/381 + 신규 test |
| 3 | release-readiness 11/11 (analysis_validator_violation = 11 PoC 전수) |
| 4 | ★ poc-04 BR br-cross-consistency-validator 가시화 입증 (잠재 결함 수정 = 회귀 아닌 개선 / before=[] after=3) |
| 5 | chain-driver work-unit `canonical.rules` 영향 ❌ 확인 (별개 axis) |

실패 시 → 4원칙 4단계: revert + Lessons Learned + 1원칙 재시작.

---

## §5. 4원칙 2단계 — 3-에이전트 research 의제 (가벼운 전략 / 시간 cap)

| 에이전트 | 의제 |
|---|---|
| **_base-senior-engineer** | hard 폐기(A) vs deprecation period(B) / `rules_auto_extracted_reference` §2.1 (a/b/c) / breaking version(MAJOR vs MINOR) / poc-04 validator 가시화 = 회귀 vs 개선 판정 / STOP signal / 묶음 Q ② 와 순서 의존성 |
| **_base-official-docs-checker** | JSON Schema `deprecated` keyword (draft 2020-12) 정식 의미 + anyOf 축소가 breaking 인지 / semver — schema field 제거 = MAJOR 의무인가 |
| **_base-industry-case-researcher** | OSS schema 가 다중 alias 를 단일 canonical 로 통합한 사례 / deprecation period 운영 패턴 (Stripe/K8s/OpenAPI) / "잠재 결함을 마이그레이션으로 수정" precedent |

산출 = `.claude/research/research-q1-alias-4중첩-폐기.md`.

---

## §6. 사용자 결단 항목 (★ 4원칙 3단계 / 묶음 — research 후 prompt)

1. **cooling-off** — v5.0.0 MAJOR + breaking = CLAUDE.md cadence 24h 권고 (이번 session 이미 2 release) / 지금 시행 vs 24h 후 vs 다음 session
2. **deprecation 전략** = (A) hard 폐기 (Senior 권고 / 외부 consumer 부재) / (B) deprecation period (산업 우세 / 단 본 레포 보호 대상 부재)
3. **summary aliases** (`rule_summary`/`rules_summary` → `summary`) = ① 동반 / 별도 carry
4. `rules_auto_extracted_reference` = ★ ① scope 외 확정 (Senior Q1 / 별도 carry Q-①-followup) — 사용자 확인

★ **version = v5.0.0 MAJOR 확정** (사용자 선택지 ❌ — official-docs VERIFIED + Senior / semver 사실 / MINOR 호칭 = integrity drift). 사용자 결단 = 시행 여부·전략·scope 만.

---

## §7. 종료 자격

- [ ] poc-01·poc-04 migration + 11 PoC schema valid (회귀 풀이 0)
- [ ] validator canonical 단일 정리 + poc-04 가시화 입증
- [ ] workspace test 전수 + release-readiness 11/11
- [ ] ADR patch + DEC + INDEX + CHANGELOG + plugin.json + CLAUDE.md + STATUS + LL
- [ ] commit + (tag) + push (사용자 결단)

---

## §8. Lessons Learned (placeholder)

- LL-i-NN (TBD) — alias 다중첩 폐기 시 ★ "순수 rename alias" vs "의미 구분 별개 키" 분리 식별 의무 (rules_auto_extracted_reference 사례). 일괄 폐기 ❌ / 의미 보존 우선.
- LL-i-NN+1 (TBD) — alias 폐기 migration 이 latent consumer 결함(poc-04 validator 비가시)을 동시 수정 = breaking change 의 숨은 가치 (회귀 아닌 개선 판정 paradigm).
