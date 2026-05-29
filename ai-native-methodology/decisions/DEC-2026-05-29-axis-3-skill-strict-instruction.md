# DEC-2026-05-29 — axis 3 / analysis-business-rules skill 본문 BR id strict instruction 본격 추가 (Path 2 / paradigm drift 영구 차단)

> 본 결정 = poc-17 chain 1 discovery 첫 사내 live 시행 직후 표면화된 paradigm drift 의 ★ 영구 해결.
> trigger: 사용자 의제 결단 ("포맷팅 대로 되는게 좋다" / context engineering 측면 본격 답).
> 자격: methodology body 1 파일 갱신 (additive / breaking 0).

---

## 1. 배경 사실

poc-17 chain 1 discovery 시행 시 표면화된 사실:
- **Layer 1 (schemas/)** = strict regex `^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$` (3 segments + numeric suffix 의무).
- **Layer 2 (skills/analysis-business-rules/SKILL.md)** = instruction 부재 → AI 가 본문 따를 때 자유 paradigm 적용 자격.
- 결과 = 본 PoC analysis baseline BR id = `BR-RBAC-PRIORITY` 같은 meaningful name (★ Layer 1 위반).
- chain 1 진입 시 schema-validator RED 18+ findings → patch fix 임시 우회 (`-001` suffix 추가).

★ ★ ★ **두 layer mismatch** 본격 표면화.

---

## 2. context engineering 측면 결단 (★ 사용자 의제 답)

★ ★ "포맷팅 대로 되는게 좋다" (strict paradigm 본격 우수) 결단 근거:

| axis | strict 포맷 (`BR-RBAC-PRIORITY-001`) | 자율 paradigm (`BR-RBAC-PRIORITY`) |
|---|---|---|
| LLM 컨텍스트 의미 read | ✅ prefix 부분 (`BR-RBAC-PRIORITY`) 의미 직관 | ✅ 의미 자체 직관 |
| machine 매칭 (cross-link 자산) | ✅ regex 강 / typo silent fail 차단 강 | △ pattern 약 / typo silent fail risk |
| 다음 chain 단계 (chain 2~5) reference | ✅ BHV.br_refs[] / AC.related_brs[] 등 매칭 본격 | △ silent typo 누적 risk |

→ ★ ★ ★ **strict 안에 의미 + 식별자 양수 가치 본격 결합 자격** = 본격 best paradigm.

---

## 3. 시행 (Path 2 / skill 본문 enforcement)

★ axis 3 시행 = **skill 본문 1 unit 추가** (additive / breaking 0):

대상 파일: `skills/analysis-business-rules/SKILL.md` §3 (business-rules.json 작성)

추가 instruction:
```
★ ★ ★ BR id 형식 의무 (★ ★ AI 본격 instruction / 자유 paradigm ❌):
  regex `^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$` 정합 의무
  form = `BR-<DOMAIN>-<SUBJECT>-<NNN>`
  예: BR-USER-VERIFY-001 / BR-RBAC-PRIORITY-001 / BR-CARLIST-PAGINATION-001

  - prefix `BR-<DOMAIN>-<SUBJECT>` = 의미 본격 (LLM 컨텍스트 read 시 의미 직관)
  - numeric suffix `-NNN` = 단순 식별자 / machine 매칭
  - meaningful name 단독 산출 ❌
  - scope 안 다중 BR 산출 시 = numeric suffix 단순 순차 부여 (001, 002, ...)
  - paradigm 본격 정합 근거 = poc-17 chain 1 첫 사내 live 표면화
```

---

## 4. 결과 (★ paradigm drift 영구 차단)

✅ **본격 효과**:
- 새 PoC analysis baseline 진입 시 AI 가 본 instruction 본격 따름 → strict paradigm 산출 → chain 진입 시 schema-validator GREEN 직진.
- patch fix 임시 우회 의무 ❌ (poc-17 같은 사실 본격 재발 ❌).
- drift attractor 영구 차단 (random naming / typo silent fail 본격).

