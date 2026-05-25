# DEC-2026-05-25-axis-a-phase-4-1

> v9.1.0 MINOR — axis A plan stage paradigm 본격 구현 Phase 4-1 시행 (★ ★ ★ ★ ★ paradigm-level / additive only / breaking 0). Senior REVISE-2 흡수 + 공식 docs REVISE-1/2/3 흡수 + Industry REVISE-1 흡수 + 5 release 분산 cadence (Phase 4-1~4-5) 1차 진입.

- **결단 일자**: 2026-05-25 (session 46차 / v9.1.0 MINOR)
- **결단자**: 윤주스 (TF Lead)
- **범주**: paradigm — chain harness plan stage 본격 구현 1차 (additive)
- **상태**: 승인 / additive / MINOR

## 컨텍스트

DEC-2026-05-21-chain-discovery-plan-stage-도입 (옵션 A 개칭+확장) + DEC-2026-05-23-discovery-stage-v9 (v9.0.0 6-stage machine SSOT) 정합. plan stage = 진짜 작동 stage 자격 미달 (PLACEHOLDER 잔존 / gate deferred / schema·validator·skill body 부재 / F-CHA-003 paradigm-level finding source).

session 45차 carry "ζ-1 의식적 제외 / self-referential corrective drift 회피" = ★ ★ 본 결단으로 본격 retract. 사용자 명시 결단 trigger ("PoC 안 할꺼야 / 플러그인 적용 못했던 것 위주").

★ ★ retract 정합 사유:
- F-CHA-003 = 본격 paradigm 결함 (단순 doc drift 자기 fix ❌) — DO-178C 5 layer → 6 layer 진화 본격 gap
- 사용자 명시 결단 trigger (강요 ❌ / 자기 fix 회피 paradigm 가 강요한 axis 아님)
- session 43차 4 release 동형 패턴 회피 — 본 결단 = release-readiness criterion add 가 아닌 stage 본격 신설

## 결정

### §1. β cadence — 본 session = Phase 1~3 / Phase 4-1 본격 시행

본 session 안:
- Phase 1.1~1.5 깊이 숙지 (DEC-2026-05-21 + DEC-2026-05-23 + ADR-CHAIN-001/002/005 + spec stage 동형 자산 + 결정적 도구)
- Phase 1.6 plan.md 본격 작성 (`~/.claude/plans/plan-axis-a-plan-stage-paradigm.md`)
- Phase 2 3 agent 병렬 토론 — Senior REVISE-2 @ 0.81 (2 BLOCKER + 5 risk) / 공식 docs REVISE-1/2/3 (BLOCKING ❌) / Industry isomorphic GREEN (6 production cases)
- Phase 3 사용자 묶음 결단 Cluster 1~8 + plan.md 본격 갱신
- Phase 4-1 본격 시행 (β cadence retract / 본 session 안 additive only)

### §2. Phase 4-1 본격 scope (A1+A2+A3 / additive only / breaking 0)

