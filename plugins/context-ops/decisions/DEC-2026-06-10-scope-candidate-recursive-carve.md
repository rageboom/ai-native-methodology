# DEC-2026-06-10-scope-candidate-recursive-carve

- **결정**: scope candidate 도 거칠 수 있다 — coarse-to-fine **재귀 carve** 규칙 codify (ADR-CHAIN-016 규칙 4)
- **시각**: 2026-06-10
- **버전**: plugin.json 0.28.0 → 0.29.0 MINOR (additive / advisory / gate·trust·schema 무영향)
- **트리거**: ep-be-gea dogfooding — reservation scope 적용 중 발견 (F12)

## 배경 (갭)

측정 기반 scope 도출(ADR-CHAIN-016 / 패키지경로≠경계, coupling=경계)은 codified 됐으나, **측정으로 도출한 scope candidate 가 여전히 거칠 수 있다**(한 candidate 의 members 가 복수 독립 응집 sub-unit 클러스터)는 점 + 그때 **재귀로 더 잘게 carve** 한다는 절차가 본체에 명시 없었다.

**diagnose-before-design 실측**:
- `under_decomposition` 신호는 존재하나 **discovery 단계 UC/entity<1.5 축**(scope 내 UC 분해 / `discovery-decompose-use-cases`)이지, **inventory/carve 단계 scope-자체-거칠음** 축이 아니었다 = 별개 축, 미커버.
- ADR-CHAIN-016 은 "큰 모듈 ≠ scope"는 다루나 "측정 도출 candidate 가 거칠 수 있다 → 재분해"는 명시 없음.
- 따라서 F12 = 진짜 델타(중복 아님).

## 실증 (ep-be-gea / 1-PoC)

- scope-carve 의 'reservation' candidate(codegraph member `resve`) = 실제 **494 java / 6 하위 예약도메인**(golf·healing·helium·mtrm·athrt·base) 클러스터.
- carve 의 `under_decomposition`(UC/entity<1.5) 신호가 실데이터로 입증됨.
- golf 만 떼니 응집 BC(90 파일)로 깨끗이 분석 → "scope = 명목 BC 아닌 측정 응집 단위" 재확인 + 한 번의 coupling 집계가 최종 단위를 항상 주지 않음(coarse-to-fine).

## 결정 내용

ADR-CHAIN-016 에 **규칙 4 (scope 후보 coarseness → 재귀 carve)** 추가:
- candidate members 가 복수 독립 응집 sub-unit 이면 측정 단계([1]~[3]) 재적용해 재-carve 후 절단.
- 거칠음 신호(advisory): ⓐ members 다수 독립 하위 트리 ⓑ 내부 coupling 약하게 분절(SCC 재분할) ⓒ 후행 — scope 진입 후 `discovery.uc.under_decomposition` 발화.
- **advisory / reference-lens** — 재분해 절단은 사용자 soft gate #0 (자동 재분해·slug 생성 ❌ / ADR-CHAIN-016 규칙 2 동형).

**operationalize**: ADR-CHAIN-016 §결정 규칙 4 + §적용절차 [3] 하위 + `analysis-source-inventory` §4 coarseness 재점검 단계.

## §8.1 단일 PoC 과적합 회피

- **규칙(coarse-to-fine 재귀 carve)** = paradigm-grounded codify (measured-coupling 재귀 + 기존 under_decomposition 신호의 scope-level 확장 / coarse-to-fine = 계층적 클러스터링 표준 형태).
- **정량치("몇 파일/몇 sub-tree = 거침" 임계)** = ep-be-gea reservation(6 sub-domain) **1-PoC carry** / 미주장 / ≥2 distinct 도메인 corroboration 후 확정.

## canonical global 누적 모델 정합

이번 dogfood 에서 reservation→golf 재분해 후 BC-RESV-GOLF 를 canonical global 에 누적 — `baseline-delta-operating-model.md`(분석 1회 누적 / scope=canonical full 참조·사본 ❌ / 슬라이싱=drift BC-hash·validation scope-token / DEC-2026-06-07-subset-retire + DEC-2026-06-10-subset-slicing-corollary-supersede) 와 정합. 실측: 단일 canonical(42 BR/24 domain) → 교차오염 0·합집합=전체.

## 변경 범위

- docs/adr/ADR-CHAIN-016 (규칙 4 + 적용절차 + Consequences + 인용)
- skills/analysis-source-inventory (§4 coarseness 재점검 단계)
- decisions/INDEX.md + STATUS.md + CHANGELOG.md + plugin.json/package.json(0.29.0) + CLAUDE.md 현재 마커
- 코드/schema/도구/test 무변경 (advisory 규칙 / 검증 표면 불변)

## 관련

- ADR-CHAIN-016 (measured-coupling-scope-derivation / 모)
- DEC-2026-06-10-backbone-first-shared-kernel-factoring + DEC-2026-06-10-scope-carve-promotion + DEC-2026-06-09-measured-coupling-scope-derivation
- baseline-delta-operating-model.md + DEC-2026-06-07-subset-retire (누적·필터 모델)
- memory: feedback_diagnose_before_design_check_existing / feedback_quality_priority(§8.1) / project_epbegea_dogfooding
