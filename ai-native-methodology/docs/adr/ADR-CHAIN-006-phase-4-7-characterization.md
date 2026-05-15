# ADR-CHAIN-006: phase 4.7 (characterization) 정식 도입 — 의도 vs 버그 분리 + Given/When/Then snapshot acceptance oracle

- 상태: 승인됨 (Accepted)
- 일자: 2026-05-07
- 결정자: 윤주스 (TF Lead)
- 관련: ADR-001 (사상적 기반), ADR-008 (이중 렌더링), ADR-009 (다이어그램 신뢰), ADR-CHAIN-001~005 (chain harness), DEC-2026-05-07-poc-06-종결 (corroboration #1 / Legacy), DEC-2026-05-07-poc-06-domain-결단, DEC-2026-05-07-poc-07-poc03-phase7-retrofit (corroboration #2 / Modern), plan §6.5 (Michael Feathers Characterization Testing), `~/.claude/plans/plan-v210-phase-4-7-promotion.md` + `research-v210-phase-4-7-promotion.md` (외부 권위 12종)

## 컨텍스트

v2.0.0 chain harness validated 후 첫 minor. analysis stage (chain 1 입력) 안에서 ★ rules.json + antipatterns.json 만으로는 새 시스템 동작이 결정되지 않음 — "어떤 BR 을 보존하고 어떤 AP 를 버릴지" 명시 ❌ → ★ acceptance oracle 부재 → chain 1 (planning-spec) 의 use_cases 추출 시 의도/버그 혼재 가능.

PoC #06 (EFI-WEB Spring 4.1 + iBATIS Legacy) 적용에서 confirmed:
- BR 7건 + AP 10건 분석 후에도 "이 12개월 컬럼 모델 = intent (IFRS 정합) 인가 bug (1NF 위반) 인가" 결단 ❌
- 코드 자조 코멘트 ("환율관리 페이지만 생각하고 설계한 폐해") = SATD/KL-SATD 신호 — 자동 분류 의무
- 도메인 expert (IFRS 회계 담당자 / DBA) 결단 carry 강제 의무

## 외부 조언 (research-v210 §4 권위 12종)

### 사상적 기반
- **Michael Feathers**, *Working Effectively with Legacy Code* (2004) §13 — Characterization Test = "관찰된 input → output 을 assert"
- **Gojko Adzic**, *Specification by Example* (2011) — Given/When/Then BDD 7 핵심 패턴 / Living Documentation
- **DDD bounded context** (Eric Evans 2003) — 도메인 영역 분리

### 학술 정합
- **Maldonado & Shihab (2015)** — Self-Admitted Technical Debt (SATD) / KL-SATD keyword catalog (TODO/FIXME/HACK/XXX 등)
- **Springer SQJ 2024** — KL-SATD ↔ SonarQube 학술 분석 (complementary, limited overlap)

### 도구 정합
- **Cucumber Gherkin Reference** (https://cucumber.io/docs/gherkin/reference/) — Feature / Scenario / Given/When/Then / Tag 표준
- **PIT (PITest) / Stryker Mutator** — coverage threshold 80% 산업 표준
- **BullseyeCoverage** — minimum coverage gate (80% line + 70% branch)
- **jest-coverage-ratchet** — legacy ratchet pattern 표준
- **Cursor / Cline / Aider** — 단일 prompt + context retrieval / 분기 ❌ 패턴

## 결정

phase 4.7 (characterization) 정식 단계를 v2.1.0 minor release 로 본체 격상. 다음 4 정책 명문화:

### 1. ★ 위치 = analysis stage 내부 / phase 4.5 후 / phase 5-1 + 5-2 전

```
phase 0 → 1 → 2 → 3 → 4 → 4.5 → ★ 4.7 ★ → 5-1 + 5-2 (병렬) → 6
```

`flows/analysis.phase-flow.json` v1.5.0 → v2.1.0:
- `phases[].id = "4.7"` 신설 / `depends_on: ["4", "4.5"]`
- `inputs: ["rules.json", "antipatterns.json", "formal-spec_optional", "domain_expert_interview_optional"]`
- `outputs: ["characterization-spec.json", "intent-vs-bug.md", "coverage.json", "snapshots/UC-*.json"]`
- `automated_validation: ["characterization-coverage-validator", "schema-validator"]`
- `phase 5-1 + 5-2 depends_on` 에 `"4.7"` 추가 (★ phase 4.7 → 5-x 흐름 정합)

### 2. ★ ★ ★ 단일 prompt 양 spectrum (Cursor/Cline/Aider 표준 정합 / DEC-2026-05-07-poc-07 §6 정합)

skill prompt 분기 **❌** — Modern vs Legacy 별도 prompt 신설 ❌. `skills/analysis-characterization/SKILL.md` 단일 prompt 가 양 spectrum 모두에서 동작.

자연어 hint 한 줄 (★ 분기 ❌ / hint 만):
- **Legacy 의심 신호** (자조 코멘트 ↑ + 적대성 4중 + iBATIS / JSP) → ambiguous ↑ 가능성 → 도메인 expert carry 강조
- **Modern 의심 신호** (TODO/FIXME 0~소수 + class-validator + clean architecture) → 명확 분류 비율 ↑ 가능성 → ambiguous = 0 정합

★ 사용자가 "legacy" / "modern" 라벨 직접 부착 ❌ — AI 가 코드 스캔 결과 (TODO 빈도 + framework 버전 + test 부재) 로 자동 추정.

### 3. ★ acceptance oracle 의무 — 4 분류 + Given/When/Then snapshot

각 BR / AP 의 **4 분류** (`schemas/characterization-spec.schema.json` `intent_classification.type` enum):

| 분류 | 정의 | 처분 |
|---|---|---|
| **intent** | 비즈니스 의도 — 새 시스템에서도 동일 동작 보존 의무 | snapshot 그대로 통과 |
| **bug** | 명확한 결함 — 새 시스템에서 의도적 다른 결과 (modern_alternative) | snapshot.behavior_likely_bug |
| **ambiguous** | 도메인 expert 결단 의무 (carry) | 결단 전까지 chain 4 진입 ❌ |
| **self_recognized** | ★ 코드 자조 코멘트 (TODO/FIXME/HACK/XXX/"폐해" 등) — SATD/KL-SATD per Maldonado & Shihab 2015 | bug 자동 처분 + 자조 위치 명시 |

snapshot 4 필수 필드:
- `given` / `when` / `then` (Cucumber Gherkin BDD)
- `intent_classification` (★ 핵심 — rule + type 매핑)
- (옵션) `behavior_to_preserve` / `behavior_likely_bug` / `feature` / `tags`

★ ambiguous > 0 시:
- `intentVsBug.ambiguous_carry[]` 배열 명시 의무 (rule_id + carry_owner + carry_reason)
- 또는 `intent-vs-bug.md` 본문에 carry 명시 grep 통과
- chain 4 (impl-spec GREEN) 진입 ❌

### 4. ★ coverage threshold default 0.80 + ratchet 메커니즘

```yaml
coverage:
  coverage_target: 0.80              # ★ default (PIT/Stryker/BullseyeCoverage 산업 표준)
  coverage_minimum_legacy: 0.40      # ★ ratchet 진입점
  coverage_strategy: "absolute"       # absolute (default) | ratchet
  trend_required: false              # ratchet 시 true 의무
```

★ 두 strategy 양립:
- **absolute** = `actual ≥ coverage_target` 검증 (Modern 권장)
- **ratchet** = `actual ≥ coverage_minimum_legacy` + `trend_required: true` 검증 (Legacy 권장 / PoC #06 단일 모듈 0.43 정합 / jest-coverage-ratchet npm 표준)

`schema if/then`: `coverage_strategy=ratchet` 시 `coverage_minimum_legacy` 명시 + `trend_required=true` 의무.

## ≥ 2 PoC corroboration (★ §8.1 strict 정합)

| PoC | spectrum | 명확 분류 비율 | self_recognized | ambiguous | DEC |
|---|---|---|---|---|---|
| **PoC #06** (Spring 4.1 + iBATIS) | Legacy 적대성 4중 | 17/18 = 94% (D2 후) | 1 (AP-007 자조) | 1 (DBA carry) | DEC-2026-05-07-poc-06-종결 + DEC-2026-05-07-poc-06-domain-결단 |
| **PoC #03 retrofit** (NestJS Modern) | Modern | 30/30 = 100% | 0 (자연 부재) | 0 | DEC-2026-05-07-poc-07-poc03-phase7-retrofit |

→ ★ ★ phase 4.7 가 두 spectrum 모두에서 동작 입증 — v2.1.0 본체 격상 자격 사실 확보.

## 결과

### 본체 자산 격상 (v2.1.0 minor)

| 자산 | 위치 | 의도 |
|---|---|---|
| deliverable 23 | `methodology-spec/deliverables/23-characterization-spec.md` | 산출물 명세 (★ #16~22 사용 중 / 23 신규) |
| schema | `schemas/characterization-spec.schema.json` (★ 30번째) | 4 sub-schema (snapshot + scenario + intentVsBug + coverage) + if/then 강제 |
| meta-confidence enum | `schemas/meta-confidence.schema.json` `inputs_used` 12 → 13 (`characterization` 추가) | input 출처 명시 |
| skill | `skills/analysis-characterization/SKILL.md` | 단일 prompt 양 spectrum (skills 19 → 20) |
| tool | `tools/characterization-coverage-validator/` (★ workspace 13번째) | 8 검증 + 10 unit test |
| flow | `flows/analysis.phase-flow.{json,mermaid}` v1.5.0 → v2.1.0 | phase 4.7 entry + 5-x depends_on 갱신 |

### 영향 (긍정)

- ★ chain 1 (planning-spec) 입력 보강 — use_cases 추출 시 acceptance oracle 직접 적용
- ★ chain 4 (impl-spec GREEN) 검증 시 snapshot 이 acceptance test 로 작동 (의도 보존 검증)
- ★ ambiguous 영역 명시 → 도메인 expert 결단 강제 → phase 4.5 formal-spec 의 정확도 보강
- ★ Legacy 적대성 환경에서 self_recognized SATD 자동 분류 → 기술부채 가시화

### 영향 (부정 / risk)

- **R1**: schema 가 PoC #06/#03 두 spectrum fixture 정합만 검증 → 다른 spectrum (Spring Boot 3 / FastAPI / Express) 적용 시 수정 carry — v2.1.x patch 흡수
- **R2**: ambiguous 자동 detect ❌ → 도메인 expert 결단 의무 (사용자 마찰 ↑)
- **R3**: coverage_strategy ratchet 의 `trend_required` 자동 검증 = `_shared/baseline.js` 통합 carry (v2.1.x)

### F-PHASE7 finding (PoC #06 첫 적용 / 일반화 ❌)

| ID | 본질 | v2.1.0 처분 |
|---|---|---|
| F-PHASE7-001 | 실 환경 (DB) 부재 시 정확도 한계 | deliverable §11.1 흔한 함정 + schema `data_source_status: "code_only"` 명시 + medium finding |
| F-PHASE7-002 | ambiguous 영역 분류표 자체가 핵심 산출 | deliverable §4 "intent vs bug 4 분류" + schema if/then |
| F-PHASE7-003 | scenario = Given/When/Then BDD / acceptance-criteria.json (Gherkin) 정합 | schema scenario sub-schema + cross_links to_artifact: acceptance-criteria |
| F-PHASE7-004 | behavior_likely_bug = 새 시스템 검증 추가 의무 신호 | schema scenario.behavior_likely_bug optional 필드 |

★ F-PHASE7-001~004 = PoC #06 단일 적용에서 발견 / 본체 schema 의 carry note 만 (일반화 ❌). ≥ 3 PoC corroboration 후 일반화 검토.

## 미해결 (carry / v2.1.x patch / v2.x)

| ID | 항목 | trigger |
|---|---|---|
| C-v2.1.0-1 | snapshot Gherkin (.feature) 변환 출력 | v2.1.x patch / 사용자 finding |
| C-v2.1.0-2 | Modern 환경 명확 비율 ≥ 95% 자동 detect | v2.2+ |
| C-v2.1.0-3 | acceptance oracle threshold dashboard | v2.x |
| C-v2.1.0-4 | F-PHASE7-001~004 일반화 검토 (≥ 3 PoC corroboration 후) | ≥ 3 PoC corroboration |
| C-v2.1.0-5 | ratchet `trend_required=true` 자동 검증 (baseline.js 통합) | v2.1.x patch |
| C-v2.1.0-6 | ts-morph + 실 환경 (DB) snapshot 자동 추출 | v2.x |
| C-v2.1.0-7 | sub-rule 추가 (다른 spectrum: Spring Boot 3 / FastAPI / Express) | 사용자 PoC corroboration |

## ★ ADR-CHAIN-001~005 정합

본 ADR 가 chain harness 5 요소 (driver / state / mechanical gate / skill auto-invoke / revisit-detect) 변경 ❌. analysis stage 내부 phase 추가만. chain harness validated 자격 영향 ❌.

## release / tag

- v2.1.0 minor release (★ release / git tag `v2.1.0`)
- ≥ 2 PoC corroboration 충족 (PoC #06 + PoC #03 retrofit)
- §8.1 strict 정합 검증대 통과 자격
- DEC-2026-05-07-v2.1.0-release 별도 등재 의무
