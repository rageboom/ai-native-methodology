# PoC #16 EFI-WEB car — Stack Detection

> 분석 대상 = `smilegate.ifrs.car` / 본 phase = analysis 내부 discovery (inventory + stack 감지) / 결정적 증거 위주.

## 결론 한 줄

**Spring MVC 4.1.2 + iBATIS 2.3.4 + MSSQL + JSP 2.0 (JSTL 미사용) + Resin 4 + Maven 2 / Java 1.8 target**.

## 1. Backend Framework — Spring 4.1.2 + eGov 3.6.0

| 증거                                                                                                             | 출처                                            | 결정성 |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------ |
| `<artifactId>spring-aop</artifactId>` + `<artifactId>spring-ldap-core</artifactId>` 등 spring-\* dependency 다수 | EFI-WEB ifrs/pom.xml                            | 결정적 |
| `@Controller` + `@Service` + `@Repository` + `@RequestMapping` Spring annotation 사용                            | source/java/.../car/\*.java 8 파일 전수         | 결정적 |
| `EgovComAbstractDAO` extends — 한국 전자정부 표준프레임워크 (egovframe.go.kr)                                    | CarMgtDAO + CarCostDAO                          | 결정적 |
| eGov 3.6.0 version pin                                                                                           | EFI-WEB ifrs/pom.xml (Spring 4.1 기반 LTS 버전) | 결정적 |

## 2. ORM — iBATIS 2.3.4 (R1' axis legacy)

| 증거                                                                               | 출처                          | 결정성 |
| ---------------------------------------------------------------------------------- | ----------------------------- | ------ |
| `<!DOCTYPE sqlMap PUBLIC "-//iBATIS.com//DTD SQL Map 2.0//EN">` 명시               | carCost.xml + carMgt.xml      | 결정적 |
| iBATIS 2 namespace = `<sqlMap namespace="...">` (MyBatis 3 와 다름)                | carCost.xml + carMgt.xml      | 결정적 |
| 파라미터 `#paramName#` syntax (MyBatis 3 = `#{paramName}` 와 다름 / iBATIS 2 고전) | carCost.xml + carMgt.xml 다수 | 결정적 |
| `<procedure id="...">` 태그 (iBATIS 2 SP 호출)                                     | carCost.xml:328               | 결정적 |
| `SqlMapClientDaoSupport` 상속 chain (EgovComAbstractDAO → SqlMapClientDaoSupport)  | CarMgtDAO + CarCostDAO        | 결정적 |

**R1' axis (Spring 4.1 + iBATIS 2 Legacy)** 4번째 corroboration 정합 (PoC #06+#07+#11 trio 후속). analysis §3-A automation ~53~55% ceiling 예상 / carry / blocking ❌.

## 3. DB — MSSQL (SQL Server)

| 증거                                                                                          | 출처                                  | 결정성 |
| --------------------------------------------------------------------------------------------- | ------------------------------------- | ------ |
| 사본 sqlmap config 파일명 = `sql-map-config-mssql.xml` (EFI-WEB ifrs/ root / 본 PoC scope 외) | manifest / inventory.json             | 결정적 |
| MSSQL 특화 syntax = `WITH(NOLOCK)` / `GETDATE()` / `ISNULL()` / `NVARCHAR` / `TOP N`          | carCost.xml + carMgt.xml + ddl/\*.sql | 결정적 |
| Cross-DB join 패턴 `DB.dbo.TABLE` = MSSQL 다중 DB 통합 표기                                   | sqlmap 전수 (FIM/SGERP/e_hr/ekporg)   | 결정적 |

## 4. Frontend — JSP 2.0 (JSTL taglib 0)

| 증거                                                                    | 출처                                          | 결정성 |
| ----------------------------------------------------------------------- | --------------------------------------------- | ------ |
| 14 .jsp 파일 / `<%@ page` directive 13건                                | source/jsp/ 전수 grep                         | 결정적 |
| `<%@ taglib` directive **0건** — JSTL 미사용                            | source/jsp/ 전수 grep                         | 결정적 |
| scriptlet `<%` 8건 (4 JSP × 2건 isomorphic) + raw expression `<%=` 20건 | PMD 7.24 + grep-fallback (no-simulation 정합) | 결정적 |
| 공통 include `/WEB-INF/jsp/config/include.jsp` 14건 (전부)              | source/jsp/ 전수 grep                         | 결정적 |
| 동적 `<jsp:include>` 11건 (7 JSP)                                       | source/jsp/ 전수 grep                         | 결정적 |

