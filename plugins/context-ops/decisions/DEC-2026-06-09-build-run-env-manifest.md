# DEC-2026-06-09-build-run-env-manifest

**결단**: 역공학 델타 #2(a) — "이 시스템을 어떻게 **build·run·configure** 하는가"의 **positive 운영 manifest**를 신규 analysis 산출물 **#26 `run-manifest.json`**로 신설(초기 draft 의 #16 표기 = `deliverables/16-error-mapping-spec.md` 와 충돌 → canonical `deliverables/` 다음 free 번호로 정정 / §2.2). **단일 통합 산출물**(build + run + environment_variables + service_dependencies + operational_guidance / 3-schema·impl-spec 통합 비채택). **skill-based 추출**(`analysis-run-manifest` / **신규 node 도구 0** — inventory/architecture/domain 의 LLM-추출 skill 선례). **analysis cross-cutting aspect**(역공학 = 기존 recipe 추출 / chain-5 아님). **source-grounded**(모든 항목 실 config 출처 / 누락 = 정직 null + configs_missing / 추론 ❌) + **env value 절대 미저장**(name + is_secret + sensitivity 만 / `check42` artifact-secret-scan 정합). confidence 계층(deterministic parse=1.0 / llm-read ≤0.75). **lean 1차**(elaborate health-check/cache/startup-order defer). dogfood 2 paradigm(poc-18 Node + poc-10 Spring/Gradle). 1차 draft / 본체 격상 = ≥2 PoC corroboration 후(§8.1).

**작성일**: 2026-06-09.

**version**: **official(opt-in) 격상 완료** (2026-06-10 / `DEC-2026-06-10-reverse-eng-delta-2a-3-promotion` — ≥2 paradigm corroborated poc-18 Node + poc-10 JVM/Gradle / runnable 산출물 한정 opt-in / MANDATORY ❌). 초기 1차 draft → 본 격상.

**relates to**:

- `DEC-2026-06-09-reverse-eng-methodology-gap` §2.5 델타 #2 (모 DEC / "build/run/env manifest + 산출물 secret-scan" 의 (a))
- `DEC-2026-06-09-artifact-secret-scan` (델타 #2-b / env value 미저장 = check42 가 산출물 누출 가드)
- `DEC-2026-06-09-scope-carve-3signal-reference-lens` + `DEC-2026-06-09-hotspot-prioritization-reference-lens` (sibling / standalone·등록 touchpoint 선례)
- `methodology-spec/use-scenario-taxonomy.md` (P0 — LLM 이 develop·**run**·modify·evolve / RUN 축 운영 컨텍스트)
- `schemas/migration-cautions.schema.json` (negative 경고 — 본 산출물의 **positive 반대편**) · `schemas/test-cmd.schema.json` (cmd+args shell-safe 필드 선례 / 단 그건 user-config·본건은 analysis-output)
- memory `feedback_no_static_tool_simulation` (source-grounded / value 미저장) · `feedback_diagnose_before_design_check_existing` (기존 자산 실측 / shape pressure-test) · `feedback_quality_priority`

---

## 1. 배경

모DEC(§2.5 델타 #2)의 (a). 4-agent design workflow + diagnose 실측: 기존 자산은 stack(`inventory`) / test 호출(`test-cmd`) / **negative 경고**(`migration-cautions`)만 제공 — "어떻게 빌드·실행·구성"의 **positive manifest 부재**. P0 use-scenario "LLM 이 develop·run·modify·evolve"의 **RUN 축** 운영 컨텍스트가 빈 곳.

## 2. 결정 내용

### 2.1 단일 통합 `run-manifest.json` (3-schema / impl-spec 통합 비채택)

build + run + env_vars + service_deps + operational_guidance = **1 산출물**. 근거(design-lens): build/run/env 는 **시스템당 1개 discovery 산출물**(test-cmd 의 per-invocation user-config 와 false analogy) / cohesion(운영 prerequisite 한 묶음) / 단일 LLM 컨텍스트 로드 경로 / 선례(migration-cautions·db-schema 통합). **3-schema 비채택**(모듈성 이득 0 + drift 비용) / **impl-spec 통합 비채택**(impl-spec=WHAT TO build / run-manifest=HOW EXISTING builds = 역공학 원칙 위배).

### 2.2 analysis cross-cutting aspect / 산출물 #26 (번호 정정)

**analysis stage**(기존 시스템 recipe 역공학 / inventory·db-schema·migration-cautions 선례 / chain-5 아님 — chain-5 는 design-new). **cross_cutting.aspects**(code-graph·scope-carve 동급 / phases[] 아님).

**canonical 번호 = `methodology-spec/deliverables/NN-*.md` 디렉토리 순번** (lifecycle-contract 표 로컬 순번 ≠ canonical). 초기 draft 는 lifecycle 표 로컬 순번을 그대로 옮겨 **#16** 으로 표기했으나 canonical 에서 #16 = `16-error-mapping-spec.md` 이므로 **번호 충돌**. → `24-sql-inventory` 다음 free 번호로 정정하되, sibling 델타 #3 recovered-adr 가 동일 패턴으로 **#25** 를 선점할 예정이라 **#26** 부여(#25 예약 / recovered-adr 와 동일 처분). lifecycle-contract 산출물 **#26** + canonical doc `methodology-spec/deliverables/26-run-manifest.md` 신설(다른 산출물과 동형 — 전부 deliverables/ doc 보유).

### 2.3 skill-based 추출 (신규 node 도구 0)

`analysis-run-manifest` skill 이 config 읽어 추출 — inventory/architecture/domain 의 **LLM-추출 skill 선례**(deterministic 도구 아님). scope-carve(결정론 도구+test)와 달리 **node 도구·test 미신설**. config 별: 정형(package.json/yml/properties) = JSON/YAML parse(confidence 1.0) / 비정형(Dockerfile/Makefile) = llm_read(≤0.75).

### 2.4 source-grounded + env value 미저장 (no-simulation)

모든 항목 `source.file`+`anchor` 명시 / 누락 = `null` + `extraction.configs_missing`(추론 ❌) / `evidence_trust=real_extraction`. **env 는 name + is_secret + sensitivity + (비-secret) default 만 — 실제 값·`.env` 내용 미저장**(check42 산출물 누출 가드 정합). is_secret keyword heuristic 모호 = **null + human review**(단정 ❌).

### 2.5 lean 1차

build/run/env/service-deps/operational-guidance(prose) + source/confidence/extraction. **defer**(over-engineering 회피 / §8.1): health-check poll-interval/healthy-codes · cache_config · startup_order · operational_guidance 의 commands+validation+performance_implications.

### 2.6 CORE deliverable (reference-lens 아님 / gate inject ❌)

run-manifest = 사실 운영 컨텍스트(reference-lens 아님). 단 정보성 — **결정적 gate 에 inject ❌**(informational operating context / inventory 동급). confidence 계층으로 deterministic vs llm-read 정직 표기.

## 3. 근거

- **design-lens(agent4) decisive** — shape A(통합) / analysis-stage / reverse-eng 원칙(HOW EXISTING ≠ WHAT TO build).
- **no-simulation** — source-grounded + 누락 null + env value 미저장(check42 정합) + is_secret 모호 null.
- **skill-based** — analysis 산출물의 검증된 추출 패러다임(inventory/architecture) / 1차 node 도구 과投資 회피.
- **§8.1** — lean 1차 / 본체 격상 = ≥2 distinct paradigm PoC corroboration 후.

## 4. Non-goal (1차)

- 3-schema 분리 / impl-spec 통합 ❌.
- 신규 node 도구·validator ❌ (skill-based / schema-validator 가 schema 검증).
- build·run 명령 **실행** ❌ (추출만 / 실행 검증 = chain-5).
- elaborate 필드(health-check poll / cache / startup-order) ❌ (defer).
- env value 저장 ❌ / is_secret 단정 ❌ (모호=null).
- MANDATORY 격상·CHANGELOG ❌ (≥2 PoC 후).

## 5. 검증 / 상태

- **Phase 1 draft 완료** — `schemas/run-manifest.schema.json`(strict / source_ref·confidence·env value-less) + `skills/analysis-run-manifest/SKILL.md`(추출 절차·confidence 계층·is_secret heuristic) + 등록(phase-flow cross_cutting.aspects + analysis-agent frontmatter + lifecycle-contract #26 + canonical doc `methodology-spec/deliverables/26-run-manifest.md`).
- **번호 정정(후속)** — 초기 #16 표기가 canonical `16-error-mapping-spec.md` 와 충돌 → SKILL.md(description+본문)·lifecycle-contract(표 행+note)·phase-flow $comment·schema title·본 DEC·INDEX 의 #16 → **#26** 일괄 정정 + `deliverables/26-run-manifest.md` canonical doc 신설(§2.2). error-mapping(#16) 무변경. plugin.json·CHANGELOG 무변경(1차 draft).
- **dogfood 2 paradigm**: poc-18(Node/Express/Prisma — package.json/Dockerfile/compose/.env.example / build·run·12 env·postgres+redis / pnpm-Dockerfile divergence=candidates) + poc-10(Spring Boot 4/Gradle/H2 — build.gradle/application.properties / honest gaps: gradlew wrapper·Dockerfile·env 부재=configs_missing / env 외부화 0=빈 배열 / server.port 미선언=ports[] / run=llm_read 0.7). **둘 다 ajv valid + check42 clean**(env names 미트립 = name vs value 판별 입증).
- release-readiness **42/42 무회귀** + drift-validator orphan 0(skill 등록) + agent_skills_phaseflow_sync 정합.
- plugin.json·CHANGELOG·lifecycle MANDATORY 무변경(§8.1).
- **poc-01(Spring) source 미커밋 → poc-10(Spring/Gradle) 대체**(≥2 paradigm = Node + JVM/Gradle 충족 / 원 dogfood 결정의 honest 조정).

## 6. caveat (정직)

- **추출 ≠ 검증** — 기록된 build/run 명령 실동작 미확인(chain-5 영역). candidates·is_secret:null = 사람 확정.
- **is_secret heuristic** — keyword 기반 확률적(모호=null). **llm-read ceiling 0.75**(Dockerfile/Makefile 결정론 아님).
- **version_constraint = declared** — 선언 버전이지 실 동작 버전 아님.
- **신호 ROI 미실증**(1차 / §8.1) — 본체 격상 = ≥2 distinct 도메인 PoC corroboration 후.
- skill-based 추출은 LLM-주도 → 동일 입력 재현성은 결정론 도구만큼 강하지 않음(source-grounded 로 완화 / deterministic parse 부분은 재현).

## 인용

- 코드: `schemas/run-manifest.schema.json` · `skills/analysis-run-manifest/SKILL.md` · `flows/analysis.phase-flow.json`(cross_cutting.aspects) · `agents/analysis-agent.md`(frontmatter) · `methodology-spec/lifecycle-contract.md`(#26) · `methodology-spec/deliverables/26-run-manifest.md`(canonical doc)
- dogfood: `examples/poc-18-express-prisma-modern-ts/target/.ai-context/output/run-manifest.json` · `examples/poc-10-realworld-jpa-querydsl/.ai-context/output/run-manifest.json`
- 관련 DEC: DEC-2026-06-09-reverse-eng-methodology-gap(모) · DEC-2026-06-09-artifact-secret-scan(2b) · DEC-2026-06-09-scope-carve-3signal-reference-lens · DEC-2026-06-09-hotspot-prioritization-reference-lens
- 선례 schema: migration-cautions(negative) · test-cmd(cmd 필드) · inventory(stack) · db-schema(sensitivity enum)
- memory: `feedback_no_static_tool_simulation` · `feedback_diagnose_before_design_check_existing` · `feedback_quality_priority`
