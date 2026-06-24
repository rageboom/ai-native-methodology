# mis-backend-spring

> MIS 백엔드(TLM/EAM/GEA Java · OBSERVER Kotlin) 코드리뷰·테스트·품질 표준 플러그인. `mis-plugins` 마켓플레이스 모노레포의 한 플러그인.

OO/DDD 설계 리뷰, 쿼리 안티패턴 탐지, core 추출·의존성 업그레이드 분석, 테스트 골격 생성, 테스트 전략 라우팅(TDD/특성화/인수), 커밋 전 품질 게이트를 제공한다.

## 설치

```
/plugin marketplace add SGH-ISD/ai-native-methodology
/plugin install mis-backend-spring@mis-plugins
```

## 구성

- `agents/` — 백엔드 분석 sub-agent 4종
  - `core-extraction-analyst` — 4개 레포 횡단 중복·공통 코드 추출 후보 탐지 (read-only)
  - `dependency-upgrade-analyst` — 의존성·프레임워크 버전 staleness / breaking change / CVE 조사
  - `oo-design-reviewer` — SOLID/GRASP/GoF/DDD/Connascence 설계 품질 리뷰 (read-only)
  - `query-antipattern-reviewer` — JPA/MyBatis/QueryDSL 쿼리 안티패턴 + `@Transactional` 오용 탐지 (read-only)
- `commands/` — slash command 2종
  - `/backend-debt-scan [tlm|eam|gea|observer|all]` — 기술부채 횡단 스캔 (agent 병렬 fan-out → P0~P3 종합)
  - `/gen-tests [repo] [package or class]` — 테스트 없는 클래스 탐지 → 골격 생성
- `skills/` — skill 4종
  - `backend-oo-ddd` — 객체지향/디자인 패턴/DDD 설계 원칙
  - `backend-test-workflow` — src/main 변경 시 테스트 전략 라우팅 (신규=TDD / 레거시=특성화 / 완료=인수)
  - `backend-testing` — given-when-then 테스트 컨벤션·계층 전략·커버리지 목표
  - `test-scaffold` — 단위(Mockito/MockK)·슬라이스(@WebMvcTest/@MybatisTest)·인수(RestAssured+Testcontainers) 골격 템플릿
- `hooks/` — `PreToolUse` 1종: `git commit` 직전 spotless/ktlint + compile 품질 게이트

## 출처

`SGH-ISD/mis-backend-common` 레포의 `plugins/mis-backend` (DWP팀 작성, upstream v1.1.0) 자산을 마켓플레이스로 도입했다. 식별자는 `mis-backend-spring`, 버전은 마켓플레이스 신규 컨벤션(0.x)에 맞춰 `0.1.0` 으로 리셋했다.

빌드·배포는 레포 루트 공유 툴링(`scripts/`)이 담당한다 — `docs/add-a-plugin.md` 참조.
