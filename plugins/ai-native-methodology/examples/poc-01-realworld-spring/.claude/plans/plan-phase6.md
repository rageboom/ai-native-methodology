# Plan Phase 6 (안티패턴 통합 / quality) — PoC #01 RealWorld Spring Boot

> 작성일: 2026-04-29
> 작성자: Claude (Phase 6 진입 1원칙)
> 방법론 버전: v1.1.2
> 입력 인계: Phase 0~5-1 완료 (Phase 4 partial 6 AP + Phase 5 candidate 6 + Phase 4 추가 candidate 3)

---

## 0. 절대 우선순위 재확인

품질 1순위 + 재작업 최소화 2순위 (윤주스 2026-04-28). 본 plan 은 PoC #01 의 **마지막 phase** — 이후 PoC #02 진입 + v1.2.0 합산 격상. 본 phase 산출물 = 7대 산출물의 **마지막 1건** (안티패턴) → 7/7 (95% → 100%, UI/UX = N/A 제외).

---

## 1. 작업 목적 (phase-6-quality.md §1 인용)

> Phase 1~5 모두의 결과를 **통합 분석**하여 최종 안티패턴 카탈로그 생성.

본 PoC 의 추가 목표:
1. **Phase 4 partial 6 AP** + **Phase 5 candidate 6** + **Phase 4 추가 candidate 3** → final antipatterns.json 통합
2. **schema id pattern** (`^AP-[A-Z]+-\d+$` 단일 prefix) 준수 — multi-prefix candidate ID 정규화 (ex: `AP-SECURITY-CONFIG-IMPLICIT-001` → `AP-SECURITY-002`)
3. **Phase 2 정합성 보고서 (DRIFT 9건) → 안티패턴 격상** 검증 (이미 DRIFT-007/010 격상 / 나머지 검토)
4. **복합 안티패턴 (composite)** 검토 — Phase 6 부가가치 (여러 phase 결합 패턴)
5. **사내 적용 권고 41건** 통합 → avoid-list.md
6. **톤 점검** (자동) — 비난 표현 → 회피 후보 톤
7. **severity 재산정** (보안 / 데이터 손실 / 비즈니스 로직 분산 / 명명 규칙)

---

## 2. 입력 (Phase 0~5-1 인계 + 소스 코드)

### 2.1 핵심 입력 — Phase 4 partial (6 AP)

| ID | category | severity | name | finding |
|---|---|---|---|---|
| AP-DOMAIN-001 | DOMAIN | **critical** | Comment 삭제 De Morgan 버그 | F-027 |
| AP-SECURITY-001 | SECURITY | **critical** | JWT SECRET 21byte 하드코딩 | (Phase 4) |
| AP-DOMAIN-002 | DOMAIN | high | email/username unique 3중 부재 | DRIFT-010 격상 |
| AP-ARCH-001 | ARCH | medium | LV-001 (presentation→infra) | ARCH-STYLE |
| AP-ARCH-002 | ARCH | medium | LV-002 (domain→Spring leak) | ARCH-STYLE |
| AP-DB-001 | DB | medium | FK ON DELETE 정책 부재 | DRIFT-007 격상 |

human_review_required 3건 (DOMAIN-001 / SECURITY-001 / DOMAIN-002).

### 2.2 핵심 입력 — Phase 5 candidate (6)

| Candidate ID | 정규화 ID | category | severity | finding |
|---|---|---|---|---|
| AP-PERFORMANCE-001 (Phase 5) | **AP-PERFORMANCE-002** | PERFORMANCE | high | (Pageable / limit cap 부재 — Senior 영역 5) |
| AP-SECURITY-CONFIG-IMPLICIT-001 | **AP-SECURITY-002** | SECURITY | medium | F-034 |
| AP-SECURITY-CONFIG-WEBSEC-IGNORING-001 | **AP-SECURITY-003** | SECURITY | medium | F-036 |
| AP-ARCH-DEPRECATED-001 | **AP-ARCH-003** | ARCH | medium | F-039 |
| AP-API-VERSIONING-001 | **AP-API-001** | API | medium | F-038 |
| AP-API-STATUS-INCONSISTENT-001 | **AP-API-002** | API | low | F-040 |

### 2.3 핵심 입력 — Phase 4 추가 candidate (3)

