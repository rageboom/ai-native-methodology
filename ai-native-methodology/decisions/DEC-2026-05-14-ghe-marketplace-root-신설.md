# DEC-2026-05-14-ghe-marketplace-root-신설

> 2026-05-14 / v2.4.1 PATCH — 사내 GHE plugin 배포 채널 정착 + root `.claude-plugin/marketplace.json` 신설 (git-subdir source) + chain harness 5 요소 변경 ❌

## 1. 결단 사실

사내 GitHub Enterprise (`github.smilegate.net/SGH-ISD/ai-native-methodology`) 에 plugin 본격 배포. nested 레포 구조 (`<git-root>/ai-native-methodology/.claude-plugin/`) 와 Claude Code 의 `/plugin marketplace add` 가 git root 의 `.claude-plugin/marketplace.json` 만 인식하는 표준 동작 사이의 path 불일치 → `git-subdir` source 타입 채택.

## 2. 시행 산출 (★ v2.4.1 PATCH)

### 2.1. root `<git-root>/.claude-plugin/marketplace.json` 신설

```json
{
  "name": "ai-native-methodology",
  "owner": { "name": "AIMD", "email": "sangcl@smilegate.com" },
  "plugins": [
    {
      "name": "ai-native-methodology",
      "source": {
        "source": "git-subdir",
        "url": "https://github.smilegate.net/SGH-ISD/ai-native-methodology.git",
        "path": "ai-native-methodology"
      },
      "description": "..."
    }
  ]
}
```

→ 사용자 `/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git#v2.4.1` 1줄 install 가능.

### 2.2. `ai-native-methodology/.claude-plugin/plugin.json` homepage 교체

- `https://github.com/rageboom/ai-native-methodology` → `https://github.smilegate.net/SGH-ISD/ai-native-methodology` (사내 정합).

### 2.3. `ai-native-methodology/.claude-plugin/marketplace.json` 보존

- `source: "./"` 그대로 유지. 시나리오 A (편집자 워크스페이스 직접 등록) + 시나리오 B-2 (dist artifact 폴더 등록) 워크플로 보존.

### 2.4. README.md 시나리오 B 분리

- B-1: 사내 GHE git URL 기반 install (★ Recommended / 사내 표준)
- B-2: dist artifact 폴더 등록 (오프라인 / 특수 환경 fallback)

### 2.5. 3-way version sync v2.4.1

- `plugin.json.version` + `package.json.version` + `CHANGELOG.md` 첫 `## [v2.4.1]` 헤더.
- `npm run version:check` ✅ all 3 sources in sync at v2.4.1.

## 3. 결정적 사실

| 사실 | 자료 |
|---|---|
| 사내 GHE 본격 배포 ✅ | `https://github.smilegate.net/SGH-ISD/ai-native-methodology` private 레포 / main + v1.3.0~v2.4.0 24개 tag push 완료 |
| git root marketplace.json + git-subdir source paradigm 채택 ✅ | nested 레포 구조 → marketplace add 표준 동작 path 정합 |
| 사내 동료 install 경로 본격 = `/plugin marketplace add <ghe-url>.git#v2.4.1` 1줄 | README B-1 신설 |
| chain harness 5 요소 변경 ❌ | chain-driver / 4 gate validator / state.json / 산출물 schema / lifecycle 변경 ❌ — v2.4.0 ⭐ MINOR FINAL release 본질 보존 ✅ |
| 11 PoC 호환 자격 보존 ✅ | plugin 본체 변경 ❌ |
| origin git remote = 사내 GHE 단일 | 공개 GitHub `rageboom/ai-native-methodology` origin 끊김 (사용자 결단) |

## 4. 영향 영역

- ★ 사내 동료 배포 채널 본격 가동 (지금까지 = 로컬 dist 폴더 전달 방식 only / 본 PATCH 후 = git URL 1줄 install 표준)
- ★ chain harness 본체 영역 영향 ❌
- ★ CI / release-readiness criterion 영향 ❌ (8/8 strict 그대로)

## 5. 부속 자산

- ★ README.md 시나리오 B 갱신 (B-1 신설 / B-2 retitle)
- ★ `ai-native-methodology/.claude-plugin/plugin.json` homepage 교체
- ★ `<git-root>/.claude-plugin/marketplace.json` 신설
- ★ CHANGELOG.md v2.4.1 헤더 + 본문 신설
- ★ `decisions/INDEX.md` 갱신
- ★ git tag v2.4.1 신설 + 사내 GHE push

## 6. ★ ★ ★ release-ready ❌ 명시 (★ install path fix purpose only)

본 v2.4.1 PATCH 는 release-readiness §8.1 strict **6/8 pass / 2 regress** 인지 상태로 commit + tag. **사용자 결단** "v2.4.1 = install path fix 한정 / release-ready ❌ 명시 carry" (★ Recommended).

| criterion | 결과 | 원인 |
|---|---|---|
| poc_corroboration / real_tool_evidence / chain_coverage / adr_registry / matrix_greenness / e2e_cycle_pass | ✅ 6/6 | v2.4.0 본질 보존 |
| validators_violation | ❌ | sessions 11~13차 carry — planning-extraction (poc-05) BR-USER-DATA-001 unknown_br |
| analysis_validator_violation | ❌ | session 11차 carry — poc-05 input/rules.json missing (`input/ → output/rules/` 이전) |

★ 본 regress 2건 = sessions 11~14차 v2.4.0 carry update (`no release / no version bump / no tag`) 누적 부담. v2.4.0 ⭐ MINOR FINAL release 시점 8/8 pass. 본 v2.4.1 PATCH 본질 = **사내 GHE install 차단 즉시 해소**. 8/8 strict 회복 = sessions 15차+ Phase D carry 영역.

## 7. carry

| ID | 우선순위 | 영역 | 사실 |
|---|---|---|---|
| C-release-readiness-recovery-v2.5.0 | critical | sessions 15차+ Phase D | PoC #05 input/rules.json 재배치 + planning-extraction (poc-05) BR-USER-DATA-001 정합 + 8/8 strict 회복 (★ release-readiness 9/9 + v2.5.0 MINOR FINAL release 영역 정합) |
| C-ghe-distribution-validation | medium | install UX | 사용자 측 install 본격 재시도 (`/plugin marketplace add ...git#v2.4.1`) 동작 검증 carry |
| C-settings-json-auto-distribution | low | 사내 배포 격상 | `~/.claude/settings.json` `extraKnownMarketplaces` + `autoUpdate: true` 사내 사전 배포 paradigm carry (사용자 결단 시) |
