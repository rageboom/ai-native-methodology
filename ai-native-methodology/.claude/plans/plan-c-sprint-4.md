# C-Sprint 4 plan — Drift CI + 진짜 Static Tool + Decision-Table .json 짝

> **위치**: methodology body 레벨 (`ai-native-methodology/.claude/plans/`)
> **선행**: C-Sprint 3 종결 (2026-04-30) / v1.2.0 14/16 묶음 ready
> **목표**: 묶음 N (Drift CI) + 묶음 O (진짜 외부 도구) + decision-tables .json 짝 → v1.2.0 16/16 ready → 시퀀스 A 진입 가능

---

## 0. 배경 / 진입 근거

### 직전 상태 (C-Sprint 3 wrap-up + STATUS.md)

- 묶음 A~M + P 14건 ready (v1.2.0 격상 완료)
- **묶음 N (Drift 자동 CI)**: Sprint 3 에서 **수동** drift 검증 (state-machine + sequence .json↔.mermaid 100% 정합) → CI 자동화는 미구현
- **묶음 O (진짜 static tool)**: DEC-2026-04-29-static-tool-실행-의무화 ★★★ — Sprint 1.5 시뮬레이션 자가 시인 후 Sprint 4 실행 의무. 현재 신뢰도 80-87% (시뮬 패널티) → 진짜 도구 도입 시 90-95% 목표
- **decision-tables .json 짝**: Sprint 3 에서 state-machine + sequence 만 .json 짝 → decision-tables 5건 (`.md` only) 잔존
- **하네스 차단 룰**: `simulation_only: fail` DEC 에 명시되어 있으나 실제 스크립트/CI 룰 미작성

### 절대 우선순위 정합

품질 1순위 + 재작업 최소화 2순위 + §8.1 단일 PoC 과적합 회피.
→ Sprint 4 산출물은 **PoC #02 데이터로 검증**하되, **본체 (`methodology-spec/` + 하네스 + CI workflow) 변경**이 본질. PoC #03 진입 전 본체 정합 확보.

### Static tool 시뮬레이션 절대 금지 (★★★)

- ❌ AI sub-agent 에 "Static Analyzer / Semgrep persona" 부여 시뮬 금지
- ✅ 진짜 외부 도구 실제 실행 의무
- ✅ 환경 부재 시 사용자 위임 (CI) 명시
- ✅ 시뮬 사용 시 -5%p 패널티 + 명시 의무

→ Sprint 4 자체에서도 본 원칙 적용 — 진짜 도구가 실제 동작 안 하면 "동작 안 함" 정직 표기, 시뮬 결과를 90-95% 신뢰도 근거로 절대 사용 금지.

---

## 1. Sprint 4 산출 목표 (5 핵심 묶음)

| 묶음 | 산출물 | 위치 | 의무성 |
|---|---|---|---|
| **N1 — drift validator 스크립트** | `tools/drift-validator/` 신규 (Node 또는 Python). `.mermaid` ↔ `.json` 의미 동일성 비교 (state-machine / sequence / decision-table) | body | 필수 |
| **N2 — CI workflow** | `.github/workflows/drift-check.yml` (또는 동등) — PR 단위 drift validator 자동 실행 | body | 필수 (단, 사용자 환경 따라 local 시범도 허용) |
| **O1 — static tool 실행 스크립트** | `tools/static-runner/` — Semgrep + PMD + SpotBugs 실행 + 결과 정규화 (JSON) | body | 우선순위 1: Semgrep + PMD (Java 1차). SpotBugs/Daikon/CodeQL 은 가용 시 추가 |
| **O2 — 하네스 차단 룰** | `tools/static-runner/lint-no-simulation.sh` + 사용 가이드 → CI gate. _manifest.yml 의 `cross_validation.real_tool: false` 자동 검출 → fail | body | 필수 |
| **D1 — decision-tables .json 짝 5건** | `examples/poc-02-realworld-springboot3/output/phase-4-5/decision-tables/*.json` 5건 (`formal-spec.schema.json#decision_tables[]` 정합) | PoC #02 | 필수 (drift validator 입력 시범 + Sprint 3 잔존 갭 해소) |

