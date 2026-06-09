# 버전별 진화사 (한 페이지씩)

> 왜 이 방법론이 지금의 모양이 되었는가. 각 버전마다 어떤 깨달음이 있었고 무엇이 추가됐는지를 한 페이지씩 풀었습니다.
>
> **갱신 이력**: 2026-05-08 작성 (v1.0 ~ v2.2) → 2026-05-14 갱신 (v2.3 ~ v2.5.1) → **2026-06-09 v0.24.0 까지 확장** (v2.6 이후 6-stage chain / json 단독 / 0.x 리셋 / BR-split·living-sync entry 추가. v1.0~v2.5.1 entry 는 사실 history 라 보존).
>
> ⚠ v2.5.x 이하 entry 의 "본격" 같은 표현과 "최신 = v2.5.1" 프레이밍은 당시 시점 기록입니다. **현재 최신은 v0.24.0** 이며, 아래 "v2.6 이후" 절부터가 그 사이의 진화입니다.

---

## v1.0 ~ v1.3 (2026-04 초 ~ 4 월 말) — 분석 단계의 정착 (BE)

### 어떤 문제 인식이 있었나

"AI 에게 레거시 분석을 시키면 결과가 사람마다 다르다." 같은 코드를 줘도 결과의 깊이, 형식, 누락이 모두 다릅니다.

### 무엇을 추가했나

- **Phase 0~6** — 7 단계 표준 워크플로우
- **이식 가능한 산출물 5종** — rules.json / domain / openapi / schema+ERD / antipatterns
- **§8.1 단일 PoC 과적합 회피 규칙** — "한 PoC 에서만 보인 패턴은 본체에 등재 금지"
- **이중 렌더링 사상** — JSON/YAML (AI 눈) + Mermaid/Markdown (사람 눈)

### 어떻게 입증했나

| PoC | 대상                        | 의의                     |
| --- | --------------------------- | ------------------------ |
| #01 | RealWorld Spring Boot 2.5   | 첫 성공                  |
| #02 | Spring Boot 3.3 + Hexagonal | 다른 아키텍처에서도 작동 |
| #03 | NestJS (TypeScript)         | **플랫폼 무관성 입증**   |

### 다음으로 남긴 숙제

- 프론트엔드는 어떻게 분석할 것인가?
- 분석한 결과로 실제 새 시스템을 짓는 단계는?

---

## v1.4 (2026-05-01 ~ 02) — 프론트엔드 트랙 합류

### 어떤 문제 인식이 있었나

사용자가 직접 지적: **"프론트엔드 분석 방법이 없잖아."** v1.x 까지는 백엔드만 다뤘습니다.

### 무엇을 추가했나

- **FE 산출물** — ui-spec / state-map / visual-manifest / form-validation / type-spec
- **ADR-FE-001 ~ 007** — FE 트랙 결정 기록
- **본체 도구 2건** — drift-validator FE 모드 + schema-validator (Ajv 8)
- **진짜 도구 6종 첫 동원** — ts-morph + Playwright + axe-core + drift + schema + Spectral

### 어떻게 입증했나

- **PoC #04** — RealWorld React + Feature-Sliced Design (yurisldk fork)
- **4개 PoC 동형 입증 첫 사례** — JWT 를 localStorage 에 저장하는 XSS 위험 패턴이 PoC #01/02/03/04 모두에서 같은 형태로 발견됨 → 본체 안티패턴 카탈로그 정식 등재

### 다음으로 남긴 숙제

- **분석 자체는 잘 되는데, 그래서 다음은?** 새 시스템을 짓는 단계가 여전히 외부에 있음.

---

## v2.0 (2026-05-06 ~ 07) — 체인 하네스 도입 (MAJOR)

### 어떤 문제 인식이 있었나

"분석 산출물을 가지고 새 시스템을 지을 때, AI 가 사양을 어겨버린다. 사람이 매 줄 검토하면 AI 의미가 없어지고, 검토 안 하면 환각이 박힌다."

