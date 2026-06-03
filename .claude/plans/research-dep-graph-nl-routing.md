# research — navigate --prompt (NL 라우팅) 설계 리뷰 (4원칙 §2)

> 워크플로우 `wf_bb18a7ba-512` (Senior 적대적 1-agent / fact-check 는 main 이 사전 empirical 수행 = resolvePromptToNodes REFUTE 실측).

## 판정: **GO @ 0.86** (federator_extraction_safe: true)

## 결정 (Senior)

| 결정          | 권고                                | 근거                                                                                                                                                                                                                                                                                                                                     |
| ------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1 매처 위치  | **\_shared 추출**                   | federator = `matchPromptToNodes(p, selectOriginNodes(...), {includeTitle:false})` → 후보·title브랜치無·scoring상수·sort 동일 = byte-identical (test 5건 RG=title 없는 chain노드라 includeTitle:false 무영향). graph-freshness 선례. navigate 는 selectOriginNodes 재사용 ❌(anchored 필터=REFUTE 근본원인) → 자체 traversable 후보 주입. |
| D2 매칭 동작  | **auto top-1 + 후보 list** (조건부) | must-fix: tie(matches[0].score==matches[1].score) 또는 약매칭(top.score < 3) → **list-only degrade** (오답 권위화 차단). 후보 list 항상 점수동봉(투명).                                                                                                                                                                                  |
| D3 title 매칭 | **on** (weight +2)                  | code_pointers_na 체인노드는 title 없으면 "회원가입" 빈결과 = 슬라이스 무산. 역방향(title⊂prompt)이라 과매칭 낮음. should_consider: title +3=symbol 동급 과함 → **+2 하향** 채택(흔한 2글자 한글 title noise 완화). federator=includeTitle:false 무영향.                                                                                  |

## must-fix (전부 채택)

1. **tie/약매칭 → top-1 자동탐색 억제, list-only degrade** ("동점/약매칭 — --origin 명시"). 결정론 차단.
2. **navigate 후보 = traversable(active/drift) 직접 구성** (selectOriginNodes ❌ = anchored 필터가 REFUTE 근본원인). \_shared 매처 = pure / 후보 주입만 / 필터 책임 無.
3. **federator 무회귀 잠금 test**: 기존 5건 \_shared 경유 green + matchPromptToNodes 단위 test 에 includeTitle:false → title 보유 노드서도 title 매칭 0 (거동 동결 증명).

## should-consider (채택)

- title weight +2 (+3→+2 / 위 D3).
- --prompt + --origin = origin 우선 + `prompt_resolution.skipped_reason` (silent drop 방지).
- 0매칭 graceful 에 "식별자/제목 substring 만 (동의어 ❌)" 한계 선명화.
- navigate JSON 출력 schema 有無 확인(prompt_resolution additive) — navigate 출력은 deliverable schema 아님(CLI result) → 무영향 확인.

## regression-risk (반영)

- rollup 분기(`!origin && (stage||scope)`)가 --prompt 보다 먼저 → prompt 해소는 rollup 분기 **뒤** + single-origin guard **앞** 배치. --prompt+--stage = rollup 우선 + prompt skip. 순서 회귀 test.
- --with-spec 조합: top-1 set origin 에 readSpecBody 정상(code_pointers_na → available:false graceful).
- args.prompt = suggest-skill 과 공유 / navigate 소비만 = 별 command 무영향 / parseArgs 무변경.
- text 출력 prompt_resolution 헤더 = --prompt 없을 때 byte-identical(회귀 test).

## 채택 scoring (확정)

id-full +5 / id-part(≥3) +1 / **title(≥2, includeTitle 시) +2** / symbol +3 / file base·stem +2. auto-navigate = `top.score >= 3 && (matches.length===1 || matches[0].score > matches[1].score)`. else list-only.

## 결론

D1=\_shared / D2=auto top-1 + tie·약매칭 degrade / D3=title on +2. must-fix 3 채택. → 구현.
