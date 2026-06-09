# DEC-2026-06-09-hotspot-prioritization-reference-lens

**결단**: 역공학 델타 #4 — **hotspot prioritization**(Tornhill **churn × indentation-complexity**)을 scope-carve 의 **4번째 신호**로 흡수. 3 구조신호(SCC/Martin/co-change = "WHERE to cut")에 **직교**한 **우선순위 axis**("WHICH region first" — 자주 변경 + 복잡 = 먼저 carve/격리/hardening). **별도 도구 ❌ → scope-carve tool/schema 에 additive 흡수**(plan §3 "S0 carve 와 묶음" 정합). **churn = co-change `file_churn` 재사용**(단일 git 패스 / 중복 0). **complexity = indentation-complexity**(Tornhill canonical / 언어무관 / AST·파서 불요 / no-simulation 실측). 출력 = **reference-lens**(gate inject ❌ / sibling = `DEC-2026-06-09-scope-carve-3signal-reference-lens` 와 동일 자산·trust). 1차 = draft / 본체 격상 = ≥2 PoC corroboration 후(§8.1).

**작성일**: 2026-06-09.

**version**: 없음 (1차 draft / scope-carve 자산에 additive / plugin.json·CHANGELOG·lifecycle MANDATORY 무변경 = §8.1 격상 보류).

**relates to**:

- `DEC-2026-06-09-reverse-eng-methodology-gap` §2.5 델타 #4 (모 DEC / hotspot = "(S0 carve 와 묶음)")
- `DEC-2026-06-09-scope-carve-3signal-reference-lens` (**sibling** — 동일 scope-carve tool/schema/skill / hotspot 이 그 자산에 4번째 신호로 흡수 / schema title "3신호"→"신호" reframe)
- `.claude/plans/research-reverse-engineering-carve.md` §4 (Tornhill hotspot = history-bias 휴리스틱 / churn×complexity / git-only)
- memory `feedback_research_fact_validation` · `feedback_no_static_tool_simulation` (indentation 실측 / cyclomatic AST 회피) · `feedback_diagnose_before_design_check_existing`

---

## 1. 배경

