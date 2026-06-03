# DEC-2026-06-03-living-graph-resync-cmd

> ★ v12.2.0 MINOR release SSOT. dep-graph Loop A 동기화의 lazy 재계산 슬라이스 (A-lazy-cmd) — `chain-driver resync-graph` 신설. v12.1.0(B-minimal / stale 표시)의 짝.
> 상태: **승인 + 시행 완료** (2026-06-03). 4원칙 = plan-living-dep-graph → 3-agent research(직전 라운드 재활용) + Senior 설계리뷰 0.84 → 사용자 결단 chain: "1"(의도② 자동 동기화 pursue) → "방식2(stale 표시 + lazy 재계산) 이렇게 하자"(per-write 자동 거부 / lazy 채택 명시 승인).

**작성일**: 2026-06-03

**relates to**:
- `DEC-2026-06-03-living-graph-a1-surface.md` — v12.1.0 B-minimal(stale 표시) / 본 DEC 가 그 짝(lazy 재계산). 둘이 "stale 표시 + lazy 재계산" 한 쌍.
- `DEC-2026-06-01-living-dep-graph-loops.md` — Loop A v1 / `DEC-2026-06-03-s2-...` §3 carry `C-living-graph-autotrigger` 의 두 번째 슬라이스.

---

## 0. 한 줄 요약

의도② "프로젝트 변경이 그래프에 담긴다"의 **lazy 재계산** 절반을 `chain-driver resync-graph` 로 구현. B-minimal STALE 배너의 nudge → **한 명령 재합성**(8-flag traceability-matrix-builder 위임). ★ **per-write 자동 재합성(A-full) = Senior REJECT**(quadratic·fixture / research stale+lazy>즉시덮어쓰기) — 사용자 "방식2" 명시 승인.

## 1. 결단 — A-lazy-cmd (Senior 0.84 / 사용자 "방식2")

3-agent research(공식문서 Nx/Bazel/Turborepo/Sourcegraph + 산업사례) 일관 결론: **"stale 표시 + lazy(use-time) 재계산 > per-change 즉시 덮어쓰기"**. Bazel/Turborepo = 빌드 실행 시 재계산 / Sourcegraph = 주기 polling / per-change 즉시 전체 재계산 ❌.

옵션 평가(Senior):
- **A-full** (PostToolUse 전체 재합성): **REJECT** — PostToolUse stateless·debounce 불가 → 매 편집 전체 재합성 = quadratic 함정(산업사례 명명) + gate-class auto-write + fixture 오염 HIGH.
- **A-lazy-cmd** (`resync-graph`): **채택** — research stale+lazy 정합 / verdict-free·비-gating / caller cwd 만 write = fixture 오염 없음 / B-minimal STALE 배너가 정확한 nudge = P0 소비 짝.
- **A-session-lazy** (SessionStart auto-resync-if-stale): DEFER — auto-write → poc-14 같은 corpus 면 repo-self 가드 필요 + ≥2 도메인.
- **C** (자동 apply-drift): DEFER — drift 소비자 thin / committed-path fixture 가드 부재.

★ **Senior 결정적 발견**: scope manifest 는 chain 입력 경로(discovery/behavior/…)를 **모름**(`sync_state.sync_sources` = canonical 5 portability deliverable 만 / work-unit.js:21-33). 그래서 본 슬라이스의 진짜 작업 = **"그래프에게 자기 입력이 어디 있는지 가르치는" convention 입력-탐색**(트리거 배선 아님).

## 2. 시행 (`chain-driver/src/cli.js cmdResyncGraph`)

