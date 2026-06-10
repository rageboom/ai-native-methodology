# DEC-2026-06-10-ticket-cascade-builder

> **ticket-sync 결정론 핵심을 `tools/ticket-cascade-builder` Node 도구로 추출.** resolve + payload-build + 델타 판정 + body 템플릿 + cascade 순서 = 도구(결정론) / MCP 발사 + evidence + runtime fallback + gate = skill. 결정론 axis 복원 (도구=결정론 / skill=LLM·MCP).

**일자**: 2026-06-10
**카테고리**: 아키텍처 (결정론 axis 분리 / ticket-sync 리팩터)
**상태**: 승인 — 사용자 결단 (진단 → "정식 설계로 진행" → "전체 승인 — 착수" + config 파싱 = js-yaml dep)
**Trigger**: "왜 ticket-sync SKILL.md 가 길까?" 진단 → 근본 원인 4번(결정론 로직이 skill prose 로 존재) → 추출 ROI 진단 → 정식 설계

---

## 1. 문제 (결정론 axis 위반 outlier)

ticket-sync 는 프로젝트 원칙 `feedback_chain_driver_deterministic_axis`("도구=결정론 / skill=LLM 의미")를 **위반하는 유일 outlier**. resolve(role→issuetype)·parent linking·payload build·body 템플릿·델타 판정·cascade 순서 = **결정론**인데 LLM 이 해석하는 SKILL.md pseudo-code 로 존재 → drift-prone (실제 prefix·idempotency 버그가 이 영역에서 발생). 선례 `traceability-matrix-builder`(순수 결정론 builder / MCP 0) 와 동형 추출 가능.

## 2. 결단 (D1~D10 / plan-ticket-cascade-builder.md)

- **신규 도구** `tools/ticket-cascade-builder/` (`@mis-plugins/ticket-cascade-builder` / NO MCP·LLM·network).
- **계약**: task-plan + (operational-task/behavior-spec/AC/config/scope) → `cascade-plan.json` (신규 schema `cascade-plan.schema.json`).
- **도구 책임**: issue_type resolve / parent_spec / 델타(skip_prebound vs create) / body·summary 템플릿 / cascade 순서 / preview_md / evidence_skeleton.
- **skill 책임 (도구 밖)**: confirmation gate / MCP probe / search-first live / jira_create **발사** + 7-field evidence 캡쳐 / **runtime 400 fallback**(parent_link→parent_key→Relates / live 응답 의존) / graceful-missing / traceability write.
- **config 파싱**: 도구가 `js-yaml` 로 `ticket-sync-config.yaml` 읽음 (lazy require — core 는 무의존 / 단위 테스트 install 불요).
- **행위 보존 (breaking 0)**: cascade-plan 이 현 pseudo-code 와 동일 MCP 호출 생성. ticket-sync-evidence schema 무변경.

## 3. 변경 자산

| 자산 | 변경 |
| --- | --- |
| `tools/ticket-cascade-builder/` (신규) | package.json(js-yaml dep) + src/builder.js + src/cli.js + test/builder.test.js(15) + README |
| `schemas/cascade-plan.schema.json` (신규) | cascade-plan 계약 (calls[] + preview_md + skip_list + evidence_skeleton + counts) |
| `skills/ticket-sync/SKILL.md` | §3(preview→cascade-plan.preview_md) + §5(resolve→도구 호출) + §6 phase=exit(payload pseudo-code→cascade-plan.calls 발사 루프 + runtime fallback 유지) + §이슈유형(템플릿→도구 위임 / Bug 만 유지) |

## 4. 무영향 (불변)

- ticket 생성 시점 = plan stage 단일 / 4-level / canonical 6종 / delta 생성 / R20-prime (불변).
- ticket-sync-evidence.schema (evidence 는 skill 이 그대로 채움) / hooks / traceability (불변).
- length 감소는 **부수효과** (modest / MCP 실행부 비가역 잔존) — 본 결단의 정당화는 length 아니라 **결정론 axis 복원 + 테스트 가능성**.

## 5. 리스크 / 한계

- **split-brain**(도구 계획 ↔ skill 실행) → cascade-plan.schema 계약으로 강제.
- runtime fallback 은 도구 밖 (live 응답 의존) → cascade-plan = "happy-path 의도" schema 명시.
- 행위 보존 live 검증 불가(MCP 없이) → cascade-plan 단위 테스트(15) + schema valid 로 최대 근접.

## 인용

- plan: `.claude/plans/plan-ticket-cascade-builder.md`
- 원칙: memory `feedback_chain_driver_deterministic_axis` (도구=결정론 / skill=LLM)
- 선례: `tools/traceability-matrix-builder/` (순수 결정론 builder)
- 모: `DEC-2026-05-26-ticket-plan-단일` + `DEC-2026-06-10-ticket-delta-creation` + `DEC-2026-06-10-ticket-canonical-types`
- 운영: `skills/ticket-sync/SKILL.md` §단계 5·6 / `tools/ticket-cascade-builder/`
