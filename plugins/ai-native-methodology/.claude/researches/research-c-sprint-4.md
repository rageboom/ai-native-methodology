# C-Sprint 4 research — 3 agent 병렬 결과 종합

> **작성**: 2026-04-30 / **plan**: `plan-c-sprint-4.md`
> **방법**: 가벼운 sub-agent 전략 (Document 8분 cap / 테크기업 사례 8분 / Senior 10분, Case 생략).
> **신뢰도 보강**: 3 agent 수렴 항목 / 단일 agent 만 ◯.

---

## 1. 수렴 지점 (3 agent 중 2+ 일치 — plan 즉시 반영 필요)

### A. AST 기반 정규화 + corpus self-test (Document + Senior + 테크기업)

- **Document**: `@mermaid-js/parser` v1.1.0 존재 (langium 기반, ESM-only, Node 18+ + `type:"module"` 필요). API `parse(diagramType, text)`. 단 stateDiagram-v2 / sequenceDiagram grammar 지원 여부는 README 미명시 → **30분 spike** 로 ad-hoc 검증 필요.
- **Senior**: syntactic 비교만으로는 FP 폭발 (Mermaid `note` / `[*]` initial / composite state 들여쓰기 / 화살표 라벨 공백 / 결정표 `|` 정렬 / `Y/N` vs `예/아니오` / row 순서). **AST 정규화 레이어 의무**. 추가로 의미 동일/다름 각 10쌍 corpus 사전 구축 → validator self-test 필수.
- **테크기업**: `@zabaca/mermaid-validate` (공식 parser 위탁) + 의미 비교만 자체. 재발명 회피.

**plan 반영**: drift validator §B 작업에 (1) AST 정규화 레이어 명시 (2) 30분 spike 선행 (parser 지원 확인 → fallback 분기) (3) corpus 20쌍 self-test 의무 (4) ESM-only 제약 명시.

### B. 출력 schema 표준화 — drift = oasdiff 식 / static = SARIF (테크기업 + Document)

- **테크기업**: drift validator 출력은 단순 fail/pass ❌ → oasdiff 식 **항목 단위 diff list + severity** (`breaking` / `non-breaking` / `info`). PR comment 통합 schema 호환.
- **Document**: Semgrep `--sarif` + PMD `-f sarif` 둘 다 공식 지원. SARIF 통일 시 GitHub Code Scanning 업로드 호환 + 룰셋 중복 dedup 용이.

**plan 반영**: DEC-S4-01 출력 schema = oasdiff 모델 / DEC-S4-03 출력 = SARIF 통일 (JSON 은 plan B).

### C. Static tool noise 관리 — baseline + ratchet (테크기업 + Senior)

- **테크기업**: 운영 사례 (Slack / GitLab / Dropbox / Figma / Shopify / HashiCorp / Snowflake — 1M+ weekly scan) 표준 = (a) `SEMGREP_BASELINE_REF=main` diff-aware default (b) full scan 은 nightly (c) monorepo component split (d) `.semgrepignore` + per-rule severity allowlist 처음부터 도입.
- **Senior**: `p/java` + `p/security-audit` 통째 적용 시 200~500건 폭발 / PMD default 1000+ 건 → CI 첫 run red → 개발자 무시 학습 → "static tool 무용론" (안티패턴 자체 재현) . **단계적 ruleset + baseline + ratchet** — 첫 run baseline snapshot → CI 는 신규 alert 0 만 fail → 매 sprint baseline 1~5% 축소 의무.

**plan 반영**: DEC-S4-03 에 noise 관리 전략 신규 섹션 — baseline/ratchet + diff-aware PR / nightly full 이중 모드 + first-class ruleset 좁히기 (`p/owasp-top-ten` + 사내 RSA / JWT custom 만 mandatory, 나머지 advisory). ADR-010 후보 등록.

### D. 시뮬레이션 우회 차단 enforcement — 물증 5종 (Senior + 테크기업)

- **Senior**: `real_tool: true` 자기 표기 → 검증 불가능. AI 가 "실행했다" 거짓말 시 detect 어려움. 본 방법론 절대 금지가 명세상으로만 강제 / enforcement 부재.
- **테크기업**: validator 출력 schema 에 `tool_version` + `tool_invocation_command` 필수 필드 + CI 로그에 exit code 보존.

**합산 권장**: `cross_validation.real_tool: true` 동시 5종 물증 의무화 — (a) tool stdout/stderr raw log (b) tool version (c) 명령 timestamp + duration (d) 결과 hash (e) reproduction command. 5종 중 1개 누락 시 자동 simulation 판정 + fail. SARIF 표준 출력 강제 (schema 검증 통과 못하면 fail).

