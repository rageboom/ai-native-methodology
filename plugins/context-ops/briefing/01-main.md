# AI-Native 개발 방법론 — 종합 브리핑

> **갱신 이력**: 2026-05-08 작성 (v2.2.0) → 2026-05-14 갱신 (v2.5.1) → **2026-06-09 v0.24.0 정합 전면 재작성** (6-stage chain harness / json 단독 산출물 / `context-ops` 리네임 + 0.x 버전 리셋 / BR-split · living-sync / pnpm 모노레포).

## 들어가며

이런 상황을 상상해보세요. 사내에 오래된 시스템이 하나 있습니다. 이걸 새 시스템으로 다시 짓기로 했습니다. 보통이라면 개발자들이 코드를 읽고, 회의를 하고, 사양서를 쓰고, 테스트를 만들고, 구현을 합니다. 몇 달이 걸립니다.

여기에 AI를 투입하고 싶습니다. 그런데 그냥 "물어봐" 식으로는 결과가 들쭉날쭉하고, 100% 자동화는 환각과 누락을 만들어내고, 그렇다고 사람이 다 보면 AI를 쓰는 의미가 없어집니다.

**이 프로젝트는 그 딜레마를 푸는 사내 표준 방법론**입니다. 그리고 그 방법론을 **누구나 받아서 쓸 수 있는 Claude Code 플러그인**으로 포장해 배포합니다.

> **개념명과 식별자는 다릅니다.** 방법론의 이름은 변함없이 "AI-Native 개발 방법론" 입니다. 플러그인의 기계 식별자는 `context-ops` (npm `@mis-plugins/context-ops`), 마켓플레이스는 `mis-plugins` 입니다. 예전 이름 `ai-native-methodology` 를 본 적이 있다면 같은 것입니다 — 2026-06-06 에 식별자를 리네임하고 버전을 0.x 로 리셋했습니다 (아래 8장).

---

## 1. 가장 먼저 — 세 개의 공간

이 프로젝트를 이해하려면 **공간이 세 개로 나뉜다**는 것만 기억하면 됩니다.

```
   ① 워크스페이스             ② 플러그인               ③ 사용 현장
   (저자가 만드는 곳)         (배포되는 산출물)         (동료가 쓰는 곳)
   ─────────────             ─────────────            ─────────────
   ai-native-methodology/     @mis-plugins/            동료의 Claude Code
   (pnpm 모노레포)            context-ops
                              (Nexus npm 패키지)

   방법론을 설계하고,         이 패키지 하나가          "비즈니스 규칙
   검증 도구를 만들고,        자기완결 배포 단위.       추출해줘" 같은
   PoC로 입증하는 작업장.     검증 도구 deps 까지        자연어 한 마디로
   plugins/context-ops/       bundledDependencies로     AI가 알아서 작동.
   에 플러그인 본체.          동봉.

         │                         ↑                          ↑
         │                         │                          │
         └──── pnpm build /  ──────┘                          │
               npm publish         │                          │
                                   └─── 사내 GHE marketplace ──┘
                                        또는 Nexus npm
                                        → /plugin install
```

**핵심**:

- ① 워크스페이스는 `plugins/*` 를 멤버로 갖는 **pnpm 모노레포**입니다. 플러그인 본체는 `plugins/context-ops/`, 마켓플레이스 정의는 레포 루트 `.claude-plugin/marketplace.json` 입니다. 저자(나)만 작업합니다.
- ② 플러그인은 ①에서 추출·발행되는 자기완결 패키지입니다. 이게 배포 단위입니다.
- ③ 사용 현장에서는 ②를 설치만 하면 됩니다. ①의 존재를 몰라도 됩니다.

---

## 2. ① 워크스페이스 — 안에 무엇이 들어 있는가

플러그인 본체 `plugins/context-ops/` 의 주요 폴더와 역할입니다. (정확한 자산 개수·테스트 수는 계속 바뀌므로 여기서는 박지 않습니다 — `/plugin` 매니저나 `CHANGELOG.md` 최신 entry 참조.)

