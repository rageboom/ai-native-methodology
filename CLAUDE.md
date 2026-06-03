# AI-Native 개발 방법론 — 작업 컨텍스트

본 레포는 사내 표준 AI-Native 개발 방법론. 다음 세션에서 작업 재개 시 본 파일이 컨텍스트.

> **휘발성 진행 상태** (PoC 통계 / 묶음 진행률 / 누적 finding) → [`decisions/STATUS.md`](ai-native-methodology/decisions/STATUS.md)
> **결정 이력** → [`decisions/INDEX.md`](ai-native-methodology/decisions/INDEX.md)

## 절대 우선순위

**품질 1순위 + 재작업 최소화 2순위**. 속도/quick win/컨텍스트 신선도 후순위.
격상/처분/순서 결정 시 §8.1 단일 PoC 과적합 회피 강제 적용. (memory `feedback_quality_priority.md`)

## ★★★ 본 방법론 가치 명세 (★ v11.7.0 / 2026-05-30 갱신 / use-scenario taxonomy + AX 운영 정체성)

> ★ ★ ★ **가장 큰 목적 (P0 / DEC-2026-05-30-use-scenario-taxonomy)**: 산출물 = "시스템 설명 문서"가 아니라 **LLM 의 운영 컨텍스트 그 자체**. 방법론의 가장 큰 목적 중 하나 = 이 컨텍스트를 평생 유지·동기화하여 **프로젝트를 AX 로 운영**(LLM 이 정확한 컨텍스트로 develop·run·modify·evolve)하는 것. 4 시나리오(★ **S2 AX전환 = 주 타깃** / S1 재생성 / S3 특성화 / greenfield)는 **bootstrap 입력만 다르고 모두 같은 정상 상태 "AX 운영"으로 수렴**. greenfield 도 입력어댑터 analysis 로 산출물 생성 = 처음부터 AX-native. 산출물 = 모든 stage 의 base + 기능추가 시 역동기화(양방향). SSOT = `methodology-spec/use-scenario-taxonomy.md`.

```
INPUT (★ 4 use-scenario / DEC-2026-05-30):  S2 AX전환(주 타깃) / S1 재생성 / S3 특성화 = legacy 코드 / greenfield = PRD·디자인·계약
  ↓ analysis stage = 코드-고고학 패스(legacy) + 입력어댑터 패스(공통 / greenfield 는 이것만 / 현 v1.5.x 자산)
  ↓
OUTPUT chain (★ v9.0 6-stage / planning→discovery 개칭 + plan 신설 / DEC-2026-05-21+DEC-2026-05-23-discovery-stage-v9):
  [CHAIN 1] discovery: discovery-spec (입력 어댑터 4종 analysis-output/swagger/figma/nl-md)  ── go/stop gate #1
  [CHAIN 2] spec: behavior-spec + acceptance-criteria + 7대 산출물 통합  ── go/stop gate #2
  [CHAIN 3] plan: task 분해/의존성/ADR/NFR/risk  ── go/stop gate #3
  [CHAIN 4] test: test-spec + 실 test 코드 (RED 의무)  ── go/stop gate #4
  [CHAIN 5] implement: impl-spec + 실 impl 코드 (GREEN / 100% test pass)  ── go/stop gate #5
  ↓
USE: AI 자동 생성 + 사용자 검토 / prod 시스템 + traceability-matrix
```

**SDLC 5단계 chain harness** (★ v10.0.0 / discovery → spec → plan → test → impl / DEC-2026-05-06-v2.0-i-strict-채택 + DEC-2026-05-21-chain-discovery-plan-stage-도입 + DEC-2026-05-25-axis-a-phase-4-4-prime + ADR-CHAIN-001~012). round-trip = ★ ★ chain harness gate 안에서 정식 허용. harness 외부 자동 코드 생성 ❌. ★ chain N = gate #N 1:1 INTERNAL CONVENTION.

