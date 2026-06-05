# quality phase: quality (안티패턴 통합)

> **명령어**: `/analyze-quality` · 워크플로우 **마지막 단계** — `discovery`~`api`/`ui` phase 결과 통합

---

## 1. 목적

전 phase 모두의 결과를 **통합 분석**하여 최종 안티패턴 카탈로그 생성.

**왜 마지막인가**: 안티패턴은 단일 영역만 봐서는 알 수 없음. 예:

- 정합성 검증 결과(`db-schema` phase) + 비즈니스 로직(`business-logic` phase) → "ERD-코드 불일치 + SQL 에 정책 박힘" 동일 영역에서 발견되면 심각도↑
- API(`api` phase) + 도메인(`business-logic` phase) → "API 에 정책 박힘 + Anemic Domain Model" 결합

---

## 2. 입력

| Phase                  | 입력                                                |
| ---------------------- | --------------------------------------------------- |
| `discovery` phase      | inventory.json (스택, 모듈)                         |
| `db-schema` phase      | schema.json + 정합성-검증-보고서.md                 |
| `architecture` phase   | architecture.json (순환/레이어 위반)                |
| `business-logic` phase | 4영역 부분 안티패턴                                 |
| `api` phase            | API 안티패턴 후보                                   |
| `ui` phase             | UI 안티패턴 후보 (5-2-a / 5-2-b / 5-2-c)            |
| deliverable 10         | a11y-spec.json (WCAG 2.1+2.2 ratchet)               |
| deliverable 11         | i18n-spec.json (ICU MF1+MF2 / MF1 폴백)             |
| deliverable 12         | static-security-spec.json (XSS / CSRF / CSP)        |
| deliverable 13         | legacy-spectrum.json (Tier 1~4 + Strangler)         |

---

## 3. 처리 흐름

| 분석 종류 | 결과                                                       | 결정성   |
| --------- | ---------------------------------------------------------- | -------- |
| 정적 분석 | 순환 의존성 / 레이어 위반 후보                             | 결정적   |
| 패턴 매칭 | SQL 정책 박힘 / 매직 넘버 분산 / FE-BE 검증 누락           | 준결정적 |
| LLM 추론  | Anemic Domain Model 판정 / 복합 안티패턴 (여러 phase 결합) | LLM      |

후속 단계: 통합 → drift 격상 → severity 재산정 → 톤 점검 → `antipatterns.json` (json 단독)

### 3.1 단순 통합 (`business-logic` phase 가 만든 부분 안티패턴)

`business-logic` phase 의 4영역이 이미 등록한 것:

- 5.A: AP-DB-XXX
- 5.B: AP-FE-XXX
- 5.C: AP-CFG-XXX
- 5.D: AP-EXT-XXX

→ 그대로 통합 + ID 중복 검사.

### 3.2 복합 안티패턴 (`quality` phase 에서만 가능)

여러 phase 결과를 결합해야 발견되는 패턴:

```yaml
- id: AP-COMPOSITE-001
  composite_pattern: 'Anemic Domain + SQL 에 비즈니스 로직'
  evidence_phases: [business-logic-5A, business-logic-domain]
  description: |
    `business-logic` phase 도메인 분석에서 Order 엔티티가 데이터 holder 만 됨 (Anemic).
    동시에 `business-logic` phase 5.A 에서 SQL CASE 에 가격 정책 박힌 것 발견.
    → 비즈니스 로직이 도메인 레이어를 우회하고 SQL 에 박힌 패턴.
  severity: high
  recommended_alternative: |
    Order 엔티티에 calculatePrice() 메서드 추가.
    SQL 은 단순 조회만.
```

### 3.3 정합성 보고서 → 안티패턴 격상

`db-schema` phase 의 정합성 검증 보고서에서 severity=high 인 항목은 안티패턴으로:

```yaml
# db-schema phase 결과
DRIFT-001: column_only_in_db (severity: high)

# quality phase 격상
- id: AP-DB-DRIFT-001
  category: db
  pattern_name: "ERD/코드와 운영 DB 컬럼 불일치"
  evidence:
    - drift_finding: DRIFT-001
  severity: high
  recommended_alternative: |
    1순위: 운영 DB 컬럼 admin_memo 를 ERD/ORM 에 추가
    2순위: 사용 흔적 없으면 운영 DB 에서 제거
```

