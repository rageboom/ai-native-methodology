# ADR-010: Baseline + Ratchet — 점진적 quality gate

- 상태: 승인됨 (Accepted) — 묶음 D #1
- 일자: 2026-04-30
- 결정자: 윤주스 (TF Lead, Auto Mode 위임)
- 관련: ADR-001 / ADR-008 / ADR-009 / Sprint 5 carry-over / DEC-v1.3-격상-데이터-완비

---

## 1. 컨텍스트

본 방법론의 자동 검증 도구 (drift-validator + decision-table-validator + static-runner) 가 **legacy 코드베이스 진입 시점** 에 다수의 finding 을 일제 검출. 사내 적용 시:

> "본 방법론을 우리 시스템에 도입하면 어떤 quality gate 정책을 써야 하나?"

기존 상태:
- ADR-008 (이중 렌더링) 가 drift 0 의무를 강제하는 일부 항목만 enforcement
- 진짜 static tool (Semgrep / PMD) 도입 시 legacy 결함 폭증 — 즉시 zero-defect 강제 시 사내 도입 차단 risk

### 산업 표준 사례

- **Slack** — `cmds-baseline.json` (전 기존 결함 등재 / 신규만 차단)
- **GitLab** — `gl-secret-detection.json` baseline (점진 ratchet)
- **Dropbox** — `mypy --strict baseline` (gradual typing)
- **Figma** — TypeScript strict ratchet (점진 enable)
- **Shopify** — Sorbet `srb tc --strict-files` ratchet

→ **★ 6 사례 모두 baseline + ratchet 패턴**. 일제 enforcement ❌.

## 2. 결정

### 2.1 ★ Baseline 도입 의무

본 방법론 도구가 legacy 진입 시 **최초 분석 결과를 baseline 으로 등재**:

```yaml
# .ai-native-methodology/baseline.yml
generated_at: 2026-04-30
source_commit_sha: <HEAD>
findings:
  - id: F-NNN
    severity: high
    location: src/.../...ts:42
    fingerprint: <sha256>
    grandfathered: true   # ★ 기존 결함 = 통과
```

→ 현존 결함은 **CI 통과**.

### 2.2 ★★ Ratchet 정책 — 신규 결함만 차단

CI 의무:
- ★ baseline 외 신규 결함 = **CI fail** (★ 점진 격상)
- ★ baseline 내 결함 fix → fingerprint 자동 제거 (★ 한 방향 — 절대 추가 ❌)
- ★ severity 격상 시 baseline 갱신 의무 (★ 사용자 결단 영역)

```bash
# pre-commit
drift-validator --baseline .ai-native-methodology/baseline.yml

# CI
drift-validator --baseline .ai-native-methodology/baseline.yml --ratchet
# exit 0 if baseline + 신규 결함 0
# exit 1 if 신규 결함 ≥ 1
```

### 2.3 ★ Severity 별 ratchet 강도

| severity | ratchet 정책 |
|---|---|
| **critical** | ★★★ 즉시 차단 (baseline 등재 ❌ — production blocker) |
| **high** | ★★ 신규 차단 / baseline grandfathered |
| **medium** | ★ 신규 차단 / baseline grandfathered |
| **low** | 신규 경고만 / baseline grandfathered |
| **positive** | 등재만 (★ migration-cautions 모범 사례) |

### 2.4 ★ Baseline 갱신 절차

- ★ Quarterly review — baseline 결함 줄어들었는지 정량
- ★ Severity 격상 시 즉시 갱신 (★ 3 PoC 권위 — AP-PERFORMANCE 등)
- ★ baseline 만료 (★ 2년 — 자동 expiry)

### 2.5 본 방법론 도구 적용

★ 본 정책 (baseline + ratchet) 은 **ADR-009 §2.1 단계 3 (자동 검증 도구 — drift-validator / decision-table-validator)** 와 함께 작동. 단계 3 도구의 기본 동작 + ratchet mode 추가 → 신규 결함만 차단 / 기존 baseline 결함은 건수만 추적. 단계 5 (진짜 외부 도구 — Semgrep / PMD) 도 동일 패턴으로 적용 가능.

```bash
# drift-validator (ADR-009 §2.1 단계 3 + ratchet)
node tools/drift-validator/src/cli.js <dir> --baseline .ai-native-methodology/drift-baseline.yml --ratchet

# decision-table-validator (ADR-009 §2.1 단계 3 + ratchet)
node tools/decision-table-validator/src/cli.js <dir> --baseline .ai-native-methodology/dmn-baseline.yml --ratchet

# static-runner (ADR-009 §2.1 단계 5 — 진짜 외부 도구 Semgrep / PMD)
node tools/static-runner/src/cli.js --baseline-mode ratchet
```

## 3. 결과

### 3.1 Positive 효과

- ★ legacy 사내 도입 차단 risk 회피 (★ 6 산업 표준 사례 정합)
- ★ 점진 quality 격상 — 신규 결함 = 즉시 차단 / 기존 = 점진
- ★ developer adoption — "이미 있던 결함" 으로 비난 ❌
- ★ 본 방법론 ROI 정량 가능 (baseline 결함 수 분기별 감소율)

### 3.2 트레이드오프

- ★ baseline 파일 관리 부담 — git 추적 의무
- ★ baseline 갱신 시 사용자 결단 영역 (★ severity 격상 등)
- ★ critical 은 baseline 등재 ❌ — 즉시 fix 의무 (★ AP-AUTH-NEST-001 등)

