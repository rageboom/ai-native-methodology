# plan — discovery 2-게이트 (PRD 가독성 + 사용자 선택 + draft-first)

> 4원칙 1원칙 산출물. 시행 완료 (v0.77.0 / DEC-2026-06-25-discovery-2-gate). research = `research-discovery-2gate.md`.

## 1. 맥락 (사용자 발화)

discovery 게이트의 브라우저 검토 화면(`plan-review-server`)이:
1. **읽기 어렵다** — JSON 그대로 옮겨 압축 언어 → "PRD 아닌 JSON 인스펙터". 산문 + 도식 필요.
2. **사용자 선택 불가** — 방향/범위를 골라야 함.
3. **타이밍** — spec 완성 후 보여줘 늦음. 가벼운 draft 먼저 → 확정 → 디테일(재작업 최소화). "discovery 가 모든 산출물·연관 영향도 파악 지점".

## 2. 깊은 숙지 (전수 조사 결론)

- 렌더러 = generic field-walker(`assets/kit.js` `Kit.arrange`). 산문 0 / 도식 0 / 선택 UI 0. 유일 사람말 = 표시-전용 `--summaries`.
- discovery-spec.json 은 게이트 전 **완전 작성**(`flows/discovery.phase-flow.json` `discovery-spec-compose`). 영향도(`uc_dependencies`/`impact_count`)도 게이트 전 계산되나 **시각화 안 됨**.
- **결정적 발견**: chain-driver `next` = **stage 단위**(stage당 게이트 1개 / `current_phase`=표시전용). → 게이트①을 추가해도 **상태머신 무접촉 가능**(intra-stage soft 체크포인트).
- 제약: **json 단독 SSOT(ADR-011)** — 산문·도식은 render-time only(`.md`/`.mermaid` twin 폐기).

## 3. 설계 (확정)

discovery 2-게이트. **게이트①은 chain-driver 게이트 아님** → STRONG-STOP 결정론 axis 보존.

흐름(`discovery.phase-flow.json` v3.2.0): `discovery-spec-draft`(draft / 디테일 미충전) → `gate-1-draft`(게이트① / `gate` 없음 / review-only) → `discovery-spec-detail`(in_scope UC 디테일 / final) → `gate-1`(게이트② / `#1` 무변경).

- **가독성**: 신규 `--phase discovery-draft` + `assets/renderers/discovery-draft.js` — PRD 산문(배경·목적/범위) + UC 의존성·난이도 영향 도식(벤더 D3 / `emit.js` draft phase 한정 inline). persist ❌.
- **선택**: `POST /confirm-scope` — 사람 소유 필드만 화이트리스트 직접 write(`in_scope`/`conflicts.resolved`+`resolution_ref`/`open_questions.status`+`answer`+`finalization_status=confirmed`). LLM inject ❌. `PLAN_REVIEW_CONFIRM` 마커 → detail-fill 재진입. `/apply` 자유텍스트 병행.
- **schema**: `finalization_status`(draft/confirmed/final) + `use_cases[].in_scope`(default true) + `acceptance_criteria_refs` required 완화. `intervention-log` `scope_confirm` + stage enum `discovery`/`plan`.
- **validator**: `--draft|--final`(또는 finalization_status 추론) — draft skip 디테일 finding + pending advisory / final in_scope coverage 분자.
- **gate skill / agent**: 2-spawn 절 + 절차 갱신.

## 4. 변경 파일

- `schemas/discovery-spec.schema.json`, `schemas/intervention-log.schema.json`
- `flows/discovery.phase-flow.json` (v3.2.0)
- `tools/plan-review-server/`: `src/{artifact-registry,emit,server,cli}.js` + `assets/kit.js` + `assets/renderers/discovery-draft.js`(신규) + `assets/vendor/d3.v7.min.js`(복사)
- `tools/discovery-extraction-validator/src/{validator,cli}.js`
- `skills/_base-invoke-go-stop-gate/SKILL.md` + `agents/discovery-agent.md` + discovery skill 3종 "언제 사용" prose
- release: `plugin.json`/`package.json`/`CHANGELOG.md`/`README.md`/`CLAUDE.md` 0.77.0 + `decisions/DEC-2026-06-25-discovery-2-gate.md` + INDEX

## 5. 검증 결과

- `plan-review-server/test/discovery-draft.test.js` 7 pass (PHASES / buildHtmlMulti draft=D3+renderer·final=경량 / renderAs 전파 / `/confirm-scope` 화이트리스트+주입무시+onConfirm+409 / CLI spawn E2E + `PLAN_REVIEW_CONFIRM` 마커).
- `discovery-extraction-validator` 2-gate 3 pass + 기존 43 무회귀.
- drift-validator `--check-chain-layout` 통과(34 phases / 0 orphans) + handoff-consistency 통과.
- version-check 3-way 0.77.0 sync. **release-readiness 43/43 = release-ready** (workspace 2034/2036 / 0 fail).

## 6. Lessons / 잔여 (§8.1)

- **함정 회피**: research 가 경고한 ①draft-churn(가볍게 / 디테일 phase 분리) ②이중검토 피로(Auto Mode 게이트① skip) ③도식 drift(uc_dependencies 에서 render-time 생성) 모두 설계에 반영.
- **handoff-validator 함정**: phase output 에 `intervention-log.jsonl` 나열 시 `handoff.output-unknown-artifact` breaking → 제거(audit log 는 handoff 아티팩트 아님 / skill 이 기록).
- **provenance 가드**: skill 본문 `DEC-` 토큰 = release-block → `## 인용` footer 로 이동.
- 잔여: ≥2 PoC E2E dogfood(draft→confirm→detail 완주) corroboration / 최종 뷰 PRD-산문화(현 iteration 은 게이트① 집중) / Jira OP Task(사용자 confirmation gate).
