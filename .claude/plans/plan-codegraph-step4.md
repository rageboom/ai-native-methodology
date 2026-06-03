# plan — codegraph wiring STEP 4 (impl/test `ast_symbol` 앵커 / 함수단위 추적성)

> 4원칙 STEP 1 (깊은 숙지 → plan). DEC-2026-06-03-codegraph-deliverable-wiring §5 STEP 4.
> 대상 산출물(초안): impl-spec · test-spec · acceptance-criteria · behavior-spec · code-pointer · artifact-graph · traceability-matrix (6) / 렌즈 = A(add field).
> 선행: STEP 1(v12.9.0 route/method coverage-hole) · STEP 2(v12.10.0 finding 채널) · STEP 3(v12.11.0 module dep coverage-hole) — **전부 미커밋**.

---

## 0. 한 줄 요약 / 핵심 긴장

STEP 4 의 테마 = **함수단위 추적성** — 현재 추적 앵커는 전부 **file-level(strict_path) 또는 glob**, **함수/심볼 단위(ast_symbol) = 0**. codegraph 가 가진 AST 심볼 인덱스로 이 공백을 채우는 것이 목표. 단 **실측 제약**(아래 §3)이 STEP 4 의 형태를 STEP 1~3 의 "역방향 set-diff" 단순 이식에서 갈라놓는다.

---

## 1. 깊은 숙지 — 실측 사실 (코드/스키마/dogfood 전수 확인)

### 1-1. codegraph-coverage 도구 현 구조 (STEP 1~3 자산)
- `enumerate.js` — `.codegraph/codegraph.db` SQLite 직접 read. `enumerateNodes(dbPath, kinds)` 가 **이미** 노드별 `name / kind / qualified_name / file_path / start_line / visibility / is_static / signature` 를 끌어옴 (kind 파라미터로 임의 kind 열거 가능). `enumerateEdges` 는 edge 전수. `checkIndexFreshness` 는 DB mtime vs source mtime (STALE 배너). no-sim: DB/Node<22.13 부재 = `available:false` → cli exit 3.
- `normalize.js` — **`normalizeSymbol("io.spring.api::ArticleApi::article") → "ArticleApi.article"`** (끝 2 세그먼트). ★ 주석에 **"ast_symbol 'ArticleApi.article' 와 동일 키로 수렴"** 명시 = STEP 4 를 이미 예견한 설계.
- `collect.js` — 산출물 ref 수집. **`eatCodePointers` 가 이미 `cp.symbol` 을 `refs.symbols` 로 수집**(`anchor_type` 무관). 단 **provenance 미보존**(Set 으로 평탄화 → 어느 산출물/어느 앵커에서 왔는지 소실).
- `coverage.js` — `buildMethodAxis` 는 method 노드 ∖ (refs.symbols ∪ refs.files). **정방향**(코드 method ∖ 산출물 = coverage-hole). method 의미성 게이트 = impl-spec 부재 시 unverified.
- `render.js` — `SEVERITY_CEILING=['low','medium']` + `pinSeverity` throw. `toFindings` 가 F-CGCOV-NNN + `code_graph_ref`.
- `finding-export.js` — coverage-hole → promote-ready finding (finding_id 미부여 / discoverer:'codegraph') + handler-set.
- cli `--axes` 기본 `['route','method','module']`. `--emit-findings` = STEP 2 채널.

### 1-2. code-pointer.schema.json — ★ STEP 4 스키마는 이미 존재
- `anchor_type` enum 에 **`ast_symbol` 이미 포함** (4종: strict_path/glob/ast_symbol/doc_link).
- `symbol` 필드 = `"SignupService.checkDup"` 식 식별자 (ast_symbol 일 때).
- **`stale:boolean`** + **`suggested_path`** 이미 존재 — "validator 가 path/symbol 미존재로 판단 시 true / ast_symbol 변경은 manual".
- → **스키마 additive 작업 거의 불필요**. STEP 4 는 스키마가 아니라 **검증/생성 메커니즘**의 문제.

