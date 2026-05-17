# Non-use Rationale — poc-14-fsim-corroboration

> ★ ★ ★ 미 fire element 별 사유 + 재현 조건. plan: `.claude/plans/peaceful-dreaming-dragonfly.md` §3.3.
> 시뮬레이션 종결 시 완성. 본 파일 = 시뮬레이션 진행 중 점진적 작성.

## Category 분류

- **stack-signal-absent**: 본 PoC 의 stack 에 해당 lib/framework 부재 (자동 dispatcher 조건 불충족)
- **scenario-mismatch**: 시나리오 종류 (A/B/C) 외 — 예: JSP scenario 한정
- **track-mismatch**: FE/BE/DB 트랙 불일치 (본 PoC = BE-only)
- **placeholder**: v4.0 placeholder (skill 부재)
- **optional-critique**: 선택적 critique skill (사용자 명시 invoke 시만)
- **optional-research**: 선택적 research skill
- **explicit-scope-out**: 본 PoC 의도된 scope-out
- **unknown**: 현재 미분류 / 추후 확인

## 1차 예상 (시뮬레이션 시작 시점 / Phase 1 Explore 기반)

| element | element_type | category | rationale | reproduce_condition |
|---|---|---|---|---|
| analysis-from-figma | skill (input) | stack-signal-absent | Figma URL 입력 ❌ | Figma 데스크톱 앱 + frame URL 제공 시 fire |
| analysis-aspect-i18n | skill (aspect) | stack-signal-absent | i18next/react-intl/vue-i18n 부재 | i18n lib package.json 발견 시 자동 fire |
| analysis-aspect-legacy | skill (aspect) | stack-signal-absent | Strangler 패턴 부재 (greenfield small target) | deprecated API + old/new codepath 공존 시 fire |
| analysis-html-template | skill | scenario-mismatch | Scenario C JSP 한정 / FastAPI = Jinja2 가능하나 본 PoC scope-out | JSP/Thymeleaf/EJS/ERB 신호 시 fire |
| analysis-type-spec-fe | skill (FE) | track-mismatch | BE-only / TypeScript 부재 | .tsx/.ts + tsconfig.json 시 fire |
| analysis-ui-state-map-fe | skill (FE) | track-mismatch | FE state lib 부재 | Zustand/Redux/Pinia 시 fire |
| analysis-ui-visual-manifest-fe | skill (FE) | track-mismatch | design token / Tailwind / Storybook 부재 | DTCG token / Tailwind 시 fire |
| analysis-form-validation-fe | skill (FE?) | **uncertain** | ★ Pydantic 도 schema validation lib 인데 skill description 이 "FE-specific" 으로 한정 — 실 fire 여부 시뮬레이션 시 확인 | SKILL.md description 정확 매칭 시 |
| test-playwright | skill | scenario-mismatch | FE e2e scope 부재 | Playwright spec 필요 시 fire |
| implement-react | skill | track-mismatch | FE React 부재 | React 19 component impl 시 fire |
| implement-vue | skill | track-mismatch | Vue SFC 부재 | .vue 파일 impl 시 fire |
| design-agent | agent | placeholder | v4.0 PLACEHOLDER / skill 0종 | design-* skill 5~6종 신설 후 dispatch 가능 |
| _base-senior-engineer | agent (base) | optional-critique | 본 시뮬레이션 단독 dogfood — Senior critique 선택 invoke | "Senior 검토" 사용자 명시 시 dispatch |
| _base-industry-case-researcher | agent (base) | optional-research | 본 시뮬레이션 = internal element coverage 자체 | external framework 비교 필요 시 dispatch |
| _base-official-docs-checker | agent (base) | optional-research | 시뮬레이션 내부 / 외부 docs 검증 불요 | 외부 권위 docs 인용 검증 시 dispatch |
| spectral-runner | tool | scenario-mismatch | spectral = Stoplight OpenAPI linter / 본 시뮬레이션은 spectral 실행 안 함 (carry) | swagger lint 필요 시 spectral 실행 |
| sql-inventory-extractor | tool | uncertain | ★ RDB 신호 있음 (SQLite + SQLAlchemy) — 정상 시뮬레이션 시 fire 예상 | analysis-sql-inventory skill 시 |

## 시뮬레이션 진행 중 확인 의무

- analysis-form-validation-fe 의 Pydantic 매칭 여부 — SKILL.md description 정독 후 확정
- analysis-sql-inventory 의 SQLite 신호 detection 여부 (PoC #06/07/11 iBATIS 와 비교)
- 본 PoC 가 진행됨에 따라 추가 non-fire 발견 시 위 표 append

## 시뮬레이션 종결 시 추가

- 종결 시점 각 element 의 fire/non-fire 최종 분류
- non-use category breakdown 통계 (예: track-mismatch=N / stack-signal-absent=M / ...)
- 본 PoC 한정인지 일반적 non-use 인지 명시
