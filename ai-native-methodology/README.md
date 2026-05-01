# AI-Native 개발 방법론 v1.3.0 ★★★

> 사내 표준 AI 기반 개발 방법론. 레거시 분석부터 재구현·운영까지의 라이프사이클을 표준화한다.
>
> 본 v1.x 는 **분석 단계 (① Analyze)** 의 구현 — "코드 → 형식 명세 + 위험 기록" 한 방향 추출기.
>
> **★★★ v1.3.0 release (2026-05-01)**: 3 PoC platform-agnostic 입증 + 11 묶음 본체 갭 closure + ★ Sprint 5 Node 도구 부분 종결 (spectral 실 실행 — 24 warnings / 0 errors / exit 0) + ★★★ no-simulation 정책 첫 실현. 신뢰도 85-92% 도달 (★ ADR-009 단계 4). **사내 표준 채택 가능 시점 도달**.
>
> **주요 격상**: Phase 4.5 cross-link 의무화 schema / AP-PERFORMANCE 3 PoC 권위 격상 / Positive finding 패턴 / Lifecycle BR / NestJS 4 ADR / ADR-010 Baseline+Ratchet / formal-spec-link-validator 도구.
>
> v1.2.1 — drift-validator + decision-table-validator + static-runner + drift-check.yml CI + 5종 물증 schema 강제. 진짜 도구 실 실행 Sprint 5 carry-over.
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

## ★★ Platform-Agnostic 입증 (3 PoC 통합 / v1.2.3 정식 등재)

본 방법론은 **3 platform PoC** 검증으로 platform-agnostic 임을 입증:

| PoC | platform | 산출 | 신뢰도 |
|---|---|---|---|
| **PoC #01** | Java + Spring Boot 2.5 (CRUD) | 7대 산출물 6/7 / 15 AP / 33 finding | 0.96 |
| **PoC #02** | Java + Spring Boot 3.3 + Hexagonal | 7대 산출물 6/7 / 21 AP / 43 finding | 0.96 |
| **PoC #03** | TypeScript + NestJS + TypeORM | 7대 산출물 6/7 / 11 AP / 49 finding / 1 positive | 0.94 |

→ ★ 3 platform 모두 7대 산출물 6/7 도달 (UI/UX 만 N/A — BE only). 신뢰도 동급 (0.94~0.96).

### Cross-PoC 학습 효과 (★ §8.1 정합 — 단일 PoC 과적합 회피)

| 분류 | 건수 | 사례 |
|---|---|---|
| **★ 재현** (보편 결함) | 6 | EAGER N+1 (★ 3 PoC) / API drift / DB UQ / PUT vs PATCH / versioning / limit cap |
| **★ 변형 재현** | 3 | RSA git commit → Auth scope / Token apiKey 부분 / De Morgan 학습 효과 |
| **★★ 비재현 학습 효과 (positive finding)** | 3 | **NestJS Bearer 표준** ✅ / 307 redirect / TS generic 정적 차단 |

→ **균형 분포** = §8.1 단일 PoC 과적합 회피 정합 ★. **본 방법론 적용 가능 platform** = Java/Spring + TypeScript/NestJS 입증 완료.

상세: [`docs/v1.3-promotion-report.md`](./docs/v1.3-promotion-report.md) — 3 PoC 통합 보고서 (격상 후보 6 + 사내 적용 ROI 견적).

---

## 시작하기

### 사전 요구사항
- Claude Code 설치
- 분석 대상 레포 git clone
- (선택) ERD 파일, 운영 DB 메타데이터, 기획 문서

### 사용법 (예정)

```bash
# 레포에 plugin 설치
cp -r plugin/.claude/* {분석대상레포}/.claude/

# 분석 시작
cd {분석대상레포}
claude code

# Phase 별로 실행
/analyze-init      # 1단계: 인벤토리
/analyze-db        # 2단계: DB + 정합성 검증
/analyze-arch      # 3단계: 아키텍처
/analyze-business-logic  # 4단계: 비즈니스 로직 (4영역 병렬)
/analyze-api       # 5-1단계: API
/analyze-ui        # 5-2단계: UI/UX
/analyze-quality   # 6단계: 품질 통합
```

각 단계는 **사용자 승인 게이트** 후 다음 단계로 진행.

---

## 디렉토리 구조

