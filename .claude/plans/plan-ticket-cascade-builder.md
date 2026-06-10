# plan — ticket-cascade-builder (결정론 핵심 추출)

## 목표
ticket-sync 의 **결정론 로직**(resolve + payload-build + 델타 판정 + preview)을 `tools/ticket-cascade-builder/` Node 도구로 추출. 스킬은 thin orchestration(gate + MCP 발사 + evidence 캡쳐 + runtime fallback)만 유지.

## 정당화 (length 아님 / 결정론 axis 복원)
- ticket-sync = "도구=결정론 / skill=LLM 의미"(STRONG-STOP / `feedback_chain_driver_deterministic_axis`) **위반하는 유일 outlier**. resolve·payload·델타가 LLM 해석 pseudo-code로 존재 → drift-prone.
- 추출 = drift 0 보장 + 단위 테스트 가능(prefix·idempotency 버그류 사전 차단) + 정직 dry-run(`cascade-plan.json` diff 가능).
- 선례 = `traceability-matrix-builder`(순수 결정론 builder / MCP 0 / 1472줄).
- length 감소(512→~300)는 **부수효과**(modest). MCP 실행부는 비가역 잔존.

## 설계 결정 (일괄 승인 대상)

### D1. 도구 — `tools/ticket-cascade-builder/`
- workspace 패키지 `@mis-plugins/ticket-cascade-builder` (bin + src/cli.js + test + README). traceability-matrix-builder 구조 동형.
- **NO MCP / NO network / NO LLM** (순수 결정론 / determinism axis 의무).

### D2. 계약 (입력 → 출력)
- 입력 (CLI flags): `--task-plan` `--operational-task`(선택) `--behavior-spec` `--acceptance-criteria` `--discovery-spec`(선택) `--config`(ticket-sync-config.yaml) `--traceability`(선택 / 기존 ticket_ref idempotency 힌트) `--scope`.
- 출력: `.ai-context/output/cascade-plan.json` (신규 schema) + exit 0/1.

### D3. cascade-plan.json (신규 schema)
```
{ meta, scope,
  calls: [ { order, role(initiative|epic|story|task|subtask),
             issue_type(resolved),       # role→config resolve
             summary, body,              # 템플릿 채움(결정론 string interp)
             parent_spec: { strategy, parent_ref_key, link_type, customfield_id },
             labels[],
             delta_action: "create" | "skip_prebound",  # jira_id 보유 시 skip
             prebound_jira_id? },
           ... ],   # 순서 = Initiative→Epic→Story/OP→Sub-task (dependency order)
  preview_md,                            # 사람 검토용 렌더
  skip_list: [ {key, prebound_jira_id, reason} ],
  evidence_skeleton: { epic_id_map, story_id_map, op_task_id_map, subtask_id_map (placeholder) }
}
```
- top-level `additionalProperties:false` strict + meta-confidence $ref.

### D4. 경계 — 스킬에 남는 것 (비가역 / live 의존)
- MCP probe(prefix resolve) + search-first **live** JQL(델타 by-jira_id 는 도구 / search 발견은 스킬)
- confirmation gate (user yes/no/dry-run)
- jira_create **실발사**(cascade-plan.calls 순서대로) + 실 stdout/stderr/duration/hash **evidence 캡쳐**
- **runtime fallback 체인**(parent_key 400 → Relates 등 / live 응답 의존)
- jira_link / transition / structure_add / graceful MCP-missing / traceability write

### D5. resolve 분담
- **config-time(도구)**: role→issue_type / parent strategy 필드 선택 / B14(subtask epic-link 금지) / 델타 skip / body 템플릿 채움 / cascade 순서.
- **runtime(스킬)**: live 400 reject 적응(fallback 체인) — 도구는 "의도된 parent_spec"만 emit, 스킬이 실패 시 적응.

### D6. config 파싱
- 도구가 `ticket-sync-config.yaml` 읽음 → YAML 파서 dep 필요(`js-yaml` / 선례 greenfield-bootstrap). 또는 `--config` JSON 허용(스킬이 파싱 후 전달). **결정 필요(D6 옵션)**.

### D7. 테스트 (no-simulation 단위)
- resolve: DWPD vs SG-MIS issue_type / parent strategy 필드 선택
- B14: subtask payload 에 epic_link customfield 부재
- 델타: jira_id 보유 ref → delta_action=skip_prebound / 미보유 → create
- cascade 순서: Initiative→Epic→{Story,OP}→Sub-task topological
- body 템플릿 채움 정합
- cascade-plan.schema ajv valid

