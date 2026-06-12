# DEC-2026-06-12-golf-chain-validator-wiring

**상태**: 채택 (v0.42.0 MINOR)
**일자**: 2026-06-12
**유형**: 본체 결정론 검증기 wiring 수정 (3건) — dogfood 노출
**SSOT plan**: `~/.claude/plans/plan-golf-chain-body-candidates.md`

## 맥락

ep-be-gea campaign(전체 프로젝트 AX 컨텍스트 생성)의 예약 메뉴그룹 1번 **golf(BC-RESV-GOLF)** 를
analysis→discovery→spec→plan→test→implement **5 chain 풀런** dogfooding. golf 는 fresh 분석(구 b5538d83/.bak 미복구).
풀런이 노출한 **방법론 본체 결정론 검증기 wiring 결함 3건**을 마지막에 일괄 적용 (사용자 지시: "본체 후보 기록 + 마지막 chain 까지 + 모은것 적용").

전부 **event·golf 2 도메인 동일 = 구조적**(단일 PoC 과적합 아님 / §8.1). 공통 뿌리 = BR-split index(DEC-2026-06-09) + 2-zone(DEC-2026-06-12-artifact-zone) 도입의 검증기 미스윕.

## 수정 (BC-1 / BC-3 / BC-5)

### BC-1 — discovery-extraction-validator CLI 가 BR-split index 미재조립
- 증상: `--rules <index>`(`{bc_files:[...]}`) 전달 시 raw `loadJson` → `business_rules` 배열 부재 → 0건 추출 → false HIGH `discovery.br_source.shape_unrecognized`.
- 수정: `cli.js` `--rules` 로드를 index-aware `_shared/loadBusinessRules` 로 교체 + `{business_rules:[...]}` 정규화 (br-cross-validator 와 동일 패턴 / index→per-BC leaf 재조립 / 옛 flat 투명 수용).
- 검증: golf discovery **index 입력** high 0(was HIGH) / event leaf 무회귀. 엔진 = `chain-driver/test/load-business-rules-split.test.js` 기존 커버.

### BC-3 — findings-aggregator 가 graph-integrity-validator arg case 누락 → 항상 evidence_missing
- 증상: gate#5(implement) `graph-integrity-validator: evidence_missing`(event·golf 동일). REQUIRED.implement 등재인데 **실제로 안 돌던 조용한 공백**.
- 근인: `findings-aggregator/cli.js` buildValidatorArgs 에 명시 case 부재 → default `['--target', …]`. graph-integrity 는 positional `<artifact-graph.json>` 계약 → `--target` 오인 → 무출력.
- 수정: `case 'graph-integrity-validator': return [O('artifact-graph.json'), '--format', 'json'];` (code-pointer 와 동일 resolver 재사용).
- 검증: golf·event gate#5 graph-integrity **evidence_missing→ok** / 신규 단위테스트 `build-validator-args.test.js`(66→67). **노출 가치**: 작동 즉시 golf graph orphan 5 적발 → BC-5 발견.

### BC-5 — graph-synthesizer analysisCandidatePaths 가 cross-BC 분석노드 누출
- 증상: BC-3 작동 후 golf artifact-graph orphan 5(high). 그 중 `formal-spec`·`characterization` 은 **golf 부재**(event 것이 누출).
- 근인: `traceability-matrix-builder/cli.js` `analysisCandidatePaths` 가 모든 `domains/<BC>` 를 후보 base 로 스캔 → golf 가 없는 formal-spec 을 찾으며 `domains/BC-EVENT/` 채택 = cross-BC 누출. `--scope-id` 있는데 domain 후보 scope 필터 미적용(v0.41.0 zone sweep 잔여 미스윕).
- 수정 ①(합성기): `analysisCandidatePaths(..., scopeBc)` — scopeBc(`BC-${scopeId.toUpperCase()}`) 주어지면 domains/ 후보를 자기 BC 로만 제한(flat·shared 유지). scopeBc 미지정=전 BC(무회귀).
- 수정 ②(golf chain): discovery cross_links 에 architecture·schema·error-mapping(shared / golf 실사용 = DB always-on) 추가 → 나머지 3 shared orphan 링크.
- 검증: golf graph **orphan 5→0**(passed) / event 무회귀(0→0) / traceability 179 무회귀.

## carry (수정 ❌)

- **BC-2** — drift-validator 가 spec/test/implement 에서 evidence_missing. 진단: drift 의 `--check-*` 는 전부 **메서드론 workspace**(`flows/analysis.phase-flow.json`) root 요구 = plugin 내부 layout 검증기 / user-project chain gate 아님. user-project evidence_missing = 사실상 N/A(정확). REQUIRED 에서 제외 여부 = gate-eval/chain-driver 동기화 영향 = **설계결정 deferred**(§8.1).
- **BC-4** — static-runner evidence_missing(--plugin 부재). R19 Tier-2 environment-dependent 정직 carry(Semgrep/PMD 미실행·미import). 강제 주입 = no-simulation 위배. **수정 대상 아님**.

## golf chain dogfood 결과 (외부·commit=ep-be-gea repo)

5 chain 전부 **critical 0 / high 0**: discovery(7 UC·24 BR-intent·UC→BR 100%) / spec(7 BHV·25 AC·chain-coverage 100%) / plan(13 TASK·plan-coverage 0 / 3 ADR·5 risk·4 NFR) / test(spec-test-link AC→TC 100% / **실 JUnit 8 method GREEN** = 6 AC characterization + 19 ceiling carry) / implement(matrix 25 cell green 25·forward·backward 100% / artifact-graph 153 node 0 orphan / real_integration_score 0 = Mockito honest). operability 천장 = god-method + SQL-embedded(DEC-2026-06-12-sql-embedded-reframe 정합).

## §8.1 / 무회귀

- 3 수정 = event·golf 2 도메인 동일 구조 결함(과적합 아님). BC-2/4 = carry(설계결정·R19).
- 검증: discovery-ext 43 / aggregator 67(+1) / traceability 179 / chain-driver 523 무회귀 + **release-readiness 42/42**.

## Relates
- `DEC-2026-06-12-artifact-zone`(2-zone / BC-5 미스윕 모) · `DEC-2026-06-09-br-split-step3`(index / BC-1 모) · `DEC-2026-06-12-sql-embedded-static-residual-reframe`(golf test operability 천장) · `DEC-2026-06-06-analysis-exit-gate`(findings-aggregator) · `DEC-2026-06-06-tool-allowlist-pmd-only`(BC-4 static-runner R19).
