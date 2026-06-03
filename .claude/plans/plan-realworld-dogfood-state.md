# plan — RealWorld dogfood 진행 상태 (resume note)

> **목적**: dep-graph / code_pointers 파이프라인을 깨끗한 외부 OSS repo에서 chain 끝까지 검증 (애초 의제 = `plan-code-pointers-intent-na.md` dogfood gate).
> **현재**: analysis baseline 완료 → **chain 1 discovery 완료 (gate #1 = stop / 사용자 결단)** → 다음 = **chain 2 spec (재개 대기)**.
> **세션 핸드오프**: 본 파일 = 재개 진입점. chain-intervention-log.jsonl 에 gate #1 stop 기록됨.

## chain 1 (discovery) 완료 사실 (2026-05-30)

- scope 결단 = **full-baseline** (4 BC / 19 endpoint / 14 BR 전부). 사용자 결단 (DEC-PLAN-001 / user-explicit).
- 산출물: `discovery-spec.json` (19 UC + 14 business_rules_intent) + `discovery-spec.md`.
- 검증 GREEN: discovery-extraction-validator **0 findings / UC coverage 100%** + schema-validator **valid** (discovery-spec.json→discovery-spec.schema.json 자동매핑 정상).
- dogfood finding: **F-DOGFOOD-002** (low / 템플릿 `meta.confidence` 객체형 ↔ 스키마 number 불일치) + **F-DOGFOOD-003** (medium / 사용자 메타 지적 "3 은 finding 아냐?" — discovery BR-INTENT reasoning 의 consequence→intent 과잉귀속 + 모호 마커 부재 / analysis Phase 4.7 비대칭). 5 reasoning `[관찰]/[결과]/[미검증]` 재기술. patch 후보 = schema `intent_certainty` enum + skill 규율 (§8.1 ≥2 corroboration 후 본체).
- code_pointers/code_pointers_na **미설정** (템플릿 충실 따름) — dep-graph 진단 보존 의도 (plan-code-pointers-intent-na.md 가설 검증용 / 패치 front-run 회피).
- gate #1 = **stop** (사용자 결단 2026-05-30). chain 2 는 추후 재개.

## chain 2 (spec) 완료 사실 (2026-05-30 / gate #2 = go)

- 산출물: behavior-spec.json (19 BHV / 1 UC=1 BHV) + acceptance-criteria.json (25 AC = 19 happy + 6 negative / layer=be + openapi contract / verifiable+placeholder TC) + .md 2 + behavior-diagrams.mermaid.
- validator GREEN: schema 2/2 valid + chain-coverage UC→BHV 100%·BHV→AC 100% + drift exit 0 + formal-spec-link 0 breaking.
- **본체 fix 시행 (gate #2 결단)**: F-DOGFOOD-005 — `check-links.js` planning_spec_path→discovery_spec_path + link.test.js 5 site (15/15 pass). v11.1.0 "≈0 carry" 반증. STOP-3 = workspace 790/791 (1 pre-existing poc-17 skill-citation 무관) + breaking 0.
- dogfood finding +2: F-DOGFOOD-005 (fixed) + F-DOGFOOD-006 (cross-ref 경로 base 불일치 / open). 잔여 carry: F-DOGFOOD-005 파일명 cascade (planning-spec.json).
- commit 대기 (chain 1 7 skill 은 49f05b8 로 push 됨 / chain 2 본체 변경 = check-links.js + link.test.js 미커밋).

## chain 3·4·5 + dep-graph 완료 (2026-05-30 / 한 session 관통)

- **chain 3 (plan / gate #3 go)**: task-plan.json (19 TASK + 3 ADR + 5 NFR + 4 RISK) / plan-coverage 0 findings·AC→TASK 100% / schema valid.
- **chain 4 (test / gate #4 go)**: test-spec.json (25 TC) + generated-tests/ (6 JUnit5+MockMvc 파일/25 메서드) / spec-test-link AC→TC 100% / test-impl-pass --dry-run. A 방식 (RED 면제 정직 / F-DOGFOOD-007).
- **chain 5 (implement) = env-blocked**: java/gradle 부재 → impl-spec GREEN 물증(const) 정직 생성 불가 / 조작 거부 = no-simulation 작동 (F-DOGFOOD-008). impl-spec 미생성.
- **dep-graph (dogfood 핵심 달성)**: artifact-graph.json (115 노드/161 엣지). code-pointer coverage **21.7%** (covered 25 TC / na 0 / missing 90) = plan-code-pointers 가설 정량 확인 (F-DOGFOOD-009). navigate/impact 정상 작동. graph-integrity orphans=4 (F-DOGFOOD-010).
- finding 누적 10 (F-DOGFOOD-001~010). 재개: chain 5 GREEN = Java11/Gradle 환경 + ./gradlew test. patch (plan-code-pointers + F-DOGFOOD-005 파일명 cascade) dogfood-gate 해소 → 시행 자격.

## CodeGraph OSS probe #2 (2026-05-30 / 사용자 메타 지적 trigger)

- **사용자 지적**: "codeGraph(OSS) 도 동작해야 하는데 안 된 게 잘못된 거야" — dogfood 가 내부 dep-graph(artifact-graph.json) 만 돌리고 **외부 CodeGraph OSS 를 누락** (절차 결함 / input.json isolation_note + DEC-2026-05-28 §2.3 carry 두 신호 있었음).
- **사후 실행**: `@colbymchenry/codegraph` v0.9.7 설치(권한 규칙 `Bash(codegraph:*)` 추가) → `codegraph init -i` → 138 files / 2,296 nodes / 4,452 edges / 955ms.
- **측정 결과 (DEC-2026-05-28 §2.3 carry 해소)**: **MyBatis 3 mapper layer cover 됨** (iBATIS 2=0 과 정반대) — XML SQL statement id→method 노드 ⭐⭐⭐ + Java 인터페이스↔XML 바인딩 ⭐⭐ (구조적 namespace+메서드명 바인딩 덕). 잔존 = SQL→DB table 경계 ❌ (table 노드 부재).
- 산출물: `.aimd/output/codegraph-mybatis3-probe.md` + finding **F-DOGFOOD-011** (누적 11). DEC: `DEC-2026-05-30-codegraph-probe-2-mybatis3.md` (methodology repo / INDEX 등재 / pure doc trail / release ❌).
- carry: (a) dogfood 절차에 외부 코드 그래프 도구 체크리스트화 / (b) chain-driver dep-graph(artifact-level) ↔ codegraph(symbol-level) 보조 lens 결합 — codegraph route→controller→service→mapper 체인으로 우리 artifact code_pointers(현 21.7%) 자동 보강 가능성(§8.1 ≥2 corroboration 후).

## (구) chain 3 (test) 진입점 — 시행 완료 (위 참조)

- skill: `test-generate-test-spec` → 25 AC → TC + 실 test 코드 (RED 의무) + test-spec.{json,md}.
- **개념 fork**: chain harness RED 의무("impl 부재 → 모든 test fail")는 greenfield 전제. RealWorld 는 brownfield (impl 이미 존재) → 생성 test 는 기존 코드에 GREEN. RED 해석 결단 필요 (characterization vs round-trip 재생성 vs RED 면제).
- **환경 의존**: framework = JUnit5 + Spring Boot Test (Java/Gradle). test 실행 = Gradle 빌드 필요 → Windows 환경 carry (static-security/baseline 과 동류 / no-simulation 정합 — 실행 불가 시 RED/GREEN 검증 carry).
- code_pointers: TC 는 template source_file → builder 자동 (plan-code-pointers 표상 covered). chain 4~5 graph 합성 시 UC/BHV/AC code_pointers 미설정 실측 예정.

## (구) chain 2 재개 진입점

- skill: `spec-compose-behavior-spec` → 19 UC + analysis formal-spec(decision-table 4 + sequence 2) → behavior-spec.{json,md} (BHV-\*, UC→BHV 1:N forward link).
- 이어서 `spec-derive-acceptance-criteria` (AC Gherkin / verifiable=true 시 test_case_refs≥1) + `spec-integrate-deliverables` (cross_links backward link).
- validator: chain-coverage-validator + spec-test-link-validator + schema-validator → gate #2.
- discovery-spec 의 acceptance_criteria_refs (AC-USER-001 등 19개) 가 chain 2 에서 실제 AC 로 구체화되어야 함 (forward link 충족).
- dep-graph 가설 (plan-code-pointers-intent-na.md): UC 에 code_pointers 미설정 상태 유지 — chain 4~5 graph 합성 + navigate/impact 시점에 code-pointer coverage 실측 예정.

## 1. 대상 / 위치

| 항목          | 값                                                                                     |
| ------------- | -------------------------------------------------------------------------------------- |
| repo          | gothinkster/spring-boot-realworld-example-app @ `ee17e31`                              |
| 작업 디렉토리 | `~/Documents/Developments/AI/_dogfood-realworld/spring-boot-realworld-example-app/`    |
| 산출물        | `<위>/.aimd/output/` (23종) + `<위>/.aimd/input.json`                                  |
| 스택          | Spring Boot 2.6.3 / Java 11 / MyBatis 3 / DDD+CQRS / GraphQL DGS / JWT / SQLite+Flyway |
| paradigm      | Modern (R1' ~60~67%) — PoC #08 realworld-mybatis isomorphic                            |

## 2. analysis baseline 완료 사실 (2026-05-30)

10/10 phase (template-analyze skip / ui N/A backend-only). 전부 schema-valid.

- discovery: inventory.json / stack-detection.md / tree.md / stats.json
- db-schema: schema.json / erd.mermaid / db-schema-validation-report.md (7 테이블, F-DB-001~005)
- architecture: architecture.json/.mermaid/.md (clean, 12 모듈, 순환 0, 위반 0)
- business-logic: domain.json/.mermaid (4 BC) + business-rules.json (**14 BR**, id strict)
- formal-spec: formal-spec.json (decision-table 4 + sequence 2 / FSM·invariant·property 빈배열=정직)
- characterization: characterization-spec.json (3 snapshot / 6 scenario / 전부 intent)
- sql-inventory: sql-inventory.json (**44 SQL** / CQRS / dynamic 0)
- api: openapi.yaml (19 endpoint / spectral 0 errors) + error-mapping-spec.json (positive-space) + api.md
- quality: antipatterns.json (3 DB AP) + avoid-list.md + migration-cautions.md

## 3. dogfood 실측 (도구 검증 결과)

- ✅ schema-validator 11연속 green / sql-inventory-validator 0 findings(44) / spectral 0 errors / BR id strict 통과.
- 🐛 **F-DOGFOOD-001**: artifact 파일명 `schema.json` ↔ schema-validator 자동매핑(`schema.schema.json`) 불일치 → skip. db-schema는 `--schema` 명시 필요. (파일명 컨벤션 ↔ validator 매핑 마찰 / 실사용 노출 finding)
- ⏸ baseline+ratchet(ADR-010) + static-security = 환경 의존 deferred (Windows SpotBugs/Semgrep 부재 / carry `C-realworld-baseline-tool-env` / no-simulation 정합).

## 4. 다음 턴 진입 = chain 1 discovery

- skill: `discovery-from-analysis-output` (analysis baseline → discovery-spec).
- 절차: UC 분해(`discovery-decompose-use-cases`) + BR-INTENT(`discovery-identify-business-intent`) → discovery-spec.{json,md} → discovery-extraction-validator + schema-validator → gate #1.
- scope 결단 필요: full(6 BC 전부 UC) vs 1 feature(Article 등). car-list pilot처럼 단일 scope 권장.
- 이후 chain 2~5 → traceability-matrix-builder --graph → artifact-graph.json → `chain-driver navigate/impact` → **code_pointers coverage 실측** (UC/BHV/AC/TASK 빠지는지 = plan-code-pointers-intent-na.md 가설 검증).

## 5. 본 레포 영향

- methodology body 변경 ❌ (산출물은 전부 외부 \_dogfood 디렉토리 / 본 plan 파일만 본 레포 .claude/plans/).
- self-referential drift 회피 — 패치(plan-code-pointers-intent-na.md)는 dogfood 실측 후 정당화.

## 6. task 상태 (TaskList)

- #1~#9 completed (analysis 10 phase). #10 pending = "analysis baseline 종결 → chain 1 discovery 진입".
