# DEC-2026-05-30-use-scenario-greenfield-bootstrap-slice2

**결단**: `C-use-scenario-taxonomy-impl` carry 의 **Slice 2 시행** — greenfield(신규 / legacy 코드 없음)가 7대 산출물을 실제로 생성해 chain 에 진입하게 만든다 (사용자 1차 want). 옵션 A(DEC-2026-05-30-use-scenario-taxonomy §2.4) = 기존 `analysis-from-*` 재사용 + "analysis 는 코드가 아니라 입력을 요구" 재프레이밍. **결정적 anchor(elevation/N-A 도구 + 29 test) + 5 skill greenfield-mode + 신규 진입 skill + 1 실 swagger dogfood**. v11.10.0 MINOR.

**작성일**: 2026-05-30 (새 session — `/clear` 후 "greenfield bootstrap Slice 2 이어서 진행").

**relates to**:

- `DEC-2026-05-30-use-scenario-impl-slice1.md` §3 (Slice 2 carry 출처)
- `DEC-2026-05-30-use-scenario-taxonomy.md` §2.4 (옵션 A 확정 / greenfield gap B)
- `~/.claude/plans/cheeky-strolling-stearns.md` (Slice 2 설계 plan / 사용자 승인)
- `methodology-spec/use-scenario-taxonomy.md` §3.2 (bootstrap 구체 절차 SSOT)

---

## 1. 배경

Slice 1(v11.9.0)은 시나리오 선언 plumbing + scenario-aware gate 로 F-DOGFOOD-007 을 구조 해소했다. 그러나 greenfield 사용자 1차 want — "신규도 산출물이 나와야 chain 으로 개발·운영" — 은 미해결 (gap B: discovery 어댑터는 discovery-spec 만 생성 / 7대 산출물 미생성 / spec stage 가 7대 hard-depend → greenfield 진입 막힘). 본 Slice 2 가 그 산출물 생성 경로를 구현.

** 이 슬라이스의 질적 차이 (정직)**: 7대 중 5종(architecture/domain/business-rules/openapi/schema)은 AI phase skill 이 _코드를 읽어_ 생성 → greenfield(코드 없음)는 이를 **code-optional mode(입력어댑터 extract 를 읽음)** 로 재배선 = **skill-instruction 주도** (unit-test 불가 / 실 dogfood 로만 검증). 결정적·testable 부분은 **openapi elevation + N-A 산출물** 뿐.

## 2. 시행 (additive / breaking 0)