## 4. 검증

- ★ Sprint 5+ 환경 변동 시 — Semgrep + PMD 실 실행 후 baseline 도입 시연
- ★ 사내 신규 적용 시 — 첫 분석 결과 baseline 등재 + 분기별 review
- ★ unit test — drift-validator + decision-table-validator + static-runner baseline mode 회귀 검증
- ★ ★ **v1.4.1 (2026-05-02) — 외부 적용 첫 입증** — PoC #04 full Semgrep p/owasp-top-ten 진짜 실행 / baseline 첫 작성 (0 findings, source_commit_sha=963b3035) + ratchet dry trial pass (exit 0)
- ★ ★ ★ **v1.4.2 (2026-05-02) — drift-check.yml CI 통합 + §2.3 정책 첫 운영 입증** — PoC #04 full FE 트랙 신규 step (`--baseline --ratchet --extra-rules`) 추가 / ratchet dry trial: baseline 0 → novel 1 (★ AP-FE-SECURITY-001 custom rule 매칭) → blocked 1 → exit_code **1** = ★ §2.3 "critical/high = production blocker" 정책 ★ 첫 실 fail trigger 입증

## 5. 본 방법론 적용

`tools/{drift,decision-table,static-runner}/` 도구에 `--baseline` + `--ratchet` 옵션 추가 (Sprint 5 implementation carry-over).

`migration-cautions.md` 신규 § "사내 도입 시 quality gate 정책" 항목 등재 (★ 묶음 P 보강).

---

## 6. 참조

- Slack `cmds-baseline.json` (★ blog post)
- GitLab `gl-secret-detection.json`
- Dropbox `mypy --strict baseline`
- Figma TypeScript strict ratchet
- Shopify Sorbet `srb tc --strict-files`
- Stripe internal "baseline + ratchet" 표준
- DEC-2026-05-06-v2.0-i-strict-채택 (★ §2.6 v2 확장 trigger)
- DO-178C / IEC 62304 (★ §2.6 severity_floor 차용)

---

## §2.6 v2 확장 — coverage ratchet baseline (2026-05-06)

★ ★ ★ DEC-2026-05-06-v2.0-i-strict-채택 + ADR-CHAIN-001 §2 정합. v2.0 chain 4단계 chain coverage ratchet 정책 신설.

### chain coverage ratchet baseline

```yaml
chain_coverage_ratchet:
  v2.0.0 (initial):
    link_coverage: 0.85
    test_pass_rate: 1.0 (chain 4 GREEN 의무 / fixed)
    line_coverage: optional (정보용)
    branch_coverage: optional (정보용)
  v2.1+:
    link_coverage: 0.90 (★ ≥ 2 PoC sustained 0.90 입증 후 auto-promotion)
    test_pass_rate: 1.0
  v3.0+:
    link_coverage: 0.95
    test_pass_rate: 1.0
```

### severity_floor (★ DO-178C DAL A 차용)

link_coverage threshold 보다 더 강한 floor:

| severity | floor |
|---|---|
| critical | 1.0 (★ ★ ★ DO-178C DAL A — uncovered 분석 의무) |
| high | 0.95 |
| medium | 0.90 |
| low | 0.85 (initial baseline) |

severity_floor 미달 시 즉시 차단 (ratchet 와 별개 / regression 자동 차단).

### ratchet rule (★ §8.1 strict 정합)

- baseline 산출 시 0.85 미만은 grandfathered (단 critical AC-* 미달 = 즉시 차단)
- 신규 AC-* 추가 시 즉시 0.85 의무
- ratchet 갱신 (0.85 → 0.90 → 0.95) = ★ ★ 사용자 명시 결단 의무
- ratchet 갱신 prerequisite: ★ §8.1 strict ≥ 2 PoC corroboration sustained pass

### chain_attempt retry cap (★ Industry research 정합)

AI code gen SOTA pass rate (60~88%) gap 봉쇄:
- `chain_attempt.retry_cap` default 3 (★ test-spec / impl-spec schema 의무)
- retry_cap 초과 시 자동 chain abort + 4 원칙 §4 (Revert + Lessons Learned) 적용
- retry_cap 사용자 갱신 = §8.1 strict 의무

### 70~80% 한계 명시 잔존 (★ master plan §J.2 옵션 A)

- AI 자동화 ≥ 85% / 사용자 검토 ≤ 15% / 100% 자동화 ❌ 명시
- impl-spec.human_review.gate_4_intervention_pct ≤ 0.30 schema 의무

### baseline 도구 통합 (sub-plan-3)

본 ADR §2.5 의 baseline + ratchet pattern 을 chain 6 신규 도구 모두 적용:
- planning-extraction-validator
- chain-coverage-validator
- spec-test-link-validator
- test-impl-pass-validator
- traceability-matrix-builder
- chain-revisit-detector

기존 6 도구 (drift / decision-table / formal-spec-link / spectral / static / schema-validator) baseline pattern 그대로 유지 + chain 모드 확장.

### 변경 이력 추가
- 2026-05-06: §2.6 신설 — chain 4단계 coverage ratchet baseline (DEC-2026-05-06-v2.0-i-strict-채택 / ADR-CHAIN-001 §2 정합).

---

**End of ADR-010 (★ v2 §2.6 확장 포함).**
