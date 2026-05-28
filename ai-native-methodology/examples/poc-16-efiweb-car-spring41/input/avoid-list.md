# PoC #15 EFI-WEB car — Avoid List (피해야 할 패턴 체크리스트)

> phase quality 산출 / antipatterns.json (10건) 의 사람용 체크리스트 / 마이그레이션 시 회피 의무.

## 심각도 분포

| severity | count | % |
|---|---|---|
| **critical** | **2** | 20% |
| **high** | **4** | 40% |
| medium | 4 | 40% |
| **합계** | **10** | 100% |

| category | count |
|---|---|
| DB | 4 |
| FE | 1 |
| SECURITY | 1 |
| ARCH | 1 |
| EXTERNAL | 1 |
| DOMAIN | 1 |
| API | 1 |

## ★★★ Critical (2건) — 마이그레이션 시 즉시 회피 의무

### AP-FE-001 — JSP scriptlet `<% ... %>` 8건

- **위반**: 4 JSP 안 year-loop scriptlet copy-paste (carDriveInsertForm / carCostSumSystem / carCosting / carCostConfirm 각 2건)
- **회피**: ❌ JSP scriptlet 절대 금지 / JSP 2.0 이후 deprecated
- **대안**: `<c:forEach var='i' begin='startYear' end='endYear'>` + EL `${i}` (auto-escape)

### AP-SEC-001 — JSP `<%= %>` unsanitized expression 20건 (XSS)

- **위반**: PMD NoUnsanitizedJSPExpression 19 + grep 1 / 최다 = carSelectPopupAjax (10건) + carListAjax (6건)
- **회피**: ❌ raw expression 금지 / OWASP Top 10 (Injection)
- **대안**: `${var}` 또는 `<c:out value='${var}'/>` (auto-escape default)

## ★★ High (4건) — 마이그레이션 시 의무 변경

### AP-API-001 — Exception Handler 부재 (negative-space)

- **위반**: @ExceptionHandler / @ControllerAdvice / @ResponseStatus / ResponseEntity = 모두 0건 (grep)
- **회피**: ❌ throws Exception propagation 만 / structured error response 부재
- **대안**: `@RestControllerAdvice` + `@ExceptionHandler(DomainException.class)` + `ProblemDetail` (RFC 7807/9457)

### AP-DB-002 — FK CONSTRAINT 명시 부재 (6 own table)

- **위반**: 6 own table 모두 PK CONSTRAINT 만 / FK ❌ / 4 추론 FK (car_idx / term_idx / cost_idx / slip_id)
- **회피**: ❌ orphan row 가능성 / referential integrity 보장 ❌
- **대안**: `ALTER TABLE ADD CONSTRAINT FOREIGN KEY` (data cleanup 후)

### AP-DB-003 — Cross-DB Join 5 DB

- **위반**: sqlmap 안 IFRS / FIM / SGERP / e_hr / ekporg 5 DB cross-join (직접 `<DB>.dbo.<TABLE>`)
- **회피**: ❌ 강결합 / 단일 deployment 가정 / network latency / transaction 보장 ❌
- **대안**: REST API 또는 event-driven 통합 / strangler fig pattern (wrapper service 격리 → API 대체)

### AP-EXT-001 — Stored Procedure 외부 호출 (SGERP IF)

- **위반**: SGERP.dbo.SG_SACSlipRowCarManagementIFQuery SP 호출 (signature only)
- **회피**: ❌ 외부 SP 본체 모름 / business logic 분산 / 테스트 격리 ❌
- **대안**: SP source 확보 → Java service 흡수 또는 ERP REST API 호출

## ★ Medium (4건) — 마이그레이션 시 권고

| ID | 패턴 | 대안 |
|---|---|---|
| AP-ARCH-001 | DAO package 위치 (service/impl/ 안) | `repository/` 또는 `dao/` 별도 패키지 |
| AP-DB-001 | Composite PK (TB_CAR_COST_SLIP) | surrogate PK (slip_pk) + composite UNIQUE |
| AP-DB-004 | Column 의미 중복 (drive_dist ↔ distance) | sqlmap 사용 패턴 분석 → dead column 제거 |
| AP-DOMAIN-001 | HashMap-based DTO paradigm | typed DTO class + Spring Bean Validation |

## ★ 체크리스트 (마이그레이션 PR 의무 검사)

- [ ] JSP scriptlet (`<% ... %>` excluding directives) = 0 (grep enforced)
- [ ] JSP raw expression (`<%= %>`) = 0 (EL `${}` 또는 `<c:out>` 만)
- [ ] @ExceptionHandler ≥ 1 (또는 @ControllerAdvice global)
- [ ] @ResponseStatus 또는 ResponseEntity ≥ 1 per endpoint
- [ ] FK CONSTRAINT 명시 (4 own FK + 1 external)
- [ ] Cross-DB join = 0 (외부 4 DB 별도 service 격리)
- [ ] 외부 SP 호출 = service layer 추상화 (e.g. SgerpClient)
- [ ] DAO 패키지 = `repository/` 또는 `dao/` (service/impl/ 안 ❌)
- [ ] Composite PK = single surrogate (UNIQUE 분리)
- [ ] DTO class ≥ 4 (CarInsertForm + CarDriveForm + CarCostCalculateRequest + CarCostSlipRow)
- [ ] HashMap param = 0 (typed DTO 만)
