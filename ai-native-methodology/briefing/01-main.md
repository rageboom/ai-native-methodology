# AI-Native 개발 방법론 — 종합 브리핑

## 들어가며

이런 상황을 상상해보세요. 사내에 오래된 시스템이 하나 있습니다. 이걸 새 시스템으로 다시 짓기로 했습니다. 보통이라면 개발자들이 코드를 읽고, 회의를 하고, 사양서를 쓰고, 테스트를 만들고, 구현을 합니다. 몇 달이 걸립니다.

여기에 AI를 투입하고 싶습니다. 그런데 그냥 "ChatGPT한테 물어봐" 식으로는 결과가 들쭉날쭉하고, 100% 자동화는 환각과 누락을 만들어내고, 그렇다고 사람이 다 보면 AI를 쓰는 의미가 없어집니다.

**이 프로젝트는 그 딜레마를 푸는 사내 표준 방법론** 입니다. 그리고 그 방법론을 **누구나 받아서 쓸 수 있는 Claude Code 플러그인** 으로 포장해서 배포합니다.

---

## 1. 가장 먼저 알아두실 것 — 세 개의 공간

이 프로젝트를 이해하시려면 **공간이 세 개로 나뉜다** 는 것만 기억하시면 됩니다.

```
   ① 워크스페이스           ②  플러그인              ③ 사용 현장
   (저자가 만드는 곳)        (배포되는 산출물)        (동료가 쓰는 곳)
   ─────────────            ─────────────            ─────────────
   /ai-native-methodology    dist/                    동료의 Claude Code
                             ai-native-methodology-
                             v2.2.0/

      방법론을 설계,            이 폴더 하나에           "비즈니스 규칙
      검증 도구를 만들고,       모든 게 자기완결로       추출해줘" 같은
      13개 PoC로 입증하는       포장됨. 받은 사람이      자연어 한 마디로
      작업장.                  어디에 풀어도 작동.       AI가 알아서 작동.
                              272 파일 / 체크섬 검증.

         │                         ↑                          ↑
         │                         │                          │
         └───── npm run build ─────┘                          │
                                   │                          │
                                   └─── 사내 wiki / Slack ────┘
                                        압축본 전달 후
                                        /plugin install
```

**핵심**:

- ① 워크스페이스에는 저자(나)만 작업합니다. 동료는 들어오지 않습니다.
- ② 플러그인은 ①에서 빌드해서 추출한 자기완결 폴더입니다. 이게 배포 단위입니다.
- ③ 사용 현장에서는 ②를 받아 설치만 하면 됩니다. ①의 존재를 몰라도 됩니다.

---

## 2. ① 워크스페이스 — 안에 무엇이 들어 있는가

저장소 루트의 트리 구조와 각 폴더의 역할입니다.

