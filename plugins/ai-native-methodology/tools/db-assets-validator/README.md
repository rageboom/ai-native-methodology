# db-assets-validator

25번째 validator — **DB 자산 always-on 정책** 자동 검사. `F-DB-AUTOVAL-001` 해소 (`methodology-spec/db-assets-always-on.md` §8.4).

legacy 시스템의 비즈니스 로직은 코드 layer 뿐 아니라 DB layer(Tables / Views / Functions / Stored Procedures)에도 분포한다. 본 validator 는 `work-unit-manifest.json` 의 `analysis_refs` 안 DB 자산 4 필드가 정책대로 채워졌는지 결정적으로 검사한다.

## 사용

```sh
db-assets-validator <manifest.json> [--stage <s>] [--format text|json] [--strict]
```

- `--manifest <path>` — 검사 대상 (positional 로도 가능)
- `--stage <s>` — stage 명시 override (미지정 시 `manifest.stage` / `current_stage` 자동 추론)
- `--json` — machine-readable 출력
- `--strict` — `medium`/`low`(warn) finding 도 exit 1 (CI / chain `--next` 전 audit 용)

## 검사 항목

| code | severity | 설명 |
|---|---|---|
| `sp_missing_id` | critical | `db_procedures[]` item 에 required `id` 부재 |
| `sp_invalid_class` | critical | `sp_conversion_class` ∉ {alpha, beta, gamma, delta} (sp-conversion-policy §2) |
| `sp_unclassified_at_plan` | critical | plan stage 이후 SP 미분류 (discovery 까지는 nullable — db-assets-always-on §3 chain 3) |
| `external_class_mismatch` | high | `external=true` 인데 `sp_conversion_class≠gamma` (외부 SP = γ 보존 의무) |
| `gamma_external_unset` | medium | `class=gamma` 인데 `external≠true` (γ 시 external=true 의무) |
| `db_assets_absent` | medium | 비-DB 자산은 채웠으나 DB 자산 4종 0 (DB layer 누락 확인 / **greenfield 면제**) |

## exit code

- `0` — pass (critical/high 0 / `--strict` 시 finding 0)
- `1` — fail (critical/high ≥ 1 / `--strict` 시 finding ≥ 1)
- `2` — usage error / 파일 읽기 실패

## axis 분리 (결정론)

본 validator 는 **결정론** 도구다 (LLM 판단 inject ❌ / `feedback_chain_driver_deterministic_axis` 정합). manifest **완성도** 검사 only — canonical global (`.aimd/output/schema.json`) 와의 cross-resolution 은 `drift-validator` 영역이다.

## 운영 위치

- **release-readiness #23** — golden fixture(`test/fixtures/{compliant,violations}-plan.json`) 판별 검사 (compliant→pass / violations→fail-with-codes). 커밋된 PoC 에 `analysis_refs.db_*` 를 가진 manifest 가 생기면 corpus scan 으로 확장.
- **standalone** — chain `--next` 진입 전 scope manifest audit (`--strict`).

> 정직: gate-eval per-stage inject ❌ (DB 완성도는 chain 출력이 아니라 manifest 입력 품질 게이트 / DEC P1 결정). 사용자가 per-stage 강제를 원하면 chain `--next` 전 standalone 으로 실행.
