# DEC-2026-06-17-semgrep-local-security-ruleset

> **Semgrep 기본 룰셋을 사내망에서 로컬화** — `semgrep.dev` 룰 레지스트리(`p/owasp-top-ten`)가 사내 SSL 검사 프록시에 가로채여 fetch 실패(F-DOGFOOD-015 동형 / 윤주스 PC 재현)하는 문제를, 벤더 트리에서 **전 언어 security 카테고리만** 추린 로컬 팩 `tools/semgrep-rules-security/`(1386 룰) 신설 + runner 기본 ruleset 전환으로 해소. `--ruleset` override 무변경. DEC-2026-06-11 §4 carry 종결.

**일자**: 2026-06-17
**카테고리**: 결함 수정 + 본체 격상 (Tier 1 도구 사내망 운영가능성 / no-simulation 정합)
**상태**: 승인 — 사용자 결단 ("이대로 진행" / 룰셋 스코프 = A. 전 언어 security-only 명시 확정)
**Trigger**: 윤주스 PC(사내망)에서 "semgrep 관련 오류" 진단 요청 → SSL 레지스트리 fetch 실패 실측 재현
**버전**: plugin.json 0.54.0 → **0.55.0 MINOR**

---

## 1. 배경 (실측 진단)

| 확인 | 결과 |
|------|------|
| 기본 config `--config p/owasp-top-ten` (runner.js) | 사내 SSL 검사 프록시가 `semgrep.dev` 가로챔 → `SSLError: CERTIFICATE_VERIFY_FAILED` → semgrep exit 7(invalid/missing config) → runner `scanFailed` → exit 5 |
| `curl semgrep.dev` / PyPI / pythonhosted | ✅ 도달 (시스템/프록시 CA 신뢰) — Python `requests`(certifi)만 사내 root CA 미신뢰로 실패 |
| 막힌 곳 | **`semgrep.dev` 룰 레지스트리 단 하나** (바이너리 설치 PyPI 경로는 정상) |
| 네트워크 균일성 | 사내망 전 PC 동일 SSL 검사 → 모든 fresh PC 동일 실패 (룰 캐시도 비어있음 실측) |
| 전체 벤더 트리 `--config .` | exit 7 (pro-only·비룰 yaml 혼입 / semgrep 은 깨진 룰 skip 불가) → **security-only 큐레이션 필수** |
| security-only 큐레이션 1386 | **exit 0** — 정상 보안 finding (328 룰 언어매칭 실행) |

= "윤주스 PC 는 괜찮다"는 **스캔 미실행 착시** — 실제 스캔 시 본 PC 에서도 동일 SSL 실패 재현. 환경 발산 아닌 **사내망 균일 실패**.

## 2. 결정·시행

### ① 로컬 security 팩 신설 (`tools/semgrep-rules-security/`)

- 벤더 트리(`tools/semgrep-rules/` 2178)에서 **전 언어 security 카테고리만** 추린 단일 팩 (1386 룰 / 구조보존 / 5.7M).
- 스코프 = 사용자 확정 **A. 전 언어 security-only** — owasp 의도 보존(owasp 메타 1493) + track-agnostic(Java legacy·JS/TS modern 무관) + semgrep 언어 자동필터(타깃 외 룰은 로드만, 스캔 ❌). (vs 전체 2178 = exit 7 / vs 타깃언어만 ~400 = track-agnostic 양보 → 기각)
- **생성 스크립트** `scripts/build-semgrep-security-pack.js` — 결정적·네트워크 0 재조립(멱등 / test·fixtures 제외 / 구조보존 = rule-id 충돌 회피). `--verify` 시 semgrep on PATH 면 smoke 스캔으로 config 유효성(exit 0/1) 확인(no-simulation / 부재 시 honest skip). 산출물 커밋(derived artifact / lockfile 격).

### ② runner.js 기본값 전환

- `SemgrepPlugin` 기본 ruleset `p/owasp-top-ten` → `SEMGREP_SECURITY_PACK_DIR`(`PLUGIN_ROOT/tools/semgrep-rules-security` / 기존 PLUGIN_ROOT 규약 재사용).
- `--ruleset`(명시 override) + `--extra-rules` 경로 **무변경** — 레지스트리·per-language·custom 룰 그대로. 팩 부재 시 = semgrep exit 7 → scanFailed → exit 5 (정직 실패 / 레지스트리 silent fallback ❌).

### ③ skill 문서 registry 하드코딩 제거

- `analysis-aspect-static-security` + `analysis-error-mapping` SKILL.md 의 `--ruleset p/owasp-top-ten` → 기본값(로컬 팩) 사용. registry 예시는 "registry 접근 가능 환경에서만 — 사내 SSL 환경은 fetch 실패 exit 7" 로 강등 명시.

## 3. 검증 (STOP)

- **static-runner 49→50 테스트 GREEN** — 신규: ① 기본값(미지정)=로컬 팩 경로 단언(레지스트리 회귀 ❌) ② 출하 가드(팩 존재 + rule 수 ≥1000 / 누락 시 default exit 7 silent break 차단).
- **사내망 실측(no-simulation / 본 PC = 사내망 SSL 환경 그 자체)**: 기본값 `cli.js` 호출 = `semgrep.dev`/SSL 접근 흔적 **0**(네트워크 0) + `runs: 1 (ok:1, failed:0)` + `real_tool:true` / `scan_failed_count:0` / `scan_status:ok` + 328 룰·3 findings. error-mapping(`--extra-rules`) 경로도 통과(220 룰·1 finding).
- 3 SSOT 버전 동기화(`package.json` + `.claude-plugin/plugin.json` + parent `CLAUDE.md`) 0.55.0.

## 4. 정직 carry

- **baseline 재수립 가능성** — `p/owasp-top-ten`(서버 큐레이션) ≠ security 디렉토리 1386(더 넓음 / 로컬 팩엔 owasp 매니페스트 부재 → 1:1 재현 불가). 기존 semgrep baseline 쓰던 곳은 재수립 필요할 수 있음.
- **PATH carry(직교 / 본 scope 외)** — pipx·brew 없는 fresh PC 의 `pip3 --user` → `~/.local/bin` 미등록 가능. 본 룰 fix 와 별개(hook 경고 기존 유지).
- **full tree(2178) 유지** — SKILL per-language override 예시 의존 → 보안 팩은 additive. 전체 트리 출하 제외는 별도 검토(별도 DEC 후보).
- **§8.1** — 본 fix 는 환경-운영가능성 결함 수정(도메인 일반화 무관 / 사내망 = 주 타깃 환경 직접 실측). baseline 커버리지·full-tree 제외는 ≥2 환경/도메인 corroboration 후 별도 격상.

## 인용

- DEC-2026-06-11-epfemis-dogfood-p0-fixes §4 (carry: "레지스트리 기본 ruleset 로컬화 = 별도 DEC 후보") — 본 DEC 가 종결
- finding-ledger F-DOGFOOD-015 (사내망 SSL exit 2 / false-health)
- DEC-2026-06-06-tool-allowlist-pmd-only + R19 (Tier 1 in-plugin / no-simulation)
- feedback_no_static_tool_simulation + feedback_diagnose_before_design_check_existing (기존 자산 실측 = 벤더 트리 이미 동봉 / 큐레이션 필요만 추가)
