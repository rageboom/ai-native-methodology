# Use-Scenario Taxonomy (S2 AX전환 / S1 재생성 / S3 특성화 / greenfield)

> **사상**: 산출물 = LLM 의 운영 컨텍스트 그 자체. 방법론의 가장 큰 목적 중 하나 = 이 컨텍스트를 평생 유지·동기화하여 프로젝트를 **AX 로 운영**하는 것. 4 시나리오는 bootstrap 입력에서만 갈리고 모두 같은 정상 상태(AX 운영)로 수렴한다.
> **trigger**: session 55차 사용자 정체성 재진술 (2026-05-30) — "산출물 동기화의 1순위 이유 = AX 운영 컨텍스트 유지" + F-DOGFOOD-007 use-scenario 재진단.
> **관련**: `../decisions/DEC-2026-05-30-use-scenario-taxonomy.md` (SSOT 결단) · `../decisions/DEC-2026-05-30-fdogfood-003-intent-certainty.md` §3 · `baseline-delta-operating-model.md` · `db-assets-always-on.md` · `lifecycle-contract.md` §가치명세.

## 1. 정체성 명제 (P0~P4)

| # | 명제 |
|---|---|
| **P0** | 방법론의 가장 큰 목적 중 하나 = **AX 운영을 위한 LLM 컨텍스트의 유지·동기화**. |
| P1 | 산출물 = "시스템 설명 문서"가 아니라 **LLM 의 운영 컨텍스트 그 자체** (전 생애 유지·동기화). |
| P2 | **bootstrap 입력만 다르고 컨텍스트 유지는 동일** — 모든 시나리오가 같은 정상 상태(AX 운영)로 수렴. |
| P3 | dep-graph(artifact↔artifact + artifact↔code) = 내부 동기화 SSOT / codegraph(code↔code) = **필수 도구** (`../decisions/DEC-2026-05-30-codegraph-essential.md`). |
| P4 | 산출물 = **모든 chain stage 의 base + 양방향 루프** (base 품질 = 전체 품질 / 전 단계 사용 / 기능추가 → 역동기화). |

**용어 구분**: **AX 운영(operation)** = 모든 시나리오가 도달하는 정상 상태(LLM 이 동기화 컨텍스트로 프로젝트를 굴림) ≠ **AX전환(S2)** = legacy 를 AX 운영 모드로 전환하는 *행위*.

## 2. 4 시나리오 매트릭스 (★ 주 타깃 = S2)

| 시나리오 | 입력(bootstrap) | analysis 패스 | intent_certainty 강조 | chain 4 RED / chain 5 GREEN |
|---|---|---|---|---|
| ★ **S2 AX전환** (in-place 증강) **= 주 타깃** | legacy 코드 + 의도 | 코드-고고학 + characterization | **verified intent** | characterization GREEN(기존) + 증강분 RED→GREEN(신규) |
| **S1 재생성** (forward / 신규 스택) | legacy 코드 | 코드-고고학 + 입력어댑터 | **observed** | RED=생성될 코드 부재 / GREEN=생성 코드 통과. **test 대상 = 생성될 코드(legacy 아님)** |
| **S3 특성화** (문서/스냅샷만) | legacy 코드 | 코드-고고학 | observed | 기존 동작 snapshot GREEN (재생성 없음) |
| **greenfield** (신규) | PRD / 디자인 / 계약 (코드 없음) | **입력어댑터 analysis 만** | inferred/intent | S1 동형 (forward) |

### 2.1 주 타깃 = S2 함의
S2 는 기존 코드를 in-place 로 살린다 → **characterization(기존 동작 포착) + verified intent(왜 존재하나)** 가 핵심. `intent_certainty` enum (F-DOGFOOD-003) 과 codegraph(기존 코드 구조 파악) = S2 의 도구. enforcement·검증·예시·기본값 = S2 우선 정렬.

