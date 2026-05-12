# 버전별 진화사 (한 페이지씩)

> 왜 이 방법론이 지금의 모양이 되었는가. 각 버전마다 어떤 깨달음이 있었고 무엇이 추가됐는지를 한 페이지씩 풀었습니다.

---

## v1.0 ~ v1.3 (2026-04 초 ~ 4 월 말) — 분석 단계의 정착 (BE)

### 어떤 문제 인식이 있었나

"AI 에게 레거시 분석을 시키면 결과가 사람마다 다르다." 같은 코드를 줘도 결과의 깊이, 형식, 누락이 모두 다릅니다.

### 무엇을 추가했나

- **Phase 0~6** — 7 단계 표준 워크플로우
- **이식 가능한 산출물 5종** — rules.json / domain / openapi / schema+ERD / antipatterns
- **§8.1 단일 PoC 과적합 회피 규칙** — "한 PoC 에서만 보인 패턴은 본체에 등재 금지"
- **이중 렌더링 사상** — JSON/YAML (AI 눈) + Mermaid/Markdown (사람 눈)

### 어떻게 입증했나

| PoC | 대상 | 의의 |
|---|---|---|
| #01 | RealWorld Spring Boot 2.5 | 첫 성공 |
| #02 | Spring Boot 3.3 + Hexagonal | 다른 아키텍처에서도 작동 |
| #03 | NestJS (TypeScript) | **플랫폼 무관성 입증** |

### 다음으로 남긴 숙제

- 프론트엔드는 어떻게 분석할 것인가?
- 분석한 결과로 실제 새 시스템을 짓는 단계는?

---

## v1.4 (2026-05-01 ~ 02) — 프론트엔드 트랙 합류

### 어떤 문제 인식이 있었나

사용자가 직접 지적: **"프론트엔드 분석 방법이 없잖아."** v1.x 까지는 백엔드만 다뤘습니다.

### 무엇을 추가했나

- **FE 산출물** — ui-spec / state-map / visual-manifest / form-validation / type-spec
- **ADR-FE-001 ~ 007** — FE 트랙 결정 기록
- **본체 도구 2건** — drift-validator FE 모드 + schema-validator (Ajv 8)
- **진짜 도구 6종 첫 동원** — ts-morph + Playwright + axe-core + drift + schema + Spectral

### 어떻게 입증했나

- **PoC #04** — RealWorld React + Feature-Sliced Design (yurisldk fork)
- **4개 PoC 동형 입증 첫 사례** — JWT 를 localStorage 에 저장하는 XSS 위험 패턴이 PoC #01/02/03/04 모두에서 같은 형태로 발견됨 → 본체 안티패턴 카탈로그 정식 등재

### 다음으로 남긴 숙제

- **분석 자체는 잘 되는데, 그래서 다음은?** 새 시스템을 짓는 단계가 여전히 외부에 있음.

---

## v2.0 (2026-05-06 ~ 07) — 체인 하네스 도입 (MAJOR)

### 어떤 문제 인식이 있었나

"분석 산출물을 가지고 새 시스템을 지을 때, AI 가 사양을 어겨버린다. 사람이 매 줄 검토하면 AI 의미가 없어지고, 검토 안 하면 환각이 박힌다."

### 무엇을 추가했나

**SDLC 4단계 체인 하네스** — 정체성을 송두리째 바꾼 변경.

```
[체인 1] 기획 명세         → 게이트 #1
[체인 2] 행동 + 인수 기준  → 게이트 #2
[체인 3] 테스트 (RED 의무) → 게이트 #3
[체인 4] 구현 (GREEN 의무) → 게이트 #4
```

- **6개 신규 산출물** — planning-spec / behavior-spec / acceptance-criteria / test-spec / impl-spec / traceability-matrix
- **5개 ADR-CHAIN** — 정책 명문화
- **chain-driver 도구** — 5 요소 자동 enforcement
- **release-readiness §8.1 strict 7/7** — 릴리스 자격 자동 검사

### 어떻게 입증했나

- **PoC #05** — sample 사용자 등록 e2e 검증대 통과
- **PoC #03 retrofit** — 기존 NestJS PoC 에 체인 하네스 후행 적용
- **218 개 단위 테스트 / 0 실패**

### 다음으로 남긴 숙제

