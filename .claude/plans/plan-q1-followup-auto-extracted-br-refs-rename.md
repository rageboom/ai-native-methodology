# plan — Q-①-followup: rules_auto_extracted_reference → auto_extracted_br_refs semantic-rename

> 4원칙 1단계 산출. session 26차 연속 (2026-05-17). 사용자 "1"(묶음 Q 잔여 진입) → "Q-①-followup 먼저" (risk 오름차순 첫 / 11 files).
> 출처 carry = DEC-2026-05-17-q1-alias-4중첩-폐기 §1 #4 + LL-i-52 (semantic-rename ≠ alias 폐기 / ① scope 외 / 별도 plan).

## 0. 한 줄 정의

schema property **`rules_auto_extracted_reference` → `auto_extracted_br_refs`** semantic-rename. 의미 불변 (FE 트랙 cross-link / 다른 산출물 자동추출 BR 참조 provenance pointer). 이름만 더 명확·간결.

## 1. 깊은 숙지 (실측)

- **의미**: `rules.schema.json` property (type: `["array","object"]`). FE 트랙 — form-validation-spec / state-map 등에서 자동 추출된 BR 참조 (cross-link only / BR-list alias 아님 = ① scope 외 보존 사유 / Senior Q1 / LL-i-52).
- **실사용 = poc-04 단 1곳**: `examples/poc-04-full-realworld-react/analysis/6-quality/rules.json` — `{source:"form-validation-spec.json", auto_registered_br:77, note:"..."}`. 타 PoC 미사용.
- **★ src consumer = 0** (br-cross-consistency-validator / schema-validator / release-readiness src 전수 grep = 0 참조). ② TCA 의 decision-table-validator 같은 load-bearing consumer **부재** → hard-rename 안전 (LL-i-55 정합 / close round 불요).
- **영향 파일 (11 file 중 실 변경)**:
  - `schemas/rules.schema.json` — property 명 + description 텍스트
  - `examples/poc-04-full-realworld-react/analysis/6-quality/rules.json` — key rename (per-file Edit)
  - `tools/drift-validator/test/canonical-single-alias.test.js` line 41-47 — "rules_auto_extracted_reference 보존" guard → "auto_extracted_br_refs 보존 + rules_auto_extracted_reference 재유입 0" (① alias-REJECT 패턴 동형)
  - 활성 SSOT 문서 — ADR-CHAIN-011 §5 (Q-①-followup 종결 표기) / glossary (있으면)
  - 역사 DEC (q1/q2/severity/묶음-P) / STATUS·INDEX 과거 entry = ★ 보존 (과거 사실 / 역사 기록 / silent 재작성 ❌)
  - CHANGELOG + plugin.json + CLAUDE.md + STATUS 헤더 + DEC 신설 + INDEX 등재

## 2. 사용자 결단 후보 (3-에이전트 research 후 확정)

- **D1 version** — ① (property 제거 valid→invalid) = v5.0.0 MAJOR. Q-①-followup = property **rename** (old key 보유 poc-04 = additionalProperties:false 로 invalid). official-docs semver 판정 의무 — (a) v7.0.0 MAJOR (① 동형 / consumer 입장 valid→invalid breaking) vs (b) v6.1.0 MINOR (순수 rename / 외부 consumer 0 / 유일 사용 poc-04 동시 마이그레이션 무손실 / dogfooding). research 수렴 후 사실 확정.
- **D2 문서 처분** — 역사 DEC/STATUS/INDEX 과거 entry = 보존 (과거 사실 / LL-i-52 silent 재작성 ❌). 활성 SSOT (schema/ADR §5 신규 patch/glossary/CHANGELOG/STATUS 헤더) 만 갱신.
- **D3 cooling-off** — ①②처럼 지금 시행 vs 별도 대기 (사용자 명시).
- **D4 ① guard test 전환** — canonical-single-alias.test.js 의 "rules_auto_extracted_reference 보존" test → rename 후 "auto_extracted_br_refs 보존 + old 명 재유입 0" 로 전환 (① 재유입 guard 동형).

## 3. 시행 절차 (① 동형 / 사용자 승인 후)

1. dry-run 실측 — `rules_auto_extracted_reference` 실 보유 PoC = poc-04 단 1 (재확인 / no-simulation)
2. schema rename (property + description + 최상단/businessRule 텍스트 영향 없음 — top-level property)
3. poc-04 rules.json key rename (per-file Edit / bulk script ❌ auto-mode 차단)
4. drift guard test 전환 (보존 → rename 후 보존 + 재유입 0)
5. 문서 (DEC 신설 + ADR §5.12 patch v15 + §9 LL(필요시) + CHANGELOG + INDEX 최상단 + plugin.json + CLAUDE.md + STATUS)
6. 회귀 — workspace 전수 + release-readiness 11/11 + breaking 여부 명시

## 4. 위험 / 메모

- ★ ②와 달리 semantic 합성 0 (#06 같은 도메인 합성 부재) + consumer 0 → risk 최소. ① 의 scope 외 잔여 청산.
- 단 ① DEC §1 #4 + LL-i-52 가 "별도 plan + 4원칙" 명시 → 작아도 4원칙 full 의무 (process 일관성).

## 5. 다음 단계

4원칙 2단계 — 3-에이전트 research (official-docs semver + industry-case rename 관행 + Senior critique) 가벼운 sub-agent 병렬 → research.md → 사용자 결단 (D1~D4) → 3단계 승인 후 시행.
