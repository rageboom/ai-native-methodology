# docs/adoption/ — 사내 적용 작업 archive

★ 본 디렉토리 = 2026-05-02 이전 별도 워크스페이스 (`ai-native-methodology-adoption/`) 에서 진행되던 사내 적용 작업 메타의 archive 보관소.

## 폐기 배경

- **2026-05-02 14차 결단** (DEC-2026-05-02-plugin-first): "본체 = plugin source / adoption/dist = artifact"
- **2026-05-02 본 plan** (★ 1일 후 retract): adoption 분리 워크스페이스 폐기 / workspace 단일 + build script 1차 도입 (★ v1.4.3)
- 사유: adoption/dist artifact 발상이 ★ 단일 source-of-truth 위배 / frontmatter provenance + build script 만으로 동등 효과
- 상세: [`lessons-learned-2026-05-02.md`](./lessons-learned-2026-05-02.md)

## 흡수 자산

| 파일 | 원본 | 라인 |
|---|---|---|
| `v1.3-plan.md` | `adoption/work/plan.md` | 340 |
| `v1.3-status.md` | `adoption/work/STATUS.md` | 58 |
| `v1.3-decisions-index.md` | `adoption/work/decisions/INDEX.md` | 42 |

## 관련 자산

- `templates/adoption/CLAUDE.md` (★ 사내 적용 진입점 — 정책 23 inline / build script 가 dist 로 복사)
- `templates/adoption/README.md` (★ 사내 진입점 README)
- `archive/methodology-v1.1/` (★ v1.0 → v1.1.2 진화 metadata)
- `decisions/DEC-2026-05-02-adoption-폐기-build-step-신설.md`

## status

★ ★ frozen snapshot — 본 디렉토리 자산은 사내 적용 v1.3 작업 history 보존 목적 / 활성 작업 ❌. 신규 사내 적용 작업은 workspace 본체에서 직접 진행.

## ★ adoption 폴더 폐기 carry (2026-05-02 본 plan 시점)

본 plan 의 Phase 2.6 (`ai-native-methodology-adoption/` → `.deprecated-2026-05-02/` rename) 는 ★ ★ 외부 프로세스 (탐색기 / 편집기 / 다른 Claude 세션) lock 으로 ★ 자동 실행 실패. 사용자가 lock 해제 후 직접 rename 또는 삭제 (★ Senior 보강 — 자동 삭제 ❌ / 사용자 수동 검토 의무 정합).

★ rename 명령:
```powershell
Rename-Item -Path "C:\Users\RAGEBOOM\Documents\Developments\AI\ai-native-methodology-adoption" -NewName "ai-native-methodology-adoption.deprecated-2026-05-02"
```

★ 30일 cooldown 후 사용자 수동 검토 + 삭제 결정.

## ★ ★ 사용자 결단 carry — OFF 결단 (2026-05-02 / DEC-2026-05-02-adoption-carry-OFF)

★ ★ ★ 사용자 명시 결단 (2026-05-02): "이제 adoption 은 신경 안써도 됨 이 프로젝트만 신경 쓸거야"

→ ★ adoption 영역 carry 전체 OFF / workspace 본체 (`ai-native-methodology/`) 단일 focus.

### 처리 요약

| 항목 | 이전 (v1.4.3 follow-up) | 본 결단 후 |
|---|---|---|
| F4 — `adoption/CLAUDE.md` 폐기 vs 흡수 | carry / 강제 결단 의무 | ★ **OFF** (본 프로젝트 backlog 제거) |
| F5 — `adoption/legacy-analyzer/.claude/` 외부 이관 vs 흡수 | carry / 강제 결단 의무 | ★ **OFF** (본 프로젝트 backlog 제거) |
| `ai-native-methodology-adoption/` rename | carry / 사용자 lock 해제 후 직접 | ★ **사용자 자체 영역** (본 프로젝트 작업 ❌) |
| `harness-engineering-study/` 외부 레포 init | F5 (a) 결단 시 trigger | ★ **OFF** (외부 작업 / 본 프로젝트 무관) |

### 유지되는 것 (★ 폐기 ❌)

- `templates/adoption/{CLAUDE,README}.md` — ★ build script 가 dist root 의 `CLAUDE.md` + `ADOPTION-README.md` 로 별칭 복사 / 폐기 시 plugin install 회귀
- `archive/methodology-v1.1/` — v1.0~v1.1.2 진화 metadata
- `docs/adoption/{v1.3-plan,v1.3-status,v1.3-decisions-index,lessons-learned-2026-05-02,README}.md` — frozen archive

### 재진입 조건

★ 사용자 명시 retract 결단 시에만 재진입. 본 결단 = ★ ★ 24h cooling-off 면제 (자산 변경 0 / 방향 선언 / plan.md 비용 작음). 상세: [`../../decisions/DEC-2026-05-02-adoption-carry-OFF.md`](../../decisions/DEC-2026-05-02-adoption-carry-OFF.md).
