# research — codegraph wiring STEP 4 (3-agent + 실 DB probe)

> 4원칙 STEP 2. plan = `plan-codegraph-step4.md`. 가벼운 sub-agent 전략(time-cap / 우선순위 read). no-simulation.
> 3-agent: 공식문서(F-015) / 업계사례 / Senior 적대 + 실 `.codegraph` DB probe (Senior 선결 점검).

---

## 1. 공식문서 (VERIFIED / raw fetch / F-015)

- **codegraph `NODE_KINDS` (src/types.ts raw)**: `file/module/class/struct/interface/trait/protocol/function/method/property/field/variable/constant/enum/enum_member/type_alias/namespace/parameter/import/export/route/component` (22종). → ast_symbol 타깃 kind(`class/interface/function/method/enum`) 전부 실재. `enumerateNodes(db,['class','interface','function','method'])` 확장 = 공식 정합. 언어 java/typescript/kotlin 지원.
- **symbol-existence/dead-code/orphan 내장 CLI/API = 부재** (README raw): CLI=index/sync/status/query/files/callers/callees/impact/affected/serve. JS API=searchNodes/getCallers/getCallees/getImpactRadius/buildContext. → **직접 SQLite set-diff 가 유일 경로** (STEP 2 carry 라인 재확인).
- **Edge** `provenance?:'tree-sitter'|'scip'|'heuristic'` optional / `resolvedBy`·`confidence` Edge·Node 인터페이스 부재 → STEP 3 carry 정합 (STEP 4 도 provenance 미사용 = 무영향).
- **선례**: Figma **Code Connect** = non-existent node-id 검증이 **미구현 오픈이슈(#337)** → STEP 4 set-diff 가 오히려 그들이 못 한 걸 먼저 해결. SCIP/LSIF = "re-index 후 set-diff" 가 정석 패턴 (STEP 4 freshness 배너 + 재인덱싱 의존과 동형). LSP workspace/symbol = live server 라 비해당.
- ⚠ caveat: extractor 개별 파일 404 미확인 → "실 DB 에서 kind 확인 권고" → **§2 probe 로 해소함**.

## 2. 실 `.codegraph` DB probe (no-sim / Senior 선결 점검 / 본 세션 직접)

| 도메인                  | DB                                                          | class | interface | method | function | qn 예시                                                            |
| ----------------------- | ----------------------------------------------------------- | ----- | --------- | ------ | -------- | ------------------------------------------------------------------ |
| RealWorld (Spring Java) | `spring-boot-realworld-example-app/.codegraph/codegraph.db` | 141   | 16        | 415    | 0        | `io.spring.core.article::ArticleRepository` / `Pkg::Class::method` |
| ecommerce (NestJS TS)   | `ecommerce-backend/src/.codegraph/codegraph.db`             | 66    | 1         | 189    | 7        | `AccessJwtAuthGuard::canActivate` / `AppModule`                    |

- **결론**: 양 도메인 class/method 풍부 → probe true-positive arm(실존 심볼) 충분. 2-도메인 mechanism corroboration 가능.
- **정규화 nuance (설계 디테일)**: `normalizeSymbol` 은 끝 2 세그먼트 → Java `io.spring.core.article::ArticleRepository` → `article.ArticleRepository`. ast_symbol 앵커가 `ArticleRepository`(1seg) 면 mismatch / `ArticleRepository.findById` 면 match. → codegraph 심볼 Set 을 **정규화 qn + bare name 둘 다**로 빌드해야 class-level 앵커도 매칭. (해결 가능 / 시행 시 반영.)
- ecommerce DB 경로 = `.../src/.codegraph/...` (src-relative / STEP 3 경로차 동일).

## 3. 업계 (cautious — defer-until-burden 신호)

- **ReqToCode**(arxiv 2026): 함수단위 추적성은 safety-critical(ISO26262/DO-178C)에서 채택. 패턴 = "Traceable 자동생성 + **앵커참조 수동** + stale-on-compile". "어디에 구현돼야 하는가 자동탐지 불가"를 논문이 한계로 인정.
- **SCIP**(Sourcegraph): 심볼단위 코드탐색 성숙. 단 stale = **재인덱싱 의존**(증분 미구현 / planned).
- **Figma Code Connect**: 함수단위 앵커 채택했으나 유지 수동 + stale 탐지 부재 + 초기비용 높음. 대규모 잦은 rename 환경 부담.
- **Knip**: 심볼단위 dead-code 탐지 production(Vercel 30만 줄 삭제). 단 **코드→코드** dead symbol 이지 요구사항→함수 앵커 아님.
- **SpecMap**(arxiv 2025): symbol-level 추적성 = 아직 "LLM 근사치".
- **synthesis**: (α)자동제안 = production ROI 사례 없음 = gold-plating 위험. (β)stale 탐지 = Knip 이 코드↔코드는 커버(요구사항↔함수는 공백). **함수단위 추적성 자동화 가치 = 파일앵커 유지부담 실측 전까진 carry 가 업계 패턴과 정합** (=defer 신호).

## 4. Senior 적대 (REVISE → 4-A minimal / 신뢰도 0.84)

4 plan 주장 전부 실소스 검증 (no-sim):

1. negative-space 정확 (`validator.js:204` symbol 검증 외부 = warn-only) — 진짜 wiring.
2. 스키마 완비(code-pointer) = 스키마 아닌 메커니즘 문제 = plus(drift 표면 0).
3. `collect.js:14` symbol 평탄화 = provenance 소실 = `collectSymbolAnchors` 진짜 net-new.
4. **federator `symbolsInFile`(federator.js:233,476) = (α) 거의 정확 중복** / Windows-fix(v12.0.1) 됨.

판정:

- **Q1 fork → 4-A** (β verify), NOT 4-B/4-C-default. **4-C(defer)는 "다른 방향의 부정직"** — validator.js:204 symbol-blind 공백은 **앵커 수와 무관하게 오늘 실재**하고 STEP 5/6 이 안 채움.
- **Q2 vacuous → real-symbol probe = 정당 corroboration** (STEP1 route 0/19 동형 / 실 CLI+실 DB no-sim). 단 "§8.1 2-도메인 data-corroborated"라 STEP1~3 처럼 말하면 **부정직** → **mechanism-corroboration only / in-the-wild stale=0 unverified** 로 표기. **최대 정직 리스크 — gate flag.**
- **Q3 jurisdiction → (α) = federator/navigate 소관, 이미 구현. codegraph-coverage 에 (α) 지으면 잘못된 집 = 재작업 + 심볼열거 코드 2벌. (α) 전면 cut → 4-B·4-D 도 동반 소멸.**
- **Q4 scope → 6산출물→1축(`--verify-anchors`)**. carry: (α)제안·(γ)skill emit·traceability dead-cell·artifact-graph blast-radius. 칼날 trajectory 6→1 정합.
- **Q5 check37 → STEP3 4-part isomorphic 충분 + informational_notes split verbatim 재사용. 추가: `--verify-anchors` 리포트가 `REQUIRED_VALIDATORS_PER_STAGE` 미등록임을 가드에 명시**(plan §6.7 누락).

## 5. 수렴 결론 (gate #3 입력)

- **방향**: research 가 **4-A minimal (단일 축 `--verify-anchors` / (α) federator-소관 cut / β stale-anchor verify)** 로 수렴. Senior 0.84 GO-with-revise.
- **긴장 (사용자 결단 사항)**: Senior = "오늘 실재하는 validator 공백 → 지금 wire" vs 업계 = "함수앵커 유지부담 실측 전까진 carry". 둘 다 **"mechanism-only / in-the-wild=0 정직표기"** 에는 동의. → **do-now(4-A) vs defer(4-C)** = 품질·ROI 판단으로 사용자 결단.
- **정직 제약 (절대)**: §8.1 = mechanism corroboration (real-symbol probe 2-도메인) only. "STEP1~3 식 data-corroboration" 주장 ❌ (fake corroboration / commit-block 꼼수 회피 = feedback_commit_block_no_cheat).
- **scope cut**: (α)제안·(γ)emit·dead-cell·blast-radius = carry. 1축만.
- **trust**: check37 4-part isomorphic + REQUIRED_VALIDATORS_PER_STAGE 미등록 가드.

## 6. Lessons (research 단계)

- STEP 4 ≠ STEP 1~3 역방향 복붙. 실데이터(ast_symbol=0) + 소관(federator α 중복) 이 scope 를 1축으로 강제.
- 업계는 함수단위 추적성 자동화에 신중(defer 신호) / Senior 는 validator 공백의 즉시성 강조 → gate 가 do-now vs defer 를 정직히 분기.
