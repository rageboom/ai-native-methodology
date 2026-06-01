# Baseline + Delta 운영 모델 (초기 1회 full analysis + 신규 건 delta 갱신)

> **사상**: 레거시 전체를 매번 재분석하지 않는다. **baseline 1회 수립 → scope 단위 delta 운영**. DEC-2026-05-21 carry `C-v4.1-baseline-delta-운영-문서화` 명문화.
> **관련**: `lifecycle-contract.md` §파일 위치 컨벤션 (scope 폴더) · ADR-010 (baseline + ratchet / quality) · `schemas/work-unit-manifest.schema.json` (`related_artifacts` / `sync_state`) · `tools/chain-driver` `sync` 명령.

## 1. 왜 필요한가

레거시 전체 full analysis 는 비용이 크다 (대형 코드베이스 context 부담 + 시간). 한 번 분석한 baseline 을 **두 종류의 baseline** 으로 고정하고, 이후 작업은 **변경분(delta)** 만 다룬다:

- **분석 baseline** = canonical global `.aimd/output/` (7대 BE + 8 FE 산출물). "이 시스템이 무엇인가" 의 단일 진실.
- **품질 baseline** = `.aimd/baseline-<date>.json` (ADR-010). 진입 시점 finding 을 grandfather 하고 신규 작업만 ratchet (품질 단조 증가).

두 baseline 은 axis 가 다르다 — 분석 baseline = **사실 스냅샷** / 품질 baseline = **gate 기준선**. (혼동 금지.)

## 2. 자산 지도 (운영 모델이 올라타는 기계장치)

| 자산 | 역할 | 위치 |
|---|---|---|
| canonical global | full analysis 산출물 (scope 무관 단일 진실) | `.aimd/output/` |
| 품질 baseline | ADR-010 finding ratchet 기준선 | `.aimd/baseline-<date>.json` |
| scope work-unit | feature/도메인 단위 작업 격리 | `.aimd/<scope>/manifest.{json,md}` (`work-unit-manifest.schema.json`) |
| `analysis_refs` (★ schema 정공 명) | scope ↔ canonical global 역인덱스 — 5 이식성 + ★ v11.3.0 DB 자산 4 (BR/endpoint/schemas/domain/antipattern + db_tables/db_procedures/db_functions/db_views) | scope manifest 내부 (자연어 "related_artifacts" 와 동의어 / schema 필드 = `analysis_refs`) |
| scope-local analysis (선택) | 대형 프로젝트 context ↓ 용 subset | `.aimd/<scope>/analysis/*.subset.json` |
| ★ canonical global DB 자산 디렉토리 (v11.3.0) | DB always-on 정책 (`db-assets-always-on.md` §4) 의 실 저장 위치 | `.aimd/output/stored-procedures/` (SP 정적 분석) + `.aimd/output/functions/` (Function 정리) — 기존 `schema.json` 보존 (Tables + ERD axis / ★ v12 ADR-011 — erd 는 schema.json 내 관계) |
| `sync_state` (M4) | canonical global 변경 → scope drift 표지 | scope manifest 내부 (`drift_detected` / `last_synced_at` / `sync_sources`) |
| `chain-driver sync` | drift scope 에 cascade (통제된 동기) | `chain-driver sync <project> --scope <slug>` |

## 3. 운영 cadence (3 단계)

### (1) 초기 1회 — baseline 수립
```
chain-driver init <project>
"이 코드베이스 분석 시작"        → analysis stage full run
```
→ canonical global `.aimd/output/` (15종 중 해당분 + ★ v11.3.0 DB 자산 — `stored-procedures/` + `functions/` + 기존 `schema.json`) + `baseline-<date>.json` 생성. 이것이 **이후 모든 scope 의 기준선**. ★ 1회성 — 매번 반복 ❌. ★ DB always-on 정책 (`db-assets-always-on.md` §3) — Tables/Views/Functions/SP/ERD/도메인 노트 모두 입력 의무 (누락 시 사용자 결단).

### (2) 신규 건마다 — scope delta
```
chain-driver init <project> --scope <slug>     # feature/도메인 단위
"발견 단계 시작"                                → discovery → spec → plan → test → implement (chain 1~5)
```
→ scope 는 canonical global 을 **재분석하지 않고 상속**:
- `analysis_refs` 역인덱스 (schema 정공 명 / 자연어 = "related_artifacts") 로 이 scope 와 관련된 BR/endpoint/table/domain/antipattern + ★ v11.3.0 **db_tables/db_procedures/db_functions/db_views** 만 참조.
- (대형) `.aimd/<scope>/analysis/*.subset.json` 으로 scope-local subset 만 둠 (context 부담 ↓).
- chain (discovery~implement) 은 그 slice 위에서만 동작.
- ★ chain 3 plan stage 진입 시 `db_procedures[].sp_conversion_class` (α/β/γ/δ) 본격 결단 + `task-plan.sp_conversions[]` 본격 생성 (`sp-conversion-policy.md` §3 정합).

★ 핵심: **분석은 1회, chain 은 scope 마다**. scope N 개 = chain N 회 / 분석은 baseline 1개 공유.

### (3) 레거시 코드 변경 시 — baseline delta 갱신
```
# 변경된 영역만 재분석 → canonical global 부분 갱신
# → SessionStart hook 이 영향 scope 의 sync_state.drift_detected=true 자동 set
chain-driver sync <project> --scope <slug>     # 통제된 cascade (사용자 명시)
```
→ canonical global 변경분만 반영 + 영향 받는 scope 에 한해 revisit (`chain-revisit-detector` 정합). **전체 재분석 ❌ / 변경 scope 만**.

