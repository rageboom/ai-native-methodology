---
name: test-verify-coverage
description: ★ ★ v2.0 chain 3 sub-skill. AC → TC coverage 측정 + ratchet (0.85 → 0.90 → 0.95). 3 metric 분리 (link_coverage / test_pass_rate / line+branch_coverage). coverage-auditor persona 책임. ADR-010 v2 + ADR-CHAIN-001 §2 정합.
allowed-tools: Read, Bash
---

# verify-coverage

★ ★ v2.0 chain 3 의 sub-skill. **coverage-auditor persona** 책임. 3 metric 분리 측정 + ratchet 강제.

## 언제 사용

- chain 3 종결 시 의무 (gate #3 진입 prerequisite).
- chain 4 종결 시 final coverage 검증.
- 사용자: "coverage 보여줘" / "ratchet 갱신".

## 입력

- `<project>/.aimd/output/acceptance-criteria.json` (AC-* / verifiable)
- `<project>/.aimd/output/test-spec.json` (TC-* / framework)
- `<project>/.aimd/output/impl-spec.json` — 있으면 (line/branch coverage path)
- `<project>/<coverage>/lcov.info` 또는 `coverage.xml` 등 (framework 별)

## 3 metric 분리 (★ ADR-CHAIN-001 §2)

본 skill 핵심 정책 — 한 metric 으로 합치지 않고 3 분리 측정:

| metric | 정의 | source | gate 임계 |
|---|---|---|---|
| **link_coverage** | AC.test_case_refs 의 비율 | spec-test-link-validator | ≥ 0.85 (chain 2→3 forward link) |
| **test_pass_rate** | pass_count / (pass+fail) | test-impl-pass-validator | chain 4 = 1.0 의무 |
| **line+branch_coverage** | impl 코드 line+branch hit 비율 | LCOV / JaCoCo / Cobertura | ≥ 0.80 (★ 정보 / chain 4 권고) |

★ 정책: `test_pass_rate` 는 chain 4 GREEN 의무 (강제) / `link_coverage` 는 chain 2-3 의무 (강제) / `line+branch_coverage` 는 정보 (사용자 검토 권고 / 본 방법론 강제 ❌).

## ratchet 정책 (★ ADR-010 v2 §2.6)

- 1차 baseline: 0.85
- 1+ PoC 누적 후: 0.90
- 2+ PoC 누적 후: 0.95
- ★ severity_floor (DO-178C DAL A 차용):
  - critical: 1.0 (모든 critical AC 가 100% test 의무)
  - high: 0.95
  - medium: 0.90
  - low: 0.85

## 절차

### 1. link_coverage 측정

```bash
node tools/spec-test-link-validator/src/cli.js \
  --behavior   .aimd/output/behavior-spec.json \
  --acceptance .aimd/output/acceptance-criteria.json \
  --test-spec  .aimd/output/test-spec.json \
  --inventory  .aimd/output/inventory.json \
  --threshold 0.85 \
  --json
```

산출 — `result.coverage.ac_to_tc` (0.0~1.0).

### 2. test_pass_rate 측정 (chain 4 진입 후)

```bash
node tools/test-impl-pass-validator/src/cli.js \
  --project <project> \
  --inventory .aimd/output/inventory.json \
  --allow-execute --json
```

산출 — `pass_count / (pass_count + fail_count)`.

### 3. line+branch_coverage 측정 (★ 정보 only)

framework 별 LCOV / JaCoCo / Cobertura 파싱:
- jest/vitest: `coverage/lcov.info` (lcov-parse npm package 또는 정규식).
- junit5: `target/site/jacoco/jacoco.xml`.
- pytest: `coverage.xml` (Cobertura format).

본 skill 은 path 만 검출 → impl-spec.test_pass_evidence.coverage_report_path 필드 채움. 진짜 metric 측정 = ★ 도구 본격 통합 v2.x carry.

### 4. severity_floor 검증

- AC 의 severity=critical 인데 test_case_refs 부재 → ★ critical 위반 → finding (chain.severity-floor.critical-no-tc).
- AC severity=high 의 link_coverage < 0.95 → finding (chain.severity-floor.high-below-threshold).

### 5. ratchet 갱신

- baseline 갱신 시 `<project>/.aimd/baseline-coverage.json` 작성:
  ```json
  {
    "baseline_date": "2026-05-06",
    "link_coverage_baseline": 0.87,
    "ratchet_target_next": 0.90
  }
  ```
- 다음 cycle 진입 시 link_coverage < baseline → ★ ratchet violation → 차단.

### 6. 결과 채움

- chain 3 → test-spec.coverage_summary 갱신.
- chain 4 → impl-spec.coverage 갱신 (link_coverage / test_pass_rate / line+branch_coverage).

## ★ ★ no-simulation — coverage 위조 차단

`line+branch_coverage` 는 진짜 LCOV/JaCoCo/Cobertura 파일 path 의무. 추측치 ❌ / 사용자 명시 입력 ❌ (path 만 허용 / 측정은 ★ 외부 도구 책임).

## §8.1 strict 정합

본 skill 의 3 metric 분리 = §8.1 strict 검증대 의무 (release 자격 §4 — chain coverage ≥ 0.85). 단일 metric 합산 ❌ / 3 metric 모두 통과 의무.

## 인용

- ADR-CHAIN-001 §2 (cross-link coverage ratchet)
- ADR-010 v2 §2.6 (baseline+ratchet 0.85→0.90→0.95)
- DO-178C DAL A (severity_floor)
- master plan §B chain 3 / §J §coverage 책임 분리

## Carry

- LCOV/JaCoCo/Cobertura 진짜 metric 파싱 → 본 skill 본격 통합 = v2.x carry.
- coverage badge SVG 자동 생성 (README/PR) = sub-plan-6.