★ ★ ★ **70~80% 한계 = 명시 잔존** (★ **chain harness 전체 자동화 axis** / process 통과율 metric). AI 자동화 ≥ 85% / 사람 검토 (gate #1~#5) ≤ 15% / 100% 자동화 ❌.

★ ★ ★ **analysis 단계 §3-A automation = 별도 axis** (★ R1' / DEC-2026-05-13-r1-prime-본체-명문화 / 6 PoC 사실 / sub-rule `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` §X 정합):

| paradigm | analysis §3-A ceiling | corroboration | ★ 측정 환경 |
|---|---|---|---|
| Spring 4.1 + iBATIS 2 (Legacy) | **~53~55%** | ★ 3 사내 PoC isomorphic (PoC #06+#07+#11) | 사내 EFI-WEB |
| Modern (MyBatis 3 / TypeORM / Spring Data JPA) | **~60~67%** | ★ 3 OSS PoC corroboration (PoC #08+#09+#10) | ★ ★ **OSS 한정 / 사내 Modern 재측정 의무** |

★ ★ chain harness 70~80% axis 와 analysis §3-A automation axis = ★ ★ **별도 metric** (★ metric 분모 자체 다름 / chain harness = chain 1~5 통합 gate 통과율 / §3-A = analysis 단방향 추출률 / 외부 인용 시 axis 혼동 회피 의무).

★ ★ revisit loop (자동 감지 + 사용자 결단): chain-revisit-detector → 사용자 prompt → go/stop. stop 시 임의 stage jump.

### 산출물 이식성 5종 (★ chain 2 단계 통합 / 변경 ❌)

| 산출물 | 활용도 |
|---|---|
| rules.json (BR) / domain.json / openapi.yaml | ★★★ 그대로 입력 (언어/환경 100% 무관) |
| schema.json (+ FK relationship_label) | ★★★ 입력 + DB 타입 매핑 (RDB 내 90% 무관 / ★ v12 ADR-011 — 구 erd.mermaid 폐기 / 관계 동사 = relationship_label) |
| antipatterns.json + migration-cautions.json | ★★★ 회피 목록 (패턴 단위 무관) |

(memory `project_methodology_scope.md` / master plan `~/.claude/plans/a-stateful-gadget.md`)

## ★★★ Static Tool 시뮬레이션 절대 금지 (★ R19 Tier 정합 / DEC-2026-05-18-runtime-tool-exclusion)

Phase 4.5 검증 / 모든 cross-validation 단계에서 — 도구는 **실행 확인된 것만 "실행"으로 표기**. 실행한 적 없는 도구를 "실제 실행 의무"로 나열 ❌ (정직 표기).

- ❌ **Tier 3 (simulated)** — AI sub-agent 에 "Static Analyzer persona" 부여 시뮬레이션 = 영구 reject + 신뢰도 -5%p + "진짜 도구 미실행" 명시 의무.
- ✅ **Tier 1 (in-plugin 실제 실행)** — Semgrep / ESLint / Spectral / axe-core·Playwright / 테스트 단계 stack runner (Gradle·JUnit / vitest 등). 실 실행 + 5종 물증 의무. (★ 본 방법론에서 실제 실행 입증된 채널.)
- ✅ **Tier 2 (사용자 환경 SARIF import / ★ plugin 자동 실행 ❌)** — PMD / SpotBugs / CodeQL / Daikon / SonarQube. plugin 이 직접 돌리지 않음 — 사용자가 자기 CI/환경에서 실행해 SARIF 를 import 할 때만 `evidence_trust=imported_sarif` (`tool_stdout_path=null` 정직 표기). 부재 = R19 Tier 2 environment-dependent **carry** (날조 ❌). ★ PMD 는 poc-17 에서 사용자 환경 실 실행됨 / SpotBugs·Daikon·CodeQL·SonarQube 는 본 환경 실 실행 이력 없음 = 정직 인지.
- ✅ 환경 부재 시 = Tier 분류대로 정직 carry (사용자 환경 준비/CI 위임 명시). Tier 2/3 혼동 ❌.

(memory `feedback_no_static_tool_simulation.md` + `feedback_no_unrunnable_tool_citation.md` + `feedback_environment_dependent_tools_scope_out.md` / R19 charter / ADR-009 단계 5)

## Work Principles (4원칙 — 모든 작업 공통)

매 phase 마다 순환 적용. 모든 하위 프로젝트 동일.

1. **깊은 숙지 → plan.md 작성** — 관련 파일 전수 조사 후 `.claude/plans/plan{토픽}.md`.
2. **에이전트 팀 토론 → research.md 작성** — 3 에이전트 병렬 (공식문서 / 테크기업 사례 / Senior). Phase 4~6 부터 가벼운 sub-agent 전략 (Case 생략 + 시간 cap + 우선순위 read 만 → ~10배 단축, memory `feedback_lightweight_sub_agent.md`).
3. **사용자 승인 후 코드 착수** — plan + research 완성 후 반드시 질문. 일괄 승인 패턴 (5~6 핵심 결정 묶음, Auto Mode 호환).
4. **실패 시 Revert → 교훈 반영 → 1원칙 재시작** — Lessons Learned 섹션 plan.md 기록. 같은 실수 반복 금지.

## 핵심 디렉토리

- `ai-native-methodology/methodology-spec/` — 방법론 명세. 핵심 SSOT: `plugin-charter.md`(사용자 요구사항 R1~R18) / `lifecycle-contract.md`(stage×asset 매핑) / `plugin-authoring-spec.md`(Skill·Hook·Agent 저작 규칙) + workflow / deliverables / finding-system / id-conventions.
- `ai-native-methodology/flows/` — phase-flow SSOT. `analysis.phase-flow.json`(drift-validator 3-way 검증) + chain별 `discovery/spec/plan/test/implement.phase-flow.json` + `sdlc-4stage-flow.json`(revisit edges).
- `ai-native-methodology/docs/adr/` — ADR (설계 사상). BE / FE / CHAIN(chain harness paradigm) family.
- `ai-native-methodology/decisions/` — 운영/일정 결정 로그. `INDEX.md`=단일 진입점 / `STATUS.md`=휘발성 진행 상태.
- `ai-native-methodology/schemas/` — 산출물 JSON Schema (BE/FE/chain 산출물 + work-unit-manifest + dep-graph 등 / 모두 top-level `additionalProperties:false` strict).
- `ai-native-methodology/templates/` — 산출물 템플릿 (analysis + chain 6 stage: discovery/spec/plan/test/implement).
- `ai-native-methodology/tools/` — Node CLI 검증 도구 (drift / schema / chain-coverage / plan-coverage / extraction / traceability-builder / chain-driver 등). 단일 npm workspace.
- `ai-native-methodology/.claude-plugin/` — plugin manifest (`plugin.json` + `marketplace.json`) / Claude Code plugin 진입점.
- `ai-native-methodology/agents/` · `skills/` · `hooks/` — plugin 실행 자산 (6 stage 별 agent·skill + hooks).
- `ai-native-methodology/scripts/` — `build-plugin.js` + `version-check.js` + `release-readiness.js`(release gate).
- `ai-native-methodology/examples/` — PoC 산출물 (Spring / NestJS / React / Modern ORM OSS / 사내 legacy 등). 진행·종료 상태 = STATUS.md.
- `ai-native-methodology/archive/` — 진화 history (v1.0~v1.4).

## 정착 패턴 (메서드론 자산화)

- **F-015 cross-validation** — sub-agent 학습 코퍼스 의존 회피. 메인 raw fetch → sub-agent cross-check. (memory `feedback_sub_agent_validation.md`)
- **가벼운 sub-agent** — Phase 3 대비 ~10배 단축. (memory `feedback_lightweight_sub_agent.md`)
- **Composite View** — 복합 AP 등록 거절 + avoid-list.md 가독성. PoC #01 1건 → PoC #02 4건. (memory `feedback_composite_view_pattern.md`)
- **F-021 finding 임계** — 누적 5~15건 건강 / 20+ 명세 부실 의심. (memory `feedback_finding_threshold.md`)
- **★★★ no-simulation 정책 첫 실현 (v1.3.0)** — 자체 도구 (drift / dmn) + 진짜 외부 도구 (spectral) 양쪽 검증 시 ADR-009 단계 4 도달. 신뢰도 -5%p 패널티 회피 / 환경별 carry-over 분류 의무. (memory `feedback_no_simulation_realized.md`)
- **본체 격상 vs PoC 산출물 분리 원칙** — quality 격상 시 schemas/methodology-spec/docs/adr/tools 본체 격상이 examples/poc-XX/ 산출물 작업보다 우선. (★ v1.3.0 release 트리거, memory `feedback_methodology_body_priority.md`)

## 참고

- `ai-native-methodology/README.md` — 방법론 소개 (plugin install 가이드 + 시나리오 A/B/C)
- `ai-native-methodology/CHANGELOG.md` — 변경 이력 SSOT. **현재 plugin.json v12.7.0 MINOR** (2026-06-03 / ③ Type 2 (A) `${CLAUDE_PLUGIN_ROOT}` 경로 치환 — 출하 skill 17 + agent 5 본문 실행 경로가 repo-relative(`node tools/...`)라 plugin-install 시 cwd=사용자 프로젝트 미해소 = **실 배포버그**(Type 2 차단). 공식문서 raw fetch(plugins-reference.md L630 "substituted inline … skill content, agent content" + L632 install 절대경로)로 skill/agent 본문 `${CLAUDE_PLUGIN_ROOT}` = inline 치환 확정 → prefix 정답(hooks.json + 2 skill precedent / claude-code-guide sub-agent "확장❌" 오답=자기인용 모순→raw fetch override=F-015). **시행 4 클래스/22 파일/52 치환/byte-preserving CRLF**: `node tools/`·`bash tools/sh` → `${CLAUDE_PLUGIN_ROOT}/` (**unquoted**=Senior must-fix#1 precedent 일치) + `--schemas schemas/` drop(schema-validator 미인식 플래그 / `--schema-dir` default 번들 자동) + `ls templates/`→prefix. **회귀 가드 check32 `shipped_repo_relative_tool_path`**(release-readiness 31→32 / content-aware grep skills+agents / `(env-prefix)*(node|bash) (tools|scripts)/` without `${CLAUDE_PLUGIN_ROOT}`=FAIL / env-prefix 허용=must-fix#2 / `allow-repo-path:` 예외 / self-test 15→16 discrimination). **scope-out(별도 carry / must-fix#4)**: human-facing 문서(guides 16 + adoption/README 5)=`${CLAUDE_PLUGIN_ROOT}` human 셸 미주입 → 별도 설계(F-EXT-PATH-DOCS) / check32 model-executed 한정. **검증(no-sim/실 CLI)**: skill-citation 0 stale(203) + release-readiness **32/32**(check32 green / 실 repo 0 violation) + self-test **16/16**(discrimination 실증) + workspace **1098/0** + build dist literal `${CLAUDE_PLUGIN_ROOT}` 토큰 보존 grep(must-fix#3 / cpSync verbatim) + version 3-way 12.7.0 + breaking 0 = MINOR. 4원칙(plan-plugin-root-path-fix → 공식문서 raw fetch + Senior 적대 0.88 → 사용자 "진행/MINOR"). **carry**: human-facing 문서(F-EXT-PATH-DOCS)·Type 2 실 측정(측정=0)·agent model:opus pin·SessionStart hook bash-only. DEC-2026-06-03-plugin-root-path). ↓ 직전 v12.6.0 MINOR** (2026-06-03 / dep-graph 의도③ `navigate --with-spec` 확장 — UC/BHV/AC 본문(v12.3.0)에 더해 TASK(`tasks[]`)·TC(`test_cases[]`)·IMPL(`modules[]`) 추가 = **chain leaf 6 subkind 전체 본문 reference-lens**. graph-synthesizer 가 이미 TASK/TC/IMPL 노드에 source_path 를 UC/BHV/AC 와 대칭 배선해둠 → synthesizer 무변경 / `SPEC_SUBKIND_CONFIG`(cli.js) 3 entry 추가만. ★ **Senior 적대 0.86 must-fix**: A(TASK `behavior_ref` 추가=required trace) + C(TC `expected_outcome`/`test_intent`="기대 스펙값(실행결과 아님)" 표기 / gate-eval 는 reconcile 사전계산값만 소비=raw TC 필드 단절). ★ **IMPL 정직 표기**(사용자 옵션 2 / Senior B override): IMPL corroboration=**ecommerce 1-도메인만**(RealWorld·react-fsd IMPL=0/chain5 env-blocked) → Java IMPL shape 검증=carry / 2-도메인 주장 ❌ / TASK·TC=2 distinct 도메인(RealWorld Spring+ecommerce NestJS) 충족. trust 무변경(config 내부만 → check31 spec-token 0[gate-eval/findings-aggregator]+readSpecBody 호출 1곳+reference_lens:true 그대로 통과). carry 경계=EPIC/STORY/OP·analysis/aspect 미지원. 4원칙(plan-dep-graph-with-spec-task-tc-impl → Senior 적대 0.86 → 사용자 옵션 2 = trade-off 2회 설명 후 IMPL 포함 결단). 새 test 3+미지원 TASK→EPIC carry 경계 전환(navigate-cli 56) + 실 dogfood render 실측(RealWorld TASK-USER-001·TC-USER-001 + ecommerce IMPL-AUTH-001[source_files cap "+2 more"] + carry 경계 analysis-architecture→available:false) + withSpec off 회귀0 + chain-driver 320 + workspace **1098/0** + RR **31/31** + version 3-way 12.6.0. DEC-2026-06-03-living-graph-with-spec-task-tc-impl). ↓ 직전 v12.5.0 MINOR** (2026-06-03 / dep-graph 의도③ (b) what-if — `chain-driver navigate --origin X --what-if "<op>"`: navigate 는 기존 노드 영향만 봄 → "삭제하면 뭐 끊기나 / 의존 추가하면?" 등 **그래프에 아직 없는 변경**을 못 물음. op(`remove-node:ID` | `add-edge:SRC>TGT[:type]`)을 **`structuredClone` 사본에만** 적용→`analyzeImpact`(pure)로 baseline 대비 delta(newly reachable/orphaned) 결정론 계산. ★ **trust선**: 그래프 파일 write 절대 ❌(do_not_edit_manually) / 가설=op 문자열이 SOLE source(LLM 추론 ❌) / `unsaved:true` 라벨. ★ **Senior gold-plating 경계**(value 정직판정): v1 scope=**core_two**(remove-node+add-edge / navigate 가 못 답하는 진짜 신규) / deprecate-node·remove-edge·add-node=carry(§8.1 self-overfitting 회피). origin 필수(op-target 와 다를 수 있음 / origin==제거대상=graceful exit3). **D4 grep-gate=skip**(write 경로 구조적 부재)→불변성 unit test(파일 byte-identical+baseline 가설무관). 4원칙(plan-dep-graph-what-if → Senior 적대 0.82 → 사용자 "순서대로 진행"). 새 test 11(★불변성/★baseline불변/★결정론 provenance 포함) + **2 internal dogfood 도메인**(RealWorld+ecommerce / ★ 둘 다 self-dogfood = external pull deferred / prod overclaim ❌) + workspace **1095/0** + RR **31/31** + version 3-way 12.5.0. DEC-2026-06-03-living-graph-what-if). ↓ 직전 v12.4.0 MINOR** (2026-06-03 / dep-graph 의도③ (a) NL 라우팅 — `chain-driver navigate --prompt "<자연어>"`: 정확 id 몰라도 자연어에서 노드를 **결정론 substring 매칭**(id/title/symbol/file)해 해소(→ 영향+스펙). ★ recon 발견(triage "glue" 가정 REFUTE / no-sim 실측): 기존 `resolvePromptToNodes`(federator)는 anchored(code_pointers>0) + title無 → 체인노드(code_pointers_na) 부적합 → scoring 을 `_shared/prompt-node-match.js` 일반화(`matchPromptToNodes` id+5/idpart+1/**title+2**/symbol+3/file+2 / federator=includeTitle:false 위임 byte-identical 무회귀 / navigate=traversable 전노드+includeTitle:true). **tie/약매칭 degrade**(Senior must-fix): confident(score≥3 AND unique)만 top-1 자동탐색 / 동점·약매칭=list-only(오답 권위화 차단). `--prompt`+`--origin`=origin 우선+skipped_reason / `--prompt`+`--stage`=rollup 우선. 정직 한계=substring only(동의어·임베딩 ❌ / 임베딩=carry). 4원칙(plan-dep-graph-nl-routing → Senior 적대 0.86 + main empirical → 사용자 "순서대로 진행"). 새 test 21(단위 12[★includeTitle:false 거동동결] + 통합 9) + federator 29 무회귀 + 2 distinct 도메인(RealWorld+ecommerce) + workspace **1084/0** + RR **31/31** + version 3-way 12.4.0. DEC-2026-06-03-living-graph-nl-routing). ↓ 직전 v12.3.0 MINOR** (2026-06-03 / dep-graph 의도③ 첫 슬라이스 — `chain-driver navigate --with-spec`: 노드 source 파일에서 UC/BHV/AC 스펙 본문 lazy-read 해 reference-lens 로 표시(영향 트리만 주던 navigate 가 "이 노드가 뭐 하나"까지 답 / 소비 루프 P0 통증 해소). display-only·결정론 fs·**회귀 0**(withSpec off = 출력 무변경 byte-identity). hybrid source 해석(graph-dir 우선 → repoRoot → basename / **existsSync 전 branch gate** = 절대경로 dogfood stale throw 회귀 차단 = 리뷰 최대 수확) + subkind 별 field-exhaustive cap("… (+N more)" 정직) + graceful(source부재/id miss/미지원/parse실패). **본문 = reference-lens — 어떤 결정적 gate(gate-eval/s2-outcome-check/findings-aggregator)에도 inject ❌** 코드 강제(release-readiness **check31** 신설 / spec-token 0 + readSpecBody 호출 1곳(cmdNavigate) + reference_lens:true / Senior trust_model=false 해소). rollup+with-spec=본문 폭증 없음(spec 키 부재). **2 distinct 도메인**(§8.1 — RealWorld[Spring/JUnit] UC/BHV/AC + ecommerce[NestJS/Prisma] BHV·AC gherkin 실 render shape match) + 새 test 12(navigate-cli 21→33) + workspace **1063/0** + RR **31/31** + version 3-way 12.3.0. 4원칙(plan-dep-graph-spec-body → 2-agent research Senior 적대적 0.83 + F-015 코드사실 → 사용자 D1·D4 승인). DEC-2026-06-03-living-graph-spec-body). ↓ 직전 v12.2.0 MINOR** (2026-06-03 / dep-graph Loop A **lazy 재합성** — `chain-driver resync-graph` 신설: B-minimal STALE 배너 nudge → 한 명령 재합성(8-flag traceability-matrix-builder 위임 / convention 입력-탐색 `.aimd/output` well-known chain 6 + analysis scan / `--previous-graph` propose·deprecated carry-over / caller cwd 만 write). **per-write 자동 = Senior REJECT**(quadratic·fixture / research stale+lazy>즉시덮어쓰기). 2 distinct 도메인 corroboration(RealWorld 116n/173e + ecommerce 138n/202e 실 resync / no-sim) + 새 test 4 + workspace 1050/0 + RR 30/30 + version 3-way 12.2.0. DEC-2026-06-03-living-graph-resync-cmd). ↓ 직전 v12.1.0 MINOR** (2026-06-03 / dep-graph Loop A 동기화 첫 슬라이스 — SessionStart 컨텍스트 배너에 graph freshness 노출: synthesized_at 이후 source 변경된 stale 그래프가 "N nodes / 0 drift=건강"으로 오인되던 **false-health 방지**. `checkGraphFreshness` 를 `tools/_shared/graph-freshness.js` 로 추출(fs-only·hot-path 경량·DRY / code-pointer-validator re-export = 무회귀) + chain-driver `buildGraphSessionContext` 가 stale 시 `⚠️ STALE … 재합성: traceability-matrix-builder --graph` prepend. **display-only — 자동 재합성·drift write ❌**(결정론 fs / 사람 수동 재합성 / 배너 동급 non-gating). 새 통합 test 2(real cli.js spawn) + chain-driver 268 + workspace 1046/0 + release-readiness 30/30. DEFER: A(증분 재합성)·C(자동 apply-drift=소비자0 P0역전+fixture오염 / Senior REJECT)·B2-full/gate(§8.1 ≥2 도메인). DEC-2026-06-03-living-graph-a1-surface). ↓ 직전 v12.0.1 PATCH** (2026-06-02 / context-federator codegraph 코드 반쪽 Windows 복구 F-FED-WIN-001 / cgRel forward-slash 정규화 + node:sqlite Node≥22.13 / DEC-2026-06-02-fed-win-001-slash-fix). ↓ 직전 v12.0.0 MAJOR** (2026-06-02 / **json 단독 산출물 전환 — committed deliverable/phase-flow `.mermaid` + deliverable `.md` dual-rendering twin 전면 폐기 → 산출물 json 단독 SSOT (완전 AX-native)**. P0(AX 운영) 이동 + LLM-무관 실측(2 distinct domain RealWorld·ecommerce: 모든 도구 json 만 read / `.md`·`.mermaid` = 0 기여 + drift 표면)로 ADR-008 two-eyes 사상 완전 역전(honest self-reversal). **거버넌스**: ADR-008 Superseded + ADR-002·009·FE-002·charter R7 Amend + ADR-011 신설. **시행**: C1(schema additive+migration-cautions.schema)·C2(skill/agent emit 중단)·DT-json(decision_grids 흡수)·C3(drift pair-mode 폐기+handoff detector)·C4(twin 파일·flow·template 삭제)·C5(schema 7 path 필드 제거+examples 23 data 재emit+poc-01 9 FK relationship_label erd verb git복원)·C6(거버넌스)·C7(lifecycle-contract 대수술+deliverables/workflow twin-emit 제거 / ★ figure 전부 KEEP=category-C 삭제 DROP)·C8(version). cosmetic 무손실(erd 동사→relationship_label). 검증 workspace **1015/0** + release **30/30** + grep gate genuine twin 0. carry: 사람 gate-검토 raw json(on-demand viz DEFER)·poc-03 .validation stale 정리. DEC-2026-06-01-json-only-ax-native). ↓ 직전 v11.33.0 (MINOR / 2026-06-01): **S2(AX전환 주 타깃) gate WARN→block 격상 (s2_outcome_mismatch hard-block / §8.1 ≥2 distinct domain 충족)** — 직전 1/2(RealWorld Spring/JUnit) → **ecommerce(NestJS+Prisma+jest / e-commerce 도메인)** 2nd distinct domain execution corroboration 확보로 2/2 충족. WARN 은 v11.11.0 부터 명시적 임시 placeholder("≥2 후 격상")였고 본 release 가 계획된 maturation. fix=`gate-eval.js` HARD_BLOCK_CODES Set 신설(validator_critical/high/s2_outcome_mismatch / Senior REVISE @0.88 — layer2/coverage/findings_unverified WARN 의도 명시 분리) + applyUserDecision `HARD_BLOCK_CODES.has` + severityRank 2→1 + scenario.test.js block 반전 + isolation 회귀. ★ behavioral note: S2 chain 4 outcome_mismatch 시 'go' override 이전 가능→거부(S2 한정 / API·schema·config 무변경=MINOR / typescript-eslint 'internal-only=minor' 선례). 2차 corroboration(no-sim 실 jest+실 모듈 / 본 session 직접): ecommerce `npx jest` 56 char GREEN + refund augmentation RED + 실 gate harness(정상 mismatch=0 blocked=false / 음성대조 mismatch=1 blocked=true / 격상 후 'go'→block). 검증: chain-driver 268→269 + workspace **1049 pass/0 fail** + release-readiness 30/30. **carry ① WARN→block RESOLVED**. carry: distinct 문제 3rd 도메인(현 2 distinct=충분)·Type 2. DEC-2026-06-01-s2-gate-block-upgrade). 직전 = v11.32.0(dep-graph synthesizer FE kinds code-pointer 앵커 / type-spec·ui-ux·form-validation source_file → strict_path / F-FE-ANCHOR-001 / 실 react-fsd dogfood). 전체 버전 히스토리는 CHANGELOG.md / v8.x 이하는 [CHANGELOG-HISTORY.md](ai-native-methodology/CHANGELOG-HISTORY.md) 참조.
- `ai-native-methodology/guides/` — 사용자 journey 자산 (getting-started + chain-harness-guide + common-errors + first-prompt-cookbook)
- `ai-native-methodology/methodology-spec/plugin-charter.md` — ★ ★ ★ **사용자 요구사항 18 단일 SSOT** (R1~R18 / R16·R17 scope-out / 활성 16 / ★ R18 v7.1.0 plugin-authoring 신설 / DEC-2026-05-15-plugin-charter-17-requirements-채택 + DEC-2026-05-17-plugin-authoring-spec)
- `ai-native-methodology/archive/` — 진화 history (v1.3-adoption + phase-a-iteration + v1.4-evaluation / cleanup round 1 격리)
