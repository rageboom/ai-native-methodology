# DEC-2026-05-17-plugin-authoring-spec

- **상태**: 승인 ( 사용자 결단 4건 / 4원칙 full plan+research / additive / v7.1.0 MINOR)
- **일자**: 2026-05-17 ( session 26차 후속 / v7.1.0 MINOR)
- **결정자**: 윤주스 (TF Lead) — 사용자 질문 "plugin skill/hooks/agent 작성 시 Anthropic 공식·커뮤니티 best practice?" → "1번(감사)+2번(SSOT) 둘 다 + 공식 변경 시 재검증 고려"
- **관련**: ADR-PLUGIN-001 (결정 원천) / `methodology-spec/plugin-authoring-spec.md` (단일 SSOT) / plugin-charter.md R18 / ADR-010 (baseline+ratchet 차용) / ADR-009 (no-simulation·네트워크=§2) / DEC-2026-05-17-package-version-3way-sync-fix (선행 housekeeping) / plan `skill-hooks-tender-stonebraker`

---

## 컨텍스트

사용자가 plugin 자산(Skill/Hook/Agent/packaging) 저작 시 Anthropic 공식·커뮤니티 best practice 존재 여부 질문. claude-code-guide + 3 Explore + Plan agent(Senior 압력테스트) 조사 결과: 공식 1차 문서 4영역 존재 + 본 repo 가 대체로 정합하나 명문 SSOT 부재 + 공식 docs 진화 시 stale risk. 사용자 결단 = 감사+SSOT 둘 다 + "공식 원칙 변경 시 작성법도 따라 바뀌어야" = 외부 권위 drift 추적 메커니즘 1급 요소.

## 결정

### §1. 사용자 결단 4건

| #                          | 결단                                                                                                                   | 채택 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---- |
| #1 charter 등급            | **R18 정식 요구사항 신설** (§5 backlog 아님 — enforcement 강제력 최상)                                                 |
| #2 package.json 선행 drift | **별도 housekeeping 선행 청산** (4.0.1→7.0.0 / DEC-2026-05-17-package-version-3way-sync-fix / 별도 commit / 이력 분리) |
| #3 감사 발견 breaking      | **감사+백로그만, 수정 전원 이연** (한글 skill rename=별도 MAJOR / cooling-off+Senior+STOP-gate)                        |
| #4 staleness 임계          | **60일**                                                                                                               |

### §2. 시행 ( additive / 선행 자산 무수정)

