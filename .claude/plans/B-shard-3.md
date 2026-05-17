# B-shard-3.md — L3 quality audit of 9 skills (axis B-1~B-7)

> SSOT: `ai-native-methodology/methodology-spec/plugin-authoring-spec.md` §2 (S1~S8).
> Out-of-scope: S1 line count, S2 length, S3 naming, S6 keys, citation dead-link (covered by skill-citation-validator).
> Audit method: read each SKILL.md verbatim; cross-check cited paths against repo (`schemas/`, `docs/adr/`, `methodology-spec/deliverables/`, `decisions/`, `tools/`).
> Date: 2026-05-18. No simulation. Evidence-grounded.

Legend: P=PASS, W=WARN (minor), F=FAIL (substantive)

---

## Skill: analysis-quality-antipattern

`ai-native-methodology/skills/analysis-quality-antipattern/SKILL.md:1-44`

| axis | verdict | evidence |
|---|---|---|
| B-1 description↔body | P | desc "consolidate antipatterns.json + migration-cautions.md" body §절차 step 4+5 정합 (line 28-30) |
| B-2 trigger keywords | W | "Use after all `api` + `ui` phase outputs" = phase-relative, weak self-trigger; auto-invoke 시 사용자 자연어 "antipattern"/"migration cautions" 키워드 부재 (line 3) |
| B-3 single responsibility | W | composite by design — 2 산출물 동시 (antipatterns.json + migration-cautions.md) 통합. S4 단일책임 정신 borderline. 단, deliverables/6+7 conjoined SSOT 사실 → 본 plugin 내 documented coupling |
| B-4 imperative voice | P | "분류" "거절" "명시" "작성" — imperative dominant (line 18-31) |
| B-5 progressive disclosure | P | 44 줄, self-contained, 핵심 절차 6 step + 산출물 + 본체명세 |
| B-6 cross-skill consistency | P | analysis-* family 패턴 정합 (사전조건 / 절차 / 산출물 / 본체명세 4 섹션) |
| B-7 citation accuracy | P | `methodology-spec/workflow/quality.md` ✓ / `deliverables/6-antipatterns.md` ✓ / `schemas/antipatterns.schema.json` ✓ / `DEC-2026-04-29-안티패턴-마이그레이션-가이드.md` ✓ |

Findings:
- **F-SKILL-CAND-001** (W, B-2): trigger keyword 보강 권고 — `description` 에 "antipattern consolidation" / "migration cautions" 자연어 키워드 직접 포함 (현재 phase-relative 만).
- **F-SKILL-CAND-002** (W, B-3): composite 2 산출물 → 단일책임 위반 외관. 본체 deliverables/6+7 SSOT 가 의도적 conjoined 임을 SKILL.md 본문에 한 줄 명시 권고 ("의도적 coupling = ADR cite").

---

## Skill: analysis-ui-state-map-fe

`ai-native-methodology/skills/analysis-ui-state-map-fe/SKILL.md:1-37`

| axis | verdict | evidence |
|---|---|---|
| B-1 description↔body | P | desc "state-map.json (산출물 8)" ↔ body step 6 정합 (line 25) |
| B-2 trigger keywords | P | "React/Vue/Svelte/Solid + Zustand/Redux/Pinia/MobX/Jotai/TanStack Query/RTK Query/SWR" — 8 시그널 lib 명시 |
| B-3 single responsibility | P | 1 산출물 (state-map.json) |
| B-4 imperative voice | P | "식별" "추출" "매핑" "작성" |
| B-5 progressive disclosure | P | 37 줄, self-contained |
| B-6 cross-skill consistency | P | FE-* sub-family 정합 (analysis-ui-visual-manifest-fe / analysis-form-validation-fe / analysis-type-spec-fe 동형) |
| B-7 citation accuracy | P | `deliverables/8-state-map.md` ✓ / `workflow/ui.md` ✓ / `schemas/state-map.schema.json` ✓ / ADR-FE-006 ✓ |

Findings: 없음 (clean).

---

## Skill: analysis-ui-visual-manifest-fe

`ai-native-methodology/skills/analysis-ui-visual-manifest-fe/SKILL.md:1-45`

