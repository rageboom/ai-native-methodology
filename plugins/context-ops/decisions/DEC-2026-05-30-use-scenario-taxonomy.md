# DEC-2026-05-30-use-scenario-taxonomy

**결단**: 방법론의 **1순위 목적 = 산출물(=LLM 운영 컨텍스트)을 평생 유지·동기화하여 프로젝트를 AX 로 운영하는 것** 을 정체성으로 명문화 + **use-scenario taxonomy 4종(S2 AX전환 / S1 재생성 / S3 특성화 / greenfield)** 형식화. carry `C-use-scenario-taxonomy` (DEC-2026-05-30-fdogfood-003 §6) resolve. **본 release = 형식화 문서만** (설계 SSOT 확립 / 코드·스키마·greenfield 실제 빌드는 carry). v11.7.0 MINOR.

**작성일**: 2026-05-30 (session 55차 — `/clear` 후 사용자 방법론 정체성 재진술 chain).

**relates to**:

- `~/.claude/plans/cheeky-strolling-stearns.md` (본 설계 plan / 사용자 승인)
- `DEC-2026-05-30-fdogfood-003-intent-certainty.md` §3·§6 (F-007 use-scenario 재진단 + carry 등록처)
- `DEC-2026-05-30-codegraph-essential.md` (동반 결단 / codegraph 필수화)
- `methodology-spec/use-scenario-taxonomy.md` (본 결단 SSOT 명세)
- `methodology-spec/baseline-delta-operating-model.md` (동기화 운영 모델)

---

## 1. 배경 (사용자 진술 chain)

session 55차 `/clear` 직후 사용자가 방법론 정체성을 다단계로 재진술 (ExitPlanMode 거절 = 반복 교정 루프):

1. "분석은 두 가지를 위해서다 — ① 기존 프로젝트를 그대로 신규 스택 전환 ② 기존 프로젝트를 AX 로 전환. 산출물들은 AI 의 컨텍스트가 되는 형태다. 신규 프로젝트는 분석이 없을 수도 있다."
2. "신규는 분석이 없지만 산출물은 나와야 한다 — 그 산출물로 계속 개발·운영·수정해 나간다. 지속적으로 동기화되어야 하고, 그래서 dep-graph 와 codegraph 를 쓴다."
3. "산출물(컨텍스트)을 유지·동기화하는 **1순위 이유 = AX 로 프로젝트를 운영하기 위해 LLM 에 전달할 컨텍스트를 유지·관리하는 것. 이게 이 프로젝트의 가장 큰 목적 중 하나다.**"
4. "분석을 잘해야 하는 이유는 이 산출물이 **base** 가 되어 모든 일이 이루어지기 때문. 모든 단계에서 이 산출물을 이용한다. 기능 추가 등에 **동기화**되어야 한다."
5. "신규로 만들고 자연스럽게 AX 로 전환되는 거 맞지?" (확인)

→ 직전 DEC-2026-05-30-fdogfood-003 §3 이 F-DOGFOOD-007(brownfield RED)을 "use-scenario taxonomy 필요"로 carry 한 것의 **본격 형식화** trigger.

---

## 2. 결단 — 5 명제 (P0~P4) 정체성 + 4 시나리오

### 2.1 정체성 명제 (P0~P4)

| #      | 명제                                                                                                                                                                                                                   |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P0** | 방법론의 가장 큰 목적 중 하나 = **AX 운영을 위한 LLM 컨텍스트의 유지·동기화**. 산출물을 살아있게 유지하는 1순위 이유 = LLM 이 프로젝트를 지속 AI-네이티브하게 운영하도록 정확한 컨텍스트 공급.                         |
| P1     | 산출물 = "시스템 설명 문서"가 아니라 **LLM 의 운영 컨텍스트 그 자체**. 일회성 analysis 출력 ❌ / 전 생애 유지·동기화.                                                                                                  |
| P2     | **bootstrap 입력만 다르고 컨텍스트 유지는 동일.** legacy 코드 / greenfield(PRD·디자인·계약) 모두 같은 산출물 생성 → 같은 정상 상태 "AX 운영" 수렴. "분석 없음 = 산출물 없음" ❌.                                       |
| P3     | dep-graph(artifact↔artifact + artifact↔code) = 내부 동기화 SSOT / codegraph(code↔code) = **필수 도구** (→ DEC-2026-05-30-codegraph-essential).                                                                         |
| P4     | 산출물 = **모든 chain stage(discovery~implement)의 base + 양방향 루프** (① base 품질 = 전체 품질 결정 = 분석 잘해야 하는 이유 = 품질 1순위 근거 / ② 전 단계가 산출물 사용 / ③ 기능추가 → 산출물 역동기화 → base 최신). |

