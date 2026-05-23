# DEC-2026-05-23-dep-graph-ssot-consolidation

> **일자**: 2026-05-23
> **session**: 36차 (현 session) / v8.13.1 PATCH release
> **카테고리**: methodology / dep-graph SSOT 통합 — dead-link 제거 + docs/dependency-graph.md 자체 SSOT 격상
> **상태**: 승인 (★ 사용자 "ㄱㄱ" → "추천" Option C 2026-05-23)
> **Resolves**: DEC-2026-05-23-dep-graph-p1-p4 §6 carry C-operation-md-work-folder (low / v8.9.0~v8.13.0 5 release 보존 carry / **마지막 잔여 carry**)
> **Cross-link**: v8.9.0 dep-graph release / v8.13.0 R19 Tier 1 격상

---

## 1. 배경

v8.9.0 dep-graph release ceremony 안 carry — `work/dep-graph/operation.md` 가 git tracked 아님 / commit b9615d0 message 안 인용된 SSOT. v8.10.0/v8.11.0/v8.12.0/v8.13.0 release 안 carry 보존. **본 session 마지막 잔여 carry**.

본 session 36차 v8.13.0 종결 후 사용자 차기 carry 진행 결단 → 4원칙 ladder full + dead-link 정합 cleanup.

## 2. 실측 (4원칙 1단계)

### 2.1 dead-link 진단

16 file 안 dead-link 3종 발견:
- `dep-graph/operation.md` (8 결정 / 7 알고리즘)
- `dep-graph/concept.md` (시나리오 A~E)
- `dep-graph/conventions.md` (표기·검증 규약 §9 기계적 동작 우선)

3 파일 모두:
- git tracked ❌
- file system 부재 ❌
- 사용자 작업 환경 work folder 안 작업 doc (본 plugin 외부)

### 2.2 surface 분류 (16 file)

| 분류 | 수 | 처분 |
|---|---|---|
| **활성 surface (코드/docs)** | 11 file | 인용 갱신 의무 |
| **history immutable** | 5 file (CHANGELOG + decisions/INDEX + decisions/DEC-*) | 변경 ❌ (history reference 보존) |

활성 surface 11 file:
- `docs/dependency-graph.md` (머리말 + §9 dead-link / SSOT 자체 격상 의무)
- `methodology-spec/plugin-charter.md` (P3 SHIPPED entry)
- `schemas/artifact-graph-node.schema.json` (description)
- `schemas/artifact-graph-edge.schema.json` (description)
- `schemas/code-pointer.schema.json` (description)
- `tools/traceability-matrix-builder/src/graph-synthesizer.js` (header comment)
- `tools/chain-driver/src/propagation-orderer.js` (header comment)
- `tools/graph-integrity-validator/src/validator.js` (JSDoc)
- `tools/graph-integrity-validator/README.md` (운영 plan 참조)
- `tools/code-pointer-validator/README.md` (운영 plan 참조)
- `skills/dep-graph-navigator/SKILL.md` (참조 section)

## 3. 처분 옵션 분석

| Option | 내용 | 정보 손실 | 작업 surface | 안정도 |
|---|---|---|---|---|
| A | 3 file 신설 (사용자 원본 복원) | 0 | 신규 3 file 작성 + 인용 유지 | ↑ but 사용자 read 의무 |
| B | SSOT footer 제거 (decommission) | 일부 | 16 file 인용 제거 | 단순 |
| **C (권장)** | 16 file 인용 갱신 (redirect) | 0 | 11 활성 file 갱신 + docs/ SSOT 격상 | 정보 보존 ✅ |