**A1. `schemas/task-plan.schema.json` 신설** (Cluster 6 결단 / Senior risk #1 해소):
- planning-spec.schema.json template 차용
- meta-confidence + derivation_source + tasks[] + adrs[] + risks[] + nfr_allocation[] + rollback_strategy + cross_links
- task granularity schema-level enforce (`ac_refs.maxItems:3` strict)
- alternatives ≥3 schema-level enforce (`adrs[].alternatives.minItems:3`)
- ISO/IEC 25010:2023 SQuaRE 9 quality characteristic enum (Safety 신설 포함 / Cluster 7 / 공식 docs REVISE-3 흡수)
- Nygard 원본 5 category + security_compliance enum (Cluster 7 / 공식 docs REVISE-2 흡수)
- AC ↔ NFR 양방향 + adr ↔ behavior 역방향 link (Cluster 4 Senior 수정 흡수)

**A2. `tools/plan-coverage-validator` workspace 신설** (npm 21번째 / Senior BLOCKER-2 흡수):
- exit code contract (0=ok / 1=blocking findings / 2=usage-error)
- 5 validator 함수: validateTaskCoverage + validateNfrAllocation + validateTaskGranularity + validateDependencyCycle + validateRiskSeverity
- ≥ 5 Senior BLOCKER-2 통합 test 의무 본격 충족 (5 scenario all pass)
- 28/28 test pass (5 suite 23 unit + 1 suite 5 integration)
- chain-coverage-validator 동형 paradigm (loadJson + finding {kind, severity, message})

**A3. plan-* 3 skill body** (placeholder → body / Senior risk #5 흡수 — enumerated count 회피):
- `skills/plan-decompose-and-sequence/SKILL.md` — task 분해 + dependency graph + topological sort
- `skills/plan-architect-decisions/SKILL.md` — ADR 작성 (Nygard 5 category 기반 사내 구체화 + 보안/규제 axis)
- `skills/plan-risk-and-nfr/SKILL.md` — risk 3중 망 + NFR allocation hard gate + rollback

### §3. Cluster 1~8 결단 (Phase 2 3 agent 토론 흡수)

| Cluster | 결단 | 근거 |
|---|---|---|
| 1 (gate 번호) | X (재번호) + 분리 cadence | Senior + Industry / Phase 4-4 단독 v10.0.0 carry |
| 2 (NFR severity) | high+critical + 사내 해석 표기 | DO-178C GREEN / 공식 docs REVISE-3 |
| 3 (TASK 위치) | AC→TASK→TC | DO-178C 6 layer / Senior + 공식 docs 정합 |
| 4 (cross-cut) | task→ADR + AC↔NFR + task→RISK + adr→behavior 역방향 | Senior REVISE-2 |
| 5 (ticket 동반) | 분리 carry (v10.1.0 MAJOR) | Senior BLOCKER-1 |
| 6 (산출물 명명) | `task-plan.json` (Senior 권고) | discovery (planning-spec) ↔ plan (task-plan) 명독 분리 |
| 7 (ADR 5 기준 출처) | Nygard 5 category 기반 사내 구체화 + 보안/규제 axis 추가 | 공식 docs CONTRADICTS 해소 |
| 8 (Type 2 carry deadline) | v10.1.0 release 자격 = Type 2 외부 사용자 ≥ 1 corroboration 의무 | Senior Type 2 무한 후순위화 회피 |

### §4. carry (Phase 4-2~4-5)

| Phase | scope | 분류 |
|---|---|---|
| 4-2 (v9.x PATCH) | A4 plan-agent body + A5 chain-driver stage-graph/gate-eval plan 분기 | additive |
| 4-3 (v9.x MINOR) | A6 traceability-matrix subtask_ids.chain3_plan additive | additive |
| 4-4 (v10.0.0 MAJOR / cooling-off ≥24h) | A7 + A8 gate 번호 재정렬 + revisit_edges | structural / breaking |
| 4-5 (v10.1.0 MAJOR / Type 2 trigger) | ticket subsystem 6-stage migration | breaking + Type 2 corroboration 의무 |

## STOP-3

- workspace test: 698 → **726/726 pass** (28 신규 plan-coverage-validator 추가 / ★ 무회귀)
- skill-citation-validator: **0 stale** (DEC-2026-05-25-axis-a-phase-4-1 신설로 7 dead-link 해소)
- release-readiness 17/17 ready:true (보존)
- drift-validator 0 breaking (보존)
- version 3-way: plugin.json + package.json + root state = 9.1.0
- breaking 0 = MINOR (chain-coverage-validator 0.3.0 + plan-coverage-validator 0.1.0 신설 / 모두 additive)

## 인용 / Cross-link

- DEC-2026-05-21-chain-discovery-plan-stage-도입 (★ 본 결단의 모 결단 / paradigm source)
- DEC-2026-05-23-discovery-stage-v9 (v9.0.0 machine SSOT / plan placeholder carry §carry)
- DEC-2026-05-23-coherence-docs-6stage (v9.0.1 prose carry / plan-agent 본격 구현 carry §carry)
- ADR-CHAIN-001 §1 §2 (이중 렌더링 + cross-link coverage ratchet)
- ADR-CHAIN-002 (gate UX)
- ADR-CHAIN-005 §3 (mechanical gate enforcement trio)
- `~/.claude/plans/plan-axis-a-plan-stage-paradigm.md` (★ 본 결단의 plan SSOT)
- `~/.claude/plans/nested-yawning-hammock.md` (audit plan / 45차 carry)
- `schemas/task-plan.schema.json` (★ A1 신설)
- `tools/plan-coverage-validator/` (★ A2 신설)
- `skills/plan-{decompose-and-sequence,architect-decisions,risk-and-nfr}/SKILL.md` (★ A3 body)
- Michael Nygard "Documenting Architecture Decisions" — https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions
- ISO/IEC 25010:2023 SQuaRE — https://www.iso.org/standard/78176.html

## Lessons Learned

- **LL-v910-01** (★ self-referential corrective drift retract paradigm 본격 입증) — session 45차 carry "ζ-1 의식적 제외" 결단의 본격 retract 채널 = ★ ★ ★ 사용자 명시 결단 trigger ("플러그인 적용 못했던 것 위주") + 본격 paradigm 결함 fix (F-CHA-003 = DO-178C 5 layer → 6 layer 진화 본격 gap / 단순 doc drift 자기 fix ❌). retract 자격 검증 cadence: 사용자 명시 결단 trigger + paradigm-level scope + release-readiness criterion add 가 아닌 stage 본격 신설.
- **LL-v910-02** (★ ★ β cadence 본격 활용 paradigm) — paradigm-level 결단 시 ★ ★ Phase 1~3 (깊이 숙지 + 3 agent 토론 + 사용자 묶음 결단) 본 session / Phase 4 시행 차기 session = β cadence default. 단 ★ 사용자 명시 결단 ("진행") 시 β cadence retract 본격 자격 (additive only scope 한정 / cooling-off ❌ 정합).
- **LL-v910-03** (★ Senior BLOCKER-2 exit code contract paradigm 본격 입증) — plan-coverage-validator 신설 시 ★ exit code contract (0=ok / 1=blocking / 2=usage-error) 본격 명시 + ≥ 5 통합 test 의무 = drift-validator silent sink LL-v903-01 + chain-coverage-validator default projectRoot LL-v904-01 동형 paradigm 회피. 28/28 test pass 본격 입증.
- **LL-v910-04** (★ ★ 3 agent 병렬 토론 본격 paradigm 입증) — Senior REVISE-2 + 공식 docs REVISE-1/2/3 + Industry isomorphic GREEN (6 production cases) 3 axis 본격 토론 정합. Senior 2 BLOCKER 흡수 → Phase 4-3 v10.0.0 MAJOR scope 본격 축소 (A6+A7+A8+ticket 4 axis 동시 → 3 release 분산) + Senior BLOCKER-2 exit code contract 본격 명시. 공식 docs CONTRADICTS (Nygard ≥30% task 영향 오귀인) → 사내 구체화 표기 + 보안/규제 axis 추가. Industry isomorphic GREEN (Copilot Workspace + Cursor Plan Mode + Aider Architect + AWS AI-DLC) → paradigm 신선성 + isomorphic 비율 본격 검증.

Resolves: F-CHA-003 (plan stage paradigm 위배) Phase 4-1 부분 해소 (schema + validator + skill body / agent body + gate + traceability = Phase 4-2~4-5 carry).
