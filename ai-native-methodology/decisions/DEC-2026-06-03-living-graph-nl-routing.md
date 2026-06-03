# DEC-2026-06-03-living-graph-nl-routing

> v12.4.0 MINOR release SSOT. dep-graph 의도③ "질의 → 영향 + 스펙 + 코드"의 자연어 진입 슬라이스 (a) — `chain-driver navigate --prompt`.
> 상태: **승인 + 시행 완료** (2026-06-03). 4원칙 = `plan-dep-graph-nl-routing.md` → Senior 적대적 리뷰 0.86 + main empirical fact-check(resolvePromptToNodes REFUTE 실측) → 사용자 "순서대로 진행"(s68 triage 잔여 ③ 순차 착수 승인).

**작성일**: 2026-06-03

**relates to**:

- `DEC-2026-06-03-living-graph-spec-body.md` (v12.3.0) — 의도③ 첫 슬라이스(스펙 본문). 본 DEC = 의도③ 자연어 진입(a). s68 triage "③ 본문 다음 1순위 = NL 라우팅".
- s68 triage(`project_session_depgraph_audit_v1210`) — "③(b) NL 라우팅 = 저위험 / resolvePromptToNodes 재사용 glue". 본 DEC recon 이 그 "저위험 glue" 가정을 REFUTE.

---

## 0. 한 줄 요약

navigate 가 `--origin <node-id>` 정확 id 필수 → 리뷰어가 id 를 모르면 질의 불가. `--prompt "<자연어>"` 로 자연어에서 노드를 **결정론 substring 매칭**(id/title/symbol/file)해 해소(→ 영향+스펙). confident(strong+unique)만 top-1 자동 탐색 / tie·약매칭=list-only. 결정론 only(동의어·임베딩 ❌=carry).

## 1. recon 발견 — triage "저위험 glue" 가정 REFUTE (no-simulation 실측)

triage 는 "resolvePromptToNodes(federator) 재사용 glue"로 봤으나 실측 REFUTE:

- `resolvePromptToNodes`(federator.js)는 `selectOriginNodes → isAnchoredOrigin`(**code_pointers.length>0 필수**) 후보 필터 + **title 매칭 부재**.
- dogfood 체인 노드(UC/BHV/AC)는 **code_pointers_na** → 전부 제외. 실측(RealWorld): prompt `"BHV-USER-001 회원가입"` → BHV **미반환**(엉뚱하게 analysis-architecture) / `"회원가입"`(title) → **빈결과**. anchored = 31/116 뿐.
- → resolvePromptToNodes 는 **codegraph federation 전용**(코드 앵커 join). navigate NL 라우팅엔 부적합. [[feedback_zero_base_no_carry_anchor]] — triage 정박 회피.

## 2. 결단 (Senior 0.86)

### D1 — 공유 매처 `_shared` 추출

federator scoring 을 `_shared/prompt-node-match.js` `matchPromptToNodes(prompt, candidates, {topN, includeTitle})` 로 일반화 (candidate 주입 + title 옵션). graph-freshness `_shared` 추출 선례 동형.

- **federator**: `resolvePromptToNodes` = `matchPromptToNodes(p, selectOriginNodes(...), {includeTitle:false})` → 같은 후보·title無·scoring·sort = **byte-identical**(federator 29 test 무회귀).
- **navigate**: candidates = traversable(active/drift) **전 노드** (selectOriginNodes 의 anchored 필터 ❌ = REFUTE 근본원인 / Senior must-fix #2) + `includeTitle:true`.

### D2 — top-1 자동 탐색 + tie/약매칭 degrade (Senior must-fix #1)

`isConfidentTop` = top.score≥3 (STRONG) AND 동점 아님. confident 만 top-1 자동 탐색. **tie 또는 약매칭 = list-only**(후보+점수 노출 후 종료 / 오답 권위화 결정론 차단). `--prompt`+`--origin` = origin 우선 + `skipped_reason`(silent drop ❌). `--prompt`+`--stage`/`--scope` = rollup 우선(분기 순서 보존).

### D3 — title 매칭 on (weight +2)

체인 노드(code_pointers_na)는 title 없으면 자연어 무용. title weight **+2**(symbol +3 보다 낮춤 / Senior should_consider — 흔한 2글자 한글 title 우연 substring noise 완화). 역방향(title⊂prompt)이라 과매칭 낮음.

### scoring (확정)

id-full +5 / id-part(≥3) +1 / title(≥2, includeTitle 시) +2 / symbol +3 / file base·stem +2. 결정론 sort(score desc, node_id asc).

## 3. 정직한 한계

결정론 substring only — 의미·동의어·임베딩(예 "로그인"↔"signin") 매칭 ❌. 한글 산문+식별자 0 = 빈 결과 graceful("식별자/제목 substring 만 / 동의어·임베딩 ❌"). 임베딩 의미검색 = carry(결정론 vs LLM axis 분리 / STRONG-STOP).

## 4. 검증 (no-simulation / 실 CLI·실 그래프)

- 새 test 21: matchPromptToNodes 단위 12(id/title/symbol/file/tie/빈/includeTitle:false 거동동결 = federator 무회귀 증명) + navigate --prompt 통합 9(명시id→auto / title→tie list-only / title+idpart→auto / 0매칭 graceful / origin 우선 / with-spec 조합 / stage rollup 우선 / text / 회귀0 off).
- federator 29 test 무회귀(resolvePromptToNodes 5건 포함 byte-identical).
- **2 distinct 도메인** (§8.1): RealWorld "BHV-USER-001"→auto / "회원가입"→tie list-only + ecommerce 동형.
- workspace **1084 pass/0 fail** + release-readiness **31/31** + version 3-way 12.4.0 + CLAUDE/README sync / breaking 0.

## 5. carry (DEFER / 능동 ❌ / 4원칙 경유)

- 의도③ 잔여 **(b) what-if** (가설 변경 영향 / in-memory 비파괴 + 사용자 명시 입력만 / 가설엣지 자동추론 ❌ = do_not_edit_manually·LLM trust선 보존) — 본 release 의 다음 슬라이스.
- 임베딩 의미검색(동의어 매칭) · TASK·TC·IMPL spec 본문 · 의도①④(codegraph 코드축).

## 6. Why / How to apply

**Why**: navigate 소비 루프 진입장벽 ↓ — id 몰라도 자연어로 질의(산출물=LLM 운영 컨텍스트 P0 / [[project_methodology_purpose_ax_operation]]). recon 이 triage 의 "glue" 가정을 실측 반증 = 정박 회피(정직 prod 가치 / [[feedback_self_referential_corrective_drift]]).
**How to apply**: 매칭은 결정론 substring only — LLM 이 의미·동의어로 재해석하면 ❌(임베딩=carry). tie·약매칭은 자동 탐색 ❌(후보 list 만 / 사용자 --origin 명시). federator 거동은 includeTitle:false 로 동결(navigate 의 title 매칭이 federation 축 침범 ❌).
