# DEC-2026-05-17-plugin-authoring-docs-drift

- **상태**: 승인 ( 사용자 "공식 best practice 재확인 + 비교 + 개선" / 실 F-015 ×5 / additive / v8.2.0 MINOR)
- **일자**: 2026-05-17 ( session 26차 후속 / v8.2.0 MINOR)
- **결정자**: 윤주스 (TF Lead) — AskUserQuestion ×2: META="digest_sha + check#12 결정적 결합" / Hooks="Rule + digest" / Skills·Plugins="digest enrich + S8 advisory"
- **관련**: ADR-PLUGIN-001 §7 patch v4 + §8 LL-plugin-02 (R18 / 외부 docs drift) / DEC-2026-05-17-plugin-authoring-spec (R18 origin) / DEC-2026-05-17-skill-citation-integrity (직전 §7 patch v2) / DEC-2026-05-17-repo-wide-citation-scan (직전 v8.1.1) / ADR-009 (no-simulation / F-015) / ADR-010 (baseline+ratchet) / `feedback_sub_agent_validation` (F-015 doctrine)

---

## 컨텍스트

사용자 3-part 요청 — ① Anthropic 공식 skills·agents·hooks 작성 best practice 재확인 ② 우리 것과 비교 ③ 개선건. 본 plugin 은 이미 `methodology-spec/plugin-authoring-spec.md` (§2~§5 규칙 + §6 docs pin + §9 staleness 2계층) + release-readiness #12/#13 + `_base-official-docs-checker` F-015 보유 → 요청 = §9 Layer i 재검증의 on-demand 발동.

독립 web-research(Explore agent) 가 drift 가설 다수 제기 (hooks event 30+ / sub-agent name-only required / P2 필드 stale). 본 repo no-simulation + F-015 doctrine = 단일 fetch 단정 ❌ → 실 `_base-official-docs-checker` ×5 교차검증 의무.

## 결정

### §1. 실 F-015 ×5 판정 (no-simulation 물증 / §6 seed = 실 dispatch)

| area              | 판정                    | 사실                                                                                                                                                                                                                                     |
| ----------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| skills            | **VERIFIED-IDENTICAL**  | S1~S7 정합. auto-compaction 재첨부 5000/skill·25000 공유 budget = 공식 "Skill content lifecycle" verbatim 실재                                                                                                                           |
| sub-agents        | **VERIFIED-IDENTICAL**  | A1~A6 정합. Explore "name 만 필수·description optional·body fallback" = **환각** / 공식 = "Only name and description are required" (둘 다 strict)                                                                                        |
| plugins-reference | **VERIFIED-IDENTICAL**  | P1~P4 정합. P2 stale = 거짓전제 (P2 는 필드 열거 안 함). `channels`(stable)·`experimental.{themes,monitors}`(may-change)·userConfig·dependencies = digest 미열거뿐                                                                       |
| hooks             | **VERIFIED-WITH-DELTA** | 거짓 0 / 불완전. event=**29 정확**(Explore "30+" 환각). matcher=**실재·비폐기**(H4 verbatim 정합 — 정밀 재검). docs 가 per-handler `if`·`timeout` 기본값(600/30/60)·JSON `permissionDecisionReason`/`terminalSequence`/`stopReason` 추가 |

Explore pre-research 가설 3건(30+ event·name-only·P2 stale) = 실 F-015 가 **모두 반증**. "research 수렴만으로 단정 ❌, 1차 출처 독립 fetch 의무" (`feedback_sub_agent_validation` 강화 / LL-plugin-02).

### §2. 시행 ( additive only / breaking 0 / 거짓 규칙 0)

