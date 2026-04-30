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

```bash
# drift-validator
node tools/drift-validator/src/cli.js <dir> --baseline .ai-native-methodology/drift-baseline.yml --ratchet

# decision-table-validator
node tools/decision-table-validator/src/cli.js <dir> --baseline .ai-native-methodology/dmn-baseline.yml --ratchet

# static-runner (Semgrep / PMD)
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

---

**End of ADR-010.**
