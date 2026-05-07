# research v2.1.0 — phase 4.7 (characterization) 본체 격상

> 2026-05-07 / Work Principles 2원칙 / 가벼운 sub-agent (~25분)
> plan-v210-phase-4-7-promotion.md §8 D1~D5 결단 의뢰 직전 정보 보강

---

## 1. 핵심 결론 (TL;DR)

| 항목 | 외부 권위 정합 | 본 방법론 결단 |
|---|---|---|
| Q1 snapshot schema (Given/When/Then + intent_classification) | ★ Cucumber Gherkin + Feathers Characterization Testing 합성 ✅ | **schema 옵션 필드 2 추가**: `feature` (string) + `tags` (string[]) — Gherkin Feature/Tag 표준 정합 + dual encoding |
| Q2 4분류 (intent / bug / ambiguous / self_recognized) | ★ self_recognized = SATD/KL-SATD 학술 정식 용어 ✅ / 4분류 자체는 본 방법론 고유 가치 | **유지 + schema description 에 SATD reference 코멘트** |
| Q3 coverage threshold ≥ 0.80 | ★ PIT / Stryker / BullseyeCoverage 산업 표준 ✅ / legacy 시 ratchet pattern 표준 | **default 0.80 + ratchet 메커니즘 schema 신설** (`coverage_target` + `coverage_minimum_legacy` + `coverage_strategy`) |
| Q4 skill prompt 분기 ❌ / 단일 prompt | ★ Cursor / Cline / Aider 모두 분기 ❌ 단일 prompt 패턴 ✅ | **DEC §6 정정 그대로 유지** + 자연어 hint 한 줄 |

→ ★ ★ 본체 격상 6 자산 모두 외부 권위 정합. v2.1.0 minor release 진입 자격 ★ 강화.

---

## 2. ★ 빈틈 3건 (사용자 결단 시 검토 의무)

### 빈틈 #1 — Modern PoC corroboration 약점 (★ 잠재 §8.1 strict 우려)

PoC #03 NestJS 에서 4분류 enum 의 `self_recognized` 발생 빈도 = 0건 가능성 (Modern 스택 = TODO/FIXME 자조 코멘트 ↓). 만약 PoC #03 retrofit 시 self_recognized = 0 / ambiguous = 0 → §8.1 strict "ambiguous + self_recognized = 1 PoC overfitting" 의심 가능.

**완화**:
- PoC #03 retrofit 시 self_recognized 발생 빈도 metric 첨부 의무 (예: "TODO/FIXME grep result: 5건 / self_recognized 분류 대상 없음 — 모두 미해결 backlog")
- schema description 에 "self_recognized = 0 도 정합 (Modern 스택 자연 부재)" 명시

### 빈틈 #2 — threshold 0.80 vs legacy 0.40 양립의 schema 표현

단일 필드 (`coverage_threshold: 0.80`) 만으로는 legacy 단일 모듈 0.43 정합 불가 (drift-validator 가 fail). 2 필드 + strategy 분리 의무.

**schema 신설 (research 권고)**:

```json
{
  "coverage_target": 0.80,
  "coverage_minimum_legacy": 0.40,
  "coverage_strategy": "ratchet | absolute",
  "trend_required": true
}
```

drift-validator (또는 신설 characterization-coverage-validator) 가 양쪽 검증 의무:
- `absolute` 시 `actual ≥ coverage_target` 검증
- `ratchet` 시 `actual ≥ coverage_minimum_legacy + trend positive` 검증

### 빈틈 #3 — Gherkin tag 표준 미도입 시 traceability 손실

`tags` 옵션 필드 없으면 BHV-* / AC-* 와의 cross-link 시 `intent_classification.type` 으로만 해야 함 (단일축). tag 도입 시:

```json
{
  "id": "SCN-SIGNUP-002",
  "name": "duplicate username",
  "tags": ["@bug", "@db-uq", "@AP-DB-001"],
  "intent_classification": [...]
}
```

→ traceability 강화 + Cucumber Gherkin 표준 호환 + traceability-matrix-builder 가 tag 기반 grep 가능.

---

## 3. plan §2 6 자산 ↔ research 권고 매핑

| 자산 | research 권고 흡수 |
|---|---|
| A1 deliverable 16-characterization-spec.md | 빈틈 #1~#3 모두 §11 "흔한 함정" 또는 §4 "intent-vs-bug 분류표" 에 명시 의무 |
| A2 schema characterization-spec.schema.json | ★ 빈틈 #2 ratchet schema 신설 + 빈틈 #3 `feature` + `tags` 옵션 필드 + Q2 SATD reference 코멘트 흡수 |
| A3 meta-confidence enum | 변경 ❌ (단일 enum 추가만) |
| A4 skill phase-4-7-characterization | ★ Q4 단일 prompt + 자연어 hint 한 줄 (외부 권위 confirm) — DEC §6 정정 정합 |
| A5 tool characterization-coverage-validator | ★ 빈틈 #2 `coverage_strategy` enum 검증 의무 추가 |
| A6 flow analysis.phase-flow.json | 변경 ❌ (phase 4.7 entry 추가만) |
| A7 ADR-CHAIN-006 | ★ ★ research 권위 출처 12종 footnote 추가 의무 (Cucumber / Feathers / SATD / Stryker / Cursor) |