### D8. ticket-sync SKILL.md 변경
- §5 resolve 표 + §6 cascade pseudo-code(Step 2~5) + §3 preview build + §이슈유형 body 템플릿 → **도구 호출 + cascade-plan.json 실행**으로 대체.
- 유지: 단계 1(probe/gate) · 단계 2 search live · 단계 4 gate · 단계 6 MCP 발사+evidence+fallback · 단계 7~9.
- 호출 패턴: `node ${CLAUDE_PLUGIN_ROOT}/tools/ticket-cascade-builder/src/cli.js --task-plan ... --config ...` → read cascade-plan.json → execute.

### D9. 행위 보존 (breaking 0)
- 도구 산출 cascade-plan 이 **현 pseudo-code 와 동일한 MCP 호출**을 생성해야 함(행위 보존). 기존 ticket-sync-evidence schema 무변경(evidence 는 스킬이 그대로 채움).

### D10. 배선
- workspace package.json(pnpm) 등록 + build + release-readiness(workspace-test 자동 포함) + skill-citation(스킬→도구 인용 / 도구→schema·DEC 인용).
- 신규 schema `cascade-plan.schema.json` → schema-validator canonical 등록 여부 확인.

## 영향 파일
1. (신규) `tools/ticket-cascade-builder/{package.json,src/cli.js,src/*.js,test/*.test.js,README.md}`
2. (신규) `schemas/cascade-plan.schema.json`
3. `skills/ticket-sync/SKILL.md` — §3·§5·§6·이슈유형 → 도구 위임
4. (신규) `decisions/DEC-2026-06-10-ticket-cascade-builder.md` + INDEX
5. workspace `pnpm-workspace.yaml` / 루트 — 신규 패키지 인식 (자동 glob 시 무변경 확인)
6. (선택) `methodology-spec/ticket-policy.md` §10 — 도구 분담 한 줄

## 검증
- 신규 도구 단위 테스트(D7) green
- cascade-plan.schema canonical 등록 + ajv valid
- skill-citation 0 stale
- 행위 보존: 기존 PoC task-plan(있으면) 으로 cascade-plan 생성 → 현 pseudo-code 기대 MCP 호출과 대조(가능 범위)
- 전 workspace test 회귀 0

## 리스크 / 엣지
- **split-brain**(도구 계획 ↔ 스킬 실행 동기) → cascade-plan.schema 계약으로 강제.
- YAML dep(D6) → js-yaml 추가 vs JSON 허용 결정.
- runtime fallback 은 도구 밖 → 도구 출력은 "happy-path 의도"임을 schema/문서에 명시.
- 행위 보존 검증이 어려움(live MCP 없이) → cascade-plan 구조 단위테스트 + 기존 evidence 예시 대조로 최대 근접.

## Lessons
- meta-confidence 제약 주의: `methodology_version` 패턴(`^v\d+`) + `confidence` ≤0.98 + `inputs_used` enum(source_code 등). 도구 산출 meta 는 이 제약 준수 의무(cascade-builder meta = confidence 0.95 / inputs_used ['source_code'] / methodology_version 생략).
- js-yaml lazy require(createRequire) → core(buildCascadePlan)는 무의존 = 단위 테스트 install 불요 / CLI(loadConfig)만 dep.
- 결과(실측): SKILL.md 원본 709 → 279줄(−61%). 도구 15 test green / cascade-plan schema 동적 canonical 등록 / skill-citation 0 stale(220 doc) / breaking 0. 릴리스 v0.32.0 MINOR — release-readiness **42/42**(readme_version_sync + shipped_provenance_leak[inline DEC 2건 → 본문 제거·footer 보존] 2건 후속 수정 포함).
- 한계 재확인: length 감소는 부수효과 — MCP 발사+evidence+fallback+gate 비가역 잔존(279줄). 정당화는 결정론 axis 복원.
- 릴리스 배선 LL: 신규 도구·skill 변경도 plugin.json 버전 bump 시 ① CLAUDE.md "현재 vX" ② README title+narrative ③ CHANGELOG entry 3곳 동기화 의무(readme_version_sync 게이트). SKILL 본문 inline DEC/ADR 마커는 shipped_provenance_leak 게이트가 차단 → `## 인용` footer 로만.
