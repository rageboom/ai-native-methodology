# DEC-2026-06-17 — unit-spec 을 codegraph 정적 앵커 검증(`--verify-anchors`)에 연결

- **status**: accepted
- **date**: 2026-06-17
- **supersedes**: 없음 (additive)
- **relates**: DEC-2026-06-16-unit-spec-emit-wiring (unit-spec EMIT 배선) · DEC-2026-06-03-codegraph-deliverable-wiring (codegraph-coverage 본체) · DEC-2026-05-28 (codegraph = reference-lens / gate-inject 금지 §4.2)

## 맥락 (왜)

`unit-spec.json` 의 `units[].code_pointer.symbol`(ast_symbol)이 **실제 소스에 존재하는가** 를 검증할 결정론 도구가 없었다. ep-be-gea 34-BC unit-spec 백필(301 UNIT)에서는 이 검증을 **즉석 LLM grep 워크플로우**로 수행했는데, LLM 판단이라 ① 비결정적 ② 재현 불가 ③ 매번 재작성이라는 한계가 있었다.

플러그인엔 이미 `codegraph-coverage --verify-anchors`(`anchor-verify.js`)가 있다 — 산출물 ast_symbol 앵커를 codegraph sqlite 심볼 인덱스(`.codegraph/codegraph.db`)에 정적 대조해 **stale-anchor**(파일은 인덱싱됐는데 심볼 부재)와 **codegraph-blind**(파일 미인덱싱 = 결함 아님 / informational)를 구분한다. **단 하나의 공백**: 앵커 수집기 `collectSymbolAnchors`(`collect.js`)가 `acceptance-criteria`/`discovery-spec`/`behavior-spec`/`impl-spec`/`test-spec` 5종만 순회하고 **`unit-spec` 을 보지 않았다.**

## 결정 (무엇)

`codegraph-coverage` 의 앵커 수집 대상에 `unit-spec` 을 추가한다 (신규 도구 ❌ / 기존 매칭엔진·sqlite 리더·리포·trust 경계 전부 재사용).

1. **`src/cli.js`** `DELIVERABLE_FILES` 에 `'unit-spec': 'unit-spec.json'` 추가.
2. **`src/collect.js`** `collectSymbolAnchors` 에 unit-spec 분기. **주의**: unit-spec 은 unit 당 단수 `code_pointer` 객체(타 산출물의 `code_pointers` **배열**과 상이) → `[u.code_pointer]` 배열 래핑 후 기존 `eatSymbolAnchors`(anchor_type='ast_symbol' 필터·dedup·normalizeSymbol) 재사용.
3. **테스트** `test/anchor-verify.test.js` 에 4 케이스(단수 code_pointer 수집 / code_pointer 부재 스킵 / strict_path(symbol 무) 제외 / 동일 symbol+path dedup / provenance=unit-spec 보존).

## 불변 (무엇을 안 바꾸는가)

- **reference-lens 유지** — DEC-2026-05-28 §4.2 codegraph gate-inject 금지 보존. unit-spec 앵커도 비차단(severity ceiling `low|medium`), 환경/DB 부재 시 exit 3(no-simulation), **하드 게이트화 ❌**. 최종 evidence 는 실코드 grep.
- `collectRefs`(정방향 coverage-hole)에는 unit-spec 미추가 — unit-spec 은 코드 전수 커버 의무 산출물이 아니므로 역방향 앵커 검증만 대상.

## 알려진 한계 (정직 기록)

codegraph 심볼 추출이 **Java record / 중첩(nested) record 타입을 심볼 노드로 카탈로그하지 않는다.** 이 경우 파일은 인덱싱됐으나 심볼 미발견 → `stale` 로 분류된다(실제 부재 아님). ep-be-gea dogfood 2건 해당:
- `BoResveAthrtAssetFavoriteSyncEvent` (`public record`)
- `BoGolfRestService.TimeRange` (private 중첩 record)

둘 다 실소스 grep 으로 실존 재확인 = **날조 아님**. reference-lens 라 차단하지 않으므로 안전하나, 향후 codegraph record 추출 보강 또는 `informational` 하위범주(record/nested)로 재분류 여지 carry.

## dogfood 결과 (ep-be-gea / 301 UNIT / 34 scope)

- 300 distinct anchor(301 UNIT 중 issue-acm 내부 동일 symbol+path 1쌍 dedup) → **298 live + 2 stale(record-blind 상기) + 0 blind**.
- LLM 적대검증(별도 워크플로우 / 301/301 confirmed)과 **교차일치** — 정적·LLM 두 독립 경로가 같은 결론(날조 0).
- 검증: `codegraph-coverage` 자체 테스트 129 GREEN(신규 4 포함) / release-readiness 무회귀.

## 영향

- `tools/codegraph-coverage/src/{cli.js,collect.js}` + `test/anchor-verify.test.js`
- 플러그인 v0.50.0 → **v0.51.0** (MINOR / 호환 기능 추가)
