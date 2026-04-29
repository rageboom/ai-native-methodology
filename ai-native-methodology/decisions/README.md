# Decision Log

> 본 디렉토리는 **운영/일정 의사결정 기록**이다.
> ADR (`../docs/adr/`) 과 구분: ADR 은 사상/구조 결정 (변경 ↓), 본 로그는 운영 결정 (시간순 누적, 변경 ↑).

---

## 진입점

- **[INDEX.md](INDEX.md)** — 역시간순 단일 진입점. 모든 결정 한 화면.
- 개별 파일: `DEC-YYYY-MM-DD-<slug>.md` 형식.

---

## 검색 방법

```bash
# 전체 결정 검색
grep -r "키워드" ai-native-methodology/decisions/

# 특정 상태만
grep -l "상태: 보류" ai-native-methodology/decisions/

# 카테고리별
grep -l "카테고리: methodology" ai-native-methodology/decisions/

# 시간순 정렬
ls -1 ai-native-methodology/decisions/DEC-*.md | sort -r
```

---

## 결정 등록 시점

다음 5 시점에 결정 1건 = 파일 1개 등록:
1. **PoC 종결/시작** — phase 전환, 산출물 확정
2. **방법론 격상 결정** — v1.x.x → v1.y.y, ADR 신규
3. **분기 결정** — 옵션 A/B/C 중 선택, 보류 포함
4. **사상 변경** — 우선순위, 정책, 톤 변경
5. **명세 빈틈 인지** — finding 미해결 / round-trip 같은 미검증 영역 인지

→ 단순 작업 노트 / 코드 리뷰 / phase 진행은 등록 ❌ (PROGRESS-*.md 또는 plan.md 로).

---

## 표준 형식

```markdown
# DEC-YYYY-MM-DD-<slug>

| 항목 | 값 |
|---|---|
| 결정자 | 윤주스 (TF Lead) |
| 일자 | YYYY-MM-DD |
| 상태 | 승인 / 보류 / 폐기 / 검토중 |
| 카테고리 | methodology / poc / asset / open-question |
| 관련 | ADR-NNN, memory/..., findings/... |

## 컨텍스트
## 결정
## 근거
## 영향
## 다음 액션
```

---

## 상태 정의

| 상태 | 의미 |
|---|---|
| **승인** | 확정. 즉시 적용. |
| **보류** | 조건부 대기 (예: 다른 결정 선행 필요) |
| **검토중** | 옵션 분석 단계. 1주 내 승인/폐기 결단. |
| **폐기** | 검토 후 진행 안 함. 사유 기록 필수. |

---

## 카테고리 정의

| 카테고리 | 의미 | 예 |
|---|---|---|
| **methodology** | 방법론 본체 변경 | v1.2.0 격상, Phase 4.5 신설 |
| **poc** | PoC 진행 | PoC #02 종결, PoC #03 stack 결정 |
| **asset** | 산출물/도구 자산 | Confluence 업로드, 사내 슬래시 커맨드 |
| **open-question** | 미해결 인지 | round-trip 미검증, formal spec 효과 미측정 |

---

## ADR 과의 관계

- 본 로그 결정이 **반복적·근본적** 이면 → ADR 로 격상 (예: Phase 4.5 형식화 결정 → ADR-008)
- ADR 은 본 로그를 **참조** 하여 컨텍스트 제공
- 본 로그는 ADR 의 **운영 사이클** 을 추적
