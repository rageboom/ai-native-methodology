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

---

## CI 검증 (TODO — v1.3.0 도입 예정)

> v1.1.2 시점: schema 게시 only. 자동 검증 미도입.
> 산업 사례: Backstage 가 비슷한 진화 경로를 거침 (schema 게시 → CI 검증 추가).

### v1.1.2 임시 정책

산출물 생성 시 **수동으로** schema 검증 권장:

```bash
# JSON Schema 검증 도구 예시 (ajv-cli)
npx ajv validate \
  -s schemas/inventory.schema.json \
  -d output/inventory/inventory.json \
  -r schemas/meta-confidence.schema.json
```

### v1.3.0 도입 예정

- pre-commit hook 또는 GitHub Action 으로 산출물 schema 자동 검증
- 검증 실패 시 산출물 머지 차단
- 참고: Backstage Catalog Entity 검증 모델 (https://backstage.io/docs/features/software-catalog/descriptor-format)

> ⚠️ schema 게시 only 의 위험: OpenAPI 3.0 → 3.1 마이그레이션이 7년 걸린 사례가 있음 (2017~2024). v1.3.0 까지의 격차가 길어지지 않도록 주의.

---

## 작성 규칙

- `$id` 는 `https://ai-native-methodology/schemas/{name}.schema.json` 형식
- 외부 참조는 상대 경로 (`./meta-confidence.schema.json`)
- 모든 enum 값은 ADR 또는 phase-*.md 본문과 정합
- 신규 필드는 옵셔널이 기본 (호환성 유지)
