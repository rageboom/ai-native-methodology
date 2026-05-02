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

## ★ 사용자 결단 carry (★ v1.4.3 follow-up 검증 결과)

다음 2 자산은 ★ 사용자 결단 영역 (★ silent loss 가능성 / 보존 vs 폐기 결단):

### F4 — `adoption/CLAUDE.md` (root / 73 line)

- **내용**: adoption 폴더 자체의 작업 컨텍스트 진입점 (휘발성 진행 상태 참조 + 절대 우선순위 + no-simulation 정책 인라인)
- **현재 처리**: ★ 폐기 분류 (Plan §D2 / "stale")
- **재검증 결과** (★ v1.4.3 follow-up Agent 1): ★ "미묘한 가치" — 사내 적용 초기 작업 가이드 + workspace 외부 컨테이너 CLAUDE.md 와 ★ 다른 layer (작업 메타 vs 본체 진화 컨텍스트)
- **결단 옵션**:
  - (a) 폐기 — 현 plan 유지 / 가치 미미 가정
  - (b) `docs/adoption/ADOPTION-ROOT-CONTEXT.md` 흡수 — 사내 적용 시 작업 진입점 가이드 가치 보존

### F5 — `adoption/legacy-analyzer/.claude/` (4 metadata)

- **내용**: 사용자 (FE Lead) 의 별도 도구 진입점 계획서 — "AI-Native Legacy Analyzer" / harness-engineering-study 의 입구 / 100K+ LOC legacy → 명세·계약·ADR 초안 자동 생성 / 3계층 구조 (skills / commands / agents / output) / Tree-sitter 어댑터 + 점진 실행
- **현재 처리**: ★ 외부 이관 carry / `harness-engineering-study/` 별도 레포 권고 (★ Plan §D2)
- **재검증 결과** (★ v1.4.3 follow-up Agent 1): ★ 별도 도구 계획서 / workspace 와 무관 / 단 ★ 사용자 자체 자산 손실 risk 명시 의무
- **결단 옵션**:
  - (a) 외부 이관 (Plan §D2 유지) — `C:\...\AI\harness-engineering-study\` 별도 레포 init / 사용자 별도 트리거
  - (b) workspace `archive/legacy-analyzer-plans/` 흡수 — 진화 trace 보존 + 외부 이관 trigger 까지 보관소

### 결단 trigger

★ 사용자가 다음 세션 시작 시 (b) 결단 시 워크스페이스 흡수 / (a) 결단 시 외부 이관 + adoption/CLAUDE.md (F4) 폐기 진행. ★ 결단 부재 시 ★ Phase B 진입 자격 평가 시점에 강제 결단 의무.
