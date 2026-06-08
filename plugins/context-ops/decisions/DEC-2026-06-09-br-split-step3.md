# DEC-2026-06-09-br-split-step3

**결단**: business-rules 산출물을 **분할** — `business-rules.json`(index, well-known 파일명 보존) + `business-rules/<BC-slug>.json`(per-BC leaf). BR-split 순차안의 마지막 STEP 3. 검증파일(`business-rules.schema.json`)은 **무변경**, 새 형식용 schema 2개만 additive 추가. 산출물(analysis OUTPUT)만 분할 — input fixture·legacy 시점기록은 단일파일 그대로 보존.

**작성일**: 2026-06-09 (사용자: "산출물이 하나의 json 에 들어가 있다 / 쪼개는 작업" → STEP 3 착수 → schema 접근 4-라운드 합의 = "검증파일 안 바꾸고 산출물만 쪼갠다").

**version**: plugin.json 0.23.1 → 0.24.0 (MINOR — 산출물 포맷 breaking 이나 0.x SemVer 관행 / loader backward-compat 으로 옛 단일파일 무회귀 / schema additive).

**relates to**:
- `DEC-2026-06-07-br-split-step2`(loader 중앙화) + `DEC-2026-06-07-bounded-context-mandatory`(STEP 1) + `DEC-2026-06-07-subset-retire`(STEP 0) — 본 결단 = STEP 3(분할 본체)
- `tools/_shared/load-business-rules.js`(index 재조립 분기) · `schemas/business-rules-index.schema.json` + `business-rules-bc.schema.json`(신규) · `chain-driver/src/sync.js`+`cli.js`(living-sync 재배선) · `skills/analysis-business-rules/SKILL.md`(writer)
- `feedback_senior_fact_check_supplement`(Senior 적대검토 REVISE@0.83 → BLOCKER 3건 코드확인 후 반영)
- `feedback_zero_base_no_carry_anchor`(STEP 3 보류 근거였던 "BC 채움률 0%" = STEP 1 백필로 해소 실측)
- plan `plan-br-split.md` §9 (상세설계 + §9.6 REVISED)

---

## 1. 배경

BR-split 순차안: STEP 0(subset 폐기)·STEP 1(BC 의무화)·STEP 2(loader 중앙화) 완료. STEP 3(분할)은 **"STEP 1 후 BC 채움률 실측 후 최종 결정"** 으로 보류. 보류 근거 = STEP 1 전 7/8 PoC BC 채움률 0%(분할해도 `_uncategorized` 단일 = 무의미 / Senior 반증). **재실측: STEP 1 백필로 채움률 100%(missing=0) / distinct BC 1~5** → 보류 근거 해소. 사용자 결단으로 STEP 3 착수.

## 2. 설계 (현재 코드 재실측 정정 2건)

- **[정정 A] graph 노드모델 무변경**: graph-synthesizer 는 이미 index 1-parent + per-BC child + per-BR child 를 합성(living-sync S5/S6). 입력은 전체 rule 배열 → loader 가 index→per-BC 재조립해 전체 배열만 돌려주면 graph 무회귀(원설계 대비 단순화).
- **[정정 B] living-sync sync.js loader 우회 = 재배선 필요**: `subsetRules`·`brDiffOrigins` 가 직접 파싱 → index 전환 시 0건 死. STEP 2 이후 추가된 코드라 원 plan 미인지.

### 구현 (7영역 / 단일 커밋)
1. **loader**: `loadBusinessRules` index 감지(`isBusinessRulesIndex`) → per-BC sibling 재조립 = single-point. 옛 단일파일 backward-compat.
2. **schema (additive)**: index + per-BC 신규 2개. 기존 `business-rules.schema.json` 무변경(옛 단일파일·input fixture 검증 / `$defs.businessRule` 재사용처). `$schema_ref` 라우팅.
3. **living-sync**: subsetRules→loadBusinessRules / brDiffOrigins=reconstructBrFromGit(N+1 git show)+loadBusinessRules / `--git` brChanged path-partition(per-BC prefix).
4. **route**: `--analysis` index 재조립 정규화.
5. **release-readiness check8**: per-BC leaf 발견·검증 추가 / br-cross 는 index 1회.
6. **writer/flows/docs**: SKILL 분할 산출 지시 / phase-flow glob / deliverables·lifecycle-contract 경로.
7. **examples**: canonical 3(poc-05/18/19) 마이그레이션 / legacy·input 16 보존.

## 3. Senior 적대검토 REVISE@0.83 — BLOCKER 3건

- **BLOCKER-1** (`--git` brChanged 정확매치): per-BC 편집 미감지 → per-BR origin 死. → index OR `business-rules/` prefix 매치 확장(sync-loop + sync-converge 양쪽).
- **BLOCKER-2** ("8개 마이그레이션" 사실오류): check8 이 examples 내 basename `business-rules.json` 전수 검증 → 파괴적 재정의 시 16 invalid. → **검증파일 무변경 + 신규 schema additive**(사용자 결단과 정합) / canonical 3만 마이그레이션 / 16 단일파일 보존.
- **BLOCKER-3** (baseline hash 무효화): → **non-issue 실증**. BR baseline = content-based subset-hash(정렬) → 분할 불변(단일↔index 동일 hash 실측 / test 가드). examples BR-등록 manifest 0.

## 4. 검증

- workspace 1469 GREEN (fail 0 / 신규 loader 7 + sync split-invariance 1 포함).
- 마이그레이션 3개: index+per-BC schema-valid + loader 재조립 = git HEAD 원본 rule id 집합 **MATCH**.
- reader 회귀 0 (br-cross 32 / federator 34 / traceability 170 / discovery-extraction 39).
- release-readiness.

## 5. scope-out

- domain.json·antipatterns.json 동일 분할 = follow-on(별 결정).
- bcFilter 선택로드 최적화(scope 단계가 해당 BC만 로드) = index 깔린 뒤 가능 / 본 STEP = 전체 재조립 정합 우선(YAGNI 경계).
- discovery-extraction-validator = 입력원 `input/business-rules.json`(단일파일·다른 역할) → index 미노출(무변경).
