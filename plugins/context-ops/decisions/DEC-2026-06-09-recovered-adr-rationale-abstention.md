# DEC-2026-06-09-recovered-adr-rationale-abstention

> **상태**: 채택 (1차 draft) — 역공학 델타 #3. 본체 MANDATORY 격상 = ≥2 distinct 도메인 PoC corroboration 후 (§8.1).
> **모DEC**: `DEC-2026-06-09-reverse-eng-methodology-gap` §2.5 델타 #3 (ROI 3위 / 채택 4개 중 마지막).
> **plan**: `plan-delta3-recovered-adr.md` / **research**: `research-delta3-recovered-adr.md`.

## 결정

legacy/기존 코드베이스의 **과거 architecture 결정**을 코드 증거에서 역추적하는 신규 analysis 산출물 `recovered-adr.json`(#25) 신설. **차별점 = rationale(WHY) 복구 불가 시 정직 abstention**(날조 ❌ / no-simulation 의 ADR 판).

## 근거 (1원칙 숙지 + 2원칙 research)

- **갭**: forward `task-plan.adrs[]`(plan stage / 앞으로 내릴 결정 / alternatives≥3 강제 / rationale present-and-mandatory)는 "이미 내려진 과거 결정 + 복구불가 WHY" 를 표현 못 함. legacy modify·evolve 시 "왜 이렇게 설계됐나"가 P0 컨텍스트.
- **research grounding** (general-purpose sub-agent 실 fetch):
  - 전제(과거 결정 역추적) = 학술 선례 존재 (Jansen & Bosch 2008 _"Documenting after the fact: Recovering architectural design decisions"_ / Archie FSE2014 tactics↔rationale↔code / decision-mining 서베이 arXiv:2212.13179) = **novel 아님**.
  - **"rationale unknown" abstention 토큰 = 어떤 ADR 포맷·도구에도 부재** (Nygard 2011 / MADR / adr-tools / log4brains / ADR-manager 전수) = **본 산출물 고유 contribution** ("novel field, grounded premise").
  - 핵심 anti-pattern = 날조된 그럴듯한 rationale (tacit knowledge "remains in the heads … lost") → fail-closed 강제가 설계 1순위.

## 설계 (5 결정 / 사용자 일괄 승인 "스펙대로 진행")

1. **rationale 어휘 = discovery-spec `intent_certainty` 재사용** (신규 enum ❌ / 모DEC 지시 정합). `observed / inferred-consequence / unverified-intent / source-refuted` — `unverified-intent` = 정직 unknown. research 의 "lifecycle status 와 별도 축 분리" 권고를 **reuse 어휘로 충족**(recovered/inferred/unknown 신규 coin 회피).
2. **schema 형태 = run-manifest(델타 #2a) precedent 동형** — meta + recovered_adrs[] + extraction(evidence_trust real_extraction|simulated + rationale_unknown_count). top-level additionalProperties:false. `RADR-*` ID(forward `ADR-*` 와 구분).
3. **alternatives ≥3 강제 ❌** — 역추적은 검토된 대안 미상. evidence 가 대안 검토를 보일 때만(`rejected-with-evidence`) / 일반 언급=`speculative`. forward adrs 와 의도적 차이.
4. **fail-closed abstention 강제 (차별 기능)** — ⒜ `evidence[]` minItems 1(증거 없는 결정 등재 ❌) ⒝ schema `if/then`: `certainty=observed ⟹ basis_evidence + text 필수`. **negative test 입증**: observed+basis_evidence:null = schema invalid("must match then schema"). 근거 없으면 unverified-intent+text=null 로 정직.
5. **release scope = 1차 draft** — plugin.json·CHANGELOG·MANDATORY 무변경 (#1/#2/#4 델타 draft 동형 / §8.1). 1 dogfood = poc-08 jpetstore.

## 산출 (코드)

- `schemas/recovered-adr.schema.json` (신설 / draft-2020-12 strict + if/then fail-closed).
- `skills/analysis-recovered-adr/SKILL.md` (신설 / no-simulation 절차 / abstention 의무).
- `methodology-spec/deliverables/25-recovered-adr.md` (신설 / canonical deliverable doc — run-manifest 가 빠뜨린 doc 갭 회피).
- `flows/analysis.phase-flow.json` cross_cutting.aspects + `agents/analysis-agent.md` frontmatter (aspect 등록 / agent_skills_phaseflow_sync 정합).
- `methodology-spec/lifecycle-contract.md` #25 행 + note.
- dogfood `examples/poc-08-realworld-mybatis/.ai-context/output/recovered-adr.json` — 3 ADR 로 certainty 스펙트럼 시연: RADR-001 **observed**(spring-web 5.3.39 핀 / pom.xml:108 주석이 jakarta 사유 명시) / RADR-002 **unverified-intent abstention**(WAR 패키징 WHY 근거 부재) / RADR-003 **inferred-consequence**(MyBatis 채택). schema-valid.

## 번호 체계 정정 (부수 발견 / finding)

- recovered-adr = **#25** (`deliverables/` canonical sequence: 1~24, sql-inventory=24 가 max → 다음 free).
- **델타 #2a drift 발견**: run-manifest 가 "#16" 을 점유했으나 canonical `deliverables/16-error-mapping-spec.md` = error-mapping = **번호 충돌** + run-manifest 는 `deliverables/NN.md` doc 미생성. recovered-adr 는 doc 생성 + 정확 번호로 갭 회피. run-manifest #16 충돌 = 별도 정정 대상(finding / 본 델타 scope 외).

## §8.1 (과적합 회피)

1차 = schema+skill+wiring+doc+DEC + poc-08 1 dogfood (legacy / Java Spring+MyBatis). 본체 MANDATORY 격상(버전+MANDATORY 등재) = **≥2 distinct 도메인 corroboration 후**(legacy + Modern 또는 다른 도메인). recovered-adr-validator(evidence 실재 cross-check) = carry.

## Relates

- DEC-2026-06-09-reverse-eng-methodology-gap (모 / 델타 #3 격상)
- DEC-2026-06-09-build-run-env-manifest (#2a / schema·skill precedent 동형 + 번호 drift 발견 맥락)
- DEC-2026-06-09-scope-carve-3signal-reference-lens / DEC-2026-06-09-hotspot-prioritization-reference-lens / DEC-2026-06-09-artifact-secret-scan (sibling 델타)
- discovery-spec intent_certainty (어휘 SSOT 재사용 / 신규 enum ❌) + task-plan.adrs (forward 짝)
