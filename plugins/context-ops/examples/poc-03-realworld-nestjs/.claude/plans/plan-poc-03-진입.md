# PoC #03 NestJS — 진입 plan

> **위치**: `examples/poc-03-realworld-nestjs/.claude/plans/`
> **선행**: v1.2.2 ✅ (본체 갭 7건 모두 closed) / Sprint 4 도구 3종 + ADR-009 / 16/16 묶음 ready
> **목표**: 다른 stack (Node + TypeScript + NestJS) 에서 본 방법론 일반성 검증 + v1.2.x 도구 외부 검증
> ** 핵심 가치**: §8.1 단일 PoC 과적합 회피 강제 적용 — PoC #01 (Spring Boot 2.5) + #02 (Spring Boot 3.3 multi-module Hexagonal) 의 Java/JVM 의존을 풀어 방법론 자체의 stack 무관성 입증.

---

## 0. 배경 / 진입 근거

### 절대 우선순위 정합

품질 1순위 + 재작업 최소화 2순위. **PoC #03 진입 = 본 방법론의 가장 깊은 quality 검증** — Java 외 stack 에서 동일 방법론이 동작하는지 확인.

### 본 방법론 가치명세 정합 ( 재정의 — 2026-04-29)

```
INPUT:  legacy 코드베이스 (분석 대상 — 언어/stack 무관)
OUTPUT: 산출물 + finding + antipatterns + migration-cautions
USE:    사람이 신규 시스템 구축 시 입력 자료 / 회피 가이드
```

→ **round-trip 검증 (산출물 → 신규 시스템 자동 생성) 영구 scope 제외**. 본 PoC #03 도 round-trip 검증 ❌. **분석 정확도 + 일반성 + 도구 외부 검증** 만.

### v1.2.x 도구 외부 검증 기회 ( 본 PoC 부수 가치)

| 도구                       | PoC #02 시범                 | PoC #03 외부 검증 ROI                                                          |
| -------------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| `drift-validator`          | self-validation 7+3 finding  | 다른 stack 에서 false positive 패턴 / state-machine 표현 차이 노출             |
| `decision-table-validator` | self-validation 3 type.mixed | NestJS Guards / Pipes / Interceptors 의 결정 분기 dmn-check 5종 적용성         |
| `static-runner` plugin     | Semgrep + PMD (Java)         | TypeScript/Node 환경 plugin 확장 후보 (eslint / typescript-eslint / npm-audit) |
| ADR-009 신뢰 모델          | self-applied                 | TypeScript 타입 시스템 (정적 검증 자체 신뢰도 기여) 단계 추가 후보             |

### §8.1 단일 PoC 과적합 회피 강제

PoC #01+#02 합산 → v1.2.x 격상. 본 PoC #03 는 **누적 PoC 3개의 cross-validation** 으로 작용. 격상 권위 = "Java 만" → "Java + TypeScript" 로 일반성 격상. 비재현 패턴 = stack 의존 / 재현 패턴 = stack 무관 본질.

---

## 0.5 선결 작업 ( Senior 위험 1 — research 반영)

**G6 (db-schema.template.md) ORM-specific sub-section 분리** — PoC #03 Phase 2 진입 전 의무.

**근거**: G6 의 "ORM derivative 분별" 섹션이 Hibernate `NamingHelper` MD5 hash 패턴 강결합 → TypeORM (camelCase + `[propertyName]Id`) / Prisma (`@map` 명시) 미적합. PoC #03 Phase 2 진입 시 적용 불가 → 재작업 0 시퀀스 정합 위해 선결.

**작업**: G6 본문에 ORM 별 sub-section 4종 (Hibernate / TypeORM / Prisma / SQLAlchemy) + 일반 원칙만 본체. ~30분.

**위험 2~5 처리** (선결 ❌, phase 진입 시 자연 보강):

- 위험 2 — state-machine 추출 트리거 일반화 → Phase 4.5 진입 시 ADR-008 보강
- 위험 3 — `templates/rules.template.md` DTO/entity 분리 → Phase 4 진입 시 보강
- 위험 4 — ADR-009 단계 2.5 (TypeScript any-ratio) → 본 PoC 데이터 수집 후 v1.3 격상
- 위험 5 — `templates/architecture.template.md` NestJS Module 가이드 → Phase 3 진입 시 보강

→ phase 별 sub-plan 영역. 본 진입 plan 은 G6 선결만 의무.

---

## 1. 분석 대상 확정 (research 반영)

**확정 (research Document agent fetch)**: `lujakob/nestjs-realworld-example-app` master, **commit `c1c2cc4`**.

