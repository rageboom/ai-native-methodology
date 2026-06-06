# DEC-2026-05-17-chain-harness-e2e-simulation-audit

> chain harness 4-stage e2e 데스크 워크스루 감사 — 2 PoC cross-validation / F-SIM-001~011 정식 등재 / P0 plan + 4원칙 §2 research 후속 / 시행 ❌ (본 결단 = audit + log + plan 단계까지).

## 1. 배경

사용자(2026-05-17) "시뮬레이션을 해보고 싶다 — 실제 분석부터 구현까지 모든 단계에서 플러그인의 목표에 맞게 모두 적용되는지 비효율 혹은 개선점은 없는지 확인". no-simulation 정책과 충돌 회피하여 **데스크 워크스루 감사** 모드 채택 + **대표 PoC 1종** (poc-05-sample-user-register / chain harness validated reference cycle / sub-plan-6 / §8.1 strict 7/7 #7) + **비효율·개선점 발굴** 우선순위.

1차 감사 후 사용자 "3" 선택 → **§8.1 단일 PoC 과적합 회피**를 위해 poc-03-realworld-nestjs(retrofit corroboration #2 / NestJS RealWorld scale — stack·scale 모두 상이)에서 F-SIM 패턴 재현 여부 교차검증.

이후 사용자 "모두 실행 해줘" → ① F-SIM finding 정식 등재 + ② P0 plan + 3-에이전트 research + 묶음 go/stop. 본 결단 = ①과 ②의 plan 단계까지 (시행은 별도 결단).

## 2. 감사 방법

| 단계              | 도구 / 산출                                                                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 산출물 정독       | poc-05 분석 stage 입력 + chain 1~4 산출물 + matrix + run-log + README + legacy source = 11 file 전수                                                        |
| 산출물 정독       | poc-03 analysis stage + chain 1~3 산출물 + matrix = 6 file (chain 4 부재)                                                                                   |
| 코드 ground-truth | `tools/traceability-matrix-builder/src/builder.js` (severity 산정 로직) / `tools/chain-coverage-validator/src/validator.js` (cross-ref 검증 로직) 직접 grep |
| flow 정합성       | `flows/sdlc-4stage-flow.json` + `flows/{planning,spec,test,implement}.phase-flow.json` 정독                                                                 |
| cross-validation  | poc-03 동형 패턴 재현 / 악화 여부 코드 출력 기반 결정적 비교                                                                                                |

**시뮬레이션 ❌** — 모든 finding 은 ground-truth(코드 또는 산출물) 인용 + 결정적 grep 출력 기반. AI persona 흉내 / 가상 도구 실행 부재.

## 3. 발견 (요약)

**11 finding (F-SIM-001~011)** — `methodology-spec/finding-system.md` § Body Finding Ledger — F-SIM namespace 등재.

| ID  | severity | 1줄 요약                                                     | 2 PoC 재현                                |
| --- | -------- | ------------------------------------------------------------ | ----------------------------------------- |
| 001 | high     | critical AP 가 무경고로 chain 관통 → matrix "critical/green" | ✅ 악화 (poc-03 = 2건 silent omit)        |
| 002 | high     | matrix severity = AC.MoSCoW 만 / BR·AP severity 전파 부재    | ✅ 동형 (builder.js:56,67,77)             |
| 003 | high     | chain-coverage-validator 가 cross-ref 경로 resolve 미검증    | ✅ 악화 (poc-03 = 2 경로 + 컨벤션 불일치) |
| 004 | medium   | matrix 에 BR 축 부재 (UC→BHV→AC→TC→IMPL 만)                  | ✅ 동형                                   |
| 005 | high     | RED 의 의미적 약함 (import-fail / dry-run placeholder)       | ✅ 악화 (poc-03 = 테스트 미실행)          |
| 006 | high     | gate #4 no-sim 강제 도구 우회 (--dry-run + 수동 사이드채널)  | poc-05 only                               |
| 007 | medium   | chain 산출물 ceremony tax + meta 4~5중 verbatim              | ✅ 동형                                   |
| 008 | medium   | 산출물 meta 에 방법론 진화 서사 혼입                         | ✅ 악화 (poc-03 = version skew)           |
| 009 | medium   | gate intervention_log 영속 비일관                            | poc-05 only                               |
| 010 | medium   | 기준 PoC README/run-log 가 자기 산출물과 drift               | poc-05 only                               |
| 011 | high     | §8.1 "≥2 PoC corroboration" 이 최강 claim 에서 사실상 n=1    | ✅ 본질적                                 |

**공통 뿌리 1개**: "본 방법론은 *링크 존재*는 결정적 강제 / *링크가 비즈니스 사실을 보존하는가*는 미강제" — F-SIM-001/002/003/004/005 동일 뿌리.

**§8.1 단일 PoC 과적합 회피 결과**: 교차 가능한 7개 finding **전부 2 PoC 동형 재현** + 4개 RealWorld 에서 악화 + 단일 PoC 특이 = 0 → **방법론 구조 결함 확정**.

## 4. 결단

### 4.1 본 결단 scope ( 2026-05-18 갱신 — 사용자 승인 후 P0 시행 본격 진입)

- ✅ F-SIM-001~011 `methodology-spec/finding-system.md` Body Finding Ledger F-SIM namespace 정식 등재
- ✅ 본 결단 기록 + `decisions/INDEX.md` 등재
- ✅ P0 plan 작성 `.claude/plans/plan-fsim-p0.md`
- ✅ 3-에이전트 research 병렬 dispatch 완료 (`.claude/researches/research-fsim-p0.md` / Senior conf 0.82 GO + Official-docs F-015 ×5 + Industry-case 3 Topic × 3 Case)
- ✅ D9 §8.1 자기정합 ≥3 PoC pre-sweep 시행 — F-SIM-002/004 = 3 PoC 동형 재현 (BE+FE 횡단 ) / F-SIM-003 = BE 2 PoC (BE-track v7.0.0 collateral) / LL-fsim-04 자산화 의무 해소
- ✅ 사용자 묶음 결단 D1~D9 승인 (2026-05-18 "권고안 그대로 시행")
- ✅ D8 F-SIM-005 ledger 본문 Beck-canonical 반영 수정 (compile-import-fail = valid RED / per-TC granularity 잔존 본질)
- ⏳ P0 코드 변경 (F-SIM-002/003/001/004/011) — **본 결단 안 본격 진입**
- ⏳ STOP-3 9-gate validation + v8.3.0 MINOR release

### 4.1.1 결단 합의 D1~D9 요약 (research 권고 → 사용자 승인)

| D      | 합의                                                                                                                                    | 비고                                                              |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| D1     | 묶음 1-session MINOR                                                                                                                    | Senior GO 0.82 / 공통 뿌리 1개                                    |
| D2     | `--strict-paths` flag warn default + release-readiness #14 baseline ratchet                                                             | LL-i-55 함정존 회피 / v+1 default 전환                            |
| D3     | poc-03 critical AP 2건 → `out_of_scope.ap_id_refs` carry                                                                                | retrofit corroboration #2 본질 정합                               |
| **D4** | **Senior REVISE B 전환** — poc-03 격하 + 신규 PoC corroboration #2 별도 P1 plan + **P0 commit 본문 P1 deadline commit-block 명시 의무** | plan 권장 C 거부 — "정의 강화 ≠ corroboration 회복" 패러독스 회피 |
| D5     | F-SIM-005 P0 분리 (P1)                                                                                                                  | blast 1.5~2× 폭증 회피                                            |
| D6     | MINOR + cooling-off 생략 (사용자 명시 위임)                                                                                             | additive 위주 / D2 flag breaking 회피                             |
| D7     | STOP-3 9-gate (#15 matrix visual diff + #16 methodology body self-bootstrap)                                                            | renderer 회귀 / self-bootstrap                                    |
| D8     | F-SIM-005 ledger 표현 수정 (Beck CONTRADICTS)                                                                                           | F-015 Claim C — Kent Beck 원저 "doesn't even compile at first"    |
| D9     | §8.1 자기정합 ≥3 PoC pre-sweep 시행                                                                                                     | LL-fsim-04 자산화 해소                                            |

### 4.1.2 P1 deadline commit-block (D4 strongest concern 흡수)

**P0 v8.3.0 commit 본문 + 본 결단 §4.1 에 다음 deadline 명시 의무**:

> **P1 corroboration #2 신규 PoC chain 4 GREEN 도달**: F-SIM-011 자기정합 회복 의무 — release_eligibility #2/#6/#7 강화 후에도 corroboration #2 = chain 4 GREEN 도달 PoC 부재 시 §8.1 strict 7/7 자기충족 불가. **P1 deadline = v8.3.0 + 14일 (2026-06-01)** — 신규 PoC #14 또는 #15 chain 4 GREEN 도달 commit 의무. 미시행 시 v8.3.0 release_eligibility 강화는 **정의 강화만 / 사실 미충족 패러독스 잔존** (Senior strongest concern). P1 결단 = `decisions/DEC-2026-05-?-fsim-p1-new-corroboration.md` 별도 결단 + `.claude/plans/plan-fsim-p1-new-corroboration.md` 별도 plan 의무.

### 4.1.3 plan 수정 의무 (research deltas 반영 2026-05-18)

- §3.1 F-SIM-002 권위 인용: DMN → ISO 26262 Part 9 ASIL inheritance + IEC 62304 Class A/B/C propagation 교체 (F-015 Claim B DMN 약함)
- §3.5 F-SIM-011: Option C → **B** 전환 + P1 deadline commit-block 명시
- §4 STOP-3 7 gate → 9 gate (#15 matrix visual diff / #16 self-bootstrap)
- §3.2 F-SIM-003 prevalence: BE track v7.0.0 collateral 특이 명시 (FE poc-04-mini = all paths exist / validator universal good 유지)

### 4.2 P0 범위 (별도 결단 대상)

- F-SIM-001 (AP→BR→AC coverage lane) — MINOR
- F-SIM-002 (matrix severity 전파) — PATCH~MINOR
- F-SIM-003 (chain-coverage-validator path resolve) — PATCH
- F-SIM-011 (§8.1 self-consistency) — MINOR

**왜 P0 4종**: 모두 high + 공통 뿌리("의미 누수")의 핵심 4종. 시행 시 5종(F-SIM-001~005) 의미 누수 class 동시 해소 + §8.1 자기정합 회복. F-SIM-004 (medium / matrix BR축) 는 F-SIM-002 와 동반 시행 가능 — P0 추가 후보.

### 4.3 P1/P2 (P0 시행 후)

- F-SIM-005 RED 규약 강화 — F-SIM-011 와 직결 / P0 후 즉시
- F-SIM-006 gate #4 --allow-execute 강제 — release-readiness criterion
- F-SIM-008/009/010 — PATCH 묶음
- F-SIM-007 — PoC 2~3회 누적 후 closed (F-021 §8.1 휴리스틱)

## 5. 4원칙 정합

- §1 깊은 숙지 → 완료 (산출물 + 코드 + flow 전수 정독 / 본 결단 자체)
- §2 3-에이전트 research → **미수행** (P0 본 결단 시 의무)
- §3 사용자 승인 → 본 결단(audit+log+plan) = 사용자 "모두 실행" 위임 안에서 시행. P0 코드 변경 = 별도 묶음 go/stop 의무.
- §4 실패 시 revert + Lessons Learned → N/A (코드 변경 0).

## 6. STOP-3 hard gate (P0 시행 시 의무)

P0 시행 시 다음 결정적 검증 통과 의무 (F-PA / F-MB / 묶음 Q 선례 동형):

1. schema-validator 전 11 PoC 0-regression
2. workspace test 395+ 전부 pass
3. drift-validator 3-way (flows json+mermaid+lifecycle-contract)
4. release-readiness 13/13 ready:true
5. version-check 3-way sync
6. skill-citation-validator 0 stale
7. 본 ledger F-SIM-001~004/011 Status open → resolved 전환 (시행 cycle 종결 표기)

## 7. 메타 / Lessons Learned

- **LL-sim-01** "데스크 워크스루 감사" 도 dogfood 정합 — no-simulation 정책 충돌 ❌ (시뮬레이션 ≠ 시뮬레이션 / AI persona 흉내 vs 실 산출물 ground-truth 정독). 향후 chain harness 자기 검증 cadence 의 1차 도구 후보.
- **LL-sim-02** **§8.1 단일 PoC 과적합 회피 휴리스틱이 자기 검증대(§8.1 strict 7/7) 에 적용 안 됨** — release_eligibility 7항목이 "각 PoC 가 어디까지 도달" 강도 미구분. F-SIM-011 본질. release_eligibility 정의 자체 strengthen 의무.
- **LL-sim-03** chain harness 의 결정적 enforcement 가 "링크 존재"에 머묾 — "링크 의미 보존" 강제는 **br-cross-consistency-validator(v2.5.0)** 가 BR 내부에서만 함. 체인 횡단(BR→AC→TC) 의미 drift 는 사각. v2.5.0 Layer 2 paradigm 을 체인 횡단으로 확장하는 후속 결단 후보 (P0 시행 후).

## 8. 참조

- `methodology-spec/finding-system.md` § Body Finding Ledger — F-SIM namespace
- `.claude/plans/plan-fsim-p0.md` (P0 plan)
- `examples/poc-05-sample-user-register/.aimd/output/run-log.md` (감사 대상)
- `examples/poc-03-realworld-nestjs/.aimd/output/` (cross-validation 대상)
- `flows/sdlc-4stage-flow.json` (§8.1 release_eligibility 정의)
- `tools/traceability-matrix-builder/src/builder.js:56,67,77` (F-SIM-002 single root)
- `tools/chain-coverage-validator/src/validator.js:98-103` (F-SIM-003 single root)
- DEC-2026-05-17-plugin-authoring-mb-audit (F-MB 선례 / 본 cycle 다음 audit-event)
- DEC-2026-05-17-plugin-authoring-file-audit (F-PA 선례 / Body Finding Ledger paradigm)
