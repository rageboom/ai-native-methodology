# Plan: v1.1.2 격상 (high finding 4건 처리)

> 작성일: 2026-04-28
> 작성자: Claude (윤주스 검토 대기)
> 적용 원칙: Work Principles 4원칙
> 트리거: PoC #01 Phase 3 종료 + F-021 임계 (18/20) + 사용자 결정 Option A
> 상위 컨텍스트: examples/poc-01-realworld-spring/RESUME.md §4
> 본 plan 위치: 방법론 본체 변경이므로 methodology-v1.1/.claude/plans/

---

## §1. 목적

PoC #01 Phase 0~3 누적 finding 18건 中 **high severity 4건** (F-007 / F-009 / F-016 / F-023) 을 v1.1.2 PATCH 격상으로 명세에 반영.

이 격상이 답하는 질문:
- Phase 1~3 산출물의 형식 검증 가능성 (F-007 inventory schema)
- 환경 종속 신뢰도 (F-009 git_clone vs web_fetch)
- ddl-auto 정책의 통합 우선순위 분기 (F-016)
- Tarjan SCC 결과의 도메인 의도 분기 (F-023)

**진짜 목적 (4원칙 측면)**: PoC 결과를 명세에 즉시 환류 → Phase 4~6 가 갱신 명세로 진행 → 검증 가치 ↑.

---

## §2. 입력 — finding 4건 요약

### F-007: inventory.schema.json + inventory.template.* 부재 (high)

```
영향: schemas/ 와 templates/ 에 inventory 부재 (8 schemas + 7 templates 中)
출처: PoC Phase 1 진행 시 inventory.json 형식 검증 불가
조치: schemas/inventory.schema.json + templates/inventory.template.{json,md} 신규 추가
PoC 자체 결정: phase-1-init.md §4.2 + research-phase1.md §4.3 형식 사용 (잠정)
```

### F-009: phase-1-init.md §6 신뢰도 표 환경 종속성 미명시 (high)

```
영향: §6 표 (line 156-171) 의 "결정적 95%" 가 git_clone 환경 가정
PoC 사례:
  - LOC: 1.0 → 0.55 (web_fetch byte/35 추정)
  - Tree: 1.0 → 0.95 (Trees API truncated 위험)
  - 명세 그대로 베끼면 후속 phase 가 90% 를 100% 처럼 사용 (오차 누적 시드)
조치: §6 환경별 표 분리 (git_clone / web_fetch / api_only) + extraction_method 의무화 + warnings 의무화
```

### F-016: phase-2-db.md §3.4 ddl-auto 매트릭스 부재 (high)

```
영향: §3.4 (line 104-117) 의 "DB > ORM > ERD" 단일 정책
PoC 사례 (RealWorld):
  - ddl-auto=none + 운영 DB 부재 → schema.sql 이 SoT (DDL > JPA)
  - 명세 정책으로는 분기 불가
조치: §3.4 에 ddl-auto × 운영DB 4 케이스 매트릭스 추가
Senior 일화: 카드사 새벽 2시 콜 (ddl-auto 운영 사고)
```

### F-023 ⭐: phase-3-arch.md §3.1 Tarjan SCC vs 도메인 의도 분기 가이드 부재 (high, v1_1_2_priority: 1)

```
영향: §3.1 (line 51-57) "순환 의존성: Tarjan SCC 알고리즘" — 결과만 명시
PoC 사례 (CIRCULAR-001):
  - domain/article ↔ domain/user 양방향 import (5+4=9)
  - 알고리즘: 자동 high (Spring Modulith verify() 빌드 차단)
  - 도메인 의도: BC 같으면 정상 / 다르면 안티패턴 — RealWorld BC 미정의로 분기 불가
조치: §3.1 분기 가이드 + ADR-004 (DDD-Lite) 보강 + architecture.schema.json circular_dependencies 의도 필드
출처: Vaughn Vernon (case §1) + 카카오뱅크 Spring Modulith (case §2) + Senior §5
```

---

## §3. 작업 범위 (4 영역)

### 3.1 영역 A: F-007 — inventory schema/template 신설

**산출물**:
1. `schemas/inventory.schema.json` (신규) — meta + repo + stack + architecture_style_candidates + modules_for_priority_analysis + warnings + recommended_modules
2. `templates/inventory.template.json` (신규) — placeholder 형
3. `templates/inventory.template.md` (신규) — 사람용 README 형

**참고 모델**: 8개 기존 schema (architecture/db-schema/domain 등) 구조 + meta-confidence.schema.json $ref.