---

## 4. 톤 점검 (자동)

책임 분담 + 6-antipatterns §2 톤 정책에 따라 비난 표현 자동 변환:

| Bad           | Good                    |
| ------------- | ----------------------- |
| "잘못 작성됨" | "재구현 시 정상화 권장" |
| "나쁜 패턴"   | "회피 후보"             |
| "문제 코드"   | "개선 가능 영역"        |

---

## 5. severity 재산정

영역별 severity 가 다르면 통합 시 재산정:

| 영역                              | 영향      |
| --------------------------------- | --------- |
| 보안 (FE 에만 검증)               | high 강제 |
| 데이터 손실 위험 (drift, FK 누락) | high 강제 |
| 비즈니스 로직 분산 (SQL 박힘)     | medium    |
| 명명 규칙 비일관                  | low       |

---

## 6. 출력

```
.ai-analysis/output/antipatterns/
├── antipatterns.json           # json 단독 SSOT (통합 + migration_advice)
├── migration-cautions.json     # 신규 시스템 회피 가이드 (BE 영역 의무 / migration-cautions.schema.json)
├── migration-cautions-fe.json  # FE 영역 회피 가이드 (의무, FE 분석 시)
└── composite-patterns.md       # 복합 패턴 별도 (가독성 / functional report)
```

FE 분석 시 `migration-cautions-fe.md` 의무 — `methodology-spec/migration-cautions-fe.md` 본체 spec 정합. 카테고리 7종 (state 5 진실 / visual baseline / a11y baseline+ratchet / i18n MF1 폴백 / 정적보안 / legacy 4 Tier strangle / quality gate FE).

### 6.1 migration-cautions.json 의무 산출물

**근거**: 본 방법론 가치 명세 (코드 → 형식 명세 + **위험 기록** 한 방향 추출기) 정합.

**구조**:

- 카테고리별 신규 시스템 회피 가이드 (API / DB / Security / Architecture / Domain / Performance)
- design 단계 / CI 단계 / Review 단계 체크리스트
- severity 기반 적용 우선순위
- antipatterns.json `migration_advice` 필드의 사람 친화적 통합
- **Platform-specific 변형 섹션** — 분석 대상 stack 별 함정 + 학습 효과 입증 표
- **사내 도입 quality gate 정책** — Baseline + Ratchet 패턴

**antipatterns.json 과의 차이**:

- antipatterns.json = "기존 시스템에서 발견된 패턴 + 즉시 fix"
- migration-cautions.json = "신규 시스템 구축 시 design/review/CI 단계에서 차단 가이드"

#### 6.1.1 Platform-specific 변형 섹션

**의무**: stack 별 함정과 학습 효과 등재. 신규 platform 분석 시 동일 패턴으로 변형 섹션 등재 의무 (Spring Boot / FastAPI / Ktor / NestJS 등).

```markdown
## NestJS 특이 패턴

### NestJS 학습 효과 (자연 회피 — 비재현)

| 패턴                  | 이전 PoC negative   | NestJS 결과             |
| --------------------- | ------------------- | ----------------------- |
| Bearer JWT            | Token apiKey 비표준 | addBearerAuth() 표준 ✅ |
| 307 internal redirect | ModelAndView leak   | NestJS 미사용           |
| TS generic            | Java erasure        | TypeScript 정적 차단    |

### NestJS 함정 (신규 — design 단계 의무 적용)

- @Controller() 빈 prefix → @Controller('users') 의무
- @Post default 201 → @HttpCode 명시 의무
- @Delete default 200 → @HttpCode(204) 의무
- AuthMiddleware forRoutes 분산 → JwtAuthGuard 글로벌
- TypeORM eager:true → eager:false default + 명시적 fetch
- Math.random() suffix slug → DB UQ + nanoid
```

#### 6.1.2 사내 도입 quality gate 정책

**의무**: Baseline + Ratchet 패턴 등재. 사내 legacy 도입 시 결함 폭증으로 차단되지 않도록.

