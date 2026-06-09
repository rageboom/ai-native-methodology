# DEC-2026-06-09-measured-coupling-scope-derivation

**결단**: 대형/decayed 코드베이스의 analysis scope 후보를 **codegraph 실측 coupling 의 결정론 집계**로 도출(advisory). 명목 패키지 트리(BC/레이어)를 scope 절취선으로 액면 수용하던 `modules_for_priority_analysis` LOC 추정의 한계를 보강 — "패키지 경로 ≠ 경계, 측정된 coupling = 경계". 경계 위반은 1급 산출물로 흡수. ADR-CHAIN-016 자산화.

**작성일**: 2026-06-09 (사용자: "최초 프로젝트 analysis 컨텍스트 생성 — 크고 복잡하면 잘 분석할 전략 필요" → ep-be-gea 점검 → "클린아키텍처 지향하나 잘 안 지켜진 상태" → 측정 기반 도출 결단).

**version**: plugin.json 0.24.0 → 0.25.0 (MINOR — additive / schema 신규 필드 + skill 단계 / gate·trust 모델 무영향 / advisory).

**트리거 PoC**: ep-be-gea (사내 / examples 밖 외부 격리 / commit ❌ / 마스킹 DEC만 공개 — feedback_internal_source_poc_external_location).

**relates to**:
- ADR-CHAIN-016-measured-coupling-scope-derivation (사상 본체)
- `schemas/inventory.schema.json`(`scope_candidates` 신설 + `modules_for_priority_analysis` efferent/afferent_coupling additive) · `skills/analysis-source-inventory/SKILL.md`(scope 도출 단계 4) · `skills/analysis-code-graph/SKILL.md`(coupling 집계 4-b + 위반 라우팅) · `methodology-spec/workflow/discovery.md`
- ADR-CHAIN-014(db-assets-always-on / [2] backbone) · DEC-2026-05-28-codegraph-probe-결과(trust §4.2 reference-lens) · DEC-2026-05-30-codegraph-essential · ADR-FE-003(legacy-spectrum / decay_grade)
- memory: feedback_diagnose_before_design_check_existing(갭 액면수용 금지 — codegraph 기존자산 대조) · feedback_chain_driver_deterministic_axis(결정론 집계 / LLM inject ❌) · feedback_research_fact_validation(Louvain 과장 인용 회피) · feedback_quality_priority(§8.1)
- plan `.claude/plans/plan-large-project-scope-strategy.md`

---

## 1. 배경

대형 코드베이스(ep-be-gea: 6307 Java / api 1951 + core 4280 + batch 76)는 단일 analysis 패스 불가 → `scope` 슬라이스 필요. 기존 `modules_for_priority_analysis` = "LOC/파일 수 큰 모듈 추정" = 명목 패키지 트리 절취선 가정.

**decay 실측이 반증**: 클린아키텍처 + feature-slice(`core/<BC>/<feature>/{domain,application,infrastructure}`) *지향*하나 — domain→infra 역참조 45 / frontoffice↔backoffice 교차 import 514(123 고유). 누수가 feature 축 정렬(biztrip↔biztrip 등) → 진짜 응집 = **feature-across-BC**. 명목 트리 ≠ 실제 응집.

**기존 자산 대조**: codegraph 존재하나 "측정→scope 도출" 배선 ❌(symbol 수동질의·reference-lens) / dep-graph-navigator = artifact-graph 후처리. = 갭.

## 2. 사용자 결단 (D1~D5 / 전부 Recommended)

- **D1 clustering** = 결정론 coupling 집계 + advisory. (full Louvain 도구 ❌ — research 연구단계 경고 / 순수 LLM ❌ — 재현성).
- **D3 위반 라우팅** = antipatterns(ARCH) + migration-cautions + finding 전부.
- **D4 격상 범위** = skill+schema + ADR/DEC 정식 자산화 (research 5선례 → paradigm 자산화 정당).
- **D5 §8.1 시점** = 즉시 격상 (advisory·gate inject ❌·paradigm-grounded → 저위험). 단 "자동화 천장 수치"는 ep-be-gea 실측 전 미주장 / poc-17+ep-be-gea ≥2 corroboration 후 확정.

## 3. research grounding (5/5 지지 / 반대 0)

CodeScene temporal-coupling(명목≠실측) · Vertical Slice Bogard(couple along axis of change) · dependency-cruiser severity(warn=advisory 동형) · advisory-vs-authoritative 주류 · ⚠️Louvain SW적용=연구단계(일반원칙으로만 인용). 상세 = plan §5.

## 4. carry

- §8.1: 트리거 ep-be-gea 1 PoC. advisory 격상은 정당, 천장 수치는 미주장(carry).
- 후속: ep-be-gea `[0]inventory→[1]codegraph 실측→[2]DB backbone→[3]feature-across-BC scope` 실착수 (dogfooding 증거).

## 5. §후속 v0.25.1 PATCH — 멀티모듈 repo 산출물 배치 컨벤션 명문화 (2026-06-09)

"scope ≠ 모듈" 원칙을 **산출물 배치**로 확장. ep-be-gea(api/core/batch = shared-core + 2 entrypoint 배포단위 실측) 점검 중 사용자 질문("산출물은 모듈 안/밖?") → 본 결단의 자연 귀결로 명문화.

- **규칙**: 멀티모듈·모노레포에서도 `.ai-context/` = **repo 루트 단일** (모듈 내부 분산 ❌). 근거 3 — ① scope(feature 응집)가 모듈(배포단위) 관통 ② 글로벌 산출물 모듈 무소속 ③ living-sync·federation 단일 트리 가정.
- **예외**: 모듈 = 독립배포+독립도메인(마이크로서비스 모노레포)이면 모듈별 허용. 판별축 = 모듈=배포축 vs 도메인축.
- **변경**: `lifecycle-contract.md` "파일 위치 컨벤션" 규칙 추가 (doc only / 코드·schema 무변경 / PATCH). release-readiness 41/41.