```
ai-native-methodology/                        ← 모노레포 루트
├── .claude-plugin/marketplace.json           마켓플레이스 mis-plugins (source: npm)
├── pnpm-workspace.yaml                        pnpm 11.x 워크스페이스 (plugins/* + plugins/*/tools/*)
│
└── plugins/context-ops/                       ← 플러그인 본체
    │
    ├── methodology-spec/                      방법론 명세 — 텍스트로 쓰인 표준
    │     ├── plugin-charter.md                사용자 요구사항 R1~R18 단일 SSOT
    │     ├── lifecycle-contract.md            stage × 산출물 매핑 사상
    │     ├── plugin-authoring-spec.md         Skill·Hook·Agent 저작 규칙
    │     ├── use-scenario-taxonomy.md         4 use-scenario SSOT (아래 5장)
    │     ├── skills-axis.md / agents-axis.md  자산 사상 axis
    │     └── sub-rules/                        Spring 4.1+iBATIS 2 spectrum 등
    │
    ├── schemas/                               산출물 JSON Schema (top-level strict)
    ├── flows/                                 단계 흐름 정의 (json 단독 SSOT)
    │     ├── analysis.phase-flow.json         analysis phase 의존 그래프
    │     └── {discovery,spec,plan,test,implement}.phase-flow.json   chain 1~5
    │
    ├── tools/                                 Node 검증 도구 (pnpm workspace)
    │     ├── chain-driver/                    체인 하네스 상태머신 + gate enforcement
    │     ├── drift-validator/                 산출물↔코드 정합 (json 단독)
    │     ├── br-cross-consistency-validator/  BR 이중 표현 의미 일관성 (Layer 1+2)
    │     ├── traceability-matrix-builder/     UC→BHV→AC→TC→IMPL 추적성
    │     ├── codegraph-runner / context-federator   코드 그래프 + dep×code federation
    │     └── ... (검증·러너·집계 도구 다수)
    │
    ├── skills/                                AI 발동 스킬 — 자연어로 깨어남
    │     ├── _base-<name>/SKILL.md            공통 베이스
    │     ├── analysis-<name>/SKILL.md          레거시/입력 분석 (input~quality + 횡단)
    │     ├── discovery-<name>/SKILL.md         chain 1
    │     ├── spec-/plan-/test-/implement-      chain 2~5
    │     └── dep-graph-navigator / ticket-sync
    │
    ├── agents/                                서브 에이전트 (1-depth + prefix)
    │     ├── _base-senior-engineer.md          Senior critique
    │     ├── _base-industry-case-researcher.md 빅테크 사례
    │     ├── _base-official-docs-checker.md    공식문서 검증
    │     └── {analysis,discovery,spec,plan,test,implement}-agent.md   stage 별 (design = placeholder)
    │
    ├── hooks/                                 SessionStart / PreToolUse 등
    ├── templates/                             산출물 템플릿 (analysis + chain 6 stage)
    │
    ├── examples/                              PoC (실증 자산)
    │     ├── poc-01~05                          RealWorld Spring / NestJS / React / e2e
    │     ├── poc-06·07·11·16                    사내 EFI-WEB Spring 4.1 (Legacy)
    │     ├── poc-08·09·10                        MyBatis 3 / TypeORM / Spring Data JPA (Modern ORM)
    │     ├── poc-18·19                           Express+Prisma(TS) / numpy(Python) — 6-stage e2e
    │     └── poc-20                              fullchain + living-sync 정탐
    │
    ├── docs/adr/                              건축 결정 기록 (BE / FE / CHAIN / NEST family)
    ├── decisions/                             운영/일정 결정 로그 (INDEX.md = 진입점 / STATUS.md = 휘발)
    ├── guides/                                사용자 안내서 (getting-started / chain-harness / cookbook)
    ├── briefing/                              ← 본 자료 (사내 onboarding / Confluence 정본)
    │
    ├── .claude-plugin/plugin.json             플러그인 메타 (이름/버전/엔트리)
    ├── scripts/                               build-plugin / version-check / release-readiness
    ├── archive/                               과거 버전 자산 격리 (v1.0~v1.4)
    ├── README.md / CLAUDE.md                  외부 첫 화면 / 작업 컨텍스트
    └── CHANGELOG.md / CHANGELOG-HISTORY.md    변경 이력 단일 SSOT
```

### 폴더가 묶이는 큰 그림

| 묶음             | 폴더                             | 무엇을 하나                                |
| ---------------- | -------------------------------- | ------------------------------------------ |
| **표준 정의**    | methodology-spec/, schemas/      | 방법론이 무엇인지 텍스트와 스키마로 못박음 |
| **자동화 엔진**  | tools/, hooks/, flows/           | 사람이 안 봐도 검증·발동되도록             |
| **AI 발동 자산** | skills/, agents/, templates/     | 동료가 자연어로 깨우는 인터페이스          |
| **실증**         | examples/                        | 실제 프로젝트들로 작동 입증                |
| **결정 기록**    | docs/adr/, decisions/            | 왜 이렇게 만들었는지 영구 보관             |
| **사용 안내**    | guides/, README.md, briefing/    | 동료가 처음 들어왔을 때 길잡이             |
| **포장**         | .claude-plugin/, scripts/        | 위의 모든 걸 자기완결 패키지로 묶기        |

