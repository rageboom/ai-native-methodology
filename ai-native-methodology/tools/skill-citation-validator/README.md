# skill-citation-validator

`skills/*/SKILL.md` **내부 인용 정합** 결정적 검증 도구. AI 추론 0% (정규식 + 명시 existence + 부재-context 필터만 / no-simulation 정합).

## 배경

doc 재구조화(deliverables 재번호 `04-rules.md`→`5-business-rules.md` / workflow `phase-N`→semantic / schema `-spec`·`-spectrum` 접미 / v7.0.0 `rules.schema.json`→`business-rules.schema.json`)가 SKILL.md "본체 명세 / Spec reference" 인용에 미전파되어 **dead-link stale 인용**이 누적. 기존 validator 사각 (drift-validator=flows / formal-spec-link-validator=chain 산출물 / SKILL.md 산문 인용은 무검증). v8.1.0 신설 (ADR-PLUGIN-001 §7 patch v2 / R18 내부 정합 enforcement).

## 검사 class (low-FP — Senior F3 content-aware 정합)

| # | class | 규칙 |
|---|---|---|
| 1 | schema | `<name>.schema.json` → `schemas/<name>.schema.json` 실존 의무 |
| 2 | repo-path | `(methodology-spec\|flows\|templates\|schemas\|docs/adr)/….(md\|json\|yaml\|mermaid)` 실존 의무 |
| 3 | ADR | `ADR-(<NS>-)?<n>` → `docs/adr/` 매칭 의무 (단 동일 라인 `부재/absent/대체/폐기/미존재` = 의도적 부재 → skip) |
| 4 | DEC | `DEC-YYYY-MM-DD-<slug>` → `decisions/` 또는 `INDEX-HISTORY`/`STATUS-HISTORY` 실존 (`.md` 접미 정규화) |

**scope 외 (의도적)**: bare skill-name / tool-name backtick 인용 — carry/future/별도 prose FP 높고 drift-validator·manifest 가 이미 커버.

## 사용

```bash
node tools/skill-citation-validator/src/cli.js [--json] [--root <repoRoot>]
# exit 0 = 0 stale / 1 = stale 검출
```

release-readiness **check #13** (`skill_citation_integrity`)으로 통합 — 향후 doc 재구조화 시 SKILL.md stale 인용을 release gate 에서 자동 차단.

## 테스트

```bash
npm test --workspace=tools/skill-citation-validator
# regression-guard (실 repo 0 finding 의무 / dogfood) + synthetic 양성 + FP 필터 입증
```
