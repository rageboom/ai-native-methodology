# DEC-2026-05-06-cleanup-round-2-E

| 항목 | 값 |
|---|---|
| 결정자 | 윤주스 (TF Lead) |
| 일자 | 2026-05-06 |
| 상태 | 승인 (★ build artifact path = `internal-v` prefix 제거 / `ai-native-methodology-v` 정합 / no release) |
| 카테고리 | methodology / build artifact / paradigm sync / plugin user 환경 정합 |
| 관련 | DEC-2026-05-06-cleanup-round-2-A (paradigm sync), DEC-2026-05-02-adoption-폐기-build-step-신설 (build script 1차 도입 / `internal-v` prefix 시점) |

---

## 컨텍스트

cleanup round 2-C/2-D 직후 사용자 명시 결단:

> "저 폴더명도 좀 안 맞지 않아? internal-v2.0 이거"

배경:
- v1.4.3 시점 (DEC-2026-05-02-adoption-폐기-build-step-신설) 에 `dist/internal-v<version>/` 패턴 도입
- "internal-" = 사내 표준 명시 의도 (당시 paradigm = 사내 적용 + adoption workspace 분리)
- v2.0 chain harness paradigm = plugin user 환경 (사내 + 외부) 모두 가능 → "internal-" stale
- README 의 plugin user install 예시 = `~/claude-plugins/ai-native-methodology-v<version>/` 안내 → workspace dist path 와 불일치

→ paradigm change cascading drift 의 또 다른 사례 (cleanup round 2-A 의 paradigm sync 후속).

## 결정

`dist/internal-v<version>/` → **`dist/ai-native-methodology-v<version>/`** 변경.

### 갱신 자산 (사용자 facing / 7 위치)

| 파일 | 변경 |
|---|---|
| `scripts/build-plugin.js` line 2 (주석) | `dist/internal-v<version>/` → `dist/ai-native-methodology-v<version>/` |
| `scripts/build-plugin.js` line 123 (코드) | `\`internal-v${version}\`` → `\`ai-native-methodology-v${version}\`` |
| `README.md` line 80 (시나리오 B install 예시) | path 갱신 |
| `README.md` line 171 (디렉토리 구조 다이어그램) | path 갱신 |
| `guides/common-errors.md` line 112 (Q12 shasum 검증) | path 갱신 |
| `templates/adoption/CLAUDE.md` (build script alias source) | provenance + 본문 path 갱신 |
| `templates/README.md` (alias 표) | path 갱신 |
| project root `CLAUDE.md` line 91 | path 갱신 + 본 round entry note |

### Historical 보존 (갱신 ❌)

- `archive/v1.3-adoption/` + `archive/v1.4-evaluation/` 안 internal-v 참조 — historical 자산 (cleanup round 1 격리)
- `decisions/DEC-2026-05-02-adoption-폐기-build-step-신설.md` — v1.4.3 시점 결단 record / 당시 path = `internal-v` 사실
- `decisions/DEC-2026-05-01-v1.4-FE-트랙-진입.md` — v1.4 시점 narrative
- `CHANGELOG.md` line 465 (v1.4.3 entry) + line 1121 (v1.3 entry) — release 시점 historical
- `CHANGELOG-HISTORY.md` line 14 (v1.3.1 D3.2) — historical
- `decisions/STATUS.md` line 509 (v1.5.0 release narrative) — historical
- `templates/adoption/README.md` 본문 v1.3 narrative — historical (cleanup round 2-A 에서 build alias 이미 비활성)

### 본 round 결과

| 영역 | before | after |
|---|---|---|
| build artifact path | `dist/internal-v2.0.0-rc1/` | `dist/ai-native-methodology-v2.0.0-rc1/` |
| plugin user 환경 path 와 정합 | ❌ ("internal-" 어색) | ✅ (README install 예시와 일치) |
| paradigm 정합 | v1.x adoption-workspace stale | v2.0 plugin marketplace 정합 |
| dist file count | 256 | **256** (path rename 만 / 변경 0) |
| sha256 검증 | — | shasum -c **255 OK** |

### 사용자 install 명령 예시 (변경 후)

```bash
# 빌드된 artifact (편집자)
npm run build
# → dist/ai-native-methodology-v2.0.0-rc1/ 생성

# 사용자 install (배포 수신자)
/plugin marketplace add /absolute/path/to/ai-native-methodology-v2.0.0-rc1
/plugin install ai-native-methodology@ai-native-methodology
```

★ workspace dist path 와 plugin user 환경 path 일치 → 사용자 mental model 단순화.

## Lessons

1. **paradigm change cascading drift 추가 사례** — cleanup round 2-A 에서 paradigm sync (CLAUDE/README/marketplace) 후 build artifact path 까지 cascading 누락. 본 round 에서 추가 회수.
2. **사용자 environment path 정합** — README install 예시 (`~/claude-plugins/ai-native-methodology-v<version>/`) 가 dist path 와 일치 = 사용자 실수 회피. workspace ↔ user 환경 path 일관성 의무.
3. **historical vs 활성 자산 분리** — archive / DEC-historical / CHANGELOG entry 의 "internal-v" 참조는 보존 (시점 사실). 활성 entry-point 만 갱신.

## release / tag

- ★ no release / no tag / 본체 commit 만
- v2.0.0-rc1 → v2.0.0 final 자격 영향 ❌

## Carry

- 기존 사용자가 받은 `dist/internal-v<previous>/` artifact 는 그대로 유지 (재배포 시 알림). v2.0.0 final 시점에 모든 dist artifact = `ai-native-methodology-v<version>/` 정합.

## 결단 묶음

D1 사용자 명시 ("internal-v 안 맞지 않아?") / D2 paradigm 정합 검토 / D3 새 path = `ai-native-methodology-v<version>` (plugin user 환경 일치) / D4 7 자산 갱신 + historical 보존 / D5 build 256 files + shasum 255 OK