```
ai-native-methodology/                        ← 저장소 루트
│
├── methodology-spec/                         방법론 명세 — 텍스트로 쓰인 표준
│       ├── workflow/                         단계별 작업 절차 (Phase 0~6, 4.5, 4.7, 4.8)
│       ├── deliverables/                     산출물 정의 (24종)
│       ├── glossary-ko.md                    한국어 용어집
│       └── id-conventions.md                 ID 명명 규칙
│
├── schemas/                                  JSON Schema 31종 — 산출물의 모양 정의
│       ├── rules.schema.json                 비즈니스 규칙
│       ├── domain.schema.json                도메인 모델
│       ├── characterization-spec.schema.json (v2.1 추가)
│       ├── sql-inventory.schema.json         (v2.2 추가)
│       └── ... (총 31개)
│
├── tools/                                    자동 검증 도구 14종 (Node.js)
│       ├── chain-driver/                     체인 하네스 5요소 enforcement
│       ├── drift-validator/                  코드↔명세 정합 자동 검사
│       ├── chain-coverage-validator/         단계 간 커버리지 측정
│       ├── traceability-matrix-builder/      UC→BHV→AC→TC→IMPL 추적성
│       ├── sql-inventory-extractor/          (v2.2 신규)
│       └── ... (총 14개 / 단위 테스트 280개)
│
├── skills/                                   AI 발동 스킬 21종 — 자연어로 깨어남
│       ├── analysis/                         레거시 분석용 (Phase 0~6 + 4.5/4.7/4.8)
│       ├── planning/                         체인 1: 기획
│       ├── spec/                             체인 2: 행동/인수 명세
│       ├── test/                             체인 3: 테스트
│       └── implement/                        체인 4: 구현
│
├── agents/                                   서브 에이전트 정의
│       ├── analysis/                         분석 단계용
│       ├── planning/ spec/ test/ implement/  체인 단계별
│       └── _base/                            공통 베이스
│
├── hooks/                                    Claude Code 훅
│       └── hooks.json                        SessionStart / PreToolUse 등
│
├── flows/                                    단계 흐름 정의 (단일 진실)
│       ├── analysis.phase-flow.json          ← 모든 phase 의존 그래프 SSOT
│       └── analysis.phase-flow.mermaid       사람용 다이어그램
│
├── templates/                                산출물 템플릿
│       ├── analysis/  design/  test/         단계별 빈 양식
│       └── adoption/                         사내 적용 진입점
│
├── examples/                                 13개 PoC (실증 자산)
│       ├── poc-01-realworld-spring/          Java/Spring 2.5
│       ├── poc-04-full-realworld-react/      React FSD
│       ├── poc-08-realworld-mybatis/         MyBatis 3
│       └── ... (총 13개)
│
├── docs/adr/                                 건축 결정 기록 (ADR)
│       ├── ADR-001 ~ ADR-010                 BE 결정 10종
│       ├── ADR-FE-001 ~ FE-007               FE 결정 7종
│       └── ADR-CHAIN-001 ~ 008               체인 하네스 결정 8종
│
├── decisions/                                운영/일정 결정 로그
│       ├── INDEX.md                          역시간순 단일 진입점
│       └── STATUS.md                         현재 진행 상태 (휘발성)
│
├── guides/                                   사용자 안내서
│       ├── getting-started.md
│       ├── chain-harness-guide.md
│       ├── common-errors.md
│       └── first-prompt-cookbook.md
│
├── .claude-plugin/                           Claude Code 플러그인 매니페스트
│       ├── plugin.json                       플러그인 메타 (이름/버전/엔트리)
│       └── marketplace.json                  마켓플레이스 등록 정보
│
├── scripts/                                  빌드 스크립트
│       ├── build-plugin.js                   ← npm run build 가 호출
│       ├── version-check.js                  3-way 버전 동기화 검증
│       └── release-readiness.js              §8.1 7/7 자동 검사
│
├── dist/                                     빌드 산출물 (이게 ②플러그인)
│       ├── ai-native-methodology-v2.0.0/
│       ├── ai-native-methodology-v2.1.0/
│       ├── ai-native-methodology-v2.1.1/
│       └── ai-native-methodology-v2.2.0/    ← 가장 최신
│
├── archive/                                  과거 버전 자산 격리
│       ├── v1.3-adoption/                    v1.3 시기 적용 보고
│       └── phase-a-iteration/                Phase A 반복 절차 (v2.0 이전)
│
├── README.md                                 외부 첫 화면
├── CLAUDE.md                                 작업 컨텍스트 (저자용)
├── CHANGELOG.md                              최근 변경 (v1.4+)
├── CHANGELOG-HISTORY.md                      과거 변경 (v1.3 이전)
└── package.json                              npm 워크스페이스 14개 정의
```

### 폴더가 묶이는 큰 그림

| 묶음 | 폴더 | 무엇을 하나 |
|---|---|---|
| **표준 정의** | methodology-spec/, schemas/ | 방법론이 무엇인지 텍스트와 스키마로 못박음 |
| **자동화 엔진** | tools/, hooks/, flows/ | 사람이 안 봐도 검증·발동되도록 |
| **AI 발동 자산** | skills/, agents/, templates/ | 동료가 자연어로 깨우는 인터페이스 |
| **실증** | examples/ | 13개 실제 프로젝트로 작동 입증 |
| **결정 기록** | docs/adr/, decisions/ | 왜 이렇게 만들었는지 영구 보관 |
| **사용 안내** | guides/, README.md | 동료가 처음 들어왔을 때 길잡이 |
| **포장** | .claude-plugin/, scripts/, dist/ | 위의 모든 걸 자기완결 폴더로 묶기 |

