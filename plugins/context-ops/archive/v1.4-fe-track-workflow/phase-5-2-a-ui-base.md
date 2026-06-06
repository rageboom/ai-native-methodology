# Phase 5-2-a: ui-base (UI 기본 명세 추출)

> **명령어**: `/analyze-ui-base` · **deliverable**: #7 ui-spec
> **짝**: `phase-5-2-b-state.md` (분산 상태) / `phase-5-2-c-visual.md` (시각 산출)
> Phase 5-1 (API) 와 **병렬 실행 가능**

---

## 1. 목적

FE 코드에서 **deliverable 7 (UI/UX 명세) 의 5개 하위 산출물** 추출:

1. 페이지 인벤토리
2. 사용자 흐름
3. 컴포넌트 트리 (Atomic Design / FSD / legacy fallback Tier 1~4)
4. 디자인 토큰 (DTCG 2025.10)
5. 사용자 시나리오

⚠️ deliverable 8 (state-map) / 9 (visual-manifest) 와 다름: 본 phase = **정적 구조만** / state machine 은 5-2-b / 시각 진실은 5-2-c.

---

## 2. 입력

| 입력           | 비고                                |
| -------------- | ----------------------------------- |
| FE 소스 코드   | Tier 1~4 (ADR-FE-001 spectrum 정합) |
| 디자인 명세    | `inputs/design/` (있으면)           |
| Storybook 설정 | 컴포넌트 분류 + CSF v3 정합 보강    |
| Phase 4 결과   | UC, BR (시나리오 매핑용)            |
| Phase 5-1 결과 | API operationId 매핑                |

---

## 3. 처리 — 5개 하위 산출물 병렬

### 3.1 framework + Tier detection

ADR-FE-001 spectrum 정합:

| Tier                   | 감지 신호                                                         | framework enum        |
| ---------------------- | ----------------------------------------------------------------- | --------------------- |
| Tier 1 (Modern SPA)    | `package.json` react / vue / svelte / solid / qwik / astro / next | react, vue, ..., next |
| Tier 2 (jQuery legacy) | `<script src="jquery">` + `$(selector)` 패턴                      | `jquery_legacy`       |
| Tier 3 (Vanilla JS)    | 모듈 패턴 + IIFE + 직접 DOM 조작                                  | `vanilla_js`          |
| Tier 4 (server-side)   | `.jsp` / `.thymeleaf` / `.erb` 파일                               | `jsp_template`        |

→ Tier 별 추출 가능성 차등 (deliverable 7 §6.4 정합).

### 3.2 페이지 인벤토리

라우팅 설정 자동 추출:

- React Router: `<Route>` 컴포넌트
- Next.js: `pages/` 또는 `app/` 디렉토리 구조
- Vue Router: routes 배열
- Tier 4: BE Spring MVC `@RequestMapping` (Stage 6 ADR-FE-004 BE/FE 통합)

→ pages.json (PAGE-XXX ID 부여)

### 3.3 사용자 흐름

`navigate()`, `<Link>`, `<a href>` 호출 추적 + 조건부 분기 LLM 추론:

```typescript
const handleSubmit = async () => {
	if (!user) {
		navigate('/login'); // 분기 1
		return;
	}
	if (cart.length === 0) {
		toast('장바구니 비어있음'); // 분기 2 (네비게이션 X)
		return;
	}
	navigate('/checkout'); // 분기 3
};
```

→ Mermaid flowchart 자동 생성.

### 3.4 컴포넌트 트리 (Tier 1~4 fallback)

| Tier   | 분류 방식                     | level enum                             |
| ------ | ----------------------------- | -------------------------------------- |
| Tier 1 | Atomic Design or FSD          | `atom` ~ `widget`                      |
| Tier 2 | jQuery selector + plugin 단위 | `legacy_widget`                        |
| Tier 3 | 모듈 패턴 단위                | `legacy_widget` 또는 `legacy_template` |
| Tier 4 | template fragment             | `legacy_template`                      |

### 3.5 디자인 토큰 (DTCG 2025.10)

| 출처                    | 추출 가능성     | DTCG 호환                        |
| ----------------------- | --------------- | -------------------------------- |
| Tailwind config         | 매우 높음 (95%) | $value/$type 매핑 가능           |
| CSS variables           | 높음 (90%)      | $value 매핑                      |
| Styled-components theme | 높음 (85%)      | $value 매핑                      |
| Material-UI theme       | 높음 (90%)      | $value 매핑                      |
| 인라인 스타일 난무      | 매우 낮음 (30%) | ❌ AP-FE-DESIGN-\* 안티패턴 등록 |

`design_tokens.spec_source` = `https://www.designtokens.org/TR/2025.10/format/` 고정 의무 (ADR-FE-005 §2.2.1).

### 3.6 사용자 시나리오 (가장 어려움)

LLM 종합:

- 페이지 흐름 (3.3)
- 페이지의 API 호출 (Phase 5-1 cross-link)
- 페이지의 권한 요구 (Phase 4 5.B)
- 도메인 UC (Phase 4)

→ end-to-end 시나리오 (SCN-XXX). `human_review_status` 의무.

---

## 4. 출력

```
.ai-analysis/output/ui/
├── ui-spec.json             # AI 눈 (통합)
├── pages.md                 # 페이지 인벤토리 사람용
├── user-flows.mermaid       # 사용자 흐름 다이어그램
├── components.md            # 컴포넌트 트리
├── component-tree.mermaid   # drift-validator FE 적용 대상
├── design-tokens.json       # 디자인 토큰 (DTCG 정합)
├── scenarios.md             # 사용자 시나리오
└── _manifest.yml
```

---

## 5. 승인 게이트

```
□ ui-spec.json schema 검증 통과 (ui-spec.schema.json)
□ framework + Tier 1~4 명시
□ 모든 PAGE 에 ID, route, auth, roles
□ 사용자 흐름 Mermaid 렌더링
□ 컴포넌트 분류 방식 (Atomic / FSD / legacy fallback) 명시
□ design_tokens.spec_source = DTCG URL 고정 (ADR-FE-005)
□ design_tokens.spec_status = community_group_report 명시
□ 디자인 토큰 명세 (없으면 안티패턴 등록)
□ 사용자 시나리오 = 기획자 검토 (human_review_status)
□ 페이지 ↔ API operationId 매핑 = Phase 5-1 정합
□ 페이지 ↔ UC 매핑 = Phase 4 정합
□ component-tree.mermaid drift-validator FE 적용
```

---

## 6. 신뢰도 (ADR-009 §2.4 정합)

deliverable 7 §3.1 표 정합. Tier 1 기준 단계 3 평균 80%.

---

## 7. 다음

- Phase 5-2-b (state) → deliverable 8
- Phase 5-2-c (visual) → deliverable 9 (Playwright + axe-core 진짜 실행 의무)
- Phase 6 (`/analyze-quality`) — AP-FE-\* 안티패턴 등록
