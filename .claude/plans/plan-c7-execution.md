# plan-c7-execution — v12.0.0 C7 (lifecycle-contract 대수술 + deliverables json-only + category-C figure)

> 사용자 결정(2026-06-02): C7 = 대수술 → 착수 전 영향 파일 전수조사 + 본 plan + 승인. 4-agent recon workflow(`wikvct7lk`) 결과를 master plan §8 + D-2/D-6 결정과 **reconcile** 한 실행안.
> master plan = `~/.claude/plans/serialized-exploring-stonebraker.md` §8. 경로 = nested repo `ai-native-methodology/ai-native-methodology/`.

## 0. recon → locked-plan reconcile (agent 제안 중 거부/수정분)

recon agent 4종이 정확한 line 인벤토리를 줬으나, locked 결정과 충돌하는 제안 3건은 **거부**:

| agent 제안                                                                       | 판정                         | 근거                                                                                                         |
| -------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| lifecycle L279 `findings.md` → `findings.json` 전환                              | ❌ **거부 (유지)**           | D-6: findings.md = audit registry / twin 아님 / KEEP. agent 오분류.                                          |
| 다수 deliverables: ".md/.mermaid 산출 유지하되 'derived artifact'로 개념 재정의" | ❌ **거부**                  | v12 = twin **emit 중단**(C2)+**파일 삭제**(C4) 완료. file-tree 에서 twin 줄을 **제거**해야 함(reframe 아님). |
| id-conventions flowchart = load-bearing KEEP                                     | ⚠️ **사용자 결정** (아래 §3) | plan §8=삭제 / agent=ID SSOT 핵심. 양론.                                                                     |

**twin vs functional 판별 규칙 (핵심)**: deliverable file-tree 의 `.md`/`.mermaid` 중 —

- **TWIN (제거)** = json SSOT 와 같은 정보의 사람-눈 미러 (basename 동일 or 직접 렌더): architecture.md/.mermaid, domain.md/.mermaid, api.md, rules.md, avoid-list.md, behavior-spec.md, behavior-diagrams.mermaid, discovery-spec.md, acceptance-criteria.md, task-plan.md, test-spec.md, impl-spec.md, matrix.md/.mermaid, manifest.md, state-map.mermaid, user-flows.mermaid, component-tree.mermaid, design-tokens.md, pages.md, components.md, scenarios.md, use-cases.md, ubiquitous-language.md. + migration-cautions.md → **migration-cautions.json**(C1 schema).
- **FUNCTIONAL (유지 / D-6)** = 독립 기능 보고서·표준 비-json: test-report.md, coverage-report.md, impl-report.md, test-pass-evidence.md, violations.md, ratchet-gap.md, missing-keys.md, mf2-migration-gap.md, runtime-check-list.md, tier-detection.md, bootstrap-data-flow.md, strangler-migration-plan.md, br-auto-extracted.md, framework-coupling-list.md, types.d.ts, error-mapping-spec.md(보고서), sql-inventory.md(인벤토리), raw-grep.txt, openapi.yaml(표준), **findings.md/poc-findings.md(audit)**, tree.md/stack-detection.md, \_manifest.yml.
- **intent-vs-bug.md** → D-6: characterization-spec.json 소비 전환 (deliverable 23 서술 = "intent_vs_bug 는 characterization-spec.json 안" 으로 갱신 / 별도 .md 미산출).

## 1. Decisions locked (master plan §8 + D-2/D-6)

- D-2: category-C illustrative mermaid figure = **그냥 삭제** (대체 ❌).
- D-6: findings.md/poc-findings.md = 유지 / functional report = 유지 / migration-cautions → json / intent-vs-bug → characterization-spec.json.
- ADR figure(ADR-001/002/FE-001/FE-003) = LEAVE (역사). archive/ + examples/ = LEAVE (frozen). briefing/ = LEAVE (onboarding 자료 / build EXCLUDE / 역사 언급).

## 2. Sequenced edits (commit 1개 / GREEN 보존)

### 2-A. lifecycle-contract.md (SSOT 대수술 / recon agent A — 12 지점)

- chain 산출물 twin 제거 6: L152 discovery-spec.md / L170 behavior-spec.json+.md / L171 acceptance-criteria.json+.md / L191 task-plan.{json,md} / L211 test-spec.json+.md / L231 impl-spec.json+.md → 각 `.json 단독`.
- manifest twin 2: L308 `manifest.{json,md}` → `manifest.json` / L324 "manifest 이중 렌더링 ... 의무 — ADR-008 v2" → "manifest.json 단독 (ADR-011)".
- L298 migration-cautions.md → migration-cautions.json.
- L253 `architecture (+ .mermaid)` → `architecture` / L257 `schema + erd (.mermaid)` → `schema + erd` (산출물 정의 테이블 주석 제거).
- L349 design stage `design-tokens.json + design-tokens.md 이중 렌더링` → `design-tokens.json 단독`.
- L279 findings.md = **유지** (D-6 / agent 제안 거부).
- §파일 위치 컨벤션(L274-300) 트리에서 twin 줄(.md/.mermaid) 제거 / functional(\_manifest.yml 등) 유지.

### 2-B. deliverables specs (recon agent B)

