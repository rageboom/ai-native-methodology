# plan — code_pointers "의도 노드 na 기본값" 패치 (DOGFOOD-GATE 해소 / 시행 자격 획득)

> **상태**: 설계 확정 + **dogfood-gate 해소 (2026-05-30 / RealWorld chain 1~4 + dep-graph 실측)**. 시행 자격 획득 (사용자 승인 + 3-agent research 거쳐 시행).
> **실측 확정 (F-DOGFOOD-009)**: RealWorld dogfood = artifact-graph 115 노드 / code-pointer-validator coverage **21.7%** (covered=25 TC / na=**0** / missing=**90**). missing 90 = UC19 + BHV19 + AC25 + TASK19 + analysis8 — 전부 `code_pointers:null` + `code_pointers_na:undefined` (가설의 "worst combo" 정확 재현). na=0 = 어떤 템플릿/skill 도 na 를 안 박음.
> **navigate/impact 쿼리는 패치 없이도 정상 작동** 확인 (BHV-ARTICLE-001 navigate / AC-USER-002 impact 모두 chain 엣지 traversal 성공) → 본 plan §1 의 "패치는 coverage gate 통과용이지 쿼리 동작용 아님" 가설 실측 입증.
> → 패치 효과: Layer 1 backstop 적용 시 90 missing 중 82 chain intent(UC/BHV/AC/TASK) + 8 analysis → na=true 전환 → coverage 21.7% → ~100% (TC 25 covered + 90 na). release-readiness #12 통과.
> self-referential corrective drift 회피 (memory `feedback_self_referential_corrective_drift.md`) — 단 본 패치는 실 dogfood 데이터 기반이라 self-referential 아님 (Type 1.5 external repo 실측).

## 1. 진단 (grep 확정 / 2026-05-30)

dep-graph 의 code_pointers coverage 약한 고리 = **상위 chain 노드 + analysis/aspect**.

| 노드                   | 현재                                                                               | 결과                   |
| ---------------------- | ---------------------------------------------------------------------------------- | ---------------------- |
| IMPL                   | 템플릿 `source_files[]` → builder 자동 변환 (graph-synthesizer `implCodePointers`) | ✅ covered             |
| TC                     | 템플릿 `source_file` → builder 자동 변환 (synthesizer:325)                         | ✅ covered             |
| BHV                    | spec 템플릿 `code_pointers:[] + code_pointers_na:false` 하드코딩                   | ❌ missing (최악 조합) |
| UC                     | discovery 템플릿 필드 부재                                                         | ❌ missing             |
| AC                     | acceptance-criteria 템플릿 필드 부재                                               | ❌ missing             |
| TASK                   | task-plan 템플릿 필드 부재                                                         | ❌ missing             |
| analysis 15 / aspect 4 | builder `kindNode` 기본값 부재                                                     | ❌ missing             |

- validator (`tools/code-pointer-validator/src/validator.js`): Tier-1 = `chain|analysis|aspect`, state active/drift, coverage 임계 **1.0**. 위 ❌ = `code_pointer.coverage_missing` (strict 시 high).
- **EPIC/STORY/OP (artifact_kind=plan) = Tier-1 제외** → 안 잡힘.
- code-pointer-validator 는 **chain phase-flow gate 아님** = release-readiness #12 (방법론 자체 release용). → 유저 car-list run 에서 navigate/impact 쿼리 자체는 IMPL/TC anchor + chain 엣지로 **패치 없이도 작동**. 패치는 _coverage gate 통과_ 용이지 _쿼리 동작_ 용 아님. (← dogfood-first 정당화 근거)

## 2. 설계 결단 A — "의도 노드 = code_pointers_na 기본"

코드 진입점은 IMPL/TC 면 충분 (둘 다 자동). UC/BHV/AC 는 본질이 의도 → na=true 가 정직한 상태.

