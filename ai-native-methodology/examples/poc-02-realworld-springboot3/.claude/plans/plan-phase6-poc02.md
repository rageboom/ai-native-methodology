# PoC #02 Phase 6 (anti-patterns final merge) — 1원칙 plan

> 4원칙 1단계: 깊은 숙지 → plan.md 작성
> 작성 시각: 2026-04-29 / 방법론 v1.1.2

---

## §1. 진입 컨텍스트

### 누적 상태

- **PoC #01**: Phase 0~6 ✅ — 7대 산출물 6/7 (UI/UX 제외 100%) — 15 AP 등록
- **PoC #02**: Phase 1~5-1 ✅ — finding 43건 / raw confidence 0.93/0.85/0.92/0.83/0.93
- **누적 finding**: 76 (PoC #01 33 + PoC #02 43)

### 분기점 결정 (사용자 2026-04-29 본 세션)

- 옵션 A 채택 — Phase 6 진입 (PoC #03 §8.1 강제 보류)
- 사유: §8.1 학습 효과 신호 약영향 (Phase 6 = 분류 작업) + AP final merge 가 v1.2.0 격상 데이터 핵심 + PoC #02 산출물 5/7 → 6/7 도달 + 재작업 최소화

---

## §2. 메인 사전 raw fetch ( 통합 전략 영역)

### 2.1 Phase 4 antipatterns-partial.json (6 AP)

| ID (Phase 4 partial)       | severity | finding | 유지/병합                                        |
| -------------------------- | -------- | ------- | ------------------------------------------------ |
| AP-API-IDEMPOTENCY-001     | high     | F-070   | ** 병합 → AP-API-001 critical** (Phase 5-1 격상) |
| AP-HEXAGONAL-001           | high     | F-071   | ID 정규화 → AP-ARCH-001 high                     |
| AP-HEXAGONAL-002           | medium   | F-072   | ID 정규화 → AP-ARCH-002 medium                   |
| AP-DB-CASCADE-001          | medium   | F-073   | ID 정규화 → AP-DB-002 medium                     |
| AP-DOMAIN-SELF-FOLLOW-001  | medium   | F-074   | ID 정규화 → AP-DOMAIN-002 medium                 |
| AP-DOMAIN-TITLE-UNIQUE-001 | high     | F-052   | ID 정규화 → AP-DOMAIN-001 high                   |

### 2.2 Phase 5-1 AP candidate (8건 — \_manifest.yml.phase_6_handoff)

| Phase 5-1 ID | severity | finding                | 유지/병합                       |
| ------------ | -------- | ---------------------- | ------------------------------- |
| AP-API-001   | critical | F-070+F-079+F-085 묶음 | **유지 (final critical)**       |
| AP-API-002   | medium   | F-083                  | 유지                            |
| AP-API-003   | medium   | F-082                  | 유지 (PoC #01 F-038 재현)       |
| AP-API-004   | medium   | F-080                  | 유지 (OWASP API4)               |
| AP-API-005   | medium   | F-086                  | 유지 (RFC 5789 PATCH)           |
| AP-API-006   | medium   | Senior §5.1            | 유지 (controller orchestration) |
| AP-API-007   | low      | F-081                  | 유지 (codegen legacy)           |
| AP-API-008   | medium   | F-087                  | 유지 (307 redirect)             |

### 2.3 Phase 1-3 추가 candidate ( 누락 위험 — 최소 5건)

| 출처    | finding                                                  | severity     | Phase 6 등록                       |
| ------- | -------------------------------------------------------- | ------------ | ---------------------------------- |
| Phase 2 | **F-048 TagJpaRepository<Tag, Integer> 타입 오류**       | **critical** | ** AP-DB-001 critical 신규**       |
| Phase 3 | **F-068 RSA private key in git (`app.key` 공개)**        | **critical** | ** AP-SECURITY-001 critical 신규** |
| Phase 2 | F-051 Article EAGER + Specification + Pageable HHH000104 | high         | AP-PERFORMANCE-001 high 신규       |
| Phase 2 | F-053 titleToSlug 8 함정 (Locale/Unicode/collision)      | medium       | AP-DOMAIN-003 medium 신규          |
| Phase 3 | F-069 ArticleSpecifications Cartesian product 위험       | medium       | AP-DB-003 medium 신규              |

### 2.4 추가 영역 (low — Phase 4 candidate 3건)

| 출처    | finding                                 | severity | Phase 6 등록                       |
| ------- | --------------------------------------- | -------- | ---------------------------------- |
| Phase 2 | F-058 TOCTOU race-prone (educational)   | low      | candidate 유지 (등록 vs skip 결정) |
| Phase 4 | F-076 Article.setTitle race             | low      | candidate 유지                     |
| Phase 4 | F-078 editTitle/Description/Content DRY | low      | candidate 유지                     |

---

## §3. 통합 결과 예상

```
Phase 4 partial (6) — 1 merged (AP-API-IDEMPOTENCY-001 → AP-API-001) = 5
Phase 5-1 candidates (8) = 8
Phase 1-3 additional critical/high/medium (5) = 5
Phase 2/4 low candidates (3) = 0~3 (등록 결정 영역)
                                 ────────
expected total                      18~21
```

**PoC #01 비교**: 15 AP / **PoC #02 18~21 AP** — Hexagonal 도입 부산물 (AP-ARCH-001/002) + RSA key git commit (AP-SECURITY-001) + spec/runtime drift (AP-API-001) 가 신규 critical/high 추가.

---

## §4. 산출물 3종 (방법론 §5 deliverables)

```
output/antipatterns/
├── antipatterns.json     # final AP 18~21건 (id ^AP-[A-Z]+-\d+$ 정규화)
├── avoid-list.md         # 사람용 우선순위 회피 가이드 + composite view
└── _manifest.yml         # Phase 6 매니페스트
```

### 4.1 antipatterns.json 작성 전략

- **simple merge** Phase 4 partial → Phase 6 final (PoC #01 동일 패턴)
- **ID 정규화** Phase 4 multi-prefix (HEXAGONAL/CASCADE/SELF-FOLLOW/TITLE-UNIQUE) → single prefix (ARCH/DB/DOMAIN)
- **AP-API-001 critical 단일 등록** (F-070+F-079+F-085 묶음)
- **5 신규 critical/high 등록** (F-048/F-051/F-068 + Phase 5-1 high candidate)
- 각 AP `description / why_avoid / evidence / fix / industry_reference / finding_ref / poc_01_comparison`

### 4.2 avoid-list.md 작성 전략

- 사람용 priority order (critical → high → medium → low)
- 각 AP 1-paragraph 요약
- composite view 섹션:
  - **JWT/Auth 보안 종합 점검** (PoC #01 isomorphic) — F-068 RSA + F-084 Token apiKey + AP-SECURITY 묶음
  - **Hexagonal port-adapter 경계** — AP-ARCH-001/002 묶음 (F-075 메타 가이드 cross-link)
  - **API 계약 결함** — AP-API-001~008 묶음
- PoC #01 비교 표
- 사내 적용 권고 (REC-\* 합산)

### 4.3 \_manifest.yml 작성 전략

- 5 핵심 결정 (DEC-PHASE6-POC02-001~005)
- 신뢰도 산정 (formula v1)
- approval_gate 체크리스트
- 7대 산출물 6/7 도달 표기
- v1.2.0 격상 데이터 합산 결과 (PoC #01 15 + PoC #02 18~21 = 33~36 AP)

---

## §5. 5 핵심 결정 (예상 — sub-agent 결과 후 확정)

### DEC-PHASE6-POC02-001 — AP-API-001 critical 단일 등록

- F-070 + F-079 + F-085 묶음 (Phase 5-1 DEC-001 적용)
- spec/runtime drift 패턴화 단일 critical AP

### DEC-PHASE6-POC02-002 — Phase 1-3 누락 candidate 등록

- F-048 critical / F-068 critical / F-051 high / F-053 medium / F-069 medium 등록
- ** F-068 RSA private key git commit critical** — PoC #01 AP-SECURITY-001 isomorphic

### DEC-PHASE6-POC02-003 — ID 정규화

- Phase 4 partial multi-prefix → single prefix (^AP-[A-Z]+-\d+$ schema 정합)
- 매핑 표 \_id_normalization_mapping 명시

### DEC-PHASE6-POC02-004 — composite view 도입 (PoC #01 isomorphic)

- 복합 AP 등록 거절 (Document 표준 권고 — single concern AP)
- avoid-list.md `## composite view` 섹션 가독성 보존

### DEC-PHASE6-POC02-005 — low candidate 등록 결정

- F-058/F-076/F-078 등록 vs candidate 유지
- 권고: **등록** (PoC #01 도 low 4건 등록)

---

## §6. sub-agent 가벼운 전략 (Phase 5-1 계승)

| Agent        | scope                                                                                                    | 시간 cap | 산출 line |
| ------------ | -------------------------------------------------------------------------------------------------------- | -------- | --------- |
| **Document** | OWASP Top 10 / IDDD / Refactoring 권위 / Composite view 표준 / id 정규화 권위                            | 8분      | 200~300   |
| **Senior**   | Phase 1-3 누락 candidate 5건 cross-check + 19~21 final AP severity 검증 + PoC #01 15 AP cross-validation | 10분     | 300~400   |
| ~~Case~~     | **생략** (Phase 1~5-1 누적 충분 + Phase 6 = 분류 작업)                                                   | —        | —         |

### F-015 cross-validation

- 메인 사전 raw fetch §2 (Phase 4 partial 6 + Phase 5-1 8 + Phase 1-3 5 = 19 AP candidate) → sub-agent 가 같은 데이터 cross-check

---

## §7. 산출물 체크리스트

### 7.1 deliverable 3종

- [ ] `output/antipatterns/antipatterns.json` (~700 line / final AP 18~21건)
- [ ] `output/antipatterns/avoid-list.md` (~400 line / priority order + composite view + REC-\* 합산)
- [ ] `output/antipatterns/_manifest.yml` (~250 line / 5 결정 + 신뢰도 + approval_gate)

### 7.2 deterministic 검증

- [ ] antipatterns.json JSON parse ✅
- [ ] schema 정합 (id pattern ^AP-[A-Z]+-\d+$ unique)
- [ ] 모든 AP `finding_ref` 존재
- [ ] 모든 AP `evidence_files` 정합
- [ ] PoC #01 15 AP cross-validation 표 (재현/비재현)

### 7.3 approval_gate (방법론 §5 + research §10)

- [ ] schema 검증 통과
- [ ] tone check (비난 표현 0)
- [ ] critical/high 인 human_review_required 명시
- [ ] composite view 별도 표기
- [ ] PoC #01 cross-validation 결과 명시

### 7.4 finding 등록

- [ ] poc-findings.md 갱신 — Phase 6 신규 finding (있을 시)
- [ ] AP-\* ID 와 finding ref 양방향 cross-link

### 7.5 PROGRESS

- [ ] `.claude/PROGRESS-poc02-phase6.md` 신규 작성

---

## §8. 신뢰도 예상

```
formula v1:
- base 0.75
- inputs: source_code + orm + config_files + domain_context + phase_4_partial + phase_5_candidate + phase_1_3_additional_candidate
- modifier:
  - orm_full +0.05
  - openapi_ground_truth +0.05 (PoC #02 강한 입력)
  - diagrams_other +0.02
  - cross_phase_aggregation +0.03 (Phase 1~5-1 누적)
  - document_case_alignment +0.02 (PoC #01 15 AP cross-validation 정합 영역)
  - schema_compliance_100 +0.01
- penalty:
  - no_operational_db -0.03
  - no_fe_layer -0.03 (BE only — F-026 재현)
- subtotal 0.87
- cross_validation_modifiers (예상):
  - F-015 합의 +0.01
  - composite_view consistency +0.02
- raw_confidence 예상: 0.90~0.93
- PoC #01 0.96 보다 약간 낮음 — Phase 1-3 누락 candidate 통합 risk
```

---

## §9. 다음 단계 (4원칙 사이클)

1. **2원칙** — Document + Senior 가벼운 spawn (예상 8~12분)
2. **research-phase6-poc02.md 통합**
3. **3원칙** — 윤주스 승인 (5 핵심 결정 일괄)
4. **산출 3종 작성**
5. **finding 등록 + PROGRESS 갱신**
6. **Phase 6 종료 — 7대 산출물 6/7 도달 → PoC #02 종료** + memory 갱신

---

## §10. Lessons Learned 영역 (4원칙)

(공란 — Phase 6 진행 중 갱신)

---

**END OF plan-phase6-poc02.md (1원칙 ✅)**
