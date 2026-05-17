# DEC-2026-05-17-repo-wide-citation-scan

- **상태**: 승인 (★ 사용자 "전체 레포 스캔" → "수정 + validator repo-wide 확장" / corrective / v8.1.1 PATCH)
- **일자**: 2026-05-17 (★ session 26차 후속 / v8.1.1 PATCH)
- **결정자**: 윤주스 (TF Lead) — "다른 stale 인용 같은 거 더 없나 전체 레포 스캔해줘" → "수정 + validator repo-wide 확장 (추천)"
- **관련**: DEC-2026-05-17-skill-citation-integrity (v8.1.0 origin / SKILL.md 한정) / ADR-PLUGIN-001 §7 patch v3 / LL-i-52 (역사 보존) / LL-i-55 (ground truth 삼중대조)

---

## 컨텍스트

v8.1.0 SKILL.md 인용 정합 후 사용자 "전체 레포에 다른 stale 인용 더 없나". repo-wide 결정적 스캔 → 활성 SSOT 문서에 SKILL.md 와 **동일 schema-drift class** 잔존 확인 (v7.0.0 rename + schema -spec 접미 + deliverables 재번호 + templates/analysis 경로 + ADR 정확명이 methodology-spec SSOT 에도 미전파). 사용자 = 수정 + validator scope 확장.

## 결정

### §1. validator 결함 교정 + scope 확장 (skill-citation-validator)

| 항목 | 변경 |
|---|---|
| scope | SKILL.md 한정 → repo-wide active 표면 (.md/.mermaid) |
| EXCLUDE | history(CHANGELOG·*HISTORY·DEC-*·STATUS·INDEX) + dist + examples + archive + **docs/adr/**(ADR=immutable decision record / DEC·CHANGELOG 동일 rationale LL-i-52) + **templates/adoption/**(downstream scaffold placeholder content) |
| ★ DEC/ADR exact→**prefix-match** | 파일명 descriptive suffix 때문에 단축 id 인용이 FP → 결정적 버그 교정 (FP 34→0) |
| relative-path | citing-file-relative 해석 추가 (도구-local docs/ 흡수) |
| ABSENCE_CTX | 부재 + supersession(격상/승격/supersed) + future-carry(carry/후보/예정/미생성/future) + **흡수**(제거된 구 자산 historical mapping) |
| migration/absorption 표 인식 | header `흡수/보존/migrated/legacy` → 그 표 region row 인용 = historical mapping skip (agents-axis §5 / LL-i-52) |

### §2. 발견·수정 (ground truth 삼중 대조 / LL-i-55 / 활성 normative=현재명 갱신·history=보존)

- repo-wide raw → ★ 정직 분리: **HISTORY 453 + POC 41 = 결함 아님** (의도적 구 이름 보존 / 생성물) / 활성 표면 정밀 triage → 실 stale **31건 / 15 file → 0**.
- 수정 (동일 schema-drift class 활성 SSOT 잔존):
  - `methodology-spec/lifecycle-contract.md` — 자산매핑 SSOT (rules→business-rules / a11y·i18n·static-security·legacy → -spec·-spectrum / ADR-FE-002·005 정확명)
  - `methodology-spec/id-conventions.md` · `methodology-spec/README.md` · `methodology-spec/severity-cross-stage-mapping.md`(severity SSOT) — rules.schema.json→business-rules.schema.json
  - `schemas/README.md` — rules.schema.json→business-rules.schema.json + intervention-log.js→state-store.js (실 writer)
  - `templates/planning/planning-doc-format.md` — rules.json/rules.schema.json→business-rules
  - `methodology-spec/deliverables/{5-business-rules,4-5-formal-spec,4-db-schema,6-antipatterns}.md` — templates/→templates/analysis/
  - `skills/analysis-br-cross-consistency-check/SKILL.md` — docs/layer-2-prompt-spec.md→tools/br-cross-consistency-validator/docs/
  - `tools/skill-citation-validator/README.md` — 자기 설명 구 literal 제거
- ★ FP 정확 분리 (무수정 / LL-i-55·52): agents-axis §5 흡수표(제거된 구 자산 historical) · sql-inventory carry 후보 경로 · ADR-FE-001 §결정 "신설" 서술(docs/adr exclude) · ADR-FE-005 "ADR-007 격상"(supersession) · DEC/ADR 산문 약식 인용(prefix 해소)

### §3. semver = PATCH

check #13 + tool 자체 = v8.1.0 기존 (신규 surface ❌). 본 release = validator 결함 교정(prefix-match 버그) + scope 확장 + 비-breaking dead-link 수정 = **corrective PATCH** (repo semver "버그/누락 수정 호환").

---

## 회귀 검증

- skill-citation-validator **0 stale** (207 active doc / dogfood green / exit 0) + test **2/2** (regression-guard + synthetic history/absence/migration-table/relative FP 입증)
- release-readiness **13/13** (check #13 repo-wide green) + version-check 3-way 8.1.1 + workspace green + drift-validator 불변 + chain harness validated 본질 보존
- breaking ❌ (validator 내부 로직 교정 + 비-breaking 내부 dead-link 수정 / 활성 normative 만 현재명 갱신 / history 보존)

---

## Lessons Learned

- **LL-i-60 (후보)** — "전체 레포 스캔" 류 광역 요청은 ★ HISTORY/생성물(CHANGELOG·*HISTORY·DEC·archive·dist·examples)을 **정직하게 분리 집계** 후 활성 표면만 triage (453+41 = 결함 아님 명시). doc 재구조화(rename/재번호/접미) 는 SKILL.md 뿐 아니라 methodology-spec SSOT 전반에 미전파 → repo-wide gate 필요. validator 의 exact-match 가 descriptive-suffix 파일명에서 FP 누적 = prefix-match 가 정답 (id 인용 ≠ 파일명). migration/absorption 표는 제거된 구 자산을 의도적으로 명명 (LL-i-52) → 표-header 인식으로 skip (재작성 ❌).
- **LL-i-55 정합 강화** — raw 62→ground truth 대조→실 31→FP 정밀 분리. 광역일수록 "추정 mass-fix" 함정 큼 / 활성 normative(현재명 갱신) vs history(보존) 분기 의무 (v8.0.0 Senior 원칙 계승).

---

## 출처

- 사용자 "다른 stale 인용 더 없나 전체 레포 스캔" + "수정 + validator repo-wide 확장 (추천)" (session 26차 후속 / 2026-05-17)
- 실측 — repo-wide 스캔 + ground truth (schemas/·deliverables/·workflow/·templates/·docs/adr/·decisions/·tools/chain-driver/src/) 삼중 대조
- 선례 — DEC-2026-05-17-skill-citation-integrity (v8.1.0) / v8.0.0 Senior 활성-vs-history 원칙 / formal-spec-link-validator (dead-reference 동형)
