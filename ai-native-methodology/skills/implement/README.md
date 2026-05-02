# skills/implement/ — placeholder (☐ 미래 lifecycle 확장)

현재 채움 없음. v2.0+ scope.

## 향후 채움 후보 (v2.0)

- `refactor-by-spec` — legacy 코드 + 7대 산출물 → 신규 시스템 구현 가이드
- `generate-from-rules` — rules.json + openapi.yaml → API 핸들러 scaffold

## 인터페이스 (lifecycle-contract.md)

- input (테스트→구현): test-plan + contract-test 코드 / 산출물 7종
- 산출물 (구현→배포): production code / 빌드 artifact

## 가치 경계 (★★★ 본 방법론 가치 명세)

`legacy 코드 → 7대 산출물 한 방향 추출기 / round-trip 영구 scope 제외` (CLAUDE.md ★★★).

본 방법론 산출물은 신규 시스템 구축 시 **입력 자료**. 산출물 → 코드 자동 생성 같은 round-trip 은 영구 scope 외부. implement skills 는 **사람이 신규 시스템을 만들 때 산출물을 가이드로 활용** 하는 보조 도구일 뿐, 산출물 자체를 검증하는 round-trip 은 아님.