### 1-3. ★ negative-space 확정 — code-pointer-validator 가 symbol 실재를 못 본다
`tools/code-pointer-validator/src/validator.js:187-209` (`anchor_type === 'ast_symbol'` 분기):
- `symbol` 필드 비었으면 high finding.
- `path` 존재만 `existsSync` 로 확인.
- **symbol 자체(예: `SignupService.checkDup`)의 실재는 검증 안 함** — 코드 주석 명시: **`"symbol 검증은 AST parser 외부 (warn-only)"`**.
- → **이 자리가 codegraph 가 채울 정확한 negative-space.** codegraph = AST 심볼 인덱스 보유 → dependency-free validator 가 구조적으로 못 하는 symbol-existence 검증을 reference-lens 로 제공.

### 1-4. artifact-graph / traceability 소비측 (DEC verdict 근거)
- artifact-graph-node: `code_pointers[]` 가 code-pointer.schema 그대로 평탄화. DEC = "stale-anchor 교차검증·navigate 코드 blast-radius(federator 일부 구현)".
- traceability-matrix: DEC = "leaf 실재성·dead-code green cell finding".
- context-federator: `makeCodegraphAdapter.symbolsInFile` **이미 존재** (파일→심볼 열거) — STEP 4 (α) 와 기능 중복 가능성 → 소관 경계 점검 필요.

---

## 2. STEP 4 의 3 sub-capability (DEC 6-산출물 verdict 분해)

| sub-cap | 내용 | 렌즈 | trust | 실데이터 corroboration 今 |
|---|---|---|---|---|
| **(α) 제안 (suggestion / reading-aid)** | file-level(strict_path) 앵커 → 그 파일의 public 심볼 열거 → **함수단위(ast_symbol) 앵커 후보 제시**. code-pointer `suggested_path` 패턴. | A/I | reading-aid (사람/LLM promote / inject ❌) | ✅ **가능** (strict_path 629/420/238 실존 + codegraph method 인덱스 2-도메인) |
| **(β) 검증 (verification / stale-anchor)** | 산출물의 ast_symbol 앵커 ∖ codegraph 심볼 = **dangling/stale anchor**. STEP 1~3 의 **역방향 set-diff**. validator 가 못 하는 symbol-existence. | I/N | reference-lens (finding) | ⚠ **vacuous** (ast_symbol 앵커 = 전 도메인 0) → 메커니즘만 real-symbol probe 로 입증 가능 |
| **(γ) 생산 (producer emission)** | skill/agent 가 ast_symbol 앵커를 산출물에 emit. | A | LLM-authored (codegraph 검증) | codegraph-coverage 도구 범위 밖 (skill 변경) |

---

## 3. ★★★ 핵심 제약 — 실측이 STEP 4 초안을 흔든다

전 dogfood 도메인 anchor_type 분포 (실측):

| 도메인 | strict_path | glob | **ast_symbol** |
|---|---|---|---|
| realworld (spring-boot-realworld) | 238 | 10 | **0** |
| realworld (java21-springboot3) | 0 | 0 | **0** |
| ecommerce-backend (NestJS+Prisma) | 420 | 40 | **0** |
| react-fsd (FE) | 17 | 0 | **0** |

**함의**:
1. **(β) 역방향 검증은 지금 검증할 입력이 0 = vacuous.** STEP 1 method-axis 의 "impl-spec 부재 = unverified" 함정과 동형 — ast_symbol 앵커 부재 = stale-anchor axis unverified. STEP 1~3 메커니즘을 그대로 역이식하면 **항상 "0 stale (검증할 앵커 없음)"** 만 나옴 = false-health.
2. **(α) 제안만이 현재 실데이터로 §8.1 corroborate 가능** — strict_path 앵커는 2+ 도메인에 풍부.
3. 즉 STEP 4 를 "STEP 1~3 의 역방향 복붙"으로 보면 **벽에 부딪힘**. 정직한 선택지 분기 필요.

