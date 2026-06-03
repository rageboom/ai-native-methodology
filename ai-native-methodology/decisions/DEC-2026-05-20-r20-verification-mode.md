# DEC-2026-05-20 — R20 amendment: verification mode + parent_epic override + Stop hook auto-suggest

## 결정

- **R20 amendment v8.7.2** = ticket-sync skill 에 3축 확장 추가:
  - **B3 `parent_epic` override 파라미터** — 명시 시 standard flow 의 Initiative 자동 생성 skip + 기존 Epic 하위에 직접 매핑. Initiative 생성 권한 부재 환경 / 기존 Epic 재사용 / migration carry 시 사용.
  - **B4 `mode=verification` 메타 모드** — per-stage Story 5개 (analysis/planning/spec/test/implement 각 1) + 산출물·UC·AC·TC 별 Sub-task 구조. plugin 자체 dogfood meta-cycle / verification 작업 전용. `parent_epic` 의무.
  - **B6 chain-driver next 안 auto-suggest stderr** — `tools/chain-driver/src/cli.js` `cmdNext` 가 stage 전이 시 stderr 로 ticket-sync 호출 안내 송출 (자동 invoke ❌ / 사용자 명시 호출 의무 유지 / R20 confirmation gate 본질 보존). Stop hook 직접 등록은 ❌ — Stop event 가 매 응답 turn 종료마다 발화해 noise. 의도된 stage 전이 시점 (chain-driver next 호출 후) 에만 발화하는 게 정합.
- v8.7.2 PATCH 진입 — additive only / breaking 0. standard mode 본문 무변경. mode=verification 분기 신규.
- R16/R17 부활 ❌ 유지. R20 신규 채널 본질 보존.

## 근거

### 1. 실 사용 사례 발견 (mis-fe-admin EAM-AUTH verification cycle iter-6)

사용자가 plugin v8.7.0 의 5-stage chain harness + Jira 자동 연동을 검증하기 위해 EAM 통합권한조회 cycle (Figma + Swagger input) 을 iter-6 으로 진입 시 다음 mismatch 발견:

- **Mismatch 1**: 사용자 Jira 환경에서 Initiative issuetype 생성 권한 부재 → ticket-sync standard flow analysis exit 첫 호출 시 jira_create(Initiative) 실패 예상 → 전체 batch abort.
- **Mismatch 2**: 사용자가 기존 Epic (`DWPD-1442 [2026] AI TF`) 하위에 verification 작업을 매핑하려 함 → ticket-sync standard flow 의 per-UC Story 단위 (planning exit) 와 본 verification 의 per-stage Story 단위 의도 충돌.
- **Mismatch 3 ( H1 결정적 evidence)**: SKILL.md 본문은 "chain stage 종료 동기로 호출" 명시했으나 `hooks/hooks.json` 에 Stop / PostToolUse hook 미등록 → 실 auto-trigger 0건. 사용자가 매 stage 종료 시 manual 호출 의무.

→ standard mode 본문 유지 + verification mode 분기 신설 + Stop hook auto-suggest 통합 = 3축 amendment.

### 2. plugin dogfood 본질

본 plugin = AI-Native methodology dogfooding. plugin 자체를 plugin 의 5-stage chain harness 로 검증하는 meta-cycle 이 필연. 단 plugin 검증 hierarchy 는 실 도메인 feature cycle 의 hierarchy 와 본질적으로 다름:

| 축                   | 실 도메인 feature cycle (standard) | plugin verification meta-cycle (verification)             |
| -------------------- | ---------------------------------- | --------------------------------------------------------- |
| 진입 동기            | 신규 feature 개발                  | plugin 작동 정합성 측정                                   |
| Story 단위           | per UC                             | per stage (5 고정)                                        |
| Sub-task 단위        | per Story 의 4 chain               | per Story 의 산출물·UC·AC·TC                              |
| Initiative 자동 생성 | 의무 (analysis exit)               | skip (parent_epic 재사용)                                 |
| Confluence emit      | optional                           | optional (per-stage 보고서 = v8.7.0+ Tier 2.6 carry 동상) |

→ 두 hierarchy 를 한 mode 로 강행하면 어느 쪽 sacrifice → 분기 신설 정합.

### 3. R15 no-simulation / R20 confirmation gate 본질 보존

verification mode 도 standard 와 동일:

- real MCP 호출 의무 (7-field evidence)
- confirmation gate 의무 (preview MD → yes/no/dry-run)
- Sequential MCP 호출 (parallel ❌)
- search-first idempotency
- silent skip + finding emit (MCP 미연결 환경)

Stop hook auto-suggest 도 confirmation gate bypass ❌ — stderr only 안내 / 실 호출은 항상 사용자 명시.

### 4. v8.7.2 PATCH vs MINOR 결단

