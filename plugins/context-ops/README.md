# AI-Native 개발 방법론 v0.49.0

> 조직의 개발 방식을 AI-Native로 전환하는 **AX(AI Transformation) 마이그레이션** 사내 표준 방법론. **분석 → 발견 → 스펙 → 계획 → 테스트 → 구현** SDLC 6-stage chain harness — AI가 단계별 산출물을 생성하고 사람은 gate에서 검토·결단 (AI 자동화 ~85% / 사람 ≤15%).
>
> **현재**: v0.49.0 (2026-06-16 / **MINOR — `domain-bc.schema.json` 신설 (per-BC domain 샤드 verdict-optional 라우팅)**[per-BC `domain.json` 샤드(`domains/<BC>`·`shared/cross-cutting`)가 카탈로그용 `domain.schema.json`(bounded_contexts 항목 verdict REQUIRED)에 basename 라우팅돼 schema RED 이던 문제를 per-BC 전용 schema 신설로 해소. `domain.schema.json` 결정론 파생 — delta 2곳(top-level `$schema_ref`/`$schema_origin`/`$comment` 허용 + `bounded_contexts.items.required` 에서 verdict 제거=optional). 샤드 인스턴스는 top-level `$schema_ref` 로 본 schema 명시(basename fallback=카탈로그 schema / `business-rules-bc` 선례 동형) — verdict 는 카탈로그(`shared/domain.json`) SSOT 소유로 불침범. `analysis-domain-model` 스킬에 샤드 emit 시 `$schema_ref`+verdict-미보유 규약 문서화(회귀방지). 검증 ajv2020-regression+schema-ref-routing GREEN / 채택처(ep-be-gea) per-BC domain 26 샤드 schema invalid 26→0 / 카탈로그 strict 유지·verdict-consistency 무회귀. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.49.0]]) — 직전 v0.48.2 (2026-06-16 / **PATCH — chain-driver scope별 진행 상태 독립 분리 (#19 GHE 통합 출하)**[GHE PR #19 를 canonical 라인에 머지·출하. `state.scope_states` map(optional/additive) 신설로 여러 scope 가 한 프로젝트에서 각자 독립 chain 진행 상태 보유(글로벌 single → per-scope). state.schema+cli+state-store +466 / multi-scope-chain.test 13 신규 / backward-compat. v0.48.1 packaging 과 #19 는 다른 파일 → 충돌 0 머지, 검증 chain-driver 563/563 GREEN, 양쪽 원격 525c5ecc 동기화. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.48.2]]) — 직전 v0.48.1 (2026-06-16 / **PATCH — npm 패키지 lean-ification + ticket-cascade js-yaml 동봉 누락 fix**[출하 tarball 에서 tool-local node_modules 트리(spectral-runner stale cruft ~9400파일 등)를 `files` 의 `"!**/node_modules"` 로 제외 → 9.3MB/14730파일 → 3.3MB/5429파일(−65%). 루트 bundledDependencies 는 그대로 동봉(도구가 Node 상향탐색으로 루트에서 해소). 추가로 `ticket-cascade-builder` 가 lazy-require 하는 `js-yaml`(YAML config 파싱)이 0.48.0·이전 출하본 루트 bundle 에 누락돼 YAML 경로가 깨져 있던 잠복 버그를, 루트 dependencies+bundledDependencies 에 js-yaml 추가로 fix. 전 도구 외부 import 합집합 4종(ajv·ajv-formats·fast-xml-parser·js-yaml) 전부 루트 bundle 커버. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.48.1]]) — 직전 v0.48.0 (2026-06-16 / **MINOR — `.ai-context/` 레이아웃 재구조화: 평면 → 3-버킷 `base/`(was output/) + `scopes/<scope>/` + `runtime/` + 루트 싱글톤**[사용자 프로젝트 `.ai-context/` 온-디스크 레이아웃을 평면(scope+output+config 혼재 / `listScopes` deny-list 가 config/evidence/findings 오분류) → 3-버킷으로 재구조화. 경로 구성 SSOT `tools/_shared/ai-context-layout.js` 신설(`*Path` 쓰기=NEW only / `*ForRead` 읽기=NEW→OLD alias) → 배포된 구 `output/`·최상위 scope 디스크 **무손상 비파괴**(semver MINOR / state schema 불변). `listScopes` deny→allow 전환으로 오분류 잠복결함 **구조적 제거** + hooks-bridge `state.blocked` 차단을 `.ai-context/` 전체로 확대(우회 방지) + `chain-driver migrate-layout <project> [--dry-run]` 인플레이스 컷오버 커맨드 신설(멱등·충돌거부 / 기존 `migrate`=state schema 와 직교). 문서 110파일 결정론 sweep(output→base/runtime 분기 / decisions·examples 역사 보존) + 전체 1867 + _shared 34 테스트 GREEN + `.ai-context/output` 잔여 0 + anti-false-green 음성 단언. ep-be-gea 실이주 = 후속(`migrate-layout`). DEC-2026-06-16-ai-context-layout-restructure. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.48.0]]) — 직전 v0.47.0 (2026-06-16 / **MINOR — BC verdict 분류 결정론화: `verdict` REQUIRED 승격 + analysis gate#0 fail-closed enforce 배선 + verdict-consistency cross-cutting glob 일반화 + `$schema_ref` 컨벤션 + `cross-cutting.schema` 신설**[BC 분류(core/supporting/cross_cutting/read_model/operational)를 `domains/<BC>` write_ops 칼 기반 결정론 `verdict` 필드로 승격(`domain.schema.json` bounded_contexts[].required 에 `verdict` 추가) + `verdict-consistency-validator` 를 analysis stage REQUIRED gate#0 로 배선(`CONTEXT_OPS_VERDICT_ENFORCE=1`/`--enforce` 시 fail-closed HARD block, 미설정 시 advisory) + validator 의 cross-cutting concern 매칭을 BC 디렉터리 glob 으로 일반화 + 산출물 `$schema_ref` 자기참조 컨벤션 + `schemas/cross-cutting.schema.json`·`bc-scope.schema.json`·`findings-analysis.schema.json` 신설로 schema-less 산출물 강제. athrt/base 류 이중분류·read-only BC 누수를 분석 전이에서 자동 차단 / backward-compat: verdict 부재 산출물은 advisory(무효화 ❌) / DEC-2026-06-15-bc-verdict-classification. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.47.0]]) — 직전 v0.46.7 (2026-06-15 / **PATCH — 미참조 analysis-zone artifact-graph 노드 → 'propose' 강등 (full-chain 병렬 캠페인 dogfood-found)**[ep-be-gea 22-BC 4-worktree 병렬 캠페인에서 모든 lane gate#5 `graph-integrity-validator` orphan 반복 FAIL. 근본: `traceability-matrix-builder --graph` 의 analysis-zone 노드(`analysis-antipatterns`·`analysis-characterization-spec`)는 chain 참조(AC.related_aps / characterization snapshots[].use_case→UC) 시에만 edge 획득 → 미참조 BC 는 정상인데 in/out edge 0 + active → Tier-1 orphan hard-block(본류 UC→IMPL 무결성 무관한 보조 lens 를 의무 연결로 오인 = false-block / 22 BC systemic). 수정: `graph-synthesizer.js` commit-stamp 직후(derive/na 이후)에 `id^=analysis- && active && incident edge 0` → `state='propose'` 강등(pending-TC propose 패턴 동형 / orphan 검사 제외·가시 / chain 본류 노드 미해당→진짜 끊김 계속 block). builder·schema·validator 무변경. builder 179/179 회귀0 + req-visitprkng 재생성 orphans=0 + 라이브 WT1 3 BC orphan0(wlfr propose=1=실작동) / DEC-2026-06-15-analysis-zone-orphan-propose. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.46.7]]) — 직전 v0.46.6 (2026-06-15 / **PATCH — traceability-matrix schema↔builder contract 정렬**[S5 header `{derived_from, do_not_edit_manually}` ↔ schema meta-required 분기→빌더 산출물 자기 schema FAIL / 방향=schema 를 builder 에 정렬·matrix.json auto-route alias / matrix 10/10 GREEN·builder 179·schema-validator 111·RR 42/42 / DEC-2026-06-15-matrix-schema-builder-align. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.46.6]]) — 직전 v0.46.5 (2026-06-14 / **PATCH — append-catalog cross-BC caution merge (clobber fix / dogfood-found)**[carry ④ req 패밀리 나머지 4 sub-domain(iteqmt 비품·bookreq 도서·bizcard 명함·empcard 사원증) 부분추가 analysis — 병렬 workflow `wf_3d614d66-1be`(28-agent: BC당 3 deep-read → analysis-agent leaf 저작 → 3 적대검증) + 정확성 수정 `wf_2d777a1e-6eb`(bookreq characterization 보강·iteqmt openapi concrete 재구성·bizcard param 정합). `upsertCautionGroup` 이 title 충돌 시 caution_group 통째 교체 → sibling BC 의 cautions silently drop(empcard rollup 이 stdpkng 2 caution 클로버) → `caution.id` union 병합(idempotent·sibling 보존)으로 수정. append-catalog 16/16 + chain-driver 539/539 무회귀 + 수정 tool 재-rollup **caution LOST 0**(HEAD 161 ⊆ 208). req 4-BC: 57 BR·rollup 25 BC/638 rule·결정론 gate 전수 GREEN·iteqmt openapi 컨트롤러↔spec 양방향 55:55. RR 42/42 / DEC-2026-06-14-append-catalog-caution-merge. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.46.5]]) — 직전 v0.46.4 (2026-06-13 / **PATCH — sql-inventory-extractor FROM-less T-SQL DELETE dependent_tables 추출 (dogfood)**[carry ④ req visitprkng(방문주차)+stdpkng(정기주차) 부분추가. `extractTables` 키워드에 DELETE 부재 → FROM-less T-SQL `DELETE <table> WHERE` 미추출 → 별도 패스+negative lookahead. 실테이블 누락 0(per-record DELETE 빈 dependent_tables 141→3 해소). 24 test / RR 42/42. 상세 = [CHANGELOG.md](./CHANGELOG.md) [0.46.4]])
>
> Analysis stage = 한 방향 추출 (v1.x 자산 = chain 1 진입 전 단계로 흡수 / AX 전환의 출발 입력). v2.0 paradigm = 분석 stage 위에 chain harness + revisit loop + 70~80% 한계 명시. v3.x = Gap 청산 + enforcement cadence 정착 + 자산 대칭 완성. v9.0 = 6-stage chain (analysis→discovery→spec→plan→test→implement). v10.0.0 = 5 gate 본격 (discovery #1 / spec #2 / plan #3 / test #4 / impl #5 / chain N = gate #N 1:1 INTERNAL CONVENTION). v11.0.0 = BE/FE 산출물 분리 paradigm + contract 강제 양 axis (BE = swagger / FE = state-map + visual-manifest + DTCG token) + ticket = plan stage 단일 (Epic/Story/OP/TASK 4-level).
>
> 자세한 변경 이력 = [CHANGELOG.md](./CHANGELOG.md) (v2.6+) / [CHANGELOG-HISTORY.md](./CHANGELOG-HISTORY.md) (v8.x 이전).

---

## 무엇을 하는가

조직의 SDLC 를 **AI-Native** 협업 구조로 전환한다. AI 가 단계별 산출물을 자동 생성하고, 사람은 각 gate 에서 검토·결단한다. 입력은 기존 시스템 자산(소스/스키마/문서/디자인), 출력은 검증 가능한 산출물 체인과 그 결과로 운영되는 시스템.

```
INPUT:
  기존 시스템 자산 (소스 / ERD / ORM / 운영 DB / 기획 문서 / 디자인 명세)

  ↓ analysis stage (chain 1 진입 전 / 한 방향 추출 — AX 전환 출발 입력)
  ↓
[CHAIN 1] discovery-spec (discovery stage)      ── go/stop gate #1
  ↓
[CHAIN 2] behavior-spec
        + acceptance-criteria
        + 7대 산출물 통합              ── go/stop gate #2
  ↓
[CHAIN 3] task-plan (task 분해 / ADR / NFR / risk)  ── go/stop gate #3
  ↓
[CHAIN 4] test-spec + 실 test 코드 (RED 의무)  ── go/stop gate #4
  ↓
[CHAIN 5] impl-spec + 실 impl 코드 (GREEN / 100% test pass)  ── go/stop gate #5
  ↓
OUTPUT: AI-Native 로 운영되는 시스템 + traceability-matrix (UC→BHV→AC→TASK→TC→IMPL+commit_hash)
```

AI 자동화 ≥ 85% / 사람 검토 (gate별) ≤ 15% / **70~80% 한계 명시 잔존** (**chain harness 전체 자동화 axis** / process 통과율 metric / DEC-2026-05-06-v2.0-i-strict-채택 + DEC-2026-05-06-round-trip-부분-허용).

**analysis 단계 §3-A automation axis = 별도 axis** (R1' / DEC-2026-05-13-r1-prime-본체-명문화 / 6 PoC 사실 robust):

| paradigm                                             | analysis §3-A ceiling | corroboration                             | 측정 환경                          |
| ---------------------------------------------------- | --------------------- | ----------------------------------------- | ---------------------------------- |
| Spring 4.1 + iBATIS 2 (Legacy)                       | **~53~55%**           | 3 사내 PoC isomorphic (PoC #06+#07+#11)   | 사내 EFI-WEB                       |
| Modern stack (MyBatis 3 / TypeORM / Spring Data JPA) | **~60~67%**           | 3 OSS PoC corroboration (PoC #08+#09+#10) | OSS 한정 / 사내 Modern 재측정 의무 |

metric 분모 자체 다름 — chain harness axis = chain 1~5 통합 gate 통과율 / §3-A axis = analysis 단방향 추출률. 외부 권위 STRONG: Wang et al. ICSE 2025 (DUR legacy 70~90% vs up-to-date 9~18%) + LongCodeBench 2025 (context length ↑ → 정확도 ↓) + AWS SCT 자릿수 정합 (Functions 66.4%) + ThoughtWorks "GenAI for forward engineering" 사상 isomorphic. **R1' = industry first paradigm-cross axis quantification (original empirical finding)**. 자세히 `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` §X 참조.

---

## chain harness validated 자격 (§8.1 strict / release-readiness)

`npm run release:check --target v<version>` 가 **§8.1 strict criterion 전수**를 검사 — 전부 ✅ 일 때만 release-ready. 검사 영역(대표):

- **PoC corroboration / real-tool evidence (5종 물증)** — 다수 PoC 본격 + sha256 검증된 실 도구 물증 (no-simulation R19 Tier).
- **chain·matrix coverage / e2e GREEN** — UC→BHV→AC link ≥ 0.85 + traceability matrix green + chain RED→GREEN cycle pass.
- **validators / analysis / Layer 2 정합** — chain·analysis validator 0 critical/high + Layer 2 per-PoC drift 0.
- **drift enforcement (R2)** — CLAUDE.md·README ↔ plugin.json version sync + 출하 자산 사내 신원 누출 0 + adoption 템플릿 paradigm 정합.
- **graph / code-pointer / gate / template 정합** — artifact-graph cycle 0 + code_pointer coverage 100% + gate enum {#1~#5} + template count drift 0.
- **authoring-spec staleness (R18) / skill-citation / preflight** — 공식 docs pin fresh + active doc 인용 0 stale + 외부 도구 환경 진단.

전체 criterion 목록·개수·상세 = `scripts/release-readiness.js` 또는 `release:check` 출력 (본 README 는 criterion 개수를 하드코딩하지 않음 — drift 회피 / self-test 가 개수·id 정합 보증).

Platform-Agnostic 입증 — Java/Spring + Java/Hexagonal + TypeScript/NestJS + TypeScript/React FSD + Modern ORM (MyBatis 3 / TypeORM / JPA QueryDSL) + 사내 Spring 4.1 + iBATIS 2 (PoC #01~#16).

---

## 시작하기

> **아무것도 안 깔린 PC에서 처음 설치**한다면 → repo 루트의 [`INSTALL.md`](../INSTALL.md) (Node → git/GHE 인증 → Claude Code → plugin install 5단계 / Windows·macOS).

### 사전 요구사항

- Claude Code 설치 (plugin 시스템 지원)
- 분석 대상 프로젝트 git clone (analysis stage 입력 자산)
- (선택) ERD 파일, 운영 DB 메타데이터, 기획 문서
- (Windows 한국어 환경 / Semgrep 사용 시) `PYTHONUTF8=1` 환경변수
- Node ≥ 22 (chain-driver / workspace tool 실행)

### 사용법 — Plugin install

#### A. 편집자 — 워크스페이스 직접 등록 (Phase A self-iteration)

본 repo 를 clone 하여 plugin 본체를 직접 수정. 워크스페이스 path 그대로 등록.

```bash
# Claude Code 세션에서:
/plugin marketplace add /absolute/path/to/ai-native-methodology/ai-native-methodology
/plugin install context-ops@mis-plugins
/reload-plugins
/plugin                  # 대화형 manager — Installed 탭에서 최신 버전 확인
```

#### B. 배포 수신자 — 사내 사용자 install (사내 표준)

##### B-1. 사내 GHE git URL 기반 (Recommended)

사내 GHE (`github.smilegate.net/SGH-ISD/ai-native-methodology`) 의 read 권한 + git 인증만 있으면 install. 별도 dist artifact 전달 ❌.

```bash
# 사내 GHE 인증 1회 (gh CLI 권장 / SSH key 도 가능)
gh auth login --hostname github.smilegate.net

# Claude Code 세션에서:
/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git
/plugin install context-ops@mis-plugins
/reload-plugins
```

특정 버전 pin (권장 — git tag):

```bash
/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git#v<version>
/plugin install context-ops@mis-plugins
```

plugin update — `/plugin` 대화형 manager → Installed 탭 → "Update" → 최신 tag 자동 fetch.

##### B-2. dist artifact 폴더 등록 (오프라인 / 특수 환경)

빌드된 artifact (`dist/ai-native-methodology-v<version>/` 폴더 또는 zip 압축본) 을 받아 install. 폴더 자체에 `.claude-plugin/{plugin.json, marketplace.json}` 가 들어있어 자기완결.

```bash
# 받은 dist 폴더를 임의 위치에 풀기:
#   ~/claude-plugins/context-ops-v<version>/
#   ├── .claude-plugin/{plugin.json, marketplace.json}
#   ├── agents/ skills/ hooks/ flows/ templates/ tools/ methodology-spec/ schemas/
#   ├── CHANGELOG.md / CHANGELOG-HISTORY.md / README.md / CLAUDE.md
#   └── CHECKSUMS.txt   ← SHA256 manifest (무결성 검증)

# Claude Code 세션에서:
/plugin marketplace add /absolute/path/to/ai-native-methodology-v<version>
/plugin install context-ops@mis-plugins
/reload-plugins
```

`CHECKSUMS.txt` 로 무결성 검증 — 배포자가 별도 채널 (사내 wiki / Slack pin) 으로 hash 제공 시 대조.

#### 빌드 (A → B artifact 생성)

편집자가 dist artifact 를 새로 만들 때:

```bash
# version 갱신 시 3-way sync 의무 (source-of-truth = .claude-plugin/plugin.json — ADR-010)
#   .claude-plugin/plugin.json.version  ↔  CHANGELOG.md 첫 ## [vX.Y.Z]  ↔  package.json.version
npm run version:check       # 3-way sync 검증 단독
npm run build               # version-check 강제 → dist/ 생성 + CHECKSUMS.txt
npm run build:check         # dry-run (file count 만 출력)
npm run build:diff-check    # build 후 git diff exit-code 0 검증 (CI 용)
npm run release:check       # §8.1 strict criterion 전수 자동 검사
npm run test                # workspace tool unit test (전수 pass / 0 fail)
```

분석 대상 사내 프로젝트 디렉토리에서 새 Claude Code 세션 시작 → SessionStart hook 메시지 ("chain harness ready") 표시 시 정상 작동.

### 사용법 — chain harness 진입 시나리오

#### 시나리오 A — Analysis stage 만 (분석 단독 / chain 1 미진입)

자연어 prompt → skill 자동 발동:

| 자연어 prompt             | 발동 skill                     |
| ------------------------- | ------------------------------ |
| "이 코드베이스 분석 시작" | `analysis-input-collection`    |
| "inventory 추출해줘"      | `analysis-source-inventory`    |
| "아키텍처 분석"           | `analysis-architecture`        |
| "도메인 모델 추출"        | `analysis-domain-model`        |
| "비즈니스 규칙 추출"      | `analysis-business-rules`      |
| "OpenAPI 만들어줘"        | `analysis-openapi` (BE)        |
| "DB schema + ERD"         | `analysis-db-schema-erd` (DB)  |
| "antipattern 정리"        | `analysis-quality-antipattern` |

aspect skill 4종 (a11y / i18n / static-security / legacy) = 코드베이스 시그널 자동 매칭. cross_cutting (phase 무관).

#### 시나리오 B — chain harness e2e (6-stage paradigm)

```
1. chain-driver init <project>      → state.json 초기화
2. "발견 단계 시작"                  → discovery-from-analysis-output / discovery-decompose-use-cases / discovery-identify-business-intent
   → discovery-spec.{json,md} 산출
   → gate #1 (discovery-extraction-validator) 통과
3. "behavior spec / acceptance criteria 도출"
   → spec-compose-behavior-spec / spec-derive-acceptance-criteria / spec-integrate-deliverables
   → behavior-spec + acceptance-criteria + 7대 통합 (BE = swagger / FE = state-map + visual-manifest + DTCG token)
   → gate #2 (chain-coverage-validator / UC→BHV→AC ≥ 0.85) 통과
4. "plan / task 분해 / ADR / NFR / risk"
   → plan-decompose-and-sequence / plan-architect-decisions / plan-risk-and-nfr
   → task-plan.{json,md} 산출 (Epic / Story / OP / TASK 4-level + ticket = plan stage 단일)
   → gate #3 (plan-coverage-validator / NFR allocation hard gate + ADR alternatives ≥3) 통과
5. "test spec 생성 RED 의무"
   → test-generate-test-spec / test-run-test-evidence / test-verify-coverage
   → test-spec + 실 test code (RED — 실패 입증 / impl 부재)
   → gate #4 (spec-test-link-validator / AC→TC ≥ 0.85 + RED) 통과
6. "impl spec 생성 GREEN 의무"
   → implement-generate-impl-spec / implement-verify-test-pass
   → impl-spec + 실 impl code (GREEN / 100% test pass)
   → gate #5 (test-impl-pass-validator / 실 test runner / 100% pass) 통과
7. "traceability matrix"
   → _base-build-traceability-matrix
   → UC→BHV→AC→TASK→TC→IMPL+commit_hash matrix 산출
```

**Mechanical gate trio** — (i) state.blocked + (ii) cli exit 2 + (iii) PreToolUse permissionDecision=deny. LLM "통과한 척" 시뮬레이션 ❌ enforcement.

**Chain-revisit detector** — git diff 기반 skill auto-invoke / state.blocked 전환 가능.

#### 시나리오 C — manual fallback (plugin 미사용)

`methodology-spec/workflow/phase-*.md` + `methodology-spec/lifecycle-contract.md` 직접 차례로 적용.

---

## 디렉토리 구조 (dist artifact 기준)

```
dist/ai-native-methodology-v<version>/
├── .claude-plugin/
│   ├── plugin.json                   v<version> manifest
│   └── marketplace.json              git-subdir source (자기완결)
├── CLAUDE.md                         사내 적용 정책 inline (자동 로드)
├── README.md                         ← 본 파일 (plugin user 진입점)
├── CHANGELOG.md                      v2.6+ 최근 release entry
├── CHANGELOG-HISTORY.md              v8.x 이전 archive
├── CHECKSUMS.txt                     SHA256 manifest (무결성 검증)
│
├── agents/                           6 chain stage agent (analysis/discovery/spec/plan/test/implement) + design placeholder + _base 3 persona
├── skills/                           skill (flat 디렉토리 / 의미 ID / 개수는 CHANGELOG·/plugin 참조)
│   ├── _base-*                       invoke-go-stop-gate / build-traceability-matrix / log-finding / apply-template / apply-baseline-ratchet
│   ├── analysis-*                    phase 0~6 + aspect 4 (a11y/i18n/static-security/legacy) + 입력 어댑터(figma/swagger/plan-doc/prompt) + FE(form/type/ui-state-map/ui-visual-manifest/html)
│   ├── discovery-*                   6 — from-{analysis-output,swagger,figma,nl-md} / decompose-use-cases / identify-business-intent
│   ├── spec-*                        3 — compose-behavior-spec / derive-acceptance-criteria / integrate-deliverables
│   ├── plan-*                        3 — decompose-and-sequence / architect-decisions / risk-and-nfr (v10.0.0 본격)
│   ├── test-*                        4 — generate-test-spec / run-test-evidence / verify-coverage / playwright
│   ├── implement-*                   4 — generate-impl-spec / verify-test-pass / react / vue
│   ├── ticket-sync                   1 — plan stage Epic/Story/OP/TASK 4-level cascade (v11.0.0)
│   ├── dep-graph-navigator           1 — artifact dependency graph 탐색
│   └── session-handoff               1 — 세션 간 운영 컨텍스트 인계 (.ai-context/HANDOFF.md / 고정 6절)
├── hooks/
│   └── hooks.json                    UserPromptSubmit + PreToolUse (chain-driver hooks-bridge / D21' suppressOutput=true)
├── flows/                            15 file (sdlc-4stage master SSOT + 6 phase-flow {json,mermaid} + README)
│   ├── sdlc-4stage-flow.{json,mermaid}     chain harness master SSOT
│   ├── analysis.phase-flow.{json,mermaid}  v1.x 자산 (chain 1 진입 전)
│   └── {discovery,spec,plan,test,implement}.phase-flow.{json,mermaid}
│
├── tools/                            workspace tool (npm workspace / 개수·test 수는 CHANGELOG 참조)
│   ├── chain-driver/                 harness driver (cli + module / gate trio enforcement)
│   ├── drift-validator/              .json ↔ .md/.mermaid 동일성 + chain layout + state-flow + outputs 비교
│   ├── schema-validator/             chain 산출물 schema 검증
│   ├── analysis-extraction-validator/   analysis stage source-grounded hard gate (v11.0.3)
│   ├── discovery-extraction-validator/  gate #1 / source-grounded ≥ 0.80
│   ├── chain-coverage-validator/        gate #2 / UC→BHV→AC ≥ 0.85
│   ├── plan-coverage-validator/         gate #3 / NFR allocation + ADR alternatives ≥3 + BE/FE 1:1
│   ├── spec-test-link-validator/        gate #4 / AC→TC ≥ 0.85
│   ├── test-impl-pass-validator/        gate #5 / 100% pass + result_hash 정규화
│   ├── traceability-matrix-builder/     release matrix (UC→…→IMPL)
│   ├── graph-integrity-validator/       artifact dep-graph cycle/orphan 검사
│   ├── code-pointer-validator/          code_pointers[] 실존 검증
│   ├── br-cross-consistency-validator/  business-rule 교차 정합 (industry-first)
│   ├── skill-citation-validator/        active doc 인용 dead-link
│   ├── decision-table-validator/        dmn-check 5종
│   ├── formal-spec-link-validator/      Phase 4.5 cross-link
│   ├── sql-inventory-validator/ characterization-coverage-validator/ findings-aggregator/ inflation-lint/
│   ├── spectral-runner/                 OpenAPI lint (진짜 외부 도구)
│   └── static-runner/                   Semgrep (Tier 1) + SARIF import (Tier 2 / PMD·SpotBugs·CodeQL·Daikon) — R19
│
├── templates/                        analysis 21 + chain stage 6 (discovery/spec/plan/test/implement) body
│
├── methodology-spec/                 Single Source of Truth
│   ├── workflow/                     phase-0 ~ phase-6 + 4.5
│   ├── deliverables/                 1-architecture ~ 7-ui-ux + chain (discovery/behavior/acceptance/task-plan/test/impl/matrix)
│   ├── lifecycle-contract.md         SDLC stage 간 data contract + 자산 매핑 매트릭스
│   ├── plugin-charter.md             사용자 요구사항 18 단일 SSOT (R1~R18)
│   ├── plugin-authoring-spec.md      Skill·Hook·Agent·Packaging 저작 규칙 (R18)
│   ├── skills-axis.md                phase ID ↔ skills 디렉토리 axis 분리 정책
│   ├── glossary-ko.md / id-conventions.md / finding-system.md / be-fe-separation.md
│
└── schemas/                          JSON Schema (모두 top-level additionalProperties:false strict / 개수는 CHANGELOG 참조)
    ├── chain: discovery-spec / behavior-spec / acceptance-criteria / task-plan / test-spec / impl-spec / traceability-matrix
    ├── contract: openapi-extension / state-map / visual-manifest / (DTCG token)
    ├── dep-graph: artifact-graph-node / artifact-graph-edge / code-pointer
    ├── state.schema.json / intervention-log.schema.json / work-unit-manifest.schema.json
    └── (BE/FE/analysis 공통 — meta-confidence / architecture / domain / business-rules / db-schema / antipatterns / ui-spec / inventory / formal-spec / finding-system / etc)
```

workspace 본체 (`docs/` / `archive/` / `decisions/` / `examples/` / `scripts/`) 는 dist 미포함 (개발 자산 / build script EXCLUDE).

---

## 7원칙 (헌법)

1. **사상 명시**: Schema-First + Contract-First + DDD-Lite + FSD
2. **Bottom-up Always**: Function → File → Module → System
3. **Deterministic First, LLM Second**
4. **File System as Memory** (단계 간 통신 = 파일)
5. **Confidence as First-Class** (모든 산출물에 신뢰도 메타)
6. **Human-in-the-loop** (chain harness gate 5 (#1~#5) + revisit loop)
7. **Single Source of Truth = Repo** (문서/플러그인은 레포 파생)
8. **한국어 1차** (영어 약어 최소화, 산업 표준 예외)

---

## 검증 도구 사용 (workspace tool / npm workspace)

```bash
# Chain harness driver (진입)
node tools/chain-driver/src/cli.js init <project>
node tools/chain-driver/src/cli.js next         # next stage 진입 / blocked 면 exit 2
node tools/chain-driver/src/cli.js state        # 현재 stage / blocked 여부

# Phase 4.5 검증 (analysis stage)
node tools/drift-validator/src/cli.js {산출물 경로}/formal-spec/
node tools/decision-table-validator/src/cli.js {산출물 경로}/formal-spec/decision-tables/
node tools/formal-spec-link-validator/src/cli.js {산출물 경로}/formal-spec/

# Chain harness validator (gate #1~#5)
node tools/discovery-extraction-validator/src/cli.js  # gate #1 (discovery)
node tools/chain-coverage-validator/src/cli.js        # gate #2 (spec)
node tools/plan-coverage-validator/src/cli.js         # gate #3 (plan)
node tools/spec-test-link-validator/src/cli.js        # gate #4 (test)
node tools/test-impl-pass-validator/src/cli.js --allow-execute  # gate #5 (실 test runner / implement)
node tools/traceability-matrix-builder/src/cli.js     # release

# 외부 도구 (no-simulation 의무)
cd tools/spectral-runner && npx spectral lint <openapi.yaml>
node tools/static-runner/src/cli.js --plugin semgrep --target ./src --output ./out

# Schema 검증 (모든 chain 산출물)
node tools/schema-validator/src/cli.js
```

CI 자동화 = `.github/workflows/drift-check.yml` (PR / nightly / manual dispatch).

---

## 분석 입력 가변성

```
필수: 소스 코드
선택: ERD / ORM / 운영 DB / 기획 문서 / 디자인 명세 / 설정 파일

입력이 많을수록 신뢰도↑:
- 소스만:                      평균 75%
- 소스 + ERD:                  평균 85%
- 소스 + ORM:                  평균 88%
- 소스 + ORM + ERD + 운영DB:   평균 96%
- 모든 입력:                   평균 98%
```

신뢰도 메타데이터를 모든 산출물에 명시 (`schemas/meta-confidence.schema.json`).

---

## 사상적 기반

| 사상                     | 채택          | 출처                                            |
| ------------------------ | ------------- | ----------------------------------------------- |
| Schema-First             | 주축          | Microsoft TypeSpec, OpenAPI 산업 표준           |
| Contract-First           | API 영역      | Hazelcast, Technijian 등 산업 사례              |
| DDD-Lite (B 강도)        | 도메인 영역   | Eric Evans DDD, 풀 DDD 의도적 제외              |
| FSD + Atomic Design      | FE 영역       | Feature-Sliced Design, Brad Frost Atomic Design |
| chain harness (i-strict) | SDLC paradigm | Aider 패턴 + DEC-2026-05-06-v2.0-i-strict-채택  |

명시적 제외:

- Event Sourcing, CQRS, Saga, Anticorruption Layer
- 비기능 요구사항(NFR) 측정 (단 chain 3 task-plan NFR allocation 은 의무)
- 테스트 코드 자동 분석 (단 chain 4 실 test code 산출은 의무)

---

## 라이선스

**UNLICENSED** (사내 표준 / 외부 미공개 — de facto all-rights-reserved). `plugin.json.license` 정합. 외부 OSS 공개는 별도 조직 결단 시 SPDX 라이선스 신설.

---

## 기여

- 변경 제안: GitHub Issue
- 변경 적용: PR + ADR 작성 (ADR-CHAIN-001~012 + ADR-001~010 + ADR-FE-001~007 + ADR-BE-001)
- 방법론 자체 변경: ADR/DEC 신설 → plan.md 갱신 → §8.1 strict 검증대 통과

→ 변경 이력: [CHANGELOG.md](./CHANGELOG.md) (v2.6+) / [CHANGELOG-HISTORY.md](./CHANGELOG-HISTORY.md) (v8.x 이전).
