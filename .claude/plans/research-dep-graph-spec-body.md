# research — `navigate --with-spec` 설계 리뷰 (4원칙 §2)

> 워크플로우 `wf_c819f7bf-28a` (2-agent 병렬 / Phase 4+ 경량: industry-case 생략). Senior 적대적 리뷰 + 코드사실 독립검증(F-015).

## 종합 판정: **REVISE @ 0.83** (설계 근본 타당 / must-fix 3 + trust 보강)

## 결정 권고 (Senior + 사실검증 합치)

| 결정 | 권고 | 근거 |
|---|---|---|
| **D1 본문 범위** | **UC+BHV+AC 3종** | UC shape = BHV 와 동일 config 경로(추가비용 ~0) / 2nd 도메인(ecommerce) shape **match** 확인 / carry round-trip 회피(재작업 최소화 2순위). ★ 단, cap allow-list 는 subkind 별 **field-exhaustive** 의무(UC=actors/pre/post, BHV=invariants, AC=gherkin — 공유 가정 ❌). |
| **D2 source 해석** | **hybrid** | graph-dir 우선(co-located 실측·synthesizer:476 idiom) → existsSync → repoRoot fallback(resolveRepoRoot:829 재사용) → basename(lossy 최후). ★ **existsSync 가 절대경로 branch 도 gate**(must-fix #1). 상대경로는 구조 보존(basename 먼저 쓰면 nested-scope 오독). |
| **D3 출력 위치** | **result.spec (top-level)** | result.node 무변경 = 회귀0 불변식 보존(snapshot 소비자 안전). reference_lens 단언도 top-level 이 더 명료. |

## ★ must-fix (전부 채택)

1. **existsSync 가 절대경로 branch 도 gate** — 현 plan §3-B-2 는 절대경로를 readFileSync 직행 → stale/cross-machine 절대경로(=dogfood 실측 common case)에서 uncaught throw → navigate 비정상 exit = **회귀**. 절대 branch 도 existsSync→graceful `{available:false}`. *(★ 본 리뷰 최대 수확 — 의존하던 dogfood 도메인이 정확히 절대경로라 §8.1 검증 자체가 깨질 뻔.)*
2. **cap allow-list = subkind 별 field-exhaustive** — UC actors[]/pre/post, BHV invariants[], AC gherkin. 공유 given/then 가정은 UC actors / BHV invariants 를 silent drop. SPEC_SUBKIND_CONFIG 항목 안에 정의.
3. **"(+N more)" = 모든 cap 배열 균일** — given/then 뿐 아니라 actors/pre/post 도 ≤5 cap → 사람에게 보이는 reference-lens 의 silent truncation 은 정보손실 위험. 균일 적용.

## should-consider

- **trust 강제(코드/테스트 레벨)** — 라벨 `(reference-lens / gate 주입 ❌)` 은 주석일 뿐(→ trust_model_ok:**false**). 권고: `result.spec.reference_lens:true` 유일 shape + 테스트 단언 + release-readiness grep-gate(gate-eval/s2-outcome-check/findings-aggregator 가 spec-body accessor 미참조 / 기존 genuine-twin grep gate 동형). → **D4 사용자 결정**.
- 상대경로 구조보존 우선(basename 최후). *(D2 에 반영)*
- 테스트 경계: 정확히 5 vs 6 항목(+N more off-by-one) / actors 있는 UC / 빈 gherkin.then graceful.
- dependency-graph.md §4-2 에 placeholder source_path(`'(behavior)'` 등) → `{available:false, reason:'source 부재'}` 결정론 해석 문서화.

## 회귀 위험 (Senior 평가)

- withSpec **OFF byte-identity** = 구조적으로 SAFE (result.spec 은 `if(args.withSpec)` 안에서만 / result.node 무변경 / 기존 테스트 'spec' 키 미참조). **단 D3 top-level 유지 + parseArgs 순수 additive else-if 전제.**
- withSpec ON 절대 stale 경로 = **HIGH** (must-fix #1 으로 해소).
- rollup + --with-spec = 구조적 SAFE (cmdNavigate 가 origin-mode spec 로직 前에 rollup 분기 / 본문 폭증 없음). ★ 단 "rollup --json 에 spec 키 부재" 명시 테스트 추가(미래 refactor 회귀 차단).
- CRLF 노이즈(glyph-heavy cli.js) — node-script 편집. [[feedback_edit_tool_crlf_windows]]

## 사실검증 (F-015 / 전부 confirm + 1 minor 정정)

- source_path 절대(dogfood) ✓ / 상대 가능 ✓ / co-location ✓ / graceful-skip 선례 ✓ / isAbsolute idiom(synthesizer:476) ✓ / reference-lens 선례(SKILL.md:94) ✓ / **ecommerce 2nd 도메인 shape = match** ✓.
- ★ **정정**: plan 이 reference-lens 근거로 "grep DEC-2026-05-28 in SKILL.md" 인용했으나 그 DEC 는 SKILL.md 에 없음(decisions/ 에만). 실질(SKILL.md:94 reference-lens 선례)은 유효 → plan 인용만 수정. 설계 무영향.

## 결론
D1=UC+BHV+AC / D2=hybrid(existsSync all-branch) / D3=result.spec / must-fix 3 채택 / D4(trust 강제 수준) = 사용자 결정. → §3 승인 후 구현.