---

## 4. 권위 출처 (12종 / ADR-CHAIN-006 footnote 인용 의무)

### Q1 — schema 표준
- Cucumber Gherkin Reference (공식) — https://cucumber.io/docs/gherkin/reference/
- Gojko Adzic, "Specification by Example, 10 years later" (2020) — https://gojko.net/2020/03/17/sbe-10-years.html
- Gojko Adzic, "Given-When-Then, tweak and try again" (2020) — https://gojko.net/2020/11/02/given-when-then-tweak-try-again.html
- Wikipedia "Characterization test" — https://en.wikipedia.org/wiki/Characterization_test
- understandlegacycode.com (Nicolas Carlo) — https://understandlegacycode.com/blog/key-points-of-working-effectively-with-legacy-code/

### Q2 — SATD/KL-SATD
- Springer SQJ 2024 (KL-SATD ↔ SonarQube) — https://link.springer.com/article/10.1007/s11219-023-09655-z
- Di Penta et al. (EMSE 2021) — https://mdipenta.github.io/files/emse2021-satd.pdf
- SonarQube docs — https://docs.sonarsource.com/sonarqube-server/10.6/user-guide/code-metrics/modifying-technical-debt-parameters

### Q3 — coverage threshold
- Stryker Mutator 공식 (qaskills.sh) — https://qaskills.sh/blog/mutation-testing-stryker-guide
- BullseyeCoverage Minimum — https://www.bullseye.com/minimum.html
- ecosystem4engineering "Strategies for Low Coverage Legacy" — https://ecosystem4engineering.substack.com/p/strategies-for-dealing-with-low-code
- Salesforce Engineering "Cursor AI Cut Legacy Code Coverage 85%" — https://engineering.salesforce.com/how-cursor-ai-cut-legacy-code-coverage-time-by-85/

### Q4 — 단일 prompt 분기 ❌
- Cursor 공식 — https://cursor.com/
- Cline.bot blog "Best AI Coding Assistant 2025" — https://cline.bot/blog/best-ai-coding-assistant-2025-complete-guide-to-cline-and-cursor
- Qodo "Cline vs Cursor" — https://www.qodo.ai/blog/cline-vs-cursor/

---

## 5. plan §8 D1~D5 결단 권고 update (research 후)

| Decision | 권고 (plan §8 권고) | research 후 update |
|---|---|---|
| D1 진입 여부 | (a) 즉시 plan 승인 | ✅ 유지 — 외부 권위 정합 강화 |
| D2 sub-agent research 깊이 | (a) 가벼운 | ✅ 완료 (~25분) |
| D3 Senior cooling-off | (a) 즉시 final | ★ 빈틈 3건 적용 후 → ★ 사용자 결단 — (a) 즉시 final 또는 (b) v2.1.0-rc1 prerelease 24h+ 추천 |
| D4 commit 단위 | (a) 7-commit 분할 | ✅ 유지 |
| D5 plan 갱신 | (a) phase 별 | ✅ 유지 |

★ ★ **신규 결단 D6** — 빈틈 #1~#3 흡수 여부:
- (a) 모두 흡수 — schema 옵션 필드 2 + ratchet schema + SATD reference + traceability tags (★ research 권고 정합 / scope ↑ +1시간)
- (b) #2 ratchet 만 흡수 (★ 본질 영향 / 빈틈 #1 #3 = v2.1.x patch carry)
- (c) 모두 carry (★ minimum scope / v2.1.x patch 시 흡수)

★ 권고 = (a) — 외부 권위 정합 강화 + 본 방법론 §8.1 strict 우려 사전 차단 + ★ scope 영향 미미 (schema 옵션 2 필드 + ratchet 3 필드 = ≤ 5 줄 schema 추가).

---

## 6. ★ 종합

✅ research 결과 외부 권위 정합 confirm — 본 방법론 6 자산 격상은 ★ 표준 패턴 (Cucumber + Feathers + SATD + PIT/Stryker + Cursor/Cline) 정합.
✅ 빈틈 3건 식별 — schema 옵션 + ratchet + tags. ★ v2.1.0 진입 시 흡수 권고 (D6 = a).
✅ ADR-CHAIN-006 footnote = 권위 출처 12종 명시 의무 — ★ 본 방법론의 자체 신뢰성 강화 + 외부 사용자 검증 가능성.
