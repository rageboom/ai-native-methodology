# Plan D — Phase ID 의미 ID Rename (v3.0 MAJOR / D-3 paradigm)

> 2026-05-14 / 사용자 결정: 숫자 phase ID (0/1/2/3/4/4.5/4.7/4.8/5-1/5-2/6) → 의미 ID. order 필드 없이 `depends_on` 그래프만 SSOT. 추가/제거 시 해당 phase의 depends_on만 손대면 끝 / 순서는 위상정렬로 자동 도출.

> **scope**: `flows/analysis.phase-flow.json` 한정. chain stage 4(planning/spec/test/implement)의 phase ID `P1.0~P3.6` 같은 숫자 paradigm은 별개 carry로 분리 (§10).

## 1. paradigm 결정

- `id` = 의미 ID (예: `business-logic`, `formal-spec`)
- `order` 필드 부재 — 순서는 `depends_on` 그래프 → 위상정렬로 도출
- 같은 레벨 노드는 병렬 (현재 phase 4 `parallel_areas` 패턴과 동일)
- alias map ❌ / 즉시 cutover (v2.6.0 skill rename paradigm 정합)
- v3.0 MAJOR — v2.x add only window 마감

## 2. phase ID 매핑 (11)

| 현재 | 새 ID | depends_on |
|---|---|---|
| 0 | `input` | [] |
| 1 | `discovery` (★ AWS MAP / Gartner TIME 산업 표준 / sql-inventory와 axis 분리) | [input] |
| 2 | `db-schema` (★ skill `analysis-db-schema-erd`와 정합 / JSON Schema axis와 분리) | [discovery] |
| 3 | `architecture` (★ skill `analysis-architecture` 풀네임 정합 / 다른 풀네임 phase 톤 일관) | [discovery, db-schema] |
| 4 | `business-logic` | [discovery, db-schema, architecture] |
| 4.5 | `formal-spec` | [business-logic] |
| 4.7 | `characterization` | [business-logic, formal-spec] |
| 4.8 | `sql-inventory` | [discovery, business-logic, characterization] |
| 5-1 | `api` | [business-logic, formal-spec, characterization, sql-inventory] |
| 5-2 | `ui` | [architecture, business-logic, characterization] |
| 6 | `quality` | [business-logic, formal-spec, api, ui] |

## 3. workflow file rename (11)

```
phase-0-input.md              → input.md
phase-1-init.md               → discovery.md
phase-2-db.md                 → db-schema.md
phase-3-arch.md               → architecture.md
phase-4-business-logic.md     → business-logic.md
phase-4-5-formal-spec.md      → formal-spec.md
phase-4-7-characterization.md → characterization.md
phase-4-8-sql-inventory.md    → sql-inventory.md
phase-5-1-api.md              → api.md
phase-5-2-ui.md               → ui.md
phase-6-quality.md            → quality.md
```

## 4. 영향 범위 (총 296 file → 갱신 의무 ~60)

★ Senior critique STOP-1 흡수 — `schemas/finding-system.schema.json` 추가 (phase 필드 `integer + enum["4.5"]` → 새 의미 ID enum). PoC 산출물 안 finding 레코드 phase 값(숫자)도 일괄 sed로 갱신 (사내 배포 전 / 실 사용자 0 / 옛 데이터 호환 의무 ❌).


| 영역 | file | 처분 |
|---|---|---|
| **plugin 본체 (갱신 의무)** | **~59** | ★ |
| workflow rename | 11 | git mv + 본문 phase-N 인용 갱신 |
| flows manifest (analysis + sdlc-4stage) | 2 | id/depends_on/spec_file 갱신 |
| skills 본문 | 15 | phase-N 인용 → 의미 ID |
| tools 코드 | 13 | phase ID 매칭 로직 갱신 |
| schemas (phase_id enum 등) | 8 | enum 값 갱신 |
| templates | 6 | 본문 갱신 |
| methodology-spec 본문 (deliverables/sub-rules/skills-axis 등) | 11 | 본문 갱신 |
| guides + CHANGELOG + root | 5 | 본문 갱신 |
| **역사 자료 (보존)** | **68** | ❌ |
| docs/adr | 14 | 그 시점 사실 보존 |
| decisions | 53 | 그 시점 사실 보존 |
| CHANGELOG-HISTORY | 1 | 역사 axis |
| **PoC 산출물 axis (보존)** | **169** | ❌ — 본문 인용만 그 PoC 시점 사실 / output 디렉토리는 이미 의미 ID 기반 |

## 5. drift-validator 신규 의무

- 위상정렬 함수 추가 (depends_on 그래프 → ordered list)
- 순환 의존 검출 (cyclic = breaking)
- 3-way 검증 갱신: manifest `id` ↔ workflow `<id>.md` ↔ skills `analysis-<id>` (★ 단 skill 의미 ID와 phase 의미 ID는 별도 axis — 정합 강제 ❌ / skills-axis.md §2.2 정합)
- test 신규 ~5건 (위상정렬 / 순환 검출 / 새 file 명 검증)

## 6. chain-driver + 기타 도구 영향

