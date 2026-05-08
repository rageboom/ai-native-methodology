# AI-Native 개발 방법론 — 작업 컨텍스트

본 레포는 사내 표준 AI-Native 개발 방법론. 다음 세션에서 작업 재개 시 본 파일이 컨텍스트.

> **휘발성 진행 상태** (PoC 통계 / 묶음 진행률 / 누적 finding) → [`decisions/STATUS.md`](ai-native-methodology/decisions/STATUS.md)
> **결정 이력** → [`decisions/INDEX.md`](ai-native-methodology/decisions/INDEX.md)

## 절대 우선순위

**품질 1순위 + 재작업 최소화 2순위**. 속도/quick win/컨텍스트 신선도 후순위.
격상/처분/순서 결정 시 §8.1 단일 PoC 과적합 회피 강제 적용. (memory `feedback_quality_priority.md`)

## ★★★ 본 방법론 가치 명세 (★ v2.0 / 2026-05-06 갱신)

```
INPUT (1차 = legacy single-case):  legacy 코드베이스
  ↓ analysis stage (chain 1단계 = 현 v1.5.x 자산)
  ↓
OUTPUT chain (★ v2.0 i-strict):
  [CHAIN 1] planning-spec     ── go/stop gate #1
  [CHAIN 2] behavior-spec + acceptance-criteria + 7대 산출물 통합  ── go/stop gate #2
  [CHAIN 3] test-spec + 실 test 코드 (RED 의무)  ── go/stop gate #3
  [CHAIN 4] impl-spec + 실 impl 코드 (GREEN / 100% test pass)  ── go/stop gate #4
  ↓
USE: AI 자동 생성 + 사용자 검토 / prod 시스템 + traceability-matrix
```

**SDLC 4단계 chain harness** ¹ (DEC-2026-05-06-v2.0-i-strict-채택 + DEC-2026-05-06-sub-plan-5-종결 + DEC-2026-05-06-sub-plan-6-종결 + ADR-CHAIN-001~005). round-trip = ★ ★ chain harness gate 안에서 정식 허용. harness 외부 자동 코드 생성 ❌.