```markdown
### Baseline 도입 의무

- 본 방법론 도구 (drift-validator + dmn-check + static-runner) 첫 분석 결과 baseline 등재
- `.ai-native-methodology/baseline.yml` git 추적 의무
- 현존 결함 = grandfathered (CI 통과)

### Ratchet 정책

- baseline 외 신규 결함 = CI fail (점진 격상)
- baseline 결함 fix → fingerprint 자동 제거 (한 방향)
- severity 격상 시 baseline 갱신 의무

### Severity 별 강도

- critical: 즉시 차단 (baseline 등재 ❌ — production blocker)
- high / medium: 신규 차단 / baseline grandfathered
- low: 신규 경고만 / baseline grandfathered
- positive: 등재만 (모범 사례)

### Quarterly review

- baseline 결함 감소율 정량
- severity 격상 시 즉시 갱신
- 2년 자동 expiry
```

→ Slack/GitLab/Dropbox/Figma/Shopify 산업 표준.

### 6.2 antipatterns 사람-읽기 표현 예시 (antipatterns.json view-time 렌더)

```markdown
# 재구현 시 회피 후보 체크리스트

> 톤: 비난이 아닌 결정 입력.
> severity: high 17건, medium 28건, low 12건

## High (재구현 시 우선 처리)

- [ ] AP-DB-DRIFT-001: ERD/코드와 운영 DB 컬럼 불일치
  - 위치: orders.admin_memo
  - 근거: `db-schema` phase DRIFT-001
  - 권장: 운영 DB 컬럼을 ERD/ORM 에 추가

- [ ] AP-FE-VALIDATION-MISSING-BE: FE 에만 validation
  - 위치: BR-USER-AGE, BR-USER-EMAIL-DISPOSABLE
  - 권장: BE 검증 추가 (보안 우회 방지)
```

---

## 7. 승인 게이트 (최종)

```
□ antipatterns.json schema 검증
□ 모든 항목에 evidence + recommended_alternative
□ 톤 점검 완료 (비난 표현 0)
□ severity 분포 확인
□ `db-schema` phase 정합성 보고서 → 안티패턴 격상 완료
□ 복합 안티패턴 검출 (`quality` phase 부가가치)
□ antipatterns.json 사용자 검토
□ 시니어 BE 검토 ✋ (특히 high 항목)
```

---

## 8. 신뢰도

전체 산출물 중 **가장 신뢰도 높음**:

| 영역                     | 신뢰도 |
| ------------------------ | ------ |
| 순환 의존성              | 1.0    |
| 정합성 drift             | 1.0    |
| SQL 정책 박힘 (패턴)     | 0.95   |
| 매직 넘버 분산           | 0.95   |
| Anemic Domain Model 판정 | 0.75   |
| 복합 안티패턴            | 0.70   |

---

## 9. 최종 산출물 검증

`quality` phase 완료 시 **전체 산출물 일관성 검증**:

```
□ 모든 ID 표준 일관성 (UC/E/BR/PAGE/AP)
□ ID 교차 참조 무결성
   - x-related-rules 의 BR-XXX 가 business-rules.json 에 존재
   - operationId 가 도메인 UC 와 매핑
   - related_table 이 db schema 에 존재
□ 모든 산출물에 confidence 메타
□ human_review_required 항목 = 사용자 처리 완료
□ 7대 산출물 + 보조 산출물 모두 발행됨
```

---

## 10. 분석 워크플로우 종료

`quality` phase 완료 → 전체 산출물 검증 → 최종 발행:

- TF 멤버 검토
- 재구현 단계 입력
- 사내 자산화

다음 라이프사이클 (② 자산화, ③ 재구현) 은 별도 도구·방법론.

---

## 인용

- ADR: ADR-002 (톤 점검 책임 분담)
- ADR: ADR-010 (quality gate baseline+ratchet)
- ADR: ADR-011 (antipatterns json 단독 / avoid-list twin 폐기)
- ADR: ADR-NEST-001 (JwtAuthGuard 글로벌)
- ADR: ADR-NEST-003 (@HttpCode 명시)
- ADR: ADR-NEST-004 (eager:false + nanoid slug)
