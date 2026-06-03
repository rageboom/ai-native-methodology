# Skills Axis — phase ID 와 skills 디렉토리 axis 분리 정책

> **상태**: 신설 (v1.4.4 / plan-v144-manifest-ssot.md / D-A=A3 + D-D=D1 결단)
> **SSOT**: `flows/analysis.phase-flow.json`
> **검증 도구**: `tools/drift-validator/` (3-way: manifest ↔ workflow ↔ skills)

## 1. 배경 — 두 개의 axis

본 plugin 에는 phase 를 가리키는 **두 개의 다른 axis** 가 공존한다. v1.4 FE 트랙 진입 (2026-05-02) 시 axis 가 분화되었으나 정책 명문 부재로 drift 위험이 누적되어 본 명세로 정착한다.

| Axis                  | 용도                                       | 예                                                                   |
| --------------------- | ------------------------------------------ | -------------------------------------------------------------------- |
| **manifest phase ID** | 분석 진행 단위 / phase 간 의존 그래프 노드 | `0`, `1`, `2`, `3`, `4`, `4.5`, `5-1`, `5-2`, `6`                    |
| **skills 디렉토리**   | 산출물 단위 / 자연어 trigger 의 매칭 단위  | `phase-2-architecture/`, `phase-5-schema-erd/`, `phase-5-state-map/` |

두 axis 의 phase 번호가 **같은 숫자라도 다른 phase 를 가리킬 수 있다**. 예: skills 의 `phase-2-architecture/` 는 manifest 의 phase `3` (arch) 의 skill 이고, manifest 의 phase `2` (db) 의 skill 은 `phase-5-schema-erd/` 다.

## 2. 정책

### 2.1 manifest phase ID = SSOT

`flows/analysis.phase-flow.json` 의 `phases[].id` 가 phase 의 **단일 진실**. 모든 phase 의존 그래프 / spec_file 매핑 / skills 매핑은 본 manifest 에 정의된다.

- workflow 의 `methodology-spec/workflow/phase-{id}-*.md` 파일명은 manifest phase ID 와 1:1 정합 의무.
- 그 외 모든 자산 (deliverables / schemas / templates / examples PoC) 의 phase 인용은 **manifest phase ID** 를 사용.

### 2.2 skills 디렉토리 = 산출물 번호 prefix axis (자유)

`skills/analysis/phase-{N}-{slug}/` 디렉토리명의 `phase-N` prefix 는 **산출물 번호 그룹의 라벨**이다. manifest phase ID 와 일치할 의무 ❌.

이유: skill 은 산출물 단위로 발동하고 (자연어 trigger → 1 skill = 1 산출물), 산출물 번호 (1~15) 와 manifest phase ID 는 본질적으로 다른 axis. 예:

- 산출물 #2 architecture 는 manifest phase `3` (arch) 에서 산출된다 → skills `phase-2-architecture/`.
- 산출물 #5-b schema 는 manifest phase `2` (db) 에서 산출된다 → skills `phase-5-schema-erd/`.

skill 디렉토리명은 **사용자가 산출물 번호로 기억하기 좋은 라벨**일 뿐, manifest 와의 정합은 매핑 필드를 통해 강제한다.

### 2.3 매핑 = manifest 의 `phases[].skills` 배열

각 manifest phase 는 `skills` 배열 필드를 가진다 (v1.4.4 신설). 본 phase 에서 발동되는 skill 들의 디렉토리명을 명시한다.

```json
{
	"id": "3",
	"name": "arch",
	"skills": ["phase-2-architecture"]
}
```

aspect skill 4종 (`aspect-a11y` / `aspect-i18n` / `aspect-static-security` / `aspect-legacy`) 은 `cross_cutting.aspects.skills` 에 분리.

### 2.4 drift-validator 3-way 검증 의무

`tools/drift-validator/` 가 commit 시점에 다음을 검증:

1. **manifest ↔ workflow**: `phases[].spec_file` 가 가리키는 파일이 `methodology-spec/workflow/` 안에 존재.
2. **manifest ↔ skills**: `phases[].skills[]` + `cross_cutting.aspects.skills[]` 의 모든 skill 디렉토리가 `skills/analysis/` 안에 존재 + `SKILL.md` 보유.
3. **skills ↔ manifest 역방향**: `skills/analysis/` 안의 모든 skill 이 manifest 의 어느 phase (또는 cross_cutting.aspects) 에 등록됨. **고아 skill 0 의무**.

3건 중 1건이라도 깨지면 CI fail. CI workflow = `.github/workflows/drift-check.yml`.

## 3. 신규 skill 추가 절차

```
1. skills/analysis/phase-{N}-{slug}/SKILL.md 신설
   - frontmatter: name / description / allowed-tools
   - phase-N prefix 는 산출물 번호 그룹 라벨로 자유 ( 정수 의무 ❌ — phase-4-5-cross-validation 같은 .5 도 허용)

2. flows/analysis.phase-flow.json 갱신
   - 본 skill 이 발동되는 manifest phase 의 skills 배열에 디렉토리명 추가
   - cross-cutting aspect 면 cross_cutting.aspects.skills 에 추가

3. drift-validator 통과 확인 (npm test in tools/drift-validator/)

4. CHANGELOG.md 신설 entry — skill 명 + 매핑 phase ID 명시
```

## 4. 신규 phase ID 추가 절차 ( MAJOR change)

신규 manifest phase ID 추가 = phase 의존 그래프 변경 = **본체 구조 변경**. 24h cooling-off + 사용자 명시 결단 + ≥2 PoC corroboration 의무.

본 명세는 v2.0 schema 변경 window 에서 다룬다. v1.4.x 안에서는 ❌.

## 5. 매핑 현황 (v1.4.4 시점)

| Manifest phase ID           | spec_file                 | skills (디렉토리명)                                                      |
| --------------------------- | ------------------------- | ------------------------------------------------------------------------ |
| 0                           | phase-0-input.md          | phase-0-input                                                            |
| 1                           | phase-1-init.md           | phase-1-inventory                                                        |
| 2 (db)                      | phase-2-db.md             | phase-5-schema-erd                                                       |
| 3 (arch)                    | phase-3-arch.md           | phase-2-architecture                                                     |
| 4 (business-logic)          | phase-4-business-logic.md | phase-3-domain, phase-4-rules, phase-5-form-validation                   |
| 4.5 (formal-spec)           | phase-4-5-formal-spec.md  | phase-4-5-cross-validation                                               |
| 5-1 (api)                   | phase-5-1-api.md          | phase-5-openapi, phase-5-rules, **phase-5-error-mapping** ( v1.5.0 신설) |
| 5-2 (ui)                    | phase-5-2-ui.md           | phase-5-state-map, phase-5-visual-manifest, phase-5-type-spec            |
| 6 (quality)                 | phase-6-quality.md        | phase-6-quality                                                          |
| **cross-cutting (aspects)** | (없음)                    | aspect-a11y, aspect-i18n, aspect-static-security, aspect-legacy          |

## 6. 본 정책의 한계

- 산출물 번호 axis 와 manifest phase ID 가 다른 의미체계라는 사실 자체는 **혼란을 가중**할 수 있다. 본 명세 + drift-validator 가 그 혼란을 명문 + 자동 검증으로 흡수.
- v2.0 진입 시 의미 ID + alias map (plan-b carry) 으로 자연 흡수 예정. 본 axis 분리 정책은 v1.4.x 의 과도기 패턴.
