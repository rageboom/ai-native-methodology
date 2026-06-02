# DEC-2026-06-02-context-federation

**결단**: `C-codegraph-federation` (Slice 2 / DEC-2026-05-30-codegraph-essential-impl-slice1 carry) **착수** — dep-graph(의미) × codegraph(코드 구조)를 노드 `code_pointers` 로 join 하는 `tools/context-federator/` 신설. **Phase 0(본 DEC = 결정 잠금) + Phase 1(read-only federate 코어 + `context-cache.json` + `context-cache.schema.json`) + Phase 2(캐시 재사용·델타 = 2축 무효화)** 시행. 사용자 P0 운영 형태("prompt → dep-graph 검색 → codegraph 연동 → 통합 컨텍스트 회수·재사용") 의 첫 실 배선. **gate 무개입 / non-gating / opt-in.**

**작성일**: 2026-06-02 (worktree `session-wt` / 사용자 승인 — "Phase 0+1 구현" + "디폴트 가드 그대로").

**relates to**:
- `DEC-2026-05-30-codegraph-essential-impl-slice1.md` (Slice 1 = codegraph-runner / federation = Slice 2 carry)
- `DEC-2026-05-28-codegraph-probe-결과.md` §4.2 (trust 모델 — gate inject ❌) + iBATIS2 SQL 층 효용 0
- `DEC-2026-06-01-living-dep-graph-loops.md` §2 (결정론 vs 휴리스틱 trust 선 / propose-only)
- `~/.claude/plans/plan-depgraph-codegraph-federation.md` (설계 plan / 사용자 승인)

---

## 1. 배경 — 실증된 substrate + 빈 절반

- **dep-graph** 실물 2개(poc-05=code_pointers 완비 / poc-16=0). **codegraph** 바이너리 실재(v0.9.6 / query·callers·callees·impact·context·serve). 단 **code-graph.json 영속물 0(휘발)** + **federation(둘 결합) 미착수**.
- 즉 사용자 비전의 절반(dep-graph 검색·재사용)은 실증돼 있고, 나머지 절반(codegraph 연동·영속화)은 도구는 검증됐으나 배선이 비어있었음.

## 2. 결단 상세 (Phase 0 = 결정 잠금)

### trust 모델 (절대 / DEC-2026-05-28 §4.2 + DEC-2026-06-01 §2 정합)
- codegraph = **휴리스틱 신호** → `context-cache.json` = **reference-lens / NOT gate-injected**. 어떤 결정론 gate(gate-eval / release-readiness)에도 inject ❌.
- 삼중 잠금: ① `meta.trust_note` 의무 필드(schema const) ② release-readiness 미배선(non-gating) ③ context-federator 는 `state` 를 쓰지 않음(소비 전용 / propose 격리 무관).
- 실증된 함정: codegraph `query "selectDataConfirmList"` 가 SQL 아닌 **동명 Java 메서드**를 자신만만하게 히트 + legacy `impact` 가 DB 영향 0줄 → gate 가 믿으면 SQL-breaking 통과. 그래서 reference-lens 고정.

### axis 분리 (feedback_chain_driver_deterministic_axis / STRONG-STOP)
- context-federator = **결정론 only**. navigate(BFS/centrality) + codegraph(static index) 의 결정론 출력을 join 만. AI 의미 재유추 ❌.
- **자연어 의미매핑(임베딩) = propose-only carry** (본 Phase 미포함). Phase 3 의 prompt→node 매칭은 결정론 토큰/path 매칭만.

### ★ 스택별 "코드 반쪽" 소스 분기 (실증 기반 결단)
- **modern**(JPA/MyBatis3/TS) → codegraph 가 데이터 접근까지 봄 (poc-05 end-to-end 실증: `assertAvailable`←`register` 8심볼).
- **legacy**(Spring4.1+iBATIS2) → codegraph 코드 반쪽은 Java 구조까지만. **SQL/테이블 층 암흑** (실증: EFI-WEB ifrs 인덱스 — `sql/table` 노드 kind 0 / DAO `callees=0` / XML 56개 file 로만). → 데이터 지식은 codegraph 아닌 **분석 산출물(db-schema/sql-inventory/business-rules)** 에서 조인 (Phase 1.5).
- federate 는 미해결 anchor 를 `unresolved:true` 로 **정직 표기** (반쪽 비는 것 숨기지 않음 / no-simulation).

### 디폴트 가드 (사용자 승인 "디폴트 그대로")
- 임베딩 의미검색 = propose-only 분리 / MCP serve(`codegraph serve`) = 후순위(1차 로컬 CLI query·callers·impact 만) / §8.1 corroboration = PoC#15 1건뿐 → **gate-class 격상 전면 DEFER**.
- write-scope = `.aimd/output` 만 (tracked fixture 변조 금지 / DEC-2026-06-01 carry 3 정합).