---

## 3. 빌드와 배포 — 워크스페이스에서 플러그인이 나가는 길

이제 **동료가 dist 폴더를 받을 필요가 없습니다.** 사내 표준 설치 경로는 GHE 마켓플레이스(또는 Nexus npm)에서 직접 받는 것입니다.

```bash
# 저자(나)가 발행하기 전 검증
pnpm install              # 워크스페이스 deps (pnpm 11.x / Node ≥22 / nodeLinker=hoisted)
npm run version:check     # plugin.json ↔ package.json ↔ CHANGELOG 3-way 버전 동기화
npm run test              # 워크스페이스 검증 도구 전수 통과 (0 실패)
npm run release:check     # §8.1 strict criterion 전수 자동 검사
npm run build             # 자기완결 dist/ 생성 + CHECKSUMS.txt (오프라인 배포용)
```

발행은 두 채널:

- **Nexus npm** — `@mis-plugins/context-ops` 를 사내 레지스트리(`repo.smiledev.net`)에 publish. 마켓플레이스 `marketplace.json` 이 `source: npm` 으로 이걸 가리킵니다.
  - ⚠ 검증 도구의 deps(ajv 등)는 `bundledDependencies` 로 tarball 에 **동봉**됩니다. source:npm 설치는 deps 를 따로 install 하지 않기 때문에 이게 빠지면 도구가 깨집니다 (pnpm `nodeLinker: hoisted` 가 동봉을 보장).
- **GHE git** — 사내 GHE 레포에 read 권한 + git 인증만 있으면 마켓플레이스 add 로 직접 받습니다 (별도 artifact 전달 불필요).

오프라인 PC라면 `npm run build` 산출물(`dist/...-v<version>/` 폴더 또는 zip)을 받아 `CHECKSUMS.txt` 로 무결성 검증 후 로컬 경로로 install 합니다.

---

## 4. ② 플러그인 — 동료가 설치하는 패키지

플러그인 패키지에는 동료가 실제로 쓰는 데 필요한 핵심만 들어갑니다 (skills / agents / hooks / flows / templates / methodology-spec / schemas / tools / guides / docs(ADR) / README / CLAUDE / CHANGELOG + manifest). 다음은 의도적으로 **빠집니다**:

| 빠진 것       | 왜                                              |
| ------------- | ----------------------------------------------- |
| examples/     | 실증 PoC는 워크스페이스에서만 필요              |
| briefing/     | 사내 onboarding 자료 — Confluence 발행 채널 별도 |
| decisions/    | 운영 로그는 저자만 사용                         |
| archive/      | 과거 격리 자산                                  |
| scripts/      | 빌드할 사람에게만 필요                          |
| node_modules/ | 동봉 deps 외에는 불필요                         |

---

## 5. 입력은 네 가지, 도착점은 하나 — use-scenario taxonomy

이 방법론의 **가장 큰 목적**은 산출물을 "시스템 설명 문서"로 남기는 게 아닙니다. 산출물 자체가 **LLM 의 운영 컨텍스트**가 되어, 그 컨텍스트를 평생 동기화하며 프로젝트를 **AX(AI Transformation)로 운영**하는 것입니다 — LLM 이 정확한 컨텍스트로 개발·실행·수정·진화.

들어오는 입력은 네 가지지만, 모두 같은 정상 상태("AX 운영")로 수렴합니다.

| use-scenario        | 입력                          | 비고                          |
| ------------------- | ----------------------------- | ----------------------------- |
| **S2 — AX 전환**    | 레거시 코드                   | **주 타깃**. 운영 중 시스템을 AX 로 |
| S1 — 재생성         | 레거시 코드                   | 같은 시스템을 새로 짓기       |
| S3 — 특성화         | 레거시 코드                   | 동작 보존 위주                |
| greenfield          | PRD · 디자인 · 계약(swagger/figma) | 처음부터 AX-native (코드 없음) |

