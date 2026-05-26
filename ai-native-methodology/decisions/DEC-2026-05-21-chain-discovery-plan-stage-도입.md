# DEC-2026-05-21 — chain stage 재구성 (discovery 도입 + plan 신설)

- **결정일**: 2026-05-21
- **결정자**: 윤주스 (TF Lead) — 사용자 명시 결단 (옵션 A "개칭 + 확장")
- **상태**: 승인 / 시행중 (v4.1.0 MINOR)

## 결정

chain harness 5-stage paradigm (`analysis → planning → spec → test → implement`) 을 6-stage (`analysis → discovery → spec → plan → test → implement`) 로 재구성. 두 가지 본질 변경:

1. **`planning` stage → `discovery` stage 개칭 + 책임 확장**
   - 단어 `planning` 이 산업 일반 용법 ("구현 계획") 과 충돌 → misleading
   - 현 planning-agent 의 실 책임 = "입력에서 UC + intent 추출" → `discovery` 가 정확
   - 입력 유형 확장: analysis-output 1종 → 4종 (analysis-output / swagger / figma / nl-md)
   - `analysis-from-{prompt,swagger,plan-doc,figma}` 6 input skill 을 discovery-agent 로 이관

2. **`plan` stage 신설 (spec ↔ test 사이)**
   - spec(BHV/AC) 이후 HOW (task 분해 / 의존성 / ADR / NFR allocation / risk / rollback) 가 chain 단계로 부재
   - test/implement 가 mechanical translation 만 수행 → macro HOW 가 LLM implicit 추론으로 묻혀 있던 상태
   - 본 stage 가 spec ↔ test 사이에 명시 단계로 진입

## 진단 — 기존 chain 의 빈 칸

| 빈 칸 | 본질 | 영향 |
|---|---|---|
| 단어 misleading | `planning` = 산업 통용 "구현 계획" vs 본 methodology "UC + intent 추출" | 사용자 혼란 / paradigm 학습 비용 |
| 입력 다양성 부재 | analysis-output 만 chain 입력 / swagger·figma·자연어 는 analysis stage 안에 묻힘 | 신규 일감 (baseline 외) 진입 채널 모호 |
| HOW 단계 부재 | spec 이후 test/implement 가 mechanical translation 만 수행 | macro HOW (작업 분해 / 의존성 / 아키텍처 결정 / NFR allocation / risk / rollback) 가 LLM implicit 추론으로 묻힘 |

## paradigm 결단 (사용자 결단 2026-05-21)

| 의제 | 결단 | 근거 |
|---|---|---|
| chain stage 재구성 | 옵션 A "개칭 + 확장" ✅ | 사용자 명시 "A. 개칭 + 확장 (paradigm 일관, 큰 변경)" — 옵션 B (stage 7개 / 중복) + 옵션 C (placeholder 만 / 본질 미해결) 거절 |
| `discovery` 명명 채택 | 산업 통용 단어 정합 ✅ | Agile/Lean 의 Discovery 단계 (왜·무엇·누구 탐색) 와 본 책임 일치 / `Intent` `Framing` `Requirements` 후보 비교 후 선택 |
| `plan` 신설 위치 | spec ↔ test 사이 ✅ | UC 분해 정보가 spec 전에 부족 → `discovery` 앞에 둘 수 없음 / impl-spec 은 사후 기록 → `implement` 안에 둘 수 없음 / `plan` 은 spec 이후 사전 결정 |
| placeholder 패턴 | `plan-agent` 만 placeholder ✅ | `discovery-agent` = 기존 planning-agent 책임 흡수 + skill 추가 → 즉시 본격 (placeholder 아님). `plan-agent` = skill 3종 부재 → design-agent 패턴 (frontmatter skills:[] / dispatch carry) |
| 입력 어댑터 이관 | `analysis-from-*` 6 skill → `discovery-from-*` 이관 ✅ | analysis stage 의 본 책임 = "기존 코드·시스템 해부 (baseline)" / 외부 입력 어댑터는 discovery stage 책임 / paradigm 정합 |
| version label | v4.1.0 MINOR ✅ | paradigm 본질 확장 (stage 5→6) 이지만 chain harness 본격 paradigm (v4.0) 유지 / MAJOR ❌ |

## 8 운영 정책 (사용자 명시 결단 2026-05-21)

