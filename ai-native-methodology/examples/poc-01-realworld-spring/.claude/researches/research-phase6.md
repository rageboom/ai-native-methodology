# Research Phase 6 (안티패턴 통합 / quality) — 통합 결론

> 작성일: 2026-04-29
> 작성자: 메인 에이전트 (3 sub-agent 산출 + 충돌 해소 통합)
> 방법론 버전: v1.1.2
> Phase: PoC #01 RealWorld Spring Boot — Phase 6 (안티패턴 final merge)
> 입력: `document-phase6.md` (~1500 line) / `case-phase6.md` (~1900 line) / `senior-phase6.md` (~700 line, 메인 fallback) + Phase 4 partial + Phase 5 candidate + Phase 4 추가 candidate

---

## 0. 본 문서 사용법

본 문서는 **Phase 6 4단계 (산출 작성)** 의 **의사결정 가이드**. 본문 인용은 3 sub-agent 산출에 위임. 본 문서는 **합의/충돌 해소 + 결론 + 4단계 작성 인덱스** 만 정리.

---

## 1. 입력 정합성 확인

### 1.1 통합 대상 15 AP 잠재 후보

| 출처 | 개수 | ID 형식 |
|---|---|---|
| Phase 4 partial | 6 | AP-{CAT}-001 ~ AP-{CAT}-002 (이미 정규화) |
| Phase 5 candidate | 6 | multi-prefix → 정규화 필요 |
| Phase 4 추가 candidate | 3 | AP-PERFORMANCE-001 / AP-DOMAIN-003 / AP-DOMAIN-004 |

### 1.2 ID 정규화 매핑 (Phase 5 candidate)

| Phase 5 candidate ID | Phase 6 final ID | 카테고리 |
|---|---|---|
| AP-PERFORMANCE-001 (Phase 5) | **AP-PERFORMANCE-002** | PERFORMANCE |
| AP-SECURITY-CONFIG-IMPLICIT-001 | **AP-SECURITY-002** | SECURITY |
| AP-SECURITY-CONFIG-WEBSEC-IGNORING-001 | **AP-SECURITY-003** | SECURITY |
| AP-ARCH-DEPRECATED-001 | **AP-ARCH-003** | ARCH |
| AP-API-VERSIONING-001 | **AP-API-001** | API |
| AP-API-STATUS-INCONSISTENT-001 | **AP-API-002** | API |

### 1.3 3 sub-agent 합의 / 충돌

| 결정 항목 | Document | Case | Senior (메인 fallback) | 결론 |
|---|---|---|---|---|
| 복합 AP 등록 | ❌ 거절 | ✅ 등록 | ❌ 거절 (윤주스 절대 우선순위) | **거절** + avoid-list.md composite view 섹션 |
| AP-PERFORMANCE-001 severity | medium 유지 | high 격상 | medium 유지 (본 PoC) + 사내 high 메타 | **medium 유지** |
| AP-ARCH-003 severity | medium 유지 | low 권고 | low 채택 | **low** |
| AP-API-002 severity | low 유지 (RealWorld 호환) | (영역 외) | low 유지 + 사내 medium 메타 | **low** |
| 보안 강제 | critical 강제 (7중 위반) | critical 매핑 | critical 강제 | **critical** ✅ |
| 데이터 손실 강제 | high 강제 (DRIFT-010) | (영역 외) | high 강제 | **high** ✅ |

### 1.4 신규 finding 후보 (Document 발굴 3건 + Senior 평가)

| 후보 | 시니어 결정 |
|---|---|
| JWT iss/aud/sub claim 검증 부재 | **F-037 통합 (별도 등록 거절)** — F-037 description 보강 |
| JWT alg explicit 검증 부재 (RFC 8725 §3.1) | **F-041 신규 등록** (low / deferred) |
| sessionCreationPolicy 명시 보강 | **F-034 통합 (별도 등록 거절)** |

→ **신규 finding 1건 (F-041)** 등록.

---

## 2. 5 핵심 결정 (시니어 권고 — 윤주스 승인 대기)

