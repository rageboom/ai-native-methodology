# DEC-2026-06-12-parallel-bc-accumulator-rollup

> **상태: 본체 격상됨 (v0.43.0 / 2026-06-13). 시행됨 — option ② 채택 / `tools/bc-accumulator-rollup` 도구+테스트+dogfood (2026-06-12 / 사용자 "권고대로 구현"). lifecycle-contract 규약 명문(병렬 worktree→fragment→post-merge 직렬 rollup MANDATORY)·plugin.json bump·workspace(pnpm glob auto) 완료 — §8.1 ≥2 도메인 corroboration(REQMNG + WLFR 2 dogfood) 충족 후 격상. findings 누적기 append-catalog 승격·bc_scope auto-split 은 여전히 deferred.** DEC-2026-06-12-artifact-zone 의 follow-on. ep-be-gea BC-REQMNG 병렬-worktree dogfood 에서 발견한 **잔여 병렬-충돌 갭** + zone §8.1 이 기다리던 **≥2 도메인 corroboration** 제공.

**결단(제안)**: artifact-zone 의 "도메인마다 자기 `domains/<BC>/` 만 write" 목표를 **완성**하려면, 아직 shared top-level 누적기로 남은 4종(`output/migration-cautions.json`·findings·`domain.json#bounded_contexts[]`·`output/business-rules.json` index)도 **per-BC leaf 로 일반화**하고 **직렬 post-merge rollup 단계**를 정의해야 한다. 현재는 business-rules 만 샤딩되어 있어, 병렬 CLI/worktree 가 나머지 누적기에서 여전히 write-conflict 한다.

**작성일**: 2026-06-12 (ep-be-gea BC-REQMNG 를 별도 worktree `feature/context-ops-reqmng` 에서 BC-RESV-GOLF 와 병렬 분석 — analysis 4단계 + cautions + findings 완주).

## 맥락 — artifact-zone 가 푼 것 / 안 푼 것

artifact-zone(오늘) 가 푼 것: business-rules leaf·openapi·formal-spec·characterization·sql-inventory 를 `domains/<BC>/` 로 물리 분리 → 병렬 worktree 가 이 5종은 안 겹침. **명시 목표(line 5)** = "특히 병렬 CLI / worktree 에서 도메인마다 자기 `domains/<BC>/` 만 write, `shared/` 는 read-only".

안 푼 것(본 결단 정조준): artifact-zone "top-level 유지" = `business-rules.json`(index)·`antipatterns.json`·`migration-cautions.json` + 미분류 `findings-*.json` + `domain.json#bounded_contexts[]`. 이들은 **여전히 단일 shared 파일에 BC 마다 append** 하는 누적기다. 병렬 worktree N개가 동시에 자기 BC 를 append 하면 머지 시 **같은 배열/같은 파일에서 충돌** — artifact-zone 가 business-rules 에서 없앤 바로 그 문제가 4종에 잔존.

## 증거 — BC-REQMNG dogfood (zone §8.1 이 기다리던 ≥2 도메인 corroboration)

artifact-zone §8.1: *"디렉토리 zone = 1-domain(BC-EVENT) exercised(degenerate) / bc_scope = 0-datapoint / ≥2 도메인(reservation-golf 등) corroboration 전까지 paradigm 주장 ❌"*. 본 dogfood 가 그 datapoint:

- **물리 zone end-to-end 입증**: `domains/BC-REQMNG/` 에 business-rules(36 BR)·characterization(15 snap/32 scn)·sql-inventory(163 stmt)·openapi(72 op/131 schema) 생성 — loader/검증 무회귀(EVENT·RESV-GOLF·REQMNG = 3 도메인). zone paradigm = degenerate 탈출.
- **병렬 충돌 0 달성 조건이 곧 갭의 증거**: REQMNG worktree 에서 충돌 0 은 오직 `shared/`(scope-carve·schema·architecture·domain)를 **read-only 로 두고**, `migration-cautions`·`findings`·`domain.json` 롤업을 **수동으로 defer** 했기에 가능. 즉 충돌 회피가 **방법론 강제가 아니라 작업자 규율**에 의존 — 규약 부재. (작업자 메모리 `resve-analysis-zone-discipline` 가 이 규율을 인간 기억에 박제 = 방법론 공백의 방증.)
- **migration-cautions 를 `domains/BC-REQMNG/migration-cautions.json` 로 물리 배치** = artifact-zone "top-level 유지" 와 **diverge**. 이게 본 결단의 핵심 분기: cautions/findings 의 물리 per-BC split 을 (artifact-zone 가 deferred 한 것을) **지금 승격**할지, 아니면 내 산출물을 top-level+bc_scope 로 **정정**할지.

