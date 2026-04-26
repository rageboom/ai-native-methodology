# Changelog

본 방법론의 모든 변경 사항을 기록한다.

[Semantic Versioning](https://semver.org/lang/ko/) 준수:
- **MAJOR**: 기존 산출물과 호환 안 되는 큰 변경 (v1 → v2)
- **MINOR**: 호환 가능한 기능 추가 (v1.1 → v1.2)
- **PATCH**: 버그/누락 수정, 호환 가능 (v1.1.0 → v1.1.1)

---

## [v1.1.1] — 2026-04-26 ⭐ 현재

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

### v1.1.2 (예정)

후속 finding 처리:
- F-001: 외부 레포 분석 시 git clone 대체 방법 미명시 (low)
- F-002: PoC source-info.md 명세 부재 (medium)

PoC #01 Phase 1~6 진행 후 발견될 finding도 누적 후 일괄 처리 예정.

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
