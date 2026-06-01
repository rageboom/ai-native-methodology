# templates/ — 산출물 template

본 디렉토리 = phase / chain stage 별 산출물 placeholder template. plugin user 가 자기 산출물 작성 시 출발점. ★ v12.0.0 (ADR-011) — 산출물 = json 단독 SSOT / `.template.md`·`.template.mermaid` twin 폐지.

## 디렉토리 구성

| 디렉토리 | 상태 | 내용 |
|---|---|---|
| [`analysis/`](./analysis/) | ★ ★ 활성 (json 단독 / flat layout) | inventory + openapi-extension `.template.json` + 작성가이드 `.template.md` 3 + 부속 `.template.yaml` 2. 그 외 산출물 = schema-driven inline |
| [`adoption/`](./adoption/) | ★ build alias source | `CLAUDE.md` (사내 정책 inline) — build script 가 dist root CLAUDE.md 로 별칭 복사 |
| [`discovery/`](./discovery/) | ★ 활성 (v11.0.0 rename) | chain 1 (discovery) / discovery-spec template |
| [`spec/`](./spec/) | ★ 활성 (v11.0.0 신설) | chain 2 (spec) / behavior-spec + acceptance-criteria template |
| [`plan/`](./plan/) | ★ 활성 (v11.0.0 신설) | chain 3 (plan) / task-plan template |
| [`test/`](./test/) | ★ 활성 (v11.0.0 신설) | chain 4 (test) / test-spec template (framework 분기 inline 주석) |
| [`implement/`](./implement/) | ★ 활성 (v11.0.0 신설) | chain 5 (implement) / impl-spec template (stack 분기 inline 주석) |
| [`design/`](./design/) | ☐ placeholder | design stage (v12.x carry) |

## analysis/ 템플릿 (★ v12 json 단독 / ADR-011)

★ v12.0.0 — `.template.md`·`.template.mermaid` twin 폐지. 산출물 = json 단독 SSOT.

`.template.json` (2):
- `inventory.template.json`
- `openapi-extension.template.json`

작성 가이드 `.template.md` (3 / json twin 아님 — 보존):
- `formal-spec.template.md` — Phase 4.5 형식 명세 5 산출물 작성 가이드 (산출물 = state-machines/sequence-diagrams/decision-tables `.json` + invariants `.ts` + property-tests)
- `decision-table.template.md` — decision table 작성 가이드 (json SSOT = formal-spec/business-rules decision_grids — DT-json)
- `finding.template.md` — finding-system 작성 가이드 (audit registry / findings.md)

부속 `.template.yaml` (2):
- `api.template.yaml`
- `meta-confidence.template.yaml`

★ 그 외 analysis 산출물 (architecture / domain / business-rules / antipatterns / db-schema / ui-spec + FE 8 + aspect 4) = 해당 schema 기반 skill SKILL.md 본문 inline placeholder (별도 template 파일 ❌).

## adoption/ build alias

| 파일 | dist root 별칭 |
|---|---|
| `templates/adoption/CLAUDE.md` | `dist/ai-native-methodology-v<version>/CLAUDE.md` (★ build script auto copy) |

★ build-plugin.js 가 본 파일을 dist root CLAUDE.md 로 alias 복사. plugin install 후 매 Claude Code 세션 자동 로드. 사내 적용 정책 23 inline (chain harness 5 요소 + 검증 도구 12 + NestJS 4 + Spring 5).

★ ★ cleanup round 2-A (2026-05-06) — `templates/adoption/README.md` 의 dist root ADOPTION-README 별칭 복사 비활성 (단일 entry-point 정합 / source 보존).

## chain stage template (discovery/spec/plan/test/implement)

★ v11.0.0 (DEC-2026-05-26-v11-paradigm-결단) — 5 chain stage template body. ★ v12.0.0 — json 단독 (`.template.json` / `.md` twin 폐지).

| 디렉토리 | template | source skill |
|---|---|---|
| discovery/ | discovery-spec.template.json | discovery-from-analysis-output |
| spec/ | behavior-spec.template.json + acceptance-criteria.template.json | spec-compose-behavior-spec + spec-derive-acceptance-criteria |
| plan/ | task-plan.template.json (Epic/Story/OP cascade = task-plan.json + ticket-sync skill) | plan-decompose-and-sequence + plan-architect-decisions + plan-risk-and-nfr |
| test/ | test-spec.template.json | test-generate-test-spec |
| implement/ | impl-spec.template.json | implement-generate-impl-spec |

## 호출

template 은 [`../skills/`](../skills/) 의 `_base-apply-template` skill 을 통해 instantiate. 직접 cp 도 가능.

```bash
# Skill 안에서
@templates/analysis/inventory.template.json → instantiate
```

## 참조

- [`../README.md`](../README.md) — plugin user 진입점
- [`../methodology-spec/deliverables/`](../methodology-spec/deliverables/) — 각 산출물 명세 (template 의 의도 + 채울 자료)
- [`../skills/_base-apply-template/`](../skills/_base-apply-template/) — template instantiate skill
