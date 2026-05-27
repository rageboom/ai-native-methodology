# Jira 사내 표준 + VOC 라우팅 설계 정리

> 2026-05-26 / conversation 토론 정리. 다음 세션 진입 시 참조용.

---

## 1. 풀려는 문제

- 사내에 시스템 52개 있음 (Initiative 1개 = 시스템 1개). 각 시스템은 frontoffice + backoffice 구조.
- VOC (고객 불만/요청) 가 들어오면 PM이 일감 (티켓) 을 만들어 담당자에게 라우팅해야 함.
- **문제 1**: PM이 52개 시스템 다 알지 못함. 담당자도 모름. 라우팅이 어려움.
- **문제 2**: 사내 Jira 표준 자체가 명확하지 않음. 어떤 type 을 언제 쓰는지 PM 마다 다름.

→ 두 갈래 작업이 동시에 필요:
- **(1) 사내 Jira 표준** 잡기 (← 본 conversation 에서 주로 결단)
- **(2) VOC 라우팅 MCP 도구** 만들기 (← 다음 단계로 미룸)

---

## 2. Jira 공식 표준 사실 확인 (Atlassian 공식 docs)

- **Jira 표준 hierarchy = 3-level**: **Epic > Story/Task/Bug > Subtask**
  - **Story / Task / Bug 는 같은 level** (형제 관계). Task 는 Story 의 자식이 아님.
- **Initiative** 는 표준이 아님. Jira Cloud **Premium** 의 **Plans** (구 Advanced Roadmaps) 에서 Epic 위로 추가하는 **custom level**.
- 사내가 5-level (Initiative > Epic > Story > Task > Subtask) 운영 중이라면 Premium custom hierarchy 설정으로 추정됨. **정확한 사내 설정은 Jira admin 의 issue type hierarchy 페이지 확인 필요** (carry).

출처:
- https://support.atlassian.com/jira-cloud-administration/docs/configure-the-issue-type-hierarchy/
- https://support.atlassian.com/jira-cloud-administration/docs/what-are-issue-types/

---

## 3. 사내 Jira 표준 (확정안)

| Level | 유형 | 의미 |
|---|---|---|
| +2 | **Initiative** | 시스템 (52개 / frontoffice + backoffice 한 쌍이 한 시스템) |
| +1 | **Epic** | 화면 (frontoffice 화면 또는 backoffice 화면). + 화면 없는 BE-only 가치용 "External Integration" 같은 가상 Epic |
| 0 | **Story** | **사용자가 직접 가치 받는 일감** — 화면 안 기능 / 외부 시스템 연동 API 등 |
| 0 | **Task** | **내부 작업** — 리팩토링 / 라이브러리 업그레이드 / 인프라 변경 (사용자 보는 변화 없음) |
| 0 | **Bug** | **결함 수정** — 원래 동작이 깨진 경우 |
| −1 | **Subtask** | Story/Task/Bug 잘게 쪼갠 단위 (BE 구현 / FE 구현 / DB 마이그레이션 등) |

### 3.1 각 type 의 구분 기준

- **Story vs Task** = **"누가 가치 받나"**
  - 사용자 / 외부 시스템이 받는다 → **Story**
  - 우리 내부가 받는다 → **Task**
- **Story vs Bug** = **"원래 동작이 있었나"**
  - 신기능/개선 (없던 가치를 추가) → **Story**
  - 기존 동작이 깨짐 → **Bug**
- **Story vs Subtask** = **"단독으로 가치 전달되나"**
  - 단독으로 사용자 가치 전달 가능 → **Story**
  - Story 안의 일부 작업 (BE 구현만, FE 구현만 등) → **Subtask**

### 3.2 Story 에 BE-only 일감 들어갈 수 있나?

**들어감**. Story = FE/BE 구분이 아니라 **가치 단위 구분**.

- **Full-stack Story**: "고객이 주문을 취소할 수 있다" → BE API + FE 컴포넌트 + DB 마이그레이션이 모두 그 Story 의 Subtask
- **BE-only Story**: "외부 정산 시스템이 우리 주문 데이터를 polling 으로 받을 수 있다" → 사용자 = 외부 시스템. 100% BE 작업이지만 Story 자격 있음
- **FE-only Task**: "shadcn v3 마이그레이션" → user-facing 변화 없으면 Task

BE-only Story 는 사내에서 자주 나오지 않지만, 나올 땐 시스템마다 **"External Integration" / "Batch Services" 같은 가상 Epic** 안에 둠 (Initiative 직속 Story 는 Jira 표준 위반).

---

## 4. 신규 기능 / 변경점 처리

### 4.1 Epic (화면) 에 신규 기능 생기면?

**기존 Epic 안에 새 Story 추가**. Epic = 화면이라 **오래 살아있는 보관함** (화면 폐기까지 안 닫힘).

```
Initiative: 주문관리시스템
  └─ Epic: 주문 조회 화면 (오래 살아있는 보관함)
       ├─ Story: 주문 목록 조회 (2024)
       ├─ Story: 주문 필터 추가 (2025 Q2 신규)
       ├─ Story: 주문 엑셀 다운로드 (2025 Q3 신규)
       └─ Bug: 페이징 502 오류 수정
```

