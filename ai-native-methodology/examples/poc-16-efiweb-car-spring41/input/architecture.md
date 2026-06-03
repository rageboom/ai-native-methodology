# PoC #16 EFI-WEB car — Architecture

> phase architecture 사람용 markdown rendering (이중 렌더링 / `architecture.json` + `architecture.mermaid` 의미 동등).

## 1. 결론

**Layered 3-tier architecture** (Spring 4.1 표준) — Clean Architecture 의 presentation / application / infrastructure layer 매핑 (approximation). monolith war 안 single module (smilegate.ifrs.car).

**책임 이중 분기**: Mgt (차량 관리) + Cost (차량 비용). 같은 layer 안 평행 stack.

## 2. Layer × Module 매트릭스

| Layer              | Module           | LOC   | 파일 | 책임                                                     |
| ------------------ | ---------------- | ----- | ---- | -------------------------------------------------------- |
| **presentation**   | MOD-CAR-WEB      | 792   | 2    | Controller (34 endpoint / @RequestMapping)               |
| **presentation**   | MOD-CAR-JSP      | 3,110 | 14   | server-rendered view (scenario C)                        |
| **application**    | MOD-CAR-SVC-API  | 175   | 2    | Service interface (CarMgtService / CarCostService)       |
| **application**    | MOD-CAR-SVC-IMPL | 471   | 2    | Service 구현 (Mgt 8 method / Cost 5 method)              |
| **infrastructure** | MOD-CAR-DAO      | 312   | 2    | iBATIS DAO (Mgt 17 / Cost 8 method) package anti-pattern |
| **infrastructure** | MOD-CAR-SQLMAP   | 831   | 2    | SQL (37 statement / 4 외부 DB cross + SP 1)              |
| **infrastructure** | MOD-CAR-DDL      | 263   | 9    | own 6 table + 3 function                                 |

## 3. Dependency 방향

```
[Presentation]    WEB ──────────────────────→ SVCAPI
                  WEB ──→ JSP (view forward)
                                            ↑ implements
[Application]                            SVCIMPL ──→ DAO ──→ SQLMAP ──→ DDL
[Infrastructure]                                                          ↓
                                                                       IFRS DB (own)
                                                                       + 4 외부 DB (cross-join)
                                                                       + SGERP SP (회계 IF)
```

**순환 의존성 0건** (단방향 layered / clean direction). circular_dependencies.md 참조.

## 4. External Dependency (12종)

### Cross-DB (5)

| ID            | DB         | 용도                              |
| ------------- | ---------- | --------------------------------- |
| EXT-DB-IFRS   | IFRS (own) | car 6 table + 3 function          |
| EXT-DB-FIM    | FIM        | 사내 사용자/회사 마스터 (3 table) |
| EXT-DB-SGERP  | SGERP      | ERP 회계/조직 (10 table)          |
| EXT-DB-EHR    | e_hr       | 인사/휴일 (1 table)               |
| EXT-DB-EKPORG | ekporg     | 조직 (1 table)                    |

### External SP (1)

| ID                  | SP                                      | 호출 위치                 |
| ------------------- | --------------------------------------- | ------------------------- |
| EXT-SP-SGERP-CAR-IF | SGERP.SG_SACSlipRowCarManagementIFQuery | carCost.xml `<procedure>` |

### 사내 IFRS 외부 모듈 (4) — source ❌ (scope 외)

| ID               | 모듈                   | 호출                             |
| ---------------- | ---------------------- | -------------------------------- |
| EXT-IFRS-CMM     | smilegate.ifrs.cmm     | DateUtil / StringUtil / IfrsUtil |
| EXT-IFRS-COMMON  | smilegate.ifrs.common  | CommonService                    |
| EXT-IFRS-CONNECT | smilegate.ifrs.connect | ConnectService                   |
| EXT-IFRS-EGOV    | smilegate.ifrs.egov    | EgovComAbstractDAO (DAO 부모)    |

### Framework / SDK (2)

| ID                    | 모듈               |
| --------------------- | ------------------ |
| EXT-FRAMEWORK-SPRING  | Spring MVC 4.1.2   |
| EXT-FRAMEWORK-EGOVRTE | eGov Runtime 3.6.0 |

## 5. Anti-pattern / 결단 carry

| ID             | severity | 내용                                                                                                             |
| -------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| F-POC15-DI-001 | medium   | DAO 가 `service/impl/` 안 위치 (Spring 컨벤션 위반) — package 이동 권고                                          |
| F-POC15-DB-002 | medium   | composite PK (tb_car_cost_slip)                                                                                  |
| F-POC15-AR-001 | info     | smilegate.ifrs 도메인 모듈 4종 (cmm/common/connect/egov) 의존 — 본 PoC scope 외 / 마이그레이션 시 함께 분리 의무 |

## 6. 마이그레이션 추천 (carry / 후속 phase)

1. **3-tier 보존 + clean layer 강화** — DAO 를 `repository/` 패키지로 이동
2. **외부 DB cross-join 제거** — domain 별 분리 + API 호출로 대체 (SGERP/FIM/e_hr/ekporg)
3. **외부 SP 호출 → service-layer 추상화** — SGERP SP 호출을 별도 client class 격리 (SgerpClient.callSlipIF)
4. **iBATIS 2 → MyBatis 3 또는 Spring Data JPA** — paradigm 전환 (R1' axis 50%대 ceiling 회피)
5. **JSP scriptlet 제거** — JSTL + EL 전환 (XSS auto-escape)