## 4. baseline carry 규약

- **단일 baseline source** = canonical global. scope 는 복제 ❌, **참조**(`analysis_refs` / scope-local subset 은 파생 view).
- **drift 는 자동 감지 / cascade 는 수동** — `sync_state.drift_detected` 는 hook 이 set 하지만, 실제 전파는 `chain-driver sync` 사용자 명시 호출 시만 (안전·통제·자동 균형 / lifecycle-contract M4 정합).
- **품질 baseline 은 단조** — ADR-010 ratchet. 신규 scope 작업이 baseline 아래로 품질 회귀 시 gate block. baseline 자체는 격하 ❌ (ratchet up only).
- **iter-N carry** — 같은 scope 재반복(iter) 시 직전 iter 산출물 참조 (`input-manifest.inherited_from.carry_artifacts`). baseline 재수립 ❌.
- ★ **DB 자산 drift** (v11.3.0) — legacy DB 변경 (Table column / SP body / Function) 시 canonical global 부분 갱신 + 영향 scope 의 `analysis_refs.db_*` 역인덱스 갱신 + `sync_state.drift_detected=true` 자동 set.

## 5. 사례 (poc-17 ifrs/car / 첫 본격 적용 — 2026-05-29 Phase 1 종결)

### 5.1 canonical global 본격 적용 사실

poc-17 ifrs/car 도메인 = **canonical global baseline 첫 본격 적용 사례**:
- 외부 작업 디렉토리 `~/Documents/Development/Study/poc-17-ifrs-car-migration/.aimd/output/` = canonical global SSOT (사내 source 격리 paradigm / LL-codegraph-07)
- 12 phase 전수 산출 (입력 + discovery + template-analyze + db-schema + architecture + business-logic + formal-spec + characterization + sql-inventory + api + ui + quality) = 25+ 산출물
- 6 화면 (car-list / car-drive-log / car-cost-confirm / car-cost-calculate / car-cost-nolog / car-cost-statement) × 5 stage 디렉토리 ready (chain 1 discovery 진입 ready)

### 5.2 cadence 본격 입증 (3 단계 정합)

| 단계 | 본 PoC 적용 사실 |
|---|---|
| (1) 초기 1회 full | 2026-05-29 / 12 phase 전수 / canonical global 25+ 산출물 / R1' axis 4번째 corroboration |
| (2) 신규 건마다 scope delta | car-list pilot 진입 시 `discovery/.aimd/car-list/manifest.json` 의 `analysis_refs` 역인덱스 (db_tables / db_procedures / db_functions / cross-DB 18 자산 참조) |
| (3) legacy 변경 시 baseline delta | (★ poc-17 = 본격 변경 ❌ / 본 cadence 는 carry 자격 자연 충족 시점부터 본격 측정) |

### 5.3 ★ ★ K + L 정책 통합 적용 (canonical global 디렉토리 구조 본격 입증)

- `.aimd/output/schema.json` = K 정책 본격 (6 Tables + 2 Functions + cross-DB 18 자산)
- ERD = `schema.json` 내 foreign_keys (★ v12 ADR-011 — 구 erd.mermaid 폐기)
- `.aimd/output/db-schema-validation-report.md` = K 정책 정합성 검증 (7 finding + 6 carry)
- `.aimd/output/sql-inventory.json` = (b) sqlMap layer 정리 (35 SQL id + 1 procedure)
- ★ K 정책 본격 가치 본격 입증: Java/sqlMap layer 만으로 cross-DB 4 자산 노출 ❌ → DB Function (fn_Get_CarUserListView) 안의 cross-DB ref 본격 발견

### 5.4 sub-rule §X-H sub-axis 본격 corroboration 사실

- R1' axis 4번째 사내 PoC corroboration (PoC #06+#07+#11+#17)
- sub-axis (AP detection / 16 AP) 자동화율 **81.25%** 본격 측정
- §X-H-11 신축 AP 본격 등재 (v1.2.0 / 2026-05-29)
- ★ ★ **본격 사실 누적**: canonical global baseline = sub-rule 사례 누적의 본격 anchor (paradigm-cross corroboration 자격 자산화)

## 6. 70~80% 한계 axis 정합

본 운영 모델은 **process cadence** 일 뿐 자동화율을 바꾸지 않는다. 각 scope 의 chain 1~5 gate 통과율 = chain harness 70~80% axis 그대로. analysis baseline 추출률 = §3-A axis 그대로. (운영 모델 = "언제 무엇을 재분석하나" 의 효율 규약 / axis metric 불변.)

## 7. 인용

- DEC-2026-05-21-chain-discovery-plan-stage-도입 (carry `C-v4.1-baseline-delta-운영-문서화` 모 결단)
- `methodology-spec/lifecycle-contract.md` §파일 위치 컨벤션 (scope 폴더 구조)
- ADR-010 (baseline + ratchet / quality baseline axis)
- `schemas/work-unit-manifest.schema.json` (`analysis_refs` 9 이식성 — 5 + DB 자산 4 / `sync_state` M4 / ★ v11.3.0)
- `tools/chain-driver` `sync` 명령 (markDrift + cascade)
- ★ `methodology-spec/db-assets-always-on.md` (DB 자산 always-on 정책 / v11.3.0)
- ★ `methodology-spec/sp-conversion-policy.md` (SP 4 분류 매트릭스 α/β/γ/δ / v11.3.0)
