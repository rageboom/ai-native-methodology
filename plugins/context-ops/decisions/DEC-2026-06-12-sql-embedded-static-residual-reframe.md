# DEC-2026-06-12-sql-embedded-static-residual-reframe

**결단**: "real-DB 천장 carry" 개념을 **reframe**. SQL-embedded 결정 로직(MyBatis/iBATIS XML 등 ORM 매퍼에 박힌 규칙)은 **DB 접근 없이** `data_source_status=code_only` + `snapshot.sql_id`(매퍼 statement id) + `behavior_to_preserve`/`behavior_likely_bug` 로 **소스만으로 정적 특성화**한다(구조·동적분기·formal predicate·엔진종속 위험). 이때 산출물은 **"static-annotated intent spec / specified oracle (pre-execution)"** 이며 **"정적 characterization 완료/종결"이 아니다**(Feathers §13 정의상 characterization=실행 의무 → 가짜 GREEN 오독 차단). **런타임 정합**(실데이터에서 의도한 행 집합 반환 여부)은 `real_integration_score=0` 의 **QA·통합 carry**(방법론 deliverable 밖)로 **반드시 병기**. residual 2종 구분 = **(a) 도구-환경 부재**(R19 Tier 2) vs **(b) 산출물-본질**(SQL-embedded). **DB 접속/testcontainer 를 방법론이 요구하지 않으며**, (b) 를 GREEN 으로 승격하면 no-simulation 위반. 본 구분·신호는 **reference-lens soft 정책**(`REQUIRED_VALIDATORS_PER_STAGE` 미편입 / DEC-2026-05-28 codegraph method-axis 동형). SQL-embedded 전용 schema enum/layer 박제는 §8.1 상 **propose-only**(≥2 distinct 도메인 corroboration 후 / 현재 `layer=integration`+`sql_id` 표현 충분).

**작성일**: 2026-06-12 (사용자 채널: ep-be-gea event "모두 완료됐나" → "왜 구현 42%인가" → "왜 real DB 필요한가" → **"DB 접근 안 한다 / 프로젝트만으로 모두 파악 가능해야 한다"**(불변 제약 천명) → "둘다"(4 AC 정적 characterization + 본체 reframe 동시 승인 / AskUserQuestion: 상태·용어=정적명세+런타임carry / 본체범위=doc·policy 3건)).

**version**: 버전 bump 없음 (doc/policy 명료화 / behavior·schema·code·gate 무변경 — `DEC-2026-06-10-3a-automation-ceiling-deflate-operability-reframe` "docs / 버전 bump 없음" 선례 동형).

**relates to**:
- `methodology-spec/policies/no-simulation.md` §4 (residual 2종 구분 단락 신설 / 인용 등재) — **canonical SSOT**.
- `methodology-spec/deliverables/23-characterization-spec.md` §11.1 (SQL-embedded 술어 항목 신설).
- `decisions/STATUS.md` (L24·L30·L36 "real-DB 천장 / SQL Server testcontainer" prose → 정적특성화+런타임 QA carry reframe).
- `DEC-2026-05-28-codegraph-probe-결과` §4.2 (reference-lens 경계 = 정적 산물 게이트 inject 영구 ❌ — 동형 상속).
- `DEC-2026-06-06-tool-allowlist-pmd-only` / `DEC-2026-05-18-runtime-tool-exclusion` (R19 Tier — environment-dependent carry = residual (a)).
- `schemas/characterization-spec.schema.json`(data_source_status enum / sql_id / behavior_likely_bug — **이미 존재** = diagnose-before-design / 무변경) + `schemas/impl-spec.schema.json`(real_integration_score — 무변경).
- `feedback_diagnose_before_design_check_existing.md`(신규 tier 추가 회피) + `feedback_quality_priority.md`(§8.1) + `feedback_no_static_tool_simulation.md`(가짜 GREEN 금지).

---

## 1. 배경 (사용자 제약 천명)

ep-be-gea event scope dogfood 에서 4개 AC(007 적격성 / 016 재추첨 rollback / 017 DRAWN 완료판정 / 022 미당첨통지)가 "SQL-embedded 로직"이라 런타임 GREEN 불가로 carry 되어 있었다. 이를 "SQL Server testcontainer 통합테스트로 해소"한다는 prose 가 STATUS.md·impl-spec 에 잔존. 사용자가 **"이 과정에서 DB 접근 안 한다. 그건 하면 안 된다. 프로젝트만 가지고 모두 파악 가능해야 한다"** 고 불변 제약을 천명 → testcontainer 권고가 ① 방법론 이식성 5종 원칙(환경 무관) ② P0(산출물=프로젝트에서 추출한 LLM 운영 컨텍스트) 과 충돌하는 self-기록 drift 로 판명.