### 무엇을 추가했나

**SDLC 4단계 체인 하네스** — 정체성을 송두리째 바꾼 변경.

```
[체인 1] 기획 명세         → 게이트 #1
[체인 2] 행동 + 인수 기준  → 게이트 #2
[체인 3] 테스트 (RED 의무) → 게이트 #3
[체인 4] 구현 (GREEN 의무) → 게이트 #4
```

- **6개 신규 산출물** — planning-spec / behavior-spec / acceptance-criteria / test-spec / impl-spec / traceability-matrix
- **5개 ADR-CHAIN** — 정책 명문화
- **chain-driver 도구** — 5 요소 자동 enforcement
- **release-readiness §8.1 strict 7/7** — 릴리스 자격 자동 검사

### 어떻게 입증했나

- **PoC #05** — sample 사용자 등록 e2e 검증대 통과
- **PoC #03 retrofit** — 기존 NestJS PoC 에 체인 하네스 후행 적용
- **218 개 단위 테스트 / 0 실패**

### 다음으로 남긴 숙제

- 레거시의 "의도된 동작 vs 버그" 를 어떻게 판별하는가?

---

## v2.1 (2026-05-07) — Phase 4.7 (Characterization)

### 어떤 문제 인식이 있었나

"레거시 코드의 어떤 동작이 의도된 사양인지, 단순 버그인지 모르겠다. 새 시스템에서 그대로 옮겨야 할지 고쳐야 할지 매번 헷갈린다."

### 무엇을 추가했나

- **Phase 4.7 Characterization** — Michael Feathers 의 _Working Effectively with Legacy Code_ 에서 가져옴
- **Given/When/Then 스냅샷** — 레거시 동작을 BDD 시나리오로 박제
- **4가지 분류**:
  1. 의도된 동작
  2. 의도된 동작 + 개선 여지
  3. 버그지만 호환성 위해 보존
  4. 명확한 버그 — 새 시스템에서 제거
- **characterization-coverage-validator** — ratchet (단조 비감소) 검증
- **ADR-CHAIN-006**

### 어떻게 입증했나

- **PoC #06** — 사내 EFI-WEB Spring 4.1 (Legacy)
- **PoC #03 retrofit** — NestJS (Modern)
- ≥ 2 PoC 동형 입증 충족 (Legacy + Modern 양 spectrum)

### 다음으로 남긴 숙제

- SQL 이 너무 흩어져 있다. 한 줄 한 줄을 인벤토리화할 수는 없을까?

---

## v2.2 (2026-05-08, 오늘) — Phase 4.8 (SQL Inventory)

### 어떤 문제 인식이 있었나

"매퍼 XML 에 흩어진 312 개 SQL 중 어떤 게 어떤 화면에서 호출되고, 어떤 테이블을 건드리는지 추적이 안 된다. 마이그레이션 계획을 세울 수 없다."

### 무엇을 추가했나

- **Phase 4.8 SQL Inventory** — RDB 한정 sub-phase
- **11개 컬럼**:

  | 자동 (6)           | 사람 검토 (5)                |
  | ------------------ | ---------------------------- |
  | sql_id             | business_meaning             |
  | mapper_xml         | uc_link                      |
  | called_from_screen | intent_vs_bug_classification |
  | dynamic_branch     | confidence                   |
  | dependent_tables   | carry_flags                  |
  | statement_type     |                              |

- **자동화율 metric** — ≥ 50% 통과 의무 (5 개 PoC 평균 66.7%)
- **sql-inventory-extractor 도구** + 단위 테스트 10 개
- **ADR-CHAIN-007** + **ADR-CHAIN-008**

### 어떻게 입증했나 (본 방법론 사상 가장 강한 입증)

**5 개 PoC × 6 개 차원 동형 입증**:

