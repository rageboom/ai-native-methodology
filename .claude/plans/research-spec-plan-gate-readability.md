# research — spec·plan 게이트 가독성 (3-에이전트 병렬 / 가벼운 전략)

> 4원칙 §2. plan = `plan-spec-plan-gate-readability.md`. 2026-06-25. 3 base agent(docs-checker / industry-case / senior) 병렬.

## 1. 공식문서 / 1차 출처 (docs-checker)

- **SSOT → render-time 산문 (twin persist ❌)** = [VERIFIED]. CCMS(replicas read-only) + docs-as-code("author once, publish everywhere", Write the Docs) + OpenAPI("redundancy 회피")로 수렴. 단일 "twin ❌" 명문 규범은 없으나 원칙 일치 → 정석 판단 무리 없음. (우리 ADR-011 json 단독 SSOT 와 정합.)
- **ADR 가독 = 완전문 산문** = [VERIFIED]. Nygard 원본: "should read like a conversation with a future developer", 문장 조각(bullet fragment) 비권장. → task-plan 의 ADR 블록은 산문 완전문으로 렌더.
- **Gherkin → 사람말** = [부분]. Cucumber 공식은 Scenario 내 Markdown description → HTML formatter 렌더 지원. 단 Given/When/Then 전체를 산문 paragraph 로 바꾸는 공식 포맷은 없음 = **도구 레이어(우리 렌더러)의 영역**. 강제 표준 없음 = 자유롭게 설계 가능.
- **acceptance criteria 가독 포맷** = [INSUFFICIENT-DATA]. 1차 표준 출처 미확보 → 근거 약함 정직 표기. (Gherkin 렌더 관행 차용으로 충분.)
- 출처: SSOT(wikipedia/Paligo) · OpenAPI latest · Write the Docs docs-as-code · Cucumber Gherkin Reference · Nygard ADR(cognitect 2011).

## 2. 업계 사례 (industry-case)

- **Amazon PR/FAQ**: 산문 우선 + 엄격 분량제한(PR 1쪽 → FAQ 5쪽) + 점진 공개(TL;DR → 상세) + 묵독 후 senior-last 줄별 수정. → spec/plan 화면 = "요약 우선 → 상세 확장" 구조 근거.
- **Google Design Docs**: Context/Goals/Non-Goals → Design → Alternatives → Security/Privacy cross-cutting. 측정가능 문장("P95<1s") + "아무것도 안 하는 기준선" 포함 + 살아있는 문서(소급 갱신). → spec Goals/Alternatives, plan risk/NFR 블록 근거.
- **Rust RFC Pre-RFC**: draft-first 게이트가 **spec/plan 단계에도** 적용됨(discovery 한정 아님). 단 **대형 커뮤니티엔 pre-draft 자체가 오버헤드**라는 비판(무한 리뷰 루프) 병존 = mixed.
- 출처: scarletink/workingbackwards · industrialempathy(Malte Ubl) · rust-lang RFC 0002 + rustc-dev-guide.

## 3. Senior 검토 (verdict: CONCUR Option R / confidence high)

raw 소스 직접 교차검증(behavior-spec.js 7줄 / acceptance-criteria.js gherkin bespoke 보유 / kit.js:643-645 export prose·section·blockify·arrange / server.js:258 하드코딩 / confirm-scope = discovery-spec 전용 write).

1. **R vs F → R 확정.** F 의 draft-first 전제(미확정 범위를 싸게 좁힌다)가 spec/plan 에서 **불성립** — in_scope UC 가 discovery 에서 이미 잠긴 뒤 BHV/AC/task 가 결정론 파생. 좁힐 모집합 없음. (§2 Rust Pre-RFC 의 draft-first 신호와 상충처럼 보이나, Pre-RFC 는 *미확정 설계공간* 소셜화용 → 우리 *확정 scope 파생* 과 맥락 다름. Senior 가 이 구분으로 해소.) confirm-scope 를 spec/plan 으로 끌면 새 write 채널+스키마 신설 = 재작업 2순위 위배. **F②(구조적 선택)·draft-first 명시 scope-out.**
2. **Kit 승격 = 타당/저리스크.** discovery-draft 인라인 헬퍼 = Kit 부분 재구현 → 로직 헬퍼만 승격해 spec-readable/plan-readable 공유. **리스크 1**: `.dd-*` CSS 강결합 — 승격은 **로직 한정 / CSS 는 렌더러 로컬 유지**(네임스페이스 누수 차단).
3. **spec 3산출물 통합 뷰 = 통합 권장.** behavior(7줄 raw)+ac(gherkin)+unit 한 페이지로 UC→BHV→AC 추적축 공유 = 가치 실재. **함정**: 추적 링크를 **계산/검증하지 말 것**(traceability-builder 책임) — json 기존 ref 를 render-time 으로 잇기만(persist❌). unit-spec 은 별 섹션. **schema 신설 ❌**(§8.1 ≥2 PoC 회피).
4. **놓친 함정**: ① renderAs 일반화 시 release-readiness/test 의 expected-renderAs 단언 깨질 수 있음 → `pnpm test:release` 동시 갱신 의무(메모리 `release_readiness_count_coupling`). ② 게이트 증식 = STRONG-STOP 오염(R 무접촉이라 회피 / F 거부 추가근거). ③ 본체 schema 무변경 유지.

## 4. 종합 결론 (plan §3 확정 입력)
- **Option R 채택** (가독성 렌더러만 / 상태머신·phase-flow·게이트 무접촉 / STRONG-STOP 보존). F②·draft-first = scope-out.
- **Kit 승격 = 로직 헬퍼만 + CSS 렌더러 로컬.** discovery-draft 와 중복 최소화.
- **spec 통합 뷰** + 추적축 read-only 표식(계산 ❌). task-plan = TL;DR 요약 → 작업분해/의존성/ADR(산문 완전문)/NFR/risk 점진 공개.
- **renderAs 배선 일반화** 시 test:release full 동시 갱신 의무.
- 본체 schema 무변경 / 산문 render-time / persist ❌.