## 2. diagnose-before-design (신규 tier 추가 회피)

12-agent 진단+설계 workflow 실측 결과 — **정적 characterization tier 는 본체에 yes_full 로 이미 존재**:
- `characterization-spec.schema.json` `data_source_status` enum = `[real_db, real_environment, existing_test_file, code_only, domain_expert_interview, carry]` — `code_only`(실행 없는 정적 추출) + `carry`(런타임 잔여)가 곧 이 tier.
- `snapshot.sql_id` 필드로 MyBatis 매퍼 id 핀 + `behavior_to_preserve`/`behavior_likely_bug` 로 SQL 로직 정적 명세 가능.
- char-coverage-validator 가 `code_only` 를 high 아닌 **medium carry** 로 처리(DEC-2026-06-11 F-R2-32) + Layer 3 evidence cross-check 가 허위 real-source claim 을 critical block = **정적 tier ≠ 런타임 tier 분리가 코드 박제**.

→ 신규 schema/validator/tier 추가는 **중복(diagnose-before-design 위반)**. 진짜 본체 델타 = (1) testcontainer prose 충돌 정정 + (2) residual 2종 구분 명문화 + (3) deliverable 예시 = **doc/policy 3건**뿐.

## 3. 물증 (no-simulation + §8.1)

- **4 AC 정적 characterization 산출(소스만 / DB 0)**: 규칙 predicate + formal predicate + 동적분기 매트릭스 + 엔진종속 위험 레지스터(`DEPT_CD_PATH LIKE '%code%'` 부분문자열 오매칭 / `GETDATE()` 시각의존 / `NOT EXISTS`+NULL 3치 / collation) + 소스확정 vs 런타임잔여 분리. **부수 발견**(정적): AC-007 적격성 = SQL/Java 이중 구현 비등가 위험 / AC-016·017 = state-guard 부재(동시성·역행) / AC-022 = AC 가 가리킨 SQL 위치 오류(실제는 `findLosersByDetailIds`).
- **§8.1 경계 자체 corroboration**: industry-case 7개 독립 OSS(SQLFluff/sqlc/Calcite/ZetaSQL/Coral/maplint/sonra) 가 동일 hard boundary 확인 — 파싱·문법·구조추출·제한적 타입체크 = DB 없이 가능 / 테이블·컬럼 존재·JOIN 정합·**런타임 결과집합** = 정적 불가. 정적/런타임 2-tier 분리는 업계 표준 패턴(경계 자체는 단일 PoC 아님). **단** SQL-embedded 전용 enum 박제는 ep-be-gea 단일 도메인 → propose-only.
- **적대적 검증 verdict = revise**(반영 완료): ① "종결/static characterization 완료" 어휘 금지(Feathers 모순·가짜 GREEN) ② testcontainer prose 선행 제거 ③ schema enum propose-only ④ `real_integration_score=0` 의미(순수로직 정상 vs SQL-embedded 미통합) prose 분리.

## 4. honesty guardrails (가짜 GREEN 차단)

1. **어휘 차단**: "static characterization 완료/종결" 금지 → "static-annotated intent spec / specified oracle (pre-execution)" + "runtime residual carry".
2. **병기 의무**: SQL-embedded AC 는 `code_only` + `real_integration_score=0` 동시 emit. GREEN 표기 ❌.
3. **reference-lens**: 정적 SQL 신호 = 코드/XML 만 본 산물 → 게이트 inject 영구 금지(DEC-2026-05-28 동형).
4. **testcontainer/dbunit 권고 영구 제거**: 본체로 가는 어떤 문서에도 DB 컨테이너 해소책 금지 — "실데이터 정합 = QA·통합 carry" 로만 reframe.
5. **score=0 의미 분리**: `real_integration_score=0` 이 "외부의존 없는 순수로직(정상)" 인지 "SQL-embedded mock 순환(미통합)" 인지 prose 손분리(SQL-embedded = 후자).

## 5. 적용 범위 / 비적용

- 적용: doc/policy 3건(본체) + ep-be-gea PoC 산출물(characterization-spec / impl-spec prose / 외부격리·commit❌·사내 식별자 미기재).
- 비적용(propose-only / 미착지): `characterization-spec.schema.json` snapshot.layer `sql_embedded` enum + optional `residual_kind` enum(`tool_env_absent`/`sql_embedded_runtime`/`domain_ambiguous`) — ≥2 distinct SQL-embedded 도메인 또는 `resolution_kind`(DEC-2026-05-21 §C2 미구현) 통합 설계 후.