| # | 정책 | 결단값 | 근거 |
|---|---|---|---|
| 1 | Discovery 입력 감지 | 혼합 (자동 추정 + 1회 confirm) | 오감지 cost > confirm cost |
| 2 | Skill 병렬 dispatch | 허용 | skill 간 독립 / 시간 단축 / methodology 다른 stage 패턴 정합 |
| 3 | NFR 게이트 위치 | Discovery (soft) + Plan (hard) 비대칭 | NFR 누락 폭발 cost > gate 부담 |
| 4 | Plan task granularity | 1~3 AC 묶음 (같은 BHV + 같은 layer + 같은 module) | 의미 단위 + 합리적 수 |
| 5 | ADR 의무 범위 | 되돌리기 어려운 결정만 (5 자동 판정 기준) | 산업 표준 (Michael Nygard) / cost 균형 |
| 6 | Risk 도출 자동화 | LLM 기본 + industry-case-researcher + 사람 보강 (3중 망) | risk 누락 cost 큼 / generic risk 회피 |
| 7 | Estimation 필드 | estimation_ai + estimation_human 분리 | AI 값 잘못 신뢰 위험 차단 |
| 8 | Agent 도입 방식 | discovery-agent 즉시 본격 / plan-agent placeholder | discovery = 기존 책임 흡수 / plan = skill 부재 |

## ADR 자동 판정 기준 (정책 5 상세)

다음 5 기준 중 하나라도 해당 시 ADR 강제:

1. 다른 task 의 ≥30% 에 영향 미치는 결정
2. 외부 시스템 추가/제거
3. 데이터 모델 변경
4. 라이브러리/프레임워크 선택
5. async/sync · 모듈 분할 같은 아키텍처 layer 결정

## 신설 자산 (v4.1.0 commit scope)

### agents/
- `agents/discovery-agent.md` ← `agents/planning-agent.md` 의 책임 흡수 + 확장 (rename)
- `agents/plan-agent.md` 신설 (placeholder / design-agent 패턴 / skills:[] / v4.2+ skill 신설 carry)

### skills/
- `skills/discovery-from-analysis-output/` ← `skills/planning-extract-from-legacy/` (rename)
- `skills/discovery-decompose-use-cases/` ← `skills/planning-decompose-use-cases/` (rename / discovery agent 공통 호출 sub-skill)
- `skills/discovery-identify-business-intent/` ← `skills/planning-identify-business-intent/` (rename / 공통 호출)
- `skills/discovery-from-swagger/` 신설 (어댑터 — `skills/analysis-from-swagger/` 일부 흡수 가능성 carry)
- `skills/discovery-from-figma/` 신설 (어댑터 — `skills/analysis-from-figma/` 일부 흡수 carry)
- `skills/discovery-from-nl-md/` 신설 (어댑터 — `skills/analysis-from-prompt/` + `skills/analysis-from-plan-doc/` 흡수 carry)
- `skills/plan-decompose-and-sequence/` placeholder
- `skills/plan-architect-decisions/` placeholder
- `skills/plan-risk-and-nfr/` placeholder

### methodology-spec/
- `methodology-spec/lifecycle-contract.md` — §자산 매핑 매트릭스 §Agent column 6 row 재작성 (discovery·plan 추가)
- `methodology-spec/agents-axis.md` — v4.1.0 정합 갱신 (현 v2.5.1 PATCH 시점 stale)
- `methodology-spec/skills-axis.md` — discovery·plan stage 추가

### infra
- `hooks/hooks.json` — TRIGGER_PATTERNS 안 discovery·plan stage 진입 패턴 추가
- `.claude-plugin/plugin.json` — version 4.0.x → 4.1.0
- `CLAUDE.md` — chain stage 6-stage 설명 갱신
- `CHANGELOG.md` — v4.1.0 entry
- `decisions/INDEX.md` — 본 DEC 등재
- `agents/README.md` — stage agent 6종 + design placeholder 갱신

## carry (v4.2+ scope)

