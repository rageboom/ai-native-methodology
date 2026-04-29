# Research — PoC #02 Phase 6 통합 (Document + Senior)

> 4원칙 2단계: 에이전트 팀 토론 → research.md 통합
> 작성 시각: 2026-04-29 / 방법론 v1.1.2

---

## §1. sub-agent 결과 요약

| Agent | 시간 | 산출 line | 핵심 결과 |
|---|---|---|---|
| Document | 2분 19초 | ~260 | OWASP/IDDD/Refactoring/NIST/Tech Radar 권위 / id 정규화 표 / composite view 표준 |
| Senior | 2분 47초 | ~380 | F-015 cross-check + 21 AP final + PoC #01 15 AP cross-validation + composite view 4건 권고 |
| ~~Case~~ | 생략 | — | Phase 1~5-1 누적 충분 (전략 계승) |

**가벼운 전략 효과 누적**: Phase 4 (152초/66초) → Phase 5-1 (93초/125초) → Phase 6 (139초/167초). prompt 단순화 + 5 파일 read 만으로 ~10배 단축 효과 유지.

---

## §2. 3-합의 영역 (Document ∩ Senior)

### 2.1 critical 3건 등록 (만장일치)
- **AP-API-001** F-070+F-079+F-085 spec/runtime drift 묶음 (Phase 5-1 DEC-001 정합)
- **AP-DB-001** F-048 TagJpaRepository<Tag, Integer> 타입 오류 (runtime ClassCastException 잠복)
- **AP-SECURITY-001** F-068 RSA private key git commit (PoC #01 isomorphic — OWASP A02 + CWE-321/798)

### 2.2 ID 정규화 표 (만장일치)
- AP-API-IDEMPOTENCY-001 → AP-API-001
- AP-HEXAGONAL-001/002 → AP-ARCH-001/002
- AP-DB-CASCADE-001 → AP-DB-002
- AP-DOMAIN-SELF-FOLLOW-001 → AP-DOMAIN-002
- AP-DOMAIN-TITLE-UNIQUE-001 → AP-DOMAIN-001
- schema id pattern `^AP-[A-Z]+-\d+$` 강제

### 2.3 composite view 4건 도입 (만장일치)
- §5.1 Hexagonal port-adapter 경계
- §5.2 API 계약 결함
- §5.3 JWT/Auth 보안 (PoC #01 동형)
- §5.4 DB 데이터 무결성

PoC #01 1건 → PoC #02 4건 확장.

### 2.4 low candidate 3건 등록 (합의)
- F-058 → AP-DOMAIN-004 (TOCTOU race-prone)
- F-076 → AP-DOMAIN-005 (setTitle race)
- F-078 → AP-DOMAIN-006 (DRY)

---

## §3. 충돌 해소

### 3.1 F-080 (limit no max) severity (Document = high / Senior = medium)

| 차원 | Document | Senior |
|---|---|---|
| 평가 | OWASP API4 권위 → AP-API-008 high | runtime cap 50 (ArticleFacets:21) 존재 → 영향 제한적 medium |

**해소 — Senior 채택**:
- Document 는 표준 권위만 고려 / Senior 는 runtime 방어 cross-check
- runtime cap 50 이 server-side 방어 작동 → DoS 실제 영향 medium
- 합의: **F-080 medium 유지** ✅

### 3.2 F-083 (DELETE 200) severity (Document = low 확정 / Senior = low maintained)

- 합의 low (RealWorld 호환성 + body 반환 endpoint 정당화 + PoC #01 일관)

### 3.3 다른 영역 — 합의

- F-082 (versioning) medium / F-084 (Token apiKey) medium / F-085 (login 201) medium / F-086 (PUT vs PATCH) medium / F-087 (307 redirect) medium / F-081 (codegen) low — 모두 합의

---

## §4. 5 핵심 결정 (Phase 6)

### DEC-PHASE6-POC02-001 — AP-API-001 critical 단일 등록 ✅
- F-070 + F-079 + F-085 단일 묶음 (Phase 5-1 DEC-001 정합)
- composite AP 등록 금지 / evidence 통합 + composite view §5.2 가독성

### DEC-PHASE6-POC02-002 — Phase 1-3 누락 candidate 등록 (5건) ★
- F-048 critical (AP-DB-001) ★ TagJpaRepository
- F-068 critical (AP-SECURITY-001) ★ RSA git commit (PoC #01 isomorphic)
- F-051 high (AP-PERFORMANCE-001) EAGER + Specification + Pageable
- F-053 medium (AP-DOMAIN-003) titleToSlug 8 함정
- F-069 medium (AP-DB-003) ArticleSpecifications Cartesian

**중요성**: 누락 시 PoC #02 산출물 핵심 가치 훼손 — critical 2건은 사내 적용 시 즉시 차단 영역.

### DEC-PHASE6-POC02-003 — ID 정규화 (multi-prefix → single) ✅
- 6건 매핑 표 (§2.2)
- `_id_normalization_mapping` 표 명시 (PoC #01 패턴)

### DEC-PHASE6-POC02-004 — composite view 4건 도입 (PoC #01 1건 → 4건 확장) ✅
- Hexagonal / API 계약 / JWT-Auth / DB 무결성
- 개별 AP 등록 거절 + avoid-list.md 가독성 섹션

### DEC-PHASE6-POC02-005 — low candidate 3건 등록 ✅
- F-058 / F-076 / F-078 → AP-DOMAIN-004/005/006
- PoC #01 low 4건 분포 정합

---

## §5. Phase 6 final AP 21 통합 표

| ID | severity | 출처 finding | 카테고리 | 비고 |
|---|---|---|---|---|
| **AP-API-001** | critical | F-070+F-079+F-085 | API | spec/runtime drift 묶음 ★ |
| **AP-DB-001** | critical | F-048 | DB | TagJpaRepository<Tag, Integer> ★ |
| **AP-SECURITY-001** | critical | F-068 | SECURITY | RSA key git commit (PoC #01 isomorphic) ★ |
| AP-ARCH-001 | high | F-071 | ARCH | UserRepositoryAdapter Hexagonal |
| AP-DOMAIN-001 | high | F-052 | DOMAIN | title varchar(50) unique over-constraint |
| AP-PERFORMANCE-001 | high | F-051 | PERFORMANCE | EAGER + Specification + Pageable HHH000104 |
| AP-API-002 | low | F-083 | API | DELETE 200 vs 204 (RealWorld 호환성) |
| AP-API-003 | medium | F-082 | API | versioning 부재 (PoC #01 F-038 재현) |
| AP-API-004 | medium | F-080 | API | limit no maximum (OWASP API4) |
| AP-API-005 | medium | F-086 | API | PUT vs PATCH (RFC 5789) |
| AP-API-006 | medium | Senior §5.1 | API | controller orchestration |
| AP-API-008 | medium | F-087 | API | 307 internal redirect leaked |
| AP-ARCH-002 | medium | F-072 | ARCH | Adapter multi-aggregate orchestration |
| AP-DB-002 | medium | F-073 | DB | FK CASCADE 부재 |
| AP-DB-003 | medium | F-069 | DB | ArticleSpecifications Cartesian |
| AP-DOMAIN-002 | medium | F-074 | DOMAIN | self-follow 부재 |
| AP-DOMAIN-003 | medium | F-053 | DOMAIN | titleToSlug 8 함정 |
| AP-API-007 | low | F-081 | API | codegen legacy |
| AP-DOMAIN-004 | low | F-058 | DOMAIN | TOCTOU race-prone |
| AP-DOMAIN-005 | low | F-076 | DOMAIN | setTitle race |
| AP-DOMAIN-006 | low | F-078 | DOMAIN | DRY editTitle/... |

**총 21 AP** = critical 3 / high 3 / medium 11 / low 4

**PoC #01 비교**: 15 AP (critical 2 / high 2 / medium 7 / low 4) → PoC #02 21 AP (+6).

---

## §6. PoC #01 15 AP cross-validation 핵심

- **비재현 8건** (53%) — 학습 효과 + Hexagonal/Spring Boot 3.x 마이그레이션 효과
- **재현 4건** (27%) — v1.2.0 합산 격상 강한 권위
- **변형 재현 3건** (20%) — pattern 학습 후 다른 형태 발현 (AP-SECURITY-001 RSA + AP-DOMAIN-002 race-prone + AP-ARCH-002 hybrid)

**v1.2.0 격상 데이터 확보 결과**:
- AP-PERFORMANCE-001 (EAGER) 재현 + medium → high 격상 → 권위 강화
- AP-API-001/002 (versioning + status) 재현 → 묶음 G 보강
- AP-DB-001 (NO ACTION) 재현 → 묶음 D 보강
- AP-SECURITY-001 (Cryptographic Failures) 변형 재현 → **묶음 H 격상 evidence 강력**

---

## §7. 신뢰도 산정 (formula v1)

| 차원 | 값 |
|---|---|
| base | 0.75 |
| modifier orm_full | +0.05 |
| modifier domain_context_md | +0.03 |
| modifier openapi_ground_truth | +0.07 (PoC #02 강한 입력) |
| modifier multi_module_arch | +0.02 (Hexagonal cross-validation 가치) |
| modifier cross_phase_aggregation | +0.03 (Phase 1~5-1 누적) |
| modifier poc_01_isomorphic_pattern | +0.02 (15 AP cross-validation) |
| modifier schema_compliance_100 | +0.01 |
| penalty no_operational_db | -0.03 |
| **subtotal** | **0.95** |
| F-015 cross-validation +0.01 (3-합의 영역) | +0.01 |
| **raw_confidence** | **0.96** |

**PoC #01 0.96 동급** ✅

---

## §8. 산출 4종 작성 전략 (방법론 §5)

### 8.1 antipatterns.json
- 21 AP × full schema (id / category / name / description / severity / why_avoid / evidence / occurrences / recommended_alternative / related_rules_to_extract / related_modules / detected_by / confidence / human_review_status / tags)
- `_id_normalization_mapping` 표 (PoC #01 isomorphic)
- `_composite_view_metadata` 4건
- `_phase_6_cross_validation` 7대 산출물 6/7
- `human_review_required` 5건 (critical 3 + high 3 - 1 = 5건 추천)

### 8.2 avoid-list.md
- Priority order 4단계 (Critical 0~1주 / High 1~2주 / Medium 1~3개월 / Low 6개월~)
- composite view 4섹션
- 부록 A: AP × REC 매트릭스
- 부록 B: Phase 6 final 검증 점검표
- 부록 C: 모범 사례 (positive findings — F-064/F-065/F-066) — PoC #02 신규 부록
- 부록 D: PoC #01 비교 매트릭스 (15 AP)

### 8.3 _manifest.yml
- 5 핵심 결정 (DEC-PHASE6-POC02-001~005)
- 신뢰도 0.96 산정 표
- approval_gate 체크리스트 8건
- 7대 산출물 6/7 도달 표기 (PoC #02 종료)
- v1.2.0 격상 데이터 합산 결과 (PoC #01 15 + PoC #02 21 = 36 AP / 묶음 11)

---

## §9. approval_gate 체크리스트

- [ ] schema 검증 통과 (^AP-[A-Z]+-\d+$ unique 21/21)
- [ ] tone check (비난 표현 0)
- [ ] critical/high 5건 human_review_required 명시
- [ ] composite view 4건 별도 표기
- [ ] PoC #01 15 AP cross-validation 결과 명시
- [ ] _id_normalization_mapping 6건 표
- [ ] PoC #02 산출물 6/7 도달 (UI/UX 제외 100%)
- [ ] 모든 AP `finding_ref` 양방향 cross-link

---

## §10. 다음 단계 (3원칙 사용자 승인 영역)

1. **3원칙 — 윤주스 승인** (DEC-PHASE6-POC02-001~005 일괄)
2. **산출 3종 작성** (Auto Mode 일괄):
   - `output/antipatterns/antipatterns.json` (21 AP)
   - `output/antipatterns/avoid-list.md` (priority order + 4 composite view + 4 부록)
   - `output/antipatterns/_manifest.yml` (5 결정 + 신뢰도 + 7대 산출물 6/7)
3. **finding 등록** (poc-findings.md 갱신 — Phase 6 종료 누적 통계)
4. **PROGRESS-poc02-phase6.md T+1~ 시간순 갱신**
5. **PoC #02 종료 — memory 갱신 + 7대 산출물 6/7 도달 표기**
6. **다음 단계 결정 — v1.2.0 합산 격상 vs PoC #03 진입** (윤주스 결정 영역)

---

**END OF research-phase6-poc02.md (2원칙 ✅ — 3원칙 사용자 승인 영역)**
