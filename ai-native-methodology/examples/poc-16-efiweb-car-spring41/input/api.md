# PoC #15 EFI-WEB car — API Documentation

> phase api 사람용 markdown / `openapi.yaml` + `api-extension.json` + `error-mapping-spec.json` 종합.

## 결론

EFI-WEB car 모듈은 **Spring MVC 4.1 + JSP server-rendered paradigm** — REST API 아님. 본 OpenAPI 는 **현 상태 추출이 아닌 마이그레이션 target spec** (REST 전환 anchor).

| 항목 | 결정적 사실 |
|---|---|
| `@RequestMapping` endpoint | **34** (CarMgt 16 + CarCost 18) |
| `@ResponseBody` / `ResponseEntity` | **0건** (grep) — server-side view forward |
| `@ExceptionHandler` / `@ControllerAdvice` | **0건** (grep / negative-space corroboration) |
| `@ResponseStatus` | **0건** (grep) |
| `throws Exception` propagation | 모든 controller method |
| Spectral lint result | **11 warnings / 0 errors** ✅ (cosmetic only) |

## 본격 OpenAPI 10 operation

| # | path | method | operationId | BR anchor | role |
|---|---|---|---|---|---|
| 1 | `/ifrs/car/carList` | GET | carList | BR-CAR-MGT-006 | LEADER |
| 2 | `/ifrs/car/insertCar` | POST | insertCar | BR-CAR-MGT-001+005+006 | LEADER |
| 3 | `/ifrs/car/carDriveRowSave` | POST | carDriveRowSave | BR-CAR-MGT-004 (side effect) | — |
| 4 | `/ifrs/car/cost/costing` | GET | costing | — | — |
| 5 | ★ `/ifrs/car/cost/costingCalculateAjax` | POST | costingCalculateAjax | **BR-CAR-COST-003 (SP IF)** | — |
| 6 | `/ifrs/car/cost/saveCostingList` | POST | saveCostingList | BR-CAR-COST-003+006 (bulk) | — |
| 7 | `/ifrs/car/cost/saveConfirmList` | POST | saveConfirmList | BR-CAR-COST-002 (MERGE) | ADMIN |
| 8 | `/ifrs/car/cost/costingNoLogCalculateAjax` | POST | costingNoLogCalculateAjax | BR-CAR-COST-004 | — |
| 9 | `/ifrs/car/cost/saveCostingNoLog` | POST | saveCostingNoLog | BR-CAR-COST-004 | — |
| 10 | `/ifrs/car/cost/costSumSystem` | GET | costSumSystem | BR-CAR-COST-005 | ADMIN |

→ 10/34 본격 추출 / 24 partial carry (impl stage 진입 시 전수).

## Error Mapping (negative-space corroboration)

### Exception Handler = **0건** (ADR-BE-001 정합)

- `@ExceptionHandler` / `@ControllerAdvice` / `@RestControllerAdvice` = **all 0 hit** (grep 결정적)
- `@ResponseStatus` / `@ResponseBody` / `ResponseEntity` = **all 0 hit**
- 모든 controller method = `throws Exception` propagation → Spring DispatcherServlet `DefaultHandlerExceptionResolver` 또는 Resin servlet container 기본 500 처리

### HTTP Status Mapping

| exception_class | http_status | mapping_mechanism | RFC 9457 compliant |
|---|---|---|---|
| Exception (catch-all) | 500 | `implicit_default` | — |
| domain exception (추정) | 500 | **`throw_unmapped`** ★ | **❌** (AP-API-001 trigger) |

### Negative Evidence

| 항목 | 사실 |
|---|---|
| **contract_absent** | grep_zero_hit / `@ExceptionHandler`/`@ControllerAdvice`/`@RestControllerAdvice` 0 / `@ResponseStatus`/`@ResponseBody`/`ResponseEntity` 0 |
| **negative_effect** | exception 발생 시 client = Resin 기본 HTML 500 / JSON / structured error ❌ |
| **industry_standard** | Spring Boot 2+ `@RestControllerAdvice` + `ProblemDetail` (RFC 7807/9457) 격차 큼 |
| **automatic_regression_capable** | semgrep_custom_rule + `tools/static-runner/rules/error-mapping-controller-advice-absent.yml` |

`framework_neutrality_score = 0.95` (exception_class + http_status + mapping_mechanism axis = framework 무관 표준)

## 마이그레이션 권고

1. **REST API 전환** — controller method 반환 = `ResponseEntity<T>` 또는 `@RestController`
2. **@ExceptionHandler + @ControllerAdvice** 도입
3. **ProblemDetail (RFC 9457)** 으로 structured error response
4. **Spring Security @PreAuthorize** 로 Leader/Admin 권한 격상 (BR-CAR-MGT-006 anchor)
5. saga pattern 또는 outbox 로 BR-CAR-COST-003 (SGERP IF) cross-DB consistency 보장

## Spectral lint (실 실행 / no-simulation 정합)

```
✖ 11 problems (0 errors, 11 warnings, 0 infos, 0 hints)
```

11 warnings = cosmetic (info.contact 1 + operation-description 10) / errors = 0 → **valid OpenAPI 3.0.3** ✅.
