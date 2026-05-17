# plan-skill-l3-audit.md

> 47 SKILL.md 의 L3 = 본격 품질 감사 + 공식 docs 산업 비교.
> 사용자 발화: "나의 스킬들을 분석해 보고 싶다" → 축="품질 감사 (citations / drift / SSOT)" → 깊이="L3 + 산업 비교".
> 본 plan = Work Principles 1원칙 산출물 (감사 자체의 methodology).

---

## §0. 작업 컨텍스트 (2026-05-18)

- 47 SKILL.md (`ai-native-methodology/skills/<name>/SKILL.md`).
- 직전 release v8.4.0 (시뮬레이션 corroboration #2 + F-SIM-12~16 carry).
- `plugin-authoring-spec.md §7` compliance matrix 가 S1/S2/S3/S6 = ✅ 결정적 검증.
- `release-readiness` 13/13 ready + `skill-citation-validator` 0 stale + drift-validator 3-way green.
- ★ L3 의 value-add = **이미 green 인 결정적 validator 가 잡지 못하는 잔여 risk**.

---

## §1. Goal (★ ★ 단일 목표 / Plan A 확정 2026-05-18)

> 47 SKILL.md 의 **현 validator 사각지대** 를 찾아 F-SKILL-* finding ledger 신설 + 사용자 결단 prompt.
>
> ★ ★ **본 session 종결 paradigm = Plan A (감사만 / report 산출만)**. F-SKILL-* finding 등재는 본 session, ★ 시행 (코드/스키마/skill 본문 변경) = 다음 session carry (cooling-off 24h 정합 / `feedback_decision_cadence_24h_cooling_off`).

- ✅ **In-scope**: S4 (단일 책임) / S5 (imperative voice) / S7 (disable-model-invocation) / S8 (5000 토큰 self-contained / progressive disclosure 질) / description-vs-body semantic 정합 / 의미적 citation 정합 / inter-skill 일관성 / 공식 docs 권장 패턴과의 산업 gap.
- ❌ **Out-of-scope** (이미 결정적 검증 / 재확인만):
  - S1 ≤500 line (47/47 PASS).
  - S2 description ≤1536c + trigger form (47/47 PASS).
  - S3 lowercase+hyphen (8 `_base-*` documented-exception 외 47/47 PASS).
  - S6 frontmatter keys (47/47 PASS).
  - SKILL.md citation bare-existence (skill-citation-validator 0 stale).
  - §6 docs pin staleness (#12 60일 가드).

---

## §2. Phase 분해 (5 phase / 직선 / parallel sub-agent 활용)

### Phase A — Inventory & Structural Extraction (1원칙 deep-read)

- 47 SKILL.md 전수 frontmatter + section heading + 본문 첫 5000 토큰 자동 추출 → `audit-inventory.json` (도구 = node CLI 1회용 스크립트, 산출물 휘발).
- 컬럼 추출: `name`, `description`, `description_length`, `allowed_tools`, `body_line_count`, `first_token_self_contained_score` (heuristic), `cite_count`, `imperative_ratio` (heuristic), `cross_skill_refs[]`.
- ★ no-simulation 정합 — heuristic 결과는 명시적 "heuristic" 표기 (정확 결정 ❌).

### Phase B — Internal Consistency Audit (★ sub-agent 4 parallel / lightweight 전략)

각 sub-agent = 47 skill 중 ~12 skill 할당 (8 base + 39 stage = 47 / 4 분할). 각 sub-agent 가 본격적으로 다음 7 축 점검:

1. **B-1 description ↔ body**: description 의 trigger 키워드 + use-case 와 본문 절차가 의미적으로 정합? (description = "use when X" 인데 본문 = X 와 무관 = 결함).
2. **B-2 description 키워드 trigger 품질**: 자연어 사용자 발화 (예: "schema 추출해줘", "i18n 분석") 에 description 이 fire 할 만한 키워드 포함? (LLM 모델 추론 / decisional ❌).
3. **B-3 단일 책임 (S4)**: composite skill 흔적 (2+ 산출물 / 2+ phase 연쇄) 식별.
4. **B-4 imperative voice (S5)**: 본문 음조 ratio 산정 (서사형 ↔ imperative).
5. **B-5 progressive disclosure 질 (S1+S8)**: 본문이 자체 길어 ≤500 만 만족인지 / out-of-tree reference 분리 적절성 / 첫 5000 토큰 self-contained 정도.
6. **B-6 cross-skill 일관성**: stage 별 family (analysis-* / planning-* / spec-* / test-* / implement-*) 내 어조·구조·section 헤더 패턴 일치 여부.
7. **B-7 citation 의미 정합**: SKILL.md 의 `[[file.md]]` / `methodology-spec/<x>.md` 인용 file 이 실제로 본문이 주장하는 내용 보유? (bare-existence ❌ / dead-link ❌ 는 이미 검증).

### Phase C — Industry Benchmark (★ `_base-official-docs-checker` F-015 1 호출)

- Anthropic 공식 Claude Code skill docs (`https://code.claude.com/docs/en/skills`) 의 권장 패턴 + best-practice 재추출.
- §6 pin baseline (2026-05-17 / digest `b8b2376312b0`) 와 diff (1일 lag — 의미적 변화 없음 가설).
- ★ "권장이나 본 plugin 미적용" 패턴 식별 → 본 plugin 자기 개선 후보:
  - 가설 1: `model` frontmatter — 비싼 작업 (analysis-quality-antipattern / implement-generate-impl-spec) 에 Opus 명시 / 단순 작업 (`_base-log-finding`) Haiku 명시 권고.
  - 가설 2: progressive disclosure — 본문에 reference 직접 embed vs `references/` 분리.
  - 가설 3: `disable-model-invocation` (S7) — side-effect skill (impl/test 생성·실행) 후보.
  - 가설 4: 공식 docs 변경 가능 (1일 lag) — drift 재검 권장.

### Phase D — Finding Consolidation (F-SKILL-* namespace 신설)

- ID pool: `F-SKILL-001` ~ `F-SKILL-NNN` (id-conventions.md `F-XXX-PREFIX` 패턴 정합).
- severity 분류: `critical` / `high` / `medium` / `low` / `info`.
- `methodology-spec/finding-system.md` 에 F-SKILL namespace 등재 (carry / additive).

### Phase E — Report Output (★ 사용자 검토용)

- `audit-skill-l3-report.md` (markdown / severity heatmap + skill 별 5×7 매트릭스).
- 산출물 위치 = `.claude/plans/` 옆 임시 산출 (예: `.claude/plans/audit-skill-l3-report.md`).
- 사용자 묶음 결단 prompt — 시행 후보 P0/P1/P2 + breaking/additive 분류.

---

## §3. Sub-Agent Dispatch 전략 (lightweight `feedback_lightweight_sub_agent`)

| dispatch | subagent_type | 입력 | 산출 | 시간 cap |
|---|---|---|---|---|
| D1 (Phase B-1~B-7 / 12 skill) | `general-purpose` | 47 skill 중 12 (base 5 + analysis-architecture/domain-model/business-rules/openapi/db-schema/business-rules-related 7) | `B-shard-1.md` | 15분 |
| D2 (Phase B-1~B-7 / 12 skill) | `general-purpose` | analysis-aspect-* / analysis-from-* / analysis-input-* 12개 | `B-shard-2.md` | 15분 |
| D3 (Phase B-1~B-7 / 11 skill) | `general-purpose` | analysis-quality-antipattern + analysis-ui-* + analysis-form-* + analysis-html + analysis-error-mapping + analysis-sql + analysis-br-cross-consistency-check + analysis-characterization-test + analysis-source-inventory + analysis-formal-spec-validation + analysis-api-rule-mapping | `B-shard-3.md` | 15분 |
| D4 (Phase B-1~B-7 / 12 skill) | `general-purpose` | planning-* (3) + spec-* (3) + test-* (3) + implement-* (3) = 12 chain skill | `B-shard-4.md` | 15분 |
| D5 (Phase C / 공식 docs) | `ai-native-methodology:_base-official-docs-checker` | `https://code.claude.com/docs/en/skills` (+ 공식 examples 페이지) | `C-official-docs.md` | 10분 |
| D6 (Phase C / 산업 사례) | `ai-native-methodology:_base-industry-case-researcher` | OSS plugin skill 사례 (Anthropic 공식 plugins-public / Claude Code marketplace 사례 1~2) | `C-industry-case.md` | 10분 |
| D7 (Phase D / Senior 양심 점검) | `ai-native-methodology:_base-senior-engineer` | D1~D6 종합 → severity 격상/격하 + §8.1 단일 PoC 과적합 회피 enforcement | `D-senior-conscience.md` | 10분 |

- 병렬: D1~D6 = 1 message 6 dispatch (parallel). D7 = D1~D6 종합 후 직렬.
- ★ `_base-` agent 가 invoke 가능 (DEC-2026-05-17-base-prefix-documented-exception 정합).

---

## §4. 산출물 (★ 본격 + 휘발 분류)

| 산출물 | 위치 | 본격/휘발 | 비고 |
|---|---|---|---|
| `plan-skill-l3-audit.md` | `.claude/plans/` | 본격 (LL 보존) | 본 파일 |
| `research-skill-l3-audit.md` | `.claude/plans/` | 본격 (LL 보존) | Phase C+D 종합 |
| `audit-inventory.json` | `.claude/plans/` 또는 `/tmp/` | 휘발 | Phase A 자동 추출 |
| `B-shard-{1..4}.md` | `.claude/plans/` | 휘발 | sub-agent 산출 (종합 후 삭제 OK) |
| `C-official-docs.md` / `C-industry-case.md` / `D-senior-conscience.md` | `.claude/plans/` | 휘발 | sub-agent 산출 |
| `audit-skill-l3-report.md` | `.claude/plans/` | ★ ★ 본격 (사용자 검토 input) | Phase E 최종 |
| `methodology-spec/finding-system.md` (F-SKILL namespace 등재) | 본체 | ★ ★ ★ 본격 (carry / additive) | Phase D 결과 promotion |

---

## §5. 검증 ladder (★ 본 audit 자체의 품질 보증)

1. **L0 — Phase A node 스크립트 self-test**: 47 skill 각각에 대해 frontmatter / body / heading 추출 동작 확인.
2. **L1 — Phase B sub-agent 결과 일관성**: 4 shard 의 동일 axis 결과를 cross-check (예: D1 의 "imperative ratio" 분포 vs D2 의 분포 = 같은 scale).
3. **L2 — Phase C 공식 docs F-015**: §6 pin digest 와 실 fetch 결과 diff (digest 같으면 skip).
4. **L3 — Phase D Senior 양심**: 단일 sub-agent 의 over-claim 식별. §8.1 corroboration ≥ 2 충족 확인.
5. **L4 — 사용자 묶음 결단 (3원칙)**: 시행 후보 P0/P1/P2 정렬 후 사용자 prompt. 본 plan 종료.

---

## §6. Risk / Trap (사전 식별)

- **R1 — Heuristic 가 결정 false-positive 양산**: imperative ratio / first-5000 토큰 self-contained-score 등 heuristic 은 신뢰도 medium 이하. Senior 양심 (D7) 으로 격상/격하.
- **R2 — sub-agent 학습 코퍼스 의존 (F-015)**: D5/D6 가 공식 docs 를 학습 코퍼스 기반 회상 시 cross-validation 무력. raw fetch 의무화 (F-015 cross-validation 패턴).
- **R3 — 14 (또는 N) finding 양산 → spec quality 의심 (F-021)**: 20+ 시 spec quality 의심 트리거. 본 audit 의 finding 임계 = ≤ 15 정상 / 20+ 시 자기 식별 + reset 권고.
- **R4 — §8.1 단일 PoC 과적합**: 1 skill 만 본 발견 = 격상 ❌ / ≥ 2 skill corroboration 의무.
- **R5 — Breaking 후보 양산 risk**: P2 (예: skill rename / frontmatter 변경) 가 다수 = release 시 MAJOR. cooling-off 24h (feedback `decision_cadence_24h`) 적용 후 결단.
- **R6 — 1일 lag docs drift**: 공식 docs 2026-05-17 → 2026-05-18 (1 day). 의미적 변경 가설 ❌ / D5 가 실측.

---

## §7. Lessons Learned (★ 사후 채움 / 본 audit 시행 후)

(시행 후 본 섹션에 LL-skill-audit-NN 등록)

---

## §8. 직선 일정 (★ 사용자 cadence "한 번 의 session 안 종결" 추정)

1. **본 plan 완성** ✓
2. **research.md 완성** (D1~D7 dispatch 결과 종합) — 약 30~60분
3. **사용자 묶음 승인** (3원칙) — 본 audit 본격 시행 가/부
4. **Phase A~E 시행** — 약 60~120분
5. **Phase E 사용자 결단 prompt** — 시행 후보 P0/P1/P2 정렬
6. **(승인 시) carry / commit / push** — finding ledger F-SKILL-* 등재 + breaking 후보 별도 plan
