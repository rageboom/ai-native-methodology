# AI-Native 개발 방법론 v1.4.2

> 사내 표준 AI 기반 개발 방법론. 레거시 분석부터 재구현·운영까지의 라이프사이클을 표준화한다.
>
> 본 v1.4.x 는 **분석 단계 (analysis stage)** 의 구현 — "코드 → 형식 명세 + 위험 기록" 한 방향 추출기. 다른 SDLC stage (planning / design / test / implement) = v2.0+ scope (placeholder).
>
> **현재**: v1.4.2 PATCH (2026-05-02) — AP-FE-SECURITY-001 진짜 도구 직접 confirm + custom Semgrep rule 첫 실현 + drift-check.yml CI ratchet 통합 (ADR-010 §2.3 첫 운영 입증). 같은 날 v1.4.0 → v1.4.1 → v1.4.2 = 3 release cadence.
>
> ** v1.4.0 MINOR release (2026-05-02)**: FE 트랙 정식 진입 + §8.1 strict 검증대 첫 통과. ADR-FE 7건 ( ADR-FE-007 본체 antipattern 카탈로그 첫 등재 / AP-FE-SECURITY-001 4 PoC isomorphic) + schemas 13종 + tools 6종 + 4 PoC. 진짜 도구 6종 + IR 0.99 + 신뢰도 0.92 (ADR-009 단계 5).
>
> ** Plugin-first 사내 배포 자산** (DEC-2026-05-02 14~15차 결단): `.claude-plugin/` + `agents/` + `skills/analysis/` 18 + `hooks/` + `flows/` 채움. Phase A self-iteration 진입 가능. Phase B (사내 배포) 진입 전 의무 단계 = `docs/phase-a-iteration-guide.md` 참고.
>
> 자세한 내용은 [CHANGELOG.md](./CHANGELOG.md) 참조.

---

## 무엇을 하는가

```
[레거시 프로젝트]                     [7대 산출물]
   소스 코드                       1. 아키텍처/의존성
   ERD (있으면)                    2. 도메인 모델
   ORM (있으면)         ──>        3. API 계약
   운영 DB (있으면)                 4. DB 스키마
   기획 문서 (있으면)               5. 비즈니스 규칙
   디자인 명세 (있으면)             6. 안티패턴
                                   7. UI/UX 명세
```

분석 결과는 **AI와 사람 모두가 읽을 수 있는 형식** (JSON Schema + Mermaid + Markdown).

---

## Platform-Agnostic 입증 (3 PoC 통합 / v1.2.3 정식 등재)

본 방법론은 **3 platform PoC** 검증으로 platform-agnostic 임을 입증:

| PoC         | platform                           | 산출                                             | 신뢰도 |
| ----------- | ---------------------------------- | ------------------------------------------------ | ------ |
| **PoC #01** | Java + Spring Boot 2.5 (CRUD)      | 7대 산출물 6/7 / 15 AP / 33 finding              | 0.96   |
| **PoC #02** | Java + Spring Boot 3.3 + Hexagonal | 7대 산출물 6/7 / 21 AP / 43 finding              | 0.96   |
| **PoC #03** | TypeScript + NestJS + TypeORM      | 7대 산출물 6/7 / 11 AP / 49 finding / 1 positive | 0.94   |

→ 3 platform 모두 7대 산출물 6/7 도달 (UI/UX 만 N/A — BE only). 신뢰도 동급 (0.94~0.96).

### Cross-PoC 학습 효과 ( §8.1 정합 — 단일 PoC 과적합 회피)

| 분류                                     | 건수 | 사례                                                                           |
| ---------------------------------------- | ---- | ------------------------------------------------------------------------------ |
| ** 재현** (보편 결함)                    | 6    | EAGER N+1 ( 3 PoC) / API drift / DB UQ / PUT vs PATCH / versioning / limit cap |
| ** 변형 재현**                           | 3    | RSA git commit → Auth scope / Token apiKey 부분 / De Morgan 학습 효과          |
| ** 비재현 학습 효과 (positive finding)** | 3    | **NestJS Bearer 표준** ✅ / 307 redirect / TS generic 정적 차단                |

→ **균형 분포** = §8.1 단일 PoC 과적합 회피 정합. **본 방법론 적용 가능 platform** = Java/Spring + TypeScript/NestJS 입증 완료.

상세: [`docs/v1.3-promotion-report.md`](./docs/v1.3-promotion-report.md) — 3 PoC 통합 보고서 (격상 후보 6 + 사내 적용 ROI 견적).

---

## 시작하기

### 사전 요구사항

- Claude Code 설치 ( plugin 시스템 지원)
- 분석 대상 사내 legacy 프로젝트 git clone
- (선택) ERD 파일, 운영 DB 메타데이터, 기획 문서
- ( Windows 한국어 환경 / Semgrep 사용 시) `PYTHONUTF8=1` 환경변수

