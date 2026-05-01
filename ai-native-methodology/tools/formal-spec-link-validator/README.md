# formal-spec-link-validator

Phase 4.5 cross-link 검증 도구 (★ v1.2.3 묶음 C enforcement / ★ v1.4 Stage 3-2 FE 모드 확장).

## 목적

### BE 모드 (default)

`api-extension.json` (operations[]) + `antipatterns.json` (antipatterns[]) 의 `formal_spec_links` 필드가 실제 `formal-spec/` 산출물을 가리키는지 검증.

검증 항목:
- ★ link 가 실제 파일을 가리키는가 (`link.dead-reference` = breaking)
- ★ decision_tables link 의 basename 이 BR pattern 정합 (`link.br-id-pattern-mismatch` = non-breaking)
- ★ cross_link_coverage 정량 표시

### ★ FE 모드 (v1.4 Stage 3-2 신설)

FE 산출물 (state-map / visual-manifest / a11y-spec / i18n-spec / static-security-spec / legacy-spectrum / ui-spec) 의 `cross_links[]` 배열 형식 검증:
- `to_artifact` 가 알려진 enum 인가 (`link.fe-unknown-artifact` = breaking)
- `link_type` 이 알려진 enum 인가 (`link.fe-unknown-link-type` = non-breaking)
- `to_id` 가 산출물별 ID pattern 정합인가 (`link.fe-id-pattern-mismatch` = non-breaking)

★ FE 모드는 `--mode=fe` 명시 시 활성. cross-artifact ID resolution (실제 ID 존재 여부) 은 Stage 5+ carry.

## 사용

```bash
# BE 모드 (default)
node src/cli.js examples/poc-03/output/api/api-extension.json

# 디렉토리 재귀 (BE)
node src/cli.js examples/poc-03/output/

# ★ FE 모드
node src/cli.js examples/poc-04/output/state-map/state-map.json --mode=fe

# ★ BE + FE 양쪽
node src/cli.js examples/poc-04/output/ --mode=both

# JSON 출력
node src/cli.js examples/poc-04/output/ --mode=fe --json
```

exit code: `0` (no breaking) / `1` (breaking ≥ 1) / `2` (usage error).

## ROI

- ★ schema 의무화 (묶음 C — openapi-extension + antipatterns) 의 enforcement 자동화
- ★ link 깨짐 자동 검출 (사용자 수동 검토 의존 ❌)
- ★ cross_link_coverage 정량 추적 (PoC #03 = 9/21 op = 43%)

## 시뮬레이션 금지 정책 정합

본 도구는 **AI 추론 0%** — fs.statSync + path.resolve 만 사용. ★★★ no simulation 원칙 정합.