### 4.2 Epic = 화면 재정의의 숨겨진 비용

| 항목 | 표준 Jira Epic | 사내 Epic (= 화면) |
|---|---|---|
| Lifecycle | 완결되면 close | 영구 보관함 |
| Status | In Progress → Done | 항상 In Progress (실질) |
| Burndown / Progress | 의미 있음 | 무의미 |
| Sprint 단위 작업 | Epic 자체 | Epic 아래 Story |

★ 분기별 release / 큰 작업 묶음을 표현할 자리가 별도 필요:
- **Sprint** — 단기 작업 묶음
- **Fix Version / Affects Version** — release 단위
- **Label** — `2025-Q2`, `customer-onboarding` 같은 자유 묶음
- **Component** — "결제 모듈" 같은 횡단 묶음 (화면을 가로지름)

특히 **여러 화면을 건드리는 큰 신규 기능** (예: "신규 약관 동의" → 가입 + 마이페이지 + 결제 동시 수정) 은 Epic 으로 못 묶임 → **Label / Fix Version 으로 여러 화면 걸친 묶음** 표현.

### 4.3 기존 Story 에 변경점 생기면?

Story 상태에 따라 다름:

| 케이스 | Story 상태 | 처리 |
|---|---|---|
| (a) | **Active** (개발 중) | 같은 Story 안에서 진화 — description / AC 수정 |
| (b) | **Done** | **새 Story** + `relates to` link |
| (c) | **Done + 기대 동작 깨짐** | **Bug** + `Defect (created by)` link  ※ 사내 `is caused by` 미설정 — 아래 ⚠ 참조 |
| (d) | **Done + 기존 기능 재설계** | **새 Story** + link, 필요 시 기존 deprecate Task 별도 |

### 4.4 핵심 원칙: Done = 못 바꿈

Done Story 를 reopen 하지 말 것. 이유:

1. **추적성 손실** — "언제 무엇이 추가됐나" 가 Story 단위 audit log 에서 사라짐. release note / 회고에서 변경 시점 못 짚음.
2. **AC 의 의미 흔들림** — Done 의 AC = 그 시점의 spec contract. 사후 추가 시 "이 Story 가 무엇을 통과했나" 의 cut-off 가 사라짐.

Jira 자체는 reopen 허용하므로 양심 의존이 아니라 **workflow 에서 Done → Reopen transition 막거나 reopen 시 코멘트 의무화** 권장.

### 4.5 (b) 케이스 상세 — Done Story 에 기능 확장

**3 원칙**:

**1) 새 Story 의 scope = 변경분만**

기존 Story 의 전체 기능을 다시 쓰는 게 아님. **추가/변경되는 부분만**. AC 도 신규 시나리오만 작성.

```
원본 Story (Done):
  제목: "주문 목록 — 상태별 필터링"
  AC1: 사용자가 [입금대기/완료/취소] 중 선택하면 해당 상태의 주문만 조회된다
  AC2: 필터 해제 시 전체 목록이 복원된다

새 Story (b 케이스):
  제목: "주문 목록 — 기간 범위 필터 추가"   ← 변경분만 제목에
  AC1: 사용자가 시작일/종료일을 선택하면 해당 기간의 주문만 조회된다
  AC2: 상태 필터와 기간 필터를 동시에 적용할 수 있다   ← 기존과의 interaction 만
  (기존 상태 필터 AC 는 재서술 안 함)
```

**2) Link type 선택**

| Link | 언제 쓰나 |
|---|---|
| `relates to` | (b) 의 default — 원본이 이미 Done 이라 작업 순서 의미 없음. 추적성 link 만 필요. |
| `is dependent on` | 원본이 아직 Active 인데 그 위에 쌓는 경우 (b 가 아니라 a 변형) |
| `is cloned by` | 원본을 거의 복사 후 변경 (예: 다른 화면에 동일 기능 이식) |

> ⚠ **사내 Jira link type 실측 (2026-05-27 / `jira_link_types` MCP 호출)**: 글로벌 표준 `is caused by / causes` 는 **사내 미설정**.
> - 결함-원인 관계 → **`Defect`** (inward `created by` / outward `created`) 로 대체. "Bug is created by Story" 형태. ★ `is caused by` 의 사내 정식 대체.
> - `is dependent on` → 사내 명칭 **`Blocks`** (blocks).  `is cloned by` → 사내 **`Cloners`** (clones).  Story 파생 → **`이슈 분할`** (다음으로 분할) 도 후보.
> - 활성 type 목록은 변동 가능 → 실제 적용 전 `jira_link_types` 재확인 의무.

**3) Description 에 link 의도 명시**

Jira link 만으로는 "왜" 가 안 보임. Description 에 한 줄:

```
원본: PRJ-123 (주문 목록 — 상태별 필터링, 2025 Q2 Done)
배경: 고객 VOC 12건 누적 — "특정 기간 주문만 보고 싶다"
변경 의도: 기존 상태 필터 위에 기간 범위 필터 추가 (기존 동작 보존)
```