| 차원     | 변동성                                               |
| -------- | ---------------------------------------------------- |
| 패러다임 | iBATIS 2 / MyBatis 3 / TypeORM raw / Spring Data JPA |
| ORM      | 4 종                                                 |
| 플랫폼   | Java / TypeScript                                    |
| 언어     | Java / TypeScript                                    |
| 책임     | 단일 / 다중                                          |
| 규모     | 4 BC ~ 25 SQL                                        |

→ **ADR-CHAIN-008 신정책** 채택: "MEDIUM 강도 × 5 PoC 동형 = strong corroboration 자격 충족".

### 부수적 변경

- **cooling-off 7 일 정책 영구 폐기** — "사용자 명시 결단 우선" 원칙 강화
- **release-readiness adr_registry dynamic 검사** — hardcode 5 개 → glob 동적 8 개

### 다음으로 남긴 숙제 (v2.3.0 후보)

1. Gartner TIME 매핑 — "유지/투자/이전/제거" 4 분면
2. patterns_extension_v3 — Cache / Discriminator / TypeHandler
3. Spring 4.1 + iBATIS 2 sub-rule 5 종 동형화
4. PoC #11 (사내 EFI-WEB billing) — 사용자 우선순위 #1 / 소스 도착 대기

---

## v2.3 (2026-05-12 ~ 13) — Spring 4.1 + iBATIS 2 sub-rule + 사내 PoC chain 2 첫 진입

### 어떤 문제 인식이 있었나

"v2.2 까지는 Modern 패러다임 PoC 위주로 입증됐는데, 사내 legacy 스택 (Spring 4.1 + iBATIS 2) 의 특수성은 sub-rule 로 본격 명문화가 안 돼 있었다. 또 PoC #11 사내 billing 본격 진입 시 chain 2 가 실증 부재."

### 무엇을 추가했나

- **v2.3.0-rc1**: `migration_priority` P0~P3 12번째 컬럼 + ADR-CHAIN-009 (Gartner TIME SQL 단위 4분면 매핑 사상).
- **v2.3.0 MINOR FINAL**: patterns_extension_v3 + **Spring 4.1 + iBATIS 2 spectrum AP isomorphic 5종 sub-rule** + ADR-CHAIN-010.
- **v2.3.1 ~ v2.3.7 PATCH 일련**:
  - `findings-aggregator` 도구 신설 (workspace 15번째 / "양심 의존 차단" 정책 완성).
  - chain-driver `next --findings` 자동 입력 정식 통합.
  - rules.schema.json BR pattern 4토막 strict 정합 + id-conventions enforcement 강화.
  - PoC #11 사내 EFI-WEB billing 본격 chain 2 진입 (첫 realworld 사내 PoC chain 2 실증).
  - R1' automation ceiling 본체 명문화 (3 layer 가치 명세 axis 분리 / Spring 4.1 + iBATIS 2 = ~53~55% / Modern = ~60~67%).

### 어떻게 입증했나

- **PoC #11** — 사내 EFI-WEB billing chain 2 4 UC 종결 / characterization mode.
- **5 PoC isomorphic robust** (v2.2.0 MINOR FINAL → v2.3.0 강화).
- **사내 동료 적용 검증대** 첫 본격 자료.

### 다음으로 남긴 숙제

- 비즈니스 규칙 (BR) 자연어 표현 ↔ 실행 가능 표현 (Given/When/Then) 의 의미 일관성을 어떻게 검증할 것인가? — Adzic 가 SBE 에서 10년 만에 폐기한 영역.

---

## v2.4 (2026-05-13) — BR dual representation paradigm (MINOR)

### 어떤 문제 인식이 있었나

"BR 의 자연어 표현 (description / natural_language) 과 실행 가능 표현 (Given/When/Then) 이 시간 지나면서 갈라진다. Gojko Adzic 가 SBE (Specification by Example) 에서 10년 만에 자기 폐기한 영역. industry 표준 도구 (Spec Kit / AWS Q / DMN / Spectral / Cucumber) 모두 cross-consistency rule 부재."

