---
name: analysis-code-graph
description: Use during analysis stage to index the codebase with CodeGraph OSS (@colbymchenry/codegraph) — a MANDATORY analysis tool (Semgrep 동급 / DEC-2026-05-30-codegraph-essential). Generates code-graph.json (code↔code 구조 reference-lens). Real tool execution MANDATORY — CLAUDE.md no-simulation (환경 부재 시 exit 3 정직 신호 / persona simulation 차단). trust 모델 — 출력은 reference-lens / finding 으로만 수용, 어떤 결정적 gate 에도 inject ❌ (DEC-2026-05-28 §4.2). Track-agnostic (BE+FE+DB). Stage = analysis, aspect = cross-cutting.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-code-graph — CodeGraph OSS code↔code 구조 인덱싱 (필수 도구)

CodeGraph OSS = analysis 단계 필수 도구 (Semgrep 동급 / 무조건 실행). code↔code 구조(method/class/route/call)는 LLM 운영 컨텍스트의 reference lens.

## no-simulation 절대 금지

baseline → `methodology-spec/policies/no-simulation.md`.

- 본 skill 도구: 진짜 CodeGraph OSS (R19 Tier 1 in-env / `codegraph index` AST 결정적 추출). 환경 부재 시 `codegraph-runner` exit 3 (정직 신호) → 사용자 설치 (`npm i -g @colbymchenry/codegraph`) 또는 CI 위임. **LLM 추론 대체 ❌**.

## trust 모델

- code-graph.json = **reference-lens / finding 으로만 수용**. 어떤 결정적 gate 에도 **inject ❌** (codegraph 자신의 원칙 "the graph provides context, not requirements" 정합).
- 결정적 검증은 본 방법론 dep-graph(artifact-graph) + chain gate 가 SSOT. codegraph 는 코드 흐름 참고 lens (보완).

## 사전 조건

- CodeGraph OSS 설치 (`npm i -g @colbymchenry/codegraph` / v0.9.x+). 부재 시 exit 3 → 사용자 위임.

## 절차

1. **codegraph-runner 실 실행** — `tools/codegraph-runner/` 가 codegraph CLI 통합 (init -i / index → status --json):

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/tools/codegraph-runner/src/cli.js --target <project-dir> --output <user-project>/.ai-context/output
   ```

   - 최초 = `codegraph init -i <target>` (인덱싱) / 재실행 = `codegraph index <target>` (증분).
   - cross-platform (Windows 전역 npm bin `.cmd` shim = shell 경유 정상 / Node 22 정합).

2. **환경 부재 시 (exit 3)** — 사용자에게 설치 요청 또는 CI 위임 명시. finding 등재 (`Type: gap, Action: codegraph 설치 또는 CI step 추가`).
3. **code-graph.json 검토 (reference-lens)** — `index_stats` (files/nodes/edges/languages/nodes_by_kind) 로 코드 구조 규모 파악. 도구의 언어별 적용 범위·한계는 `## 인용` 의 probe DEC 참조. DB table 경계는 본 도구가 다루지 않음 — schema.json + sql-inventory 로 보완.
4. **질의 (선택 / 참고)** — `codegraph callers/callees/impact <symbol>` 로 code↔code 영향 추적 (cross-domain caller 자동 추출). 결과는 finding (reference) 으로만 (gate inject ❌).
4-b. **coupling 집계 → scope 후보 입력 (대형/decayed 코드베이스)** — **`tools/codegraph-coverage` 가 sqlite 인덱스를 직접 읽어 모듈간 coupling 을 결정론 집계**한다 (code-graph.json 에는 edge 데이터가 없음 — index_stats 요약뿐 / F-DOGFOOD-013):

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/tools/codegraph-coverage/src/cli.js \
     --target <project-dir> --deliverables <user-project>/.ai-context/output \
     [--inventory <inventory.json>] [--out <report.json>]
   ```

   - module axis 가 cross-file edge 를 architecture.json `modules[]` 로 rollup → `dependencies[]` 와 대조 (corroborated / hole / informational). architecture.json 선행 필요.
   - **import_verified 분류 의무 확인**: 각 hole 은 "source 파일에 target 으로 실제 도달하는 import(상대/tsconfig alias/workspace 패키지) 실재" 결정론 검증을 거침 — `import_verified=false` = **이름-해석 의심**(아래 한계 참조 / finding 채널 미진입 / 결함 주장 ❌). scope 후보 입력에는 **verified hole + corroborated 만** 사용.
   - 고결합 쌍 = 응집 클러스터 후보 (LLM 추정 ❌ / community-detection 미주장 — "coupling 측정 기반 경계 도출" 일반 원칙). **신호원 우선순위**: `analysis-scope-carve`(SCC/Martin/co-change/hotspot)가 있으면 그것이 1차 신호 엔진이고, codegraph coupling 은 **corroborating 신호**(특히 co-change 와 교차검증)다. 둘 다 `analysis-source-inventory` 가 `inventory.json#scope_candidates[]` 로 **일원화**(scope-carve=source `scope_carve` / codegraph 단독=`codegraph_measured` / 별도 평행 산출물 ❌). 명목 경계를 관통하는 클러스터(crosses_nominal_boundary=true)는 decay 신호.
