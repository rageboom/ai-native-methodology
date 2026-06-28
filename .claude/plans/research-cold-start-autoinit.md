# research — D3b manifest 재수화 (2원칙)

> plan-cold-start-autoinit.md 동반. Senior 재검토 + 산업사례 병렬(가벼운 전략). official-docs hook write 동작은 직전 라운드(research-cold-start-gap.md §1)에서 검증 완료 재사용.

## 1. Senior 재검토 — 수정 후 GO (load-bearing 2)

- **Q1 재프레이밍 ✅**: state.json gitignore(외부효과 0·완전가역) → reconcile=lockfile/terraform-refresh급 유도(결정 ❌). 직전 v0.82.0 mutation 우려 해소. 단 auto-write 는 manifest 만의 결정론 함수여야(아래 Q4).
- **Q2 멀티 scope SOFT-STOP**: 최근 updated_at 자동선택 = 작성자 머신 기준 → cloner 무관 scope 오복원 + branch-guard/skip-ahead(cli.js:1954) 오작동. → **single-scope 만 자동 / 멀티는 `--scope` 명시**.
- **Q3 analysis=complete**: 관측 사실 아님 — initScopeChainState(state-store.js:335) 하드코딩 규약. "init parity" 로만 프레이밍(analysis 증거 주장 ❌).
- **Q4 STRONG-STOP (진짜 블로커)**: `next` manifest 동기화(cli.js:668-700)는 stage status + current_stage 만 — `blocked`/`block_reason`/`last_gate`/`current_task` 미보존. manifest ≠ 완전 SSOT. → BLOCKED 프로젝트 clone 이 조용히 unblock 복원 = enforcement 구멍. **fix: blocked=false 강제 + lossy 정직 surface 의무**.
- **Q5 §8.1 BLOCKED**: `git ls-files **/scopes/**/manifest.json`=0 — 커밋 PoC 에 scope manifest 전무. plan 전제 거짓. → scratchpad 실 manifest 생성 corroboration(방안 A).
- 네이밍: `reconcile` ↔ `lift --reconcile` 충돌 → `rehydrate`.

## 2. 산업사례 — 자동 재생성 강력 지지

| 도구 | 패턴 | 신호 |
| --- | --- | --- |
| npm/pnpm lockfile | 로컬 자동재생성(silent) / CI frozen=error | 맥락분기 + 로컬 자동 = 표준(지지) |
| Bazel/Gradle cache | miss 자동재계산 + 1줄 요약 | 자동+투명 1줄 통지 충분(지지) |
| IntelliJ index | 없으면 자동재빌드 + balloon | 자동+비차단 통지(지지) |
| Terraform refresh(구) | 자동 silent state 갱신 → 데이터 유실 → 폐기 | **반례**: 실패=외부현실 divergence+검토생략. 우리 커서=순수유도(현실무관)라 해당❌. 단 manifest 손상 시 에러 가드(C1b) |

→ 종합: SSOT→파생 자동재생성 = 업계 표준(npm/Bazel/IntelliJ). 우리 설계(single-scope 자동 + 투명 surface + scope0 미실행 + manifest손상 에러)는 정렬. "동의 없는 mutation" 논란보다 "당연한 tool 행동"에 가까움.

## 3. plan 반영
- C1: 3-mode(none/ambiguous/single) + lossy 플래그 + C1b manifest 무결 가드.
- C3: single 자동 / ambiguous surface-choice / none cold-start / corrupt 에러.
- 네이밍 `rehydrate`. §8.1=방안 A(scratchpad 실 manifest).