### 2.2 F-DOGFOOD-007 교정
F-007(brownfield RED)은 S1/S2/S3 를 뭉갬. 단순 "brownfield=GREEN" 패치는 S1 을 틀리게 만듦 (S1 의 test 대상 = legacy 가 아니라 생성될 코드). 올바른 fix = **시나리오 선언 → 시나리오별 RED/GREEN 매트릭스** (본 표).

## 3. greenfield = 처음부터 AX-native

greenfield 은 "전환(convert)"이 아니라 **처음부터 AX-native 로 태어남**. 바꿀 legacy 가 없으므로 별도 전환 단계 없이, 방법론으로 빌드하는 과정에서 **산출물이 나오는 것 자체가 AX 운영 진입** (AX = 빌드 부산물). 전제 = **산출물이 반드시 나와야 함**.

### 3.1 greenfield 산출물 생성 (gap B / 옵션 A)
- **문제**: discovery 어댑터(swagger/figma/nl-md)는 discovery-spec 만 생성, 7대 산출물 미생성. spec stage 는 7대 hard-depend → greenfield 진입 막힘.
- **옵션 A (확정)**: 기존 `analysis-from-{swagger,figma,plan-doc,prompt}` 재사용. greenfield = 코드-고고학 패스만 생략, 입력어댑터 analysis 로 산출물 생성.
- **재프레이밍**: "analysis stage" = 코드-고고학 패스(legacy 전용) + **입력어댑터 패스(공통)**. analysis 는 legacy *코드* 가 아니라 *입력* 을 요구한다.
- greenfield 에서 비는 산출물(legacy 전용 antipatterns / migration-cautions) = 빈/N-A 정당화 명시 (code_pointers_na 동형).

### 3.2 greenfield bootstrap 구체 절차 (★ v11.10.0 / Slice 2 구현)

진입점 = `analysis-greenfield-bootstrap` skill (analysis input phase 등록). scenario 선언(`chain-driver init --scenario greenfield`) 후:

1. **입력어댑터 패스** — `analysis-input-orchestrate` greenfield 분기 → BCDE 어댑터(`analysis-from-{prompt,swagger,plan-doc,figma}`)만 dispatch (코드-고고학 phase skip) → `.aimd/<scope>/planning/{...}-extract.json` + `input-summary.json`.
2. **결정적 산출 (swagger 채널 / testable)** — `tools/greenfield-bootstrap` (`node src/cli.js --output … --swagger-extract …`): swagger-extract → `openapi.yaml` 결정적 승격 (zero-dep block-YAML / AI 추론 0) + legacy-only 산출물 N/A (`antipatterns.json` 빈 배열 + `meta.na_reason` / `migration-cautions.md` stub). `antipatterns.schema.json` strict 정합 (na_reason 은 `meta` 안 embed — top-level additionalProperties:false 회피).
3. **AI code-optional 산출 (5종)** — 각 analysis skill 의 **greenfield code-optional mode** 로 입력어댑터 extract 에서 architecture/domain/business-rules/openapi/schema 생성 (`source_grounded_evidence` = 입력 출처 인용 / `code_pointers` = N/A).
4. **검증** — `schema-validator` 로 산출물 strict schema-valid 확인. 누락/합성-필요 → finding + carry 표기.

**자격/한계 (정직)**: 결정적 부분(elevation + N-A) = §8.1 ≥2 swagger fixture unit test + 1 실 swagger(RealWorld) dogfood (openapi-parser `valid:true`) 입증. AI code-optional mode = swagger 1채널 입증 / **figma·PRD 2nd 채널 dogfood = carry** (`C-use-scenario-greenfield-dogfood-2nd-channel`). DB schema 합성(domain entity→table) = carry (`C-use-scenario-greenfield-schema-synthesis`).

## 4. 시나리오 선언 위치

`chain-driver init --scenario <S1|S2|S3|greenfield>` flag 로 입력 → **`work-unit-manifest.scenario` 에 저장** → analysis~implement 전 단계가 manifest.scenario 일관 참조.

