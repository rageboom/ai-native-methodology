# JSON Schemas (방법론 산출물)

> 7대 산출물 + 메타 + 인벤토리 schema.
> JSON Schema Draft 2020-12.

---

## 목록

| Schema | 용도 | 대응 산출물 |
|---|---|---|
| `meta-confidence.schema.json` | 모든 산출물 공통 메타 | meta 섹션 |
| `inventory.schema.json` | Phase 1 인벤토리 | `inventory.json` |
| `db-schema.schema.json` | Phase 2 DB 스키마 | `schema.json` |
| `architecture.schema.json` | Phase 3 아키텍처 | `architecture.json` |
| `domain.schema.json` | Phase 4 5.B 도메인 | `domain.json` |
| `rules.schema.json` | Phase 4 5.A 비즈니스 규칙 | `rules.json` |
| `openapi-extension.schema.json` | Phase 5.1 API 확장 | OpenAPI x-* 필드 |
| `ui-spec.schema.json` | Phase 5.2 UI 명세 | `ui-spec.json` |
| `antipatterns.schema.json` | Phase 6 안티패턴 | `antipatterns.json` |
| `finding-system.schema.json` | Finding 등록·처리 (모든 phase) | `findings/poc-findings.{json,md}` |
| `formal-spec.schema.json` | Phase 4.5 형식 명세 (state/sequence/decision-table/invariants/property) | `formal-spec/*.{json,mermaid,md,ts}` |

---

## CI 검증

### v1.2.1 (현재) — Phase 4.5 자동 검증 도구 도입 ✅

`tools/drift-validator/` + `tools/decision-table-validator/` + `tools/static-runner/` 신설. `.github/workflows/drift-check.yml` 이중 모드 (PR diff-aware + nightly full + manual).

```bash
# 본 산출물 schema 정합 + drift + dmn-check 5종 자동 검증
node ai-native-methodology/tools/drift-validator/src/cli.js <output-dir>
node ai-native-methodology/tools/decision-table-validator/src/cli.js <output-dir>
```

### v1.2.1 — `formal-spec.schema.json` 5종 물증 강제 ★

`cross_validation.validators[]` 의 `real_tool: true` 시 **5종 물증 if/then 의무**:
- `tool_version` / `tool_stdout_path` / `tool_stderr_path` / `invocation_timestamp` / `duration_ms` / `result_hash` / `reproduction_command`

`real_tool: false` 시 `simulation_reason` 의무. `simulation_only: true` 시 자동 fail.

→ `tools/static-runner/lint-no-simulation.sh` 가 grep 보강 (이중 안전망).

### v1.3+ 후속 (TODO)

- 7대 산출물 + meta-confidence schema 의 CI 자동 검증 (ajv-cli 또는 jsonschema)
- pre-commit hook
- 참고: Backstage Catalog Entity 검증 모델

### 수동 검증 (현재 / fallback)

```bash
npx ajv validate \
  -s schemas/inventory.schema.json \
  -d output/inventory/inventory.json \
  -r schemas/meta-confidence.schema.json
```

---

## 작성 규칙

- `$id` 는 `https://ai-native-methodology/schemas/{name}.schema.json` 형식
- 외부 참조는 상대 경로 (`./meta-confidence.schema.json`)
- 모든 enum 값은 ADR 또는 phase-*.md 본문과 정합
- 신규 필드는 옵셔널이 기본 (호환성 유지)