### 3.2 영역 B: F-009 — phase-1-init.md §6 환경별 표 분리

**변경 대상**: `methodology-spec/workflow/phase-1-init.md` §6 (line 156-171)

**변경 내용**:
1. §6 헤더 변경: "신뢰도" → "신뢰도 (환경별)"
2. 환경별 표 3개 분리:
   - 표 6.1: git_clone 환경 (linguist/cloc/tree-sitter 사용 가능)
   - 표 6.2: web_fetch 환경 (Trees API + Languages API + raw fetch)
   - 표 6.3: api_only 환경 (제한적)
3. 영역별 `extraction_method` 명시 (deterministic / pattern_matching / estimation / llm_with_grounding / llm_code_only)
4. inventory.warnings 의무화 가이드 (환경 종속 추정 항목 명시)

### 3.3 영역 C: F-016 — phase-2-db.md §3.4 ddl-auto 매트릭스

**변경 대상**: `methodology-spec/workflow/phase-2-db.md` §3.4 (line 104-117)

**변경 내용**:
1. §3.4 우선순위 표 보강:

   ```
   기본 정책: 운영 DB > ORM > ERD
   ```

   →

   ```
   기본 정책: 운영 DB > ORM > ERD
   ddl-auto 분기 매트릭스 (운영 DB × ddl-auto 값):

   | ddl-auto    | 운영 DB 존재 | 우선순위                       | 비고 |
   |-------------|-------------|--------------------------------|------|
   | none        | yes         | DB > DDL > JPA                 | 일반 운영 |
   | none        | no          | DDL > JPA                      | RealWorld 케이스 |
   | validate    | yes         | DB > JPA (DDL == JPA 가정)     | 부팅 시 검증 |
   | validate    | no          | JPA = DDL (일치 강제)          | 테스트/임베디드 |
   | update      | yes         | (위험) JPA → DB drift 가능     | 권장 X |
   | update      | no          | JPA > DDL                      | Hibernate 갱신 |
   | create-drop | *           | (테스트 한정) JPA              | 영속화 X |
   ```

2. consistency_priority 필드 schema 보강 (선택):
   - schemas/db-schema.schema.json 에 `consistency_priority: enum["DB_over_ORM_over_ERD", "DDL_over_JPA", "JPA_over_DDL", ...]` 추가 검토

### 3.4 영역 D: F-023 — phase-3-arch.md §3.1 분기 가이드 + ADR-004 보강

**변경 대상 1**: `methodology-spec/workflow/phase-3-arch.md` §3.1 (line 51-57)

**변경 내용**:
1. "순환 의존성: Tarjan SCC 알고리즘" → 분기 가이드 추가:

   ```
   순환 의존성 검출 단계:
   Step 1. Tarjan SCC 알고리즘 (자동, 결정적)
   Step 2. BC 정의 여부 분기:
     - BC 정의 + 같은 BC 안 cross-aggregate 양방향: severity=low (정상 가능)
     - BC 정의 + BC 간 양방향: severity=high (안티패턴)
     - BC 미정의: severity=low + decision_required=true + Phase 4 라우팅
   Step 3. 알고리즘 우선 정책 (Spring Modulith / ArchUnit verify() 활성):
     - 도메인 의도 무관 자동 high (빌드 차단)
   ```

2. circular_dependencies 산출물 형식 보강 (architecture.schema.json):

   ```json
   {
     "modules": [...],
     "severity": "high|medium|low",
     "intent": "same_BC | different_BC_with_intent | different_BC_no_intent | undefined_BC",
     "decision_required": true,
     "phase_4_routing": true,
     "antipattern_id": "AP-ARCH-XXX"
   }
   ```

**변경 대상 2**: `docs/adr/ADR-004-DDD-Lite-강도.md` 보강

**변경 내용** — §결과 또는 신규 §"전술 패턴과 도메인 의도 분기" 추가:
- 양방향 cross-aggregate 의 BC 분기 명시
- ORM cascade 우회 케이스 (Vaughn Vernon)
- v1.2 Context Map 도입 시 자동 분기 가능

**대안 검토**:
- Option D-1: phase-3-arch.md §3.1 만 보강 (ADR-004 그대로) — 가벼움
- Option D-2: ADR-004 만 보강 (워크플로우 그대로) — 사상적 강조
- Option D-3: **둘 다 보강** (워크플로우 = how, ADR = why) — 권장 ⭐
- Option D-4: 신규 ADR-006 (순환 의존성 처리) — 과한 가능성

