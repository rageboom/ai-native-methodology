# DEC-2026-06-01-genuine-defects-cleanup

> Type 2 외부-준비 감사 교차검증 결함 3종 cleanup (정직성·P0 무결성) + 회귀 가드 2종. v11.27.0 MINOR.

## 맥락

session 62차 후속 — 사용자 "이제 뭐 남았나" → 정직 inventory(① 지금 가능 진짜 결함 / ② 2nd 도메인 천장 / ③ 사용자 결정) → 사용자 **"1"**(① 진짜 결함 / 사내 표준·외부 미공개 확인). Type 2 감사(session 62차)에서 교차검증된 출하 자산 defect 3종.

## 결정 (additive / breaking 0)

1. **신원 누출**: 2 skill `"user":"sangcl@smilegate.com"` → `"reviewer@example.com"` (+ gate-log 예시 stale `stage_out:"planning"`→`"discovery"`).
2. **license**: `plugin.json` `"SEE LICENSE IN LICENSE"`(존재않는 파일) → **`"UNLICENSED"`** (정직 / 사내 표준·외부 미공개 / OSS 공개=public-OSS carry / 사용자 결정).
3. **adoption 템플릿**: `templates/adoption/CLAUDE.md` v2.0.0-rc1/4-stage → 현 6-stage 전면 재작성 (drift-resistant: 카운트 하드코딩 회피 / `${CLAUDE_PLUGIN_ROOT}` / CHANGELOG 위임).
4. **회귀 가드 (release-readiness 26→28)**: check27 `shipped_identity_leak`(출하 dir grep + allow-identity: 예외) + check28 `adoption_paradigm_drift`(단일파일 / 양성 assertion primary + 음성 secondary).

## 근거 (4원칙)

- §1 plan = `.claude/plans/plan-genuine-defects-cleanup.md`. §2 Senior **GO_WITH_REVISE@0.86** (A license=UNLICENSED / B-i identity allowlist / B-ii adoption 단일파일+양성 primary / C drift-resistant / D 1 MINOR). §3 사용자 "1" + 사내 표준 확인.
- ★ Senior 사실 검증 (feedback_senior_fact_check_supplement): ADOPTION-README alias **비활성**(build-plugin:192 / Senior E-2 반증) + templates/ stale 토큰 = adoption/CLAUDE.md 단독(Senior 의 test/design/implement README claim 반증) → 단일파일 scope.

## 검증 (no-simulation)

- release-readiness self-test 14/14 (count 26→28 + 2 신규 id) / **discrimination 실증**(check27 planted 위반 탐지+allowlist 면제 / check28 stale 토큰 탐지+`sdlc-4stage-flow` 오탐 ❌ = content-aware) / skill-citation 0 stale / workspace 1018 / release-readiness **28/28** / version 3-way 11.27.0.

## §8.1

정직성·P0 무결성 cleanup (self-referential corrective 와 구분 — 출하 자산의 외부-노출 결함 = adopter 영향 실재 / R15·P0). 회귀 가드 = drift enforcement criterion (`feedback_drift_enforcement_via_release_readiness`).

## 잔여 carry

README.md stale(v11.1.0 / 별도 doc-sync) · Type 2 외부 채택(43 장벽) · public-OSS 공개(조직 결정).

Extends DEC-2026-06-01-slice4-dbschema-ddl.
