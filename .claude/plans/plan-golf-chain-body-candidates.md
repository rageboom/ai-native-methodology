# golf chain 풀런 — 본체 후보 누적 원장 (campaign)

> ep-be-gea golf(BC-RESV-GOLF) 를 analysis→discovery→spec→plan→test→implement 풀런하며
> dogfooding 이 노출한 **방법론 본체 수정 후보**를 누적. **마지막 chain 후 일괄 적용**(사용자 지시 2026-06-12).
> 정책: dogfood 발견 = 기록 + 계속 진행 / §8.1 단일 PoC 과적합 회피 / diagnose-before-design.

## 적용 규칙 (마지막에)
- 각 BC 후보: 실측 재현 → 기존 자산 대조(이미 해소됐나) → 최소 수정 → 검증기 test 갱신 → release-readiness.
- 본체 격상 우선(schemas/tools/methodology-spec) > PoC 산출물.
- 적용 후: 전체 test 무회귀 + release-readiness 42/42 확인.

---

## BC-1 — discovery-extraction-validator CLI 가 BR-split index 미재조립 (chain1 발견)

- **증상**: `discovery-extraction-validator --rules <index>` (BR-split index = `{bc_files:[...]}`) 전달 시,
  CLI 가 raw `loadJson` 으로 읽고 `normalizeAnalysisBusinessRules` 에 넘김 → index 는 `business_rules` 배열이
  없어 0건 추출 → `unrecognizedShape=true` → **false HIGH `discovery.br_source.shape_unrecognized`**.
- **근인**: `tools/discovery-extraction-validator/src/cli.js:36` `rules: args.rules ? loadJson(args.rules) : null`
  = raw 파싱. 반면 `tools/_shared/load-business-rules.js` 의 `loadBusinessRules()` 는 index→per-BC leaf
  재조립을 이미 제공(br-cross-validator 가 사용). discovery-ext CLI 만 index-aware loader 미사용.
- **비차단 이유**: 공식 러너 findings-aggregator 의 `resolveBusinessRules` 는 per-BC **leaf** 우선 →
  실 gate#1 은 leaf 를 받아 GREEN(critical 0/high 0). CLI 직접 호출(index)만 false HIGH.
- **수정 후보**: discovery-ext CLI 의 `--rules` 로드를 `loadBusinessRules`(index-aware, _shared)로 교체.
  index/leaf/flat 3-shape 투명 처리. + 검증기 test 1건 추가(index 입력 → 24 BR 정상 인식).
- **§8.1**: index 미재조립은 BR-split(DEC-2026-06-09) 도입의 미스윕 = 결정론 결함(과적합 아님). 2 도메인(event leaf·golf) 정합.
- **status**: OPEN (chain1 / 2026-06-12)

---

## BC-2 — findings-aggregator 가 drift-validator 를 spec 단계에서 `--check-*` flag 없이 호출 (chain2 발견 / 선재·event 동일)

- **증상**: gate#2(spec) 에서 `drift-validator: evidence_missing`. aggregator `buildValidatorArgs` (cli.js:254-255)
  가 `['--target', projectDir, '--json']` 로 호출하는데, drift-validator 는 `--check-layout` /
  `--check-chain-layout` / `--check-state-flow-consistency` / `--check-handoff-consistency` 중 하나의
  **check flag 필수**. flag 부재 → 출력 없음 → aggregator failClosedOnNull → evidence_missing.
- **선재 확인**: event scope spec gate#2 도 **동일하게** drift evidence_missing (golf 회귀 아님 / 구조적).
- **비차단**: gate#2 는 critical 0/high 0 면 통과(EXIT 0) — drift evidence_missing 은 다른 3 validator(chain-coverage·
  formal-spec-link·schema) ok 면 비차단. 단 drift 검증이 **실질 미수행**(spec 단계 drift 신호 0) = 조용한 공백.
- **수정 후보**: aggregator spec(및 해당 stage) drift 호출에 적정 `--check-chain-layout`(또는 stage 별 적합 check)
  flag 부여 → drift 가 실제로 돌게. 또는 stage 별 drift 미해당 시 REQUIRED_VALIDATORS 에서 제외(정직).
- **§8.1**: event·golf 2 도메인 동일 = 구조적(과적합 아님). 우선순위 = BC-1 보다 낮음(비차단·선재).
- **재분류 (적용 단계 진단 / 2026-06-12)**: drift-validator 의 `--check-*` flag 는 전부 **메서드론 workspace**
  (`flows/analysis.phase-flow.json`)를 root 로 요구 → 사용자 프로젝트(ep-be-gea) 대상 시 "could not locate
  workspace root". 즉 drift 는 **plugin 내부 layout 검증기**(workflow↔skills↔manifest)이지 user-project chain
  gate 가 아님. → spec/test/implement REQUIRED 에서 evidence_missing = **사실상 N/A(정확)**. "check flag 부여"
  fix 는 무의미(workspace 못 찾음). 진짜 결정 = REQUIRED_VALIDATORS 에서 drift 제외 여부 = **더 큰 설계결정**
  (gate-eval/chain-driver 동기화 영향) → §8.1 신중·deferred.
- **status**: CARRY (reclassified — drift=workspace-internal / REQUIRED 제외는 설계결정 deferred / no clean fix now)