### 3.5 영역 E (보조): CHANGELOG.md + finding status + RESUME.md

1. CHANGELOG.md v1.1.2 엔트리 작성 (v1.1.1 형식 모방)
2. examples/poc-01-realworld-spring/findings/poc-findings.md F-007/009/016/023 status: open → closed (v1.1.2)
3. examples/poc-01-realworld-spring/RESUME.md §4 갱신 (v1.1.2 완료 표시 + Phase 4 진입 가능 명시)

---

## §4. 변경 대상 파일 인벤토리

| 파일 | 변경 종류 | 영역 |
|---|---|---|
| `schemas/inventory.schema.json` | 신규 | A (F-007) |
| `templates/inventory.template.json` | 신규 | A (F-007) |
| `templates/inventory.template.md` | 신규 | A (F-007) |
| `methodology-spec/workflow/phase-1-init.md` | 보강 §6 | B (F-009) |
| `methodology-spec/workflow/phase-2-db.md` | 보강 §3.4 | C (F-016) |
| `schemas/db-schema.schema.json` | 보강 (선택) | C (F-016) |
| `methodology-spec/workflow/phase-3-arch.md` | 보강 §3.1 | D (F-023) |
| `schemas/architecture.schema.json` | 보강 circular_dependencies | D (F-023) |
| `docs/adr/ADR-004-DDD-Lite-강도.md` | 보강 §결과 | D (F-023) |
| `CHANGELOG.md` | v1.1.2 엔트리 추가 | E |
| `examples/poc-01-realworld-spring/findings/poc-findings.md` | 4건 status 갱신 | E |
| `examples/poc-01-realworld-spring/RESUME.md` | §4 갱신 | E |

**합계**: 신규 3 + 보강 9 = **12 파일**.

---

## §5. 영향도 / 리스크 분석

### 5.1 호환성 영향 (PATCH 격상 검토)

| 변경 | 호환성 | 비고 |
|---|---|---|
| inventory schema 신설 | ✅ 호환 | 기존 산출물에 없던 schema 추가 (검증 강화만) |
| phase-1-init.md §6 환경별 분리 | ✅ 호환 | 표 보강. 기존 단일 표는 git_clone 환경으로 흡수 |
| phase-2-db.md §3.4 ddl-auto 매트릭스 | ✅ 호환 | 기본 정책 유지 + 분기 추가 |
| phase-3-arch.md §3.1 분기 가이드 | ⚠️ 의미 강화 | 기존 자동 high → 의도 분기. 기존 산출물 재해석 가능 |
| architecture.schema.json circular_dependencies 필드 | ✅ 호환 | 신규 옵셔널 필드 (intent, decision_required, phase_4_routing) |
| ADR-004 보강 | ✅ 호환 | 사상 명확화 |

**결론**: PATCH (v1.1.1 → v1.1.2) 적합. Breaking change 없음.

### 5.2 PoC 재진입 영향

- Phase 1~3 산출물 (inventory/db/architecture) 갱신 필요?
  - **선택**: warnings/메모만 추가 권장. 본체 재계산 불필요 (Phase 4 진입 차단 아님).
- Phase 4 진입에 영향?
  - F-023: CIRCULAR-001 의 BC 분기 → Phase 4 BC 결정에 정식 가이드 활용 가능 ✅
  - F-016: Phase 4 5.A DB 영역 진입 시 schema.json consistency_priority 필드 활용
  - F-009: Phase 4 신뢰도 산정 시 환경별 표 사용
  - F-007: PoC inventory.json 재검증 가능

### 5.3 리스크

| 리스크 | 발생 시점 | 완화 |
|---|---|---|
| ADR-004 vs §3.1 의 분기 가이드 중복/모순 | 영역 D | Option D-3 채택 시 명확한 책임 분리 (워크플로우 = how, ADR = why) |
| inventory schema 와 phase-1-init.md §4.2 예시 불일치 | 영역 A | schema 작성 후 §4.2 예시 검증 의무 |
| ddl-auto 매트릭스 의 PostgreSQL/MySQL/H2 차이 | 영역 C | RDB-agnostic 표현 + 비고 컬럼으로 차이 표시 |
| F-023 분기에서 "BC 미정의" 케이스의 default severity 합의 | 영역 D | 본 PoC: low + decision_required + phase_4_routing → 명세에도 동일 |
| PoC findings.md 갱신 시 F-007 등 status 변경 충돌 | 영역 E | 마지막에 일괄 처리 |

---

## §6. 결정 필요 사항 (3원칙 진입 시 윤주스에게 질문)

