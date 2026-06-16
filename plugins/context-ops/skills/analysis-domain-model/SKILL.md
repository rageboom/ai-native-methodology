---
name: analysis-domain-model
description: Use after analysis-architecture to extract domain model (entities, aggregates, value objects, bounded contexts). DDD-style. Generates domain.json (산출물 2). Required prerequisite for analysis-business-rules. Stage = analysis. 사용자: "도메인 모델 추출" / "엔티티 분석" / "DDD 모델링".
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-domain-model — 도메인 모델 추출

DDD 원칙 기반. Entity / Aggregate / Value Object / Bounded Context 식별.

## 사전 조건

- `<user-project>/.ai-context/base/shared/architecture.json` 존재 (또는 manifest.analysis_refs.artifacts 해소)
- 가급적 `business-logic` phase (§8.1 단일 PoC 과적합 회피) — 같은 도메인이 여러 PoC / module 에서 일관 식별되는지 cross-check 권장

## 절차

1. **Entity 식별** — JPA `@Entity` / Prisma model / TypeORM / SQLAlchemy / 도메인 객체 추출
2. **Aggregate root 식별** — entity 간 ownership 관계 (composition vs reference)
3. **Value Object 식별** — immutable / no-identity 객체
4. **Bounded Context 분리** — 같은 도메인 용어가 다른 의미로 쓰이는 경계
5. **Ubiquitous Language 기록** — 한국어/영어 용어 매핑 (한국어 정책)
6. **비즈니스 컨텍스트 추출 (의무 / C-domain-schema-stakeholders)** — `stakeholders[]` (도메인 actor / 이해관계자 — 코드 주석·docs·도메인 노트 source-grounded 추출 / 예: 차량관리자, 회계담당자) + `business_intent_summary` (도메인 비즈니스 의도 한 줄 요약) 작성. 신규 산출 시 **두 필드 모두 채움 의무** (source 신호 부재 시 hallucination ❌ — 미상은 생략하되 `meta.confidence` 반영). 전체 비즈니스 이해관계자 / 성공 기준은 discovery-spec `business_intent` 가 SSOT — domain 은 도메인 actor 초점.
7. **domain.json 작성** — `schemas/domain.schema.json`:
   - 7-1. **`bounded_contexts[]` verdict 자동 산출 (의무 / required 필드)** — 각 BC 엔트리는 `verdict` + `verdict_basis` 를 **반드시** 포함한다. 해당 BC 의 `sql-inventory/sql-inventory.json` `summary.by_type` 에서 `write_ops`(= insert + update + delete) / `read_ops`(= select) 를 도출해 `verdict_basis` 에 채운다.
     - **`write_ops > 0`** ⟹ 쓰기 aggregate 소유 = **rule 판정 `core`** (per-BC `domains/<BC>/`). 단 역할상 보조 BC 면 `supporting` (= `decided_by: "human-override"`).
     - **`write_ops == 0`** ⟹ 소유 없는 횡단 — `cross_cutting`(미등록·shared/cross-cutting/`<module>/`) / `read_model`(타 BC aggregate 읽기 투영) / `operational`(배치) 중 **human 판정**.
     - `verdict` enum = `[core, supporting, cross_cutting, read_model, operational]`.
     - `verdict_basis` = `{write_ops, read_ops, owned_aggregates, decided_by(rule|human-override)}`.
     - `verdict_basis.write_ops` 는 **실제 sql-inventory `summary.by_type` 와 일치**해야 한다 (verdict-consistency-validator 가 basis 를 sql-inventory 와 대조 — HARD 게이트).
   - 7-2. **`tier` 명시 선언 (권장 / optional 필드)** — 각 BC 엔트리에 `tier`(enum `[baseline, characterized, full-leaf]`)를 **달성 의도 분석 깊이**로 명시한다. `baseline`=business-rules+openapi+sql-inventory / `characterized`=+characterization / `full-leaf`=+bc-scope·domain·findings-analysis·migration-cautions·README. **파일 유무로 추론하지 말 것** — verdict-consistency-validator 는 선언 tier 의 mandatory 보유만 advisory(low) 검사하고 미선언 BC 는 skip 하므로, use_cases-backfill leaf(domain.json 1개)가 full-leaf 로 오판되지 않는다.
   ```json
   {
     "meta": {...},
     "stakeholders": ["차량관리자", "회계담당자"],
     "business_intent_summary": "차량 자산 등록·비용 산출·ERP 슬립 연계",
     "bounded_contexts": [
       {
         "id": "...",
         "tier": "full-leaf",
         "verdict": "core",
         "verdict_basis": {
           "write_ops": 12,
           "read_ops": 30,
           "owned_aggregates": ["..."],
           "decided_by": "rule"
         }
       }
     ],
     "ubiquitous_language": [...]
   }
   ```