### 기대 결과 (정량)

```yaml
v120_bundles_ready_after_sprint4: 16     # A~P 전체
이중_렌더링_정합_after: 100%             # decision-tables 포함
신뢰도_정직표기_after:
  진짜_도구_동작_시: 90-95%
  진짜_도구_부재_시: 80-87% (시뮬 패널티 유지 / 정직 표기)
finding_phase45_new_expected: 5-15       # Sprint 4 신규 (drift validator 가 잡아내는 hidden drift + 진짜 도구 finding)
ap_total_expected: 36-45                 # 진짜 도구 신규 AP 가능
```

---

## 2. 작업 분할 (의존 그래프 + 시간 견적)

```
[Phase A: 본체 사상 정합]    →   [Phase B: drift validator]   ─┐
       (~30분)                       (~90분)                   │
                                                               ├─→ [Phase D: 시범 검증]
[Phase C: static runner]    ─────────────────────────────────┘    (~60분)
       (~120분)                                                    │
                                                                   ↓
                                                       [Phase E: 보고서 + STATUS 갱신]
                                                              (~30분)

총 시간: ~5.5시간 (단일 세션 또는 2세션 분할)
```

| Phase | 작업 | 산출 | 시간 |
|---|---|---|---|
| **A** | 사상 정합 점검: ADR-008 (이중 렌더링) + DEC-static-tool 두 결정의 본체 spec 반영 점검 + Sprint 4 산출 위치 확정 | (체크리스트, plan 본문에 흡수) | 30분 |
| **B** | **drift validator** 구현: (1) state-machine 비교기 (mermaid stateDiagram-v2 ↔ JSON states/transitions), (2) sequence 비교기 (sequenceDiagram ↔ JSON participants/messages), (3) decision-table 비교기 (markdown 표 ↔ JSON decision_tables[].rows). Node + tiny CLI. unit test 3건 | `tools/drift-validator/` (src + test + README) | 90분 |
| **C** | **static runner** 구현: (1) Semgrep CLI wrapping (Java rules + custom AP 룰셋), (2) PMD CLI wrapping, (3) 결과 → finding-system schema 정규화, (4) `simulation_only: fail` 게이트 스크립트 | `tools/static-runner/` (src + Java rules + README) | 120분 |
| **D** | **decision-tables .json 5건** (PoC #02 시범) — Sprint 3 잔존 5건 BR 의 .md 표 → .json 변환. drift validator 로 정합 자가 검증 (drift 0 목표) | `examples/poc-02-.../output/phase-4-5/decision-tables/*.json` 5건 | 60분 |
| **E** | **CI workflow** + 보고서 + STATUS.md 갱신 + DEC + INDEX 갱신 + SESSION-WRAPUP-2026-04-XX-sprint4.md | `.github/workflows/drift-check.yml` + STATUS.md 갱신 + DEC 신규 + wrapup | 30분 |

### 가벼운 sub-agent 활용 (Phase B, C)

Phase B/C 는 **외부 라이브러리 + CLI 통합** 코드 작성 → Document agent (공식문서 cross-validate, 시간 cap 8분) + Senior agent (CI 통합 함정 cross-validate, 시간 cap 10분) 병렬 활용. Case 생략. memory `feedback_lightweight_sub_agent.md` 적용.

---

## 3. 핵심 결정 포인트 (사용자 일괄 승인 6건 — research 반영 갱신)

> 3 agent 병렬 research (`research-c-sprint-4.md`) 반영. 변경 항목 ★.

### DEC-S4-01 — drift validator 구현 언어 / 형태 ★

**제안 (research 반영)**:
- 언어: **Node.js (ESM, `"type":"module"`, Node 18+)** — `@mermaid-js/parser` v1.1.0 ESM-only 제약.
- **30분 spike 선행 의무** — `parse('sequenceDiagram', text)` / `parse('stateDiagram', text)` 실제 호출로 grammar 지원 확인 → 지원 안 될 시 `@zabaca/mermaid-validate` 위탁 또는 정규식 fallback.
- **AST 정규화 레이어 의무** — Mermaid `note` / `[*]` / composite state 들여쓰기 / 화살표 라벨 공백 / 결정표 `|` 정렬 / `Y/N` vs `예/아니오` / row 순서 모두 정규형으로 변환 후 비교.
- **출력 schema = oasdiff 모델** — fail/pass ❌ → 항목별 diff list + severity (`breaking`/`non-breaking`/`info`). PR comment 통합 schema 호환.
- **20쌍 corpus self-test 의무** — 의미 동일 10쌍 + 의미 다름 10쌍. validator production 투입 전 self-test 통과 필수.
- 단일 CLI: `npx drift-validator <dir>`.

### DEC-S4-02 — CI 플랫폼 ★

**제안 (research 반영)**:
- **(C) Both** — workflow + local script. 사용자 GH Actions 활성화 여부는 **사용자 결정**.
- **action 핀 명시** — `actions/setup-java@v5` (distribution: temurin) + `actions/setup-node@v6` (npm 자동 cache). runner v2.327.1+ 호환 footnote.
- **이중 모드** — PR 단위 = diff-aware (`SEMGREP_BASELINE_REF=main`) / nightly = full scan. Slack/GitLab/Dropbox/Figma/Shopify/HashiCorp/Snowflake 운영 표준 패턴.

### DEC-S4-03 — static tool 1차 범위 + noise 관리 ★

**제안 (research 반영)**:
- **1차 범위**: Semgrep + PMD. SpotBugs/Daikon/CodeQL 은 v1.2.x 또는 v1.3 후속. runner 인터페이스는 5개 plugin 확장형.
- **출력 포맷 SARIF 통일** — Semgrep `--sarif` + PMD `-f sarif`. GitHub Code Scanning upload 호환 + 룰셋 중복 dedup 용이. JSON 은 plan B.
- **★ noise 관리 (ADR-010 후보)** — `p/java` 통째 적용 시 200~500건 / PMD default 1000+ 폭발 → "static tool 무용론" 안티패턴 자체 재현 위험.
  - **baseline + ratchet**: 첫 run baseline snapshot 저장 (기존 부채 처리) → CI 는 신규 alert 0 만 fail → 매 sprint baseline 1~5% 축소 의무.
  - **first-class ruleset 좁히기**: `p/owasp-top-ten` + 사내 RSA git commit / JWT 길이 custom rule 만 mandatory. 나머지 advisory.
  - **`.semgrepignore` + per-rule severity allowlist** 처음부터 도입.

### DEC-S4-04 — 하네스 차단 + 물증 5종 의무화 ★

**제안 (research 반영)**:
- **이중 안전망 (C 유지)**: schema enum 강제 + grep 스크립트.
- **★ 물증 5종 필드 schema 강제** — `real_tool: true` 자기 표기 검증 불가 / AI "실행했다" 거짓말 detect 불가 → enforcement 필요.
  - (a) `tool_stdout_path` / `tool_stderr_path` (raw log 보존)
  - (b) `tool_version`
  - (c) `invocation_timestamp` + `duration_ms`
  - (d) `result_hash` (SARIF 결과 SHA256)
  - (e) `reproduction_command` (사용자가 그대로 실행 가능)
  - 5종 중 1개 누락 → 자동 simulation 판정 + fail.
- **SARIF 표준 출력 강제** — schema 검증 통과 못하면 fail (raw log 위조 차단). 단, AI raw log 위조까지는 본 sprint scope 아웃 (PoC #03 또는 사내 적용 시 sandbox 격리).
- 시뮬 사용 시 `real_tool: false` + `simulation_reason: <문구>` 명시만 허용 → 신뢰도 -5%p 자동 경고.

### DEC-S4-05 — Sprint 4 산출 위치 / PoC 시범 범위 + decision-table validator 5종

**제안 (research 반영)**:
- **(A) 유지** — 본체 도구만 산출 + PoC #02 decision-tables .json 5건 시범. PoC #02 backfill 은 시퀀스 A 또는 B 에서 흡수. §8.1 단일 PoC 과적합 회피 정합.
- **★ Decision-table validator 5종 (dmn-check 차용)** — `red6/dmn-check` (Apache 2.0) 알고리즘:
  - (1) duplicate rule
  - (2) conflicting rule (UNIQUE hit policy 위반)
  - (3) **gap** (입력 조합 누락) — 본 방법론 BR 형식화 빈약성 직격
  - (4) **overlap** — 자연어로 안 드러남
  - (5) FEEL/type check
- **★ Drift 2종 분리** — drift 0 비현실적:
  - **structural drift** (필드 누락/오타) → **0 목표** 유지
  - **interpretive drift** (자연어 ambiguity 노출) → **finding 등록 후 자연어 보강** = Phase 4.5 본질적 가치 / 환영
- 성공 기준 5번 "drift 0" → "structural drift 0 + interpretive drift 100% finding 등록".

### DEC-S4-06 — 시간 견적 + Phase D 분리 ★ (신규)

**제안 (research 반영)**:
- **시간 견적 1.5x 보정**:
  - Phase B (drift validator): 90 → **150분** (AST 학습 + 20쌍 corpus + spike 30분 포함)
  - Phase C (static runner): 120 → **180분** (ruleset 튜닝 + GH Actions YAML 디버깅 — 첫 run 2~4회 실패 정상)
  - 총: 5.5h → **8h** (단일 세션 ❌ → 2 세션 권장)
- **Phase D (real static tool 1회 실증) 분리** — 환경 의존 (Semgrep/PMD/Java 설치) → **optional sub-goal + carry-over OK**.
  - 환경 부재 시 사용자 위임 + Sprint 5 carry-over 허용.
  - Sprint 4 본 sprint 의 Definition of Done 은 Phase A~C + decision-tables .json 까지 (환경 0 의존).
- **분할 옵션**: Sprint 4-A (drift only ~3.5h) + Sprint 4-B (static only ~3.5h) 2 sprint 분할 가능. 사용자 선택.

---

## 4. 성공 기준 (Definition of Done — research 반영 갱신)

**Mandatory (환경 0 의존 — 본 Sprint 4 DoD)**:
- [ ] `tools/drift-validator/` 산출 — AST 정규화 레이어 + 20쌍 corpus self-test 통과 + oasdiff 식 출력 schema
- [ ] `tools/drift-validator/` 30분 spike 결과 기록 (`@mermaid-js/parser` 두 grammar 지원 여부 + fallback 결정)
- [ ] `tools/decision-table-validator/` 산출 — dmn-check 5종 (duplicate / conflict / gap / overlap / type) 차용
- [ ] PoC #02 decision-tables .json 5건 + drift validator 자가 검증: **structural drift 0 + interpretive drift 100% finding 등록**
- [ ] `tools/static-runner/` 인터페이스 (5 plugin 확장형) + Semgrep + PMD plugin 1차 산출 (실행은 Phase D)
- [ ] Phase 4.5 schema 갱신 — `cross_validation.real_tool` enum + 물증 5종 필드 (stdout/stderr path / version / timestamp+duration / result_hash / reproduction_command)
- [ ] `tools/static-runner/lint-no-simulation.sh` 5종 물증 grep 검증 + `simulation_only: fail` 게이트
- [ ] `.github/workflows/drift-check.yml` (action 핀: setup-java@v5 + setup-node@v6) + 이중 모드 (PR diff-aware / nightly full) + README local 실행 절차
- [ ] STATUS.md 갱신 (`v120_bundles_ready: 16`, `이중_렌더링_정합: 100%`, 신뢰도 80-87% 정직 표기 — 진짜 도구 미실행 시)
- [ ] DEC-2026-04-XX-sprint-4-종결.md + ADR-010 후보 (baseline+ratchet) 등록 + INDEX.md 갱신
- [ ] SESSION-WRAPUP-2026-04-XX-sprint4.md 작성

**Optional (Phase D — 환경 의존 / carry-over OK)**:
- [ ] Semgrep + PMD 실제 1회 실행 + SARIF 출력 + 신뢰도 90-95% 측정 / 또는 "환경 부재 — 사용자 위임" 정직 보고

---

## 5. 위험 / 제약

| 위험 | 영향 | 완화 |
|---|---|---|
| Semgrep / PMD 사용자 환경 미설치 | static runner 동작 검증 불가 → 90-95% 신뢰도 미달성 | 사용자에게 설치 위임 또는 CI 환경 (Docker 이미지) 산출 → 명시. 시뮬 신뢰도 사용 절대 금지. |
| `@mermaid-js/parser` 미지원 syntax (예: stateDiagram-v2 의 fork/join) | drift validator 정확도 ↓ | 정규식 fallback + 미지원 케이스 명시 보고 |
| GitHub Actions 미사용 환경 | CI 자동 차단 미동작 | local script 동등 산출 (DEC-S4-02 (C)) |
| decision-table .json schema 변환 시 자연어 4 항목 ↔ 형식화 5 항목 매핑 모호 | finding-system 신규 finding 발생 가능 | drift validator 가 명시적 detect → finding 등록 (Sprint 4 자기 검증) |
| 본 sprint 자체에서 시뮬레이션 유혹 (외부 도구 미설치 시) | ★★★ 절대 금지 위반 | "동작 안 함" 정직 표기 + 사용자에게 환경 위임 명시 |

---

## 6. 4원칙 정합 체크

- **1원칙 (plan)**: 본 문서 ✅. 관련 파일 11건 (Explore 보고서) 전수 조사 완료.
- **2원칙 (research)**: ✅ 완료 — `research-c-sprint-4.md`. 3 agent 병렬 (Document 공식 docs / 테크기업 사례 / Senior Engineer) 가벼운 sub-agent 전략 (Case 생략 + 시간 cap 8/8/10분). 6 수렴 항목 plan 반영.
- **3원칙 (사용자 승인)**: research 완료 후 §3 5건 일괄 승인 패턴.
- **4원칙 (revert)**: drift validator 또는 static runner 구현 실패 시 plan.md 의 Lessons Learned 섹션 추가 + 1원칙 재시작.

---

## 7. Lessons Learned (작성 예정 — Sprint 4 종결 시)

(공란 — Sprint 4 진행 중 발견되는 함정/실패 기록)

---

## 8. 참조

- `decisions/STATUS.md` — 현재 상태
- `decisions/DEC-2026-04-29-static-tool-실행-의무화.md` — 묶음 O 원본
- `decisions/DEC-2026-04-30-v1.2.0-격상.md` — N+O 후속 명시
- `examples/poc-02-realworld-springboot3/.claude/SESSION-WRAPUP-2026-04-30-sprint3.md` — 직전 sprint 상태
- `methodology-spec/workflow/phase-4-5-formal-spec.md` — Phase 4.5 정식 명세
- `schemas/formal-spec.schema.json` — drift validator 가 참조할 schema
- memory `feedback_no_static_tool_simulation.md` — ★★★ 절대 원칙
- memory `feedback_lightweight_sub_agent.md` — Phase B/C 적용