| 결정 ID | 내용 | 결론 |
|---|---|---|
| DEC-AP-001 | 복합 AP 등록 여부 | **거절** (Document/Senior 채택, Case 가독성은 섹션화) |
| DEC-AP-002 | severity 재산정 (AP-PERFORMANCE-001 / AP-ARCH-003) | **AP-PERFORMANCE-001 medium 유지 (본 PoC) / AP-ARCH-003 medium → low** |
| DEC-AP-003 | Phase 4 추가 candidate 3건 등록 여부 | **모두 등록** (EAGER / F-017 / F-028) |
| DEC-AP-004 | 사내 권고 41건 통합 형식 | **severity 별 + 영역 별 + composite view + 부록 매트릭스** (senior §6 채택) |
| DEC-AP-005 | 신규 finding F-041 (JWT alg explicit) | **등록** (low / deferred) |

---

## 3. 최종 15 AP 목록 (severity 분포)

| ID | category | severity | name | 출처 |
|---|---|---|---|---|
| AP-DOMAIN-001 | DOMAIN | **critical** | Comment 삭제 De Morgan 버그 | Phase 4 partial |
| AP-SECURITY-001 | SECURITY | **critical** | JWT secret 21byte 하드코딩 | Phase 4 partial |
| AP-DOMAIN-002 | DOMAIN | **high** | email/username unique 3중 부재 | Phase 4 partial (DRIFT-010) |
| AP-PERFORMANCE-002 | PERFORMANCE | **high** | Pageable / limit cap 부재 | Phase 5 candidate |
| AP-ARCH-001 | ARCH | medium | LV-001 (presentation→infra) | Phase 4 partial |
| AP-ARCH-002 | ARCH | medium | LV-002 (domain→Spring leak) | Phase 4 partial |
| AP-DB-001 | DB | medium | FK ON DELETE 부재 | Phase 4 partial (DRIFT-007) |
| AP-SECURITY-002 | SECURITY | medium | sessionCreationPolicy(STATELESS) 명시 부재 | Phase 5 candidate (F-034) |
| AP-SECURITY-003 | SECURITY | medium | WebSecurity#ignoring vs permitAll | Phase 5 candidate (F-036) |
| AP-API-001 | API | medium | API 버저닝 부재 | Phase 5 candidate (F-038) |
| AP-PERFORMANCE-001 | PERFORMANCE | medium | Article+Comment EAGER N+1 | Phase 4 추가 candidate |
| AP-API-002 | API | low | HTTP status code 일관성 | Phase 5 candidate (F-040) |
| AP-DOMAIN-003 | DOMAIN | low | F-017 @ManyToMany in @Embeddable | Phase 4 추가 candidate |
| AP-DOMAIN-004 | DOMAIN | low | F-028 mutable email equals/hashCode | Phase 4 추가 candidate |
| AP-ARCH-003 | ARCH | **low** | WebSecurityConfigurerAdapter deprecated | Phase 5 candidate (F-039 — Case 권고 채택) |

**severity 분포**: critical 2 / high 2 / medium 7 / low 4 = **15 AP**

**human_review_required (critical/high 모두)**: 4건
- AP-DOMAIN-001 (critical) / AP-SECURITY-001 (critical) / AP-DOMAIN-002 (high) / AP-PERFORMANCE-002 (high)

---

## 4. avoid-list.md 구조 (Senior §6 채택)

```markdown
## ⚠️ Critical (즉시 차단) — 2 AP / 7 REC
[AP-SECURITY-001 + AP-DOMAIN-001 + REC-JWT-001/002 + REC-F027-001/002 + REC-AUTH-002 + REC-DOS-001/002]

## 🔴 High (1 스프린트 내 처리) — 2 AP / 26 REC
[AP-DOMAIN-002 + AP-PERFORMANCE-002 + 영역별 그룹]

## 🟡 Medium (다음 분기) — 7 AP / 8 REC
[AP-ARCH-001/002 / AP-SECURITY-002/003 / AP-DB-001 / AP-API-001 / AP-PERFORMANCE-001]

## 🟢 Low (백로그) — 4 AP
[AP-API-002 / AP-DOMAIN-003 / AP-DOMAIN-004 / AP-ARCH-003 (Case 권고 medium → low)]

## 🛡️ 보안 설정 종합 점검 (composite view)
[AP-SECURITY-001/002/003 + AP-ARCH-003 cross-link + Spring Boot 3.x 마이그레이션 일괄 코드]

## 📊 사내 적용 우선순위
[4단계 표]

## 부록 A — AP ↔ REC 매트릭스
[15 AP × 41 REC]

## 부록 B — Phase 6 final 검증 점검표
[workflow §9 7대 산출물 cross-validation 결과]
```

