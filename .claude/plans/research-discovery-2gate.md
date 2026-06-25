# research — discovery 2-게이트 (4원칙 2원칙 / 3-에이전트 병렬)

> 테크기업 사례 + 공식문서 교차검증 + 설계(아키텍트). 2026-06-25. plan = `plan-discovery-2gate.md`.

## Q1. 2-phase 요구사항 검토 ("싼 draft 로 방향 확정 → 디테일") — 정석인가?

**결론: novel 아님, 정석.** 5개 프로세스 선례가 독립 수렴:

| 선례 | 패턴 | 출처 |
|---|---|---|
| GitHub Copilot Workspace | Task → **Topic**(이른 방향 sanity) → Spec → Plan → Implement | Copilot Workspace User Manual (preview 2024-04) |
| GitHub Copilot CLI "plan before build" | `ask_user` 로 scope 확인 → 구조적 plan → 실행 | github.blog changelog 2026-01-21 (GA) |
| Amazon Working Backwards | PR(≤1p / 방향 forcing) **먼저** → FAQ(≤5p / 디테일) 나중 | workingbackwards.com (~2004 / 책 2021) |
| Google Design Docs | 스케치/canary(가벼움) → full/formal 검토 | industrialempathy.com (Malte Ubl, ~2020) |
| Oxide RFD | prediscussion → discussion(방향) → published → committed | RFD 0001 |
| Shape Up (Basecamp) | pitch → **betting table**(방향 확정) → build | Shape Up (2019) |

**함정 3개(공통)**: ① draft 가 무거우면 의미 상실(Google·Shape Up 명시 경고) ② 이중검토 피로 ③ 도식/스펙 staleness(소스에서 생성 안 하면).

## Q2. 단일 SSOT → render-time 산문/도식 (vs twin 파일)

**검증(1차출처)**: OpenAPI Initiative best-practices(learn.openapis.org) verbatim — *"always keep a single source of truth … information should not be duplicated … eventually one of the places will be updated while the other won't."* 코드주석+spec 동시 커밋 = 안티패턴 명시. Backstage TechDocs / Redoc / Swagger-UI 모두 "1 소스 → 뷰 생성". → 본 방법론 json-단독-SSOT(ADR-011)와 정합. **도식은 반드시 구조 데이터에서 생성**(hand-draw drift).

## Q3. GitHub Spec Kit `/clarify` (교차검증 / 1차출처)

- 실제 명령 = **`/speckit.clarify`**(bare `/clarify` 아님 / namespace). spec-kit `templates/commands/clarify.md` verbatim: *"clarification workflow expected run (and be completed) BEFORE invoking plan."* → **plan(디테일) 전에 질문**. (repo state 2026-06-25 fetch.)
- `/speckit.analyze` = cross-artifact consistency, tasks 후/implement 전, **read-only**.
- → 본 설계의 게이트①(open_questions 확정 + 범위 선택) = `/clarify` 동형. **정합.**

## Q4. Mermaid vs D3 (도식 엔진 / 오프라인 벤더)

- Mermaid 11.15.0(2026-06-25): 벤더 가능 + 오프라인 client-side 렌더 가능(`mermaid.run`/`render` / `securityLevel:'loose'` for click). 검증됨.
- **그러나 repo 에 D3 v7.9.0 이미 벤더**(`dep-graph-viz/assets/vendor/d3.v7.min.js` 279KB) + `impact-analyzer.js` 결정론 재사용 선례. → **D3 채택**(재사용 / 신규 의존 0). 도식은 `uc_dependencies`(엣지) + 난이도(노드)에서 force 그래프 생성.

## 종합 권고 → 채택

2-게이트 + render-time PRD 산문 + D3 영향 도식 + `/confirm-scope` 구조적 선택 = 잘 정초됨. 실행 리스크 = **게이트① draft 경량 유지**(함정①) + **도식은 소스 생성**(함정③) — 둘 다 설계 가드로 반영(phase 분리 / render-time). 이중검토 피로(함정②) = Auto Mode 게이트① skip.

## 출처
- Copilot Workspace User Manual; github.blog 2026-01-21; workingbackwards.com; industrialempathy.com (Design Docs at Google); Oxide RFD 0001; Shape Up (basecamp.com/shapeup); learn.openapis.org/best-practices.html; backstage.io TechDocs; github.com/github/spec-kit (clarify.md / analyze.md); mermaid.js.org/config/usage.html (v11.15.0).
