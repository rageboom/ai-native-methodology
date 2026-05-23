# Plan — poc-03 chain 4 GREEN 본격 도달 (Type 1.5 second arm)

> 4원칙 §1. 본 plan = `.claude/plans/plan-poc-03-chain-4-green.md`.
> 작성일: 2026-05-23 (session 39차 / v8.14.1 직후 / cooling-off A 변경 + C 채택).
> ★ ★ 갱신 2026-05-23 — **Senior REVISE-3 (confidence 0.74) STRONG-STOP signal 2종 전면 흡수**.
> trigger: 사용자 결단 "이제 진행 하자" → 옵션 C 채택 (Type 1.5 second arm) + REVISE 전면 흡수.
> 관련: DEC-2026-05-23-fsim-005-corroboration-2-genuine §1.4 carry (Type 1.5 second arm) + project_v8140_release_status.md + research dispatch 결과 (F-015 PARTIAL 3종 + Senior REVISE-3 0.74).

---

## 1. 진단

### 1.1 현 상태 (poc-03)

- **source**: `examples/poc-03-realworld-nestjs/source/nestjs-realworld-tmp/` = ★ 본격 NestJS 7.x RealWorld implementation 보유 (lujakob fork / signup + login + articles + profile + 본격 impl)
- **chain 1~3 산출물**: planning-spec + behavior-spec + acceptance-criteria + test-spec + matrix (모두 보유)
- **chain 4 산출물**: ❌ impl-spec.json 부재 / matrix all yellow ("No IMPL linked (chain 4 not done)")
- **test-spec 본질**: framework=jest / 2 TC (TC-USER-SIGNUP-001 + TC-USER-LOGIN-001) / **duration_ms=0** = ★ F-SIM-005 본질 = dry_run_placeholder (Beck-canonical 위배 / 본 v8.14.0 fail_mode enum 본격 적용 대상)
- **stack**: NestJS 7.x + TypeScript + Jest + TypeORM + MySQL (RealWorld spec)

### 1.2 Type 1.5 second arm 본격 자격

| 측면 | poc-05 (Type 1.5 first arm) | poc-03 (Type 1.5 second arm 후보) |
|---|---|---|
| stack | TypeScript + vitest | TypeScript + Jest + NestJS |
| scale | micro (sample-user) | RealWorld (full app) |
| framework | vitest | Jest |
| BE 패턴 | pure function | NestJS DI + decorator + ORM |

★ **framework + scale 횡단** = poc-05 와 본격 다른 arm = Type 1.5 second arm 본격 자격 정합.

### 1.3 본격 도달 path 평가 (★ Senior REVISE-3 흡수 후)

- ★ 기존 source 본격 보유 (lujakob fork / 본격 NestJS impl 7.0.5) = impl 새로 작성 ❌ / 기존 impl 본격 활용
- ★ ★ **(Senior REVISE-1 BLOCKER)** `test/` directory 본격 부재 / `**/*.spec.ts` = 0 matches = **test 자체 신설 의무** = chain 4 GREEN = characterization test paradigm 본격 적용 (Michael Feathers / aspirational test ❌ / commit_hash anchor = pre-existing impl SHA before writing any test)
- ★ ★ **(Senior REVISE-2 HIGH)** sqlite scope expansion 회피 = **mocked Repository fall-back** (`@nestjs/testing` + `getRepositoryToken(User), useValue: mockRepo`) = DB 본격 부재 / safer second-arm corroboration
- ★ ★ **(Senior REVISE-3 MED)** result_hash canonicalization 의무 (timestamp/absolute path 제외 / `{numTotalTests, numPassedTests, numFailedTests, testResults[].name, testResults[].status}` subset hash) — poc-05 paradigm 정합 의무
- ★ ★ **(MED)** argon2 native build Windows + Node 22 risk = pre-flight `npm install --ignore-scripts` smoke 의무

→ poc-05 paradigm 동형 변경 = 기존 impl 활용 + characterization test 신설 + mocked Repository + 실 Jest runner + 5종 물증 (래퍼 스크립트 본격 필요).

---

## 2. 옵션 분석 (3원칙 결단 후보)

### Cluster A — chain 4 본격 도달 path

| 옵션 | 의미 | trade-off |
|---|---|---|
| **A1 (권고)** | **기존 source 활용 + npm install + Jest 본격 실행 + 5종 물증 7 필드 수집** | poc-05 paradigm 동형 / 9일 시한 정합 ★★★ / 환경 의존 (node + npm) |
| A2 | source 본격 rewrite | 시간 비용 ↑ / 9일 시한 위배 / 가치 ❌ (lujakob impl 본격 정합) |

### Cluster B — fail_mode 본격 표기

현 test-spec.json `duration_ms=0` = dry_run_placeholder. v8.14.0 fail_mode enum 본격 적용 = 정직 표기 의무.