phase_6_additional_candidates (antipatterns-partial.json `_phase_4_partial_meta`):

| Candidate ID | 정규화 ID | category | severity | finding |
|---|---|---|---|---|
| AP-PERFORMANCE-001 (Phase 4) | **AP-PERFORMANCE-001** | PERFORMANCE | medium | (Article+Comment EAGER N+1) |
| AP-DOMAIN-003 (F-017) | **AP-DOMAIN-003** | DOMAIN | low | F-017 (@Embeddable @ManyToMany) |
| AP-DOMAIN-004 (F-028) | **AP-DOMAIN-004** | DOMAIN | low | F-028 (equals/hashCode mutable email) |

### 2.4 Phase 2 정합성 보고서 (DRIFT 9건 → AP 격상 검토)

이미 격상:
- DRIFT-007 → AP-DB-001 ✅
- DRIFT-010 → AP-DOMAIN-002 ✅

미격상 (Phase 2/4 결정으로 NO ACTION 또는 권장만):
- DRIFT-002 (단방향) → BR-USER-FOLLOW-001 (BR 등록만)
- DRIFT-003 (권장만) → REC-001
- 기타 DRIFT (5건) → 검토 필요 (대부분 low/medium 으로 남았을 가능성)

### 2.5 복합 안티패턴 검토 후보 (Phase 6 부가가치)

| 후보 | 결합 phase | 평가 |
|---|---|---|
| F-027 De Morgan + BR-AUTHOR + AP-DOMAIN-001 | Phase 4 + 5 | 단일 AP-DOMAIN-001 critical 에 이미 통합 — 복합 별도 등록 불필요 |
| LV-001 + LV-002 (Layered+DDD-Lite) | Phase 3 + 4 | AP-ARCH-001 + AP-ARCH-002 단일 등록 — 복합 별도 등록 불필요 |
| JWT 자체 구현 + STATELESS implicit + WebSecurity ignoring | Phase 4 + 5 | **AP-COMPOSITE-001 후보** — JWT/Auth 패턴 종합 (critical AP-SECURITY-001 + medium AP-SECURITY-002 + AP-SECURITY-003 결합) |
| EAGER + JPA Set 멤버십 (F-028) + email mutable | Phase 4 | low — AP-DOMAIN-004 단일 등록 충분 |

→ 복합 AP **0~1건** (선택 — sub-agent 검토 후 결정).

### 2.6 사내 적용 권고 41건 (Senior + api.md 통합)

- critical 7 / high 26 / medium 8
- 통합 위치: avoid-list.md severity 별 분류 + AP cross-link

### 2.7 방법론 명세 (v1.1.2)

- methodology-spec/workflow/phase-6-quality.md
- methodology-spec/deliverables/06-안티패턴.md
- schemas/antipatterns.schema.json (cap 0.98 / id pattern `^AP-[A-Z]+-\d+$` / category enum 11 / severity enum 5)

---

## 3. 작업 범위

### 3.1 통합 대상 — 최종 12~15 AP

| 분류 | 개수 | 신뢰도 |
|---|---|---|
| Phase 4 partial (그대로) | 6 | 0.85~0.95 |
| Phase 5 candidate (정규화) | 6 | 0.80~0.90 |
| Phase 4 추가 candidate | 3 | 0.70~0.85 |
| 복합 AP (선택) | 0~1 | 0.70~0.80 |
| **합계 (예상)** | **15~16** | — |

### 3.2 산출물 (3 파일)

```
output/antipatterns/
├── antipatterns.json           # AI용 final 통합 (schema 검증 통과)
├── avoid-list.md               # 사람용 체크리스트 (severity 별 + REC 41 통합)
└── _manifest.yml               # 메타 + 신뢰도 산정 (formula v1)
```

추가 메타 갱신 (선택):
- output/antipatterns-partial/_manifest.yml — Phase 6 final merge 완료 표시 + reference link
- findings/poc-findings.md — Phase 6 신규 finding (예상 0~2건)

### 3.3 추출 항목 (deliverable 06 §3.1)