**용어**: "AX 운영(operation)" = 모든 시나리오가 도달하는 정상 상태(LLM 이 동기화 컨텍스트로 develop·run·modify·evolve) ≠ "AX전환(S2)" = legacy 를 AX 운영 모드로 전환하는 _행위_.

### 2.2 use-scenario taxonomy 4종 ( 주 타깃 = S2)

| 시나리오                                    | 입력(bootstrap)                 | analysis 패스                                 | intent_certainty 강조                      | chain 4 RED / chain 5 GREEN                                                                          |
| ------------------------------------------- | ------------------------------- | --------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| **S2 AX전환** (in-place 증강) **= 주 타깃** | legacy 코드 + 의도              | 리버스 엔지니어링 + characterization                | **verified intent** (버릴 것/바꿀 것 판단) | characterization GREEN(기존) + 증강분 RED→GREEN(신규)                                                |
| **S1 재생성** (forward / 신규 스택)         | legacy 코드                     | 리버스 엔지니어링 + 입력어댑터                      | **observed** (행동 보존)                   | RED=생성될 코드 부재 / GREEN=생성 코드 통과 (test 대상=생성될 코드, legacy 아님 ← F-007 오관측 교정) |
| **S3 특성화** (문서/스냅샷만)               | legacy 코드                     | 리버스 엔지니어링                                   | observed (스냅샷)                          | 기존 동작 snapshot GREEN (재생성 없음)                                                               |
| **greenfield** (신규)                       | PRD / 디자인 / 계약 (코드 없음) | **입력어댑터 analysis 만** (리버스 엔지니어링 없음) | inferred/intent (설계 의도)                | S1 동형 (forward)                                                                                    |

** 주 타깃 = S2 확정 (사용자 결정)**: 방법론 정체성(P0 = 기존 프로젝트를 AX 로 운영)과 직결. enforcement·검증·예시·기본값 S2 우선 정렬. F-DOGFOOD-003 `intent_certainty` enum + codegraph(기존 코드 구조 파악) = S2 의 도구.

**greenfield lifecycle**: "전환"이 아니라 **처음부터 AX-native 로 태어남**. 빌드 과정에서 산출물이 나오는 것 자체가 AX 운영 진입(AX = 빌드 부산물). 전제 = 산출물 생성(gap B 해소).

### 2.3 시나리오 선언 위치 (확정)

`chain-driver init --scenario <S1|S2|S3|greenfield>` flag 로 입력 → **`work-unit-manifest.scenario` 에 저장** → analysis~implement 전 단계가 일관 참조 (discovery-spec 에 박지 ❌ — S2 가 주 타깃이라 analysis 단계부터 시나리오 인지 필요).

### 2.4 greenfield 산출물 생성 (gap B / 옵션 A 확정)

**gap B (실측)**: discovery 어댑터(swagger/figma/nl-md)는 discovery-spec 만 생성, 산출물 미생성. spec stage 는 산출물 hard-depend → greenfield 진입 막힘. lifecycle-contract `:129` "(b) 신규 PRD = carry K-1" 미구현.

**옵션 A 확정** = 기존 `analysis-from-{swagger,figma,plan-doc,prompt}` 재사용. greenfield = 리버스 엔지니어링 패스만 생략, 입력어댑터 analysis 로 산출물 생성. "analysis stage = 리버스 엔지니어링(legacy 전용) + 입력어댑터(공통)" 재프레이밍. 새 기계 발명 ❌ / 재배선 + 문서화.

---

## 3. 시행 (본 release = 형식화 문서만 / additive / breaking 0)

