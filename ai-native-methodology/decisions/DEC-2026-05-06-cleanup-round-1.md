# DEC-2026-05-06-cleanup-round-1

| 항목 | 값 |
|---|---|
| 결정자 | 윤주스 (TF Lead) |
| 일자 | 2026-05-06 |
| 상태 | 승인 (★ ★ docs/ 9 파일 archive 격리 / link rot 11건 차단 / no release / no tag / 본체 commit 만) |
| 카테고리 | methodology / 정리 / 가독성 / SSOT 명확화 |
| 관련 | DEC-2026-05-02-adoption-carry-OFF (docs/adoption frozen archive 명시), DEC-2026-05-02-adoption-폐기-build-step-신설 (templates/adoption 유지 의무 / build script 의존), DEC-2026-05-06-sub-plan-6-종결 (v2.0.0-rc1 직후 cleanup) |

---

## 컨텍스트

2026-05-06 v2.0.0-rc1 prerelease 직후 사용자 명시 요청:

> "여기서 진짜 정리를 한번 하고 싶다. 실제 가비지인지 아닌지 확인해 보고 싶다. 지금 실제 프로젝트 들어가보면 문서 천지다. 이거 다 쓰지는 않을거 아냐."

3 Explore agent 병렬 조사 + Bash 실측 검증:
- 전체 .md = **583** (활성 + 진행 로그 + 폐기 결단 잔존 혼재)
- examples/ = 276 (절반 차지) / decisions/ = 58 / docs/ = 39 (활성 + 폐기 혼재)
- 4 hub (CLAUDE / STATUS / CHANGELOG / INDEX) 에 v2.0 / §8.1 / chain harness 정보 3중 누적

## 처분 카테고리 (★ 사용자 결단 반영)

| 카테고리 | 처분 | 비고 |
|---|---|---|
| **A. PoC 진행 로그 17 파일** (PROGRESS / SESSION-WRAPUP / formal-spec PROGRESS) | **skip** | 사용자 결단 "poc 쪽은 신경 안써도 됨" |
| **B. docs/ 과거 보고서 + 폐기 결단 잔존 9 파일** | **★ archive 이동** | 본 결단 처리 대상 |
| **C. PoC plan-phase 13 파일** | **skip** | 사용자 결단 (A 와 동상) |
| **D. 유지 의무** (decisions/ 58 + archive/v1.1 + templates/adoption + 활성 자산) | 변경 ❌ | "결정 이력 보존" + "build script 의존" |
| **E. 4 hub 중복 정보 통합** | **carry** | 별도 라운드 (cleanup round 2 후보) |

## 사용자 결단 (2026-05-06)

1. plan 1차 (A + B + C 권고) → 사용자 거부 + "poc 쪽은 어차피 신경 안써도 됨. 나머지 들 진행 해줘"
2. plan 2차 (B만 진행 / A·C skip) → ★ ExitPlanMode 승인 (Auto Mode 활성)

## 결정

### B-1. archive 디렉토리 신설 (3종)

```
archive/v1.3-adoption/      ← docs/adoption/ 5 + docs/v1.3-promotion-report.md 1 = 6 파일
archive/v1.4-evaluation/    ← docs/v1.4-evaluation-report.md 1 파일
archive/phase-a-iteration/  ← docs/phase-a-iteration-{guide,0-preflight}.md 2 파일
```

### B-2. git mv 9 파일 (rename / git history 보존)

| Source | Dest |
|---|---|
| `docs/adoption/README.md` | `archive/v1.3-adoption/README.md` |
| `docs/adoption/v1.3-plan.md` | `archive/v1.3-adoption/v1.3-plan.md` |
| `docs/adoption/v1.3-status.md` | `archive/v1.3-adoption/v1.3-status.md` |
| `docs/adoption/v1.3-decisions-index.md` | `archive/v1.3-adoption/v1.3-decisions-index.md` |
| `docs/adoption/lessons-learned-2026-05-02.md` | `archive/v1.3-adoption/lessons-learned-2026-05-02.md` |
| `docs/v1.3-promotion-report.md` | `archive/v1.3-adoption/v1.3-promotion-report.md` |
| `docs/v1.4-evaluation-report.md` | `archive/v1.4-evaluation/v1.4-evaluation-report.md` |
| `docs/phase-a-iteration-guide.md` | `archive/phase-a-iteration/phase-a-iteration-guide.md` |
| `docs/phase-a-iteration-0-preflight.md` | `archive/phase-a-iteration/phase-a-iteration-0-preflight.md` |

