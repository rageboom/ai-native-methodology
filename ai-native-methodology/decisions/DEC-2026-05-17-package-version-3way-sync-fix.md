# DEC-2026-05-17-package-version-3way-sync-fix

- **상태**: 승인 ( 선행 housekeeping / 본 feature 무관 / 별도 commit / no version bump)
- **일자**: 2026-05-17 ( session 26차 후속 / plugin-authoring-spec feature 진입 전 선행)
- **결정자**: 윤주스 (TF Lead) — plugin-authoring-spec plan OD-4 "먼저 별도 housekeeping 로 수정 후 진행"
- **관련**: scripts/version-check.js (3-way sync SSOT) / DEC-2026-05-17-plugin-authoring-spec (후속 feature / 본 housekeeping 선행 의존) / plan `skill-hooks-tender-stonebraker`

---

## 컨텍스트

`plugin-authoring-spec` feature plan 설계 중 선행 결함 발견 — `package.json.version = 4.0.1` 이나 `.claude-plugin/plugin.json.version = 7.0.0` / `CHANGELOG.md` 최상단 = `[7.0.0]`. `node scripts/version-check.js` 가 현재 **exit 1** (3-way sync 위반: plugin.json(7.0.0) ↔ package.json(4.0.1)).

원인 = 과거 release 시 plugin.json(= source-of-truth, Anthropic 공식)·CHANGELOG 는 bump 되었으나 workspace root `package.json.version` 미동반 (ADR-010 도구별 package.json 독립 유지 정책의 부작용 — root package.json 은 SSOT 아니나 version-check 3-way 대상). 본 결함은 plugin-authoring-spec feature 와 무관한 **선행 결함** → 사용자 결단 = 별도 housekeeping 으로 먼저 청산 후 feature 진입 (이력 분리 명확).

---

## 결정

- `package.json.version` `4.0.1` → `7.0.0` (현 plugin.json/CHANGELOG 정합 복원 / source-of-truth 무변경 / no release).
- 본 변경 = 결함 청산만. CHANGELOG 항목 ❌ (release 아님) / plugin.json 무변경 / 산출물·schema·도구 무변경.
- 별도 commit (메시지 = housekeeping 명시 / plugin-authoring-spec feature 와 분리). 이후 feature Phase 1 진입.

---

## 회귀 검증

- `node scripts/version-check.js` → **exit 0** (3-way = 7.0.0 일치)
- `node scripts/release-readiness.js` → 회귀 없음 (criterion 무관 — package.json version 은 release-readiness check 대상 ❌ / version-check 단독)
- workspace test 무영향 (version 문자열만 변경 / 도구 코드·schema 무변경)

---

## Lessons Learned

- **LL-housekeeping** — release bump 시 3-way sync (plugin.json ↔ CHANGELOG ↔ root package.json) 전수 동반 의무. 과거 release 가 root package.json 누락 → version-check 가 검출했으나 release-readiness criterion 부재로 silent. ( 본 feature 의 외부-권위 staleness 가드와 동형 교훈 — drift 는 결정적 gate 가 잡아야 / 후속 DEC-2026-05-17-plugin-authoring-spec §검토 시 release-readiness 에 version-check 통합 여부 별도 평가 후보)

---

## 출처

- 실측 — `node -e package.json/plugin.json version` + `node scripts/version-check.js` exit 1 재현 (2026-05-17)
- 사용자 결단 — plugin-authoring-spec plan OD-4 "먼저 별도 housekeeping 로 수정 후 진행"
