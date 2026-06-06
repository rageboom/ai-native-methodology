# Phase 1 plan — PoC #03 NestJS init (inventory)

> **선행**: Phase 0 ✅ (input/\_manifest.yml 작성 / lujakob c1c2cc4 clone)
> **명세**: `methodology-spec/workflow/phase-1-init.md`
> **목표**: 4 산출물 (inventory.json + tree.md + stack-detection.md + stats.json) — NestJS naming 인식 정확도 검증 + Sprint 4 도구 외부 검증 시작

---

## 1. 산출물

| 파일                                  | 명세 §4                                             | 신뢰도 cap           |
| ------------------------------------- | --------------------------------------------------- | -------------------- |
| `output/inventory/inventory.json`     | inventory.schema.json 정합                          | 0.85~0.90            |
| `output/inventory/tree.md`            | 디렉토리 구조 사람 눈                               | 0.95                 |
| `output/inventory/stack-detection.md` | NestJS 7 + TypeORM 0.2 + class-validator + JWT 검증 | 0.85                 |
| `output/inventory/stats.json`         | LOC / file count / package.json 메타                | 0.95 (deterministic) |
| `output/inventory/_manifest.yml`      | meta-confidence.template.yml 첫 외부 사용           | 0.92                 |

---

## 2. NestJS 특이 검증 영역 (research 반영)

| 영역                         | PoC #02 비교                                | 본 PoC 검증                                                                          |
| ---------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------ |
| naming 인식                  | Spring Boot 3.3 + Hexagonal hybrid 0.65 cap | NestJS 단일 module tree — naming 단순 vs cap                                         |
| Module 분류 ( Senior 위험 5) | port-adapter 분류기                         | `@Module` = DI 경계 ≠ port. 디렉토리 (`core/`/`application/`/`infrastructure/`) 우선 |
| ORM 출처 (G6 v1.2.2 정합)    | Hibernate NamingHelper hash                 | TypeORM default = camelCase 보존. SnakeNamingStrategy 적용 시 사용자 명시 추출       |
| stack 자동 감지              | Java + Gradle Kotlin DSL                    | TypeScript + npm + yarn lock                                                         |

---

## 3. 작업 분할 (~3h)

| Step | 작업                                                                                             | 시간       |
| ---- | ------------------------------------------------------------------------------------------------ | ---------- |
| A    | 메인 raw fetch — `src/` 5 도메인 + package.json + tsconfig + nestconfig + ormconfig.json.example | ~30분      |
| B    | sub-agent Document (가벼운 cap 8분) — NestJS 7 docs + TypeORM 0.2 docs cross-validate            | ~10분 wall |
| C    | sub-agent Case (가벼운 cap 8분) — NestJS naming convention 사례 (한국 / 글로벌)                  | ~10분 wall |
| D    | inventory.json 작성 + schema 검증                                                                | ~30분      |
| E    | tree.md + stack-detection.md + stats.json 작성                                                   | ~30분      |
| F    | \_manifest.yml 작성 ( G7 template 첫 외부 사용)                                                  | ~20분      |
| G    | finding 등록 (5~15 건강 범위 / NestJS 특이 발견 시 신규)                                         | ~20분      |
| H    | sub-plan KPI 평가 + 사용자 승인 게이트                                                           | ~10분      |

→ ~2.5~3h.

### sub-agent 병렬 (가벼운 sub-agent 전략 — Phase 4~6 정착 패턴 재사용)

- Document: NestJS 공식 docs (`docs.nestjs.com`) + TypeORM 0.2 docs — fetch 정직성 (Document 자가 시인 정합)
- Case: 한국 NestJS 사례 (당근 / 토스 등) + 글로벌 (실 production)
- Senior 본 phase 생략 (PoC #02 phase 1 정합) — Phase 3 부터 Senior 본격

---

## 4. 핵심 결정 포인트 (본 phase — Auto Mode 자율 적용)

| ID                   | 결정                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| DEC-PHASE1-PoC03-001 | NestJS module tree 단일 vs multi-module 평가                                                      |
| DEC-PHASE1-PoC03-002 | TypeORM naming strategy 추출 (default vs SnakeNamingStrategy)                                     |
| DEC-PHASE1-PoC03-003 | stack-detection 신뢰도 (NestJS 7 = 정체 + legacy 적합)                                            |
| DEC-PHASE1-PoC03-004 | Phase 3 architecture 진입 시 cap 후보 — 단일 module = cap 0.85 추정 (multi-module 0.65 보다 높음) |
| DEC-PHASE1-PoC03-005 | finding 신규 등록 (예상 5~10건 — naming convention / TS strict / dependabot 잔재 등)              |

---

## 5. 위험 / 제약

| 위험                                                                          | 영향 | 완화                                                           |
| ----------------------------------------------------------------------------- | ---- | -------------------------------------------------------------- |
| NestJS naming = "module" 이지만 단일 — Phase 3 분류기 호환                    | 중   | DEC-PHASE1-PoC03-001 + research 반영 (NestJS Module = DI 경계) |
| TypeORM 0.2 deprecated (현재 0.3+) — 본 PoC = legacy 검증                     | 저   | known_limitations 명시                                         |
| package.json 의 NestJS 7 → 최신 10.x 버전 격차 → 분석 시 deprecated 패턴 노출 | 중   | finding 등록 (학습 효과 vs legacy 분석 본질)                   |
| sub-agent fetch 실패 (NestJS docs SPA — Document 자가 시인)                   | 중   | 메인 raw fetch + GitHub README 보강 우선                       |

---

## 6. 성공 기준 (DoD)

- [ ] inventory.json 산출 + schema 검증 통과
- [ ] tree.md / stack-detection.md / stats.json / \_manifest.yml 산출 (이중 렌더링 정합)
- [ ] ** G7 meta-confidence.template.yml 외부 사용 평가** — 적합성 / 변형 필요성 finding 등록
- [ ] finding 5~15건 신규 (건강 범위)
- [ ] DEC-PHASE1-PoC03-001~005 Auto Mode 적용
- [ ] Phase 2 (db) 진입 인계 사항 명시 (TypeORM entity 위치 / DDL 자동 생성 여부)
- [ ] ** G6 ORM-specific sub-section (b) TypeORM** 첫 외부 사용 — Phase 2 진입 전 추가 보강 필요성 finding

---

## 7. 4원칙 정합

- **1원칙 (plan)**: 본 문서 ✅
- **2원칙 (research)**: 가벼운 sub-agent 2건 (Document + Case). PoC #03 진입 plan 의 research 가 일부 흡수 → phase 1 research 는 더 가볍게.
- **3원칙 (사용자 승인)**: Phase 1 종결 시 KPI 평가 + 사용자 승인 (Phase 2 진입 결정).
- **4원칙 (revert)**: Phase 1 산출 부적합 시 plan revert + Lessons Learned 기록.

---

## 8. 참조

- `methodology-spec/workflow/phase-1-init.md` — 명세
- `examples/poc-02-realworld-springboot3/output/inventory/_manifest.yml` — 형식 참조
- `examples/poc-02-realworld-springboot3/.claude/plans/plan-phase{2~6}-poc02.md` — phase 별 plan 양식
- `templates/meta-confidence.template.yml` — 첫 외부 사용
- `templates/db-schema.template.md` — Phase 2 진입 시 ORM 4 enum 적용
- research-poc-03-진입.md — 6 위험축 정합

## 9. Lessons Learned (작성 예정)

(공란 — Phase 1 진행 중 발견)
