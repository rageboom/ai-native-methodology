# Research (통합): v1.1.2 격상 (4 high finding)

> 작성일: 2026-04-28
> 작성자: Claude (메인 에이전트, 3 sub-agent 결과 통합)
> 적용 원칙: Work Principles 4원칙 — 2원칙 (3 에이전트 병렬 토론)
> 상위 plan: methodology-v1.1/.claude/plans/plan-v112.md
> Sub-research:
> - methodology-v1.1/.claude/researches/document-v112.md
> - methodology-v1.1/.claude/researches/senior-v112.md
> - methodology-v1.1/.claude/researches/case-v112-f023.md
> - methodology-v1.1/.claude/researches/case-v112-f016.md
> - methodology-v1.1/.claude/researches/case-v112-f009.md
> - methodology-v1.1/.claude/researches/case-v112-f007.md

---

## §0. Executive Summary

3 에이전트 (document / senior / case) 병렬 토론 결과, **plan-v112.md 의 초기 권장안 (4건 일괄 v1.1.2 PATCH) 은 부분 수정 필요**.

| Finding | plan-v112 초기안 | 통합 권장 (사례 기반) | 변경 사유 |
|---|---|---|---|
| **F-023** | §3.1 + ADR-004 + schema (4-way enum) | §3.1 + **ADR-006 신규** + schema (**3값 + boolean**) | senior + case (Drotbohm 본인 답변) 합의: "intent" 단어 산업 표준 부재, 3값 + boolean 페어가 정합 |
| **F-016** | 7행 매트릭스 in §3.4 | **원칙 3개 + Decision Tree** in §3.4 + 부록 reference | senior + case 만장일치: 영문 권위 7/7 매트릭스 반대, 원칙 표준 |
| **F-009** | 환경별 표 3개 분리 | **결정성 단일 표 + 환경 caveat 컬럼** | senior + case 압승: 환경별 분리 산업 사례 0건, 결정성 축 5건 (CodeQL/Sourcegraph/Semgrep/tree-sitter/Glean) |
| **F-007** | schema + 2 templates 신설 | **schema + §4.2 폐지 (schema=SoT)** OR **schema + 최소 CI 동반** | case 우세 (산업 표준 = schema 게시) but OpenAPI 7년 divergence 사례로 senior 우려 입증 → 타협 필수 |

**격상 범위 결정** (senior 의 강한 이의 vs case 의 부분 수정):
- senior: 4건 분리 격상 (F-007 보류 / F-009/F-016 = v1.1.2 / F-023 = v1.2.0 MINOR)
- case (F-007/F-023): 일괄 v1.1.2 가능하나 조건부
- **권장 절충**: 4건 모두 **v1.1.2 PATCH 진행** but **F-023 의 schema 변경은 호환 (옵셔널 신규 필드)** 으로 설계 → MINOR 회피

---

## §1. 진행 절차 (2원칙 사이클)

### 1.1 1차 시도 (실패)

3 에이전트 동시 launch:
- senior: 4분 완료 (코퍼스 기반)
- document: 6.5분 완료 (영문 공식 출처 24개)
- case: **10+분 후 timeout/hang** (한국 테크블로그 Cloudflare 추정)

원인: prompt 가 4 finding 모두 한 번에 + 한국 테크블로그 검색 의무 + WebFetch 제한 없음.

### 1.2 2차 시도 (성공)

case agent 만 4분할 + tighter prompt 로 순차 재실행:
- **F-023 case** (3분, senior 60:40 우세) — Drotbohm 본인 답변 1차 사료 확보
- **F-016 case** (3분, senior 압승 7/7) — Vlad/Stripe/Atlasgo 권위 자료 모두 매트릭스 반대
- **F-009 case** (2.5분, senior 압승 5:0) — CodeQL/Sourcegraph/Linguist 결정성 축 표준
- **F-007 case** (2.5분, document 우세 — 반전) — Backstage/CycloneDX 산업 표준이지만 CI 동반 조건