## 결정 후보 (사용자 3택)

1. **per-BC leaf 일반화 (승격)** — `migration-cautions`·findings 에도 `domains/<BC>/` leaf + index 도입(`migration-cautions-bc.schema` + findings leaf schema 신설). `domain.json#bounded_contexts[]` 는 per-BC fragment + 조립. 병렬 worktree 진짜 충돌-free. 비용: loader/aggregator zone-aware 확장(artifact-zone 가 이미 깐 G1 chokepoint 패턴 재사용).
2. **직렬 rollup 단계만 명문화 (경량)** — 물리 split 은 business-rules 만, 나머지는 shared 유지하되 "병렬 worktree 는 자기 BC fragment 를 `domains/<BC>/` 에 쓰고, **머지 후 1회 결정론 rollup** 으로 shared 누적기에 반영" 절차 + 도구(`tools/bc-accumulator-rollup`) 정의. 내 reqmng 산출물(per-BC migration-cautions/findings)이 이 fragment 형식의 선례.
3. **현행 유지 + 규율 문서화** — 물리 split 미승격, "shared 누적기는 worktree 에서 직접 수정 ❌ / post-merge serialized" 를 lifecycle-contract 에 규율로만 명기(스키마·도구 무변경). 최소 비용 / 강제력 약함.

권고: **②** → **채택·시행**. (artifact-zone 의 read-model ⊥ storage 원칙 보존 + 병렬 목표 완성, loader 폭증 회피). ① 은 findings/cautions loader 까지 chokepoint 화 필요 = ≥3 도메인 후.

## 시행 (2026-06-12 / diagnose-before-design 정정 + dogfood)

- **diagnose-before-design 정정(scope 대폭 축소)**: 구현 착수 전 기존 자산 실측 → **upsert primitive 가 이미 `_shared/append-catalog.js` 에 존재**(DEC-2026-06-12-resve-multidomain-corroboration §F-1 / **오늘 resve 트랙 산출**): `upsertById`(sibling-보존)·`upsertBcFile`(BR index+total_rules)·`upsertCautionGroup`(by title)·`appendBoundedContext`·`mergeUbiquitousLanguage`·indent 보존 I/O. 즉 option ② 의 절반은 **이미 구현됨**. 따라서 `tools/bc-accumulator-rollup` = **재발명 ❌**, 그 primitive 위에 ⓐ `domains/<BC>/` 전체를 1패스·멱등으로 굴리는 **오케스트레이터**(현재는 helper 를 손으로 하나씩) + ⓑ **append-catalog 미커버 findings 누적기**(generic `upsertById` 재사용 + severity 버킷 재계산)만 추가. → memory `feedback_diagnose_before_design_check_existing` 적용 사례.
- **산출물**: `src/rollup.js`(pure / append-catalog import) + `src/cli.js`(`--bc-dir`/`--output-root`/`--dry-run` / exit 0/2/3 / 멱등 / sibling 보존) + `package.json` + `test/rollup.test.js`(**7/7 GREEN**: fresh-seed·멱등·sibling-보존·입력무변형(clone)·finding_id-없음 skip·domain skip·baseline 선재) + README. 4 누적기: business-rules index / migration-cautions / findings / domain bounded_contexts[].
- **dogfood (BC-REQMNG 실 fragment → /tmp 합성 shared / live `shared/` 무접촉 = 병렬 규율)**: BC-EVENT 선재 상태에 BC-REQMNG rollup → BR index `total_rules 60→96`(bc-scope deferred 노트 정확 일치) · cautions 2 group(10 caution) append · findings +25 → total 26(버킷 high 12+1=13 재계산) · domain skip(reqmng domain fragment 부재 = 정직). **재실행(RUN 2) = 전부 replaced(중복 0) / total 불변 96·26 = 멱등 실증** + BC-EVENT(60)·BC-REQMNG(36) 양립 = sibling 보존 실증.
- **무회귀**: append-catalog 무수정(read-only import) / 의존 테스트(chain-driver append-catalog) GREEN / 2 신규 디렉토리 additive.
- **잔여(promotion)**: ⓐ `methodology-spec/lifecycle-contract.md` 에 "병렬 worktree = fragment 만 / 머지 후 직렬 rollup 1회" 규약 명문 ⓑ findings 누적기 → append-catalog 승격(현재는 도구 로컬 / cross-track 충돌 회피로 분리 보관) ⓒ domain fragment 표준 산출 경로(현 per-BC domain.json 미생산 = skip) ⓓ plugin.json bump·workspace 등록 — 전부 §8.1.