| 옵션 | 의미 |
|---|---|
| B1 | 현 test-spec.json 안 `fail_mode: dry_run_placeholder` 표기 (정직) — chain 3 단계 본격 (RED 강도 dry_run) |
| **B2 (권고)** | **chain 4 GREEN 도달 시 expected_outcome="pass" + fail_mode 미사용 (정합) + 실 Jest 본격 실행 result_hash + duration_ms ≠ 0** | chain 4 GREEN 본격 정합 |

### Cluster C — impl-spec 본격 신설

| 옵션 | 의미 |
|---|---|
| **C1 (권고)** | **impl-spec.json 본격 신설** = IMPL-* (2 entry: SIGNUP + LOGIN) / framework=NestJS+TypeORM / source_files = source/nestjs-realworld-tmp/src/user/*.ts / commit_hash (현 source git HEAD) / test_pass_evidence (실 Jest 5종 물증 7 필드) |
| C2 | impl-spec 부재 = chain 4 미도달 (기각) |

### Cluster D — matrix yellow → green

| 옵션 | 의미 |
|---|---|
| **D1 (권고)** | **matrix 4 row 본격 갱신** (yellow → green) + impl_id 본격 추가 + green_count=2 + forward_coverage=1.0 |
| D2 | 부분 green | 의미 부족 |

### Cluster E — release ceremony

| 옵션 | 의미 |
|---|---|
| E1 | v8.14.2 PATCH (additive doc / poc-03 chain 4 산출만) |
| **E2 (권고)** | **v8.15.0 MINOR** — Type 1.5 second arm 본격 달성 + release_eligibility items 본격 갱신 + self_consistency_note paradigm 진화 (Type 1.5 single arm → second arm 본격 / self-bootstrap proof full 도달) |

---

## 3. 2원칙 research dispatch 계획 (lightweight)

### Agent 1: `_base-official-docs-checker` (F-015)
- NestJS 7.x Jest 본격 실행 환경 (node version 정합 / npm install 정합)
- chain 4 GREEN 자격 + 5종 물증 7 필드 본격 의무 (DO-178C bidirectional / poc-05 paradigm 동형)

### Agent 2: `_base-senior-engineer`
- A1 path critique (기존 source 활용 / npm install + Jest 실행 trade-off)
- 환경 의존 risk 평가 (Windows + node 환경 본격 정합 / TypeORM + MySQL 의존 본격 평가)
- STOP signal 후보 (TypeORM database 의존 = Jest 환경 본격 가용 여부)
- LL 자산화 후보

### Agent 3 (skip — industry-case)
본 작업 = poc-05 paradigm 동형 적용. industry-case 사전 검증 v8.14.0 안 완료 (Rust/GCC + Spec Kit + ThoughtWorks + SWE-bench). 본 sprint = paradigm 적용 / case 재검증 불필요. 가벼운 sub-agent 전략 정합.

---

## 4. STOP-3 hard gate (시행 시점)

| # | gate | 측정 |
|---|---|---|
| 1 | poc-03 chain 4 GREEN 본격 도달 | impl-spec.json 본격 신설 + 5종 물증 7 필드 + duration_ms ≠ 0 + result_hash sha256 정합 |
| 2 | fail_mode 정합 | chain 4 GREEN = expected_outcome="pass" + fail_mode 미사용 (실 Jest 본격 실행) |
| 3 | matrix all green | 4 row yellow → green + green_count=2 + forward_coverage=1.0 + backward_coverage=1.0 |
| 4 | release_eligibility 본격 갱신 | corroboration #2 = Type 1.5 ≥ 2 (poc-05 + poc-03 본격 / stack 횡단 framework 횡단) + self_consistency_note paradigm 진화 |
| 5 | workspace test 회귀 ❌ | 694/694 → ≥ 694 |
| 6 | release-readiness 16/16 | 보존 |
| 7 | skill-citation-validator 0 stale | 보존 |
| 8 | breaking 0 | additive only |
| **9** (★ Senior REVISE-1 BLOCKER 흡수) | **characterization test paradigm 본격 적용** | Michael Feathers 정합 / commit_hash anchor = pre-existing impl SHA / aspirational test ❌ / tests assert observed behavior of existing user.service.ts |
| **10** (★ Senior REVISE-2 HIGH 흡수) | **pre-flight smoke 통과** | `npm install --ignore-scripts` exit 0 + `npx jest --listTests` exit 0 / argon2 native build risk 평가 / DB = mocked Repository (sqlite 자체 부재) |
| **11** (★ Senior REVISE-3 MED 흡수) | **result_hash canonicalization** | timestamp/absolute path 제외 / `{numTotalTests, numPassedTests, numFailedTests, testResults[].name, testResults[].status}` subset hash / poc-05 parity audit |

---

## 5. 시행 단계 (commit cadence)

```
C1 (완료)       : plan-poc-03-chain-4-green.md (REVISE 흡수 갱신 포함)
C2 (완료)       : 2-agent lightweight research dispatch (F-015 PARTIAL 3종 + Senior REVISE-3 @ 0.74)
C3 (완료)       : 사용자 묶음 결단 (A1+B2+C1+D1+E2 + REVISE 전면 흡수 + sqlite → mocked Repository)
C3.5 (★ 본 turn 진입) : pre-flight smoke — npm install --ignore-scripts + npx jest --listTests + argon2 native build risk 본격 평가 (STOP-3 gate #10)
C4 (조건부)     : impl-spec.json 본격 신설 BEFORE characterization test 신설 — commit_hash = pre-existing impl SHA 본격 anchor (Senior REVISE-1 의무 / aspirational test ❌)
C5 (조건부)     : characterization test 본격 신설 — Michael Feathers paradigm / mocked Repository / 기존 user.service.ts 본격 behavior assert
C6 (조건부)     : Jest 본격 실행 + 래퍼 스크립트 (5종 물증 7 필드 수집 / result_hash canonicalization / Senior REVISE-3)
C7 (조건부)     : test-spec.json 본격 갱신 (expected_outcome=pass / canonical result_hash / duration_ms ≠ 0)
C8 (조건부)     : matrix.json + matrix.md + matrix.mermaid 본격 갱신 (yellow → green / 4 row / green_count=2 / forward_coverage=1.0)
C9 (조건부)     : flows/sdlc-4stage-flow.json release_eligibility items 본격 갱신 (corroboration_type_distribution.Type_1_5 = 1 → 2 / self_consistency_note paradigm 진화)
C10 (조건부)    : v8.15.0 MINOR release ceremony (plugin.json + package.json + CHANGELOG + DEC + INDEX + STATUS + CLAUDE.md sync)
C11 (조건부)    : commit + tag + push
```

★ ★ **조건부 단계** = C3.5 pre-flight smoke 결과에 따라:
- ✅ 통과 (npm install + jest --listTests exit 0) → C4 진입
- ❌ 실패 (argon2 / TypeScript / Node version 본격 실패) → 사용자 결단 prompt (carry 정직 표기 또는 alternative scope)

---

## 6. 잠재 함정

| 함정 | 회피 방법 |
|---|---|
| npm install 실패 (Node 버전 mismatch) | 사용자 환경 본격 확인 / nvm 본격 활용 |
| TypeORM database 의존 (MySQL 본격 부재) | unit test 본격 isolation / 또는 sqlite in-memory 본격 활용 / 환경 부재 시 carry 정직 표기 |
| Jest 실행 시간 ↑ | timeout 본격 cap / 부분 GREEN 도달 후 carry |
| §8.1 자기 정합 (단일 PoC 과적합) | poc-05 + poc-03 stack 횡단 + framework 횡단 ≥ 2 PoC 본격 |
| F-SIM-016 (Semgrep Windows MSYS2) 재발 | 본 작업 = Jest 환경 / Semgrep 무관 |
| 14차 retract pattern | 본 작업 = additive only / breaking 0 |
| commit-block 회피 꼼수 ❌ | 실 Jest 본격 실행 / dry_run_placeholder ❌ / 5종 물증 7 필드 본격 |

---

## 7. Lessons Learned carry (사후 자산화 후보)

- **LL-fsim-14** — Type 1.5 second arm 본격 달성 paradigm = self-bootstrap proof full (Rust/GCC Stage 3 identity 완전 동형)
- **LL-fsim-15** — poc-05 paradigm 동형 적용 = stack 횡단 (framework 횡단 = vitest + Jest / scale 횡단 = micro + RealWorld)
- **LL-fsim-16** — chain 4 GREEN 본격 도달 = 기존 impl 활용 + 실 runner 본격 실행 + 5종 물증 7 필드 (re-impl ❌ paradigm)

---

## 8. 본 plan 의 본 paradigm 정합

본 plan = v8.14.0 Type 분류 3계층화 paradigm 의 **Type 1.5 second arm 본격 달성** path. 도달 시:
- F-SIM-011 패러독스 진정 해소 본격 = single arm → second arm 본격 (self-bootstrap proof full)
- v8.14.0 self_consistency_note 정직 표기 가능 ("Type 1.5 second arm 본격 달성 / Type 2 = carry 잔존")
- release_eligibility items[1] corroboration_type_distribution = Type_1_5: 2 본격 (single → second arm)
- §8.1 strict ≥ 2 PoC corroboration 본격 정합 (Type 1.5 ≥ 2 / Type 1 보존)

도달 실패 시:
- Type 1.5 second arm = carry 잔존 (deadline 없음)
- v8.14.0 paradigm 보존 (Type 1.5 single arm + Type 1 partial)
- 14차 retract pattern 회피 (작업 부분 진행 시 작업물 carry)

---

## 9. ★ ★ ★ 본 sprint 본격 종결 — Senior STRONG-STOP-2 입증 + carry 정직 표기 (2026-05-23 추가)

### 9.1 시행 결과 (C3.5 pre-flight smoke)

| 단계 | 결과 |
|---|---|
| Node v22.11.0 ✅ + npm 10.9.0 ✅ | 환경 본격 가용 |
| `**/*.spec.ts` 실측 | ★ ★ **1 spec 본격 발견** (`./src/tag/tag.controller.spec.ts`) — Senior "0 matches" claim 사실 정정 (LL-fsim-11 본격 재입증) / 단 SIGNUP+LOGIN 영역 spec ❌ = characterization test 신설 의무 유효 |
| `test/` directory | ❌ 부재 (Senior 정합) |
| `npm install --ignore-scripts` | ★ ★ **본격 fail** — npm error "Exit handler never called" / Windows + npm 10 + 2020 deps environment-dependent paradigm |
| node_modules 본격 부분 install | dependency tree 일부만 install / **jest 본격 install ❌** |
| `npx jest --listTests` | ❌ "jest 본격 인식 불가" |
| pre-flight smoke gate #10 | ❌ **FAIL** |

### 9.2 Senior STRONG-STOP-2 본격 입증

Senior REVISE-2 HIGH critique = "argon2 native build Windows + Node 22 = likely install failure" + "sqlite scope expansion 9일 시한 비현실 / mocked Repository fall-back 권고". 본격 입증 = argon2 자체 진입 전 npm install 본격 fail = environment-dependent risk **사실 정합**.

### 9.3 paradigm 정합 결단 (사용자 옵션 B 채택)

- **poc-03 chain 4 GREEN = ★ deadline 없는 carry 정직 표기** (commit-block 회피 꼼수 ❌ paradigm 본격 입증 = LL-fsim-12)
- **Type 1.5 second arm = ★ jurisdictional carry** (poc-03 환경 의존 / poc-04-mini React + poc-02 source clone = 다른 carry 후보)
- **v8.14.0 + v8.14.1 paradigm 본격 보존** (Type 1.5 single arm + Type 1 partial + Type 1.5 second arm carry + Type 2 carry)

### 9.4 LL 자산화 (4종 / LL-fsim-14~17)

- **LL-fsim-14** — Senior 사실 검증 보강 paradigm **2회 재발** (v8.14.0 poc-02 source empty + 본 sprint poc-03 npm install fail) = LL-fsim-11 본격 paradigm 입증 확장
- **LL-fsim-15** — pre-flight smoke = ★ STOP-3 hard gate 의무 paradigm (npm install + native build risk 본격 검증 = C4 진입 전 의무 / 14차 retract pattern 회피 본격 정합)
- **LL-fsim-16** — 6년 전 OSS fork (NestJS 7.0.5 / 2020 release) = environment-dependent risk 본격 (argon2/sqlite3 native build + npm 10 strict peer deps + TS 3.x outdated) — F-SIM-016 (Semgrep Windows MSYS2) 와 paradigm 동형
- **LL-fsim-17** — commit-block 회피 꼼수 ❌ paradigm 본격 작동 검증 (LL-fsim-12 재입증) = pre-flight fail 시 carry 정직 표기 본격 선택 = paradigm maturity signal

### 9.5 본 sprint paradigm 가치

본 sprint = paradigm full proof 본격 미도달이나, **paradigm enforcement 본격 입증대 = 가치 본격 ★★★**:
- Senior STRONG-STOP signal 본격 작동 + 사용자 결단 변경 흡수 = paradigm self-correction 본격 입증
- pre-flight smoke = STOP-3 gate #10 신설 paradigm 본격 자산화
- commit-block 회피 꼼수 ❌ paradigm 본격 재입증 (LL-fsim-12 + LL-fsim-17)
- v8.14.0+v8.14.1 paradigm 안정점 본격 보존 (14차 retract pattern 회피)

### 9.6 차기 session carry path (deadline 없음)

| Carry | 사유 | 진입 후보 |
|---|---|---|
| **poc-03 chain 4 GREEN** | npm install environment fail | Docker / Node 14.x downgrade / 6년 전 deps modernize (별 sprint) |
| **poc-04-mini React chain 4 GREEN** | FE 트랙 (poc-05 vitest 와 동일 framework / scale 횡단 만) | poc-04-mini source 환경 사전 사실 검증 의무 |
| **poc-02 Spring Boot 3 chain 1~4** | source clone 의무 / 가장 무거운 work-unit | 사용자 결단 |
| **Type 2 axis** | 외부 사용자 / OSS 채택 트리거 의존 | 트리거 대기 |