| 노드                   | na=true 기본                | 비고                                                                                              |
| ---------------------- | --------------------------- | ------------------------------------------------------------------------------------------------- |
| UC / BHV / AC          | ✅ 기본                     | IMPL/TC 가 코드 anchor                                                                            |
| TASK                   | na 기본 + **override 권장** | `plan-decompose` 가 code_pointer range overlap 으로 의존성 추론 → 수정 코드 범위 알면 채우면 이득 |
| analysis 15 / aspect 4 | ✅ na 기본 + **carry**      | 본래 코드 묘사 가능하나 enrich 는 analysis skill 大 변경 → 별도 carry (사용자 결단 2026-05-30)    |

## 3. 3-layer 패치 명세

### Layer 1 — builder backstop (load-bearing / 단일 지점)

`tools/traceability-matrix-builder/src/graph-synthesizer.js` 최종 정규화 패스 추가:

```js
// 의도/집계 노드: code_pointers·na 둘 다 없으면 na=true 기본.
// IMPL/TC 제외 — source_files/source_file fallback 이 채움 (없으면 의도적 flagged).
function defaultNaForIntentNodes(nodes) {
	const CODE_BEARING = new Set(['IMPL', 'TC']);
	for (const n of nodes) {
		if (!['chain', 'analysis', 'aspect'].includes(n.artifact_kind)) continue;
		if (CODE_BEARING.has(n.artifact_subkind)) continue;
		const hasPtr = Array.isArray(n.code_pointers) && n.code_pointers.length > 0;
		if (!hasPtr && n.code_pointers_na !== true) n.code_pointers_na = true;
	}
}
```

→ analysis 15 + aspect 4 + UC/BHV/AC/TASK 일괄 커버 (template 못 미치는 analysis/aspect 까지 단일 지점 + 기존 PoC artifact 안전). 노드 조립 완료 후 1회 호출. **IMPL/TC 가 source_files fallback 으로 pointer 받는 시점 이후**에 적용 의무 (순서 주의).

### Layer 2 — template 명시성 (작성자 가시화 + override)

- `templates/spec/behavior-spec.template.json:54-55` `code_pointers_na:false` → **true**
- `discovery-spec` / `acceptance-criteria` / `task-plan` 템플릿 각 item 에 `"code_pointers_na": true` 1줄 추가

### Layer 3 — skill 한 줄 (작성 규율)

- `discovery-decompose-use-cases` / `spec-compose-behavior-spec` / `spec-derive-acceptance-criteria`: "UC/BHV/AC = 의도 노드 → code_pointers_na:true 기본"
- `plan-decompose-and-sequence`: "TASK 수정 코드 범위 알면 code_pointers 채워라 (의존성 추론 정확도↑), 모르면 na"

## 4. test / gate 영향

- builder 정규화 패스 → synthesizer 출력 변경 → builder 기존 test 재확인 + 신규 test 1 (의도 노드 na 기본 단언).
- validator 본체 무변경 → validator test 영향 0.
- 예상: code-pointer-validator coverage < 1.0 → 1.0 회복 / release-readiness #12 통과.
- breaking 0 (additive default).

## 5. 시행 전제 (4원칙)

1. car-list dogfood 실측 (chain 1~5 + graph + navigate/impact) → 본 패치 필요성 입증.
2. 본체 변경 → plan.md(본 파일) → 3-agent research → 사용자 승인 → 구현.
3. 시행 시 carry: analysis/aspect code_pointers enrich (Layer 1 backstop na 가 가린 부분).

## 6. 인용

- `skills/dep-graph-navigator/SKILL.md` / `tools/chain-driver navigate|impact`
- `schemas/artifact-graph-node.schema.json` (code_pointers / code_pointers_na)
- `tools/code-pointer-validator/src/validator.js` (Tier-1 coverage 1.0)
- `tools/traceability-matrix-builder/src/graph-synthesizer.js` (kindNode / chainNodeFromItem / implCodePointers)
- memory `feedback_self_referential_corrective_drift.md` (dogfood-first 정당화)