## 부수 (본 결단과 독립 — 별도 follow-on 후보)

- **sql-inventory 결정론 추출기 부재**: skill 은 "5/11 auto-extracted" 주장하나 `tools/` 엔 `sql-inventory-validator` 만 / 추출기 없음. REQMNG 163 stmt 를 LLM 에이전트 6개로 읽음(고비용). grep 기반 MyBatis statement-id + FQN-table + dynamic-tag 추출기면 auto 컬럼 진짜 결정론 + 비용 1/N. → `tools/sql-inventory-extractor` 제안.
- **validator-absent fallback 미정의**: skill 들이 `node tools/*/cli.js`(schema/decision-table/characterization-coverage/spectral/sql-inventory) 필수 호출인데 headless/병렬 CLI(node dep 부재)에선 0개 실행 → hand-shape-check 로 대체. "validator toolchain 부재 → 스키마 대조 hand-validate + NOT_CERTIFIED 마킹"(input.json baseline NOT_CERTIFIED 동형) fallback 명문화 필요. resve 트랙 `DEC-2026-06-12-golf-chain-validator-wiring` = validator 배선이 현재 아픈 지점이라는 방증.
- **기존 invalid 1건**: artifact-zone line 46 이 적은 "migration-cautions detection_method enum 선재 invalid"(BC-EVENT) — REQMNG migration-cautions 는 본 세션에서 schema 정합으로 작성(detection_method ∈ enum). EVENT 측 정정 잔여.

## §8.1 (정직)

- **도구 시행됨 / 본체 격상 deferred** — 사용자 "권고대로 구현" 승인으로 `tools/bc-accumulator-rollup` 작성·테스트·dogfood 완료. lifecycle-contract 규약 명문·MANDATORY 배선·plugin.json bump 은 ≥2 도메인 corroboration 후(§시행 잔여). **fragment-vs-top-level 긴장 해소**: option ② 채택으로 내 BC-REQMNG `domains/<BC>/migration-cautions.json`·findings 의 물리 배치 = **정당한 fragment**(artifact-zone "top-level 유지" 와 모순 ❌ — 도구가 fragment→shared top-level 로 rollup). 즉 "승격 vs 정정" 분기는 **승격(fragment 정당화)** 로 결착.
- corroboration: zone 디렉토리 = 이제 4 도메인(EVENT/RESV-GOLF/REQMNG/WLFR) exercised. **rollup 도구 = 2 dogfood corroborated → SOFT→격상 시행(v0.43.0 / 2026-06-13)**: BC-REQMNG(total_rules 60→96 / findings +25→26 버킷 재계산) + **BC-WLFR**(EVENT+GOLF 60 선재 → 60→185 · cautions 13→14 group · findings 0→40 버킷[critical 1/high 9/medium 18/low 12] 재계산 · 멱등 RUN2 전부 replaced · sibling 보존 · `--dry-run`==real · live shared 무접촉[/tmp 합성]). `lifecycle-contract.md` zone 규약에 "병렬 worktree→fragment-only→post-merge 직렬 1회" MANDATORY bullet 명문 + §8.1 격상. cautions/findings per-BC = 2 도메인 실 fragment(REQMNG·WLFR) datapoint 확보. **잔여 deferred**: findings 누적기 → append-catalog 승격(현 도구 로컬) / bc_scope auto-split·HARD gate(F14 불변).
- 비용/리스크 미측정(loader 확장 범위·rollup 도구 stmt 수) — plan 단계 선행.

## relates to

- **DEC-2026-06-12-artifact-zone** (모 / 2-zone 물리 레이아웃 + top-level 유지 항목 = 본 결단이 완성 대상) · DEC-2026-06-09-br-split-step3 (per-BC leaf 선례 / 일반화) · DEC-2026-06-07-br-split-step2 (단일 loader chokepoint) · DEC-2026-06-10-validator-path-convention-unify §F14 (bc_scope auto-split deferred)
- DEC-2026-06-12-resve-multidomain-corroboration · DEC-2026-06-12-golf-chain-validator-wiring (병렬 트랙 / validator 배선 방증)
- `schemas/migration-cautions.schema.json`(per-BC leaf 변형 신설 대상) · `methodology-spec/lifecycle-contract.md`(zone+rollup 규약) · `tools/{findings-aggregator,traceability-matrix-builder}`(zone-aware 확장) · 신규 `tools/{sql-inventory-extractor,bc-accumulator-rollup}` 후보
- 작업자 메모리 `resve-analysis-zone-discipline`(방법론 공백을 인간 규율로 박제 = 본 결단의 동기)