5. **finding 등재 (필요 시)** — codegraph 가 발견한 code-level risk = `_base-log-finding` 으로 reference finding 등재 (severity 부여 / status=open / **gate blocker 아님**). **경계 위반(의존성 규칙 위반)** — domain→infrastructure/application 역참조, feature 응집축을 벗어난 교차참조 등은 버그가 아니라 **1급 분석 산출물**: `analysis-quality-antipattern`(antipatterns.json category=ARCH) + `migration-cautions`(이관 위험) + finding 으로 라우팅 (decay = 가치 / dependency-cruiser severity=warn 동형 advisory).

## 산출물

- `<user-project>/.ai-context/output/code-graph.json` (`schemas/code-graph.schema.json` / reference-lens / NOT gate-injected)
- codegraph raw 출력 (`codegraph.stdout.log` / `codegraph.stderr.log`)
- codegraph index store (`<project-dir>/.codegraph/` — `.ai-context/` 와 동급 도구 인덱스 / `.gitignore` 권고)

## 한계 (정직) — 멀티앱 모노레포 name-collision (F-DOGFOOD-013 실측)

codegraph 는 local binding 추적이 불가한 호출(hook 반환 구조분해 등)을 **이름 기반 전역 룩업**으로 해소한다. ① 진짜 정의가 인덱스 밖(함수 내부 클로저·클래스 메서드·node_modules 외부 패키지)이고 ② 다른 파일에 동명 top-level 노드가 있으면 그쪽으로 **오연결**된다 (`unresolved_refs` 는 채워지지 않음 = 미해석 보관 없이 last-resort 연결). 멀티앱 모노레포(backoffice/frontoffice 쌍둥이 — 동명 유틸/hook/래퍼 다수)에서 두드러짐 — ep-fe-mis 실측: 앱 간 불가능 엣지 5,050개 (단일 심볼이 1,115개 흡인 / 동명 정의 16개 중 오선택 / MUI 동명 래퍼).

- **완화 (자동)**: codegraph-coverage module axis 가 hole 별 `import_verified` 분류 (위 4-b) — 의심 엣지는 finding 미진입 / report 에 분리 표기. ep-fe-mis 실증: 앱 간 hole 49/49 의심 분류 (verified 누출 0).
- **triage (사람)**: 의심 목록의 결정 evidence 는 **실코드 grep** (도구 헤더 trust note 그대로). 의심 = 결함 주장 아님 — 동적 패턴(런타임 주입)일 가능성도 사람이 판단.
- **(선택) scope 단위 인덱싱**: 앱 경계 밖 후보 자체를 줄이려면 codegraph-runner 를 앱/scope 디렉토리 단위로 따로 실행 (`--target <repo>/apps/<app>` / 인덱스 store 도 분리됨). trade-off: 패키지(workspace) 교차 의존은 그 인덱스에서 안 보임 — 전체 인덱스 + import_verified 분류가 기본 권장.

## 인용

- `schemas/code-graph.schema.json`
- `tools/codegraph-runner/` (codegraph index + status --json → code-graph.json / 7-field evidence / no-simulation exit 3)
- `tools/codegraph-coverage/` (module coupling 집계 + import_verified 분류 / 4-b 의 실행 주체 / `schemas/code-coverage-hole.schema.json`)
- DEC-2026-05-30-codegraph-essential (codegraph 필수 도구 격상)
- ADR-CHAIN-016 (coupling 측정 기반 scope 도출 + 경계위반 라우팅 / advisory) / DEC-2026-06-09-measured-coupling-scope-derivation
- DEC-2026-05-28-codegraph-probe-결과 (probe #1 / trust 모델 §4.2)
- DEC-2026-05-30-codegraph-probe-2-mybatis3 (probe #2)
- DEC-2026-05-30-codegraph-probe-3-jpa (probe #3)
- ADR-009 (5단계 신뢰도 모델 — 단계 5 도달 의무 / 단계 4 = -5%p 패널티 / 차단)
