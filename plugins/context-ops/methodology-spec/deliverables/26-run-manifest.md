# 산출물 #26: Run Manifest

> **사상**: "이 시스템을 어떻게 **build·run·configure** 하는가" = LLM 운영 컨텍스트(P0 use-scenario RUN 축) / migration-cautions 의 **positive 반대편**(negative 경고 ↔ positive 성공 경로)
> **schema**: `schemas/run-manifest.schema.json`
> **생성**: `analysis-run-manifest` skill (analysis stage / cross-cutting aspect — phase 무관 / code-graph·scope-carve 동급)
> **자격**: 1차 draft (opt-in) / 본체 MANDATORY 격상 = ≥2 distinct paradigm PoC corroboration 후 (Node + JVM/Gradle 2 paradigm dogfood 입증)

---

## 1. 목적

**답하는 질문**: "inventory(stack) / test-cmd(test 호출) / migration-cautions(negative 경고)만으로는 '어떻게 build·run·configure' 하는지 알 수 없다. 새 시스템을 develop·run·modify·evolve 하려는 LLM 이 빌드 명령 / 실행 명령 / 포트 / 환경변수 / 외부 서비스 의존을 source-grounded 로 알아야 한다."

**AI 운영 시 활용**:

- 모든 stage 의 base 운영 컨텍스트 — LLM 이 빌드/실행 recipe 를 추론 없이 로드
- chain 5 GREEN 검증 시 build/run 명령·output_dir·entrypoint 식별 (단 실동작 검증은 chain-5 validator 영역 / 본 산출물은 추출만)
- 외부 서비스 의존(DB/cache/queue) + 환경변수 prerequisite 식별 → 환경 구성 누락 차단

### 1.1 positive manifest 의 위치

migration-cautions = "무엇을 조심하라"(negative). run-manifest = "어떻게 성공적으로 build·run 하라"(positive). 둘은 동일 시스템의 양면이며, run-manifest 는 비어 있던 positive 면을 메운다.

---

## 2. 형식

단일 통합 산출물(3-schema 분리 / impl-spec 통합 비채택). build + run + environment_variables + service_dependencies + operational_guidance 가 한 파일.

```
output/
└── run-manifest.json     # build + run + env + service_deps + guidance (단일 통합 / strict)
```

근거: build/run/env 는 시스템당 1개 운영 prerequisite 묶음(cohesion) / 단일 LLM 컨텍스트 로드 경로 / migration-cautions·db-schema 통합 선례. impl-spec 통합 비채택 — impl-spec = WHAT TO build(설계) / run-manifest = HOW EXISTING builds(역공학) = 본질 상이.

---

## 3. 추출 범위 (출처 / 방법 / 신뢰도)

| 항목                  | 출처 (실 config)                                                   | 방법                | 신뢰도                          |
| --------------------- | ------------------------------------------------------------------ | ------------------- | ------------------------------- |
| build                 | package.json `scripts` / pom.xml / build.gradle / Makefile         | deterministic_parse / llm_read | 1.0(정형) / ≤0.75(비정형) |
| run                   | package.json `scripts.start` / Dockerfile CMD·ENTRYPOINT / Procfile | deterministic_parse / llm_read | 1.0 / ≤0.75               |
| run.ports             | application.yml `server.port` / Dockerfile EXPOSE / compose ports  | deterministic_parse / llm_read | 1.0 / ≤0.75               |
| environment_variables | .env.example / application.yml `${ENV}` / compose env / Dockerfile ENV | deterministic_parse / llm_read | 1.0 / ≤0.75            |
| service_dependencies  | docker-compose.yml(image/ports/depends_on) / datasource config     | deterministic_parse | 1.0                             |
| operational_guidance  | compose depends_on / db init script (명확한 성공 경로만)           | llm_read            | ≤0.75                           |

**입력**: 분석 대상 repo + (권고) inventory.json(stack 참조).
**no-simulation 정책**: 모든 항목 실 config 출처(`source.file` + `anchor`) 명시 의무 / 추론·날조 ❌ / `extraction.evidence_trust = real_extraction`(simulated 영구 reject).

### 3.1 미추출 (의도적)

- build·run 명령 **실행** — 추출만 / 실동작 검증은 chain 5 validator 영역
- elaborate 운영 필드(health-check poll / cache 전략 / startup-order 그래프) — lean 1차 defer
- 환경변수 **실제 값** / .env 파일 내용 — secret 누출 차단(절대 미저장)

---

## 4. confidence 계층 (no-simulation 정합)

| 단계               | 조건                                                                | 신뢰도     |
| ------------------ | ------------------------------------------------------------------- | ---------- |
| deterministic_parse | package.json / docker-compose.yml / application.yml / pom.xml 파싱 | 1.0        |
| llm_read           | Dockerfile / Makefile / CI yaml scriptlet 등 비정형 읽기            | ≤ 0.75     |
| candidates         | 확신 부족(예: pom.xml 있으나 mvnw 부재) → `build.candidates[]` 후보  | 0.5 ~ 0.95 |