| axis | verdict | evidence |
|---|---|---|
| B-1 description↔body | P | desc "visual-manifest.json (산출물 9)" ↔ body step 4 정합 (line 24) |
| B-2 trigger keywords | P | "DTCG / W3C / Tailwind / shadcn / MUI / Chakra / Mantine / Storybook" — 7 시그널 lib |
| B-3 single responsibility | P | 1 산출물 |
| B-4 imperative voice | P | "추출" "분류" "작성" "변환 권장" |
| B-5 progressive disclosure | P | 45 줄, JSON 예시 inline (step 4) — borderline 크기지만 5000 토큰 budget 여유 |
| B-6 cross-skill consistency | P | FE-* sub-family 정합 |
| B-7 citation accuracy | P | `deliverables/9-visual-manifest.md` ✓ / `workflow/ui.md` ✓ / `schemas/visual-manifest.schema.json` ✓ / ADR-FE-005 ✓ |

Findings: 없음 (clean).

---

## Skill: analysis-form-validation-fe

`ai-native-methodology/skills/analysis-form-validation-fe/SKILL.md:1-54`

| axis | verdict | evidence |
|---|---|---|
| B-1 description↔body | P | desc "form-validation-spec.json (산출물 14) + fe_validation auto_extracted=true" ↔ body step 4-5 정합 (line 28-41) |
| B-2 trigger keywords | P | "Zod / Yup / Joi / react-hook-form / class-validator / Ajv / Vest" — 7 시그널 lib |
| B-3 single responsibility | W | 2 산출물 의도 (business-rules.json 갱신 + form-validation-spec.json 신규). 본체 ADR-FE-005 정합 의도지만 외관 composite. analysis-quality-antipattern 과 유사 borderline |
| B-4 imperative voice | P | "식별" "추출" "분류" "등재" "작성" |
| B-5 progressive disclosure | P | 54 줄, self-contained |
| B-6 cross-skill consistency | P | FE-* sub-family 정합. desc "★ ADR-FE-005 매개체 13" 본문 inline (line 21) — body S5 narrative 약간 |
| B-7 citation accuracy | P | `deliverables/14-form-validation-spec.md` ✓ / `schemas/form-validation-spec.schema.json` ✓ / `schemas/business-rules.schema.json` fe_validation 필드 187:line 실재 ✓ / ADR-FE-005 ✓ |

Findings:
- **F-SKILL-CAND-003** (W, B-3): 2 산출물 동시 — business-rules.json append + form-validation-spec.json 신규. 본 plugin 의도적 패턴 (FV-* refs `auto_extracted=true`) 이나 SKILL.md 가 명시적으로 "이중 산출 의도 = ADR-FE-005" 한 줄 강조 권고.

---

## Skill: analysis-error-mapping

`ai-native-methodology/skills/analysis-error-mapping/SKILL.md:1-120`

| axis | verdict | evidence |
|---|---|---|
| B-1 description↔body | P | desc "error-mapping-spec.json (산출물 16) + AP-API-001 negative-space + Real Semgrep" ↔ body §no-simulation + step 3 Semgrep 호출 정합 (line 40-50) |
| B-2 trigger keywords | P | "Spring / NestJS / Express / @Post / @ApiResponse / status code decorator" — framework 시그널 명확 |
| B-3 single responsibility | P | 1 주산출물 (error-mapping-spec.json) + 부산물 (sarif raw + baseline). raw 부산물 = 도구 산출물 = composite 아님 |
| B-4 imperative voice | P | "발동" "scan" "실행" "작성" "등재" |
| B-5 progressive disclosure | W | 120 줄 — 9 step 모두 핵심 절차. line 73-88 (negative_evidence YAML inline) 큰 inline block; out-of-tree 분리 권고 가능하나 self-contained 가치 우선 → borderline pass |
| B-6 cross-skill consistency | P | analysis-* 패턴 정합 (no-simulation 섹션 / 사전조건 / 절차 / 산출물 / CI 통합 / 본체명세) |
| B-7 citation accuracy | P | `deliverables/16-error-mapping-spec.md` ✓ / `schemas/error-mapping-spec.schema.json` ✓ / `tools/static-runner/rules/error-mapping-missing.{yml,java,ts}` ✓ (실재 확인) / ADR-BE-001 ✓ / ADR-FE-007 ✓ / ADR-009 ✓ / ADR-010 ✓ / `DEC-2026-04-29-static-tool-실행-의무화.md` ✓ / `DEC-2026-05-02-jwt-rsa-custom-rule.md` ✓ |