---

## 4. 설계 선택지 (gate #3 결단 후보 — Senior 적대 검증 대상)

> 방법론 §8.1 + no-fake-corroboration(feedback_commit_block_no_cheat) 강제. "다음 의제 = 사용자 결단".

### 옵션 4-A — (β) 역방향 검증 메커니즘 구현 (codegraph-coverage 자연 확장)
- `--verify-anchors` 모드 신설: 산출물 `code_pointers[].symbol` 전수(provenance 보존 collect) ∖ codegraph 심볼 인덱스(method+class+interface+function kind) = stale-anchor finding.
- ★ **informational 대칭**: 심볼 미발견 = (a) 진짜 stale OR (b) codegraph 사각(iBATIS2 sql / 동적 dispatch / 미인덱스 언어) → STEP 3 `informational_notes` 패턴 재사용 (부재≠거짓).
- §8.1: 현 산출물 ast_symbol = 0 → **production 도메인 in-the-wild stale = 0 (unverified)** 정직 표기 + **메커니즘은 real-symbol probe 로 입증** (실 codegraph 에 존재하는 심볼 1 + 존재하지 않는 심볼 1 을 실 앵커에 주입 → live/stale 정확 분류 = true-positive + true-negative, no-sim). STEP 1 route-axis "0/19 true-negative" 프레이밍 동형.
- **장점**: codegraph-coverage 의 자연 대칭 확장 / check34~36 동형 가드 이식 용이 / 미래 ast_symbol 도입 시 즉시 가치.
- **단점**: 현 도메인 in-the-wild 입력 0 → "메커니즘 ready / 실가치 deferred" 정직 carry 불가피. Senior "vacuous feature now?" 공격 예상.

### 옵션 4-B — (α) 함수단위 앵커 제안 reading-aid (실데이터 corroboratable)
- `--suggest-anchors` 모드: leaf chain 산출물(AC/IMPL/TC/BHV)의 strict_path 앵커 → codegraph 가 그 파일의 public 심볼 열거 → **ast_symbol 후보 reference-lens** (사람/LLM 이 promote). suggested_path 패턴.
- noise 게이트: leaf 산출물 한정 + 파일당 심볼 cap + data-class/noise-method 필터(STEP 1 filters 재사용).
- §8.1: 2-도메인 strict_path 앵커 실데이터로 즉시 corroborate (함수단위 후보 실 산출).
- **장점**: 현 실데이터로 충분 corroboration / "함수단위 추적성" 테마 직접 bootstrap(앵커 생성 진입점).
- **단점**: ★ federator `symbolsInFile` 와 **기능 중복 위험** (소관 경계 = navigate 소비루프 vs coverage 도구?) / 제안 noise 폭증 위험 / "사람이 정말 promote 할까" 소비자 가치 의문 (Senior gold-plating 공격 예상).

### 옵션 4-C — STEP 4 defer, STEP 5/6 선행
- STEP 4 = ast_symbol 앵커 자체가 부재한 현 단계에선 저가치(검증=vacuous / 제안=중복위험) → **defer**.
- STEP 5(context-cache 증분 / 이미 실현된 통합 확장) 또는 STEP 6(Modern reading-aid) 가 실데이터·실소비자 가치 더 높음 → 순서 교체.
- **장점**: 정직(vacuous feature 회피) / ROI 높은 step 우선.
- **단점**: 로드맵 순서 이탈 (사용자 "STEP 4 진행" 의사와 충돌 가능 → gate 에서 명시 확인).

### 옵션 4-D — 하이브리드 (β 메커니즘 + α 최소 제안, 단계적)
- (β) 검증 메커니즘 ship (미래 대비) + (α) 는 "anchored 파일의 심볼 열거"를 **검증 리포트의 보조 reading-aid** 로만(독립 모드 ❌ / federator 중복 최소화) → 둘을 한 `--verify-anchors` 리포트로 통합.
- §8.1: (β) real-symbol probe + (α) 보조 열거 2-도메인.