| 영역                                                           | 변경                                                                                          |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `decisions/DEC-2026-05-30-use-scenario-taxonomy.md`            | 본 file 신설 (SSOT)                                                                           |
| `decisions/DEC-2026-05-30-codegraph-essential.md`              | 동반 신설 (codegraph 필수화 / DEC-2026-05-27 supersede)                                       |
| `methodology-spec/use-scenario-taxonomy.md`                    | 4-case 매트릭스 + greenfield baseline 운영 + intent_certainty 매핑 + 선언 위치 SSOT 명세 신설 |
| `CLAUDE.md` + `lifecycle-contract.md` §가치명세                | INPUT "1차 = legacy single-case" → 4 시나리오 + P0~P4 정체성 서술 (additive)                  |
| `methodology-spec/plugin-charter.md`                           | R21 신설 (use-scenario 선택 + greenfield bootstrap + AX 운영 컨텍스트 동기화)                 |
| `decisions/DEC-2026-05-30-fdogfood-003-intent-certainty.md` §6 | carry `C-use-scenario-taxonomy` resolved 표기                                                 |
| `decisions/INDEX.md` + `CHANGELOG.md` + version 3-way          | release ceremony                                                                              |

**구현 carry (본 release 제외)**: ① `chain-driver init --scenario` flag + `work-unit-manifest.scenario` enum 스키마 ② greenfield 입력어댑터 재배선(옵션 A 실제 구현) ③ 시나리오별 RED/GREEN gate 매트릭스 enforcement. → §8.1 ≥2 corroboration(서로 다른 2 greenfield 입력 채널) + STOP-3 의무 (별도 세션).

---

## 4. STOP-3

- workspace test: 영향 0 (형식화 문서만 / 코드·스키마 무변경)
- release-readiness 22/22 ready (claude_md_version_sync 포함)
- skill-citation 0 stale
- version 3-way 11.7.0 (plugin.json / package.json / CHANGELOG)
- breaking 0 (additive paradigm 형식화 + R21 신설) = MINOR

---

## 5. Lessons Learned

### LL-usc-01 — 정체성 진술은 사용자만 줄 수 있다 (반복 교정 루프 = 정상)

방법론 "가장 큰 목적"(P0) 같은 정체성 명제는 코드/문서에서 추론 불가 — 사용자 진술에서만 나온다. ExitPlanMode 5회 거절 = 사용자가 plan-review 루프를 _정체성 정밀화_ 수단으로 사용 = 함정 아니라 정상 paradigm. 매 교정을 plan 에 즉시 반영 후 재제시.

### LL-usc-02 — gap 발견의 prod 가치 = self-referential drift 아님

greenfield 진입 불가(gap B)는 외부 사용자 발화로 트리거된 **실제 capability 결손** (greenfield 사용자는 방법론을 못 씀). self-referential corrective drift(memory)와 구별 — 단, **설계까지만 시행 + 구현은 §8.1 corroboration 후** (DEC-2026-05-30 LL-fdogfood-003-02 "자격 ≠ 설계" 정합 / 성급한 paradigm 코드 변경 회피).

### LL-usc-03 — analysis = 입력 의존, 코드 의존 아님 (재프레이밍)

"analysis stage" 가 legacy **코드**를 요구한다는 가정이 greenfield 를 막던 근본 원인. 실제 = analysis 는 **입력**(코드/PRD/디자인/계약)을 요구. `analysis-from-*` 어댑터가 이미 코드 무관 산출 가능 = gap B 가 "발명"이 아니라 "재배선"인 이유.

---

## 6. carry

- `C-use-scenario-taxonomy-impl` — **Slice 1 RESOLVED (2026-05-30) by [DEC-2026-05-30-use-scenario-impl-slice1](DEC-2026-05-30-use-scenario-impl-slice1.md)** (v11.9.0 / 시나리오 선언 plumbing manifest.scenario + chain-driver init --scenario + scenario-aware gate matrix = F-007 구조 해소). 잔여: **`C-use-scenario-greenfield-bootstrap`** (greenfield 옵션 A 재배선 + planning→output elevation / §8.1 ≥2 입력 채널) + **`C-use-scenario-s2-gate`** (S2 characterization+augmentation 분리 gate).
- `C-honesty-tool-cleanup` — CLAUDE.md no-simulation 절의 실행불가 도구(SpotBugs/Daikon) 정직 cleanup (별도 / DEC-2026-05-30-codegraph-essential 와 합치).

## 7. 한 줄 결론

> 방법론의 가장 큰 목적 = 산출물(=LLM 운영 컨텍스트)을 평생 유지·동기화하여 프로젝트를 AX 로 운영하는 것. analysis(legacy)·greenfield 모두 같은 산출물 → 같은 AX 운영 수렴. 주 타깃 = S2. greenfield 는 입력어댑터 재사용(옵션 A)으로 산출물 생성. **본 release = 형식화 SSOT 만 / 구현 carry**. v11.7.0 MINOR.