Findings:
- **F-SKILL-CAND-004** (W, B-5): 120 줄 + inline YAML block(line 73-88). progressive disclosure 정신상 step 7 의 `negative_evidence` 4종 YAML 을 `schemas/error-mapping-spec.schema.json` link 로 대체 권고 가능. 단 self-contained 가치 우선 시 borderline pass.

---

## Skill: analysis-sql-inventory

`ai-native-methodology/skills/analysis-sql-inventory/SKILL.md:1-210`

| axis | verdict | evidence |
|---|---|---|
| B-1 description↔body | P | desc "sql-inventory.json (산출물 24) + 11 컬럼 (6 외부 + 5 본 추가) + iBATIS 2 / MyBatis / Spring JDBC / JPA" ↔ body step 1-10 정합 (line 26-148) |
| B-2 trigger keywords | P | "sql inventory / mapper xml / ibatis sql / DAO sql / stored procedure inventory" — 사용자 자연어 명시 (line 3) |
| B-3 single responsibility | P | 1 주산출물 (sql-inventory.json) + 사람 눈 md + raw grep + (optional) patterns_extension_v2. ADR-008 이중 렌더링 정합 |
| B-4 imperative voice | P | "추출" "발동" "작성" "실행" |
| B-5 progressive disclosure | F | **210 줄** — S1 ≤500 PASS 이나 본 audit out-of-scope. S8 first-5000-tokens budget 위협 가능성 borderline. 11 step + 외부 권위 11 source + 흔한 함정 7 + ≥2 PoC 표. 일부 (외부 권위 list / patterns_extension_v3 carry note) out-of-tree 분리 가능 |
| B-6 cross-skill consistency | P | analysis-characterization-test 와 자매 (phase 4.7 / 4.8 ADR-CHAIN-006/007). 4 섹션 패턴 정합 + ★ ★ ≥2 PoC corroboration 표 동형 |
| B-7 citation accuracy | P | `deliverables/24-sql-inventory.md` ✓ / `schemas/sql-inventory.schema.json` ✓ / `tools/sql-inventory-extractor/` ✓ / `flows/analysis.phase-flow.json` phase 4.8 ✓ / ADR-CHAIN-007 ✓ / ADR-008 ✓ / ADR-009 ✓ / `DEC-2026-05-08-poc-06-sql-inventory-retrofit.md` ✓ / `DEC-2026-05-08-poc-07-종결.md` ✓ |

Findings:
- **F-SKILL-CAND-005** (W, B-5): 210 줄 (≤500 OK but largest of 9). step 11 (sql-inventory-extractor) 이후 외부 권위 list + 흔한 함정 7 + 표 — out-of-tree 분리 후보. `deliverables/24-sql-inventory.md §외부권위` 로 위임 권고.

---

## Skill: analysis-characterization-test

`ai-native-methodology/skills/analysis-characterization-test/SKILL.md:1-196`

| axis | verdict | evidence |
|---|---|---|
| B-1 description↔body | P | desc "characterization-spec.json (산출물 23) + Feathers + Adzic Given/When/Then + SATD" ↔ body step 2 4분류 표 + step 3 SATD grep + step 4 G/W/T 정합 (line 34-77) |
| B-2 trigger keywords | P | "characterization / intent-vs-bug / snapshot golden / behavior preserve" — 사용자 자연어 명시 |
| B-3 single responsibility | P | 1 주산출물 (characterization-spec.json) + 부산물 (intent-vs-bug.md / coverage.json / snapshots/) — ADR-008 이중 렌더링 정합 |
| B-4 imperative voice | P | "분류" "grep" "작성" "처리" "실행" |
| B-5 progressive disclosure | W | 196 줄. step 4 (snapshot YAML inline / line 56-77) + step 6 (Modern vs Legacy hint / 자연어 narrative) — narrative 가 S5 imperative voice 약간 약화 |
| B-6 cross-skill consistency | P | analysis-sql-inventory 와 자매. 4 섹션 + ★ ★ ≥2 PoC corroboration 표 동형 |
| B-7 citation accuracy | P | `deliverables/23-characterization-spec.md` ✓ / `schemas/characterization-spec.schema.json` ✓ / `tools/characterization-coverage-validator/` ✓ / `flows/analysis.phase-flow.json` phase 4.7 ✓ / ADR-CHAIN-006 ✓ / `DEC-2026-05-07-poc-06-종결.md` ✓ / `DEC-2026-05-07-poc-07-poc03-phase7-retrofit.md` ✓ |

