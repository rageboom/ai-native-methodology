# DEC-2026-06-14 — append-catalog `upsertCautionGroup` cross-BC caution merge (clobber fix)

- **status**: 시행 (v0.46.5 / 2026-06-14)
- **kind**: 본체 결함 수정 (shipped tool correctness — data loss 방지)
- **scope**: `tools/_shared/append-catalog.js` (`upsertCautionGroup`) — `bc-accumulator-rollup` + `chain-driver` 양 경로 공유
- **relates**: DEC-2026-06-12-parallel-bc-accumulator-rollup (모) · DEC-2026-06-12-artifact-zone · DEC-2026-06-12-resve-multidomain-corroboration (append-catalog SSOT) · feedback_strict_exposes_drift

## 발견 (dogfood)

carry ④ req 4-BC(iteqmt/bookreq/bizcard/empcard) 부분추가 analysis 의 shared 카탈로그 rollup 단계에서 노출. `migration-cautions.json` 의 `caution_groups[]` 에 BC 별 caution 그룹을 누적할 때, 여러 BC 가 **같은 cross-cutting 메타 title**(예: "분석 메타 — sql-inventory 추출기/스키마 한계")에 각자 caution 을 더하면 마지막 BC 의 그룹이 앞선 BC 의 그룹을 **통째로 교체**.

- **증거**: empcard rollup 이 title 일치하는 기존 그룹(stdpkng 가 채운)을 교체 → `MC-REQ-STDPKNG-TABLE-CANDIDATE-CASE-DUP` + `MC-REQ-STDPKNG-USESTATUS-DUP-GUARD-MAPPER-ORPHAN` 2 caution **silently drop**. caution-id 수준 전수 비교: HEAD 161 → 수정전 재현 시 2 LOST.
- **원인**: `upsertCautionGroup` 이 `upsertById(…, 'title')` 로 그룹 객체 전체를 replace. title 은 cross-cutting 공유 키인데 group 단위 교체라 sibling BC 의 `cautions[]` 가 보존되지 않음. 단일-BC(golf/event)에선 충돌 부재로 미노출 — 다중-BC 팬아웃에서만 드러나는 잠복 결함.

## 결정

title 충돌 시 그룹을 통째 교체하지 않고 **`cautions[]` 를 `caution.id` 기준 union 병합**:

- title 없으면 append (기존 동작 유지).
- title 일치 시: incoming caution 을 id 기준 — 없으면 추가 / 같은 id 면 교체(= **idempotent**) / sibling caution 보존.
- group 메타(`category`/`description`)는 **기존이 비었을 때만** incoming 으로 보강(first-writer 우선 / 덮어쓰기 ❌).
- `caution.id` 는 migration-cautions.schema.json `required` → union 키 안전(데이터 100% 보유 확인).

## 검증

- `tools/chain-driver/test/append-catalog.test.js` 16/16 GREEN — 신규 회귀 2: (a) title 충돌 union 병합·sibling 보존·group 수 유지·같은 id 교체·기존 메타 보존, (b) merge idempotent(같은 group 재적용 중복 0). chain-driver 전체 539/539 무회귀.
- 수정 tool 로 shared 카탈로그 HEAD 복원 후 재-rollup: **caution LOST 0** (HEAD 161 ⊆ 현재 208 / 47 신규). 병합 그룹 = stdpkng 2 + empcard 2 = 4 (정확 union).
- shared 카탈로그 3종 schema valid (business-rules-index / domain / migration-cautions) + load-business-rules 재조립 638 BR.

## §8.1 / 격상 근거

correctness 수정(데이터 손실 방지)이며 gate-flip / 정량 ceiling 주장 아님 → §8.1 2-PoC 격상 바 대상 아님. 단일 결정론 재현(empcard↔stdpkng) + 회귀 test 로 충분. 다중-BC rollup(EVENT/RESV 4종/CAL 3종/REQ 6종 누적 진행)에서 cross-cutting 메타 title 공유는 구조적으로 재발 가능 → 잠복 데이터 손실 원천 차단. strict/dogfood 가 drift 를 폭로한 정착 사례(feedback_strict_exposes_drift).
