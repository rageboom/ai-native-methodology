# skills/planning/ — placeholder (☐ 미래 lifecycle 확장)

현재 채움 없음. 본 v1.4.x 가치 명세 = analysis stage only. 기획 stage 는 v2.0+ scope.

## 향후 채움 후보 (v2.0)

- `extract-prd` — 이해관계자 인터뷰 노트 / 도메인 문서 → PRD 추출
- `decompose-story` — Epic → Story 분해
- `domain-priority` — 도메인 영역별 분석 우선순위 결정 (analysis stage 진입 input)

## 5 영역 매트릭스 — planning stage

| 영역   | 강도 | 설명                                          |
| ------ | ---- | --------------------------------------------- |
| 기획   | 강   | stage 의 핵심 — PRD / story / domain-priority |
| 디자인 | 강   | wireframe 1차 그림 / 정보 구조 / 사용자 여정  |
| FE     | 약   | 화면 단위 우선순위 / FE 영역 분량 추정        |
| BE     | 약   | 도메인 영역별 BE API 우선순위                 |
| DB     | 약   | 도메인 entity 1차 식별                        |
| 공통   | 약   | 비즈니스 우선순위 / 이해관계자 align          |

## 기술 스택 분기 정책

기술 스택별 차이는 SKILL.md 본문 분기로 표현 ( analysis stage `phase-1-inventory` 패턴 차용 / v2.0 진입 시 SKILL.md 신설 시점에 적용 / 본 추상화 단계는 정책 선언만).

## 인터페이스 (lifecycle-contract.md §기획→분석)

- 산출물 (기획→분석): PRD / story / domain-priority.json
- 기획 stage = legacy 코드 부재 영역 / 사용자 별도 입력 (`methodology-spec/lifecycle-contract.md` §기획→분석 참조)