---

## 3. 빌드 — 워크스페이스에서 플러그인이 만들어지는 순간

명령어 한 줄입니다.

```bash
npm run build
```

이 명령이 내부적으로 하는 일:

```
1. version-check.js 실행
   └─ plugin.json / package.json / CHANGELOG.md
      세 곳의 버전이 일치하는지 확인 (불일치 시 빌드 중단)

2. build-plugin.js 실행
   └─ 플러그인에 필요한 폴더만 골라서 dist/ 안에 복사
      ├─ agents/ skills/ hooks/ flows/ templates/
      ├─ methodology-spec/ schemas/ tools/ guides/
      ├─ docs/ (ADR만)
      ├─ .claude-plugin/ (manifest)
      └─ README.md / CHANGELOG.md / CLAUDE.md

3. SHA256 체크섬 매니페스트 생성
   └─ CHECKSUMS.txt — 271개 파일 무결성 검증용

결과: dist/ai-native-methodology-v2.2.0/ (272 파일)
```

워크스페이스에는 PoC 자산(examples/), 노드 모듈, 아카이브, 빌드 스크립트 등 **개발에만 필요한 것** 들이 잔뜩 있는데, 빌드는 그중에서 **동료가 실제로 쓰는 데 필요한 것만** 골라냅니다.

---

## 4. ② 플러그인 — 빌드된 폴더 안에 무엇이 들어 있는가

```
ai-native-methodology-v2.2.0/                 ← 이 폴더 하나가 배포 단위
│
├── .claude-plugin/                           Claude Code가 가장 먼저 읽음
│       ├── plugin.json                       이 폴더가 플러그인임을 선언
│       └── marketplace.json                  마켓플레이스 등록 정보
│
├── skills/                                   자연어 트리거의 본체
│       └── (워크스페이스의 skills/ 와 동일)
│
├── agents/                                   서브 에이전트 정의
├── hooks/                                    SessionStart 등 자동 훅
├── flows/                                    단계 의존 그래프
├── templates/                                산출물 빈 양식
│
├── methodology-spec/                         방법론 명세 (참조용)
├── schemas/                                  JSON Schema 31종
├── tools/                                    Node.js 검증 도구 14종
│
├── guides/                                   사용자 안내서
│       ├── getting-started.md
│       ├── first-prompt-cookbook.md          ← 동료가 가장 먼저 펼쳐볼 곳
│       └── ...
│
├── docs/adr/                                 결정 기록 (왜 이렇게 만들었는지)
│
├── README.md                                 첫 화면
├── CLAUDE.md                                 동료 환경에서의 작업 컨텍스트
├── CHANGELOG.md / CHANGELOG-HISTORY.md
│
└── CHECKSUMS.txt                             SHA256 무결성 매니페스트
```

### 워크스페이스에는 있고 플러그인에는 없는 것

플러그인에서 **빠진** 것이 있습니다. 이게 의도적인 설계입니다.

| 빠진 폴더 | 왜 뺐나 |
|---|---|
| examples/ (13개 PoC) | 실증 자산은 워크스페이스에서만 필요. 동료에게 줄 필요 없음 |
| node_modules/ | 동료가 직접 npm install |
| archive/ | 과거 격리 자산. 사용자 가치 없음 |
| decisions/ | 운영 로그는 저자만 사용 |
| scripts/ | 빌드 스크립트는 빌드할 사람에게만 필요 |
| dist/ | 자기 자신을 다시 넣으면 무한 중첩 |

즉 플러그인은 **"동료가 실제로 쓰는 데 필요한 핵심"** 만 추려낸 슬림 버전입니다.

---

