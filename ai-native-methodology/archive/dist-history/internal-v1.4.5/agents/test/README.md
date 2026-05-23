# agents/test/ — placeholder (☐ 미래 lifecycle 확장)

현재 채움 없음. v2.0+ scope.

## 향후 채움 trigger (v2.0 lifecycle 확장 결단 시)

- **QA-architect** — 테스트 전략 (unit / integration / contract / E2E) 분포 결정
- **test-engineer** — 테스트 코드 작성 / fixture 설계

## 5 영역 매트릭스 — test stage

| 영역 | 강도 | 설명 |
|---|---|---|
| 기획 | ❌ | 적용 안 됨 (테스트 = 기술 영역 / 기획 산출물 직접 검증 ❌) |
| 디자인 | 약 | visual-regression test (visual-manifest.json baseline 입력) / a11y test (axe) |
| FE | 강 | unit / component / E2E test (Jest / Vitest / Playwright / Cypress) |
| BE | 강 | unit / integration / contract test (JUnit / pytest / Mocha / Supertest) |
| DB | 강 | schema migration test / fixture / 데이터 정합 |
| 공통 | 강 | 7대 산출물 cross-link 검증 / coverage 추적 |

## 기술 스택 분기 정책

기술 스택별 차이는 SKILL.md 본문 분기로 표현 (★ analysis stage `phase-1-inventory` 패턴 차용 / v2.0 진입 시 SKILL.md 신설 시점에 적용 / 본 추상화 단계는 정책 선언만). 테스트 stack 후보: Jest / Vitest / Playwright / Cypress / JUnit / pytest / RSpec / Mocha + chai / Supertest / Testcontainers.

## 인터페이스 (lifecycle-contract.md §분석→테스트)

- input (분석→테스트): rules.json + openapi.yaml + schema.json + 7대 산출물
- 산출물 (테스트→구현): test-plan.json + contract-test 코드 + E2E spec
- ★ 사용자 시나리오 6번 (2026-05-02) — "테스트 코드 만드는 부분은 아직 안되어 있지만 추상화만". 본 추상화 단계 = 골격 placeholder 만 / v2.0 진입 시 실 채움 (★ `methodology-spec/lifecycle-contract.md` §가치 경계 충돌 deferral 참조)
