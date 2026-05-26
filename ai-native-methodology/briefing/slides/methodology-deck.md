---
marp: true
title: AI-Native 개발 방법론 — 종합 장표
description: 목적 · 방향 · 흐름 · 플로우 · 종단/횡단 관심사
author: AI-Native Methodology TF
paginate: true
size: 16:9
theme: default
style: |
  section {
    font-size: 24px;
    font-family: "Pretendard", "Malgun Gothic", -apple-system, sans-serif;
  }
  section.lead {
    background: linear-gradient(135deg, #0d3b66 0%, #1565c0 100%);
    color: #fff;
    text-align: center;
    justify-content: center;
  }
  section.lead h1 { font-size: 52px; color: #fff; }
  section.lead h2 { color: #cfe8ff; font-weight: 400; }
  section.divider {
    background: #0d3b66;
    color: #fff;
    justify-content: center;
  }
  section.divider h1 { color: #fff; font-size: 46px; border: none; }
  section.divider h2 { color: #8ec5ff; font-weight: 400; }
  h1 { color: #0d3b66; border-bottom: 3px solid #1565c0; padding-bottom: 6px; }
  h2 { color: #1565c0; }
  table { font-size: 20px; }
  code { background: #eef3f8; }
  pre { font-size: 16px; line-height: 1.35; }
  strong { color: #c2410c; }
  blockquote { border-left: 5px solid #1565c0; color: #334155; background:#f1f6fb; }
  footer { color: #7088a0; font-size: 14px; }
footer: "AI-Native 개발 방법론 · v8.2.0 (2026-05-17)"
---

<!-- _class: lead -->
<!-- _paginate: false -->

# AI-Native 개발 방법론

## 목적 · 방향 · 흐름 · 플로우 · 종단/횡단 관심사

레거시를 새 시스템으로 — AI 자동화 ≥ 85% · 사람 게이트 ≤ 15%

`v8.2.0` · 2026-05-17 · 사내 표준 / Claude Code 플러그인

---

## 한 장 요약 (Executive Summary)

| 질문 | 답 |
|---|---|
| **무엇인가** | 레거시 코드베이스를 분석 → 발견 → 명세 → 계획 → 테스트 → 구현으로 **잇는 사내 표준 방법론 + Claude Code 플러그인** |
| **왜 필요한가** | "그냥 AI" 는 들쭉날쭉 · 100% 자동화는 환각/누락 · 사람이 다 보면 AI 의미 없음 → **그 딜레마 해소** |
| **어떻게** | SDLC 6-stage **chain harness** + **5개 사람 게이트** (chain N = gate #N) + 14개 PoC 로 입증된 **검증 도구 17종** |
| **얼마나 자동화** | chain harness **70~80%** (AI ≥85% / 사람 게이트 ≤15%) · analysis 추출 **별도 axis** |
| **현 상태** | v8.2.0 / workspace test **395** · release-readiness **13/13** · charter 활성요구 **16/16** |

> 핵심 원칙: **품질 1순위 · 재작업 최소화 2순위.** 속도/quick-win 은 후순위.

---

<!-- _class: divider -->
<!-- _paginate: false -->

# 1. 목적 — 왜 만들었나

## The Why

---

## 풀려는 딜레마

사내에 오래된 시스템이 있다. 새로 다시 짓기로 했다. 여기에 AI를 투입하고 싶다.

```
 ┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
 │  "그냥 AI한테 물어봐" │   │   100% 완전 자동화    │   │  사람이 전부 검토     │
 ├────────────────────┤   ├────────────────────┤   ├────────────────────┤
 │ 결과가 들쭉날쭉       │   │ 환각(hallucination)  │   │  AI 쓰는 의미가       │
 │ 재현성 없음          │   │ + 누락(omission)     │   │  사라짐 (느림/비용)    │
 └────────────────────┘   └────────────────────┘   └────────────────────┘
          ✗                        ✗                         ✗
```

**셋 다 답이 아니다.** → 구조화된 자동화 + 소수의 사람 결정 지점이 필요하다.

---

## 한 줄 정의

> **이 프로젝트는 "레거시 → 새 시스템" 을 AI로 짓되,
> 환각·누락을 구조적으로 차단하고 사람은 4번만 결정하는
> 사내 표준 방법론이며, 누구나 받아 쓰는 Claude Code 플러그인이다.**

- **방법론** = 텍스트 명세 + JSON Schema + 검증 도구로 못 박은 표준
- **플러그인** = 동료가 자기 프로젝트에서 자연어 한 마디로 깨우는 배포물
- **입증** = 14개 실제 PoC 로 작동을 실측 (단일 PoC 과적합 회피 규칙 강제)

---

## 절대 우선순위 — 흔들리지 않는 기준

| 순위 | 원칙 | 의미 |
|---|---|---|
| **1순위** | **품질** | 정확성·안전성이 최우선. 타협 대상 아님 |
| **2순위** | **재작업 최소화** | 한 번에 제대로 → 되돌림 비용 회피 |
| 후순위 | 속도 / quick-win / 컨텍스트 신선도 | 위 둘을 해치지 않는 선에서만 |

격상·처분·순서 결정 시 → **§8.1 단일 PoC 과적합 회피** 강제 적용
(PoC 1개에서만 보인 패턴은 본체 등재 ❌ — 최소 2개 PoC 재현 의무)

---

<!-- _class: divider -->
<!-- _paginate: false -->

# 2. 방향 — 무엇을 약속하나

## 가치 명세 · 자동화 두 축 · 한계

---

## 가치 명세 (Value Spec)

```
INPUT  : 레거시 코드베이스  (1차 = single-case)
   │
   ▼  ── analysis stage (chain 진입 전 자산 / 단방향 추출)
   │
OUTPUT chain (★ v2.0 i-strict / ★ v9.0 6-stage) :
   [CHAIN 1] planning-spec (discovery stage)             ── go/stop gate #1
   [CHAIN 2] behavior-spec + acceptance-criteria + 7대 산출물 통합 ── gate #2
   [CHAIN 3] plan-spec (task 분해 / ADR / NFR / risk) ── gate #3
   [CHAIN 4] test-spec + 실 test 코드 (RED 의무)         ── gate #4
   [CHAIN 5] impl-spec + 실 impl 코드 (GREEN / 100% pass) ── gate #5
   │
   ▼
USE    : AI 자동 생성 + 사람 검토 / prod 시스템 + traceability-matrix
```

레거시 한 덩어리가 → **추적 가능한 명세 + 통과하는 테스트 + 동작하는 구현**으로.

---

## 자동화는 "한 숫자" 가 아니다 — 두 개의 별도 축

> ⚠️ 외부 인용 시 **두 축 혼동 금지** — 분모(metric 기준)가 다르다.

| 축 | 측정 대상 | 천장 | 입증 |
|---|---|---|---|
| **Chain harness 축** | chain 1~4 통합 게이트 통과율 | **70~80%** (AI ≥85% / 사람 ≤15%) | sub-plan-6 / ≥2 PoC |
| **Analysis §3-A 축** | analysis 단방향 추출률 | Legacy: **~53~55%** / Modern: **~60~67%** | Legacy 3 사내 PoC · Modern 3 OSS PoC |

- **100% 자동화는 명시적으로 거부** — 환각/누락 비용 > 자동화 이득
- 외부 권위 정합: Wang ICSE 2025 · LongCodeBench 2025 · AWS SCT 자릿수 · ThoughtWorks "GenAI for forward engineering"

---

## 한계를 먼저 말한다 (정직성 = 신뢰)

- **70~80% 한계 = 명시 잔존.** 숨기지 않고 명세에 박아둠
- 사람 게이트 4개 (#1~#4) = AI를 신뢰하지 않아서가 아니라 **결정 책임을 사람이 진다**는 설계
- Modern automation 수치는 **OSS 한정** — 사내 Modern 스택 재측정 의무 (carry 명시)
- 시뮬레이션 결과는 신뢰도 **−5%p 패널티** + "진짜 도구 미실행" 명시 의무

> 한계를 명시하는 것이 방법론의 신뢰를 만든다. "다 된다" 는 약속을 하지 않는다.

---

## 이식성 — 산출물은 환경을 넘는다

**5종 이식성 산출물** (언어·환경 무관 / chain 2 통합)

| 산출물 | 활용도 |
|---|---|
| `rules.json` (BR) · `domain.json` · `openapi.yaml` | ★★★ 그대로 입력 (환경 100% 무관) |
| `schema.json` + `erd.mermaid` | ★★★ 입력 + DB 타입 매핑 (RDB 90% 무관) |
| `antipatterns.json` + `migration-cautions.md` | ★★★ 회피 목록 (패턴 단위 무관) |

**+ v2.0 신규 chain 산출물 6종**: planning-spec / behavior-spec / acceptance-criteria / test-spec / impl-spec / traceability-matrix

---

<!-- _class: divider -->
<!-- _paginate: false -->

# 3. 흐름 — 어떻게 돌아가나

## 세 공간 · 빌드 · 배포

---

## 세 개의 공간만 기억하면 된다

```
   ① 워크스페이스          ②  플러그인              ③ 사용 현장
   (저자가 만드는 곳)       (배포되는 산출물)         (동료가 쓰는 곳)
   ─────────────           ─────────────            ─────────────
   /ai-native-methodology   dist/                    동료의 Claude Code
                            ai-native-methodology-
   방법론 설계 · 검증도구    v<ver>/                   "비즈니스 규칙
   · 14 PoC 입증 작업장      자기완결 · 체크섬 검증     추출해줘" 자연어 한 마디

         │                        ↑                          ↑
         └──── npm run build ─────┘                          │
                                  └── 사내 GHE / 압축본 ──────┘
                                      /plugin install
```

- ① 저자만 작업 · ② 빌드 추출 자기완결 폴더(배포 단위) · ③ 설치만 하면 끝
- 동료는 ①의 존재를 몰라도 된다

---

## 빌드 — 한 줄로 플러그인이 만들어진다

```bash
npm run build
```

```
1. version-check.js   plugin.json / package.json / CHANGELOG.md
                       세 곳 버전 일치 검증 (불일치 시 빌드 중단)
2. build-plugin.js     플러그인 필요 폴더만 dist/ 로 추출
                       agents · skills · hooks · flows · templates
                       methodology-spec · schemas · tools · guides · docs(ADR)
3. SHA256 CHECKSUMS.txt 전 파일 무결성 매니페스트 생성
```

**의도적으로 빠지는 것**: `examples/`(PoC) · `briefing/` · `decisions/` · `archive/` · `scripts/` · `dist/`
→ 플러그인 = "동료가 실제로 쓰는 핵심" 만 추린 슬림 버전

---

## 사용 현장 — 자연어 한 마디

설치 (사내 GHE 표준):

```bash
/plugin marketplace add <사내 GHE git URL>
/plugin install ai-native-methodology@ai-native-methodology
```

그 다음은 한국어로 말하면 적절한 skill 이 깨어난다:

| 동료 발화 | 발동 |
|---|---|
| "이 코드베이스 분석 시작" | `analysis-input-collection` |
| "비즈니스 규칙 추출해줘" | `analysis-business-rules` |
| "발견 단계 시작" | chain 1 `discovery-from-analysis-output` |
| "비즈니스 규칙 의미 일관성 검증" | `analysis-br-cross-consistency-check` (Layer 1+2) |

skill 55종 — 이름 외울 필요 없이 **의도를 말하면** 훅·플로우가 의존성을 챙긴다.

---

<!-- _class: divider -->
<!-- _paginate: false -->

# 4. 플로우 — SDLC 6-stage Chain Harness

## Stage 0 → Chain 1~5 → 5 Gate (chain N = gate #N)

---

## 전체 플로우 (한 장)

```
 ┌─ Stage 0  Analysis ─────────────────────────────────────────┐
 │  레거시 → 7대 BE + 8 FE 산출물 + Phase4.5 + finding + AP      │
 └───────────────────────────┬─────────────────────────────────┘
                              ▼
   Chain 1 Discovery ──► Gate #1 ─(go)─►
   Chain 2 Spec       ──► Gate #2 ─(go)─►
   Chain 3 Plan       ──► Gate #3 ─(go: NFR hard gate + ADR ≥3)─►
   Chain 4 Test(RED)  ──► Gate #4 ─(go: 모든 test fail 확정)─►
   Chain 5 Impl(GREEN)──► Gate #5 ─(go: test 100% pass)─►  Release
                              │
            revisit (점선): gate 안에서만 round-trip 정식 허용
            stop: sprint 중단 / carry
```

**게이트 4개 = 사람이 4번만 본다.** 그 사이는 전부 AI 자동.
harness **외부** 자동 코드 생성은 ❌ — round-trip 은 gate 안에서만.

---

## Stage 0 — Analysis (11 phase)

레거시 코드베이스를 **이식 가능한 명세**로 환원하는 단계.

```
input → discovery → db-schema → architecture → business-logic
   → formal-spec → characterization → sql-inventory → api → ui → quality
```

| phase | 산출 |
|---|---|
| business-logic | `rules.json` (BR / NL + Given-When-Then dual representation) |
| formal-spec | FSM · Decision Table · invariant · property test |
| characterization | 레거시의 **"의도된 동작 vs 버그"** 분류 (Michael Feathers) |
| sql-inventory | SQL 단위 인벤토리 (11 컬럼) |
| quality | 안티패턴 카탈로그 + migration-cautions |

산출: `rules.json` · `domain.json` · `openapi.yaml` · `schema+ERD` · `antipatterns`

---

## Chain 1~5 — 각 단계의 책임

| Chain | 단계 | 산출물 | 게이트 통과 조건 |
|---|---|---|---|
| **1** | Discovery | `discovery-spec.{json,md}` | discovery-extraction-validator · schema |
| **2** | Spec | `behavior-spec` + `acceptance-criteria` (Gherkin) | chain-coverage · drift · dmn · formal-link |
| **3** | Plan | `task-plan` (task/ADR/NFR/risk) | gate #3 (plan-coverage-validator / NFR allocation hard gate + ADR ≥3) |
| **4** | Test (RED) | `test-spec` + 실 test 코드 + 5종 물증 | test-impl-pass = **모든 test fail** (RED 의무) |
| **5** | Impl (GREEN) | `impl-spec` + 실 impl 코드 + traceability-matrix | test-impl-pass = **100% pass** · static-runner 6종 · matrix 100% green |

> Chain 4 "RED 의무" = 구현 전 테스트는 **반드시 실패**해야 한다 (테스트가 진짜 검증임을 증명)
> Chain 5 "GREEN / i-strict" = 모든 테스트 100% 통과 + traceability 100% green 의무

---

## Revisit Loop — 기능 추가/수정 반복 적용

본 chain 은 일회성이 아니다. **revisit_edges 8종** 으로 되돌아간다 (★ v9.0 6-stage).

```
Gate #1 ─revisit→ analysis        Gate #5 ─revisit→ test
Gate #2 ─revisit→ discovery       Gate #5 ─revisit→ spec
Gate #3 ─revisit→ spec            Gate #5 ─revisit→ discovery
Gate #4 ─revisit→ plan            Gate #5 ─revisit→ analysis
```

- `chain-revisit-detector` 자동 감지 → 사용자 prompt → **go / stop / revisit** 결단
- stop 시 임의 stage jump 허용
- 즉, 기능 1개 추가도 같은 harness 를 다시 한 바퀴 (R13 충족)

---

<!-- _class: divider -->
<!-- _paginate: false -->

# 5. 종단 · 횡단 관심사

## Cross-cutting Concerns

---

## 횡단 관심사 한눈에

```
┌──────────────────────────────────────────────────────────────┐
│  S1 ─ S2 ─ S3 ─ S4   (chain 전 단계를 가로지름)                  │
├──────────────────────────────────────────────────────────────┤
│ CC1  no-simulation 정책 (진짜 외부 도구 7종 / 시뮬레이션 차단)    │
│ CC2  bidirectional traceability (DO-178C / IEC 62304 차용)     │
│ CC3  ratchet 0.85 → 0.90 → 0.95 (severity_floor crit=1.0)     │
│ CC4  chain-revisit-detector (반복 적용 감지)                    │
│ CC5  analysis aspects (a11y / i18n / static-security / legacy) │
└──────────────────────────────────────────────────────────────┘
```

이 다섯은 특정 단계 소유가 아니라 **모든 단계를 관통**한다.

---

## CC1 — No-Simulation 정책 (★★★ 절대 금지)

> AI에게 "Static Analyzer / Semgrep persona" 부여하는 **시뮬레이션 금지**.
> Semgrep · PMD · SpotBugs · Daikon · CodeQL · SonarQube **진짜 실행 의무**.

3중 차단(trio) + 보강으로 "양심 의존" 을 구조적으로 제거:

| 차단막 | 메커니즘 |
|---|---|
| state.blocked | chain state 가 미실행 시 진행 차단 |
| CLI exit 2 | 도구 미실행 시 non-zero exit |
| PreToolUse deny | 훅이 시뮬레이션 시도 자체를 거부 |
| release-readiness | content-aware (파일 존재만으로 통과 ❌) |

환경 부재 시 → 사용자에게 환경 준비 요청 또는 CI 위임 **명시**. 위반 시 신뢰도 −5%p.

---

## CC2 — 양방향 추적성 (Traceability)

```
   UC ──► BHV ──► AC ──► TC ──► IMPL      (forward)
   UC ◄── BHV ◄── AC ◄── TC ◄── IMPL      (backward)
```

- `traceability-matrix.{json,md,mermaid}` — 매 gate 갱신 의무
- **DO-178C / IEC 62304** (항공·의료 안전 표준) 의 양방향 추적성 차용
- coverage_summary + status (green / yellow / red) → Gate #5 에서 **100% green** 강제
- 산출물 변경 시 forward/backward link 따라 영향도 추적 가능

> "이 구현이 어느 비즈니스 규칙에서 왔는가" 를 항상 역추적할 수 있다.

---

## CC3 — Ratchet (단조 증가 품질 게이트)

```
coverage:  0.85  ──►  0.90  ──►  0.95     (한 번 올라가면 못 내려감)
severity_floor:  critical = 1.0   /   high = 0.95
```

- 레거시 진입 시 **ADR-010 baseline+ratchet** 필수 → "결함 폭발" 방지
- baseline 캡처 후 **새 코드는 baseline 을 악화시킬 수 없다**
- critical 결함은 floor 1.0 — 단 하나도 허용 안 됨

> 없으면: 방법론이 기존 이슈를 드러낼 때 레거시 프로젝트가 "결함 폭발" 로 마비됨.

---

## CC5 — Analysis 횡단 Aspect

특정 phase 가 아니라 코드 전반을 가로지르는 품질 관심사:

| Aspect | skill | 진짜 도구 |
|---|---|---|
| 접근성 | `analysis-aspect-a11y` | axe-core / Playwright (WCAG 2.2) |
| 국제화 | `analysis-aspect-i18n` | i18next / FormatJS / ICU |
| 정적 보안 | `analysis-aspect-static-security` | Semgrep / SpotBugs / Bandit / Snyk / OSV |
| 레거시 공존 | `analysis-aspect-legacy` | Strangler 패턴 감지 |

모두 **no-simulation 의무** (CC1 적용) · BE+FE+DB 트랙 무관.

---

## 자산 매핑 매트릭스 (stage × asset SSOT)

각 stage 진입 시 **어떤 자산을 호출하나** — `lifecycle-contract.md` 단일 SSOT (v4.0)

| stage | agent | skill | hook | tool/validator |
|---|---|---|---|---|
| input | `analysis-agent` | input-collection / orchestrate / from-{prompt,swagger,plan-doc,figma} | SessionStart | input-summary schema |
| discovery | `discovery-agent` | from-analysis-output / decompose-uc / identify-intent | UserPromptSubmit | discovery-extraction-validator |
| spec | `spec-agent` | compose-behavior / derive-AC | PostToolUse | chain-coverage-validator |
| plan | `plan-agent` | decompose-and-sequence / architect-decisions / risk-and-nfr | UserPromptSubmit | plan-coverage-validator (gate #3) |
| test | `test-agent` | generate-test-spec | — | test-impl-pass (RED) |
| implement | `implement-agent` | generate-impl-spec | PreToolUse(git commit) | test-impl-pass (GREEN) · static-runner |
| cross-cut | `_base-*` (research) | aspect-a11y/i18n/security/legacy | PostToolUse | 각 aspect 외부 도구 |

---

<!-- _class: divider -->
<!-- _paginate: false -->

# 6. 자산 구성

## 멀티에이전트 · 스킬 · 도구 · 스키마

---

## 무엇으로 구성돼 있나 (v8.2.0)

| 묶음 | 자산 | 역할 |
|---|---|---|
| **표준 정의** | methodology-spec/ + **schema 39종** | 방법론을 텍스트·스키마로 못 박음 |
| **자동화 엔진** | **tool 17종** + hooks + flows | 사람 없이 검증·발동 |
| **AI 발동 자산** | **skill 55종** + **agent 9종** + templates | 자연어 인터페이스 |
| **실증** | examples/ **PoC 14종** | 실제 프로젝트로 작동 입증 |
| **결정 기록** | docs/adr (BE10+FE7+CHAIN12) + decisions/ | 왜 이렇게 만들었는지 영구 보관 |
| **포장** | .claude-plugin + scripts + dist | 자기완결 폴더로 묶기 |

테스트: workspace **395** · release-readiness self-test **13/13**

---

## 멀티에이전트 v4.0 (9종)

> v4.0.0 MAJOR — stage 별 sub-agent 본격 채택 (DEC-2026-05-17-v4-multi-agent-paradigm)

```
 stage agent 6종            base persona 3종           spike 1종
 ───────────────            ────────────────           ────────
 analysis-agent             _base-senior-engineer      (paradigm
 discovery-agent            _base-industry-case-         가능성
 spec-agent                   researcher                 입증/보존)
 plan-agent                 _base-official-docs-
 test-agent                   checker
 implement-agent
```

- stage agent = chain 1~5 + analysis 각 단계 전담 워커 (1-way report-back)
- base persona = 4원칙 §2 "3-에이전트 토론" (공식문서 / 빅테크 사례 / Senior)

---

## 검증 도구 17종 (Node CLI / npm workspace 단일)

| 도구 | 막아내는 것 |
|---|---|
| `drift-validator` | 코드 ↔ 명세 불일치 (3-way) |
| `chain-coverage-validator` | 단계 간 커버리지 누락 |
| `traceability-matrix-builder` | UC→IMPL 추적 끊김 |
| `test-impl-pass-validator` | RED/GREEN 위반 (진짜 runner) |
| `decision-table-validator` | DMN 5-check (중복/충돌/갭/중첩/타입) |
| `spectral-runner` / `static-runner` | OpenAPI · 정적 도구 (진짜 실행) |
| `br-cross-consistency-validator` | BR 두 표현 의미 drift (Layer 1+2 LLM) |
| `skill-citation-validator` | SKILL.md·repo-wide 인용 dead-link (R18 내부정합) |
| `findings-aggregator` 외 | 양심 의존 차단 정책 완성 |

→ "사람이 안 봐도" 가 가능한 이유 = 이 17종이 게이트를 자동 강제

---

<!-- _class: divider -->
<!-- _paginate: false -->

# 7. 실증 & 진화

## 14 PoC · v1.0 → v8.2.0

---

## 14개 PoC — 무엇을 입증했나

| # | 대상 | 검증 차원 |
|---|---|---|
| #01~02 | Spring Boot 2.5 / 3.3 Hexagonal | BE 분석 표준 · 다른 아키텍처 |
| #03 | NestJS | 플랫폼 무관성 |
| #04 | React + FSD (full+mini) | 프론트엔드 트랙 |
| #05 | 샘플 사용자 등록 | chain harness e2e |
| #06·07·11 | 사내 EFI-WEB Spring 4.1 + iBATIS 2 | **Legacy 축** (3 사내 PoC) |
| #08·09·10 | MyBatis3 / TypeORM / JPA QueryDSL | **Modern 축** (3 OSS PoC) |
| #12·13 | raw SQL / QueryDSL 정탐 | paradigm-cross 사실 확보 |

> **§8.1 규칙**: 1개 PoC 패턴은 본체 등재 ❌ — **최소 2개 PoC 동형 재현** 의무.
> 이것이 "단일 케이스 과적합" 을 막는 방법론의 면역체계.

---

## 진화의 흐름 (v1.0 → v8.2.0)

```
v1.0─v1.4─v2.0─v2.5──v3.x────v4.0──v5.0─v6.0─v7.0─v7.1──v8.0──v8.2
 │    │    │    │     │       │     │    │    │    │     │     │
분석  FE  체인  Layer paradigm 멀티  alias BR  파일  저작  skill  docs
정착 트랙 하네스 2LLM 진화안정 에이전트폐기 4→2 rename 규칙  rename F-015
(BE) 합류(MAJOR)본격 +charter 본격 canon       (MAJOR)SSOT (MAJOR)+digest_sha
```

| 분기 | 사건 | 의미 |
|---|---|---|
| **v2.0** | chain harness 도입 | "분석만" → "실제 새 시스템 짓기" |
| **v3.x** | charter 활성 Gap 전부 청산 | 사용자 요구 자산 대칭 |
| **v4.0** | 멀티에이전트 paradigm 본격 채택 | stage 별 sub-agent 9종 |
| **v5.0~v7.0** | rules.json alias 폐기 → BR 표현 2종 → `business-rules.json` rename | breaking · 명세 단순화 |
| **v7.1~v8.2** | plugin-authoring-spec SSOT → skill rename → 인용·docs F-015 정합 | 외부 권위 drift 결정적 가드 (digest_sha) |

---

## 지금 어디까지 와 있나 (2026-05-17)

| 항목 | 상태 |
|---|---|
| 버전 | **v8.2.0 MINOR** |
| workspace 단위 테스트 | **395 / 0 실패** |
| release-readiness | **13/13** strict |
| charter 요구 | 활성 **16/16** 자산 대칭 (R16/R17 scope-out · R18 v7.1.0 신설) |
| §8.1 strict 정합 검증대 | 통과 (≥2 PoC corroboration) |
| Adzic SBE 함정 회피 | 본격 도달 (industry-first paradigm) |

다음 의제: 묶음 Q 잔여(②⑦) · Q-① follow-up — 각 breaking / cooling-off / 별도 plan

---

<!-- _class: lead -->
<!-- _paginate: false -->

# 닫는 한 줄

> 레거시 한 덩어리를, **환각·누락을 구조로 차단**하면서
> **AI가 85% 짓고 사람이 4번 결정**하는 흐름으로.
>
> 14개 PoC로 입증된 16개 검증 도구가
> 4개의 사람 게이트와 함께 돌아간다.

**품질 1순위 · 재작업 최소화 2순위 — 흔들리지 않는다.**

---

<!-- _class: divider -->

# 부록 — 발표 운용 가이드

- 본 덱은 **모듈식**: 섹션 표지(짙은 남색)에서 발췌 시작 가능
  - 임원 10분 → §1 + §2 + 한 장 요약 + 닫는 한 줄
  - 엔지니어 30분 → 전체
  - 온보딩 → §3 + §4 + §6
- 변환:
  ```bash
  npx @marp-team/marp-cli methodology-deck.md -o deck.pptx   # PowerPoint
  npx @marp-team/marp-cli methodology-deck.md -o deck.pdf    # PDF
  npx @marp-team/marp-cli -p methodology-deck.md             # 라이브 프리뷰
  ```
- 정합 기준 SSOT: `methodology-spec/plugin-charter.md` · `flows/sdlc-4stage-flow.mermaid` · `CLAUDE.md`
- 수치 갱신 시: 버전·테스트수·skill/tool/agent 종수·PoC수 4곳만 확인
