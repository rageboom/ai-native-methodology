# extensions/ — 도메인별 확장 Skills

공통 chain harness(`skills/`)와 달리 `drift-validator` 검사 대상이 아님.
각 도메인 팀이 독립적으로 추가·수정 가능.

## 구조

```
extensions/
  _template/        skill 작성 템플릿 + 등재 요청 양식
  mobile-native/    React Native / iOS / Android 전용
  spring-backend/   Spring Boot / JPA / MyBatis 전용 (미작성)
  react-fe/         React / Next.js FE 전용 (미작성)
  devops/           CI/CD / 인프라 전용 (미작성)
```

## Skill 등재 방법

레포 접근 없이 누구나 skill을 제출할 수 있습니다.

**1단계 — 템플릿 복사**

```
_template/skills/my-skill-name/SKILL.md  ← 이 파일을 복사해서 작성
```

**2단계 — 로컬 테스트**

```bash
# 로컬 ~/.claude/skills/ 에 복사 후 실제 프로젝트에서 동작 확인
cp -r my-skill-name ~/.claude/skills/
```

**3단계 — Slack 제출**

`#mis-plugin-request` 채널에 `_template/SUBMIT.md` 양식 작성 후
`my-skill-name/` 폴더(또는 zip) 첨부 → MIS 검토 후 2영업일 내 등재.

## 공통 skills와의 차이

| | skills/ | extensions/ |
|---|---|---|
| drift-validator | ✅ 강제 | ❌ 비대상 |
| manifest 등록 | ✅ 필수 | ❌ 불필요 |
| 추가 절차 | PR + ADR | Slack 제출만으로 완료 |
| 대상 | 모든 프로젝트 공통 | 특정 도메인/언어 한정 |
| 품질 책임 | MIS | 제출 팀 |