★ Option C 채택 사유:
- docs/dependency-graph.md 가 이미 131 line SSOT 역할 (8 결정 + 운영 가이드 통합)
- 사용자 원본 파일 부재 / 복원 불가능 / Reconstruction risk
- 정보 손실 0 (모든 결정 # / 시나리오 → §X 매핑 가능)
- additive only / breaking 0

## 4. 결단 (사용자 묶음 결단)

| # | 결단 | 채택 |
|---|---|---|
| D1 | Option C — 16 file 인용 갱신 (docs/dependency-graph.md SSOT 격상) | ✅ |
| D2 | active surface 11 file 갱신 / history immutable 5 file 변경 ❌ | ✅ |
| D3 | docs/dependency-graph.md 머리말 + §9 자체 SSOT 명시 | ✅ |
| D4 | v8.13.1 PATCH (corrective dead-link 제거 / 정보 손실 0 / breaking 0) | ✅ |

## 5. 시행 (4원칙 4단계)

### 5.1 docs/dependency-graph.md SSOT 자체 격상

- 머리말 line 4 "설계 원본(SSOT): dep-graph/{operation,concept,conventions}.md" → "★ v8.13.1 — 본 문서 = 단일 SSOT"
- §1 "(conventions.md §9 기계적 동작 우선)" → "(§7 기계적 동작 우선)"
- §9 참조 — 3 dead-link 삭제 + 본 doc 자체 SSOT 명시 + 도구 cross-link 보강

### 5.2 10 활성 file 인용 redirect

매핑 (dead-link → docs/dependency-graph.md §X):
- "operation.md 결정 1" → "§2 (그래프 모델)"
- "operation.md 결정 3" → "§3 P2 (code-pointer-validator)"
- "operation.md 결정 4" → "§5 (영향 등급 BFS)"
- "operation.md 결정 5" → "§6 (자동/수동 전파 정책)"
- "operation.md 결정 7" → "§3 P4 (centrality + navigator)"
- "operation.md 결정 8" → "§3 (도구 맵) + §7 (알고리즘 상호작용)"
- "concept.md 시나리오" → "§1 (요약 / 해소하는 통증)"
- "conventions.md §9" → "§7 (기계적 동작 우선)"

### 5.3 자산 갱신

- `plugin.json` 8.13.0 → 8.13.1 + `package.json` 8.13.0 → 8.13.1 (3-way sync)
- `CHANGELOG.md` v8.13.1 PATCH entry
- `CLAUDE.md` "plugin.json v8.13.1" sync + 현재 release 본문 갱신
- 본 DEC + INDEX 최상단 + STATUS session 36차 (보존)

## 6. STOP-3 hard gate 실측

| Gate | 결과 |
|---|---|
| dead-link active surface | **0 match** ✅ (`grep dep-graph/operation\|concept\|conventions ./{schemas,tools,skills,methodology-spec,docs}` = 0) |
| workspace test | pass (xmllint 환경 회복 / fast-xml-parser 정합 / v8.13.0 계승) |
| release-readiness | 16/16 ready (보존) |
| version 3-way sync | plugin.json 8.13.1 / package.json 8.13.1 / CHANGELOG v8.13.1 ✅ |
| breaking | 0 = PATCH (corrective dead-link 제거 / 정보 손실 0) |

## 7. Lessons Learned 신규

- **LL-ssot-01** — dead-link 청산 paradigm = 활성 surface vs history immutable 명확 분리 / 활성만 갱신 + history 보존 (R immutable rule 정합) / 11 vs 5 file 분리 정합 본격 입증
- **LL-ssot-02** — SSOT 자체 격상 paradigm = 외부 SSOT 부재 시 내부 docs/ 가 이미 sufficient (131 line SSOT) 면 자체 SSOT 격상 정당 / sufficient 입증 의무 (정보 매핑 가능성 실측)
- **LL-ssot-03** — Option C 권장 paradigm (정보 손실 0 + dead-link 해소) = 결단 ladder 안 "정보 손실 평가" 의무 (legacy migration paradigm v8.12.0 LL-validator-09 정합)

## 8. 차기 session carry — **0 (carry 완결)**

★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **본 release = 본 session 종결 + 5 carry cascade 종결** = **carry 잔존 0** (역사상 최초).

본 session (33차~36차) 누적 6 release:
- v8.9.0 (dep-graph release ceremony)
- v8.10.0 (analysis_validator carry)
- v8.11.0 (Senior REVISE-1 carry)
- v8.12.0 (legacy-risks-poc-migration carry)
- v8.13.0 (xmllint-env-absent carry / R19 paradigm 완결)
- v8.13.1 (operation-md-work-folder carry / dep-graph SSOT 통합) ← 본 release

---

**참고**:
- v8.9.0 carry C-operation-md-work-folder 종결 (5 release 보존 carry)
- docs/dependency-graph.md = 단일 SSOT (v8.13.1+)
- 본 session paradigm = 5 carry cascade 종결 (analysis_validator + Senior REVISE-1 + legacy + xmllint + operation-md) = paradigm 진화 안정점 본격 재도달
