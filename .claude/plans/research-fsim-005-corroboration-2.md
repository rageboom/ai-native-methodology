# Research — F-SIM-005 P1 corroboration #2 본격 해소

> 4원칙 §2 (3-에이전트 병렬 토론). 본 research = plan-fsim-005-corroboration-2.md 의 짝.
> 작성일: 2026-05-23 (session 39차).
> 3-agent dispatch 결과 통합 (가벼운 sub-agent 전략 적용 / Phase 4~6 정합).

---

## 1. Senior critique 종합 verdict

**REVISE-3 (confidence 0.83) — GO with three blocking revisions**.

plan 은 근본적으로 sound (F-SIM-005 evidence 정합 / 4-axis 해소 / additive-only schema 진화). 그러나 **1 STRONG-STOP + 1 HIGH + 1 MED + 1 LOW** 총 4 critique 표면화.

| 등급 | 항목 | 본질 |
|---|---|---|
| **STRONG-STOP (BLOCKER)** | Type 2 9일 시한 안 불가능 | 본 plan §1.3 axis 3 "Type 2 ≥ 1 의무" → §5 commit cadence 안 Type 2 (외부 사용자 / 외부 repo / 별도 Claude Code session) 달성 경로 부재 → **자기 위배** |
| **HIGH** | poc-15 vs poc-02 자기모순 | `examples/poc-02-realworld-springboot3` 이미 존재 (실 ls 검증). plan §2 Cluster A "신규 poc-15 (Modern Spring Boot 3 + JPA Hexagonal — poc-02 기반)" = 명명 충돌 / 9일 시한 risk |
| **MED** | dry-run 30% 임계 단일 PoC 함정 | plan §6 함정 표 자기 명시한 "§8.1 단일 PoC 과적합 회피" 정면 위배. 임계 자체가 ≥ 2 PoC 실측 전 결정 = 동일 함정 |
| **LOW** | export count 사실 오류 | plan §2 Cluster B "5번째 export" → 실 grep validator.js = 이미 6 export. plan 작성 시 `validateConfidenceCoverage` 누락 → 본 신설 = **7번째** (utility 제외 6번째) |

### 1.1 REVISE 흡수 안 (Senior 명시)

**REVISE-1 (BLOCKER 흡수 / paradigm 진화)**:

Type 분류 **3계층화** 의무:
- **Type 1** = Claude self-run / same session (v8.4.0 poc-14 = 이 분류)
- **Type 1.5** = 본 user 가 별도 PoC 적용 / same plugin SSOT (★ 본 release 본격 달성 가능)
- **Type 2** = 외부 사용자 / 외부 repo / 별도 Claude Code session (★ 본 release 시한 안 불가능 / carry 정직 표기 의무)

`self_consistency_note` 갱신: "v8.14.0 = Type 1.5 self-bootstrap proof 본격 달성 / Type 2 = 미해소 carry (외부 사용자 채택 대기 / deadline 없음)" 시간 축 정직 표기. 이것이 진짜 §8.1 자기 정합 + commit-block 회피 꼼수 ❌.

**REVISE-2 (HIGH 흡수)**:

Cluster A5 변경 — 신규 poc-15 신설 ❌ → **poc-02 본격 chain 4 GREEN 재실행** (재검증). 명명 = `poc-02` 유지. corroboration #2 자격 = poc-05 (TypeScript + vitest) + poc-02 (Java + JUnit/Spring Boot 3) = **stack 횡단 본격 달성**. poc-14 (Python + pytest / v8.4.0 Type 1) = corroboration #3 자격 보존 (격하 ❌ / Type 1 명시).

**REVISE-3 (MED 흡수)**:

Cluster B3 변경 — dry-run ratio ≤ 30% 임계 = **warn-only** (v8.14.0). corroboration count 자격 = boolean 만 강제 (`dry_run_placeholder` 제외 의무 / 임계 ratio ❌). 30% 임계 = **v+1 ratchet** (≥ 2 PoC 실측 후 결정).

**LOW 정정**:

