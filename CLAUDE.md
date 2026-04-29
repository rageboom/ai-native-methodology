# AI-Native 개발 방법론 v1.1.2 — 작업 컨텍스트

본 레포는 사내 표준 AI-Native 개발 방법론.
다음 세션에서 작업 재개 시 본 파일이 컨텍스트.

## 절대 우선순위 (2026-04-28 윤주스 결정)

**품질 1순위 + 재작업 최소화 2순위**. 속도/quick win/컨텍스트 신선도 후순위.

→ 격상/처분/순서 결정 시 §8.1 단일 PoC 과적합 회피 강제 적용. 자세한 정책은 memory `feedback_quality_priority.md` 참조.

**확정 순서** (재작업 0 시퀀스):
1. PoC #01 사용자 결정 6건 → Phase 4 진입 전 일괄 (진입 중 결정 ❌)
2. PoC #01 Phase 4~6 완료 (7대 산출물 7/7)
3. PoC #02 진입 (다른 스택, deferred 4건 + promoted 5건 외부 검증)
4. v1.2.0 격상 (PoC #01 + #02 데이터 합산, 4 묶음 일괄)
5. PoC #03 (다른 도메인)
6. v1.3.0 (필요 시)

## 현재 상태 (2026-04-29 **PoC #01 ✅ 종료 — 7대 산출물 6/7 (UI/UX 제외 100%)**)

- 방법론 본체: **v1.1.2 (PATCH 릴리스 완료)** — high 4건 closed
- v1.1.2 변경 요약:
  - F-007 ✅ closed: schemas/inventory.schema.json + templates/inventory.template.{json,md} + schemas/README.md (CI TODO) 신설
  - F-009 ✅ closed: phase-1-init.md §6 결정성 단일 표 + caveat (환경별 분리 거부)
  - F-016 ✅ closed: phase-2-db.md §3.4 원칙 + Decision Tree + 부록 (산업 권위 7/7 매트릭스 반대)
  - F-023 ✅ closed: phase-3-arch.md §3.1.1 + ADR-006 (Provisional) + architecture.schema.json `circular_dependencies[]` 보강
- **PoC #01 Phase 0~6 완료 ✅** (분석 종료):
  - Phase 0 ✅ / Phase 1 ✅ / Phase 2 ✅ / Phase 3 ✅ / Phase 4 ✅ / Phase 5-1 ✅ / **Phase 6 ✅ (2026-04-29 완료, raw confidence 0.96)**
  - 사용자 결정 6건 (Phase 4) + 4 항목 (Phase 5-1) + Auto Mode 자율 5 항목 (Phase 6) 모두 적용 ✅
  - 7대 산출물 6/7 완료 (UI/UX 제외 100%)
- **Phase 4 산출물 (2026-04-28 윤주스 3원칙 승인 + 코드 착수 완료)**:
  - **output/domain/** (6 파일): domain.json (BC-CONTENT 단일 + BC-AUTH cross-cutting / Aggregate 3 / VO 7 / UC 25 / Ubiquitous 22), domain.md, domain.mermaid, use-cases.md, ubiquitous-language.md, _manifest.yml
  - **output/rules/** (3 파일): rules.json (BR 13 — validation 2 / policy 6 / authorization 5), rules.md, _manifest.yml
  - **output/antipatterns-partial/** (2 파일): antipatterns-partial.json (6 AP — critical 2 / high 1 / medium 3), _manifest.yml
  - **갱신**: architecture.json (CIRCULAR-001 same_bc / methodology v1.1.2) + circular-dependencies.md + architecture.md + db/schema.json (DRIFT-010 격상 + REC-004) + db/정합성-검증-보고서.md
- **누적 finding 33건** (Phase 6 +1: F-041 JWT alg explicit 검증 부재)
  - closed **10** / promoted **10** / deferred **13** / rejected 0
  - v1.2.0 격상 묶음 **7** (A~G — Phase 5-1 신규 G ADR-007 OpenAPI x-extension)
- **사용자 결정 6건 적용 결과**:
  - DRIFT-002 (단방향) → BR-USER-FOLLOW-001
  - DRIFT-003 (권장만) → REC-001
  - DRIFT-007 (NO ACTION) → AP-DB-001
  - **DRIFT-010 격상** medium → high → BR-USER-EMAIL-001 + BR-USER-USERNAME-001 + AP-DOMAIN-002 + REC-004 (3중 방어)
  - **CIRCULAR-001 same_bc** medium → low → 단일 BC-CONTENT
  - ARCH-STYLE → AP-ARCH-001 (LV-001) + AP-ARCH-002 (LV-002) 강제 등록
- **Phase 4 핵심 발견** (사내 적용 시 즉시 수정 필수 critical/high 4건):
  - **AP-DOMAIN-001** critical — Comment.removeCommentByUser De Morgan 버그 (Article.java:86) — F-027 신규
  - **AP-SECURITY-001** critical — JWT SECRET 하드코딩 + 21byte (RFC 7515 §5.2.2 위반)
  - **AP-DOMAIN-002** high — email/username unique App+DB+JPA 3중 부재
  - AP-ARCH-001/002 medium — LV-001/LV-002
- 메타 자산: methodology-spec/finding-system.md (DRAFT) — v1.2.0 정식화 대기

### Phase 5-1 종료 결과 (2026-04-29) ✅

- **4원칙 사이클 완주**:
  - 1원칙 ✅ — plan-phase5.md (22 endpoint / 4 신규 파일)
  - 2원칙 ✅ — 3 sub-agent 재spawn (4,449 line) + research-phase5.md 통합 (한도 reset 후 즉시 시도 성공)
  - 3원칙 ✅ — 윤주스 4/4 항목 일괄 승인
  - 4원칙 미발생 ✅
- **산출물 4종** (`output/api/`): openapi.yaml (471 line / 22 endpoint / 19 operationId) + api-extension.json (operations 19 + LV-001 18 op) + api.md + _manifest.yml. **raw confidence 0.93**.
- **Phase 4 산출 갱신 (cross-validation 정정 3건)**:
  - domain.json UC-CONTENT-USER-FIND-BY-ID 정정 (F-035 closed)
  - rules.json BR-AUTH-STATELESS-001 정밀화 (F-034 promoted, conf 0.90→0.85)
  - rules.json BR-AUTH-PUBLIC-001 정밀화 (F-036 promoted, conf 0.95→0.92)
- **Phase 5-1 핵심 발견** (사내 적용 시 권고 41건 / Phase 6 AP candidate 6건):
  - **F-035 closed** (high) — Phase 4 system_internal 오분류 즉시 정정
  - **F-034/F-036/F-038 promoted** → v1.2.0 묶음 G (ADR-007 OpenAPI x-extension 표준 가이드)
  - **GitHub `x-github` extension 패턴 isomorphic 모방** — ADR-007 ★★★ 정당화
- 진행 로그:
  - methodology-v1.1/.claude/PROGRESS-v112.md (v1.1.2 격상 Phase A~G)
  - examples/poc-01-realworld-spring/.claude/PROGRESS-poc01-phase4.md (Phase 4 T+0 ~ T+16)
  - examples/poc-01-realworld-spring/.claude/PROGRESS-poc01-phase5.md (Phase 5 T+0 ~ T+12 ✅ 마감)

### Phase 6 종료 결과 (2026-04-29) ✅

- **산출물 3종** (`output/antipatterns/`): antipatterns.json (15 AP) + avoid-list.md + _manifest.yml — **raw confidence 0.96**
- **15 AP 분포**: critical 2 / high 2 / medium 7 / low 4
- **5 핵심 결정 (Auto Mode 자율 승인)**:
  - 복합 AP 등록 거절 (Document 권고, Case 가독성은 composite view 섹션화)
  - severity 재산정 (AP-PERFORMANCE-001 medium 유지 / AP-ARCH-003 medium → low)
  - Phase 4 추가 candidate 3건 등록 (EAGER / F-017 / F-028)
  - 사내 권고 41건 통합 (Senior §6 채택)
  - F-041 (JWT alg explicit) 신규 등록
- **7대 산출물: 6/7 (UI/UX 제외 100%) ✅**

### PoC #02 진입 인계 (다음 세션)

- 다른 스택 (FastAPI / Express / NestJS / Ktor / Spring Boot 3.x 등 — 윤주스 결정 대기)
- deferred 13 + promoted 10 외부 검증
- v1.2.0 합산 격상 데이터 확보 (7 묶음 A~G)

## Work Principles (모든 프로젝트 공통 4원칙)

IMPORTANT: 모든 작업에 아래 4원칙을 순환적으로 적용. 이 원칙은 모든 하위 프로젝트에 동일 적용.

### 1원칙: 깊은 숙지 → plan.md 작성

- 작업 착수 전 관련 파일 전수 조사 (버전, 아키텍처, 컨벤션, 의존성, 설정 등)
- 분석 결과를 `.claude/plans/plan{구분을 위한 토픽}.md`에 정리 (작업 범위, 변경 대상, 영향도, 리스크)
- plan.md 없이 코드 수정 착수 금지

### 2원칙: 에이전트 팀 토론 → .claude/researches/research{구분을 위한 토픽}.md 작성

3가지 에이전트를 병렬 운용하여 해결방안 도출:

1. **공식문서 리서처**: 관련 기술 공식 문서 조사 → `.claude/researches/document{구분을 위한 토픽}.md` 기록
2. **테크기업 사례 리서처**: Netflix, Google, Meta 등 유명 테크기업 유사 사례 조사 → `.claude/researches/case{구분을 위한 토픽}.md` 기록
3. **Senior Engineer (작업 도메인 적응 — FE/BE/아키텍트/방법론 등)**: 실무 경험 기반 지혜, 함정/실패 패턴 조언

3명의 전문가가 대화하여 나은 결과를 도출.

### 3원칙: 사용자 승인 후 코드 착수

- plan.md + research.md 완성 후, 코드 작성 착수 여부를 **반드시** 사용자에게 질문
- 사용자 승인 없이 코드 수정 절대 금지

### 4원칙: 실패 시 Revert → 교훈 반영 → 1원칙 재시작

- 해결방안 접근이 잘못되었다고 판단되면:
  1. 작업사항 전체 revert (git reset 또는 수동 복구)
  2. 실패 원인과 교훈을 `plan.md`에 "Lessons Learned" 섹션으로 기록
  3. 교훈을 반영하여 1원칙부터 다시 수행
- 같은 실수 반복 금지. 이전 실패 기록을 반드시 참조

## 핵심 디렉토리

방법론 본체는 `ai-native-methodology/` 하위. plan/research는 `methodology-v1.1/.claude/` 및 `legacy-analyzer/.claude/` (과거 컨텍스트).

- ai-native-methodology/methodology-spec/: 방법론 명세 (deliverables, workflow)
- ai-native-methodology/docs/adr/: 결정 기록 (ADR-001~005)
- ai-native-methodology/schemas/: JSON Schema (8개)
- ai-native-methodology/templates/: 산출물 템플릿
- ai-native-methodology/examples/poc-01-realworld-spring/: PoC #01
- methodology-v1.1/.claude/plans/, .claude/researches/: v1.1 설계 plan/research
- legacy-analyzer/.claude/plans/, .claude/researches/: v1.1 이전 단계 plan/research

## 재개 첫 명령어 추천

> "examples/poc-01-realworld-spring/RESUME.md 읽고 어디까지 했는지 정리해줘.
>  F-021 임계 결정 (Option A/B/C) 후 Phase 4 진입할거야."

## F-015 cross-validation 패턴 (Phase 1 신규 finding, Phase 2/3 정착)

3 에이전트 병렬 리서치 시 sub-agent 가 **학습 코퍼스 의존**으로 사실 오류 가능 (Phase 1 D 에이전트 50% 오차 사례).
**대응**: 메인 에이전트가 핵심 데이터 사전 raw fetch → sub-agent 가 같은 데이터 cross-check.
**효과**: Phase 2/3 sub-agent 오차 0% 달성.

## F-021 finding 누적 임계 (Phase 2 신규 finding)

누적 finding 5~15건 = 건강한 검증 / 20+ = 명세 자체 부실 의심.
임계 도달 시 PoC 일시 정지 + v1.1.2 격상 검토 (4원칙 적용).

## 참고

- ai-native-methodology/README.md: 방법론 소개
- ai-native-methodology/CHANGELOG.md: 변경 이력 (v1.1.0 → v1.1.1)
