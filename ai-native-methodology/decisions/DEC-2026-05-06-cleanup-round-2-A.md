# DEC-2026-05-06-cleanup-round-2-A

| 항목 | 값 |
|---|---|
| 결정자 | 윤주스 (TF Lead) |
| 일자 | 2026-05-06 |
| 상태 | 승인 (★ ★ ★ plugin user UX 정합 / build artifact 327 → 241 / -86 / no release / no tag) |
| 카테고리 | methodology / plugin artifact 정돈 / UX 정합 / SSOT 명확화 |
| 관련 | DEC-2026-05-06-cleanup-round-1 (docs/ archive 격리 직후), DEC-2026-05-06-sub-plan-6-종결 (v2.0.0-rc1), DEC-2026-05-02-adoption-폐기-build-step-신설 (build script 도입), DEC-2026-05-02-adoption-carry-OFF (adoption frozen archive) |

---

## 컨텍스트

cleanup round 1 직후 사용자가 v2.0.0-rc1 build artifact (327 files) 분석 요청. 결과 발견:

1. **paradigm 변경 미반영** — `marketplace.json` description = v1.x "한 방향 추출기" 문구
2. **사용자 reframe 1차** ("정돈 ≠ 다이어트"):
   > "정돈은 왜하냐면 실제 plugin에 담겨서 실제 정돈되어 잘 사용되기를 바래서 그렇것이다."
3. **사용자 reframe 2차** ("각 폴더 정돈 + 참조 + 호출 visible"):
   > "user ux 관점도 맞지만 실제로 각 폴더가 있고 해당 폴더에 파일들이 잘 정돈 되어 있고 실제 참조 되고 필요에 의해 호출 되고 하는 것들이 잘 보였으면 한다."

3 plan agent 병렬 (UX / SSOT 정합 / 사용자 journey) → **정돈 후보 8 카테고리** 발견 (A 버전 불일치 / B CHANGELOG 비대 / C lifecycle placeholder / D tools noise / E methodology-spec 도달 path / F flows 이중 SSOT / G tools README / H 사용자 journey 마찰점).

본 round (2-A) = ★ ★ ★ Critical 영역 (A + B + D + F + 부수 paradigm sync). round 2-B (각 폴더 README 정돈) + 2-C (사용자 journey 자산 신설) 별도 carry.

## 결정 (★ Round 2-A 만 본 commit)

### 1. plugin artifact paradigm sync (사용자 신뢰도 회복 / A 영역)

| 파일 | 변경 |
|---|---|
| `.claude-plugin/marketplace.json` | description = "한 방향 추출기" → "SDLC 4단계 chain harness ... Analysis stage = 한 방향 추출 ... 위 chain 4 gate + revisit loop + 70~80% 한계 명시" (paradigm + analysis 범위 한정) |
| `templates/adoption/CLAUDE.md` (★ build script 가 dist root CLAUDE.md 로 alias) | v1.3.0 → **v2.0.0-rc1** rewrite — chain harness 4 stage 정합 + 12 도구 + 5 요소 mechanical enforcement + 자연어 prompt → skill 표 |
| `README.md` | v1.4.2 → **v2.0.0-rc1** rewrite — chain harness 4 stage paradigm + dist 실제 디렉토리 구조 + 시나리오 A/B/C + 12 도구 |
| `flows/README.md` | analysis SSOT 단독 → ★ ★ ★ **sdlc-4stage-flow 가 master SSOT** 명시 + chain stage 4종 채워짐 명시 + analysis = chain 1 진입 전 단계 |

### 2. CHANGELOG split (B 영역)

- 기존 `CHANGELOG.md` 1865 line → **1060 line** (v1.4.0 ~ v2.0.0-rc1 8 entry)
- 신규 `CHANGELOG-HISTORY.md` **820 line** (v1.0 ~ v1.3.1 archive)
- footer link 으로 cross-reference

### 3. build-plugin.js 자산 정돈 (D 영역)

- `EXCLUDE_BASENAMES` 추가: `test`, `tests`, `__tests__`, `corpus`, `fixtures`, `coverage` (workspace developer only / plugin user runtime 호출 path 0)
- `INCLUDE` 추가: `CHANGELOG-HISTORY.md`
- ★ ★ ADOPTION-README.md 별칭 복사 비활성 (사용자 결단 (a) — 단일 entry-point 정합)
- `templates/adoption/README.md` source 보존 (build script 만 비활성 / 14차 retract pattern 회피 / 향후 재활성 가능)

