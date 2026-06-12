# 완료 PoC 스냅샷 아카이브 (completed-pocs)

본 디렉토리는 **종료된 초기 PoC 산출물 동결본**. active `examples/` 에서 격리되어 보존된다.

## 격리 사유 (2026-06-11)

이 PoC 들은 다음 3 조건을 모두 충족하여 archive 로 이동:

1. **구형 레이아웃** — `output/rules/` · `analysis/` 만 보유. 현 chain harness 의 `.ai-context/output/` (게이트 스캔 대상) **부재** → 어떤 release gate · validator 도 검증하지 않음.
2. **참조 0** — `tools/*/test/` · `scripts/release-readiness.js` 어디에서도 인용되지 않음 (load-bearing fixture 아님).
3. **스키마 드리프트** — 현 strict 스키마(`additionalProperties:false` + `meta` required) 기준 위반. 방법론이 스키마를 조여온 동안 재생성되지 않아 동결 시점 형식에 머묾.

즉 "버전 관리되지 않은 채 drift 한 역사적 스냅샷". 삭제 대신 archive 보존(히스토리 추적성).

## 목록

| PoC | 내용 | 비고 |
| --- | --- | --- |
| `poc-01-realworld-spring` | RealWorld Spring | ✅ 종료 (memory `project_poc01_02_completed`) |
| `poc-02-realworld-springboot3` | RealWorld Spring Boot 3 | ✅ 종료 |
| `poc-04-full-realworld-react` | RealWorld React (full) | `examples/poc-04-mini-realworld-react` (현 레이아웃) 가 대체 |

## 복원

active 재편입이 필요하면 `git mv archive/completed-pocs/<poc> examples/<poc>` 후 현 스키마로 재생성(`.ai-context/output/`) 의무.
