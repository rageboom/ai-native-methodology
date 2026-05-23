# BE/FE 분리 운영 정책 — Scenario A/B/C × IR 4계층

> **사상**: ADR-FE-004 (BE/FE 분리 default + JS풀스택+JSP 예외) + ADR-FE-006 (★ framework-neutral IR + Screen+Journey 우선)
> **위치**: 본체 spec. 사용자 사내 적용 시 직접 참조.
> **trigger**: Phase 0 입력 시 Scenario detection 자동 분류

---

## 1. 3 Scenario 매트릭스

| Scenario | 정의 | 산출 범위 | 운영 |
|---|---|---|---|
| **A 분리 default** | Modern SPA + 별도 BE 서버 | BE = deliverable 1~6 / FE = deliverable 7~13 | 두 팀 / 별도 repo 가능 |
| **B JS 풀스택** | Next.js / Nuxt / Remix / Astro / SvelteKit / Solid Start | deliverable 1~13 통합 | 한 팀 / 단일 repo |
| **C JSP / Thymeleaf / ERB** | Tier 4 server-side template | BE 1~6 + FE 7/13 통합 (★ state-map ❌) | 한 팀 / 단일 repo |

**default**: Scenario A (사용자 사내 React+TS+TanStack 스택 정합).

---

## 2. Scenario detection (Phase 0 자동)

| signal | A | B | C |
|---|---|---|---|
| package.json + 별도 BE repo / pom.xml | ✅ | — | (조건부) |
| package.json deps: next / nuxt / remix / @astrojs / solid-start / sveltekit | — | ✅ | — |
| has_api_routes_dir (pages/api/ / app/api/ / server/api/) | — | ✅ | — |
| 파일 확장자 .jsp / .thymeleaf / .erb | — | — | ✅ |
| BE template engine (spring-boot-starter-thymeleaf / jstl) | — | — | ✅ |
| **default when unclear** | ✅ | — | — |

→ mixed 케이스 (Tier 1+2+4 등) = 사용자 confirm 의무.

---

## 3. Scenario A — 분리 default

### 3.1 산출 명령

| 영역 | 명령 |
|---|---|
| BE | `/analyze-init`, `/analyze-db`, `/analyze-arch`, `/analyze-business-logic`, `/analyze-api`, `/analyze-quality` |
| FE | `/analyze-ui-base`, `/analyze-state`, `/analyze-visual`, `/analyze-quality` |
| 통합 | (불필요 — 분리 운영) |

### 3.2 cross-link 매트릭스 (BE ↔ FE)

| BE → FE | 의미 |
|---|---|
| openapi.yaml operationId → ui-spec.api_calls.operationId | API 계약 매핑 |
| openapi.yaml operationId → state-map.cross_links (link_type=triggers) | state machine triggers API |
| domain.json UC → ui-spec.scenarios.related_use_cases | 시스템 행동 ↔ 사용자 경험 매핑 |
| rules.json BR → state-map.cross_links (link_type=validates) | FE validation BR ↔ FE state |

→ 두 팀 운영 시 cross-link 깨짐 자동 검출 = `formal-spec-link-validator --mode=both`.

### 3.3 두 팀 운영 권고

- BE 팀 = deliverable 1~6 owner / 별도 release cycle
- FE 팀 = deliverable 7~13 owner / 별도 release cycle
- ★ contract-first (OpenAPI 3.1) 의무 — 양쪽 변경 시 contract test (Pact v4) 권장

---

## 4. Scenario B — JS 풀스택

### 4.1 산출 명령

```
★ /analyze-fullstack --scenario=B
   = deliverable 1~13 통합 산출 (한 명령 / 한 결과)
```

### 4.2 API route handler 양쪽 인식

Next.js `pages/api/` 또는 `app/api/route.ts` = ★ 양쪽 산출:

| 산출물 | 인식 |
|---|---|
| BE deliverable 3 (api) | API 핸들러 자체 = endpoint 산출 (operationId / openapi.yaml) |
| FE deliverable 8 (state-map) | cross_links (link_type=triggers) 로 동일 operationId 참조 |

→ 한 코드 → 두 산출물 ↔ 양쪽 cross-link.

