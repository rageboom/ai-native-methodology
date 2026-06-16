---
name: analysis-run-manifest
description: Use during analysis stage to extract the positive build/run/env operational context of a system ("어떻게 build/run/configure 하나" / "run recipe" / "운영 컨텍스트" / "build command" / "환경변수" / "service dependency" / "how to run"). Reverse-engineers from real config files (package.json / Dockerfile / docker-compose / Makefile / pom.xml / build.gradle / application.yml|properties / .env.example / CI configs) into run-manifest.json (analysis 산출물 #26 / positive counterpart to migration-cautions negative warnings). Feeds P0 use-scenario "LLM 이 develop·run·modify·evolve"의 RUN 축. Source-grounded — every item cites its source config (no fabrication / 누락 = honest null + configs_missing); env value 절대 미저장 (name + is_secret + sensitivity only / secret 누출 차단). confidence: deterministic parse(package.json/yml)=1.0 / LLM-read(Dockerfile/Makefile)≤0.75. no-simulation. official (opt-in / runnable 산출물 한정 / DEC-2026-06-10-reverse-eng-delta-2a-3-promotion — ≥2 paradigm corroborated). Stage = analysis, aspect = cross-cutting.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-run-manifest — build/run/env 운영 컨텍스트 추출 (positive manifest)

"이 시스템을 **어떻게 build·run·configure** 하는가"는 LLM 이 프로젝트를 운영(develop·run·modify·evolve)하는 데 필수 컨텍스트(P0). 기존 자산은 stack(inventory) / test 호출(test-cmd) / **negative 경고**(migration-cautions)만 제공 — 본 skill 이 **positive 운영 recipe** 갭을 메운다. 출력 `run-manifest.json` = 분석 대상의 실제 빌드/실행/환경을 **실 config 에서 추출**한 선언적 산출물.

## no-simulation 절대 금지

baseline → `methodology-spec/policies/no-simulation.md`.

- **source-grounded 의무** — 모든 추출 항목은 실 config 파일 출처(`source.file` + `anchor`)를 명시. 추론·날조 ❌.
- **누락 = 정직 표기** — config 부재 시 해당 필드 `null` + `extraction.configs_missing` 등재. "아마 npm 일 것" 식 추론 ❌.
- **env value 절대 미저장** — 환경변수는 `name` + `is_secret` + `sensitivity` + (비-secret 만) `default` 만. **실제 값 / .env 파일 내용 읽어 저장 ❌** (secret 누출 차단 / `check42` artifact-secret-scan 정합).
- **build/run 미실행** — 본 skill 은 build·run 명령을 **실행하지 않는다**(추출만). 실행 검증은 별도 chain-5 validator 영역.
- `extraction.evidence_trust = real_extraction` (실 파싱·읽기) — simulated 영구 reject.

## confidence 계층 (no-simulation 정합)

- **deterministic_parse = 1.0** — package.json / docker-compose.yml / application.yml / pom.xml 등 정형 파일을 파싱(JSON/YAML/properties)해 추출한 값.
- **llm_read ≤ 0.75** — Dockerfile / Makefile / CI yaml scriptlet 등 비정형을 읽어 구조화한 값(automation-boundary ceiling). `source.method = llm_read` 표기.
- **candidates (0.5~0.95)** — 확신 부족 시(예: pom.xml 있으나 `mvnw` 부재) `build.candidates[]` 에 후보 나열 → 사람 확정.

## 사전 조건

- 분석 대상 repo + (권고) `inventory.json`(stack 참조). config 파일 부재 시 honest null (skill 자체는 항상 동작).

## 절차

1. **config preflight (정직 체크)** — 대상에서 config 파일 탐지:
   - build/run: `package.json` / `pom.xml` / `build.gradle(.kts)` / `Makefile` / `Cargo.toml` / `*.csproj` / `Dockerfile` / `docker-compose.y*ml` / `Procfile` / CI(`.github/workflows/*.yml`)
   - env: `.env.example` / `.env.sample` / `application.yml|properties` / `appsettings.json` / `config/*.y*ml`
   - 발견 → `extraction.configs_found` / 기대했으나 부재 → `extraction.configs_missing`.
   - **config 전무** → build/run = null + `system_context` 만 + warning(추론 ❌).

2. **deterministic 추출 (confidence 1.0)** — 정형 config 파싱:
   - `package.json` → `scripts.build`/`scripts.start`/`scripts.dev` (build/run command + args), `engines`, deps.
   - `docker-compose.y*ml` → service_dependencies(image/ports/depends_on), env 변수명.
   - `application.yml|properties` → server.port(run.ports), datasource(service_dependencies), `${ENV}` 참조 env 변수명.
   - `pom.xml`/`build.gradle` → build tool/command(`mvn`/`./gradlew`), output_dir.
   - 각 값에 `source = {file, anchor, method:"deterministic_parse"}` + verbatim 근거.

3. **llm-read 추출 (confidence ≤0.75)** — 비정형 config 읽기:
   - `Dockerfile` → `ENTRYPOINT`/`CMD`(run), `EXPOSE`(ports), `ENV`(env 변수명), `RUN`(build hints).
   - `Makefile`/CI → build/run target. `source.method = "llm_read"` + line anchor.

4. **env-var is_secret 판정 (heuristic + 정직)** — 변수명 keyword 로 is_secret 추정:
   - high-signal(`PASSWORD`/`SECRET`/`TOKEN`/`API_KEY`/`PRIVATE_KEY`/`ACCESS_KEY`/`CREDENTIAL`) → is_secret=true / sensitivity=credential.
   - 명백 비-secret(`PORT`/`NODE_ENV`/`LOG_LEVEL`/`HOST`) → false / public·internal.
   - **모호 → is_secret=null + sensitivity=unknown + human review** (단정 ❌). **값은 절대 미저장**(예시 필요 시 비-secret 만 `default`).

5. **operational_guidance (lean)** — config 에서 명확한 성공-경로 지침만 note 수준(예: compose `depends_on` → "postgres 먼저 기동 후 migrate"). 추측성 prose ❌.

6. **assemble + 검토** — `run-manifest.json` 작성(`schemas/run-manifest.schema.json` valid). build/run 미탐지 = null. 사용자가 candidates·is_secret:null 확정.

## 산출물

- `<user-project>/.ai-context/base/shared/run-manifest.json` (`schemas/run-manifest.schema.json` / analysis 산출물 #26 / source-grounded / env value 미저장)

## 한계 (정직)

- **추출 ≠ 검증** — 기록한 build/run 명령이 실제 동작하는지는 미실행(chain-5 validator 영역). `candidates` 는 사람 확정 필요.
- **is_secret heuristic** — keyword 기반 = 확률적. 모호는 null + human review(단정 ❌).
- **version_constraint = declared** — compose/manifest 의 선언 버전이지 실 동작 버전 아님.
- **LLM-read ceiling 0.75** — Dockerfile/Makefile 추출은 결정론 아님(자동화 경계).
- **official (opt-in)** — ≥2 distinct paradigm corroborated (근거 ## 인용). MANDATORY ❌ — runnable 산출물 한정 cross-cutting aspect. lean scope — health-check poll/cache/startup-order 등 elaborate 필드 defer(carry) / run-manifest-validator 부재(manual / carry).

## 인용

- `schemas/run-manifest.schema.json`
- DEC-2026-06-09-build-run-env-manifest (본 skill 의 결정 / 모DEC = DEC-2026-06-09-reverse-eng-methodology-gap §2.5 델타 #2-a)
- DEC-2026-06-10-reverse-eng-delta-2a-3-promotion (draft→official 격상 / ≥2 paradigm corroborated)
- `methodology-spec/use-scenario-taxonomy.md` (P0 RUN 축 운영 컨텍스트)
- `methodology-spec/policies/no-simulation.md` (source-grounded / 누락 정직 / value 미저장)
- `schemas/migration-cautions.schema.json` (negative 경고 — 본 산출물의 positive 반대편)
- `schemas/test-cmd.schema.json` (cmd+args shell-injection-safe 필드 선례)
