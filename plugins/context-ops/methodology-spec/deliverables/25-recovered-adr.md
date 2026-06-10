# 산출물 #25: Recovered ADR (역추적 architecture 결정 + rationale abstention)

> **사상**: Nygard ADR (2011) backward 적용 + Jansen & Bosch _"Documenting after the fact: Recovering architectural design decisions"_ (JSS 2008) + Archie (Mirakhorli, FSE 2014 — tactics↔rationale↔code traceability)
> **schema**: `schemas/recovered-adr.schema.json`
> **생성**: analysis stage / cross-cutting aspect (`analysis-recovered-adr` skill)
> **자격**: 1차 draft (역공학 델타 #3). 본체 MANDATORY 격상 = ≥2 distinct 도메인 PoC corroboration 후 (결정 = 인용 footer).

---

## 1. 목적

**답하는 질문**: "legacy 시스템이 **왜 이렇게 설계됐나**(과거 architecture 결정 + 근거)는 forward `task-plan.adrs[]`(앞으로 내릴 결정)로 표현 불가. 이미 내려진 결정을 코드 증거에서 복구하되, **WHY 를 복구 못 하면 정직하게 abstain**(날조 ❌)."

**AI 가 legacy 를 modify·evolve 시 활용**:
- 변경 전 "이 결정을 건드리면 무엇이 깨지나"(consequences) 파악
- forward ADR(plan stage)과 대비 — recovered = 과거 / forward = 미래
- `rationale.certainty=unverified-intent` 노출 = "근거 모르고 바꾸면 위험" 신호

### 1.1 forward task-plan.adrs[] 와의 차이 (backward 보완)

| 축 | forward `task-plan.adrs[]` (plan stage) | **recovered-adr.json** (analysis stage) |
|---|---|---|
| 방향 | 앞으로 내릴 결정 | 이미 내려진 결정 역추적 |
| alternatives | **≥3 강제** (사후 정당화 회피) | **강제 ❌** (역추적은 검토된 대안 미상 / evidence 보일 때만) |
| rationale | 결정자 본인이 보유 (present-and-mandatory) | 복구 대상 — 미복구 시 **unverified-intent abstain** |
| status | proposed/accepted/deprecated/superseded | accepted/deprecated/superseded (proposed 부적용) |
| ID | `ADR-*` | `RADR-*` (recovered 구분) |

### 1.2 차별점 — rationale abstention (research grounding)

- 전제(과거 결정 역추적)는 **학술 선례 존재** = novel 아님 (Jansen&Bosch 2008 / Archie FSE2014 / decision-mining 서베이 arXiv:2212.13179).
- 그러나 **"rationale unknown" abstention 토큰은 어떤 ADR 포맷/도구에도 없음** (Nygard·MADR·adr-tools·log4brains·ADR-manager 전수 부재) = **본 산출물 고유 contribution** ("novel field, grounded premise").
- 핵심 anti-pattern = **날조된 그럴듯한 rationale**(tacit knowledge "remains in the heads … lost" — Jansen 2008) = no-simulation 위반의 ADR 판. 정직 abstention 을 fail-closed 로 강제.

---

## 2. 형식

```
.ai-context/output/recovered-adr.json   # meta + recovered_adrs[] + extraction (단일 파일 / json 단독 SSOT)
```

`recovered_adrs[]` item: `id`(RADR-*) / `title` / `category`(Nygard 5+보안) / `status` / `decision`(관찰 사실) / `evidence[]`(≥1 / fail-closed) / `rationale{certainty, text, basis_evidence}` / `alternatives[]`(evidence 시만) / `consequences{positive,negative}`.

---

## 3. 두 직교 축 (status overload 금지)

| 축 | 필드 | enum | 출처 |
|---|---|---|---|
| 결정 lifecycle | `status` | `accepted / deprecated / superseded` | Nygard (proposed 부적용 — 이미 구현됨) |
| **rationale 복구도** | `rationale.certainty` | `observed / inferred-consequence / unverified-intent / source-refuted` | **discovery-spec `intent_certainty` 재사용 / 신규 enum ❌** |

`unverified-intent` = 정직한 "rationale unknown" abstention. (research "별도 축 분리" 권고를 reuse 어휘로 충족 — recovered/inferred/unknown 신규 coin 회피).

---

## 4. fail-closed (날조 차단 / no-simulation)

- **결정 evidence-grounded** — `recovered_adrs[].evidence` minItems 1 (증거 없는 결정 등재 ❌).
- **observed ⟹ basis_evidence 필수** — schema `if/then` conditional 이 강제. `observed` 라 주장하면서 근거 증거 없으면 **schema invalid**(negative test 입증). 근거 없으면 `unverified-intent` + text=null 로 정직 표기.
- `extraction.evidence_trust = real_extraction` / `rationale_unknown_count` 정직 노출.

---

## 5. cross-link

```yaml
cross_links:
  - { to_artifact: task-plan-adrs, link_type: backward_complement }   # forward ADR 의 과거 짝
  - { to_artifact: discovery-spec, link_type: reuses_intent_certainty } # rationale 어휘 SSOT
  - { to_artifact: legacy-spectrum, link_type: decision_decay_context }  # deprecated 결정 ↔ legacy 등급
  - { to_artifact: migration-cautions, link_type: decision_to_caution }  # 위험 결정 ↔ negative 경고
```

---

## 6. 신뢰도

| 단계 | 조건 | rationale 복구율 |
|---|---|---|
| 1 | config/구조에서 결정만 식별 (rationale 대부분 unverified-intent) | abstention 높음 (정직) |
| 3 | + 주석/README/commit 근거 read → observed/inferred 일부 승격 | 코드베이스 위생 의존 |
| gate #0 | 사람이 결정·rationale 확정 | — |

`rationale_unknown_count` 높음 = **결함 아니라 정직 신호** (주석·ADR·commit 위생 나쁜 legacy 의 사실 반영).

---

## 7. PoC corroboration 자격

≥2 distinct 도메인 PoC corroboration 의무 (1차 = legacy Java Spring+MyBatis dogfood). legacy(주 타깃) + Modern 2 paradigm 후 본체 MANDATORY 격상.

---

## 8. carry

| ID | 항목 | trigger |
|---|---|---|
| C-2nd-domain | 2번째 distinct 도메인 dogfood (Modern 또는 다른 legacy) | 본체 격상 전 |
| C-validator | recovered-adr-validator (evidence 실재 cross-check / certainty over-attribution gate) | ≥2 PoC 후 (1차 = schema fail-closed only) |
| C-vcs-rationale | git blame/log 에서 rationale 복구 (commit 메시지 = observed 근거 채널) | vcs_history evidence 본격화 |

---

## 인용

- schema: `schemas/recovered-adr.schema.json`
- DEC: DEC-2026-06-09-recovered-adr-rationale-abstention (모DEC = DEC-2026-06-09-reverse-eng-methodology-gap §2.5 델타 #3)
- skill: `skills/analysis-recovered-adr/SKILL.md`
- 어휘 SSOT: `schemas/discovery-spec.schema.json` (intent_certainty)
- forward 짝: `schemas/task-plan.schema.json` (adrs[])
- 외부 권위: Michael Nygard, _Documenting Architecture Decisions_ (2011, cognitect.com); Jansen & Bosch, _Documenting after the fact: Recovering architectural design decisions_ (JSS 2008); Mirakhorli et al., _Archie_ (FSE 2014)