| 영역                                                       | 변경                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools/greenfield-bootstrap/` (신규 / 24번째 / zero-dep)   | ① `src/yaml-emit.js` zero-dep block-YAML emitter (12 test) ② `src/elevate.js` swagger-extract→OpenAPI 3.x 결정적 승격 (14 test / AI 추론 0) ③ `src/na-artifacts.js` legacy-only 산출물 N/A (5 test) ④ `src/cli.js` (`--output [--swagger-extract] [--scope] [--channel]`). **29 test** (§8.1 ≥2 swagger fixture = minimal + RealWorld). root `package.json` workspaces 등록. |
| `schemas` 영향                                             | 없음 (기존 schema 그대로 / N-A 산출물은 `antipatterns.schema.json` strict 정합 — `na_reason` 을 **`meta`(additionalProperties:true) 안 embed** / top-level additionalProperties:false 회피).                                                                                                                                                                                 |
| 5 analysis skill                                           | `analysis-{architecture,domain-model,business-rules,db-schema-erd,openapi}` 에 " greenfield (code-optional) mode" 절 추가 (scenario=greenfield 시 입력어댑터 extract 에서 산출 / `source_grounded_evidence`=입력 출처 인용 / `code_pointers`=N/A).                                                                                                                           |
| `analysis-greenfield-bootstrap` (신규 skill / 57번째)      | greenfield 진입점 — 입력어댑터 패스(코드-고고학 skip) → 결정적 산출(elevation/N-A) → AI 5종 code-optional 산출 → 검증 조율. `flows/analysis.phase-flow.json` input phase 등록 (drift-validator orphan 0).                                                                                                                                                                    |
| `analysis-input-orchestrate` / `analysis-input-collection` | greenfield 분기(5단계) + greenfield redirect note.                                                                                                                                                                                                                                                                                                                           |
| doc                                                        | `lifecycle-contract.md` (analysis = 코드-고고학[legacy] + 입력어댑터[greenfield] 두 패스 / asset matrix input row) + `use-scenario-taxonomy.md` §3.2 + §5 carry 갱신.                                                                                                                                                                                                        |

### 2.1 elevation = 왜 결정적인가

swagger-extract 는 `analysis-from-swagger` 가 이미 파싱·정규화한 OpenAPI(endpoints × schemas) → 표준 OpenAPI paths/components 로 **재조립만** 하면 됨. AI 추론 0 → unit-test 가능 → §8.1 ≥2 fixture 로 결정적 입증.

### 2.2 backward-compat

모든 greenfield-mode 절은 `scenario == "greenfield"` 조건부 → scenario ≠ greenfield 시 무시 (legacy 코드 추출 경로 그대로 / 기존 818 test 무회귀).

## 3. 1 실 dogfood (no-simulation / Type 1.5)

RealWorld(Conduit) swagger-extract(3 endpoint / 5 schema) → `tools/greenfield-bootstrap`:

- `openapi.yaml` → `@readme/openapi-parser` 실 실행 = **valid:true / warnings:[]** (실 도구 / persona 시뮬레이션 ❌).
- `antipatterns.json` → `schema-validator` 실 실행 = **PASS** (antipatterns.schema.json / meta-embedded na_reason 정합 확인 = plan 의 top-level `code_pointers_na` 오설계 교정 입증).

**정직 표기**: swagger **1채널** dogfood. figma·PRD **2nd 채널 = carry** (§8.1 ≥2 미완 / AI code-optional mode 는 enabled 이나 ≥2 실 입력 검증 필요).

## 4. STOP-3

- workspace test 818 → **847 (+29)** ✅ (greenfield-bootstrap 29 / 기존 무회귀)
- release-readiness **22/22 ready** ✅ (workspace_test 847 / skill_citation 252 doc 0 stale / claude_md_version_sync / graph_integrity / 등)
- skill-citation **0 stale**
- version 3-way **11.10.0** (plugin.json / package.json / CHANGELOG)
- drift layout/chain-layout 0 orphan (신규 skill 등록 정합)
- breaking **0** (greenfield-mode 조건부 / N-A meta-embed / 기존 동작 보존) = MINOR

## 5. Lessons Learned

### LL-gf-slice2-01 — 결정적 anchor 로 skill-instruction 슬라이스를 testable 하게 묶기

greenfield 산출물 생성의 본질은 skill-instruction(unit-test 불가). 그러나 그 중 **이미 파싱된 입력의 결정적 변환**(swagger-extract→openapi.yaml elevation + N-A)을 분리해 도구로 만들면 §8.1 ≥2 fixture + 실 dogfood 로 release 검증 anchor 를 확보 — "AI 주도라 검증 불가"를 회피하는 정공법.

### LL-gf-slice2-02 — schema additionalProperties:false 가 N-A 표현을 강제한다

plan 의 `{antipatterns:[], code_pointers_na:true}` 는 `antipatterns.schema.json` top-level `additionalProperties:false` 에 걸려 **schema-invalid**. 실제 검증(schema-validator)으로 사전 발견 → N-A 사유를 `meta`(additionalProperties:true) 안에 embed 하는 것이 유일한 schema-valid 경로. **설계 plan 의 산출물 shape 은 실 schema 로 사전 검증해야 한다** (LL-fsim-11 정합).

### LL-gf-slice2-03 — 중첩 작업 디렉토리 절대경로 함정

파일 도구의 cwd(git root)와 Bash cwd(중첩 workspace `ai-native-methodology/ai-native-methodology`)가 달라, 첫 Write 가 단일 경로(git-root level)에 stray 생성. **절대경로는 doubled workspace 경로로 통일** + Bash `git rev-parse --show-toplevel`/`pwd` 로 ground truth 확정 후 진행. 산출물 위치 사전 검증 의무.

## 6. carry

- `C-use-scenario-greenfield-dogfood-2nd-channel` — figma/PRD 2nd 입력 채널 실 dogfood (§8.1 ≥2 완성).
- `C-use-scenario-greenfield-schema-synthesis` — PRD ER/DDL 부재 시 domain entity→table schema 합성 (신규 synthesis).
- `C-use-scenario-s2-gate` — S2 characterization GREEN + augmentation RED 분리 gate (Slice 1 잔여).
- (별건 / 본 작업 무관) `poc-findings.md` analysis.phase-flow drift 4건 — `drift-validator flows` directory mode 에서 pre-existing breaking (HEAD 에 이미 존재 / release-readiness 비gate). 차기 정리 후보.

## 7. 한 줄 결론

> greenfield 도 입력어댑터 analysis(옵션 A)로 7대 산출물을 만들어 chain 진입 = 처음부터 AX-native. 결정적 anchor(swagger-extract→openapi.yaml elevation + N-A / 29 test + RealWorld dogfood valid:true) + 5 skill greenfield-mode + 신규 진입 skill. swagger 1채널 입증 / 2nd 채널 carry. v11.10.0 MINOR / 847 test / 22/22.