### 4.6 시각 자산 (다이어그램)

본 §3~§4 표준을 한 판 Excalidraw 다이어그램으로 정리 (동료 설명용).

| 자산 | 경로 | 역할 |
|---|---|---|
| 다이어그램 | `.claude/plans/jira-workflow-diagram.excalidraw` | 렌더링 결과 (excalidraw.com 에서 Open) |
| 생성 스크립트 | `.claude/plans/gen-jira-workflow-diagram.py` | ★ **SSOT** — 문구/색상/좌표 정의. 수정 시 이 스크립트 고치고 `python3` 재실행 (캔버스 직접 편집 ❌ — drift) |

**한 판 구성**: ① 좌측 LR 트리 (Initiative → Epic → Story/Bug/Task → Sub-task) + ② 우측 PM 분기 결정 흐름 (Q1 의도대로? / Q2 사용자 변화? → Bug/Story/Task) + ③ 하단 규칙 4종 + 사내 link type 사실 메모. (이중 렌더링 사상 — 스크립트=진실 / .excalidraw=사람 눈)

---

## 5. VOC 라우팅 (원래 주제 / 다음 단계)

### 5.1 흐름

```
VOC 텍스트 → PM 이 Initiative 52개 중 선택
         → MCP 가 해당 initiative 내 ticket 유사도 검색
         → top-N ticket + assignee 후보 반환
         → PM 이 일감 읽고 라우팅
         → 새 일감 생성 (Story / Task / Bug 분류 + 기존 ticket link)
```

★ 카탈로그 (시스템 메타데이터 별도 SSOT) 구축은 **필요 없음**. 기존 Jira ticket 자체가 살아있는 카탈로그 역할. assignee 필드 = 담당자 정보.

### 5.2 MCP 가 제공할 도구

- `search_tickets(initiative_key, voc_text, limit=5)` → ticket key / summary / assignee / last_updated / 유사도 반환
- **MVP 검색 방식**: Jira JQL text search (별도 인프라 0).
- 한국어 검색 quality 부족하면 → embedding 인덱싱으로 진화 (over-engineering 회피).

### 5.3 짚어둘 분기 — VOC 에 화면 정보 들어 있나?

- **있다** (화면명 / 화면 ID / 스크린샷) → MCP 가 화면 → Epic 직접 결정 → 그 Epic 안 ticket 만 검색 → 정확도 ↑
- **없다** → Initiative 전체 ticket 검색 (MVP 흐름)

★ 사용자 답변 대기 중.

---

## 6. 결단 안 된 carry (다음 세션 시작 시 우선순위 후보)

1. **사내 Jira admin 설정 확인** — 5-level hierarchy 가
   - (a) Premium Plans custom hierarchy / (b) issue link 우회 / (c) 4-level (Story/Task 형제)
   중 어느 쪽인지. Jira admin → Issue types → Hierarchy 페이지 확인.

2. **사내 표준 1 페이지 Confluence template 작성** — §3 표 + 각 type 정의 + 예시 3~5개

3. **Task 사이즈 가이드라인** — "1-3일 / AC 1-3개 / 한 사람 단위" 등 명시 (Task 부풀어 오름 방지)

4. **Link type 사내 컨벤션** — `relates to` / `is caused by` / `blocks` / `duplicates` 의 사용 룰

5. **Done → Reopen workflow 차단** — Jira workflow 자체에서 transition 막거나 reopen 시 코멘트 의무화

6. **신규 화면 = 새 Epic** 의 생성 권한 / 명명 규칙

7. **VOC 화면 정보 포함 여부** 사용자 답변 — 라우팅 MCP 정밀도 결정 (§5.3)

8. **VOC 라우팅 MCP 본격 설계** — `search_tickets` 도구 명세 + 검색 전략 + assignee 후보 산출 알고리즘

---

## 7. 다음 세션 진입 시 권장 순서

1. **carry #1 (Jira admin 설정 확인)** 먼저 — 표준이 (a)/(b)/(c) 중 어느 쪽인지에 따라 §3 표준안이 미세 조정됨
2. → 그 후 **carry #2 (사내 표준 문서화)** 또는 **carry #8 (VOC MCP 설계)** 중 우선순위 결단
3. 두 갈래는 독립이라 어느 쪽 먼저 가도 됨. 사내 표준 먼저 잡으면 MCP 가 라우팅한 일감의 type 분류가 일관됨. MCP 먼저 만들면 일감 생성 속도 ↑ 이지만 type 흔들림 리스크.

---

## 8. 정리 — 한 줄로

> **사내 Jira 표준** = Initiative(시스템) > Epic(화면) > Story(사용자 가치) / Task(내부 작업) / Bug(결함) > Subtask. Done = 못 바꿈. 변경점은 새 Story + link.
> **VOC 라우팅 MCP** = `search_tickets(initiative, voc_text)` 한 도구로 시작. JQL text search MVP. 카탈로그 별도 구축 ❌.
