# 동료의 첫 5분 — 사용 시나리오

> 처음 플러그인을 설치한 동료가 5분 동안 무엇을 보게 되는지를, 실제 프롬프트와 응답 흐름으로 따라가는 시나리오입니다.
>
> **갱신 이력**: 2026-05-08 작성 (v2.2.0) → 2026-05-14 갱신 (★ v2.6.0 paradigm 본격 정합 + 의미 ID 본격 자산화 + 사내 GHE install 시나리오 + Layer 2 LLM 시연).

## 등장인물

- **김개발** — 사내 백엔드 개발자. 오래된 Spring 4.1 + iBATIS 2 시스템을 새로 짓는 TF에 합류함. AI 코딩 도구는 써봤지만 사내 표준 방법론은 처음.
- **Claude Code (플러그인 설치 후)** — AI-Native 방법론 v2.5.1 이 깔린 상태.

---

## 0:00 ~ 0:30 — 설치

김개발이 사내 wiki 에 공유된 GHE 주소를 보고 Claude Code 세션을 엽니다 (★ v2.4.1+ Recommended).

```bash
# 김개발의 터미널
$ cd ~/work/efiweb-legacy        # 분석할 레거시 프로젝트
$ claude
```

Claude Code 가 켜지자, 김개발은 두 줄을 입력합니다.

```
> /plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git
✓ Marketplace 'ai-native-methodology' 등록됨 (사내 GHE)

> /plugin install ai-native-methodology@ai-native-methodology
✓ ai-native-methodology v2.5.1 설치 완료
  · Agents: 3 (_base-senior-engineer / _base-industry-case-researcher / _base-official-docs-checker)
  · Skills: 55 (_base 5 + analysis 28 + discovery 6 + spec 3 + plan 3 + test 4 + implement 4 + dep-graph-navigator 1 + ticket-sync 1)
  · MCP Servers: (없음)
```

> ★ 오프라인 환경이라면 압축본을 풀어도 됩니다:
> `/plugin marketplace add ~/Downloads/ai-native-methodology-v2.5.1`

## 0:30 ~ 1:00 — 첫 인사

세션을 다시 시작하자, **SessionStart 훅** 이 자동으로 인사합니다.

```
AI-Native 개발 방법론 v2.5.1 ready

  감지된 프로젝트: efiweb-legacy
  추정 스택: Java 8 / Spring 4.1 / iBATIS 2 (Tier 2 Legacy)

  시작하려면 자연어로 말해보세요:
    · "이 코드베이스 분석 시작"           → `input` phase 부터
    · "발견 단계 시작"                     → 체인 1 (discovery) 부터
    · "SQL inventory 추출"                → `sql-inventory` phase
    · "비즈니스 규칙 의미 일관성 검증"      → ★ v2.5 신규

  ★ v2.5 — Layer 2 LLM (Claude Code sub-agent invocation) paradigm 본격 도입.
  도움말: /plugin guides/first-prompt-cookbook.md
```

김개발은 처음이라 cookbook 을 한 번 슥 봅니다. 30 초면 충분합니다.

## 1:00 ~ 2:30 — 첫 프롬프트

```
김개발> 이 코드베이스 분석 시작

[analysis-input-collection 스킬 발동]

input phase: 입력 검증 시작합니다.
   ✓ 소스 디렉토리: ~/work/efiweb-legacy
   ✓ Git 저장소 인식됨 (HEAD: 8a2f1c)
   ⚠ ERD 파일 미발견 — 자동 생성 모드로 진행
   ⚠ 운영 DB 메타데이터 미발견 — schema 추출 시 추정 표시

  계속하시겠습니까? [Y/n]

김개발> y

[analysis-source-inventory 스킬 자동 연계]

discovery phase: 코드베이스 인벤토리 추출 중...
   · 파일 스캔: 1,247 개
   · Java 클래스: 312 개
   · Mapper XML: 47 개
   · JSP 페이지: 89 개
   · 모듈: 4 개 (api / core / batch / web)

  → analysis/1-inventory/inventory.json 저장됨
  → analysis/1-inventory/tree.md 저장됨
```

김개발은 **자기가 무엇을 시켰는지 정확히 몰라도** 결과가 나오는 것을 봅니다. `analysis-source-inventory` 같은 스킬 이름을 외운 적이 없습니다. 그냥 "분석 시작" 이라고만 했습니다.

> ★ v2.6.0 paradigm: 스킬 디렉토리가 1-depth + category prefix + ★ 의미 ID 본격 구조 (`skills/analysis-source-inventory/SKILL.md` / phase-N 숫자 prefix 본격 폐기). Claude Code plugin 표준 정합 + skills-axis.md §8 본격 자산화.

## 2:30 ~ 3:30 — SQL Inventory 시도

