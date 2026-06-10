# research — 역공학 델타 #3 recovered-ADR (2원칙 / 경량 sub-agent)

> 방법: general-purpose sub-agent 1회 (시간 cap ≈10분 / 실 web fetch 의무 / memory `feedback_research_fact_validation` 정합). Case/Senior 생략 = Phase 4+ 가벼운 전략.
> 트리거: 델타 #3 = legacy 과거 architecture 결정 역추적 + 복구불가 WHY 정직 abstain. 핵심 검증 = "rationale_status:unknown" abstention 이 실제 grounding 있나 vs 순수 novel.

## Q1 — ADR 표준 포맷 / status enum

- **Nygard 원본 (Cognitect, 2011-11)** — 5 섹션: Title / Context / Decision / Status / Consequences. status 어휘 = `proposed / accepted / deprecated / superseded`. rationale-confidence·abstention 필드 **없음** (WHY 는 Context/Consequences 에 암묵). 출처 https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
- **Joel Parker Henderson canonical repo** — Nygard status enum = `proposed / accepted / rejected / deprecated / superseded` (+"etc." = open enum / 확장 가능).
- **MADR (`develop` 템플릿)** — status: `{proposed | rejected | accepted | deprecated | … | superseded by ADR-XXXX}`. + 구조화 metadata(date/decision-makers/consulted/informed) + Decision Drivers + Considered Options (= rationale 에 가장 가까운 슬롯). 그래도 "unknown rationale" 개념 **없음**. 출처 github.com/adr/madr
- repo 현황 정합: `task-plan.schema.json adrs[]` 이 이미 Nygard status enum(proposed/accepted/deprecated/superseded) + alternatives≥3 강제 + consequences 사용 (출처 = Cognitect URL 명시).

## Q2 — legacy 코드에서 과거 결정 역추적 선례 (= 본 산출물 전제)

- **Jansen & Bosch et al., "Documenting after the fact: Recovering architectural design decisions"** (JSS 2008) — **직접 선례**. 기존 아키텍처에서 design decision + rationale 를 사후 복구. 핵심 문제 진술: *"evaluated alternatives, made tradeoffs and rationale … remain in the heads of the designers, and this tacit knowledge is easily lost."* → 본 산출물의 전제(과거 결정 역추적)는 2008 SE 연구 라인 = **novel 아님**. 출처 cs.rug.nl/~paris/papers/JSS08.pdf
- **Mirakhorli et al., "Archie"** (FSE 2014) — 소스에서 architecturally-significant tactics 탐지 + tactics↔design↔rationale↔code traceability link. **가장 가까운 code-grounded 도구 선례** — code→rationale 링크하나 free-form "왜 X 를 골랐나" 는 아님. 출처 dl.acm.org/doi/10.1145/2635868.2661671
- **"Mining Architectural Information: A Systematic Mapping Study"** (arXiv:2212.13179, 2022) — 확립 용어 = **"design decision/rationale recovery" + "decision mining"**. 단 대부분 **텍스트 artifact(이슈/문서)에서** 추출 = 순수 code 근거는 **갭** (본 방법론이 앉는 자리).

## Q3 — UNKNOWN rationale 를 정직하게 다루는 관행

- **표준 "rationale unknown" status 값 = 부재.** 모든 canonical enum(Q1)은 *lifecycle* 상태(proposed→accepted→deprecated→superseded) — WHY 의 epistemic 불확실성을 표현하는 값 없음. Nygard/MADR/adr.github.io 전수 부재 확인. → abstention 토큰을 **coin 해야** 함.
- **confidence-level 기록 = 인정되나 비공식** — Azure Well-Architected ADR 가이드 "decisions are usually made under some degree of uncertainty" → confidence annotation = grounding 있음. 단 ratified standard 아님(blog/vendor-doc level).
- **rationale = 항상 present-and-mandatory 로 취급, abstainable 아님** — 문헌은 "당신이 결정자"라 rationale 를 *갖고 있다* 가정. "reason lost" 정직 abstention 관례 **검색 0** → forward-authored ADR 의 사각지대가 정확히 reverse-engineered ADR 가 사는 곳 = **본 산출물의 차별점**.

