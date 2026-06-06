---
name: analysis-formal-spec-validation
description: Use after analysis-business-rules to cross-validate domain ↔ rules ↔ inventory ↔ architecture consistency. `formal-spec` phase (ADR-009 5-stage confidence / ADR-011 json 단독). Real external tools mandatory (no simulation). formal-spec-link-validator auto-runs. Stage = analysis.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-formal-spec-validation — Cross-validation

도메인 ↔ 규칙 ↔ 인벤토리 ↔ 아키텍처 정합성 검증. `formal-spec` phase (no-simulation 정책 첫 실현 단계).

## 사전 조건

- inventory.json / architecture.json / domain.json / business-rules.json 모두 존재

## no-simulation 절대 금지

baseline → `methodology-spec/policies/no-simulation.md`.

- 본 skill 도구: Semgrep (Tier 1) / PMD (Tier 1 in-plugin 자동실행 / DEC-2026-06-07 + Tier 2 SARIF import allowlist / orthogonal). 환경(JDK+PMD) 부재 시 exit 3 정직신호 → 사용자 환경 준비 또는 CI 위임. (SpotBugs·CodeQL·Daikon·SonarQube 등 실 import 이력 0 도구는 미등재 — 사용자 명시 확장.)

## 절차

1. **cross-link 검토 (LLM/사람 — analysis 무-gate / 결정론 강제 ❌)** — 아래 3 정합은 LLM·사람 검토 영역. formal-spec-link-validator 는 analysis-stage 이 3종을 결정론 강제하지 **않음** (FE/chain cross-link id-pattern 만 자동 검사 / json 단독 — `.mermaid·.md` 이중렌더링 drift 검사 없음). 따라서 본 3종은 정직하게 "검토 권고"로 표기:
   - business-rules.json 의 domain reference ∈ domain.json
   - architecture.json 의 module ∈ inventory.json
   - openapi.yaml endpoint ↔ business-rules.json rule 매칭
2. **진짜 도구 실행** (해당 stack 에 한해 / R19 Tier 명시):
   - **Tier 1 (in-plugin)** — Semgrep (다중 언어 / 보안 + 패턴 / Python pipx) / PMD (Java / `--plugin pmd` / JDK 8+ / DEC-2026-06-07)
   - **Tier 2 (사용자 환경 SARIF import)** — allowlist=PMD (orthogonal / in-plugin 불가 환경의 import 경로). 그 외 도구는 사용자가 자기 환경서 쓰면 `IMPORTED_DRIVER_ALLOWLIST` 명시 확장
   - 환경 부재 시 사용자 위임 명시 (정직 표기 / 시뮬 ❌)
3. **5단계 신뢰도** — 각 산출물별 신뢰도 평가:
   - 1단계: 사람 작성 / source 없음
   - 2단계: AI 추론
   - 3단계: AI 추론 + sub-agent cross-check
   - 4단계: 진짜 도구 1회 실행
   - 5단계: 진짜 도구 + 다른 도구 cross-validation
4. **finding 등재** — 검출된 불일치 / 시뮬레이션 사용 / 환경 부재 → `log-finding`

## 산출물

- `<user-project>/.aimd/output/cross-validation-report.json`
- 각 도구의 raw 출력 보존 (`<user-project>/.aimd/output/tool-runs/`)

## 다음

- `analysis-api-rule-mapping` 또는 `analysis-openapi` / `analysis-db-schema-erd` (BE/FE/DB 트랙별 자동 분기)

## 인용

- ADR: ADR-011 (json 단독, mermaid 미산출)
- ADR: ADR-009 (5단계 신뢰도)
- 정책: methodology-spec/workflow/formal-spec.md
- 정책: methodology-spec/policies/no-simulation.md
- 도구: tools/formal-spec-link-validator/, tools/drift-validator/, tools/static-runner/
