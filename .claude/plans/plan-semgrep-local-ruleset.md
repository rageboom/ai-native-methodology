# plan — semgrep 기본 룰셋 사내망 로컬화 (security-only 벤더링 팩)

> 4원칙 §1 plan. 작성 2026-06-17. 트리거 = 윤주스 PC 에서 사내망 SSL 로 `semgrep.dev` 룰 레지스트리 fetch 실패 재현 (F-DOGFOOD-015 동형). DEC-2026-06-11 §4 carry("semgrep 기본 ruleset 여전히 레지스트리 — 벤더링 로컬 기본화 = 룰 커버리지 정책 결정 필요") 종결.

## 1. 배경·문제 (실측)

| 확인 | 결과 |
|------|------|
| 기본 config `--config p/owasp-top-ten` (runner.js) | 사내 SSL 프록시가 `semgrep.dev` 가로챔 → `SSLError: CERTIFICATE_VERIFY_FAILED` → semgrep exit 7(invalid/missing config) → runner `scanFailed` → exit 5 |
| `curl semgrep.dev` | HTTP 200 (시스템 키체인 CA) — Python `requests`(certifi)만 실패 = 사내 root CA 미신뢰 |
| PyPI / files.pythonhosted | ✅ 도달 (프록시 allowlist) → **semgrep 바이너리 설치는 정상** |
| 막힌 곳 | **`semgrep.dev` 룰 레지스트리 단 하나** |
| 네트워크 균일성 | 사내망 전 PC 동일 SSL 검사 → 모든 fresh PC 동일 실패 (캐시 비어있음 확인) |

→ **기본 룰셋만 레지스트리 → 로컬 벤더링으로 전환하면 깨지던 유일 지점 제거.** 룰은 이미 `tools/semgrep-rules/`(2178 yaml, 19MB, git 커밋, `files:["tools"]` 로 출하) 동봉됨.

## 2. 결정된 것 (사용자 확정)

- **룰셋 스코프 = A. 전 언어 security-only (1386 룰)**. (2026-06-17 사용자 결단)
  - owasp 의도 보존(security 카테고리 / owasp 메타데이터 보유 룰 1493) + track-agnostic(Java legacy·JS/TS modern 무관) + semgrep 언어 자동필터(타깃 외 룰 로드만, 스캔 X / 실측 1386 로드 → Java+JS 2파일엔 328 실행).
  - 실측 EXIT 0 / 정상 보안 finding. (vs 전체 2178 = EXIT 7 / vs 타깃언어만 ~400 = track-agnostic 양보 → 기각)

## 3. 설계

### 3.1 패키징 = 커밋형 사전조립 팩 (P1 채택)

`semgrep --config <dir>` 는 디렉토리 재귀 로드(공식 ✓)지만, **깨진 룰 1개라도 있으면 exit 7**(skip 불가) + 전체 repo 엔 pro-only·비룰 yaml 혼입 → **security-only 큐레이션 필수**.

- 신규 디렉토리 `tools/semgrep-rules-security/` — `tools/semgrep-rules/**/security/**/*.{yaml,yml}` 중 `/test|tests|__tests__|fixtures/` 제외분만 **구조 보존 복사**(rule-id 충돌 회피 = flatten ❌). 실측 조립분 = 1386 룰 / EXIT 0.
- **생성 스크립트** `scripts/build-semgrep-security-pack.js` — full tree 에서 결정적 재생성(룰 업데이트 시 재실행). 산출물은 **커밋**(derived artifact, lockfile 격). 빌드/런타임 의존 0 → npm + marketplace(git clone) 양쪽 설치 동일 동작.
- full tree(2178)는 **유지** — SKILL.md 가 `--ruleset .../semgrep-rules/<lang>` per-language override 예시로 참조 + 벤더 provenance. 보안 팩은 **additive**.
- 대안 P2(런타임 `.static-tools/` 조립) = git 중복 0 이나 조립 실패 모드 + 지연 추가 → 재작업 최소화 원칙상 후순위. P3(빌드시 only) = marketplace 설치 무빌드라 깨짐 → 기각.

### 3.2 runner.js 기본값 전환

