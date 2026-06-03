# PoC #15 EFI-WEB car — Migration Cautions

> phase quality 산출 / 본 PoC 분석에서 발견된 마이그레이션 시 주의사항 / impl stage 진입 의무 carry.

## 1. Paradigm 전환 (Legacy → Modern)

| 현 paradigm       | Modern target                               | 카테고리          |
| ----------------- | ------------------------------------------- | ----------------- |
| Spring MVC 4.1.2  | Spring Boot 3.x (Spring 6)                  | framework         |
| iBATIS 2.3.4      | MyBatis 3 또는 Spring Data JPA              | ORM               |
| JSP 2.0 + 0 JSTL  | React 19 + Vue 3 또는 Spring Boot Thymeleaf | view              |
| Resin 4           | Spring Boot embedded Tomcat                 | servlet container |
| Maven 2           | Maven 3+ 또는 Gradle                        | build             |
| Java 1.8 target   | Java 17+ LTS                                | JVM               |
| HashMap-based DTO | typed DTO + Spring Bean Validation          | type safety       |

## 2. 데이터 일관성 (eventual → strong)

### BR-CAR-COST-003 (SGERP IF / 본 PoC 핵심 anchor)

**현재**: cross-DB transaction 보장 ❌ → SGERP SP 호출 성공 + IFRS INSERT 실패 시 orphan slip / 데이터 불일치 가능.

**Modern 대안 (택 1)**:

1. **Saga pattern** — SGERP slip 생성 후 IFRS INSERT 실패 시 compensating transaction (SGERP slip 취소) 호출
2. **Outbox table** — `tb_car_cost_slip_outbox` 신설 → IFRS local transaction 으로 outbox INSERT → 별도 worker 가 SGERP IF retry
3. **Spring ChainedTransactionManager** — legacy 호환 / 2 DB connection 결합 (transaction 보장 약 / best-effort only)

권장 = **Outbox** (event-driven / scalability + retry / failure isolation).

### BR-CAR-MGT-004 (TOT_DIST 자동 갱신)

**현재**: saveCarDriveRow → updateCarTotDist 별도 SQL 호출 / Service layer transaction 결합 추정.

**Modern**: JPA `@Entity` 의 `@PreUpdate` 또는 domain event (`CarDriveAddedEvent` → `CarTotDistRecalculatedHandler`) 로 추상화.

## 3. 외부 의존성 (cross-DB / SP)

### 4 외부 DB 격리

| DB                            | 현 의존                                  | Modern 대안                                             |
| ----------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| FIM (사용자 마스터 / 3 table) | `FIM.dbo.TB_USER` cross-DB SELECT        | **User API** (REST `GET /users/{id}` or gRPC) + caching |
| SGERP (ERP / 10 table + 1 SP) | cross-DB join + SP call                  | **ERP API** + Saga/Outbox (BR-CAR-COST-003)             |
| e_hr (휴일 / 1 table)         | `e_hr.dbo.TB_HOLIDAY`                    | **Holiday Service API** 또는 local cache                |
| ekporg (조직 / 1 table)       | `ekporg.dbo.DEF_GROUP_INTO_COMPANY_LIST` | **Org Service API**                                     |

Strangler fig pattern — Phase 1: wrapper service (FimClient / SgerpClient / HrClient / EkporgClient) 격리 / Phase 2: REST 대체.

### Stored Procedure 1건 (SGERP.SG_SACSlipRowCarManagementIFQuery)

본 PoC 환경 source 부재 → impl stage 진입 시:

1. SGERP 운영팀에 SP source 요청 (blocker 가능성 / 조직 협의 필요)
2. SP 의미 추출 → Java service 재구현 (의미는 도메인 expert 결단 의무)
3. 또는 ERP team 의 REST API 신설 협업

## 4. 도메인 expert 결단 의무 (ambiguous 4건)

chain 4 (test) 진입 전 의무 결단:

| ID              | 결단 항목                                  | carry_owner                                  |
| --------------- | ------------------------------------------ | -------------------------------------------- |
| BR-CAR-MGT-003  | STATE 코드 값 분포 (등록 / 사용중 / 처분?) | domain_expert (사용자 본인 또는 IFRS 회계팀) |
| BR-CAR-COST-002 | cost_accept_cd enum 값 ('Y' / 'N' / null?) | domain_expert                                |
| BR-CAR-COST-004 | NoLog 비용 의미 (회사 단위 통합)           | domain_expert                                |
| BR-CAR-COST-005 | CostSumSystem admin role / scope           | domain_expert                                |

## 5. SATD 자조 코멘트 처리 (3건)