### 사용법 — Plugin install ( v1.4.x — 2 시나리오)

본 plugin install 은 **편집자 / 배포 수신자** 2가지 시나리오. `marketplace.json` 의 `"source": "./"` 가 등록한 폴더 자체를 plugin root 로 지정하므로, 워크스페이스든 dist artifact 든 동일 메커니즘.

Phase B (사내 marketplace 배포) 미진입 = local path 또는 git URL 직접 등록.

#### A. 편집자 — 워크스페이스 직접 등록 ( Phase A self-iteration)

본 repo 를 clone 하여 plugin 본체를 직접 수정하며 돌리는 시나리오. 워크스페이스 path 그대로 등록.

```bash
# Claude Code 세션에서:
/plugin marketplace add /absolute/path/to/ai-native-methodology/ai-native-methodology
/plugin install ai-native-methodology@ai-native-methodology
/reload-plugins
/plugin                  # 대화형 manager — Installed 탭에 현재 버전 확인
```

#### B. 배포 수신자 — dist artifact 등록 ( 사내 동료 받는 경로)

빌드된 artifact (`dist/internal-v<version>/` 폴더 또는 zip 압축본) 을 받아 install. 폴더 자체에 `.claude-plugin/{plugin.json, marketplace.json}` 가 들어있어 자기완결.

```bash
# 받은 dist 폴더를 임의 위치에 풀기:
#   ~/claude-plugins/ai-native-methodology-v<version>/
#   ├── .claude-plugin/{plugin.json, marketplace.json}
#   ├── agents/ skills/ hooks/ flows/ templates/ tools/ methodology-spec/ schemas/
#   ├── CHANGELOG.md / README.md / CLAUDE.md / ADOPTION-README.md
#   └── CHECKSUMS.txt   ← SHA256 manifest (무결성 검증용)

# Claude Code 세션에서:
/plugin marketplace add /absolute/path/to/ai-native-methodology-v<version>
/plugin install ai-native-methodology@ai-native-methodology
/reload-plugins
```

`CHECKSUMS.txt` 로 무결성 검증 — 배포자가 별도 채널 (사내 wiki / Slack pin) 으로 hash 제공 시 대조 권장.

#### 빌드 ( A → B artifact 생성)

편집자가 dist artifact 를 새로 만들 때:

```bash
# version 갱신 시 3-way sync 의무 ( source-of-truth = .claude-plugin/plugin.json — ADR-010)
#   .claude-plugin/plugin.json.version  ↔  CHANGELOG.md 첫 ## [vX.Y.Z]  ↔  package.json.version
npm run version:check       # 3-way sync 검증 단독
npm run build               # version-check 강제 → dist/internal-v<version>/ 생성 + CHECKSUMS.txt
npm run build:check         # dry-run (file count 만 출력)
npm run build:diff-check    # build 후 git diff exit-code 0 검증 (CI 용)
```

분석 대상 사내 legacy 프로젝트 디렉토리에서 새 Claude Code 세션 시작 → SessionStart hook 메시지 ( "Plugin loaded. Read CLAUDE.md...") 표시 시 정상 작동.

### Phase A self-iteration ( Phase B 진입 전 의무 단계)

본 v1.4.x = Phase A self-iteration 단계. 사용자가 본인 사내 legacy 프로젝트 1개에서 plugin 직접 돌려 마찰점 검출 → plugin 즉시 수정 → 재시도 (4원칙 §4 정합).

상세 절차 + 마찰점 finding template + 재시도 cadence: **[`docs/phase-a-iteration-guide.md`](./docs/phase-a-iteration-guide.md)**.

### 사용법 — skill description trigger ( install 후 자동)

Claude 가 코드베이스 시그널 자동 감지 → skill 자동 발동 (slash command 불필요):

| 자연어 prompt 예시        | 발동 skill                | manifest phase ID  |
| ------------------------- | ------------------------- | ------------------ |
| "이 코드베이스 분석 시작" | `phase-0-input`           | 0                  |
| "inventory 추출해줘"      | `phase-1-inventory`       | 1                  |
| "아키텍처 분석"           | `phase-2-architecture`    | 3 (arch)           |
| "도메인 모델 추출"        | `phase-3-domain`          | 4 (business-logic) |
| "비즈니스 규칙 추출"      | `phase-4-rules`           | 4                  |
| "OpenAPI 만들어줘"        | `phase-5-openapi` (BE)    | 5-1 (api)          |
| "DB schema + ERD"         | `phase-5-schema-erd` (DB) | 2 (db)             |
| "antipattern 정리"        | `phase-6-quality`         | 6                  |