---

## 5. 권장안 (plan 단계 가설 / research·Senior 가 검증·반증)

**잠정 권장 = 옵션 4-A (또는 4-D)**, 단 §8.1 정직 표기를 전제로:
- 근거: ① code-pointer-validator 의 **명시적 negative-space**(symbol 검증 외부)를 codegraph 가 채우는 것이 STEP 4 의 가장 정직한 "wiring" 정의 — 역방향 set-diff 는 STEP 1~3 의 진짜 대칭. ② (α) 제안은 federator `symbolsInFile` 와 소관 충돌 + 소비자 가치 불확실 → gold-plating 위험 높음. ③ 미래 ast_symbol 도입은 P0(AX 운영 / 함수단위 추적) 의 자연 귀결 → 메커니즘 미리 ready 가 합리.
- **단 (β) vacuous 리스크가 실재** → research 가 "지금 만들 가치 vs STEP 5/6 선행(4-C)"를 적대적으로 판정해야 함. **plan 단계에서 4-A 확정 ❌** — gate #3 에서 사용자 결단.
- §8.1 정직 = "production 도메인 ast_symbol 앵커 = 0 → in-the-wild stale 미관찰 / 메커니즘만 real-symbol probe 2-도메인 입증" (fake corroboration 절대 ❌).

---

## 6. 시행 설계 (옵션 4-A 채택 가정 / 변경 가능)

1. **collect 확장** — `collectSymbolAnchors(deliverables)` 신규: `code_pointers[]` 중 `anchor_type==='ast_symbol'` (또는 symbol 보유) 을 **provenance 보존**(`{symbol, normalized, artifact, anchor_path, node_id?}`) 배열로 수집. 기존 `collectRefs` 무변경(무회귀).
2. **enumerate kinds 확장** — `enumerateNodes(db, ['route','method','class','interface','function'])` — ast_symbol 후보 심볼 인덱스. 기존 route/method 호출 무회귀.
3. **anchor-verify 엔진** (`anchor-verify.js` 신규 / 순수): symbolAnchors ∖ codegraph 심볼 Set(normalizeSymbol 통일) = stale. 발견 = covered. 미발견 = stale-anchor.
   - ★ informational 분기: 미발견이 codegraph-blind 스택(iBATIS2 sql_id / 동적 / 미인덱스 파일=freshness-stale)일 가능성 → STEP 3 informational_notes 패턴 (severity 필드 부재 / finding 채널 진입 ❌ / 부재≠거짓).
4. **cli `--verify-anchors`** — 리포트 모드 (coverage 와 분리 / `--emit-findings` 동형 graceful). ast_symbol 앵커 0 = "unverified (no ast_symbol anchors)" note (false-health 회피 = method-axis 게이트 동형).
5. **finding** — `F-CGANCH-NNN` (또는 F-CGCOV namespace 재사용 검토) / severity low|medium ceiling / code_graph_ref 재사용.
6. **schema** — `code-coverage-hole.schema.json` 에 anchor-verify 섹션 additive (또는 별도 `code-anchor-verify.schema.json`). additionalProperties:false strict 유지.
7. **trust 가드 check37** — `codegraph_anchor_verify_reference_lens_trust` (RR 36→37 / check34~36 4-part isomorphic): ① gate-eval/findings-aggregator anchor-verify 토큰 0 ② schema informational severity 부재 ③ anchor-verify.js high/critical 리터럴 0 + 'not a defect' 마커 ④ gate 모듈 import 0.

---

