# AI-Native 개발 방법론 — 작업 컨텍스트

본 레포는 사내 표준 AI-Native 개발 방법론. 다음 세션에서 작업 재개 시 본 파일이 컨텍스트.

> **식별자 ≠ 개념명**: 플러그인/패키지 식별자 = `context-ops` (npm `@mis-plugins/context-ops` / 마켓플레이스 `mis-plugins`) · 방법론 **개념명** = "AI-Native 개발 방법론" (불변). 디렉토리 = `plugins/context-ops/`.

> **휘발성 진행 상태** (PoC 통계 / 묶음 진행률 / 누적 finding) → [`decisions/STATUS.md`](plugins/context-ops/decisions/STATUS.md)
> **결정 이력** → [`decisions/INDEX.md`](plugins/context-ops/decisions/INDEX.md)

## 절대 우선순위

**품질 1순위 + 재작업 최소화 2순위**. 속도/quick win/컨텍스트 신선도 후순위.
격상/처분/순서 결정 시 §8.1 단일 PoC 과적합 회피 강제 적용. (memory `feedback_quality_priority.md`)

## 본 방법론 가치 명세 (v11.7.0 / 2026-05-30 갱신 / use-scenario taxonomy + AX 운영 정체성)

> **가장 큰 목적 (P0 / DEC-2026-05-30-use-scenario-taxonomy)**: 산출물 = "시스템 설명 문서"가 아니라 **LLM 의 운영 컨텍스트 그 자체**. 방법론의 가장 큰 목적 중 하나 = 이 컨텍스트를 평생 유지·동기화하여 **프로젝트를 AX 로 운영**(LLM 이 정확한 컨텍스트로 develop·run·modify·evolve)하는 것. 4 시나리오(**S2 AX전환 = 주 타깃** / S1 재생성 / S3 특성화 / greenfield)는 **bootstrap 입력만 다르고 모두 같은 정상 상태 "AX 운영"으로 수렴**. greenfield 도 입력어댑터 analysis 로 산출물 생성 = 처음부터 AX-native. 산출물 = 모든 stage 의 base + 기능추가 시 역동기화(양방향). SSOT = `methodology-spec/use-scenario-taxonomy.md`.

```
INPUT (4 use-scenario / DEC-2026-05-30):  S2 AX전환(주 타깃) / S1 재생성 / S3 특성화 = legacy 코드 / greenfield = PRD·디자인·계약
  ↓ analysis stage = 코드-고고학 패스(legacy) + 입력어댑터 패스(공통 / greenfield 는 이것만 / 현 v1.5.x 자산)
  ↓
OUTPUT chain (v9.0 6-stage / planning→discovery 개칭 + plan 신설 / DEC-2026-05-21+DEC-2026-05-23-discovery-stage-v9):
  [CHAIN 1] discovery: discovery-spec (입력 어댑터 4종 analysis-output/swagger/figma/nl-md)  ── go/stop gate #1
  [CHAIN 2] spec: behavior-spec + acceptance-criteria + 7대 산출물 통합  ── go/stop gate #2
  [CHAIN 3] plan: task 분해/의존성/ADR/NFR/risk  ── go/stop gate #3
  [CHAIN 4] test: test-spec + 실 test 코드 (RED 의무)  ── go/stop gate #4
  [CHAIN 5] implement: impl-spec + 실 impl 코드 (GREEN / 100% test pass)  ── go/stop gate #5
  ↓
USE: AI 자동 생성 + 사용자 검토 / prod 시스템 + traceability-matrix
```

**SDLC 5단계 chain harness** (v10.0.0 / discovery → spec → plan → test → impl / DEC-2026-05-06-v2.0-i-strict-채택 + DEC-2026-05-21-chain-discovery-plan-stage-도입 + DEC-2026-05-25-axis-a-phase-4-4-prime + ADR-CHAIN-001~012). round-trip = chain harness gate 안에서 정식 허용. harness 외부 자동 코드 생성 ❌. chain N = gate #N 1:1 INTERNAL CONVENTION. analysis = **soft exit gate #0** (DEC-2026-06-06-analysis-exit-gate / opt-in fail-closed / chain-harness 70~80% axis 별개 — findings-aggregator 러너 → chain-driver next).