- **twin file-tree 줄 제거** (json 단독 재작성): 1-architecture(L19-26 .md/.mermaid 줄), 2-domain(L19-26), 3-api(api.md), 4-5-formal-spec(L3 "이중 렌더링" 사상선언 + state-machines/sequence .mermaid), 8-state-map(L3 + L27-35 .mermaid + §5 형식), 17-discovery-spec(L19-24 .md), 18-behavior-spec(L18-23 .md+.mermaid), 22-traceability-matrix(L3 + L19-23 .md/.mermaid).
- **avoid-list**: 6-antipatterns(L19-25) `antipatterns.json + avoid-list.md` → `antipatterns.json 단독`.
- **이미 v12 (확인만)**: 4-db-schema(L4 ADR-011), 5-business-rules(L4), flows/README. functional-leave(무편집): 10~16, 19(acceptance-criteria.md = agent 'functional' 주장하나 lifecycle L171=twin → **제거**측 / Gherkin 평문은 json 내 표현), 20, 21, 23(intent-vs-bug→char-spec.json 주석), 24.
- **migration-cautions deliverable spec**: 기존 spec 부재 → 신설 or 6-antipatterns/별도에 json 명시 (C1 schema 기반). (실행 시 확인.)

### 2-C. category-C figure 삭제 → DROPPED (사용자 결정 2026-06-02)

사용자 "왜 지우려는거야?" 메타점검 → 정직 재검토: figure 삭제는 v12 핵심 근거(drift 표면=산출물 twin 한정 / LLM ROI=유지되는 본체 문서)와 무관한 **순수성(미관) churn**. drift 불가능(대응 json SSOT 없음)·무해·일부 유용(id-conventions ID 관계도). → **category-C figure 7개 전부 KEEP / 삭제 subtask 드롭**. D-2 이 부분 revisit. 단 "산출물이 .mermaid 를 emit 한다"는 **twin-emit 산문**(예 lifecycle L253/257, deliverables file-tree)은 거짓 서술이라 그대로 제거. (figure=```mermaid 코드블록=KEEP / twin-emit=산문 서술=제거 구분.)

### 2-D. templates + workflow (recon agent D — plan §8 미명시였으나 v12 정합 필수)

- **dead-link 정리**: templates/discovery/README.md(L10-11 discovery-spec.template.md 행) / templates/spec/README.md(L10,12 behavior-spec.template.md+acceptance-criteria.template.md 행) / templates/plan/README.md(L12-13 task-plan.template.md+adr.template.md 행) / templates/README.md(L49-57 chain stage .template.md 표) — 부재 `.template.md` 참조(breaking link) 제거 / json-only 표로 정정.
- **template.md json-only 재작성**: templates/analysis/formal-spec.template.md(L19/26-27/41-42/56-57 "AI 눈/사람 눈" + L182 "이중 렌더링 갭" 섹션 → json 단독). decision-table.template.md/finding.template.md = 작성 가이드(functional) 유지하되 §legacy 경로 참조만 정정.
- **workflow/\*.md**: workflow/formal-spec.md(L3/38-39/46/54/174-178/211 twin-emit → json 단독) / workflow/input.md(L72 input-summary.json+.md → .json) / workflow/architecture.md(figure = 2-C).

### 2-E. guides + inline prose (recon agent C)

- getting-started.md(L120 ".json + .md 이중 렌더링" → json 단독) / first-prompt-cookbook.md(L119 `matrix.{json,md,mermaid}` → `matrix.json`).
- LEAVE: common-errors.md(functional) / briefing/\*(역사·onboarding / build EXCLUDE) / skills-axis.md(무관).

## 3. 사용자 결정 필요 (figure 삭제 범위 — agent 이견)

plan §8 은 "category-C 그냥 삭제"였으나 recon agent 가 일부 figure 를 load-bearing/functional 로 재분류. 3건 판단 필요:

1. **id-conventions.md flowchart**(ID 참조 관계도): plan §8=삭제 / agent=ID SSOT 핵심 KEEP.
2. **7-ui-ux.md flowchart**(사용자 흐름 예시): plan 미명시 / agent=설명 보조 KEEP 경향.
3. **9-visual-manifest.md stateDiagram**(baseline 예시): plan 미명시 / agent=삭제 경향.

## 4. Verification (C7 종결)

- skill-citation 0 stale (dead-link 제거가 핵심 — 부재 .template.md 참조 해소 / check13).
- workspace npm test 0 fail (docs / 영향 0 예상).
- release:check N/N (check21 template count 불변 / check13 / check10 version 11.33.0 유지).
- 전면 grep: active body(archive/examples/briefing/ADR 제외) deliverable twin emit 서술 0 + category-C figure(삭제 확정분) 0.

## 5. Risks

- **scope 확장**: plan §8 대비 templates READMEs dead-link + workflow/\*.md + template.md 재작성 추가(agent 발견 / v12 정합 필수 / 누락 시 dangling link 잔존).
- **CRLF**: 다수 .md 편집 → Edit(byte-preserving) 사용 / 대량 동형 편집은 node 스크립트(normalize→edit→restore).
- **twin vs functional 오판**: §0 규칙표 엄수 (functional report 보존 / findings.md 보존).
- **commit 단위**: C7 = 단일 commit (문서만 / breaking 0).

## 6. 차기 = C8 (version 12.0.0 3-way + STATUS/INDEX + 최종검증 + `.aimd-noop-ignore.txt` 제거).
