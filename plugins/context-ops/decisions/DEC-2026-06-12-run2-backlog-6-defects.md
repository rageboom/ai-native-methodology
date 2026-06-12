# DEC-2026-06-12 — ep-be-gea run #2 backlog 본체 결함 6건 수정 + F-DOGFOOD-STORY-ORPHAN governance

> 상태: 채택 (구현·테스트 완료 / 미커밋) · plugin.json 0.37.0 → **0.38.0 MINOR** (behavior fix 6건 / schema additive·pattern 확장 / backward-compat)
> 트리거: ep-be-gea event run #2 가 건진 본체 결함 9건 중 high 3건(F-R2-35/40/32)을 v0.37.0 에서 처리 후, **나머지 6건(F-R2-07/01/28/29/41/44) 사용자 "A. 나머지 본체 결함 6건 처리" 결단**.
> 원칙: 품질1/재작업최소2 + diagnose-before-design(6 결함 병렬 진단 workflow / 전부 still_present 확인) + senior 적대검증(F-R2-01/29) + release-readiness count-coupling + chain-driver 결정론 axis 보존.

## 진단 (diagnose-before-design)

6 결함을 read-only workflow(Explore agent ×6)로 병렬 진단 → 전부 **still_present=True** (이미 해소된 것 없음). F-R2-07 은 agent 가 semgrep SSL(offline) 막혀 structured output 미산출 → main 이 직접 진단(실 scan). F-R2-01/29 는 senior 적대검증(GO 0.9 / 0.92).

## F-R2-07 (medium) — 번들 Semgrep 룰 PatternParseError

- **근인**: `tools/static-runner/rules/legacy-korean/interceptor-no-rbac.yml` 의 두 패턴이 Java 파싱 불가 → semgrep exit 2 → static-runner baseline 항상 실패. ① `$X.select$Y(...)` = 리터럴+메타변수 접합 ② `if (...AUTH...)` = 식 위치 ellipsis-identifier. (5룰 중 실 scan 으로 interceptor-no-rbac 만 범인 확정 / `--validate` 는 semgrep.dev 의존이라 offline 불가 → 실 scan 으로 bisect.)
- **수정**: 둘 다 `metavariable-regex` 로 의도 보존하며 교정 — `$X.$SEL(...)`+regex `^select` / `if ($COND){...}`+regex `AUTH`. 실증: ruleset 전체 5룰 scan **exit 0 / parse-error 0** / static-runner 48/48.

## F-R2-01 (medium / senior GO@0.9) — chain-driver init current_phase schema 위반

- **근인**: `state-store.js:30` DEFAULT_STATE `current_phase:'input.0'` ↔ `state.schema.json:31` pattern `^P\d+(\.\d+)*$`. senior 실측 — phase-flow node id(input.0/db-schema.0/discovery.1/input-integrate) **전부 FAIL**, P0/P4.4 만 PASS = schema pattern 이 phase-flow 체계와 불일치한 **orphan**. 전 코드 사용처가 semantic id 사용. chain-driver init/CAS write 가 항상 schema-invalid.
- **수정(택 b / senior 권고)**: schema pattern → `^[A-Za-z][A-Za-z0-9-]*(\.\d+)*$` (phase-flow kebab + optional .N / 구 P-style backward-compat 수용). (택 a=default 'P0' 변경은 첫 next write 에서 재위반 = 두더지잡기 → 기각.) 실증: `chain-driver init` 결과 state.json **schema-valid** / chain-driver 523 무회귀. **carry**: current_phase 의 runtime ajv 검증 부재(schema=self-doc / 본 결함이 지금 게이트 0개 차단) = release-readiness state parity check 추가 별도 판단.

## F-R2-28 (low) — work-unit-manifest stage enum 에 analysis 부재

- **수정**: `schemas/work-unit-manifest.schema.json` stage/current_stage/dependents.stage enum 3곳 모두 `analysis` 추가(additive). analysis stage work-unit 정직 표기 가능(구 stage=discovery 우회 해소). 무회귀(소비처 drift-validator state-flow=state.schema↔sdlc-flow 검사라 무관 / db-assets·aggregator additive 안전).

## F-R2-29 (medium / senior GO@0.92) — characterization-coverage-validator md-twin 강제

