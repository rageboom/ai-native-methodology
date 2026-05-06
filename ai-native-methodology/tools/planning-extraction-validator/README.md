# planning-extraction-validator

★ ★ v2.0 SDLC 4단계 chain harness 의 **chain 1 (planning → spec) gate validator**.

`planning-spec.json` 의 모든 `BR-INTENT-*` 가 analysis 산출물 (`rules.json` / `domain.json`) 의 BR/도메인 객체에 grep-hit 으로 source-grounded 인지 검증한다. AI 환각 방지가 1차 목적.

## 사용

```bash
node src/cli.js \
  --planning .aimd/output/planning-spec.json \
  --rules .aimd/output/rules.json \
  --domain .aimd/output/domain.json \
  [--dry-run] [--json]
```

## 검증 항목

| kind | severity | 의미 |
|---|---|---|
| `planning.br-unknown` | critical | `BR-INTENT-*.br_id` 가 analysis 의 BR-* 와 매칭 ❌ |
| `planning.no-source-grounded-evidence` | high | `source_grounded_evidence` 부재 / 빈 배열 |
| `planning.grep-hit-zero` | high | grep_hit_count = 0 (file 안에 element_id 가 실재 ❌) |
| `planning.use-case-coverage-low` | high | UC coverage < 0.80 (사용자 결단 D) |
| `planning.cross-link-empty` | medium | `cross_links.to_analysis_artifacts` 빈 배열 |

## ★ S3 — `--dry-run` 의미 명문화

`--dry-run` 사용 시 다음 3 조합이 모두 적용된다 (sub-plan-3 research S3 정합):

1. **write-baseline 차단** — 본 도구는 baseline 파일을 작성하지 않으므로 항상 충족.
2. **prompt 차단** — 사용자 결단 prompt 가 본 도구에 없으므로 항상 충족.
3. **exit 0 강제** — finding severity 에 무관하게 exit 0 반환 (CI 통합 시 strict 모드와 분리).

**default (strict 모드)** = `critical` ≥ 1 또는 `high` ≥ 1 → exit 1.

## ★★★ no-simulation 정책 정합

본 도구는 메타데이터 (cross_validation 등) 를 생성하지 않는다. validation 결과 자체가 grep-hit 정량 evidence 이므로 5종 물증 의무 대상에서 제외 (analyzer 도구).

## Carry

- planning-spec deliverable 17 의 full implementation = sub-plan-4 (skill `skills/planning/extract-from-legacy/`)
- meta-confidence schema $ref 적용 (현 CLI 는 schema 강제 X / sub-plan-3a 후속)