| ID | 내용 |
|---|---|
| C-v4.1-plan-skill | `plan-{decompose-and-sequence, architect-decisions, risk-and-nfr}` skill 3종 본격 신설 (현 placeholder 상태) |
| C-v4.1-input-skill-이관 | `analysis-from-{prompt,swagger,plan-doc,figma}` 6 input skill 의 실제 이관 — 현 ADR scope = discovery-from-* 신설 / analysis-from-* 흡수 여부는 본격 검토 후 결단 |
| C-v4.1-session-재시작-검증 | LL-v4-04 정합 — 본 paradigm 변경 후 Claude Code session 재시작 후 dispatch 검증 의무 |
| C-v4.1-traceability-확장 | traceability-matrix 안 TASK + ADR + NFR + RISK layer 신설 (UC → BHV → AC → TASK → TC → IMPL + ADR/NFR/RISK cross-cut) |
| C-v4.1-baseline-delta-운영-문서화 ✅ **(v10.0.1 종결)** | "초기 1회 full analysis + 매 신규 건 delta 갱신" 운영 모델 명시 (baseline carry 규약) → `methodology-spec/baseline-delta-operating-model.md` 신설 / DEC-2026-05-26-baseline-delta-operating-model |
| C-v4.1-poc-재실행 | 기존 PoC chain 산출물에 discovery·plan stage 추가 재실행 |
| ★ C-v4.1-hooks-정합 (★ 깨진 참조 버그 / 시급) | `hooks.json` matcher (`planning` → `discovery`) + `hooks-bridge.js` TRIGGER_PATTERNS agentId 매핑 (`planning-agent` → `discovery-agent`, `planning-extract-from-legacy` → `discovery-from-analysis-output`) 갱신. ★ rename 미반영 = 깨진 참조 (6-stage 가 hooks 레벨 미작동). ★ 주의: artifact-graph 작업 (feat/artifact-graph-p1 / dependency-graph P1~P3) 이 동일 파일 (`hooks.json` + `hooks-bridge.js`) 대폭 수정 중 → 분리 commit 시 충돌. **artifact-graph 작업 안에 함께 수정** 또는 **artifact-graph merge 후** 수정 필요. plan/design 은 placeholder 라 TRIGGER 미등록 유지 (design-agent 패턴 정합 / v4.2+ 본격 시 등록). |

## 정합 관계

- DEC-2026-05-17-v4-multi-agent-paradigm-채택 (모 결단 — v4.0 stage 별 agent 분리 paradigm. 본 v4.1 이 위에서 stage 수 확장)
- DEC-2026-05-17-spike-planning-agent-실험 (paradigm 가능 입증 / archive 보존)
- DEC-2026-05-15-g5-lifecycle-asset-matrix-종결 (이미 retract — "stage 별 분리 ❌" 폐기 / 본 v4.1 도 stage 별 분리 paradigm 정합)
- ADR-CHAIN-001~005 (chain harness paradigm — discovery·plan stage 가 gate trio 준수 의무)
- design-agent.md (PLACEHOLDER 패턴 reference — plan-agent 가 동일 패턴)
- `methodology-spec/lifecycle-contract.md` (Agent column 본격 재작성 의무)

## Lessons Learned

- **LL-v4.1-01**: 단어 선택 (`planning` vs `discovery`) 이 paradigm 학습 비용에 큰 영향. 산업 통용 용법과 충돌하는 단어는 누적 혼란 발생. 새 stage 명명 시 산업 통용 검증 의무.
- **LL-v4.1-02**: chain stage 의 mechanical translation (spec → test → impl) 만으로는 macro HOW (작업 분해 / 의존성 / 아키텍처 결정 / NFR / risk) 가 LLM implicit 추론으로 묻힌다. 명시 단계 (plan) 없이는 추적 불가. 1 BHV 짜리 작은 변경은 직결로 OK 지만 multi-BHV 일감은 implicit HOW 가 통합 시점에 폭발.
- **LL-v4.1-03**: 입력 어댑터 paradigm 의 위치 결단 — analysis stage (현 v4.0) 안에 input skill 6종이 묻혀 있는 구조는 baseline 1회 + 신규 일감 N회 운영 모델에서 비효율. baseline 외 신규 입력 진입 채널을 별도 stage (discovery) 로 분리하는 게 paradigm 명확화에 정합.
- **LL-v4.1-04**: ADR 의 사후 정당화 위험 (LLM 이 "이미 결정된 듯한 톤" 으로 작성) 회피책 = 대안 ≥3개 강제 + trade-off 명시. 본 ADR 자체도 옵션 A/B/C 비교 + 거절 근거를 포함하여 동일 패턴 적용.

## carry caution

- 본 paradigm 변경은 v4.0 본격 진입 후 4일 만의 후속 변경 (cooling-off 24h 이상 충족하지만 v4.0 정착 검증 부족 상태). v4.0 안 PoC 재실행 결과 carry 가 v4.1 안 검증 의무로 추가됨.
- discovery-agent 의 skill 4종 어댑터 신설은 본 commit scope 내 placeholder 만 신설 / 본격 구현은 후속 PR 분리 가능. 본 commit 의 atomic 변경 단위 = "stage 명명 + agent 골조 + skill 골조 + ADR".
