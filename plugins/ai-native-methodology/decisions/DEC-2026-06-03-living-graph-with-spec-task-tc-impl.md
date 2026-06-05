# DEC-2026-06-03-living-graph-with-spec-task-tc-impl

> v12.6.0 MINOR release SSOT. dep-graph 의도③ `navigate --with-spec` 확장 — UC/BHV/AC(v12.3.0) → + TASK/TC/IMPL = chain leaf 6 subkind.
> 상태: **승인 + 시행 완료** (2026-06-03). 4원칙 = `plan-dep-graph-with-spec-task-tc-impl.md` → Senior 적대적 리뷰 0.86(must-fix A/B/C) → 사용자 옵션 2(TASK/TC/IMPL 6/6 — Senior B IMPL carry 권고 명시 override).

**작성일**: 2026-06-03

**relates to**:

- `DEC-2026-06-03-living-graph-spec-body.md` (v12.3.0) — 의도③ 첫 슬라이스(UC/BHV/AC 본문). 본 DEC 가 frozen-config 패턴을 plan/test/implement stage leaf 로 대칭 확장.
- `DEC-2026-06-03-living-graph-what-if.md` (v12.5.0) — 직전 ③ 슬라이스. s69 carry "TASK·TC·IMPL spec 본문"을 본 DEC 가 소진.

---

## 0. 한 줄 요약

`navigate --with-spec` 는 UC/BHV/AC 노드만 본문을 lazy-read. TASK(`tasks[]`)·TC(`test_cases[]`)·IMPL(`modules[]`) 추가로 chain leaf 6 subkind 전체 본문 reference-lens. graph-synthesizer 가 이미 TASK/TC/IMPL 노드에 source_path 를 UC/BHV/AC 와 대칭 배선해둠 → synthesizer 무변경 / `SPEC_SUBKIND_CONFIG` 3 entry 추가만.

## 1. 의제 선정 (s69 carry 잔여 3버킷 중)

사용자 "dep-graph 의도③ 잔여 계속" → 3버킷 가치/위험 정직 비교 후 with-spec 확장 채택:

- **TASK/TC/IMPL 본문** = 이미 출하·검증된 frozen-config 패턴 대칭 / 결정론 fs read / reference-lens / check31 무변경 / withSpec off=회귀0 → 채택.
- 임베딩 의미검색(NL 라우팅 확장) = 비결정론 임베딩 = navigator "AI 추론 0%" trust 모델 정면 충돌 → DEFER.
- what-if 확장(deprecate/remove-edge/add-node) = Senior 가 v12.5.0 에서 이미 gold-plating/carry 판정 → DEFER.

## 2. Senior 적대적 리뷰 (GO_WITH_REVISE 0.86) + 결단

- **Q1 gold-plating?** → 아님. synthesizer 가 이미 채워둔 source_path 데이터를 navigate 가 못 읽는 **비대칭 결함 해소**(what-if carry 와 본질 다름).
- **must-fix A (수용)**: TASK scalars 에 `behavior_ref` 추가(스키마 required trace 필드 / 실측 BHV-USER-001 확인).
- **must-fix C (수용)**: TC `expected_outcome`·`test_intent` = "기대 스펙값(실행 결과 아님)" 표기(사람-읽기 gate-confusion 가드 / 코드상 gate 와는 단절).
- **must-fix B (사용자 override)**: Senior 는 IMPL 을 §8.1 1-도메인(ecommerce only / RealWorld·react-fsd 0 / chain5 env-blocked)으로 carry 권고. 사용자가 trade-off 2회 설명 후 **옵션 2(IMPL 포함)** 명시 결단. → **정직 표기 의무**(아래 §4).

## 3. 결단

### D1 — scope = chain leaf 6 subkind (UC/BHV/AC/TASK/TC/IMPL)

- TASK: `tasks` / scalars[description·behavior_ref·layer·module·execution_order] / arrays[ac_refs·tc_refs·dependencies].
- TC: `test_cases` / scalars[type·framework·framework_status·ac_ref·bhv_ref·expected_outcome·test_intent·source_file] (gherkin 부재).
- IMPL: `modules` / scalars[framework·layer·stack·commit_hash] / arrays[tc_refs·bhv_refs·source_files].

### D2 — carry 경계 유지

EPIC/STORY/OP(plan 조직 노드 / id 매칭 불확실) + analysis/aspect kind = 미지원 유지(UC/BHV/AC 식 leaf 본문 아님).

### D3 — trust 무변경 (check31)

config 추가는 `SPEC_SUBKIND_CONFIG` 내부만 → gate-eval·findings-aggregator spec-token 0 유지 / readSpecBody 호출부 1곳(cmdNavigate) 유지 / reference_lens:true 유지 → check31 그대로 통과(실측).

## 4. IMPL 정직 표기 (사용자 옵션 2 override / overclaim 금지)

- IMPL corroboration = **ecommerce 1-도메인만** (RealWorld·react-fsd IMPL=0 / chain5 env-blocked). **2-도메인 주장 ❌**.
- impl-spec.schema 필드명은 도메인-무관 계약 → 기계적 작동 보장(graceful) / 그러나 **Java/Gradle IMPL 실 데이터 shape 검증 = carry** (RealWorld chain5 JDK11+Gradle unblock 세션 = 자연 close 채널).
- TASK·TC 는 2 distinct 도메인(RealWorld Spring/JUnit/blog + ecommerce NestJS/Prisma/e-commerce) corroborate → §8.1 충족.

## 5. 검증 (no-simulation / 실 CLI·실 그래프)

- 새 test 3 + 1 수정(navigate-cli 53→56): TASK 본문(behavior_ref·layer·module·ac_refs) / TC 본문(expected_outcome·test_intent) / IMPL 본문(commit_hash·source_files cap 6→5+more) + 미지원 테스트 TASK→EPIC(plan-org carry 경계) 전환.
- **실 dogfood 그래프 render 실측**: RealWorld TASK-USER-001(title/behavior_ref/layer/module/ac_refs) + TC-USER-001(type/framework/expected_outcome) + ecommerce IMPL-AUTH-001(framework/commit_hash/source_files cap "+2 more"/tc_refs 7) + carry 경계 analysis-architecture → available:false.
- chain-driver 320 + workspace **1098 pass/0 fail** + release-readiness **31/31**(check31 green 유지) + version 3-way 12.6.0 + CLAUDE/README sync / breaking 0.

## 6. carry (DEFER / external pull 게이트 / 능동 ❌)

- IMPL 2nd distinct 도메인 shape 검증(RealWorld chain5 unblock).
- 의도③ 잔여: 임베딩 의미검색(NL 라우팅) · what-if 확장(deprecate-node·remove-edge·add-node) · EPIC/STORY/OP 본문.
- 의도①④(codegraph 코드축).

## 7. Why / How to apply

**Why**: navigate 소비 루프 — plan/test stage 노드("이 작업/테스트가 뭐 하나")가 UC/BHV/AC 와 동일한 "grep 없이 즉시 파악" P0 통증을 가짐. synthesizer 가 이미 배선해둔 데이터를 노출하는 비대칭 결함 해소.
**How to apply**: with-spec 본문 = **reference-lens** — 어떤 결정적 gate 에도 inject ❌(check31 강제). TC `expected_outcome`/`test_intent` 는 기대 스펙값(실행 결과 아님). IMPL 은 현재 1-도메인 검증 — Java IMPL shape 는 미검증(carry). MINOR = additive CLI 표면 확장 / API·schema·산출물 무변경 / breaking 0.