- **근인**: `validator.js:337-348` 이 `intent-vs-bug.md` 부재 시 무조건 high(`intent_vs_bug.missing`). SKILL 은 "intent-vs-bug.md twin 폐지 / ADR-011 json 단독" 명시 → ADR-011 위반 + skill↔validator drift.
- **수정**: §4 unconditional high 제거(md 존재 시만 ambiguous_carry OR 분기 보존=backward-compat) + §5 후 **medium `intent_vs_bug.entry_absent`**(entry.intent_vs_bug 객체 + md 둘 다 부재 시 — json SSOT 부재 정직 신호 / high→medium). spec 내장 intent_vs_bug 가 SSOT(schema top-level required + if/then ambiguous_carry / validator ambiguous_carry 검사는 entry OR md 이미 수용 = 약화 없음). 신규 positive 테스트 2(md 부재+entry 보유→0 / 둘 다 부재→entry_absent medium) / char-cov 22→24.

## F-R2-41 (medium) — test-impl-pass junit-xml report_path 단일파일 가정

- **근인**: `cli.js` report_path 가 디렉토리(gradle/JUnit5 클래스별·멀티모듈 XML)면 `readFileSync` → EISDIR. JVM 멀티모듈 미지원.
- **수정**: junit-xml + 디렉토리 감지 → `aggregateJunitXmlDir`(재귀 *.xml → parseJunitXml 개별 파싱 후 결정론 합산). 단일파일=기존 동작 byte-identical(무회귀) / 타 framework 단일 JSON 리포트 가정 유지. 실증: 2 XML 디렉토리(5 test)→pass 5(EISDIR 해소) / test-impl-pass 59/59.

## F-R2-44 (medium) — artifact-graph 합성기 UNIT-layer 미배선

- **근인**: cli 가 `chain.unitSpec` 을 로드하나 **synthesizeGraph 호출 객체에 unitSpec 미전달** + synthesizeGraph 가 destructure·미사용 = 반쪽 배선 → unit-layer TC(test_layer=unit/class_ref=UNIT-*)가 ac_ref 부재로 orphan. (STORY 절반은 직전 9b8d5238 에서 해소.)
- **수정**: cli synthesizeGraph 호출에 `unitSpec`+sourcePaths 추가 + graph-synthesizer 에 UNIT 노드(artifact_kind=chain/subkind=UNIT / subkind enum 무제약) + edge(BHV/AC→UNIT derived_from[unit_refs] / unit-TC→UNIT tests[class_ref]). additive(unitSpec 부재=zero-change). 실증: event 재합성 nodes 152→160(UNIT 8)·edges 258→295·**orphan 11→0**(cycle 0·unknown 0) / graph-synth 179 무회귀.

## B — F-DOGFOOD-STORY-ORPHAN governance (graph-integrity implement gate blocking 승격)

직전 세션이 코드만(commit 9b8d5238 / graph-synth STORY ref 해소 + graph-integrity-validator 를 gate-eval/aggregator/flows/SKILL implement gate REQUIRED blocking 으로 승격) 남기고 DEC 없던 gate-behavior 변경을 본 DEC 로 governance 기록. **dep-graph 무결성(cycle/orphan/unknown) = implement gate(full chain 6 layer 완성 시점)에서만 blocking** — 이전 gate#1~#4 는 하위 layer 부재로 orphan 오탐이라 skip / release-readiness #15 는 최종시점뿐이라 단계 gate 가 silent 통과하던 갭. F-R2-44(UNIT orphan) + STORY 해소로 정합 완성(event orphan 0). 0.38.0 release window 포함.

## §8.1 + 검증

- 6건 모두 behavioral threshold promotion 아닌 **구조적 결함**(룰 문법 / schema pattern orphan / enum 누락 / 반쪽 배선 / 단일파일 가정 / md-twin ADR-011 위반) = 코드 증명 + 1 PoC 정당. F-R2-44 UNIT 은 additive·opt-in(unitSpec 부재=zero-change)이라 §8.1 ratchet 무관.
- 테스트: static-runner 48 / traceability-matrix-builder 179 / test-impl-pass 59 / characterization-coverage 24 / findings-aggregator 61 / chain-driver 523 전부 GREEN. release-readiness 42/42.
- 변경 = static-runner(rule) + state.schema + work-unit-manifest.schema + char-cov-validator(+test) + traceability-matrix-builder(graph-synth+cli) + test-impl-pass-validator + DEC + INDEX + CHANGELOG + STATUS + CLAUDE.

Relates DEC-2026-06-11-aggregator-scope-aware-and-codeonly-relocate(run #2 high 3건 / 모) + DEC-2026-06-11-tdd-unit-layer-thread(F-R2-44 UNIT 층 모) + ADR-011(json 단독 SSOT / F-R2-29) + ADR-CHAIN-004(test-runner contract / F-R2-41) + feedback_diagnose_before_design_check_existing + feedback_self_recorded_fact_validation + feedback_chain_driver_deterministic_axis + feedback_release_readiness_count_coupling.
