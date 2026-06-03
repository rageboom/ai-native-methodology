# DEC-2026-05-23-project-cleanup

> **일자**: 2026-05-23
> **session**: 37차 (현 session) / v8.13.2 PATCH release
> **카테고리**: methodology / 프로젝트 정리 cleanup — 4 axis archive (STATUS + CHANGELOG + CLAUDE + dist)
> **상태**: 승인 ( 사용자 "프로젝트를 정리해 보자" → "추천안 묶음 전체 시행 (4 axis)" 2026-05-23)
> **Cross-link**: v3.6.5 R3 STATUS archive + v3.6.8 A2 INDEX cutoff + v2.4 CHANGELOG precedent + v8.13.1 (carry 잔존 0 / paradigm 안정점 본격 재도달)

---

## 1. 배경

본 session (33차~36차) 6 release 누적 / 5 carry cascade 종결 / **carry 잔존 0 (역사상 최초)** + paradigm 안정점 본격 재도달 후 archive cadence 정착 시행. memory `feedback_status_md_archive_cadence` paradigm + v3.6.x R1~R4 precedent 정합.

## 2. 실측 (4원칙 1단계)

| File/Dir                 | 현 상태                                          | 목표                                                    | precedent                     |
| ------------------------ | ------------------------------------------------ | ------------------------------------------------------- | ----------------------------- |
| **STATUS.md**            | 239 line ⚠️                                      | ~30 line (header + session 32차~36차 보존)              | v3.6.5 R3 (1871 → 80 archive) |
| **CHANGELOG.md**         | 3210 line ⚠️                                     | ~1255 line (v8.x 활성 / v7.0.0~v1.x archive)            | v2.4 precedent                |
| **CLAUDE.md**            | 154 line ⚠️                                      | 본문 release 본문 압축 (33차~35차 1줄 요약 / 36차 활성) | —                             |
| **dist/internal-v1.4.x** | 2 폴더 (v1.4.3 + v1.4.4 / 2026-05-02~03 / stale) | archive/dist-history/ 이동                              | gitignored build artifact     |

## 3. 결단 (사용자 묶음 결단 / D1~D6 6 cluster)

| #   | 결단                                                                                                   | 채택 |
| --- | ------------------------------------------------------------------------------------------------------ | ---- |
| D1  | STATUS.md archive — session 31차 이하 cutoff → STATUS-HISTORY.md append                                | ✅   |
| D2  | CHANGELOG.md 분할 — v7.0.0 이하 cutoff → CHANGELOG-HISTORY.md append                                   | ✅   |
| D3  | CLAUDE.md 본문 압축 — 자세 본문 5종 → 1줄 요약 7종 통일                                                | ✅   |
| D4  | dist/internal-v1.4.3 + v1.4.4 → archive/dist-history/ file system mv (gitignored / commit 자산 변경 0) | ✅   |
| D5  | v8.13.2 PATCH (additive corrective / breaking 0 / cosmetic 4 기준 충족)                                | ✅   |
| D6  | 단일 session 시행 (cooling-off 불요 / cosmetic 4 기준 충족 / plan 명시)                                | ✅   |

## 4. 시행 (4원칙 4단계)

### 4.1 Phase A — STATUS.md archive

- cutoff = line 25 (session 31차 v8.6.x 이하)
- STATUS-HISTORY.md 끝에 `## Archive — session 31차 이하 cutoff (v8.13.2 cleanup / 2026-05-23)` section header + line 25~239 content (215 line) append
- STATUS.md line 1~24 보존 + Archive cross-link section
- 결과: 239 → **30 line** (87% 절감)

### 4.2 Phase B — CHANGELOG.md 분할

- cutoff = line 1252 (v7.0.0 MAJOR 이하)
- CHANGELOG-HISTORY.md 끝에 `## Archive — v7.0.0 이하 cutoff (v8.13.2 cleanup / 2026-05-23)` section header + line 1252~3210 content (1959 line) append
- CHANGELOG.md line 1~1251 보존 + Archive cross-link section
- 결과: 3210 → **1255 line** (61% 절감)

### 4.3 Phase C — CLAUDE.md 본문 압축