- **§2 S8 신설** (권장/low) — auto-compaction 재첨부 대비 (선두 5000 토큰 self-contained·25000 공유 budget). 공식 verbatim.
- **§3 H8 신설** (권장/medium) — per-handler `if`(permission-rule filter·tool 이벤트 한정)·handler type 5종·`timeout` 기본 600/30/60·`once` skills/agents 한정· `matcher`(event-group)≠`if`(per-handler) 별개·공존·비폐기. H1~H7(H4 matcher)·§4·§5 **무변** (VERIFIED-IDENTICAL).
- ** META blind-spot closure** — §6 `digest_sha` 컬럼 신설(`sha256(trim(digest))` 선두 12hex) + release-readiness check #12 = `last_verified` date-math **+ digest_sha 재계산 일치 결정적 assert** (6→7 cell / fail-closed-on-`|` 유지) + §9 Layer i VERIFIED 분기(IDENTICAL=날짜만 / WITH-DELTA=동일 변경서 digest 재발행+§2~§5 재정합) + 불변식("last_verified bump ⟺ 실 F-015 run AND digest_sha 일관"). → "§6 날짜만 fresh / 규칙 본문 stale" 사각을 content-commitment 동반이동으로 결정적 차단 (content-correctness 증명 불가하나 commitment 일관성은 결정적 / precedent check #13 · TUF metadata expires+hash).
- **§6 digest enrich** — skills/hooks/plugins 3행 (sub-agents 무변) + 4행 `last_verified`=`retrieved`=2026-05-17 (실 F-015 재검 근거) + digest_sha 산출.
- **§7** — hooks.json `if`/`timeout` 미사용=optional 정합 1행 + 29-event·matcher F-015 재확인 주석 + 결론 보강.
- **버전 trio** 8.1.1 → 8.2.0 + CLAUDE.md sync (check #10). check 수 = **13 유지** (digest_sha = check #12 내부 강화 / 신 check ❌).

### §3 정직한 범위 (사용자 질문 정합)

- ① 공식 best practice = 실 F-015 ×5 (no-simulation / corpus fallback ❌ checker 계약). ② 비교 = §7 매트릭스 + 본 판정표. ③ 개선 = S8·H8 additive + digest_sha enforcement.
- 잘못된 규칙 0 → corrective ❌, additive enforcement = MINOR (P2′ MAJOR 트리거 deliverable filename·command-surface·schema 계약 = 해당 0 / v8.1.0 skill-citation-validator MINOR 동형).

---

## 회귀 검증

- release-readiness **13/13** (A1 본격 spawn) — check #12 green(4행 ≤60d·**7-cell**·digest `|`-free·**digest_sha 4행 일치**) + check #13 green(신 DEC·ADR-patch 인용 resolve)
- release-readiness.test.js — check12 digest_sha assert 갱신 + **regression-guard case 신설**(실 §6 4행 sha 재계산 dogfood) + 13 id·happy·skip≠pass 무회귀
- skill-citation-validator **0 stale** (dogfood) / version-check 3-way 8.2.0 / workspace test green
- drift-validator 3-way **불변** (skill/agent/flow 무편집 = methodology-spec+scripts+decisions 만 / chain harness §1 비범위 safety property)
- breaking ❌ (S8·H8·digest_sha·check #12 강화 = 전부 additive / 기존 47 skills·9 agents·hooks.json 정합 유지 / ADR-010 grandfather)

---

## Lessons Learned

- **LL-plugin-02** — §6 `last_verified` 가 today 여도 규칙 본문·digest 는 stale 할 수 있다 (날짜 freshness ≠ content 정합). `digest_sha` 결정적 결합 = digest 변경과 commitment 동반이동 강제 (날짜만 갱신·digest 무단편집 동시 차단). content-correctness 는 offline 증명 불가하나 content-commitment 일관성은 결정적 (TUF metadata expires+hash 동형 / check #13 precedent). Explore pre-research 수렴(가설 3건) = 실 F-015 가 모두 반증 → "main-agent research 수렴 = 사실 아님 / 1차 출처 독립 fetch 의무 / 가설 ≠ 결론" (`feedback_sub_agent_validation` 본격 강화). matcher "invented" 1-checker 오판 = §8.1 단일 출처 과적합 → 독립 정밀 재검(matcher/if)으로 H4 보존 = 품질 1순위·재작업 회피 입증.
- **LL-i-55 정합** — 휴리스틱(Explore) 가설 mass-apply ❌ → 실 F-015 ×5 ground truth 대조 후 additive only 정밀 시행. "추정 수정"이 가장 큰 함정 (Explore "30+ event" 그대로 반영했으면 거짓 규칙 주입).

---

## 출처

- 사용자 요청 + 결단 (session 26차 후속 / "공식 best practice 재확인+비교+개선" → AskUserQuestion ×2 / 2026-05-17)
- 실 F-015 ×5 verbatim — `agents/_base-official-docs-checker` dispatch (skills/hooks/sub-agents/plugins-reference + matcher/if 정밀) / canonical `code.claude.com/docs/en/{skills,hooks,sub-agents,plugins-reference}` / 2026-05-17 fetch
- 선례 — ADR-010 baseline+ratchet / ADR-009 no-simulation·F-015 / check #13 skill-citation-validator (결정적 enforcement 동형) / TUF metadata expires+hash