- 레거시의 "의도된 동작 vs 버그" 를 어떻게 판별하는가?

---

## v2.1 (2026-05-07) — Phase 4.7 (Characterization)

### 어떤 문제 인식이 있었나

"레거시 코드의 어떤 동작이 의도된 사양인지, 단순 버그인지 모르겠다. 새 시스템에서 그대로 옮겨야 할지 고쳐야 할지 매번 헷갈린다."

### 무엇을 추가했나

- **Phase 4.7 Characterization** — Michael Feathers 의 *Working Effectively with Legacy Code* 에서 가져옴
- **Given/When/Then 스냅샷** — 레거시 동작을 BDD 시나리오로 박제
- **4가지 분류**:
  1. 의도된 동작
  2. 의도된 동작 + 개선 여지
  3. 버그지만 호환성 위해 보존
  4. 명확한 버그 — 새 시스템에서 제거
- **characterization-coverage-validator** — ratchet (단조 비감소) 검증
- **ADR-CHAIN-006**

### 어떻게 입증했나

- **PoC #06** — 사내 EFI-WEB Spring 4.1 (Legacy)
- **PoC #03 retrofit** — NestJS (Modern)
- ≥ 2 PoC 동형 입증 충족 (Legacy + Modern 양 spectrum)

### 다음으로 남긴 숙제

- SQL 이 너무 흩어져 있다. 한 줄 한 줄을 인벤토리화할 수는 없을까?

---

## v2.2 (2026-05-08, 오늘) — Phase 4.8 (SQL Inventory)

### 어떤 문제 인식이 있었나

"매퍼 XML 에 흩어진 312 개 SQL 중 어떤 게 어떤 화면에서 호출되고, 어떤 테이블을 건드리는지 추적이 안 된다. 마이그레이션 계획을 세울 수 없다."

### 무엇을 추가했나

- **Phase 4.8 SQL Inventory** — RDB 한정 sub-phase
- **11개 컬럼**:

  | 자동 (6) | 사람 검토 (5) |
  |---|---|
  | sql_id | business_meaning |
  | mapper_xml | uc_link |
  | called_from_screen | intent_vs_bug_classification |
  | dynamic_branch | confidence |
  | dependent_tables | carry_flags |
  | statement_type | |

- **자동화율 metric** — ≥ 50% 통과 의무 (5 개 PoC 평균 66.7%)
- **sql-inventory-extractor 도구** + 단위 테스트 10 개
- **ADR-CHAIN-007** + **ADR-CHAIN-008**

### 어떻게 입증했나 (★ 본 방법론 사상 가장 강한 입증)

**5 개 PoC × 6 개 차원 동형 입증**:

| 차원 | 변동성 |
|---|---|
| 패러다임 | iBATIS 2 / MyBatis 3 / TypeORM raw / Spring Data JPA |
| ORM | 4 종 |
| 플랫폼 | Java / TypeScript |
| 언어 | Java / TypeScript |
| 책임 | 단일 / 다중 |
| 규모 | 4 BC ~ 25 SQL |

→ **ADR-CHAIN-008 신정책** 채택: "MEDIUM 강도 × 5 PoC 동형 = strong corroboration 자격 충족".

### 부수적 변경

- **cooling-off 7 일 정책 영구 폐기** — "사용자 명시 결단 우선" 원칙 강화
- **release-readiness adr_registry dynamic 검사** — hardcode 5 개 → glob 동적 8 개

### 다음으로 남긴 숙제 (v2.3.0 후보)

1. Gartner TIME 매핑 — "유지/투자/이전/제거" 4 분면
2. patterns_extension_v3 — Cache / Discriminator / TypeHandler
3. Spring 4.1 + iBATIS 2 sub-rule 5 종 동형화
4. PoC #11 (사내 EFI-WEB billing) — 사용자 우선순위 #1 / 소스 도착 대기

---

## 진화의 한 줄 요약

> **"분석만" 에서 → "분석 + 새 시스템 짓기" 로 → "레거시의 의도/버그 판별까지" 로 → "SQL 한 줄까지 추적" 으로.**
>
> 매 버전은 직전 버전이 남긴 숙제 하나를 풀었고, 풀어낸 방법은 항상 ≥ 2 개 PoC 에서 동형으로 입증되었습니다.