| 항목      | 값                                      |
| --------- | --------------------------------------- |
| star      | 3,346                                   |
| fork      | 704                                     |
| 최근 push | 2024-03-10 / 코드 commit 2021-01 (정체) |
| ORM       | TypeORM 0.2                             |
| DB        | MySQL                                   |
| Swagger   | `@nestjs/swagger` ^4.4                  |
| license   | null (분석/연구 fair use)               |

**근거**:

- 사실상 표준 (압도적 star + RealWorld 공식 인용)
- 정체 레포 = **legacy 분석 대상 성격에 오히려 적합** (본 방법론 = "legacy → 형식 명세")
- prisma 브랜치 동시 inventory (이중 분석 X — Sprint 4 round-trip 비유 검증 ❌ 정책 일관)

**Caveat**:

- maintained ❌ → 분석 대상 / best practice 레퍼런스는 NestJS 공식 docs 분리
- license 부재 → PoC 결과 공개 시 명기 의무
- HEAD SHA pin 의무 (PoC #02 정합)

---

## 2. 산출 목표 (PoC #02 와 동일 7대 + Phase 4.5)

| Phase                       | 산출                                                                                     | 신뢰도 cap | PoC #02 비교                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------- |
| 0 (입력 정리)               | \_manifest.yml                                                                           | —          | 동일                                                                 |
| 1 (init)                    | inventory.json + tree.md + stack-detection.md + stats.json                               | 0.85~0.90  | NestJS naming 인식 정확도 검증                                       |
| 2 (db)                      | schema.json + schema.sql + erd.mermaid + 정합성-검증-보고서.md ( G6 template 첫 사용)    | 0.85       | TypeORM ↔ JPA 차이 노출                                              |
| 3 (arch)                    | architecture.json + .mermaid + .md + dependency-graph.mermaid + circular-dependencies.md | 0.85~0.92  | NestJS Module 시스템 vs Hexagonal — 분류 권위                        |
| 4 (domain+rules+AP partial) | domain/_ + rules/_ + antipatterns-partial/\*                                             | 0.83       | DTO / Guards 의 BR 분리 — Java/JPA 와 다름                           |
| 4.5 (formal-spec)           | state-machines + sequence-diagrams + decision-tables + invariants + property-tests       | 0.78~0.87  | ** drift-validator + decision-table-validator 외부 검증 첫 적용**    |
| 5-1 (api)                   | openapi.yaml + api.md ( G3 template 첫 사용) + api-extension.json                        | 0.93       | NestJS @ApiProperty decorator vs OpenAPI yaml ground truth 출처 차이 |
| 6 (quality)                 | antipatterns.json + avoid-list.md + migration-cautions.md ( v1.2.0 의무)                 | 0.96       | PoC #01 ↔ #02 ↔ #03 cross-validation 권위 (3개 PoC)                  |

### 부수 산출물

- `_manifest.yml` 신규 ( G7 meta-confidence template 첫 사용 — `tool_type` enum + `validation_history`)
- finding 신규 (PoC #02 시점 누적 117 → +N 신규)
- 9 핵심 결정 (PoC 마다 phase × 6 = ~30 결정)

---

## 3. 작업 분할 / 시간 견적

PoC #02 패턴 정합. Phase 별 단일 세션 (~3~5h) → 7 phase × 3-5h = ~25~35h 누적.

| Phase | 시간 | 비고                                                                      |
| ----- | ---- | ------------------------------------------------------------------------- |
| 0~1   | ~3h  | 입력 정리 + inventory 분석                                                |
| 2     | ~3h  | TypeORM 메타 + DDL 출처 분별                                              |
| 3     | ~3h  | NestJS Module 분류 + 의존 그래프                                          |
| 4     | ~5h  | 4영역 병렬 (BR + 도메인 + AP partial + UI 도메인)                         |
| 4.5   | ~4h  | 5 산출물 + drift-validator + decision-table-validator                     |
| 5-1   | ~3h  | OpenAPI (NestJS Swagger 자동 생성 vs ground truth)                        |
| 5-2   | ~2h  | UI/UX (RealWorld 일반적으로 별 frontend 레포 — 본 PoC scope 따라 결정)    |
| 6     | ~5h  | 안티패턴 통합 + cross-validation (PoC #01+#02 ↔ #03) + migration-cautions |
| 종결  | ~2h  | wrap-up + DEC + STATUS + INDEX + v1.3 격상 데이터 합산                    |

**총 ~30h** (단일 세션 X — multi-session 진행).

---

## 4. 핵심 결정 포인트 (사용자 일괄 승인 N건 — research 후 확정)

### DEC-PoC03-N1 — 분석 대상 레포 선정

**옵션 (research 결정)**:

- (A) `lujakob/nestjs-realworld-example-app` (1차 후보 — 가장 인용 많음)
- (B) 다른 maintained NestJS 변형 (research 가 fetch 후 추천)
- (C) 사용자 직접 지정

→ research §3 결과 후 사용자 승인.

### DEC-PoC03-N2 — Frontend scope

**옵션**:

- (A) **Backend only** — RealWorld 의 backend NestJS 레포만. Phase 5-2 (UI) skip 또는 caveat. PoC #02 정합 (multi-module backend 만)
- (B) Frontend (별도 React/Vue) 통합 — Phase 5-2 본격
- (C) Backend + Frontend 분리 PoC

**제안**: **(A)** — PoC #01/#02 도 backend 만. 일관성 + scope 관리.

### DEC-PoC03-N3 — TypeScript 타입 시스템 신뢰도 단계

**옵션**:

- (A) ADR-009 § 2.1 표 그대로 (Java 정합)
- (B) **TypeScript 정적 타입 검증 결과를 신뢰도 +5%p (단계 2.5 신설 후보)** — `tsc --noEmit` 통과 여부
- (C) PoC #03 데이터 충분 시 ADR-009 v1.3 보강

**제안**: **(C)** — 본 PoC 에서 데이터 수집만, 격상은 v1.3 후속. PoC #03 종결 시 ADR-009 v2 후보 평가.

### DEC-PoC03-N4 — v1.2.x 도구 적용 정책

**옵션**:

- (A) Phase 4.5 자가 검증 (drift-validator + decision-table-validator) **의무** 권장
- (B) 선택 적용 (시간 절약)

**제안**: **(A)** — v1.2.1 phase-4-5 워크플로우 §4.1 의무 적용 정합. 미실행 시 -5%p 패널티.

### DEC-PoC03-N5 — Phase 5-1 OpenAPI ground truth (research 갱신)

**확정 권고**: **swagger 자동 생성 = ground truth (정적 추출 + 런타임 dump 2-way diff). 사용자 yaml = 검증 대상**.

PoC #02 의 "사용자 작성 yaml ground truth" 패턴과 본질적 다름 — NestJS 는 **코드가 spec source** (`@ApiProperty` + DTO 정적 분석 + swagger-cli plugin).

**구체 절차**:

1. **정적 추출** — 소스 `@ApiProperty` 데코레이터 파싱 → openapi.yaml 1차
2. **런타임 dump** — `nest start` + `curl /api-docs-json` → openapi.yaml 2차
3. **2-way diff** — drift 발견 시 finding 등록

**`@ApiProperty` / `@ApiResponse` coverage 측정 의무** (Senior 위험 6) — 누락 시 silent 빈약 (필드 omit) / status code drift 재현 가능성 high.

→ Phase 5-1 신뢰도 상승 가능 (PoC #02 대비) — 코드↔spec 100% sync.

### DEC-PoC03-N6 — Node static tools (research 확정)

**확정 권고**:

| 도구                                                             | 우선순위                 | 비고                                                               |
| ---------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------ |
| **typescript-eslint** + `@typescript-eslint/strict-type-checked` | 의무                     | 타입/논리 결함                                                     |
| **Semgrep** `p/typescript` + `p/owasp-top-ten` + `p/nestjs`      | 의무                     | static-runner Semgrep plugin 재사용 가능                           |
| **OSV-Scanner** (또는 npm/pnpm audit)                            | 의무                     | 의존성 CVE / 5종 물증 의무                                         |
| **CodeQL** `javascript-typescript`                               | 권장                     | taint / SQL injection / 환경 의존                                  |
| **madge**                                                        | 권장                     | 순환 의존 (NestJS module circular) → dependency-graph.mermaid 보강 |
| **type-coverage**                                                | 권장 ( ADR-009 단계 2.5) | any 침투율 측정 (Senior 위험 4)                                    |
| SonarQube                                                        | 환경 부재 시 사용자 위임 | —                                                                  |
| ts-prune / knip / dependency-cruiser                             | 보조                     | dead code / layer 규칙                                             |

**제외**: Daikon (JVM 전용) / PMD (Java 전용).

**static-runner Plugin 신규 (Sprint 5 carry-over 또는 PoC #03 진행 중 자연 발생)**:

- `eslint` plugin
- `semgrep-typescript` plugin (rule pack: `p/typescript` + `p/nestjs` + `p/owasp-top-ten`)
- `osv-scanner` plugin

환경 부재 시 no-simulation 정책 정합 — 정직 표기 + 사용자 위임. 시뮬 결과 신뢰도 90-95% 근거 절대 사용 금지.

---

## 5. 성공 기준 (Definition of Done — PoC #03 종결 시점)

- [ ] 7 phase + Phase 4.5 모두 완료 (PoC #02 정합)
- [ ] finding 신규 5~15 (Phase 별) → 누적 ~30~80건
- [ ] AP 신규 + cross-validation (PoC #01+#02 ↔ #03)
- [ ] ** drift-validator + decision-table-validator PoC #03 외부 검증** — 환경/stack 무관 도구 입증
- [ ] ** G3 (api.template.md) + G6 (db-schema.template.md) + G7 (meta-confidence.template.yml) 첫 외부 사용** — 본체 template 일반성 검증
- [ ] migration-cautions.md (Phase 6 의무) 작성
- [ ] PoC #03 종결 시 v1.3 격상 데이터 평가
- [ ] §8.1 정합 보고 — Java vs TypeScript 비재현 / 재현 / 변형 재현 통계
- [ ] cross-validation 정직 — real_tool 5종 물증 또는 simulation_reason 명시

---

## 6. 위험 / 제약

| 위험                                                    | 영향                     | 완화                                                                                                                                                   |
| ------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NestJS naming 인식 정확도                               | Phase 1 cap 영향         | research §1 (Document agent) 가 NestJS Module/Provider/Controller 패턴 사전 파악                                                                       |
| TypeORM ↔ JPA 차이로 G6 template 부적합                 | Phase 2 재작업           | template 의 "출처 매트릭스" 섹션은 ORM agnostic — 적용 가능. `NamingHelper` 패턴은 Java 특정 → TypeScript 측 fallback (TypeORM 의 default naming) 추가 |
| drift-validator 가 NestJS Guards/Pipes 결정 분기 미인식 | 자가 검증 false positive | 본 도구는 state-machine + sequence + decision-table 도메인만 — Guards/Pipes 는 Phase 4.5 decision-table 로 추출하면 동작. 미추출 영역은 finding 등록.  |
| Phase 5-2 (UI) scope 모호                               | 재작업                   | DEC-PoC03-N2 로 backend only 확정 (PoC #01/#02 정합)                                                                                                   |
| 시간 폭발 (~30h)                                        | 일정                     | multi-session 분할 진행. 각 phase 종결 시 STATUS.md 갱신 + 다음 세션 진입 명령 명시                                                                    |
| §8.1 데이터 부족 (PoC 3개로 충분?)                      | v1.3 격상 권위           | 비재현 8건 (PoC #02 cross-val) + PoC #03 cross-val 합산 시 충분 — 종결 시 평가                                                                         |

---

## 7. 4원칙 정합

- **1원칙 (plan)**: 본 문서 ✅. 진입 plan. Phase 별 sub-plan 은 phase 진입 시 작성.
- **2원칙 (research)**: 다음 단계 — 3 agent (Document NestJS RealWorld 후보 / 테크기업 사례 / Senior 다른 stack 적용 함정). 가벼운 sub-agent 전략.
- **3원칙 (사용자 승인)**: research 후 §4 6건 일괄 승인.
- **4원칙 (revert)**: phase 별 revert 가능 (PoC #02 정합). Lessons Learned 본 plan §9.

---

## 8. 참조

- `decisions/STATUS.md` — v1.2.2 종결 시점
- `decisions/DEC-2026-04-29-시퀀스-C-A-B-확정.md` — 시퀀스 B 진입
- `decisions/DEC-2026-04-29-round-trip-스코프-아웃.md` — round-trip ❌
- `examples/poc-02-realworld-springboot3/.claude/plans/plan-phase{1~6}-poc02.md` — phase 별 plan 양식 참조
- `examples/poc-02-realworld-springboot3/output/formal-spec/SPRINT-{1,1.5,2,3,4}-REPORT.md` — Phase 4.5 패턴
- v1.2.2 신규 templates — `templates/api.template.md` / `templates/db-schema.template.md` / `templates/meta-confidence.template.yml`
- v1.2.1 도구 — `tools/drift-validator/` / `tools/decision-table-validator/`
- ADR-009 신뢰 모델 — TypeScript 타입 시스템 신뢰도 데이터 수집 후 v1.3 격상 후보

## 9. Lessons Learned (작성 예정)

(공란 — PoC #03 진행 중 발견 함정 / 함수/메서드 차이 / template 부적합 등 기록)