- discovery-spec 에 박지 ❌ (discovery 단계에서야 정해지면 그 앞 analysis 가 시나리오 모름).
- S2 가 주 타깃이라 analysis 단계부터 시나리오 인지 필요(코드-고고학 + characterization 강도 조절) → manifest 가 정답.

## 5. 구현 carry (본 명세 = 설계 SSOT / 코드는 별도 세션)

| carry | 내용 | 자격 게이트 |
|---|---|---|
| `C-use-scenario-taxonomy-impl` | ✅ **Slice 1 (v11.9.0)** = scenario 선언 plumbing + gate 매트릭스 / ✅ **Slice 2 (v11.10.0)** = greenfield 옵션 A 재배선 (`analysis-greenfield-bootstrap` + `tools/greenfield-bootstrap` elevation/N-A + 5 skill greenfield-mode) | — (Slice 1·2 RESOLVED) |
| `C-use-scenario-greenfield-dogfood-2nd-channel` | greenfield AI code-optional mode 의 figma/PRD 2nd 입력 채널 실 dogfood (§8.1 ≥2 완성 / 현 swagger 1채널) | 실 figma/PRD 입력 (Type 1.5 dogfood) |
| `C-use-scenario-greenfield-schema-synthesis` | PRD 에 ER/DDL 부재 시 domain entity→table schema 합성 (신규 synthesis) | domain.json entity 안착 + ≥1 실 PRD |
| `C-use-scenario-s2-gate` | ✅ **시행 (Track α v11.11.0 + execution corroboration v11.13.0 + augmentation GREEN v11.14.0)** = per_tc_outcome gate + `test_intent` enum + reconcileOutcomes/correlateByTcId 모듈. 1차(RealWorld reframe schema-valid + false-block 해소) + ✅ **2차 execution(v11.13.0 / DEC-2026-05-30-s2-exec-corroboration)** = 25 characterization 실측 GREEN + 1 augmentation 실측 RED + real gate blocked=false + 음성대조 WARN 탐지 (RISK-ENV-001 해소) + ✅ **augmentation GREEN round-trip(v11.14.0 / DEC-2026-05-30-s2-augmentation-green-roundtrip / carry ② RESOLVED)** = DELETE /user 5-file 슬라이스 구현 → 26 PASS → **drift 감지(impl>spec → `s2_outcome_mismatch` WARN) → 역동기화(expected fail→pass) → 해소** P4 round-trip 실측. + ✅ **WARN→block 격상(v11.33.0 / DEC-2026-06-01-s2-gate-block-upgrade / carry ① RESOLVED)** = §8.1 ≥2 distinct domain 충족(RealWorld Spring/JUnit + **ecommerce NestJS/Prisma/jest** 실 jest 56 char GREEN + refund augmentation RED + 실 gate harness 음성대조) → `s2_outcome_mismatch` HARD_BLOCK_CODES 등재 + rank 2→1 → 사용자 'go' 거부(hard-block). **잔여 = distinct 문제 도메인 3rd(현 blog+e-commerce=2 distinct / 충분)** | ✅ §8.1 ≥2 **distinct domain** 충족 (2/2 / RealWorld + ecommerce execution-grade) |
| `C-codegraph-essential-impl` | codegraph 실제 도구 wiring (`../decisions/DEC-2026-05-30-codegraph-essential.md`) | ✅ Slice 1 (v11.8.0) codegraph-runner / federation = 잔여 |

## 6. 한 줄 요약
> 4 시나리오(S2 주 타깃 / S1 / S3 / greenfield)는 bootstrap 입력만 다르고 모두 AX 운영으로 수렴. greenfield 도 입력어댑터 analysis 로 산출물을 만들어(옵션 A) 처음부터 AX-native. 시나리오는 `chain-driver init --scenario` → manifest 선언. 본 명세 = 설계 SSOT / 구현 carry.
