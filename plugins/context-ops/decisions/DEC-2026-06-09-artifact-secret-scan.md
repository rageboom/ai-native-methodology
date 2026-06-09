# DEC-2026-06-09-artifact-secret-scan

**결단**: 역공학 델타 #2(b) — 방출 `.ai-context/output` 분석/체인 산출물의 **secret/credential 누출 스캔**을 **release-readiness check42**(`check27 shipped_identity_leak` 동형 release-block)로 신설. **built-in 결정론 regex**(`_shared/pii-patterns.js` SSOT 에 `scanSecrets` 추가 / no-simulation)로 구현 — **gitleaks 바이너리 ❌**(실행 이력 0 / no-unrunnable-tool-citation / allowlist 규율), **PostToolUse hook ❌**(per-write 비용 + gate-after-emit 소급 차단 불가 / area4 진단). **chain gate 미주입**(forward 진행 무관 / 결정론 axis 보호). 실증 risk 정조준: br-cross-consistency 가 산출물에 `private static final String SECRET = "..."` **verbatim 복사**(output-hygiene 결함). low-FP 의무(release-block) — 239 산출물 calibration 0 hit. 델타 #2(a) **build/run/env manifest = 별도 follow-on**. 1차 draft / 격상 ≥2 PoC(§8.1).

**작성일**: 2026-06-09.

**version**: 없음 (1차 draft / plugin.json·CHANGELOG 무변경 = §8.1 격상 보류 / 본체 격상 = ≥2 PoC corroboration 후).

**relates to**:

- `DEC-2026-06-09-reverse-eng-methodology-gap` §2.5 델타 #2 (모 DEC / "build/run/env manifest + 산출물 secret-scan")
- `DEC-2026-06-06-tool-allowlist-pmd-only` (allowlist 규율 — gitleaks 바이너리 비채택 근거 / no-unrunnable-tool-citation) + `DEC-2026-05-18-runtime-tool-exclusion` (R19 Tier)
- `DEC-2026-06-09-scope-carve-3signal-reference-lens` + `DEC-2026-06-09-hotspot-prioritization-reference-lens` (델타 #1·#4 / standalone·chain-driver 무수정 선례)
- charter **P8**(Secret scanning hook — PreToolUse `git commit` 전 / **별개 scope** — 본 DEC = artifact OUTPUT scan / P8 부분 진척)
- memory `feedback_no_static_tool_simulation` (built-in regex = 실측 / gitleaks 바이너리 미실행 인용 ❌) · `feedback_chain_driver_deterministic_axis` (chain gate 미주입) · `feedback_diagnose_before_design_check_existing` (pii-patterns 재사용 / agent 이견 area4 채택)

---

## 1. 배경

모DEC(§2.5 델타 #2)가 "build/run/env manifest + 산출물 secret-scan"을 식별. 본 DEC = 그중 **(b) 산출물 secret-scan** per-delta. 실증 risk: `reverse-engineering-methodology.md:133` — br-cross-consistency 가 산출물에 Java `private static final String SECRET = "..."` 를 **verbatim 복사**한 finding 기록 존재 = output-hygiene 결함.

**기존 자산 실측**(diagnose-before-design / 5-reader workflow):

- **`_shared/pii-patterns.js` = 재사용 SSOT** — `scanLeak`/`redactText` + 패턴(email/private-key/path/IP/internal-host). **단 PII-focused — secret 패턴(토큰/키/`SECRET=` 할당) 부재** + check27 은 shipped(skills/agents/templates)만 스캔, **`.ai-context/output` 미스캔**.
- **P8 ≠ 본 델타** — P8 = PreToolUse `git commit` 차단 hook(별개 미래). 본 델타 = 방출 **OUTPUT 산출물** hygiene.
- **345 vendored Semgrep gitleaks rules** 존재(`tools/semgrep-rules/generic/secrets/gitleaks/`) — Tier 1 경로 후보.
- **agent 이견** — area3(PostToolUse Semgrep hook) vs area4(validator/release-check). area4 근거가 강함 → 채택(아래 §2.1).

## 2. 결정 내용

### 2.1 형태 = release-readiness check42 (hook ❌ / chain gate 미주입)

`check42_artifactSecretLeak()` (release-readiness.js) = `check27 shipped_identity_leak` 동형 — content-aware regex 스캔 + release-block. **PostToolUse hook 비채택**(area4): ⒜ per-write Semgrep 비용 200~500ms = CHANGELOG Senior REJECT 선례(quadratic), ⒝ gate-after-emit(secret 이미 disk) — hook 이 소급 차단 불가, ⒞ remediation = 상태 mutation = 결정론 axis 오염. **chain gate 미주입**(scope-carve/db-assets 선례 / `feedback_chain_driver_deterministic_axis`) — forward 진행과 무관, release 단계 hygiene gate.

### 2.2 engine = built-in 결정론 regex (gitleaks 바이너리 ❌)

`pii-patterns.js` SSOT 에 `scanSecrets` 추가(built-in regex / 항상 실행 / 외부 의존 0 / exit-3 불요). **gitleaks 바이너리 비채택** — 실행 이력 0 → no-unrunnable-tool-citation(`DEC-2026-06-06`) 위배 / allowlist(`IMPORTED_DRIVER_ALLOWLIST=['pmd']`) 규율. **Semgrep + vendored gitleaks rules(Tier 1)** = 더 풍부하나 Semgrep-on-PATH exit-3 의존 → **future enhancement**(1차는 항상 실행되는 built-in / check27 과 동일 메커니즘). no-simulation: 결정론 regex = 실측(LLM 판단 ❌).

### 2.3 low-FP 의무 (release-block)

release 차단이므로 false-positive 최소화. 2 계층:
- **prefixed/형식 토큰**(AWS `AKIA…` / GitHub `ghp_…` / Slack `xox…` / Google `AIza…` / Stripe `sk_live_…` / JWT `eyJ….eyJ….` / private-key 헤더) = near-zero FP → block.
- **하드코딩 할당**(`SECRET="…"` 류) = `looksLikeRealSecret`(16+ token charset + letter·digit entropy + 비-placeholder)로 강하게 거름. **calibration**: 초기 239 산출물 스캔 = 5 hit 전부 FP(`password='secret123'`(짧음) / `"@IsNotEmpty()"`(데코레이터) / `"string (argon2 hash)"`(타입설명)) → 강화 후 **0 hit**. 실증 risk `SECRET="kP9mX2vL8qR4nT6w"`(고-entropy)는 여전히 정조준.

### 2.4 scope

`examples/**/{output,.ai-context,analysis}/*.json` (방출 산출물 dir 만 / **input fixture 제외** — legacy source config 는 정당 / `node_modules` 제외). content-aware.

### 2.5 finding 범주 = output-hygiene (≠ R19 static-security)

artifact secret = source-code secret(analysis-aspect-static-security / R19 Tier)과 **다른 범주** — 산출물이 **방법론 산물**(verbatim 복사)이므로 remediation = "산출물에서 제거 + 재생성"(코드 수정 아님). built-in regex = 도구 자체 자산(evidence_trust 무관 / 외부 도구 Tier 분류 불요). auto-redact ❌(산출물 = release asset / 삭제+재생성).

### 2.6 델타 #2(a) build/run/env manifest = 별도 follow-on

(a) positive operational manifest(build_cmd/run_cmd/env-var names+is_secret/ports/entrypoint/operational-guidance) = 신규 analysis 산출물(schema+skill+이종 config 추출+slot+등록) = M-L 표면 → **별도 per-delta DEC**. (b) secret-scan 이 (a)의 env-value 누출 가드 역할 → 먼저 land.

## 3. 근거

- **diagnose-before-design** — pii-patterns 재사용(SSOT) + P8/2b scope 구분 + agent 이견(area4 validator 채택 = CHANGELOG REJECT·gate-after-emit 근거).
- **no-simulation** — built-in 결정론 regex = 실측 / gitleaks 바이너리 미실행 인용 = no-unrunnable-tool-citation 위배.
- **low-FP** — release-block 은 FP 0 에 수렴해야(239 calibration). 구조화 산출물의 field-name FP(`password` key)를 `looksLikeRealSecret` 로 절단.
- **§8.1** — 1차 draft / 본체 격상 = ≥2 PoC corroboration 후.

## 4. Non-goal (1차)

- gitleaks 바이너리 import ❌ (allowlist 규율 / 실행 이력 0). Semgrep Tier 1 경로 = future.
- PostToolUse hook ❌ (per-write 비용 / gate-after-emit). P8 PreToolUse commit hook = 별개 미래.
- chain gate inject ❌ (release hygiene gate 한정).
- auto-redact ❌ (산출물 = release asset / 삭제+재생성).
- build/run/env manifest (델타 #2-a) ❌ (별도 per-delta DEC).
- MANDATORY 격상·CHANGELOG ❌ (≥2 PoC 후).

## 5. 검증 / 상태

- **Phase 1 draft 완료** — `pii-patterns.js` `scanSecrets`(+ `SECRET_TOKEN_RULES` / `looksLikeRealSecret`) 추가(additive) + `release-readiness.js` check42 + 등록(41→42 checks). **calibration: 239 산출물 0 hit**(초기 5 FP 강화 후 제거) + 실증 risk 정조준. 단위 test(`scanSecrets` TP/FP) + integration test(check42 criterion pass) = `scripts/test/release-readiness.test.js`.
- release-readiness **40/42** — 2 fail = scope-carve 와 동일 **pre-existing** skill-citation-validator URL false-positive(델타 무관 / task flag). **0 new regression.**
- plugin.json·CHANGELOG 무변경(§8.1). charter P8 = artifact-scan 부분 진척(PreToolUse commit hook 잔여).

## 6. caveat (정직)

- **regex best-effort** — false-negative 존재(context-dependent secret 누락 가능 / pii-patterns.js line 5 동일 정직). 할당 heuristic = entropy proxy(고-entropy 실 secret만 / 저-entropy 실 secret 누락 가능). 보강 = Semgrep Tier 1(future) 또는 패턴 확장.
- **scope = examples/ 방출 산출물** — 실 adopter 의 `.ai-context/output` 스캔은 adopter 환경(本 check 는 본 repo committed 산출물 가드). 실 사용 시 동일 scanSecrets 를 adopter CI 가 호출 가능(carry).
- **신호 ROI 미실증**(1차) — §8.1 / 본체 격상 = ≥2 PoC corroboration 후.

## 인용

- 코드: `tools/_shared/pii-patterns.js`(`scanSecrets`/`SECRET_TOKEN_RULES`/`looksLikeRealSecret` — built-in 결정론) · `scripts/release-readiness.js`(`check42_artifactSecretLeak` / 등록) · `scripts/test/release-readiness.test.js`(scanSecrets 단위 + check42 integration)
- 선례: `check27_shippedIdentityLeak`(동형 release-block) · scope-carve/hotspot DEC(standalone·no-touch)
- 관련 DEC: DEC-2026-06-09-reverse-eng-methodology-gap(모) · DEC-2026-06-06-tool-allowlist-pmd-only · DEC-2026-05-18-runtime-tool-exclusion
- charter: P8(secret scanning hook / PreToolUse 잔여)
- memory: `feedback_no_static_tool_simulation` · `feedback_chain_driver_deterministic_axis` · `feedback_diagnose_before_design_check_existing` · `feedback_quality_priority`
