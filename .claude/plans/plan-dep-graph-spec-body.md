# plan — dep-graph 의도③ slice: `navigate --with-spec` (스펙 본문 lazy-read)

> 출처: session s68 triage (4-agent + Senior 0.84) → "다음 슬라이스 = ③ intent3-spec-body / 사용자 '신규 세션에서' = NEXT SESSION 진입점". 본 세션 = 그 진입점.
> 메모리: `project_session_depgraph_audit_v1210.md` / `project_living_dep_graph_two_loops.md` (소비 루프).
> 4원칙 §1 (깊은 숙지). 코드 착수 = §2 research + §3 사용자 승인 후.

## 1. 문제 (의도③ 부분충족 = 스펙 본문 미노출)

dep-graph 4-의도 감사에서 ③("질의→영향+**스펙**+코드")은 부분충족:

- ✅ 영향 트리(BFS MUST/SHOULD/FYI) · ✅ centrality top-3 · ✅ code anchor
- ❌ **스펙 본문 미노출** — navigate `result.node` (cli.js:527-540)는 `{id, artifact_kind, artifact_subkind, state, source_path, code_pointers, code_pointers_na}` 만. **title 조차 없음** (노드 데이터엔 title 실재하나 미표시). 본문(given/when/then, precondition 등)은 source 파일에 실재하지만 navigate 가 안 읽음.

→ 리뷰어가 "BHV-USER-001 이 뭘 하는 거지?"를 navigate 만으론 못 봄 → source 파일 직접 grep 필요 = **소비 루프 P0 통증** ([[project_living_dep_graph_two_loops]] "navigate 가 답을 다 줘야").

## 2. 현 코드 실측 (검증 완료 / 메모리 아닌 현 코드)

### 2-A. `cmdNavigate` (tools/chain-driver/src/cli.js:483-562)

- 단일 `--origin` 모드 + F3 rollup(`--stage`/`--scope`) 모드. 본문 추가는 **단일 origin 모드만** (rollup = N개 노드 = 본문 폭증 → carry).
- `result.node` block (527-540): title 없음, 본문 없음.
- text 출력 (545-559): header / source / code_pointers / 영향 트리 / top-3.

### 2-B. 노드 데이터 (RealWorld dogfood / 116 노드 실측)

- 노드는 **`title` 보유** (예 "회원가입") — navigate 미표시일 뿐.
- **`source_path` = 절대경로** (Windows). 스키마는 "plugin-root 상대"라 하나 합성기는 caller 가 넘긴 경로 그대로 저장 (synthesizer cli.js:501 `sourcePaths.behavior ?? '(behavior)'`). 실측: resync-graph·dogfood = 절대 / 사용자 상대입력 가능 / 미전달 시 placeholder `'(behavior)'`.
- subkind: UC(19)/BHV(19)/AC(25)/TASK(19)/TC(25) + analysis singletons.
- **각 chain 노드 source_path = 자기 source 파일** (UC→discovery-spec.json / BHV→behavior-spec.json / AC→acceptance-criteria.json). 6 chain 산출물 + 그래프 모두 같은 `.aimd/output/` 에 co-located (derived_from 실측).

### 2-C. 본문 shape (3종 모두 confirmed / clean / parallel)

| subkind | source 파일              | array         | 본문 필드                                                           |
| ------- | ------------------------ | ------------- | ------------------------------------------------------------------- |
| UC      | discovery-spec.json      | `use_cases[]` | name, description, actors[], preconditions[], postconditions[]      |
| BHV     | behavior-spec.json       | `behaviors[]` | name, description, preconditions[], postconditions[], invariants[]? |
| AC      | acceptance-criteria.json | `criteria[]`  | description, gherkin{given[], when, then[], tags[]}, severity       |

> carry 는 "UC=shape 미확인→1차 BHV+AC만"이라 보수적이었으나, **현 세션에서 UC shape confirmed = BHV 만큼 clean** → UC 포함이 비용 동일. (§3 사용자 결정)

### 2-D. 선례 (in-repo)

- graceful skip: `graph-freshness.js` (statSync try/catch continue) · federator existsSync skip.
- `isAbsolute(p) ? p : join(base, p)`: synthesizer 자체가 code-pointer 해석에 사용 (graph-synthesizer.js:476).
- reference-lens / gate 주입 ❌ 라벨: skill body + DEC-2026-05-28 §4.2 (codegraph trust 모델 동형) — **본문도 reference-lens 의무**.

### 2-E. 테스트 패턴 (navigate-cli.test.js)

- spawnSync + mkdtempSync 임시 그래프. makeGraph() 가 `{nodes, edges}` 만 write. 본문 테스트는 source 파일(behavior-spec.json 등)도 temp dir 에 write 필요.

## 3. 설계 (display-only / lazy / 결정론 / 회귀 0 / additive)