## BC-3 — findings-aggregator 가 graph-integrity-validator 의 arg case 누락 → 항상 evidence_missing (chain5 발견 / 선재·event 동일 / **결정론 본체 버그**)

- **증상**: gate#5(implement) 에서 `graph-integrity-validator: evidence_missing`. event·golf 동일.
- **근인**: `findings-aggregator/src/cli.js` buildValidatorArgs 에 **`graph-integrity-validator` 명시 case 부재**
  → `default: ['--target', projectDir, '--json']` 로 떨어짐. 그러나 graph-integrity-validator 는
  **positional `<artifact-graph.json>`** 를 요구(`usage: graph-integrity-validator <path-to-artifact-graph.json>`)
  → `--target` 를 positional path 로 오인 → 파싱 실패/무출력 → aggregator failClosedOnNull → evidence_missing.
- **대조**: 바로 옆 `code-pointer-validator` 는 명시 case 보유(`O('artifact-graph.json') --repo-root ... --strict`) → ok.
  즉 aggregator 는 artifact-graph 경로를 이미 `O('artifact-graph.json')` 로 해석 가능한데 graph-integrity 만 누락.
- **수정 후보**: buildValidatorArgs 에 `case 'graph-integrity-validator': return [O('artifact-graph.json'), '--format', 'json'];`
  추가. (code-pointer 와 동일 경로 resolver 재사용 / graph-integrity 는 --repo-root 불요). → graph cycle/orphan/unknown
  검증이 실제로 gate#5 에서 작동.
- **§8.1**: event·golf 2 도메인 동일 = 구조적 결정론 버그(과적합 아님). REQUIRED.implement 에 등재돼 있으나 실제로 안 돌던 검증기 = 조용한 공백 해소. **BC-1 과 함께 적용 1순위**.
- **status**: OPEN (chain5 / 2026-06-12)

## BC-4-note — static-runner evidence_missing (chain5 / **no-fix = R19 정직 carry**)

- **증상**: gate#5 `static-runner: evidence_missing` (event·golf 동일).
- **근인**: aggregator 가 `static-runner --target projectDir --json` 호출하나 static-runner 는 `--plugin <semgrep|pmd>`
  (실행) 또는 `--import-sarif` (import) 필수. plugin/SARIF 미지정 → 못 돎 → evidence_missing.
- **판정**: **수정 ❌ (by-design / R19 Tier-2 environment-dependent carry)**. 정적도구(Semgrep/PMD) 미실행·미import 환경에서
  evidence_missing 은 **정직 신호**(날조 금지 R19). 강제로 --plugin 주입 = 도구 부재 시 실패 / 시뮬레이션 유혹.
  사용자가 자기 환경서 PMD 돌려 SARIF import 하면 채워짐. → **본체 수정 대상 아님 / carry 기록만**.
- **status**: CLOSED-as-carry (no action)

## BC-5 — graph-synthesizer analysisCandidatePaths 가 cross-BC 분석노드 누출 (BC-3 이 노출 / **zone scope 필터 누락 / v0.41.0 미스윕**)

- **증상**: BC-3 적용 후 graph-integrity 가 작동 → golf artifact-graph 에 **orphan 5**(high) 노출.
  그 중 `analysis-formal-spec`·`analysis-characterization-spec` 은 **golf 에 없는 산출물**(event 것이 누출).
- **근인**: `traceability-matrix-builder/src/cli.js` `analysisCandidatePaths` 가 `listDomainBcDirs` 로
  **모든 domains/<BC> 를 후보 base 로 스캔** → golf(scope=resv-golf) graph 합성 시 formal-spec 을 찾으며
  domains/BC-EVENT/formal-spec.json 을 첫 매치로 채택 = cross-BC 누출. `--scope-id` 가 있는데 domain 후보를
  scope BC 로 제한 안 함(v0.41.0 zone 보강 시 scope 필터 미적용).
- **수정 후보 (2부)**:
  ① 합성기: `analysisCandidatePaths(..., scopeBc)` — scopeBc(=`BC-${scopeId.toUpperCase()}`) 주어지면
     domains/ 후보를 **해당 BC 만**으로 제한(flat·shared 는 유지). event 무회귀(자기 BC 매치).
  ② golf chain: discovery cross_links.to_analysis_artifacts 에 **architecture·schema·error-mapping**(shared / golf 실사용
     입력 = DB always-on 정책) 추가 → 나머지 3 orphan 링크. (formal-spec/characterization 은 golf 부재 → ①로 미생성.)
- **§8.1**: zone(domains/<BC>) 다중 BC 누적 시 scope 필터 부재 = 결정론 누출(과적합 아님 / event·golf 2 BC 실증).
  v0.41.0 zone-aware sweep(traceability/codegraph)의 잔여 미스윕 = 동일 계열 마무리.
- **status**: OPEN (chain5 / BC-3 파생 / 적용 1순위 합류)

## golf chain 풀런 완료 (2026-06-12)
- analysis(#0) → discovery(#1) → spec(#2) → plan(#3) → test(#4) → implement(#5) **전부 critical 0 / high 0**.
- 적용 1순위 = **BC-1**(discovery-ext index-aware) + **BC-3**(graph-integrity arg case). BC-2 = 낮음(선재 비차단). BC-4 = no-fix.