모DEC(§2.5 델타 #4)가 hotspot 을 "S0 carve 와 묶음"으로 식별. 착수 전 **기존 자산 실측**(diagnose-before-design):

- **hotspot/churn/complexity 자산 = 전무**(grep 전수 / 히트 3건 = semgrep YAML 규칙 등 false positive). MISSING 확정.
- **churn 은 이미 mine 됨** — scope-carve co-change(`co-change.js`)가 `git log --name-only` 이력에서 파일별 변경을 카운트. → 별도 git 패스 불필요, **co-change 가 `file_churn`(windowed 전체 revision 수) 추가 노출**(additive)하면 hotspot 이 재사용.
- **complexity 만 신규** — proxy 필요.

## 2. 결정 내용

### 2.1 scope-carve 확장 (별도 도구 ❌)

hotspot = scope-carve tool(`tools/scope-carve/src/hotspot.js`) + scope-carve.json `hotspot` 블록(additive). 별도 도구는 git 이력 mining·trust 모델·dogfood 패턴이 scope-carve 와 거의 동일 = 중복 → 거부. churn·git plumbing·reference-lens trust·soft gate #0 surface 전부 재사용.

### 2.2 complexity = indentation-complexity (Tornhill / no-simulation)

비공백 줄별 들여쓰기 레벨(= leading whitespace / `tab_width`) 합. **언어무관 + 파서 불요 + 실 측정**(no-simulation). 대안 거부: **cyclomatic(AST)** = 언어별 파서 필요(Java/TS/Python…) + codegraph iBATIS-blind 동형 한계 + 무거움 → 1차 scope 외(향후 type-spec 결합 시). **raw LOC** = '복잡도' 신호로 indentation 보다 약함(긴 파일 ≠ 복잡). `tab_width` = soft-gate 파라미터(2-space 코드는 `--tab-width 2`).

### 2.3 churn = co-change file_churn 재사용 (단일 git 패스)

`mineCoChange` 가 `file_churn`(windowed 전체 commit 의 파일별 revision 수 / max_transaction_size 필터 **전** = 단일파일·대형 commit 포함 = 진짜 변경 빈도) 추가 반환. carve.js 가 직렬화 전 분리(schema co_change 블록 정합) 후 hotspot 입력. 두 번째 git log 호출 0.

### 2.4 score = churn × complexity_total (Tornhill / flat 파일 저score)

자주 변경(churn) × 복잡(complexity) = 우선순위. **flat 파일**(markdown/json 등 들여쓰기 ~0)은 churn 높아도 score ~0 = 낮은 우선순위 — Tornhill 의도("복잡 코드가 자주 바뀌는 곳" / 단순 변경 빈도 아님). carve_candidates 에 `hotspot_priority` kind 추가(top N).

### 2.5 schema reframe + status mirror

scope-carve.schema title "역공학 scope-carve 3신호" → "scope-carve 신호"(구조 3 + 우선순위 axis). `hotspot.status` = co_change.status **mirror**(churn = git 이력 의존 → 부재 시 정직 미산출).

### 2.6 Phase 1 발견: 대용량 --stdout truncation 버그 수정

`cli.js` 가 `process.stdout.write(대용량 JSON)` 직후 `process.exit(0)` 호출 → Node 가 stdout drain 전 종료 = **파이프 출력 truncate**(self-dogfood JSON 1959줄에서 절단 노출). 수정 = 성공 경로 `process.exit(0)` 제거(exitCode 기본 0 / 이벤트루프 비면 자연 종료 = flush 보장). file-write 경로(writeFileSync)는 무관했으나 `--stdout` 파이프 소비자(soft gate #0 렌더 등) 보호.

## 3. 근거

- **Tornhill hotspot** = 실무 검증된 prioritization(2015/2018) / 3 구조신호와 직교(boundary vs priority).
- **no-simulation**(`feedback_no_static_tool_simulation`): indentation = 실 측정(파일 바이트). cyclomatic 추정·AST 미실행 대체 ❌ → 1차는 측정 가능한 indentation 만.
- **단일 git 패스**: churn 재사용 = 성능 + 일관성(co-change 와 동일 windowed 집합).
- **§8.1**: 1차 draft / 본체 격상 = ≥2 distinct 도메인 PoC corroboration 후.

## 4. Non-goal (1차)

- 별도 hotspot 도구·schema ❌ (scope-carve additive).
- cyclomatic/AST complexity ❌ (언어별 파서 / 1차 scope 외).
- chain-driver/gate 수정 ❌ (reference-lens).
- MANDATORY 격상·lifecycle 등재 ❌ (≥2 PoC 후).

## 5. 검증 / 상태

- **Phase 1 draft 완료** — `hotspot.js` + scope-carve.json `hotspot` 블록 + `params.hotspot` + `hotspot_priority` candidate. **scope-carve 테스트 28 → 38**(hotspot 8 + co-change file_churn 1 + carve hotspot 1) 전부 pass. poc-01 regen + **ajv valid**.
- **self-dogfood**(본 repo 이력 / since=2026-05-20): #1 hotspot = `chain-driver/src/cli.js`(churn 17 × complexity 6374 = 108k) = repo 최다변경+최복잡. **CHANGELOG.md(churn 30)·package.json(churn 26)은 flat → 저score**(Tornhill 의도 실증 — 고churn flat 파일 미상위). co-change 1240 pair + hotspot 15 untruncated(stdout 버그 수정 검증).
- plugin.json·CHANGELOG·lifecycle MANDATORY 무변경(§8.1).

## 6. caveat (정직)

- **complexity = indentation proxy** — research §4 가 "약한 proxy"로 표기(cyclomatic 아님). 우선순위 **랭킹**에는 충분(결정론)하나 절대 복잡도 측정 아님.
- **tab_width 의존** — 2-space 코드는 `--tab-width 2` 필요(기본 4 / floor(spaces/tab_width)). 랭킹은 monotonic 유지(소프트게이트).
- **churn = co-change 와 동일 `.git` 의존** — PoC target `.git` 부재 → 1차 dogfood = self-dogfood(methodology repo)만. target-with-history live = ≥2 PoC 격상 carry.
- **신호 ROI 미실증**(1차 / §8.1) — hotspot 우선순위의 실 가치는 ≥2 PoC corroboration 후 본체 격상.

## 인용

- 코드: `tools/scope-carve/src/hotspot.js`(indentationComplexity / computeHotspot) · `co-change.js`(file_churn) · `carve.js`(orchestrate + hotspot_priority) · `cli.js`(hotspot 플래그 + stdout 수정) · `schemas/scope-carve.schema.json`(hotspot 블록)
- 테스트: `tools/scope-carve/test/hotspot.test.js`(8) + `co-change.test.js`(file_churn) + `carve.test.js`(hotspot)
- dogfood: `examples/poc-01-realworld-spring/output/scope-carve.json`(hotspot=not_run / target .git 부재)
- 관련 DEC: DEC-2026-06-09-reverse-eng-methodology-gap(모) · DEC-2026-06-09-scope-carve-3signal-reference-lens(sibling) · DEC-2026-05-28-codegraph-probe-결과 §4.2(reference-lens trust)
- memory: `feedback_research_fact_validation` · `feedback_no_static_tool_simulation` · `feedback_diagnose_before_design_check_existing` · `feedback_quality_priority`
