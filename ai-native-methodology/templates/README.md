# templates/ — 산출물 template

본 디렉토리 = phase / chain stage 별 산출물 placeholder template. plugin user 가 자기 산출물 작성 시 출발점.

## 디렉토리 구성

| 디렉토리 | 상태 | 내용 |
|---|---|---|
| [`analysis/`](./analysis/) | ★ ★ 활성 (21 template / flat layout) | BE 7대 + 4.5 formal-spec + 부속 (FE 8 + aspect 4 = skills/ 본문 inline) |
| [`adoption/`](./adoption/) | ★ build alias source | `CLAUDE.md` (사내 정책 inline) — build script 가 dist root CLAUDE.md 로 별칭 복사 |
| [`planning/`](./planning/) | ☐ placeholder | chain 1 / planning-spec template (sub-plan-4 채워짐 / 일부) |
| [`design/`](./design/) | ☐ placeholder | design stage (v2.x carry) |
| [`test/`](./test/) | ☐ placeholder | chain 3 / test-spec template (sub-plan-4 채워짐 / 일부) |
| [`implement/`](./implement/) | ☐ placeholder | chain 4 / impl-spec template (sub-plan-4 채워짐 / 일부) |

## analysis/ 템플릿 (21 / flat layout)

BE 7대 + 4.5 formal-spec:
- 1 architecture — `architecture.template.md` + `architecture.template.mermaid`
- 2 domain — `domain.template.md` + `domain.template.mermaid`
- 3 api — `api.template.md` + `api.template.yaml`
- 4 db-schema — `db-schema.template.md` + `erd.template.mermaid`
- 4.5 formal-spec — `formal-spec.template.md` + `decision-table.template.md` + `sequence.template.mermaid` + `state-machine.template.mermaid`
- 5 rules — `rules.template.md`
- 6 antipatterns — `antipatterns.template.md`
- 7 ui-spec — `ui-spec.template.md` + `ui-spec.template.mermaid`

부속 (4):
- `inventory.template.md` + `inventory.template.json`
- `meta-confidence.template.yaml`
- `openapi-extension.template.json`
- `finding.template.md`

★ FE 8 (state-map / visual-manifest / form-validation / type-spec / error-mapping + a11y / i18n / static-security / legacy-spectrum) + aspect 4 → skill SKILL.md 본문 inline placeholder (별도 template 파일 ❌)
★ `phase-flow.template.mermaid` 영역 → [`../flows/*.mermaid`](../flows/) SSOT (template 영역 X)

## adoption/ build alias

| 파일 | dist root 별칭 |
|---|---|
| `templates/adoption/CLAUDE.md` | `dist/ai-native-methodology-v<version>/CLAUDE.md` (★ build script auto copy) |

★ build-plugin.js 가 본 파일을 dist root CLAUDE.md 로 alias 복사. plugin install 후 매 Claude Code 세션 자동 로드. 사내 적용 정책 23 inline (chain harness 5 요소 + 검증 도구 12 + NestJS 4 + Spring 5).

★ ★ cleanup round 2-A (2026-05-06) — `templates/adoption/README.md` 의 dist root ADOPTION-README 별칭 복사 비활성 (단일 entry-point 정합 / source 보존).

## chain stage placeholder (planning/spec/test/implement/design)

sub-plan-4 (DEC-2026-05-06-sub-plan-4-종결) 에서 일부 채워짐. 미채움 부분 = v2.x carry.

★ 향후 round 2-B 후속 작업으로 정돈 예정 (lifecycle placeholder 통합).

## 호출

template 은 [`../skills/`](../skills/) 의 `_base/apply-template` skill 을 통해 instantiate. 직접 cp 도 가능.

```bash
# Skill 안에서
@templates/analysis/api.template.md → instantiate
```

## 참조

- [`../README.md`](../README.md) — plugin user 진입점
- [`../methodology-spec/deliverables/`](../methodology-spec/deliverables/) — 각 산출물 명세 (template 의 의도 + 채울 자료)
- [`../skills/_base-apply-template/`](../skills/_base-apply-template/) — template instantiate skill