semver:

- 신규 파라미터 2개 (parent_epic / mode) + 신규 mode 분기 (verification) + hooks.json Stop matcher 추가 = backward compatible 기능 추가
- 엄격히는 MINOR (v8.8.0) 자격

본 release 선택 = PATCH (v8.7.2):

- 사유: standard mode 본문 무변경 / 모든 신규 = opt-in (명시 호출 시에만 작동) / breaking 0 / cycle 4 직후 PATCH 흐름 일관
- v8.6.1 R20 신설도 동일 결단 (charter 신설 = MINOR 자격 / PATCH 처분 결단 영역) — sibling 처분

## Tier (R20 의 sub-axis 확장)

| sub-axis             | 기존 (DEC-2026-05-18-r20)                                                                  | v8.7.2 amendment                                                             |
| -------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Tier 1               | 정책 + traceability-matrix.schema optional ticket_ref                                      | 무변경                                                                       |
| Tier 2.5             | MCP delegation / ticket-sync skill / 5 stage matrix / confirmation gate / 7-field evidence | + `parent_epic` override + `mode=verification` 분기 + Stop hook auto-suggest |
| Tier 3 (v9.0+ carry) | 자체 platform adapter                                                                      | 무변경                                                                       |

## 신설 자산

| 경로                                                | 종류 | 비고   |
| --------------------------------------------------- | ---- | ------ |
| `decisions/DEC-2026-05-20-r20-verification-mode.md` | NEW  | 본 DEC |

## 수정 자산

| 경로                                                      | 변경                                                                                                                                                                                                                                            |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `skills/ticket-sync/SKILL.md`                             | §파라미터 표 `parent_epic` + `mode` 추가 / §단계 5 헤더 mode 분기 안내 / §단계 5b 신설 (mode=verification 의 5 phase 본문) / §금지·강제력 F-TICKETSYNC-003 + 004 추가 / §사용자 결단 5건 → 6건 / §Cross-link DEC-2026-05-20 + Stop matcher 명시 |
| `tools/chain-driver/src/cli.js`                           | `cmdNext` 의 stage 전이 직후 (line ~286) ticket-sync auto-suggest stderr 출력 (~10 LOC additive). hooks.json Stop hook 직접 등록 ❌ (noise 회피 / 의도된 stage 전이 시점에만 발화).                                                             |
| `CHANGELOG.md`                                            | v8.7.2 PATCH entry                                                                                                                                                                                                                              |
| `.claude-plugin/plugin.json`                              | version bump 8.7.1 → 8.7.2                                                                                                                                                                                                                      |
| `package.json`                                            | version bump 8.7.1 → 8.7.2                                                                                                                                                                                                                      |
| `decisions/DEC-2026-05-18-r20-mcp-ticket-sync-channel.md` | 본 DEC cross-link 추가 (forward link)                                                                                                                                                                                                           |

## 정합 관계

- **선행**: DEC-2026-05-18-r20-mcp-ticket-sync-channel.md (R20 원본)
- **부모**: R20 charter entry / methodology-spec/plugin-charter.md §1+§2
- **반대 polarity**: R16/R17 strikethrough 유지 — verification mode ≠ 자체 platform adapter (Tier 3 carry 유지)
- **sibling**: DEC-2026-05-18-ticket-binding-policy.md (Tier 1 정책)
- **driving cycle**: mis-fe-admin EAM-AUTH iter-6 verification cycle Stage 0 dry-run findings (F-VERIFY-001 ~ F-VERIFY-004)

## 검증 기준 (v8.7.2 release 시)

- [ ] ticket-sync SKILL.md 의 standard mode 본문 무변경 (diff 확인)
- [ ] mode=verification + parent_epic 미명시 시 reject (F-TICKETSYNC-003 emit) — schema-validator 또는 skill 안 가드
- [ ] mode=standard + parent_epic 명시 시 hybrid path (F-TICKETSYNC-004 info finding) — deny ❌
- [ ] Stop hook 의 ticket-sync auto-suggest 가 stderr only (stdout 무영향)
- [ ] confirmation gate 본질 보존 — auto-trigger 0건 / 실 MCP 호출은 사용자 명시 호출
- [ ] release:check / test:tools 통과
- [ ] verification meta-cycle (mis-fe-admin EAM-AUTH iter-6) 의 ticket-sync 호출이 standard flow 와 충돌 없이 진행

## 후속 carry

- per-stage Confluence 보고서 page = v8.7.0+ Tier 2.6 carry (변경 없음)
- 자체 platform adapter (Jira REST 직접) = v9.0+ MAJOR carry (변경 없음)
- ticket-sync evidence schema 에 verification_mode field 추가 = v8.7.3+ 후속 (본 release 는 ticket_ref 안 verification_mode boolean 만 추가)
