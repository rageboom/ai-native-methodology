# DEC-2026-05-17-skill-citation-integrity

- **상태**: 승인 ( 사용자 "내용 로직도 확인 가능한가" → A → "수정 + validator 도구화" / additive enforcement / v8.1.0 MINOR)
- **일자**: 2026-05-17 ( session 26차 후속 / v8.1.0 MINOR)
- **결정자**: 윤주스 (TF Lead) — "A: 내부 정합 결정적 검사" + "수정 + validator 도구화 (추천)"
- **관련**: ADR-PLUGIN-001 §7 patch v2 (R18 내부정합 enforcement) / DEC-2026-05-17-plugin-authoring-spec (R18 origin) / DEC-2026-05-17-skill-name-rename (직전 v8.0.0) / formal-spec-link-validator (dead-reference 동형 선례) / ADR-009 (no-simulation)

---

## 컨텍스트

"skill이 표준 정합이냐" 답변 후 사용자 **"내용 로직이 좋은가도 확인 가능한가?"**. 3계층 정직 분류 제시 — A(내부 정합 결정적 / 가능) / B(경험적 PoC corroboration / 이미 부분) / C(설계 품질 / 증명 불가 = ADR-009 simulation). 사용자 = **A** 선택 → 결과 보고 후 **"수정 + validator 도구화"** 결단.

A = "skill이 인용한 schema/repo-path/ADR/DEC 가 실존하나" 결정적 검사. C(지시 설계가 잘 됐나)는 본질 증명 불가 / 본 결단 scope ❌ (정직 명시).

## 결정

### §1. 발견 (결정적 스캔 / ground truth 삼중 대조 / LL-i-55)

- 47 SKILL.md 전수 스캔 → 휴리스틱 37 raw → ground truth(schemas/·deliverables/·workflow/·decisions/·docs/adr/·templates/) 대조.
- **실결함 37 stale dead-link / 14 skills 확정**. 원인 = doc 재구조화 미전파:
  - deliverables 재번호 (`04-rules.md`→`5-business-rules.md` / `08-state-map.md`→`8-state-map.md` / `06-finding-list.md`→`6-antipatterns.md` 등)
  - workflow `phase-N`→semantic (`phase-4-5-cross-validation.md`→`formal-spec.md` / `phase-5-2-*`→`ui.md`)
  - schema `-spec`·`-spectrum` 접미 4종 (`a11y.schema.json`→`a11y-spec.schema.json` 등)
  - v7.0.0 `rules.schema.json`→`business-rules.schema.json`
  - template (`rules.template.json`→`rules.template.md` / `openapi.template.yaml`→`openapi-extension.template.json`)
  - ADR 정확명 (`ADR-CHAIN-001.md`→`ADR-CHAIN-001-chain-4-stage-enforcement.md`)
- 기존 validator 전 사각 — drift-validator=flows / formal-spec-link-validator=chain 산출물 / SKILL.md 산문 인용 무검증. A 검사가 진짜 사각지대 노출.
- false-positive 정확 분리 (LL-i-55) — `implement-react-18`·`-svelte`·`-vue-2`(미존재 carry 정확 기술) / `planning-extraction-validator`(tool) / DEC `.md` 접미 / `ADR-007 부재`(의도적) = 무수정.

### §2. 시행 ( additive enforcement + 비-breaking dead-link 수정)

- **신설** `tools/skill-citation-validator/` (npm workspace 17번째 / cli + check-citations + test + README) — schema/repo-path/ADR(부재-context 제외)/DEC(.md 정규화) 실존 결정적 검사. AI 추론 0% (정규식+existence / no-simulation). scope = low-FP class만 (skill·tool 이름 backtick = drift-validator·manifest 이미 커버 / FP 높음 → 제외 / Senior F3 신뢰 gate).
- **수정** 14 SKILL.md / 20 인용 — ground truth 정밀 target (추정 ❌). 비-breaking (내부 doc cross-ref / command-surface·schema 계약 ❌).
- **`scripts/release-readiness.js` check #13** (`skill_citation_integrity`) — 12/12 → **13/13**. 향후 doc 재구조화 시 SKILL.md stale 인용 release gate 자동 차단 (양심 비의존 / precedent #10 R2·#11 A1·#12 R18).
- **버전 trio** 8.1.0 + CLAUDE.md sync (tools 16→17·"plugin.json v8.1.0" check#10·12→13/13).

### §3. 정직한 범위 명시 (사용자 질문 정합)

- 본 검사 = **A (내부 인용 실존 / 결정적)**. "skill 지시가 잘 설계됐나"(C) = 증명 불가 / scope ❌.
- B (경험적) = 기존 release-readiness 11 PoC + workspace 393 + chain validator 가 이미 부분 답 (skill 출력물이 진짜 validator 통과). 70~80% 한계 = 방법론 자체 정직 cap 그대로.

---

## 회귀 검증

- skill-citation-validator **0 stale** (dogfood green / exit 0) + test **2/2** (regression-guard + synthetic + FP 필터)
- release-readiness **13/13** (A1 본격 spawn) + release-readiness.test.js 13 갱신 + version-check 3-way 8.1.0
- workspace test green / drift-validator 3-way 불변 (flows/skills/agents 무수정 = 안전) / chain harness validated 본질 보존
- breaking ❌ (validator·check 신설 = additive / SKILL.md 인용 수정 = 비-breaking 내부 dead-link)

---

## Lessons Learned

- **LL-i-59 (후보)** — "내용 로직 검증 가능한가"에 정직 3계층(A 결정적/B 경험적/C 증명불가) 분류 제시 = ADR-009 no-simulation 정합 (C를 "good" 도장으로 위장 ❌). A 가 기존 validator 전 사각(SKILL.md 산문 인용)을 노출 → 신규 결정적 validator 자산화. doc 재구조화는 반드시 산문 인용 dead-link 를 남기므로 (deliverables/workflow/schema/v7.0.0 rename 4중 누적) release gate 화 의무. dogfood = validator 가 자기 신설 시점에 자기 repo 0 finding 입증 (v1.4.4 메타 정합 계보).
- **LL-i-55 정합** — 휴리스틱 37 raw 를 mass-fix ❌ → ground truth 삼중 대조로 false-positive(carry skill·tool·DEC.md·ADR 부재) 정확 분리 후 14 file 정밀 수정. "추정 수정"이 가장 큰 함정.

---

## 출처

- 사용자 질문 + 결단 (session 26차 후속 / "내용 로직 확인 가능한가" → A → "수정 + 도구화" / 2026-05-17 / AskUserQuestion ×2)
- 실측 — 47 SKILL.md 스캔 + ground truth (schemas/ 39 · deliverables/ 24 · workflow/ 11 · decisions/ · docs/adr/ · templates/analysis/) 삼중 대조
- 선례 — formal-spec-link-validator (dead-reference 동형) / ADR-009 (no-simulation / C=simulation 증거 ❌) / Senior F3 (content-aware gate 신뢰)
