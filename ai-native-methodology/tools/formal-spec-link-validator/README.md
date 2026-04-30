# formal-spec-link-validator

Phase 4.5 cross-link 검증 도구 (★ v1.2.3 묶음 C enforcement).

## 목적

`api-extension.json` (operations[]) + `antipatterns.json` (antipatterns[]) 의 `formal_spec_links` 필드가 실제 `formal-spec/` 산출물을 가리키는지 검증.

검증 항목:
- ★ link 가 실제 파일을 가리키는가 (`link.dead-reference` = breaking)
- ★ decision_tables link 의 basename 이 BR pattern 정합 (`link.br-id-pattern-mismatch` = non-breaking)
- ★ cross_link_coverage 정량 표시

## 사용

```bash
# 단일 파일
node src/cli.js examples/poc-03/output/api/api-extension.json

# 디렉토리 재귀
node src/cli.js examples/poc-03/output/

# JSON 출력
node src/cli.js examples/poc-03/output/ --json
```

exit code: `0` (no breaking) / `1` (breaking ≥ 1) / `2` (usage error).

## ROI

- ★ schema 의무화 (묶음 C — openapi-extension + antipatterns) 의 enforcement 자동화
- ★ link 깨짐 자동 검출 (사용자 수동 검토 의존 ❌)
- ★ cross_link_coverage 정량 추적 (PoC #03 = 9/21 op = 43%)

## 시뮬레이션 금지 정책 정합

본 도구는 **AI 추론 0%** — fs.statSync + path.resolve 만 사용. ★★★ no simulation 원칙 정합.
