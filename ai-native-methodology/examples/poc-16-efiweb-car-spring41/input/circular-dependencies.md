# PoC #16 EFI-WEB car — Circular Dependencies 검출 보고

> phase architecture 출력 / `architecture.json` 의 `circular_dependencies` 배열 부속 보고서.
> 검출 알고리즘: 정적 import 그래프 수동 분석 (Java import 전수 grep) — 본 PoC 환경 tarjan_scc 자동 도구 ❌ (mvn dependency:tree 호환성 / ArchUnit 미적용)

## 결론

**car 모듈 내부 순환 의존성 = 0건** ✅

car 모듈은 단방향 layered (presentation → application → infrastructure):

```
WEB → SVCAPI ← SVCIMPL → DAO → SQLMAP → DDL → DB
```

cycle ❌. ADR-006 (순환 의존 정책) 정합.

## 검증 방법

1. Java import 전수 grep:
   ```
   grep -rh "^import smilegate.ifrs.car" source/java/ | sort -u
   ```
2. 각 module 간 import 방향성 추적:
   - WEB (Controller) → SVCAPI (Service interface): ✅ forward
   - SVCIMPL → SVCAPI (implements): ✅ forward
   - SVCIMPL → DAO (composition): ✅ forward
   - DAO → SqlMapClient (egov / framework): ✅ forward
   - 역방향 import ❌ (Service → Controller 없음 / DAO → Service 없음)
3. JSP forward = Controller `return "car/carList"` ModelAndView → JSP. JSP 자체가 Controller 호출 ❌ (단방향).

## 외부 IFRS 모듈 의존 (carry / 본 PoC scope 외)

car 모듈 → 외부 4 사내 모듈 (smilegate.ifrs.cmm / common / connect / egov):

- 외부 4 모듈 source ❌ → 외부 4 모듈 → car 호출 여부 확인 ❌
- 가정: 사내 IFRS 전체 codebase 안 cmm/common 같은 공통 모듈은 car 같은 도메인 모듈을 import ❌ (정상 layered)
- 만약 외부 모듈이 car 를 import 한다면 → cross-domain cycle (carry)

## decision_required

본 PoC 환경에서 검출 = 0건이므로 decision_required ❌. 추후 외부 사내 모듈 source 가용 시 재검증 carry.

## 본 도구 한계 (정직 명시)

- **tarjan_scc / kosaraju_scc 자동 도구 미실행** — ArchUnit / jdeps 같은 Java tooling 본 PoC 환경 미적용
- 본 phase = Java import 수동 grep + 의미 추론 → meta_confidence = high (단방향 import 사실 결정적이긴 하나 자동 SCC 알고리즘 호출 ❌)
- carry: 마이그레이션 시 ArchUnit FreezingArchRule 같은 자동 도구 적용 권고
