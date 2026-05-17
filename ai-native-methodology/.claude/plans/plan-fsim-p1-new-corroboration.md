# Plan — F-SIM P1 (corroboration #2 신규 PoC chain 4 GREEN)

> ★ ★ ★ **deadline 2026-06-01 commit-block** (DEC-2026-05-17-chain-harness-e2e-simulation-audit §4.1.2).
> 본 plan = P0 v8.3.0 commit 본문 P1 deadline commit-block 의무 (Senior REVISE D4 strongest concern 흡수).

## 0. 배경

v8.3.0 = **정의 강화 / 사실 미충족 패러독스 잔존**. release_eligibility `current_corroboration_count_at_required_strength`:
- #1 (≥2 PoC corroboration / L2 strength): **1** (poc-05 only — poc-03 L1 격하)
- #2 (진짜 도구 5종 물증): **1** (poc-05 only — poc-03 dry_run_placeholder)
- #6 (matrix 100% green / L3 strength): **1** (poc-05 only)
- #7 (e2e 1 cycle pass / L2 strength): **1** (poc-05 only)

→ v8.3.0 release_eligibility 가 자기충족 못함. P1 = corroboration #2 신규 PoC chain 4 GREEN 도달 의무.

## 1. 옵션 (Senior REVISE D4 권고 = Option B)

### Option A — poc-03 chain 4 본격 실행 (시간 비용 ↑)

- NestJS impl 코드 작성 (RealWorld 영역) + 진짜 vitest/jest 실행
- 장점: 기존 PoC 자산 재활용 / RealWorld scale corroboration
- 단점: NestJS+TypeORM impl 추가 비용 (수일 단위) / retrofit 본질 외 작업

### Option B (★ Senior REVISE 권장) — poc-03 격하 + 신규 PoC corroboration #2 작성

- 격하: poc-03 = L1 (analysis~chain-3) 명시 / corroboration count 산입 ❌ (v8.3.0 시행)
- 신규 PoC = poc-12 또는 poc-13 활용 또는 poc-14 신설
- 후보:
  - **poc-12-rawsql-userdecided** (현 1 artifact / 미시작) — RawSQL track / 사용자 결정 영역
  - **poc-13-querydsl-userdecided** (현 1 artifact / 미시작) — QueryDSL track / 사용자 결정 영역
  - **신규 poc-14-fsim-corroboration** (chain 4 GREEN 목적 PoC / sample scale — poc-05 패러다임 차용)
- 권장: **신규 poc-14** (sample scale / chain harness 검증 목적 / 시간 비용 최소 — poc-05 mirror + 다른 스택)

### Option C (P0 plan §3.5 권고) — flow 정의만 강화 + 실 PoC 보강 P1 별도

- v8.3.0 시행 = Option C 효과 (flow 정의 강화 완료 / self_consistency_note 명시)
- P1 = Option B 의 신규 PoC 작성 = **본 plan**

## 2. 시행 의제 (사용자 결단 D-P1-1~D-P1-3)

| D | 결단 | 옵션 | 권장 |
|---|---|---|---|
| D-P1-1 | 신규 PoC 종류 | (a) poc-14 신설 / (b) poc-12/13 활용 / (c) poc-03 chain 4 실행 | **(a) poc-14 신설** (sample scale / 시간 최소) |
| D-P1-2 | 스택 다양성 | (a) Spring Boot + JUnit / (b) Python + pytest / (c) Go + testing | **(b) Python + pytest** (poc-05 TypeScript+vitest / poc-14 = Python+pytest = stack 횡단 corroboration) |
| D-P1-3 | scope | (a) 1 UC sample / (b) 2 UC sample (poc-05 mirror) / (c) RealWorld scale | **(b) 2 UC sample** (poc-05 mirror 동형 / cross-PoC comparison 용이) |

## 3. blast radius 예상

- 신규 PoC 1종 (~5 file in input/ + ~5 file in .aimd/output/ + impl)
- LOC ~300~500 (poc-05 mirror)
- 시간: 1~2일 (sample scale)
- breaking 0

## 4. v8.4.0 release 트리거

P1 시행 완료 시 → release_eligibility `current_corroboration_count_at_required_strength` = 2 / 자기충족 회복 → **v8.4.0 MINOR** (P1 corroboration #2 attain).

## 5. 4원칙 정합

- §1 깊은 숙지 → P1 시행 시 본 plan 갱신
- §2 3-에이전트 research → P1 시행 시 의무 (lightweight)
- §3 사용자 승인 → D-P1-1~3 묶음 결단
- §4 revert + LL → 신규 PoC 실패 시 carry 명시

## 6. 참조

- DEC-2026-05-17-chain-harness-e2e-simulation-audit §4.1.2 (deadline commit-block)
- flows/sdlc-4stage-flow.json release_eligibility (corroboration_depth_levels + p1_carry)
- finding-system.md F-SIM-011 + F-SIM-005
- `.claude/plans/plan-fsim-p0.md` (P0 plan / 본 plan 의 전제)