**plan 반영**: DEC-S4-04 에 5종 물증 필드 schema 강제 추가. AI raw log 위조 까지는 본 sprint scope 아웃 (PoC #03 또는 사내 적용 시 sandbox 격리).

### E. Decision-table validator 5종 + drift 2종 분리 (테크기업 + Senior)

- **테크기업**: `red6/dmn-check` (Apache 2.0) — duplicate / conflict (UNIQUE hit policy) / gap / overlap / type check 5종. 본 방법론 BR 형식화 빈약성 직격 (gap / overlap 은 자연어로 안 드러남).
- **Senior**: drift 0 목표 비현실적. **structural drift** (필드 누락/오타 — 0 목표) vs **interpretive drift** (자연어 ambiguity 노출 — finding 등록 후 자연어 보강) 2종 분리. 후자는 Phase 4.5 본질적 가치 → finding 환영.

**plan 반영**: 성공 기준 5번 "drift 0" → "**structural drift 0 + interpretive drift 100% finding 등록**". Decision-tables validator 에 dmn-check 5종 알고리즘 차용.

### F. 시간 견적 1.5x 보정 + Phase D 분리 (Senior 단독 강조)

- **Senior**: 첫 도입 + AST 학습 + ruleset 튜닝 + GH Actions YAML 디버깅 (matrix / cache / docker-in-docker) → 첫 run 보통 2~4회 실패. AI-agent 페어 + 첫 도입 → 1.5x~2x 현실적. 90+120분 = 3.5h ideal-path → 8~9h 보정. 또는 Sprint 4-A (drift only) + 4-B (static only) 2 sprint 분할.

**plan 반영**: Phase B 90→150분 / Phase C 120→180분 / 총 5.5→8h. Phase D (real static tool 1회 실증) 는 환경 의존 → **optional sub-goal 분리 + carry-over OK** 명시.

---

## 2. 단일 agent 발견 ◯ (plan 반영 검토 필요)

### ◯ G. ESM-only / setup action pinning (Document)

- `@mermaid-js/parser` ESM-only → CJS require 불가 / Node 18+ + `type:"module"` 또는 dynamic `import()` 필수.
- `actions/setup-java@v5` (Temurin 명시 필수) + `actions/setup-node@v6` 둘 다 runner v2.327.1+ 요구 (breaking).

**plan 반영**: DEC-S4-01 ESM-only 제약 명시 / DEC-S4-02 action 핀 명시 + runner 호환 footnote.

### ◯ H. "No simulation" 정책 = 차별 자산 (테크기업)

- 외부 사례 fetch 실패 + training 지식 불가 → 본 방법론 정책은 **세계적 niche / 차별 자산**.
- 간접 사례: Buf / oasdiff / Spectral 모두 진짜 parser 실행 (LLM 추론 대체 ❌). Semgrep AI memory 는 triage 보조용 / rule match 자체는 항상 진짜 엔진.

**plan 반영**: 본 방법론 차별 포인트 명시 가능 (CHANGELOG / README 후속). Sprint 4 자체 산출에는 영향 없음.

---

## 3. 출처 (재현성)

### Document agent (공식 docs)

- `@mermaid-js/parser` npm registry README
- `actions/setup-java@v5` / `actions/setup-node@v6` README
- Semgrep CLI / sample CI configurations
- PMD 7.24.0 CLI / Report formats

### 테크기업 사례 agent (production 운영)

- Pulumi Cloud Drift Detection blog
- Spacelift Drift Detection docs
- oasdiff (OpenAPI diff)
- pb33f openapi-changes
- Buf Protobuf with Earthly
- Zabaca mermaid-validate / rtuin mcp-mermaid-validator
- Semgrep Monorepo Scanning / Diff-aware Scans / Managed Scans 1M Weekly blog
- red6 dmn-check / Sparx DMN Decision Table Validation / Drools DMN

### Senior Engineer agent (training 지식 + 비판적 검토)

- Mermaid syntax 함정 (note / pseudo-state / composite state / 라벨 공백)
- Static tool noise 폭발 패턴 (200~500 / 1000+)
- baseline + ratchet 전략
- dmn-check 5종
- AST 정규화 + corpus self-test 패턴

---

## 4. 종합 — plan 즉시 반영 6항목

1. **drift validator AST 정규화 + 30분 spike + 20쌍 corpus self-test** (A)
2. **출력 schema 표준화 — drift = oasdiff / static = SARIF** (B)
3. **Static tool noise — baseline + ratchet + diff-aware/nightly 이중 모드** (C)
4. **물증 5종 필드 schema 강제** (D)
5. **dmn-check 5종 차용 + drift 2종 분리 (structural / interpretive)** (E)
6. **시간 견적 1.5x 보정 (5.5→8h) + Phase D 분리 + carry-over OK** (F)

→ plan-c-sprint-4.md 갱신 후 사용자 일괄 승인 요청 (3원칙).