plan §2 Cluster B "5번째 export" → **"7번째 export (utility loadJson 제외 시 6번째)"** 정정. CLAUDE.md 본문 `chain-coverage-validator` 안 5번째 → 7번째 표기 동반 갱신 의무.

### 1.2 Senior 영역별 detail

- **영역 1 (B3 fail_mode enum)**: B1 + B2 = Concur. enum 3종 = Beck-canonical 정합 (finding-system.md 530-543 verbatim 매핑). 추천 = `pending` / `skipped` 별도 enum 추가 (Cucumber yellow ≠ red 정합).
- **영역 2 (A5 PoC stack)**: 영역 2 STRONG-STOP signal (REVISE-2).
- **영역 3 (C3 Type 1 vs Type 2)**: 영역 3 = ★★★ STRONG-STOP signal (REVISE-1).
- **영역 4 (D2 regression test 4종)**: Concur. test fixture = poc-02 chain 4 산출물 재활용 (신설 회피) + 의도적 negative fixture 별도 (4 lane trigger 결정적 입증). recursive drift 회피 본격 정합.
- **영역 5 (STOP signal 종합)**: 본 결단 paradigm boundary = **안** (단 Type 분류 3계층화 후).

### 1.3 trade-off 평가

"F-SIM-005 진정 해소" vs "기존 corroboration #2 보존" — REVISE-1 적용 시 **둘 다 달성**:
- poc-02 = corroboration #2 본격 Type 1.5 (Java stack)
- poc-14 Type 1 = 보존 (격하 ❌)
- Type 2 = carry 정직 표기 (paradigm maturity 본격 입증)

### 1.4 핵심 file refs (Senior 명시)

- `schemas/test-spec.schema.json` line 86-123 `test_run_evidence` properties (fail_mode enum 추가 지점)
- `tools/chain-coverage-validator/src/validator.js` export 6→7 추가 지점
- `flows/sdlc-4stage-flow.json` line 165-183 `release_eligibility` `self_consistency_note` REVISE-1 갱신 지점
- `examples/poc-02-realworld-springboot3` 재검증 대상 (신설 회피)

---

## 2. F-015 official docs cross-validation

### 2.1 Claim A — Beck-canonical RED (★ VERIFIED)

본 방법론 claim: "compile-import-fail 도 valid RED" (F-SIM-005 ledger Beck-canonical 수정 / v8.3.0 H3 반증).

**Primary source verbatim**: Kent Beck, "Test-Driven Development: By Example" (Addison-Wesley, 2002), preface p.x:

> "1. Red — Write a little test that doesn't work, **and perhaps doesn't even compile at first**. 2. Green — Make the test work quickly, committing whatever sins necessary in process. 3. Refactor — Eliminate all of the duplication created in merely getting the test to work."