```
김개발> SQL 한 줄 한 줄 정리해줘

[analysis-sql-inventory 스킬 발동 / v2.2 신규 / v2.3 12 컬럼]

sql-inventory phase: SQL Inventory 추출 시작합니다.
   · 매퍼 XML 47 개 스캔
   · SQL 식별자 추출: 312 개
   · 동적 분기 패턴: 89 개 (if / choose-when / foreach)

  자동 추출 가능한 7개 컬럼:
     ✓ sql_id
     ✓ mapper_xml
     ✓ statement_type
     ✓ dynamic_branch
     ✓ dependent_tables
     ✓ called_from_screen (JSP 역추적)
     ✓ migration_priority (★ v2.3 / Gartner TIME P0~P3)

  사람 검토가 필요한 5개 컬럼:
     · business_meaning
     · uc_link
     · intent_vs_bug_classification
     · confidence
     · carry_flags

  → analysis/4-8-sql-inventory/sql-inventory.json (자동 7/12)
  → 자동화율: 58.3% (Spring 4.1+iBATIS 2 spectrum 53~55% 정합 범위)

  사람 검토 컬럼은 행동 명세 단계에서 같이 채울 수 있습니다.
  계속하려면 "api phase 진행" 또는 "기획 단계 시작" 이라고 말씀해주세요.
```

김개발은 **어디까지 자동이고 어디부터 사람인지** 가 매 단계 명시되는 것을 봅니다.

## 3:30 ~ 4:30 — ★ BR 의미 일관성 검증 (v2.5 신규)

```
김개발> 비즈니스 규칙 의미 일관성 검증

[analysis-br-cross-consistency-check 스킬 발동 / v2.5 신규]

BR Cross-Consistency Validator 실행 중...

  Layer 1 (결정적):
    · 두 표현 ≥ 1 의무 검증
    · BR id 4토막 strict
    · structure 검증 (given/when/then 정합)
    → 13/13 BR 통과 ✅

  Layer 2 (★ Claude Code sub-agent invocation / Sonnet 4.6):
    · NL (natural_language) ↔ GWT (given/when/then) 의미 등가성 평가
    · 13 BR 배치 1회 호출
    · semantic_score per BR 계산

    → 12/13 PASS / 1 DRIFT 발견 ⚠
        BR-AUTH-JWT-002 — semantic_score=0.41 / drift_reason: "NL은 'JWT 만료 5분 단위' / GWT는 '15분 단위'"

  → analysis/4-rules/br-cross-consistency-report.json
  → overall semantic_score: 0.901 / threshold 0.7 = PASS
  → ★ semantic_drift_detected (medium) finding 1건 등록

  사용자 결단 옵션:
    (1) BR-AUTH-JWT-002 → DRIFT 격상 (rules.json 변경 ❌ / 후속 검토 carry)
    (2) NL 또는 GWT 수정 후 재실행
```

김개발은 **사람 눈 (NL) ↔ AI 눈 (GWT) 의 의미 격차** 가 자동으로 잡힌다는 것을 봅니다. 이게 v2.5 가 "Adzic SBE 10년 폐기 함정 회피 자격 본격 도달" 한 핵심 본질.

## 4:30 ~ 5:00 — 첫 게이트 만남

```
김개발> (1) DRIFT 격상

[chain-driver 발동 — 게이트 #1 진입]

게이트 #1: 기획 명세 (Planning Spec)

  분석 단계 산출물에서 자동 추출됨:
    · 비즈니스 의도 12 개 (UC-01 ~ UC-12)
    · 우선순위 분류 MoSCoW
    · 의존 그래프 mermaid 자동 생성

  ★ v2.5 paradigm: Layer 2 LLM 의무 통과 요소
    · br-cross-consistency-validator overall=0.901 / threshold 0.7 = PASS ✅
    · semantic_drift 1건 DRIFT 격상 carry 정합 ✅
    · layer2_threshold block 없음 → gate 진입 자격 본격 도달

  사람 검토 필요:
    1. UC-07 "환율 동기화"의 비즈니스 의도가 모호 (confidence 0.62)
    2. UC-09 는 다른 시스템과 의존 — 범위 확정 필요

  → analysis/chain-1-discovery/planning-spec.json

  통과(go) 또는 중단(stop) 결정해 주세요.
```

5 분 시점에서 김개발은 이미 **첫 번째 게이트** 를 만났습니다. 사람의 결정이 필요한 곳이 명확히 드러났고, BR 의미 일관성까지 검증된 상태입니다.

---

## 5분 후의 김개발

| 김개발이 한 일 | 플러그인이 자동으로 한 일 |
|---|---|
| 자연어 5 문장 입력 | 5 개 스킬 자동 연계 |
| 한 번 "y" 입력 | 1,247 개 파일 스캔 |
| 한 번 "(1)" 결정 | SQL 312 개 인벤토리화 |
| | ★ BR 13개 의미 일관성 검증 (Layer 1 결정적 + Layer 2 LLM) |
| | semantic_drift 1건 발견 + DRIFT 격상 |
| | 게이트 #1 도달 (Layer 2 통과 자격) |

> **5 분에 한 일은 보통 며칠 걸리는 일입니다. 그리고 김개발은 어디까지가 자기 책임인지 헷갈리지 않습니다.**
>
> ★ ★ ★ **v2.5 paradigm 본격 입증**: 사람이 못 보던 NL ↔ GWT 의미 격차를 sub-agent 가 자동 발견. industry 표준 도구 (Spec Kit / Cucumber / DMN / Spectral) 가 모두 놓치는 영역.
