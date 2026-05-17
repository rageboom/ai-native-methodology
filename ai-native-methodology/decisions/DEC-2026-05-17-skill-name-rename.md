# DEC-2026-05-17-skill-name-rename

- **상태**: 승인 (★ ★ ★ 사용자 "1 바꾸자" / Senior critique GO+REVISE conf 0.88 / STOP-3 hard gate / v8.0.0 MAJOR)
- **일자**: 2026-05-17 (★ session 26차 후속 / v8.0.0 MAJOR / ADR-PLUGIN-001 §8-1 deferred 본격 시행)
- **결정자**: 윤주스 (TF Lead) — "1 바꾸자" + 새 name 확정 "spec-integrate-deliverables (Senior 추천)"
- **관련**: ADR-PLUGIN-001 §2.5 (deferred origin) + §7 patch v1 / DEC-2026-05-17-plugin-authoring-spec §8-1 (carry origin / audit-time 기록 보존) / DEC-2026-05-17-q7-rules-json-rename (v7.0.0 rename 선례 / STOP-3 paradigm) / `methodology-spec/plugin-authoring-spec.md` §7·§8 (resolved 갱신)

---

## 컨텍스트

v7.1.0 plugin-authoring-spec 감사가 S3 위반 1건 ❌ high 식별 — skill `spec-integrate-7대-deliverables` 의 "7대"(한글)가 공식 charset `[a-z0-9-]` 위반. 당시 결단 = §8-1 backlog 이연 (command-surface rename = MAJOR / 별도 user-gated session). 사용자가 "바꿀게 뭐가 있나" 표 요청 후 **"1 바꾸자"** 결단 → §8-1 본격 시행.

## 결정

### §1. 사용자 결단 + Senior critique (GO+REVISE conf 0.88)

| # | 결단 | 채택 |
|---|---|---|
| 새 name | **`spec-integrate-deliverables`** | "7" = stale noise (실제 ~17 산출물 통합 / "7대"는 틀린 수) / `spec-` prefix 이미 stage 표시 / skills-axis 의미-ID 컨벤션 + v2.6.0 무의미 숫자토큰 제거 선례. 후보 `-analysis-deliverables`(redundant) · `-7-deliverables`(v2.6.0 안티패턴 재발) 기각 |
| version | **v8.0.0 MAJOR** | P2′ command-surface(skill `name`) = 비협상 / 선례 v7.0.0 D1 (외부 consumer 0 = 즉시 MAJOR 가장 가벼움 / alias map ❌) |
| cooling-off | **1-session GO** | Senior — v7.0.0 대비 실측 ~13× 작음(19 occ·13 files / fully grep-able) + 동일 cluster·hot context + STOP-3 가 cooling-off 대체 (memory cadence = unvalidated 한정 / 본 건 Senior-validated) |
| 분류 교정 | **content-aware** | SSOT §7/§8 = blind swap ❌ (거짓 행 방지) / ADR-PLUGIN-001 §2.5 line 57 + DEC-plugin-authoring-spec = audit-time 기록 보존 (역사 무수정 / LL-i-52) |

### §2. 시행 (실측 19 occ / 13 files)

- **git mv** `skills/spec-integrate-7대-deliverables` → `skills/spec-integrate-deliverables` (history-preserving / R)
- **활성 코드 5** (literal 치환): SKILL.md `name:`+H1 / `agents/spec-agent.md` ×3(skills[]·table·절차) / `flows/spec.phase-flow.json` skills[] / `flows/spec.phase-flow.mermaid` 라벨 literal
- **활성 문서 7** (literal 치환): `methodology-spec/skills-axis.md` · `lifecycle-contract.md` · `guides/getting-started.md` · `guides/first-prompt-cookbook.md`(link+path) · `README.md` ×2
- **content-aware** (Senior 교정): `plugin-authoring-spec.md` §7 row ❌→✅ resolved + §8-1 ~~strike~~ 종결 + 결론 갱신 / ADR-PLUGIN-001 §7 patch v1 append (§2.5 line 57 literal 보존)
- **보존 무수정** (역사 / LL-i-52): `DEC-2026-05-17-plugin-authoring-spec.md` (audit-time 기록) / CHANGELOG 구 entry / phase-id `cross-link-7-deliverables` + node-id `P_cross_link_7_deliverables` (skill 식별자 아님) + generic "7대 산출물" 도메인 산문 (SKILL.md 본문·templates·spec-compose / LL-i-55 trap 회피)
- **버전 trio** 8.0.0 (plugin.json + package.json + CHANGELOG `[8.0.0]`) + CLAUDE.md sync (현재 release + `plugin.json v8.0.0` check#10 토큰)

### §3. STOP-3 hard gate (★ v7.0.0 LL-i-55·57 paradigm — research 수렴만으로 착수 ❌ / 실측 hard gate)

- (A) 활성 코드 literal sweep = 0 (history 필터 후)
- (B) `tools/`·`scripts/` hidden consumer sweep = 0 (★ LL-i-57 — research blind to test/tool literals)
- (C) broader-prose(`7대[- ]?deliverable`) false-positive 수동 확인 (비식별자 무수정 입증)
- drift-validator 3-way (manifest↔skills↔mermaid) + schema-validator 11 PoC + workspace + release-readiness **12/12 incl check #12** (★ dogfood — plugin-authoring-spec 가 자신의 위반 해소 검증 / check #12 green 의무 = §7 content-aware 정합 입증)

---

## 회귀 검증

- (STOP-3 gate 실측 = 본 commit 직전 / CHANGELOG [8.0.0] §검증 + 본 절 기록)
- drift-validator 3-way PASS / schema-validator 11 PoC VALID / workspace test green / release-readiness 12/12 (check #12 ✅ dogfood) / version-check 3-way 8.0.0
- breaking ✅ 의도 (command-surface / alias ❌ 즉시 cutover) / chain harness validated 본질 보존

---

## Lessons Learned

- **LL-i-58 정합 + 확장** — deferred backlog 항목의 본격 시행도 동일 STOP-3 paradigm (v7.0.0 LL-i-55·57). research/Senior 수렴 후에도 post-rename hard-gate sweep (A)(B)(C) 의무 — 특히 (B) tools/scripts hidden consumer 는 grep 실측만이 보장. Senior 의 "분류 교정"(SSOT content-aware vs literal swap) = blast radius 작아도 의미 손상 risk 존재 입증 (audit-matrix 가 자기 자신을 거짓 진술하는 회귀 방지).
- ★ dogfood — plugin-authoring-spec check #12 가 자신이 flag 한 위반의 해소를 검증 (§7 ❌→✅ + green gate). 방법론이 자기 자신에 적용되는 메타 정합 입증 (v1.4.4 "plugin 정책이 plugin 자신의 변경 차단" 계보).

---

## 출처

- 사용자 결단 (session 26차 후속 / "1 바꾸자" + "spec-integrate-deliverables (Senior 추천)" / 2026-05-17)
- Senior critique (`_base-senior-engineer`) GO+REVISE conf 0.88 (새 name + 분류 교정 3 + drift-validator ordering + STOP-3 design + v8.0.0 비협상 + cooling-off GO)
- 실측 — `spec-integrate-7대-deliverables` 19 occ / 13 files grep + git mv R
- 선례 — DEC-2026-05-17-q7-rules-json-rename (v7.0.0 STOP-3 paradigm / LL-i-55·57) / v2.6.0 §8.3 무의미 토큰 제거 (skills-axis.md)