### 4. dist artifact 결과

| 영역 | before | after |
|---|---|---|
| dist files | 327 | **241** (-86 / -26%) |
| EXCLUDE 영역 (test/corpus/fixtures) | 80+ | **0** |
| ADOPTION-README.md | 1 | 0 (별칭 비활성) |
| CHANGELOG-HISTORY.md | 0 | 1 (신규) |
| version 정합 (CLAUDE/README/marketplace) | v1.3.0 / v1.4.2 / v1.x stale | ★ all v2.0.0-rc1 |
| paradigm 명시 | "한 방향 추출기" 만 | chain harness 4 stage + analysis 범위 한정 |

shasum -c CHECKSUMS.txt → 240/240 OK (CHECKSUMS 자체 제외 / 정상).

## Carry — Round 2-B / 2-C (별도 round)

본 round 종결 후 별도 round 진입:

### Round 2-B (★ ★ 사용자 진짜 핵심 — 각 폴더 정돈)

- C 영역: lifecycle placeholder 13개 정돈 (chain 4 stage 실 채움 또는 단일 LIFECYCLE-COMPLETION-STATUS.md)
- E 영역: methodology-spec/README.md 신설 (phase × deliverable × schema index)
- G 영역: tools/README.md 신설 (12 도구 cadence table) + tools/{_shared,chain-driver,schema-validator}/README.md 신설 + 9 도구 README 표준 schema 통일 (Purpose / When / In / Out / Exit / Siblings)
- 각 폴더 (agents/skills/hooks/flows/tools/templates/methodology-spec/schemas) README 가 **"이 폴더 자산이 어떻게 정돈 + 어디서 참조 + 언제 호출"** 명시

### Round 2-C (★ 사용자 journey 자산 신설)

- H 영역: getting-started.md (10분 walkthrough) + chain-harness-guide.md (init/next/blocked loop) + common-errors.md (FAQ) + first-prompt-cookbook.md
- CHECKSUMS.txt → .claude-plugin/checksums.txt 이동 (plugin meta-data 영역)

### Round 2-D (선택)

- project root CLAUDE.md 갱신 — v1.4.3 → v2.0.0-rc1 라벨 + 핵심 디렉토리 갱신 (12 schemas → 19+ / 5 tools → 12)
- v1.4.0-dev 3 entry 압축 (개발 history → archived)

## Lessons

1. **사용자 의도 reframe 2회 발생** — "size 다이어트 ❌ → 정돈 ✅ → 각 폴더 정돈 + 참조/호출 visible". cleanup 작업의 의도 명확화는 첫 plan 에서 어렵고, 사용자 explicit feedback 으로 단계별 reframe 가능. AskUserQuestion 의 가치 입증.
2. **3 agent 병렬 (UX / SSOT / journey)** = 단일 perspective 의 blind spot 회피 — Critical 영역 8 카테고리 종합 식별 (단일 agent 시 일부 누락 가능성).
3. **round 분할 정책** = 큰 정돈 plan 을 round 2-A (Critical / 신뢰도 회복) + 2-B (각 폴더) + 2-C (journey) 분할 → 14차 retract pattern 회피 + 사용자 결단 cadence 명확.
4. **paradigm change 의 cascading drift** — v2.0 chain harness 채택 후 marketplace.json / README / CLAUDE.md / flows/README 모두 갱신 필요. CHANGELOG breaking change #4 (harness 호칭) 가 README + plugin.json 만 명시 → marketplace.json 누락 발견. 향후 paradigm change 시 cross-file checklist 필요.

## release / tag

- ★ no release / no tag / 본체 commit 만
- v2.0.0-rc1 → v2.0.0 final 자격 영향 ❌ (release-readiness 7/7 무관 / cleanup = paradigm 외부)

## 결단 묶음

D1 사용자 reframe 1차 ("정돈 ≠ 다이어트") / D2 reframe 2차 ("각 폴더 정돈 visible") / D3 3 agent 병렬 / D4 round 분할 (2-A / 2-B / 2-C) / D5 ADOPTION-README (a) 채택 / D6 build script EXCLUDE / D7 CHANGELOG split / D8 README/CLAUDE rewrite / D9 검증 (327 → 241 / shasum OK) / D10 carry (Round 2-B / 2-C)