```
ai-native-methodology/
├── docs/                   사람이 읽는 가이드
│   ├── methodology-v1.md
│   ├── onboarding.md
│   └── adr/                의사결정 기록
├── methodology-spec/       Single Source of Truth
│   ├── deliverables/       7대 산출물 명세
│   ├── workflow/           7단계 워크플로우 명세
│   ├── id-conventions.md
│   └── glossary-ko.md
├── schemas/                JSON Schema (계약)
│   ├── meta-confidence.schema.json
│   ├── architecture.schema.json
│   ├── domain.schema.json
│   ├── openapi-extension.schema.json
│   ├── db-schema.schema.json
│   ├── rules.schema.json
│   ├── antipatterns.schema.json
│   └── ui-spec.schema.json
├── templates/              산출물 템플릿
├── plugin/                 Claude Code 플러그인
│   └── .claude/
│       ├── skills/
│       ├── agents/
│       └── commands/
├── tools/                  ★ v1.2.1 신설 — Phase 4.5 자동 검증 도구
│   ├── drift-validator/        .json ↔ .mermaid 의미 동일성 (state + sequence)
│   ├── decision-table-validator/ dmn-check 5종 (duplicate/conflict/gap/overlap/type)
│   └── static-runner/           Semgrep/PMD/SpotBugs plugin host + 5종 물증 + lint-no-simulation
├── decisions/              결정 로그 (역시간순 / INDEX.md / STATUS.md)
├── examples/               PoC 결과 (★ 3 platform 검증)
│   ├── poc-01-realworld-spring/        ★ Java + Spring Boot 2.5 (CRUD)
│   ├── poc-02-realworld-springboot3/   ★ Java + Spring Boot 3.3 + Hexagonal
│   └── poc-03-realworld-nestjs/        ★ TypeScript + NestJS + TypeORM (★★ platform-agnostic 입증)
└── .claude-plugin/         사내 plugin 배포 설정

# 레포 루트 (본 디렉토리 외부)
.github/workflows/drift-check.yml   ★ v1.2.1 — 이중 모드 (PR diff-aware + nightly full)
```

## 검증 도구 사용 (v1.2.1)

```bash
# 1. drift validator — Phase 4.5 산출 후 자가 검증 (의무)
npx --prefix ai-native-methodology/tools/drift-validator . \
  drift-validator examples/poc-XX/output/formal-spec/

# 2. decision-table validator — dmn-check 5종
node ai-native-methodology/tools/decision-table-validator/src/cli.js \
  examples/poc-XX/output/formal-spec/decision-tables/

# 3. static-runner — 진짜 외부 도구 (★★★ 시뮬 절대 금지)
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

## 현재 상태 (v1.2.1 — 묶음 N+O 인프라 100% 산출)

### v1.x 누적 (2026-04-26 ~ 2026-04-30)

- ✅ §0~§15 plan.md 완성
- ✅ 7대 산출물 + 형식 명세 JSON Schema 11개 완성 (formal-spec / finding-system 신설)
- ✅ ADR 8개 (001~006 + 008 + **009 신규** v1.2.2) — ADR-007 OpenAPI x-extension 별도 / ADR-010 baseline+ratchet Sprint 5 carry-over
- ✅ Phase 4.5 형식 명세 정식 도입 (state-machine + sequence + decision-table + invariants + property-test)
- ✅ PoC #01 + #02 종결 — Phase 1~6 + Phase 4.5 4 sprint
- ✅ 이중 렌더링 사상 (ADR-008) 정식 등록
- ✅ migration-cautions.md 의무 산출물 격상
- ✅ **v1.2.1 — drift-validator + decision-table-validator + static-runner 3종 도구 + drift-check.yml CI + 5종 물증 schema 강제**
- ✅ **v1.2.2 — 본체 갭 7건 모두 closed**: api.template.md / phase-flow.mermaid+json / ADR-009 / db-schema.template.md / meta-confidence.template.yaml
- ✅ PoC #02 자가 검증 → 11 신규 finding (F-107~F-117) 자동 검출

### v1.2.x → v1.3 후속

- ⏳ **Sprint 5 carry-over** — static tool 실 실행 1회 (Semgrep+PMD) / drift-validator transitionFuzzyMatch 보완 / corpus 4쌍→20쌍 / ADR-010 (baseline+ratchet)
- ⏳ 본체 갭 P2-3 5건 (api.template.md / phase-flow.mermaid / db-schema.template.md / meta-confidence.template)
- ⏳ Claude Code 플러그인 구현
- ⏳ PoC #03 (다른 stack — FastAPI / NestJS / Ktor)

---

## 사상적 기반

| 사상 | 채택 | 출처 |
|---|---|---|
| Schema-First | 주축 | Microsoft TypeSpec, OpenAPI 산업 표준 |
| Contract-First | API 영역 | Hazelcast, Technijian 등 산업 사례 |
| DDD-Lite (B 강도) | 도메인 영역 | Eric Evans DDD, 풀 DDD 의도적 제외 |
| FSD + Atomic Design | FE 영역 | Feature-Sliced Design, Brad Frost Atomic Design |

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