**70~80% 한계 = 명시 잔존** (**chain harness 전체 자동화 axis** / process 통과율 metric). AI 자동화 ≥ 85% / 사람 검토 (gate #1~#5) ≤ 15% / 100% 자동화 ❌.

**analysis 단계 §3-A automation = 별도 axis** (R1' / DEC-2026-05-13-r1-prime-본체-명문화 / 6 PoC 사실 / sub-rule `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` §X 정합):

| paradigm                                       | analysis §3-A ceiling | corroboration                             | 측정 환경                              |
| ---------------------------------------------- | --------------------- | ----------------------------------------- | -------------------------------------- |
| Spring 4.1 + iBATIS 2 (Legacy)                 | **~53~55%**           | 3 사내 PoC isomorphic (PoC #06+#07+#11)   | 사내 EFI-WEB                           |
| Modern (MyBatis 3 / TypeORM / Spring Data JPA) | **~60~67%**           | 3 OSS PoC corroboration (PoC #08+#09+#10) | **OSS 한정 / 사내 Modern 재측정 의무** |

chain harness 70~80% axis 와 analysis §3-A automation axis = **별도 metric** (metric 분모 자체 다름 / chain harness = chain 1~5 통합 gate 통과율 / §3-A = analysis 단방향 추출률 / 외부 인용 시 axis 혼동 회피 의무).

revisit loop (자동 감지 + 사용자 결단): chain-revisit-detector → 사용자 prompt → go/stop. stop 시 임의 stage jump.

### 산출물 이식성 5종 (chain 2 단계 통합 / 변경 ❌)

| 산출물                                       | 활용도                                                                                                     |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| rules.json (BR) / domain.json / openapi.yaml | 그대로 입력 (언어/환경 100% 무관)                                                                          |
| schema.json (+ FK relationship_label)        | 입력 + DB 타입 매핑 (RDB 내 90% 무관 / v12 ADR-011 — 구 erd.mermaid 폐기 / 관계 동사 = relationship_label) |
| antipatterns.json + migration-cautions.json  | 회피 목록 (패턴 단위 무관)                                                                                 |

(memory `project_methodology_scope.md` / master plan `~/.claude/plans/a-stateful-gadget.md`)

## Static Tool 시뮬레이션 절대 금지 (R19 Tier 정합 / DEC-2026-05-18-runtime-tool-exclusion)

Phase 4.5 검증 / 모든 cross-validation 단계에서 — 도구는 **실행 확인된 것만 "실행"으로 표기**. 실행한 적 없는 도구를 "실제 실행 의무"로 나열 ❌ (정직 표기).

- ❌ **Tier 3 (simulated)** — AI sub-agent 에 "Static Analyzer persona" 부여 시뮬레이션 = 영구 reject + 신뢰도 -5%p + "진짜 도구 미실행" 명시 의무.
- ✅ **Tier 1 (in-plugin plugin 직접 실행 / 분류 축 = 실행 locus / DEC-2026-06-07)** — Semgrep / ESLint / Spectral / axe-core·Playwright / **PMD (JDK+PMD 설치 시 자동실행 / poc-06 legacy + poc-10 modern corroboration)** / 테스트 단계 stack runner (Gradle·JUnit / vitest 등). 런타임 JVM 의존 무관 — plugin 이 직접 돌리면 Tier 1. 실 실행 + 5종 물증(`real_tool`) 의무. **환경(도구 바이너리) 부재 시 = preflight `PluginEnvironmentMissing` → exit 3 정직 신호 ("항상 자동실행" 아님 / LLM 추론 대체 ❌).**
- ✅ **Tier 2 (사용자 환경 SARIF import / orthogonal)** — import allowlist = **PMD** (poc-17 user-env 실 import 입증 driver). PMD = **Tier 1(in-plugin 자동) + Tier 2(import) 양쪽 유효** (in-plugin 불가 환경은 import 경로). 사용자가 자기 CI/환경에서 실행해 SARIF 를 import 할 때 `evidence_trust=imported_sarif` (`tool_stdout_path=null` 정직 표기). 부재 = R19 Tier 2 environment-dependent **carry** (날조 ❌). **SpotBugs·CodeQL·Daikon·SonarQube 는 실행·import 이력 0 → allowlist/toolset 에서 제거**(no-unrunnable-tool-citation / 사용자가 자기 환경서 쓰면 `static-runner IMPORTED_DRIVER_ALLOWLIST` 명시 확장 / DEC-2026-06-06-tool-allowlist-pmd-only).
- ✅ 환경 부재 시 = Tier 분류대로 정직 carry (사용자 환경 준비/CI 위임 명시). Tier 2/3 혼동 ❌.

(memory `feedback_no_static_tool_simulation.md` + `feedback_no_unrunnable_tool_citation.md` + `feedback_environment_dependent_tools_scope_out.md` / R19 charter / ADR-009 단계 5)

## Work Principles (4원칙 — 모든 작업 공통)

매 phase 마다 순환 적용. 모든 하위 프로젝트 동일.

1. **깊은 숙지 → plan.md 작성** — 관련 파일 전수 조사 후 `.claude/plans/plan{토픽}.md`.
2. **에이전트 팀 토론 → research.md 작성** — 3 에이전트 병렬 (공식문서 / 테크기업 사례 / Senior). Phase 4~6 부터 가벼운 sub-agent 전략 (Case 생략 + 시간 cap + 우선순위 read 만 → ~10배 단축, memory `feedback_lightweight_sub_agent.md`).
3. **사용자 승인 후 코드 착수** — plan + research 완성 후 반드시 질문. 일괄 승인 패턴 (5~6 핵심 결정 묶음, Auto Mode 호환).
4. **실패 시 Revert → 교훈 반영 → 1원칙 재시작** — Lessons Learned 섹션 plan.md 기록. 같은 실수 반복 금지.

## 핵심 디렉토리

- `plugins/context-ops/methodology-spec/` — 방법론 명세. 핵심 SSOT: `plugin-charter.md`(사용자 요구사항 R1~R18) / `lifecycle-contract.md`(stage×asset 매핑) / `plugin-authoring-spec.md`(Skill·Hook·Agent 저작 규칙) + workflow / deliverables / finding-system / id-conventions.
- `plugins/context-ops/flows/` — phase-flow SSOT. `analysis.phase-flow.json`(drift-validator 3-way 검증) + chain별 `discovery/spec/plan/test/implement.phase-flow.json` + `sdlc-4stage-flow.json`(revisit edges).
- `plugins/context-ops/docs/adr/` — ADR (설계 사상). BE / FE / CHAIN(chain harness paradigm) family.
- `plugins/context-ops/decisions/` — 운영/일정 결정 로그. `INDEX.md`=단일 진입점 / `STATUS.md`=휘발성 진행 상태.
- `plugins/context-ops/schemas/` — 산출물 JSON Schema (BE/FE/chain 산출물 + work-unit-manifest + dep-graph 등 / 모두 top-level `additionalProperties:false` strict).
- `plugins/context-ops/templates/` — 산출물 템플릿 (analysis + chain 6 stage: discovery/spec/plan/test/implement).
- `plugins/context-ops/tools/` — Node CLI 검증 도구 (drift / schema / chain-coverage / plan-coverage / extraction / traceability-builder / chain-driver 등). 단일 npm workspace.
- `plugins/context-ops/.claude-plugin/` — plugin manifest (`plugin.json` + `marketplace.json`) / Claude Code plugin 진입점.
- `plugins/context-ops/agents/` · `skills/` · `hooks/` — plugin 실행 자산 (6 stage 별 agent·skill + hooks).
- `plugins/context-ops/scripts/` — `build-plugin.js` + `version-check.js` + `release-readiness.js`(release gate).
- `plugins/context-ops/examples/` — PoC 산출물 (Spring / NestJS / React / Modern ORM OSS / 사내 legacy 등). 진행·종료 상태 = STATUS.md.
- `plugins/context-ops/archive/` — 진화 history (v1.0~v1.4).

## 정착 패턴 (메서드론 자산화)

- **F-015 cross-validation** — sub-agent 학습 코퍼스 의존 회피. 메인 raw fetch → sub-agent cross-check. (memory `feedback_sub_agent_validation.md`)
- **가벼운 sub-agent** — Phase 3 대비 ~10배 단축. (memory `feedback_lightweight_sub_agent.md`)
- **Composite View** — 복합 AP 등록 거절 + avoid-list.md 가독성. PoC #01 1건 → PoC #02 4건. (memory `feedback_composite_view_pattern.md`)
- **F-021 finding 임계** — 누적 5~15건 건강 / 20+ 명세 부실 의심. (memory `feedback_finding_threshold.md`)
- **no-simulation 정책 첫 실현 (v1.3.0)** — 자체 도구 (drift / dmn) + 진짜 외부 도구 (spectral) 양쪽 검증 시 ADR-009 단계 4 도달. 신뢰도 -5%p 패널티 회피 / 환경별 carry-over 분류 의무. (memory `feedback_no_simulation_realized.md`)
- **본체 격상 vs PoC 산출물 분리 원칙** — quality 격상 시 schemas/methodology-spec/docs/adr/tools 본체 격상이 examples/poc-XX/ 산출물 작업보다 우선. (v1.3.0 release 트리거, memory `feedback_methodology_body_priority.md`)

## 참고

- `plugins/context-ops/README.md` — 방법론 소개 (plugin install 가이드 + 시나리오 A/B/C)
- `plugins/context-ops/CHANGELOG.md` — 변경 이력 **단일 SSOT**. **현재 plugin.json v0.14.0** (2026-06-07 / living-sync S2 — drift subset-hash[Phase 4 선택적 #2 / 구 Phase 3b]: 공유 business-rules.json 의 cross-scope drift FP 제거 — scope 가 --bc 로 선언한 BC subset 만 재hash[BR 한정 / 그 외 canonical=file-hash] → BC-POST 변경이 BC-USER scope drift ❌ / register·detect·cascade 공유 결정적 subset 헬퍼 / **★ Senior REVISE@0.83 전건 사실검증**: BLOCKER-1 cascade bounded_contexts drop→file-hash 퇴화 fix·BLOCKER-2 재귀 canonical 직렬화[replacer-array nested-key drop 회피]·schema Ajv 테스트[비-CI-gated]·synthetic 1-domain opt-in·non-empty 만 부착 / chain-driver 445 / 직전 v0.13.0 S1 route per-BC dispatch·v0.12.0 Phase 4 펀더멘털 / 상세 = CHANGELOG [0.14.0]). **버전별 상세 narrative 는 CLAUDE.md 에 누적 금지** (CLAUDE.md = LLM 운영 컨텍스트 + 포인터만 / STATUS.md s73 lean 정책 동형 / 4중 중복[CHANGELOG+DEC+memory+CLAUDE] 회피 — 릴리스 시 본 줄의 "현재 vX" 한 곳만 갱신). 전체·상세 이력 = CHANGELOG.md / v8.x 이하 = CHANGELOG-HISTORY.md.
- `plugins/context-ops/guides/` — 사용자 journey 자산 (getting-started + chain-harness-guide + common-errors + first-prompt-cookbook)
- `plugins/context-ops/methodology-spec/plugin-charter.md` — **사용자 요구사항 18 단일 SSOT** (R1~R18 / R16·R17 scope-out / 활성 16 / R18 v7.1.0 plugin-authoring 신설 / DEC-2026-05-15-plugin-charter-17-requirements-채택 + DEC-2026-05-17-plugin-authoring-spec)
- `plugins/context-ops/archive/` — 진화 history (v1.3-adoption + phase-a-iteration + v1.4-evaluation / cleanup round 1 격리)
