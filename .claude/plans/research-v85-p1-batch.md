# research-v85-p1-batch.md

> v8.5.0 MINOR — P1 9 finding batch / 2원칙 sub-agent research 합성.
> 2-에이전트 lightweight (산업 비교 skip / additive 명확) — `_base-official-docs-checker` F-015 + `_base-senior-engineer` critique.

---

## §1. `_base-official-docs-checker` F-015 결과 (★ critical)

### `disable-model-invocation: true` 정밀 semantic

| Scenario | 판정 | 근거 (verbatim) |
|---|---|---|
| (a) 사용자 자연어 → Claude auto-invoke | **차단** | "Description not in context, full skill loads when you invoke" |
| (b) `/skill:name` 명시 호출 | **비차단** | "You can invoke: Yes" |
| (c) ★ **다른 skill 본문 명시 호출 (chain harness)** | **INSUFFICIENT-DATA / 차단 가능성 높음 → ABORT 권장** | "Claude can invoke: No" + "By default, Claude can invoke any skill that doesn't have disable-model-invocation: true set" (Claude invoke 모든 경로 차단 해석) |
| (d) sub-agent `skills:[X]` preload | **차단** (명시) | "Also prevents the skill from being preloaded into subagents" |

### ★ 핵심 risk

★ ★ ★ **F-SKILL-016 ABORT 권장**. 현재 plugin 구조 (`planning-extract-from-legacy`, `spec-compose-behavior-spec`, `test-generate-test-spec`, `implement-generate-impl-spec`, `implement-verify-test-pass` 등이 본문 "use `_base-invoke-go-stop-gate` skill" 명시 호출) 에서 `_base-invoke-go-stop-gate` 에 `disable-model-invocation: true` 추가 시 **chain harness 깨짐 critical regression**.

### 안전한 대안 (F-015 verbatim 인용)

> "user-invocable: false: Only Claude can invoke the skill. Use this for background knowledge users shouldn't invoke directly."

`user-invocable: false` = Claude 는 invoke 가능 / 사용자 직접 `/skill:name` 만 차단. 본 4 gate/runner skills 의도 (사용자 직접 호출 ❌ / chain harness body 호출 ✓) 와 정합. ★ **F-SKILL-016 REVISE-2 = `user-invocable: false` 검토 후보**.

### DELTA-1~5 재확인 (1일 후)

5 DELTA 항목 모두 VERIFIED-IDENTICAL — 변경 ❌ / 추가 변화 ❌.

---

## §2. `_base-senior-engineer` critique 결과

### T6 Senior verdict — **GO with REVISE @ 0.83** (REVISE 4 항목 흡수 후 0.88)

### Top 3 우려

1. **F-SKILL-016 explicit invocation 거동 미확정** → F-015 dispatch 결과 = ABORT 권장 (★ 위 §1 정합).
2. **F-SKILL-018 digest_sha 재계산 wording 정밀 부재** → DELTA-1~5 + plugins DELTA-2 의 §6 raw digest 본문 wording 결정 후 재계산 의무.
3. **F-SKILL-007 drift 재발 방지 없음** → "19→21" 정정 후 templates/analysis/ 22번째 추가 시 자동 fail 없음 = drift 재발 risk / LL 등록 + plugin-authoring-spec sub-rule 후보 (P2 carry).

### T1 9 finding fix scope 정합

- F-SKILL-001 Option A umbrella 권장 (§5 4영역 병렬) — 단일 sub-anchor incomplete.
- F-SKILL-007 "19→21" P1 OK / auto-discovery 는 scope 과대 = P2 carry 정합 / 단 재발 risk LL 등록.
- F-SKILL-013 family-consistency 주장 부분만 성립 / 격하 후보 가능하나 add-only / breaking 0 = keep in batch.
- F-SKILL-016 = ★ ★ ABORT (F-015 cross / 안전한 대안 `user-invocable: false` REVISE-2).
- F-SKILL-017 + 018 + 020 = §2 + §6 변경 / digest_sha 재계산 정합.

### T2 시행 순서 정합