## 3. Phase 1 시행 (read-only federate 코어)

- **신설**: `tools/context-federator/{federator.js, cli.js}` + `schemas/context-cache.schema.json` + 워크스페이스 등재.
  - `federate(graph, {repoRoot, codegraphProjectDir, navigate, codegraph, ...})` = pure. anchored Tier-1(active/drift) 노드별 → navigate(dep 의미: by_grade + top_impact_roots) + codegraph(코드: ast_symbol 직행 callers/impact / strict_path 파일명 stem query → sameFile 필터) join → `context-cache.json`.
- **도구→도구 import 회피** (workspace 컨벤션 = `_shared` 만 공유): navigate/codegraph 는 CLI black-box 로 shell-out(`makeNavigateRunner`=chain-driver navigate / `makeCodegraphAdapter`=codegraph read). core 는 runner 주입 = testable (gitRunner 주입 패턴 동형). → ★ plan 의 "codegraph-runner cgExec/q 재사용"은 **패턴 재사용**으로 조정(WRITE/index 7-field evidence 경로는 codegraph-runner 단독 소유 / READ 경로만 어댑터 자체 보유).
- **no-simulation**: codegraph 부재 = `codegraph.available=false` 정직 반환(throw 아님) → dep 반쪽은 그대로 emit.

## 4. 검증 (no-simulation / 실 CLI·실 codegraph)

- federator 단위 테스트: selectOrigin / ast_symbol·strict_path join / sameFile 필터 / codegraph 부재 graceful / trust_note·메타 / schema top-level lockstep 가드 / **env-gated 실 codegraph smoke**(temp JS index → a,b 심볼 + b=caller-of-a 실 해석 / 부재 시 honest skip).
- poc-05 modern end-to-end 실증(본 session): `IMPL-USER-001` → dep MUST 5 + codegraph `assertAvailable`←`register` impact 8 = 한 pull 결합.
- workspace test 무회귀 + release-readiness 무회귀(context-federator 는 release check 미배선 = non-gating).

## 7. Phase 2 추가 시행 (同 2026-06-02 / 캐시 재사용·델타 = "다시 작업 안 하기")

- **2축 무효화**: `meta.graph_stamp`(artifact-graph 내용 해시) = dep 축 / `meta.codegraph_indexed_at`(.codegraph DB mtime) = code 축. graph 무변경 → `dep_impact` verbatim carry(navigate 미호출) / codegraph index 무변경 + `pack.anchor_stamp` 동일 → `code_refs` verbatim carry(codegraph 미호출 = 비싼 부분 절감).
- **신설**: `federate(graph,{prevCache,graphStamp,codegraphIndexedAt,stampFn})` 델타 + `cacheStaleness()` export + adapter `indexedAt()` + CLI `--delta` + schema(meta 2 stamp / pack `anchor_stamp` / stats `dep_recomputed·code_recomputed·carried_packs`).
- **실증**: poc-05 1차 full(dep4/code4/carry0) → 2차 무변경 **carry4 / 재계산0**(navigate·codegraph 호출 0) = 순수 재사용. 단위 테스트 16/16(델타 6: 양축 carry/단축 재계산/신규·삭제/anchor_stamp 민감/cacheStaleness). workspace **1031/0**.

## 5. carry

1. **Phase 1.5** — legacy 스택 데이터 반쪽 = db-schema/sql-inventory/business-rules 조인 소스 분기.
2. **Phase 2 잔여** — `context-cache.json` 을 work-unit `sync_sources` 자동 등재(living-loop markDrift 연동). 코어 델타는 ✅ 시행(§7).
3. **Phase 3** — `resolvePromptToNodes()` 결정론 prompt→node 매칭 + SessionStart/UserPromptSubmit hook 주입 + dep-graph-navigator SKILL '코드 흐름 lens' 섹션.
4. **Phase 4** — 2nd distinct domain corroboration 후 격상 검토(여전히 finding-only) + MCP serve 별도 슬라이스.
5. INDEX.md / STATUS.md entry + (release 시) CHANGELOG.

## 6. paradigm 정합

- **navigate 재발명 ❌** — dep 영향은 chain-driver navigate verbatim, 코드 구조는 codegraph verbatim, federate 는 join glue.
- **self-recorded-fact-validation**: 구현 전 4개 토대 사실 실측 검증(codegraph 바이너리·조인키 생산자·sync substrate·hook). 워크플로우 심사안의 코드 인용 오류(graph-synthesizer:277) 정정.
- **본체 우선**: schemas/tools/decisions 본체 신설 (PoC 산출물 작업 아님).
