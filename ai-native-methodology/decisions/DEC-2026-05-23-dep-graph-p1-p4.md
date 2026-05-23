# DEC-2026-05-23-dep-graph-p1-p4

> **일자**: 2026-05-23
> **session**: 32차 (현 session) / v8.9.0 MINOR release
> **카테고리**: methodology / artifact dependency graph 신설 (charter §5 P3 "Spec change impact analyzer" SHIPPED)
> **상태**: 승인 (★ 사용자 "추천안 묶음 전체 시행" 2026-05-23)
> **Amends**: 없음 (신규 자산 / additive)
> **Cross-link**: 직전 commit `b9615d0` (2026-05-23 / "feat(dep-graph): artifact dependency graph P1~P4")

---

## 1. 배경

직전 commit `b9615d0` (Rageboom / 2026-05-23 09:41) 에서 charter §5 P3 "Spec change impact analyzer" 본격 SHIPPED. 본 commit 의 message 마지막 라인 명시:

> carry (다음 세션 release ceremony): 버전 3-way sync(plugin 8.8.0 / CHANGELOG 8.8.2 / package 8.8.3 → v8.9.0 MINOR 결단) + CHANGELOG 항목 + DEC/INDEX 등록 + analysis_validator red 1건(poc-06~10 planning-spec carry placeholder = 본 작업 무관 기존 drift).

본 DEC = 위 carry 시행 + 본격 자산 정식 등재.

## 2. 결단 (사용자 묶음 결단 2026-05-23)

