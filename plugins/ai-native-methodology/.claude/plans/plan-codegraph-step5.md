# plan — codegraph wiring STEP 5 (context-cache 증분 / v12.13.0)

SSOT = `decisions/DEC-2026-06-03-codegraph-deliverable-wiring.md` §5 STEP 5 ("context-cache·code-graph.json (2) / lens I/A — 이미 실현된 통합 확장").
4원칙: 본 plan (#1 깊은 숙지) → research-codegraph-step5 (#2 3-agent 적대) → 사용자 일괄 위임 ("스탭5 수행→커밋만") = gate #3 standing go → 착수.

## 1. 깊은 숙지 (실측 grounding)

- **context-cache = `tools/context-federator` 산출물.** dep-graph(navigate) × codegraph(callers/impact/symbolsInFile) × data_refs(sql-inventory) join. DEC §4-2 "codegraph 통합 일부 이미 실현(context-cache via context-federator) — 완전 신규 아닌 증분". → STEP 5 = federator 확장 (STEP 1~4 의 codegraph-coverage 확장과 다른 도구).
- **현 코드 neighborhood = 2-방향만**: `attachCallersImpact` 가 symbol 에 `callers`(상류 1-hop) + `impact`(하류 transitive blast). **`callees`(하류 1-hop / 내가 호출하는 협력자) 부재.**
- ★ **codegraph 0.9.7 실 CLI 에 `callees <symbol>` 존재** (실측 probe). `callers` 와 byte-동형 출력: `{symbol, callees:[{name,kind,filePath,startLine}]}` → 기존 `mapSymbolNode` 그대로 매핑. SQLite edge 유도 불필요 = CLI-native 최소증분.
  - 실 probe (RealWorld): `MyBatisArticleRepository.createNew` → callees = findTag/insertTag/insertArticleTagRelation/insert(ArticleMapper) + Article(ctor) = 정확히 "이 메서드 수정 시 알아야 할 직접 협력자". P0(재사용) reading-aid 가치 직결.
- **trust 경계**: context-cache 는 이미 reference-lens / **non-gating** (gate-eval/findings-aggregator/release-readiness 미배선 / meta.trust_note 의무 / severity 필드 자체 없음 = finding 채널 아님). callees 추가도 같은 채널.
- ★ **release-readiness 에 federator trust 가드 부재** (실측: grep 0). check34~37 은 codegraph-coverage 만 가드. STEP 5 = federator 의 첫 trust 가드(check38) 신설 = 실재 gap 폐색.
- **§8.1 narrowing 규율**: STEP1 11→2 / STEP2 5→2 / STEP3 4→1 / STEP4 6→1. → STEP 5 도 **1 메커니즘 = callees** 로 수렴. DEC §5 STEP 5 의 2번째 산출물 **code-graph.json self-coverage/edges_by_type = carry** (secondary 산출물 cut 선례 동형 / Senior 확인).

## 2. 시행 범위 (minimal core 후보 = callees enrichment 1축)

1. `federator.js`:
   - `makeCodegraphAdapter`: `callees: (s) => cgReadJson(exec, callees ... --json)` 추가 (callers 정확 analog).
   - `attachCallersImpact` → callees 부착 (withCallees 게이트 / callers 대칭). symbolsInFile(strict_path) 심볼에도 동형 부착.
   - `federate` opts `withCallees=true` + stats `callees_resolved` (해소율 component / "callees 노출" 정량).
2. `context-cache.schema.json`: code_refs.symbols.items.properties 에 `callees` (array of $defs/symbolRef / callers 와 byte-동형) + stats.callees_resolved (integer) additive.
3. `cli.js`: `--no-callees` flag (--no-callers 대칭) + withCallees 전달 + stderr 요약 callees 표기.
4. `release-readiness.js` **check38** `context_cache_reference_lens_trust` (federator 첫 가드 / check34~37 4-part isomorphic):
   - ① gate 모듈(gate-eval/findings-aggregator) 에 context-federator/federate/callees 토큰 0 + REQUIRED_VALIDATORS_PER_STAGE 미등록
   - ② context-cache.schema.json meta.trust_note required + 'NOT gate-injected' 의미 + symbol/code_refs 어디에도 severity 필드 부재(finding 채널 아님 구조 차단)
   - ③ federator.js reference-lens 라벨 + gate 모듈 import 0
   - ④ federator 가 release-readiness gating 목록/REQUIRED_VALIDATORS 밖 (non-gating 불변)
5. tests: `federator.test.js` callees 케이스 (부착/--no-callees 생략/symbolsInFile 경로 심볼/stats.callees_resolved/델타 carry 시 미호출). fakeCodegraph 에 callees 추가.

## 3. §8.1 정직 — 2 distinct 도메인 실 dogfood (no-simulation)

- RealWorld(Spring+MyBatis3) `_dogfood-realworld/spring-boot-realworld-example-app` (codegraph DB = repo-root/.codegraph) + ecommerce(NestJS+Prisma) `_dogfood-ecommerce/ecommerce-backend` (codegraph DB = src/.codegraph → --codegraph-project src).
- 실 `context-federator artifact-graph.json --codegraph-project ... --out` 재생성 → callees 비어있지 않은 pack 실측 + schema-valid + 기존 callers/impact 무회귀.
- callees 가 heuristic-provenance edge 의존 시 정직 carry note (STEP 2 call provenance null 압도 인지 / non-gating 이라 무해하나 표기).

## 4. 검증 게이트

codegraph-coverage test 무회귀 + context-federator test (callees 추가) + workspace 전체 0 fail + release-readiness 37→38 (self-test) + version 3-way 12.13.0 + build dist + 실 Ajv(context-cache schema callees valid / severity 주입 INVALID 회귀가드) + 2-도메인 실 dogfood.

## 5. 처분

커밋만 (사용자 명시 "커밋만 / no release·tag·push"). 이후 STEP 6 바로 진입.

## Lessons (실패 시 기록)
- (없음 — 진입)