**JSTL 부재 = scriptlet/raw expression paradigm**. modern JSP 권장 (JSTL + EL auto-escape) 와 정반대 → v3.4.0 G4 policy violation (8건 critical / migration-cautions 등재 의무).

## 5. Servlet Container — Resin 4

| 증거                                                                                        | 출처                    | 결정성 |
| ------------------------------------------------------------------------------------------- | ----------------------- | ------ |
| `ifrs/resin/public-config.xml` 존재 (본 PoC scope 외 / EFI-WEB root)                        | 사용자 사전 탐사 보고   | 결정적 |
| `<javac compiler="internal" args="-source 1.6" />` → Java 1.6 호환성 모드 (실 target = 1.8) | Resin public-config.xml | 결정적 |
| 포트 6900 (local) / 80 (prod)                                                               | Resin public-config.xml | 결정적 |

## 6. Build — Maven 2

| 증거                                                                  | 출처                        | 결정성 |
| --------------------------------------------------------------------- | --------------------------- | ------ |
| `pom.xml` 존재 (EFI-WEB ifrs/ root)                                   | 사용자 사전 탐사 + 본 phase | 결정적 |
| `<artifactId>ifrs</artifactId>` + `<packaging>war</packaging>`        | EFI-WEB pom.xml             | 결정적 |
| `.project` 파일 = `m2e.core.maven2Builder` + `maven2Nature` (Maven 2) | EFI-WEB .project            | 결정적 |
| `<java.version>1.8</java.version>` property                           | EFI-WEB pom.xml             | 결정적 |

## 7. Track 분기 신호 (analysis-input-collection 정합)

| Track | 본 PoC          | 비고                                                              |
| ----- | --------------- | ----------------------------------------------------------------- |
| BE    | ✅              | Java 8 + Spring 4.1 / car 8 .java (798 code LOC)                  |
| FE    | ✅ (Scenario C) | JSP 14 (3110 code LOC) / server-rendered                          |
| DB    | ✅              | MSSQL + iBATIS 2 / 6 own table + 3 function + 4 외부 DB 18 object |

## 8. Architecture Style — Layered 3-tier (cap 0.7)

```
[Client (Browser)]
     ↓ HTTP
[Web Layer] CarMgtController (16 ep) / CarCostController (18 ep)         → 34 endpoint
     ↓ Java method call
[Service Layer] CarMgtService (interface) → CarMgtServiceImpl (8 method)
                CarCostService (interface) → CarCostServiceImpl (5 method)
     ↓ Java method call
[DAO Layer] CarMgtDAO (17 method) / CarCostDAO (8 method)                → 25 DAO method
     ↓ SqlMapClient call (36 statement reference)
[iBATIS sqlmap] carMgt.xml + carCost.xml                                  → 37 statement
     ↓ JDBC
[MSSQL] IFRS.dbo.* (own 6 table + 3 function) + FIM/SGERP/e_hr/ekporg (cross-DB / external)
                                                                          ↑ SP IF (1건 SGERP)
```

**Service interface + Impl 분리** + `@Service / @Repository / @Controller` annotation = Spring 4.x 표준 layered paradigm. monolith war 단일 deployment (Resin 4).

⚠️ **package anti-pattern** — DAO 가 `service/impl/` 아래 위치 (`service.impl.CarMgtDAO`). Spring 컨벤션 = `repository/` 또는 `dao/` 별도 패키지 권장. finding 등재 후보 (analysis-quality-antipattern phase).

## 9. 본 환경 도구 가용성 (no-simulation 정합)

| 도구                    | 본 PoC 환경                                                        | 활용 phase                                                           |
| ----------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| **cloc** (LOC)          | ✅ v2.08                                                           | discovery (본 phase) — 결정적 LOC                                    |
| **PMD** (JSP/Java)      | ✅ 7.24.0 + Java 25                                                | template-analyze (완료) + 향후 architecture / quality                |
| **Semgrep**             | ✅ 가용 (Python venv)                                              | static-security aspect                                               |
| Java JRE                | ❌ system Java 부재 / PMD 자체 번들 JRE 사용 (Homebrew openjdk 25) | —                                                                    |
| Maven CLI               | (미확인)                                                           | mvn dependency:tree 등 dependency 추출 시 필요 — 본 PoC 환경 의무 ❌ |
| **mvn dependency:tree** | ❌ (Java target 1.8 / 본 환경 Java 25 호환성 issue 가능)           | 외부 dependency 정밀 추출 = carry / source 안 pom.xml 정적 분석 의무 |
