# ADR-FE-004: BE/FE 분리 운영 정책 — Scenario A 분리 default + B JS풀스택 + C JSP 예외

- 상태: 승인됨 (Accepted)
- 일자: 2026-05-01
- 결정자: 윤주스 (TF Lead, Auto Mode 위임)
- 관련: ADR-001 (사상적 기반), ADR-002 (산출물), ADR-FE-001 (FE 추출기 가정 — 짝), ADR-FE-003 (legacy spectrum + Tier 4), ADR-FE-006 (프레임워크 중립 IR 사상 — 짝), DEC-2026-05-01-v1.4-Stage-2-Gate-결단 (G2-3)

> **본 ADR 의 위치** — v1.4 FE 트랙의 **횡단 정책 1**. ADR-FE-001 의 §6 (Tier 4 JSP 예외 Stage 6 carry) + ADR-FE-003 의 §2.4 (Tier 4 ADR-FE-004 예외) 양쪽의 carry-over 종결.

---

## 1. 컨텍스트

본 방법론은 v1.3.x 까지 BE 영역만 입증 (PoC #01/#02/#03). v1.4 FE 트랙 격상 시:

- Scenario A (분리 default) — 사용자 진단 정합 가장 높음 (사내 표준 React+TS+TanStack Query+Zustand+Axios + 별도 BE)
- Scenario B (JS 풀스택) — Next.js / Nuxt / Remix / Astro / SvelteKit = FE+BE 단일 코드베이스
- Scenario C (JSP / Thymeleaf / ERB) — Tier 4 server-side template = FE/BE 통합

Stage 1 research × 3 + Stage 2 Gate G2-3 결단:

> "BE/FE 분리 default + JS 풀스택 + JSP ADR 예외"

ADR-FE-001 / ADR-FE-003 에서 Tier 4 = "Stage 6 ADR-FE-004 carry" 명시. 본 ADR 로 종결.

### 1.1 사용자 요구 5 = 100% 도달 (Stage 6 핵심)

| 요구                                       | 본 ADR 반영                                                       |
| ------------------------------------------ | ----------------------------------------------------------------- |
| 5. BE/FE 분리 운영 + 예외 (JS풀스택 / JSP) | 본 ADR — 3 Scenario 정식 채택 / 산출 명령 차이 / Tier 4 통합 절차 |

→ Stage 6 종결 = 사용자 7 요구사항 **7/7 = 100% 도달**.

---

## 2. 결정

**3 Scenario 정식 채택. Scenario A 분리 default + B/C ADR 예외.**

### 2.1 Scenario 매트릭스 (핵심)

| Scenario                    | 정의                                                                             | 산출                                                          | 운영                               |
| --------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------- |
| **A 분리 default**          | Modern SPA (React/Vue/Angular/Svelte) + 별도 BE 서버 (Spring/NestJS/FastAPI 등)  | BE = deliverable 1~6 / FE = deliverable 7~13 (독립 산출 가능) | 두 팀 / 별도 repo 가능             |
| **B JS 풀스택**             | Next.js / Nuxt / Remix / Astro / SvelteKit / Solid Start = FE+BE 단일 코드베이스 | deliverable 1~13 통합 산출 (한 팀 / 한 명령)                  | 한 팀 / 단일 repo                  |
| **C JSP / Thymeleaf / ERB** | Tier 4 server-side template = FE+BE 통합 (BE 라우팅 + JSP 렌더링)                | BE deliverable 1~6 + FE deliverable 7/13 통합 산출            | 한 팀 / 단일 repo / 통합 분석 의무 |

### 2.2 Scenario detection 자동 절차 (Phase 0 입력)

```yaml
detection_rules:
  scenario_A_signal:
    - has_separate_be_server: true # docker-compose / package.json + pom.xml 동시 또는 분리 repo
    - frontend_only_package_json: true
    - tier: 1_modern_spa

  scenario_B_signal:
    - package.json 의 dependencies:
        - next / nuxt / remix / @remix-run / @astrojs/* / solid-start / sveltekit
    - has_api_routes_dir: true # pages/api/ / app/api/ / server/api/
    - tier: 1_modern_spa (mixed mode)

  scenario_C_signal:
    - file_extension: .jsp / .thymeleaf / .erb
    - has_be_server_with_template_engine: true # spring-boot-starter-thymeleaf / jstl 등
    - tier: 4_server_side_template (또는 mixed Tier 1+4)

  default_when_unclear: scenario_A
```

### 2.3 산출 명령 차이

| Scenario | BE 명령                                                                                                        | FE 명령                                                                     | 통합 명령                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **A**    | `/analyze-init`, `/analyze-db`, `/analyze-arch`, `/analyze-business-logic`, `/analyze-api`, `/analyze-quality` | `/analyze-ui-base`, `/analyze-state`, `/analyze-visual`, `/analyze-quality` | (불필요 — 분리 운영)                                                                  |
| **B**    | (위 BE 명령 대신)                                                                                              | (위 FE 명령 대신)                                                           | `/analyze-fullstack --scenario=B` (deliverable 1~13 통합)                             |
| **C**    | `/analyze-init`, `/analyze-db`, ..., `/analyze-quality`                                                        | (병행)                                                                      | `/analyze-init --scenario=C` 시 JSP 통합 인식 + ui-spec.framework=`jsp_template` 자동 |

### 2.4 Tier 4 (JSP) BE/FE 통합 산출 절차 (Stage 3-1/3-2 carry 종결)

```yaml
JSP_통합_산출_절차:
  1. Phase 0 입력:
    - BE Spring + JSP source 양쪽 입력
    - scenario detection → C 자동 인식

  2. Phase 1 (init):
    - inventory.json — JSP 파일 + BE controller 모두 인식
    - legacy-spectrum.json — primary_tier=4 또는 mixed (Tier 1+4)
    - tier_4_be_fe_handling = "scenario_c_integrated"

  3. Phase 2~3 (db / arch):
    - BE 영역만 (FE 변경 ❌)

  4. Phase 4 (business-logic):
    - BE Spring controller + JSP 의 form action + JSP scriptlet (권장 ❌) 모두 추출
    - rules.json `category=fe_validation` ↔ Spring `@Valid` cross-link

  5. Phase 5-1 (api):
    - BE @RequestMapping + JSP form action URL 통합 인식
    - openapi.yaml — JSP form submit 도 endpoint 등록

  6. Phase 5-2 (ui):
    - ui-spec.framework = "jsp_template"
    - pages = JSP 파일 단위 / route = Spring @RequestMapping 기반
    - components = template fragment + include 그래프 (level=legacy_template)
    - state-map = ❌ N/A (server-side state — BE deliverable 5 rules 가 담당)
    - visual-manifest = ✅ Playwright 진짜 실행 (rendering 후 동일)

  7. Phase 6 (quality):
    - BE migration-cautions.md + FE migration-cautions-fe.md 양쪽 의무
    - JSP-specific 함정 등재 (XSS escape <c:out> 사용 / form action 분산)

  통합 산출 시 차이:
    - scenario A 와 다름 — JSP 파일이 BE 와 동일 repo / 통합 분석 의무
    - scenario B 와 다름 — JS 가 아니라 server-side template / API route ❌
```

→ Tier 4 의 ADR-FE-001 §6 "Stage 6 carry" + ADR-FE-003 §2.4 "ADR-FE-004 carry" 양쪽 종결.

---

## 3. 결과 (Consequences)

### 3.1 좋은 점

- **사용자 요구 5 = 100% 도달** — 7/7 달성 (v1.4 본체 quality 격상 완성).
- **Scenario default 명시** — 사용자 사내 환경 (React+TS+별도 BE) = Scenario A 정합 100%.
- **JS 풀스택 / JSP 예외 명시** — 산업 spectrum 모두 cover (Modern split / Next.js / legacy JSP).
- **Tier 4 carry 종결** — Stage 3-1/3-2 의 carry-over 결단 정식 해소.

### 3.2 나쁜 점

- Scenario B (Next.js) 의 통합 명령 (`--scenario=B`) = 본 방법론의 BE 영역 분석을 FE 와 한 번에 = 분량 ↑.
- Scenario C (JSP) 의 본격 PoC 검증 = 사내 legacy 도입 시 carry (Stage 5+ 또는 release 후 adoption).
- 3 Scenario detection 자동 절차 = false positive 가능 (mixed 케이스) → mixed 시 사용자 confirm 의무.

### 3.3 무시한 다른 옵션

- **단일 Scenario (분리만)** — 거부. 사용자 진단 (사내 legacy 분석 가능성) 과 Stage 1 research 합의 깸.
- **Tier 4 v1.5 이연** — 거부. ADR-FE-001 / ADR-FE-003 의 carry 가 종결 안 됨.
- **JS 풀스택 = Scenario A 통합 처리** — 거부. Next.js API route handler = BE 산출 / FE state-map cross-link 양쪽 인식 의무 → 별도 Scenario.

---

## 4. 적용 (Implementation)

### 4.1 본 Stage 6 (Phase B)

- `methodology-spec/be-fe-separation.md` 신설 — 본체 spec
- `ADR-FE-001-FE-추출기-가정.md` §6 갱신 — Tier 4 carry → resolved
- `ADR-FE-003-legacy-spectrum-정책.md` §2.4 갱신 — Tier 4 carry → resolved
- `schemas/legacy-spectrum.schema.json` 보강 — `tier_4_be_fe_handling` enum (resolved 표기 가능)
- `methodology-spec/workflow/input.md` 보강 — Scenario A/B/C detection 절차

### 4.2 carry-over (Stage 5+)

- Scenario B (Next.js) 본격 PoC = mini-PoC (Stage 4) 또는 사내 적용 시 검증
- Scenario C (JSP) 본격 PoC = 사내 legacy 도입 시 (release 후 adoption)
- `--scenario=B` / `--scenario=C` CLI 옵션 본격 구현 = Stage 5+ 또는 도구 sub-track

---

## 5. 참조

### ADR

- ADR-001 (사상적 기반)
- ADR-FE-001 (FE 추출기 가정 — §6 carry 종결)
- ADR-FE-003 (legacy spectrum — §2.4 carry 종결)
- ADR-FE-006 (프레임워크 중립 IR 사상 — 짝 / 본 Stage 6 신설)

### DEC

- DEC-2026-05-01-v1.4-Stage-2-Gate-결단 (G2-3)
- DEC-2026-05-01-v1.4-Stage-3-1-종결 (Tier 4 carry 명시)
- DEC-2026-05-01-v1.4-Stage-3-2-종결 (Tier 4 carry 명시)

### Memory

- `project_v140_fe_track.md`
- `project_adoption_workspace.md` (사내 React+TS+TanStack 스택 정합)

### Sources (research)

- `~/.claude/plans/research-senior-v1.4-fe.md` (BE-FE 분리 챕터)
- `~/.claude/plans/research-industry-v1.4-fe.md` (Next.js / Remix 산업 패턴)

**End of ADR-FE-004.**
