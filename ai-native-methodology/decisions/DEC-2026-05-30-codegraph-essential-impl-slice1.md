# DEC-2026-05-30-codegraph-essential-impl-slice1

**결단**: `C-codegraph-essential-impl` (DEC-2026-05-30-codegraph-essential §6) carry 의 **Slice 1 시행** — CodeGraph OSS 를 analysis 단계 필수 도구로 실제 wiring (`tools/codegraph-runner/` 신설). Slice 1 = 도구 실제 실행 + `code-graph.json` reference-lens 산출물. **federation(dep-graph 결합)은 Slice 2 carry (`C-codegraph-federation`)**. v11.8.0 MINOR.

**작성일**: 2026-05-30 (session 55차 — 사용자 "C-codegraph-essential-impl 부터 진행" 결단).

**relates to**:
- `DEC-2026-05-30-codegraph-essential.md` §6 (carry 출처 / codegraph 필수 도구 결정)
- `DEC-2026-05-28-codegraph-probe-결과.md` §4.2 (trust 모델 — gate inject ❌)
- `~/.claude/plans/cheeky-strolling-stearns.md` (Slice 1 설계 plan / 사용자 승인)

---

## 1. 배경 + 사전 검증 (LL-codegraph-02 교훈)

v11.7.0 = codegraph 필수 도구 결정 (결정 문서만 / 실 wiring carry). 사용자 결단 → Slice 1 빌드. 빌드 전 사전 검증 (LL-codegraph-02 "빌드 전 환경·실행 가능성 확인" 의무):
- ✅ codegraph **v0.9.7 환경 실제 설치·실행 가능** (`codegraph --version` exit 0 / node v22) → no-simulation 전제 충족.
- ✅ CLI 모델 실측: `init -i`/`index` (→ `.codegraph/` SQLite) + `status --json` (머신리더블 통계) — **SARIF 일회성 아님** → static-runner `Plugin.run()` (SARIF·result_hash 하드코딩) 부적합 → 별도 경량 tool 결정.
- ✅ §8.1 ≥2 stack: JS (6 nodes function/import) + Java (5 nodes class/method/namespace) 실제 index 작동 확인 + probe #1~#3 (iBATIS/MyBatis/JPA) 누적.

## 2. 시행 (Slice 1 / additive / breaking 0)

| 영역 | 내용 |
|---|---|
| `tools/codegraph-runner/` (신규 / 23번째 workspace tool) | `src/runner.js` (codegraph index 실제 실행 + status --json / 7-field evidence / evidence_trust=real_tool / 환경 부재 exit 3) + `src/manifest.js` (status → code-graph.json pure builder) + `src/cli.js` (--target/--output / exit 0·2·3) + `test/` (9 test: manifest 단위 JS+Java + 실 smoke present-gated) + package.json. **cross-platform**: Windows `.cmd` shim = execSync shell 경유 + 경로 quoting (Node 22 execFileSync('.cmd')=EINVAL 회피). |
| `schemas/code-graph.schema.json` (신규) | meta(derived_from + do_not_edit + trust_note) + index_stats(file/node/edge/languages/nodes_by_kind) + evidence(7-field + evidence_trust enum). additionalProperties:false. |
| `skills/analysis-code-graph/SKILL.md` (신규) | analysis cross-cutting aspect (codegraph 필수 도구) / no-simulation 명시 / trust 모델 명시. |
| `flows/analysis.phase-flow.json` | cross_cutting.aspects.skills[] 에 analysis-code-graph 등록 (drift-validator orphan 0 의무). |
| 등록 | CLAUDE.md tool 22→23 / schema 46→47 / skills 55→56 + plugin-charter (R21 진전). |

### 2.1 trust 모델 준수 (DEC-2026-05-28 §4.2)
code-graph.json = **reference-lens / finding 으로만 수용 / 어떤 결정적 gate 에도 inject ❌**. manifest.trust_note 에 명시. gate-eval / release-readiness validator 목록 **무변경** (codegraph 결과가 gate 결정에 개입 안 함). codegraph 자신의 원칙("graph provides context, not requirements") 정합.

## 3. Slice 2 deferral (`C-codegraph-federation`)
- dep-graph navigate 증강 (codegraph `callers`/`impact` 로 영향 트리 enrich)
- code-pointer staleness 검증 (`codegraph query <symbol>` → suggested_path)
- cross-domain undeclared 호출 finding 자동 등재
- MCP `serve` 통합
- → Senior REVISE @ 40% (UX wrapper) 영역 / §8.1 corroboration 후 별도 진입.

## 4. STOP-3
- workspace test 795 → **804 (+9)** ✅ (codegraph-runner 9 신규 / drift-validator check-phase-skills 정합)
- release-readiness **22/22 ready** ✅
- skill-citation **0 stale** (신규 SKILL.md + schema 인용 정합)
- version 3-way **11.8.0**
- breaking **0** (신규 tool/schema/skill additive / 기존 static-runner SARIF 경로 무변경) = MINOR

## 5. Lessons Learned

### LL-codegraph-impl-01 — 사전 환경 검증이 scope 를 정한다 (LL-codegraph-02 실천)
빌드 직전 `codegraph --version` + CLI help 실측 → "SARIF 아님 / init+status 모델" 발견 → static-runner 확장 ❌ / 별도 tool 결정. 사전 검증 없이 Agent 1 권고(static-runner Plugin 확장)대로 갔으면 SARIF-bound Plugin.run() 과 충돌. **자산화**: 외부 도구 wiring 은 도구 실 CLI 계약 실측이 설계를 정한다.

### LL-codegraph-impl-02 — no-simulation 은 cross-platform 호출까지 책임
Windows + Node 22 에서 `execFileSync('codegraph')`=ENOENT / `.cmd`=EINVAL → smoke test SKIP (환경 부재 오판). no-simulation 이 *실제* 작동하려면 (사용자=Windows) shell 경유 호출 필수. **자산화**: "도구 present" ≠ "도구 invocable" — 플랫폼별 실행 경로 검증이 no-simulation 의 일부.

## 6. carry
- `C-codegraph-federation` — Slice 2 (navigate 증강 + code-pointer staleness + cross-domain finding + MCP serve). §8.1 ≥2 corroboration + STOP-3.
- `C-codegraph-runtime-corroboration` — codegraph-runner 를 실 PoC analysis 에서 ≥2 사용 (현 = 단위 fixture + smoke / 실 chain 사용 누적 시 자격 강화).

## 7. 한 줄 결론
> codegraph 필수 도구 wiring Slice 1 = `tools/codegraph-runner/` (codegraph index 실제 실행 / no-simulation exit 3 / cross-platform / code-graph.json reference-lens = gate inject ❌). federation 은 Slice 2 carry. v11.8.0 MINOR / 804 test / 22/22.
