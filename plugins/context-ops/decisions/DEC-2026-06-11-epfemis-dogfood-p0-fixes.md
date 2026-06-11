# DEC-2026-06-11-epfemis-dogfood-p0-fixes

> **ep-fe-mis 외부 dogfood P0 3건 수정 cycle** — ① analysis 단계 증거 실재성 게이트 신설 (날조 source_evidence hard-block / F-DOGFOOD-014) ② static-runner scan 실패 false-health 차단 (exit 의미론 / F-DOGFOOD-015) ③ probe timeout ≠ 환경 부재 분리 + semgrep 오프라인 env default (F-DOGFOOD-016). 전부 ep-fe-mis 원 재현 시나리오로 fix 검증.

**일자**: 2026-06-11
**카테고리**: 결함 수정 (no-simulation/source-grounded 보증 범위 + Tier 1 도구 정직성)
**상태**: 승인 — 사용자 결단 ("P0 3건 수정 cycle 진행해줘" / 비평 보고서 E 우선순위 1~2 채택)
**Trigger**: 사내 FE 모노레포 ep-fe-mis analysis stage 전체 dogfood (finding-ledger F-DOGFOOD 섹션 + ep-fe-mis `.claude/methodology-critique-report-2026-06-11.md` A1~A3)

---

## 1. 배경 (dogfood 실증 3건)

| # | 실증 | 본질 |
|---|------|------|
| F-DOGFOOD-014 | 날조 source_evidence BR 이 schema/br-cross/aggregator/gate#0 전부 통과 | "source-grounded" 의 실보증 = shape 뿐. analysis-only 는 artifact-graph 부재 → code-pointer-validator 불가 |
| F-DOGFOOD-015 | 사내망 SSL 로 semgrep exit 2 (0 파일 스캔) → runner exit 0 / `findings: 0` / `real_tool` | 실패 스캔이 깨끗한 baseline 으로 둔갑 (false-health — 방법론이 타 영역서 P0 로 다루는 동형) |
| F-DOGFOOD-016 | `semgrep --version` 97.9s (egress 차단 네트워크 대기) → probe ETIMEDOUT → "환경 부재 + pipx install" 오안내 | 정직 신호(exit 3)가 거짓 양성. 주 타깃(사내 환경)에서 체계적 오작동 |

## 2. 결단·시행

### ① evidence-scan (F-DOGFOOD-014 / critical)

- `analysis-extraction-validator --evidence-scan <output-dir> --repo-root <dir>` 신설 (`validateEvidenceExistence`): 산출물 deep-walk → `{file, line}` 페어 수집 → **상대경로 부재 = critical** (fabrication-grade) / **line 범위 밖 = high** / **절대경로 = info** (비이식 정직 표기). 상대경로 해석 = repo-root 우선 + artifact-dir fallback (index 류 `bc_files[].file` 정당 흡수 — dogfood 중 FP 1건 발견·즉시 수정). `findings-*.json` (aggregator 자기 출력) scan 제외. shape 한정 deep-walk = false-positive 억제 (`tool_stdout_path` 류 비대상).
- **gate #0 배선 3곳 sync**: findings-aggregator `REQUIRED_VALIDATORS_PER_STAGE.analysis` (base 4→5) + `buildAnalysisArgs` case + chain-driver `gate-eval.js` REQUIRED.analysis.
- 효과: critical = `validator_critical` **hard-block — `--user-decision go` 거부** (기존 gate-eval 의미론 그대로 탑승 / soft-ack 우회 불가).

### ② static-runner exit 의미론 (F-DOGFOOD-015 / high)

- `Plugin.acceptableExitCodes` — semgrep `[0,1]` (2+ = fatal) / pmd `[0,4,5]` (기존 주석 의미론 명문화). `run()` → `scanFailed` 판정.
- CLI: 실패 run 분리 — findings 집계 제외 + per-run `scan_status` + manifest `real_tool` = "유효 스캔 ≥1" + `scan_failed_count` + **exit 5 신설** ("baseline 사용 금지" 명시).

### ③ probe 분류 + 오프라인 env (F-DOGFOOD-016 / high)

- preflight `ETIMEDOUT` → 신규 `PluginProbeTimeout` (code `PROBE_TIMEOUT` / **exit 6** / "환경 부재 아님 — 재시도/오프라인 env 안내"). ENOENT 류만 `ENV_MISSING` 유지 (무회귀).
- `Plugin.extraEnv` (default 로 깔리고 **사용자 process.env 항상 우선**) — Semgrep `SEMGREP_ENABLE_VERSION_CHECK=0` + `SEMGREP_SEND_METRICS=off` / `probeTimeoutMs` 20s. `augmentEnv(extraDirs, extraEnv)` backward-compatible 확장.

## 3. 검증 (STOP)

- **테스트**: static-runner 35→48 / analysis-extraction-validator 13→19 / findings-aggregator 38+15 / chain-driver 516 — **전부 GREEN** (기존 단언 3곳 base-4→5 갱신 포함 / breaking 단언 변경은 그 3곳뿐).
- **ep-fe-mis 원 시나리오 재현 검증** (외부 repo / 본 repo 커밋 ❌):
  - ① 날조 BR 재삽입 → evidence-scan **critical 1** (실 증거 32건 전부 ok — 파일+라인 검증 통과) → aggregator critical 1 → gate-eval `validator_critical` blocked + **go 거부 (`user_override_rejected: true`)** → 제거 후 clean (critical 0).
  - ② 동일 SSL 실패 재현 → **exit 5** + "scan FAILED — baseline 사용 금지" + manifest `real_tool: false / scan_status: failed`. 정상 스캔(로컬 벤더링 룰) 경로 exit 0 무회귀.
  - ③ 같은 사내망에서 probe 즉시 통과 (96s 대기 소멸 — extraEnv 효과). PROBE_TIMEOUT 분류 = 단위 테스트 입증.

## 4. 정직 carry

- findings-aggregator **implement** 단계의 static-runner stdout(JSON 아님) generic transform = 항상 0 집계 잠복 (pre-existing / 본 cycle scope 외).
- semgrep 기본 ruleset 여전히 레지스트리(`p/owasp-top-ten`) — 벤더링 `tools/semgrep-rules/` 로컬 기본화 = 룰 커버리지 정책 결정 필요 (별도 DEC 후보 / 실패는 이제 exit 5 로 정직).
- F-DOGFOOD-013 (codegraph-coverage 모노레포 거짓엣지 + 채택자 플로우 미배선) = open / 별도 cycle.
- 버전 bump / CHANGELOG / release:check = 사용자 release flow 에 위임 (본 DEC = 코드+테스트+ledger 까지).

## 인용

- finding-ledger.md F-DOGFOOD-013~016 (ep-fe-mis dogfood 섹션)
- ep-fe-mis `.claude/methodology-critique-report-2026-06-11.md` (비평 전문 A1~A10 / E 우선순위)
- DEC-2026-06-06-analysis-exit-gate (gate #0 / REQUIRED.analysis 모체)
- DEC-2026-06-06-tool-allowlist-pmd-only + R19 (Tier 정합)