| 항목 | 결정적/LLM | 출처 |
|---|---|---|
| 단순 통합 (partial → final) | 결정적 | antipatterns-partial.json |
| ID 정규화 (multi-prefix → schema-compliant) | 결정적 | schema regex |
| 정합성 보고서 격상 | 결정적 | 정합성-검증-보고서.md severity=high 항목 |
| 복합 AP 검출 | LLM | Phase 1~5 cross-link 분석 |
| 톤 점검 | 결정적 | 비난 표현 패턴 (workflow §4) |
| severity 재산정 | LLM + 기준표 | workflow §5 (보안 high 강제 등) |
| recommended_alternative | LLM (이미 partial 에 작성) | partial 인계 + Phase 5 권고 |

---

## 4. 변경 대상

### 4.1 신규 파일 (3건)

```
output/antipatterns/antipatterns.json
output/antipatterns/avoid-list.md
output/antipatterns/_manifest.yml
```

### 4.2 갱신 파일 (조건부)

| 파일 | 조건 | 변경 내용 |
|---|---|---|
| output/antipatterns-partial/_manifest.yml | Phase 6 merge 완료 시 | `phase_6_merged: true` + reference link |
| findings/poc-findings.md | 신규 finding 발생 시 | F-041+ 등록 |
| .claude/PROGRESS-poc01-phase6.md | 시간순 갱신 의무 (기록 대전제) | 단계 전환·블로커·결정 시 |

### 4.3 미변경 (이미 종료된 산출 — 재작업 금지)