aspect skill 4종 (a11y / i18n / static-security / legacy) = 코드베이스 시그널 (예: `package.json` 에 react / `pom.xml` 에 spring-boot) 자동 매칭. cross_cutting (phase 무관).

**skills 디렉토리의 phase 번호 ≠ manifest phase ID** — skills 의 phase-N prefix 는 산출물 번호 그룹 axis (예: `phase-2-architecture` 는 산출물 #2 / manifest phase 3 의 skill). 정책 명문 = [`methodology-spec/skills-axis.md`](./methodology-spec/skills-axis.md). SSOT = `flows/analysis.phase-flow.json` ( v1.4.4 정식 승격). drift-validator `--check-layout` 으로 3-way 정합 강제 (CI ratchet `.github/workflows/drift-check.yml`).

**각 skill 진입 시 사용자 승인 게이트** (Work Principles 4원칙).

### 사용법 — manual ( plugin 미사용 / fallback)

`methodology-spec/workflow/phase-*.md` 직접 차례로 적용. PoC 산출물은 `examples/poc-XX/output/` 구조 참조.

---

## 디렉토리 구조

```
ai-native-methodology/
├── docs/
│   ├── adr/                ADR 13종 (001~006 + 008/009/010 + NEST-001~004) ※ 007 부재 — openapi-extension.schema.json 으로 대체
│   └── v1.3-promotion-report.md
├── methodology-spec/       Single Source of Truth
│   ├── deliverables/       7대 산출물 명세 (1-architecture ~ 7-ui-ux)
│   ├── workflow/           phase-0 ~ phase-6 + phase-flow.json
│   ├── finding-system.md
│   ├── id-conventions.md
│   └── glossary-ko.md
├── schemas/                JSON Schema 12종 (계약)
│   ├── meta-confidence.schema.json
│   ├── architecture.schema.json
│   ├── domain.schema.json
│   ├── openapi-extension.schema.json
│   ├── db-schema.schema.json
│   ├── rules.schema.json
│   ├── antipatterns.schema.json
│   ├── ui-spec.schema.json
│   ├── inventory.schema.json
│   ├── formal-spec.schema.json
│   ├── finding-system.schema.json
│   └── README.md
├── templates/              산출물 템플릿 19종 (md / mermaid / json / yaml)
├── tools/                  Node CLI 검증 도구 5종
│   ├── drift-validator/         .json ↔ .mermaid 의미 동일성 + baseline / ratchet (ADR-010)
│   ├── decision-table-validator/ dmn-check 5종 (duplicate/conflict/gap/overlap/type)
│   ├── formal-spec-link-validator/ Phase 4.5 cross-link 검증 ( v1.3 신규)
│   ├── spectral-runner/          OpenAPI spectral lint wrapper ( no-simulation 진짜 외부 도구)
│   └── static-runner/            Semgrep/PMD/SpotBugs plugin host + lint-no-simulation
├── decisions/              결정 로그 (역시간순 / INDEX.md / STATUS.md / 25 DEC)
└── examples/               PoC 결과 ( 3 platform 검증)
    ├── poc-01-realworld-spring/        Java + Spring Boot 2.5 (CRUD)
    ├── poc-02-realworld-springboot3/   Java + Spring Boot 3.3 + Hexagonal
    └── poc-03-realworld-nestjs/        TypeScript + NestJS + TypeORM ( platform-agnostic 입증)

# 레포 루트 (본 디렉토리 외부)
.github/workflows/drift-check.yml   v1.2.1 — 이중 모드 (PR diff-aware + nightly full)
```

※ v1.4.x — Plugin 자산 채움 (DEC-2026-05-02 14~15차 결단):

- `.claude-plugin/plugin.json` (v1.4.2)
- `agents/_base/` 3종 (senior / official-docs / industry-case) + 5 stage 디렉토리
- `skills/_base/` 3 (apply-template / log-finding / apply-baseline-ratchet) + `skills/analysis/` 18 + 4 stage placeholder
- `hooks/hooks.json` (SessionStart + PostToolUse Write/Edit drift-validator)
- `flows/analysis.phase-flow.{json,mermaid}` (재배치)
- `templates/analysis/` (21 templates 이동)
- `methodology-spec/lifecycle-contract.md` (SDLC stage 간 data contract)
- `.mcp.json` placeholder (cli.mjs MCP wrapper = Phase A.1 carry)

## 검증 도구 사용 (v1.2.1)

```bash
# 1. drift validator — Phase 4.5 산출 후 자가 검증 (의무)
npx --prefix ai-native-methodology/tools/drift-validator . \
  drift-validator examples/poc-XX/output/formal-spec/

# 2. decision-table validator — dmn-check 5종
node ai-native-methodology/tools/decision-table-validator/src/cli.js \
  examples/poc-XX/output/formal-spec/decision-tables/

# 3. static-runner — 진짜 외부 도구 ( 시뮬 절대 금지)
node ai-native-methodology/tools/static-runner/src/cli.js \
  --plugin semgrep --target ./src --output ./out --ruleset p/owasp-top-ten

# 4. lint-no-simulation — 5종 물증 + simulation_only 차단
bash ai-native-methodology/tools/static-runner/src/lint-no-simulation.sh ./out
```

CI 자동화는 `.github/workflows/drift-check.yml` 참조 (PR / nightly / manual dispatch).

---

## 7원칙 (헌법)

1. **사상 명시**: Schema-First + Contract-First + DDD-Lite + FSD
2. **Bottom-up Always**: Function → File → Module → System
3. **Deterministic First, LLM Second**
4. **File System as Memory** (단계 간 통신 = 파일)
5. **Confidence as First-Class** (모든 산출물에 신뢰도 메타)
6. **Human-in-the-loop** (단계마다 승인 게이트)
7. **Single Source of Truth = Repo** (문서/플러그인은 레포 파생)
8. **한국어 1차** (영어 약어 최소화, 산업 표준 예외)

---

## 현재 상태 (v1.3.1 PATCH — 사내 표준 채택 가능 시점)

### v1.x 누적 (2026-04-26 ~ 2026-05-01)

- ✅ §0~§15 plan.md 완성
- ✅ 7대 산출물 + 형식 명세 JSON Schema 11종 + meta-confidence = 12종
- ✅ ADR 13종 (001~006 + 008 + 009 + 010 + NEST-001~004) ※ ADR-007 부재 — openapi-extension.schema.json 으로 대체
- ✅ Phase 4.5 형식 명세 정식 도입 (state-machine + sequence + decision-table + invariants + property-test)
- ✅ **3 PoC 종결 — platform-agnostic 입증** (Spring Boot 2.5 + Spring Boot 3.3 Hexagonal + NestJS) / 6 격상 후보 모두 본체 적용
- ✅ 이중 렌더링 사상 (ADR-008) + migration-cautions.md 의무 산출물
- ✅ **v1.2.1** — drift-validator + decision-table-validator + static-runner + drift-check.yml CI + 5종 물증 schema
- ✅ **v1.2.2** — 본체 갭 7건 closed (api.template.md / phase-flow / ADR-009 / db-schema.template.md / meta-confidence.template.yaml)
- ✅ **v1.2.3** — 본체 갭 8건 추가 closed (C/I/H/K + R/D + §8.1) + LMNO 4묶음 종결
- ✅ **v1.3.0** — Sprint 5 spectral 실 실행 (24 warnings / 0 errors / exit 0) + no-simulation 정책 첫 실현 + formal-spec-link-validator 신규 + ADR-NEST-001~004 + ADR-010 baseline+ratchet + 신뢰도 85-92% ( ADR-009 단계 4)
- ✅ **v1.3.1** PATCH — D3.2 원본 파일명 컨벤션 정리 (12 rename + 33 cross-link, dist 동기화)

### v1.3.x → v1.4 후속

- ⏳ **Sprint 5 잔여 carry-over** — Semgrep / PMD / OSV-Scanner 진짜 실행 ( 환경 변동 시)
- ⏳ **Sprint 6** (Node 환경 가능) — vacuum / openapi-changes / corpus 14→20쌍 / drift-validator phase-flow 비교기 / ADR-010 baseline mode wrapper
- ⏳ **D5** — Claude Code skill + slash command 패키징
- ⏳ **v1.4 candidate** — 4번째 PoC (FastAPI / Ktor / Rust / Go)
- ⏳ **adoption FE 트랙** — React+TS+TanStack Query+Zustand+Axios PoC #04

---

## 사상적 기반

| 사상                | 채택        | 출처                                            |
| ------------------- | ----------- | ----------------------------------------------- |
| Schema-First        | 주축        | Microsoft TypeSpec, OpenAPI 산업 표준           |
| Contract-First      | API 영역    | Hazelcast, Technijian 등 산업 사례              |
| DDD-Lite (B 강도)   | 도메인 영역 | Eric Evans DDD, 풀 DDD 의도적 제외              |
| FSD + Atomic Design | FE 영역     | Feature-Sliced Design, Brad Frost Atomic Design |

명시적 제외:

- Event Sourcing, CQRS, Saga, Anticorruption Layer
- 비기능 요구사항(NFR) 측정
- 테스트 코드 자동 분석

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

## 라이선스

(사내 표준 — 외부 공개 시 결정)

---

## 기여

- 변경 제안: GitHub Issue
- 변경 적용: PR + ADR 작성
- 방법론 자체 변경: ADR-XXX 신설 + plan.md 갱신