## 5. ③ 사용 현장 — 동료가 어떻게 쓰는가

### 설치는 명령어 두 줄

```bash
# 동료의 Claude Code 세션에서:
/plugin marketplace add ~/Downloads/ai-native-methodology-v2.2.0
/plugin install ai-native-methodology@ai-native-methodology
```

설치 후 동료가 **자기 회사의 레거시 프로젝트 디렉토리에서** Claude Code를 켜면, SessionStart 훅이 자동으로 인사합니다.

```
v2.0 chain harness ready
   분석 단계: "이 코드베이스 분석 시작" 부터 시작하세요
   체인 단계: chain-driver init <project> 부터 시작하세요
```

### 그 다음은 그냥 한국어로 말하면 됩니다

```
동료:  "이 코드베이스 분석 시작"
  → phase-0-input 스킬 자동 발동

동료:  "비즈니스 규칙 추출해줘"
  → phase-4-rules 스킬 자동 발동

동료:  "OpenAPI 만들어줘"
  → phase-5-openapi 스킬 자동 발동

동료:  "기획 단계 시작"
  → 체인 1 (planning) 진입
```

스킬은 21개. 훅과 플로우가 의존 관계를 자동으로 챙겨줍니다. 동료는 21개의 스킬 이름을 외울 필요 없이 **그냥 자기 의도를 말하면** 적절한 스킬이 깨어납니다.

---

## 6. 플러그인이 안에서 무엇을 하는가

### 두 단계로 나뉩니다

#### Stage 1 — 분석 (레거시 → 이식 가능한 명세)

```
레거시 코드베이스
       ↓
┌─────────────────────────────────────────┐
│ Phase 0   입력 검증                       │
│ Phase 1   코드베이스 인벤토리             │
│ Phase 2   아키텍처 분석                   │
│ Phase 3   도메인 모델 추출                │
│ Phase 4   비즈니스 규칙                   │
│ Phase 4.5 형식화 (FSM / Decision Table)  │
│ Phase 4.7 의도 vs 버그 분류               │  ← v2.1
│ Phase 4.8 SQL 단위 인벤토리               │  ← v2.2 (오늘)
│ Phase 5   OpenAPI / DB 스키마 / FE 명세   │
│ Phase 6   안티패턴 카탈로그               │
└─────────────────────────────────────────┘
       ↓
이식 가능한 명세 5종
  · rules.json         (비즈니스 규칙)
  · domain.json        (도메인 모델)
  · openapi.yaml       (API)
  · schema + ERD       (DB)
  · antipatterns       (회피 목록)
```

#### Stage 2 — 체인 하네스 (명세 → 실제 새 시스템)

```
       Stage 1 산출물
            ↓
  ┌────────────────────┐
  │ 체인 1: 기획        │ → 게이트 #1 (사람이 통과/중단 결정)
  └────────────────────┘
            ↓
  ┌────────────────────┐
  │ 체인 2: 행동 + 인수 │ → 게이트 #2
  └────────────────────┘
            ↓
  ┌────────────────────┐
  │ 체인 3: 테스트(RED) │ → 게이트 #3 (테스트가 일단 실패해야 함)
  └────────────────────┘
            ↓
  ┌────────────────────┐
  │ 체인 4: 구현(GREEN) │ → 게이트 #4 (테스트 100% 통과해야 함)
  └────────────────────┘
            ↓
       프로덕션 시스템 + 추적성 매트릭스
```

**4개의 게이트** = 사람이 4번만 보면 됩니다. 그 사이는 모두 AI가 자동으로 합니다.

---

## 7. 무엇으로 입증했는가 — 13개 PoC

