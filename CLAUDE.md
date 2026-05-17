# AI-Native 개발 방법론 — 작업 컨텍스트

본 레포는 사내 표준 AI-Native 개발 방법론. 다음 세션에서 작업 재개 시 본 파일이 컨텍스트.

> **휘발성 진행 상태** (PoC 통계 / 묶음 진행률 / 누적 finding) → [`decisions/STATUS.md`](ai-native-methodology/decisions/STATUS.md)
> **결정 이력** → [`decisions/INDEX.md`](ai-native-methodology/decisions/INDEX.md)

## 절대 우선순위

**품질 1순위 + 재작업 최소화 2순위**. 속도/quick win/컨텍스트 신선도 후순위.
격상/처분/순서 결정 시 §8.1 단일 PoC 과적합 회피 강제 적용. (memory `feedback_quality_priority.md`)

## ★★★ 본 방법론 가치 명세 (★ v3.6.2 / 2026-05-15 갱신 / paradigm 진화 안정점)

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

> ¹ ★ ★ ★ ★ ★ **호칭 전환 + paradigm 진화 사실** (역사 기록 보존):
> - sub-plan-1~4 = `chain harness scaffolding` (부품 / v2.0).
> - sub-plan-5 = `chain harness` (5 요소 코드 enforcement / 198 test / v2.0).
> - sub-plan-6 = `chain harness validated` (§8.1 strict 7/7 + ≥ 2 PoC corroboration / 210 test / v2.0.0-rc1).
> - **★ ★ ★ ★ ★ 현재 (v3.6.2 / 2026-05-15)** = paradigm 진화 안정점 — charter §3 활성 Gap 모두 청산 (G2~G5 종결 / G1 영구 scope-out) + 잔여 carry 7종 모두 정리 + plugin must-have 자산 대칭 (R1~R15 = 15/15 / R16~R17 = scope-out). workspace test 359/359 ✅ + release-readiness 9/9 ✅.
> - ★ no-simulation 정책 enforcement 완성 — trio (state.blocked + cli exit 2 + PreToolUse deny) + D21' (suppressOutput=true) + release-readiness content-aware (file presence ❌) 로 양심 의존 차단.

