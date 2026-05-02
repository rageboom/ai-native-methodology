# plan-v144-manifest-ssot.md

> **상태**: 작성 완료 / 사용자 결단 대기 (D-A ~ D-E 5건)
> **작성**: 2026-05-02 / **실행 대상**: v1.4.4 PATCH
> **24h cooling-off**: 본체 구조 변경 비중 낮음 (검증 도구 + 명세 정합 위주, file rename 0건). cosmetic 적용.

## 본 plan 의 가치 명세

**a — manifest SSOT 정식 승격 + workflow ↔ skills naming drift 정합 + drift-validator 3-way 검증 강제**.

본체 구조 변경 ❌ / file rename ❌ / phase 번호 체계 변경 ❌. **측정 가능한 bug 수정만**. b (rename + alias map) 는 v2.0 carry — 본 plan 안에서 작성 ❌.

## 배경 — 3 에이전트 토론 결과 (2026-05-02)

직전 conversation 에서 6 결단 거리 (D1 ID naming / D2 PoC 호환성 / D3 display 번호 / D4 manifest validator / D5 drift cleanup / D6 deliverable 번호) 에 대해 Official + Industry + Senior 3 관점 병렬 토론 완료.

**합의 (만장일치)**: D2 (PoC 보존) / D3 (UI only) / D4 (drift-validator 확장) / D5 (분리 PR).
**충돌**: D1 (semantic vs track-prefix) / D6 (manifest vs integer).
**Senior 메타 권고**: rename (b) 은 v2.0 carry — §8.1 단일 PoC 과적합 회피 정책상 본 rename 의 corroboration = 0건 / v2.0 design/test stage PoC 진입 시 자연 충족.

본 plan 은 Senior 의 NOW/v2.0 분할 권고의 **NOW 부분**.

## 사전 조사 finding (★ ★ ★ Senior agent 가 짚은 measurable drift 의 진짜 모습)

### F-1 — manifest 의 phase ID 와 workflow 파일명은 정합

`flows/analysis.phase-flow.json` 의 phase id = `["0", "1", "2", "3", "4", "4.5", "5-1", "5-2", "6"]`. workflow 의 `phase-{id}-*.md` 파일명과 정확히 일치. **workflow = manifest 의 진실 view ✅**.

### F-2 — skills 디렉토리는 다른 의미 axis