레거시 입력은 **analysis stage** 의 "코드-고고학 패스"로, greenfield 는 같은 stage 의 "입력어댑터 패스"로 산출물을 만듭니다. 어느 쪽이든 산출물이 곧 base 가 되고, 기능 추가 시 역방향으로 동기화됩니다(양방향 living-sync, 아래 7장).

---

## 6. 플러그인이 안에서 무엇을 하는가 — analysis + 5-gate chain

### Stage 0 — analysis (한 방향 추출)

레거시(또는 greenfield 입력)에서 이식 가능한 산출물을 뽑습니다. chain 의 게이트가 아니라 **soft exit gate #0** 입니다 (증거 누락 시 fail-closed).

```
레거시 코드베이스 / greenfield 입력
       ↓
┌─────────────────────────────────────────────┐
│ input → discovery(inventory) → architecture  │
│ → domain → business-rules → formal-spec       │  ← BR 이중 표현 (NL ↔ GWT)
│ → characterization → sql-inventory → api/ui   │
│ → quality(antipatterns)                       │
│ ── 횡단: a11y / i18n / static-security / legacy / code-graph │
│ ── BR cross-consistency check (Layer 1 결정적 + Layer 2 LLM) │
└─────────────────────────────────────────────┘
       ↓
이식 가능한 산출물 (json 단독 SSOT — .mermaid/.md twin 없음)
  · business-rules (index + per-BC 분할 / BR-split)
  · domain.json / openapi.yaml / schema.json(+relationship_label)
  · antipatterns.json + migration-cautions.json
```

> analysis §3-A 자동화 천장은 스택별로 다릅니다 — Spring 4.1+iBATIS 2(Legacy) ~53~55% / Modern ORM(MyBatis 3·TypeORM·JPA) ~60~67%. (chain harness 의 70~80% axis 와는 분모가 다른 별도 metric.)

### Stage 1~5 — chain harness (명세 → 새 시스템)

```
       analysis 산출물
            ↓
  체인 1: discovery  → 게이트 #1   (UC + 비즈니스 의도 추출)
            ↓
  체인 2: spec       → 게이트 #2   (behavior-spec + acceptance-criteria + 산출물 통합)
            ↓
  체인 3: plan       → 게이트 #3   (task 분해 / ADR / NFR allocation hard gate / risk)
            ↓
  체인 4: test       → 게이트 #4   (실 test 코드 / RED 의무)
            ↓
  체인 5: implement  → 게이트 #5   (실 impl 코드 / GREEN — test 100% pass)
            ↓
       프로덕션 시스템 + traceability-matrix
```

**체인 N = 게이트 #N** (1:1 내부 컨벤션). **사람은 5번의 게이트에서만** 통과(go)/중단(stop)/되돌리기(revisit)를 결정하고, 그 사이는 AI가 자동으로 합니다. 자동화 ~85% / 사람 검토 ≤15% — **100% 자동화는 의도적으로 하지 않습니다.**

게이트 #1 진입 시 chain-driver 가 BR 의미 일관성(Layer 2 LLM 포함) 통과를 강제합니다. 의미 격차(semantic_drift)가 발견되면 chain 진입이 차단됩니다.

---

## 7. 산출물이 살아 있다 — json 단독 SSOT + living-sync

- **json 단독 SSOT (v12.0.0~)** — 모든 산출물은 `.json` 한 벌이 진실입니다. 예전의 `.mermaid` + `.md` 짝(이중 렌더링)은 폐기됐습니다. 다이어그램이 필요하면 view-time 에 렌더합니다. 완전 AX-native.
- **BR-split (~v0.24.0)** — `business-rules.json` 이 index(파일명 보존) + `business-rules/<BC>.json`(per-BC leaf)로 분할됐습니다. 소비자는 loader 단일 변경점으로 분할이 투명하게 재조립됩니다.
- **living-sync (v0.5.0~)** — 코드/산출물이 바뀌면 영향 closure 를 따라 재생성 큐를 만들고(forward), 손수정 코드는 anchor 로 역추적해 의미 천장을 사람에게 surface 합니다(reverse). 한 번 만들고 끝이 아니라 **평생 동기화**되는 운영 컨텍스트입니다.

---

## 8. 진화의 흐름 — v2.5.1 에서 v0.24.0 까지

예전 브리핑은 v2.5.1 에서 멈춰 있었습니다. 그 사이 패러다임이 여러 번 바뀌었고, 버전 스킴도 한 번 리셋됐습니다.

