# 동료의 첫 5분 — 사용 시나리오

> 처음 플러그인을 설치한 동료가 5분 동안 무엇을 보게 되는지를, 실제 프롬프트와 응답 흐름으로 따라가는 시나리오입니다.

## 등장인물

- **김개발** — 사내 백엔드 개발자. 오래된 Spring 4.1 + iBATIS 2 시스템을 새로 짓는 TF에 합류함. AI 코딩 도구는 써봤지만 사내 표준 방법론은 처음.
- **Claude Code (플러그인 설치 후)** — AI-Native 방법론 v2.2.0 이 깔린 상태.

---

## 0:00 ~ 0:30 — 설치

김개발이 사내 wiki에서 받은 압축본을 풀고 Claude Code 세션을 엽니다.

```bash
# 김개발의 터미널
$ unzip ai-native-methodology-v2.2.0.zip -d ~/claude-plugins/
$ cd ~/work/efiweb-legacy        # 분석할 레거시 프로젝트
$ claude
```

Claude Code 가 켜지자, 김개발은 두 줄을 입력합니다.

```
> /plugin marketplace add ~/claude-plugins/ai-native-methodology-v2.2.0
✓ Marketplace 'ai-native-methodology' 등록됨

> /plugin install ai-native-methodology@ai-native-methodology
✓ ai-native-methodology v2.2.0 설치 완료
```

## 0:30 ~ 1:00 — 첫 인사

세션을 다시 시작하자, **SessionStart 훅** 이 자동으로 인사합니다.

```
AI-Native 개발 방법론 v2.2.0 ready

  감지된 프로젝트: efiweb-legacy
  추정 스택: Java 8 / Spring 4.1 / iBATIS 2 (Tier 2 Legacy)

  시작하려면 자연어로 말해보세요:
    · "이 코드베이스 분석 시작"      → Phase 0 부터
    · "기획 단계 시작"                → 체인 1 부터
    · "SQL inventory 추출"           → Phase 4.8 (v2.2 신규)

  도움말: /plugin guides/first-prompt-cookbook.md
```

김개발은 처음이라 cookbook 을 한 번 슥 봅니다. 30 초면 충분합니다.

## 1:00 ~ 2:30 — 첫 프롬프트

```
김개발> 이 코드베이스 분석 시작

[phase-0-input 스킬 발동]

Phase 0: 입력 검증 시작합니다.
   ✓ 소스 디렉토리: ~/work/efiweb-legacy
   ✓ Git 저장소 인식됨 (HEAD: 8a2f1c)
   ⚠ ERD 파일 미발견 — 자동 생성 모드로 진행
   ⚠ 운영 DB 메타데이터 미발견 — schema 추출 시 추정 표시

  계속하시겠습니까? [Y/n]

김개발> y

[phase-1-inventory 스킬 자동 연계]

Phase 1: 코드베이스 인벤토리 추출 중...
   · 파일 스캔: 1,247 개
   · Java 클래스: 312 개
   · Mapper XML: 47 개
   · JSP 페이지: 89 개
   · 모듈: 4 개 (api / core / batch / web)

  → analysis/1-inventory/inventory.json 저장됨
  → analysis/1-inventory/tree.md 저장됨
```

김개발은 **자기가 무엇을 시켰는지 정확히 몰라도** 결과가 나오는 것을 봅니다. `phase-1-inventory` 같은 스킬 이름을 외운 적이 없습니다. 그냥 "분석 시작" 이라고만 했습니다.

## 2:30 ~ 4:00 — SQL Inventory 시도

```
김개발> SQL 한 줄 한 줄 정리해줘

[phase-4-8-sql-inventory 스킬 발동 / v2.2 신규]

Phase 4.8: SQL Inventory 추출 시작합니다.
   · 매퍼 XML 47 개 스캔
   · SQL 식별자 추출: 312 개
   · 동적 분기 패턴: 89 개 (if / choose-when / foreach)

  자동 추출 가능한 6개 컬럼:
     ✓ sql_id
     ✓ mapper_xml
     ✓ statement_type
     ✓ dynamic_branch
     ✓ dependent_tables
     ✓ called_from_screen (JSP 역추적)

  사람 검토가 필요한 5개 컬럼:
     · business_meaning
     · uc_link
     · intent_vs_bug_classification
     · confidence
     · carry_flags

  → analysis/4-8-sql-inventory/sql-inventory.json (자동 6/11)
  → 자동화율: 66.7% (5개 PoC 평균과 동일)

  사람 검토 컬럼은 행동 명세 단계에서 같이 채울 수 있습니다.
  계속하려면 "Phase 5 진행" 또는 "기획 단계 시작" 이라고 말씀해주세요.
```

김개발은 **어디까지 자동이고 어디부터 사람인지** 가 매 단계 명시되는 것을 봅니다.

## 4:00 ~ 5:00 — 첫 게이트 만남

```
김개발> 기획 단계 시작

[chain-driver 발동 — 게이트 #1 진입]

게이트 #1: 기획 명세 (Planning Spec)

  분석 단계 산출물에서 자동 추출됨:
    · 비즈니스 의도 12 개 (UC-01 ~ UC-12)
    · 우선순위 분류 MoSCoW
    · 의존 그래프 mermaid 자동 생성

  사람 검토 필요:
    1. UC-07 "환율 동기화"의 비즈니스 의도가 모호 (confidence 0.62)
    2. UC-09 는 다른 시스템과 의존 — 범위 확정 필요

  → analysis/chain-1-planning/planning-spec.json

  통과(go) 또는 중단(stop) 결정해 주세요.
  중단 시 어느 단계로 돌아갈지 함께 알려주시면 됩니다.

김개발> stop, UC-07 부터 다시 봐야겠다
```

5 분 시점에서 김개발은 이미 **첫 번째 게이트** 를 만났습니다. 사람의 결정이 필요한 곳이 명확히 드러났고, 어디로 돌아가야 하는지도 자기가 정할 수 있습니다.

---

## 5분 후의 김개발

| 김개발이 한 일 | 플러그인이 자동으로 한 일 |
|---|---|
| 자연어 4 문장 입력 | 4 개 스킬 자동 연계 |
| 한 번 "y" 입력 | 1,247 개 파일 스캔 |
| 한 번 "stop" 결정 | SQL 312 개 인벤토리화 |
| | 게이트 #1 도달 |

> **5 분에 한 일은 보통 며칠 걸리는 일입니다. 그리고 김개발은 어디까지가 자기 책임인지 헷갈리지 않습니다.**