## 산출물

`<user-project>/.ai-context/base/shared/domain.json`

**multi-BC append (F-1)**: domain.json 은 repo-wide BC 카탈로그(shared/). 여러 BC 가 누적될 때 domain.json 을 **통째 재생성 ❌**(BC#2 가 BC#1·event·golf 덮음). `tools/_shared/append-catalog.js` 의 `appendBoundedContext(domainPath, bcEntry, ulAdditions)` 사용 = `bounded_contexts[]` upsert-by-`id`(sibling BC 보존) + `ubiquitous_language` term dedup 병합 + 기존 indent 보존.

## greenfield (code-optional) mode

`work-unit-manifest.scenario == "greenfield"` (legacy 코드 없음 / use-scenario-taxonomy §2.4 옵션 A) 일 때 — `@Entity`/ORM 스캔 대신 **입력어댑터 extract** 에서 산출:

- 입력 = `.ai-context/scopes/<scope>/planning/{swagger,figma,plan-doc,prompt}-extract.json` (`analysis-greenfield-bootstrap` 진입점 / `analysis-input-orchestrate` greenfield 분기).
- entity 후보 = swagger `domain_seed[]` + schema 이름/required 필드 / figma 화면 entity / PRD 도메인 용어. aggregate/VO/bounded-context = 설계 의도(inferred) 기반.
- `source_grounded_evidence` = **입력 출처 인용** (코드 grep ❌): `swagger:SchemaName` / `figma:node_id` / `doc:§N`.
- `code_pointers` = N/A (`meta.code_pointers_na` 동형 사유 / 가리킬 코드 부재). domain.schema.json 은 code_pointers hard-require ❌ → 산출물 schema-valid.
- intent_certainty 강조 = `inferred`/`intent` (설계 의도 / S2 의 verified intent 와 대비 / use-scenario-taxonomy §2).
- 무회귀: scenario ≠ greenfield 시 본 절 무시 (legacy ORM/Entity 추출 경로 그대로).

## schema enum 주의 (산출 전 필독)

병렬 추출 시 자주 나는 위반(schema-validator RED):

- **`aggregates[].invariants[].enforced_by`** ∈ `entity_method` / `orm_constraint` / `db_constraint` / `service_check` / `unknown`. (예: SQL predicate 로 거르는 규칙 = "sql_predicate" ❌ → `service_check`)
- **`entities[].persisted_to`** = **string**(테이블 1개 이름). 다중 테이블이면 배열 ❌ → `"USR_A, USR_B"` 처럼 단일 문자열로.
- 산출 직후 `node ../../tools/schema-validator/src/cli.js .ai-context/base/shared/domain.json` 으로 enum/type 확인(validate→repair).

## 다음

- **산출 후 (F-2)**: `node ../../tools/schema-validator/src/cli.js .ai-context/base/shared/domain.json` 으로 enum/type RED 0 확인(skill-direct/multi-agent 경로는 gate#0 자동 미실행 / validate→repair).
- `analysis-business-rules` 호출 권장

## 인용

- 정책: methodology-spec/workflow/business-logic.md §5 (4영역 병렬 추출 / domain 매핑 = §5.A ORM 메서드 + §5.B FE 도메인 분기)
- 정책: methodology-spec/deliverables/2-domain.md
- 정책: methodology-spec/use-scenario-taxonomy.md §2.4
- 결단: DEC-2026-05-30-use-scenario-taxonomy
- 결단: DEC-2026-06-12-resve-multidomain-corroboration §4·§F-1·§F-2 (schema enum 주의 + 카탈로그 writer append-catalog + analysis exit-gate 근거)
- 결단: DEC-2026-06-15-bc-verdict-classification (BC verdict 분류 규칙 / write_ops 기반 rule 판정 + verdict_basis sql-inventory 대조 근거)
- schema: schemas/domain.schema.json
- ADR: ADR-004 (DDD), ADR-005 (한국어)
