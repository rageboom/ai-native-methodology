# mis-plugins 마켓플레이스 모노레포 — 작업 컨텍스트

본 레포 = `@mis-plugins/monorepo` — Claude Code 플러그인 **마켓플레이스 모노레포**. `plugins/*` 아래 여러 플러그인을 호스팅하며, 각 플러그인은 독립 semver + Nexus(npm-hosted) 배포를 갖는다. 빌드·카탈로그·검증·배포 툴링은 레포 루트 `scripts/` 가 공유하고, 카탈로그(`.claude-plugin/marketplace.json`)는 `plugins/*` 에서 자동 생성된다(손편집 ❌).

> **이 루트 파일 = 마켓플레이스-레벨 컨텍스트 전용**(정체성·플러그인 목록·빌드/배포·공통 작업 규약). 각 플러그인의 상세 컨텍스트는 그 플러그인의 `plugins/<name>/CLAUDE.md` 에 있다 — 해당 플러그인을 작업할 때 그 파일을 읽는다.

> **식별자 ≠ 개념명**: 마켓플레이스 = `mis-plugins` / npm 네임스페이스 = `@mis-plugins/*` / 플러그인 식별자 = 디렉토리명(`plugins/<name>/`).

---

## 플러그인 목록

| 플러그인 | npm 패키지 | 무엇 | 상세 컨텍스트 |
| -------- | ---------- | ---- | ------------- |
| `context-ops` | `@mis-plugins/context-ops` | flagship — AI-Native 개발 방법론 (SDLC 6단계 chain harness). 모바일 확장팩 = `plugins/context-ops/extensions/mobile-native/`. | [`plugins/context-ops/CLAUDE.md`](plugins/context-ops/CLAUDE.md) |
| `pm` | `@mis-plugins/pm` | PM팀/개발팀 요구사항 정의서(PRD) 작성 + 위키 업로드 + Jira 변환·등록. | [`plugins/pm/CLAUDE.md`](plugins/pm/CLAUDE.md) |
| `ux-plan` | `@mis-plugins/ux-plan` | Smilegate UX/UI팀 Confluence 위키 기획서 작성. | [`plugins/ux-plan/CLAUDE.md`](plugins/ux-plan/CLAUDE.md) |

- **새 플러그인 추가** → [`docs/add-a-plugin.md`](docs/add-a-plugin.md) (`pnpm plugin:new <name>`).
- **마켓플레이스-레벨 결정** → [`docs/decisions/INDEX.md`](docs/decisions/INDEX.md) (정체성 = [`DEC-2026-06-23-marketplace-monorepo-identity`](docs/decisions/DEC-2026-06-23-marketplace-monorepo-identity.md)).

---

## 빌드 · 카탈로그 · 배포 (마켓플레이스-레벨 / `scripts/` 공유)

모든 명령은 플러그인 중립 — `--plugin <name>` / `--all` 인자로 대상을 고른다.

| 작업 | 명령 |
| ---- | ---- |
| 새 플러그인 스캐폴드 | `pnpm plugin:new <name>` |
| 버전 3-way 정합 (plugin.json ↔ CHANGELOG ↔ package.json) | `node scripts/version-check.js --plugin <name>` / `pnpm version:check` |
| 카탈로그 자동 생성 (`plugins/*/marketplace-entry.json` → `marketplace.json`) | `pnpm catalog:build` |
| 빌드 + 카탈로그 drift 0 검증 | `pnpm build:diff-check` |
| 배포 시뮬 | `node scripts/publish.js --plugin <name> --dry-run` |
| Nexus npm-hosted 배포 | `node scripts/publish.js --plugin <name>` |
| 카탈로그 업로드 (신규 플러그인/blurb 변경 시) | `pnpm publish:catalog --user <nexus-id>` |

- `private:false` + `publishConfig.registry` 필수. `source:npm` 설치는 deps 미설치 → runtime 의존은 `bundledDependencies` 동봉(`publish.js` 가 plugin dir 격리 설치로 보장).
- `release:check` / `test:release` 는 플러그인별 디스패처(`pnpm -r --if-present`) — 각 플러그인이 자기 `package.json` 에 정의.

---

## 공통 작업 규약 (어떤 플러그인을 작업하든 동일)

### 티켓 (MIS Jira 카스케이드)

마켓플레이스 인프라/기술부채 작업 = **MIS-365 (Initiative) → MIS-366 ([Tech Debt] mis-plugins, Epic) → OP Task** 하위에 적재. 신규 Initiative/Epic 생성 ❌, 하위 OP Task(`[OP-<DOMAIN>-NNN]`)만 추가. 사용자 가시 기능이 아니면 Story 아닌 **Task(OP-*)**. 필요 시 OP Task 아래 Sub-task 분할.

- Jira 생성/전환 등 외부 작업 직전 **사용자 confirmation gate** 의무.
- `epic_link_customfield_id = customfield_10006` (Task → Epic), Sub-task 는 `parent_key` 로 연결.

### git

- 작업 브랜치명 = **티켓 키 단독**(`MIS-376`). 슬러그/설명 접미사 ❌.
- 브랜치 → 작업 → PR → 머지. 커밋은 사용자가 요청할 때만.
- 커밋 스타일: `release: vX.Y.Z TYPE — 주제` / 한국어 bullet / `Co-Authored-By` 포함.

### 4원칙 (모든 phase 순환)

1. **깊은 숙지 → plan.md** — 관련 파일 전수 조사 후 `.claude/plans/plan{토픽}.md`.
2. **에이전트 팀 토론 → research.md** — 공식문서 / 테크기업 사례 / Senior 병렬. Phase 4~6 가벼운 sub-agent 전략.
3. **사용자 승인 후 코드 착수** — plan + research 완성 후 질문. 일괄 승인 패턴.
4. **실패 시 Revert → 교훈 반영 → 1원칙 재시작** — Lessons Learned plan.md 기록.

> 품질 1순위 + 재작업 최소화 2순위 (속도/quick win 후순위)는 context-ops 의 절대 우선순위이자 본 레포 공통 기조.