총 11분 vs 1차 시도 timeout. **Lessons Learned**: 4건 일괄 case research 는 hang 위험 → 1건씩 분할 + 한국 테크블로그 제외 + WebFetch 8회 제한 + 8분 hard timeout 이 안정적.

---

## §2. F-023 ⭐ Tarjan SCC vs 도메인 의도

### 2.1 3 에이전트 입장 비교

| 차원 | document | senior | case |
|---|---|---|---|
| 격상 범위 | v1.1.2 OK | **v1.2.0 MINOR** (의미 강화 = PATCH 아님) | v1.1.2 OK (default 정책만 senior 안 채택 시 MINOR 불필요) |
| BC 미정의 default | low + decision_required (4-way) | **medium + decision_required** | medium + decision_required ✅ (FreezingArchRule, Type.OPEN 산업 표준) |
| schema enum | 4-way (same_BC / different_BC_with_intent / different_BC_no_intent / undefined_BC) | **3값 enum + boolean 페어** (intent 단어 제거) | 3값 + boolean ✅ (Spring Modulith / ArchUnit / Vernon 어디도 "intent" enum 미사용) |
| ADR 위치 | ADR-004 보강 또는 §3.1만 | **ADR-006 신규 (provisional)** | ADR-006 신규 (PoC #02 hedge) |
| algorithm vs domain | hybrid (탐지 + BC 분기) | hybrid (동일) | hybrid ✅ (Drotbohm "DAG is key... but interface inversion" 정확히 hybrid) |

### 2.2 case 의 결정타 — Drotbohm Discussion #493 (1차 사료)

> "A directed acyclic graph between modules is key to an evolvable architecture"
> 휴리스틱: "Which of the two modules could exist without the other?"
> 기술적 우회: "introduce an interface on the catalog side for OrderCompleted to implement"

**해석**: Spring Modulith 창시자 본인이 "domain-legitimate cycle" 개념을 거부하지만, 즉시 fail 이 아닌 **"decision_required → interface inversion"** 을 권장. → senior 의 `decision_required` 페어링과 정확히 일치.

### 2.3 ArchUnit FreezingArchRule = senior 안의 산업 표준 구현

> "introducing a new ArchRule to an existing project that causes too many violations to solve at the current time — a typical example is a huge legacy project where a new rule might cause thousands of violations"

→ "기존 cycle = baseline 수용, 신규 cycle 만 차단" 패턴이 ArchUnit 1급 사용 사례. **senior 의 medium + decision_required 와 의미 동등**.

### 2.4 schema 어휘 — "intent" 단어 산업 표준 부재

case 결과: Spring Modulith / ArchUnit / Vernon IDDD 어느 도구/문헌도 "intent" enum 미사용. 표준은 binary "violation y/n" + boolean "frozen/accepted". → senior 의 3값 + boolean 페어가 정합.

### 2.5 통합 권장

```yaml
# v1.1.2 §3.1 권장 형태
circular_dependency:
  detection:
    algorithm: tarjan_scc  # 결정적 탐지
  components: [...]
  bc_status: same | different | undefined  # 3값 enum (3값 안정)
  bc_assignment_explicit: true | false  # 코드/문서에 BC 할당 명시 여부
  documented_decision: true | false  # ADR 등 결정 문서 존재 여부
  severity: low | medium | high  # 아래 표 기반 자동 산정
  decision_required: true | false  # severity 와 페어링
  decision_owner: domain_expert  # BC 미정의 시
  decision_deadline: "Phase 4 진입 전"
  phase_4_routing: true | false
```

severity 결정 표:

| bc_status | bc_assignment_explicit | severity | decision_required |
|---|---|---|---|
| same | true | low | false |
| same | false | low | true (BC 명시 권고) |
| different | true | high | false |
| different | false | medium | true |
| undefined | * | medium | true (default) |

**격상 범위**: v1.1.2 PATCH 가능 — schema 변경을 **옵셔널 신규 필드**로 설계 (기존 v1.1.1 산출물이 새 schema 로 validate 통과). MINOR 회피.

**ADR 신규**: ADR-006 (Cycle 처리 default 정책) — `status: provisional`, `revisit_at: PoC #02 completion`.

---

## §3. F-016 ddl-auto 매트릭스 → 원칙 + Decision Tree

### 3.1 3 에이전트 입장 비교

| 차원 | document | senior | case |
|---|---|---|---|
| 매트릭스 형태 | 4×2 = 7행 매트릭스 | **반대 — 원칙 + Decision Tree** | 영문 권위 7/7 = senior 안 채택 |
| RDB 종속성 | 매트릭스 그대로 | **RDB-agnostic 원칙** | dialect 별 동작 차이 입증 (Neon, ShardingSphere) |
| Flyway/Liquibase | 매트릭스에 행 추가 | **원칙에 흡수** | `ddl-auto=validate + Flyway` 단일 canonical pattern (Spring Boot Issue #894) |
| 카드사 콜 교훈 | ddl-auto=update 위험 | **자동 migration 자체 위험 (도구 무관)** | Stripe/Quesma/Atlasgo 모두 도구 무관 원칙으로 일반화 |

### 3.2 통합 권장 — 2층 구조

**§3.4 본문**: 원칙 + Decision Tree (senior + case 만장일치)

```markdown
### §3.4 Schema 변경 정책 (v1.1.2 갱신)

#### 원칙 (도구 무관)
1. 운영 환경의 자동 schema 변경 금지 (ddl-auto / Flyway baseline / 모두 적용)
2. DDL 변경은 versioned + reviewable + reversible (Atlasgo 4원칙 차용)
3. ORM 의 schema 책임은 "검증 (validate)" 까지로 한정

#### Decision Tree (도구 선택)
질문 1. 마이그레이션 도구 (Flyway/Liquibase) 도입 가능?
  ├─ Yes → ddl-auto=validate + 도구가 SoT
  └─ No → ddl-auto=none (운영) / create-drop (테스트 한정)

질문 2. 운영 DB 존재?
  ├─ Yes → 운영 DB > Migration 도구 > ORM > ERD 우선순위
  └─ No → DDL 파일 > ORM > ERD 우선순위 (RealWorld 케이스)
```

**부록 (Appendix)**: enum 값 의미 reference (document 안 일부)

```markdown
### 부록 A — Hibernate `ddl-auto` enum 값 reference

| 값 | 동작 | 운영 사용 |
|---|---|---|
| none | 무동작 | ✅ 권장 |
| validate | 검증만 (불일치 시 startup fail) | ✅ Flyway 와 함께 권장 |
| update | additive ALTER (drop 안 함) | ❌ 위험 |
| create | DROP + CREATE | ❌ 데이터 손실 |
| create-drop | startup CREATE, shutdown DROP | ❌ (테스트만) |
```

### 3.3 격상 범위

v1.1.2 PATCH OK — 원칙 + Decision Tree 추가 (기존 우선순위 정책과 호환).

---

## §4. F-009 환경별 표 → 결정성 단일 표

### 4.1 3 에이전트 입장 비교

| 차원 | document | senior | case |
|---|---|---|---|
| 분류축 | 환경별 분리 (git_clone/web_fetch/api_only) | **결정성 (deterministic/snapshot/stateful)** | 산업 사례: 결정성 5건, 환경별 0건, 환경 caveat 1건 (SonarCloud) |
| enum 폭발 위험 | 우려 명시 X | 강한 우려 | 산업 표준 = 3-tier 고정 (CodeQL 4-tier 예외) |
| DRY | 표 분리 OK | **단일 표 + 컬럼** | SonarCloud 도 표 분리 X |

### 4.2 통합 권장 — 결정성 축 + SonarCloud caveat 패턴

```markdown
### §6 신뢰도 산정 (v1.1.2 갱신)

#### 결정성 (Determinism) 축
- **deterministic**: 동일 입력 → 동일 출력 (git commit hash, AST 파싱 등)
- **snapshot-based**: 시점 snapshot 의존 (Trees API + commit SHA)
- **heuristic/stateful**: 호출 시점/순서 또는 추정에 의존 (byte/35 LOC 추정)

#### 항목별 신뢰도 (단일 표)

| 항목 | 신뢰도 | 결정성 tier | 환경 caveat |
|---|---|---|---|
| 디렉토리 트리 | 1.0 | deterministic | web_fetch: Trees API 7MB/100k entries 한계 시 truncated → 0.85 감점 |
| 파일 통계 (byte) | 1.0 | deterministic | — |
| LOC | 1.0 / 0.55 | deterministic (cloc) / heuristic (byte/35) | byte/35 는 본질적으로 stochastic |
| 패키지 매니페스트 | 1.0 | deterministic | — |
| ORM 자동 감지 | 0.85~0.95 | pattern_matching | 4단서 점검 시 0.95 |
| 스택 종합 | 0.9 | llm_with_grounding | grounding 입력 부재 시 감점 |
| 아키텍처 스타일 추론 | 0.7 | llm_with_grounding | cap 0.7 |
```

**핵심 결정**: "환경" 자체를 enum 으로 박지 않음. 환경 영향은 **caveat 컬럼**으로 표기 (SonarCloud WARNING 패턴).

### 4.3 격상 범위

v1.1.2 PATCH OK — 단일 표 보강 (기존 표 폐지 후 결정성 컬럼 추가).

---

## §5. F-007 inventory schema 신설 — 타협안 필요

### 5.1 3 에이전트 입장 비교

| 차원 | document | senior | case |
|---|---|---|---|
| 신설 자체 | JSON Schema 표준 + AsyncAPI 패턴 → 신설 | **CI 미도입 시 dead weight = 보류** | Backstage/CycloneDX/Cookpad 등 산업 표준 = 신설 |
| SoT 분산 위험 | 호환 설계로 회피 | **5년 후 divergence 불가피** | OpenAPI 7년 divergence (2017~2024) 실증 — senior 우려 입증 |
| 신설 시점 | v1.1.2 즉시 | v1.3.0 (CI 도입 후) | 타협안 필요 |

### 5.2 case 의 3가지 옵션 제시

- **Option A**: schema 신설 + §4.2 폐지 (schema = SoT, §4.2 자동 생성) — Cookpad 모델, 가장 깔끔
- **Option B**: schema 신설 + 최소 CI 동반 (pre-commit ajv 또는 GitHub Action) — Backstage 모델, v1.1.2 즉시 가능
- **Option C**: schema 보류, §4.2 example 만 유지 — SLSA 모델, senior 1순위

### 5.3 결정 — case 가 (A)/(B) > (C) 권장

이유:
- PoC #01 에서 inventory.json **즉석 발명**한 점이 schema 부재 비용 입증
- 산업 표준은 schema 게시
- 단 OpenAPI 사례로 보면 schema-only-no-CI 는 위험 (senior 우려 정확)

### 5.4 통합 권장 — Option B (schema + 최소 CI)

**v1.1.2 변경**:
1. `schemas/inventory.schema.json` 신설 (document agent 권장 구조 채택)
2. `templates/inventory.template.json` 신설 (schema 에서 자동 생성 권장)
3. `templates/inventory.template.md` 신설 (Backstage descriptor format 모방)
4. **§4.2 는 schema 의 sample 로 명시** (SoT = schema 명시, §4.2 는 reference)
5. CI 미도입 상태이므로 **README 에 "v1.3.0 CI 도입 시점에 schema validation 자동화 예정" 명시** (TODO 보존)

**격상 범위**: v1.1.2 PATCH OK — 신규 schema 추가 (기존 산출물에 영향 없음).

### 5.5 senior 의 14건 잔여 finding 권장 — 별도 처리

senior 의 강력 권장: "v1.1.2 작업 전 14건 전수 분류 (격상/기각/유예)". **본 v1.1.2 작업 후 별도 사이클**로 처리 권장 (§7 참조).

---

## §6. 격상 범위 — PATCH vs MINOR

### 6.1 senior 의 강한 우려

> "F-023 §3.1 분기 가이드는 의미 강화 → 이전 v1.1.1 PoC 산출물의 circular_dependencies 항목을 재해석해야 함 → 이건 PATCH 가 아니다."

### 6.2 case 의 반론

> "schema 변경을 **옵셔널 신규 필드**로 설계하면 기존 v1.1.1 산출물 호환 → PATCH 가능"

### 6.3 통합 결정 — v1.1.2 PATCH (조건부)

| 변경 | 호환성 | PATCH 적합 |
|---|---|---|
| F-007 schema 신설 | 기존 산출물 영향 없음 (신규 schema) | ✅ |
| F-009 단일 표 + 결정성 컬럼 | 표 보강 — 기존 신뢰도 값 호환 | ✅ |
| F-016 원칙 + Decision Tree | 정책 보강 — 기존 정책과 호환 | ✅ |
| F-023 schema circular_dependencies 신규 필드 | **옵셔널 신규 필드로 설계 시** 호환 | ✅ (조건부) |
| F-023 §3.1 분기 가이드 | 의미 강화 — 기존 산출물 재해석 가능 | ⚠️ MINOR 가능 |

**조건부 PATCH 채택**: F-023 의 schema 변경은 옵셔널 + warnings 에 "v1.1.2 분기 가이드 적용 시 재산정 권장" 명시. §3.1 본문은 "v1.1.2 부터 적용, 이전 산출물은 phase_4 라우팅으로 재검토" 명시.

---

## §7. 14건 잔여 finding 처분 — 후속 작업

senior 의 1순위 권장. **본 v1.1.2 작업과 별도** 진행:

| 처분 | 후보 | 액션 |
|---|---|---|
| 격상 (promote) | F-024, F-025, F-008, F-018 | v1.2.0 또는 v1.3.0 후보 |
| 기각 (reject) | (분류 후 결정) | "이건 명세 책임 아님" 사유 명시 |
| 유예 (defer) | F-017, F-019, F-022, F-026 | "PoC #02/#03 후 재검토" + revisit_at |

**일정 제안**: v1.1.2 완료 후 / Phase 4 진입 전 1일 작업.

---

## §8. 윤주스 결정 매트릭스 (3원칙 — 사용자 승인)

### 8.1 핵심 결정 (Q1~Q9)

| ID | 질문 | 옵션 | 통합 권장 |
|---|---|---|---|
| **Q1** | F-023 격상 범위 | A. v1.1.2 PATCH (옵셔널 schema) / B. v1.2.0 MINOR | **A** (case 반론 채택) |
| **Q2** | F-023 schema enum 형태 | A. 4-way intent enum (plan-v112 초기) / B. **3값 bc_status + 2 boolean** (senior+case 합의) / C. 다른 형태 | **B** |
| **Q3** | F-023 BC 미정의 default | A. low + decision_required / B. **medium + decision_required** / C. high | **B** (FreezingArchRule 산업 표준) |
| **Q4** | F-023 ADR 위치 | A. ADR-004 보강 / B. **신규 ADR-006 (provisional)** | **B** (one decision one ADR + PoC #02 hedge) |
| **Q5** | F-016 형식 | A. 7행 매트릭스 / B. **원칙 + Decision Tree + 부록 reference** | **B** (영문 권위 7/7) |
| **Q6** | F-009 분류축 | A. 환경별 표 3개 / B. **결정성 단일 표 + caveat 컬럼** | **B** (산업 표준 5건) |
| **Q7** | F-007 옵션 | A. schema + §4.2 폐지 (Cookpad) / B. **schema + 최소 CI TODO** (Backstage) / C. schema 보류 | **B** (즉시 실행 + senior 우려 부분 완화) |
| **Q8** | 14건 잔여 finding 처분 | A. v1.1.2 작업 中 함께 / B. **v1.1.2 후 별도 1일 작업** | **B** (작업 분리) |
| **Q9** | PoC #02 hedge | A. ADR-006 만 provisional / B. **F-023 schema warnings + ADR-006 provisional 동시** | **B** (이중 hedge) |

### 8.2 추가 권장 사항 (윤주스 ACK 요청)

- **권장 1**: 본 통합 research 가 plan-v112.md 와 일부 충돌 (F-007 schema 구조 / F-023 schema enum / F-016 매트릭스). **통합 research 권장 채택 시 plan-v112.md §3 / §6 갱신 필요**.
- **권장 2**: F-023 권장 형태 채택 시 architecture.schema.json 의 circular_dependencies 항목 변경 — senior 의 "intent" 단어 회피 채택.
- **권장 3**: PoC #01 산출물 (architecture.json) 갱신 정책 결정 필요 — warnings 추가만 / circular_dependencies 재구조화 / 변경 없음.

---

## §9. 다음 단계 (3원칙 → 4원칙)

1. **3원칙 (윤주스 승인)**: Q1~Q9 결정 + 추가 권장 1/2/3 ACK
2. **코드 적용 순서** (plan-v112.md §7 + 통합 research 반영):
   - 영역 A (F-007): schemas/inventory.schema.json + 2 templates (Option B)
   - 영역 B (F-009): phase-1-init.md §6 → 결정성 단일 표
   - 영역 C (F-016): phase-2-db.md §3.4 → 원칙 + Decision Tree + 부록
   - 영역 D (F-023): phase-3-arch.md §3.1 + ADR-006 신규 + architecture.schema.json (3값 + 2 boolean)
   - 영역 E: CHANGELOG + findings status + RESUME
3. **검증** (plan-v112.md §8 동일)
4. **4원칙 (실패 시 revert + Lessons Learned)**

---

## §10. 본 research 의 사료 강도 평가

| Finding | 1차 사료 | 2차 사료 | 3차 (코퍼스) |
|---|---|---|---|
| F-023 | Drotbohm Discussion #493 (검증) | ArchUnit FreezingArchRule docs (검증) | Vernon IDDD Ch.4 |
| F-016 | Vlad Mihalcea blog (검증) | Spring Boot Issue #894 (부분 검증) | Quesma/Atlasgo |
| F-009 | CodeQL `@precision` docs (검증) | Sourcegraph SCIP announcement (검증) | arxiv 2601.08773v1 |
| F-007 | Backstage Entity.schema.json (검증) | OpenAPI 3.1 migration (검증) | Cookpad case |
| 격상 자체 | SemVer 표준 | OpenAPI 7년 divergence | Kent Beck TDD |

→ 4 finding 모두 **1차 사료 직접 검증** 확보. 코퍼스 의존도 낮음.

---

## §11. F-015 cross-validation 패턴 적용 보고

본 research 진행 中 sub-agent 결과의 메인 cross-check:

| Sub-agent | 핵심 claim | 메인 cross-check | 결과 |
|---|---|---|---|
| document | Spring Modulith 2.0.6 verify() 동작 | case agent 가 GitHub Discussion #493 fetch 로 재확인 | ✅ 일관 |
| senior | "intent" 단어 산업 표준 부재 | case agent 가 8개 시스템 조사 → 0/8 사용 | ✅ 입증 |
| case (F-023) | Drotbohm 본인 답변 | URL 직접 fetch 검증 | ✅ 1차 사료 |
| case (F-016) | "영문 권위 7/7 매트릭스 반대" | URL 6개 검증 + 1개 부분 검증 | ✅ 강함 |
| case (F-009) | "환경별 분리 산업 사례 0건" | 8개 시스템 조사 (CodeQL/Sourcegraph/Semgrep/SonarCloud/Linguist/tree-sitter/Glean/Kythe) | ✅ 강함 |
| case (F-007) | "Backstage/CycloneDX schema 게시" | URL 직접 fetch 검증 | ✅ 강함 |

**F-015 패턴 효과**: sub-agent 결과 中 메인이 추가 raw fetch 로 보완할 항목 0건. 본 research 의 코퍼스 의존 최소화 성공.

---

> 본 research 완료. 다음 단계: 윤주스 §8 결정 후 코드 적용 (영역 A~E).