llm_read ceiling 0.75 = automation-boundary(Dockerfile/Makefile 추출은 결정론 아님). candidates 는 사람 확정 의무.

---

## 5. environment_variables — env value 미저장 (secret 누출 차단)

환경변수는 **name + is_secret + sensitivity + (비-secret 만) default** 만 기록. **실제 값 / .env 내용 절대 미저장** — 방출 산출물 secret-scan(output-hygiene release-gate) 정합.

### 5.1 is_secret 판정 (keyword heuristic + 정직)

| 분류        | 신호 (변수명 keyword)                                                          | is_secret / sensitivity   |
| ----------- | ------------------------------------------------------------------------------ | ------------------------- |
| high-signal | `PASSWORD` / `SECRET` / `TOKEN` / `API_KEY` / `PRIVATE_KEY` / `ACCESS_KEY` / `CREDENTIAL` | true / credential   |
| 명백 비-secret | `PORT` / `NODE_ENV` / `LOG_LEVEL` / `HOST`                                  | false / public·internal   |
| 모호        | 위 어디에도 단정 불가                                                          | **null / unknown / human review** |

is_secret=true 면 `default` = null 의무. 모호는 단정 ❌ → null + 사람 검토.

---

## 6. cross-link

```yaml
cross_links:
  - { to_artifact: inventory, link_type: references_stack }              # stack SSOT 참조 (중복 추출 ❌)
  - { to_artifact: migration-cautions, link_type: positive_counterpart } # negative 경고의 positive 반대편
  - { to_artifact: db-schema, link_type: shares_sensitivity_enum }       # sensitivity enum 정합
  - { to_artifact: discovery-spec, link_type: provides_run_context }     # chain 1 운영 컨텍스트 base
```

---

## 7. 검증 체크리스트

```
□ schema 검증 통과 (Ajv 8 strict / additionalProperties:false)
□ meta.source_grounded = true + meta.extraction_note 명시
□ build / run = object 또는 null (탐지 불가 = null + extraction.configs_missing 표기 / 추론 ❌)
□ 모든 추출 항목 source = {file, anchor, method} 명시 (method ∈ deterministic_parse | llm_read)
□ confidence: deterministic_parse=1.0 / llm_read ≤ 0.75
□ environment_variables[].name 만 (value ❌) + is_secret ∈ {true, false, null} + sensitivity ∈ enum
□ is_secret=true ⟹ default = null
□ extraction.evidence_trust = real_extraction (simulated reject)
□ extraction.configs_found / configs_missing 정직 표기
```

---

## 8. 한계 (정직)

- **추출 ≠ 검증** — 기록한 build/run 명령 실동작 미확인(chain 5 validator 영역). candidates·is_secret:null = 사람 확정.
- **is_secret heuristic** — keyword 기반 = 확률적. 모호는 null + human review(단정 ❌).
- **version_constraint = declared** — compose/manifest 선언 버전이지 실 동작 버전 아님.
- **llm_read ceiling 0.75** — Dockerfile/Makefile 추출은 결정론 아님(automation-boundary).
- **재현성** — skill-based 추출은 LLM-주도라 결정론 도구만큼 강하지 않음(source-grounded·deterministic parse 부분으로 완화).
- 1차 draft(opt-in) — 본체 MANDATORY 격상 전 / lean scope(elaborate 필드 defer).

---

## 9. PoC corroboration 자격

≥ 2 distinct paradigm PoC corroboration 의무. Node 모던(package.json/Dockerfile/compose/.env.example) + JVM/Gradle(build.gradle/application.properties / honest gaps: wrapper·Dockerfile·env 부재 = configs_missing) 2 paradigm 에서 ajv valid + secret-scan clean 입증(env names 미트립 = name vs value 판별).

---

## 인용

- schema: `schemas/run-manifest.schema.json`
- skill: `skills/analysis-run-manifest/SKILL.md`
- 결정: DEC-2026-06-09-build-run-env-manifest (본 산출물 신설 / 번호 정정 §2.2) · 모DEC DEC-2026-06-09-reverse-eng-methodology-gap §2.5 델타 #2-a
- 정책: `methodology-spec/policies/no-simulation.md` (source-grounded / 누락 정직 / value 미저장) · `methodology-spec/use-scenario-taxonomy.md` (P0 RUN 축)
- 선례 schema: `schemas/migration-cautions.schema.json` (negative 반대편) · `schemas/db-schema.schema.json` (sensitivity enum) · `schemas/inventory.schema.json` (stack) · `schemas/test-cmd.schema.json` (cmd+args shell-safe 필드)
- dogfood: `examples/poc-18-express-prisma-modern-ts/target/.ai-context/output/run-manifest.json` · `examples/poc-10-realworld-jpa-querydsl/.ai-context/output/run-manifest.json`
- sibling 산출물 번호: `methodology-spec/deliverables/24-sql-inventory.md` (#24) / #25 = recovered-adr 예약 / #16 = `16-error-mapping-spec.md` (무변경)
