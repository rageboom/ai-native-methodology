# DEC-2026-06-13-append-catalog-rulecount-ssot

**상태**: 승인 (v0.42.2 PATCH)
**일자**: 2026-06-13
**관련**: DEC-2026-06-12-resve-multidomain-corroboration (F-1/F-2 / 동일 `append-catalog.js`) · DEC-2026-06-13-resve-4bc-fullchain-corroboration (verified-defect 규율) · DEC-2026-06-12-artifact-zone (2-zone 모)

## 맥락

`ep-be-gea` **biztrip(출장) 도메인** 분석 = artifact-zone 2-zone + append-catalog 의 **2번째 도메인 패밀리 corroboration**(resve 6 BC 에 이어). 정식 6 BC(BEFORE/REQUEST/SETTLEMENT/REPORT/EXECUTIVE/ADMIN-REQUEST, 135 BR) 워크플로우 팬아웃 후 `appendBcFileToIndex` 직렬 머지에서 **`total_rules` 합산 불일치**가 관측됨.

## 발견 (F-3 / F-1·F-2 후속, 동일 헬퍼)

`upsertBcFile` 이 caller(LLM 팬아웃 에이전트)가 준 `rule_count` **정수를 그대로 신뢰**하여 `total_rules` 를 합산한다. 그러나 다중 BC 팬아웃에서 LLM 이 `rule_count` 를 손으로 적다 `rule_ids[]` 와 어긋나는 사례가 **재현 관측**됨:

- `BC-BIZTRIP-REQUEST`  : `rule_count` 21 기재 / `rule_ids` **23개**(완전·무중복·per-BC `business-rules.json` BR 23개와 일치)
- `BC-BIZTRIP-EXECUTIVE`: `rule_count` 16 기재 / `rule_ids` **18개**(동일)

→ `total_rules` 가 **과소집계**(예상 261, 산출 257, 4 누락). `rule_ids` 는 SSOT 로서 정확했고 **`rule_count` 정수만 drift**. 단일-BC(golf/event) 에선 안 드러났던 비대칭이 multi-BC 팬아웃에서 노출(F-1 "writer 비대칭"·F-2 와 동류 — sibling-aware writer 가 caller 입력의 내부 정합까지는 강제 안 함).

`schema`/`validator` 는 정상(검출 책임 아님). 결함 = `append-catalog.js` 가 **자기 불변식**(`rule_count == len(rule_ids)`)을 강제하지 않고 caller 오차를 침묵 전파.

## 결정

`rule_ids[]` = **SSOT**(BC 에 속한 규칙 ID 의 완전 목록), `rule_count` = 그 length 의 **비정규화 캐시**로 계약을 명문화한다. `upsertBcFile` 은:

1. upsert 대상 entry 에 `rule_ids` 가 있으면 **`rule_count := rule_ids.length` 강제**(caller 제공 정수 무시).
2. `total_rules` 합산도 **entry 별 `rule_ids.length` 우선**(없으면 `rule_count` fallback)으로 계산 → stale sibling 까지 self-heal.
3. `rule_ids` **부재** entry(레거시/카운트만 가진 entry)는 `rule_count` 그대로 사용 — **하위호환 유지**(breaking 0).

결정론·no-simulation: "LLM 이 카운트 잘 세줘" 판단이 아니라 SSOT 파생.

## verified-defect 정당화

`DEC-2026-06-13-resve-4bc-fullchain-corroboration` F2("검증된 결함만 fix / 날조 fix 금지 / diagnose-before-design")의 바에 부합한다. 본 fix 는 **재현·실측된 drift**(21 vs 23, 16 vs 18, total 257 vs 261)에 대한 **결정론 불변식 강제 + 회귀 테스트**이며, sub-agent narrative 액면 수용이나 가설적 개선이 아니다.

## 시행 (additive / breaking 0)

- `tools/_shared/append-catalog.js` `upsertBcFile`: rule_ids→rule_count 강제 + total_rules rule_ids 우선 합산.
- `tools/chain-driver/test/append-catalog.test.js`: 회귀 2건 추가(① 틀린 rule_count 가 rule_ids.length 로 교정 + total 정합 ② rule_ids 부재 entry 는 rule_count fallback) + 기존 `appendBcFileToIndex` 테스트를 invariant-일관(틀린 rule_count 99→교정 20)으로 갱신. **12 → 14 통과**.
- v0.42.2 PATCH (plugin.json / CHANGELOG / CLAUDE.md 현재버전 줄 / README sync).

## carry / 비고

- biztrip 분석 **산출물**(12 BC 누적, 261 BR, biztrip-cross-cutting 5 흡수)은 데이터 레포(`ep-be-gea` / `feature/context-ops-test`)에 있고, **본 DEC 는 방법론 본체**(분리).
- 향후: `bc-accumulator-rollup`(별도 라이브 세션 propose)이 동일 SSOT 계약을 공유하면 일관. validate-repair 게이트 자동화는 여전히 carry(F-2).