## 7. §8.1 dogfood 계획 (no-simulation / 2 distinct 도메인)
- RealWorld(Spring+MyBatis3) + ecommerce(NestJS+Prisma) 실 `.codegraph` DB.
- (β) real-symbol probe: 각 도메인 strict_path 앵커 1개를 골라 (a) 실존 심볼 ast_symbol 앵커 1 + (b) 비실존 심볼 1 주입 → `--verify-anchors` 가 (a)=live (b)=stale 정확 분류 확인 (true-positive + true-negative).
- in-the-wild: 현 산출물 ast_symbol = 0 → "0 stale observed / unverified" 정직.
- (α 채택 시) strict_path 앵커 → 함수 후보 실 산출 2-도메인.

## 8. 검증 계획 (no-sim / 실 CLI)
- codegraph-coverage test += anchor-verify 단위 (probe true-pos/true-neg / informational 분기 / 빈 앵커 unverified / provenance).
- workspace 전체 0 fail + release-readiness **37/37** (check37 self-test discrimination) + version 3-way 12.12.0 + build dist.
- 실 Ajv schema-valid (anchor-verify 리포트 / finding code_graph_ref).
- 2-도메인 실 dogfood `--verify-anchors`.

## 9. Senior 적대 예상 (research 입력)
- **"vacuous feature"**: ast_symbol 0 인데 검증기를 지금 만드는 게 과적합 아닌가? → 4-C(defer) vs 4-A 정면 충돌. **가장 강한 공격 예상.**
- **federator 중복**: (α) symbolsInFile 와 소관 경계.
- **scope 폭증**: STEP 1 11→2, STEP 2 5→2, STEP 3 4→1 칼날 → STEP 4 6-산출물도 단일 메커니즘 1축으로 축소 의무.
- **enumerate kinds 확장 무회귀**: class/interface/function 추가가 route/method axis 에 영향 0 확인.
- **trust 경계**: anchor-verify finding 이 gate inject 안 되는지 (check37).

## 10. 4원칙 절차
1. ✅ 깊은 숙지 → 본 plan.
2. ⏭ 3-agent research (공식문서[codegraph symbol API / Code Connect 류 anchor 검증 선례] / 테크기업 사례[심볼 추적성·stale-anchor 도구] / Senior 적대 — 가벼운 sub-agent 전략) → research-codegraph-step4.md.
3. ⏭ 사용자 gate #3 묶음 결단 (4-A/B/C/D + scope cut + §8.1 정직 표기 + check37).
4. ⏭ 착수 → 실패 시 revert + Lessons Learned.

## 11. Lessons Learned (시행 완료 / v12.12.0)
- (실측) STEP 4 는 STEP 1~3 의 "역방향 복붙"이 아니다 — ast_symbol 앵커 부재라는 실데이터 제약이 검증을 vacuous 로 만든다. 정직 분기 필수 → §8.1 = mechanism-only(real-symbol probe) / in-the-wild stale=0 정직표기로 해소.
- (실측) 스키마(code-pointer)는 이미 ast_symbol 완비 → STEP 4 는 스키마가 아니라 메커니즘 + 소관 경계 문제.
- (Senior) (α)제안은 federator `symbolsInFile` 가 이미 구현 = 잘못된 집. set-diff 도구(codegraph-coverage)의 자연 확장은 (β)역방향 검증뿐 → 6산출물→1축.
- (Senior 정직 리스크) "지금 만들 가치" 충돌(Senior do-now vs 업계 defer)은 gate 에서 사용자 결단으로 분기. 4-A 채택하되 fake corroboration 회피 표기 절대.
- (구현) `normalizeSymbol` 끝-2-세그 정규화 nuance(Java `article.ArticleRepository` vs 앵커 `ArticleRepository`) → byQn2(2-세그)+byName(bare) 2-인덱스로 해소. 2-세그 앵커는 byQn2 정확매칭만(loose bare-method fallback ❌ false-live 회피).
- (probe) 양 도메인 실 DB live/stale/informational 분류 정확 = 메커니즘 입증. true-positive(live)는 실 DB 에서 심볼을 도출해 주입(no-sim).