- chain-driver `state-store.js` `current_phase` 표기 = **`P0.0` → `input.0`** (★ Senior STOP-2 흡수 / P 접두사 폐기 / 사내 배포 전이라 migration 코드 ❌ / 실 사용자 환경 잔존 state.json ❌)
- spec-test-link-validator / chain-coverage-validator / planning-extraction-validator: phase ID 인용 영역 grep으로 확인
- 5종 물증 if/then (meta-confidence.schema.json): `phase_id` enum 갱신
- ★ drift-validator `check-phase-skills.js` 안 `ANALYSIS_PREFIX = 'analysis-'` 하드코딩 범위 확인 (★ REVISE-2 흡수 / 역방향 고아 검증 prefix 영역)

## 7. Sprint 분할 (한 session × 5 권장)

| Sprint | 영역 | 산출물 |
|---|---|---|
| **S1** | plan 확정 + Senior critique | 본 plan 갱신 + 흡수 |
| **S2** | manifest + workflow rename + drift-validator 위상정렬 | flows/analysis.phase-flow.json + 11 file rename + drift-validator test +5 |
| **S3** | plugin 본체 갱신 (~59 file) | skills 15 + tools 13 + schemas 8 + templates 6 + methodology-spec 11 + 기타 6 |
| **S4** | 검증 (drift 3-way + workspace test + release-readiness 9/9) | 322/0 pass + 9/9 pass + 0 orphan |
| **S5** | ADR-CHAIN-012 신설 + CHANGELOG v3.0.0 entry + version bump + commit + tag | release commit + origin push |

★ 한 session에 다 끝낼 가능성 ❌ — S2~S3가 무거움.

## 8. 검증 기준

- drift-validator 3-way: 22 skills / 0 orphan 보존
- workspace test 322/0 보존 (drift +5 신규 = 327/0)
- release-readiness 9/9 보존
- 위상정렬 결과 = 현재 의존 그래프와 동일 순서 + lexicographic tiebreak 적용 (★ CAUTION-1 흡수 / api/ui 동일 레벨 결정론)
- PoC 11개 산출물 호환 — output 디렉토리는 의미 ID 기반이라 자연 호환 / finding 레코드 phase 필드는 일괄 sed로 의미 ID 갱신 (★ 실 사용자 0 환경 / 옛 데이터 호환 의무 ❌)
- `sdlc-4stage-flow.json` 의 `sub_flow` 안 analysis phase ID 문자열 인용 영역 갱신 확인 (★ CAUTION-2 흡수)
- drift-validator test fixture 안 숫자 phase ID 하드코딩 일괄 갱신 (★ CAUTION-3 흡수)

## 9. Senior critique 후보 STOP

- (a) 의미 ID 중복 우려 — `formal-spec` 이 schema name `formal-spec.schema.json`과 충돌? → 단 namespace 다름 (manifest phase ID vs schema file 명) / OK
- (b) 위상정렬 ambiguity — `api`/`ui` 같은 레벨 → 병렬 의도이므로 OK (현재 phase 4 `parallel_areas`와 동일 paradigm)
- (c) drift-validator 신규 검증 비용 — test +5 / 영향 ❌
- (d) PoC 시점 사실 인용 영역 — 본문 안 "phase 4.5에서 검출" 인용이 PoC ledger에 있다면 그건 그 시점 사실 / 보존

## 10. carry / 추후

- v3.0 MAJOR window 진입 — 본 paradigm 직후 다른 breaking change 묶음 가능 (예: skills-axis 정합 미세 / deliverables 영역 등)
- alias map ❌ paradigm 정합 (v2.6.0 결정 sibling)
- ★ **chain stage 4 phase ID 의미 ID rename carry** — planning.phase-flow.json (P1.0~P1.3) / spec.phase-flow.json (P2.0~P2.5) / test.phase-flow.json (P3.0~P3.6) / implement.phase-flow.json (P4.0~?) 모두 본 paradigm 문제 동일. 별개 plan 영역 (본 plan 종결 후 진행).

## 11. 사용자 결정 (2026-05-15 확정)

- ✅ Q1: phase ID 매핑 확정 — 11개 모두 (변경 3건: `inventory→discovery` / `db→db-schema` / `arch→architecture` / 나머지 8건 plan 초안 그대로)
- ✅ Q2: Sprint 분할 — 5 session 권장 (S1~S5)
- ✅ Q3: alias map ❌ / 즉시 cutover (v2.6.0 paradigm 정합)
- ✅ Q4: v3.0.0 MAJOR (v2.6.0 → v3.0.0 / v2.0 chain harness 이래 누적 paradigm 분기점)
- ✅ STOP-1 흡수 (b' 변형): finding-system.schema.json 새 enum 갱신 + PoC finding 일괄 sed (사내 배포 전 / 실 사용자 0 사실 정합 — memory `project_pre_deployment_stage.md`)
- ✅ STOP-2 흡수 (b): `P0.0` → `input.0` / `P` 접두사 폐기 / migration 코드 ❌
- ✅ REVISE-1~4 plan §4·§5·§6·§8 본문 반영
- ✅ CAUTION-1~4 §8 + Sprint 진행 중 관찰 영역으로 흡수

---

## 다음 step (사용자 결정 후)

1. Q1~Q4 답 받기
2. S1 — Senior critique sub-agent 1회 (가벼운 sub-agent / Sonnet 4.6 / 20분 cap)
3. S2 진입
