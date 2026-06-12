---
name: analysis-domain-model
description: Use after analysis-architecture to extract domain model (entities, aggregates, value objects, bounded contexts). DDD-style. Generates domain.json (산출물 2). Required prerequisite for analysis-business-rules. Stage = analysis. 사용자: "도메인 모델 추출" / "엔티티 분석" / "DDD 모델링".
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-domain-model — 도메인 모델 추출

DDD 원칙 기반. Entity / Aggregate / Value Object / Bounded Context 식별.

## 사전 조건

- `<user-project>/.ai-context/output/shared/architecture.json` 존재 (또는 manifest.analysis_refs.artifacts 해소)
- 가급적 `business-logic` phase (§8.1 단일 PoC 과적합 회피) — 같은 도메인이 여러 PoC / module 에서 일관 식별되는지 cross-check 권장

## 절차

1. **Entity 식별** — JPA `@Entity` / Prisma model / TypeORM / SQLAlchemy / 도메인 객체 추출
2. **Aggregate root 식별** — entity 간 ownership 관계 (composition vs reference)
3. **Value Object 식별** — immutable / no-identity 객체
4. **Bounded Context 분리** — 같은 도메인 용어가 다른 의미로 쓰이는 경계
5. **Ubiquitous Language 기록** — 한국어/영어 용어 매핑 (한국어 정책)
6. **비즈니스 컨텍스트 추출 (의무 / C-domain-schema-stakeholders)** — `stakeholders[]` (도메인 actor / 이해관계자 — 코드 주석·docs·도메인 노트 source-grounded 추출 / 예: 차량관리자, 회계담당자) + `business_intent_summary` (도메인 비즈니스 의도 한 줄 요약) 작성. 신규 산출 시 **두 필드 모두 채움 의무** (source 신호 부재 시 hallucination ❌ — 미상은 생략하되 `meta.confidence` 반영). 전체 비즈니스 이해관계자 / 성공 기준은 discovery-spec `business_intent` 가 SSOT — domain 은 도메인 actor 초점.
7. **domain.json 작성** — `schemas/domain.schema.json`:
   ```json
   {
     "meta": {...},
     "stakeholders": ["차량관리자", "회계담당자"],
     "business_intent_summary": "차량 자산 등록·비용 산출·ERP 슬립 연계",
     "bounded_contexts": [...],
     "ubiquitous_language": [...]
   }
   ```

## 산출물

`<user-project>/.ai-context/output/shared/domain.json`

## greenfield (code-optional) mode

`work-unit-manifest.scenario == "greenfield"` (legacy 코드 없음 / use-scenario-taxonomy §2.4 옵션 A) 일 때 — `@Entity`/ORM 스캔 대신 **입력어댑터 extract** 에서 산출:

- 입력 = `.ai-context/<scope>/planning/{swagger,figma,plan-doc,prompt}-extract.json` (`analysis-greenfield-bootstrap` 진입점 / `analysis-input-orchestrate` greenfield 분기).
- entity 후보 = swagger `domain_seed[]` + schema 이름/required 필드 / figma 화면 entity / PRD 도메인 용어. aggregate/VO/bounded-context = 설계 의도(inferred) 기반.
- `source_grounded_evidence` = **입력 출처 인용** (코드 grep ❌): `swagger:SchemaName` / `figma:node_id` / `doc:§N`.
- `code_pointers` = N/A (`meta.code_pointers_na` 동형 사유 / 가리킬 코드 부재). domain.schema.json 은 code_pointers hard-require ❌ → 산출물 schema-valid.
- intent_certainty 강조 = `inferred`/`intent` (설계 의도 / S2 의 verified intent 와 대비 / use-scenario-taxonomy §2).
- 무회귀: scenario ≠ greenfield 시 본 절 무시 (legacy ORM/Entity 추출 경로 그대로).

## 다음

- `analysis-business-rules` 호출 권장

## 인용

- 정책: methodology-spec/workflow/business-logic.md §5 (4영역 병렬 추출 / domain 매핑 = §5.A ORM 메서드 + §5.B FE 도메인 분기)
- 정책: methodology-spec/deliverables/2-domain.md
- 정책: methodology-spec/use-scenario-taxonomy.md §2.4
- 결단: DEC-2026-05-30-use-scenario-taxonomy
- schema: schemas/domain.schema.json
- ADR: ADR-004 (DDD), ADR-005 (한국어)