| Phase ID (manifest) | workflow 파일명 | skills 디렉토리명 | 정합 |
|---|---|---|---|
| 0 | phase-0-input.md | phase-0-input/ | ✅ |
| 1 | phase-1-init.md (inventory 우산) | phase-1-inventory/ | ✅ (의미 동일) |
| 2 | phase-2-db.md | **phase-2-architecture/** | ❌ |
| 3 | phase-3-arch.md | **phase-3-domain/** | ❌ |
| 4 | phase-4-business-logic.md | phase-4-rules/ | △ (sub-area) |
| 4.5 | phase-4-5-formal-spec.md | phase-4-5-cross-validation/ | △ (sub-area) |
| 5-1 | phase-5-1-api.md | phase-5-openapi/ | △ (sub-area) |
| 5-2 | phase-5-2-ui.md | phase-5-state-map/, -visual-manifest/, ... | △ (sub-area 다중) |
| (없음) | (없음) | phase-5-form-validation/, -rules/, -schema-erd/, -type-spec/ | ★ FE 트랙 신규 |
| 6 | phase-6-quality.md | phase-6-quality/ | ✅ |

→ 가설: **skills 의 phase 번호는 phase ID 가 아니라 phase 의 sub-area / 자매 skill 그룹 axis**. 즉 phase-4-rules = "phase 4 의 rules 영역 skill". 단 phase-2/3 의 ❌ 는 진짜 drift (DB skill 부재 + arch skill 부재). 두 가지가 섞인 상태.

### F-3 — manifest 자체 stale

manifest version = `v1.2.2` / 현재 plugin = `v1.4.3`. **v1.4 FE 트랙 진입 시 신규 phase 미반영**:
- skills/analysis/phase-5-form-validation/ — manifest 부재
- skills/analysis/phase-5-state-map/ — manifest 부재
- skills/analysis/phase-5-type-spec/ — manifest 부재
- skills/analysis/phase-5-visual-manifest/ — manifest 부재

→ SSOT 가 stale 인 상태로 SSOT 승격 정책 깔면 **자가 모순**. 본 plan 안에서 manifest 갱신 의무.

### F-4 — drift-validator 절반 이미 깔려 있음

`tools/drift-validator/src/normalize-phase-flow.js` 에 이미:
- L15-16: phase id 정규화 (`"4.5"` / `"5-1"` 보존 명시)
- L36-57: JSON manifest 정규화 (`detectPhaseFlowJson` + `normalizePhaseFlowJson`)
- L59-115: Mermaid normalize (subgraph + edge)
- L117-129: 라벨 robust 추출 (`Phase 4.5 — ...` 패턴) + subgraph id fallback

→ SSOT 강제 정착 시 **자연 활용**. 신규 코드는 manifest ↔ skills 디렉토리 매핑 검증만 추가.

## 결단 거리 (★ ★ ★ 사용자 결단)

### D-A — SSOT 정의

| 선택지 | 의미 | 권고 |
|---|---|---|
| A1 | workflow + skills 둘 다 진실 / manifest = 둘의 합집합 표기 | ❌ — drift 재발 보장 |
| A2 | manifest 가 단일 SSOT / workflow + skills = derived view | △ — 강제 가능하나 skills 의 sub-area axis 가 manifest 안 표현 어색 |
| **A3** | **workflow = phase ID SSOT** (manifest 와 1:1) / **skills = phase ID 의 sub-area axis 분리** | ✅ Senior + Industry (k8s `name` vs `spec.versions[]`) 정합 |

**권고**: A3. workflow phase 번호 ↔ manifest phase ID 1:1 정합 / skills 디렉토리는 별도 axis (각 skill 이 manifest 의 어느 phase 에 속하는지만 frontmatter `phase` 필드로 선언).

### D-B — manifest 갱신 시점

| 선택지 | 의미 |
|---|---|
| **B1** | **본 plan 안에서 manifest 갱신** — v1.2.2 → v1.4.4 / FE 트랙 phase 반영 |
| B2 | 별도 PR — 이번 plan 은 BE 트랙 정합만 |

**권고**: B1. SSOT stale 인 채 SSOT 정책 깔면 자가 모순.

### D-C — drift-validator 강제 시점

| 선택지 | 의미 |
|---|---|
| **C1** | **plan 안 같은 PR** — 정합 + validator + CI 강제 한 번에 |
| C2 | validator 별도 follow-up |

**권고**: C1. ratchet 까지 한 번에 안 가면 정합 후 다시 drift 만들 위험.

### D-D — skills 디렉토리 의미 axis 명문화

| 선택지 | 의미 |
|---|---|
| **D1** | **`methodology-spec/skills-axis.md` 신설** — phase ID + sub-area axis 분리 정책 명문 |
| D2 | `skills/analysis/README.md` 안에 정책 추가 |
| D3 | 명문화 ❌ — drift-validator 안에 매핑만 |

**권고**: D1. 명세 schema-first 정합 — 명문 ❌ 시 drift 재발 + 신규 skill 추가 시 매번 재발견 비용.

### D-E — Lessons Learned 활성 trigger

본 plan 실패 시 revert 판정 trigger:
1. 본체 PoC 산출물 안 phase 인용 (예: `F-FE-004` 안 "Phase 4.5") 깨짐 → 즉시 revert
2. drift-validator CI false positive 폭증 (≥3 false positive 24h 안) → revert
3. 사용자 dogfooding 시 phase 번호 혼동 신호 (예: skill 발동 시 phase 명시 오류) → revert

→ 발생 시 24h 안에 revert + Lessons Learned 섹션 갱신 + 재진입 결단 별도.

## 산출물 (v1.4.4 PATCH)

| # | 파일 | 변경 | rename |
|---|---|---|---|
| 1 | `flows/analysis.phase-flow.json` | v1.2.2 → v1.4.4 / FE 트랙 phase 추가 / skills 매핑 명시 | ❌ |
| 2 | `methodology-spec/skills-axis.md` | 신설 (D-D = D1 시) | ❌ |
| 3 | `tools/drift-validator/src/check-phase-skills.js` 등 | manifest ↔ skills 매핑 검증 신규 + test | ❌ |
| 4 | `.github/workflows/drift-check.yml` | 3-way 검증 강제 ratchet | ❌ |
| 5 | `CHANGELOG.md` | v1.4.4 entry | ❌ |
| 6 | `README.md` / `CLAUDE.md` | SSOT 정책 1줄 ("phase 순서 = manifest SSOT") | ❌ |
| 7 | `.claude-plugin/plugin.json` / `package.json` | v1.4.3 → v1.4.4 | ❌ |

**합계**: 신규 ~2 / 갱신 ~6 / **rename 0**.

## 영향 범위 — file rename 0 검증

본 plan 은 phase 번호 체계 자체에 손대지 않음. `flows/analysis.phase-flow.json` 의 phase id 배열 (`"0" / "1" / ... / "4.5" / "5-1" / "5-2" / "6"`) 그대로 보존. workflow 파일명 그대로. skills 디렉토리명 그대로. 따라서 모든 cross-reference (README / CHANGELOG / ADR / decisions / examples PoC 산출물 / dist) **변경 0건**.

→ b (rename) 와 본질적으로 다른 cost profile. b 는 cross-reference 치환이 ~수백 개 / a 는 0개.

## 4원칙 trace

- **§1 깊은 숙지**: 본 plan = 깊은 숙지 산출. F-1~F-4 는 코드 grounded.
- **§2 3 에이전트 토론**: 직전 conversation 의 Official + Industry + Senior 토론 결과 = research 자산. 본 plan 안에 합의/충돌/Senior 권고 인용. 별도 `research-*.md` 작성 ❌ (Senior 가 file path + line number grounding 까지 완료한 상태 / lightweight 전략 정합).
- **§3 사용자 승인**: 본 plan 완성 = 사용자 결단 5건 (D-A ~ D-E) 일괄 제출 시점.
- **§4 실패 → revert**: D-E trigger 3건 정의됨.

## b (rename) 와의 관계 — 명시적 carry

본 plan 은 b 의 **전제조건**:
- a 후 manifest = 정식 SSOT / drift-validator = 강제 / workflow + skills 정합
- 이 상태에서 b 의 rename 비용이 떨어짐 (manifest 한 줄 + drift-validator 자동 catch)

**b 의 plan.md 는 본 plan 안에서 작성 ❌**. a 코드 완료 후 별도 작성 — cooling-off + a 의 효과를 보고 b 의 plan 결단.

## Lessons Learned (★ 코드 착수 후 갱신 — 2026-05-02)

### 사전 가정 (F-1 ~ F-4) 검증 결과

| Finding | 사전 가정 | 검증 결과 |
|---|---|---|
| F-1 | manifest = workflow 정합 | ✅ 입증 — `flows/analysis.phase-flow.json` 의 phase id 배열 ↔ `methodology-spec/workflow/phase-*.md` 파일명 1:1 |
| F-2 | skills 가 다른 axis | ✅ 정확 — skills 의 phase 번호 = 산출물 번호 prefix axis. 18 skills (14 phase + 4 aspect) 모두 manifest 매핑 가능 / 0 orphan + 0 missing |
| F-3 | drift-validator 절반 깔려 있음 | ✅ 입증 — `normalize-phase-flow.js:15-16, 117-129` 에 phase id 정규화 + label robust 추출 코드 존재. 신규 layout 검증은 별도 module (`check-phase-skills.js`) 로 분리 (책임 분리) |
| F-2-extension | manifest 자체 stale | ✅ 입증 — `version: v1.2.2` (plugin 현재 v1.4.3 — stale). v1.4 FE 트랙 신규 skill 4개 manifest 미등록 → 본 PATCH 갱신 |

### 추가 발견 (★ 본 plan 사전 조사 누락 / b 또는 별도 작업 carry)

**1. CHANGELOG v1.2.1 entry 의 "drift-check.yml CI" 가 plan 정의만 / 실 구현 부재** — `.github/workflows/` 디렉토리 자체 없음. 본 plan 본문이 "ratchet 강화" 라고 적었으나 실제는 ★ 신설 ★. Senior 가 짚은 "측정 가능한 drift" 의 또 한 갈래. → 본 PATCH 에 흡수 신설 완료.

**2. CLAUDE.md drift** — 두 군데 존재하고 sync 안 됨:
- `/ai-native-methodology/CLAUDE.md` — git repo root / 사용자 dev 환경 SessionStart 컨텍스트
- `/ai-native-methodology/ai-native-methodology/templates/adoption/CLAUDE.md` — build artifact source / dist root 의 CLAUDE.md 별칭 source

본 PATCH 에서는 git repo root 의 CLAUDE.md 만 갱신 (skills-axis + manifest SSOT 정책 한 줄 추가). `templates/adoption/CLAUDE.md` 는 미갱신. 두 CLAUDE.md 정책 sync 정책 부재 = 향후 drift 위험. → **carry — b 또는 별도 작업**.

### 진행 cadence 결과

- plan.md 작성 → 사용자 결단 일괄 → 코드 착수 → 검증 → Lessons Learned 갱신 = 같은 conversation 안 진행. 24h cooling-off 적용 ❌ (본 plan 본문의 cosmetic 적용 가능 결단 정합).
- 본 plan 의 cost profile (file rename 0 / cross-reference 치환 0 / 신규 file 3 + 갱신 ~6) 가 "본체 구조 변경" 보다 "validator 확장 + 명세 정합 + 측정 가능한 bug 수정" 에 가까운 점이 cosmetic 적용 정합의 근거.

### 실행 결과 수치

- npm test (drift-validator): 33 → **36** test pass (+3 = check-phase-skills.test.js)
- layout check: ✅ 9 phases / 18 skills declared / 0 orphans / 0 missing
- npm run build: 216 → **219** files (+3 = check-phase-skills.js + check-phase-skills.test.js + skills-axis.md)
- version-check: ✅ 3-way sync at v1.4.4
- working tree 변경 14건: workspace 안 12 + workspace 외부 2 (CLAUDE.md + .claude/settings.local.json)

### revert trigger 발동 여부

D-E 의 3 trigger (PoC 산출물 phase 인용 깨짐 / drift-validator CI false positive 폭증 / 사용자 dogfooding 시 phase 번호 혼동) → **0건 발동**. Lessons Learned 영구 보존 + revert ❌.

## 다음 step

- (★ 완료) 사용자 결단 5건 (D-A ~ D-E) 확정 → 코드 착수 → 검증 → Lessons Learned 갱신.
- (다음) commit + push → v1.4.4 PATCH release 종결.
- (carry) b (rename) 의 plan.md 작성 — v2.0 design/test stage PoC 진입 시점 / 또는 사용자 명시 결단 시.
- (carry) CLAUDE.md drift sync 정책 — 별도 작업.