✅ **본격 영향 0**:
- 기존 PoC #01~#16 (legacy meaningful name 가능성 보존) = ★ ★ legacy paradigm 본격 보존 자격 (cross-link 자산 영향 ❌).
- 본 PoC poc-17 의 business-rules.json `rules` + `rules_step_4c_carcost` array (legacy meaningful name) = ★ 본격 보존.
- 본 PoC chain 1 시행 시 동시 normalize 한 `business_rules` 통합 array (`-001` suffix) = ★ 본 instruction 본격 1:1 정합.

---

## 5. self-referential drift risk 수용 결단

★ ★ ★ 본 axis 3 시행 = methodology body 변경 = ★ self-referential drift risk 본격 발생 자격 (LL-codegraph-01).

**risk 수용 근거**:
- 변경 범위 = ★ 1 파일 1 unit (★ additive / minimal scope)
- breaking 0 (legacy paradigm 본격 보존)
- 본격 paradigm enforcement 신규 capability (drift 영구 차단 / 본격 가치 본격 본격 큰 가치)
- 사용자 명시 결단 ("포맷팅 대로 되는게 좋다" / 본 session 안 시행)

**risk 완화**:
- Path 2 단독 (Path 1 schema 완화 ❌ / Path D 결합 ❌) — schema 자체 본격 보존 (이미 strict / 변경 ❌) / skill 본격 단독 갱신 = ★ ★ 최소 scope.
- 다른 BR-related skill (analysis-api-rule-mapping / discovery-identify-business-intent 등) 본격 cascade ❌ (★ ★ 본 session 안 scope 본격 본격 / 별 carry queue 등록).
- AP id pattern + UC + AC + BHV + TASK + TC + IMPL 등 다른 ID pattern 본격 cascade ❌ (★ ★ ★ ★ 별 carry queue / 본 session 본격 본격 본격 scope 외).

---

## 6. carry queue 등록

- `C-other-analysis-skills-strict-cascade` — analysis-api-rule-mapping + discovery-identify-business-intent 등 cross-skill 본격 strict 정합 의무 검토. trigger: 다른 PoC 동일 paradigm drift 표면화 시 또는 외부 사용자 자연 요구.
- `C-other-id-patterns-strict` — AP / UC / AC / BHV / TASK / TC / IMPL id pattern 모두 본격 strict 정합 의무 검토. trigger: paradigm coherence 본격 review (Type 2 외부 trigger).

---

## 7. release ceremony

- **version**: v11.4.0 → v11.5.0 MINOR (paradigm enforcement 신규 capability / breaking 0).
- **3-way sync**: plugin.json + package.json + CLAUDE.md.
- **STOP-3**:
  - workspace test 787/787 ✅ (변경 본격 영향 0)
  - release-readiness 21/22 (preflight skipped — release 본격 시행 시 본격 검증 의무) — 단, methodology body 변경 후 22/22 본격 ready 의무.
  - skill_citation 0 stale ✅
  - version 3-way ✅ 11.5.0
  - breaking 0 ✅

---

## 8. 관련 자산

- 직전 plan ladder = `.claude/plans/plan-poc17-chain1-discovery-car-list.md` §8.1 LL-poc-17-09 (paradigm drift 2건 표면화)
- 직전 결단 = DEC-2026-05-29-sub-rule-v1.2.0-poc-17-corroboration (v11.4.0 / poc-17 Phase 1 본격 종결)
- 다음 plan ladder = `.claude/plans/plan-poc17-analysis-revisit-axis-1-2.md` (axis 1+2 본격 시행 별 cycle)
- LL-codegraph-01 (self-referential drift 회피) — risk 수용 + 완화 결단 본격 정합
- memory `feedback_dual_goal_migration_plus_plugin.md` (듀얼 목표) — plugin axis 본격 강화 사실 정합

---

**결단 일자**: 2026-05-29
**결단자**: 사용자 (이상철 / TF Lead)
**자격**: MINOR (paradigm enforcement 신규 capability / breaking 0)
