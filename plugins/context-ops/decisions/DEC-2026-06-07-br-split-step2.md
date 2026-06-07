# DEC-2026-06-07-br-split-step2

**결단**: business-rules 로딩(파일위치 resolve + shape 추출)을 신규 `tools/_shared/load-business-rules.js` 로 **중앙화**. 목적 = ① discovery-extraction-validator silent mis-fire(blocker #1) 즉시 수정, ② STEP 3(포맷 분할 = index + per-BC)을 **single-point 변경**으로 de-risk. 포맷·schema·산출물 무변경.

**작성일**: 2026-06-07 (사용자: "다음 진행" → BR-split 순차안 STEP 2 착수).

**version**: plugin.json 0.3.0 → 0.4.0 (MINOR — 신규 finding kind + gate #1 verdict 변화 = 호환 기능추가 / PATCH ❌).

**relates to**:
- `DEC-2026-06-07-bounded-context-mandatory` + `DEC-2026-06-07-subset-retire` (BR-split STEP 0+1 / 본 결단 = STEP 2)
- `tools/_shared/load-business-rules.js` (신규) · discovery-extraction / br-cross-consistency / context-federator / traceability-matrix-builder (재배선)
- `feedback_senior_fact_check_supplement` (Senior 적대검토 REVISE@0.82 → naive 단일 normalizer 설계 결함 5건 코드확인 후 정정)
- plan `plan-br-split.md` §8 (상세설계 + §8.5 REVISED)

---

## 1. 배경

BR-split 순차안: STEP 0(subset 폐기) + STEP 1(BC 의무화) = v0.3.0 완료. STEP 2 = **경로통일 + reader 공용 loader** → blocker #1(silent mis-fire) + #3(경로 3종) 해소 + STEP 3(분할) 토대.

3-Explore 실측이 plan §1(STEP-0+1-이전 조사)의 가정 2건 정정:
- 공용 모듈 `tools/_shared/` 이미 존재(ESM / 9 도구 import) → loader 신규 위치 확정(발명 ❌).
- "경로 3종" = 대부분 doc/fixture(`.aimd/output/`=canonical output / `input/`=수동 입력 fixture 별개 역할 / `output/rules/`·`analysis/6-quality/`=legacy 시점기록물) → reader 대수술 아님(caller `--target` 수령).

Senior 적대검토가 naive 단일-normalizer 설계의 결함 5건 적출(전부 코드확인):

## 2. 결정 내용

- **신규 `tools/_shared/load-business-rules.js`** (3 export):
  - `normalizeBusinessRules(parsed)` = strict canonical(`{business_rules:[]}` 만). canonical output reader 3종 전용 / v5.0.0 alias hard-kill 정합. **STEP 3 분할 단일 변경 지점.**
  - `normalizeAnalysisBusinessRules(analysis)` = analysis-stage 4 legacy shape + `{rules, unrecognizedShape}` 신호. discovery-extraction 전용.
  - `loadBusinessRules(target, {readJson, bcFilter})` = 파일/디렉토리 resolve + 추출 + 슬라이스 / 주입 readJson(seam 보존) / fail-closed.
- **silent mis-fire fix**: discovery-extraction-validator 가 BR-container 키 present + id 0건일 때 단일 `discovery.br_source.shape_unrecognized`(high) emit → N 개 false `unknown_br` critical(gate #1 오차단) 억제. BR 키 부재 = 정당한 0-rules(무알람) / typo'd id = 여전히 critical(보존).
- **reader 재배선 4종**: br-cross(extractRules 위임 + cli loader) / federator(loader + readJson 주입) / traceability-graph(cli 루프 business-rules kind 정규화) / discovery-extraction(상기).

## 3. Senior 정정 5건 (코드확인 후 반영 / plan §8.5)

1. **단일 normalizer ❌ → 2 함수**: 4-shape 로 넓히면 br-cross 가 v5.0.0 hard-kill 한 `rules`/`rules_manual_authored` alias 부활(회귀). strict + analysis 분리.
2. **mis-fire 판별 경계**: "객체 non-empty" ❌ → "container 키 present + 0 id" 일 때만(정당한 빈 BR 오탐 회피).
3. **주입 seam 보존**: federator 에 file-loading loader 주입 ❌ → 자기 readJson 그대로 전달.
4. **위치 resolution 을 STEP 2 에**(HIGH): loadBusinessRules 가 위치+추출 둘 다 `_shared` 경유 → STEP 3 single-point(index 파일명 유지 → existsSync/basename 무영향).
5. **버전 MINOR**: 신규 finding kind + gate verdict 변화.
6. **5번째 consumer 명시**: graph-synthesizer.js:280(traceability-graph 실 BR 소비점).

## 4. 검증

- 재배선 4 reader test green: br-cross 32 / context-federator 32 / traceability 152 / discovery-extraction 39(+ mis-fire 4 + loader unit 3 신규).
- workspace 1277/1279 (0 fail / 직전 1270/1272 + 신규 ~7).
- 예제 전수 schema-valid 유지(포맷 무변경 → 자동).
- release-readiness 통과(이 환경 = v0.3.0 커밋 시 40/40).

## 5. Non-goal / carry

- **분할(STEP 3) 아님** — 본 결단 = loader 중앙화 + mis-fire fix(토대)만. 분할(index+per-BC + schema 2종 + 노드모델 + examples 재생성)은 BC 채움률 실측 후 재판단.
- **traceability `chain.businessRules` cli unset latent gap**: buildMatrix 의 BR map 이 cli 에서 미주입(BR 은 graph 경로로만 흐름) — 본 STEP 무행동(BR-split 무관 선재 갭 / 명시 carry).
- 필명→subkind 매핑 상수(hooks-bridge:140 / graph-synthesizer:109 / drift-validator handoff) 중앙화 = STEP 3 index 가 파일명 유지 → 무영향(선택적 follow-on).
