# plan — dep-graph 의도③ (a) NL 라우팅: `navigate --prompt`

> s68 triage 잔여 ③(b) "NL 라우팅 = 저위험 / resolvePromptToNodes 재사용 glue / ③본문 다음 1순위". 사용자 "순서대로 진행".
> 4원칙 §1. 코드 착수 = §2 research + §3 승인 후.

## 1. 문제 + ★ 핵심 recon 발견 (triage 가정 REFUTE)

navigate 는 `--origin <node-id>` 정확 id 필수 → 리뷰어가 "회원가입 관련 뭐 바뀌나"를 물으려면 id 를 이미 알아야 함. NL 라우팅 = `--prompt "<자연어>"` → 노드 해소 → 영향(+스펙) 표시.

★ **triage 의 "resolvePromptToNodes 재사용 glue / 저위험" = 실측 REFUTE** (no-simulation 검증):
- `resolvePromptToNodes`(federator.js:60)는 `selectOriginNodes` → `isAnchoredOrigin`(**code_pointers.length>0 필수**) 로 후보 필터. dogfood 체인 노드(UC/BHV/AC)는 **code_pointers_na** → 전부 제외.
- 실측(RealWorld graph): prompt `"BHV-USER-001 회원가입 바꾸려는데"` → BHV-USER-001 **미반환**(anchored 아님) / 엉뚱하게 analysis-architecture(file:user) 반환. prompt `"회원가입"`(title) → **빈 결과**(title 매칭 부재). anchored = 31/116 뿐.
- → resolvePromptToNodes 는 **codegraph federation 전용**(코드 앵커 join). navigate NL 라우팅엔 부적합.

## 2. 설계 (결정론 / no-embedding / additive / 회귀 0)

### 2-A. 공유 매처 추출 (`_shared/prompt-node-match.js`)
federator scoring 알고리즘을 candidate-주입 + `includeTitle` 옵션으로 일반화 (graph-freshness `_shared` 추출 선례 동형):
```
matchPromptToNodes(prompt, candidates, { topN=5, includeTitle=false })
  → [{node_id, score, matched[]}] (score desc, id asc / 결정론)
  scoring: id full +5 / id-part(≥3) +1 / title substring(≥2, includeTitle 시) +3 / symbol +3 / file base·stem +2
```
- **federator**: `resolvePromptToNodes` = `matchPromptToNodes(p, selectOriginNodes(graph,originIds), {topN, includeTitle:false})` → **거동 byte-identical**(같은 후보·includeTitle off / federator test 무회귀 / re-export 선례).
- **navigate**: candidates = 전 traversable(active/drift) 노드 / `includeTitle:true` (체인 노드 title="회원가입" 매칭 = 핵심).

### 2-B. navigate `--prompt` 배선 (chain-driver cli.js)
- `--prompt` 는 이미 parseArgs 존재(suggest-skill 용 `args.prompt`) → navigate 가 소비만.
- cmdNavigate: `!args.origin && args.prompt` →
  1. traversable 후보 + matchPromptToNodes.
  2. 0 매칭 → graceful (`prompt_resolution.matches:[]` + "id/title 직접 언급 또는 --origin 명시 / 의미검색(임베딩)=carry") exit 0.
  3. ≥1 → `args.origin = matches[0].node_id` (top-1 자동 탐색) + `result.prompt_resolution = {prompt, matches, resolved}` 동봉. text: "프롬프트 → 매칭 N: <list 점수>" + "top: <id> 탐색" 후 일반 navigate 출력.
- `--prompt` + `--origin` 동시 = origin 우선(명시 id 가 권위) / prompt 무시 + note.
- `--with-spec` 조합 = resolved top-1 에 본문 표시 (직전 슬라이스 재사용).
- rollup(`--stage`/`--scope`) 과 `--prompt` 동시 = rollup 우선(기존 분기 보존) — 사실 prompt 는 single-origin 경로.

### 2-C. 본체 무변경
analyzeImpact/centrality/스키마/합성기 무변경. resolvePromptToNodes 알고리즘 동결(추출만).

## 3. 결정 (§3 사용자 승인)
- **D1. 매처 위치**: `_shared` 추출(federator 공유 / DRY) [권고] vs navigate-local(federator 무touch / 중복).
- **D2. 매칭 시 동작**: top-1 자동 탐색 + 후보 list [권고 / 한방 유용+투명] vs list-only(사용자가 --origin 재실행).
- **D3. title 매칭 on** [권고 / 체인 노드 핵심 — 없으면 "회원가입" 빈결과] (off=현 federator 동일).

## 4. 검증 계획
- 새 test: matchPromptToNodes(_shared / id·title·symbol·file·tie·빈) + federator resolvePromptToNodes 무회귀(기존 5 test green) + navigate --prompt(매칭→top-1 탐색 / 0매칭 graceful / --origin 우선 / --with-spec 조합 / title 매칭).
- 2 distinct 도메인 실 navigate --prompt(RealWorld "회원가입" → UC/BHV/AC-USER-001 / ecommerce title).
- workspace 전수 + RR(31/31 유지 / 신규 check 불필요 — 결정론 navigate 확장) + version 3-way MINOR + skill/doc 갱신.

## 5. 위험 / 한계 (정직)
- **결정론 only** — 의미·동의어·임베딩 매칭 ❌(예 "로그인"↔"signin"). 한글 산문+식별자 0 = 빈 결과(정직 / 임베딩 carry 유지).
- title 매칭 noise: title 이 prompt substring 이어야 매칭(역방향 아님) → 과매칭 낮음. 동점 = id asc 결정.
- federator 추출 회귀: includeTitle:false + 같은 후보 → byte-identical 의무 (test 로 잠금).
- top-1 자동 탐색이 오답일 위험 → 후보 list 동봉으로 투명(사용자 --origin 재정정 가능).

## 6. Lessons
- [[feedback_zero_base_no_carry_anchor]] — triage "저위험 glue" 가정을 recon 으로 재검증 → REFUTE (resolvePromptToNodes code-anchored 전용). 정박 회피.
- 본 slice = navigate 소비 루프 진입장벽 ↓ (id 몰라도 질의) = 정직 prod 가치 [[feedback_self_referential_corrective_drift]].