| ID | 질문 | 옵션 | 권장 |
|---|---|---|---|
| Q1 | F-023 처리 방식 | D-1 §3.1만 / D-2 ADR-004만 / **D-3 둘 다** / D-4 신규 ADR-006 | **D-3** |
| Q2 | F-007 inventory schema 의 architecture_style_candidates cap | 0.7 (현재 PoC 적용) / 0.75 / 다른 값 | 0.7 (PoC 검증값) |
| Q3 | F-016 의 consistency_priority schema 보강 | schema 추가 / 워크플로우만 | **워크플로우만** (schema 추가는 v1.2 후보) |
| Q4 | F-009 의 환경 enum | 3개 (git_clone/web_fetch/api_only) / 2개 (full/limited) | **3개** (PoC 경험치) |
| Q5 | PoC 재진입 시 Phase 1~3 산출물 갱신 | warnings 만 / 본체 재계산 / 변경 없음 | **warnings 만** |
| Q6 | architecture.schema.json circular_dependencies.intent enum | 4값 (same_BC/different_BC_with_intent/different_BC_no_intent/undefined_BC) / 단순화 | **4값** (PoC 경험치) |

---

## §7. 진행 순서 (4원칙 적용)

1. **1원칙 (현재)**: 본 plan-v112.md 작성 + 윤주스 1차 검토
2. **2원칙**: research-v112.md 작성 (3 에이전트 병렬: document/case/senior + 통합)
3. **3원칙**: 윤주스 승인 + Q1~Q6 결정
4. **코드 적용 순서** (작은 단위 → 큰 단위):
   - 영역 A (F-007): schema + 2 templates (3 파일 신규)
   - 영역 B (F-009): phase-1-init.md §6 만
   - 영역 C (F-016): phase-2-db.md §3.4 만
   - 영역 D (F-023): phase-3-arch.md §3.1 + architecture.schema.json + ADR-004 (3 파일 보강)
   - 영역 E: CHANGELOG + findings + RESUME
5. **검증** (§8 참조)
6. **4원칙 (실패 시)**: revert + Lessons Learned 추가 후 1원칙 재시작

---

## §8. 검증 계획

### 8.1 schema 검증

- 신규 inventory.schema.json: JSON Schema Draft 2020-12 문법 통과
- architecture.schema.json: 보강 후 기존 PoC architecture.json 재검증 (호환 확인)

### 8.2 워크플로우 검증

- phase-1-init.md §6: 표 3개 분리 후 PoC inventory.warnings 와 매핑 확인
- phase-2-db.md §3.4: 매트릭스 7행 모두 RealWorld 외 시나리오 (PostgreSQL 운영 등) 적용 가능 확인
- phase-3-arch.md §3.1: PoC CIRCULAR-001 의 "BC 미정의 → low + decision_required" 케이스가 가이드와 일치 확인

### 8.3 ADR 검증

- ADR-004 보강 후 기존 §결과/§영향 범위와 정합 확인

### 8.4 PoC 호환성 검증

- inventory.json (PoC) → 신규 schema 검증
- architecture.json (PoC) → 신규 circular_dependencies.intent 필드로 재기록 가능 확인
- finding 4건 status: open → closed (v1.1.2) 갱신

### 8.5 CHANGELOG 검증

- v1.1.0 / v1.1.1 형식과 일관 (Added / Changed / Documentation / Migration Guide / 영향 범위 / 검증)

---

## §9. PoC 재진입 절차 (v1.1.2 적용 후)

```
Phase 4 진입 전:
  1. inventory.json warnings 에 "v1.1.2 환경별 신뢰도 표로 재검증 가능" 추가
  2. architecture.json circular_dependencies[CIRCULAR-001] 에 intent="undefined_BC" 명시
  3. RESUME.md §3 사용자 결정 6건 中 "ARCH-STYLE" 트레이스 승인 진행
Phase 4 진입:
  4. 4원칙 1단계 (전수 조사) 부터 → plan-phase4.md
  5. F-023 분기 가이드를 Phase 4 BC 결정에 활용
  6. F-016 매트릭스를 Phase 4 5.A DB 영역에 활용
```

---

## §10. Lessons Learned (작업 완료 후 채움)

- (작업 진행 중 발견된 함정/실패 패턴)
- (사용자 피드백)
- (다음 v1.1.x 또는 v1.2 후보 생성)

---

## §11. 다음 액션

→ 윤주스 검토 후 **2원칙 (research-v112.md 3 에이전트 병렬)** 진입.
