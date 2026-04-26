# 📘 공식문서 리서처 — Claude Code 기능 매핑

> 본 문서는 분석 툴 설계에 사용 가능한 Claude Code의 모든 빌딩블록을 정리한다.

## 1. 빌딩블록 4종 비교

| 블록 | 정의 | 호출 방식 | 파일 위치 | 우리 툴 적용 |
|---|---|---|---|---|
| **Skills** | 자동 발견되는 능력 단위. SKILL.md + 스크립트/템플릿 동봉 가능 | Claude가 컨텍스트에 맞춰 **자동 호출** OR `/<name>`으로 수동 호출 | `.claude/skills/<name>/SKILL.md` | **재사용 가능한 분석 함수** (요약기, 그래프 빌더 등) |
| **Slash Commands** | 사용자가 명시적으로 트리거하는 단일 markdown 프롬프트 | `/command` 입력 (수동만) | `.claude/commands/<name>.md` (legacy) → `.claude/skills/<name>/SKILL.md` 권장 | **워크플로우 단계 진입점** (analyze-init, analyze-arch 등) |
| **Subagents** | 별도 컨텍스트로 작업하는 전문가. 도구/모델/권한을 격리 가능 | 메인 Claude가 위임 OR 명시적 호출 | `.claude/agents/<name>.md` | **격리된 분석 전문가** (code-reader, domain-analyst 등) |
| **Hooks** | 도구 이벤트 트리거 자동화 (선택 사항) | 자동 (PreToolUse/PostToolUse 등) | `.claude/settings.json` | **품질 게이트** (출력 lint, 스키마 검증) |

## 2. 핵심 결정 지점

### 2.1 Skills vs Commands
- 공식 문서상 **`.claude/commands/`는 legacy**, 현재 권장은 **`.claude/skills/<name>/SKILL.md`** 형식.
- Skill은 `/name`으로도 호출되고 자동 호출도 됨 = 두 기능 통합.
- **결정**: 우리는 **Skills 우선**. 단, 진입점이 명확히 사용자 트리거여야 하는 7개 워크플로우는 별도 commands로도 노출 (편의성).

### 2.2 Subagents의 진짜 가치 = 컨텍스트 격리
- Subagent를 호출하면 **별도 컨텍스트**에서 실행 → 메인 컨텍스트 오염 방지.
- 100K+ LOC 분석에서 결정적: **파일별 요약을 메인이 직접 하면 안 됨**, 반드시 subagent 위임.
- subagent에 `skills` 필드로 능력을 주입 가능 → 우리 skills를 subagent가 사용.

### 2.3 Plugin 패키징
- 위 4종을 **`.claude-plugin/marketplace.json`** 으로 묶어 배포 가능.
- TF 멤버에게 install script로 배포할 수 있음 → 사내 Plugin 마켓 운영 시드가 됨.

## 3. 제약사항 (반드시 알아야 할 것)

- **`SLASH_COMMAND_TOOL_CHAR_BUDGET`**: 슬래시 명령 description이 컨텍스트 1% / 8000 chars로 캡됨 → description은 짧게.
- **Subagent 권한 상속**: 부모가 `bypassPermissions`/`acceptEdits`면 자식이 덮어쓸 수 없음.
- **Plugin subagent 제약**: hooks/mcpServers/permissionMode 사용 불가.
- **Auto invocation은 description 매칭에 의존**: skill description을 정밀하게 써야 자동 호출됨.

## 4. 적용 매핑 (우리 툴 기준)

```
[사용자] /analyze-full
   │
   ├─ Slash Command (사용자 진입점)
   │     │ orchestrator
   │     ▼
   ├─ Subagent: code-reader (격리 컨텍스트)
   │     └─ uses skill: hierarchical-summarizer
   │     └─ uses skill: repo-inventory
   │
   ├─ Subagent: architect-reviewer
   │     └─ uses skill: dependency-graph-builder
   │
   ├─ Subagent: domain-analyst
   │     └─ uses skill: domain-extractor
   │     └─ uses skill: antipattern-detector
   │
   └─ Subagent: contract-writer
         └─ uses skill: api-contract-extractor
   
[메인 Claude] → 산출물 통합 → harness-template-generator skill 호출
```

## 5. 참고 레퍼런스

- 공식: https://code.claude.com/docs/en/sub-agents
- 공식: https://code.claude.com/docs/en/slash-commands.md
- `revfactory/Harness` (awesome-claude-code 수록): "domain-specific agent teams를 설계하고 specialized agents를 정의하며 그들이 사용할 skills를 생성하는 메타 스킬" — 우리 컨셉과 거의 동일. 직접 참조 가치 있음.
- `wshobson/agents`: 184 specialized agents + 150 skills + 78 plugins로 구성된 프로덕션 레퍼런스. Plugin 구조 참고.
