# Skill 등재 요청 양식

Slack `#mis-plugin-request` 채널에 아래 양식을 복사해서 작성 후,
skill 폴더(zip 또는 파일)를 첨부해주세요.

---

**[Skill 등재 요청]**

- **팀/담당자**: (예: C#팀 / 홍길동)
- **Extension 이름**: (예: `csharp`, `ios-native`, `spring-batch`)
- **Skill 이름**: (예: `analysis-csharp-di-pattern`)
- **발동 단계**: (analysis / discovery / spec / plan / test / implement 중 택1)
- **발동 조건**: (어떤 프로젝트에서 발동해야 하는지)
- **비발동 조건**: (발동하면 안 되는 프로젝트 유형)
- **간단한 배경**: (왜 이 skill이 필요했는지 1~2줄)

**첨부**: `my-skill-name/SKILL.md` 파일

---

## 체크리스트 (제출 전 확인)

- [ ] `SKILL.md` frontmatter의 `name`, `description`, `allowed-tools` 작성 완료
- [ ] `description`에 발동 조건 + 비발동 조건 명시
- [ ] `## 언제 사용` 섹션 작성
- [ ] `## 절차` 섹션 작성 (1단계씩 구체적으로)
- [ ] `## 주의` 섹션에 발동하면 안 되는 케이스 명시
- [ ] 로컬 `~/.claude/skills/`에서 직접 사용해보고 동작 확인