- **신설** `methodology-spec/plugin-authoring-spec.md` ( 단일 SSOT / §1~§11). §6 pin = 실 `_base-official-docs-checker` F-015 ×4 VERIFIED (canonical `code.claude.com/docs/en/{skills,hooks,sub-agents,plugins-reference}` / 2026-05-17).
- **신설** `docs/adr/ADR-PLUGIN-001-authoring-spec-and-docs-drift.md` (신규 namespace = ADR-BE/FE/CHAIN/NEST 정합 / §7 patch + §8 LL accretion 영역).
- **`scripts/release-readiness.js` check #12** (`authoring_spec_staleness`) — §6 `last_verified` 4행 ≤ 60일 결정적 가드 (date-math only / 네트워크 ❌ / `check10` isomorphic / `--skip-authoring-staleness`=skip≠pass). 11/11 → **12/12**. `release-readiness.test.js` 12 case 갱신 (OD-3 — 기존 11 assert 동일 MINOR 내 12 전환).
- **`plugin-charter.md` R18** §1+§2+§6 + 헤더 "17→18" (활성 16 / R16·R17 scope-out 유지).
- **CLAUDE.md** — methodology-spec pointer + `plugin.json v7.1.0`(check#10 강제) + scripts "9/9→12/12"(stale 동반 정정) + 현재 release v7.1.0 + charter 17→18 sync.
- **버전 bump** — plugin.json + package.json + CHANGELOG `[7.1.0]` (3-way / version-check exit 0).

### §3. 외부 권위 drift 메커니즘 (ADR-010 차용 / 2계층)

- Layer i 네트워크 재검증 = 60일 cadence / `_base-official-docs-checker` ×4 dispatch / VERIFIED·CONTRADICTS·INSUFFICIENT-DATA 분기 (spec §9 / release-readiness 밖 = ADR-009 §2 territory).
- Layer ii 결정적 가드 = check #12 (offline date-math / 양심 비의존 = 본 repo 패러다임 / precedent R2→#10·A1→#11).
- grandfather (ADR-010 §2.1) = 감사 실 위반 = baseline grandfathered / ratchet = 신규·수정 자산만 §2·§4 강제.

### §4. 감사 결과 ( 실 F-015 cross-check / false-positive 3건 제거)

- 실 위반 = **S3 1건 ❌ high** (`spec-integrate-7대-deliverables` 한글 → 공식 charset `[a-z0-9-]` 위반 / MAJOR rename / §8-1 이연) + **S3/A1 1군 ⚠️ low** (`_base-*` skill×5+agent×3 leading `_` / 의도적 grouping / §8-2 이연·수용 후보).
- false-positive 제거 — S1 retrofit 불요(47/47 ≤500L + out-of-tree ref = progressive disclosure 정합) / marketplace.json 위치 = 공식 정합 / agent `skills:` = 공식 preload 필드(자체확장 ❌). over-claim 교정 = `system_prompt`·`preloaded_skills` 미존재.

### §5. 이연 (별도 user-gated bundle / 본 DEC scope ❌)

- §8-1 `spec-integrate-7대-deliverables` → kebab rename = **별도 MAJOR** (3 ref: skill dir / `agents/spec-agent.md` skills[] / `flows/spec.phase-flow.json` / cooling-off + Senior + STOP-gate / v7.0.0 선례).
- §8-2 `_base-*` charset deviation = 차기 네트워크 재검증서 공식 charset 강제 여부 재평가 후 결단 (rename vs documented-exception).

---

## 회귀 검증

- release-readiness **12/12** (A1 본격 spawn `criteria_total=12 passed=12 ready=true exit 0`)
- `release-readiness.test.js` **12/12 pass** (check#12 happy + skip≠pass + 12-id 정합 신규 case)
- version-check **3-way 7.1.0** (선행 housekeeping 청산 후 정상)
- workspace test green / drift-validator 3-way 불변 (skill/agent/flow 무수정 = §5 이연의 안전 속성)
- breaking ❌ (선행 자산 무수정 / 감사 = 기록만) / chain harness validated 본질 보존

---

## Lessons Learned

- **LL-i-58 (후보)** — main-agent 사전 research(claude-code-guide + Explore) 수렴만으로 단정 ❌. 실 `_base-official-docs-checker` F-015 ×4 독립 fetch 가 가설 false-positive 3건(S1 retrofit·marketplace 위치·agent skills 필드) + over-claim 2건(`system_prompt`·`preloaded_skills`) 제거 → 외부 권위 pin 은 반드시 1차 출처 독립 fetch seed (memory `feedback_sub_agent_validation` + ADR-009 no-simulation 정합). ( ADR-PLUGIN-001 §8 LL-plugin-01 자산화 / 본 DEC = 등재 표기)
- **LL-housekeeping 정합** — 선행 결함(package.json 3-way)을 feature 와 분리 별도 commit = 이력 청결 (DEC-2026-05-17-package-version-3way-sync-fix).

---

## 출처

- 사용자 질문 + 결단 4건 (session 26차 후속 / 2026-05-17 / AskUserQuestion ×2)
- 실 `_base-official-docs-checker` F-015 ×4 VERIFIED (canonical `code.claude.com/docs/en/*` / 2026-05-17)
- claude-code-guide + Explore ×3 + Plan agent (Senior 압력테스트) — plan `skill-hooks-tender-stonebraker`
- ADR-010 (baseline+ratchet) / ADR-009 (no-simulation·네트워크=§2) / 산업 사례 (Renovate·TUF·SLSA·OWASP Dependency-Track)