### 무엇을 추가했나

- **BR dual representation paradigm 본격 도입** — natural_language + given_when_then 양쪽 executable (Gherkin description = runtime 무시 paradigm 과 명확히 다름).
- **`br-cross-consistency-validator` 신설** — workspace 16번째 도구.
  - **Layer 1 (결정적)**: 두 표현 ≥ 1 의무 / keyword overlap (intersection / max) / structure 검증 / BR id 4토막 strict.
  - **Layer 2 (LLM advisory)**: v2.4 시점 = placeholder + interface 정의 / v2.5.0 본격 구현.
- **chain 1 gate REQUIRED_VALIDATORS_PER_STAGE 통합** — br-cross-consistency-validator 가 chain 1 gate 의무 통과 요소로 격상.
- **release-readiness §8.1 strict 7/7 → 8/8 격상** — analysis_validator_violation criterion 신설.
- **ADR-CHAIN-011 본격 작성** — dual representation paradigm + Adzic SBE 위험 신호 + industry 공백 사실.

### 어떻게 입증했나

- **11 PoC 호환 회복** (PoC #01 13 BR + PoC #05 sample / VALID gate pass).
- **industry-first 자격 본격 임상 threshold 측정** — MDPI 2025 paraphrase optimal=0.671 / Cucumber + DMN + Spectral 부재 / 본 방법론 원조 자격.

### v2.4 carry session 9~14차 (no version bump / no release / no tag)

본 v2.4 release 후 v2.5.0 본격 release 까지 6 차례 SESSION-WRAPUP carry update:

- **session 9차**: Layer 1 keyword overlap = structural sanity check 격하 / Layer 2 LLM 의무 격상 paradigm 결단 / SPIKE v2 자산화 / ≥0.85 hypothesis empirical 정면 부정 결정적 사실.
- **session 10차 Phase A**: description vs natural_language paradigm 재정의 (Agent 3 (c) hybrid).
- **session 11차 Phase B**: PoC #03 18 BR + PoC #05 dual representation 마이그레이션 / Layer 1 keyword threshold 자체 제거.
- **session 12~13차 Phase C**: Layer 2 LLM Claude Code sub-agent invocation paradigm 본격 구현 (Anthropic API ❌ / Claude Code Task tool ✅).
- **session 14차 Phase C step 9**: chain 1 gate Layer 2 통합 (chain harness 5 요소 1 변경).

### 다음으로 남긴 숙제

- ≥ 2 PoC corroboration 본격 입증 (Layer 1 + Layer 2 양쪽).
- release-readiness 9/9 격상 자격 도달.

---

## v2.5.0 (2026-05-14) — Layer 2 LLM paradigm 본격 + ≥ 2 PoC corroboration 본격 입증 (MINOR FINAL)

### 어떤 문제 인식이 있었나

"v2.4 까지 dual representation paradigm 은 도입했지만, Layer 2 의 LLM 의미 일관성 평가가 placeholder 상태. Adzic SBE 함정 회피 자격 본격 도달하려면 Layer 2 본격 동작 + ≥ 2 PoC 양쪽 입증 필수."

### 무엇을 추가했나 (paradigm 본격 굳힘)

- **Layer 2 LLM paradigm 본격 도입** — Claude Code sub-agent invocation:
  - Anthropic API / OpenAI API 영역 ❌ → **Claude Code sub-agent (Task tool) invocation paradigm** 정정 (본 plugin 본질 정합).
  - Sonnet 4.6 sub-agent batch 호출 (1회 호출 전체 BR / paradigm 굳힘).
  - DETERMINISTIC_THRESHOLD = 0.85 / confidence cap = 0.85 / semantic_drift_detected (medium) + confidence_cap_exceeded (low) finding 신설.
  - `docs/layer-2-prompt-spec.md` 본격 자산화.
- **≥ 2 PoC corroboration 본격 입증** — PoC #01 13 BR + PoC #03 18 BR = 31 BR Layer 1 + Layer 2 양쪽 gate pass:
  - PoC #01 overall=0.901 / pass
  - PoC #03 overall=0.941 / pass
  - PoC #05 overall=0.985 / pass (sample)
- **drift BR 2건 DRIFT 격상 자산화** — BR-AUTH-JWT-002 + BR-USER-DELETE-AUTH-001 (rules.json 변경 ❌ / 사용자 결단 (2) / Senior REVISE-3).
- **release-readiness 8/8 → 9/9 격상** — `layer_2_consistency` criterion 신설 (per-PoC mean ≥ 0.7 + critical/high drift 0 / additive change paradigm).
- **chain 1 gate gate-eval.js Layer 2 통합** — llm_consistency_score+llm_threshold+llm_status 3 필드 / evaluateGate layer2_threshold block reason / severityRank rank 2.

### 어떻게 입증했나 (본 방법론 사상 최강 입증)

- **industry-first paradigm 본격 입증** — Spec Kit 90K star / AWS Q / DMN / Spectral 모두 cross-consistency rule 부재 / 본 방법론 원조 자격.
- **Adzic SBE 10년 폐기 함정 회피 자격 본격 도달** — Layer 2 본격 동작 + ≥ 2 PoC corroboration 양쪽 입증.
- **312/0 workspace test + 10/10 scripts/test = 322/0 본질 보존**.
- **multi-model cross-validation 본격 자료** — Sonnet 4.6 + Haiku 4.5 (different model class) 31 BR Layer 2 blind retrospect → self-eval bias 단방향 상향 편향 가설 정면 부정 ✅.

### 부수적 변경

- `plugin.json` 2.4.1 → 2.5.0 + `br-cross-consistency-validator` 0.1.0 → 0.2.0 + `chain-driver` 0.1.0 → 0.2.0.
- DEC-2026-05-14-v2.5.0-minor-final + ADR-CHAIN-011 §9 LL-i-44+45 + §11 patch v9.
- git tag `v2.5.0` + origin push ✅.

### 다음으로 남긴 숙제

- 사내 GHE 환경에서 plugin install 호환성 본격 검증.

---

## v2.5.1 (2026-05-14) — Claude Code plugin install 호환성 본격 회복 (PATCH)

### 어떤 문제 인식이 있었나

**critical 결함 본질 사실**: v2.0.0~v2.5.0 모든 release 가 사내 GHE plugin install 후 38 skill + 3 agent 본격 인식 ❌. 사용자 검증 시 `/plugin` 상세 출력 = "Agents: README (1 file 잘못 인식) / Skills: 0종 / MCP Servers: \_comment".

원인 = 본 plugin 의 `agents/<category>/<name>/<name>.md` + `skills/<category>/<name>/SKILL.md` **2-depth lifecycle organize** 가 Claude Code plugin 표준 1-depth scan 과 충돌.

### 무엇을 추가했나

**사용자 결단 옵션 B (category prefix flatten)** 본격 시행:

- **agents 3 mv + skills 38 mv (총 41 mv)** — `agents/_base-<name>.md` + `skills/<category>-<name>/SKILL.md` 1-depth + prefix paradigm.
- **사상 명세 본격 자산화** — `methodology-spec/skills-axis.md` §7 신설 + `methodology-spec/agents-axis.md` 본격 작성 (sub-axis 영역 분리: 사상 axis = methodology-spec / runtime axis = 1-depth + prefix).
- **외부 참조 43 file 정밀 갱신** — flows/\*.json + tools/chain-driver/hooks-bridge.js + README + methodology-spec 안 skill name 인용 (negative lookbehind/lookahead + .md path 회피 정규식).
- **3-way sync 회복** — `package.json` v2.4.1 → v2.5.1 (v2.5.0 release commit 갱신 누락 회복) + `plugin.json` v2.5.0 → v2.5.1 + CHANGELOG 헤더 신설.

### 어떻게 입증했나

- 사내 GHE 표준 install (`/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git` + `/plugin install ai-native-methodology@ai-native-methodology`) 본격 작동 ✅.
- chain harness 5 요소 변경 ❌ (plugin runtime 호환성 fix 영역 한정).
- v2.5.0 MINOR FINAL release 본질 보존 ✅.
- 11 PoC 호환 자격 보존 ✅.

### post-v2.5.1 meta cleanup (2026-05-14 / no version bump / no release)

본 PATCH 후속 메타 정리 4 commit:

- `plugin.json` description ≈ 3KB session history → 200자 안정 제품 설명.
- `CLAUDE.md` CHANGELOG 라인 7849자 단일 paragraph → 200자 + link.
- `CHANGELOG.md` split 165KB → 60KB / v2.4+ 본문 / v2.3.7 이하 CHANGELOG-HISTORY.md 격리.
- `tools/drift-validator/check-phase-skills.js` 1-depth paradigm 정합 갱신 → workspace test 310/2 → 312/0 회복.
- briefing/ outdated 본격 update (본 페이지 갱신 자체).

### 다음으로 남긴 숙제

- v2.5.2 PATCH 또는 v2.6.0 MINOR 후보 — 사용자 결단 대기.

---

# ── 여기서부터 v2.6 이후 (2026-06-09 확장) ──

## v2.6 ~ v8.x — 스킬 네임스페이스 정비

v2.5.1 직후, 스킬을 자연어뿐 아니라 명시 호출(`/skill-name`)로도 안정적으로 부를 수 있도록 네임스페이스를 정비했습니다. 숫자 prefix(phase-N) 대신 의미 ID(`analysis-source-inventory` 식)로 굳혔고, 사상 axis 는 `methodology-spec/skills-axis.md` 에 별도로 보존했습니다.

## v9.0.0 — 6-stage chain harness 도입 (MAJOR / 2026-05-25)

가장 큰 구조 변경. 그 전까지 "분석(Stage 1) + 4-체인(Stage 2)" 으로 나뉘던 것을, **analysis + 5개 체인의 6-stage** 로 재편했습니다.

```
analysis → discovery → spec → plan → test → implement
(추출)     게이트#1    #2     #3     #4(RED) #5(GREEN)
```

- 예전 "planning" 단계는 **discovery** 로 개칭됐고, 별도로 **plan** 단계(task 분해 / ADR / NFR / risk)가 신설됐습니다.
- analysis 는 체인의 게이트가 아니라 **soft exit gate #0** (증거 누락 시 fail-closed)로 정리됐습니다.

## v10 / v11 — 게이트 1:1 컨벤션 + BE/FE 분리 + 티켓 cascade

- **체인 N = 게이트 #N** 을 1:1 내부 컨벤션으로 못박음.
- 산출물을 **BE / FE 로 분리**하고, 계약을 양 axis 로 강제(BE = swagger / FE = state-map + DTCG).
- 티켓 시스템을 plan 단계 한 곳의 **Epic / Story / OP-* / TASK-* 4-level cascade** 로 정리.
- discovery 입력 어댑터 4종 정비 (analysis-output / swagger / figma / nl-md).

## v12.0.0 — json 단독 SSOT (MAJOR / 2026-05-31)

산출물에서 **`.mermaid` + `.md` 짝(이중 렌더링)을 전면 폐기**하고, `.json` 한 벌만 진실(SSOT)로 삼았습니다. 다이어그램은 필요할 때 view-time 에 렌더합니다. 완전 AX-native (ADR-008 Superseded / ADR-011).

이어진 v12.9~v12.16 에서는 **codegraph wiring**(코드↔산출물 coverage-hole / openapi 정적 검증)을 단계적으로 붙이고, chain/gate 번호를 canonical(test=4·implement=5)로 정합시켰습니다.

## v0.1.0 — `context-ops` 리네임 + 0.x 버전 리셋 (2026-06-06)

- 플러그인 **기계 식별자**를 `ai-native-methodology` → `context-ops` (npm `@mis-plugins/context-ops`)로 변경. **방법론 개념명 "AI-Native 개발 방법론" 은 불변.**
- **버전을 12.16.0 → 0.1.0 으로 리셋.** 누적 12.x 가 성숙도를 과대 표기한다고 봤고, 아직 사내 미배포(실 사용자 0)인 pre-1.0 상태를 정직하게 반영했습니다. 누적 이력은 CHANGELOG 에 연속 보존, 외부 영향 0.

## v0.2 ~ v0.24 — Tier 정합 · BR-split · living-sync (2026-06-07~09)

- **v0.2.0** — PMD 를 Tier 1(in-plugin 자동 실행)으로 격상. R19 Tier 축을 "실행 locus" 로 명문화.
- **v0.3 ~ v0.4 / v0.24 (BR-split)** — `business-rules.json` 을 index + per-BC(`business-rules/<BC>.json`)로 분할. 검증 스키마는 무변경, loader 단일 변경점으로 소비자에게 투명.
- **v0.5 ~ v0.19 (living-sync)** — 산출물을 한 번 만들고 끝이 아니라 **평생 동기화**되게. 변경 origin → forward 영향 closure → 재생성 큐(Phase 1), 손수정 코드 → anchor 역추적 → 의미 천장 surface(Phase 2), cross-scope drift 활성화(Phase 3), BC별·BR별 노드 분할(Phase 4), fixpoint 자동 재진입(carry 2)까지.
- **v0.23** — 출력 디렉토리 컨벤션 `.aimd/` → `.ai-context/` (내용 서술성 / 패키지 `context-ops` 와 짝).
- **v0.24.0 (현재)** — BR-split 마지막 STEP 완성.

> 그리고 v0.x 동안, 6-stage 상태머신을 **외부 Modern 스택**에서도 완주시켰습니다 — PoC #18(Express+Prisma / TS) + PoC #19(numpy / Python)이 genuine RED → GREEN 6-stage e2e 를 통과했습니다.

---

## 진화의 한 줄 요약

> **"분석만" 에서 → "분석 + 새 시스템 짓기" 로 → "레거시의 의도/버그 판별" 로 → "SQL 한 줄까지 추적" 으로 → "비즈니스 규칙의 자연어 ↔ 실행 가능 표현 의미 일관성 검증" 으로 → "사내 동료 plugin install 작동" 으로 → "analysis + 5-gate 6-stage chain harness" 로 → "산출물 json 단독 SSOT + 평생 동기화되는 LLM 운영 컨텍스트(AX 운영)" 까지.**
>
> 매 버전은 직전 버전이 남긴 숙제 하나를 풀었고, 풀어낸 방법은 항상 ≥ 2 개 PoC 에서 동형으로 입증되었습니다.
>
> - **v2.5.0** = 자연어 ↔ 실행 가능 명세의 의미 일관성 검증(Adzic SBE 함정 회피) — industry-first.
> - **v9.0.0** = analysis + 5-체인의 6-stage chain harness.
> - **v12.0.0** = json 단독 SSOT (이중 렌더링 폐기 / 완전 AX-native).
> - **v0.x** = `context-ops` 리네임 + 정직한 버전 리셋 + BR-split + 평생 동기화(living-sync).
>
> **현재 = v0.24.0.** 산출물은 시스템 설명서가 아니라 LLM 의 운영 컨텍스트 그 자체이고, 그 목표는 프로젝트를 AX 로 운영하는 것입니다.
