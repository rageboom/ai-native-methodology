# DEC-2026-06-29-draft-first-minimal-subset

- **상태**: 시행 (v0.86.0 MINOR)
- **일자**: 2026-06-29
- **티켓**: MIS-435 [OP-ANALYSIS-001]
- **관련**: DEC-2026-06-26-analysis-state-aware-router(v0.85.0 진입 라우터 — 본 결정이 "floor부터"로 정밀화) · DEC-2026-06-06-analysis-exit-gate(analysis=soft exit gate #0) · DEC-2026-06-18-discovery-universal-entry-router · feedback_quality_priority(§8.1) · feedback_chain_driver_deterministic_axis(STRONG-STOP)

## 문제

analysis 산출물 ~21종을 처음에 다 만드는 게 부담(사용자: "너무 많아서")이라 analysis를 advisory로 뒀다. 그 결과 1급 경로가 **양극단**뿐 — (a) 통째로 다 하고 시작 / (b) 그냥 스킵(grounding 없는 거짓 진행). "핵심만 먼저 → 작업하며 per-scope 심화"라는 중간이 명시 경로로 없고, v0.85.0 라우터·cold-start surface도 "코드 분석"(전체 암시)이라고만 가리켰다.

## 결정 (breadth-only)

핵심 grounding **floor**만 먼저 만들어 discovery 진입 → 나머지는 per-scope 심화. pain이 *개수(breadth)*이므로 **breadth-only** — 산출물 *개수*만 줄이고 산출물은 full-depth 유지(depth-thinning ❌ / coverage 필드 ❌). 미룬 건 honest-absent(빈 stub ❌).

### 사용자 fork
- **breadth-only + finding-note** 채택 (vs coverage=partial 필드). 근거: pain=breadth 정조준 / ~21개 strict 스키마 blast radius 0 / 이미 `analysisOutputPresent`·scope-carve·bc-rollup이 메커니즘 제공 / finding이 정직성+deferred 추적을 한 곳에서(필드보다 정보 풍부) / 자기신고 coverage 도장의 false-precision·gate-inject 유혹 회피.

### 설계 (Senior 조임 반영)
- **① floor 정의** (`policies/draft-first-minimal-subset.md` canonical SSOT + lifecycle-contract 포인터): HARD floor = {architecture, domain, business-rules} + 트랙 조건부(BE→openapi / DB→schema / FE→≥1 FE) + spec 진입 시 ≥1 formal-spec. **`inventory`=guidance**(AND-gate ❌ — greenfield·FE-first false-negative 회피). **authority = `gate-eval.js` REQUIRED_VALIDATORS_PER_STAGE.analysis**(schema-required 목록 ❌).
- **② `minimalSubsetPresent(root)`** (`ai-context-layout.js`): universal floor 3종 존재의 **AND**(`analysisOutputPresent` OR-any 와 별개 축). 순수 fs+상수 파일명(LLM inject ❌ / 어떤 gate에도 inject ❌ / advisory). 트랙 조건부는 AND에 미포함(fs-순수 트랙판정 불가 / 그 완전성은 gate#0 검증기 책임). + **미룬-항목 finding**(finding-system / phase:input·severity:low) — 미룬 산출물 목록 + "시작 baseline scoped to X, per-scope에서 BR/도메인 더 surface" 정직 노트. within-artifact 불완전성(예: BR 12 vs 40 / gate#0 완전성 미검사) 정직화 + bc-rollup의 deferred-tracking 갭 동시 해소.
- **③ 라우터 3-상태 + surface reword**: UserPromptSubmit — 분석 0→`analysis-default`(floor부터/draft-first) / 분석 일부 있으나 floor 미완→`analysis-floor-incomplete`(빠진 floor만 마저) / floor 완성→discovery. SessionStart cold-start surface + analysis-input-collection SKILL.md를 "핵심 floor부터(전체 ~21종 아님)→per-scope 심화"로 reword. (minimalSubsetPresent를 floor-incomplete 분기에 배선 = helper load-bearing.)
- **점진 심화 = 기존 재활용**(신규 0): `analysis-scope-carve`(경계 reference-lens) + `bc-accumulator-rollup`(멱등 per-BC upsert / 재실행=deepen / sibling 보존).

## 결정론 axis (STRONG-STOP)
- `minimalSubsetPresent` = fs 존재 + 상수 파일명만(LLM inject ❌). advisory 신호 / 어떤 결정적 gate에도 inject ❌.
- 라우터 routeNote/surface = additionalContext(display-only). deferred finding = finding-system reference-lens.
- **스키마 변경 0 / 새 state 필드 0 / 새 analysis mode 0** (Senior "1 helper + 1 finding + 문서/reword" 라인).

## 검증
- ai-context-layout 유닛 18(minimalSubsetPresent +9: AND / OLD alias / 부분누락→false / OR↔AND 구분 / inventory 미포함 / 가드) + router-analysis-aware 3-상태(floor-incomplete 추가) + chain-driver **772/772 회귀 0**(v0.85.0 단일-산출물 present→discovery 단언을 full-floor로 정정).
- **≥2 PoC 교차 corroboration** (§8.1 / scratchpad 복사 / 커밋 PoC 불변): poc-18(Modern TS/BE) + poc-19(Python) — full floor→discovery / floor 3종 제거(나머지 analysis 잔존)→floor-incomplete / `discovery-extraction-validator` floor(rules+domain) grounding 실행(poc-19 findings 0 = floor 완전 충분). 교차 패러다임으로 floor가 Java-specific 아님 입증.
- 3-way 0.86.0 + CLAUDE.md R2 + README 동기 + release-readiness 43/43.

## Carry
- floor 충족 시 자동으로 deferred finding emit 되게 하는 결정론 강제는 없음(스킬 양심 의존) — adoption 실측 후 필요하면 finding emit 의무를 gate화 검토(단 advisory axis 유지).
- 트랙 조건부 산출물(openapi/schema/FE) 완전성은 gate#0 검증기 책임으로 남김(probe 범위 밖).