### B-3. docs/adoption/ 빈 디렉토리 제거 (rmdir)

### B-4. 활성 hub link rot 차단 (11건 갱신)

| File | 건수 | 처분 |
|---|---|---|
| project root `CLAUDE.md` | 4 | docs/adoption/, docs/v1.3-promotion-report.md, docs/phase-a-iteration-guide.md, docs/adoption/lessons-learned-* → archive/ 경로 갱신 |
| `README.md` | 4 | line 11, 56, 125, 160 (구조 다이어그램 archive/ section 추가) |
| `decisions/STATUS.md` | 2 | line 345, 511 |
| `flows/README.md` | 1 | line 24 (deprecated 섹션) |

### B-5. Historical 보존 (link 갱신 ❌)

| 영역 | 근거 |
|---|---|
| `decisions/DEC-*` 안 옛 경로 참조 | 결단 시점 record / 당시 경로 = 사실 |
| `archive/` 자체 참조 | 같은 archive 안 ref / valid |
| `CHANGELOG.md` v1.4.3 이전 entry 옛 경로 | release 시점 historical timeline |
| `.claude/SESSION-WRAPUP-*` / `.claude/plans/research-*` | 작업 로그 |

## 효과

| 영역 | before | after |
|---|---|---|
| `docs/` 39 | 39 | **30** (-9 archive 이동) |
| `docs/` 가독성 | 활성 + 폐기 혼재 | 활성만 ★ |
| `archive/` 13 | 13 | **22** (+9 격리) |
| 전체 .md | 583 | 583 (이동만 / 삭제 0) |

## 카테고리 E carry (별도 라운드)

agent 2 보고에서 식별된 4 hub 중복 정보 통합 후보:
- v2.0.0-rc1 / chain harness validated / §8.1 strict 7/7 / sub-plan-6 종결 / plugin-first = CLAUDE.md + STATUS.md + CHANGELOG.md + INDEX.md 3~4 hub 중복 (CLAUDE.md 6회 / CHANGELOG.md 28회 / STATUS.md 25회)

처분 옵션 (cleanup round 2):
- (a) STATUS.md 단독 SSOT 화 + 다른 hub 는 STATUS 참조만
- (b) CLAUDE.md 헤더 다이어트 (현재 v2.0 본문 1/3 차지)
- (c) CHANGELOG entry 압축 (v2.0.0-rc1 entry 90+ line)

본 결단 범위 외. v2.0.0 final tag 후 별도 결단 ★ 권고.

## Lessons

1. **plan 1차 거부 + 2차 승인 cadence** — Auto Mode 활성 + 사용자 명시 (A/C skip) 으로 1 turn 안 결단 가능 (cooling-off 폐기 정합).
2. **link rot 차단 의무** — 활성 hub 갱신 / DEC + archive + CHANGELOG entry = historical 보존 분리.
3. **archive 영역 v1.X 별 분류** — `archive/v1.3-adoption/` + `archive/v1.4-evaluation/` + `archive/phase-a-iteration/` = 진화 history 추적성 ★.

## Carry

- E (4 hub 중복 정보 통합) → cleanup round 2 (v2.0.0 final tag 후)
- A + C (PoC 진행 로그 + plan-phase 30 파일) → 사용자 명시 skip / 추후 결단 시 부활 가능
- v2.1+ release entry: archive 영역 v2.X 분류 정책 (현재 = v1.X 만 격리)

## release / tag

- ★ no release / no tag / 본체 commit 만
- v2.0.0-rc1 → v2.0.0 final 자격에 영향 ❌ (release-readiness 7/7 무관 / cleanup 은 paradigm 외부)

## 결단 묶음

D1 카테고리 분류 (A/B/C/D/E) / D2 plan 1차 (사용자 거부) / D3 plan 2차 B만 (★ 승인) / D4 git mv 9 / D5 link rot 11건 갱신 / D6 historical 보존 분리 / D7 cleanup round 2 carry
