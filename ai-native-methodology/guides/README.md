# guides/ — 사용자 journey 자산 (★ ★ cleanup round 2-C 신설)

본 디렉토리 = plugin install 후 사용자가 막히는 지점에 대한 friction-free 가이드. journey 4 자산.

## 자산 (4)

| 파일 | 의도 | 도달 cadence |
|---|---|---|
| [`getting-started.md`](./getting-started.md) | install 직후 첫 100 line / 시나리오 A/B/C 분기 + 10분 walkthrough | install 직후 first read |
| [`chain-harness-guide.md`](./chain-harness-guide.md) | chain-driver mental model + state.json + mechanical gate trio + revisit detector | 시나리오 B 진입 전 |
| [`common-errors.md`](./common-errors.md) | FAQ — install / hook / version mismatch / state.blocked / RED-GREEN / build / prompt 매칭 | 막혔을 때 |
| [`first-prompt-cookbook.md`](./first-prompt-cookbook.md) | 자연어 → skill 매핑 표 (analysis 18 + chain 11 + aspect 4 + release 1) | skill 호출 시점 |

## 호출 cadence (사용자 journey 정합)

```
[install]
  ↓
SessionStart hook 메시지
  ↓
README.md (plugin 진입점)
  ↓
guides/getting-started.md  ★ first read
  ↓
시나리오 A | B | C 분기
  ↓
시나리오 B 진입 시 = guides/chain-harness-guide.md
  ↓
prompt 매칭 안 될 때 = guides/first-prompt-cookbook.md
  ↓
막혔을 때 = guides/common-errors.md
```

## 본 가이드 보강 절차 (사용자 피드백 자산화)

plugin user 가 막힌 finding → 본 plugin 의 GitHub Issue 또는 사내 wiki 에 보고 → v2.0.x 후속 patch / round cleanup 시 본 가이드 보강.

## 참조

- [`../README.md`](../README.md) — plugin 진입점
- [`../CLAUDE.md`](../CLAUDE.md) — 사내 적용 정책 (자동 로드)
- [`../tools/README.md`](../tools/README.md) — 12 도구 cadence table
- [`../methodology-spec/README.md`](../methodology-spec/README.md) — phase × deliverable × schema 매트릭스
- DEC-2026-05-06-cleanup-round-2-C — 본 디렉토리 신설 record
