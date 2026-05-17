# plan-v85-p1-batch.md

> v8.5.0 MINOR — P1 9 finding batch (audit-skill-l3-report.md 의 P1 priority tier).
> 사용자 발화: "다음 session 진입은 어떤 의제로?" → "A. P1 9 finding batch (v8.5.0 MINOR / 권장)" → "진행 해줘".
> 본 plan = 4원칙 1원칙 산출물.

---

## §0. 작업 컨텍스트 (2026-05-18 session 30차)

- 직전 release v8.4.1 PATCH (L3 audit + P0 3 finding closed + F-SKILL namespace 신설 / commit `1a8915a`).
- F-SKILL P1 9 finding 목록 = `methodology-spec/finding-system.md` F-SKILL namespace SSOT 표.
- `audit-skill-l3-report.md` §3 P1 list + `D-senior-conscience.md` T5 full table.
- ★ all 9 findings = **additive / breaking 0** (semver MINOR cadence 정합).

---

## §1. Goal

> 9 P1 finding 일괄 시행 → v8.5.0 MINOR release. F-SKILL ledger 안 각 finding `Status: resolved v8.5.0` 전환.

---

## §2. 9 finding 정밀 scope (lay-of-the-land 후 확정)

### F-SKILL-001 (medium / citation-anchor-drift)

- **현황**:
  - `analysis-domain-model:41` 인용 = "business-logic.md (§5.B domain — `business-logic` phase 안 4영역 병렬)"
  - `analysis-business-rules:52` 인용 = "business-logic.md (§5.A rules — `business-logic` phase 안 4영역 병렬)"
- **실 anchor 의미** (lay-of-the-land):
  - §5.A = DB 영역 (ORM 메서드 → 도메인 모델 + SQL CASE/WHERE → 비즈니스 규칙 + N+1 → 안티패턴) — domain + rules + AP 모두 기여
  - §5.B = FE 코드 영역 (validation 스키마 → 비즈니스 규칙 + 권한 분기 → 비즈니스 규칙) — rules 기여 / domain 직접 산출 없음
  - §5.C = 설정 (매직 넘버 → 비즈니스 규칙)
  - §5.D = 외부 의존성 (외부 인터페이스 → API 계약)
- **결론**: 단일 sub-anchor 지목이 wrong (§5 4영역 병렬 추출 — 어느 한 sub-anchor 만 가리키면 incomplete).
- **Fix** (option A — 권장): 둘 다 `§5 4영역 병렬` umbrella 로 정정 (단일 sub-anchor 미지목 / 의미 완전 정합).
  - `analysis-domain-model:41`: `(§5 — 4영역 병렬 추출 / domain 매핑 = §5.A ORM 메서드 + §5.B FE 도메인 분기)`
  - `analysis-business-rules:52`: `(§5 — 4영역 병렬 추출 / rules 매핑 = §5.A SQL CASE/WHERE + §5.B FE validation + §5.C 매직 넘버)`

### F-SKILL-003 (low / desc-trigger-EN-only)

- **target**: 4 analysis-* skills descriptions
  - `analysis-architecture/SKILL.md:3` (EN-only)
  - `analysis-domain-model/SKILL.md:3` (EN-only)
  - `analysis-source-inventory/SKILL.md:3` (EN-only)
  - `analysis-business-rules/SKILL.md:3` (EN-only)
- **Fix**: 각 description 끝에 Korean trigger keywords 추가 (예: `사용자: "아키텍처 분석" / "도메인 모델 추출" / "비즈니스 규칙"`).
- **constraint**: S2 1536-char 합산 cap 준수 (현 description 213~419c / 여유 충분).

### F-SKILL-007 (low / stale-template-count)

- **target**: `_base-apply-template/SKILL.md:20` — "Match user request to one of the 19 templates in `templates/analysis/`"
- **실측**: `templates/analysis/` 안 = **21 files** (auto-discovery 가능).
- **Fix**: "19 templates" → "21 templates" (단순 fix) — Senior P1 권장 (auto-discovery 는 P2 carry).

### F-SKILL-010 (low / weak-desc-trigger)

- **target**: 5 skills descriptions
  - `analysis-quality-antipattern/SKILL.md:3` (phase-relative trigger only / 자연어 keyword 부재)
  - `planning-decompose-use-cases/SKILL.md` (sub-skill / orchestrator-invoked)
  - `planning-identify-business-intent/SKILL.md` (sub-skill)
  - `spec-derive-acceptance-criteria/SKILL.md` (sub-skill)
  - `spec-integrate-deliverables/SKILL.md` (sub-skill)
- **Fix**: 각 description 에 NL trigger phrase 추가 (예: `사용자: "안티패턴 추출" / "marigration cautions"`).
- **constraint**: sub-skills 는 design 의도상 orchestrator-invoked → 매우 가벼운 trigger phrase (S2 1536-char 여유 충분).