---

## 5. 신뢰도 산정 (formula v1)

```yaml
base: 0.80   # phase-6-quality.md §8 — 가장 높은 phase
modifiers:
  orm_full: +0.05
  domain_context_md: +0.03
  postman_or_api_test: +0.05
  diagrams_other: +0.02
  cross_phase_aggregation: +0.03
  no_operational_db: -0.03
subtotal: 0.95

cross_validation_modifiers:
  document_case_alignment: +0.02   # 11/15 AP 외부 검증 통과
  composite_ap_decision_resolved: 0
  schema_compliance_100: +0.01

raw_confidence: 0.96   # cap 0.98 미만
```

---

## 6. 4단계 작성 인덱스 (T+0 ~ T+13)

| T+ | 작업 | 인용 자료 |
|---|---|---|
| T+0 | output/antipatterns/ 디렉토리 생성 | (없음) |
| T+1 | Phase 4 partial 6 AP 결정적 통합 | antipatterns-partial.json |
| T+2 | Phase 5 candidate 6 AP 정규화 + 추가 | api-extension.json + research-phase5 §8 + Document §JWT |
| T+3 | Phase 4 추가 candidate 3 AP 추가 | antipatterns-partial.json _meta + research-phase4 |
| T+4 | 복합 AP 검토 (거절 결정 — 본 문서 §2 DEC-AP-001) | senior §1.3 |
| T+5 | Phase 2 정합성 보고서 격상 검증 (DRIFT 9건 / 추가 격상 0건) | 정합성-검증-보고서.md |
| T+6 | severity 재산정 (DEC-AP-002) | senior §2 + case 권고 |
| T+7 | 톤 점검 (자동 변환 패턴 적용) | workflow §4 |
| T+8 | antipatterns.json v1 작성 (15 AP / schema 검증) | document §AP 매핑 / case stub §14 / senior §8.1-8.2 |
| T+9 | avoid-list.md 작성 (senior §6 구조) | senior §6 / case §13 |
| T+10 | _manifest.yml 작성 (formula v1 + ID 매핑 표 + Phase 6 부가가치) | senior §7 |
| T+11 | 7대 산출물 cross-validation (workflow §9) | senior §3 영역 12 |
| T+12 | findings/poc-findings.md 갱신 (F-041 등록) | senior §5 |
| T+13 | PROGRESS / RESUME / CLAUDE / memory 갱신 | (없음) |

---

## 7. 부록 A — 3 sub-agent 산출 인덱스

### document-phase6.md (~1500 line)
- §JWT BCP (RFC 8725) — AP-SECURITY-001 7중 위반 ★
- §HTTP/REST (RFC 9110) — AP-API-002
- §De Morgan + CWE-862 — AP-DOMAIN-001
- §JPA EAGER N+1 (Vlad Mihalcea + Hibernate) — AP-PERFORMANCE-001
- §OpenAPI lint (Spectral) — AP-API-001
- §복합 AP 검토 — **거절 권고** ★

### case-phase6.md (~1900 line / 19 섹션)
- 토픽 1 Tech Radar Hold 9건 매핑 ★★★
- 토픽 6 15 AP 잠재 후보 사례 별 정당화 표
- 토픽 7 복합 AP 검토 — **등록 권고** (충돌 → Senior 거절 채택)
- §13 avoid-list.md 분류 stub
- §14 antipatterns.json snippet (case_evidence 필드)

### senior-phase6.md (~700 line, 메인 fallback)
- §1 충돌 해소 (Document 거절 권고 채택)
- §2 severity 재산정
- §6 avoid-list.md 구조 권고
- §7 _manifest.yml 신뢰도 산정
- §8 직접 인용 stub (AP-SECURITY-001 / AP-PERFORMANCE-002 / Critical 섹션)
- §9 Phase 6 final 결정 트리

---

**END OF RESEARCH-PHASE6.md**