### 3-A. 플래그

`parseArgs`: `else if (a === '--with-spec') out.withSpec = true;` (default off). README/usage 갱신.

### 3-B. helper `readSpecBody(node, graphPath)` (신규)

```
SPEC_SUBKIND_CONFIG = {
  UC:  { array:'use_cases', kind:'fields' },
  BHV: { array:'behaviors', kind:'fields' },
  AC:  { array:'criteria',  kind:'gherkin' },
}
```

1. cfg = SPEC_SUBKIND_CONFIG[node.artifact_subkind]. 없으면 `{reference_lens:true, available:false, reason:'subkind <X> 미지원 (UC/BHV/AC 한정 / carry)'}`.
2. **source 해석** (graph-dir 우선 = co-located 실측 기반):
   - `isAbsolute(source_path)` → 직접
   - else → `join(dirname(graphPath), basename(source_path))` 우선 → existsSync → 아니면 `resolve(source_path)` (cwd)
3. existsSync 실패 → `{available:false, reason:'source 부재'}` (graceful).
4. JSON.parse(readFileSync) try/catch → 실패 시 `{available:false, reason:'source parse 실패'}`.
5. `entry = (obj[cfg.array] ?? []).find(e => e.id === node.id)`. 없으면 `{available:false, reason:'id miss'}`.
6. 본문 build + **길이 cap** (given/then ≤ 5 → "… (+N more)" / description 1줄 그대로 / actors·pre·post ≤ 5).
7. 반환 객체엔 항상 `reference_lens: true`.

### 3-C. 출력

- **JSON**: withSpec 일 때만 `result.spec = {...}` (node/impact 의 sibling). 미지정 시 키 부재 = 회귀 0.
- **text**: withSpec 일 때만 `  spec 본문 (reference-lens / gate 주입 ❌):` 블록 추가 (+ node.title 한 줄도 같이 표시). 미지정 = 현 출력 그대로.

### 3-D. 본체 무변경

- analyzeImpact / centrality / 노드 스키마 / 합성기 = **무변경**. 순수 navigate 표시 계층 additive.

## 4. 범위 결정 (§3 사용자 승인 항목)

- **D1. 본문 subkind 범위**: (a) UC+BHV+AC 3종 [권고 — shape 모두 confirmed/동일비용] vs (b) BHV+AC 만 (carry 원안) + UC carry.
- **D2. source 해석 base**: graph-dir 우선(co-located 실측) [권고] vs carry 원안 repoRoot. (둘 다 존재 가드 / 차이는 상대경로 fallback 우선순위뿐.)
- **D3. 출력 위치**: `result.spec` top-level [권고] vs `result.node.spec` nested.
- (rollup `--with-spec` = 본문 폭증 → 명시 carry / TASK·TC·IMPL 본문 = carry.)

## 5. 검증 계획

- navigate-cli.test.js 확장: withSpec on(3 subkind 각각)/off(회귀) + source 부재 graceful + id miss + subkind 미지원 + 길이 cap.
- **2 distinct 도메인 실 dogfood** (§8.1 — display-class 단일 ship 안전이나 본문필드 일반성 corroborate): RealWorld(Spring/JUnit) + ecommerce(NestJS/Prisma) 실 navigate --with-spec.
- workspace 전수 (1050/0 기준 → +N) · release-readiness 30/30 · skill-citation 0 stale · version 3-way bump (MINOR — additive 신규 플래그) · breaking 0.
- 문서: dependency-graph.md §4-2 + dep-graph-navigator SKILL.md 출력형식 갱신. CHANGELOG + CLAUDE.md + README version sync.

## 6. 위험 / 한계 (정직)

- **trust**: 본문 = reference-lens. 어떤 결정적 gate 에도 inject ❌ (라벨 의무).
- source 해석: 절대=무문제 / 상대=co-located 가정 (가드로 안전, miss=graceful skip).
- §8.1: display-class → 단일 도메인 ship 안전. 본문 필드 일반성만 2nd 도메인 corroborate (gate-class 아님).
- placeholder source_path(`'(behavior)'`) → existsSync miss → graceful "source 부재".

## 7. Lessons (이전 세션 carry 반영)

- [[feedback_zero_base_no_carry_anchor]] — 본 plan 은 carry design 을 출발점으로 쓰되, 현 코드 실측으로 재검증 (UC shape·source 절대경로 = 실측이 carry 보다 정확).
- [[feedback_self_referential_corrective_drift]] — 본 slice = **소비 루프 P0 가치** (리뷰어 본문 접근성) = self-referential 도구 fix 아님. 정직 prod 가치 진전.
- [[feedback_edit_tool_crlf_windows.md]] — cli.js 편집 시 CRLF 노이즈 watch (glyph-heavy). 필요 시 node 스크립트 편집.
