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
