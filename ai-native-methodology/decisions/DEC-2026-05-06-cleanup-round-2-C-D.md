# DEC-2026-05-06-cleanup-round-2-C-D

| 항목 | 값 |
|---|---|
| 결정자 | 윤주스 (TF Lead) |
| 일자 | 2026-05-06 |
| 상태 | 승인 (★ ★ ★ Round 2-C journey 자산 4 신설 + 2-D project root sync / 256 files / no release) |
| 카테고리 | methodology / 사용자 journey 자산 / project root sync |
| 관련 | DEC-2026-05-06-cleanup-round-2-B-followup (직전), DEC-2026-05-06-sub-plan-5-종결 (chain harness driver), DEC-2026-05-06-sub-plan-6-종결 (v2.0.0-rc1 prerelease) |

---

## 컨텍스트

cleanup round 2-B 후속 직후. 사용자 명시 결단:

> "실행" (= 2-C + 2-D 진행)

Round 2-C = 사용자 journey 자산 신설 (getting-started / chain-harness-guide / common-errors / first-prompt-cookbook).
Round 2-D = project root CLAUDE.md sync (v1.4.3 → v2.0.0-rc1).

## 결정

### Round 2-C — guides/ 디렉토리 신설 (5 파일)

★ ★ workspace 의 `ai-native-methodology/guides/` 신설. plugin install 후 사용자가 막히는 지점에 friction-free 도달.

| 자산 | 의도 | 도달 cadence |
|---|---|---|
| `guides/getting-started.md` | install 직후 첫 100 line / 시나리오 A/B/C 분기 + 10분 walkthrough | install 직후 first read |
| `guides/chain-harness-guide.md` | chain-driver mental model + state.json 깊이 + mechanical gate trio + revisit detector | 시나리오 B 진입 전 |
| `guides/common-errors.md` | FAQ 14건 (install / hook / version mismatch / state.blocked / RED-GREEN / build / prompt 매칭) | 막혔을 때 |
| `guides/first-prompt-cookbook.md` | 자연어 → skill 매핑 표 (analysis 18 + chain 11 + aspect 4 + release 1 = 34 매핑) | skill 호출 시점 |
| `guides/README.md` | 4 자산 navigation + 호출 cadence + 보강 절차 | guides/ 진입 |

★ build-plugin.js INCLUDE 에 `guides` 추가 → dist 자동 포함.

### Round 2-D — project root CLAUDE.md sync

`/Users/sangcl/Documents/Development/Study/ai-native-methodology/CLAUDE.md` (project root / LLM 자동 컨텍스트):

- "★ v1.4.x plugin install 가이드" → "★ v2.0.0-rc1 plugin install 가이드 + 시나리오 A/B/C"
- "★ ★ ★ ★ 현재 v1.4.3 PATCH" → "★ ★ ★ ★ ★ 현재 v2.0.0-rc1 chain harness validated — sub-plan-6 종결 + cleanup round 1/2-A/2-B/2-B 후속/2-C/2-D"
- guides/ 항목 신규 추가 (참고 섹션)

★ project root CLAUDE.md = workspace 본체 / dist 미포함 (개발자 환경 전용). dist 안 CLAUDE.md (templates/adoption alias) 와 별도.

### 본 round 결과

| 영역 | before | after |
|---|---|---|
| dist files | 251 | **256** (+5 / guides/ 5 file) |
| guides/ 디렉토리 | 부재 | **5 file 신설** (getting-started + chain-harness-guide + common-errors + first-prompt-cookbook + README) |
| build-plugin.js INCLUDE | 12 항목 | **13** (+ 'guides') |
| project root CLAUDE.md 라벨 | v1.4.3 PATCH | ★ v2.0.0-rc1 chain harness validated |
| 사용자 journey friction | "install 후 어디서?" 막힘 | ★ guides/getting-started.md first read |

shasum -c CHECKSUMS.txt → **255 / 255 OK**.

## 본 round 이후 cleanup round 2 종결

본 round = cleanup round 2 series (2-A → 2-B → 2-B 후속 → 2-C → 2-D) 의 마지막. 사용자 진짜 의도 ("정돈 + 각 폴더 visible + journey friction 해소") 모두 정합:

| Round | commit | 핵심 |
|---|---|---|
| 1 | `80cb783` | docs/ 9 archive 격리 |
| 2-A | `b25a8ad` | paradigm sync (327 → 241) |
| 2-B | `307f55b` | 10 신설 (★ 사용자 진짜 핵심) |
| 2-B 후속 | `8b7effe` | 9 도구 표준화 + 10 placeholder + schemas/README |
| **2-C/2-D** | (현재) | **journey 자산 4 + project root sync** |

## Carry — v2.1+

본 round 종결 후 carry 후보 (v2.1+ 또는 별도 결단):

- v1.4.0-dev 3 entry CHANGELOG-HISTORY 추가 격리 검토 (CHANGELOG.md 1060 line → ~700 line)
- guides/ 자산 보강 (사용자 finding 등재 후) — common-errors FAQ 추가 / first-prompt-cookbook 매핑 폭 확장
- chain-harness-guide.md 의 RED→GREEN 시각화 mermaid 추가 검토
- v2.0.0 final tag 진입 (clean clone + PoC #05 e2e 재실행 통과 + 24h+ cooling 후 / Senior F4)

## Lessons

1. **journey 자산의 가치** — install 후 사용자가 "어디서 시작?" 막힘 회피. getting-started 의 시나리오 A/B/C 분기 = 사용자 의도별 빠른 도달.
2. **자연어 prompt cookbook 의 효과** — 34 매핑 표가 plugin user 의 skill 호출 friction 해소. README §사용법 표보다 깊이 + 카테고리 분류.
3. **chain harness mental model 의 명시화** — chain-driver / state.json / mechanical gate trio / D21' / revisit detector 5 요소가 어떻게 함께 동작하는지 single-document 설명. 분산 ADR/DEC 보다 user-facing.
4. **cleanup round 2 series 완성** — paradigm sync (2-A) → 신설 (2-B) → 표준화 (2-B 후속) → journey (2-C) → project root sync (2-D) cascading 완료. 각 round commit 로 14차 retract pattern 회피.

## release / tag

- ★ no release / no tag / 본체 commit 만
- v2.0.0-rc1 → v2.0.0 final 자격 영향 ❌
- ★ Round 2-D 의 project root CLAUDE 갱신 = workspace 환경 / dist 미포함 (CLAUDE.md root 와 dist root 의 CLAUDE.md alias 는 별도 entity)

## 결단 묶음

D1 4 journey 자산 신설 + guides/README / D2 build script INCLUDE 'guides' / D3 project root CLAUDE.md v2.0.0-rc1 sync + guides/ 추가 / D4 build 256 files + shasum 255 OK / D5 cleanup round 2 series 완성 명시 / D6 carry (v2.1+)