Findings:
- **F-SKILL-CAND-006** (W, B-5): line 99-105 (Modern vs Legacy hint) narrative 길이. step 6 자체가 "분기 ❌ + 자연어 hint" 의도지만 imperative voice 약화. 한 줄 bullet 화 권고 가능.

---

## Skill: analysis-db-schema-erd

`ai-native-methodology/skills/analysis-db-schema-erd/SKILL.md:1-53`

| axis | verdict | evidence |
|---|---|---|
| B-1 description↔body | P | desc "schema.json (산출물 5-b) + erd.mermaid + drift-validator" ↔ body step 4-6 정합 (line 30-41) |
| B-2 trigger keywords | P | "DDL .sql / Prisma / JPA @Entity / TypeORM @Entity / SQLAlchemy / Mongoose / migration" — 7 시그널 |
| B-3 single responsibility | P | 이중 렌더링 (schema.json + erd.mermaid) = ADR-008 의도적 패턴 |
| B-4 imperative voice | P | "수집" "추출" "추론" "작성" "생성" "자동 호출" |
| B-5 progressive disclosure | P | 53 줄, self-contained |
| B-6 cross-skill consistency | W | analysis-* 패턴 정합. 단 "사전 조건" 에 `domain.json` 만 명시 — `inventory.json` 누락 (다른 analysis-* skill 은 inventory.json 공통 prereq) |
| B-7 citation accuracy | P | `deliverables/4-5-formal-spec.md` ✓ / `schemas/db-schema.schema.json` ✓ / ADR-008 ✓ |

Findings:
- **F-SKILL-CAND-007** (W, B-6): 사전조건 `inventory.json` 누락 — analysis-architecture / analysis-domain-model / analysis-ui-state-map-fe 모두 inventory 의존이나 본 skill 만 domain.json 만 prereq 명시. cross-skill consistency 약화.

---

## Skill: analysis-type-spec-fe

`ai-native-methodology/skills/analysis-type-spec-fe/SKILL.md:1-57`

| axis | verdict | evidence |
|---|---|---|
| B-1 description↔body | P | desc "type-spec.json (산출물 15) + ts-morph + TypeScript types/interfaces" ↔ body step 1-5 정합 (line 18-44) |
| B-2 trigger keywords | P | "TypeScript (.tsx/.ts files + tsconfig.json present) / ts-morph" — TS 시그널 명확 |
| B-3 single responsibility | P | 1 산출물 |
| B-4 imperative voice | P | "실행" "추출" "정량" "분류" "작성" |
| B-5 progressive disclosure | P | 57 줄, self-contained |
| B-6 cross-skill consistency | W | desc "FE+BE TypeScript stack" 표기 — name `-fe` suffix 와 모순(BE TS 도 cover 의도 시 name=`analysis-type-spec` 가 정확). FE 가족 naming convention 와 약한 mismatch |
| B-7 citation accuracy | P | `deliverables/15-type-spec.md` ✓ / `schemas/type-spec.schema.json` ✓ / ADR-FE-006 ✓ |

Findings:
- **F-SKILL-CAND-008** (W, B-6): `name=analysis-type-spec-fe` 와 desc "FE+BE TypeScript stack" 의 scope 모순. naming convention 으로 본 audit out-of-scope 이나 description-body match 영향. 해소 옵션 (a) desc 를 "FE-primary" 로 약화 (b) v9.x rename to drop `-fe`.

---

## Summary