> ¹ ★ ★ ★ ★ ★ **호칭 전환** (DEC-2026-05-06-sub-plan-6-종결 / 2026-05-06 / v2.0.0-rc1):
> - sub-plan-1~4 = `chain harness scaffolding` (부품) — 역사 기록 보존.
> - sub-plan-5 = `chain harness` (5 요소 코드 enforcement / 198 test).
> - **★ ★ ★ ★ ★ sub-plan-6 (현재) / v2.0.0-rc1** = `chain harness validated` — §8.1 strict 7/7 ✅ + ≥ 2 PoC corroboration ✅ (PoC #05 e2e + PoC #03 retrofit) / 210 test pass.
> - ★ no-simulation 정책 enforcement 완성 — trio (state.blocked + cli exit 2 + PreToolUse deny) + D21' (suppressOutput=true) + release-readiness content-aware (file presence ❌) 로 양심 의존 차단.

★ ★ ★ **70~80% 한계 = 명시 잔존**. AI 자동화 ≥ 85% / 사람 검토 (gate #1~#4) ≤ 15% / 100% 자동화 ❌.

★ ★ revisit loop (자동 감지 + 사용자 결단): chain-revisit-detector → 사용자 prompt → go/stop. stop 시 임의 stage jump.

### 산출물 이식성 5종 (★ chain 2 단계 통합 / 변경 ❌)

| 산출물 | 활용도 |
|---|---|
| rules.json (BR) / domain.json / openapi.yaml | ★★★ 그대로 입력 (언어/환경 100% 무관) |
| schema.json + erd.mermaid | ★★★ 입력 + DB 타입 매핑 (RDB 내 90% 무관) |
| antipatterns.json + migration-cautions.md | ★★★ 회피 목록 (패턴 단위 무관) |

### v2.0 신규 chain 산출물 6종 (★ sub-plan-2 신설 carry)

| 산출물 | chain | 역할 |
|---|---|---|
| planning-spec.{json,md} | 1 | legacy 분석 결과 → 비즈니스 의도 추출 (1차 single-case) |
| behavior-spec.{json,md} | 2 | Phase 4.5 + planning use_cases 통합 BHV-* (executable contract) |
| acceptance-criteria.{json,md} | 2 | Gherkin BDD AC-* / verifiable 의무 / MoSCoW |
| test-spec.{json,md} | 3 | TC-* + 실 test 코드 + 5종 물증 (RED) |
| impl-spec.{json,md} | 4 | IMPL-* + 실 impl 코드 + 100% test pass (GREEN) |
| traceability-matrix.{json,md,mermaid} | cross | UC→BHV→AC→TC→IMPL forward+backward link |

(memory `project_methodology_scope.md` / master plan `~/.claude/plans/a-stateful-gadget.md`)

## ★★★ Static Tool 시뮬레이션 절대 금지

Phase 4.5 검증 / 모든 cross-validation 단계에서:
- ❌ AI sub-agent 에 "Static Analyzer / Daikon / Semgrep persona" 부여 시뮬레이션 금지
- ✅ 진짜 외부 도구 (Semgrep / PMD / SpotBugs / Daikon / CodeQL / SonarQube) 실제 실행 의무
- ✅ 환경 부재 시 사용자에게 환경 준비 요청 또는 사용자 위임 (CI) 명시
- ✅ 시뮬레이션 사용 시 신뢰도 -5%p 패널티 + "진짜 도구 미실행" 명시 의무

(memory `feedback_no_static_tool_simulation.md`, Sprint 4 하네스 자동 차단)

## Work Principles (4원칙 — 모든 작업 공통)

매 phase 마다 순환 적용. 모든 하위 프로젝트 동일.

1. **깊은 숙지 → plan.md 작성** — 관련 파일 전수 조사 후 `.claude/plans/plan{토픽}.md`.
2. **에이전트 팀 토론 → research.md 작성** — 3 에이전트 병렬 (공식문서 / 테크기업 사례 / Senior). Phase 4~6 부터 가벼운 sub-agent 전략 (Case 생략 + 시간 cap + 우선순위 read 만 → ~10배 단축, memory `feedback_lightweight_sub_agent.md`).
3. **사용자 승인 후 코드 착수** — plan + research 완성 후 반드시 질문. 일괄 승인 패턴 (5~6 핵심 결정 묶음, Auto Mode 호환).
4. **실패 시 Revert → 교훈 반영 → 1원칙 재시작** — Lessons Learned 섹션 plan.md 기록. 같은 실수 반복 금지.

## 핵심 디렉토리

- `ai-native-methodology/methodology-spec/` — 방법론 명세 (workflow 11 + deliverables 1~15 + glossary-ko + finding-system + id-conventions + lifecycle-contract + ★ skills-axis — phase ID 와 skills 디렉토리 axis 분리 정책 / v1.4.4 신설)
- `ai-native-methodology/flows/analysis.phase-flow.json` — ★ ★ ★ phase 순서 + 의존 그래프 + skills 매핑의 단일 SSOT (★ v1.4.4 정식 승격 / drift-validator 3-way 검증 강제 / `methodology-spec/skills-axis.md` 정합)
- `ai-native-methodology/docs/adr/` — ADR-001~010 (BE) + ADR-FE-001~007 (FE) ※ ADR-007 부재 — openapi-extension.schema.json 으로 대체
- `ai-native-methodology/decisions/` — 운영/일정 결정 로그 (역시간순, INDEX.md 단일 진입점) + STATUS.md (휘발성 상태)
- `ai-native-methodology/schemas/` — JSON Schema (13종 — BE 5 + FE 8)
- `ai-native-methodology/templates/` — 산출물 템플릿 (★ analysis/ + design/test/implement/planning placeholder + ★ adoption/ — 사내 적용 진입점 customization)
- `ai-native-methodology/tools/` — Node CLI 도구 12종 (drift-validator / decision-table-validator / formal-spec-link-validator / spectral-runner / static-runner / schema-validator / planning-extraction-validator / chain-coverage-validator / spec-test-link-validator / traceability-matrix-builder / test-impl-pass-validator / ★ ★ ★ chain-driver — sub-plan-5 / harness 5 요소 enforcement) — ★ 자체 package.json 독립 + npm workspace
- `ai-native-methodology/.claude-plugin/` — plugin manifest (plugin.json + marketplace.json) / Claude Code plugin 시스템 진입점
- `ai-native-methodology/agents/` + `skills/` + `hooks/` + `flows/` — plugin 자산 (★ install 후 자연어 prompt 매칭 / lifecycle stage organize)
- `ai-native-methodology/scripts/` — build-plugin.js + version-check.js (★ v1.4.3 도입 / build artifact `dist/ai-native-methodology-v<version>/` 추출 / cleanup round 2-E `internal-` prefix 제거 → plugin user 환경 path 정합)
- `ai-native-methodology/examples/poc-01-realworld-spring/` — PoC #01 (Java/Spring Boot 2.5) ✅ 종료
- `ai-native-methodology/examples/poc-02-realworld-springboot3/` — PoC #02 (Java/Spring Boot 3.3 Hexagonal) ✅ 종료
- `ai-native-methodology/examples/poc-03-realworld-nestjs/` — PoC #03 (TypeScript/NestJS) ✅ 종료 (★ platform-agnostic 입증)
- `ai-native-methodology/examples/poc-04-full-realworld-react/` — PoC #04 (TypeScript/React FSD / yurisldk fork) ✅ 종료 (★ FE 트랙 + §8.1 strict 검증대 통과)
- `ai-native-methodology/archive/` — 진화 history (★ v1.0~v1.1.2 metadata + v1.3-adoption + v1.4-evaluation + phase-a-iteration / cleanup round 1 격리)

## 정착 패턴 (메서드론 자산화)

- **F-015 cross-validation** — sub-agent 학습 코퍼스 의존 회피. 메인 raw fetch → sub-agent cross-check. (memory `feedback_sub_agent_validation.md`)
- **가벼운 sub-agent** — Phase 3 대비 ~10배 단축. (memory `feedback_lightweight_sub_agent.md`)
- **Composite View** — 복합 AP 등록 거절 + avoid-list.md 가독성. PoC #01 1건 → PoC #02 4건. (memory `feedback_composite_view_pattern.md`)
- **F-021 finding 임계** — 누적 5~15건 건강 / 20+ 명세 부실 의심. (memory `feedback_finding_threshold.md`)
- **★★★ no-simulation 정책 첫 실현 (v1.3.0)** — 자체 도구 (drift / dmn) + 진짜 외부 도구 (spectral) 양쪽 검증 시 ADR-009 단계 4 도달. 신뢰도 -5%p 패널티 회피 / 환경별 carry-over 분류 의무. (memory `feedback_no_simulation_realized.md`)
- **본체 격상 vs PoC 산출물 분리 원칙** — quality 격상 시 schemas/methodology-spec/docs/adr/tools 본체 격상이 examples/poc-XX/ 산출물 작업보다 우선. (★ v1.3.0 release 트리거, memory `feedback_methodology_body_priority.md`)

## 참고

- `ai-native-methodology/README.md` — 방법론 소개 (★ v2.1.0 plugin install 가이드 + 시나리오 A/B/C)
- `ai-native-methodology/CHANGELOG.md` — 변경 이력 (★ ★ ★ ★ ★ ★ ★ 현재 **v2.2.0 MINOR FINAL — phase 4.8 sql-inventory + ADR-CHAIN-008 paradigm-cross 정책 완화 + cooling-off 영구 폐기** — DEC-2026-05-08-v2.2.0-final / ★ ★ ★ ★ ★ 5 PoC SQL Inventory isomorphic robust [66.7% × 5 / 6 차원 corroboration sum: paradigm + ORM + platform + language + responsibility + scale] / ADR-CHAIN-008 "MEDIUM × ≥ 5 PoC = strong" 신정책 / git tag v2.2.0 / chain harness validated 정식 v2.0.0 + v2.1.0 phase 4.7 + v2.1.1 ratchet trend 모두 보존)
- `ai-native-methodology/guides/` — ★ ★ 사용자 journey 자산 (cleanup round 2-C 신설 / getting-started + chain-harness-guide + common-errors + first-prompt-cookbook)
- `ai-native-methodology/archive/v1.3-adoption/v1.3-promotion-report.md` — v1.3 격상 보고 (3 PoC 통합 + 사내 적용 ROI 견적 / cleanup round 1 격리)
- `ai-native-methodology/archive/phase-a-iteration/phase-a-iteration-guide.md` — Phase A self-iteration 절차 (★ install / SessionStart hook / skill trigger / 마찰점 finding template / cleanup round 1 격리 / v2.0 chain harness paradigm 후 outdated)
- `ai-native-methodology/archive/v1.3-adoption/lessons-learned-2026-05-02.md` — ★ 14차 결단 1일 retract Lessons Learned (cleanup round 1 격리)
