# DEC-2026-05-07-cleanup-round-2-F

| 항목 | 값 |
|---|---|
| 결정자 | 윤주스 (TF Lead) |
| 일자 | 2026-05-07 |
| 상태 | 승인 (★ CHANGELOG.md v1.4.0-dev × 3 entry → HISTORY 격리 / 1178 → 747 line / no release) |
| 카테고리 | methodology / 자산 정돈 / CHANGELOG split 확장 |
| 관련 | DEC-2026-05-07-v2.0.0-final (직전 round 1), DEC-2026-05-06-cleanup-round-2-A (CHANGELOG split 1차) |

---

## 컨텍스트

사용자 명시 ("1, 2, 3, 4 순차 실행") 의 round 2. cleanup round 2-A 1차 split (v1.3.x 이전) 후 v1.4.0-dev × 3 entry (v1.4.0 정식 release 이전 dev history) 가 CHANGELOG.md 안 잔존 (line 742~1175 / 434 line).

plugin user 가 받은 CHANGELOG = release tag 만 깔끔. v1.4.0-dev 같은 dev history = HISTORY archive 적합.

## 결정

`CHANGELOG.md` line 742~1175 (v1.4.0-dev × 3 entry / 434 line) → `CHANGELOG-HISTORY.md` 의 v1.3.1 entry 위에 prepend.

### 결과

| 영역 | before | after |
|---|---|---|
| `CHANGELOG.md` | 1178 line / 12 release entry | **747 line** / 9 entry (v2.0.0 + rc1 + v1.5.0 + v1.4.5 + v1.4.4 + v1.4.3 + v1.4.2 + v1.4.1 + v1.4.0) |
| `CHANGELOG-HISTORY.md` | 820 line / 9 entry (v1.3.1 ~ v1.0) | **1254 line** / 12 entry (v1.4.0-dev × 3 + v1.3.1 ~ v1.0) |
| dist files | 256 | 256 (변경 0 / 라인 수 만 변경) |
| shasum -c | — | 255 OK |
| build | ✅ |

CHANGELOG.md footer link 갱신: `## v1.3.x and earlier` → `## v1.4.0-dev + v1.3.x and earlier` (cleanup round 2-F 격리 명시).

## release / tag

- ★ no release / no tag / 본체 commit 만
- v2.0.0 → v2.0.x patch 자격 영향 ❌

## 결단 묶음

D1 split line 742~1175 식별 / D2 sed 추출 + HISTORY prepend / D3 footer link 갱신 / D4 build 256 + shasum 255 OK
