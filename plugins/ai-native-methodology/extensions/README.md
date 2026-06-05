# extensions/ — 도메인별 확장 Skills

공통 chain harness(`skills/`)와 달리 `drift-validator` 검사 대상이 아님.
각 도메인 팀이 독립적으로 추가·수정 가능.

## 구조

```
extensions/
  mobile-native/   React Native / iOS / Android 전용
  spring-backend/  Spring Boot / JPA / MyBatis 전용 (미작성)
  react-fe/        React / Next.js FE 전용 (미작성)
  devops/          CI/CD / 인프라 전용 (미작성)
```

## 설치

```bash
# extensions는 플러그인 본체에 포함되어 별도 설치 불필요.
# /plugin install ai-native-methodology@mis-plugins 설치 시 함께 포함됨.
```

## 공통 skills와의 차이

| | skills/ | extensions/ |
|---|---|---|
| drift-validator | ✅ 강제 | ❌ 비대상 |
| manifest 등록 | ✅ 필수 | ❌ 불필요 |
| 추가 절차 | PR + ADR | 폴더 추가만으로 완료 |
| 대상 | 모든 프로젝트 공통 | 특정 도메인/언어 한정 |
