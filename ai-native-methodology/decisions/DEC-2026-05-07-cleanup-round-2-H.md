# DEC-2026-05-07-cleanup-round-2-H

| 항목     | 값                                                                                           |
| -------- | -------------------------------------------------------------------------------------------- |
| 결정자   | 윤주스 (TF Lead)                                                                             |
| 일자     | 2026-05-07                                                                                   |
| 상태     | 승인 ( guides self-review + cross-link 정합 / version sync v2.0.0-rc1 → v2.0.0 / no release) |
| 카테고리 | methodology / 자산 정돈 / cross-link 정합 / version sync                                     |
| 관련     | DEC-2026-05-07-v2.0.0-final, DEC-2026-05-07-cleanup-round-2-G (mermaid 추가 직후)            |

---

## 컨텍스트

사용자 명시 ("1, 2, 3, 4 순차 실행") round 4 (마지막). v2.0.0 final tag 후 guides/ 5 자산의 cross-link + version 라벨 정합 검증.

## 결정

### Cross-link 검증 (grep)

| 항목                   | 결과                                    |
| ---------------------- | --------------------------------------- |
| `internal-v` 잔존      | 0 hit ✅ (round 2-E 정합)               |
| `ADOPTION-README` 잔존 | 0 hit ✅ (round 2-A 정합 — 별칭 비활성) |
| `198 unit test` 잔존   | 0 hit ✅ (218 정합)                     |
| `v2.0.0-rc1` 잔존      | **5 hit** ( 갱신 대상)                  |
| `251 files` 잔존       | **1 hit** ( 갱신 대상)                  |
| guides 내부 link       | **20** (모두 valid / link rot 0)        |

### 갱신 자산 (6 위치 / 2 파일)

**`guides/getting-started.md`** (3 위치):

- line 1 헤더: `v2.0.0-rc1 chain harness validated` → **`v2.0.0 chain harness validated 정식 release`**
- line 9 install 예시: `ai-native-methodology-v2.0.0-rc1` → **`ai-native-methodology-v2.0.0`**
- line 20 manager 확인: `v2.0.0-rc1 확인` → **`v2.0.0 확인`**

**`guides/common-errors.md`** (3 위치):

- line 30 Q3: "v2.0.0-rc1 정합" → "v2.0.0 정합 ( v2.0.0 final 2026-05-07~)"
- line 107 Q11: "cleanup round 2 후 v2.0.0-rc1 = **251 files**" → "cleanup round 2 series 종결 후 v2.0.0 = **256 files** ... + guides/ 5 자산"
- line 112 Q12 shasum cd path: `dist/ai-native-methodology-v2.0.0-rc1` → `dist/ai-native-methodology-v2.0.0`

Q3 의 "README v1.4.2 / CLAUDE v1.3.0 / plugin.json v2.0.0-rc1 — 어느 게 맞나?" 헤더 = historical 보존 (사용자가 cleanup 전 build 받은 시나리오 narrative). "본 commit 이후 = v2.0.0 정합" 만 갱신.

### 결과

| 영역                      | before | after                  |
| ------------------------- | ------ | ---------------------- |
| `guides/` v2.0.0-rc1 잔존 | 5 hit  | **0**                  |
| `guides/` 251 files stale | 1 hit  | **0**                  |
| guides cross-link valid   | 20     | 20 ✅                  |
| dist files                | 256    | 256 (변경 0 / line 만) |
| shasum -c                 | 255 OK | 255 OK                 |

### 추가 보강 carry (v2.0.x / v2.1+)

- common-errors Q15+ (v2.0.0 final 진입 관련 FAQ — clean clone 절차 / version bump 시점) → 사용자 finding burst 시점 보강
- guides/ 자산 mermaid 추가 (getting-started 시나리오 분기 flowchart / first-prompt-cookbook category tree) — v2.1+

## release / tag

- no release / no tag / 본체 commit 만
- v2.0.0 → v2.0.x patch 자격 영향 ❌

## cleanup carry 4 (round 2-F + 2-G + 2-H + v2.0.0 final) 종결

본 round = 사용자 명시 "1, 2, 3, 4 순차 실행" 의 마지막. 4 작업 모두 종결:

| Round                      | commit    | 핵심                                                                   |
| -------------------------- | --------- | ---------------------------------------------------------------------- |
| 1 (v2.0.0 final)           | `d94bf03` | v2.0.0 MAJOR FINAL release ( git tag v2.0.0 / clean clone 재실행 통과) |
| 2 (CHANGELOG split)        | `6976b2d` | v1.4.0-dev × 3 entry → HISTORY (1178 → 747 line)                       |
| 3 (mermaid 시각화)         | `83a16b1` | chain-harness-guide stateDiagram + sequenceDiagram                     |
| **4 (guides self-review)** | (현재)    | **v2.0.0-rc1 → v2.0.0 sync + cross-link 정합**                         |

v2.0.0 진입 후 cleanup 작업 완성. 추가 carry = v2.0.x patch 또는 v2.1+.

## 결단 묶음

D1 grep self-review (5 영역) / D2 5 v2.0.0-rc1 → v2.0.0 갱신 + 1 251 → 256 / D3 historical (Q3 header) 보존 분리 / D4 build 256 + shasum 255 / D5 cleanup carry 4 종결 명시