| # | 결단 | 채택 |
|---|---|---|
| D1 | v8.9.0 MINOR 사실 확정 (additive only / breaking 0 — schema 5 + validator 2 + criterion 2 신설) | ✅ |
| D2 | chain-driver `ajv ^8.17.1` + `ajv-formats ^3.0.1` dependency 등록 (regress fix — dep-graph 가 policy-schema.test.js 안 ajv import 했으나 미등록 = ERR_MODULE_NOT_FOUND) | ✅ |
| D3 | xmllint 환경 부재 2건 (sql-inventory-validator iBATIS test #25+#26) = env absent carry 정당 (Windows / Linux libxml2 환경 의무) | ✅ |
| D4 | analysis_validator red 6건 (poc-06~10 planning-spec.json schema invalid) = 별도 carry session (본 작업 무관 기존 drift / placeholder 정리) | ✅ |
| D5 | commit + tag v8.9.0 + push 일괄 시행 (Co-Authored-By Claude) | ✅ |

## 3. 시행 자산 (commit b9615d0 본체 + 본 release ceremony)

### 3.1 dep-graph P1~P4 본체 (commit b9615d0)

| 영역 | 신설 |
|---|---|
| schema 5 | `artifact-graph-node.schema.json` + `artifact-graph-edge.schema.json` + `code-pointer.schema.json` + `discovery-output.schema.json` + `plan-spec.schema.json` + chain schema 6종 `code_pointers` optional 추가 (strict 의무 ❌) |
| validator 2 | `graph-integrity-validator` (DFS cycle/orphan/unknown / 13 test) + `code-pointer-validator` (pointer coverage) |
| chain-driver 확장 | `impact-analyzer` (confidence-aware BFS) + `propagation-orderer` (topo sort) + `centrality` (PageRank-lite top-3 root) + `policy-evaluator` (propagation-policy schema-driven) + CLI `impact` / `navigate` / `query --graph` + `hooks-bridge evaluate_policy` |
| matrix-builder 확장 | `graph-synthesizer` (4-state machine: active/propose/drift/deprecated) + diff-view 렌더러 |
| skill 신설 | `dep-graph-navigator` (`/dep-graph-navigator <node-id>` — BFS MUST/SHOULD/FYI + code_pointers + centrality) |
| hooks | PostToolUse + SessionStart `graph-sync` 자동 호출 |
| policies | `propagation-policy.json` + `propagation-policy.schema.json` (4 change-tier × 4 chain-step + 4 anchor_type × 2 patch-kind) |
| release-readiness | #15 `graph_integrity` + #16 `code_pointer_coverage` (strict default-on / PoC 백필 완료) |
| docs | `docs/dependency-graph.md` 운영 가이드 신설 + plugin-charter P3 SHIPPED 마킹 |

### 3.2 본 release ceremony (DEC-2026-05-23 시행)

| 영역 | 갱신 |
|---|---|
| `tools/chain-driver/package.json` | `dependencies: { ajv: ^8.17.1, ajv-formats: ^3.0.1 }` 신설 |
| `.claude-plugin/plugin.json` | 8.8.0 → 8.9.0 |
| `package.json` (workspace root) | 8.8.3 → 8.9.0 |
| `CHANGELOG.md` | v8.9.0 entry |
| `CLAUDE.md` | "plugin.json v8.8.0" → "v8.9.0" + 현재 release 본문 갱신 (R2 cadence 정합 / release-readiness check10) |
| `decisions/DEC-2026-05-23-dep-graph-p1-p4.md` | 본 파일 신설 |
| `decisions/INDEX.md` | 본 DEC 최상단 등재 |
| `decisions/STATUS.md` | session 32차 entry |

## 4. STOP-3 hard gate 실측

| Gate | 결과 |
|---|---|
| workspace test | 685/686 pass (1 fail = xmllint env absent / sql-inventory-validator iBATIS test #25+#26 / Windows / Linux libxml2 환경 의무 carry) |
| release-readiness | 15/16 ready (1 carry = analysis_validator red poc-06~10 placeholder / 본 작업 무관 기존 drift) |
| version 3-way sync | plugin.json 8.9.0 / package.json 8.9.0 / CHANGELOG v8.9.0 ✅ |
| skill-citation | 0 stale (227 active doc) |
| drift-validator | 3-way ✅ (skill/agent/flow 무편집) |
| chain harness validated | 본질 보존 ✅ (chain-driver policy-evaluator + matrix-builder graph-synthesizer = additive) |
| breaking | 0 = MINOR (additive — schema 5 + validator 2 + criterion 2 신설 / 기존 의무 제거 0) |

## 5. Lessons Learned 신규

- **LL-depgraph-01** — commit message 안 명시 carry (release ceremony) = 다음 session 진입점 SSOT / 본 DEC 가 그 entry-point 정합 자산화 paradigm
- **LL-depgraph-02** — workspace dependency 등록 누락 = ERR_MODULE_NOT_FOUND regress class / dep-graph 신규 import 시 sibling tool (schema-validator) dependency baseline 참조 의무 / `npm install` 미실행 = release-readiness `workspace_test_pass` 실패로 자동 검출
- **LL-depgraph-03** — env absent (xmllint Windows) ≠ regress / preflight pattern 정합 carry / Linux/Mac libxml2 환경 의무는 별도 사용자 명시 결단 의무 (sql-inventory-validator iBATIS 2 test = 환경 의존 carry 정당)

## 6. 차기 session carry

| carry | 우선순위 | 비고 |
|---|---|---|
| C-analysis-validator-poc06-10-placeholder | high | poc-06~10 planning-spec.json schema invalid 6건 / 본 작업 무관 기존 drift / placeholder 카리 정리 |
| C-xmllint-env-absent | medium | sql-inventory-validator iBATIS test #25+#26 / Linux/Mac libxml2 환경 의무 (Windows 사용자 환경 부재) |
| C-operation-md-work-folder | low | commit message 안 인용된 `work/dep-graph/operation.md` 가 git tracked 아님 (별도 work/ 폴더) / 향후 docs/ 안 정식 자산 흡수 후보 |

---

**참고**:
- 직전 commit: `b9615d0425ba532468c58f9f169becab43f8c651`
- charter §5 P3 SHIPPED (artifact dependency graph + impact analyzer)
- CHANGELOG.md v8.9.0 entry
- docs/dependency-graph.md 운영 가이드