| #   | 파일                                                          | 처리                                          |
| --- | ------------------------------------------------------------- | --------------------------------------------- |
| 1   | `fn_Get_CarUserListView_2.sql:39` (2020년 비서 예외 임시적용) | 도메인 expert 결단 / 정식 권한 분기 또는 제거 |
| 2   | `CarMgtDAO.java:138` (TODO Auto-generated method stub)        | IDE 잔재 / 실 구현 또는 throw                 |
| 3   | `CarMgtServiceImpl.java:210` (TODO catch block)               | IDE 잔재 / 실 구현 또는 logging               |

## 6. 보안 (XSS + 인증)

### XSS (AP-SEC-001 / 20건)

- 전체 JSP `<%= %>` 일괄 변경 ($ {var} 또는 c:out)
- SM_USER header 같은 외부 입력 = server-side sanitize 우선
- CSP header 추가 (Content-Security-Policy: default-src 'self')

### 인증/권한 (BR-CAR-MGT-006)

- 현재: `selectLeaderUserId` SQL 호출 + null 체크 (분기 위치 불명확)
- Modern: Spring Security `@PreAuthorize("hasRole('LEADER')")` + SecurityFilterChain 격상
- FIM 외부 의존: User API 호출 캐싱 (5분 TTL 권고)

## 7. JSP scriptlet 8건 + JSTL 0 → JSP 2.0 / EL

```diff
- <% final int thisYear = Calendar.getInstance().get(Calendar.YEAR);
-    for (int i = 1900; i <= thisYear; i++) { %>
-     <option value="<%=i %>" <%= (thisYear==i ? "selected" : "")%>><%=i %></option>
- <% } %>

+ <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
+ <c:forEach var="i" begin="1900" end="${thisYear}">
+     <option value="${i}" <c:if test="${thisYear == i}">selected</c:if>>${i}</option>
+ </c:forEach>
```

→ Controller 에서 `model.addAttribute("thisYear", Calendar.getInstance().get(Calendar.YEAR))` 의무. 4 JSP 일괄 변경.

## 8. DDL FK + Composite PK 정정

```sql
-- AP-DB-002: FK CONSTRAINT 추가
ALTER TABLE TB_CAR_USER_TERM ADD CONSTRAINT FK_TUT_CAR FOREIGN KEY (car_idx) REFERENCES TB_CAR(idx);
ALTER TABLE TB_CAR_DRIVE     ADD CONSTRAINT FK_TCD_CAR FOREIGN KEY (car_idx) REFERENCES TB_CAR(idx);
ALTER TABLE TB_CAR_COST      ADD CONSTRAINT FK_TCC_TUT FOREIGN KEY (term_idx) REFERENCES TB_CAR_USER_TERM(term_idx);
ALTER TABLE TB_CAR_COST_SLIP ADD CONSTRAINT FK_TCS_TCC FOREIGN KEY (cost_idx) REFERENCES TB_CAR_COST(cost_idx);

-- AP-DB-001: Composite PK → Surrogate
ALTER TABLE TB_CAR_COST_SLIP ADD COLUMN slip_pk INT IDENTITY(1,1) NOT NULL;
ALTER TABLE TB_CAR_COST_SLIP DROP CONSTRAINT [PK__TB_CAR_C__73FC97FC...];
ALTER TABLE TB_CAR_COST_SLIP ADD PRIMARY KEY (slip_pk);
ALTER TABLE TB_CAR_COST_SLIP ADD CONSTRAINT UQ_TCS_COMP UNIQUE (cost_idx, slip_id, cost_gubun);
```

운영 데이터 cleanup (orphan row) 우선 / FK 추가 전 검증 의무.

## 9. 본 PoC 한계 (정직 명시)

- Java 25 + Maven 부재 + 운영 MSSQL 접근 ❌ — impl stage 진입 시 환경 가용성 carry
- ERD viewer 부재 (car.erd / ifrs.erd) — 형식 unknown / DDL 만 source
- Daikon / CodeQL / SonarQube 미실행 — formal-spec cross_validation simulation_only=true (신뢰도 -5%p)
- Playwright / Storybook 미실행 — visual-manifest carry 14건
- SGERP / FIM / e_hr / ekporg 4 외부 DB 본체 ❌ — 18 object signature only

## 10. 마이그레이션 우선순위 (D-axis 후속)

본 PoC 의 D-axis (artifact-graph e2e) 성공 시 → impl stage 우선순위:

1. **BR-CAR-COST-003 SGERP IF** (saga/outbox 결단 / 본 PoC 핵심 anchor)
2. **AP-SEC-001 XSS** (보안 critical)
3. **AP-FE-001 scriptlet** (8건 일괄 변경)
4. **AP-DB-002 FK** (referential integrity)
5. **AP-API-001 ExceptionHandler** (structured error / RFC 9457)
6. 4 ambiguous BR domain_expert 결단
7. 3 SATD self_recognized 처리
8. **외부 4 DB 격리** (strangler fig)
9. AP-DOMAIN-001 typed DTO 전환
10. 잔여 (composite PK / column drift / DAO 패키지)