### 9 × 7 = 63 cells

| count | axis | verdict |
|---|---|---|
| **PASS 56** | B-1 9P / B-2 8P+1W / B-3 6P+3W / B-4 9P / B-5 6P+2W+1F / B-6 6P+3W / B-7 9P | overall PASS-dominant |
| **WARN 6** | F-SKILL-CAND-001(B-2) / 002(B-3) / 003(B-3) / 004(B-5) / 005(B-5) / 006(B-5) / 007(B-6) / 008(B-6) | actually 8 WARN cells total |
| **FAIL 0** | (B-5 sql-inventory was within ≤500 OOS) | substantive FAIL 0 |

(correction — 63 cells distribution: 55 P + 8 W + 0 F = 63)

### Top 5 finding candidates (prioritized by severity-mass)

1. **F-SKILL-CAND-008** — analysis-type-spec-fe: `-fe` suffix vs desc "FE+BE TypeScript stack" scope mismatch. resolution = MAJOR rename or description softening.
2. **F-SKILL-CAND-005** — analysis-sql-inventory: 210 줄, S8 first-5000-tokens budget approaching. out-of-tree 분리 권고 (외부권위/흔한함정/PoC 표).
3. **F-SKILL-CAND-007** — analysis-db-schema-erd: 사전조건 `inventory.json` 누락 — cross-skill 공통 prereq pattern 불일치.
4. **F-SKILL-CAND-002 + 003** (joined) — analysis-quality-antipattern + analysis-form-validation-fe: composite 2-output 외관 → S4 단일책임 borderline. 본문에 "의도적 conjoined = ADR cite" 한 줄 명시 권고.
5. **F-SKILL-CAND-001** — analysis-quality-antipattern: description trigger 약함 (phase-relative only). 사용자 자연어 "antipattern" / "migration cautions" / "anti-pattern 통합" 키워드 직접 포함 권고.

### Cross-skill patterns

1. **FE-* sub-family 4 skills (state-map / visual-manifest / form-validation / type-spec)** — 사전조건+절차+산출물+본체명세 4 섹션 templating 동형 ✅. PASS-dominant. 단 type-spec-fe 의 `-fe` suffix vs BE TS scope 모순 = sub-family 정합 약점.
2. **analysis-quality-antipattern aggregates downstream** — 다른 8 analysis-* skill 의 finding/AP 를 통합하는 final stage step. composite risk = "이 skill 의 정합성이 다른 8 skill 의 산출 품질에 의존". 본문에 "의도적 aggregation = phase-relative trigger" 명시 권고.
3. **Heavyweight 2 skills (sql-inventory 210 + characterization-test 196 + error-mapping 120)** — 모두 ADR-CHAIN-006/007 + ADR-BE-001 (phase 4.7/4.8) 신규 자산 + ≥2 PoC corroboration 표 동형. 본 3 skill 만 narrative-heavy = 진화 단계 sediment. out-of-tree 분리 cadence 권고 (deliverables/24, deliverables/23, deliverables/16 로 외부권위/함정 위임).
4. **`no-simulation 절대 금지` 섹션 패턴** — error-mapping + sql-inventory + characterization-test 3 skill 만 명시 (line 12-17 / 12-17 / 12-17). 다른 6 skill = 암묵. analysis-type-spec-fe step 1 (line 20-22) 만 약한 명시 "★ 진짜 도구 실행 의무 / no-simulation". CLAUDE.md ★★★ 정책 정합 = 6 skill 추가 보강 권고 가능 (cross-skill consistency).
5. **citation accuracy 9/9 PASS** — 모든 ADR/schema/DEC/deliverables/tools cite 실재 확인. skill-citation-validator dogfood (v8.1.0 신설) 효과 입증.

### Note on out-of-scope axes

- S1 line count: all 9 ≤ 500 (max 210 = sql-inventory).
- S2 length: all 9 desc ≤ 1536 char (max ~ 419 = analysis-sql-inventory).
- S3 naming: all 9 follow `[a-z0-9-]` convention.
- S6 keys: all 9 use only `name`/`description`/`allowed-tools` (3 of 15 official keys).
- citation dead-link: 0 (skill-citation-validator clean).