- 33차~35차 자세 본문 5종 (v8.9.0~v8.13.0 / 각 ~2KB) → 1줄 요약 7종 (v8.13.2~v8.9.0 / 각 ~1KB) 통일
- 36차 v8.13.1 본문 압축 + v8.13.2 entry 추가 (현재 활성)
- 결과: 154 → 156 line (line 같음 / **byte ~50% 절감 효과** / 자세 본문 → 요약 형식 통일)

### 4.4 Phase D — dist/ archive

- `dist/` = gitignored (`/dist/` in `.gitignore`)
- git mv 불가 → file system mv (git 추적 외부)
- `dist/internal-v1.4.3` + `dist/internal-v1.4.4` → `archive/dist-history/` 신설 + 이동
- 결과: dist/ 안 stale 2 폴더 제거 (file system organize / commit 자산 변경 0)

### 4.5 Phase E — v8.13.2 release ceremony

- `plugin.json` 8.13.1 → 8.13.2 + `package.json` 8.13.1 → 8.13.2 (3-way sync)
- CHANGELOG v8.13.2 PATCH entry
- 본 DEC + INDEX 최상단 + STATUS session 37차 entry
- CLAUDE.md sync (현재 release 본문 갱신)

## 5. STOP-3 hard gate 실측

| Gate                      | 결과                                                            |
| ------------------------- | --------------------------------------------------------------- |
| STATUS.md line            | 239 → **30** (87% 절감) ✅                                      |
| CHANGELOG.md line         | 3210 → **1255** (61% 절감) ✅                                   |
| STATUS-HISTORY.md line    | 1807 → **2030** ✅ (215 archive append)                         |
| CHANGELOG-HISTORY.md line | 2870 → **4837** ✅ (1959 archive append)                        |
| dist/internal-v1.4.x      | 2 폴더 → archive/dist-history/ ✅                               |
| workspace test            | 690/690 pass (보존 / 코드 변경 0) ✅                            |
| release-readiness         | 16/16 ready (보존) ✅                                           |
| dead-link                 | 0 match (보존) ✅                                               |
| version 3-way sync        | plugin.json 8.13.2 / package.json 8.13.2 / CHANGELOG v8.13.2 ✅ |
| 정보 손실                 | 0 (HISTORY append + cross-link 보존) ✅                         |
| breaking                  | 0 = PATCH (additive corrective)                                 |

## 6. Lessons Learned 신규

- **LL-cleanup-01** — paradigm 안정점 후 archive cadence 정착 / 비대화 4 axis 동시 처분 paradigm (STATUS + CHANGELOG + CLAUDE + dist 한 release 안 흡수)
- **LL-cleanup-02** — cutoff 선정 = paradigm 자연 분기 우선 (session 31차 이전 / v7.0 이전 / v3.6.5 R3 정합 / v2.4 precedent 정합)
- **LL-cleanup-03** — HISTORY append paradigm = section header + 시점 명시 + cross-link 보존 (정보 손실 0 / cosmetic 4 기준 정합)

## 7. 차기 session carry

| carry                   | 우선순위 | 비고                                                                                                                                       |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| C-dist-v145-v15-cleanup | low      | dist/internal-v1.4.5 + dist/internal-v1.5.0 archive 후보 / 본 plan 외 / 사용자 결단 의무 (gitignored build artifact / file system cleanup) |

           **carry 잔존 0 paradigm 보존** (v8.13.1 precedent / 본 cleanup = carry 잔존 0 axis 보강만).

본 session (33차~37차) 누적 7 release:

- v8.9.0 (dep-graph release ceremony)
- v8.10.0 (analysis_validator carry / schema 진화)
- v8.11.0 (Senior REVISE-1 carry / forward warn lane)
- v8.12.0 (legacy-risks carry / 5 PoC migration)
- v8.13.0 (xmllint carry / R19 Tier 1 격상)
- v8.13.1 (operation-md carry / dep-graph SSOT 통합)
- v8.13.2 (프로젝트 정리 cleanup / 4 axis archive) ← 본 release

---

**참고**:

- v8.13.1 carry 잔존 0 (역사상 최초) → v8.13.2 cleanup paradigm 안정점 정착
- v3.6.5 R3 STATUS archive precedent (session 14차 이전 cutoff)
- v3.6.8 A2 INDEX cutoff precedent
- v2.4 CHANGELOG-HISTORY.md precedent
- memory `feedback_status_md_archive_cadence` paradigm 정합