| # | 대상 | 검증한 차원 |
|---|---|---|
| #01 | RealWorld Spring Boot 2.5 | 첫 검증 |
| #02 | Spring Boot 3.3 Hexagonal | 다른 아키텍처 |
| #03 | NestJS | **플랫폼 무관성** |
| #04 | React + FSD | 프론트엔드 트랙 |
| #05 | 샘플 사용자 등록 | 체인 하네스 e2e |
| #06~07 | 사내 EFI-WEB Spring 4.1 | 사내 직접 검증 |
| #08 | jpetstore-6 (MyBatis 3) | Modern XML |
| #09 | TypeORM raw SQL | 패러다임+플랫폼 교차 |
| #10 | Spring Data JPA | 다른 ORM 패러다임 |
| #11 | EFI-WEB billing | 사내 우선순위 #1 (대기) |
| #12~13 | raw SQL / QueryDSL 정탐 | 오픈소스 부재 사실 확보 |

> **§8.1 단일 PoC 과적합 회피 규칙** — PoC 한 개에서만 보인 패턴은 절대 본체에 등재하지 않습니다. 최소 2개 이상의 다른 PoC에서 같은 형태로 재현되어야 합니다. 오늘 릴리스된 SQL Inventory 는 **5개 PoC × 6개 차원** (패러다임/ORM/플랫폼/언어/책임/규모)에서 동형 입증되었습니다.

---

## 8. 진화의 흐름

```
v1.0 ──── v1.4 ──── v2.0 ──── v2.1 ──── v2.2 (오늘)
  │         │         │         │         │
  분석      FE 트랙    체인     의도/버그   SQL
  단계      합류      하네스    분류        인벤토리
  정착                도입
  (BE)      (BE+FE)  (MAJOR)   (MINOR)    (MINOR)
```

| 시기 | 사건 | 의미 |
|---|---|---|
| v1.0~1.3 | 분석 Phase 0~6 정착, PoC #01~03 | 백엔드 분석 표준 자리 잡음 |
| v1.4 | PoC #04 합류 | 프론트엔드 트랙 추가 |
| **v2.0** | 체인 하네스 도입 | "분석만"에서 "**실제 새 시스템 짓기**" 로 진화 |
| v2.1 | Phase 4.7 신설 | 레거시의 "의도된 동작 vs 버그" 판별 |
| **v2.2** | Phase 4.8 신설 (오늘) | SQL을 11개 컬럼으로 인벤토리화 |

---

## 9. 지금 어디까지 와 있는가

### 오늘(2026-05-08) 기준

| 항목 | 상태 |
|---|---|
| 버전 | **v2.2.0 정식 릴리스** |
| 단위 테스트 | 280개 / 0 실패 |
| 빌드 산출물 | 272 파일 / 271 체크섬 OK |
| 클린 클론 재실행 | 통과 |
| 릴리스 자격 §8.1 strict | 7/7 |
| 시니어 검토 4종 | 모두 통과 |

### 다음 (v2.3.0 후보, 사용자 승인 대기)

1. Gartner TIME 매핑 — SQL 인벤토리에 "유지/투자/이전/제거" 4분면
2. patterns_extension_v3 — Cache / Discriminator / TypeHandler 확장
3. Spring 4.1 + iBATIS 2 sub-rule 동형화

추가로 **PoC #11 (사내 EFI-WEB billing)** 가 사용자 우선순위 #1로 대기 중. 소스가 도착하는 즉시 진입.

---

## 닫는 한 줄

> **이 저장소는 사내 동료의 Claude Code에서 깨어날 AI-Native 개발 플러그인을 만들고 배포하는 작업장입니다.**
>
> 워크스페이스에서 빌드 → 자기완결 플러그인 폴더 → 동료 환경에 설치 → 자연어 한 마디로 발동.
>
> 그 안에서는 13개 PoC로 입증된 14개의 검증 도구가 4번의 사람 게이트와 함께 돌아갑니다.

---

## 하위 문서

본 메인 페이지 아래에 더 깊은 자료 3종이 붙어 있습니다.

1. **동료의 첫 5분 — 사용 시나리오** : 실제 프롬프트와 응답 흐름으로 따라가는 5분 워크스루
2. **14개 검증 도구 역할표** : 각 도구가 무엇을 검증하고 무엇을 막아내는지
3. **버전별 진화사 (한 페이지씩)** : v1.0 부터 v2.2 까지 각 버전의 문제 인식 → 추가 → 입증 → 다음 숙제
