# Changelog

본 방법론의 모든 변경 사항을 기록한다.

[Semantic Versioning](https://semver.org/lang/ko/) 준수:
- **MAJOR**: 기존 산출물과 호환 안 되는 큰 변경 (v1 → v2)
- **MINOR**: 호환 가능한 기능 추가 (v1.1 → v1.2)
- **PATCH**: 버그/누락 수정, 호환 가능 (v1.1.0 → v1.1.1)

---

## [v1.1.2] — 2026-04-28 ⭐ 현재

### 트리거

PoC #01 (RealWorld Spring Boot) Phase 0~3 완료 + **F-021 누적 finding 임계** (18/20 도달) → 사용자 결정 Option A (PoC 정지 + v1.1.2 격상). high severity finding 4건 처리:
- F-007: inventory.schema.json + template 부재 (high)
- F-009: phase-1-init.md §6 신뢰도 표 환경 종속성 미명시 (high)
- F-016: phase-2-db.md §3.4 ddl-auto 매트릭스 부재 (high)
- F-023: phase-3-arch.md §3.1 Tarjan SCC vs 도메인 의도 분기 가이드 부재 (high)

### 변경 사항

#### Added (추가)

**schemas/inventory.schema.json (신규)** — F-007

- meta + repo + stack + architecture_style_candidates + modules_for_priority_analysis + directory_tree_extraction
- `repo.loc_extraction_method` enum (deterministic / heuristic_byte_per_35 / estimation / unknown) — F-009 결정성 축
- `architecture_style_candidates[].confidence` cap 0.7 (Phase 1 한계, 최종 분류는 Phase 3)
- `directory_tree_extraction.truncated` boolean — Trees API 한계 명시
- 산업 모델: Backstage Catalog Entity descriptor

**templates/inventory.template.json + inventory.template.md (신규)** — F-007

- placeholder 형식 + 사람용 README 형식 분리
- meta.warnings 의무화 항목 (heuristic LOC, truncated tree, ORM 단서 부족 등)

**schemas/README.md (신규)** — F-007

- 9개 schema 목록
- CI 검증 TODO (v1.3.0 도입 예정 — Backstage 진화 모델)
- v1.1.2 임시 정책: 수동 ajv 검증 권장
- 산업 사례 경고: OpenAPI 3.0→3.1 7년 divergence

**ADR-006 (신규, Provisional)** — F-023

- 순환 의존성 처리 default 정책
- hybrid (탐지 결정적 + 분류 BC 분기 + decision_required 페어)
- bc_status 3값 enum (same / different / undefined) + bc_assignment_explicit boolean + documented_decision boolean
- BC 미정의 default = medium + decision_required = true (ArchUnit FreezingArchRule 산업 표준)
- "intent" 단어 회피 (산업 표준 도구 0건 사용)
- revisit_at: PoC #02 완료 시점

#### Changed (변경)

**phase-1-init.md §6 신뢰도 표** — F-009

- 단일 표 + 결정성 (Determinism) 축 + 환경 caveat 컬럼 채택
- 결정성 tier: deterministic / snapshot-based / heuristic / pattern_matching / llm_with_grounding / llm_code_only
- inventory.meta.warnings 의무화 가이드 추가
- 산업 표준 5건 정합 (CodeQL `@precision` / Sourcegraph SCIP / Linguist / SonarCloud / tree-sitter)
- 안티 패턴 명시: "환경별로 표 자체를 분리" 거부 (DRY 위반 + enum 폭발 + 산업 표준 0건)

**phase-2-db.md §3.4 통합 우선순위** — F-016

- 7행 매트릭스 → **원칙 + Decision Tree + 부록 reference** 구조
- 원칙 3개 (자동 schema 변경 금지 / DDL versioned-reviewable-reversible / ORM = validate 한정)
- Decision Tree (마이그레이션 도구 도입 가능 → 운영 DB 존재)
- 부록 A: Hibernate ddl-auto enum 값 reference (운영 가능 여부 표시)
- 산업 권위 7/7 매트릭스 반대 (Vlad Mihalcea / Stripe / Atlasgo / Quesma) → 원칙 표준 채택

**phase-3-arch.md §3.1 순환 의존성 처리** — F-023

- §3.1.1 신설: Tarjan SCC + BC 분기 + decision_required 5단계
- 분류 표 + 도구 정책 분기 (Spring Modulith verify() / ArchUnit FreezingArchRule)
- §3.1.2 산출 형식 (architecture.json circular_dependencies[] 예시)
- ADR-006 참조 의무

**schemas/architecture.schema.json `circular_dependencies[]` 보강** — F-023

- 신규 옵셔널 필드 7개: id / detection.algorithm / bc_status / bc_assignment_explicit / documented_decision / decision_required / decision_owner / decision_deadline / phase_4_routing
- 모두 옵셔널 → v1.1.1 산출물 호환 (PATCH 가능)

#### Documentation (문서)

- `methodology-v1.1/.claude/plans/plan-v112.md` — 1원칙 산출물 (변경 계획)
- `methodology-v1.1/.claude/researches/document-v112.md` — 공식문서 24개 출처
- `methodology-v1.1/.claude/researches/senior-v112.md` — 시니어 의견
- `methodology-v1.1/.claude/researches/case-v112-{f007,f009,f016,f023}.md` — 사례 (분리 재실행)
- `methodology-v1.1/.claude/researches/research-v112.md` — 통합 (Q1~Q9 결정 매트릭스)
- `methodology-v1.1/.claude/PROGRESS-v112.md` — 진행 로그 (시간순)

### Migration Guide (이전 사용자용)

본 v1.1.2 는 **하위 호환** (PATCH). 모든 schema 변경은 옵셔널 신규 필드.

기존 v1.1.1 산출물에 다음 권장:
1. `inventory.json`: 신규 schema 로 검증 (`ajv validate -s schemas/inventory.schema.json`). 누락 필드는 옵셔널이므로 통과.
2. `inventory.meta.warnings`: 환경 종속/추정 항목 명시 (heuristic LOC, truncated tree)
3. `architecture.json` 의 `circular_dependencies[]`: `bc_status=undefined` + `decision_required=true` 추가 권장 (BC 미정의 시 default)
4. `architecture.meta.warnings`: "v1.1.2 분기 가이드 적용 시 재산정 권장" 추가

### 영향 범위

- ✅ 본 방법론을 사용하는 모든 새 분석 (inventory schema 검증 + 결정성 표 + 원칙 + Decision Tree + 순환 분기 가이드)
- ✅ 본 방법론으로 만든 v1.1.0/v1.1.1 산출물 (호환, warnings 추가만 권장)
- ❌ Breaking change 없음

### 검증

- 9개 schema (inventory 신설 포함) JSON Schema Draft 2020-12 문법 통과
- ADR-006 (provisional) 정합성: ADR-001 / ADR-004 와 충돌 없음
- 사료 강도: 4 finding 모두 1차 사료 직접 검증 (Drotbohm Discussion #493 / Vlad Mihalcea / CodeQL @precision / Backstage Entity.schema.json)
- F-015 cross-validation 패턴 적용 (sub-agent 결과 6건 모두 메인 cross-check)

### Lessons Learned

- 1원칙 (plan) 단계에서 변경 매트릭스가 PoC 사례 1건 (RealWorld) 에 너무 적합화됨 → research 통해 BC 미정의 default 가 PoC #02 (마이크로서비스) 에서 부적합 가능성 발견 → ADR-006 provisional 처리
- case agent 4 finding 일괄 처리는 hang 위험 (한국 테크블로그 Cloudflare 추정) → 1건씩 분할 + 한국 테크블로그 제외 + WebFetch 8회 제한이 안정적
- senior + case 가 plan 초안의 "intent" 단어를 동시 거부 → schema 어휘 결정 시 산업 표준 도구 조사 우선

---

## [v1.1.1] — 2026-04-26

### 트리거

PoC #01 (RealWorld Spring Boot) Phase 0에서 발견된 명세 빈틈 2건 해결:
- F-003: 신뢰도 메타데이터 자동 산정 공식 부재 (high)
- F-006: 영역별 가중 평균 방식 부재 (high)

### 변경 사항

#### Added (추가)

**ADR-003 §6~§10 (103 → 301 라인, 3배 확장)**

- §6 산정 공식 v1 (가법 모델 + 상한 0.98)
  - base_confidence: 0.75 (소스만 기준)
  - 가산점 표 10개 (ERD +0.10, ORM +0.10, ...)
  - 페널티 표 5개 (drift -0.05, no_orm -0.05, ...)
  - PoC #01 적용 예시
- §7 영역별 가중 평균 (요소 수 가중)
  - 공식: `weighted_avg = Σ(conf × element_count) / Σ(element_count)`
  - cap 우선순위: weighted 후 min(0.98, weighted)
- §8 추출 방법별 신뢰도 표
  - 결정적: 0.95~1.0
  - 패턴 매칭: 0.80~0.90
  - LLM 추론 (grounding): 0.50~0.75
  - LLM 추론 (코드만): 0.40~0.60
- §9 신뢰도 해석 가이드 (5단계)
  - ≥0.95 거의 확실 / 0.80~0.95 신뢰 가능 / 0.60~0.80 권장 / 0.50~0.60 필수 / <0.50 차단
  - confidence ≠ accuracy 명시
- §10 v1 한계 명시 (calibration 필요, 베이지안은 v2 후보)

**meta-confidence.schema.json 신규 필드 5개**

- `formula_version: "v1"` — 공식 버전 추적
- `applied_modifiers[]` — 어떤 가산점이 적용됐는지
- `applied_penalties[]` — 어떤 페널티가 적용됐는지
- `cap_applied: boolean` — 0.98 cap 적용 여부
- `manual_override: boolean` — 사용자 수동 변경 여부

**meta-confidence.schema.json 구조 강화**

- `confidence_breakdown` 항목에 `element_count` 추가 (가중 평균용)
- `confidence_breakdown` 항목에 `extraction_method` enum 추가 (deterministic/pattern_matching/llm_with_grounding/llm_code_only)
- `inputs_used` enum 확장 (domain_context_md, postman_or_api_test, diagrams_other 추가)

**PoC #01 산출**

- `examples/poc-01-realworld-spring/source-info.md` — 분석 대상 메타정보
- `examples/poc-01-realworld-spring/inputs/domain-context.md` — LLM grounding
- `examples/poc-01-realworld-spring/inputs/_manifest.yml` — 입력 + 신뢰도 산정
- `examples/poc-01-realworld-spring/findings/poc-findings.md` — 명세 빈틈 누적 기록

#### Changed (변경)

**confidence cap 통일 (1.0 → 0.98)**

- `meta-confidence.schema.json`: confidence maximum 1.0 → 0.98
- `antipatterns.schema.json`: confidence maximum 1.0 → 0.98
- `rules.schema.json`: confidence maximum 1.0 → 0.98
- 산출물 명세 7개 검증 + 9곳 보정:
  - `01-아키텍처.md`: 모듈 식별/의존성/순환 의존성 1.0 → 0.98
  - `04-DB-스키마.md`: 운영DB 추가 시 1.0 → 0.98 (3곳)
  - `06-안티패턴.md`: static_analysis 1.0 → 0.98, "1.0 가능" → "0.98 cap까지"

**PoC #01 manifest 재계산**

- `expected_confidence_average`: 0.78 → 0.95 (정확한 공식 적용)
- `applied_modifiers` 명시: ORM full(+0.10), domain-context(+0.03), Postman(+0.05), diagrams(+0.02)

#### Documentation (문서)

- `plan-f003-신뢰도공식.md` — 해결 계획
- `research-f003-신뢰도공식.md` — 3-에이전트 토론 (가법 vs 곱셈 vs 베이지안 등 6개 주제)

### Migration Guide (이전 사용자용)

본 v1.1.1은 **하위 호환** (PATCH).

기존 v1.1.0 산출물에 다음만 권장:
1. `meta.formula_version: "v1"` 추가 (선택)
2. `confidence` 값이 1.0이면 0.98로 보정 (선택)
3. `confidence_breakdown` 항목에 `element_count` 추가 (가중 평균 정확도↑, 선택)

### 영향 범위

- ✅ 본 방법론을 사용하는 모든 새 분석 (자동 신뢰도 산정 가능)
- ✅ 본 방법론으로 만든 v1.1.0 산출물 (호환, 재계산 권장)
- ❌ Breaking change 없음

### 검증

- 8개 schema JSON 문법 통과
- 모든 ADR 일관성 유지
- 산출물 명세 7개 정합성 확인
- Mermaid 검증 (이전 사이클에서 완료)

---

## [v1.1.0] — 2026-04-26 (초기)

### 트리거

사내 표준 AI-Native 개발 방법론 v1.1 설계 (분석 단계 ① Analyze).

### 변경 사항

#### Added (초기 작성)

**ADR 5개**

- ADR-001: 사상적 기반 (Schema-First + Contract-First + DDD-Lite + FSD)
- ADR-002: 7대 산출물 (UI/UX 신설)
- ADR-003: 신뢰도 메타데이터 표준 (§1~§5)
- ADR-004: DDD-Lite 강도 B (Aggregate/VO/Repository)
- ADR-005: 한국어 용어 정책 (3단)

**산출물 명세 7개** (`methodology-spec/deliverables/`)

- 01 아키텍처
- 02 도메인 모델 (DDD-Lite B)
- 03 API 계약
- 04 DB 스키마
- 05 비즈니스 규칙
- 06 안티패턴
- 07 UI/UX 명세

**워크플로우 명세 12개** (`methodology-spec/workflow/`)

- Phase 0: 입력 정리
- Phase 1: init
- Phase 2: db (정합성 검증 포함)
- Phase 3: arch
- Phase 4: 비즈니스 로직 (4영역 병렬)
  - 5.A DB 영역
  - 5.B FE 영역
  - 5.C 설정 영역
  - 5.D 외부 의존성
- Phase 5-1: api
- Phase 5-2: ui
- Phase 6: quality

**JSON Schema 8개**

- meta-confidence, architecture, domain, openapi-extension, db-schema, rules, antipatterns, ui-spec

**템플릿 7세트** (`templates/`)

- architecture, domain, erd, api(yaml), rules, antipatterns, ui-spec
- Mermaid 다이어그램 템플릿 5개

**기타**

- 한국어 용어집
- README.md

### 통계

- 44개 파일 / 8,548 라인
- Mermaid 블록 68개 (모두 §9.1 표준 준수)

---

## 다음 마일스톤

### v1.1.3 (예정)

- 14건 잔여 finding 처분 (격상/기각/유예) — v1.1.2 머지 후 1일 작업 (research-v112.md §7 참조)
- F-001: 외부 레포 분석 시 git clone 대체 방법 미명시 (low)
- F-002: PoC source-info.md 명세 부재 (medium)
- PoC #01 Phase 4~6 진행 후 발견될 finding 누적 후 일괄 처리 예정.

### v1.2.0 (계획)

- v1.1.x PoC 누적 결과로 가산점/페널티 calibration
- 5.D (외부 의존성) 영역 보강 (사내 진짜 PoC 결과 반영)
- 복합 안티패턴 (AP-COMPOSITE-XXX) 명세 보강

### v2.0.0 (먼 미래)

- 베이지안 신뢰도 모델 (§ADR-003 §10)
- 풀 DDD (Bounded Context Map) 채택 검토
- Event Sourcing/CQRS 채택 검토

---

## 참고

- ADR 5개: `docs/adr/`
- PoC #01: `examples/poc-01-realworld-spring/`
- finding 누적: `examples/poc-01-realworld-spring/findings/poc-findings.md`