### F-SKILL-013 (low / prereq-asymmetry)

- **target**: `analysis-db-schema-erd/SKILL.md:11-14`
- **현황**:
  ```
  ## 사전 조건
  - domain.json 존재 (entity ↔ table 매핑 reference)
  - DB 트랙 (DDL / ORM entity 시그널 검출)
  ```
- **Fix**: `inventory.json 존재 (DDL / ORM entity 시그널 위치)` 첫 줄로 추가 (analysis-architecture / domain-model 와 family consistency).

### F-SKILL-016 (low / missing-disable-model-invocation)

- **target**: 4 gate/runner skills frontmatter
  - `_base-invoke-go-stop-gate/SKILL.md` (gate)
  - `test-run-test-evidence/SKILL.md` (runner / 진짜 test 실행)
  - `implement-verify-test-pass/SKILL.md` (gate #4)
  - `test-verify-coverage/SKILL.md` (coverage 측정)
- **Fix**: 각 frontmatter 에 `disable-model-invocation: true` 추가 (S7 권장 정합).
- **★ side-effect**: 사용자 manual `/skill:name` 호출만 trigger / Claude auto-invoke ❌. ★ 단 chain harness 안 다른 skill 이 본 skill 을 invoke 가능한지 확인 필요 (`_base-invoke-go-stop-gate` 가 다른 skill 의 절차 안에서 호출됨 / 현재 8 skill body 인용 = "skill 호출").
- **★ 결단점**: `disable-model-invocation: true` 가 **Claude 자동 trigger 만 차단** / 다른 skill 의 명시 호출 (`Use the X skill`) 은 영향 없음 (공식 docs 확인 필요).

### F-SKILL-017 (low / S2-spec-incomplete-1024char)

- **target**: `methodology-spec/plugin-authoring-spec.md §2 S2`
- **현황**: `description`+`when_to_use` 합산 ≤ 1,536 char (only combined cap)
- **Fix**: per-field description ≤ 1,024 char 추가 (DELTA-3 / C-official-docs.md / platform.claude.com best-practices).
- **현 violation**: 47/47 = 213~419c (★ 0 violation / hardening only).

### F-SKILL-018 (low / digest-stale-CLAUDE_EFFORT)

- **target**: `methodology-spec/plugin-authoring-spec.md §6` skills row pinned_guidance_digest + digest_sha
- **현재 digest_sha**: `b8b2376312b0`
- **추가 항목** (DELTA-1~5 / C-official-docs.md):
  - DELTA-1: `${CLAUDE_EFFORT}` substitution variable 추가
  - DELTA-3: description 단독 ≤ 1,024 char (S2 cap 추가)
  - DELTA-4: third-person POV requirement
  - DELTA-5: "Keep references one level deep from SKILL.md" anti-pattern
- **plugins row 추가** (DELTA-2):
  - root-level SKILL.md packaging (v2.1.142 / 2026-05-14)
- **★ Fix**: 모든 추가 후 `digest_sha` 재계산 (`sha256(trim(new_digest))[0:12]`).
- **★ ★ release-readiness check #12 가 digest_sha 일치 결정적 assert** — 추가 후 재계산 안 하면 check #12 fail.

### F-SKILL-020 (low / third-person-POV-undocumented)

- **target**: `methodology-spec/plugin-authoring-spec.md §2 S2`
- **Fix**: third-person POV sub-rule 추가 (DELTA-4 / "Always write in third person").
- **★ scope split**:
  - **A 즉시 (본 P1 batch)**: S2 sub-rule 추가만.
  - **B 후속 (별도 P2 carry)**: ~25 skill descriptions 본격 audit + 본 sub-rule 따른 wording 변경 (Senior 권장).
- 본 P1 batch = A 만 시행 (B = `F-SKILL-020-followup` P2 carry).

---

## §3. 시행 순서 (★ 의존성 정합 / digest_sha 재계산은 마지막)

1. **F-SKILL-001** — 2 SKILL.md anchor 정정 (additive cite text 변경 / breaking 0)
2. **F-SKILL-003** — 4 analysis-* descriptions Korean trigger 추가
3. **F-SKILL-007** — `_base-apply-template:20` "19 → 21" 정정
4. **F-SKILL-010** — 5 skills descriptions NL trigger 추가
5. **F-SKILL-013** — `analysis-db-schema-erd` 사전조건에 inventory.json 추가
6. **F-SKILL-016** — 4 gate/runner skills `disable-model-invocation: true` frontmatter 추가 (★ 사전 공식 docs cross-check 의무 — manual `/skill:name` invocation 가능?)
7. **F-SKILL-017** — `§2 S2` per-field 1024-char cap 추가
8. **F-SKILL-020** — `§2 S2` third-person POV sub-rule 추가 (audit defer P2)
9. **F-SKILL-018** — `§6` skills + plugins 양쪽 digest 갱신 + `digest_sha` 재계산 (★ ★ 마지막 / 위 #7 + #8 의 §2 변경도 §6 digest 반영)

---

## §4. 산출물

| 산출물 | 위치 | 본격/휘발 |
|---|---|---|
| `plan-v85-p1-batch.md` | `.claude/plans/` | 본격 (LL 보존) |
| `research-v85-p1-batch.md` | `.claude/plans/` | 본격 (2원칙 결과 + Senior + official-docs 보조 검증) |
| `DEC-2026-05-18-v85-p1-batch.md` | `decisions/` | 본격 |
| F-SKILL ledger update | `methodology-spec/finding-system.md` | 본격 (P1 closed status 갱신) |
| 9 finding fix edits | 11~13 files | 본격 |

---

## §5. 사용자 결단 의제 (3원칙)

본 P1 batch 진행 전 사용자 묶음 결단 cluster:

1. **F-SKILL-001 fix paradigm** — Option A (§5 umbrella + 실 매핑 명시) vs Option B (단일 sub-anchor 정정만)?
2. **F-SKILL-016 frontmatter scope** — 4 gate/runner skills `disable-model-invocation: true` 추가 시 manual `/skill:<name>` invocation 가능 확인 (공식 docs F-015 의무) — 가능하면 OK / 불가능하면 carry?
3. **F-SKILL-020 scope split** — A 즉시 (S2 sub-rule 추가만) vs A+B (audit 25 skill descriptions 동반)?
4. **§6 digest_sha 재계산 cadence** — DELTA-1~5 + plugins DELTA-2 합산 (5+1 = 6 항목 additive 갱신) 시 새 digest_sha 의 next 6 hex 가 변경 시 check #12 가 즉시 unfreeze. PASS 의무.
5. **release v8.5.0 진행** — commit + tag + push?

---

## §6. STOP-3 9-gate (release 의무)

| gate | 목표 |
|---|---|
| workspace test | 414/414 (변경 없음 / 산출물만 변경) |
| release-readiness | 13/13 ready:true for v8.5.0 |
| skill-citation-validator | 0 stale (207 active doc) |
| drift-validator 3-way | (변경 없음) |
| version 3-way sync | 8.5.0 (plugin.json + CHANGELOG.md + package.json) |
| CLAUDE.md `plugin.json v8.5.0` | sync |
| digest_sha 재계산 일치 | `sha256(new_digest)[0:12]` = §6 표기 일치 |
| `_base-` 8 allowlist | 변경 없음 (frontmatter 추가만) |
| description 단독 ≤ 1024 char (S2 신규) | 47/47 (현 213~419c / 모두 통과) |

---

## §7. Risk / Trap

- **R1 — `disable-model-invocation: true` semantic**: 공식 docs 정밀 확인 의무. Claude auto-invoke 차단 / explicit skill invocation (다른 skill 의 본문 "use X skill") 가능? 만약 불가능 = 4 gate/runner skill 의 본문 호출 chain 차단 = critical regression.
- **R2 — digest_sha 재계산 실수**: §6 digest 텍스트 변경 후 `digest_sha` 재계산 안 하면 check #12 fail. ★ 본격 fix step 마지막 의무.
- **R3 — F-SKILL-001 fix 과적합**: Option A (umbrella + 실 매핑) 가 길어지면 SKILL.md 본문 readability 손실. Option B (단일 sub-anchor 정정) 가 깔끔하나 의미 incomplete.
- **R4 — F-SKILL-010 sub-skill desc 비대화**: NL trigger 추가가 sub-skill 의 orchestrator-invoked 의도와 충돌? S2 1536-char 여유 충분이라 안전.
- **R5 — F-SKILL-018 §6 plugins row DELTA-2**: root-level SKILL.md 패키징 relaxation 은 §6 plugins row 도 digest 갱신 필요 / digest_sha 재계산.

---

## §8. Lessons Learned (사후 채움)

(시행 후 본 섹션에 LL-v85-NN 등록)

---

## §9. 직선 일정

1. **본 plan 완성** ✓
2. **2원칙 research** — 3-에이전트 lightweight (Senior critique + `_base-official-docs-checker` F-016 cross-check + 가벼운 산업 비교 skip / 본 batch = additive 명확)
3. **3원칙 사용자 묶음 결단** — §5 cluster 5 항목
4. **시행** — §3 순서 9 step
5. **STOP-3 9-gate 검증** — §6 모두 green
6. **DEC + INDEX + STATUS + CLAUDE.md + CHANGELOG 갱신**
7. **commit + tag v8.5.0 + push**