## Q4 — 코드에서 ADR 자동 생성/추론 도구

- **adr-tools (Nat Pryce)** — Nygard 포맷 scaffolding/lifecycle 관리. 추론 0 (사람이 전부 작성).
- **log4brains (thomvaill)** — docs-as-code ADR KB. decision/rationale 를 소스에서 생성 **안 함** — metadata(date/status)만 raw text+git log 에서 "guess". (rationale-inference 선례로 인용 ❌).
- **ADR Manager (adr/adr-manager)** — MADR 편집 web UI. 코드 분석·추론 없음.
- **종합**: 공식 tooling registry(adr.github.io/adr-tooling) 전체에서 **code 에서 rationale 추론 시도 = 없음**. AI 생성 제품(Workik 등)은 prompt 기반·code-evidence 근거 아님·honesty 보장 없음. → **code-evidence 근거 + rationale abstain 산출물 = 직접 경쟁 도구 없음**.

## DESIGN IMPLICATIONS (설계 반영)

1. **`rationale unknown` = 1급 필드로는 novel 이나 인접 관행에 grounded** — abstention 토큰 ship 하는 ADR 포맷/도구 0 (Q1/Q3/Q4) but (a) decision/rationale recovery 연구 라인(Jansen 2008) + (b) confidence 기록 관행(Q3)의 자연스러운 확장. **"novel field, grounded premise" 로 frame** — 아이디어 전체가 unprecedented 라 주장 ❌.
2. **두 직교 축 분리 / `status` overload ❌** — lifecycle enum(proposed/accepted/deprecated/superseded)은 *결정* 상태, rationale-recoverability 는 **별도 축**. 합치면 모든 ADR 도구 interop 깨지고 lifecycle↔epistemic confidence 혼동. → **본 방법론 반영: rationale 축 = discovery-spec `intent_certainty` enum 재사용(DEC 지시 / 신규 enum ❌)**. `unverified-intent` = 정직 unknown. research 의 "별도 축" 권고를 reuse 어휘로 충족 (recovered/inferred/unknown 신규 enum coin 회피).
3. **anti-pattern (핵심 리스크) = 날조된 그럴듯한 rationale** — 문헌이 flag 하는 실패(tacit rationale "remains in the heads … lost"). LLM 이 MADR Decision Drivers/Considered Options 슬롯을 발명한 force 로 채우는 것 = CLAUDE.md no-simulation 위반의 ADR 판. **정직 abstention = 차별 기능 → fail-closed 강제**(WHY 의 code/config/structure evidence pointer 부재면 `unverified-intent`).
4. **Archie 의 traceability shape 차용(scope 아님)** — 모든 recovered-ADR 필드가 grounding code/config/structure pointer 보유. certainty=observed ⟹ evidence anchor 필수 / inferred-consequence ⟹ inference basis 명시 / unverified-intent ⟹ anchor 없음 = audit 가능 abstention(assert 아님). `real_tool`/grep-hit 증거 관례 정합.
5. **MADR 필드셋 reuse(reinvent ❌)** — recovered 필드를 기존 섹션에 매핑(Context↔recovered context / Decision Outcome↔inferred decision / Considered Options↔*evidence 가 대안 검토를 보일 때만*). 유일 신규 schema 요소 = rationale certainty(+evidence) 축 → 델타 최소·interop 최대.

## caveat (정직)
- arXiv:1704.04798 full text 추출 실패(binary PDF) — title/venue 만 확인.
- "confidence level" practitioner 가이드 = 실재하나 비공식(blog/vendor-doc / ratified standard 아님).
- sub-agent 원 verified 플래그 인용 (URL 메인 재fetch 미수행 / memory `feedback_research_fact_validation` — 종합 판단은 본문).