- `SemgrepPlugin.mandatoryArgs`: `ruleset ?? 'p/owasp-top-ten'` → `ruleset ?? SECURITY_PACK_DIR`.
- `SECURITY_PACK_DIR = join(PLUGIN_ROOT, 'tools', 'semgrep-rules-security')` (PLUGIN_ROOT = runner.js:30-32 기존 규약 재사용).
- 팩 부재 시 = semgrep exit 7 → scanFailed → exit 5 (정직 실패 / 레지스트리 silent fallback ❌). preflight 존재검사 추가 여부는 구현 시 판단.
- `--ruleset`(명시 override) + `--extra-rules` 경로 **무변경** — 사용자가 레지스트리·per-language·custom 룰 지정 그대로.

### 3.3 skill 문서 정합 (registry 하드코딩 제거)

- `skills/analysis-error-mapping/SKILL.md:48` `--ruleset p/owasp-top-ten` → 보안 팩 경로(또는 생략 = 기본값). `--extra-rules error-mapping-missing.yml` 유지.
- `skills/analysis-aspect-static-security/SKILL.md:49` `--ruleset p/owasp-top-ten` 예시 → 보안 팩 경로(생략 = 기본). per-language 예시(42/56)는 대안으로 보존.
- docs/ADR/release-note 의 owasp 참조 = **역사 기록 → 무변경**(과거 결정 서술).

## 4. 영향 파일

| 파일 | 변경 |
|------|------|
| `tools/semgrep-rules-security/**` (신규) | 1386 보안 룰 사전조립 팩 (커밋) |
| `scripts/build-semgrep-security-pack.js` (신규) | 결정적 재생성 + 조립 후 smoke 스캔 EXIT 0/1 검증 |
| `tools/static-runner/src/runner.js` | SemgrepPlugin 기본 ruleset → 로컬 팩 경로 |
| `tools/static-runner/test/runner.test.js` | 기본값(미지정) → 팩 경로 단언 신규 추가 (기존 explicit-ruleset 단언은 무영향 — override 보존) |
| `skills/analysis-error-mapping/SKILL.md` | registry → 팩 경로 |
| `skills/analysis-aspect-static-security/SKILL.md` | registry 예시 → 팩 경로 |
| `scripts/release-readiness.js` + test.js | check 추가 시 count coupling 동시 갱신 (memory feedback_release_readiness_count_coupling) |
| `CHANGELOG.md` + `.claude-plugin/plugin.json` | MINOR bump |
| `decisions/DEC-2026-06-17-semgrep-local-security-ruleset.md` (신규) | 결정 로그 + INDEX.md 등재 |

## 5. 단계

1. 생성 스크립트 작성 → `tools/semgrep-rules-security/` 조립 → smoke 스캔으로 EXIT 0 + 대표 finding 검증.
2. runner.js 기본값 전환 + 기본값 테스트 추가.
3. error-mapping / static-security SKILL.md registry 제거.
4. 사내망 재현 검증 — `--config` 미지정 호출이 **네트워크 0 으로 EXIT 0** (semgrep.dev 안 탐) + error-mapping 경로도 통과.
5. 전체 테스트 GREEN (static-runner 48 + 영향 suite) + `test:release` full 실행.
6. CHANGELOG/version/DEC/INDEX + git status clean 확인 후 (publish 는 별도 사용자 flow).

## 6. 리스크·carry

- **팩 크기(git 중복)** — security subset 만(전체 19MB 의 부분). 수용. 향후 full tree 출하 제외 검토는 별도(SKILL per-language 예시 의존 때문에 지금은 둘 다 필요).
- **룰 커버리지 변화** — `p/owasp-top-ten`(서버 큐레이션) ≠ security 디렉토리 1386(더 넓음). 1:1 재현 불가(로컬 팩엔 owasp 매니페스트 부재). baseline 재수립 필요할 수 있음 — 기존 baseline 사용처에 안내.
- **PATH carry (별개 / 미해결)** — pipx·brew 없는 fresh PC 가 `pip3 --user` → `~/.local/bin` 미등록 가능. 룰 fix 와 직교 / 본 plan scope 외(hook 경고 기존 유지).
- **per-language override 예시** — full tree 의 `<lang>` 디렉토리도 비security 카테고리 포함 → 그 경로는 exit 7 위험 잔존(사용자 명시 override 시). 기본 경로는 안전.

## 7. 검증 = no-simulation

조립 팩 smoke 스캔·사내망 재현은 **실제 semgrep 실행**(LLM 추론 대체 ❌). 본 PC 가 사내망 SSL 환경 = fix 검증 환경 그 자체.

## Lessons Learned

(구현 후 기록)
