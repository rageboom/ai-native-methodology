# DEC-2026-05-07-cleanup-round-2-G

| 항목 | 값 |
|---|---|
| 결정자 | 윤주스 (TF Lead) |
| 일자 | 2026-05-07 |
| 상태 | 승인 (★ guides/chain-harness-guide RED→GREEN mermaid 시각화 추가 / no release) |
| 카테고리 | methodology / 자산 정돈 / 시각화 |
| 관련 | DEC-2026-05-06-cleanup-round-2-C-D (guides/ 신설), DEC-2026-05-07-v2.0.0-final |

---

## 컨텍스트

사용자 명시 ("1, 2, 3, 4 순차 실행") round 3. cleanup round 2-C 에서 신설한 `guides/chain-harness-guide.md` 의 §3 (Init→next→done loop) + §8 (Common 시나리오) 가 텍스트 + ASCII 박스로만 설명. 사용자 mental model 시각화 약함.

ADR-008 이중 렌더링 사상 정합 — 텍스트 (사람 읽기) + mermaid (시각).

## 결정

### §3 끝 (line 78 → §3.5 신설)

**stateDiagram-v2** 추가 — chain harness state transition (init → planning → spec → test → implement → done + blocked self-loop).

핵심:
- state name = `state.schema.json` enum 정합 (planning / spec / test / implement / done / blocked)
- 4 gate 매핑 (planning-extraction / chain-coverage / spec-test-link / test-impl-pass)
- blocked 진입 + user fix + next 재시도 cycle 시각화
- mechanical gate trio (state.blocked + cli exit 2 + PreToolUse deny) note

### §8 안 (D 신설 / 기존 A/B/C 다음)

**sequenceDiagram** 추가 — RED→GREEN 전환 (chain 3 RED → chain 4 GREEN / User + chain-driver + gate validator + test runner 4 participant).

핵심:
- chain 3 test runner 호출 → pass=0 / fail=N (RED 입증)
- chain 4 test runner 재실행 (test code 변경 ❌ / impl 추가만) → pass=N / fail=0 (GREEN 100%)
- 5종 물증 + result_hash deterministic 명시
- `--allow-execute` 의무 표시

### 결과

| 영역 | before | after |
|---|---|---|
| `guides/chain-harness-guide.md` | text + ASCII 박스 만 | ★ stateDiagram + sequenceDiagram 2종 추가 |
| 시각화 자산 | 0 | **2** (state transition + RED→GREEN) |
| dist files | 256 | 256 (변경 0 / 라인 수 만 변경) |
| shasum -c | 255 OK | 255 OK |

ADR-008 이중 렌더링 사상 정합 — 텍스트 + mermaid 동시 제공.

## 정합

- state name `state.schema.json` enum 정합
- 4 gate validator name = `flows/sdlc-4stage-flow.json` SSOT 정합
- mermaid syntax = stateDiagram-v2 + sequenceDiagram (Mermaid 11+)

## release / tag

- ★ no release / no tag / 본체 commit 만
- v2.0.0 → v2.0.x patch 자격 영향 ❌

## 결단 묶음

D1 §3.5 stateDiagram-v2 (state transition + blocked self-loop) / D2 §8.D sequenceDiagram (RED→GREEN / 4 participant) / D3 build 256 / shasum 255 OK