★ **step 0 신설 권장**: F-015 dispatch (explicit invocation 거동) — 본 cycle 안 이미 완료 → ABORT signal → step 6 (F-SKILL-016) **drop or REVISE-2** 결정.

### T3 추가 risk

- **R6** — F-SKILL-007 drift recurrence (templates/analysis/ 변경 시 cite 자동 갱신 ❌). P2 carry 권장.
- **R7** — F-SKILL-010 sub-skill description NL trigger 가 너무 강하면 사용자 직접 invoke = 의도외 trigger noise. 적합 keyword 선정 정밀 의제.
- **R8** — F-SKILL-018 digest_sha 재계산 시 §2 변경 (S2 1024 + third-person) 도 §6 skills digest pinned_guidance_digest 본문 반영 필요. plan 안 정밀 wording 부재.

### T5 F-SKILL-020 scope split

**A only (S2 sub-rule 추가만) 권장**. ~25 skill descriptions audit (B) = 별도 cooling-off / description 본문 변경 = 자연 breaking risk / A+B 동시 = scope 과대 / 부분 시행 ❌.

### T7 STOP-3 9-gate 누락

- **누락 1** — F-SKILL-016 4 skills `user-invocable: false` 적용 시 (REVISE-2) plugin runtime smoke test (수동 verification carry / Claude Code reload 후 chain harness 무결 입증).
- **누락 2** — `skill-citation-validator` 가 F-SKILL-001 의 `(§5 — 4영역 병렬 추출)` form 을 dead-link 판정하는지 사전 dry-run 의무.

### T8 가치 평가

- 즉시 자산화 = ★★★ (9 → 8 finding closed / F-SKILL ledger ~33%)
- 차기 audit 부담 감소 = ★★
- v9.0 charter 진입 자격 강화 = ★★★

---

## §3. 종합 권고 (사용자 묶음 결단 제시안)

### Cluster 1 — F-SKILL-016 처분 (★ critical)

| 옵션 | 의미 | breaking | conf |
|---|---|---|---|
| **A. ABORT → P2 carry** | 본 batch 에서 제거 / v9.0 charter review 시 재검 | 0 | 0.95 |
| **B. REVISE-2 → `user-invocable: false`** | 4 skills 에 `user-invocable: false` 적용 (Claude invoke ✓ / 사용자 `/skill` ❌) | 0 (additive frontmatter) | 0.80 (manual smoke test 필요) |
| C. 강행 `disable-model-invocation: true` | F-015 ABORT 무시 / chain harness 깨짐 risk | high | ❌ |

**Senior 권장**: **A** (P2 carry / cooling-off 24h) — REVISE-2 는 별도 dispatch + smoke test 후 결단. 본 batch 안 단순화.

### Cluster 2 — F-SKILL-020 scope

| 옵션 | 의미 |
|---|---|
| **A. S2 sub-rule 추가만 (Senior 권장)** | 본 P1 batch 안 / audit 25 skills wording = 별도 P2 |
| B. A + 25 skills wording audit | scope 과대 / 자연 breaking risk |

### Cluster 3 — F-SKILL-001 fix paradigm

| 옵션 | 의미 |
|---|---|
| **A. Umbrella (§5 4영역 병렬) + 실 매핑 명시 (Senior 권장)** | 의미 완전 정합 |
| B. 단일 sub-anchor 정정만 | 깔끔하나 incomplete |

### Cluster 4 — 시행 cadence

- F-SKILL-016 처분 (A or B) 결정 후 잔여 8 (or 9) finding 일괄 시행 + digest_sha 재계산 + release v8.5.0.

---

## §4. 본 research 결론

- ★ ★ **F-SKILL-016 = ABORT or REVISE-2** (사용자 결단 의무).
- 잔여 8 finding (F-SKILL-001/003/007/010/013/017/018/020) = additive / breaking 0 / 즉시 시행 가능.
- Senior verdict GO @ 0.83 (REVISE 흡수 시 0.88).
- F-015 verbatim authority on `disable-model-invocation` 차단 범위 = "Claude can invoke: No" / chain harness body 호출 차단 가능성 높음.