1. **convention 입력-탐색**: outputDir = 기존 artifact-graph.json 위치 우선(없으면 `.aimd/<scope>` → `.aimd/output` → `.aimd`). 그 dir 의 well-known chain 6 파일(`discovery-spec/behavior-spec/acceptance-criteria/task-plan/test-spec/impl-spec`) 존재분만 builder flag. analysis/aspect = matrix-builder 가 outputDir scan.
2. **위임**: `traceability-matrix-builder --graph --previous-graph <현재> --out-dir <outputDir> --scope-id … --repo-root …` 를 plugin 상대경로(`../../traceability-matrix-builder/src/cli.js`)로 `execFileSync('node', …)` spawn (cross-package import 회피 = methodology 컨벤션 / 전체 재합성 = proven path 재사용 / 증분 ❌). propose·deprecated carry-over(graph-synthesizer:746-769).
3. **caller cwd 만 write** / verdict-free / 비-gating / 단일 도메인 안전.
4. **graceful 거부**: behavior+acceptance 부재(analysis-only / migration-start)면 exit 3 + "그래프 없음" 정직 안내(DEC-2026-06-03 §1.1: migration-start = 엣지 0). matrix-builder exit 1(coverage red)은 그래프 write 완료 후이므로 resync 성공(exit 0)으로 처리.
5. **watch-item #1**: `N/6 stage 입력 (…) coverage` 라인 노출 = silent under-synth 방지(날조 ❌).

## 3. 정직한 범위 / DEFER
- 이건 **on-demand "한 명령" lazy 재합성**이지 per-write 자동이 아님(의도적 / §1 근거). mtime over-report 시 불필요 invoke 가능하나 수동이라 tolerable.
- **DEFER 유지**: A-session-lazy(SessionStart auto-resync = auto-write 가드 + ≥2 도메인) · A-full(REJECT) · C(자동 apply-drift = consumer+guard 선행) · B2-full(per-scope 자동주입) · content-hash freshness 정밀화.

## 4. 검증 (no-simulation / 실 CLI·실 그래프)
- 새 통합 test 4 (`resync-graph.test.js` / real cli.js spawn → 내부 matrix-builder 재-spawn): 정상 5/6 재합성+coverage 라인 / 재실행 carry-over 표기 / analysis-only graceful exit 3 / dry-run no-write.
- **2 distinct 도메인 corroboration (§8.1)**: RealWorld 실 `resync-graph` → nodes=116/edges=173(coverage-red S2 scope → exit1→0 정상) + ecommerce 실 `resync-graph` → 6/6 stage carry-over / nodes=138/edges=202 / matrix 30 green. dogfood = repo 밖 scratch(repo 무오염).
- workspace **1050 pass/0 fail**(+4) + release-readiness **30/30** + version 3-way 12.2.0 + CLAUDE/README sync(check10/29) / breaking 0.

## 5. carry
- **C-living-graph-autotrigger 잔여** — A-session-lazy(자동 1회 재합성 / repo-self 가드 + ≥2 도메인) · C(자동 apply-drift = consumer+guard). 능동 착수 ❌.
- **content-hash freshness 정밀화** — mtime → file SHA(clone over-report·불필요 resync 해소).
- **의도③** — navigate 스펙 본문/what-if/NL 라우팅. **의도①④** — codegraph 코드축 통합(C-codegraph-migration-role) / ast_symbol 앵커.

## 6. paradigm 정합
- **재발명 ❌** — 기존 결정론 백엔드(traceability-matrix-builder synth) 위임 + 입력-탐색 glue.
- **self-referential corrective drift 회피**: P0(동기화 루프) 실 prod 가치 진전 — stale 표시(v12.1.0)+lazy 재계산(v12.2.0) 한 쌍 완성. 점검(워크플로우 4-의도 감사)에서 도출된 격차 해소.
- **no-simulation**: 실 CLI·2 distinct 실 그래프(RealWorld+ecommerce) / persona ❌.
- **§8.1 strict**: gate-class(A-full/C/A-session-lazy) DEFER / cmd-class(lazy, verdict-free) ship + 2 distinct 도메인 corroboration.
- **사용자 결정 gate** (4원칙 3): "1"(pursue) → "방식2"(lazy 채택 / per-write 자동 거부) 명시 승인 후 시행.