★ ★ ★ **70~80% 한계 = 명시 잔존** (★ **chain harness 전체 자동화 axis** / process 통과율 metric). AI 자동화 ≥ 85% / 사람 검토 (gate #1~#4) ≤ 15% / 100% 자동화 ❌.

★ ★ ★ **analysis 단계 §3-A automation = 별도 axis** (★ R1' / DEC-2026-05-13-r1-prime-본체-명문화 / 6 PoC 사실 / sub-rule `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` §X 정합):

| paradigm | analysis §3-A ceiling | corroboration | ★ 측정 환경 |
|---|---|---|---|
| Spring 4.1 + iBATIS 2 (Legacy) | **~53~55%** | ★ 3 사내 PoC isomorphic (PoC #06+#07+#11) | 사내 EFI-WEB |
| Modern (MyBatis 3 / TypeORM / Spring Data JPA) | **~60~67%** | ★ 3 OSS PoC corroboration (PoC #08+#09+#10) | ★ ★ **OSS 한정 / 사내 Modern 재측정 의무** |

★ ★ chain harness 70~80% axis 와 analysis §3-A automation axis = ★ ★ **별도 metric** (★ metric 분모 자체 다름 / chain harness = chain 1~4 통합 gate 통과율 / §3-A = analysis 단방향 추출률 / 외부 인용 시 axis 혼동 회피 의무). 외부 권위: Wang ICSE 2025 + LongCodeBench 2025 + AWS SCT 자릿수 정합 + ThoughtWorks "GenAI for forward engineering" isomorphic 사상.

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

- `ai-native-methodology/methodology-spec/` — 방법론 명세 (workflow + deliverables + glossary-ko + finding-system + id-conventions + lifecycle-contract + skills-axis + ★ **plugin-charter.md** (v3.6.0 / R1~R17 SSOT / 활성 Gap 모두 청산) + ★ **lifecycle-contract.md §자산 매핑 매트릭스** (v3.5.0 G5 종결 / stage × asset 5 column 단일 SSOT) + ★ **plugin-authoring-spec.md** (v7.1.0 / R18 / Skill·Hook·Agent·Packaging 저작 규칙 + 공식 docs pin baseline 단일 SSOT / release-readiness #12 staleness 가드))
- `ai-native-methodology/flows/` — `analysis.phase-flow.json` (단일 SSOT / drift-validator 3-way 검증) + `planning/spec/test/implement.phase-flow.json` (chain 1~4) + `sdlc-4stage-flow.json` (revisit_edges 6종)
- `ai-native-methodology/docs/adr/` — ADR-001~010 (BE) + ADR-FE-001~007 (FE) + ★ **ADR-CHAIN-001~012** (chain harness paradigm) + ADR-BE-001 (negative-space corroboration) ※ ADR-007 부재 — openapi-extension.schema.json 으로 대체
- `ai-native-methodology/decisions/` — 운영/일정 결정 로그 (역시간순, INDEX.md 단일 진입점) + STATUS.md (휘발성 상태 / session 19차까지 누적)
- `ai-native-methodology/schemas/` — **JSON Schema 39종** (BE + FE + chain 산출물 + work-unit-manifest + state + error-mapping-spec + sql-inventory 등 / 모두 top-level `additionalProperties:false` strict / cleanup round 9 정합)
- `ai-native-methodology/templates/` — 산출물 템플릿 (analysis/ + planning/ + spec/ + test/ + implement/ + design/)
- `ai-native-methodology/tools/` — **Node CLI 도구 17종** (drift-validator + decision-table-validator + formal-spec-link-validator + spectral-runner + static-runner + schema-validator + planning-extraction-validator + chain-coverage-validator + spec-test-link-validator + traceability-matrix-builder + test-impl-pass-validator + ★ chain-driver + characterization-coverage-validator + sql-inventory-extractor + findings-aggregator + ★ br-cross-consistency-validator (v2.5.0 Layer 2 LLM paradigm) + ★ skill-citation-validator (v8.1.0 R18 내부정합 / v8.1.1 repo-wide active 표면 / 인용 dead-link 결정적 차단)) — ★ 단일 npm workspace
- `ai-native-methodology/.claude-plugin/` — plugin manifest (plugin.json v8.3.0 + marketplace.json) / Claude Code plugin 시스템 진입점
- `ai-native-methodology/agents/` (★ v4.0 multi-agent — 5 stage agent + 3 base persona + 1 spike = 9종) + `skills/` (**47종** / 5 stage organize / v2.6.0 의미 ID + v3.x 진화) + `hooks/` + `flows/` — plugin 자산
- `ai-native-methodology/scripts/` — build-plugin.js + version-check.js + release-readiness.js (★ 13/13 strict criterion 검증 / #12 = plugin-authoring-spec §6 공식 docs staleness + v8.2.0 digest_sha content-commitment + ★ v8.2.1 `_base-` 8 allowlist no-loophole 결정적 assert / #13 = skill-citation-validator 인용 dead-link)
- `ai-native-methodology/examples/` — **PoC 14종** (#01 Spring Boot 2.5 / #02 Spring Boot 3.3 Hexagonal / #03 NestJS / #04 full-React FSD / #04 mini-React / #05 sample-user-register / #06~#07+#11 Spring 4.1 + iBATIS 2 사내 EFI-WEB (R1' axis legacy) / #08~#10 Modern ORM OSS (MyBatis 3 + TypeORM + JPA QueryDSL / R1' axis modern) / #12 RawSQL user-decided / #13 QueryDSL user-decided) ✅ 모두 종료
- `ai-native-methodology/archive/` — 진화 history (v1.0~v1.4 metadata + adoption + evaluation / cleanup round 1 격리)

## 정착 패턴 (메서드론 자산화)

- **F-015 cross-validation** — sub-agent 학습 코퍼스 의존 회피. 메인 raw fetch → sub-agent cross-check. (memory `feedback_sub_agent_validation.md`)
- **가벼운 sub-agent** — Phase 3 대비 ~10배 단축. (memory `feedback_lightweight_sub_agent.md`)
- **Composite View** — 복합 AP 등록 거절 + avoid-list.md 가독성. PoC #01 1건 → PoC #02 4건. (memory `feedback_composite_view_pattern.md`)
- **F-021 finding 임계** — 누적 5~15건 건강 / 20+ 명세 부실 의심. (memory `feedback_finding_threshold.md`)
- **★★★ no-simulation 정책 첫 실현 (v1.3.0)** — 자체 도구 (drift / dmn) + 진짜 외부 도구 (spectral) 양쪽 검증 시 ADR-009 단계 4 도달. 신뢰도 -5%p 패널티 회피 / 환경별 carry-over 분류 의무. (memory `feedback_no_simulation_realized.md`)
- **본체 격상 vs PoC 산출물 분리 원칙** — quality 격상 시 schemas/methodology-spec/docs/adr/tools 본체 격상이 examples/poc-XX/ 산출물 작업보다 우선. (★ v1.3.0 release 트리거, memory `feedback_methodology_body_priority.md`)

## 참고

- `ai-native-methodology/README.md` — 방법론 소개 (plugin install 가이드 + 시나리오 A/B/C)
- `ai-native-methodology/CHANGELOG.md` — 변경 이력. **현재 v8.3.0 MINOR** (2026-05-18 / 사용자 "시뮬레이션…모든 단계에서 목표 정합·비효율 확인" → 데스크 워크스루 감사 (no-simulation 무충돌) / poc-05+poc-03 cross-validation → 11 finding (**F-SIM-001~011 / Body Finding Ledger F-SIM namespace 신설**) / 단일 PoC 특이 0 + 4 RealWorld 악화 = **방법론 구조 결함 확정** / 공통 뿌리 1개 "*링크 존재 강제* vs *링크 의미 보존 미강제*". 사용자 "권고안 그대로 시행" 묶음 결단 D1~D9 후 P0 시행 (additive / breaking 0): F-SIM-002 traceability-matrix-builder severity max-propagation (BR/AP/AC.MoSCoW SSOT-anchored — ISO 26262 Part 9 ASIL inheritance + IEC 62304 Class A/B/C / DMN 약함 — 인용 교체) / F-SIM-004 matrix BR+AP 1급 축 (`business_rule_ids[]` + `antipattern_ids[]` cells + md/mermaid render — DO-178C requirements axis ★★★) / F-SIM-003 chain-coverage-validator `validateCrossRefPaths` + `--strict-paths` flag warn default (LL-i-55 함정존 회피 / v+1 default 전환 carry) / F-SIM-001 antipattern-coverage lane (`validateAntipatternCoverage` / SonarQube+CodeQL+Snyk industry-aligned / gate #2 추가) / F-SIM-011 release_eligibility `corroboration_depth_levels` L0~L3 명시 + poc-03 L1 격하 + self_consistency_note "v8.3.0=정의강화/사실미충족 패러독스 잔존" + P1 deadline 2026-06-01 commit-block. 3-에이전트 research (Senior GO 0.82 + Official-docs F-015 ×5 + Industry-case 9 case all industry-aligned) — H3 반증 = F-SIM-005 ledger Beck-canonical 수정 (compile-import-fail=valid RED). §8.1 자기정합 D9 pre-sweep ≥3 PoC (poc-05+poc-03+poc-04-mini = BE+FE 횡단 ★★★). self-bootstrap pass (poc-05 AC.related_brs/aps + planning.excluded_antipatterns:AP-USER-003 + cross_refs sync → exit=0 severe-AP-uncovered=0). schema 5 신규 field 전부 optional (11 PoC 0-regression) + workspace test 395→**414** (+19 신규) / drift-validator 3-way / release-readiness **13/13 ready:true** / skill-citation 0 stale / DEC-2026-05-17-chain-harness-e2e-simulation-audit + plan-fsim-p0 + research-fsim-p0. **P1 carry (DEC commit-block 2026-06-01)**: F-SIM-005 fail_mode enum + corroboration #2 신규 PoC chain 4 GREEN. 직전 release 요약 (역순):
  - **v8.2.3 PATCH** (2026-05-17 / 확장 감사 methodology-body: Area E deliverables 25 + Area F schemas 39 + Area G tools 18 = **82 단위** / GREEN 74 / RED 8 / post-dedupe F-MB 9건 / Body Finding Ledger F-MB namespace 신설 / corrective resolved 8 + deferred 1(F-MB-009) / breaking 0 / DEC-2026-05-17-plugin-authoring-mb-audit)
  - **v8.2.2 PATCH** (plugin-authoring 4영역 60 단위 파일별 품질 감사 + L2 인용 drift corrective sweep / L1 60/60 PASS·결함 전부 L2 drift / resolved 8 F-PA-001~009 + wontfix 2[F-PA-007·010] / Body Finding Ledger F-PA namespace 신설 / 메타=skill-citation bare artifact-name L2 사각 본 감사가 메움+ground-truth 재작업 2건 차단 / STOP-3 13/13 / DEC-2026-05-17-plugin-authoring-file-audit / ADR-PLUGIN-001 §7 patch v6 + §8 LL-plugin-04)
  - **v8.2.1 PATCH** (§8-2 `_base-*` documented-exception 종결 / backlog 잔여 0 / 실 F-015 charset verbatim 확인하되 violation enforcement 미문서화 = nominal not functional / Senior GO 0.88 → rename(MAJOR ~195 occ) 회피 documented-exception / 8 frozen allowlist + check#12 no-loophole assert + skills digest_sha ea06→b8b2 자기 dogfood / DEC-2026-05-17-base-prefix-documented-exception / ADR-PLUGIN-001 §7 patch v5 + §8 LL-plugin-03)
  - **v8.2.0 MINOR** (공식 docs F-015 ×5 재검 / skills·sub-agents·plugins VERIFIED-IDENTICAL · hooks VERIFIED-WITH-DELTA / Explore pre-research 가설 3건 실 F-015 전부 반증 LL-plugin-02 / §2 S8+§3 H8 additive(거짓 0) / ★ META = §6 digest_sha 컬럼 + check#12 sha 재계산 assert + §9 Layer i VERIFIED 분기 / check 13 유지 / DEC-2026-05-17-plugin-authoring-docs-drift / ADR-PLUGIN-001 §7 patch v4 + §8 LL-plugin-02)
  - **v8.1.1 PATCH** (skill-citation-validator **repo-wide 확장**(SKILL.md→전 활성 표면) + 결함 교정(DEC/ADR exact→prefix-match·relative-path 해석·ABSENCE_CTX 확장·migration/absorption 표 인식) + EXCLUDE(history·dist·examples·docs/adr=immutable·templates/adoption=scaffold) / repo-wide raw → HISTORY 453+POC 41 정직분리 → 활성 표면 실 stale 31/15file → **0** / 동일 schema-drift class 활성 SSOT 잔존 수정 / FP 정확분리 무수정 / dogfood green + test 2/2 / corrective·non-breaking / DEC-2026-05-17-repo-wide-citation-scan / ADR-PLUGIN-001 §7 patch v3)
  - **v8.1.0 MINOR** (`skill-citation-validator` 신설(npm workspace 17번째) + 47 SKILL.md stale 인용 정합 / 사용자 "내용 로직도 확인 가능한가" → A(내부 정합 결정적) → "수정+도구화" / 결정적 스캔 37 stale dead-link → 14 SKILL.md/20 인용 정밀수정(LL-i-55) / 기존 validator 전 사각 회복 / release-readiness check #13 신설 12→13/13 / DEC-2026-05-17-skill-citation-integrity / ADR-PLUGIN-001 §7 patch v2)
  - **v8.0.0 MAJOR** (skill rename `spec-integrate-7대-deliverables`→`spec-integrate-deliverables` — 한글→kebab / command-surface breaking / 사용자 "1 바꾸자" → ADR-PLUGIN-001 §8-1 deferred 시행 / Senior GO+REVISE conf 0.88 / 실측 19 occ·13 files / git mv + 활성코드 5 + 활성문서 7 + SSOT content-aware / audit-time 기록 보존(LL-i-52) / LL-i-55 trap 회피 / P2′ MAJOR 비협상 / STOP-3 hard gate (sweep A/B/C + drift 3-way + release-readiness 12/12 incl check#12 dogfood) / DEC-2026-05-17-skill-name-rename / ADR-PLUGIN-001 §7 patch v1)
  - **v7.1.0 MINOR** (`plugin-authoring-spec.md` 단일 SSOT 신설 + `ADR-PLUGIN-001` + charter **R18** + release-readiness **#12** / 외부 권위(공식 Claude Code docs) drift = ADR-010 baseline+ratchet 차용 (네트워크 재검증 cadence + 결정적 staleness 가드 60일 2계층) / §6 pin = 실 `_base-official-docs-checker` F-015 ×4 VERIFIED / 47 skills·9 agents·hooks·packaging 전수 감사 — 실 cross-check false-positive 3건 제거 (S1 retrofit 불요·marketplace 위치 정합·agent `skills:` 공식필드) / 선행 housekeeping package.json 3-way (DEC-2026-05-17-package-version-3way-sync-fix) / DEC-2026-05-17-plugin-authoring-spec)
  - **v7.0.0 MAJOR** (2026-05-17 / 묶음 Q ⑦: 산출물 파일명 `rules.json` → `business-rules.json` + `schemas/rules.schema.json` → `schemas/business-rules.schema.json` rename (git mv 12 history-preserving / $id 정합 변경) — 묶음 Q 최대 blast(642 occ·252 files) / D1 v7.0.0 MAJOR 사실 확정 (official-docs 파일명=계약→MAJOR / industry ESLint v9 외부 consumer 0=즉시 MAJOR / Senior CONCUR artifact contract+literal consumer = Q-①-followup MINOR 와 결정적 차이 / LL-i-56 real-tier) / Senior REVISE-3 실측 정정 (PoC schema key 3 $schema_ref·1 $schema_origin·7 무키 / 코드 literal 3곳) / ★ ★ STOP-3 post-mv hard gate 가 plan·research(Senior 포함) 누락 6 test 파일 hardcoded literal 검출→동반 치환 = LL-i-55 paradigm 본격 입증 / schema-validator 11 PoC VALID + workspace 393/393 + release-readiness 11/11 + 역사 무수정 / breaking ✅의도 / DEC-2026-05-17-q7-rules-json-rename / ADR-CHAIN-011 §5 patch v16 + §9 LL-i-57 / ★ 묶음 Q ①②④⑤+Q-①-followup+⑦ 전 항목 종결)
  - **v6.1.0 MINOR** (Q-①-followup: `rules_auto_extracted_reference` → `auto_extracted_br_refs` semantic-rename — src consumer 0 + poc-04 atomic = textbook MINOR additive-equivalent / v7.0.0=semver inflation 회피 / DEC-2026-05-17-q1-followup-rename / ADR §5 patch v15 + §9 LL-i-56)
  - **v6.0.0 MAJOR** (묶음 Q ② BR 표현 4종 → 2종 단일화 — businessRule anyOf 4 branch(GWT/NL/description/TCA) → 2 branch(GWT+NL) / description·TCA property = optional metadata 보존 (Senior close round — decision-table-validator load-bearing consumer 보호) / description-only·TCA-only INVALID / #06 7 BR 합성 (Sonnet 4.6 + 독립 Opus spot-check 4/7) / STOP-1 dry-run 회귀 아닌 개선 / DEC-2026-05-17-q2-br-표현-4to2 / ADR §5 patch v14 + §9 LL-i-54·55 / 영향 3 패키지 58/58 + release-readiness 11/11)
  - **v5.0.0 MAJOR** (묶음 Q ① rules.json alias 4중첩 폐기 → canonical 단일 — top-level `anyOf` 3분기 폐기 → `required:[business_rules]` + 5 alias property 제거 (additionalProperties:false hard reject) / 4 PoC 5 key rename / extractRules canonical 단일 + poc-04 잠재결함 자동수정 / STOP-1 해소 실측 / ADR-CHAIN-011 §5 patch v13 + §9 LL-i-52·53 / workspace 381→387 + release-readiness 11/11)
  - **v4.1.1 PATCH** (묶음 Q ④ severity cross-stage 정합 매핑 SSOT — severity-cross-stage-mapping.md / rules 5종↔ratchet 4종↔MoSCoW 3종 / additive doc)
  - **v4.1.0 MINOR** (Phase 2 ⑤ cross_consistency_check 신설 + is_intent⇔intent_vs_bug_classification 양방향 동치 if/then enforcement / 정제된 옵션 C / 실측 both=0=회귀0 / functional test = 모순 실제 거부 입증 / ADR-CHAIN-011 §5 patch v12 + §9 LL-i-51)
  - **v4.0.1 PATCH** (rules schema enforcement 강화 / ③ source_grounded required if/then + ⑥ intent_vs_bug_classification $ref SSOT + H-1/H-2 housekeeping)
  - **v4.0.0 MAJOR** (multi-agent paradigm 본격 채택 / stage 별 sub-agent 5종 + 3 base + spike 1종 / DEC-2026-05-15-g5 retract)
  - **v3.6.9 PATCH** (A3 시행 / README + guides 외부 인지 자산 sync)
  - **v3.6.x PATCH** (A1+A2+R1~R4 / 11/11 release-readiness + INDEX archive + STATUS archive)
  - **v3.6.2 PATCH** (잔여 carry 묶음 정리 / paradigm 진화 안정점)
  - **v3.6.1 PATCH** (cross-link 문서 보강 / agents/README 신설)
  - **v3.6.0 MINOR** (G1 ITSM 영구 scope-out / charter §3 활성 Gap 모두 청산)
  - **v3.5.0 MINOR** (G5 종결 / lifecycle 자산 매핑 매트릭스 단일 SSOT — ★ ★ v4.0 안 retract 대상)
  - **v3.4.0 MINOR** (G4 종결 / FE skill 보강 — implement-react + implement-vue + test-playwright + analysis-html-template)
  - 더 이전 (v3.3 / v3.2 / v3.1 / v2.6 / v2.5 / v2.4 / v2.3 / v2.2 / v2.1 / v2.0~v1.x) = CHANGELOG.md 참조.
- `ai-native-methodology/guides/` — 사용자 journey 자산 (getting-started + chain-harness-guide + common-errors + first-prompt-cookbook)
- `ai-native-methodology/methodology-spec/plugin-charter.md` — ★ ★ ★ **사용자 요구사항 18 단일 SSOT** (R1~R18 / R16·R17 scope-out / 활성 16 / ★ R18 v7.1.0 plugin-authoring 신설 / DEC-2026-05-15-plugin-charter-17-requirements-채택 + DEC-2026-05-17-plugin-authoring-spec)
- `ai-native-methodology/archive/` — 진화 history (v1.3-adoption + phase-a-iteration + v1.4-evaluation / cleanup round 1 격리)