### 4.3 한 팀 운영

- 한 repo / 한 release cycle
- contract-first 의무 (외부 API client 가 있으면 Pact v4)

---

## 5. Scenario C — JSP / Thymeleaf / ERB (Tier 4)

### 5.1 ★ BE/FE 통합 산출 절차 (★ Stage 3-1/3-2 carry 종결)

```yaml
JSP_통합_산출_절차:
  Phase 0:
    - BE Spring + JSP source 양쪽 입력
    - scenario detection → C 자동 인식
    - legacy-spectrum.tier_4_be_fe_handling = "scenario_c_integrated"

  Phase 1 (init):
    - inventory.json — JSP + BE controller 모두 인식
    - legacy-spectrum.json — primary_tier=4 또는 mixed (Tier 1+4)

  Phase 2~3 (db / arch):
    - BE 영역만

  Phase 4 (business-logic):
    - BE Spring controller + JSP form action + JSP scriptlet (★ ❌ 권장) 모두 추출
    - rules.json category=fe_validation ↔ Spring @Valid cross-link

  Phase 5-1 (api):
    - BE @RequestMapping + JSP form action URL 통합
    - openapi.yaml — JSP form submit 도 endpoint 등록

  Phase 5-2 (ui):
    - ui-spec.framework = "jsp_template"
    - pages = JSP 파일 단위 / route = Spring @RequestMapping
    - components = template fragment + include 그래프 (level=legacy_template)
    - state-map = ★ N/A (server-side state — BE rules 가 담당)
    - visual-manifest = ✅ Playwright 진짜 실행 (rendering 후 동일)

  Phase 6 (quality):
    - BE migration-cautions.md + FE migration-cautions-fe.md 양쪽 의무
    - JSP-specific 함정: XSS escape ★ <c:out> 사용 / form action 분산 / scriptlet 잔존
```

### 5.2 한 팀 / 단일 repo / 통합 분석 의무

Scenario C 는 BE/FE 코드 분리 ❌ → 한 팀 운영 / 분석도 통합.

---

## 6. Scenario × IR 4계층 매트릭스 (★ ADR-FE-006 정합)

| 계층 | Scenario A | Scenario B | Scenario C |
|---|---|---|---|
| **L1 Domain** | BE deliverable 2/5 + FE 10/11/12 | BE+FE 통합 | BE deliverable 2/5 + FE 10/12 (★ i18n 부재 가능) |
| **L2 Interaction** | FE deliverable 7.scenarios + 8 state-map | 통합 (★ state-map = client-side) | ★ FE 7.scenarios + state-map ❌ (server-side) |
| **L3 Contract** | BE deliverable 3 + FE ui-spec.api_calls | 통합 (API route handler 양쪽) | BE deliverable 3 + JSP form action |
| **L4 Presentation** | FE deliverable 7.components + 9 visual | 통합 | FE deliverable 7.components (legacy_template) + 9 visual ✅ |

→ **★ Scenario C 의 L2 Interaction state-map ❌** = JSP server-side state 는 BE deliverable 5 (rules) 가 담당.

---

## 7. 사내 도입 가이드 (3 Scenario 별 quality gate 차이)

| Scenario | quality gate |
|---|---|
| **A** | BE/FE 양쪽 baseline-fe.yml + baseline-be.yml 분리 운영 / contract test (Pact v4) 권장 |
| **B** | 통합 baseline.yml / API route handler 의 양쪽 인식 검증 |
| **C** | BE baseline.yml + FE baseline-fe.yml (★ state-map ❌ — JSP-specific 함정 강조) |

→ ★ ADR-010 baseline+ratchet 정합 + WCAG 2.1-AA → 2.2-AA ratchet (a11y) + Strangler 마이그레이션 plan (legacy-spectrum) 모두 적용.

---

## 8. 다음

- Stage 4 mini-PoC = Scenario A (RealWorld React fork) 첫 검증
- Scenario B (Next.js) 본격 PoC = Stage 5+ 또는 사내 적용 시
- Scenario C (JSP) 본격 PoC = release 후 adoption (사내 legacy 도입 시)