```
v2.5.1 ─ v2.6 ─ v9.0 ─ v10/v11 ─ v12.0 ─ v12.x ──┃리셋┃─ v0.1 ─ ... ─ v0.24
  │       │      │       │         │       │              │              │
plugin  skill  6-stage  gate/BE·  json   codegraph    context-ops    BR-split
install rename chain    FE분리·   단독   wiring       리네임 +       STEP 3 +
호환    (의미) 도입     ticket    SSOT   (코드그래프) 0.x 리셋       living-sync
                                                                     완성
```

| 시기            | 사건                                                          |
| --------------- | ------------------------------------------------------------- |
| v2.5.1          | (이전 브리핑의 종착점) plugin install 호환성 회복             |
| v2.6            | 스킬 네임스페이스 rename (명시 호출 경로 정비)                |
| **v9.0.0**      | **6-stage chain harness 도입** (analysis → discovery → spec → plan → test → implement) |
| v10 / v11       | 게이트 #1~#5 1:1 컨벤션 + BE/FE 산출물 분리 + 4-level 티켓 cascade(plan stage) |
| **v12.0.0**     | **json 단독 SSOT** — `.mermaid`/`.md` twin 폐기 (ADR-008 Superseded / ADR-011) |
| v12.9~v12.16    | codegraph wiring (코드↔산출물 coverage / openapi 정적 검증) + chain/gate 번호 정합 |
| **v0.1.0**      | **`ai-native-methodology` → `context-ops` 리네임 + 0.x 버전 리셋** |
| v0.2 ~ v0.24    | PMD Tier 1 격상 / BR-split / living-sync Phase 1~4 / `.aimd` → `.ai-context` 리네임 |

> **왜 v12.16 에서 v0.1 로 리셋했나?** 식별자를 `context-ops` 로 바꾸면서, 누적된 12.x 가 성숙도를 과대 표기한다고 봤습니다. 아직 사내 미배포(실 사용자 0)인 pre-1.0 상태를 정직하게 반영해 0.x 로 리셋했습니다. 누적 12.x 이력은 CHANGELOG 에 연속 보존됩니다. 외부 영향 0.

---

## 9. 무엇으로 입증하는가 — PoC

§8.1 **단일 PoC 과적합 회피 규칙** — 한 PoC 에서만 보인 패턴은 절대 본체에 등재하지 않습니다. 최소 2개 이상의 다른 PoC 에서 같은 형태로 재현되어야 합니다.

| 묶음           | PoC                                  | 검증 차원                          |
| -------------- | ------------------------------------ | ---------------------------------- |
| RealWorld      | #01 Spring / #02 Spring Boot 3 / #03 NestJS | 첫 검증 / 다른 아키텍처 / 플랫폼 무관성 |
| FE             | #04 React FSD                        | 프론트엔드 트랙                    |
| chain e2e      | #05 sample 사용자 등록               | 5-gate e2e                         |
| 사내 Legacy    | #06·#07·#11·#16 EFI-WEB Spring 4.1   | Spring 4.1+iBATIS 2 spectrum       |
| Modern ORM     | #08 MyBatis 3 / #09 TypeORM / #10 JPA | analysis §3-A modern 천장 corroboration |
| 6-stage e2e    | #18 Express+Prisma(TS) / #19 numpy(Python) | 상태머신 외부 Modern 스택 완주     |
| living-sync    | #20 fullchain                        | 양방향 동기화 정탐                 |

---

## 닫는 한 줄

> **이 저장소는 사내 동료의 Claude Code 에서 깨어날 AI-Native 개발 플러그인을 만들고 배포하는 작업장입니다.**
>
> 모노레포에서 발행 → 자기완결 패키지(`@mis-plugins/context-ops`) → 동료 환경에 설치 → 자연어 한 마디로 발동.
>
> 그 안에서는 PoC로 입증된 검증 도구들이 analysis + 5개의 사람 게이트와 함께 돌아가고, 산출물은 json 단독 SSOT 로 평생 동기화되는 LLM 운영 컨텍스트가 됩니다.

---

## 하위 문서

본 메인 페이지 아래에 더 깊은 자료 3종이 붙어 있습니다.

1. **동료의 첫 5분 — 사용 시나리오** : 실제 프롬프트와 응답 흐름으로 따라가는 5분 워크스루
2. **검증 도구 역할표** : 각 도구가 무엇을 검증하고 무엇을 막아내는지
3. **버전별 진화사 (한 페이지씩)** : v1.0 부터 v0.24.0 까지 각 버전의 문제 인식 → 추가 → 입증 → 다음 숙제