- output/inventory/* / output/db/* / output/architecture/* / output/domain/* / output/rules/* / output/api/*
- 단 _manifest.yml 의 phase_6_handoff 정보 활용만

---

## 5. 영향도

### 5.1 다운스트림 (PoC #02 진입 영향)

- **PoC #02 진입 차단 요인 없음** — Phase 6 완료 = PoC #01 7대 산출물 6/7 (95% → UI/UX 제외 100%)
- Phase 6 산출 = PoC #02 의 ground truth (다른 스택 검증 시 동일 패턴 발현 여부 확인)
- v1.2.0 격상 묶음 7 (A~G) 재평가 — Phase 6 신규 finding 0~2건 추가 시 묶음 변경 가능

### 5.2 7대 산출물 진행률

| # | 산출물 | 단계 | 본 plan 후 |
|---|---|---|---|
| 1 | 아키텍처 | Phase 3 | ✅ |
| 2 | 도메인 모델 | Phase 4 | ✅ |
| 3 | API 계약 | Phase 5-1 | ✅ |
| 4 | DB 스키마 | Phase 2 | ✅ |
| 5 | 비즈니스 규칙 | Phase 4 | ✅ |
| **6** | **안티패턴** | **Phase 6** | ⏳ **본 plan 의 산출** |
| 7 | UI/UX | Phase 5-2 | ❌ N/A (BE only) |

**Phase 6 종료 시 6/7 + N/A 1 = 100%** (UI/UX 제외).

### 5.3 신뢰도 영향 (formula v1)

phase-6-quality.md §8 기준 **가장 높은 신뢰도** (1.0 ~ 0.70):

```
base 0.80   (가장 신뢰도 높은 phase — 결정적 통합)
+ orm_full          0.05
+ domain_context_md 0.03
+ postman_or_api_test 0.05
+ diagrams_other    0.02
+ Phase 1~5 raw fetch 누적 +0.03 (메인 + sub-agent 통합 검증)
─ no_operational_db -0.03 (5.D 0건)
─────────────────────────
raw confidence:     0.95   (Phase 0 manifest expected_confidence_average 와 비교)
```

영역별 (예상):
- 단순 통합 (partial → final): 0.98
- 순환 의존성 (CIRCULAR-001 same_bc → AP 등록 안 함): 1.0
- 정합성 drift (DRIFT-007/010 격상 완료): 1.0
- ID 정규화 (schema regex): 0.98
- 복합 AP (LLM 추론): 0.70
- severity 재산정: 0.85
- 톤 점검 (자동): 0.95

---

## 6. 리스크

### 6.1 schema id pattern 한계 (확실 — 사전 인지)

`^AP-[A-Z]+-\d+$` — 단일 카테고리 prefix + 3자리 번호. multi-prefix candidate ID (`AP-SECURITY-CONFIG-IMPLICIT-001`) 사용 불가.

**대응**: schema-compliant 짧은 ID + descriptive name 패턴 채택 (Phase 4 partial 와 동일). _manifest.yml 에 매핑 표 명시.

### 6.2 Phase 4 partial 와 Phase 5 candidate 의 ID 충돌

- Phase 4 candidate `AP-PERFORMANCE-001` (EAGER N+1, medium)
- Phase 5 candidate `AP-PERFORMANCE-001` (Pageable limit cap, high)

**대응**: Phase 4 candidate = AP-PERFORMANCE-001 / Phase 5 candidate = AP-PERFORMANCE-002 로 분리.

### 6.3 복합 안티패턴 LLM 추론 한계

**대응**: F-015 cross-validation — 메인 사전 검토 (Phase 1~5 manifest cross-link) + sub-agent 재검토. 복합 AP 0~1건만 등록 (over-engineering 회피).

### 6.4 사내 권고 41건 통합 시 가독성 손상

**대응**: avoid-list.md 를 severity 별 (critical/high/medium/low) + 영역 별 분류. AP 별 핵심 권고 1~2개 cross-link + 전체 41건은 부록 표.

### 6.5 잠재 신규 finding (예상 0~2건)

| ID 후보 | severity | 설명 |
|---|---|---|
| F-041 | low~medium | Phase 6 final merge 시 schema id pattern 재발견 (F-025 와 통합 가능) |
| F-042 | low | 복합 AP 신뢰도 산정 가이드 부재 (LLM 추론 0.70) |

→ 임계 32 → 32~34 도달 가능성. 윤주스 절대 우선순위 (PoC #02 후 v1.2.0 합산 격상) 유지.

### 6.6 비호환 위험 (없음 — 신규 산출물)

본 Phase 6 는 신규 산출물 작성. 기존 산출물 (Phase 1~5) 은 미변경 (조건부 _manifest.yml + findings 만).

---

## 7. 작업 단계 (Work Principles 4원칙 적용)

### 1원칙 — 본 plan 작성 (in_progress) ✅ 본 문서

### 2원칙 — 3 에이전트 병렬 리서치 → research-phase6.md (예정)

| 에이전트 | 산출물 | 핵심 조사 |
|---|---|---|
| **Document Researcher** | document-phase6.md | OWASP Top 10 / SonarQube 안티패턴 카탈로그 / Spring Anti-pattern / RFC 9110 (HTTP) / JPA EAGER N+1 / RFC 7515/7519 / De Morgan 법칙 / OpenAPI lint 룰 |
| **Case Researcher** | case-phase6.md | Netflix 안티패턴 카탈로그 / GitHub Engineering Blog / 우아한형제들 / 카카오 / 토스 / 네이버 / 안티패턴 카탈로그 사례 / TBR (Technology Bottom-up Review) / Tech Radar 패턴 |
| **Senior Engineer** | senior-phase6.md | 12 영역 함정 (severity 재산정 / 복합 AP 검출 / 톤 점검 / 사내 권고 통합 / GDPR/회원관리 / 보안 우선순위 / Spring Security 표준 / OpenAPI 권고 / DDD 권고 / 한국 SI 회피 패턴 / Phase 6 final 검증 / 7대 산출물 cross-validation) |

→ **research-phase6.md** 통합 (3 에이전트 결과 + 메인 cross-validation).

### 3원칙 — 윤주스 (TF Lead) 코드 착수 승인 대기

승인 항목:
1. 작업 범위 (15~16 AP / 3 신규 파일)
2. ID 정규화 매핑 (Phase 4 candidate AP-PERFORMANCE-001 + Phase 5 candidate AP-PERFORMANCE-002 분리)
3. 복합 AP 등록 여부 (0~1건 — JWT/Auth 종합 등)
4. severity 재산정 정책 (보안 high 강제 / Phase 5 candidate severity 검증)
5. 사내 권고 41건 통합 형식 (avoid-list.md 분류 정책)
6. Phase 4 추가 candidate 3건 (AP-PERFORMANCE-001 EAGER / F-017 / F-028) 등록 여부

### 4원칙 — 실패 시 revert + 교훈 반영 + 1원칙 재시작

실패 트리거:
- schema 검증 실패 (id pattern / category enum / severity enum)
- 톤 점검 실패 (비난 표현 5+ 잔존)
- 복합 AP LLM 추론 신뢰도 < 0.70
- 사내 권고 41건 통합 누락 5+ 건

---

## 8. 산출 단계 (3원칙 승인 후 진행)

```
T+0:  output/antipatterns/ 디렉토리 생성
T+1:  Phase 4 partial 6 AP 결정적 통합 (그대로)
T+2:  Phase 5 candidate 6 AP 정규화 + 추가 (F-034~F-040 evidence 보강)
T+3:  Phase 4 추가 candidate 3 AP 추가 (EAGER / F-017 / F-028)
T+4:  복합 AP 검토 (0~1건) — sub-agent 결과 채택
T+5:  Phase 2 정합성 보고서 격상 검증 (DRIFT 9건 / 이미 2건 격상 / 추가 검토)
T+6:  severity 재산정 (workflow §5 표 + sub-agent 권고)
T+7:  톤 점검 (자동 변환 패턴 적용 — workflow §4)
T+8:  antipatterns.json v1 작성 (schema 검증 통과)
T+9:  사내 권고 41건 통합 → avoid-list.md (severity 별 + 영역 별 + AP cross-link)
T+10: _manifest.yml 작성 (신뢰도 산정 v1 + ID 매핑 표 + Phase 6 부가가치 기록)
T+11: 7대 산출물 cross-validation (workflow §9 — ID 표준 / 교차 참조 / confidence 메타)
T+12: findings/poc-findings.md 갱신 (Phase 6 신규 finding 0~2건)
T+13: PROGRESS-poc01-phase6.md 시간순 마감 + RESUME / CLAUDE / memory 갱신
```

---

## 9. 승인 게이트 (phase-6-quality.md §7 + §9)

```
□ antipatterns.json schema 검증 (id pattern / category / severity)
□ 모든 항목에 evidence + recommended_alternative
□ 톤 점검 완료 (비난 표현 0)
□ severity 분포 확인 (critical/high/medium/low)
□ Phase 2 정합성 보고서 → 안티패턴 격상 완료
□ 복합 안티패턴 검출 (Phase 6 부가가치 0~1건)
□ avoid-list.md 사용자 검토
□ 시니어 BE 검토 ✋ (특히 critical/high 항목)
□ 7대 산출물 일관성 검증 (workflow §9)
   □ 모든 ID 표준 일관성 (UC/E/BR/PAGE/AP)
   □ ID 교차 참조 무결성
   □ 모든 산출물에 confidence 메타
   □ human_review_required 항목 = 사용자 처리 완료
```

---

## 10. 다음 단계

1. ✅ 본 plan 완성 — task #1 completed
2. ⏳ 2원칙 진행 — research-phase6.md (3 에이전트 병렬)
3. ⏳ 3원칙 — 윤주스 승인 대기
4. ⏳ 4단계 — output/antipatterns/ 산출물 작성

---

## 11. Lessons Learned (Phase 5 인계)

| 패턴 | Phase 5 적용 결과 | Phase 6 적용 |
|---|---|---|
| **F-015 cross-validation** | 메인 raw fetch + 3 sub-agent 100% 합의 (오차 0%) | Phase 1~5 산출물 메인 cross-link 사전 검증 + 3 sub-agent 재검증 |
| **사용자 결정 일괄 처리** | Phase 5 진입 전 plan + research 완성 후 일괄 승인 | Phase 6 진입 전 동일 패턴 (4~6 항목 일괄) |
| **PROGRESS 시간순 로그** | T+0 ~ T+12 갱신 | T+0 ~ T+13 예상 |
| **품질 1순위 + 재작업 0** | F-027 De Morgan 3중 표기 (Phase 5 + Phase 6 동시 반영) | 복합 AP 등록 신중 (over-engineering 회피) + 사내 권고 통합 정밀화 |
| **임계 finding 처분** | 25→32건 / 7 묶음 v1.2.0 격상 후보 | 32 → 32~34 예상 — PoC #02 후 합산 격상 (윤주스 절대 우선순위) |
| **schema id pattern 한계** | (Phase 5 미발현) | F-025 (Phase 3 promoted) 와 동일 케이스 — Phase 4 partial 의 schema-compliant 짧은 ID 패턴 그대로 채택 |

---

**END OF PLAN-PHASE6.md**
