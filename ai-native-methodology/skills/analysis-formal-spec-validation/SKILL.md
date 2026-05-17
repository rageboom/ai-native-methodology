---
name: analysis-formal-spec-validation
description: Use after analysis-business-rules to cross-validate domain ↔ rules ↔ inventory ↔ architecture consistency. `formal-spec` phase (ADR-008 dual rendering / ADR-009 5-stage confidence). Real external tools mandatory (no simulation). formal-spec-link-validator auto-runs. Stage = analysis.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-formal-spec-validation — Cross-validation

도메인 ↔ 규칙 ↔ 인벤토리 ↔ 아키텍처 정합성 검증. `formal-spec` phase (★★★ no-simulation 정책 첫 실현 단계).

## 사전 조건

- inventory.json / architecture.json / domain.json / rules.json 모두 존재

## ★★★ no-simulation 절대 금지 (CLAUDE.md)

- ❌ AI sub-agent 에 "Static Analyzer / Daikon / Semgrep persona" 부여 금지
- ✅ 진짜 외부 도구 실행 의무 (Semgrep / PMD / SpotBugs / Daikon / CodeQL / SonarQube)
- ✅ 환경 부재 시 사용자에게 환경 준비 요청 또는 사용자 위임 (CI) 명시
- ✅ 시뮬레이션 사용 시 신뢰도 -5%p 패널티 + "진짜 도구 미실행" 명시 의무

## 절차

1. **이중 렌더링 정합 (ADR-008)** — `architecture.json ↔ architecture.mermaid` / `decision-table.json ↔ .mermaid` drift-validator 자동 호출
2. **cross-link 검증** — formal-spec-link-validator:
   - rules.json 의 domain reference 가 domain.json 에 존재하는지
   - architecture.json 의 module 이 inventory.json 에 존재하는지
   - openapi.yaml endpoint 가 rules.json 의 rule 과 매칭되는지
3. **진짜 도구 실행** (해당 stack 에 한해):
   - Semgrep (다중 언어 / 보안 + 패턴)
   - PMD (Java)
   - SpotBugs (Java bytecode)
   - Daikon (불변식 추론)
   - CodeQL (모든 언어 / GitHub)
   - SonarQube (다중 언어)
   - 환경 부재 시 사용자 위임 명시
4. **5단계 신뢰도 (ADR-009)** — 각 산출물별 신뢰도 평가:
   - 1단계: 사람 작성 / source 없음
   - 2단계: AI 추론
   - 3단계: AI 추론 + sub-agent cross-check
   - 4단계: 진짜 도구 1회 실행
   - 5단계: 진짜 도구 + 다른 도구 cross-validation
5. **finding 등재** — 검출된 불일치 / 시뮬레이션 사용 / 환경 부재 → `log-finding`

## 산출물

- `<user-project>/.aimd/output/cross-validation-report.json`
- 각 도구의 raw 출력 보존 (`<user-project>/.aimd/output/tool-runs/`)

## 본체 명세

- `methodology-spec/workflow/formal-spec.md`
- ADR-008 (이중 렌더링), ADR-009 (5단계 신뢰도)
- `tools/formal-spec-link-validator/`, `tools/drift-validator/`, `tools/static-runner/`

## 다음

- `analysis-api-rule-mapping` 또는 `analysis-openapi` / `analysis-db-schema-erd` (BE/FE/DB 트랙별 자동 분기)