[Notes on TDD by Kent Beck (stanislaw.github.io)](https://stanislaw.github.io/2016-01-25-notes-on-test-driven-development-by-example-by-kent-beck.html) (retrieved 2026-05-23). 2차 corroboration = [Martin Fowler bliki](https://martinfowler.com/bliki/TestDrivenDevelopment.html) + [Wikipedia TDD](https://en.wikipedia.org/wiki/Test-driven_development).

**Verdict**: VERIFIED. Beck 명시적으로 RED 가 "doesn't even compile at first" 상태를 포함한다고 정의. plan `fail_mode: compile_import_fail` enum 값 = Beck-canonical 정합. ISO/IEC/IEEE 29119-1:2022 PDF binary 접근 불가 → INSUFFICIENT-DATA (ISO 각도).

### 2.2 Claim B — chain 4 GREEN 의무 (★ PARTIAL-VERIFIED)

본 방법론 claim: "chain 4 GREEN = test_pass_rate 1.0 + 5종 물증 7 필드 + impl-spec 존재" + DO-178C / IEC 62304 bidirectional traceability 차용.

**Primary source verbatim**: [DO-178C Requirements Traceability (Parasoft)](https://www.parasoft.com/learning-center/do-178c/requirements-traceability/) (retrieved 2026-05-23):

> "Maintaining the bidirectional correlation between requirements, tests, and the artifacts that implement them is an essential component of traceability... each system requirement that will be realized by software must trace down to one or more high-level or derived software requirements, each of which in turn trace to one or more low-level requirements which then trace to source code."

**Verdict**: PARTIAL-VERIFIED. DO-178C bidirectional traceability VERIFIED + 본 방법론 traceability-matrix (UC→BHV→AC→TC→IMPL forward+backward link) 와 isomorphic. IEEE 829 + IEC 62304 = 직접 primary 미확보 (INSUFFICIENT-DATA / 그러나 contradicting evidence 부재).

### 2.3 Claim C — Type 1 vs Type 2 nomenclature (★ PARTIAL)

본 방법론 claim: "Type 1 self-run = partial corroboration / Type 2 real session = genuine corroboration" + Adzic SBE 10년 폐기 함정 권위 차용.

**Primary source verbatim**: [Gojko Adzic, SBE 10 years later](https://gojko.net/2020/03/17/sbe-10-years.html) (retrieved 2026-05-23):

> "I see far more people using G/W/T for test automation than to support BDD/SbE. And the BDD TLA has become synonymous in the industry with G/W/T powered tests — _our BDDs are broken_." — Seb Rose

> "about one third of the teams miss out on the potential benefits of examples to create high quality, self-checking documentation." — Adzic

**Verdict**: PARTIAL. Adzic 10년 lesson = "form-compliance 자동화 + meaning 보존 미강제" 함정 정면 VERIFIED → 본 방법론 `dry_run_placeholder` 정직 표기 의무와 isomorphic. 단 "Type 1 vs Type 2" 정확한 nomenclature = 본 방법론 자체 coinage (외부 verbatim 권위 부재 / INSUFFICIENT-DATA on naming). 즉 사상 정합 ✅ / 명칭 first-mover ✅.

### 2.4 STOP signal (F-015)

**(없음)**. 어떤 claim 도 primary source 반증 ❌. 방법론 가치 명세 위반 finding ❌. 다만 ISO/IEC/IEEE 29119-1:2022 verbatim + "Type 1 vs Type 2" 명칭 외부 권위 = INSUFFICIENT-DATA (반증 ❌).

---

## 3. Industry case research

### 3.1 영역 1 — Self-bootstrap proof (3 case)

**[Case 1] Rust Compiler 4단계 self-hosting bootstrap**
[Rust Compiler Development Guide](https://rustc-dev-guide.rust-lang.org/building/bootstrapping/what-bootstrapping-does.html). Stage 0(beta) → Stage 1(beta 로 신 소스) → Stage 2(stage1 로 재컴파일) → Stage 3(sanity check / stage2·stage3 동일성). **Stage 3 identity check = "새 컴파일러가 자기 자신을 정확히 재생산" 자기 정합 증명**.

→ 본 방법론 self-bootstrap proof (plugin 이 plugin 자신의 검증대 통과) = Stage 3 identity check 와 **구조적 동형**. poc-05 재검증 + poc-02 신규 chain 4 GREEN 병렬 corroboration (REVISE-2) 와 isomorphic.

**[Case 2] GCC 3단계 bootstrap**
[Bootstrapping compilers — Wikipedia](https://en.wikipedia.org/wiki/Bootstrapping_(compilers)). Stage 1 → Stage 2 → Stage 3 모두 동일 바이너리 생성 시 통과. 40년+ 신뢰 기반. 단일 stage 통과 불충분 = **§8.1 strict "≥ 2 PoC" 임계의 industry 기반**.

**[Case 3] Go compiler C → Go self-hosting 전환**
초기 C → Go 1.5 부터 완전 Go self-hosting. 전환 시 C 버전과 Go 버전 결과 동일성 cross-check. → 본 방법론이 외부 검증 도구 점차 내재화하면서 self-bootstrap 달성 진화 경로와 isomorphic. **first-mover 자격 직접 선례**.

### 3.2 영역 2 — Spec-driven PoC corroboration (3 case)

**[Case 4] GitHub Spec Kit — specify→plan→tasks→implement 4단계 + spec validator**
[IntuitionLabs — Spec Kit Guide](https://intuitionlabs.ai/articles/spec-driven-development-spec-kit). CLI 가 각 단계 전환 시 spec-validate 통과해야 진행. **gate enforcement** = 본 방법론 go/stop gate #1~#4 와 구조 동형. B3 (fail_mode enum + dry-run gate) 의 industry 선례.

**[Case 5] ThoughtWorks Technology Radar — Spec-Driven Development "Assess" + 함정 경고**
[ThoughtWorks Radar Vol.33 2025](https://www.thoughtworks.com/radar/techniques/spec-driven-development). "heavy up-front specification + big-bang release = anti-pattern" 명시. corroboration 없는 단일 PoC 의존 = Adzic SBE 폐기 함정과 동일 경로. → 본 방법론 §8.1 corroboration (≥ 2 PoC) + D2 regression test 4종이 함정 직접 회피.

**[Case 6] SWE-bench static vs Live 분리**
[SWE-bench Goes Live (arxiv 2505.23419)](https://arxiv.org/pdf/2505.23419). SWE-bench-Live (2025) = 2024년 이후 실 GitHub issue 1,319 건. static vs live 격차 "controlled evaluation 에서도 substantial". HumanEval 90% 모델도 SWE-bench 40~55%. → "simulation 통과 ≠ real session 통과" 정량 입증 = C3 REVISE-1 (Type 1 / Type 1.5 / Type 2 분리) 의 direct industry 선례.

### 3.3 영역 3 — Type 1 vs Type 2 분리 (3 case)

**[Case 7] Waymo CarCraft simulation arm + 실도로 arm 병렬 운용**
[Understanding AI — Waymo vs Tesla](https://www.understandingai.org/p/waymo-and-teslas-self-driving-systems). Waymo = 가상 Carcraft 10억+ 마일 (Type 1) + 실도로 7,100만 마일 (Type 2) 병렬. 두 arm 일치 시만 배포. Tesla = real-world heavy (gap 비교 불가). → C3 REVISE-1 직접 구조 동형. **"하나만으로 충분하다"는 주장 = 업계 부정**.

**[Case 8] Anthropic 자기 모델 evaluator 시 simulation 처리**
[Anthropic — Evaluating AI Systems](https://www.anthropic.com/research/evaluating-ai-systems) + [Bloom](https://www.anthropic.com/research/bloom). "Claude Opus 4.1 이 모든 단계의 evaluator" = 자기 모델로 자기 모델 평가 → "automated evaluation" (Type 1) 분류 + NIST/AISI 외부 pre-deployment eval (Type 2) 별도 의무화. OpenAI cross-eval 교환 (2025) = Type 2 독립성 강화. → **F-SIM-005 corroboration #2 가 외부 사용자 실 session 요구하는 이유의 직접 industry 선례**.

**[Case 9] HumanEval vs SWE-bench simulation gap 정량화**
[Runloop — LLM Code Benchmarks](https://runloop.ai/blog/understanding-llm-code-benchmarks-from-humaneval-to-swe-bench). HumanEval (164 고립 / Type 1) 90%+ → SWE-bench (실 repo / Type 2) 40~55%. 격차 35~50%p. → poc-14 (Type 1 self-run) 이 F-SIM-011 패러독스 해소 못한 이유의 **정량 근거**. REVISE-2 (poc-02 재검증 = Type 1.5) 가 단순 숫자 추가 아닌 **stack 횡단 arm 확보** 임을 정당화.

### 3.4 Industry-aligned 판정

- **paradigm 정합 자릿수**: 9 case 모두 본 결단 cluster (A5+B3+C3+D2) 와 구조적 isomorphic. 업계 선례 없는 독자 발명 0건 — 전부 well-established 패턴의 방법론 적용.
- **first-mover 자격**: Rust/GCC Stage 3 identity check 패턴을 SDLC 방법론 plugin 에 적용한 선례 미확인 (compiler → methodology 전이). spec-driven + self-bootstrap + Type 1/2 분리 단일 plugin 통합 = 업계 공개 사례 미확인. **first-mover 자격 존재 / 단 단일 case 기반 주장 금지** (sample 부족).
- **함정 회피 자격 3종**: ThoughtWorks "big-bang + heavy up-front" 함정 회피 (§8.1 + D2) / SWE-bench Live "static only" 함정 회피 (C3 + self_consistency_note) / Waymo "simulation only" 함정 회피 (F-SIM-005 P1 commit-block).

---

## 4. 통합 결론 + 3원칙 묶음 결단 후보

### 4.1 본 plan 본격 정합 판정

| axis | 판정 | 근거 |
|---|---|---|
| sound paradigm 정합 | ✅ | 9 industry case isomorphic + 3 F-015 primary source VERIFIED |
| first-mover 자격 | ✅ | 영역 1 Stage 3 identity 패턴의 methodology 전이 + 영역 3 Type 1/1.5/2 명칭 |
| Adzic SBE 함정 회피 | ✅ | F-015 Claim C VERIFIED + Layer 2 cross-validator 기존 보유 |
| 9일 시한 정합 | ❌ → ✅ (REVISE-1+2 흡수 후) | Type 2 carry 정직 표기 + poc-02 재검증 변경 |
| §8.1 자기 정합 | ❌ → ✅ (REVISE-3 흡수 후) | dry-run 30% warn-only 격하 |
| 14차 retract 회피 | ✅ | additive only / breaking 0 |
| pre-pre-prerequisite 사각 | ✅ | release-readiness 16/16 ready 현 상태 / analysis_validator 6 PoC 통과 (v8.10.0 종결분) |

### 4.2 REVISE 흡수 후 시행 path

```
C1 (본 turn 완료)  : plan + research 작성
C2 (사용자 결단)   : REVISE-1+2+3 흡수 + cluster A5'/B3'/C3' 본격 시행 진입
C3 (별 turn)       : schema 진화 (test-spec.fail_mode enum + chain-coverage-validator validateFailModeDistribution 7번째 export warn-only)
C4 (별 turn)       : poc-05 chain 4 GREEN 재실행 + v8.3.0 4 lane regression 자동 확인
C5 (별 turn)       : poc-02 본격 chain 4 GREEN 도달 (재검증)
C6 (별 turn)       : release_eligibility 갱신 (Type 1/1.5/2 3계층 명시 / self_consistency_note 시간 축 정직)
C7 (별 turn)       : v8.14.0 MINOR release ceremony + DEC-2026-05-XX-fsim-005-corroboration-2-genuine
```

### 4.3 LL 자산화 후보 (8종 / 본 task 종결 후 finding-system.md 안 본격 등재)

- **LL-fsim-05** — F-SIM-011 패러독스 진정 해소 자격 = "Type 1.5 self-bootstrap proof" 본격 입증 (Stage 3 identity check 동형)
- **LL-fsim-06** — Beck-canonical RED 자격 = compile-import-fail (F-015 VERIFIED / preface p.x verbatim)
- **LL-fsim-07** — dry_run_placeholder 정직 표기 의무 = Adzic SBE 10년 폐기 함정 직접 회피
- **LL-fsim-08** — Type 분류 3계층화 (Type 1 / Type 1.5 / Type 2) = §8.1 자기 정합 + Type 2 carry 정직
- **LL-fsim-09** — Senior STRONG-STOP signal 흡수 paradigm = REVISE-1 본격 작동 (v8.6.0 SARIF import 흡수 동형)
- **LL-fsim-10** — single-PoC threshold 함정 자기 검출 = dry-run 30% 임계 warn-only 격하 (§8.1 자기 정합 자체 검출)
- **LL-fsim-11** — pre-existing PoC 활용 vs 신설 trade-off = poc-02 재검증 (REVISE-2) = 시한 정합 + corroboration arm 확보 양립
- **LL-fsim-12** — commit-block 회피 꼼수 ❌ paradigm = Type 2 carry 정직 표기 (release-readiness 자기 enforcement 본격 입증대)
