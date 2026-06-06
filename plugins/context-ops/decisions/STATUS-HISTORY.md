# STATUS History — multi-cutoff archive

> **Multi-cutoff archive** — paradigm 진화 분기 cutoff 매시 archive 자산:
>
> - 2026-06-03 (v12.0.0 json-only / dep-graph living-graph era) — session 41차~54차 (v9.0.0~v11.5.1) 격리 (STATUS bloat cleanup @ v12.6.0 / 본 cutoff)
> - 2026-05-25 (v9.0.0 paradigm boundary) — session 40차 이하 (v8.14.4 PATCH 이하) 격리
> - 2026-05-23 (v8.13.2 cleanup) — session 31차 이하 격리
> - 2026-05-16 (R3 / v3.6.5 / session 20차 결단) — session 14차 이전 격리
>
> 현재 진행 상태 (session 55차 이후) → [`STATUS.md`](STATUS.md) 참조.

---

## v11.6.0~v11.33.0 archive (2026-06-03 cleanup — session 55차~66차 + dep-graph/codegraph Q3 / STATUS bloat @ v12.7.0)

**session 66차 — v11.33.0 MINOR release — S2(AX전환 = 주 타깃) gate WARN→block 격상 (② "S2 gate" sub-carry RESOLVED / ecommerce 2nd distinct domain execution corroboration)**: "세션이어서" → 직전 v11.32.0(FE 앵커) 완결 = 진짜 분기점 → AskUserQuestion(4 의제 / self-referential drift 메타 관찰: session 60~65 dep-graph 6연속) → 사용자 "자율 가능 첫 항목 = **S2 gate WARN→block(도구 실제 실행)**" → 정직 판단 동의(S2 = chain harness 주 타깃 축 / 6연속 dep-graph 루프 탈출). **4원칙 ladder full**: ① Phase 1 깊은 숙지(gate-eval.js SCENARIO_EXPECTED.S2/severityRank/applyUserDecision + s2-outcome-check.js reconcileOutcomes/correlateByTcId + DEC-2026-05-30-s2-{gate-slice,exec-corroboration} + taxonomy §5 자격게이트 + ecommerce 가능성 실측: clone 존재·node_modules·**npx jest 56 GREEN 자가 재현**·test-spec 이미 S2형태[characterization/expected_outcome]·"augmentation arm 없음" 명시) + plan(`plan-s2-gate-block-upgrade.md`) ② 경량 2-agent research(Senior GO_WITH_REVISE@0.82 + Industry advisory→enforcing maturation / 공식문서 생략=jest/git 자가검증) ③ AskUserQuestion "설계대로 진행 + MINOR" ④ 시행. **자격 게이트 = §8.1 ≥2 distinct domain S2 execution corroboration** — 직전 1/2(RealWorld Spring/JUnit/blog) → **ecommerce(NestJS+Prisma+jest / e-commerce)** 2nd distinct(문제 도메인·언어·ORM·runner 전부 distinct = carry 예시 same-stack Spring 보다 강함) 확보로 **2/2 충족**. **2차 corroboration(no-sim 실 jest+실 모듈 / 본 session 직접 실행 / 구성 literal ❌)**: `purchase.refund.aug.spec.ts`(TC-PURCHASE-REFUND-001 / refund 미구현=create/findAll/findOne/review/update/remove only) 실 jest **RED**(57 total=56 char pass+1 aug fail / 깔끔한 assertion RED) + harness(`.aimd/s2-gate-2nd-domain-harness.mjs` / 실 correlateByTcId[aug name-based]+file-based[unit char]→reconcileOutcomes→evaluateGate→applyUserDecision): [1] 정상 S2 outcome_mismatches=0(evaluated=25 / missing_actual=6 e2e env-carry 정직) blocked=false / [2] 음성대조 mismatch=1 blocked=true s2_outcome_mismatch / [3] 격상 후 'go'→block+user_override_rejected / [4] isolation(layer2/findings_unverified 여전히 go-with-warnings). RealWorld `DELETE /user` isomorphic. evidence=`_dogfood-ecommerce/.../.aimd/s2-gate-2nd-domain-probe.md`+`jest-s2-results.json`. **시행(gate decision flip / breaking 0)**: `gate-eval.js` ① **HARD_BLOCK_CODES Set 신설**(validator_critical/high/s2_outcome_mismatch / **Senior REVISE @0.88** — `hasCriticalOrHigh` 술어 의미 오염 회피 / layer2_threshold·coverage_threshold·findings_unverified WARN 의도 명시 분리 / state_corrupt 미포함=scope 외 carry) ② applyUserDecision `HARD_BLOCK_CODES.has` ③ severityRank s2_outcome_mismatch 2→1 ④ 주석 WARN→block. `scenario.test.js` WARN 테스트 block 반전(blocked/decision/user_override_rejected) + **isolation 회귀 추가**(chain-driver 268→269). `cli.test.js` F-I05 test 명 stale WARN→block. ** behavioral note(MINOR / Senior@0.80 + Industry typescript-eslint 'internal-only=minor')**: S2 chain 4 outcome_mismatch 시 'go' override 이전 가능→거부(S2 한정 / S1·greenfield·S3 무영향 / API·schema·config signature 무변경 / chain-driver gate-eval 내부). **STOP-3 ✅**: workspace 1048→**1049 pass/0 fail**(+1 isolation) + RR **30/30** + skill-citation 257 doc 0 stale + version 3-way 11.33.0 + breaking 0 = MINOR / build dist v11.33.0 / git diff 클린(EOL 노이즈 0). **§8.1(정직)**: 실 외부 repo(ecommerce) 실 jest measurement-driven = self-referential 아님(주 타깃 S2 gate advisory→enforcing / dep-graph 6연속 루프와 다른 축) / ≥2 충분(≥3=speculative hardening=cooling-off 폐기 위반 / Senior+Industry 정합) / round-trip 불요(carry 분리 / RealWorld 에서 이미 RESOLVED). **carry ① WARN→block RESOLVED** (use-scenario-taxonomy §5 + DEC-2026-05-30-s2-exec-corroboration carry 1). **잔여 carry**: distinct **문제** 도메인 3rd S2 corroboration(현 2 distinct=충분 / 선택) · committed PoC graph cosmetic lag · ③ Type 2 외부 채택·public-OSS. **commit/tag/push** = push 직전 사용자 확인. DEC-2026-06-01-s2-gate-block-upgrade. plan `.claude/plans/plan-s2-gate-block-upgrade.md`. 메모리 `project_session_66_s2_gate_block`.

---

**session 65차 — finding-registry 정합 (release 아님) + v11.31.0 + v11.32.0 MINOR (② 잔여 sub-carry F-ECOM-004 + FE kinds 2종 RESOLVED)**: "세션 이어서" → 직전 branch `claude/fix-readme-plan-stale`(plan-agent stale fix) 종결 흐름. **① finding-registry 정합** (prose / release 아님 / commit `e4b9003`·`4b43924` origin/main): **F-CHA-003**(plan stage paradigm-level) deferred→**resolved** — DEC/CHANGELOG v10.0.0 가 이미 "5 axis 본격 해소" 인데 finding-system.md 항목만 갱신 누락 = registry-drift / 5 axis(stage-graph plan='#3' / state.schema enum / chain N=gate #N / phase-flow placeholder=false / revisit_edges 9) **코드 실측 확인** 후 sync + 죽은 인용 정정. **F-CHA-001**(gate#5 impl Auto Mode 'go' 코드 차단) — 같은 증상이나 **코드 실측 결과 DEC "본격 해소"가 Senior BLOCKER-2/trio 한정 overclaim** 이고 원 proposed-fix(a)=`gate-eval.js` autoMode 차단 미구현(`applyUserDecision` autoMode 파라미터 부재 / ADR-CHAIN-002:53 정책 유효) → **deferred 유지가 사실 정합**(거짓 resolved 회피 / Status 노트만). 사용자 메타질문("audit 모두 해결?")→전수 대조→F-CHA-001 발견. **② v11.31.0 MINOR** (commit `40206a5` tag `v11.31.0` / F-ECOM-004): graph-synthesizer **Layer 4** — discovery/behavior/operational-task `cross_links.to_analysis_artifacts` → `ANALYSIS_BASENAME_TO_KIND` 역매핑 → `analysis-{kind}` → layer anchor cross_reference edge (dangling+dedup / fan-out 회피). **조사 정정(주장≠사실)**: root-cause "to_analysis_artifacts 미합성"이 5 orphan 중 3개(domain/error-mapping/form-validation)만 설명 / architecture·db-schema=미참조(dogfood 7대 coverage 미충족) + 제안 "B=chain-coverage filesystem coverage 검사"는 **poc-16(orphan=0 정상) false-positive** → 폐기 / **기존 graph-integrity orphan=FAIL 이 곧 B-enforcement**(코드 실측). ecommerce 실 그래프 orphan **5→2(A 단독)→0(A+C specs 완전체)** PASS. **③ v11.32.0 MINOR** (commit `dd4bf19` tag `v11.32.0` / F-FE-ANCHOR-001): FE kinds(type-spec/ui-ux/form-validation) accessor 배선 — Phase 1 실측 = ANALYSIS_TO_CODE_POINTERS 가 BE kinds 만 / FE(source_file 보유) 미배선=BE slice 2~4 의 FE 대응 gap. 실 FE dogfood **`yurisldk/realworld-react-fsd`**(React 19+TS+Zod 4+React Query/FSD / 순수 React / clone `_dogfood-react-fsd/`) FE 노드 **BEFORE na:true(0) → AFTER covered(type-spec 6 + form-validation 3 + ui-ux 8 = 17 strict_path / commit_hash 969709a)** + FE 산출물 3종 schema-valid(captured_by=manual_extraction 정직 / ts-morph 미실행). state-map/visual-manifest=source 필드 부재→영구 na. **STOP-3 (양 release)**: workspace 1037→1042→**1048 pass/0 fail** + RR **30/30** + skill-citation 0 stale + 3-way 11.32.0 + breaking 0 = MINOR / pre-push 게이트 통과 / **CRLF→LF 정규화 교훈**(Edit 툴이 graph-synthesizer.js 를 CRLF 로 써 916/793 노이즈 → latin1 byte-preserving 정규화 / 이후 doc 편집은 node 스크립트=LF 유지). §8.1: 둘 다 synth-class additive + 실 외부 repo(ecommerce/react-fsd) measurement-driven = self-referential 아님 / FE 도메인=RealWorld(BE 와 문제 도메인 겹침) / distinct FE 스택·코드베이스 충족. **본 session 누적 2 release**(LL-v930-02 4-cap 정합). DEC-2026-06-01-fecom-004-orphan-edge + DEC-2026-06-01-fe-anchor-001. 메모리 `project_session_65_fecom004_fe_anchor`.

**session 64차 — v11.30.0 MINOR release — db-schema 명명 패턴 legacy 편향 완화 (② ecommerce-backend 2nd distinct domain dogfood 완주)**: "세션시작 이어서" → STATUS 의제 ② → AskUserQuestion **"② 전체 baseline"** → `alvaromrveiga/ecommerce-backend`(NestJS 8+Prisma 3.14+PostgreSQL / Type 1.5 operator dogfood) clone(`_dogfood-ecommerce/`) → **full dogfood**: analysis(7대+DB+form-validation+error-mapping / 18 BR / 9 진짜 antipattern[할인 미적용·구매시 재고 미차감·refresh 평문 저장(주석=hashed)·null-deref 등]) + chain 1~5(discovery UC 100%→spec 21BHV/30AC→plan 22task/4ADR→test 30TC→impl) **全 schema-valid** + traceability **30 cells forward/backward 100% green** + ** 실 GREEN jest 56 tests/5 suites PASS/0 fail**(mock Prisma=DB불필요 / result*hash sha256:4fb73bc9… / RealWorld F-DOGFOOD-008 env-blocked 넘어선 **chain 5 GREEN 게이트 2nd-domain 첫 실증**) + dep-graph(138 nodes / code-pointer **100%** / **A2 worktree 라이브**: purchase.service.ts 미커밋 수정→2노드 content_drift 탐지→revert / **Slice4 db-schema→DDL** Prisma migration 10 strict_path 앵커 = synthesizer "독립가치 ≥2 도메인 carry" 해소). **표면화 findings**(dogfood-findings.md): F-ECOM-001(db-schema 명명 패턴 `^[a-z]a-z0-9*]\*# STATUS History — multi-cutoff archive

> **Multi-cutoff archive** — paradigm 진화 분기 cutoff 매시 archive 자산:
>
> - 2026-06-03 (v12.0.0 json-only / dep-graph living-graph era) — session 41차~54차 (v9.0.0~v11.5.1) 격리 (STATUS bloat cleanup @ v12.6.0 / 본 cutoff)
> - 2026-05-25 (v9.0.0 paradigm boundary) — session 40차 이하 (v8.14.4 PATCH 이하) 격리
> - 2026-05-23 (v8.13.2 cleanup) — session 31차 이하 격리
> - 2026-05-16 (R3 / v3.6.5 / session 20차 결단) — session 14차 이전 격리
>
> 현재 진행 상태 (session 55차 이후) → [`STATUS.md`](STATUS.md) 참조.

---

snake*case 강제→Prisma PascalCase/camelCase 거부 = legacy 편향 / HIGH) + F-ECOM-002/003/004(RealWorld F-DOGFOOD-001/006/010 의 2nd-domain corroboration) + F-ECOM-005(source_files 누락→Slice4 미발화 / resolved). **사용자 결단 "F-ECOM-001 본체 fix"** → 4원칙(plan `plan-fecom-001-db-schema-naming` + 회귀검증[구패턴 reject test 부재 / snake_case ⊂ 신패턴=valid→invalid 전이 불가 구조적 보장] + 시행): db-schema.schema.json table(L32)+column(L58) name 패턴 → `^[A-Za-z*][A-Za-z0-9_]\*# STATUS History — multi-cutoff archive

> **Multi-cutoff archive** — paradigm 진화 분기 cutoff 매시 archive 자산:
>
> - 2026-06-03 (v12.0.0 json-only / dep-graph living-graph era) — session 41차~54차 (v9.0.0~v11.5.1) 격리 (STATUS bloat cleanup @ v12.6.0 / 본 cutoff)
> - 2026-05-25 (v9.0.0 paradigm boundary) — session 40차 이하 (v8.14.4 PATCH 이하) 격리
> - 2026-05-23 (v8.13.2 cleanup) — session 31차 이하 격리
> - 2026-05-16 (R3 / v3.6.5 / session 20차 결단) — session 14차 이전 격리
>
> 현재 진행 상태 (session 55차 이후) → [`STATUS.md`](STATUS.md) 참조.

---

(대소문자+선두 \_ 허용 / additive). **검증(no-simulation)**: ecommerce schema 위반 5→0 + workspace **1037 pass/0 fail**(v11.29.0 baseline 유지=회귀0) + schema-validator canonical 40/40 + RR **30/30** + 3-way 11.30.0 + check29(README/CLAUDE.md sync) + build dist. baseline 함정 교훈: schema-validator `test/*.test.js` glob=99/7fail(비-canonical 파일 포함) vs canonical `npm test`=40/40 → canonical 기준 판단 / PoC schema.json=구 additionalProperties 형식이라 현 schema에 어차피 invalid(naming 무관)→회귀 baseline 부적합=구조적 보장으로 대체. **§8.1(정직)**: A2/code-pointer/Slice4 = 2nd distinct domain(Prisma) corroboration 충족 방향(WARN→통과 격상=후속) / S2 gate WARN→block=도구 자체 미실행 carry / FE kinds=BE-only repo→FE 3rd 도메인 carry / Type 1.5(operator) ≠ Type 2(외부). **STOP-3 ✅**: workspace 1037 + RR 30/30 + skill-citation 0 stale + version 3-way 11.30.0 + breaking 0 = MINOR. **commit `f626f43` + tag `v11.30.0` push 완료**(pre-push gate: release self-test 15/15 + workspace test pass / origin/main 동기). DEC-2026-06-01-db-schema-naming-modern-orm. 메모리 `project_session_64_ecommerce_dogfood`.

**session 63차 — v11.29.0 MINOR release — Type 2 adopter corroboration 캡처 배선 (schema + packager 도구 + check30 + suggest 트리거 / EXT-CAPTURE 해소)**: `/clear` 후 사용자 "이전 세션 잔여 이어서" → STATUS 핸드오프 의제 ②③ 확인 → AskUserQuestion 2종(②=2nd 도메인 후보 / ③=Type 2 이번 세션 범위) → **② = `alvaromrveiga/ecommerce-backend`(NestJS+Prisma 전자상거래) 확정**(웹검증 / 후속 dogfood) + **③ = 캡처 배선만 이번 세션 빌드**. 근거 SSOT = `plan-type2-external-adoption.md` Phase 1 감사 capture readiness **0.08**(최대 공백 / 외부 adopter chain 완주해도 결과 담을 schema·트리거·익명화·수집경로 전무 / EXT-CAPTURE-01/03/04/05). **4원칙 ladder full**: ① Phase 1 깊은 숙지(state.schema last_gate / work-unit-manifest scenario / chain-driver cmdNext gate 기록 / db-assets 도구 템플릿 / release-readiness check·self-test / check27 PII regex / Type 1.5 simulation 캡처 패턴) + plan(`.claude/plans/plan-type2-capture-wiring.md`) ② **2-agent lightweight research**(official-docs + Senior / Phase 4+ Case 생략) ③ AskUserQuestion "진행 — suggest 모델" + 4 컴포넌트 + REVISE 5종 ④ 시행. ** research 핵심**: official-docs — salt+sha256 가명화=VERIFIED(OWASP 귀속은 UNVERIFIABLE) / **"opt-in 권장"=CONTRADICTS**(Next.js·.NET=opt-out → C3 정당화를 "opt-in 업계표준"이 아니라 **adopter 데이터 주권·consent** 으로 재프레이밍) / draft-2020-12+$defs=VERIFIED / regex redaction=best-effort(false-negative)=VERIFIED(→leak guard 정당). Senior **GO_WITH_REVISE@0.82** + §8.1 forward-looking 확인 + inflation 경고. **시행(additive / breaking 0 / 결정론)**: ① **C1 schema** `schemas/adopter-corroboration.schema.json`(47번째 / work-unit-manifest.scenario + state.last_gate shape 재사용 / adopter{opaque adopter_id, org_type} / project{opaque project_hash, stack_signals, scenario, loc_bucket enum 고정} / chain_run{gates #1~#5} / findings_summary / coverage(opt) / user_feedback(opt) / anonymization{applied,redaction_count,method} / top-level `additionalProperties:false`) ② **C2 도구** `tools/adopter-evidence-packager`(26번째 / packager.js 순수 + cli.js + 14 test + fixtures / state+manifest+findings+matrix→익명화 corroboration→ajv→leak guard→`.aimd/output/adopter-corroboration.json` / opaque ID=sha256(salt+id) / PII best-effort redaction[email·절대경로·private-key·IP·사내host] + post-redaction leak guard[잔존 PII→exit1+위반 필드 경로] / `--no-redact`=guard 검증용 / AI 0%) ③ **C3 트리거(suggest-not-autofire)** chain-driver `cmdNext` gate#5(terminal/`!next`) stderr suggest[ticket-sync 패턴 동형·별도 라인] + `implement-verify-test-pass` skill step9[consent·데이터 주권 / auto-write ❌] ④ **C4 게이트 check30 `adopter_corroboration_capture`**(release-readiness 29→30 / schema draft-2020-12+strict + packager bin + golden round-trip(exit0) + leak-guard discrimination(poisoned `--no-redact`→exit1 pii_leak) = content-aware). ** Senior REVISE 5종 흡수**: ① terminal-only 트리거(ticket-sync 매 전이 충돌 회피) ② **PII regex SSOT `tools/_shared/pii-patterns.js`**(release-readiness check27 가 import / regex 복사 ❌ = drift attractor 회피 / INTERNAL_IDENTITY_RE byte-identical) ③ leak-guard 위반 필드 경로 보고(silent wall ❌) ④ loc_bucket enum 스키마 고정(`<1k`/`1k-10k`/`10k-100k`/`100k+`/`undisclosed`) ⑤ negative fixture(`--no-redact`+PII→exit1) anti-regression. **검증(no-simulation / 실 CLI)**: packager **14 test**(round-trip/redaction/leak-guard/결정론/write/usage/plugin-version auto) + schema-validator **+5**(valid/required/pattern/enum/strict / 스크립트에 신규 test 등재) + release self-test **14→15**(check30 discrimination case) + chain-driver **268 무회귀**(C3 edit) / workspace **1037**(1018+14+5) / release-readiness **30/30**(full / check10·check29·check30 green) / version 3-way **11.29.0** / skill-citation **0 stale**(SKILL.md step9 후) / **F-EXT-CAPTURE-001 RESOLVED**. **§8.1(정직 / Senior 확인)**: **forward-looking capability — corrective drift ❌**(외부 adopter 가 필요로 하는 missing rail 신설 / "우리 도구 우리가 고치기" 아님) /  **green check30 ≠ "Type 2 corroboration 달성": 배선 출하 / Type 2 측정 = 0 / 실 외부 adopter 실행 대기**(inflation 금지 / Senior 경고 직접 흡수). gate-class 아님(write-class·opt-in·consent·결정론). **STOP-3 ✅**: workspace **1037** + release-readiness **30/30** + skill-citation 0 stale + version 3-way **11.29.0** + breaking 0 = MINOR. **잔여 carry**: ① **② ≥2 distinct 도메인 dogfood**(확정 `alvaromrveiga/ecommerce-backend` / 진짜 측정) ② ③ Phase 2 실 외부 적용 동행 + EXT-CAPTURE-04 수집·집계 채널 + public-OSS(조직) + preflight codegraph/gradle(EXT-PREFLIGHT) + `${CLAUDE_PLUGIN_ROOT}`경로(EXT-PATH) ③ F-EXT-PREFLIGHT-001/PATH-001/PUBLIC-OSS-001 등재(③ 착수 시). **본 session prod 가치 = ③ Type 2 캡처 배선 신설(necessary, not sufficient / 실 측정은 ② dogfood + 실 adopter 의존)**(self-referential 아님 / forward-looking missing rail / 감사-driven). **commit/tag/push** = push 직전 사용자 확인 대기. DEC-2026-06-01-type2-capture-wiring. plan`.claude/plans/plan-type2-capture-wiring.md`.

**2026-06-03 — dep-graph/codegraph Q3 pass-2 검증 + C-codegraph-precision ( no release / precision HELD / findings 등재)**: 사용자 "dep-graph/codegraph 검증 세션 이어서" → evidence-gated 경로(precision 보강→Q3 재측정→가치 입증 시에만 land) 4원칙 완주. **환경**: Node v22.11→**v24.16.0 업글**(node:sqlite unflagged=F-FED-WIN-001 achievable 디폴트 / C-node-upgrade RESOLVED). **C-codegraph-precision 구현(검증완료 / HELD=미커밋)**: federator `mapAffectedNode` → callers/impact affected 에 `same_file`/`same_dir` + impact 에 `node_count_same_dir`(host anchor codegraph-relative path 기준 / **추가 codegraph 호출 0**=file*path 이미 보유 / silent drop ❌=모듈판단은 consumer / `same_module` 명명 거부=도구는 결정론 사실만) + schema additive(symbolRef/impact nullable·required 미추가=비파괴) + test+2(동명 union noise/null) → **workspace 1046 pass·0 fail** / ajv 실데이터 valid / validator·release-readiness shape 가정 무영향(grep). 4원칙 §2 = Senior **REVISE-3**(same_file/same_dir multi-signal·#3 ambiguous 폐기·no silent drop·§8.1 land·self-ref-drift=Q3 전제로만) + official-docs **VERIFIED**(codegraph query/impact/callers bare-name only·qualified_name 컬럼 존재·node:sqlite Node24 RC unflagged·SCIP/LSP file_path 방향 정합). CRLF byte-preserving 편집(노이즈 0). **§8.1 2-도메인 FP 실측**: ecom `impact("remove")` 111노드/5모듈 union(same_dir 27=84 cross-dir noise 가시화) · RW `impact("body")` 190(article+comment 7 def) · `findById` 352. **Q3 A/B(RW articles.body→content / GT=gradle compile+raw grep 동결·비순환 / Workflow 6 rep / BASELINE×3 vs FEDERATED×3 격리·GT 미인지)**: 둘 다 **SQL recall 3/3·동명 trap 위양성 0**(comments.body·DTO getBody·`claimsJws.getBody()` JWT 전부 회피) / **FEDERATED effort↑(악화)** + 3 rep 모두 "lens 불완전(SELECT fragment+**DDL=실제 rename 대상 누락**·delete UC article_tags 무관)" 지적 → **federation 미입증**(pass-1 ecom code 와 일관 / **2nd distinct scenario**=RW data-coupling). ** LL-GT-OVERCHANGE**: 내 객관 compile-GT 가 Java 필드까지 rename 한 **과잉변경**→phantom 4 test 파일 / 두 arm 은 MyBatis alias 디커플링(`A.body articleBody`+resultMap+`#{article.body}`) 정확 추론→최소변경=**3 SQL뿐**(엔티티/getBody/DTO/test 불변)=**GT보다 정확** → "code 0/5"는 arm 실패 아니라 내 GT 오류(arm 점수 안 깎고 정직 보고). **처분(사용자 결단)=findings 환류+precision HELD**: evidence-gate(§8.1 ✓·Q3 federation outcome ✗)→release ❌ / **revert 로 main clean(HEAD 4b970f7)** / re-apply recipe=`~/.claude/plans/\_apply_precision*{fed,schema,test}.cjs`(v12.0.1 파일 결정적 single-match) / federation 방향 계속 시 land. **findings**: ① **F-FED-LENS-DDL-GAP**(sql-inventory data_refs 가 mapper SQL 잡되 DDL migration 누락=스키마 변경 불완전) ② **F-FED-PROMPT-DATA-GAP**(`--prompt`매칭 code-anchored 만 랭킹→data-anchored UC 노드[sql-inventory uc_link] 미도달 / full cache 우회) ③ **C-node-upgrade RESOLVED**(Node24 unflagged) ④ **C-q3-hard-scenario** 잔존(공정 검증=대형/깊은 repo 필요 / or 결론 "소형 repo federation marginal"). **LL**: LL-GT-OVERCHANGE(객관 GT 도 적용변경 과잉이면 틀림·LLM arm 이 더 정확) + LL-WORKFLOW-ARGS(Workflow`args`글로벌 미전달 v1 실패=FEDERATED 빈 렌즈=BASELINE 무효→모든 데이터 스크립트 const 인라인 v2 fix) + LL-PRECISION-DEMO-vs-VALUE(lens-quality 개선 실증 ≠ federation 가치 입증). **결론**: codegraph-federation, 2 distinct 소형·구조양호 repo(ecom code·RW data)서 LLM 단독 대비 **무가치 = 강한 negative result**(투자 방향 판단 prod-가치). **본 session prod 가치 = federation 무가치 실증(측정) / 도구 polishing ❌**(self-referential drift 회피 / feedback_self_referential_corrective_drift 정합). **레포 무변경**(main clean 4b970f7 / 본 STATUS findings 등재만 / DEC 미생성=release 없음). plan`~/.claude/plans/plan-fed-precision-q3.md`/ memory`project_depgraph_codegraph_validation.md`.

**session 62차 (계속) — v11.28.0 MINOR release — README.md stale 동기화(front door) + drift-resistant 재구성 + version-sync 가드(check29)**: v11.27.0 push 완료 후 사용자 "이제 뭐 남았나" → "1"(① 잔여) 반복. ① 핵심 = **README.md**(plugin user 진입점) title `v11.1.0`(현 v11.27.0 = 26 버전 stale) + 카운트(skill 55·도구 22·스키마 46·770 test·22 criterion) 전부 stale = front-door 신뢰도 붕괴 (Type 2 감사 EXT-MISS-08·EXT-DOC-DRIFT-01). **4원칙**: ① Phase 1 README 전수 + 현 paradigm 카운트 검증(skill 57/tool 27/schema 47/PoC #01~#16) ② plan(plan-genuine-defects-cleanup.md ① bucket) ③ 설계=감사 EXT-DOC-DRIFT 교훈 직접 반영(카운트 재-stale 회피=하드코딩 최소화 + version-only 가드) ④ 사용자 "1". **시행(additive / breaking 0)**: ① **버전 동기화** — title·`현재`·install·dist 트리 `v11.1.0`→`v11.28.0` 또는 `v<version>` placeholder(8 spot) / 사내 GHE install URL 유지(사내 표준=현행 / public-OSS=별도 carry) ② ** drift-resistant 재구성** — 22-criterion 하드코딩 열거 리스트→**영역별 요약 + `release:check`/`scripts/release-readiness.js` 출력 pointer**(개수 하드코딩 제거) / 헤더·dir-tree·prose 브리틀 카운트(skill 55·도구 22·스키마 46·analysis 28·770)→제거 또는 "CHANGELOG·/plugin 참조" 위임 / "분석 대상 사내 프로젝트"→"분석 대상 프로젝트"(EXT-SCOPE 중립화) / 라이선스 절→`UNLICENSED` 명시(plugin.json 정합) ③ ** 회귀 가드 check29 `readme_version_sync`**(release-readiness **28→29**) — README canonical current-stamp(title `# … vX.Y.Z` + `현재 … vX.Y.Z`) ↔ plugin.json.version sync(check10/CLAUDE.md 동형) / history 언급(`v9.0=`·`v11.0.0=`)·`v<version>` placeholder 제외 = 오탐 회피. **검증(no-simulation)**: release-readiness self-test **14/14**(count 28→29 + 신규 id 등재 + 설명 동기화) / **discrimination 실증**(check29 title+현재 추출 / history `v9.0`·`v11.0.0` 미추출=오탐 ❌ / stale stamp 11.1.0 탐지=FAIL 발화) / README 잔존 `v11.1.0` **0**·stale count **0** 검증 / skill-citation 0 stale(README·release-readiness 편집 후) / workspace **1018** 유지 / release-readiness **29/29** / version 3-way 11.28.0. **§8.1(정직)**: front-door 외부-노출 stale 결함 cleanup — self-referential 과 구분(plugin user 가 실제로 받는 진입점 / EXT-MISS-08) / check29 = R2 drift enforcement(version 26-버전 stale 재발 차단 / 양심 의존 ❌). ** 본 release 로 ① "지금 가능한 진짜 결함" bucket 사실상 소진** — 잔여는 ②③(≥2 distinct 도메인 / Type 2 외부 채택 / public-OSS = 새 도메인·조직 결정 = 사용자 영역). **STOP-3 ✅**: workspace **1018** + release-readiness **29/29** + skill-citation 0 stale + version 3-way **11.28.0** + breaking 0 = MINOR. **잔여 carry**: ① dep-graph ≥2 distinct 도메인(A2 usability·FE kinds·A3 dogfood) ② Type 2 외부 채택(43 장벽) ③ public-OSS 공개(조직) ④ README count-drift 종합 가드(현 version-only / count 가드는 브리틀로 보류). **본 session prod 가치 = front-door(README) 외부-노출 stale 26-버전 drift 청산 + version 재발 차단 enforcement**(self-referential 아님 / plugin user 진입점 / 감사-driven). **commit/tag/push** = push 직전 사용자 확인 대기. DEC-2026-06-01-readme-sync. plan `.claude/plans/plan-genuine-defects-cleanup.md`.

**session 62차 (계속) — v11.27.0 MINOR release — 외부-적합성 진짜 결함 cleanup 3종 + 회귀 가드 2종 (정직성·P0 무결성 / 새 도메인 불필요)**: v11.26.0 push 완료 후 사용자 "이제 뭐 남았나" → 정직 inventory(① 지금 가능 진짜 결함 / ② 2nd 도메인 천장 / ③ 사용자 결정) → 사용자 **"1"**(① 진짜 결함 / "사내 표준이고 외부 미공개다" 확인). 대상 = session 62차 Type 2 감사에서 교차검증된 출하 자산 defect 3종. **4원칙 ladder full**: ① Phase 1 깊은 숙지(adoption CLAUDE.md 전수 / 현 paradigm 카운트 검증 / build-plugin alias / 2 skill identity line) ② plan(`.claude/plans/plan-genuine-defects-cleanup.md`) ③ Senior 경량 review **GO_WITH_REVISE@0.86** ④ AskUserQuestion "진행 / license=UNLICENSED". ** Senior REVISE + 사실 검증(feedback_senior_fact_check_supplement)**: A(license=UNLICENSED) / B-i(identity grep + `allow-identity:` allowlist) / B-ii(adoption drift **단일파일** scope + **양성 assertion primary**) / C(drift-resistant 카운트 회피) / D(1 MINOR 26→28). ** Senior 2 claim 반증**: (1) ADOPTION-README dual-alias 우려 → build-plugin:192 = **alias 비활성**(단일 entry-point / E-2 반증) (2) "templates/{test,design,implement}/README 에 4-stage 합법 등장" → grep 결과 stale 토큰은 **adoption/CLAUDE.md 단독** = 단일파일 scope 정당. **시행(additive / breaking 0)**: ① **신원** — `skills/ticket-sync/SKILL.md:436` + `skills/_base-invoke-go-stop-gate/SKILL.md:57` `"user":"sangcl@smilegate.com"`→`"reviewer@example.com"`(R15 / 출하 skill → adopter LLM 복제 위험 / + gate-log stale `stage_out:"planning"`→`"discovery"`) ② **license** — `plugin.json` `"SEE LICENSE IN LICENSE"`(top-level LICENSE 부재=존재않는 파일 참조)→**`"UNLICENSED"`**(정직 / 사내 표준·외부 미공개=de facto all-rights-reserved / OSS 공개 결단=public-OSS carry) ③ **adoption 템플릿** — `templates/adoption/CLAUDE.md` v2.0.0-rc1/4-stage/planning-spec/gate #1~#4 (4 major 버전 stale / build-plugin alias→dist root=adopter 첫 LLM 운영 컨텍스트=P0 직격)→현 6-stage 전면 재작성(analysis→discovery→spec→plan→test→implement / gate #1~#5 / chain N=gate #N INTERNAL CONVENTION / 4 use-scenario / BE·FE 분리 / no-sim R19 Tier / stack 정책 유지 / **drift-resistant**: 브리틀 카운트 하드코딩 회피[EXT-DOC-DRIFT 교훈]·`${CLAUDE_PLUGIN_ROOT}` 경로[EXT-PATH-01]·CHANGELOG 위임) ④ **회귀 가드 release-readiness 26→28**: **check27 `shipped_identity_leak`**(출하 dir skills/agents/templates content-aware grep `smilegate\.(com|net)|sangcl` + `allow-identity:` 주석 예외) + **check28 `adoption_paradigm_drift`**(단일파일 / 양성 `gate #5`·`discovery`·`implement` primary + 음성 `planning-spec`·`4-stage`·`4단계`·`v2.0.0-rc1` secondary / `sdlc-4stage-flow` 합법 flow 미충돌). **검증(no-simulation)**: release-readiness self-test **14/14**(count 26→28 + 신규 2 id 등재 + 설명 동기화) / **discrimination 실증**(check27 planted 위반 탐지+allowlist 면제 / check28 stale 토큰 탐지[planning-spec·4-stage·v2.0.0-rc1]+`sdlc-4stage-flow` 오탐 ❌ = content-aware 입증) / skill-citation 0 stale(2 skill+adoption 편집 후) / workspace **1018** 유지 / release-readiness **28/28** / adoption CLAUDE.md 양성 토큰 present·stale 0·카운트 하드코딩 0 검증. **§8.1(정직)**: 정직성·P0 무결성 cleanup — **self-referential corrective 와 구분**(출하 자산의 외부-노출 결함 = adopter 영향 실재 / R15·P0 정합 / "우리 도구 우리가 고치기"가 아니라 출하물 결함 수정) / 회귀 가드 2종 = drift enforcement criterion(`feedback_drift_enforcement_via_release_readiness` / 양심 의존 ❌). **STOP-3 ✅**: workspace **1018** + release-readiness **28/28** + skill-citation 0 stale + version 3-way **11.27.0** + breaking 0 = MINOR. **잔여 carry**: ① README.md stale(v11.1.0 / 카운트·GHE-pinned URL / 별도 doc-sync — adoption 템플릿보다 P0 낮음) ② Type 2 외부 채택(43 장벽 미등재 / 사용자 결단) ③ public-OSS 공개(조직 결정) ④ (dep-graph) ≥2 distinct 도메인 A2 usability·FE kinds·A3 dogfood. **본 session prod 가치 = 정직성(R15 사내 신원 누출 제거)·P0 무결성(adopter 첫 LLM 운영 컨텍스트 4 major stale→현행) + 재발 차단 enforcement 2종**(self-referential 아님 / 출하물 외부-노출 결함 / 감사-driven). **commit/tag/push** = push 직전 사용자 확인 대기. DEC-2026-06-01-genuine-defects-cleanup. plan `.claude/plans/plan-genuine-defects-cleanup.md`.

**session 62차 (계속) — v11.26.0 MINOR release — dep-graph Slice 4: db-schema → DDL 앵커 (접근 C / carry ③)**: v11.25.0 push 완료 후 사용자 "계속 이어 진행" → (방금 기록한 교훈 정합: "계속 진행"=직전 dep-graph 라인 계속 / 새 축 pivot ❌) → AskUserQuestion(dep-graph 남은 carry plain: db-schema→DDL / A2 worktree[완료] / A3 dogfood) → **"DB 스키마 문서 → DDL 연결"**. **배경**: db-schema 노드가 한 번도 코드에 앵커된 적 없음(항상 na / skill 이 `code_pointers=N/A` 명시) — 스키마에 추출 DDL 경로 담는 필드 부재(단 `tables[].sources` enum 에 `"migration"` 만 기록). **4원칙 ladder full**: ① Phase 1 깊은 숙지(db-schema.schema.json 전수 + RealWorld schema.json[7 tables sources:migration] + skill analysis-db-schema-erd + synthesizer ANALYSIS_TO_CODE_POINTERS) ② plan(`.claude/plans/plan-slice4-dbschema-ddl.md`) ③ Senior 경량 review **GO_WITH_REVISE@0.82** ④ AskUserQuestion "진행 (정직 modest 버전)". ** Senior REVISE/CONCERN 채택**: REVISE-1(schema-validation 우회 사실 — feedback_senior_fact_check_supplement 로 직접 검증: inferSchemaName `$schema_origin→$schema→filename` + RealWorld schema.json `$schema*` 부재→`schema.schema.json` infer→db-schema.schema.json **미검증** → "additive vacuously safe" 정직 framing) / REVISE-2(`source_files:string[]` 유지+description 제약 / `[{path,kind}]`=carry) / ** CONCERN-D(RealWorld A2 redundant — 부풀리기 금지)**. **시행(additive / breaking 0)**: ① `db-schema.schema.json` optional top-level `source_files:string[]`(DDL/migration .sql repo-relative / required 미추가→4 poc+RealWorld 무회귀 / ERD=diagram_files.erd·live DB·ORM entity 미나열 description) ② `graph-synthesizer.js` `ANALYSIS_TO_CODE_POINTERS['db-schema']={mode:'file',prefixes:[''],accessor:(d)=>d?.source_files??[]}`(business-rules 동형 / existence-gate+CODE_FILE_EXTENSIONS(.sql)+commit_hash strict_path 재사용 / .mmd erd skip) ③ skill step4 예시+지시+greenfield 절(DDL 부재→source_files 비움→na) 갱신 / template=사람 report 라 무변경(정직). **검증(no-simulation / 실 CLI)**: graph-synthesizer **+5 test**(S4-1 source_files→strict_path / S4-2 부재→na / S4-3 commit_hash 스탬프 / S4-4 existence-gate / S4-5 .mmd 확장자 skip) → 139→144 / workspace 1013→**1018** / 0 fail / schema-validator 35/35 회귀 / release-readiness **26/26** / **additive 안전 입증**(source_files 있음·없음 둘 다 db-schema.schema.json valid). **RealWorld dogfood**(외부 repo·실 CLI / probe analysis-dir = output json 복사+schema.json 에 source_files 추가): **BEFORE**(실 output) db-schema `na=true`(cp 0) → **AFTER**(probe) `na=false` / **covered 1 strict_path** `src/main/resources/db/migration/V1__create_tables.sql` @ee17e31(commit_hash 스탬프=A2-eligible) / code-pointer-validator covered **6→7**·missing 0·analysis-db-schema findings 0. evidence=`_dogfood-realworld/.../.aimd/slice4-dbschema-ddl-probe.md`. **§8.1(정직 / Senior CONCERN-D 채택)**: ship=**메커니즘+coverage gap 해소**(db-schema 이제 DDL 앵커 가능 = antipatterns 에 DDL 증거 없는 프로젝트에선 db-schema 가 유일 DDL 앵커=일반-케이스 독립 가치) / ** RealWorld A2 가치=redundant(부풀리기 ❌)**: RealWorld 선 Slice 3 antipatterns 가 이미 같은 DDL 앵커→A2 탐지 겹침→"covered +1"을 새 A2 가치로 주장 안 함 / **독립 A2 가치=db-schema 가 antipatterns 와 다른 DDL 앵커하는 ≥2번째 distinct 도메인 carry** / read-class·additive 결정론 infra→gate-class 아님. **STOP-3 ✅**: workspace **1018** + release-readiness **26/26** + skill-citation 0 stale + version 3-way **11.26.0** + breaking 0 = MINOR. **잔여 carry**: ① `source_files` `[{path,kind}]` 분해(2nd 도메인 mixed-kind drift 입증 시 / REVISE-2 defer) ② ≥2 distinct 도메인 A2 usability(gate-class) ③ FE kinds 앵커(실 FE 프로젝트) ④ A3 relocation dogfood ⑤ committed↔uncommitted 분해(v11.25.0) ⑥ Type 2 외부-준비(43 장벽 미등재). **본 session prod 가치 = P0(LLM 운영 컨텍스트) — db-schema 노드 coverage gap 해소(한 번도 앵커 불가였던 노드가 DDL 앵커 가능)**(self-referential 아님 / 실 외부 repo·CLI / 단 RealWorld A2 가치는 정직히 redundant 표기). **commit/tag/push** = push 직전 사용자 확인 대기. DEC-2026-06-01-slice4-dbschema-ddl. plan `.claude/plans/plan-slice4-dbschema-ddl.md`.

**session 62차 — v11.25.0 MINOR release — dep-graph A2 working-tree 모드 (커밋 안 한 변경 탐지 / F-DF-A2-003 해소)**: `/clear` 후 사용자 "계속 진행" → git 검증(v11.24.0 = 커밋·태그·push 완료 / STATUS "확인 대기" stale = session-handoff drift 인지). ** 의제 탐색 우회 (정직 기록)**: 6세션 연속 단일-도메인 dep-graph §8.1 천장(≥2 distinct domain) 진단(self-referential drift 렌즈) → AskUserQuestion(prod-가치) → 사용자 "Type2 외부-준비 감사" → Phase 1 external-readiness 감사 워크플로(4차원 install/onboarding/preflight/capture fan-out + completeness critic + synth / **43 장벽** file:line / 교차검증 3건 CONFIRMED — 사내 신원 누출·LICENSE 부재·stale adoption CLAUDE.md / critic 이 INSTALL.md dead-link 오탐 자기정정) **완료**. 단 사용자 **"type2 감사가 애초에 무슨말인가"** 메타 → Type 분류(1/1.5/2) plain 설명 → 사용자 **"b"(dep-graph 이어서)** → **Type 2 감사 폐기**(레포 무변경 / 43 장벽 미등재 = carry⑥). → AskUserQuestion(dep-graph 남은 carry: db-schema→DDL / A2 worktree / A3 dogfood) → **"A2 '커밋 안 한 변경' 탐지"**(실사용 가치·겹침 없음·새 도메인 불필요). **4원칙 ladder full**: ① Phase 1 깊은 숙지(validator.js detectContentDrift/validateOnePointer/computeGateFail + cli.js opts 평탄전달 전수) ② plan(`.claude/plans/plan-a2-worktree-mode.md`) ③ 2-agent 경량 research(Phase 4+ lightweight): official-docs **5 claim VERIFIED**(`git diff <base> -- <path>`=working tree vs base superset / untracked 미포함=추적 파일만 / `--name-only` boolean) + Senior **GO_WITH_REVISE@0.82**(A superset 단일 diff v1 충분 / B kind 재사용 / C `--worktree`+`--apply-drift` 하드차단 / D `={}` 기본값 보존) ④ AskUserQuestion "진행 (이대로 구현)". **시행(additive / breaking 0)**: ① `detectContentDrift(path, hash, { gitRunner, includeWorktree=false })` — true 면 args 에서 `'HEAD'` 제거 → `git diff --name-only <base> -- <path>`=base→작업트리(커밋+staged+unstaged superset) / 반환 boolean|null 보존 ② `validateOnePointer` `opts.worktree===true`→`includeWorktree` 전달 + finding `worktree:true` 마커 / **kind=`code_pointer.content_drift` 유지**→`computeGateFail` content_drift 제외(§8.1 non-gating) 자동 상속(신규 kind=kind-필터 우회→gating 격상=§8.1 위반 / Senior REVISE-B) ③ CLI `--worktree`(→--git 자동)+usage + **`--worktree`+`--apply-drift`=exit 2 하드차단**(미커밋 WIP 를 그래프 corpus 에 영구기록→오염 방지 / Senior REVISE-C). **검증(no-simulation / 실 git·실 CLI)**: code-pointer-validator **+5 test**(worktree 탐지+worktree:true / committed 모드 미커밋-only 회귀가드 / args-shape spy(HEAD 유무) / §8.1 medium·computeGateFail 제외 / detectContentDrift boolean) → 40→45 / workspace 1008→**1013** / 0 fail / release-readiness **26/26**(#16=committed 모드 무영향) / CLI smoke(`--worktree --apply-drift` exit 2 / `--worktree` exit 0 / help). **RealWorld dogfood**(외부 repo·실 git·**read-only** / 세션57 S2 미커밋 5파일 사전 존재 / probe graph `--repo-root --commit-hash ee17e31`=HEAD / 25 strict_path 중 겹침 1=`analysis-sql-inventory→UserMapper.xml`): **committed 모드 content_drift 0**(base==HEAD 미커밋 못 봄=기존 한계) vs **worktree 모드 content_drift 1**(`UserMapper.xml`/`worktree:true`/medium)=세션57 S2 `<delete>` 미커밋 변경 탐지 입증 / worktree exit 0(non-gating)·`--apply-drift` 조합 exit 2·RW src 5 M 무변경·corpus 무오염. evidence=`_dogfood-realworld/.../.aimd/a2-worktree-probe.md`. **§8.1(정직)**: read-class·additive·opt-in·non-gating(content_drift kind 재사용 상속) → gate-class 아님 / 단일 RealWorld = uncommitted-detection **mechanism 입증**(ceiling ❌ / ≥2 distinct 도메인 A2 usability=gate-class carry 유지) / self-referential 아님(새 capability=개발 중 live drift / P0 LLM 운영 컨텍스트 live 동기화 / 실 외부 repo measurement). **STOP-3 ✅**: workspace **1013** + release-readiness **26/26** + skill-citation 0 stale + version 3-way **11.25.0** + breaking 0 = MINOR. **잔여 carry**: ① committed↔uncommitted **분해 보고**(2nd git call / v2) ② ≥2 distinct 도메인 A2 usability(gate-class) ③ db-schema→DDL 앵커(접근 C) ④ A3 relocation dogfood ⑤ FE kinds 앵커(실 FE 프로젝트) ⑥ Type 2 외부-준비(43 장벽 미등재 / 사용자 재선택 시). **본 session prod 가치 = P0(LLM 운영 컨텍스트 live 동기화) — A2 가 개발 중 미커밋 코드 변경도 탐지**(self-referential 아님 / 실 외부 repo·실 git·CLI). **commit/tag/push** = push 직전 사용자 확인 대기. DEC-2026-06-01-a2-worktree-mode. plan `.claude/plans/plan-a2-worktree-mode.md`.

**session 61차 (계속) — v11.24.0 MINOR release — Living-graph Slice 3: antipatterns code-pointer enrich + db-schema 파일명 drift fix**: v11.23.0 후 사용자 "한글로 대화하자" + "진행" → AskUserQuestion(다음 의제 prod-가치 렌즈 / self-referential drift 메타 경고 동반) → "dep-graph Slice 3" 선택 → **Phase 1 깊은 숙지로 정직 재조정**: "나머지 kind 일괄 앵커" 실 yield 작음 — formal-spec/characterization-spec/state-map/visual-manifest = **code-file 필드 없음**(na 유지 정직 / 앵커 불가) / type-spec·ui-ux·form-validation = `source_file` 보유하나 **RealWorld(BE) 부재 = speculative carry** / 실 dogfoodable = **antipatterns 뿐** → AskUserQuestion 재조정 "antipatterns 앵커 + db-schema 파일명 drift fix". **시행(additive)**: ① **antipatterns** graph-synthesizer `ANALYSIS_TO_CODE_POINTERS.antipatterns`(`evidence[].file` / business-rules 동형 / strict_path+commit_hash → **A2 schema migration·DDL 변경 탐지**) ② **db-schema 파일명 drift fix** — canonical 출력명 = `schema.json`(skill `analysis-db-schema-erd` + poc-01/02/03/14 + RealWorld)인데 builder `ANALYSIS_FILENAMES['db-schema']='db-schema.json'` 스캔 → **db-schema 노드가 어떤 그래프에도 미로드** latent 버그 → **multi-candidate** `['schema.json','db-schema.json']`(첫 존재 채택 / schema.json 우선) + cli.js scan loop string|array 정규화 + hooks-bridge `'schema.json':'db-schema'` 추가(`'db-schema.json'` 유지) = **zero-breakage**(producer 무변경). ** Senior 사실 정정**(feedback_senior_fact_check_supplement / Senior 권위≠사실 정합): 경량 Senior review GO@0.84 = "db-schema.json producer 0건→단일 rename" 전제였으나, broader grep(CHANGELOG:627 PoC#15 의도적 migration + poc-16 graph:392 `input/db-schema.json` source_path)으로 **poc-16 = db-schema.json producer** 반증 → ecosystem split(schema.json: 나머지 vs db-schema.json: poc-16) → 단일 rename(poc-16 깸) 대신 **multi-candidate 전환**. **검증(no-simulation / 실 CLI·실 git)**: graph-synthesizer **+4 test**(antipatterns derive/na/commit_hash-stamp/existence-gate) + graph-policy-bridge **+1 test**(db-schema schema.json+db-schema.json 둘 다 → db-schema) / workspace 1003→**1008** / 0 fail / release-readiness **26/26**(#16 poc-05 static read 무영향). **RealWorld dogfood**(`--repo-root <RW> --commit-hash ee17e31` / slice3-probe): analysis-antipatterns na→**covered 1 strict_path DDL**(`V1__create_tables.sql` @ee17e31 = A2 참여) + analysis-db-schema **ABSENT→present(na)**(schema.json multi-candidate 로드 / db-schema.schema 에 code-file 필드 부재 → na 정직 / Tier-1 노드 등장 = correctness) / analysis **8→9** / covered **30→31** / na 85 / missing 0 / **glob_no_match 0** / mapper·DDL path_missing 0 / Slice 3 신규 앵커 **0 new findings**(25 medium = 전부 pre-existing TC `generated-tests/`). **A2 positive demo**(antipatterns DDL 앵커 baseline=root ee946e3 / `--git`): DDL **content_drift 발화** = A2 가 schema migration 변경 탐지(Slice 3 이전 = antipatterns na = inert). medium/non-gating. evidence = `_dogfood-realworld/.../.aimd/slice3-antipatterns-dbschema-probe.md`. **§8.1**: antipatterns = read-class·additive(Slice 2 동급) + db-schema = correctness(노드 observable delta → MINOR / Senior 정합) → gate-class 아님 / 단일 RealWorld = mechanism 입증(antipatterns 1 anchor = 작음 / 과대표기 ❌). **STOP-3 ✅**: workspace **1008** + release-readiness **26/26** + skill-citation 0 stale + version 3-way **11.24.0** + breaking 0 = MINOR. **잔여 carry**: ① FE kinds(type-spec/ui-ux/form-validation source_file) 앵커 = 실 FE 프로젝트 dogfood 시(Type 2/FE-dogfood 연계) ② db-schema → DDL 앵커(schema 에 source 필드 = 접근 C) ③ formal-spec·characterization·state-map·visual-manifest = code-file 필드 부재 = **영구 na**(정직 / 앵커 대상 아님) ④ ≥2 distinct domain A2 usability(gate-class). **본 session(누적 v11.23.0+v11.24.0) prod 가치 = P0(산출물=LLM 운영 컨텍스트) living-graph 가 SQL mapper + module dir + DDL 실 production 코드 앵커 확장 + db-schema 노드 누락 correctness 복구**. **commit/tag/push** = push 직전 사용자 확인 대기. DEC-2026-06-01-slice3-antipatterns-dbschema. plan `.claude/plans/plan-slice3-antipatterns-dbschema.md`.

**session 61차 — v11.23.0 MINOR release — Living-graph Slice 2: analysis 노드 sql-inventory + architecture code-pointer enrich (carry ① C-codepointer-analysis-aspect-enrich 해소 / 그래프가 SQL mapper layer + module 디렉토리까지 실 코드 앵커 / commit `50a9d7f`+tag+push 완료)**: `/clear` 후 사용자 "계속 진행" → git 검증(v11.22.0 = 커밋·태그·푸시 완료 / origin sync) → AskUserQuestion(다음 의제 4종 / prod-가치 렌즈) → **"Living-graph Slice 2 (code-pointer enrich)"** 선택. **4원칙 ladder full**: ① Phase 1 깊은 숙지(graph-synthesizer `ANALYSIS_TO_CODE_POINTERS`/`deriveAnalysisCodePointers`/code-pointer-validator `simpleGlobMatch`·coverage/sql-inventory·architecture schema/RealWorld 실 데이터·on-disk reality 전수) ② plan(`.claude/plans/plan-slice2-codepointer-enrich.md`) ③ 3-agent research(wf_8a8aa7ef / **만장 GO** — official-docs `GO_WITH_REVISE`@0.88 + industry `GO`@0.88 + senior `GO_WITH_REVISE`@0.83 / REVISE 5종) ④ AskUserQuestion batch "둘 다 + Phase 4–5 일괄" 승인. **핵심 설계 발견(Phase 1)**: sql-inventory `mapper/X.xml`(bare) = repo-root 부재 / 실파일 `src/main/resources/mapper/X.xml`(MyBatis 표준 / resource-prefix 역산 필요) / architecture `modules[].path` = 디렉토리(확장자 無 → 현 hasCodeExtension 게이트 거부) / validator glob 분기 = `pat=glob??path` + `*` 부재 시 `existsSync(full)`(dir 도 true) → **glob 필드 부재가 dir anchor 정답**(`glob:'**/*'`는 simpleGlobMatch depth-1 한계로 glob_no_match) / commit_hash 스탬프 strict_path 한정 → glob 자동 A2 제외. **시행(접근 A 연장 / additive / schema·skill·CLI 무변경 / graph-synthesizer.js only)**: `ANALYSIS_TO_CODE_POINTERS` 를 `kind→accessor` → `kind→{mode,accessor,prefixes?}` 일반화(기존 3 kind=`file`,prefixes`['']` 명시 = byte-identical) + **sql-inventory**(`file` / prefixes `['', 'src/main/resources/', 'src/main/resources/mybatis/']` / `inventory[].mapper_xml`→resource-prefix 역산 strict_path / sentinel 확장자 자동필터 / `src/main/java/` 임베디드 scope-out) + **architecture**(`dir` / `modules[].path`→glob anchor / commit_hash 미스탬프=A2 제외) + `resolveAnchor(raw,cfg,existsFn)` 헬퍼(file=확장자게이트→prefixes 첫 존재 / dir=확장자 skip→glob / dedup 해소경로 + cap10). **흡수 REVISE 5종**: A prefix 3종+scope-out / B kind-specific prefixes 명시(전역 기본값 ❌)+회귀 test S2-9 / C validator dir-glob test / D coverage strict_path vs glob 분해 정직표기 / E LSP·IntelliJ·Maven 인용(SCIP glob 표준 ❌). **검증(no-simulation / 실 CLI·실 git)**: graph-synthesizer **+9 test** + code-pointer-validator **+1 test** / workspace 993→**1003** / 0 fail / release-readiness **26/26**(#16 poc-05 graph 4/10/0 불변 = Slice 2 무영향). **RealWorld dogfood**(`--repo-root <RW> --commit-hash ee17e31` / probe dir): analysis-sql-inventory na→**covered 10 strict_path mapper XML**(전부 `src/main/resources/mapper/` 역산 / 10/10 commit_hash 스탬프=A2 참여) + analysis-architecture na→**covered 10 glob dir**(cap 10 of 12 modules / commit_hash 미스탬프=A2 제외) / covered **28→30** / na 87→85 / missing 0 / **glob_no_match 0** / mapper·src-main path_missing 0 / Slice 2 신규 앵커 **0 new findings**(25 medium = 전부 pre-existing TC `generated-tests/`). **A2 positive demo**(sql-inventory mapper 앵커 baseline=root commit ee946e3 / `--git` / 실 114-commit history): **10 mapper XML 전부 content_drift 발화** = A2 동기화 루프가 SQL mapper layer production 변경 탐지(Slice 2 이전 = sql-inventory na = A2 inert / 불가능). medium/non-gating(v11.20.0 cap). evidence = `_dogfood-realworld/.../.aimd/slice2-codepointer-probe.md`. **§8.1**: resolver 일반화 = read-class·additive·결정론 infra(v11.22.0 동급) → gate-class 아님 / 단일 RealWorld 도메인 = mapper-prefix·dir-glob mechanism 입증(ceiling ❌) / coverage 보고 = strict_path(A2 참여) vs glob(A2 제외) 분해(REVISE-D). **STOP-3 ✅**: workspace **1003** + release-readiness **26/26** + skill-citation 0 stale + version 3-way **11.23.0** + breaking 0 = MINOR. **잔여 carry**: ① db-schema(.sql)/state-map/type-spec 등 나머지 analysis kind 앵커 = 후속 micro-slice ② 접근 C(명시 schema 필드 격상) = A 가치 입증 후 ③ ≥2 distinct domain A2 usability corroboration(gate-class / non-Spring prefix 일반화) ④ F-DF-A2-003 working-tree 모드 ⑤ A3 relocation dogfood ⑥ STATUS v11.17~19 backfill(유지). **본 session prod 가치 진전 = P0(산출물=LLM 운영 컨텍스트 / 코드 변경 추적) 운영 효용 확장 — 그래프가 SQL mapper layer + module dir 실 production 코드에 앵커 → A2 가 mapper 변경 탐지**(self-referential 아님 / 실 측정 driven / 외부 repo 실 git·CLI). **commit/tag/push** = 사용자 확인 대기. DEC-2026-06-01-slice2-codepointer-enrich. plan `.claude/plans/plan-slice2-codepointer-enrich.md`.

**session 60차 — v11.22.0 MINOR release — analysis 노드 실 src/main 앵커 derive (F-DF-ANCHOR-002 해소 / RealWorld A2 가 실 production 코드 drift 탐지 / 연계 C-codepointer-analysis-aspect-enrich 동시)**: `/clear` 후 사용자 "계속 진행해줘" → git 상태 검증(v11.21.0 = 커밋·태그·푸시 완료 / "확인 대기" stale) → AskUserQuestion(다음 의제 4종 / prod-가치 렌즈) → **"dep-graph carry ① F-DF-ANCHOR-002"** 선택. **4원칙 ladder full**: ① Phase 1 깊은 숙지(graph-synthesizer/code-pointer-validator/schemas/builder cli/RealWorld 그래프 전수) ② plan(`.claude/plans/plan-df-anchor-002-real-src-anchors.md`) ③ 3-agent research(wf_07929e3d / official-docs VERIFIED + industry Sourcegraph SCIP 선례 + Senior GO@0.80) ④ AskUserQuestion "접근 A" 승인. ** 조사로 프레이밍 정정(적극 반증)**: carry 제목 "**IMPL 노드** 실 src 앵커"가 S2(주 타깃) 현실과 어긋남 — RealWorld 에 IMPL 노드 0개(chain 이 test 까지 / S2 정상상태 = 기존 코드 특성화 = IMPL 단계 부재). 대신 **analysis 산출물이 이미 실 src/main 경로를 evidence 로 보유**(business-rules `source_evidence.file`=UserService.java / domain `evidence.file` / error-mapping `source_file`·`evidence_file`) — surface 안 됐을 뿐 → analysis 노드가 정확한 carrier = 연계 carry `C-codepointer-analysis-aspect-enrich` 본체 → **두 carry 동시 해소**. **시행(접근 A / additive / schema·skill 무변경)**: `graph-synthesizer.js` `ANALYSIS_TO_CODE_POINTERS` per-kind 명시 field allowlist(business-rules/domain/error-mapping) + `deriveAnalysisCodePointers()`(`defaultNaForIntentNodes` 直前 / hasPtr→backstop skip→covered / 추출0→na) + fragility 완화(Senior REVISE = 명시 allowlist(자동 `*.java` 재귀 ❌ persisted_to 테이블명 회피) + 확장자 화이트리스트(dir/dotted-class false-anchor 차단) + **existence-gate** `existsFn`(미존재 emit ❌ = 정직 불변식 / `mapper/` resource-prefix false path_missing 회피) + dedup + cap10) + 결정성(`synthesizeGraph({repoRoot,existsFn})` 주입 / test mock predicate / execFileSync 미주입 = v11.21 purity 정합) + builder cli `--repo-root`. commit_hash 전파 = 하류 strict_path 스탬프(v11.21.0 / A2 baseline). **검증(no-simulation / 실 CLI·실 git)**: traceability-matrix-builder 114→**126** test(+12 / per-kind derive 3 + 확장자 negative + existence-gate + dedup + cap + commit_hash + backward-compat 무회귀 + no-op + hasCodeExtension + active-gate) / workspace 981→**993** / 0 fail / release-readiness **26/26**(poc-05 graph 정적 read = #16 covered=4/na=10/missing=0 불변 = 무영향). ** RealWorld dogfood**(`--repo-root <RW> --commit-hash ee17e31`): src/main 앵커 **0→13 distinct**(UserService/User/UsersApi/ArticlesApi/DuplicatedArticleValidator/AuthorizationService/exception handlers) / coverage **21.7%→100%**(covered=28/na=87/missing=0) / false `path_missing` on src/main **0**(existence-gate) / `mapper/`(sql-inventory)·dir(architecture) = na fall-through(후속 slice). ** A2 positive demo**(temp graph / `git fetch --unshallow` 실 history / baseline=root commit `ee946e3` = "분석 후 코드 HEAD 진화" / working-tree 무변경): content_drift **14건** 실 production 파일 탐지 + `--apply-drift` → analysis 3 노드(domain/business-rules/error-mapping) `state=drift` 기록 = **Loop A 동기화 루프가 RealWorld production 코드 변경 실 탐지 end-to-end 실증**. evidence = `_dogfood-realworld/.../df-anchor-002-probe.md`. **§8.1**: derive 메커니즘 = read-class·additive·결정론 infra → gate-class 아님 / A2 content_drift = medium·non-gating(v11.20.0 cap) 유지 / 단일 RealWorld 도메인 = usability threshold 격상 ❌. **잔여 carry**: ① **C-codepointer-analysis-aspect-enrich 잔여**(sql-inventory mapper-prefix resolve + architecture dir glob + 명시 schema 필드 격상=접근 C / A 가치 입증 후) ② ≥2 distinct 도메인 A2 usability corroboration ③ F-DF-A2-003(working-tree 모드 / RealWorld uncommitted augmentation WIP 류) ④ A3 relocation dogfood ⑤ STATUS v11.17~19 backfill(유지). **본 session prod 가치 진전 = P0(산출물=LLM 운영 컨텍스트 / 코드 변경 추적) 운영 효용 — 그래프가 실 production 코드에 앵커 → A2 동기화 루프 RealWorld 실 작동**(self-referential 아님 / 실 측정 driven / 외부 repo 실 git·CLI). **commit/tag/push** = 사용자 확인 대기. DEC-2026-06-01-df-anchor-002. plan `.claude/plans/plan-df-anchor-002-real-src-anchors.md`.

**session 59차 (계속) — v11.21.0 MINOR release — dep-graph Loop A/B RealWorld dogfood + A2 commit_hash auto-stamp (F-DF-A2-001 해소 / A2 out-of-box usable)**: v11.20.0 직후 사용자 "이어서 진행" → AskUserQuestion 종료/계속 → "이어서 진행" → AskUserQuestion 다음 작업 → **"shipped dep-graph 루프 dogfood"** 선택. **dogfood(no-simulation / 실 RealWorld 그래프 `_dogfood-realworld/spring-boot-realworld-example-app` + 실 git)**: Loop B navigate `--stage spec` → 44 노드 rollup honor(backward) 표시 **✅ 작동·유용** / Loop A/A1 freshness → `graph.stale` 발화(discovery-spec mtime>synth) **✅ 작동·유의미** / Loop A/A2 content-drift → positive demo(validator.js+commit_hash=decd28d `--git`) content_drift 발화로 **메커니즘 정상** 입증, 단 실 그래프 0건(25 pointer 전부 commit_hash 부재) = **F-DF-A2-001**. ** 적극 반증·정정**: "synthesizer 가 commit_hash 안 stamp" 초기 inference 를 source-grep 으로 정정(`:214/:562` 조건부 stamp 존재 / 정확한 갭=현 HEAD auto-derive 부재). → AskUserQuestion "fix 1: commit_hash auto-stamp" → **4원칙**(plan-dep-graph-loop-dogfood.md + 경량 research: \_base-official-docs-checker 공식 git/Node docs 검증 + \_base-senior-engineer GO@0.85 / Case 생략 = feedback_lightweight_sub_agent). **시행(read-class·결정론·additive)**: ① `graph-synthesizer.js:560` strict_path pointer 에 commit_hash 스탬프(uniform synth-HEAD / SLSA provenance 동형 / per-file last-touch 는 false-drift 위험으로 반증 / `!ptr.commit_hash` 상류 :214 보존 / glob·ast_symbol·doc_link 제외) ② `builder cli.js` `git rev-parse HEAD` auto-derive(`--commit-hash` 미지정 시 / makeGitRunner 패턴 inline=cross-package import 회피 / derive-cli·stamp-synthesizer 분리=순수 모듈 결정성 보존) ③ +4 test(stamp/backward-compat/anchor-restriction/no-overwrite). **검증(no-simulation)**: builder 110→114 + **CLI 실 smoke**(`--graph` --commit-hash 미지정 → auto-derive HEAD 776dc00 40char → pointer.commit_hash 스탬프 확인) + A2 positive demo 발화. → **F-DF-A2-001 RESOLVED**(A2 out-of-box usable). **§8.1**: read-class infra(HEAD stamp)=gate-class 아님 / A2 severity non-gating(v11.20.0 cap) 유지 / dogfood 단일 RealWorld 도메인 = "A2 가 실 프로젝트 유용 drift 잡는다" usability inflate ❌(gate-class 격상 시 ≥2 distinct 도메인). **STOP-3 ✅**: workspace 977→**981(+4)** + release-readiness **26/26** + skill-citation 0 stale + version 3-way **11.21.0** + breaking 0 = MINOR. **잔여 carry**: ① F-DF-ANCHOR-002(IMPL 노드 실 src/main 앵커 / RealWorld A2 가 실 코드 변경 보려면 / C-codepointer-analysis-aspect-enrich 연계 / 큰 작업) ② F-DF-A2-003(A2 working-tree 모드 / uncommitted 탐지 / opt-in) ③ A3 relocation dogfood 미실측 ④ STATUS v11.17~19 backfill(유지). **본 session prod 가치 진전 = P0("쓰게 하라") dogfood 검증 + A2 sync 루프 실사용 가능화**(self-referential 아님 / 실 측정 driven). **commit/tag/push** = 사용자 확인 대기. DEC-2026-06-01-dep-graph-loop-dogfood-a2-stamp. plan `.claude/plans/plan-dep-graph-loop-dogfood.md`.

**session 59차 — v11.20.0 MINOR release — Living dep-graph 두 루프(Loop A 동기화 + Loop B 소비) v1 + A2 §8.1 hardening (P0 양방향 역동기화 운영 배선 / plan→DEC 격상)**: 사용자 "plan-living-dep-graph 이어서" → `plan-living-dep-graph.md` §8 (사용자 결정 대기) 도달 확인. **직전 5 commit (b8c9d74 Loop A v1 / f14d727 A2-wire / 4b9e08b Loop B consult / 65d1346 F3 / 4c3b10b F4) = main push 됐으나 미released**(version bump·DEC·CHANGELOG·STATUS 부재) 발견. **검증 workflow** (`wf_2a79ea7a` / 3 verifier + 2 adversarial skeptic / F-015 cross-validation + 메인 독립 read): 두 루프 sound·additive·test-backed / **§8.1 active 위반 0** (skeptic 2종 — applyContentDrift active→drift 가 gate-class 인가 + breaking 인가 — 반증 실패: `drift` 는 모든 gating consumer 에서 state-neutral / gate-eval 은 node.state 미read) / breaking 0 / **MINOR-eligible** 확정. ** 검증 발견 (medium)**: content_drift severity `opts.strict?'high':'medium'` → `--git --strict` 시 high→exit1 = latent 단일 도메인 hard-gate (plan "비-gating(medium)" 주장과 모순 / --strict 가 medium 도 gate 하므로 cap 만으론 불충분). → **AskUserQuestion 3종 batch 모두 "추천"**: ① **Release v11.20.0 MINOR** ② **A2 cap/decouple** ③ **잔여 후보 전부 defer**. **시행 (A2 fix / additive·breaking 0)**: validator.js content_drift = medium 고정 + 신규 export `computeGateFail(findings,{strict})` 가 content_drift 를 gate(fail) 계산에서 제외 (보고만 / 가시성 유지) + cli.js fail·status 사용 + usage 문구 정합 + anti-regression test 3종(35→39). **실측 (no-simulation)**: poc-05 `--git --strict` → 5 MEDIUM content_drift / **PASS exit 0** (BEFORE = 5 HIGH exit 1 / decouple 입증). `--apply-drift` 미실행 → poc-05 fixture clean. **shipped (전부 결정론·read-class·opt-in)**: Loop A (A1 freshness `checkGraphFreshness` display-only / A2 content-drift `detectContentDrift`+`applyContentDrift` `--git` / A2-wire `--apply-drift` live write·자동 caller 0 / A3 relocation `findRelocation` git rename→`suggested_path` 제안만·날조 ❌) + Loop B (5 agent consult stage 진입 navigate AI 추론 0% verbatim·skills[] 무변경 / F3 `--stage/--scope` rollup / F4 방향 프리셋+`--direction`). **DEFER (gate-class / §8.1 ≥2 distinct 도메인)**: A4(ts-morph/JaCoCo env) · A5(edge propose-state breaking schema) · B2-full(SessionStart hook 무거움) · B5(go/stop gate 유일 gate-class) · contract/coverage gate. **STOP-3 ✅**: workspace 973→**977(+4)** + release-readiness **26/26** + skill-citation 0 stale + version 3-way **11.20.0** + breaking 0 = MINOR. ** STATUS catch-up 인지 (정직)**: 본 entry 직전 STATUS 최상단 = session 58/v11.16.0 → **v11.17.0·v11.18.0·v11.19.0 = STATUS entry 부재** (CHANGELOG/INDEX/DEC 에는 존재 / 배포 6단계 점검 = check24/25/26 신설 + carry-queue 6종 종결). session-handoff drift (`feedback_session_handoff_drift`) 인지 — backfill 은 후순위 carry. **잔여 carry**: ① gate-class 진입=2nd distinct domain corroboration (능동 착수 ❌) ② `--apply-drift` stale-fixture(poc-05) 수동 실행 변조 watch (hook 배선 시 corpus 보호) ③ A4/A5/B2-full 별 plan+research ④ STATUS v11.17~19 backfill. **본 session prod 가치 진전 = P0(산출물=LLM 운영 컨텍스트 양방향 역동기화) 운영 배선 v1** (self-referential 아님 / 실 git·CLI·그래프 measurement). **commit/tag/push** = 사용자 확인 대기. DEC-2026-06-01-living-dep-graph-loops. plan `.claude/plans/plan-living-dep-graph.md`.

**session 58차 — v11.16.0 MINOR release — 잔여 actionable carry sweep 3종 (db-assets-validator 신설 + domain stakeholders + chain-coverage strict default)**: 사용자 `잔여 작업 남은거 있나?` → **91-item carry audit (workflow / 5 소스 fan-out STATUS·CLAUDE·taxonomy·plans·DEC+findings → 91 dedup → repo 실상 교차검증 → 분류)** → 실 prod-가치 actionable 4종(나머지 ~20 carry = 차단/standing/이미해소). 우선순위 진행 결단 → **batch 질문 3종(P1 gate 위치 / P2 범위 / P3 mandatory) 모두 "추천"** → understand workflow(4 deep reader) 정밀 숙지 후 시행. **P1 (C-db-autoval / F-DB-AUTOVAL-001 ✅)**: `tools/db-assets-validator`(25번째) 신설 — work-unit-manifest `analysis_refs` DB 자산 4 필드 검사 / finding 6종(sp_missing_id·sp_invalid_class·sp_unclassified_at_plan=critical / external_class_mismatch=high / gamma_external_unset·db_assets_absent=medium) / plan 이후 hard-gate(discovery nullable) / γ↔external / greenfield 면제 / **결정론 axis** / release-readiness **#23** golden fixture 판별(content-aware / poc-17 외부 격리라 discrimination 입증) + standalone / 17 test. **P2 보류**: code_pointers enrich = live PoC 없이 semantics 모호(HIGH 과적합) + na backstop 이미 100% → §8.1 보류. **P3 (C-domain-schema-stakeholders ✅)**: domain.schema `stakeholders`+`business_intent_summary` **optional/additive**(required=PoC 11종 breaking 회피 / mandatory=skill-layer 해석 / intent_certainty 선례) + skill 본문 강제 + template 절 + discovery-extraction-validator WARN(low / +4 test) / backward-compat 실측(에러 집합 동일). **P4 (F-SIM-003 ✅)**: chain-coverage broken-path strict 기본 flip + `--warn-paths` escape hatch / 보류 근거 소멸(autoDetect v9.0.4 + cooling-off 폐기 v10.0.0 + 5 PoC sweep v9.0.5) / **poc-05 무회귀 실측**(strict_mode true·broken_path 0·exit 0) / +3 CLI test. **STOP-3 ✅**: workspace 879→**903(+24)** + release-readiness 22→**23/23**(check23) + test:release 14/14(self-test 22→23) + skill-citation 0 stale + version 3-way 11.16.0 + breaking 0 = MINOR. **잔여 carry**: P2 `C-codepointer-analysis-aspect-enrich`(보류/live PoC) + `C-db-autoval-corpus-extension`(db-asset manifest 커밋 시 corpus scan) + README v11.1.0 stale(별도). **commit/tag/push** = 사용자 확인 대기. DEC-2026-05-31-db-assets-validator + DEC-2026-05-31-domain-stakeholders + DEC-2026-05-31-fsim003-strict-default.

**session 57차 — v11.14.0 MINOR release — S2(AX전환 / 주 타깃) gate augmentation arm RED→GREEN round-trip (carry ② RESOLVED / P4 양방향 역동기화 첫 end-to-end 실측)**: `/clear` 후 사용자 "다음 작업 시작해줘" → untracked `plan-tooling-refactor-audit.md`(별도 multi-agent audit 산출 / 리포트 only) 확인 + check21 죽은 게이트 독립 재검증(regex NULL 확인) → audit 후속 vs prod 가치 carry **AskUserQuestion** → **"리팩토링 보류 — prod 가치 carry"** 선택 (audit plan 보존) → feasibility triage (carry ① WARN→block 격상 = poc-16 efiweb-car **.java source 0개**(사내 미커밋) + RealWorld 동일 blog 도메인 → **환경 차단 carry 유지** / carry ② augmentation GREEN = RealWorld repo + AccountDeletionAugTest + UsersApi + JDK 11 모두 present → **완전 실행 가능**) → carry ② 추천 + plan(`.claude/plans/plan-s2-augmentation-green.md`) 제시 → "진행". **핵심 통찰**: gate `reconcileOutcomes` 는 `actual === expected_outcome` 비교 → augmentation impl 추가로 actual=pass 가 되면 expected=fail(stale)과 mismatch → `s2_outcome_mismatch` WARN 발화 = **P4 역동기화 신호**. **impl (RealWorld 5-file 수직 슬라이스 / hexagonal / 외부 dogfood repo / 본 repo 미커밋)**: `core/user/UserRepository.remove` + `infrastructure/repository/MyBatisUserRepository.remove` + `mybatis/mapper/UserMapper.delete` + `mapper/UserMapper.xml <delete>` + `api/CurrentUserApi @DeleteMapping`(`@AuthenticationPrincipal`→`userRepository.remove`→204). 리스크 사전 해소(Security `authenticated()`+token / FK 신규user 관계0+sqlite test FK 비강제 / production cascade scope-out=known-limitation). **실측(`gradlew test --tests io.spring.api_gen.*` / JDK 11+Gradle 7.4 / no-simulation)**: **26 PASS / 0 FAIL** (직전 25+1 / AccountDeletionAugTest TC-USER-007 = PASS / JUnit XML 물증). ** round-trip 3 상태(`.aimd/s2-roundtrip-probe.mjs` 신규 / 동일 실 XML 에 expected_outcome 만 대조 / 실 methodology 모듈)**: ① impl 부재 fail=fail mismatch0 go-eligible / ② **재동기화 전(BEFORE)** expected=fail(stale) actual=pass **mismatch1 → primary=`s2_outcome_mismatch` → WARN(drift 감지: impl>spec)** / ③ **재동기화 후(AFTER / expected fail→pass)** mismatch0 → blocked=false go-eligible(해소 / characterization-grade 승격). probe exit 0 + 재동기화된 `s2-exec-harness.mjs` exit 0. **methodology 보강(additive/breaking 0)**: ① `skills/test-generate-test-spec/SKILL.md` step3 "S2 augmentation 재동기화" instruction(augmentation TC = expected fail 생성 → impl 후 fail→pass 재동기화 의무 + 누락 시 gate s2_outcome_mismatch WARN drift 신호) ② `methodology-spec/use-scenario-taxonomy.md` §5 carry ② RESOLVED ③ 외부 evidence `s2-gate-probe.md §7` + s2-roundtrip-probe.mjs(신규) + s2-exec-harness.mjs 재동기화. ** gate-eval.js / s2-outcome-check.js 코드 = 이미 올바로 작동 → 무변경** (carry ② = 실 dogfood 실증 + 문서화 / methodology 코드 무변경). **§8.1 평가(정직)**: augmentation **mechanism**(RED→GREEN + 역동기화 round-trip) 실증 = 단일 blog 도메인 / WARN→**block** 격상(carry ①)은 여전히 ≥2 **distinct domain** 필요 → 별 carry 유지(speculative hardening 회피 / cooling-off 폐기·§8.1 strict·self-referential drift 회피 paradigm 정합). round-trip 문서화 = `reconcileOutcomes` 기계적 귀결(expected vs actual) 실측 입증 = ceiling 주장 아님 → 1 execution 으로 workflow 문서화 충분. **STOP-3 ✅**: workspace 875/875(methodology 코드 무변경 영향 0) + release-readiness 22/22 + skill-citation 0 stale + version 3-way 11.14.0 + breaking 0 = MINOR. **잔여 carry**: ① C-use-scenario-s2-gate WARN→block 격상(2nd distinct domain S2 execution / poc-16 사내 source 부재→타 distinct OSS Spring 또는 source 확보 의존) ② (선택) TC-USER-007 canonical test-spec(s2-reframe.json) 정식 등재 + AC/BHV traceability + audit plan(`plan-tooling-refactor-audit.md`) 후속(보류 중). **본 session prod 가치 진전 = 방법론 핵심 가치 P4(양방향 역동기화) 첫 end-to-end 실측 + 최초 문서화**(self-referential 아님 / 실 OSS impl+execution+gate drift-detection 음성/양성 대조). **commit/tag/push** = 사용자 확인 대기. DEC-2026-05-30-s2-augmentation-green-roundtrip.

**session 56차 (계속) — v11.13.1 PATCH release — no-simulation 절 정직성 cleanup (CLAUDE.md R19 Tier 정합 / C-honesty-tool-cleanup 종결)**: v11.13.0 후 사용자 "다음 작업" → carry queue 정직 평가(S2 격상=2nd distinct domain 필요·무거움 / greenfield / no-simulation cleanup) → AskUserQuestion "no-simulation 정직성 cleanup" → 접근 fork "R19 Tier-honest reframe"(이름 유지·plugin 미실행 명시). **배경**: CLAUDE.md "Static Tool 시뮬레이션 절대 금지" 절이 R19(DEC-2026-05-18) 이전 flat 표현으로 6개 도구(Semgrep/PMD/SpotBugs/Daikon/CodeQL/SonarQube)를 모두 "실제 실행 의무"로 나열 — SpotBugs·Daikon·CodeQL·SonarQube 는 본 환경 실 실행 이력 없음(사용자 "쓰지도 못하는데 왜 자꾸 써있냐" / 이번 session preflight semgrep·pmd·spotbugs absent 재확인). **시행(CLAUDE.md only / breaking 0)**: 해당 절을 R19 3-Tier 로 reframe — ❌ Tier 3(simulated 영구 reject+-5%p) / ✅ Tier 1(in-plugin 실 실행: Semgrep/ESLint/Spectral/axe-core·Playwright/테스트 stack runner Gradle·JUnit·vitest = 실 실행 입증 채널) / ✅ Tier 2(사용자 환경 SARIF import / plugin 자동 실행 ❌: PMD/SpotBugs/CodeQL/Daikon/SonarQube / PMD=poc-17 사용자 환경 실 실행·나머지 4=본 환경 실 실행 이력 없음 정직 인지 / 부재=carry 날조 ❌). **scope 정직**: 활성 doc 중 flat-framing=CLAUDE.md 유일(agents/methodology-spec/ADR-009·010/charter R15·R19/skills/static-runner 는 이미 R19 Tier framing=정직) + R19 Tier 2 분류·`IMPORTED_DRIVER_ALLOWLIST=[pmd,spotbugs,codeql,daikon]`=schema-enforced 정식 기능이라 이름 literal 삭제 ❌(reframe=정직 해소+R19 보존) + archive/dist-history·decisions·HISTORY 동결 무변경. **STOP-3 ✅**: workspace 875/875(영향 0 / doc-only) + release-readiness 22/22 + skill-citation 0 stale + version 3-way 11.13.1 + breaking 0 = PATCH. **carry `C-honesty-tool-cleanup` ✅ 종결**. **commit/tag/push** = 사용자 확인 대기. DEC-2026-05-30-honesty-tool-cleanup.

**session 56차 (계속) — v11.13.0 MINOR release — S2(AX전환 / 주 타깃) gate 2차 execution corroboration (RealWorld 실 구동 / RISK-ENV-001 해소)**: v11.12.0 후 사용자 "어떻게 진행" → carry queue 정직 평가 → AskUserQuestion "① S2 gate 2차 (Java 설치 후)" → "진행해줘". **핵심 = Track α(v11.11.0) 1차의 characterization GREEN "구조적 추론"을 실측으로 입증** (no-simulation). **환경 확보(admin-free)**: Temurin JDK 11.0.31 zip + Gradle 7.4 + Spring Boot 2.6.3 + sqlite::memory:(test profile) / `gradlew compileTestJava` BUILD SUCCESSFUL → RISK-ENV-001(RealWorld arm) 해소. **통합(결정적 변환 `.aimd/transform-gen-tests.mjs`)**: 생성 characterization test 6파일 → RealWorld test sourceSet (package `io.spring.api_gen` 충돌회피 / `@ActiveProfiles("test")` DB격리 / @DisplayName TC-id prefix 상관) + augmentation `AccountDeletionAugTest`(TC-USER-007 / `DELETE /user` 미구현 / expected_outcome=fail). **실측(`gradlew test --tests io.spring.api_gen.*`)**: **26 testcases = 25 PASS(characterization) + 1 FAIL(augmentation)** (JUnit XML 물증). **gate 파이프라인(`.aimd/s2-exec-harness.mjs` / 실 methodology 모듈)**: correlateByTcId 26/26 missing_actual=0 → reconcileOutcomes **outcome_mismatches=0** → evaluateGate('test',·,'S2') = **blocked=false / go-eligible** / augmentation expected=fail↔actual=fail match / **음성대조**(char TC-USER-001 회귀 가정→fail) outcome_mismatches=1 → primary=`s2_outcome_mismatch` → user 'go' → `go-with-warnings`(rank 2 WARN) = 회귀 탐지 입증. **methodology 보강(additive/breaking 0)**: dogfood 발견 — JUnit5+Gradle XML `name`=@DisplayName(메서드명 아님)+Java 메서드명 하이픈 불가 → ① `correlateByTcId` 정규화(`normalizeForMatch` 대문자화+비영숫자제거 / 하이픈 displayName↔언더스코어 메서드명 양쪽 / +2 test 40→42) ② `test-generate-test-spec` skill "TC-id-in-name 규약"(@DisplayName 권장 + @ActiveProfiles). **§8.1 평가(정직)**: RealWorld arm = execution-grade 도달이나 §8.1 ≥2 **distinct domain** 미충족(RealWorld 단일 도메인 / structural+execution 양 grade) → gate enforcement **WARN 유지** / **WARN→block 격상 = 2nd distinct domain(poc-17 사내 Java / 타 OSS Spring) 후 별 release** (speculative hardening 회피 / cooling-off 폐기·§8.1 strict·self-referential drift 회피 paradigm 정합). **STOP-3 ✅**: workspace 873→**875(+2)** + release-readiness 22/22 + skill-citation 0 stale + version 3-way 11.13.0 + breaking 0 = MINOR. **잔여 carry**: ① C-use-scenario-s2-gate 격상(2nd distinct domain S2 execution) ② augmentation impl 후 GREEN 격상(TC-USER-007). **dogfood 산출(외부 RealWorld repo / 본 repo 미커밋)**: `.aimd/transform-gen-tests.mjs` + `.aimd/s2-exec-harness.mjs` + `src/test/java/io/spring/api_gen/*` + `s2-gate-probe.md §6`. **commit/tag/push** = 사용자 확인 대기. DEC-2026-05-30-s2-exec-corroboration.

**session 56차 — v11.12.0 MINOR release — dep-graph 의도 노드 code_pointers_na 기본 backstop (F-DOGFOOD-009 / carry queue ⑤ 해소)**: `/clear` 후 사용자 "다음 작업 진행하자" → carry queue 정직 평가 (①S2 gate=runnable Java 부재 환경 차단 / ②greenfield 2nd 채널=figma desktop 의존 / ⑤ **F-DOGFOOD-009 code_pointers intent-na = 즉시 시행 가능·dogfood-driven·plan 확정·미시행**) → AskUserQuestion "⑤ code_pointers 패치" → 실 변경 대상 코드 전수 숙지(synthesizer/validator/4 schema/4 template/4 skill) → schema 사전 검증(discovery/acceptance/task-plan schema 가 이미 item-level code_pointers_na 정의 = Layer 2 additive 확정) → Senior 설계 리뷰 **REVISE @82%** ( 배치 버그 발견 = carry-over deprecated 재추가 loop 이 L517-525 안 → backstop 을 L536 에 두면 carried-over deprecated intent 노드 payload silent 변조 → `state==='active'` 게이트 수정 / synthesizeGraph 내 drift state 부재 검증 → active-only 정확) → AskUserQuestion "전체 진행" → 시행 + release. **시행 (additive / breaking 0)**: ① **Layer 1** `graph-synthesizer.js` `defaultNaForIntentNodes(nodes)` 정규화 패스(`state==='active'` + kind∈{chain,analysis,aspect} + subkind∉{IMPL,TC} + 포인터 없음 → na=true / IMPL/TC 무source→missing 유지 anti-regression / groups prune 뒤 1회 호출) ② **Layer 2** template 4종(behavior-spec na:false→true + discovery use_cases/acceptance criteria 3/task-plan tasks 3 item 추가) ③ **Layer 3** skill 4종 1줄(UC/BHV/AC=의도→na 기본 / TASK=na 기본+코드range 알면 override) ④ **+5 test** (builder 105→110 / ⑤번 = carried-over deprecated na 미stamp 회귀 anchor). ** §8.1 1차 corroboration (RealWorld / Type 1.5 external repo / no-simulation)**: 실 production 경로(builder CLI → patched synthesizer → code-pointer-validator CLI) 재합성 실측 — **BEFORE** covered=25/na=0/missing=90/**21.7%** → **AFTER** covered=25/**na=90/missing=0/100%** (node parity 115=115 / na_conflict=0 / coverage_missing=0 / TC 25 covered 유지). release-readiness #16=정적 poc-05 corpus read 라 무영향(무회귀) → 패치 가치 = 신규/외부 프로젝트가 hand-backfill 없이 coverage 확보. **STOP-3 ✅**: workspace 868→**873(+5)** + release-readiness **22/22** + skill-citation 252 doc 0 stale + version 3-way 11.12.0 + build drift 0 + breaking 0 = MINOR. **잔여 carry (별 cycle)**: C-codepointer-analysis-aspect-enrich (analysis/aspect code_pointers 본격 enrich / Layer 1 backstop na 가 가린 부분 / analysis skill 大 변경) + §8.1 2차 corroboration (RealWorld 외 1 PoC 재합성). **paradigm 정합**: dogfood-first(실 21.7% 입증 / 추측 hard-lock ❌) + [[feedback_self_referential_corrective_drift]] 회피(real dogfood finding 해결 = self-referential 아님) + Senior 사실검증 보강(state 게이트 버그 코드 라인 검증 후 흡수). DEC-2026-05-30-code-pointers-intent-na-backstop. **commit/tag/push** = 사용자 확인 대기.

**session 55차 누적 — v11.6.0 ~ v11.11.0 (7 release) + 현 잔여 carry queue (2026-05-30)**: session 54차(v11.5.1) 이후 RealWorld OSS dogfood + use-scenario taxonomy 형식화·구현 + codegraph 필수화 + S2 gate cascade. **release 7종** (역순): (0) **v11.11.0 MINOR** — use-scenario S2(AX전환) gate (C-use-scenario-s2-gate Track α) — 주 타깃 S2 가 Slice 1 `S2=S1 fallback(all_fail)` 공백 → legacy in-place 증강 characterization(GREEN)까지 RED 오탐 block(F-DOGFOOD-007 재현) → gate **per_tc_outcome 분기** 구현. schema `test_intent` enum optional + `SCENARIO_EXPECTED.S2='per_tc_outcome'`(s2_outcome_mismatch rank 2 WARN / S1·greenfield·S3 무변경) + 신규 `s2-outcome-check.js`(reconcileOutcomes+correlateByTcId) + 15 test. **§8.1 ≥2 corroboration = 1/2 → WARN**: 1차 = RealWorld(brownfield) 25 TC characterization reframe schema-valid + real gate S1 false-block→S2 해소 실증(s2-gate-probe.md / F-DOGFOOD-012) / 2차(execution GREEN)=Java 부재 RISK-ENV-001 carry + augmentation arm carry / DEC-2026-05-30-s2-gate-slice. (1) **v11.10.1 PATCH** — drift-validator phase-flow false-positive 정리 (CRLF 주석 누출 + 횡단 메타 노드 NON_DELIVERABLE_META 제외 + orphaned test wiring / workspace 847→853 / DEC-2026-05-30-phase-flow-drift-false-positive). (2) **v11.10.0 MINOR** — greenfield 산출물 bootstrap (C-use-scenario-taxonomy-impl **Slice 2**) — 신규 도구 `greenfield-bootstrap`(24번째 / swagger→openapi.yaml 결정적 elevation + legacy-only 산출물 N/A / 29 test) + 5 analysis skill greenfield code-optional mode + skill `analysis-greenfield-bootstrap`(57번째) / RealWorld swagger dogfood valid:true / workspace 818→847 / DEC-2026-05-30-use-scenario-greenfield-bootstrap-slice2. (3) **v11.9.0 MINOR** — use-scenario 선언 plumbing + scenario-aware gate matrix (**Slice 1**) — `work-unit-manifest.scenario` enum(S1/S2/S3/greenfield) + `chain-driver init --scenario` + `gate-eval` SCENARIO_EXPECTED 매트릭스 (S1/greenfield=forward RED→GREEN / S3=snapshot / **S2=S1 fallback+carry**) / workspace 804→818 / DEC-2026-05-30-use-scenario-impl-slice1. (4) **v11.8.0 MINOR** — codegraph-runner 신설 (C-codegraph-essential-impl **Slice 1**) — 23번째 도구 `codegraph index`+`status --json`→code-graph.json reference-lens (gate inject ❌) / 환경 부재 exit 3 no-simulation / 9 test / DEC-2026-05-30-codegraph-essential-impl-slice1. (5) **v11.7.0 MINOR** — use-scenario taxonomy + AX 운영 정체성 형식화 + codegraph 필수화 (형식화 문서만) — 가장 큰 목적(P0) = 산출물(=LLM 운영 컨텍스트)을 평생 유지·동기화하여 AX 운영 / 4 시나리오( S2 AX전환=주 타깃 / S1 재생성 / S3 특성화 / greenfield) 모두 AX 운영 수렴 / DEC-2026-05-27 codegraph scope-out 게이트 폐기(Semgrep 동급 무조건 실행) / DEC-2026-05-30-use-scenario-taxonomy + DEC-2026-05-30-codegraph-essential. (6) **v11.6.0 MINOR** — discovery `intent_certainty` enum (F-DOGFOOD-003 MyBatis+JPA arm ≥2 corroboration / Option B 잠금 해제) — schema business_rules_intent.intent_certainty enum(observed/inferred-consequence/unverified-intent/source-refuted) optional + discovery-extraction-validator WARN(test 9→13) / DEC-2026-05-30-fdogfood-003-intent-certainty.

** 현 잔여 carry queue (다음 의제 우선순위 순)**:

- **① C-use-scenario-s2-gate** — ✅ **부분 시행 (v11.11.0 / Track α)** = per_tc_outcome gate + test_intent enum + reconcileOutcomes 모듈 + 1차 corroboration(RealWorld reframe). **잔여 = WARN→block 격상**: ② execution corroboration 2차(Java 부재 RISK-ENV-001 → runnable S2 환경 = poc-17 사내 Java 또는 RealWorld CI) ③ augmentation arm 실증.
- ② C-use-scenario-greenfield-dogfood-2nd-channel — greenfield bootstrap figma·PRD 2nd 채널 (현 swagger 1채널만 dogfood / §8.1 ≥2 채널).
- ③ C-use-scenario-greenfield-schema-synthesis — greenfield schema 합성.
- ④ C-codegraph-federation (Slice 2) — navigate 증강 + code-pointer staleness + cross-domain finding + MCP serve (§8.1 후).
- ⑤ **F-DOGFOOD-009 / code_pointers 의도 노드 na 기본 backstop** — ✅ **해소 (v11.12.0 / session 56차)**. 3-layer 패치(builder backstop + template 4 + skill 4) 시행 / RealWorld dogfood 재합성 실측 coverage 21.7%→**100%** / §8.1 1차 corroboration(no-simulation). 잔여 carry: C-codepointer-analysis-aspect-enrich (analysis/aspect code_pointers enrich) + §8.1 2차 corroboration. DEC-2026-05-30-code-pointers-intent-na-backstop.
- standing (Type 2 외부 사용자 자연 trigger 의무 / 능동 착수 ❌) — C-schema-regex-paradigm-completion + C-other-analysis-skills-strict-cascade + C-other-id-patterns-strict.

**위생 처리 (본 session 55차)**: stale plan 3종 삭제 (plan-fdogfood-003-007-patch-unlock + plan/research-fdogfood-003-intent-attribution — 모두 v11.6.0 종결·v11.7.0 reframe / 결론은 release+findings doc 보존) + 본 STATUS entry 최신화 (session 54→55 / v11.6.0~v11.10.1 미반영분 흡수). **잔여 위생 후보** (별 결단 / 미처리): tracked released dev-log plan (plan-validator-dual-key-fix=v11.5.1 / plan-realworld-jpa-2nd-arm=v11.6.0 / plan-realworld-dogfood-state / plan-poc17-\* 5종 + analysis-revisit) 정리 여부 + CLAUDE.md no-simulation 절 정직성 cleanup (실행 불가 도구 SpotBugs/Daikon 인용 제거 / memory `feedback_no_unrunnable_tool_citation`) + origin-smilegate(GHE) greenfield slice2 push 보류 확인.

---

## v9.0.0~v11.5.1 archive (2026-06-03 cleanup — session 41차~54차 / STATUS bloat @ v12.6.0)

**session 54차 — v11.5.1 PATCH release — discovery-extraction-validator multi-path BR lookup (paradigm-level resilience / paradigm A 본격 강화 self-입증 사례 / C-validator-dual-key-businessrules carry 종결)**: session 53차 (analysis revisit axis 1+2 외부 시행 / LL-poc-17-11~15 자산화 / axis 3 cosmetic→structural narrative 발견 / chain 1 forward 자격 NOT MET 보고) 종결 후 사용자 결단 chain — "validator 고치자" → 4원칙 ladder 진입 (plan `.claude/plans/plan-validator-dual-key-fix.md`). **Phase 1 시행** (validator src + test 보강 / additive only): `tools/discovery-extraction-validator/src/validator.js` BR lookup 다중 경로 (`analysis?.rules?.business_rules` / `analysis?.business_rules` / `analysis?.rules` / `analysis?.rules_step_4c_carcost` 4 candidates) + test 4 신규 (top-level business_rules / top-level rules suffix 없음 / dual key rules_step_4c_carcost / 회귀 차단). ** Phase 2 외부 PoC 실측 시점 본격 사실 정정 발견 **: pre-fix (stash) 도 0 findings (GREEN) — 사용자 chain 1 진입 직전 normalize 우회 (통합 array `business_rules` 56 BR + `-001` suffix) 로 chain 1 forward 자격 이미 충족 상태. session 53차 LL-poc-17-15 본문 "Phase 3 validator 실행 결과 = 12 CRITICAL" + chain-intervention-log root_cause "validator 는 rules array 만 lookup" = 실제 validator 코드 (`rules.business_rules` 를 봄) 와 mismatch / self-기록 사실 검증 부족 cycle 본격 본격 사례. ** paradigm A 본격 강화 axis 본격 자연 ** (사용자 결단 plan §5 결단 2 "조건부 retract" → Phase 2 실측 후 본격 정정 = paradigm A retract 자격 자연 ❌ / paradigm A 본격 가치 self-입증 axis 본격 자연 — paradigm A 가 본격 막으려던 self-합리화 narrative 의 본격 본격 자기-차단 사례). **본 fix 실제 가치** = paradigm-level resilience 추가 (test 4 신규 / 미래 PoC dual-key + suffix 일관 paradigm 산출 시 자연 인식 / 외부 normalize 우회 불필요 / 본 PoC 영향 0). **시행**: ① src 4 candidate path lookup ② test 4 신규 ③ 외부 PoC 실측 (post-fix 0 findings + pre-fix 동일 0 findings) ④ 3-way version sync 11.5.0 → 11.5.1 ⑤ CHANGELOG entry + DEC-2026-05-29-validator-multi-path-br-lookup 신설 + INDEX append ⑥ release ceremony. **STOP-3 ✅**: workspace test **787 → 791 (+4) pass** + release-readiness 22/22 보존 + skill-citation 0 stale + version 3-way 11.5.1 + breaking 0 = PATCH. **3 LL 자산화** (LL-validator-dual-key-01~03 / plan §8): LL-validator-dual-key-01 ( paradigm A 본격 가치 self-입증 사례 / self-기록 narrative 검증 본격 의무 paradigm) + LL-validator-dual-key-02 (validator path 가정 결함 paradigm-level resilience 가치 / 외부 normalize 우회 = paradigm-level resilience 부재 신호 / fix 후 우회 폐기 자격) + LL-validator-dual-key-03 (self-기록 사실 검증 부족 cycle 자기-차단 사례 / paradigm-level fix plan 본격 Phase 2 pre-fix 실측 본격 entry fixture 의무). **carry resolved**: C-validator-dual-key-businessrules ✅ (session 52차 LL-poc-17-09 + session 53차 LL-poc-17-15 promotion / paradigm-level resilience 추가로 종결). **잔여 carry queue (별 cycle)**: C-schema-regex-paradigm-completion (axis 3 Layer 1 schema 자체 본격 검토 / Type 2 외부 사용자 자연 trigger 의무) + C-other-analysis-skills-strict-cascade + C-other-id-patterns-strict + C-sub-rule-pii-detection + C-sub-rule-rbac-fail-open-detection + C-domain-schema-stakeholders-mandatory + 본 PoC 통합 array (`business_rules` top-level / -001 suffix) 자연 폐기 자격 (선택적). **본 session 누적 release** = 1 (v11.5.1 PATCH). ** 본 session 본격 자산화 사실** = paradigm A 본격 가치 self-입증 사례 본격 본격 자산화 (LL-validator-dual-key-01~03) + paradigm-level resilience 가치 본격 입증 (test 4 신규 / 외부 PoC 실측) + self-기록 사실 narrative 검증 paradigm 본격 본격 본격 entry fixture 자격 자연 자격 본격 본격 입증. DEC-2026-05-29-validator-multi-path-br-lookup.

**session 52차 — v11.5.0 MINOR release — analysis-business-rules skill 본문 BR id strict instruction 본격 추가 (axis 3 / paradigm drift 영구 차단 / chain 1 첫 사내 live + plan-revisit plan.md + axis 3 본격 시행)**: session 51차 v11.4.0 종결 직후 사용자 결단 chain — "chain 1 discovery 진입 (poc-17 car-list pilot)" → chain harness discovery stage 첫 사내 live 시행 (외부 디렉토리 `~/Documents/Development/Study/poc-17-ifrs-car-migration/.aimd/output/discovery-spec.{json,md}` 산출 / UC-CAR-001~003 / 12 BR car-list bound / source-grounded coverage 100% / 사내 source 사본 0건 verify) → paradigm drift 2건 표면화 (Layer 1 schemas strict regex `^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+# STATUS History — multi-cutoff archive

> **Multi-cutoff archive** — paradigm 진화 분기 cutoff 매시 archive 자산:
>
> - 2026-06-03 (v12.0.0 json-only / dep-graph living-graph era) — session 41차~54차 (v9.0.0~v11.5.1) 격리 (STATUS bloat cleanup @ v12.6.0 / 본 cutoff)
> - 2026-05-25 (v9.0.0 paradigm boundary) — session 40차 이하 (v8.14.4 PATCH 이하) 격리
> - 2026-05-23 (v8.13.2 cleanup) — session 31차 이하 격리
> - 2026-05-16 (R3 / v3.6.5 / session 20차 결단) — session 14차 이전 격리
>
> 현재 진행 상태 (session 55차 이후) → [`STATUS.md`](STATUS.md) 참조.

---

vs Layer 2 skills/analysis-business-rules instruction 부재 → AI meaningful name 자유 paradigm 산출 → schema-validator RED 18+ findings → patch fix 임시 우회) → gate #1 = stop + revisit:analysis 결단 → plan-revisit (axis 1+2 / `.claude/plans/plan-poc17-analysis-revisit-axis-1-2.md`) plan.md 작성 → axis 3 본격 의제 표면화 → 사용자 의제 chain ("axis 3 빠져도 되나?" / "AI 가 어떤 파일을 읽는가?" / "컨텍스트 엔지니어링 측면에서 어떤게 좋은가?" / "포맷팅 대로 되는게 좋다" 정합) → Path 2 (skill 본문 enforcement / strict instruction 추가) 본격 결단 → 본 v11.5.0 MINOR release 시행. **시행**: ① `skills/analysis-business-rules/SKILL.md` §3 안 BR id strict 의무 instruction 1 unit 추가 (regex `^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+# STATUS History — multi-cutoff archive

> **Multi-cutoff archive** — paradigm 진화 분기 cutoff 매시 archive 자산:
>
> - 2026-06-03 (v12.0.0 json-only / dep-graph living-graph era) — session 41차~54차 (v9.0.0~v11.5.1) 격리 (STATUS bloat cleanup @ v12.6.0 / 본 cutoff)
> - 2026-05-25 (v9.0.0 paradigm boundary) — session 40차 이하 (v8.14.4 PATCH 이하) 격리
> - 2026-05-23 (v8.13.2 cleanup) — session 31차 이하 격리
> - 2026-05-16 (R3 / v3.6.5 / session 20차 결단) — session 14차 이전 격리
>
> 현재 진행 상태 (session 55차 이후) → [`STATUS.md`](STATUS.md) 참조.

---

의무 / form `BR-<DOMAIN>-<SUBJECT>-<NNN>` / prefix 의미 + suffix 식별자 양수 가치 / meaningful name 단독 산출 ❌ / paradigm 본격 정합 근거 = poc-17 chain 1 first 표면화) ② 3-way version sync 11.4.0 → 11.5.0 (plugin.json + package.json + CLAUDE.md) ③ CHANGELOG entry + DEC-2026-05-29-axis-3-skill-strict-instruction 신설 + INDEX append ④ release ceremony. **STOP-3 ✅**: workspace test **787/787 pass** + release-readiness **21/22 (--skip-preflight)** + skill-citation 0 stale + version 3-way 11.5.0 + breaking 0 = MINOR. **6 LL 자산화** (LL-poc-17-05~10 + LL-axis-3-01): LL-poc-17-05 (chain 1 첫 사내 live paradigm 입증) + LL-poc-17-06 (discovery-from-analysis-output skill body 실측 ROI) + LL-poc-17-07 (iBATIS 2 sqlMap manual 우회 paradigm / PoC #15 정합 / Java ⭐⭐⭐ + sqlMap manual) + LL-poc-17-08 (UC AC-\* placeholder forward link paradigm) + LL-poc-17-09 ( paradigm drift 2건 본격 표면화 / validator dual-key + schema regex mismatch / 외부 layer fix + carry queue 등록) + LL-poc-17-10 ( revisit:analysis 첫 사내 trigger paradigm / DEC-2026-05-06-round-trip-부분-허용 정합) + LL-axis-3-01 ( context engineering 측면 strict 포맷 본격 우수 사실 누적 / prefix 의미 + suffix 식별자 양수 가치 / Path 2 skill 본문 enforcement 본격 paradigm enforcement). **carry queue 등록** ( Type 2 외부 사용자 자연 trigger 의무): C-other-analysis-skills-strict-cascade (analysis-api-rule-mapping / discovery-identify-business-intent 등 cross-skill paradigm coherence 본격 정합 의무 검토) + C-other-id-patterns-strict (AP / UC / AC / BHV / TASK / TC / IMPL id pattern 본격 strict 정합) + C-validator-dual-key-businessrules (validator `analysis.rules.business_rules` path 가정 mismatch / methodology body 흡수 의제) + C-poc17-axis-1-2-plan-revisit-실행 (axis 1 business_intent 재정합 + axis 2 F-RBAC-BYPASS-001 보안 invariant 명세 / 외부 디렉토리 layer / 다음 session 의제) + C-schema-regex-paradigm-completion ( axis 3 부분 해결 / Layer 1 schema 자체 본격 검토 별 cycle). DEC-2026-05-29-axis-3-skill-strict-instruction. **본 session 누적 release** = 1 (v11.5.0 MINOR). ** 본 session 본격 자산화 사실 본격**: chain 1 첫 사내 live + plan-revisit plan.md 작성 + axis 3 paradigm drift 영구 차단 본격 시행 = 3 paradigm-level prod 가치 진전 본격 입증 (chain harness round-trip paradigm + analysis stage paradigm enforcement + AI instruction layer 본격 단일 layer 본격 명확).

**session 51차 — poc-17 Phase 1 analysis baseline 본격 종결 + v11.4.0 MINOR release ( dogfooding live probe paradigm 첫 본격 입증 / 12 phase 전수 + carry 자산화 cycle A+B+C+D)**: session 50차 PoC #15 codegraph probe 직후 자연 trigger — 사용자 결단 chain (Phase 1 진입 → 추천 안 3종 (전체 11 phase + 전체 car 도메인 6 화면 baseline + spring41-ibatis2 sub-rule 자동 적용) 채택 → Scenario C 발견 → 12 phase 확장 (template-analyze 활성) → carry 자산화 cycle 전체 A+B+C+D + commit/push). ** Phase 1 본격 산출** (외부 작업 디렉토리 `~/Documents/Development/Study/poc-17-ifrs-car-migration/.aimd/output/` / 사내 source 격리 / LL-codegraph-07 정합 / 본 레포 commit ❌): 12 phase 전수 / **25+ 산출물** / 사내 source 사본 0건 confirm. (1) input phase = \_manifest.yml + input-summary.json ( K 정책 본격 적용 / cross-DB 18 자산 매핑) (2) discovery = inventory/tree/stack-detection/stats (Spring 4.1.2 + Java 1.8 + Egov 3.6.0 정정 / F-STACK-VER-001) (3) template-analyze = PMD 7.24.0 실 실행 / 14 JSP / 28 violations / 10 ParseException 71% / NoUnsanitizedJSPExpression 19건 (4) db-schema = 6 Tables (TB_CAR 누락 정정 / F-DBTBL-COUNT-001) + 2 Functions (1 빈 파일 F-FN-EMPTY-001) + cross-DB 18 자산 (5) architecture = 8 layer + cross-DB dep-graph (6) business-logic = domain DDD 4 BC + 3 Aggregate + business-rules 53 BR + antipatterns-partial 16 AP (7) formal-spec = decision-table RBAC 3 분기 + state-machine cost-lifecycle + sequence-diagram SP γ EXEC (8) characterization = intent-vs-bug 20 (intent 5 / bug 5 / ambiguous 4 / leftover 6) (9) sql-inventory = 35 SQL id + 1 procedure 매트릭스 (10) api = openapi.yaml 28 endpoint (CarMgt 12 + CarCost 16) (11) ui = ui-spec Scenario C scope-out 명시 (12) quality = antipatterns 16 AP + 43 finding + 5 Composite View + avoid-list + migration-cautions. ** Finding 누적 43건 (F-021 임계 본격 초과 / legacy paradigm 첫 사례)**: critical 1 **F-PII-HARDCODE-001** (CarCostServiceImpl 5 사용자 실명 + 마스킹 패턴 운영 코드 잔존 / 즉시 정정 카테고리) / high 6 (cross-DB / RBAC-exception / XSS / scriptlet / err-swallow / RBAC-preserve) / medium 14 / low 16 / observation 6 (3 해소). ** carry 자산화 cycle (v11.4.0 MINOR / commit `9c341738` / 11 files / 450+ insertions)**: A = sub-rule `spring41-ibatis2-isomorphic.md` v1.1.2 → **v1.2.0** (§X-H 4 sub-section 본격 신축 + §X-H-11 신축 AP `AP-LEGACY-IBATIS2-DB-001~011` + **sub-axis 자동화율 81.25%** 본격 측정 AP detection sub-axis만 / R1' axis ceiling 53~55% 와 별 metric) + B = memory 2 갱신 (composite-view PoC #02 4건 → PoC #17 5건 + finding-threshold legacy paradigm 별 임계 30~60 신축) + C = methodology-spec §사례 본격 확장 3 (db-assets-always-on §8 + sp-conversion-policy §10 + baseline-delta-operating-model §5 신설) + D = release ceremony (DEC-2026-05-29-sub-rule-v1.2.0-poc-17-corroboration 신설 + INDEX + CHANGELOG + CLAUDE.md sync + version 3-way 11.4.0). **STOP-3 ✅**: workspace test 787/787 pass + release-readiness **22/22 criteria passed** + skill-citation 249 active doc 0 stale + version 3-way 11.4.0 + breaking 0 = MINOR. **M.2 측정 axis 사실 누적 9종**: K (DB always-on) first live (18 cross-DB) / L (SP α/β/γ/δ) first live (γ 1건 + 사내 utility 2) / R1' axis 4번째 corroboration (PoC #06+#07+#11+#17) / R1'-c (DB axis) 첫 sub-axis corroboration / sub-rule §X-H 첫 live / chain harness 5 gate (analysis chain 0 / 12 phase 전수) / baseline-delta (canonical global 첫 본격) / 사내 source 격리 paradigm (LL-codegraph-07) 첫 live (위반 0건 confirm) / Composite View 5건 + Scenario C 첫 사내. **4 LL 후보 자산화**: LL-poc-17-01 (dogfooding live probe paradigm 첫 본격 입증) + LL-poc-17-02 (legacy PoC finding 본격 누적 자연 사실) + LL-poc-17-03 (sub-axis = R1' axis 별 metric / 외부 인용 axis 혼동 회피) + LL-poc-17-04 (Composite View 본격 압축 가치 입증). **양쪽 remote sync 완료**: origin (rageboom) `9c341738` + tag v11.4.0 ✅ + origin-smilegate (GHE) 동일 sync ✅. **본 session 누적 release** = 1 (v11.4.0 MINOR). **잔여 carry queue (별 cycle)**: C-sub-axis-3-poc-corroboration (자격 1/3 / ≥ 2 추가 도메인 의무) / C-c-layer-baseline-재측정 / C-jsp-parser-augment (PMD 7.x 71% parse fail → SonarQube/jsp-lint 보강) / C-db-autoval (K 정책 자동 validator 신설) / **F-PII-HARDCODE-001 즉시 정정** ( 사내 source / 본 레포 외부 / 사용자 결단 의무) / chain 1 discovery 진입 (poc-17 car-list pilot). DEC-2026-05-29-sub-rule-v1.2.0-poc-17-corroboration.

**session 50차 — codegraph probe live new project R1' axis 시행 (release ❌ / doc trail 만 / PoC #15 사내 source 본 레포 외 격리)**: DEC-2026-05-27 (codegraph 통합 전면 scope-out) 1일 차 사용자 결단 chain — "이거 진행하자" (carry 발동 자격 조건 0/3 상태로 본격 시행 결단) → "우리 의존성 그래프 다시 보고 다시 판단" plan mode 재진입 → 사용자 reframe "fit 판정" → "MCP 가 아니라 CLI" push back 흡수 → "scope-out 의도 위반" 표현 제거 → "신규 프로젝트 live" 결단 → "사내 EFI-WEB" target 결단 → mini scope (1 read-only endpoint) 결단 → 4원칙 ladder live probe. **시행**: ① settings.json permissions allow 추가 (사용자 본인 권한 `!` cp / agent self-modification block 우회) + codegraph v0.9.6 (`npm i -g @colbymchenry/codegraph` / npm registry verify ✅ — colbymchenry maintainer / latest 2026-05-27 1일차 / preuninstall script 존재) ② `~/Documents/Development/Study/poc-15-codegraph-validation/` 본 레포 외 별도 위치 (사내 데이터 민감성 결단 / 산출물 commit 금지 / source 외부 절대경로 참조 paradigm) ③ EFI-WEB/.gitignore `.codegraph/` 추가 ④ `codegraph init -i` EFI-WEB/ifrs 인덱싱 = 637 files / 10,551 nodes / 21,187 edges / 10.8s / 42.94 MB SQLite / Files by Language: javascript 335 + java 206 + **xml 58** + properties 29 ⑤ analysis stage compare (`compare/analysis-compare.md`) + implement stage compare (`compare/implement-compare.md`) 작성 ⑥ DEC-2026-05-28-codegraph-probe-결과 신설 + INDEX + 본 STATUS entry. **결정적 사실 1건**: codegraph v0.9.6 "MyBatis support" = iBATIS 2 (XML SQL Map 2.0 DTD) **까지 cover ❌** — Java/Spring layer ⭐⭐⭐ (route 551 노드 + interface→impl→DAO 3단 매핑 정확 + cross-domain caller 자동 추출 e.g. `CapitalServiceImpl.IfrsWeekReport1` 같은 다른 도메인 호출자 5건 callers) / iBATIS sqlMap layer **0** (exchange.xml = file 노드 1개 / `<select id="...">` 노드 추출 ❌ / DAO 메서드 → sqlMap id string literal 끊김) / end-to-end URL→DB ⭐ (Java 절반만). **carry queue 자격 갱신** (DEC-2026-05-27 §5.3 / 본 PoC 1건 자연 충족): (a) 외부 사용자 자연 요구 ≥1 = ❌ 변동 0 / (b) v1.0+ 6개월 maturity = ❌ day-8 / (c) PoC ≥2 code_pointers 자격 = **1/2 자연 충족 (PoC #15)** → 본격 carry 발동 ❌. **3 LL 자산화**: LL-codegraph-05 (live new project probe paradigm 본격 입증 / retroactive snapshot ❌ vs live measurement ✅ 사실 1건 자연 누적) + LL-codegraph-06 (layer 별 효용 분리 측정 paradigm / 단일 ⭐ 점수 부적합 / Java×XML mapper 분리 의무) + LL-codegraph-07 (사내 source 외부 위치 paradigm / examples/ 밖 위치 + source 외부 절대경로 참조 + 본 레포 commit ❌ + 마스킹된 DEC doc 만 공개). **STOP-3 ❌** (release ❌ / version 11.1.0 유지 / release-readiness 22/22 보존 / 본체 무영향 / pure doc trail). **본 session 누적 release** = 0 (PoC #15 live measurement 1건 / DEC-2026-05-28 신설). DEC-2026-05-28-codegraph-probe-결과.

**session 49차 후속 ADDENDUM (6) — fresh-PC 설치 가이드 + v11.1.0 doc refresh + 태그 위생 (release ❌ / doc trail + remote sync)**: cleanup(ADDENDUM 5) 직후 사용자 결단 chain. **① INSTALL.md 신설** (repo 루트 / GHE 접속 첫 화면 렌더 / 아무것도 안 깔린 PC 5단계 = Node → git·GHE 인증 → Claude Code → plugin install → 확인 / Windows·macOS 양쪽 / pin 없는 main 방식 — GHE 미푸시 태그 회피). **② 태그 위생**: GHE 태그가 v8.8.x까지만 존재 발견 → 누락 태그 push → 그 과정에서 **v11.1.0 태그 자체 부재** 발견 (`git tag -l` exit 0 오탐 / release 됐으나 tag 누락) → release 커밋 `e4da1915`에 annotated v11.1.0 태그 신설 (관례 = release 커밋) → 사용자 "예전 태그 다 지워" 결단 → **v11.1.0 1개만 남기고 88개 삭제** (로컬 + origin + origin-smilegate / zsh word-split 함정으로 1차 무삭제 → xargs 재시행). **③ README 전면 refresh** (v3.6.9 → v11.1.0): 통계 (skill 55 / 도구 22 / 스키마 46 / PoC 14 / test 770 / release-readiness 22/22 / 요구사항 18) + chain 1~5·gate #1~#5 + traceability UC→BHV→AC→TASK→TC→IMPL + v11 paradigm (BE/FE 분리·contract 양 axis·ticket=plan 4-level) + 디렉토리·도구·스키마 목록 실측 정합 + INSTALL.md 링크. **회귀 1건 자가 해소**: criterion #19(legacy_4_stage_absent) 가 내가 적은 설명 문구 "4 gate"를 잡아 21/22 → 문구 평이화 → 22/22 복구. **④ CLAUDE.md v11.1.0 정합**: 현재-상태 통계 5곳 (schemas 45→46 / release-readiness 13→22 / charter R17→R18 / ADR-CHAIN 005→012 / flows planning→discovery·1~4→1~5) + CHANGELOG 요약에 "현재 v11.1.0 MINOR" 마커 추가 (v11.0.0 상세는 "직전"으로 강등·보존). **⑤ CHANGELOG.md 점검 = 정합 (수정 0)**: 최상단 11.1.0 / 역순·중복 0 / Unreleased 없음 / HISTORY 경계 9.0.0↔8.14.4 정상. **각 doc 커밋 release-readiness 22/22 + skill-citation 0 stale 검증** + 양쪽 remote 동일 push (origin·origin-smilegate / 매 커밋 후 ref 일치 확인 — 사용자 "둘이 떨어지면 안됨"). 커밋: `5778dc0f`(cleanup) → `620499ff`(INSTALL) → `8a5eedac`(ADDENDUM5) → `3e90d95d`(README pin) → `2460cb25`(README refresh) → `1835a1bd`(CLAUDE 통계) → `6b830124`(CLAUDE v11.1.0 요약). **STOP-3 ❌** (release ❌ / version 11.1.0 유지 / release-readiness 22/22 보존 / 본체 무영향 / pure doc + 태그 위생). **본 session 누적 release** = 1 (v11.1.0 / 본 ADDENDUM = doc trail).

**session 49차 후속 ADDENDUM (5) — 프로젝트 cleanup (완료/scope-out dev 로그 + stale dist 제거 + 양쪽 remote sync / release ❌ / doc trail 만)**: 사용자 "프로젝트를 정리하고 싶다" → 3 scope 선택 (stale 빌드 + 완료 dev 로그 + 본체 drift 점검). **본체 drift 점검 = 깨끗** (version-check 3-way 11.1.0 sync + build-plugin --check drift 0 + release-readiness **22/22 ready** 보존 / skill-citation 0 dead-link / graph orphan 0) = 손댈 것 없음. **삭제 (commit `5778dc0f`)**: ① methodology `.claude/plans/` 20종 (v1.4~v8 release 완료 dev 로그 / 직전 28ce3271 cleanup 동일 유형 / 결론은 CHANGELOG·decisions 보존 + git history 복구 가능) ② 루트 `.claude/plans/` 4종 (plan-analysis-validator-poc06-11 = v11.0.3 released + plan-dep-graph-v11-paradigm-cascade = v11.1.0 released + plan/research-codegraph-integration = scope-out 결정) ③ `dist/` stale 빌드 3종 (v2.6.0/v8.7.0/v9.0.0 / gitignore 비추적 / build-plugin.js 재생성). **유지**: 활성 `plan-jira-standard-and-voc-routing.md` + 참조 시각 자산 3종 (jira-workflow-diagram.excalidraw + gen-jira-workflow-diagram.py + sdlc-chain-harness-diagram.excalidraw). **remote sync (사용자 "push it" + "origin-smilegate에도")**: origin(rageboom) fast-forward push ✅ + origin-smilegate(GHE) **non-fast-forward 거부 발견** — v8.8.0(c6107498) 공통 조상에서 분기 (로컬 58 ahead = v9~v11 / smilegate 10 ahead = v4.1 PR #1~#3 머지 / discovery·plan skill placeholder = 로컬이 상위호환으로 이미 포함). 사용자 force push 결단 → `--force-with-lease` 안전 적용 (d89d766f→5778dc0f forced) → 세 ref 모두 5778dc0f / 0 ahead 0 behind 동기 확인. smilegate PR #1~#3 머지 이력 orphan (내용 손실 0). **process note**: 진행 중 `.git/index.lock` 15:39 stale 파일 (실행 git 프로세스 0) 제거 후 진행. **STOP-3 ❌** (release ❌ / version 11.1.0 유지 / release-readiness 22/22 보존 / 본체 무영향). **본 session 누적 release** = 1 (v11.1.0 / 본 ADDENDUM = pure doc trail + 양쪽 remote sync).

**session 49차 후속 ADDENDUM (4) — v11.1.0 MINOR release — v11 discovery-spec cascade 완결 + drift-validator outputs 비교 신설 (F-MB-010·F-MB-011 / release ✅)**: 사용자 "지금 프로젝트의 플로우를 점검 해보고 싶다" → end-to-end 흐름 리뷰 (입력→analysis→discovery→spec→plan→test→implement). **발견 — 선언↔실상 모순**: v11.0.0 이 "active doc cascade 완료 / skill-citation 0 stale (245 doc)" 기재했으나 실제로는 `planning-spec`→`discovery-spec` rename (DEC-2026-05-26-discovery-spec-rename §4 = hard replace 명령) 이 flows·docs·chain-driver runtime 미흡수. 핵심: `discovery.phase-flow.json`(discovery-spec) ↔ `.mermaid`(planning-spec) 산출물명 발산을 **drift-validator 가 0 breaking 통과** = 이중 렌더링 "drift 0 자가 입증" 간판의 실증 반례. **4원칙 ladder** (plan `.claude/plans/indexed-conjuring-pillow.md` / 사용자 승인 / RED→GREEN). **시행 (사용자 결단 "듀얼키 하지말고 교체" + MINOR + 도구 클러스터 carry)**: ① drift-validator `normalize-phase-flow.js`+`compare-phase-flow.js` 산출물명 비교 신설 (mermaid 산출물명이 JSON inputs/outputs 계약 부재 → breaking / `*.phase-flow.*` 메타 제외 / +4 회귀 test) — RED (discovery 2 breaking) → GREEN ② flows hard replace (discovery.mermaid OUT + sdlc-4stage {json,mermaid} + spec {json,mermaid} + README / spec.mermaid stale NEXT "chain 3 (test)"→"(plan)" + revisit:planning→discovery 동반 정정) ③ docs (lifecycle-contract CHAIN/data-contract/tree/schema목록 + plan stage v11 contract BE/FE prose 보강 / README / guides 2 / agents README plan-agent placeholder→gate #3) + `plan-spec`→`task-plan` 동반 ④ chain-driver runtime 교체 (hooks-bridge/revisit-detect/work-unit discovery-spec keying + 4 test fixture / PoC frozen 보존) ⑤ `finding-system.md:934` brace-notation citation fix (regress 2 gate `skill_citation`+`workspace_test` 단일 원인 해소 / 외부 figma finding 산물) ⑥ release ceremony (11.0.3→11.1.0 / CHANGELOG + DEC + INDEX + CLAUDE.md sync). **잔여 carry (별건 / PoC-bound)**: builder.js `derived_from` + formal-spec-link-validator (`planning_spec_path` schema 필드) = PoC·behavior-spec 필드명 bound → 교체 시 PoC 깨짐 / discovery-spec=chain 1 backward link 없어 실효 영향 ≈ 0 / **C-dep-graph-v11-paradigm-cascade carry 합치**. **STOP-3 ✅**: workspace test 전수 pass + release-readiness **22/22 ready** (regress 20/22 → 22/22) + skill-citation 0 stale + version 3-way 11.1.0 + drift-validator flows 5/5 0 breaking + chain-layout/state-flow ✅ = MINOR. **2 LL 후보**: LL-v111-01 (선언↔실상 모순 / release ceremony "완료" 기재 ↔ 자동 검증 부재 시 미흡수 / corpus-frozen 미표면화 / LL-dep-graph-01 확장) + LL-v111-02 (validator coverage 공백이 간판 가치 명제 반례 통과 → RED→GREEN 동반 신설 정공법). DEC-2026-05-27-v11-discovery-spec-cascade-완결. **본 session 누적 release** = 1 (v11.1.0 / 직전 ADDENDUM 1~3 = doc trail).

**기준일**: 2026-05-27 (**session 49차 (현 session) — codegraph 통합 design 전면 scope-out (release ❌ / doc trail 만)** — 사용자 결단 chain: pull v11.0.0 MAJOR → "다음 작업 = codegraph 통합 §2 research" → 3 sub-agent + 메인 raw fetch (F-015) → Senior critique GO @ 35% / scope-out 권고 medium~high → 사용자 1차 분기 1 (α 단독 v11.0.1 PATCH) 채택 → **§4 시행 직전 PoC corroboration 자격 fundamental 부재 발견** (LL-fsim-11 paradigm 5회 이상 연속 재발 / 14 PoC 중 impl-spec.json 보유 = poc-05 + poc-14 단 2 / 두 PoC 모두 code_pointers[] = 0개 / plan §R1.4 명시 target poc-02+poc-03 impl-spec.json 부재) → 사용자 2차 **전면 scope-out** 결단. **사실 누적 8건** (3 sub-agent + 직접 fetch + §4 시행 직전 검증): trigger self-referential 1회 / 외부 사용자 자연 요구 0건 / codegraph day-one 3일 차 (v0.9.0 = 2026-05-21 / v0.9.5 = 2026-05-26) / codegraph repo 안 symbol_id schema 명세 부재 / trust 모델 clash ("graph provides context, not requirements" vs 결정적 검증) / tree-sitter version pin 부재 / poc-02+poc-03 impl-spec.json 부재 / 가용 2 PoC code_pointers[] = 0. **carry queue 3 등록 (Type 2 외부 사용자 자연 요구 발생 시 재발동)**: C-codegraph-bridge-design (외부 요구 ≥1 + codegraph v1.0+ 안정화 ≥6개월 + PoC ≥2 자격 자산 동시 충족) + C-scip-grammar-adoption-light (별 axis / codegraph 무관 / 본 방법론 표현력 ↑ 자체 가치 / PoC code_pointers[] 채워진 PoC ≥2 사전 의무) + C-tree-sitter-stability-verify (version pin 명세 시점). **자산 변경 (release ❌)**: DEC-2026-05-27-codegraph-integration-scope-out 신설 + INDEX 갱신 + 본 STATUS entry + `.claude/plans/plan-codegraph-integration.md` REVISE-2 append (R1.1~R1.6 전면 retract) + `.claude/plans/research-codegraph-integration.md` 보존 (B/D sub-agent + raw fetch + SCIP grammar 사실 = 별 axis 활용 자산). **4 LL 자산화**: LL-codegraph-01 (research §2 negative signal cascade absorption paradigm) + LL-codegraph-02 (design 작성 직후 §4 시행 직전 PoC 자격 사전 검증 의무 / LL-fsim-11 paradigm 5회 이상 연속 재발 / 본 v8) + LL-codegraph-03 (외부 OSS bridge 통합 자격 3 criterion paradigm: 외부 요구 + v1.0+ 6개월 maturity + PoC ≥2) + LL-codegraph-04 (self-referential corrective drift 본격 입증 case / memory `feedback_self_referential_corrective_drift.md` 보강 자격). **STOP-3 ❌** (release 자체 ❌ / workspace test 영향 0 / version 3-way 유지 11.0.0 / release-readiness 영향 0). DEC-2026-05-27-codegraph-integration-scope-out. **본 session 누적 release** = 0 (pure doc trail).

**session 49차 후속 ADDENDUM** (codegraph scope-out 직후 자연 흐름 — 다음 작업 후보 정찰 + stop 결단 자산화): 사용자 "그럼 뭐부터 할까?" → 3 carry candidate 정리 (A=Jira 표준+VOC 라우팅 / B=PoC #03 chain 4 GREEN Type 1.5 second arm / C=사내 PoC #06~#11 analysis validator) → 사용자 분기 chain 1) "A 는 다른 CLI 에서 / B 꼭 해야 하나" → B 정직 평가 (강제력 ❌ / release 자격 §8.1 strict 7/7 이미 충족 / deadline 없는 carry / self-referential 위험 codegraph 직후 동형 / pre-deployment 단계) → 2) "C 꼭 해야 하나" → C 평가 시 **plan 자체 obsolete 발견** — release-readiness `analysis_validator_violation` ✅ 이미 충족 (v8.6.0+ F-V2C2-1-01 fix / 12 BR + 32 chain artifact 전수 검증 0 violation) + v11.0.0 planning→discovery rename paradigm shift 미반영 → 3) **stop + cleanup commit 결단**. **자산 변경 (release ❌ / doc trail 만)**: `.claude/plans/plan-analysis-validator-poc06-11.md` OBSOLETE 표기 (해소 사유 2 axis + carry queue 재발동 조건 3 + LL 후보) + `.claude/plans/sdlc-chain-harness-diagram.excalidraw` 신규 (사용자 요청 6-stage SDLC chain harness 시각화 / 65 element / 5 gate + 9 revisit edge + cross-cutting 5 + release legend) + 본 ADDENDUM. **1 LL 자산화 후보**: LL-obsolete-plan-detection (carry plan close 시 release-readiness criterion 실측 + paradigm shift 후 산출물명/schema path 정합성 사전 검증 의무 / plan 작성 시점 ↔ session 시행 시점 사이 paradigm 진화 시 stale 위험 paradigm / LL-fsim-11 / feedback_strict_exposes_drift 동형). **paradigm 정합**: LL-codegraph-01 (self-referential trigger 회피) 본격 일관성 — 본 session 후속 작업 candidate 0 사실 자산화 (B/C 모두 자기-enforcement axis + plan obsolete) = 외부 자연 trigger 발생 시점 (A 별 CLI / Type 2 외부 사용자) 까지 stop. **STOP-3 ❌** (release ❌ / version 11.0.0 유지 / release-readiness 22/22 ready 보존). **본 session 누적 release** = 0 (변경 없음 / 본 ADDENDUM = pure doc trail).

**session 49차 후속 ADDENDUM (3) — dep-graph v11 paradigm 전체 추적 구현 완료 (release ❌ / doc trail)**: ADDENDUM(2) carry 등록 직후 사용자 결단 "B, v11 페러다임 전체 추적되게 해줘" → carry `C-dep-graph-v11-paradigm-cascade` 해제 + 4원칙 구현. 4 갈림길 사용자 승인 (Epic/Story/OP 정식 노드 + contract leaf 엣지 + doc trail release 보류 + poc-05만 corpus). **시행 (Cluster 1~4)**: graph-synthesizer.js (TASK chain layer 6 = UC→BHV→AC→TASK→TC→IMPL + Epic/Story/OP plan 노드 + groups/conforms_to 엣지 + planning→discovery alias + layer 속성) + cli.js (--discovery/--task-plan/--operational-task) + impact-analyzer.js (conforms_to=MUST / groups=SHOULD) + centrality.js (가중치) + graph-integrity-validator (conforms_to leaf 예외) + schema 2종 (node artifact_kind +plan / subkind +TASK·EPIC·STORY·OP / +layer 필드 / edge_type 8종 +conforms_to·groups) + dep-graph-navigator SKILL + docs/dependency-graph.md §1/§2/§4/§5 + test (+11 v11 synthesizer test / impact EDGE_TYPE_CATALOG 5·3) + poc-05 task-plan.json v11 완전체 enrich → 재합성 nodes=16(chain 12 + plan 4)/edges=23(conforms_to 2 + groups 6). **검증 (제 변경 green)**: workspace 756 pass + release-readiness graph_integrity ✅ + code_pointer_coverage ✅ 100% + be_task_openapi_ref_ratchet ✅ / e2e STORY navigate → SHOULD(Epic+TASK)/FYI(TC) 조직 layer 영향 추적 동작. drift 1·2·3·4 전부 해소. ** 외부 in-flight 변경 caveat**: finding-system.md + figma-extract.schema.json + plan-jira-standard-and-voc-routing.md 3파일이 session 중 외부/병렬 수정 (figma source-grounding / 제 작업 무관). finding-system.md:911 eam 외부 evidence 참조 → skill_citation + workspace_test 2 게이트 regress (20/22) — 미수정 (collision 회피 / 사용자 결단 대기). **STOP-3 ❌** (release ❌ / version 11.0.0 / dep-graph 게이트 green / 외부 regress 2건 별개). `.claude/plans/plan-dep-graph-v11-paradigm-cascade.md` §10 SSOT. **본 session 누적 release** = 0 (구현 완료 / release ceremony 보류).

**session 49차 후속 ADDENDUM (2) — dep-graph v11 paradigm cascade drift 점검 + carry 등록 (release ❌ / doc trail 만)**: 사용자 "현재 의존 그래프를 통한 산출물 추적 관련 페러다임이 잘 되어 있는지 확인해 보고 싶다" → 4 source 교차 점검 (artifact-graph-{node,edge}.schema.json + graph-synthesizer.js + docs/dependency-graph.md + 실측 `poc-05/.aimd/output/artifact-graph.json`). **결과**: dep-graph 인프라 자체는 working (release-readiness 22/22 ✅ / `#15 graph_integrity` nodes=10/edges=13/cycle=orphan=unknown=0 + `#16 code_pointer_coverage` 100% 보존) — 그러나 **v9.0.0 (discovery stage) + v10.0.0 (plan stage/TASK-\*) + v11.0.0 (8 결단) paradigm cascade 가 dep-graph schema·synthesizer·docs 3 axis 모두에 미흡수**. **drift 4종**: (1) v9.0.0 discovery 미흡수 — `CHAIN_SUBKINDS=['UC','BHV','AC','TC','IMPL']` 5종 동결 / schema·docs "chain 5" / (2) v9.1~10.0 plan stage 비대칭 — builder.js 는 v9.2.0 TASK layer 추가 but graph-synthesizer.js 는 TASK 노드/엣지 합성 0 (matrix↔graph 비대칭) / (3) v11.0.0 planning→discovery rename 미적용 (synthesizer 변수명 `planning` + docs §4-1 CLI `--planning`) / (4) v11.0.0 8 결단 미반영 (BE/FE axis / Epic / Story / OP-_·TASK-_ 노드 부재 / contract 양 axis edge_type 표현 X). **실측 입증**: poc-05 graph 10 노드 전부 UC/BHV/AC/TC/IMPL (discovery/TASK/OP/EPIC/STORY = 0) = release-readiness corpus 자체가 v2.0 chain 5단계 동결 데이터. **사용자 결단 (옵션 a)**: drift 신규 plan/carry 등록만 / 본격 흡수 보류 / stop. **carry queue 등록**: `C-dep-graph-v11-paradigm-cascade` (재발동 4 조건 = 외부 사용자 자연 요구 ≥1 / v11 후속 MINOR cascade 묶음 자격 / 5 PoC task-plan 안착 후 matrix↔graph 비대칭 검증 실패 표면화 / release-readiness #15·#16 v11 정합 의무 발생). **자산 변경 (release ❌)**: `.claude/plans/plan-dep-graph-v11-paradigm-cascade.md` 신규 (drift 4종 카탈로그 + 재발동 조건 + 흡수 scope 6 + LL 후보 3 SSOT) + 본 ADDENDUM. **3 LL 후보**: LL-dep-graph-01 (infra working ≠ paradigm cascade 자동 흡수 / schema·tool·docs 3 axis 동기 의무) + LL-dep-graph-02 (release-readiness pass ≠ paradigm-current / corpus 동결 시 drift 미표면화 / corpus paradigm-currency 검증 후보) + LL-dep-graph-03 (단일 workspace 안 matrix↔graph 비대칭 / v9.2.0 TASK layer builder.js 추가 시 graph-synthesizer.js 동기 누락). **paradigm 정합**: LL-codegraph-01 (self-referential trigger 회피) 일관성 — drift 발견 즉시 본격 흡수 ❌ / 자연 trigger 의무. **STOP-3 ❌** (release ❌ / version 11.0.0 유지 / release-readiness 22/22 ready 보존). **본 session 누적 release** = 0 (변경 없음 / 본 ADDENDUM = pure doc trail).

**기준일 보존**: 2026-05-26 (**session 53차 — v10.1.1 PATCH release — C-v4.1-poc-재실행 부분 종결 (5 PoC task-plan 생성 / plan-agent e2e 입증)** — 사용자 "마지막 carry 처리하자" → option A 채택 (5 가능 + 5 서브-carry). additive PoC artifact / methodology 무변경 / breaking 0 = PATCH. **5 PoC task-plan**: poc-04-mini(1 task / Zod ADR / FE login) + poc-05(2 / argon2 ADR / signup+login) + poc-03(2 / argon2+JWT 2 ADR / RealWorld NestJS) + poc-14(4 / argon2+ownership 2 ADR / user+todo IDOR 차단) + poc-11(6 / characterization 2 ADR / 사내 EFI-WEB billing legacy bug 보존). **합계 15 tasks + 7 ADRs (alternatives ≥3 강제) + 18 risks (severity enum) + 19 NFR (ISO 25010:2023 9 characteristic)**. schema-validator VALID 5/5 (task-plan.schema.json). plan-agent v10.0.0 본격 dispatch 결과 / chain harness plan stage e2e 입증 / Type 1 self-run ≥ 5 corroboration (§8.1 strict ≥2 충족 / 다양 도메인+stack = 단일 PoC 과적합 회피). 3-way version 10.1.0→10.1.1 + CHANGELOG + DEC + INDEX + CLAUDE.md sync + DEC-2026-05-21 carry C-v4.1-poc-재실행 ✅ 부분 종결 표기 (5/9). **STOP-3**: release-readiness 20/20 ready (보존) + skill-citation 0 stale + version 3-way 10.1.1 + breaking 0 = PATCH. **잔여 서브-carry**: poc-06/07/08/09/10 (spec stage 미실행 / 각 PoC × behavior-spec + AC 실행 의무 / task-plan 보다 heavy / v10.x carry). DEC-2026-05-26-poc-task-plan-5. **본 session 누적 6 release** = v10.0.1 + v10.0.2 + v10.0.3 + v10.0.4 + v10.1.0 + v10.1.1.

**기준일 보존**: 2026-05-26 (**session 52차 — v10.1.0 MINOR release — discovery-from-{figma, swagger, nl-md} 3 SKILL.md body 본격 구현** — 사용자 "잔여 적용" 결단 (v10.0.4 trigger carry 보류 권고 override / paradigm 완전성 우선) → option α 본격. additive doc / breaking 0 / 신규 기능 = MINOR. 각 skill ~70-90 line / discovery-from-analysis-output (v9.0.0 본격) pattern 정합 / 책임 범위·입력·산출·no-simulation·절차·인용 6 섹션. **figma**: MCP 4 도구 (get_metadata/get_design_context/get_variable_defs/get_screenshot) → frame nodes → 사용자 flow → UC + interaction + BR-INTENT + NFR(부 a11y/responsive/transition). **swagger**: OpenAPI parse → operation 별 (path+method) → UC + I/O contract + schema constraint(required/enum/format/pattern) → BR-INTENT + NFR(부 security/x-ratelimit/SLA). **nl-md**: markdown structural parse(heading hierarchy/paragraph/sentence index) → 사용자 flow 패턴 → UC + BR-INTENT(verbatim quote) + NFR( 1차 채널 / NL 만이 명시 NFR) + risk. 각 entry source_grounded_evidence 의무: figma=figma:file_id:node_id / swagger=openapi:path:operationId / nl-md=doc:filepath:para:sentence. 산출 = `.aimd/output/planning-spec.json`. LLM fabrication ❌ (nl-md NFR 가장 위험 / planning-extraction-validator grep_hit_count > 0 강제). **동반 doc 갱신**: lifecycle-contract §Input 어댑터 timing 분리 (4 모두 본격) + first-prompt-cookbook §2.1 timing note + DEC-2026-05-26-input-skill-roles §2 carry resolved 표기. 3-way version 10.0.4→10.1.0 + CHANGELOG + DEC + INDEX + CLAUDE.md sync. **STOP-3**: release-readiness 20/20 ready (보존) + skill-citation 0 stale + version 3-way 10.1.0 + breaking 0 = MINOR. **잔여 carry**: C-v4.1-poc-재실행 (9 PoC 전부 task-plan 없음 / heavy validation v10.x / Type 1 self-run). DEC-2026-05-26-discovery-input-bodies. Resolves DEC-2026-05-26-input-skill-roles §2 trigger carry. **본 session 누적 5 release** = v10.0.1 + v10.0.2 + v10.0.3 + v10.0.4 + v10.1.0.

**기준일 보존**: 2026-05-26 (**session 51차 — v10.0.4 PATCH release — C-v4.1-input-skill-이관 결단 종결 (analysis-from-_ ↔ discovery-from-_ timing 분리 paradigm / option α light)** — 사용자 "최초에 분석은 analysis 에서 하는데 한번 분석이 끝난 프로젝트는 그냥 다양한 input 을 받도록 하고 싶다" → option α light 채택. additive doc / breaking 0. **paradigm 명문화**: `analysis-from-*` (4종 / 본격 구현 / 최초 1회 baseline 수립) ↔ `discovery-from-*` (4종 / 1 본격 + 3 light placeholder / 신규 건마다 scope 진입) 양쪽 set 평행 유지 + timing/책임 분리 (같은 figma/swagger/NL source 라도 baseline 시 vs scope 진입 시 = 다른 목적/다른 산출). baseline-delta 운영 모델(v10.0.1) 입력 측면 정합. **시행**: ① `skills/discovery-from-{figma,swagger,nl-md}/SKILL.md` 3 placeholder description 갱신 (paradigm 반영 + analysis-from-\* timing 분리 명시 + use case 트리거 carry 표기) ② `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스 다음에 §Input 어댑터 timing 분리 신설 (두 set 평행 표) ③ `guides/first-prompt-cookbook.md` §2.1 timing 분리 note ④ DEC-2026-05-21 carry 표 C-v4.1-input-skill-이관 ✅ 종결 표기 + option α light 결단 명시. 3-way version 10.0.3→10.0.4 + CHANGELOG + DEC + INDEX + CLAUDE.md sync. **STOP-3**: release-readiness 20/20 ready (보존) + skill-citation 0 stale + version 3-way 10.0.4 + breaking 0 = PATCH. **잔여 carry**: `discovery-from-{figma,swagger,nl-md}` 본격 구현 = 실 use case 트리거 carry (v10.x / 사내 배포 전 ROI 정합) + C-v4.1-poc-재실행 (9 PoC 전부 task-plan 없음 / heavy validation v10.x). DEC-2026-05-26-input-skill-roles. **본 session 누적 4 release** = v10.0.1 + v10.0.2 + v10.0.3 + v10.0.4. Resolves C-v4.1-input-skill-이관.

**기준일 보존**: 2026-05-26 (**session 50차 — v10.0.3 PATCH release — 잔여 carry quick wins 종결 (macOS env test fix + session-재시작-검증 표기)** — 사용자 "남은 carry 처리하자" → 잔여 4 carry 정밀 점검 → Quick wins(env + session-LL) 채택 (poc-재실행 + input-skill-이관 = 별도 carry 보류). corrective / breaking 0. **시행**: ① `tools/chain-coverage-validator/src/validator.js` `autoDetectProjectRoot` cross-platform path normalization (dirname 전 backslash→slash / POSIX dirname \ 미인식 macOS env-dependent test fail 1 해소 / **node --test validator.test.js 38/38 pass + release-readiness 19/20 → 20/20 ready**) ② DEC-2026-05-21 carry 표 C-v4.1-session-재시작-검증 ✅ 종결 표기 (LL-v4-04 자산화 완료 = DEC-05-17 + DEC-05-21 등재 / protocol 자산 = 별도 코드/문서 작업 없음). 3-way version 10.0.2→10.0.3 + CHANGELOG + DEC + INDEX + CLAUDE.md sync. **STOP-3**: workspace all pass + release-readiness **20/20 ready** (첫 도달 since 본 macOS env) + skill-citation 0 stale + version 3-way 10.0.3 + breaking 0 = PATCH. **잔여 carry (사용자 결단 보류)**: C-v4.1-poc-재실행 (9 PoC 전부 task-plan 없음 / heavy v10.x) + C-v4.1-input-skill-이관 (figma·swagger 실 중복 / discovery-from-figma 는 v4.1 PLACEHOLDER 그대로 / 3 옵션 결단 의무). DEC-2026-05-26-quick-carry-close. **본 session 누적 3 release** = v10.0.1 + v10.0.2 + v10.0.3.

**기준일 보존**: 2026-05-26 (**session 49차 — v10.0.2 PATCH release — v10.0.0 gate 재번호 prose+flow coherence (이전 session WIP 통합 + prose 전면 정합)** — 사용자 "WIP부터 같이 들여다보자" → working tree WIP 11파일(plan-stage gate 정합 / 이전 session 05-26 중단 / 정합+정확) 분석 → v10.0.0 chain N = gate #N 가 phase-flow 렌더링 + plan agent/skills + guides·README·lifecycle prose 까지 전파 안 됨 발견 → 사용자 묶음 결단 "전체 gate 재번호 정합 (권장)". corrective / breaking 0. **번호 규칙 확정**: chain N = gate #N (#1 discovery / #2 spec / **#3 plan** / #4 test / #5 implement) + "gate id ≠ chain" framing 폐기 + plan placeholder/deferred 해제. **시행**: ① WIP 통합 (flows/{plan,test,implement}.phase-flow.{json,mermaid} gate phase·번호 / agents/plan-agent / skills/plan-{decompose-and-sequence,risk-and-nfr} / templates/README + templates/plan/ 신규) ② prose 11 파일 (lifecycle-contract OUTPUT+매핑 매트릭스+data-contract+tree+traceability TASK / skills-axis §4·§7.2·§9.2 plan 본격 / id-conventions / 22-traceability gate #1~#5+TASK / README CHAIN+scenario+validator block / guides 4종 chain-harness-guide mermaid+sequence+gate id≠chain 폐기·getting-started·first-prompt-cookbook·common-errors / briefing 01-main+slides/methodology-deck flow·표·revisit·multiagent / flows/README). 3-way version 10.0.1→10.0.2 + CHANGELOG + DEC + INDEX + CLAUDE.md sync. **STOP-3**: drift state-flow(6=6)+chain-layout(5 stage/31 phase)+phase-flow 짝(plan/test/implement) 0 breaking + release-readiness 19/20(env fail 1 = macOS Windows-path test / clean v10.0.0 HEAD 동일 / 본 PATCH 무관) + skill-citation 0 stale + version 3-way 10.0.2 + breaking 0 = PATCH. **carry**: C-v4.1-poc-재실행(plan-spec/v10.x) + C-v4.1-input-skill-이관(공존 처분 결단) + macOS env-dependent test 환경 보강 검토. DEC-2026-05-26-gate-renumber-coherence. Resolves v10.0.0 phase-flow + prose drift 잔존.

**기준일 보존**: 2026-05-26 (**session 48차 — v10.0.1 PATCH release — baseline-delta 운영 모델 문서화 (v4.1 폐기 브랜치 carry 점검 → 실행)** — 사용자 "정리해줘 그리고 carry 실행해줘". 폐기된 v4.1 브랜치(feat/v4.1-_) 개념을 현 main(v10.0.0)과 대조 → discovery/plan stage·hooks 정합·plan-agent·traceability 확장은 v9.0.0~v10.0.0 완성 확인 / 유일 미해소 깨끗한 doc carry = `C-v4.1-baseline-delta-운영-문서화`. **시행**(additive doc / breaking 0): `methodology-spec/baseline-delta-operating-model.md` 신설 — 분석 baseline(canonical global `.aimd/output/`) vs 품질 baseline(`baseline-<date>.json` ADR-010) axis 구분 + 운영 cadence 3단계(초기 full 1회 / 신규 건 scope delta `related_artifacts` 상속 / 레거시 변경 시 변경 영역만 재분석 + M4 `sync_state` + `chain-driver sync` 통제 cascade) + baseline carry 규약(단일 source 참조 / drift 자동감지·cascade 수동 / 품질 단조 / iter-N carry) + 70~80% axis 정합. DEC-2026-05-21 carry 표 ✅ resolved 표기 + DEC-2026-05-26-baseline-delta-operating-model 신설 + 3-way version 10.0.0→10.0.1 + CHANGELOG + INDEX + CLAUDE.md sync. **STOP-3**: workspace 737/737(보존) + release-readiness target 10.0.1 + skill-citation 0 stale + version 3-way 10.0.1 + breaking 0 = PATCH. **carry**: poc-재실행(plan-spec 추가 / v10.x) + input-skill-이관(analysis-from-_ ↔ discovery-from-\* 공존 처분 결단) + lifecycle-contract plan placeholder prose drift(v10.0.0 잔존 점검). DEC-2026-05-26-baseline-delta-operating-model. Resolves DEC-2026-05-21 §carry C-v4.1-baseline-delta-운영-문서화.

**기준일 보존**: 2026-05-25 ( **session 47차 — v10.0.0 MAJOR release — Phase 4-4' axis A plan stage paradigm 본격 구현 ( gate 번호 재정렬 widespread breaking / chain N = gate #N 1:1 INTERNAL CONVENTION) + cooling-off paradigm 영구 폐기 재확인** — session 46차 v9.3.0 종결 직후 사용자 결단 chain: "이번 session 에서 뭐하면 되나" → "Phase 4-4' 준비 (plan 작성만)" → plan-mode 시행 `~/.claude/plans/jiggly-mapping-hopper.md` → ExitPlanMode 후 "진행" → paradigm STRONG-STOP signal 본격 보고 → option A "차기 session 시행" → "cooling-off 를 왜하는건가?" + "아예 없애도 되는거 아닌가?" 사용자 메타 dispute → AskUserQuestion A. 폐기 (권고) + B. v10.0.0 Cluster 2~5 본 conversation 시행 → paradigm 본격 결단 2종 (cooling-off paradigm 영구 폐기 재확인 + chain N = gate #N 1:1 INTERNAL CONVENTION). ** critical 정찰 발견** (git log 안): v10.0.0 Cluster 1 (B1+B2) commit `e5c8672` 외부 session 시행 (Chad Lee 작성 / 본 conversation 외부) + cooling-off paradigm = v2.2.0 (2026-05-08) DEC-2026-05-08-cooling-off-7d-폐기 "패기해줘" 영구 폐기 사실 발견 → session 46차 carry note + Phase 4-4' "cooling-off ≥24h 의무" 표기 = AI 본격 paradigm 재도입 cycle ( 19일 만 / paradigm-without-teeth 본격 입증 / actual 발동 case 0 + 사용자 push back 2회). **시행** ( widespread breaking): ① Cluster 1 ( 외부 session / e5c8672) — stage-graph.js gate 재번호 (plan='#3' / test='#4' / impl='#5') + state.schema.json enum +'#5' / +'plan' / chain-driver test 224→225 / ② Cluster 2 (676f948) — flows/sdlc-4stage-flow.json + plan.phase-flow.json 본격 body (placeholder=false / gate=#3) + 2 DEC 신설 (DEC-2026-05-25-axis-a-phase-4-4-prime + DEC-2026-05-25-cooling-off-영구-폐기-재확인) + INDEX.md cross-link / ③ Cluster 3 (142852e) — ADR-CHAIN-001 "chain 4단계"→"5단계" + 산출물 표 plan row (task-plan.{json,md}) + traceability UC→BHV→AC→TASK→TC→IMPL 6 layer + ADR-CHAIN-002 "4 gate"→"5 gate" + plan gate prompt 신설 / ④ Cluster 4 (568bcb2) — F-CHA-001 trio integration test 6 시나리오 신규 (validator critical + cli exit 1 + hooks deny + trio 통합 + gate enum 정합 + requiredValidators) / ⑤ Cluster 5 (4e28619) — CLAUDE.md + README + agents-axis + chain-driver/README sweep + release-readiness #18+#19+#20 신규 criterion (gate_enum_consistency + legacy_4_stage_expression_absent + plan_gate_operational) / ⑥ release ceremony (650baf5 / plugin.json + package.json 9.3.0 → 10.0.0 + CHANGELOG + CLAUDE.md sync). **STOP-3**: workspace 731 → **737/737 pass** (+6 F-CHA-001 trio integration) + release-readiness 17/17 → **20/20 ready:true** (#18+#19+#20 신규) + drift-validator 0 breaking / state-flow consistency PASS / chain layout PASS + skill-citation 0 stale + version 3-way 10.0.0 + breaking = ** MAJOR** (gate.id enum 의미 재할당 / plan stage hard gate / cooling-off paradigm 영구 폐기 재확인). **5 LL 자산화**: LL-v1000-01 cooling-off paradigm-without-teeth 본격 입증 (actual 발동 case 0 / 사용자 push back 2회 / DEC-2026-05-08 "패기해줘" 19일 만 재도입 cycle 차단) + LL-v1000-02 paradigm 부활 cycle = self-referential corrective drift 의 본격 paradigm 사례 ( AI 가 영구 폐기된 paradigm 을 19일 만 재도입 carry note 안에 표기) + LL-v1000-03 사용자 메타 질문 = STRONG-STOP signal + paradigm dispute 자격 (Auto Mode 안에서도 메타 dispute 자격 보고 의무 / feedback_user_meta_check_strong_stop 확장) + LL-v1000-04 paradigm 격상 자격 = ≥2 PoC corroboration + Adzic SBE strict 정합 의무 (1 사건 일반화 + AI persona 권고 + industry case 단순 인용 = paradigm 격상 자격 부재) + LL-v1000-05 INTERNAL CONVENTION paradigm framing 본격 정합 (chain N = gate #N 1:1 / DO-178C SOI / IEC 62304 isomorphic / 직접 standard 표기 ❌ / official-docs-checker REVISE-1 흡수). ** session 안 4 release cap (LL-v930-02) 정합**: session 47차 = 본 v10.0.0 release **1회** (Cluster 1 외부 session + Cluster 2~5 본 conversation = 통합 1 release). **session 47차 carry note 본격 entry-point doc 격상** (사용자 결단 " A. 본 session 안 carry note 본격 갱신"): step 1 prerequisite check / step 2 "본 session 의 본격 prod 가치 진전 = 무엇인가" 질문 의무 / step 3 사용자 결단 의제 본격 정의 ( 1순위 = Type 2 본격 진입 axis: 외부 사용자 / 사내 EFI-WEB prod / methodology body 외부 채택 / 새 use case) / step 4 4원칙 ladder. ** 차기 session 권고 1순위 = Type 2 본격 진입 axis** ( session 44+45+46+47차 carry 본격 의제 / paradigm 진화 안정점 + cooling-off 폐기 + v10.0.0 5 gate 본격 정합 후 = 본격 prod 가치 진전 axis) / 2순위 = 사용자 직접 의제 / 3순위 (trigger 의존) = Phase 4-5 v10.1.0 (Type 2 ≥1 corroboration trigger 후) / 권고 ❌ = methodology-spec sweep (self-referential drift risk). DEC-2026-05-25-axis-a-phase-4-4-prime + DEC-2026-05-25-cooling-off-영구-폐기-재확인. Resolves F-CHA-001 본격 해소 (Senior BLOCKER-2 trio integration test 6/6 pass) + F-CHA-003 5 axis 본격 해소 (gate 번호 재정렬 + state.schema enum + flows body + ADR + RR criterion). **본 session 누적 1 release** = v10.0.0 ( paradigm-level prod 가치 진전 본격 입증).

**기준일 보존**: 2026-05-25 ( **session 46차 — v9.3.0 MINOR release — axis A plan stage paradigm 본격 구현 Phase 4-4 minimal scope 시행 ( gate #plan trio enforcement 본격 활성 / Senior BLOCKER-2 잔여 본격 해소 / additive only / breaking 0)** — v9.2.0 release 직후 사용자 "다음 진행" + "B cooling-off retract" + "추천 (옵션 1 minimal)" 결단 → Phase 4-4 minimal 본격 시행. ** paradigm 메타 인지** (LL-v930-01 / 단 session 47차 안 cooling-off paradigm 영구 폐기 재확인 (DEC-2026-05-25-cooling-off-영구-폐기-재확인) — 본 entry 안 "cooling-off retract paradigm" 표기 = historical context 보존 / 본 paradigm 자체 = v10.0.0 영구 폐기): decision_cadence_24h_cooling_off paradigm retract 자격 본격 ✓ — minimal scope (additive only / breaking 0) + Senior BLOCKER-2 잔여 본격 해소 + 사용자 명시 결단 trigger. Phase 4-4 full scope (Cluster 1 X gate 번호 재정렬 widespread breaking) = retract 자격 ❌ / 별 session v10.0.0 MAJOR cooling-off 의무. **시행** (1 line + 1 test 갱신 + 1 신규 test): ① stage-graph.js getGateForStage('plan') = null → '#plan' (1 line / generic trio mechanism 본격 작동 자격 / 번호 부여 ❌ / Cluster 1 X = Phase 4-4' v10.0.0 MAJOR carry) ② test/stage-graph.test.js line 41 갱신 + v9.3.0 신규 test ( '#plan' string ID + Cluster 1 번호 부여 ❌ 정합 검증) ③ DEC-2026-05-25-axis-a-phase-4-4 신설 ④ release ceremony (plugin.json + package.json 9.2.0 → 9.3.0 + CHANGELOG + INDEX + STATUS + CLAUDE.md sync). **STOP-3**: workspace 730 → **731/731 pass** (chain-driver 224→225 / +1) + skill-citation 0 stale + release-readiness 17/17 ready:true (보존) + drift-validator 0 breaking (보존) + version 3-way 9.3.0 + breaking 0 = MINOR. **3 LL 자산화**: LL-v930-01 cooling-off retract 자격 paradigm 본격 입증 (additive only + Senior BLOCKER-2 잔여 minimal scope = retract 자격 ✓) + LL-v930-02 session 안 4 release 연속 cadence 본격 paradigm ( session 43차 self-referential corrective cycle 와 본격 차이 = paradigm-level prod 가치 진전 vs doc drift fix / 단 4 release cap 의무) + LL-v930-03 Node.js assert API 정합 (assert.doesNotMatch ✅ / assert.notMatch ❌). **본 session 누적 4 release** = v9.1.0 + v9.1.1 + v9.2.0 + v9.3.0. **차기 carry** (Phase 4-4' + 4-5): Phase 4-4' v10.0.0 MAJOR ( cooling-off ≥24h 의무 / gate 번호 재정렬 Cluster 1 X + flows revisit_edges 갱신 + ADR-CHAIN-002 prose + state.schema gate enum) + Phase 4-5 v10.1.0 MAJOR (ticket subsystem 6-stage migration + Type 2 외부 사용자 ≥ 1 corroboration 의무 trigger). DEC-2026-05-25-axis-a-phase-4-4. Resolves F-CHA-001 부분 해소 (plan gate ID 신설 / generic trio mechanism 본격 활성 자격 / 통합 test = Phase 4-4' carry) + F-CHA-003 Phase 4-4 minimal 부분 해소.

**기준일 보존**: 2026-05-25 ( **session 46차 — v9.2.0 MINOR release — axis A plan stage paradigm 본격 구현 Phase 4-3 시행 ( DO-178C 6 layer 격상 / additive only / breaking 0)** — v9.1.1 release 직후 사용자 "진행" 결단 → Phase 4-3 본격 시행 / 5 release 분산 cadence (Phase 4-1~4-5). ** Cluster 3 결단 본격 시행** — AC→TASK→TC paradigm (DO-178C 5 tier → 6 layer 격상 / UC↔BHV↔AC↔TASK↔TC↔IMPL). **시행** (Senior risk #4 본격 흡수 — additive only / 기존 PoC ratchet 분모 미영향): ① A6 schemas/traceability-matrix.schema.json cell.task_id additive (pattern TASK-\* / optional / strict 정합) ② A6 tools/traceability-matrix-builder TASK layer 매핑 (chain.taskPlan optional input + taskByAC first-match index 1~3 AC 묶음 paradigm 정합 + cell.task_id 채움 + derived_from 'task-plan.json') ③ test +3 (backward compat + green cell + yellow cell additive) ④ DEC-2026-05-25-axis-a-phase-4-3 신설 ⑤ release ceremony (plugin.json + package.json 9.1.1 → 9.2.0 + CHANGELOG + INDEX + STATUS + CLAUDE.md sync). **STOP-3**: workspace 727 → **730/730 pass** (traceability-matrix-builder 82→85 / +3) + skill-citation 0 stale + release-readiness 17/17 ready:true (보존) + drift-validator 0 breaking (보존) + version 3-way 9.2.0 + breaking 0 = MINOR. **3 LL 자산화**: LL-v920-01 TASK layer additive only paradigm 본격 입증 (Senior risk #4 회피 / DO-178C 6 layer 격상 + 기존 PoC 분모 미영향 본격 보장) + LL-v920-02 schema field add MINOR cadence paradigm 본격 입증 (optional + properties 추가 + required 불포함 = backward compat) + LL-v920-03 3 release 연속 cadence 본격 입증 (session 46차 v9.1.0+v9.1.1+v9.2.0 / additive only / cooling-off ❌ 자격 / Phase 4-4 v10.0.0 MAJOR = structural / cooling-off ≥24h 의무). **본 session 누적 3 release** = v9.1.0 (Phase 4-1) + v9.1.1 (Phase 4-2) + v9.2.0 (Phase 4-3). **차기 carry** (Phase 4-4~4-5): Phase 4-4 v10.0.0 MAJOR (A7+A8 gate 번호 재정렬 + revisit_edges + gate #plan trio enforcement / Senior BLOCKER-2 잔여 / cooling-off ≥24h) + Phase 4-5 v10.1.0 MAJOR (ticket subsystem 6-stage migration + Type 2 외부 사용자 ≥ 1 corroboration 의무 trigger). DEC-2026-05-25-axis-a-phase-4-3. Resolves F-CHA-003 Phase 4-3 부분 해소 (5 axis 종결 / gate trio + ticket migration = Phase 4-4+4-5 carry).

**기준일 보존**: 2026-05-25 ( **session 46차 — v9.1.1 PATCH release — axis A plan stage paradigm 본격 구현 Phase 4-2 시행 (additive only / breaking 0)** — v9.1.0 release 직후 사용자 "gogo" 결단 → Phase 4-2 본격 연속 시행 / 5 release 분산 cadence (Phase 4-1~4-5). **minimal scope** (LL-v911-01): ① A4 agents/plan-agent.md placeholder → body (frontmatter skills 7 사전 주입 / spec-agent.md 동형 paradigm / 책임 범위 + Absolute priorities 7개 + 호출 절차 8 step + 산출 자산 4종) ② A5 chain-driver/src/gate-eval.js REQUIRED_VALIDATORS_PER_STAGE.plan = ['plan-coverage-validator', 'schema-validator'] 1 line additive ③ test +1 — chain-driver/test/gate-eval.test.js requiredValidators('plan') 본격 검증 ④ DEC-2026-05-25-axis-a-phase-4-2 신설 ⑤ release ceremony (plugin.json + package.json 9.1.0 → 9.1.1 + CHANGELOG + INDEX + STATUS + CLAUDE.md sync). ** 본격 변경 ❌ axis** (LL-v911-01): hooks-bridge.js TRIGGER_PATTERNS = 이미 v9.0 안 등재 ✅ / stage-graph.js getGateForStage('plan') = null 유지 (Cluster 1 X 재번호 = Phase 4-4 v10.0.0 MAJOR carry) / gate-eval outcome enforcement plan 분기 = plan-coverage-validator 자체 본격 작동 + gate-eval generic findings 본격 작동 = 추가 분기 ❌. **STOP-3**: workspace 726 → **727/727 pass** (chain-driver 223→224 / +1) + skill-citation 0 stale (plan-agent body 신규 cross-ref existing) + release-readiness 17/17 ready:true (보존) + drift-validator 0 breaking (보존) + version 3-way 9.1.1 + breaking 0 = PATCH. **2 LL 자산화**: LL-v911-01 minimal scope Phase 본격 진입 paradigm + LL-v911-02 후속 Phase 자연 cadence 본격 입증 (Phase 4-1 의 자연 후속 = 같은 session 안 본격 연속 시행 자격 / "gogo" 결단 / additive only / cooling-off ❌). **본 session 누적 2 release** = v9.1.0 (Phase 4-1) + v9.1.1 (Phase 4-2). **차기 carry** (Phase 4-3~4-5): Phase 4-3 v9.x MINOR (A6 traceability subtask_ids.chain3_plan additive) + Phase 4-4 v10.0.0 MAJOR (A7+A8 gate 번호 재정렬 + revisit_edges + gate #plan trio enforcement / cooling-off ≥24h) + Phase 4-5 v10.1.0 MAJOR (ticket subsystem 6-stage migration + Type 2 외부 사용자 ≥ 1 corroboration 의무 trigger). DEC-2026-05-25-axis-a-phase-4-2. Resolves F-CHA-003 Phase 4-2 부분 해소.

**기준일 보존**: 2026-05-25 ( **session 46차 — v9.1.0 MINOR release — axis A plan stage paradigm 본격 구현 Phase 4-1 시행 ( paradigm-level / additive only / breaking 0)** — 사용자 결단 "PoC 안 할꺼야 / 플러그인 적용 못했던 것 위주" + "axis A" + "β cadence" + "진행" → 45차 carry "ζ-1 의식적 제외" 본격 retract. 4원칙 ladder full (Phase 1.1~1.6 깊이 숙지 + plan.md 작성 / Phase 2 3 agent 병렬 토론 / Phase 3 묶음 결단 Cluster 1~8). **Phase 2 3 agent 본격 결과**: Senior REVISE-2 @ 0.81 (2 BLOCKER + 5 risk) / 공식 docs REVISE-1/2/3 (BLOCKING ❌) / Industry isomorphic GREEN (6 production cases — Copilot Workspace + Cursor Plan Mode + Aider Architect + AWS AI-DLC + ThoughtWorks + GitHub Community). **Phase 4-1 본격 시행** (Senior + 공식 + Industry REVISE 본격 흡수): ① `schemas/task-plan.schema.json` 신설 (Nygard 5 category + security_compliance + SQuaRE 9 + alternatives ≥3 schema-level enforce + ac_refs.maxItems:3) ② `tools/plan-coverage-validator` workspace 신설 (npm 21번째 / **exit code contract** Senior BLOCKER-2 흡수 / **28/28 test pass** — 5 validator 함수 + 5 Senior BLOCKER-2 integration scenario) ③ plan-\* 3 skill body (placeholder → body / Senior risk #5 enumerated count 회피) ④ release ceremony (plugin.json + package.json 9.0.6 → 9.1.0 + CHANGELOG 본 entry + DEC-2026-05-25-axis-a-phase-4-1 + INDEX 최상단 + 본 STATUS entry + CLAUDE.md sync). **STOP-3**: workspace 698 → **726/726 pass** (28 신규 / 무회귀) + skill-citation **0 stale** (DEC 신설 후 7 dead-link 해소) + release-readiness 17/17 ready:true (보존) + drift-validator 0 breaking (보존) + version 3-way 9.1.0 + breaking 0 = MINOR. **4 LL 자산화**: LL-v910-01 self-referential corrective drift retract paradigm 본격 입증 (45차 carry "ζ-1 의식적 제외" 본격 retract / 사용자 명시 결단 trigger + paradigm-level scope) + LL-v910-02 β cadence 본격 활용 paradigm (Phase 1~3 본 session / Phase 4 차기 session default / 단 사용자 "진행" 시 retract — additive only scope 한정) + LL-v910-03 Senior BLOCKER-2 exit code contract paradigm 본격 입증 (drift-validator silent sink LL-v903-01 + chain-coverage-validator default projectRoot LL-v904-01 동형 paradigm 회피) + LL-v910-04 3 agent 병렬 토론 paradigm 본격 입증 (Senior 2 BLOCKER 흡수 → Phase 4-3 v10.0.0 scope 본격 축소). **차기 carry** (Phase 4-2~4-5 / 5 release 분산 cadence): Phase 4-2 v9.x PATCH (A4 plan-agent body + A5 chain-driver plan 분기) + Phase 4-3 v9.x MINOR (A6 traceability subtask_ids.chain3_plan additive) + Phase 4-4 v10.0.0 MAJOR (A7+A8 gate 번호 재정렬 + revisit_edges / cooling-off ≥24h) + Phase 4-5 v10.1.0 MAJOR (ticket subsystem 6-stage migration + Type 2 외부 사용자 ≥ 1 corroboration 의무 trigger). DEC-2026-05-25-axis-a-phase-4-1. Resolves F-CHA-003 (plan stage paradigm 위배) Phase 4-1 부분 해소.

**기준일 보존**: 2026-05-24 ( **session 43차 — v9.0.6 MINOR release — Phase 2 LL-v903 follow-up 묶음 (LL-v903-01 scope-out + LL-v903-03 시행 + LL-v906-01/02 자산화) + 시행 직전 사실 검증 보강 paradigm 재발 v5 (5회 연속)** — v9.0.5 release 직후 사용자 결단 "진행 하자" → "A. 모두 순차" → Phase 2 = 본 v9.0.6 MINOR. additive criterion / breaking 0. **시행 직전 사실 검증 보강 (LL-fsim-11 paradigm 본격 재발 v5 / 5회 연속 재발 / paradigm enforcement 본격 입증대 v5)**: v9.0.3 carry note "LL-v903-01 drift-validator silent sink → exit ≥ 1 hard gate 전환 v+1" 시행 직전 사실 검증 시 사실 오류 발견 — drift-validator src/cli.js:292 `process.exit(totals.breaking > 0 || totals.errors > 0 ? 1 : 0)` 이미 hard gate. v9.0.3 점검 명령 `node ... 2>&1 | tail -30; echo "EXIT=$?"` 의 `$?` = tail 의 exit code (= 0 / 정상), drift-validator 자체 exit code 가 아님 (bash pipe + tail exit code misunderstand). **사용자 묶음 결단**: D1 LL-v903-01 scope-out ( 사실 오류 / 이미 hard gate / LL-v906-01 자산화) / D2 LL-v903-03 시행 — release-readiness check17 신설 (marketplace.json description ↔ chain 6-stage sync) / D3 release-readiness test stale (13 → 17 미갱신 silent sink) 동반 정정 — LL-v906-02 자산화 / D4 v9.0.6 MINOR release (criterion add precedent v8.6.0/v8.9.0 일관). **시행** (additive criterion / breaking 0): ① `scripts/release-readiness.js` `check17_marketplaceStageSync()` 함수 신설 + main results array 추가 (3 axes 검사: "6단계 chain harness" 또는 "6-stage" 표기 + 5 stage name discovery/spec/plan/test/implement 모두 포함 + legacy "planning →" 미포함) / ② `scripts/test/release-readiness.test.js` 13→17 갱신 (3 location + criterion ids array 4 추가: code_pointer_coverage + graph_integrity + preflight_tools + marketplace_stage_sync) / ③ release ceremony (plugin.json + package.json 9.0.5 → 9.0.6 + CHANGELOG v9.0.6 entry + DEC + INDEX + 본 STATUS entry + CLAUDE.md sync). ** silent test sink 발견 (LL-v906-02)**: `scripts/test/` 가 workspace test 외 (`npm test --workspaces` 미포함) → release-readiness.test.js 가 hard-coded 13 → 실 16/17 stale 누적 carry. **STOP-3**: workspace 698/698 pass (보존 / scripts/test 미포함) + release-readiness.test.js **14/14 pass** (10→14 / 4 fail fix) + release-readiness **17/17 ready:true** (16→17 / check17 신설 통과) + chain-coverage-validator 38/38 (보존) + skill-citation 0 stale (보존) + drift-validator 0 breaking (보존) + version 3-way 9.0.6 + breaking 0 = MINOR. **3 LL 자산화**: LL-v906-01 (시행 직전 사실 검증 보강 paradigm 본격 재발 v5 / 5회 연속 재발 / LL-fsim-11 + LL-v902-01 + LL-v903-01(scope-out) + LL-v904-01 + LL-v905-01 정합 / paradigm enforcement 본격 입증대 v5 / carry note 자체도 검증 의무) + LL-v906-02 (silent test sink paradigm 본격 발견 / scripts/test/ workspace 외 / v+1 carry — workspace 통합 또는 hook gate enforcement) + LL-v906-03 (criterion add cadence paradigm 본격 정착 / v8.6.0 → v8.9.0 → v9.0.6 MINOR 일관 / semver 정합). **차기 session carry** (deadline 없음): F-MB-POC-002 (poc-08 path 안 메타 embed + poc-11 "[source absolute]" prefix marker / cooling-off ≥ 24h) + LL-v906-02 follow-up (scripts/test/ silent sink — workspace 통합 또는 hook gate) + F-SIM-003 strict_mode v+1 default 전환 = v9.0.7 Phase 3 (본 session 안 시행 중). **본 session 누적 4 release** = v9.0.3 + v9.0.4 + v9.0.5 + v9.0.6. DEC-2026-05-24-v906-marketplace-stage-sync-check. Resolves LL-v903-03 + LL-v903-01 (scope-out).

**기준일 보존**: 2026-05-24 ( **session 43차 — v9.0.5 PATCH release — Phase 1 F-MB-POC-001 5 PoC sweep + 시행 직전 사실 검증 보강 paradigm 본격 재발 v4 (single PoC 가정 → 5 PoC 광범위 drift + poc-08/11 더 깊은 별 convention drift 발견)** — v9.0.4 release 직후 사용자 결단 "진행 하자" → "A. 모두 순차 (3 release)" 묶음 결단 → Phase 1 = v9.0.5 PATCH F-MB-POC-001. additive doc / breaking 0. **시행 직전 사실 검증 보강 (LL-fsim-11 paradigm 본격 재발 v4 / 4회 연속 재발 / paradigm enforcement 본격 입증대 v4)**: v9.0.4 carry note "poc-03 산출물 drift 별 plan" single PoC 가정이 시행 직전 사실 검증 시 5 PoC 광범위 drift 로 진화 (poc-03 + 06/07/08/11 모두 v7.0.0 rules.json → business-rules.json rename 미전파) + poc-08/11 더 깊은 별 convention drift 추가 발견. **사용자 묶음 결단**: D1 F-MB-POC-001 5 PoC sweep (poc-03 + 06/07/08/11 `input/rules.json` → `input/business-rules.json` + poc-03 cross_links repo-absolute → PoC root relative) + D2 poc-08 잔여 9 broken (path 안 메타 embed) + poc-11 잔여 7 broken ("[source absolute]" prefix marker) = F-MB-POC-002 후보 별 carry (Y 옵션 / Senior 의도 의문 cooling-off 권장) + D3 v9.0.5 PATCH release. **시행** (additive doc / breaking 0): ① `examples/poc-03-realworld-nestjs/.aimd/output/{planning,behavior,test}-spec.json` `examples/poc-03-realworld-nestjs/` repo-absolute prefix 제거 + `output/rules/rules.json` → `output/rules/business-rules.json` (replace_all sweep) / ② `examples/poc-{06,07,08}-*/​.aimd/output/planning-spec.json` + `examples/poc-11-*/​.aimd/output/{planning,behavior}-spec.json` `input/rules.json` → `input/business-rules.json` (replace_all sweep) / ③ release ceremony (plugin.json + package.json 9.0.4 → 9.0.5 + CHANGELOG v9.0.5 entry + DEC + INDEX + 본 STATUS entry + CLAUDE.md sync). ** self-corroboration ≥ 3 PoC full fix (§8.1 strict 정합 ✓)**: poc-03 14 broken → **0** + poc-06 2 broken → **0** + poc-07 2 broken → **0**. partial fix 2 PoC: poc-08 10 → 9 (rules.json 1 fix / path 안 메타 embed 9 잔여 / F-MB-POC-002 carry) + poc-11 11 → 7 (rules.json 4 fix / "[source absolute]" 7 잔여 / F-MB-POC-002 carry). **STOP-3**: workspace 698/698 pass (보존 / PoC 산출물 변경 = test 무관) + chain-coverage-validator 38/38 (보존) + release-readiness **16/16 ready:true** + skill-citation 0 stale + drift-validator 0 breaking (보존) + version 3-way 9.0.5 + breaking 0 = PATCH. **3 LL 자산화**: LL-v905-01 (시행 직전 사실 검증 보강 paradigm 본격 재발 v4 / 4회 연속 / LL-fsim-11 + LL-v902-01 + LL-v903-01 + LL-v904-01 정합 / paradigm enforcement 본격 입증대 v4) + LL-v905-02 (Senior 의도 의문 cooling-off paradigm 본격 정착 / poc-11 "[source absolute]" prefix marker / Adzic SBE 함정 회피 cadence 정합 / v9.0.4 strict_mode 전환 carry 동형 패턴) + LL-v905-03 (partial fix + carry 명시 paradigm / 3 PoC full fix + 2 PoC partial fix + carry 정직 표기 / §8.1 strict 충족 + 잔여 별 axis). **차기 session carry** (deadline 없음): F-MB-POC-002 (poc-08 path 안 메타 embed + poc-11 "[source absolute]" prefix marker / Senior 의도 의문 cooling-off ≥ 24h 권장) + LL-v903-01 + LL-v903-03 follow-up 묶음 = v9.0.6 Phase 2 + F-SIM-003 strict_mode v+1 default 전환 = v9.0.7 Phase 3 (본 v9.0.5 fix 후 자연 가능). **본 session 누적 3 release** = v9.0.3 + v9.0.4 + v9.0.5. DEC-2026-05-24-v905-poc-rules-rename-sweep. Resolves F-MB-POC-001.

**기준일 보존**: 2026-05-24 ( **session 43차 — v9.0.4 PATCH release — G axis F-SIM-003 carry corrective + 시행 직전 사실 검증 보강 paradigm 본격 재발 v3 (F-MB-VAL-001 chain-coverage-validator default projectRoot 결함 본격 fact 발견 / 1차 carry "strict_mode v+1 default 전환" 보다 더 깊은 fact-mismatch / 5 PoC self-corroboration 입증)** — v9.0.3 release 직후 사용자 결단 "다음 session carry G axis 진행하자" → cooling-off skip (precedent: v8.14.1) + 본 v9.0.4 PATCH. additive tool fix / breaking 0. **시행 직전 사실 검증 보강 (LL-fsim-11 paradigm 본격 재발 v3 / v9.0.2 + v9.0.3 동형 패턴 cadence 본격 정착)**: v9.0.3 carry note "F-SIM-003 v+1 default strict_mode 전환 carry / poc-05 14 broken paths / 산출물 vs 도구 결함 분리 검증 필요" 시행 직전 사실 검증 시 더 깊은 fact-mismatch 발견 — 산출물 cross-ref path convention = 5 PoC 모두 PoC root 기준 일관 (poc-03/04-mini/05/14/06/07 self-corroboration) + chain-coverage-validator default projectRoot = behavior 파일 dirname = .aimd/output/ ( PoC root 아님) → relative path "output/rules/..." resolve = .aimd/output/output/rules/... ( output prefix 중복 / 본격 도구 default 결함). ** 본격 결함 = chain-coverage-validator default projectRoot mismatch (도구 결함)** / 산출물 정상 / 1차 strict_mode 전환 carry 는 별 axis valid 후보 (본 fix 전 전환 시 false positive 14 broken paths 격상 = Adzic SBE 함정). **사용자 묶음 결단**: D1 fix 옵션 B-1 default auto-detect (.aimd/output/ 패턴 자동 거슬러 PoC root / additive / fallback backward-compat) / D2 finding ID F-MB-VAL-001 별 등재 (methodology-body validator drift namespace / F-MB-DRIFT-001 동형 패턴) / D3 v9.0.4 PATCH release ceremony / D4 F-SIM-003 strict_mode v+1 default 전환 carry 별 axis 보존. **시행** (additive tool fix / breaking 0): ① `tools/chain-coverage-validator/src/validator.js` autoDetectProjectRoot 함수 신설 + export (.aimd/output/ 패턴 자동 감지 / Windows backslash + Unix slash 모두 처리 / fallback backward-compat) / ② `tools/chain-coverage-validator/src/cli.js` autoDetectProjectRoot import + default 변경 + help text 갱신 / ③ `tools/chain-coverage-validator/test/validator.test.js` 신규 describe block 4 test 추가 (autoDetectProjectRoot Unix + Windows + fallback + null 방어 / 34→38 pass) / ④ `tools/chain-coverage-validator/package.json` version 0.2.0 → 0.3.0 + description 갱신 / ⑤ release ceremony (plugin.json + package.json 9.0.3 → 9.0.4 + CHANGELOG v9.0.4 entry + DEC + INDEX + 본 STATUS entry + CLAUDE.md sync). ** 본격 fix 입증**: poc-05 직접 invoke (비명시 `--project-root`) **14 broken paths → 0** ✅ + PoC self-corroboration ≥ 2 (poc-05 14→0 + poc-04-mini 0 회귀 ❌ + poc-14 0 회귀 ❌) = §8.1 strict 정합 ✓. ** 부산물 발견**: poc-03 비명시 invoke 시 본 fix 후에도 잔여 broken paths = (① rules.json → business-rules.json v7.0.0 rename 미전파 ② cross_links repo-absolute convention 사용 / 다른 PoC 와 다름) → **F-MB-POC-001 후보** (별 axis carry / 본 v9.0.4 외). **STOP-3**: workspace 694/694 → **698/698 pass** (autoDetectProjectRoot 4 신규 test additive) + chain-coverage-validator 34/34 → 38/38 + release-readiness **16/16 ready:true** + skill-citation 0 stale + drift-validator analysis.phase-flow 0 breaking (보존) + version 3-way 9.0.4 + breaking 0 = PATCH. **3 LL 자산화**: LL-v904-01 (시행 직전 사실 검증 보강 paradigm 본격 재발 v3 / LL-fsim-11 + LL-v902-01 정합 / 3회 연속 재발 / paradigm enforcement 본격 입증대) + LL-v904-02 (silent sink paradigm deeper layer / 결정적 도구 enforcement 가 본격 hook gate cascade 안 될 때 silent sink 잔존 / chain-coverage-validator direct invoke + release-readiness #1 marketplace.json 모두 v+1 carry 후보) + LL-v904-03 (PoC self-corroboration ≥ 2 paradigm 본격 입증 / §8.1 strict 정합 / 도구 fix → 다중 PoC 직접 invoke → 회귀 0 입증 + 부산물 carry 명시 cadence). **차기 session carry** (deadline 없음): F-SIM-003 strict_mode v+1 default 전환 (별 axis 본격 보존 / 본 v9.0.4 fix 후 자연 가능 / cooling-off ≥ 24h 권장) + F-MB-POC-001 (poc-03 산출물 drift 별 plan) + LL-v903-01 follow-up (drift-validator phase-flow breaking exit ≥ 1 v+1) + LL-v903-03 follow-up (release-readiness #1 marketplace.json grep v+1). **본 session 누적 2 release** = v9.0.3 (L1 audit carry / commit `8f4d37b`) + v9.0.4 (G axis carry / 본 release). DEC-2026-05-24-v904-fsim-003-deeper-fact. Resolves F-MB-VAL-001.

**기준일 보존**: 2026-05-24 ( **session 43차 — v9.0.3 PATCH release — 6-stage chain harness L1 결정적 점검 carry corrective (F-MB-DRIFT-001 + F-MB-DOC-003 / forward-only / additive doc / breaking 0)** — v9.0.2 release 직후 사용자 결단 "분석부터 시작 되는 플로우 점검" L1 결정적 점검 시행. 범위 = 전체 chain e2e (analysis → discovery → spec → plan → test → implement / 6-stage / 11 axis). **결과**: 8/11 green + 3 ⚠️ silent drift 표면. ① **F-MB-DRIFT-001** (medium / 6개월 carry) = `flows/analysis.phase-flow.mermaid` 안 `template-analyze` phase 부재 (v3.4.0 G4 신설 후 `.json` 만 갱신 + `.mermaid` 미반영 / drift-validator emit breaking 하지만 exit 0 = release-readiness gate cascade 안 됨 = silent drift sink) → fix: subgraph `P_template_analyze` 신설 + edge `P_input --> P_template_analyze` 추가 / ② **F-MB-DOC-003** (low / 4-area count drift) = CLAUDE.md "17종"→실측 20 + "39종"→실측 44 / package.json "16 tools"→20 / marketplace.json "4단계 planning"→6단계 discovery (v9.0 미반영 = plugin install 첫 표면 drift) → fix: 4 area 갱신 (v8.7 sql-inventory rename 정합 + v8.9.0 dep-graph 3 신설 + v9.0 6-stage 정합) / ③ **G axis F-SIM-003** = poc-05 cross-ref 14 MEDIUM broken paths (strict_mode=false 통과 / v+1 default carry) → 별도 plan carry (cooling-off 권장 / poc-05 산출물 결함 vs 도구 결함 분리 검증 필요). **사용자 묶음 결단**: D1 F-MB-DRIFT-001 시행 / D2 F-MB-DOC-003 시행 / D3 v9.0.3 PATCH release ceremony / D4 G axis 별도 plan carry. **시행** (additive doc / breaking 0): ① `flows/analysis.phase-flow.mermaid` template-analyze subgraph + edge 추가 (drift-validator 0 breaking 시행 직후 실측) / ② `CLAUDE.md` line 97 (39→44) + line 99 (17→20 + enumerate 갱신) + 현재 v9.0.2→v9.0.3 + 직전 release entry / ③ `package.json` description "16 tools"→"20 tools" + version 9.0.2→9.0.3 / ④ `.claude-plugin/marketplace.json` description "4단계 planning"→"6단계 discovery" / ⑤ release ceremony (plugin.json + CHANGELOG + DEC + INDEX + 본 entry). **STOP-3**: workspace 694/694 + release-readiness 16/16 ready:true + skill-citation 0 stale + drift analysis.phase-flow 0 breaking + version 3-way 9.0.3 + breaking 0 = PATCH. **3 LL 자산화**: LL-v903-01 (silent drift sink paradigm 본격 표면화 = drift-validator breaking exit 0 carry sink / v+1 hard gate 전환 carry) + LL-v903-02 (L1 결정적 점검 paradigm enforcement 본격 표면화 cadence / paradigm 안정점 본격 재도달 v4 / 11 axis 결정적 도구 일괄 실행 + 횡단 cross-check = sub-agent 비용 0 + 양심 의존 0% + drift 자동 표면) + LL-v903-03 (marketplace.json description = plugin install 첫 표면 / release-readiness #1 grep 추가 후보 v+1). **차기 session carry**: G axis F-SIM-003 strict_mode 별도 plan (cooling-off ≥ 24h 권장 / poc-05 산출물 vs 도구 path resolution base 분리 검증 후 결단) + LL-v903-01 follow-up (drift-validator phase-flow breaking exit ≥ 1 격상 v+1) + LL-v903-03 follow-up (release-readiness #1 marketplace.json grep). **본 session = 단발 v9.0.3 release** (audit + drift fix + release ceremony 합산). DEC-2026-05-24-v903-l1-flow-audit-carry-corrective. Resolves F-MB-DRIFT-001 + F-MB-DOC-003.

**기준일 보존**: 2026-05-24 ( **session 42차 — v9.0.2 PATCH release — paradigm + dep-graph L2 audit carry corrective (F-PA-DRIFT-001 + F-MB-DOC-002 / forward-only / Senior fact-check paradigm 재발)** — v9.0.1 audit 직후 (commit `70a2e8e` STATUS 42차 audit entry 등재) 사용자 결단 "캐리 실행" → 본 v9.0.2 시행. **시행 직전 사실 검증 보강 (LL-fsim-11 paradigm 본격 재발)**: F-MB-DOC-002 가 1차로 단순 ambiguity (CLAUDE.md "5종" vs 실측 4) 로 등재됐으나, 시행 직전 사실 검증 시 더 깊은 fact-mismatch 발견 — `b9615d0` commit message + `DEC-2026-05-23-dep-graph-p1-p4 §3.1` + STATUS 32차 entry 안 "schema 5 신설 (...discovery-output + plan-spec)" claim 자체가 사실 오류 (`discovery-output.schema.json` + `plan-spec.schema.json` = git history 안 전혀 부재 / `cycle-carry.schema.json` = v8.8.0 commit `4523116` 신설 별 axis / v8.9.0 의도 5 / 실 stat = 3 + v8.8.0 cycle-carry carry-over 1 = 현 4). **사용자 묶음 결단**: D1 F-PA-DRIFT-001 시행 / D2 F-MB-DOC-002 옵션 B (forward-only / history doc immutable / LL-i-52 정합) / D3 v9.0.2 PATCH release ceremony. **시행** (additive doc / breaking 0): ① `methodology-spec/finding-system.md:474+476` F-SIM-012/014 status "open" → "closed v8.14.4" + DEC-2026-05-23-fsim-012-014-close §1/§2 cross-link / ② `CLAUDE.md` line 132 v8.9.0 entry "schema 5" → "schema 4 ( v9.0.2 정정 / 실 stat 3 + v8.8.0 cycle-carry 1 = 4 / commit message + DEC §3.1 claim 사실 오류 / discovery-output + plan-spec 본 적 없음 / history doc immutable 보존)" forward-only / ③ release ceremony (plugin.json + package.json + CHANGELOG + DEC + INDEX + 본 entry). **history doc 변경 ❌** (b9615d0 commit message + DEC §3.1 + STATUS 32차 entry / audit-time 기록 보존 / LL-i-52). **42차 audit entry 변경 ❌** (audit-time 기록 보존 / 본 entry = execution-time 분리). **STOP-3**: workspace 694/694 + release-readiness 16/16 ready:true + skill-citation 0 stale + drift 3-way + version 3-way 9.0.2 + breaking 0 = PATCH. **3 LL 자산화**: LL-v902-01 (main agent 시행 직전 사실 검증 paradigm 본격 재발 / Senior 사실 검증 보강 본격 입증대) + LL-v902-02 (history doc immutable forward-only correction / LL-i-52 본격 재적용) + LL-v902-03 (L2 audit + 시행 분리 paradigm 본격 입증대 / audit → 결단 → 사실 검증 보강 → 시행 cadence = paradigm 안정점 본격 재도달 v3). **차기 carry**: 없음 (본 v9.0.2 = session 42차 audit carry 완결 cycle 종결). **본 session (42차) 누적 2 release** = v9.0.1 (coherence docs / 직전 session 추정) + v9.0.2 (audit carry corrective / 본 session). DEC-2026-05-24-v902-audit-carry-corrective. Resolves F-PA-DRIFT-001 + F-MB-DOC-002.

**기준일 보존**: 2026-05-23 ( **session 42차 — paradigm + dep-graph L2 audit (release no / 2 doc-only drift carry / 사용자 결단 "보고만")** — v9.0.1 release 직후 사용자 결단 "패러다임 + 그래프 점검 / 의도대로 동작 확인". 4원칙 ladder full (plan `~/.claude/plans/imperative-puzzling-flurry.md` / 2 Explore agent + 1 Plan agent / 사용자 결단 L2 + 병렬 + 보고만) → 8 실 도구 실행 + 16-gate 결정적 검증. **PASS 14/16**: workspace test 694/694 + release-readiness 16/16 ready:true v9.0.1 + chain-coverage-validator 34/34 + static-runner 26/26 + chain-driver 223/223 + graph-integrity-validator 13/13 + code-pointer-validator 22/22 + traceability-matrix-builder 82/82 + drift-validator 3-way (state-flow 6=6 + chain-layout 5/30/22 + layout 12/28) + skill-citation 235 doc 0 stale + version 3-way 9.0.1 + Type 3계층 + fail_mode 4 enum + state.schema 6-stage + 6 phase-flow.json + docs/dependency-graph.md SSOT + dead-link 3종 active surface 0 match. ** DRIFT 2건 carry (보고만 / 본 session 안 fix ❌)**: ① **F-PA-DRIFT-001** (low / doc-drift 내적) = `methodology-spec/finding-system.md:474+476` F-SIM ledger summary table 의 F-SIM-012/014 status 컬럼 = "open (v8.4.0 carry)" 잔존 ← 같은 file:480 한줄 summary 의 "closed v8.14.4" 와 자기 모순 (v8.14.4 PATCH row 갱신 누락 / 본문 body row 622+648 는 정합) / ② **F-MB-DOC-002** (info / ambiguity) = `CLAUDE.md` 본문 dep-graph "schemas 5종" 표기 vs 실측 4종 (artifact-graph-node + artifact-graph-edge + code-pointer + cycle-carry / 5번째 후보 명시 자료 부재) — CLAUDE.md 자체 자기 drift. **의도 정합 종합**: 두 패러다임 (no-simulation enforcement Type 3계층화 + dep-graph) 의 기계적 작동 모두 PASS = 진화 의도대로 작동 본격 입증대 (16-gate 결정적 검증). doc-level cosmetic drift 2건 만 잔존 (active 자산 작동 무영향). **차기 session 진입 권장**: ① 의제 A = F-PA-DRIFT-001 (ledger row 2건 status edit / additive doc-only) / ② 의제 B = F-MB-DOC-002 (CLAUDE.md schemas 표기 정정 또는 5번째 식별 본문 명시 / 사용자 결단 필요) / A+B 묶음 가능 = **v9.0.2 PATCH coherence docs** 후보. 두 drift 모두 cooling-off 적용 ❌ (cosmetic 4 기준 충족 / file rename 0 + cross-ref 치환 0 + 구조 변경 ❌ + plan 명시) = 다음 session 즉시 시행 자격. DEC 별도 등재 ❌ (보고만 / carry only). Resolves session 42차 audit cadence (점검 axis).

**기준일 보존**: 2026-05-23 (**session 42차 — v9.0.1 PATCH release — v9.0.0 coherence (prose + machine SSOT drift 정합)** — v9.0.0 이 런타임 SSOT(state.schema/stage-graph/sdlc.json stages)만 6-stage 마이그레이션하고 **prose 14파일 + briefing 3파일 + sdlc-4stage-flow.mermaid + phase-flow chain 링크**를 구버전(4·5단계/planning)으로 남긴 drift 청산. **실 결함 포함**: lifecycle-contract dead link(`agents/planning-agent.md` → discovery-agent.md git mv) + chain-harness-guide state enum 모순(`"planning"`/`"done"` vs current_chain 6-stage) + spec.phase-flow 부재 파일 planning.phase-flow.json 참조 + sdlc mermaid "Planning"+plan 누락 (drift-validator chain-flow master mermaid 미검사 + skill-citation prose 링크 미검사 → v9.0.0 STOP-3 통과한 잔존). **사용자 결단** "계속 진행하자": ① coherence docs 먼저(PATCH) ② briefing/ 포함 ③ machine SSOT(mermaid+phase-flow) 포함. **번호 규칙**: discovery=chain1/gate#1·spec=2/#2·plan=3/gate deferred·test=4/#3·implement=5/#4. **시행**(corrective/breaking 0): ① prose 14 (lifecycle-contract dead link+flow+매트릭스 plan row 9+data-contract plan 절+tree+재번호 / skills-axis §4·§7.2·§9.2 discovery 6+plan+count 55 / plugin-charter R3·R7·R10·R11·R12·R13+revisit_edges 8 / id-conventions / agents-axis / 17-planning-spec / flows-README dead ref / README stage·CHAIN·tree / guides 4 chain-harness-guide state enum+mermaid+matcher·first-prompt-cookbook·getting-started·common-errors) ② briefing 3 (01-main+02-first-5min+slides/methodology-deck) ③ machine SSOT (sdlc-4stage-flow.mermaid 6-stage 재작성 Planning→Discovery+plan subgraph+revisit 8 + spec/plan/test/implement.phase-flow.json prev·next chain 링크+chain 번호 test 3→4·implement 4→5). **KEEP**: planning-spec.json 산출물명+planning-spec.schema.json+planning-extraction-validator 도구+subtask_ids.chain1_planning schema key+finding-system·04-version-history history+ticket 서브시스템(skill stage=planning+traceability 4-chain). **STOP-3**: workspace 694/694 + release-readiness 16/16 + skill-citation 235 doc 0 stale + drift state-flow(6=6)+chain-layout(5)+phase-flow 짝 0 breaking + chain-driver 223/223 + version 3-way 9.0.1 + breaking 0 = PATCH. **carry**: plan-agent 본격 구현(plan-\* skill 3 + plan-spec schema + plan hard gate) = v9.x+ / README·briefing version·stat refresh(v3.6.9·v8.2.0→v9.0.x) / ticket 서브시스템 6-stage 마이그레이션(breaking) / templates/planning 폴더 rename. DEC-2026-05-23-coherence-docs-6stage. Resolves DEC-2026-05-23-discovery-stage-v9 §carry (prose coherence).

**기준일 보존**: 2026-05-23 (**session 41차 — v9.0.0 MAJOR release — discovery stage 재통합 (6-stage chain harness)** — DEC-2026-05-21 설계(planning→discovery 개칭 + plan 신설)를 현 main 위에 machine SSOT 까지 완성. 기존 feat/v4.1-hooks-carry-note 브랜치는 prose 만 6-stage 선언 + state/flows/tooling 미변경 → drift+citation 깨짐 (raw merge abort 후 본 재통합). **chain**: analysis→discovery→spec→plan→test→implement. **breaking** = state.schema stage enum + skill rename → MAJOR. **사용자 묶음 결단**: MAJOR v9.0.0 / fresh 재적용 / 기존 schema reuse(신규 0) / plan gate deferred(placeholder / gate #1~#4) / chain 1~5 순차. **시행**: state.schema 6-stage + sdlc flow(파일명 reuse) + flows/planning→discovery.phase-flow(git mv) + plan.phase-flow 신설 + drift-validator CHAIN_STAGES + chain-driver 8 src + 223 test / skills 3 rename + 6 신설 placeholder + discovery-agent + plan-agent / 산출물 planning-spec.json + 어댑터 schema(figma-extract/prompt-extract/swagger-extract/intent-classification) reuse / PoC state.json 3 마이그레이션 / hooks matcher / DEC-2026-05-23-discovery-stage-v9 + DEC-2026-05-21 등재 / CLAUDE.md 6-stage + plugin.json desc. **STOP-3**: workspace 694/694 + drift state-flow(6=6)+chain-layout(5 stage) + chain-driver 223/223 + skill-citation 235 doc 0 stale + release-readiness 16/16 ready + version 3-way 9.0.0 = MAJOR. **carry**: plan-agent 본격 구현(plan-\* skill 3 + plan-spec schema + plan hard gate) + 코herence docs(lifecycle-contract/agents-axis/skills-axis/README 6-stage prose 정합) = v9.x+. DEC-2026-05-23-discovery-stage-v9. Resolves DEC-2026-05-21.

---

## v8.x archive (2026-05-25 cleanup — session 40차 이하)

**기준일 보존**: 2026-05-23 (**session 40차 — v8.14.4 PATCH release — F-SIM-012 + F-SIM-014 closed (시뮬레이션 dogfood F-SIM ledger 잔존 carry 0 도달)** — v8.14.3 carry 마지막 2건 종결. 사용자 "추천" 위임 → 후보 F-SIM-012/014 선정 + 처리 방향 묶음 결단 둘 다 권장 채택. **F-SIM-012**: `severity_distinct_count` gauge 가 F-SIM-002 로 schema+builder 에 이미 존재 (audit signal) + schema 약속 "release-readiness #14 sentinel" 미구현 → 하드 release-gate sentinel scope-out (distinct==1 = 작은 all-must PoC[poc-14] 정상값 → §8.1 단일 PoC false-positive) → gauge 충분 close + schema 설명 정정. **F-SIM-014**: `analysis-form-validation-fe` 의도적 FE 전용 (name -fe / track=FE) 유지 + BE schema validation (Pydantic/dataclass/Joi-BE) 별도 future skill 후보 문서화 → scope-out close (F-SIM-016 선례 동형 / breaking 0). **결과**: F-SIM-001~016 전부 처분. **시행** (additive doc + schema 설명 정정 / breaking 0): finding-system F-SIM-012/014 status closed + summary + traceability-matrix.schema.json `severity_distinct_count` 설명 정정 + 3-way sync 8.14.3→8.14.4 + DEC-2026-05-23-fsim-012-014-close + INDEX 최상단 + CLAUDE.md sync. **STOP-3**: workspace 694/694 pass (보존) + version 3-way 8.14.4 + skill-citation 0 stale + breaking 0 = PATCH. DEC-2026-05-23-fsim-012-014-close. Resolves F-SIM-012 + F-SIM-014.

**기준일 보존**: 2026-05-23 ( **session 39차 — v8.14.3 PATCH release — F-SIM-016 closed (R19 Tier 2 environment-dependent risk sub-axis paradigm 진화 / Tier 3 격상 ❌)** — v8.14.2 carry F-SIM-016 본격 종결. 사용자 결단 "나머지 진행 하자" → #1 채택. **paradigm self-correction 본격 입증대**: v8.14.1 carry note "Tier 3 영구 reject 격상" 사실 잘못 발견 (Tier 3 = simulated only / Senior 사실 검증 보강 paradigm 재발 = main agent self-fact-check / LL-fsim-11 확장) → Tier 3 격상 ❌ + Tier 2 sub-axis 본격 명시. **시행** (additive doc / breaking 0): plugin-charter R19 sub-axis patch + finding-system F-SIM-016 closed + memory feedback_environment_dependent_tools_scope_out 본격 신설 (feedback type) + MEMORY.md index + 3-way sync 8.14.2 → 8.14.3 + CHANGELOG + INDEX + CLAUDE.md sync + DEC-2026-05-23-fsim-016-environment-dependent-scope-out. **2 LL** (LL-fsim-18 main agent self-fact-check + LL-r19-04 Tier 2 sub-axis paradigm 진화). **본 session 누적 4 release** (v8.14.0 MINOR + v8.14.1 PATCH + v8.14.2 PATCH + v8.14.3 PATCH). **차기 session carry** (deadline 없음): poc-03 / poc-04-mini / poc-02 / Type 2 axis + F-SIM-012 (severity_distinct_count gauge metric / paradigm-level additive) + F-SIM-014 (analysis-form-validation-fe BE cover / breaking minor risk). DEC-2026-05-23-fsim-016-environment-dependent-scope-out. Resolves F-SIM-016.

**기준일 보존**: 2026-05-23 ( **session 39차 — v8.14.2 PATCH release — poc-03 chain 4 GREEN = deadline 없는 carry 정직 표기 + Senior STRONG-STOP signal 2종 본격 입증 + paradigm enforcement 본격 입증대** — Type 1.5 second arm sprint 본격 종결. 사용자 결단 ladder = "이제 진행 하자" → C (Type 1.5 second arm) → A1+B2+C1+D1+E2+sqlite → Senior REVISE-3 STRONG-STOP 2종 → REVISE 전면 흡수 → C3.5 pre-flight smoke FAIL → 옵션 B (carry 정직 표기). **Senior STRONG-STOP 2종 입증**: STRONG-STOP-1 BLOCKER (poc-03 source impl-only + characterization test paradigm 의무) + STRONG-STOP-2 HIGH (sqlite scope expansion + argon2 native build Windows + Node 22 fail → 본격 입증 = npm install fail + jest 본격 install ❌). **paradigm enforcement 본격 입증대 **: Senior 사실 검증 보강 paradigm 2회 재발 (poc-02 source empty + poc-03 npm install fail) + pre-flight smoke STOP-3 hard gate 의무 paradigm 자산화 + commit-block 회피 꼼수 ❌ paradigm 본격 재작동 + 14차 retract pattern 회피 본격 정합. **시행** (additive doc / breaking 0): plan §9 본 sprint 종결 + DEC + plugin.json + package.json 8.14.1→8.14.2 (3-way sync) + CHANGELOG v8.14.2 entry + INDEX + CLAUDE.md sync + memory project_v8140_release_status.md 갱신. **4 LL 자산화** (LL-fsim-14~17). **본 session 누적 3 release** (v8.14.0 MINOR + v8.14.1 PATCH + v8.14.2 PATCH). **차기 session carry** (deadline 없음): poc-03 (npm install fail / Docker 후보) + poc-04-mini React (FE) + poc-02 Spring Boot 3 (source clone) + Type 2 axis (OSS 채택 의존). DEC-2026-05-23-poc-03-carry-acknowledged. Resolves Type 1.5 second arm sprint = paradigm 정합 carry 정직 표기.

**기준일 보존**: 2026-05-23 ( **session 39차 — v8.14.1 PATCH release — F-SIM-12~16 정식 ledger 등재 + closed 2종 (F-SIM-013 + F-SIM-015 본격 흡수 자산화) + open carry 3종 정직 표기** — v8.14.0 직후 cooling-off cadence 안 additive doc only 작업. 사용자 결단 "α로 진행" (cooling-off cadence 정합). v8.4.0 carry §의제 B (5 finding 정식 ledger 등재) 본격 종결. v8.13.1 dep-graph SSOT doc only PATCH precedent 동형. **시행** (additive doc / breaking 0): methodology-spec/finding-system.md F-SIM ledger 11→16 row + body 5종 신설 + plugin.json + package.json 8.14.0→8.14.1 (3-way sync) + CHANGELOG v8.14.1 entry + DEC-2026-05-23-fsim-12-16-ledger-registration + INDEX 최상단 + CLAUDE.md sync. **closed v8.14.0** = F-SIM-013 medium (Type 1 시뮬레이션 한계 / Type 분류 3계층화 본격 흡수) + F-SIM-015 high (fail_mode schema 본격 추가). **open carry 3종** (deadline 없음) = F-SIM-012 medium (severity_distinct_count mask) + F-SIM-014 low (Pydantic BE cover) + F-SIM-016 low (Semgrep Windows MSYS2). **STOP-3**: skill-citation-validator 227 active doc / 0 stale ✅ + breaking 0 = PATCH. **본 session 누적 2 release** (v8.14.0 MINOR + v8.14.1 PATCH). 1 LL (LL-fsim-13). **차기 session carry** (v8.14.0 carry + 추가): Type 1.5 second arm (poc-03/poc-04-mini/poc-02 후보) + Type 2 (OSS 채택 의존) + F-SIM-012/014/016 (cooling-off 후 별 결단 / deadline 없음). DEC-2026-05-23-fsim-12-16-ledger-registration. Resolves project_v84_simulation_carry §의제 B.

**기준일 보존**: 2026-05-23 ( **session 39차 — v8.14.0 MINOR release — F-SIM-005 P1 corroboration #2 본격 해소 + Type 분류 3계층화 paradigm 진화 + Adzic SBE 함정 직접 회피** — F-SIM-005 P1 commit-block deadline 2026-06-01 (D-9) 본격 이행. 사용자 결단 "ㄱㄱ" (4원칙 ladder full) → 3-agent dispatch (F-015 3 VERIFIED + industry-case 9 case isomorphic + Senior REVISE-3 @ 0.83) → 사용자 묶음 결단 전면 흡수 → poc-02 source empty 발견 시 옵션 α 채택. **시행** (additive / breaking 0): ① test-spec.schema fail_mode enum 4종 (compile_import_fail/assertion_fail/dry_run_placeholder/pending) ② chain-coverage-validator validateFailModeDistribution 7번째 export (warn-only / boolean 강제) ③ CLI --test-spec wire + test 4종 (30→34 pass) ④ sdlc-4stage-flow release_eligibility.corroboration_type_levels 3계층화 + fail_mode_qualification + items + self_consistency_note 정직 표기 ⑤ poc-05/poc-14 test-spec fail_mode=assertion_fail. **F-015 권위 VERIFIED**: Beck 2002 preface p.x "doesn't even compile at first" + DO-178C bidirectional traceability + Adzic SBE 10 years. **STOP-3**: workspace test 690 → **694/694 pass** ✅ + schema-validator 4 PoC VALID + release-readiness 15/16 + JSON validity + fail_mode regression (poc-05+poc-14 corroboration_qualified=true 양측) + breaking 0 = MINOR. **Carry 정직 표기**: Type 1.5 second arm (poc-02 source empty / poc-03+poc-04-mini chain 4 yellow / deadline 없음) + Type 2 (외부 사용자 / OSS 채택 의존 / deadline 없음) — 두 carry 모두 commit-block 회피 꼼수 ❌ paradigm 정합 = release-readiness 자기 enforcement 본격 입증대 (paradigm maturity signal). 8 LL 자산화 (LL-fsim-05~12). ** paradigm 진화 안정점 본격 갱신** = Type 분류 3계층화 + fail_mode_qualification boolean 강제 + Adzic 함정 회피 enforcement. **본 session = 단발 v8.14.0 release** (9일 시한 안 paradigm 진화 + carry 정직 표기). **차기 session carry**: Type 1.5 second arm (poc-03 NestJS chain 4 yellow → green 후보 / poc-04-mini React chain 4 yellow → green 후보 / poc-02 source clone + chain 1~4 본격 시행 후보) + Type 2 (외부 사용자 / OSS 채택 트리거 의존). DEC-2026-05-23-fsim-005-corroboration-2-genuine. Resolves DEC-2026-05-17-chain-harness-e2e-simulation-audit §4.1.2 P1.

**기준일 보존**: 2026-05-23 ( **session 38차 — v8.13.3 PATCH release — dist/ 전체 정리 (잔여 v1.4.5 + v1.5.0 archive / cleanup carry 종결)** — v8.13.2 carry C-dist-v145-v15-cleanup (low) 종결. 사용자 "케리해줘" 결단 / v8.13.2 Phase D paradigm 동형 시행 (gitignored / file system mv / commit 자산 변경 0). **시행**: dist/internal-v1.4.5 + v1.5.0 → archive/dist-history/ file system mv / dist/ 폴더 = **empty** (전 4 폴더 archive 완료 / dist axis 0) / archive/dist-history/ = 4 폴더 총합. **자산 갱신**: plugin.json 8.13.2 → 8.13.3 + package.json 8.13.2 → 8.13.3 (3-way sync) + CHANGELOG v8.13.3 PATCH entry + DEC-2026-05-23-dist-cleanup-final + INDEX 최상단 + 본 STATUS entry + CLAUDE.md sync. **STOP-3**: dist/ empty ✅ + workspace test 690/690 pass (보존) + release-readiness 16/16 ready (보존) + breaking 0 = PATCH. ** carry 잔존 0 paradigm 보존** (v8.13.1+v8.13.2 paradigm 동시 보존). **본 session (33차~38차) 누적 8 release** = v8.9.0 + v8.10.0 + v8.11.0 + v8.12.0 + v8.13.0 + v8.13.1 + v8.13.2 + v8.13.3 ← 본 release. **차기 session 의제**: 새 결단 axis (paradigm 안정점 재진입 / 사용자 결단 의무). DEC-2026-05-23-dist-cleanup-final. Resolves DEC-2026-05-23-project-cleanup §7 carry.

**기준일 보존**: 2026-05-23 ( **session 37차 — v8.13.2 PATCH release — 프로젝트 정리 cleanup (4 axis archive) + paradigm 안정점 archive cadence 정착** — v8.13.1 carry 잔존 0 + paradigm 안정점 본격 재도달 후 archive cadence 시행. 사용자 결단 "프로젝트를 정리해 보자" → "추천안 묶음 전체 시행 (4 axis)" 6 cluster. **시행** (additive corrective / 정보 손실 0 / breaking 0 / cosmetic 4 기준 충족): Phase A STATUS line 25~239 (session 31차 v8.6.x 이하) → STATUS-HISTORY.md append (1807 → 2030 line) + STATUS.md 239 → **30 line** (87% ↓) / Phase B CHANGELOG line 1252~3210 (v7.0.0 MAJOR 이하) → CHANGELOG-HISTORY.md append (2870 → 4837 line) + CHANGELOG.md 3210 → **1255 line** (61% ↓) / Phase C CLAUDE.md 자세 본문 5종 → 1줄 요약 7종 통일 (byte ~50% ↓) + v8.13.2 entry / Phase D dist/internal-v1.4.3 + v1.4.4 → archive/dist-history/ file system mv (gitignored / commit 자산 변경 0) / Phase E v8.13.2 release ceremony (plugin.json + package.json 8.13.1 → 8.13.2 + CHANGELOG v8.13.2 entry + DEC-2026-05-23-project-cleanup + INDEX 최상단 + 본 STATUS entry + CLAUDE.md sync). **cutoff paradigm**: STATUS = session 31차 / CHANGELOG = v7.0.0 MAJOR (둘 다 paradigm 자연 분기 우선 / v3.6.5 R3 + v2.4 precedent 정합). **STOP-3**: STATUS 87% ↓ + CHANGELOG 61% ↓ + CLAUDE byte 50% ↓ + dist 2 폴더 archive + workspace test 690/690 pass (보존) + release-readiness 16/16 ready (보존) + dead-link 0 (보존) + breaking 0 = PATCH. 3 LL 자산화 (LL-cleanup-01~03). ** carry 잔존 0 paradigm 보존** (v8.13.1 precedent / 본 cleanup = paradigm 안정점 axis 보강만). **본 session (33차~37차) 누적 7 release** = v8.9.0 (dep-graph ceremony) + v8.10.0 (analysis_validator) + v8.11.0 (Senior REVISE-1) + v8.12.0 (legacy-risks) + v8.13.0 (xmllint R19) + v8.13.1 (operation-md SSOT) + v8.13.2 (4 axis cleanup) ← 본 release. **차기 session carry**: C-dist-v145-v15-cleanup (low / 본 plan 외 / dist/internal-v1.4.5 + v1.5.0 archive 후보 / 사용자 결단 의무). DEC-2026-05-23-project-cleanup.

**기준일 보존**: 2026-05-23 ( **session 36차 — v8.13.1 PATCH release — dep-graph SSOT 통합 (dead-link 제거 / docs/dependency-graph.md 자체 SSOT 격상) + 5 carry cascade 종결 + carry 잔존 0 (역사상 최초)** — v8.9.0 carry C-operation-md-work-folder 종결 (v8.9.0~v8.13.0 5 release 보존 carry / 본 session 마지막 잔여 carry). 사용자 "ㄱㄱ" → "추천" Option C 결단. **실측**: 16 file 안 dead-link 3종 (`dep-graph/{operation,concept,conventions}.md` / git tracked ❌ / file system 부재). **시행** (corrective dead-link / 정보 손실 0 / breaking 0): docs/dependency-graph.md 자체 SSOT 격상 (머리말 + §1 + §9) + 10 활성 file 인용 redirect (operation.md 결정 # → §X 매핑 8종 / concept.md → §1 / conventions.md §9 → §7) + history immutable 5 file 변경 ❌. **자산 갱신**: plugin.json 8.13.0 → 8.13.1 + package.json 8.13.0 → 8.13.1 (3-way sync) + CHANGELOG v8.13.1 PATCH entry + CLAUDE.md sync + DEC-2026-05-23-dep-graph-ssot-consolidation + INDEX 최상단 + 본 STATUS entry. **STOP-3**: dead-link active surface 0 match ✅ + workspace test pass + release-readiness 16/16 ready (보존) + breaking 0 = PATCH. 3 LL 자산화 (LL-ssot-01~03). ** 본 session (33차~36차) 누적 6 release / 5 carry cascade 종결 = carry 잔존 0** (역사상 최초 / paradigm 진화 안정점 본격 재도달):

- v8.9.0 (dep-graph release ceremony / b9615d0)
- v8.10.0 (analysis_validator carry / schema 진화)
- v8.11.0 (Senior REVISE-1 carry / forward warn lane)
- v8.12.0 (legacy-risks carry / 5 PoC 18 items migration)
- v8.13.0 (xmllint env absent carry / R19 Tier 1 격상)
- v8.13.1 (operation-md carry / dep-graph SSOT 통합) ← 본 release
  **차기 session 의제**: 새 결단 (paradigm 안정점 재진입 후 새 axis). DEC-2026-05-23-dep-graph-ssot-consolidation. Resolves DEC-2026-05-23-dep-graph-p1-p4 §6 carry.

**기준일 보존**: 2026-05-23 ( **session 36차 — v8.13.0 MINOR release — sql-inventory-validator Tier 1 in-plugin XML parser 격상 (xmllint → fast-xml-parser / R19 paradigm 본격 완결)** — v8.12.0 carry C-xmllint-env-absent 종결 (v8.9.0~v8.12.0 4 release 보존 carry). 사용자 "ㄱㄱ" → "Option A: Tier 1 격상" 결단. **시행** (additive / breaking 0): sql-inventory-validator fast-xml-parser ^4.5.0 dependency 추가 + version 0.2.1 → 0.3.0 + crossCheckLegacyXml Node-native paradigm 격상 (XMLParser.parse + countSqlTagsRecursive 재귀 traversal / SQL_TAGS={select,insert,update,delete,procedure} / v8.7.1 procedure tag 정합 보존) + xmllint_unavailable status 분기 dead-code 제거 + xmllint_total/xmllint_version field name **backward-compat** (value만 `fast-xml-parser:<ver>` marker) + test v8.13.0 noter 갱신. **R19 paradigm 정합**: Tier 2 (user-environment OS-native binary) → **Tier 1 in-plugin** (Node-native npm pure JS) 격상. **자산 갱신**: 5 file (plugin.json + package.json + CHANGELOG + sql-inventory-validator/{package.json + validator.js + test} + CLAUDE.md sync + DEC + INDEX + 본 STATUS). **STOP-3**: sql-inventory-validator test 31/31 pass ✅ (v8.7.1 iBATIS test #25+#26 회복) + workspace test **690/690 pass** ✅ (v8.12.0 688/690 → v8.13.0 690/690) + release-readiness **16/16 ready** ✅ (v8.12.0 15/16 → v8.13.0 16/16) + breaking 0 = MINOR. 3 LL 자산화 (LL-r19-01~03). ** 본 session 누적 5 release** (v8.9.0 + v8.10.0 + v8.11.0 + v8.12.0 + v8.13.0) = dep-graph release ceremony → analysis_validator carry → Senior REVISE-1 carry → legacy carry → R19 Tier 1 격상 = cascade 종결. **차기 session carry**: C-operation-md-work-folder (low / 보존) = work/ 폴더 docs/ 흡수 후보. DEC-2026-05-23-xmllint-tier1-migration. Resolves DEC-2026-05-23-legacy-risks-migration §7 carry.

**기준일 보존**: 2026-05-23 ( **session 35차 — v8.12.0 MINOR release — 5 PoC 18 risks string → object form 마이그레이션 (paradigm 완결 cycle 종결)** — v8.11.0 carry C-legacy-risks-poc-migration 종결. 사용자 "ㄱㄱ" → "추천안 묶음 전체 시행" 7 cluster 묶음 결단. **정보 손실 risk 평가** = 0 실측 입증 (description 자유서술 + prefix → severity enum + ID reference 모두 보존). **시행** (additive metadata / breaking 0): 5 PoC × 18 items 마이그레이션 — poc-03/04-mini/05 (2 each) + poc-06 (6) + poc-07 (6) / severity prefix 자동 매핑 (3=critical / 2=high / 1=medium / 0=low) / type 추론 6종 (methodology / environment / legacy-corpus / legacy-domain / domain-expert-carry / architecture-carry) / id R-NNN 순차 / description 자유서술 그대로 보존. **9 PoC 분포 v8.12.0 완료**: 전 9 PoC object form 통일 (string=0 / object=46). **자산 갱신**: 5 PoC planning-spec.json + plugin.json 8.11.0 → 8.12.0 + package.json 8.11.0 → 8.12.0 (3-way sync) + CHANGELOG v8.12.0 entry + DEC-2026-05-23-legacy-risks-migration + INDEX 최상단 + 본 STATUS entry. **STOP-3**: schema-validator 5 PoC VALID ✅ + chain-coverage-validator validateRisksForm string_count=0 (9 PoC 전수) ✅ + 정보 손실 0 + breaking 0 = MINOR + §8.1 corroboration ✓. 3 LL 자산화 (LL-validator-07~09). ** paradigm 완결 cycle 종결** — v8.10.0 polymorphic items + v8.11.0 forward warn lane + v8.12.0 legacy 청산 = 3 release 1 session = risks_and_constraints axis carry 0. **차기 session carry**: C-xmllint-env-absent (보존) + C-operation-md-work-folder (보존) = 환경/docs 한정. DEC-2026-05-23-legacy-risks-migration. Resolves DEC-2026-05-23-risks-string-form-warn §7 carry.

**기준일 보존**: 2026-05-23 ( **session 34차 — v8.11.0 MINOR release — chain-coverage-validator validateRisksForm lane (Senior REVISE-1 carry 종결)** — v8.10.0 §3 D2 Senior REVISE-1 commitment 종결. 사용자 "ㄱㄱ" 결단. **실측 9 PoC 분포** — string 5 PoC (legacy carry / 18 items) + object 4 PoC (object form ✅ / 28 items). **시행** (additive / breaking 0): chain-coverage-validator 5번째 export function `validateRisksForm(planning)` 신설 (validateChainCoverage + validateCrossRefPaths + validateAntipatternCoverage + validateConfidenceCoverage 다음) + CLI wire (--json output 안 risks_form 키 + 사람-친화 출력) + test 4종 (all-string warn / all-object no-finding / mixed warn / graceful empty). severity=low / advisory warn lane (silent omission 차단 본질 / blocking ❌). **자산 갱신**: chain-coverage-validator 0.1.0 → 0.2.0 + plugin.json 8.10.0 → 8.11.0 + package.json 8.10.0 → 8.11.0 (3-way sync) + CHANGELOG v8.11.0 entry + DEC-2026-05-23-risks-string-form-warn + INDEX 최상단 + 본 STATUS entry. **STOP-3**: chain-coverage-validator test 30/30 pass ✅ (신규 4 + 기존 26) + breaking 0 = MINOR + §8.1 corroboration ✓ (9 PoC isomorphic). 3 LL 자산화 (LL-validator-04~06). **차기 session carry**: C-legacy-risks-poc-migration (5 PoC 18 string items → object form / 사용자 결단 의무) / C-xmllint-env-absent (보존) / C-operation-md-work-folder (보존). DEC-2026-05-23-risks-string-form-warn. Resolves DEC-2026-05-23-analysis-validator-poc06-11-resolve §8 carry C-risks-string-form-warn-v811.

**기준일 보존**: 2026-05-23 ( **session 33차 — v8.10.0 MINOR release — planning-spec schema 진화 + 6 PoC analysis_validator carry 종결** — v8.9.0 carry "C-analysis-validator-poc06-10-placeholder" (high) 정리. 4원칙 ladder full — plan-analysis-validator-poc06-11.md + Senior critique GO @ 0.87 + REVISE-1 흡수 (D2 severity required + $comment legacy-carry warning + chain-coverage-validator `risks_string_form_warn` lane v8.11.0 carry / Senior 실측 보강 = plan 4종 enum → 5종 실측 정정 paradigm). 사용자 묶음 결단 "추천안 묶음 전체 시행 (Senior REVISE-1 포함)" 6 cluster. **시행** (additive / breaking 0): schema 진화 (risks_and_constraints polymorphic items anyOf[string, object{id, severity required, description, type?}] + cross_links 5 enum 추가 to_characterization/to_sql_inventory/to_source/to_decisions/to_phase7_findings + derivation_source 2 properties 추가 source_handling/source_root_absolute / additionalProperties:false 유지 = drift attractor 차단) + PoC 정합 (poc-06 7 placeholder marker `AC-EXCHANGE-PLACEHOLDER-001~007` + naming canonical to_characterization_artifacts→to_characterization/to_carry_decisions→to_decisions + poc-11 risks dict→array 14 objects severity 보존). **STOP-3 hard gate**: schema-validator 6 PoC VALID ✅ (10+3+8+4+2+7 errors → 0) + release-readiness `analysis_validator_violation` red → ✅ + version 3-way sync 8.10.0 + breaking 0 = MINOR. **§8.1 corroboration ✓** — 6 PoC isomorphic deviation = single-PoC overfitting 회피 충족. 3 LL 자산화 (LL-validator-01~03). **차기 session carry**: C-risks-string-form-warn-v811 (chain-coverage-validator forward lane) / C-xmllint-env-absent (v8.9.0 carry 보존) / C-operation-md-work-folder (v8.9.0 carry 보존). DEC-2026-05-23-analysis-validator-poc06-11-resolve. Resolves DEC-2026-05-23-dep-graph-p1-p4 §6 carry.

**기준일 보존**: 2026-05-23 ( **session 32차 — v8.9.0 MINOR release — dep-graph P1~P4 ceremony** — 직전 commit `b9615d0` (2026-05-23 / charter §5 P3 SHIPPED) 의 명시 carry "다음 세션 release ceremony" 시행. 사용자 묶음 결단 "추천안 묶음 전체 시행". **시행** (additive / breaking 0): ① chain-driver `ajv ^8.17.1` + `ajv-formats ^3.0.1` dependency 등록 (regress fix / ERR_MODULE_NOT_FOUND 해소 / 8/8 pass) / ② plugin.json 8.8.0 → 8.9.0 + package.json 8.8.3 → 8.9.0 (3-way sync) / ③ CHANGELOG v8.9.0 entry / ④ CLAUDE.md "plugin.json v8.9.0" sync + 현재 release 본문 갱신 / ⑤ DEC-2026-05-23-dep-graph-p1-p4 + INDEX 최상단 + 본 STATUS entry. **dep-graph 본체 (b9615d0)**: schema 5 신설 (artifact-graph-node/edge + code-pointer + discovery-output + plan-spec / chain schema 6종 code_pointers optional) + validator 2 (graph-integrity DFS cycle/orphan/unknown + code-pointer coverage) + chain-driver impact-analyzer (confidence-aware BFS) + propagation-orderer + centrality + policy-evaluator + CLI impact/navigate/query + matrix-builder graph-synthesizer (4-state machine) + skill dep-graph-navigator + hooks + policies/propagation-policy + release-readiness #15/#16 + docs/dependency-graph.md + plugin-charter P3 SHIPPED. **STOP-3**: workspace 685/686 (1 env absent = xmllint Windows / Linux libxml2 carry) + release-readiness 15/16 ready (1 carry = analysis_validator red poc-06~10 placeholder / 본 작업 무관 기존 drift) + version 3-way ✅ + skill-citation 0 stale + drift-validator 3-way + breaking 0. 3 LL 자산화 (LL-depgraph-01~03). DEC-2026-05-23-dep-graph-p1-p4.

---

## Archive 영역

**기준일 보존**: 2026-05-14 ( **session 14차 — v2.5.0 Phase C step 9 종결 — chain 1 gate Layer 2 통합 ( chain harness 5 요소 1 변경) — gate-eval.js findings shape + evaluateGate + severityRank + applyUserDecision 본격 paradigm 갱신 ( Q-S1 (a) + Q-S2 (b) coverage_threshold 수준 + Q-S3 (a) Phase C 종결 자격) + Senior STOP-3 흡수 + REVISE 1+2+3+4 흡수 + chain-driver test +4 신규 (68→72) + workspace 312/0 + chain harness validated 본질 보존 ✅ + DEC + ADR §9 LL-i-42+43 + §11 patch v8 + Phase C 본격 종결 ✅** — SESSION-WRAPUP commit / no release / no version bump / no tag / Phase D 진입 자격 본격 도달 / session 15차+ = release-readiness 9/9 + v2.5.0 MINOR FINAL release)

**기준일 보존**: 2026-05-14 ( **session 13차 — v2.5.0 Phase C step 6+7+8+11+12 본격 시행 — Claude Code sub-agent invocation paradigm 본격 동작 입증 — Task tool 5회 본격 호출 (Sonnet 4.6 / batch / 31 BR 총합) + PoC #03 18 BR NL 본격 합성 (Agent 1) + PoC #05 2 BR GWT 신규 합성 (Agent 3) + PoC #01 13 BR Layer 2 재검증 (Agent 5) + PoC #03 18 BR Layer 2 (Agent 2) + PoC #05 2 BR Layer 2 (Agent 4) + 본격 재실측 (PoC #01 overall=0.901 / PoC #03 overall=0.941 / PoC #05 overall=0.985 / 3 PoC 모두 gate PASS ✅) + ≥ 2 PoC corroboration Layer 1+Layer 2 양쪽 통과 ✅ + Adzic SBE 함정 회피 자격 본격 도달 ✅ + skills/analysis-br-cross-consistency-check/SKILL.md 신설 + DEC + ADR §9 LL-i-39+40+41 + §11 patch v7 + 308/0 test pass + semantic_drift 2 BR Phase D carry** — SESSION-WRAPUP commit / no release / no version bump / no tag / Phase C 종결 = session 14차 chain 1 gate Layer 2 통합 / Phase D = release-readiness 9/9 + v2.5.0 MINOR release)

**기준일 보존**: 2026-05-14 ( **session 12차 — v2.5.0 Phase C step 1~5 시행 — Layer 2 LLM 본격 paradigm 구현 (Claude Code sub-agent invocation paradigm) — Senior STOP-1+2+3+4 흡수 + REVISE 5건 흡수 + 사용자 결단 "진행하자" 정합 + validator interface 본격 (cli.js + llm.js + validator.js / placeholder → 본격 / semantic_drift_detected + confidence_cap_exceeded finding 신설 / Layer 1 AND Layer 2 양쪽 통과 paradigm / DETERMINISTIC_THRESHOLD 신설) + docs/layer-2-prompt-spec.md 신설 (batch paradigm + Sonnet 4.6 + confidence cap 0.85) + test +5 (31/31 pass / workspace 308/0) + DEC + ADR §9 LL-i-37+38 + §11 patch v6 + LL-i-37+38 자산화 + session 13차 = step 6~12 분리** — SESSION-WRAPUP commit / no release / no version bump / no tag / Phase C 종결 = session 13차+)

**기준일 보존**: 2026-05-14 ( **session 11차 — v2.5.0 Phase B 시행 — PoC #03 18 BR 형식 sliding (trigger→When / condition→Given / expected_result→Then) + action = metadata 보존 + NL TODO marker + PoC #05 input/→output/rules/ 이전 + sample_mode meta + description→NL 자동 추출 + Layer 1 threshold 자체 제거 ( 0.15 floor advisory → threshold 비교 자체 ❌) + 303/0 test pass + ≥ 2 PoC corroboration 자격 도달 (PoC #01 13 + PoC #03 18 = 31 BR / Senior STOP-1 흡수 ✅) + LL-i-33~35 자산화 + DEC 신설** — SESSION-WRAPUP commit / no release / no version bump / no tag / Phase C = 다음 session 12차+)

**기준일 보존**: 2026-05-13~14 ( session 10차 — v2.5.0 Phase A 시행 — description vs NL paradigm 재정의 (Agent 3 (c) hybrid 채택) + schema 강화 (breaking change ❌) + validator paradigm 갱신 + PoC #01 13 BR 자동 마이그레이션 ✅ + 302/0 test pass + LL-i-31~32 자산화 — SESSION-WRAPUP commit `e6e671d`)

**v2.4.0 MINOR FINAL release 보존** ( session 8차 / 2026-05-13 / commit `f3b62db` / git tag `v2.4.0` / origin push ✅ — session 9차 carry 명시 추가: "paradigm rc 도입 / threshold gate 결정 보류 / Layer 2 LLM 의무 carry / ≥ 2 PoC corroboration 의무 carry / v2.5.0 = paradigm 본격 도입" / Senior STOP-2 soft 흡수 = 라벨 강등 ❌ / carry 명시 ✅)

**v2.4.0 MINOR FINAL release** ( session 8차 / 2026-05-13 / 본 release commit pending / git tag v2.4.0 pending / push 보류)
**v2.4.0-rc1 자격 흡수** ( session 7차 / commit `a24a892` / dual representation 사상 신설 / 본 release 안 통합)
**v2.3.7 PATCH release** ( session 7차 / commit `75ee21d` + `963dfa0` / 본 release 안 통합 push)
**v2.3.6 PATCH release 보존** ( session 6차 / commit pending / git tag v2.3.6 pending / findings-aggregator)
**v2.3.5 PATCH release 보존** ( session 4차 / commit `bbe27ab` / git tag `v2.3.5` / origin push ✅ / chain 2 4 UC 종결)
**v2.3.4 PATCH release 보존** ( session 2차 / commit `e298bb4` / git tag `v2.3.4` / F-015 finding 정정)

**v2.3.4 PATCH release 보존** ( session 2차 / 2026-05-13 / commit `e298bb4` / git tag `v2.3.4` / origin push ✅ / Agent 1 F-015 finding 정정 + arxiv 2601.21894 인용 복원 + critical lesson F-015 한계 / sub-rule v1.1.1 → v1.1.2 PATCH)
**v2.3.3 PATCH release 보존** ( session 1차 / 2026-05-13 / commit `6ab26b6` / git tag `v2.3.3` / origin push ✅ / R1' axis 본체 명문화 + sub-rule v1.1 → v1.1.1 PATCH / industry first paradigm-cross axis quantification)
**v2.3.2 PATCH release 보존** (2026-05-12 / commit `ba3ed82` / git tag `v2.3.2` / sub-rule v1.0 → v1.1 minor 갱신)
**v2.3.1 PATCH release 보존** (2026-05-12 / commit `bc48477` / git tag `v2.3.1` / origin push ✅ 2026-05-12)

---

            **본 session 2026-05-14 session 14차 — v2.5.0 Phase C step 9 종결 — chain 1 gate Layer 2 통합 ( chain harness 5 요소 1 변경)**:

- ✅ **carry trigger** = C-chain-1-gate-layer-2-integration ( session 13차 carry / critical)
- ✅ ** 4원칙 1단계 plan 자산** = `~/.claude/plans/t-v2.5.0-phase-c-step-9-chain-1-gate-layer-2.md` ( scope + Q-S1+2+3 결단 의무 + 영향 범위 사실)
- ✅ ** 4원칙 2단계 Senior critique sub-agent ( Sonnet 4.6 / chain harness 5 요소 변경 의무 영역)**:
  -     **STOP-3** (  Q-S3 (b) 단독 선택 시 Phase C 종결 자격 상실 / Q-S3 (a) 만 자격) 발행
  - STOP-1+2 자격 부재 / 조건부 영역 = REVISE 격하
  - REVISE 4건 (REVISE-1 explicit guard / REVISE-2 comment / REVISE-3 severityRank / REVISE-4 test 3 신규)
  - chain harness validated 본질 보존 검증 ✅ ( "additive change paradigm" 정합)
- ✅ ** 사용자 결단 "1"** → Senior 종합 권장 시행 (Q-S1 (a) + Q-S2 (b) coverage_threshold 수준 + Q-S3 (a))
- ✅ ** 4원칙 4단계 본격 시행 — chain harness 5 요소 1 변경 ✅**:
  - `tools/chain-driver/src/gate-eval.js`:
  - findings shape 안 신규 영역 — `llm_consistency_score` + `llm_threshold` + `llm_status` 3 필드
  - evaluateGate 안 Layer 2 block reason `layer2_threshold` 추가 ( explicit guard / `llm_status === 'evaluated' && llm_consistency_score != null && score < threshold` / REVISE-1 정합)
  - severityRank 안 `layer2_threshold: 2` ( coverage_threshold 수준 / Senior 권장 / REVISE-3 정합)
  - applyUserDecision paradigm — `layer2_threshold` = user go → go-with-warnings 허용 ( semantic drift Phase D carry 흐름 정합)
  - `tools/chain-driver/test/gate-eval.test.js`:
  - +4 신규 Layer 2 paradigm test ( skipped / pass / fail / user-go path) / REVISE-4 정합
  - chain-driver test 68 → **72/72 pass** ✅
- ✅ ** workspace 전수 test = 312/0** ( session 13차 308 → +4 / 회귀 ❌)
- ✅ ** Phase C 본격 종결 ✅** — step 1~12 모두 완료 ( step 1~5 session 12차 + step 6~8 session 13차 + step 9 session 14차 + step 10 session 12차 + step 11 308→312 + step 12 본 session)

### resolved by 본 session ( session 14차)

-     **C-chain-1-gate-layer-2-integration** ( session 13차 carry / critical) →   **resolved** ( gate-eval.js 본격 paradigm 갱신 + test +4 / 312/0 회귀 ❌)
-      **Phase C 종결 (step 1~12)** →   **resolved** (   Adzic SBE 함정 회피 자격 본격 도달 + industry-first 자격 본격 입증 + chain harness validated 본질 보존)

### 신규 carry ( session 14차)

-       **C-v2.5.0-minor-final-release** ( critical / Phase D / session 15차+ / release-readiness 9/9 + v2.5.0 MINOR FINAL release 의무)
- **C-phase-d-domain-expert-review-3-drift** ( Phase D / PoC #01 13 BR + 2 drift BR / domain expert / LL-i-31 정합)

### Lessons Learned 신규 ( session 14차 / ADR-CHAIN-011 §9 patch v8)

-         **LL-i-42** ( "chain harness 5 요소 변경 paradigm — additive change paradigm + chain harness validated 본질 보존 의무")
-       **LL-i-43** ( "Layer 2 block reason severity rank paradigm — semantic drift = coverage_threshold 수준 / Phase D 도메인 전문가 검토 carry 정합")

### 다음 step ( session 15차+ = Phase D 본격 + v2.5.0 MINOR FINAL release)

-      release-readiness 8/8 → 9/9 재격상 ( Layer 2 통과 criterion 추가)
- ≥ 2 PoC corroboration 본격 검증 ( PoC #01 + PoC #03 / 31 BR)
-     PoC #01 13 BR + 2 drift BR (AUTH-JWT-002 + DELETE-AUTH-001) 도메인 전문가 검토
-       v2.5.0 MINOR FINAL release ( commit + git tag v2.5.0 + origin push)
- self-evaluation bias retrospect ( Opus/Haiku 교차 검증 carry)

---

           **본 session 2026-05-14 session 13차 — v2.5.0 Phase C step 6+7+8+11+12 본격 시행 — Claude Code sub-agent invocation paradigm 본격 동작 입증**:

- ✅ **carry trigger** = C-phase-c-step-6-12-session-13 ( session 12차 carry / critical)
- ✅ ** 4원칙 1단계 plan 자산** = `~/.claude/plans/s-v2.5.0-phase-c-step-6-12-session-13.md` ( Task tool 5회 호출 paradigm + Q-D scope 결단)
- ✅ ** 4원칙 2단계 ( session 12차 Senior critique 자료 흡수 정합 / 추가 토론 부재)** — STOP-1+2+3+4 + REVISE 5 paradigm 정합 보존
- ✅ ** 사용자 결단 "1"** → Plan S §3.1 옵션 A 그대로 시행 ( step 6+7+8+11+12 + skill 신설)
- ✅ ** 4원칙 4단계 본격 시행 — Task tool 5회 병렬 호출 (Sonnet 4.6)**:
  - Agent 1 PoC #03 18 BR NL 본격 합성 → `layer-2-results/poc-03-nl-synthesis.json`
  - Agent 3 PoC #05 2 BR GWT 신규 합성 → `layer-2-results/poc-05-gwt-synthesis.json`
  - Agent 5 PoC #01 13 BR Layer 2 재검증 → `layer-2-results/poc-01-layer-2-results.json`
  - Agent 2 PoC #03 18 BR Layer 2 cross-validation → `layer-2-results/poc-03-layer-2-results.json`
  - Agent 4 PoC #05 2 BR Layer 2 cross-validation → `layer-2-results/poc-05-layer-2-results.json`
- ✅ ** 본격 재실측 결과 ( Layer 1 + Layer 2 통합)**:
  - **PoC #01 (baseline)**: L1=0.954 / L2=0.848 / **overall=0.901 / pass ✅** / findings 5 (4 low + 1 medium drift)
  - **PoC #03 (session 13차 신규)**: L1=0.967 / L2=0.914 / **overall=0.941 / pass ✅** / findings 5 (4 low + 1 medium drift)
  - **PoC #05 (sample)**: L1=1.0 / L2=0.97 / **overall=0.985 / pass ✅** / findings 0
- ✅ ** 결정적 사실**:
  - **≥ 2 PoC corroboration Layer 1 + Layer 2 양쪽 통과 ✅** (PoC #01 13 + PoC #03 18 = 31 BR)
  - **Adzic SBE 폐기 함정 회피 자격 본격 도달 ✅** (Layer 1 + Layer 2 axis 자료 보유 / LL-i-26 정합)
  - **Claude Code sub-agent invocation paradigm 본격 동작 입증 ✅** ( B-4 paradigm / Anthropic API key 의무 ❌)
  - **industry-first 자격 본격 입증 ✅** (Spec Kit / AWS Q / DMN / Drools / Spectral / AutoUAT 모두 부재 / LL-i-35 정합)
- ✅ ** skill 자산화** = `skills/analysis-br-cross-consistency-check/SKILL.md` 신설 + `flows/analysis.phase-flow.json` cross_cutting.aspects.skills[] 등록 ( drift-validator 47/47 pass / orphan 회피)
- ✅ ** semantic_drift_detected 2 BR (Phase D carry)**:
  - BR-AUTH-JWT-002 (PoC #01 / 0.65 / 규범 vs 현실 비대칭)
  - BR-USER-DELETE-AUTH-001 (PoC #03 / 0.55 / semantic_inversion / absent BR)
- ✅ ** workspace 전수 test = 308/0** ( session 12차 보존 / 회귀 ❌)

### resolved by 본 session ( session 13차)

-     **C-phase-c-step-6-12-session-13** ( session 12차 carry) →     **resolved** (   Task tool 5회 본격 호출 + Layer 1+L2 통합 점수 + 3 PoC 모두 pass)
- **C-trigger-skill-asset-신설** ( session 12차 carry) → **resolved** ( skill SKILL.md 신설 + flows 등록)
- **C-poc-03-18-br-nl-todo-marker** ( session 11차 carry) → **resolved** ( NL 본격 합성 ✅ / 단 Phase D 도메인 전문가 검토 carry 잔존)
- **C-poc-05-2-br-gwt-synthesis** ( session 11차 carry) → **resolved** ( GWT 신규 합성 ✅)

### 신규 carry ( session 13차)

-     **C-chain-1-gate-layer-2-integration** ( critical / session 14차 / chain-driver gate-eval.js / chain harness 5 요소 1 변경 의무)
- **C-phase-d-domain-expert-review-2-drift** ( Phase D / BR-AUTH-JWT-002 + BR-USER-DELETE-AUTH-001 도메인 전문가 검토)
- **C-absent-br-gwt-nl-paradigm** ( Phase D 전 / absent/결함 BR GWT-NL 합성 paradigm 수립)
- **C-self-evaluation-bias-retrospect** ( Phase D / Opus / Haiku 교차 검증 paradigm)
-       **C-v2.5.0-minor-release** ( Phase D 본격)

### Lessons Learned 신규 ( session 13차 / ADR-CHAIN-011 §9 patch v7)

-        **LL-i-39** ( "Claude Code sub-agent invocation paradigm 본격 동작 입증 + Sonnet 4.6 batch paradigm 정합")
-       **LL-i-40** ( "Adzic SBE 폐기 함정 회피 자격 본격 도달 — Layer 1 + Layer 2 hybrid paradigm 본격 동작 입증")
- **LL-i-41** ( "same-model self-evaluation bias 위험 + Phase D retrospect carry 의무")

### 다음 step ( session 14차 = Phase C 종결 + Phase D 진입 자격)

-     chain 1 gate br-cross-consistency-validator Layer 2 통합 ( chain-driver gate-eval.js / chain harness 5 요소 1 변경 의무)
- Phase C SESSION-WRAPUP
-       Phase D = release-readiness 8/8 → 9/9 재격상 ( Layer 2 통과 criterion 추가) + ≥ 2 PoC corroboration 본격 검증 + PoC #01 13 BR 도메인 전문가 검토 +     v2.5.0 MINOR FINAL release
- self-evaluation bias retrospect — Opus / Haiku 교차 검증 carry

---

          **본 session 2026-05-14 session 12차 — v2.5.0 Phase C step 1~5 시행 — Layer 2 LLM 본격 paradigm 구현 (Claude Code sub-agent invocation paradigm)**:

- ✅ **carry trigger** = C-phase-c-paradigm-redesign + C-claude-code-subagent-invocation-paradigm ( session 11차 patch v5 carry / Phase C 본격 진입 자격)
- ✅ ** 4원칙 1단계 plan 자산** = `~/.claude/plans/r-v2.5.0-phase-c-layer-2-claude-code-subagent.md` ( Phase C scope + B-1/B-2/B-3 ❌ → B-4 본격 / 영향 범위 전수 조사 / Q-C0~Q-C5 + Q-C-trigger + Q-C-batch + Q-C-model 결단 의무)
- ✅ ** 4원칙 2단계 가벼운 sub-agent ( Senior critique only / 시간 cap 30분)** — STOP-1 (Claude → Claude self-invocation echo chamber 위험 최강) + STOP-2 (Phase C 12 step scope 폭증) + STOP-3 (trigger 영역 부재) + STOP-4 (batch paradigm 부재 시 1.5~2.5시간) + REVISE 5건
- ✅ ** 사용자 결단** "진행하자" → 종합 권장 ( Q-C0 (b) B-4 + Q-C-trigger (d)+(a) hybrid + Q-C-batch 의무 + Q-C-model Sonnet 4.6 + Q-C1~5 정합 + session 12차 = step 1~5 한정 / session 13차 = step 6~12 분리) 시행
- ✅ ** 시행 산출 8종**:
  - `tools/br-cross-consistency-validator/src/cli.js` ( `--llm-results <path>` 옵션 신설 / Layer 2 LLM 호출 paradigm 명시)
  - `tools/br-cross-consistency-validator/src/llm.js` ( placeholder → 본격 paradigm / semantic_drift_detected finding 신설 + confidence_cap_exceeded finding 신설 / extractLLMMeta 함수 신설)
  - `tools/br-cross-consistency-validator/src/validator.js` ( Layer 1 AND Layer 2 양쪽 통과 paradigm 본격 / DETERMINISTIC_THRESHOLD 0.85 신설 / overall_score = (L1 + L2) / 2 / summary 영역 확장)
  - `tools/br-cross-consistency-validator/test/validator.test.js` ( +5 Layer 2 본격 paradigm test 신규 / 31/31 pass)
  -     `tools/br-cross-consistency-validator/docs/layer-2-prompt-spec.md` ( 신설 / paradigm 사상 + Task tool 호출 paradigm + batch paradigm 의무 + prompt 본문 + 응답 schema + validator 호출 paradigm + trigger paradigm (d)+(a) hybrid + session 13차 시행 영역 + 한계 carry)
  - `decisions/DEC-2026-05-14-phase-c-step-1-5-layer-2-paradigm-implementation.md` ( DEC 신설)
  - `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §9 LL-i-37+38 + §11 후속 patch v6 ( session 12차 갱신)
  - `~/.claude/plans/r-v2.5.0-phase-c-layer-2-claude-code-subagent.md` ( §0 종결 영역 + §6 한계 갱신)
- ✅ ** workspace 전수 test 회귀 검증** = **308/0 pass** ( session 11차 303 → +5 신규 Layer 2 paradigm test / 회귀 ❌)

### resolved by 본 session ( session 12차)

- **C-phase-c-paradigm-redesign** ( session 11차 carry) → **resolved** ( B-4 paradigm 본격 채택 + REVISE 5건 흡수)
- **C-claude-code-subagent-invocation-paradigm** ( session 11차 carry) → **resolved** ( docs/layer-2-prompt-spec.md 본격 자산화 + Sonnet 4.6 model + batch paradigm + confidence cap 0.85)

### 신규 carry ( session 12차)

-     **C-self-invocation-echo-chamber** ( critical / STOP-1 흡수 / Sonnet 4.6 약화 paradigm / Phase D 시점 retrospect 검토 의무)
- **C-trigger-skill-asset-신설** ( skills/analysis-br-cross-consistency-check/SKILL.md 신설 / session 13차 시행)
- **C-batch-paradigm-context-overflow** ( context window 1M / 100+ BR batch 분할 paradigm / Phase D 전)
-     **C-phase-c-step-6-12-session-13** (   critical / session 13차 시행 — PoC #03 NL 본격 합성 + PoC #05 GWT + PoC #01 Layer 2 재검증 + chain 1 gate Layer 2 통합 + Phase C SESSION-WRAPUP)
- **C-phase-d-domain-expert-review** ( session 11차 carry 보존 / LLM advisory = 사람 검토 대체 ❌ / Phase D 도메인 전문가 검토 의무)

### Lessons Learned 신규 ( session 12차 / ADR-CHAIN-011 §9 patch v6 자산화)

-       **LL-i-37** ( "Claude → Claude self-invocation echo chamber 회피 paradigm = Sonnet 4.6 sub-agent + F-015 cross-validation pattern 정합")
-     **LL-i-38** ( "Node.js script 안 LLM 직접 호출 ❌ paradigm 본질 / Claude Code sub-agent invocation paradigm 본격 채택")

### 다음 step ( session 13차 = Phase C step 6~12)

-        PoC #03 18 BR NL TODO marker → 본격 BR statement 합성 ( Claude Code Task tool / Sonnet 4.6 / batch paradigm) + 도메인 전문가 검토 carry
-      PoC #05 2 BR GWT 신규 합성 ( sample mode 보존)
-     PoC #01 13 BR Layer 2 재검증 ( baseline 비교)
-     chain 1 gate br-cross-consistency-validator Layer 2 통합 ( chain-driver gate-eval.js / chain harness 5 요소 1 변경 의무 / session 13차 본격 결단 영역)
- skills/analysis-br-cross-consistency-check/SKILL.md 신설 ( Q-C-trigger (d) 정합)
- Phase C SESSION-WRAPUP
-       Phase D = release-readiness 8/8 → 9/9 재격상 검토 + ≥ 2 PoC corroboration 검증 + PoC #01 13 BR 도메인 전문가 검토 + v2.5.0 MINOR release

---

         **본 session 2026-05-14 session 11차 — v2.5.0 Phase B 시행 — PoC #03 + PoC #05 dual representation 마이그레이션 + Layer 1 threshold 자체 제거 + ≥ 2 PoC corroboration 자격 도달**:

- ✅ **carry trigger** = C-poc-03-05-dual-representation ( session 9차 critical / Senior STOP-1 흡수 의무) + C-keyword-threshold-degrade + C-description-vs-nl-paradigm-define 후속
- ✅ ** 4원칙 1단계 plan 자산** = `~/.claude/plans/q-v2.5.0-phase-b-poc-03-05-마이그레이션.md` ( Phase B scope + 시행 순서 + Q-B0~Q-B6 결단 의무 + 한계/위험)
- ✅ ** 4원칙 2단계 sub-agent 3 병렬 토론** ( Agent 1 공식 + Agent 2 빅테크/OSS + Agent 3 Senior critique):
  - **Agent 1 공식** — Cucumber/Fowler/ECA 3중 외부 권위 정합 (trigger→When / condition→Given / expected_result→Then) / action = GWT step 분리 ❌ + metadata 보존 의무 / MDPI 2025 "no single generalizable cut-off" / Cucumber Rule 키워드 (2018) = dual representation industry-defined paradigm ( 본 방법론 ≠ 원조)
  - **Agent 2 빅테크/OSS** — 4축 → GWT deterministic 합성 도구 = 빅테크/OSS 공개 자료 0건 (industry-first 자격 보강 확정) / AutoUAT/TestFlow LLM 위임 95% helpful but 8% major issue / Elastic hybrid paradigm = Layer 1 keyword fallback 정합 / MDPI 2025 paraphrase optimal=0.671
  - **Agent 3 Senior critique** — STOP-1 (자동 NL 합성 = LL-i-31 정면 위반) + STOP-2 (Adzic 함정 재현 직진) + STOP-3 (0.15 magic number 자산화 위험) + STOP-4 (PoC #05 n=2 = corroboration 산입 ❌) + REVISE 5건
- ✅ ** 3 agent 일치 corroboration** = action 별도 GWT step 분리 ❌ + 자동 NL 합성 ❌ + Layer 1 threshold 격하/제거 + Layer 2 LLM mandatory + PoC #05 corroboration ❌
- ✅ ** 사용자 결단** "1" (즉시 시행) → Phase B 종합 권장 그대로 시행 ( Q-B0 (c) scope 축소 + Q-B1 (b) 형식 sliding + Q-B2 (b) output/ 이전 + Q-B3 (b) threshold 자체 제거 + Q-B4 (a)+(c) self-review + Phase D carry + Q-B5 (b) PoC #05 corroboration ❌ + Q-B6 (a) session 12차+ Phase C LLM)
- ✅ ** 시행 산출 8종**:
  - `tools/br-cross-consistency-validator/scripts/synthesize-gwt-from-tca.mjs` ( 신설 / 형식 sliding script)
  - `examples/poc-03-realworld-nestjs/output/rules/rules.json` ( 18 BR Phase B 마이그레이션 ✅ / trigger→When / condition→Given / expected_result→Then + action = metadata 보존 + NL TODO marker)
  - `examples/poc-05-sample-user-register/output/rules/rules.json` ( git mv input/ → output/rules/ + 2 BR NL 자동 추출 + meta.sample_mode=true + meta.corroboration_eligible=false)
  - `tools/br-cross-consistency-validator/src/deterministic.js` ( keyword_mismatch finding 완전 제거 + structural_sanity_only finding 신설 / overlap === 0 시만)
  - `tools/br-cross-consistency-validator/src/validator.js` ( OVERALL_THRESHOLD deprecated semantic 명시 + Phase C carry)
  - `tools/br-cross-consistency-validator/test/validator.test.js` ( +2 신규 paradigm test / 26/26 pass / 회귀 ❌)
  - `tools/br-cross-consistency-validator/PHASE-B-2026-05-14-re-measurement.md` ( 재실측 보고 / ≥ 2 PoC corroboration 자료)
  - `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §9 LL-i-33~35 + §11 후속 patch v4 ( session 11차 갱신)
  - `decisions/DEC-2026-05-14-phase-b-poc-03-05-마이그레이션.md` ( DEC 신설)
- ✅ ** PoC #01 baseline 재실측 ( Phase B paradigm 정합 격상)**:
  - stats: with_natural_language=13 / with_gwt=13 / with_both=13 ( 보존)
  - overlap: mean=0.173 / median=0.105 / max=0.500 ( 보존)
  - **deterministic_score: 0.608 → 0.954 (+0.346 격상)** keyword_mismatch medium 제거 → structural_sanity_only low 영향
  - **gate_status: fail → pass** Phase B paradigm 정합 정면 격상
- ✅ ** PoC #03 cross-validation 결과 ( Phase B 신규 자료)**:
  - stats: with_natural_language=18 / with_gwt=18 / with_both=18 ( 진입 자격 ✅)
  - overlap_distribution: 의도된 sanity ∅ ( NL TODO marker 영향 / paradigm 정합)
  - deterministic_score: 0.825 / gate_status: fail ( NL TODO marker 영향 / Phase C LLM 합성 후 회복 자격)
  - findings: 21 ( 모두 low / 18 structural_sanity_only + 3 structure_given_has_result_keyword)
- ✅ ** PoC #05 sample mode ( corroboration ❌)**:
  - stats: with_natural_language=2 / with_gwt=0 / with_both=0
  - deterministic_score: 1.000 / gate_status: pass
  - meta.sample_mode=true + meta.corroboration_eligible=false 명시
- ✅ ** ≥ 2 PoC corroboration 자격 도달** = PoC #01 (13 BR) + PoC #03 (18 BR) = **31 BR** ( Senior STOP-1 흡수 ✅)
- ✅ ** workspace 전수 test 회귀 검증** = **303/0 pass** ( session 10차 302 → +1 신규 paradigm test / 회귀 ❌)

### resolved by 본 session ( session 11차)

- **C-poc-03-05-dual-representation** ( session 9차 critical / Senior STOP-1) → **resolved** ( PoC #03 + PoC #05 마이그레이션 ✅ / ≥ 2 PoC corroboration 자격 도달)
- **C-keyword-threshold-degrade** ( session 9차) → **resolved 격상** ( session 9차 "0.15 floor advisory" → session 11차 " threshold 자체 제거" paradigm)
- **C-poc-02-11-description-to-nl-migration** ( session 10차) → **부분 resolved** ( PoC #03 + PoC #05 처분 / PoC #02 #04 #06~#11 잔존 carry)
- **C-poc-01-13-br-nl-human-review** ( session 10차) → **부분 resolved** ( self-review 1차 ✅ / 도메인 전문가 검토 = Phase D carry)

### 신규 carry ( session 11차)

-     **C-poc-03-18-br-nl-todo-marker** ( critical / Phase C LLM 본격 합성 의무 + 도메인 전문가 검토)
- **C-poc-05-2-br-gwt-synthesis** ( Phase C LLM 본격 합성 + GWT 신규 추가)
- **C-overall-threshold-redesign-phase-c** ( Layer 1 + Layer 2 통합 threshold 재설계)
- **C-phase-c-priority** ( session 12차 Phase C 최우선 진입)
- **C-adzic-trap-active-mitigation** ( 영구 / 매 session self-check)
- **C-concrete-example-metric-new** ( Phase D 전 / Adzic 회피 도구 / GWT specific value 비율)
- **C-industry-first-scope-정정** ( "dual representation" ≠ industry-first / "4축 → GWT deterministic + cross-consistency validator" = industry-first / ADR LL-i-35 흡수 ✅)

### Lessons Learned 신규 ( session 11차 / ADR-CHAIN-011 §9 정합)

-     **LL-i-33** ( "TCA 4축 → GWT 3축 형식 sliding paradigm = Cucumber/Fowler/ECA 3중 외부 권위 정합 / action = GWT step 분리 ❌ + metadata 보존")
-     **LL-i-34** ( "Layer 1 keyword threshold 자체 제거 paradigm / 'non-empty + overlap > 0' sanity check only / Layer 2 LLM mandatory Phase C 의무")
- **LL-i-35** ( "industry-first 자격 scope 정정 / dual representation ≠ industry-first (Cucumber Rule 2018 정합) / 4축 → GWT deterministic 합성 + NL ↔ GWT cross-consistency validator = industry-first 자격")

### 다음 step ( Phase C = session 12차+)

         **   patch v5 paradigm 회복 (  session 11차 후속 / 사용자 결단 "옵션 B")** —   Phase C 본격 구현 paradigm = **    Claude Code sub-agent (Task tool / Agent tool) invocation** ( Anthropic API / OpenAI API 영역 ❌ / 본 방법론 plugin 자산 정합 / Static Tool 시뮬레이션 ❌)

-        Layer 2 LLM mandatory 본격 구현 (    Claude Code sub-agent 호출 paradigm — B-1 plugin hook 권장 / B-2 chain-driver / B-3 사용자 위임 mode)
-      PoC #03 18 BR NL TODO marker → 본격 BR statement 합성 + 도메인 전문가 검토
-     PoC #05 2 BR GWT 신규 합성 ( sample mode 보존)
-     chain 1 gate br-cross-consistency-validator Layer 2 통합
- OVERALL_THRESHOLD 의미 재설계 ( Layer 1 + Layer 2 통합 점수)
-      release-readiness 8/8 → 9/9 재격상 검토 (Layer 2 통과 criterion 추가)
-       v2.5.0 MINOR release

---

        **본 session 2026-05-13~14 session 10차 — v2.5.0 Phase A 시행 — description vs natural_language paradigm 재정의**:

- ✅ **carry trigger** = C-description-vs-nl-paradigm-define ( session 9차 신규 carry / 3 agent 충돌 영역)
- ✅ ** 4원칙 1단계 plan 자산** = `~/.claude/plans/p-v2.5.0-paradigm-본격-도입.md` ( v2.5.0 Phase A~D 분리 paradigm + Phase A scope 결단)
- ✅ ** 4원칙 2단계 = session 9차 sub-agent 3 자료 충분 흡수** ( 추가 v2 토론 = diminishing returns 결단 / Agent 1 (a) + Agent 2 (b) + Agent 3 (c) 충돌 영역)
- ✅ ** Agent 3 (c) hybrid 강 옵션 채택** ( session 9차 SPIKE v2 결정적 입증 + memory `feedback_quality_priority.md` 재작업 최소화 정합):
  - description = optional metadata ( BR statement + rationale + caveat + DRIFT 격상 자유 / 사람 눈 친화 / cross-validation 대상 ❌)
  - natural_language = REQUIRED ( pure BR statement / 1~2 문장 / Layer 2 LLM cross-validation 대상)
  - cross-validation 대상 = natural_language ↔ given/when/then ONLY ( description 제외)
- ✅ ** schema breaking change ❌ paradigm** ( 11 PoC backward-compat anyOf 보존 + description 강화만)
- ✅ ** 사용자 결단** "1" (즉시 시행) → Phase A scope 본격 시행
- ✅ ** 시행 산출 8종**:
  - `schemas/rules.schema.json` ( Phase A paradigm 명세 강화 / description = optional metadata 격상 / NL = REQUIRED for cross-validation / cross-validation 대상 = NL ↔ GWT only)
  - `tools/br-cross-consistency-validator/src/deterministic.js` ( description alias 제거 + description_only_fallback low finding 신설 + hasDescription return 신규)
  - `tools/br-cross-consistency-validator/src/validator.js` ( withDescriptionOnly stat 신규)
  - `tools/br-cross-consistency-validator/test/validator.test.js` ( +3 신규 paradigm test / 25/25 pass)
  - `tools/br-cross-consistency-validator/scripts/migrate-description-to-natural-language.mjs` ( 신설 / Phase B 재사용 의무)
  -     `examples/poc-01-realworld-spring/output/rules/rules.json` ( 13/13 BR 자동 마이그레이션 적용 / description 보존 + natural_language 신규 추출)
  - `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §9 LL-i-31+32 + §11 후속 patch v3 ( session 10차 갱신)
  - `decisions/DEC-2026-05-14-description-vs-nl-paradigm-재정의.md` ( DEC 신설)
- ✅ ** PoC #01 cross-validation 결과 ( Phase A pilot 실증)**:
  - stats: with_natural_language=13 / with_gwt=13 / with_both=13 / with_description_only=0
  - overlap: mean=0.173 / median=0.105 / max=0.500 ( session 9차 SPIKE v2 stripped 결과 그대로 실현)
  - score: 0.608 / gate: fail ( Layer 1 keyword overlap = structural sanity 격하 paradigm 입증 / Layer 2 LLM v2.5.0 Phase C 의무)
- ✅ ** workspace 전수 test 회귀 검증** = 302/0 pass ( +3 신규 paradigm test / 회귀 ❌)

### resolved by 본 session ( session 10차)

- **C-description-vs-nl-paradigm-define** ( session 9차 carry) → **resolved** ( Q2 paradigm 재정의 본격 시행 + PoC #01 마이그레이션 ✅)

### 신규 carry ( session 10차)

- **C-poc-01-13-br-nl-human-review** ( Phase B carry / 자동 추출 정확 보장 ❌ / PoC #01 13 BR 안 NL 사람 검토 의무)
- **C-poc-02-11-description-to-nl-migration** ( Phase B carry / PoC #02~#11 안 description 보유 BR 마이그레이션 / PoC #03 + #05 우선 / ≥ 2 PoC corroboration 정합)

### Lessons Learned 신규 ( session 10차 / DEC §5 정합)

-     **LL-i-31** ( "schema breaking change ❌ + validator paradigm 갱신 = safe 마이그레이션 paradigm" / Phase A 시행 입증)

  - **How to apply**: paradigm 재정의 시 schema breaking change 회피 + validator 영역만 변경 paradigm 우선 검토 / 자동 script 자산화 + 사람 검토 carry 분리 의무
- **LL-i-32** ( "description ↔ natural_language paradigm 명세 = paradigm 결단 결정적 사실" / ADR-008 이중 렌더링 사상 확장 명세)
- **How to apply**: paradigm 명세 명확 의무 / 외부 인용 시 "Layer 1 결정적 (structural sanity) + Layer 2 LLM mandatory (semantic) + paradigm 명세 명확 (description ≠ NL)" 3 layer corroboration 의무

### 다음 step ( Phase B = 다음 session)

-        PoC #03 dual representation 마이그레이션 ( trigger/condition/action → natural_language + given/when/then 추가)
-        PoC #05 dual representation 마이그레이션 ( description → natural_language + GWT 신규)
-     Layer 1 keyword threshold 0.5 → 0.15 floor advisory 격하 ( validator + test 갱신)
- ≥ 2 PoC corroboration 자료 확보 ( Senior STOP-1 흡수 정합)
-     Phase C 진입 자격 도달 ( Layer 2 LLM mandatory 본격 구현)

---

        **본 session 2026-05-13 session 9차 — C-threshold-spike-revisit carry 흡수 + Layer 2 LLM 의무 격상 paradigm 결단**:

- ✅ **carry trigger** = C-threshold-spike-revisit ( critical / session 8차 신규)
- ✅ ** 4원칙 1단계 plan 자산** = `~/.claude/plans/o-threshold-spike-revisit.md` (9절 / 가설 3 + 결단 Q1~Q5)
- ✅ ** session 9차 SPIKE v1 재측정** ( description alias 적용 후) — PoC #01 with_both 13/13 ( session 8차 spike v1 with_both=0 정면 뒤집힘 / description→natural_language alias 작동)
- ✅ ** critical 발견 1** — PoC #01 13 BR overlap 분포 (mean=0.201 / median=0.162 / p75=0.300 / max=**0.462** / stddev=0.134 / ≥0.85 = **0/13 (0%)** / ≥0.5 = 0/13 / ≥0.3 = 4/13 (31%)) → **≥0.85 hypothesis empirical 정면 부정 결정적 사실**
- ✅ ** 4원칙 2단계 sub-agent 3 병렬 토론** ( critical 자산 변경 의무 정합):
  - **Agent 1 공식문서** — Jaccard short-text + 한국어 교착어 형태소 부재 → ≥ 0.85 수학적 도달 불가 / Cucumber/DMN/Spectral 모두 cross-consistency 부재 / Adzic 10년 폐기 + Relish/Pickles/Green Pepper 전멸 / 권장 Q1=(b) Q2=(b) Q3=(b) Q4=(b) Q5=(a)
  - **Agent 2 빅테크/OSS** — MDPI 2025 paraphrase optimal=0.671 / range 0.334~0.867 / industry 5 곳 모두 semantic similarity threshold 공개 ❌ / Adzic 12% 만 feature files 잔존 / 권장 Q1=(d) 다층 Q2=(b) Q3=(c) Q4=(c) Q5=(b)
  - **Agent 3 Senior critique** — STOP signal 3건 발행 (STOP-1 단일 PoC #01 n=13 = §8.1 strict 정면 위반 / STOP-2 v2.4.0 MINOR FINAL 라벨 ❌ / STOP-3 Layer 1 단독 = Adzic 폐기 함정 재현) + REVISE 6건 + Q1~Q5 신규 옵션 e/c/d
- ✅ ** 3 agent 일치 corroboration** = ≥0.85 keyword threshold 정면 폐기 + Layer 2 LLM 의무 격상 + keyword-only paradigm = Adzic 폐기 회피 ❌ + industry 5 곳 cross-validation 부재 (LL-i-27 강화)
- ✅ ** Agent 3 REVISE-6 ( 가설 B 검증) 재실측 SPIKE v2** — `tools/br-cross-consistency-validator/scripts/spike-v2-rationale-strip.mjs` 자산화 + 시행 결과:
  -        **가설 B 정면 부정** (mean delta -0.028 / 7건 감소 / 4건 변화 ❌ / 1건 +0.167 상승)
  - → data quality 차이 ❌ 본질 / **semantic 차이 = keyword overlap algorithm 자체 한계 (Jaccard short-text + 한국어 교착어 형태소 부재)**
- ✅ ** paradigm 결단** = ≥0.85 hypothesis 정면 폐기 + Layer 2 LLM 의무 격상 + Layer 1 = "structural sanity check" 격하 + ≥ 2 PoC corroboration carry + v2.4.0 라벨 soft 보존
- ✅ ** 자산화 5종**:
  - `tools/br-cross-consistency-validator/SPIKE-2026-05-13-v2-rationale-strip.md` ( SPIKE v2 report / 본 session 핵심)
  - `tools/br-cross-consistency-validator/scripts/spike-v2-rationale-strip.mjs` ( SPIKE v2 시행 script)
  - `decisions/DEC-2026-05-13-threshold-spike-revisit-paradigm.md` ( DEC 신설)
  - `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §5.4 patch v2 + §7.3 carry + §9 LL-i-28 + §10 version handling + §11 후속 ( session 9차 갱신)
  - `~/.claude/plans/o-threshold-spike-revisit.md` ( 4원칙 1단계 plan)
- ✅ ** release-readiness 8/8 자격 상태 갱신** = "8/8 + paradigm 도입 미완 carry" ( Senior STOP-2 soft 흡수 / 라벨 강등 ❌ / carry 명시 ✅)

### resolved by 본 session ( session 9차)

- **C-threshold-spike-revisit** ( session 8차 carry) → **resolved** ( session 9차 SPIKE v1 재측정 + SPIKE v2 + Layer 2 LLM 의무 paradigm 결단 / implementation carry = C-layer-2-llm-mandatory-paradigm 흡수)

### 신규 carry ( session 9차)

-     **C-layer-2-llm-mandatory-paradigm** ( critical / v2.5.0 — Layer 2 LLM advisory placeholder → mandatory 격상 / ≥ 0.7 threshold / F-015 cross-validation / Static Tool 시뮬레이션 금지 정합 / ≥ 2 PoC corroboration 의무)
-      **C-poc-03-05-dual-representation** (  critical / Senior STOP-1 흡수 / ≥ 2 PoC corroboration 의무 / v2.5.0 의무)
- **C-keyword-threshold-degrade** ( medium / Layer 1 keyword threshold 0.5 → 0.15 floor advisory 격하 / paradigm-aligned / v2.5.0)
- **C-description-vs-nl-paradigm-define** ( v2.5.0 paradigm 결단 / Q2 의 a/b/c — 3 agent 충돌 영역)

### Lessons Learned 신규 ( session 9차 / DEC §5 정합)

-         **LL-i-28** (  "keyword overlap = structural sanity check / Adzic 폐기 회피 도구 자격 ❌ / Layer 2 LLM 의무 격상"):

  - **Why**: SPIKE v1+v2 + 3 agent 일치 corroboration → keyword overlap algorithm 자체 한계 (Jaccard short-text + 한국어 교착어 형태소 부재) / data quality 차이 ❌ 본질 / semantic 차이 = Layer 2 LLM 의무 격상 유일 paradigm
  - **How to apply**: Layer 1 = structural sanity check 격하 / Layer 2 LLM = mandatory 격상 / Adzic 폐기 회피 = Layer 2 의무 / 외부 인용 시 "industry-first 임상 threshold 측정 공개" 자격
-     **LL-i-29** ( "Senior critique STOP signal 강도 분리 흡수 paradigm"):

  - **Why**: STOP-1 (사실 명확 + 비용 low) = 전면 흡수 / STOP-2 (사실 명확 + 비용 high git tag downstream 영향) = soft 흡수 / STOP-3 (사실 명확 + 비용 low) = 전면 흡수 = "사실 명확도 × 비용" 2축 평가 paradigm
  - **How to apply**: 신규 sub-agent STOP signal 흡수 시 = "사실 명확도 × 비용" 2축 평가 의무 / soft 흡수 시 = 라벨 강등 ❌ + carry 명시 의무
- **LL-i-30** ( "REVISE-6 가설 B 정면 부정 자체가 paradigm 결단 결정적 자료"):
- **Why**: SPIKE v2 mean delta -0.028 ( 오히려 감소) → data quality 가설 부정 = "algorithm 자체 한계" 신호 / paradigm 결단 결정적 자료
- **How to apply**: 가설 부정 자체도 결정적 자료 / SPIKE 시행 paradigm = 가설 1 시행 → 가설 1 부정 시 다음 가설 자동 강화 / paradigm 결단 시 다중 가설 검증 의무

### 다음 step ( 다음 session = v2.5.0 paradigm 본격 도입)

-        PoC #03 + PoC #05 dual representation 적용 → cross-validation 자료 ≥ 2 PoC corroboration 확보
-        Layer 2 LLM mandatory 본격 구현 ( no-simulation 정책 정합 / Static Tool 시뮬레이션 ❌ / 외부 LLM API 직접 호출)
-     description vs natural_language paradigm 재정의 ( Q2 결단)
-     Layer 1 keyword threshold 0.5 → 0.15 floor advisory 격하
-     chain 1 gate br-cross-consistency-validator Layer 2 통합
-       release-readiness 8/8 → 9/9 재격상 검토 (Layer 2 통과 criterion 추가)
-      v2.5.0 MINOR release

---

      **본 session 2026-05-13 session 8차 — v2.4.0 MINOR sub-plan §1 종결 — ADR-CHAIN-011 굳힘 + validator workspace 신설 + threshold spike critical 발견**:

- ✅ **사용자 결단** "A (v2.4.0 MINOR 진입)" + sub-agent 토론 시행 ( Plan M+ 4절 권장 정합) + 시행 순서 통합안 (c→d→a부분) + PoC #04 FE = ADR-CHAIN-011 안 결정 보류
- ✅ ** 3 sub-agent 병렬 토론** (Agent 1 공식문서 / Agent 2 빅테크 / Agent 3 Senior critique)
- ✅ **Senior critique STOP signal 1 + REVISE 5 흡수**:
  - STOP: v2.4.0 MINOR FINAL release 본 session 자격 부재 (사상 굳힘 부재 + §8.1 strict 역방향 위반 + criterion 격상 = chain harness paradigm 재정의 → MINOR bump 부적격 가능성)
  - REVISE 1 ADR-CHAIN-011 본격 작성 우선 (3→1번 격상)
  - REVISE 2 threshold spike 사전 의무 (magic number 거부)
  - REVISE 3 PoC #04 FE = if/then 분기 ADR 안 결정
  - REVISE 4 chain-driver 통합 regression 위험
  - REVISE 5 11 PoC INVALID 원인 분석 의무
- ✅ ** Agent 1 (공식문서) 핵심 finding** — Adzic 10년 SBE 폐기 ( 본 ADR 핵심 위험 신호 최강) / JSON Schema anyOf 공식 권장 / DMN paradigm 정합 / Cucumber description = runtime 무시 (paradigm 다름) / Spectral cross-consistency rule 부재 (industry 공백) / SBE living documentation drift 다발
- ✅ ** Agent 2 (빅테크) 핵심 finding** — GitHub Spec Kit (90K) cross-validation 부재 ( original empirical 자격) / DMN L1+L3 ladder vs 본 방법론 co-existence 신규성 / ThoughtWorks CodeConcise 2/3 시간 감축 isomorphic / Microsoft Agent Framework ensemble 정량 threshold 외부 권위 부재 / AWS SCT + Conduktor + Solace validator-first 빅테크 정합 / Drools governance 실패 패턴 회피 도구 보유
- ✅ ** ADR-CHAIN-011 본격 작성** (`docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md`):
  - 사상 정식 명문화 + 6갈래 drift 사실 + 사상 발전 history (v1.x → v2.4.0)
  - 외부 사례 자릿수 정합 5종 (JSON Schema / Gherkin / Adzic / DMN / Spectral / SBE)
  - 빅테크 사례 자릿수 정합 6종 (Spec Kit / DMN L1+L3 / ThoughtWorks / Microsoft / AWS+Conduktor+Solace / Drools)
  - dual representation paradigm + Layer 1 결정적 + Layer 2 LLM advisory + threshold ≥ 0.85 empirical
  - PoC #04 FE if/then 분기 (단일 schema 유지 / nested anyOf ❌ 명시) 결단
  - chain 1 gate 통합 + release-readiness §8.1 strict 7/7→8/8 격상 사상 ( 단 MINOR bump 부적격 가능성 명시)
  - ADR-008 이중 렌더링 사상의 BR 영역 확장 + F-015 cross-validation schema 내재화
  - LL-i-22~24 (session 7차) + LL-i-26 (Adzic 10년 폐기 재도전 / cross-validator 회피 도구 의무) + LL-i-27 (industry 공백 채우는 original 기여 자격)
  - 시행 paradigm = sub-plan §1 (본 session) + §2 (다음 session) + §3 (그 다음 session)
- ✅ ** br-cross-consistency-validator workspace 16번째 신설** (`tools/br-cross-consistency-validator/`):
  - 5 파일 (package.json + cli.js + validator.js + deterministic.js + llm.js + test/validator.test.js)
  - Layer 1 결정적: 두 표현 ≥ 1 / keyword overlap / structure / BR id 4토막 / severity-weighted score
  - Layer 2 LLM advisory: placeholder + interface 정의 ( Static Tool 시뮬레이션 금지 정책 정합 / 다음 session 실 구현)
  - workspace root package.json `workspaces` array 16번째 등록
  - **22/22 unit test pass** ( Plan N §8 ≥ 15 case 충족)
  - CLI sanity check 11 PoC × rules.json 모두 동작 정합 (PoC #01 GWT 풍부 = pass / 그 외 finding 검출 정합)
- ✅ ** threshold spike critical 발견** (`tools/br-cross-consistency-validator/SPIKE-2026-05-13-threshold-distribution.md`):
  - 11 PoC × 107 BR 측정 결과 — **with_both = 0 / 모든 PoC** = 두 표현 동시 보유 BR 부재
  - overlap_distribution 측정 자체 불가능 → ≥ 0.85 hypothesis confirm 자료 부재
  - 6갈래 drift 직접 검증 — PoC #02/#03 = validator 매핑 부재 + schema 매핑 부재 신규 발견
  - id_pattern_violation 43건 (PoC #06+#07+#08+#09+#10+#11) — v2.3.7 enforcement 정합 / 기존 carry 보존
- ✅ **ADR §5.4 patch** ( spike 결과 반영 + 신규 carry 2건 + deterministic_score 산정 anomaly 명시)

### resolved by 본 session ( session 8차)

(없음 — 본 session = sub-plan §1 = ADR 굳힘 + validator scaffolding + threshold spike / 실 carry resolved 는 sub-plan §2~§3 시)

### 신규 carry ( session 8차)

- **C-threshold-spike-revisit** ( critical / sub-plan §2 후 overlap 분포 실측 가능 도달 시 재spike)
- **C-poc-02-03-schema-mapping** ( critical / PoC #02 condition+description + PoC #03 trigger+condition+action 매핑 부재 / sub-plan §2 마이그레이션 또는 schema 매핑 추가)
- **C-br-cross-validator-Layer2-LLM-impl** ( sub-plan §2 다음 session — Layer 2 placeholder → 본격 구현)
- **C-deterministic-score-formula-revisit** ( sub-plan §2 후 overlap 가산점 후보)

### Lessons Learned 신규 ( session 8차 / ADR-CHAIN-011 정합)

-     **LL-i-26** (  "Adzic 10년 폐기 사실 = 본 ADR 핵심 위험 신호"):

  - **Why**: Gojko Adzic 본인 10년 retrospect 자기 폐기 ("specifications and tests in a single document didn't really work out") = 본 방법론 dual representation 의 정면 재도전 / cross-validator 부재 시 동일 폐기 보장
  - **How to apply**: cross-validator Layer 1 + Layer 2 모두 강 구현 의무 / chain 1 gate 의무 / 정기 재검토 / 외부 인용 시 Adzic 폐기 회피 도구 명시 의무
- **LL-i-27** ( "br-cross-consistency-validator = industry 공백 채우는 original 기여 자격"):
- **Why**: GitHub Spec Kit (90K star) / AWS Q / ThoughtWorks CodeConcise / DMN / Drools / Spectral / OpenAPI 모두 cross-consistency rule 부재 = industry 공백
- **How to apply**: 외부 인용 시 "원조 자격" 명시 가능 / paradigm-cross corroboration ADR-CHAIN-008 §1 정합 의무 / "Spec Kit + DMN + 본 방법론" 자릿수 비교 외부 발표 후보

### 다음 step ( 다음 session = sub-plan §2)

- schema top-level 재설계 (project_id + business_rules)
- PoC #04 FE if/then 분기 본격 구현
- 1~2 PoC pilot 마이그레이션 ( §8.1 strict 정합 / PoC #01 BE + PoC #04 FE 권장)
- drift-validator + br-cross-consistency-validator 양쪽 통과 확인
- 잔여 9 PoC 마이그레이션 ( pilot 검증 통과 후)
- Layer 2 LLM 본격 구현
-     사용자 의도 — "마이너 release 자격 도달 시 배포" / sub-plan §2 통과 → §3 chain 1 gate 통합 + release-readiness 격상 검토 후 v2.4.0 MINOR release (  v2.5.0 분리 검토 carry 정합 / Senior STOP signal 정합)

---

- ✅ **사용자 점검 trigger** "다시 한번 점검 / 레거시 분석 부분부터" → 11 PoC analysis 산출물 매트릭스 + rules.json schema-validator 검증
- ✅ ** critical 발견 1** — 11 PoC 모두 rules.json schema-validator INVALID ( governance 실패 본질)
- ✅ ** critical 발견 2** — §8.1 strict release-readiness 가 chain harness validator 만 보고 analysis validator (schema/drift/formal-spec-link) 사각지대
- ✅ **rules.json 6갈래 drift 사실 확보**: PoC #01 GWT 풍부 / #02 GWT 단순 / #03 trigger-condition-action / #04 FE 특수 / #05/#06 title+type+description / #07~#11 title+natural_language
- ✅ **사상 발전 history 조사**: v1.x GWT (공식) → v2.0 source-grounded → v2.1 characterization → v2.3 natural_language ( schema 미동기 / ADR 부재)
- ✅ **사용자 결단** "이거 두개를 같이 만들고 서로 정합성을 체크 하는 건 안되겠지" → dual representation 사상 정식 채택
- ✅ ** schemas/rules.schema.json item 안 변경**:
  - required: `["id", "name", "given", "when", "then"]` → `["id", "name"]`
  - anyOf 신설 (GWT 표현 OR natural_language 표현 ≥ 1 의무)
  - natural_language field 신설 (string / optional)
  - given/when/then = required 제거 / minItems: 1 유지
  - description 안 "v2.4.0-rc1 dual representation" 사상 명시
- ✅ **PoC #01 호환 검증**: anyOf 영역 ✅ pass ( 다른 schema errors 보존 / 별도 carry)
- ✅ **plan 자산 2건**:
  - `~/.claude/plans/m-rules-schema-form-realignment.md` ( M+ 갱신 / cross-validation 사상 반영)
  - `~/.claude/plans/n-br-cross-consistency-validator-design.md` ( 신설 / 다음 session 구현)
- ✅ **DEC 신설**: DEC-2026-05-13-rules-dual-representation-사상-신설

### resolved by 본 session ( session 7차 추가)

(없음 — 본 session 1단계 = 사상 결단 + 자산화 / 실 carry resolved 는 2단계 v2.4.0 release 시)

### 신규 carry ( session 7차 추가)

- **C-rules-top-level-realignment** ( critical / 다음 session — top-level project_id + business_rules 정식 표준화 / 11 PoC 일괄 정합 / PoC #01 마이그레이션)
- **C-br-cross-validator-implementation** ( critical / 다음 session — tools/br-cross-consistency-validator/ workspace 16번째 신설 / Layer 1 결정적 + Layer 2 LLM optional / chain-driver 통합)
- **C-rules-other-schema-errors** ( PoC #01 meta.confidence + enum + rule_conflicts.minItems 위반 / 별도 sprint)
- **C-poc-04-fe-rules-separate-schema** ( FE 트랙 별도 schema 신설 / 또는 if/then 분기)

### Lessons Learned 신규 ( session 7차 추가)

- **LL-i-22** ( "schema 명세 vs 실 PoC drift = governance 실패 사실" / 사상 발전 시 schema 동기화 의무 + ADR 신설 의무 + release-readiness 검증 의무)
- **LL-i-23** ( "release-readiness 자체 quality 사각지대" / §8.1 strict 7/7 통과 + PoC schema-validator INVALID 11/11 사실 = release-ready 라벨 실 quality 보장 ❌)
- **LL-i-24** ( "두 사상 dilemma → dual representation 사상 정합" / characterization vs 자동화 trade-off → 두 표현 동시 + cross-validation / ADR-008 이중 렌더링 사상의 "BR 영역 확장" 패턴)
- **LL-i-25** ( "옵션/결단 단어 짜증 사용자 피드백 자산화" / 직설적 답변 + 비유 + 예시 우선 / "결단" 단어 최소화 / 핵심 결정 1~2개로 압축)

### 다음 step ( 다음 session)

- schema top-level 재설계 (project_id + business_rules 정식 표준화 / 11 PoC 마이그레이션)
- tools/br-cross-consistency-validator/ workspace 16번째 신설 (Plan N 정합)
- ADR-CHAIN-011 본격 작성 (BR dual representation paradigm)
- chain 1 gate 통합 + release-readiness analysis_validator_violation criterion 신설
- PoC #04 FE 별도 schema
- v2.4.0 MINOR release + v2.3.7 commit 2건 통합 push
- 4원칙 2원칙 sub-agent 3원칙 권장 ( critical 자산 변경 / Senior critique 의무)

---

     **본 session 2026-05-13 session 7차 — v2.3.7 PATCH release — BR ID 4토막 schema enforcement**:

- ✅ **사용자 점검 질의** "지금 우리 프로젝트 점검" → 프로젝트 현황 / 산출물 / 검증 절차 / 한계 carry 보고
- ✅ **사용자 결단** "BR 표기법 도메인-카테고리-번호로 하자" → 4토막 정식 표준 채택
- ✅ **영향 범위 조사** — id-conventions.md 가 이미 4토막 정식 표준 명시 사실 확보 ( 표준 vs schema enforcement 분리 잔존 패턴 발견) / 11 PoC rules.json BR 형식 전수 조사 (정합 5 + 위반 6)
- ✅ **사용자 결단 2 question** — Q1 (a) PoC #11 즉시 재라벨 + 5 PoC carry / Q2 (a) PoC #11 카테고리 = 도메인 전문가 위임
- ✅ **4원칙 plan** `~/.claude/plans/l-br-id-4-segment-enforcement.md` (7절) + "Plan 원안 승인 + 즉시 착수" 결단
- ✅ **schema enforcement 변경**:
  - `rules.schema.json` BR pattern → `^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$` (4토막+ strict / 5토막+ 자연 허용)
  - `domain.schema.json` + `state-map.schema.json` + `meta-confidence.schema.json` description 예시 4토막 정합
  - `id-conventions.md` § 규칙 4 항목 v2.3.7 enforcement label + 신규 마이그레이션 carry 절 (영향 6 PoC 명시)
- ✅ **schema-validator unit test 3 신규** — 3토막 fail / 4토막 pass / 5토막 pass / **8/8 pass ✅**
- ✅ ** 6 PoC 일시 fail 허용 carry 명시** — PoC #11 (BILLING) + PoC #06 (EXCHANGE) + PoC #07 (CAPITAL) + PoC #08 (PETSTORE) + PoC #09 (RW) + PoC #10 (RAE)

### resolved by 본 session ( session 7차)

- **C-schema-br-pattern-fix** ( session 3차 발견 trigger)

### 신규 carry ( session 7차)

- **C-rules-BR-id-relabel-PoC-11** ( critical / 도메인 전문가 위임 / chain 3+4 진입 전 결단 의무 후보)
- **C-rules-BR-id-relabel-5PoC** ( PoC #06+#07+#08+#09+#10 일괄 재라벨 별도 sprint)

### Lessons Learned 신규 ( session 7차)

- **LL-i-19** ( "id-conventions 표준 vs schema enforcement 3 layer 정합 의무"): 문서 명시 + schema 강제 + unit test 검증 = 3 layer 정합 의무 / 향후 동일 패턴 (UC/BHV/AC ID) 점검 의무
- **LL-i-20** ( "schema strict 화 → 기존 PoC fail = 표준 enforcement 자연 결과 / 도메인 전문가 위임 = F-015 한계 회피")
- **LL-i-21** ( "scope 최소화 + 영향 정직 보고 정합" — plan 6 schema → 실제 1 strict + 3 description 정합 축소)

### 다음 step

- **C-rules-BR-id-relabel-PoC-11** = 도메인 전문가 결단 sprint ( PoC #11 chain 3+4 진입 전 의무)
- **C-rules-BR-id-relabel-5PoC** = 별도 sprint ( v2.4.0 MINOR 자격 잠재)
- §8.1 strict 검증 + build + git tag v2.3.7 ( 본 session 마무리)

---

      **본 session 2026-05-13 session 3차 — B sprint chain 2 UC #1 partial 자산화 (  Agent 3 STOP 2 + REVISE 5 흡수)**:

- ✅ **B 본격 진입** — 사용자 결단 "풀가동 해줘" → 4원칙 3원칙 4 question 결단 (Q1 PoC #11 사내 ROI / Q2 4 stage 풀가동 / Q3 3 sub-agent / Q4 chain 2 본 session)
- ✅ **자산 전수 조사** — PoC #11 chain 1 planning-spec 보유 + PoC #05 sample chain 2 모범 예시 + chain 2 schema (behavior-spec + acceptance-criteria)
- ✅ **3 sub-agent 병렬 research** — Agent 1 공식문서 (Gherkin/SBE/MoSCoW/Use Case 2.0 + Spring 4.1+iBATIS 2+egov chain 2 OSS 사례 부재 = original empirical finding 자격) + Agent 2 Big-tech ( GitHub Spec Kit 90K star = chain harness 4단계 동형 / Amazon Q SWE-bench 66% R1' Modern 자릿수 정합 / TDAD arxiv 2603.17973 chain 3 RED→4 GREEN 권위) + Agent 3 Senior critique ( STOP 2 + REVISE 5)
- ✅ ** Agent 3 Senior critique 흡수** — STOP signal 2 (cycle feasibility + v2.4.0 자격 부재) + REVISE 5 (PoC #08 carry + Legacy stack + expert 게이트 + scope UC #1 + 결단 burst) 메인 cross-check 검증 ( ADR-CHAIN-008 + PoC #05 = 4 file = sample ≠ realworld 정확)
- ✅ **4 question 사용자 결단** — Q1 PATCH v2.3.5 (chain 2 종결 후) / Q2 UC #1 만 본 session / Q3 (b) characterization mode 현 behavior 보존 / Q4 carry 2건 신설 (C-stack-결단-chain-3-4-plan + C-OSS-Modern-chain-2-4-PoC08)
- ✅ **k-plan 작성** — `~/.claude/plans/k-poc-11-chain-2-plan.md` (8절 / chain 2 UC #1 한정 / characterization mode 명시 / scope OUT 명확)
- ✅ ** chain 2 UC #1 자산화 (4 file)** — `examples/poc-11-efiweb-billing-spring41/.aimd/output/`:
  - `behavior-spec.json` ( 1 BHV-BILLING-001 / UC #1 → BHV 1:1 / 3 AC forward / characterization mode invariants 명시 / schema strict ✅)
  - `behavior-spec.md` ( 사람 읽기 / 두 렌더링 / characterization mode 사상 + schema mismatch carry 명시)
  - `acceptance-criteria.json` ( 3 AC-BILLING-001/002/003 / Gherkin BDD / must×2 + should×1 / verifiable=true + test_case_refs TC-\* placeholder / schema strict ✅)
  - `acceptance-criteria.md` ( Gherkin .feature 렌더 / Better Gherkin 사상 정합)
- ✅ **chain-coverage-validator 검증** — 4 high findings expected (UC #2~#4 no BHV / coverage 0.25 < 0.85 threshold) — 본 session = UC #1 만 결단 정합 사실 (Agent 3 signal 4 정합)
- ✅ **planning-extraction-validator 검증** — 0 findings + use_case coverage = 1 ✅
- ✅ **schema-validator 검증** — behavior-spec ✅ + acceptance-criteria ✅ ( schema strict pass)
- ✅ ** critical schema pattern mismatch 발견** — rules.json BR ID 형식 (`BR-BILLING-005` 3 segment) vs behavior-spec.schema.json `br_refs` pattern (`^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$` 4 segment) 불일치 → br_refs 빈 array + carry C-schema-br-pattern-fix 신설 / BR 매핑 fact = description + invariants + source_grounded_evidence 자연 보존

### resolved by 본 session ( session 3차)

- C-r1-prime-자격-Modern-corroboration ( session 1차 v2.3.3 / 보존)
- C-not-all-code-검증 ( session 2차 v2.3.4 / 보존)
- C-poc-11-0-satd-해석-정정 ( session 2차 / 보존)
- C-poc-11-source-디렉토리-cleanup ( session 2차 / 보존)

### 신규 carry ( session 3차)

- **C-stack-결단-chain-3-4-plan** ( critical / Agent 3 signal 5 STOP / chain 3+4 진입 전 4원칙 1원칙 재실행 의무 / option (i) Legacy / (ii) Modern 마이그레이션 / (iii) characterization 만 결단)
- **C-OSS-Modern-chain-2-4-PoC08** ( critical / Agent 3 signal 6 STOP / PoC #08 jpetstore-6 chain 2~4 후속 sprint = ≥ 2 realworld PoC corroboration 자격 trigger / v2.4.0 MINOR 자격 활성)
- **C-schema-br-pattern-fix** ( chain 2 발견 / behavior-spec.json br_refs schema pattern vs rules.json 형식 불일치 / 본 PoC + PoC #06+#07 모두 정합 / 별도 sprint = schema 수정 또는 rules.json 형식 정합 결단)
- **C-chain-2-UC-2-3-4-진입** ( chain 2 다음 session / 본 session UC #1 만 / UC #2 + UC #3 ( critical BHV-BILLING-003) + UC #4 진입)
- **C-PoC-11-chain-2-PATCH-v2.3.5-trigger** ( chain 2 4 UC 모두 종결 후 PATCH v2.3.5 release 결단 / 사용자 결단 Q1 정합)

### 보존 carry ( 본 작업 후)

- C-모던-stack-사내-측정 ( critical / Agent 3 REVISE #1 / 사내 Modern stack PoC)
- C-사내-chain-2-4 ( resolved partial — 본 session = PoC #11 chain 2 UC #1 진입)
- C-egovframework-chain-2-4 ( resolved partial — 본 session = PoC #11 chain 2 UC #1 진입)
- C-egovframework-sub-rule ( Modern stack sub-rule 본격 자산화)
- C-domain-PoC11-1~3 ( 결제 도메인 expert 위임)
- C-PoC07-1~3 ( chain 3 영역 retrofit / B sprint 안 자연 흡수 후보)
- C-v2.2.0-1 ( NoSQL/Prisma v3.0)
- C-v2.3.0-gartner-time-application-level (별도 sprint)

### 4원칙 Lessons Learned (본 session 3차 신규)

- LL-i-8 ( critical / Agent 3 Senior critique = STOP signal 2건 + REVISE 5건 = critical) — "풀가동" 사용자 결단 직후 Senior critique = STOP signal 발견 → 사용자 결단 100% Agent 3 권고 흡수 = 4원칙 §3 + Agent 3 정신 정합 ( 사용자 명시 결단 + Senior critique 양쪽 모두 정합 가능)
- LL-i-9 ( chain 2 schema mismatch 발견) — rules.json 형식 vs behavior-spec.schema.json br_refs pattern 불일치 = PoC #11 chain 2 첫 적용 시 발견 / 본 발견 자체 = PoC 가치 / chain 2 첫 적용 = critical lesson = 본 방법론 schema fix 의무
- LL-i-10 ( chain 2 = paradigm-agnostic 정합 사실 확인) — Legacy Spring 4.1 + iBATIS 2 + egov stack 안에서도 chain 2 (behavior + AC) 작성 자체는 feasible / paradigm-agnostic 정합 ✅ ( chain 3+4 = stack 결단 의무 / chain 2 ❌)

### 다음 step

- chain 2 다음 session = UC #2 (조회 계열 / dataConfirmListAjax) + UC #3 ( critical BHV-BILLING-003 atomicity / expert 게이트 의무) + UC #4 (Qlik View)
- chain 2 4 UC 모두 종결 → PATCH v2.3.5 release 결단 ( Q1 정합)
- chain 3 + chain 4 진입 전 = stack 결단 plan 신설 (C-stack-결단-chain-3-4-plan)
- chain 2~4 본격 종결 후 = PoC #08 chain 2~4 후속 sprint (C-OSS-Modern-chain-2-4-PoC08) = ≥ 2 realworld PoC 자격 → v2.4.0 MINOR 자격 trigger

---

---

      **본 session 2026-05-13 session 5차 — chain-driver retroactive gate 정식 통과 ( critical lesson "양심 의존 차단" 정합 강화)**:

- ✅ **사용자 질문 "chain1→2 검증 과정?"** — critical 발견 trigger
- ✅ **솔직 보고** — chain-driver state.json 모든 PoC (PoC #11 + PoC #03~#10) 부재 사실 / validator 사후 검증 ✅ / chain-driver state machine ❌ 양심 의존 패턴 가능성 보고
- ✅ **사용자 결단** — "즉시 chain-driver init + gate retroactive 실행 (추천)"
- ✅ **PoC #11 chain-driver init + 2 next 실행**: analysis → planning (go) + spec (go) gate 정식 통과 / state.json 작성 / planning + spec stage_progress="complete"
- ✅ **.gitignore 정책 확인** — `examples/**/.aimd/state.json` + `intervention-log.jsonl` = git ignored ( "PoC 별 영속 / 사용자 local runtime artifact" 정합 / sub-plan-5+ 결단)
- ✅ ** "양심 의존 차단" 정책 정정 자산화** — chain-driver tool 직접 실행 = "양심 의존" 차단 / state.json git 공유 ❌ = local runtime / session 5차 = "양심 의존 → tool 정식 실행" 전환 ✅

### critical lesson

- chain-driver next = `--findings <path>` 옵션 ❌ = validator findings 자동 입력 ❌ → 암묵 0 findings 가정으로 pass ( 양심 의존 잔존 패턴)
- 단 실 validator (chain-coverage + planning-extraction + schema + release-readiness §8.1 strict) 모두 ✅ = cross-link 자연 정합

### 신규 carry ( session 5차)

- **C-chain-driver-findings-integration** ( critical / chain-driver next --findings 옵션 정식 통합 / validator JSON 자동 변환 + 입력 의무)
- **C-chain-driver-state-retroactive-all-PoC** ( 다른 PoC chain-driver retroactive 실행 의무)

### Lessons Learned 신규 ( session 5차)

- LL-i-14 ( critical): "양심 의존 차단" 정책 = chain-driver tool 직접 실행 의무 / state.json git ignored = local runtime / validator 사후 + chain-driver retroactive 통과 = 양심 의존 → tool 정식 통과 전환 / --findings 옵션 통합 carry
- LL-i-15 ( critical): 사용자 질문 = critical 발견 trigger / 정직 솔직 보고 의무

### /doctor figma plugin warning ( session 5차 추가)

- informational warning / 작동 영향 ❌ / 사용자 결단 (a) 무시

---

      **이전 session 2026-05-13 session 2차 v2.3.4 PATCH release**:

---

      **본 session 2026-05-13 session 2차 v2.3.4 PATCH release ( Agent 1 F-015 finding 정정 + critical lesson)**:

- ✅ **D 작업 종결** — PoC #11 satd 해석 정정 (`examples/poc-11-efiweb-billing-spring41/sql-inventory/sql-inventory.json` summary.self_recognized_interpretation 절 신설 / "Modern OSS reference 정합" 단순 결론 ❌ / single-case + 작은 모듈 + 잠복 기간 미경과 명시) + 빈 source 디렉토리 4 + parent 제거 (in-place read 정책 정합)
- ✅ **E 작업 종결** — 메인 WebFetch + WebSearch 직접 검증 = arxiv 2601.21894 정확 사실 확보 ( Twist et al. 2026 "Not All Code Is Equal: A Data-Centric Study of Code Complexity and LLM Reasoning" / First author Lukas Twist / 2026-01-29 submission / 83% experiments structural complexity restrict outperforms)
- ✅ ** DEC-2026-05-13-not-all-code-인용-복원 신설** — Agent 1 F-015 finding 정정 + arxiv 2601.21894 인용 복원 + critical lesson F-015 한계 (메인 cross-check 의무) + sub-rule v1.1.1 → v1.1.2 PATCH trigger
- ✅ ** sub-rule v1.1.1 → v1.1.2 PATCH** — Twist et al. 정확 인용 복원 (§X-C #7 신설 + §6 carry resolved + §7 참조 정확 인용 복원 + frontmatter v1.1.2 추가)
- ✅ ** memory `feedback_sub_agent_validation.md` v2.3.4 보강 절 추가** — F-015 한계 패턴 명시 + 적용 4 항목 ( "확인 불가" 결단 시 메인 WebFetch + WebSearch 즉시 cross-check 의무)
- ✅ **DEC-2026-05-13-r1-prime-본체-명문화 §5.1 갱신** — C-not-all-code-검증 ✅ resolved 표기
- ✅ ** B 진입 plan 작성** (4원칙 1원칙 / `~/.claude/plans/j-chain-2-4-풀가동.md` / 10절 / PoC 대상 결단 후보 5종 + 4 chain × stage 분해 + release v2.4.0 MINOR 자격)
- ✅ **CHANGELOG + version bump** — v2.3.3 → v2.3.4 (plugin.json + package.json + scripts/version-check.js 3 source sync)
- ✅ **build dist** — `scripts/build-plugin.js`
- ✅ **회귀 unit test** — schema 변경 ❌ → 변동 ❌ expected
- ✅ **release-readiness §8.1 strict 7/7** — `--target v2.3.4`
- ✅ **git tag v2.3.4 + commit + origin push**

### resolved by 본 session ( session 2차)

- ~~**C-not-all-code-검증**~~ ✅ resolved by DEC-2026-05-13-not-all-code-인용-복원 ( critical / 메인 cross-check)
- ~~**C-poc-11-0-satd-해석-정정**~~ ✅ resolved ( D 작업 / sql-inventory.json summary.self_recognized_interpretation 절 신설)
- ~~**C-poc-11-source-디렉토리-cleanup**~~ ✅ resolved ( D 작업 / 빈 디렉토리 4 + parent 제거)
- DEC-2026-05-13-r1-prime-본체-명문화 §5.1 신규 carry 1건 ✅ resolved 갱신

### 신규 carry ( v2.3.4 PATCH 후)

- **C-사내-chain-2-4** ( critical / B plan §8 / 사내 ROI axis / PoC #11 billing chain 2~4 별도 sprint / B 종결 후 자격 트리거)
- **C-egovframework-chain-2-4** ( 사내 Spring 4.1 + iBATIS 2 + egov stack chain 2~4 / B plan §8)

### 보존 carry ( 본 작업 후)

- C-모던-stack-사내-측정 ( critical / Agent 3 REVISE #1 / 사내 Modern stack PoC 진입 시 ceiling 재측정 의무)
- C-egovframework-sub-rule ( Modern stack sub-rule 본격 자산화)
- C-domain-PoC11-1~3 ( 결제 도메인 expert 위임)
- C-PoC07-1~3 ( chain 3 영역 retrofit / B sprint 안 자연 흡수 후보)
- C-v2.2.0-1 ( NoSQL/Prisma v3.0)
- C-v2.3.0-gartner-time-application-level (별도 sprint)

### 4원칙 Lessons Learned (본 session 2차 신규)

- LL-i-5 ( critical / DEC-2026-05-13-not-all-code-인용-복원 §8): F-015 cross-validation 한계 — 가벼운 sub-agent + 시간 cap 10분 = WebFetch fail / "확인 불가" 단순 결단 = critical risk → 메인 cross-check 의무 (memory `feedback_sub_agent_validation.md` 갱신)
- LL-i-6: 사용자 명시 결단 우선 (Agent 3 REVISE #2 결단 burst 정신 vs 사용자 명시) — Agent 정신만 흡수 ( "최소 변경" + scope creep 회피) / 형식 권고 (24h cooling) ❌
- LL-i-7: 같은 session 2차 = 자연 발견 burst 회피 (Agent 1 finding 정정 + 메인 cross-check 결과 → 의도 burst ❌ / Agent 3 정신 정합)

### 다음 step

- B 본격 진입 = 별도 multi-day session ( 4원칙 2원칙 research + 3원칙 사용자 결단 PoC 대상 / PoC #08 jpetstore-6 추천)
- B plan `~/.claude/plans/j-chain-2-4-풀가동.md` 안 모든 결단 후보 명시

---

      **본 session 2026-05-13 session 1차 v2.3.3 PATCH release ( R1' axis 본체 명문화)**:

- ✅ **4원칙 1원칙** — plan 자산화 (`~/.claude/plans/i-r1-prime-ceiling-본체.md` / 10절 / scope IN 13항)
- ✅ **4원칙 2원칙** — research 자산화 (`~/.claude/plans/i-r1-prime-research.md` / 3 sub-agent 병렬 / 가벼운 sub-agent 전략 / 시간 cap 10분/agent / 실측 ~76~80초/agent)
- ✅ **4원칙 3원칙** — 사용자 결단 4 question 묶음 일괄 ( 풍성한 옵션 4건 모두 채택)
- ✅ ** 3 layer 본체 가치 명세 갱신** — CLAUDE.md L36~ + ai-native-methodology/README.md L34~ + memory project_methodology_scope.md "scope OUT" 절 / R1' axis 분리 + metric semantics 차이 + Modern OSS 한정 + 외부 권위 cross-link
- ✅ ** sub-rule v1.1 → v1.1.1 PATCH** — Agent 1 인용 정정 3건 (Wang/LongCodeBench 2025/Not All Code 제거) + Agent 2 외부 권위 보강 (AWS SCT + Amazon Q + ThoughtWorks) + §X-C-2 신설 (Big-tech industry isomorphic corroboration) + Modern OSS 한정 명시 + metric semantics 차이 명시
- ✅ **DEC 신설 + 갱신** — DEC-2026-05-13-r1-prime-본체-명문화 신설 + DEC-2026-05-12-r1-가설-revisit §5 resolved 갱신
- ✅ **CHANGELOG + version bump** — v2.3.2 → v2.3.3 (plugin.json + package.json + scripts/version-check.js 3 source sync)
- ✅ **build dist** — `scripts/build-plugin.js` (artifact 검증)
- ✅ **회귀 unit test** — schema 변경 ❌ → 변동 ❌ expected
- ✅ **release-readiness §8.1 strict 7/7** — `--target v2.3.3`
- ✅ **git tag v2.3.3 + commit**

### resolved by 본 session

- ~~**C-r1-prime-자격-Modern-corroboration**~~ ✅ resolved by DEC-2026-05-13 ( critical)
- ~~DEC-2026-05-12-r1-가설-revisit §5 본체 영향 5행 모두~~ ✅ resolved ( 갱신)
- ~~Zhang → Wang 인용 정정~~ ✅ resolved (sub-rule v1.1.1 + DEC + plan 모두)
- ~~LongCodeBench 2026 → 2025 정정~~ ✅ resolved (sub-rule v1.1.1 + DEC)
- ~~Modern OSS 한정 명시 부재~~ ✅ resolved (Agent 3 REVISE #1 흡수 / 3 layer + sub-rule §X-E)
- ~~metric semantics 차이 명시 부재~~ ✅ resolved (Agent 3 강화 흡수 / 3 layer + sub-rule §X-F.3)

### 신규 carry ( v2.3.3 PATCH 후)

- **C-not-all-code-검증** ( Agent 1 F-015 / arxiv 2601.21894 별도 검증 후 인용 재개 vs 영구 제거)
- **C-모던-stack-사내-측정** ( critical / Agent 3 REVISE #1 / 사내 Modern stack PoC 진입 시 ceiling 재측정 의무)

### 보존 carry ( 본 작업 후)

- C-egovframework-sub-rule ( Modern stack sub-rule 본격 자산화)
- C-domain-PoC11-1~3 ( 결제 도메인 expert 위임)
- C-PoC07-1~3 ( chain 3 영역 retrofit)
- C-poc-11-0-satd-해석-정정 ( Agent 1 cross-validation 흡수 잔존)
- C-poc-11-source-디렉토리-cleanup ( 낮은 우선)
- C-v2.2.0-1 ( NoSQL/Prisma v3.0)
- C-v2.3.0-gartner-time-application-level (별도 sprint)

### 4원칙 Lessons Learned (본 session)

- LL-i-1: 가벼운 sub-agent 전략 (Agent 3 case 생략) 도 critical findings 5건 확보 → "scope 작은 작업" 도 4원칙 2원칙 진행 정당성 입증
- LL-i-2: Senior critique REVISE 2 (Modern OSS 한정 + 결단 burst) = 본문 표현 보강 단순 인식 → critical context 명시 누락 위험 회피
- LL-i-3: 사용자 결단 "풍성한 옵션" 채택 → 자동 scope 확장 / "최소 변경" 원칙 strict + scope creep 회피 의무
- LL-i-4: cooling-off 영구 폐기 정합 강화 = Senior critique 권고 vs 사용자 명시 결단 충돌 시 → 사용자 명시 결단 우선 (4원칙 §3) + Senior critique 정신만 흡수 ( 결단 burst 의식 + 최소 변경 강 적용)

---

      **이전 session 2026-05-12 PoC #11 (EFI-WEB billing) Day 0.5~3.5 종결 + v2.3.2 PATCH release**:

      **본 session 2026-05-12 PoC #11 Day 0.5 진입 ( 사용자 결단 α #1 진입 + 결단 β 정책 변경)**:

- ✅ **origin push 동기화** — main + 3 tag (v2.3.0-rc1 / v2.3.0 / v2.3.1) origin 동기화 (4 commits / `8941726..bc48477`)
- ✅ **사용자 결단 (β) 흡수** — "복사하지말고 해당 프로젝트 들어가서 읽었으면 좋겠어" → in-place read 정책 채택
- ✅ **DEC-2026-05-12-in-place-read-정책-채택 등재** — 사본 패턴 폐기 + 사내 PoC 정합 의무
- ✅ **source path 위임** — `/Users/sangcl/Documents/Development/Study/EFI-WEB/ifrs` (사내 EFI-WEB 코드베이스)
- ✅ **billing 모듈 LOC 정탐** — 7 file / 257 Java + 77 sqlmap + 269 JSP = **603 LOC** ( PoC #06 345 vs PoC #07 5509+ 사이 / scale-cross floor)
- ✅ **plan 2차 작성** — `~/.claude/plans/d-poc-11-billing-2.md` (19절 / ~310 lines / in-place 정책 + 정탐 결과 + Day 1~3.5 시퀀스 + §5-A+§5-B+§19 R1 revisit)
- ✅ **4원칙 3원칙 사용자 승인** — plan 2차 + Day 1 본 session 즉시 진입
- ✅ **Day 1.0 source 7 file in-place read** — BillingController + Service IF + Impl + DAO + billing.xml + dataConfirm.jsp + qlikView.jsp
- ✅ **Day 1.1 analysis 4종 작성** — rules.json (8 BR) + domain.json (4 UC / 2 BC) + antipatterns.json (13 AP / 5종 isomorphic + 8종 novel) + inventory.json (Spring 4.1+iBATIS 2+egov + cross-DB 3 / Qlik BI)
- ✅ **Day 1.5 SQL Inventory 11+1 컬럼 + §3-A 측정**:
  - SQL Inventory 6 SQL / **auto_ratio_external_6 = 66.7%** ( 3 사내 PoC isomorphic 자격 충족) / validator 0 findings pass / migration_priority P0×3+P1×2+P2×1
  - §3-A 자동화율 = **52.5%** ( inventory 70% + domain 50% + rules 50% + antipatterns 40%) — plan 2차 expectation 25~40% +12.5%p 초과
- ✅ ** R1 가설 반증 사실 확보** — DEC-2026-05-12-r1-가설-revisit 등재 ( critical methodology finding)
- ✅ ** sub-rule v1.1 본체 보강** — DEC-2026-05-12-sub-rule-v1.1-갱신 (PoC #11 Day 2.0~3.5 suspend 후 본체 우선 / 사용자 결단 정합):
  - KL-SATD 인용 정정 (Korean Language → Keyword-Labeled / SQJ 2024 DOI)
  - §3 ≥ 3 사내 PoC isomorphic 표 강화 (scale-cross 3 spectrum)
  - §X 신규 — automation ceiling R1' (Zhang ICSE 2025 + LongCodeBench 외부 권위 STRONG / 정량 ceiling = original empirical finding)
  - 4원칙 1+2+3 완료 (plan h + research + 사용자 결단 γ)
- ✅ ** PoC #11 Day 2.0~3.5 정식 등재 + 종결** — DEC-2026-05-12-poc-11-종결 / 4축 4/4 pass / 3 사내 PoC isomorphic 자격 충족 / R1 가설 반증 critical finding:
  - phase 4.7 = 4 snapshot + 6 scenario + ratchet baseline write + 14/15 = 93.3% ( Day 2.5 ambiguous BR-BILLING-006 유지 / 사용자 결단 δ)
  - chain 1 planning-spec = 0 findings + UC coverage 100% (planning-extraction-validator pass)
  - REPORT-day3-measurement.md 작성
  - C-v2.2.0-spring41-ibatis2-subrule ✅ resolved ( 3 사내 PoC isomorphic 자격 충족)

### 신규 정탐 ( 본 session)

- **egovframework** layer 발견 (`src/main/resources/egovframework/sqlmap/ifrs/billing.xml`) — 행정안전부 전자정부 표준 프레임워크 / Spring 4.1 + iBATIS 2 위 추가 layer / PoC #06+#07 동일 가능성 (Day 1 검증 의무)
- **Qlik BI 연동** 신규 차원 (qlikView.jsp 60 LOC) — PoC #06+#07 미보유 spectrum
- billing 모듈 = Spring 4.1 standard 3-layer (Controller + Service IF + Service Impl + DAO + sqlmap + JSP)

### resolved by 본 session

- ~~C-in-place-read-policy~~ ✅ DEC-2026-05-12-in-place-read-정책-채택
- ~~**C-r1-hypothesis-revisit**~~ ✅ DEC-2026-05-12-sub-rule-v1.1-갱신 ( §X 등재로 resolved)
- ~~**C-automation-ceiling-paradigm**~~ ✅ DEC-2026-05-12-sub-rule-v1.1-갱신 ( §X 등재로 resolved)
- ~~**KL-SATD 인용 오류**~~ ✅ DEC-2026-05-12-sub-rule-v1.1-갱신 ( §AP-005 정정 / Agent 1 research 기반)
- ~~**iBATIS 2 dynamic tag sub-classification carry**~~ ✅ DEC-2026-05-12-sub-rule-v1.1-갱신 ( v2.3.1 PATCH 정합 / §6 갱신)
- ~~**C-v2.2.0-spring41-ibatis2-subrule**~~ ✅ DEC-2026-05-12-sub-rule-v1.1-갱신 ( 3 사내 PoC isomorphic 자격 충족 / sub-rule v1.1 강 등급)

### 신규 carry ( PoC #11 Day 3.5 종결 후)

- **C-domain-PoC11-1** ( critical / 결제 도메인 expert / BR-BILLING-006 ambiguous COM_NO==2 hardcoded 재검증 의무)
- C-domain-PoC11-2 (BR-BILLING-005 시작년도 2015 의미 확인)
- C-domain-PoC11-3 (Qlik Sense appid/sheet 운영 체계 expert)
- C-poc-11-0-satd-해석-정정 ( Agent 1 cross-validation 기반 / single-case + 잠복 기간 미경과 해석 명시)
- C-poc-11-source-디렉토리-cleanup (낮은 우선순위)
- C-egovframework-sub-rule ( Modern stack sub-rule 본격 자산화 시)
- C-PoC07-1~3 (chain 3 영역 / billing 도 동일 carry 정합)
- C-r1-prime-자격-Modern-corroboration ( Modern stack sub-rule 자산화 시 R1' Modern ceiling ~60~67% 명문화)

---

      **이전 session 2026-05-12 v2.3.1 PATCH release**:

**v2.3.0 MINOR FINAL release 보존** (같은 날 2026-05-12 / commit `fd603bd` / git tag `v2.3.0` / Phase 1 + Phase 2 / ADR-CHAIN-009 + ADR-CHAIN-010)

**v2.3.0-rc1 prerelease 보존** (2026-05-12 같은 날 / commit `de1bae1` / git tag `v2.3.0-rc1` / Phase 1 single)
**v2.2.0 MINOR FINAL release 보존** (2026-05-08 / commit `8941726` / git tag `v2.2.0` / DEC-2026-05-08-v2.2.0-final / 5 PoC SQL Inventory isomorphic robust + ADR-CHAIN-008 paradigm-cross 정책 완화 + cooling-off 영구 폐기)

---

       **본 session 2026-05-12 진행 (v2.3.0 minor sprint Phase 1 + Phase 2 일괄)**:

- ✅ **4원칙 1원칙** — plan 정식 격상 (`~/.claude/plans/g-v2.3.0-minor-plan.md` / 사용자 승인 Tier 1+2 = 3 항목 묶음)
- ✅ **4원칙 2원칙** — research 자산화 (`~/.claude/plans/g-v2.3.0-minor-research.md` / 3 sub-agent 병렬 / 가벼운 sub-agent 전략)
- ✅ **4원칙 3원칙** — 사용자 결단 옵션 D (Senior critique REVISE 완전 흡수)
- ✅ **Phase 1 산출 7/7** — DEC + ADR-CHAIN-009 + schema 12번째 컬럼 + validator + 2 신규 fixture + 3 신규 test + deliverable §1.1+§1.2+§3+§4+§13 갱신 + version bump
- ✅ **v2.3.0-rc1 prerelease** — commit `de1bae1` + git tag `v2.3.0-rc1` (build 272 files / CHECKSUMS 271 OK)
- ✅ **Phase 2 산출 6/6** — ADR-CHAIN-010 + sub-rule deliverable (`methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` / 신규 디렉토리) + schema patterns_extension_v3 + deliverable 24 보강 + 신규 fixture 1 + 신규 test 1 + version bump rc1 → final
- ✅ **회귀 fixture 통과** — 기존 PoC #06+#07 11 컬럼 row test pass (backward-compat 의무 ✅)
- ✅ **workspace test 237 pass** (47+11+15+16+5+5+6+5+6+25+68+14+14 / 0 fail)
- ✅ **release-readiness §8.1 strict 7/7** (ADR-CHAIN 10 dynamic 인식)

### resolved by 본 session

- ~~C-v2.2.0-3~~ patterns_extension_v3 → ✅ ADR-CHAIN-010
- ~~C-v2.2.0-4~~ Spring 4.1 + iBATIS 2 spectrum sub-rule → ✅ ADR-CHAIN-010
- ~~C-v2.2.0-2~~ sql-inventory baseline ratchet → ✅ v2.3.1 PATCH (auto_ratio_external_6 trend flag)
- ~~C-v2.2.0-7~~ iBATIS 2 dynamic 태그 sub-classification → ✅ v2.3.1 PATCH (tag_type enum 26종)

### 별도 sprint carry (v2.4 / v3.0)

- C-v2.3.0-gartner-time-application-level — `methodology-spec/deliverables/application-portfolio-time.md` 신설 후보 ( ADR-CHAIN-009 §2)

---

       **본 session 2026-05-07~08 종결 (β 결단 + "나머지 진행해줘" + "남근거 다 실행" 일괄 처리)**:

- ✅ **PoC #08 (jpetstore-6) Day 1~3.5 종결** — paradigm-cross MEDIUM #1 / commit `da1a0ab`
- ✅ **PoC #09 (lujakob TypeORM) Day 1~3.5 종결** — paradigm + platform-cross MEDIUM #2 / raw query() strong ❌ 솔직 / commit `2af3772`
- ✅ **PoC #10 (raeperd Spring Data JPA) Day 1~3.5 종결 ( reframe)** — DSL builder QueryDSL ❌ 솔직 → Spring Data JPA method name derived paradigm 측정 / paradigm-cross MEDIUM #3 / v2.3.0 minor trigger ❌
- ✅ ** 5 PoC SQL Inventory isomorphic 자격 사실 확보** (66.7% × 5 / iBATIS 2 + MyBatis 3 + TypeORM + Spring Data JPA / paradigm + ORM + platform-cross 모두 robust 강 입증)
- ✅ ** N+1 AP = 5 PoC 공통 일반성 robust 입증**
- ~~⏳ ** v2.2.0 final 격상 trigger ❌** ( Senior STOP signal / PoC #08+#09+#10 모두 MEDIUM corroboration / strong 의무 vs 실측)~~ ✅ **resolved 2026-05-08** — ADR-CHAIN-008 신정책 (MEDIUM × ≥ 5 PoC = strong) + cooling-off 폐기 + v2.2.0 MINOR FINAL release (commit `8941726`)
- ~~⏳ ** 신규 carry 2** = 사용자 결단 의무~~ ✅ **resolved 2026-05-08** (ADR-CHAIN-008 §1 신정책 / 2026년 realworld OSS 부재 사실 정탐 흡수 → 둘 다 obsolete)
  - ~~C-paradigm-cross-strong-raw-sql~~ ✅ obsolete
  - ~~C-paradigm-cross-DSL-builder-querydsl~~ ✅ obsolete
- ⏳ **PoC #11 (EFI-WEB billing)** = 사용자 결단 α 우선순위 #1 / source 위임 도착 시 복귀

~~ §8.1 strict 본체 격상 ❌. Senior STOP signal 강화 ( 2 carry 사용자 결단 의존).~~ ✅ **superseded** by Auto Mode (B) 결단 + ADR-CHAIN-008 + v2.2.0 MINOR FINAL release (line 24+ 참조 / commit `8941726`).

     **본 session 추가 진행 (Auto Mode (A) 결단)**: PoC #12 (raw query()) + PoC #13 (DSL builder QueryDSL) prelim 일괄 신설 (DEC-2026-05-08-poc-12-13-prelim-신설).     2 추가 정탐 결과 =   realworld OSS 부재 사실 확보.

      **본 session 정점 (Auto Mode (B) 결단)** — DEC-2026-05-08-paradigm-cross-policy-완화 +   ADR-CHAIN-008 신설.  "MEDIUM × ≥ 5 PoC isomorphic = strong corroboration 자격 충족" 신정책. 근거: 5 PoC + 2 정탐 사실 + 6 차원 corroboration sum (paradigm + ORM + platform + language + responsibility + scale) + Senior critique 재검토.     resolved carry 4 (C-v2.2.0-6 + C-paradigm-cross-strong-raw-sql obsolete + C-paradigm-cross-DSL-builder-querydsl obsolete + C-ADR-2026-OSS-paradigm-reality).   v2.2.0 final 격상 trigger  활성 (cooling-off 7d minimum 후 2026-05-15+ 별도 결단 의무). PoC #12+#13 prelim 자산 보존 ( 사용자 source 도입 시 진입 가능 / 의무 ❌).

**v2.2.0-rc1 PRERELEASE** (2026-05-08 / 같은 날 — DEC-2026-05-08-v2.2.0-rc1-prerelease / phase 4.8 (sql-inventory) 본체 격상 prerelease / SQL 단위 11 컬럼 인벤토리 + extraction_automation + RDB 한정 sub-phase / ADR-CHAIN-007 / scale-cross corroboration ✅ + paradigm-cross ❌ → Modern ORM PoC #08 carry / 본체 자산 7 + workflow + ADR / unit test 232 → 233 (+1 / sql-inventory-extractor workspace 14번째) / Senior cooling-off (b) v2.2.0-rc1 prerelease 7d minimum / chain harness 5 요소 변경 ❌)

** research-v220 후 결단 흡수**:

- Senior STOP signal (paradigm-cross 부재) → v2.2.0-rc1 prerelease + 7d minimum cooling-off + Modern ORM PoC #08 carry C-v2.2.0-6
- Agent 1 (공식 docs) 빈틈 4건 모두 흡수 → statement_type 11번째 컬럼 + patterns_extension_v3 carry + iBATIS 2 전용 enum carry + Feathers/Gartner TIME 인용 ADR 명문화
- Big-tech (Agent 2) 권고 흡수 → "Why not AWS SCT" 차별화 절 + 자체 baseline 정립 + Gartner TIME 12번째 컬럼 carry

** 본체 격상 자산 7 + workflow** (v2.2.0-rc1):

1. ✅ `methodology-spec/deliverables/24-sql-inventory.md` ( #23 사용 / #24 신규)
2. ✅ `schemas/sql-inventory.schema.json` ( 31번째 schema)
3. ✅ `schemas/meta-confidence.schema.json` `inputs_used` enum 13 → 14 (`sql_inventory` 추가)
4. ✅ `skills/analysis-phase-4-8-sql-inventory/SKILL.md` ( skills 20 → 21)
5. ✅ `tools/sql-inventory-extractor/` ( workspace 14번째 / 10 unit test)
6. ✅ `flows/analysis.phase-flow.{json,mermaid}` v2.1.0 → v2.2.0-rc1 (phase 4.8 entry)
7. ✅ `methodology-spec/workflow/phase-4-8-sql-inventory.md`
8. ✅ `docs/adr/ADR-CHAIN-007-phase-4-8-sql-inventory.md`

**release commit cadence (C1~C7)**:

- C1 (`f64e0b2`) — deliverable 24 + schema 31번째 + meta-confidence enum
- C2 (`4d87416`) — skill phase-4-8-sql-inventory
- C3 (`e4b0143`) — tool sql-inventory-extractor + 10 unit test + workspace 14번째
- C4 (`7b39cfb`) — flow + ADR-CHAIN-007 + workflow
- C5 (`4b26d0e`) — version bump + build + CHANGELOG
- C6 (`3e973ce`) — DEC + STATUS + INDEX + CLAUDE.md
- C7 ✅ git tag v2.2.0-rc1 ( prerelease / `3e973ce` 기준 / Tagger Rageboom 2026-05-07)
- C8 (현재) — plan/research 4건 자산화 + STATUS C7 ✅

** v2.2.0 final 격상 trigger 의무 + 사내 ROI axis 분리 ( 사용자 결단 (α) 2026-05-07)**:

    **사용자 결단 (α) 2026-05-07 = "EFI-WEB 가장 우선순위 높다"** → **PoC 우선순위 재정렬**:

- **PoC #11 (EFI-WEB billing) = 우선 진입** (사내 ROI axis / scale + domain-cross / paradigm-cross 자격 ❌ → v2.2.0 final 격상 trigger 와 별도)
- **PoC #08 (jpetstore-6) = 보류** (Day 0+0.5 commit `a27dfb0` + `a60404c` 자산 보존 / 후순위 진입)
- **PoC #09 (TypeORM raw SQL) = 별도 axis 후속** ( v2.2.0 final 격상 trigger 핵심 / paradigm-cross strong)

**axis 분리** ( 본 방법론 일반화 vs 사내 ROI):

| axis                                                                                                  | 목표                                                     | PoC                                                                | 자격                                                                                    |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| **사내 ROI axis** ( 사용자 우선)                                                                      | 사내 적용 직접 검증 + scale/domain-cross + sub-rule 강화 | PoC #06+#07+**#11** = 3 사내 PoC isomorphic                        | C-v2.2.0-spring41-ibatis2-subrule resolve trigger                                       |
| **본 방법론 일반화 axis** ( ~~paradigm-cross corroboration / Senior STOP~~ → ADR-CHAIN-008 정책 완화) | 여러 ORM/프레임워크 동작 입증                            | PoC #08 + PoC #09 + PoC #10 ( 5 PoC isomorphic / 모두 MEDIUM 측정) | ✅ resolved ( MEDIUM × 5 PoC isomorphic = strong 자격 / v2.2.0 final 격상 trigger 활성) |

사용자 결단 = "우선 순위 대로 다 진행". paradigm-cross corroboration carry C-v2.2.0-6 = 분해 (3 PoC 단계화) — **ADR-CHAIN-008 (2026-05-08) 채택 후 모두 resolved / historical 기록 보존**:

| 우선순위 | PoC         | stack                                                                                                                                                               | 14d cap | paradigm 거리 (vs iBATIS 2 XML)                                                 | 사내 정합                                                       | trigger 자격                                                                                                                                | resolved 상태                                                     |
| -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| #1       | **PoC #08** | **MyBatis 3 XML** ( source = `mybatis/jpetstore-6` Spring 6.2.18 + Stripes 1.6.0 + MyBatis 3.5.19 + Java 17 + Test 17 classes / 7 mapper / 25 SQL / pet store 4 BC) | 14d     | medium (XML continuity 5/6 reuse / iBATIS 2 evolved tag 부재 + annotation 별도) | ❌ ( 사용자 정정 2026-05-07: 사내 = iBATIS 2 단일 / MyBatis ❌) | MEDIUM corroboration ( 정탐 흡수 weak → medium 강화 / standard-MyBatis floor 입증 / evolved-tag ceiling + annotation paradigm 입증 ❌ 솔직) | ✅ Day 1~3.5 종결 (commit `da1a0ab`)                              |
| #2       | **PoC #09** | **TypeORM raw SQL** (TS / Node.js / `query()` + `createQueryBuilder()`)                                                                                             | 14d     | 강 (Java→TS / paradigm + platform-cross)                                        | ❌ (사내 ❌)                                                    | ~~paradigm-cross 자격 강~~ → MEDIUM 측정 (raw query() OSS 부재 정탐 사실 정합)                                                              | ✅ Day 1~3.5 종결 (commit `2af3772`) / raw query() strong ❌ 솔직 |
| #3       | PoC #10     | Spring Data JPA method name derived ( reframe / DSL builder QueryDSL ❌)                                                                                            | 14d     | 중간                                                                            | ❓                                                              | MEDIUM corroboration / ~~v2.3.0 minor trigger~~                                                                                             | ✅ Day 1~3.5 종결 (commit `759cdf1`) / v2.3.0 minor trigger ❌    |

→ ~~v2.2.0 final 격상 = PoC #08 + PoC #09 둘 다 종결 후~~ → ADR-CHAIN-008 채택 (2026-05-08) — **5 PoC + 2 정탐 사실 + 6 차원 corroboration sum = MEDIUM × ≥ 5 PoC isomorphic = strong 자격 충족** 신정책 → ~~v2.2.0 final 격상 trigger 활성 (cooling-off 7d minimum 후 2026-05-15+ 별도 결단)~~ ✅ **resolved 2026-05-08** — cooling-off 영구 폐기 (commit `f78be2b`) + v2.2.0 MINOR FINAL release (commit `8941726` / git tag `v2.2.0` / DEC-2026-05-08-v2.2.0-final).

**개별 carry 분해 ( historical 기록 / ADR-CHAIN-008 채택 후 모두 resolved)**:

- ~~C-v2.2.0-6a~~ ✅ resolved (PoC #08 종결 / MEDIUM × 5 PoC 합산)
- ~~C-v2.2.0-6b~~ ✅ resolved (PoC #09 종결 / raw query() strong ❌ → MEDIUM × 5 PoC 합산)
- ~~C-v2.2.0-6c~~ ✅ resolved (PoC #10 종결 / DSL builder QueryDSL OSS 부재 정탐 사실)
- ~~C-paradigm-cross-strong-raw-sql~~ ✅ obsolete (ADR-CHAIN-008 §1 신정책)
- ~~C-paradigm-cross-DSL-builder-querydsl~~ ✅ obsolete (ADR-CHAIN-008 §1 신정책)
- ~~C-ADR-2026-OSS-paradigm-reality~~ ✅ resolved (ADR-CHAIN-008 채택)

**진입 정책**:

- ~~7d minimum cooling-off (2026-05-08 ~ 2026-05-15)~~ ✅ **폐기** (DEC-2026-05-08-cooling-off-7d-폐기 / 사용자 결단 "패기해줘" / ADR-CHAIN-008 absorption + D 검증 4종 ✅ + carry burst 0 + npm test 280 pass = Senior F4 검증대 통과 / DEC-2026-05-06-cooling-off-정책-폐기 정합 강화)
- ~~ **v2.2.0 final 격상 = 즉시 진행 자격 활성** ( 사용자 별도 결단 의뢰 의무 잔존)~~ ✅ **resolved 2026-05-08** — commit `8941726` / git tag `v2.2.0` / DEC-2026-05-08-v2.2.0-final 종결
- 각 PoC = 별도 session + plan/research + 사용자 정식 결단 (4원칙 1~3원칙)
- PoC #08 사용자 confirm 2건 resolved (2026-05-07): (i) 사내 양식 = source 자체로 자동 처리 (jpetstore-6 = XML 위주) (ii) source = (b) `mybatis/jpetstore-6` 공식 reference webapp
- 사용자 정정 (2026-05-07): "MyBatis 는 내가 잘못 넣은 것 같다" → 사내 = iBATIS 2 단일 / MyBatis ❌ → PoC #08 사내 정합 ❌ / 본 방법론 일반화 자격 입증 용 + sub-rule 자격 + weak corroboration
- ~~v2.2.0 final 격상 timing (PoC #08 + PoC #09 합산 / 또는 PoC #09 단독 / 또는 v3.0 일괄) = PoC #08 종결 시점 사용자 결단~~ ✅ **resolved 2026-05-08** — ADR-CHAIN-008 채택 후 5 PoC (#06+#07+#08+#09+#10) 합산 자격 충족 → v2.2.0 MINOR FINAL 격상 (commit `8941726`)

**Day 0~3.5 종결 — PoC #08 (jpetstore-6) 정식 등재 + 종결 (2026-05-07~08)**:

- ✅ Day 0 (commit `a27dfb0`) — DEC prelim + skeleton
- ✅ Day 0.5 (commit `a60404c`) — plan 2차 + research 자산화 ( 3 sub-agent 병렬 정탐)
- ✅ Day 1 (commit `6d96218`) — 보류 해제 + source clone (141 files) + analysis 4종 (8 BR + 19 UC + 8 AP)
- ✅ **Day 1.5~3.5 ( 본 session 종결)** — sql-inventory 11 컬럼 (25 SQL × 0 findings / 66.7%) + phase 4.7 (6 snapshot + intent-vs-bug + coverage / 100%) + D2.5 결단 + chain 1 planning-spec (UC 100% / 0 findings) + ratchet baseline write + REPORT + DEC 종결
-     **4축 모두 pass**:

  - §3-A 자동화율 = **66.7%** (+27.9%p vs PoC #06 / R2 가설 입증)
  - §3-B chain 1 UC **100%** + 0 findings
  - phase 4.7 oracle = **16/16 = 100%** (D2 즉시 / D2.5 변동 없이 유지)
  - SQL Inventory = **4/6 = 66.7%** ( 3 PoC isomorphic / paradigm shift robust)
- paradigm-cross corroboration #1 MEDIUM 자격 사실 확보 = standard-MyBatis floor 입증 / evolved-tag ceiling + annotation paradigm 입증 ❌ 솔직 (non-isomorphic in the hard direction)
- AP isomorphic 5 (Anemic 2 + N+1 2 + HashMap) + novel 3 ( critical 평문 password + Stripes convention + 자체 sequence)
- SATD 0건 (Modern OSS reference 정합 / vs PoC #07 11 SATD)
- DEC-CHAIN-006 §2 "spectrum 4번째 적용 강화" (Modern + Stripes paradigm)
- **본체 격상 ❌** (§8.1 strict / paradigm-cross strong 의무 = PoC #09 TypeORM raw SQL 핵심)
- carry resolved 3 + 잔존 4 + 신규 3
- DEC-2026-05-07-poc-08-종결.md 등재

**Day 0 진입 ( 본 session 2026-05-07) — PoC #11 (EFI-WEB billing) 우선**:

- ✅ DEC prelim — `decisions/DEC-2026-05-07-poc-11-prelim-신설.md` ( 사용자 결단 (α) 정합)
- ✅ skeleton — `examples/poc-11-efiweb-billing-spring41/{source,input,sql-inventory,characterization}/` + README
- ✅ plan 1차 — `~/.claude/plans/d-poc-11-billing.md`
- ⏳ Day 0.5~ = 별도 session 첫 진입 — **사용자 source 위임 의무** (billing 모듈 ~257 LOC) + plan 2차 + 4원칙 3원칙 승인 → Day 1 진입
- ⏳ Day 1~3.5 = 14~18h (~2~3일 실측 / 14d cap 충분 여유)

** 정탐 결과 흡수** ( paradigm-cross weak → MEDIUM 강화 + 신규 carry 4건):

- §3-A 자동화율 expectation: **62~72%** (PoC #06 38.75% / #07 53.8% 대비 ↑↑)
- SQL Inventory coverage expectation: **75~83%** (66.7% baseline ↑ / statementType 11번째 default-injection + namespace FQCN 100% + dynamic_branches `<bind>` extractable)
- phase 4.7 named_classified_ratio expectation: 88~95% Day 1 / 100% 가능 ( pet store CRUD trivially deterministic / D2 trivially empty risk = oracle 신호 약화 의무 명시)
- 적대성 5축: PoC #06+#07 baseline ↓↓ (Spring 6 modern / MyBatis 3 standard / Test 17 / 다중책임 4 BC)
- 신규 risks: (a) Stripes framework drag (예상 외 / `@HandlesEvent` + `@UrlBinding` ≠ Spring `@Controller` / +1~2d) (b) Domain ambiguity-deficit ( phase 4.7 oracle 신호 약화 risk)
- 신규 carry 4건: C-poc-08-{stripes-adapter, mybatis3-schema-gap, domain-ambiguity-deficit, chain3-retrofit}

---

** PoC #07 정식 등재 + Day 3.5 종결** (2026-05-08 / DEC-2026-05-08-poc-07-종결 / EFI-WEB capital 모듈 다중책임 chain 1 측정 / 4축 모두 pass)

**v2.1.1 PATCH release** (2026-05-07 / DEC-2026-05-07-v2.1.1-ratchet-trend / phase 4.7 ratchet trend baseline 자동 검증 / C-v2.1.0-5 carry resolved / `_shared/baseline.js` coverageTrendCheck 신설 + characterization-coverage-validator `--coverage-baseline` + `--write-coverage-baseline` flag + 4 unit test / unit test 228 → **232** / §8.1 strict 7/7 ✅ / 3 source version sync v2.1.1 / build `ai-native-methodology-v2.1.1/` 264 files / git tag v2.1.1 / chain harness 5 요소 변경 ❌ / 본체 schema 변경 ❌ / **carry 잔존: C-v2.1.0-1~4, 6~7** / ratchet trend production 첫 사용 = PoC #07 capital `.aimd/baseline/characterization-coverage.json` 2026-05-08)

** PoC #07 정식 등재 + 종결** (2026-05-08 / DEC-2026-05-08-poc-07-종결 / EFI-WEB capital 모듈 / Spring 4.1 + iBATIS 2 + JSP / **3752 Java LOC + 1757 sqlmap LOC + 87 endpoint + 71 SQL operations** / 다중책임)

**4축 측정 결과 (사용자 D10 = 3/4 pass + 미달 1축 carry / 실제 = 4/4 pass)**:

| 축                          | metric                        | PoC #06 baseline         | **PoC #07 측정**                        | 자격                          |
| --------------------------- | ----------------------------- | ------------------------ | --------------------------------------- | ----------------------------- |
| §3-A 자동화율               | 평균 auto_ratio               | 38.75%                   | **53.8%** (+15%p)                       | ✅ pass (in range 50% ± 10%p) |
| §3-B 설계 자동화율          | planning-extraction-validator | (없음)                   | **0 findings / UC coverage 94.1%**      | ✅ pass                       |
| phase 4.7 acceptance oracle | named_classified_ratio        | 94% (D2 후)              | **87.5% Day 2 / 100% Day 2.5**          | ✅ pass (≥ 80%)               |
| SQL Inventory coverage      | auto extraction ratio         | 66.7% (PoC #06 retrofit) | **66.7%** (corroboration #2 isomorphic) | ✅ pass (≥ 50%)               |

** phase 4.7 두 번째 적용 — 단일 prompt 양 spectrum 동작 입증 강화 (3 spectrum)**:

| spectrum                              | named_classified_ratio (D2.5 후) |
| ------------------------------------- | -------------------------------- |
| Modern (PoC #03 NestJS retrofit)      | 30/30 = 100%                     |
| Legacy 단일책임 (PoC #06 exchange)    | 17/18 = 94%                      |
| **Legacy 다중책임 (PoC #07 capital)** | **27/27 = 100%**                 |

→ DEC-CHAIN-006 §결정 §2 "단일 prompt 양 spectrum 동작" 정합 강화.

** SQL Inventory ≥ 2 PoC isomorphic 자격 충족 ( v2.2.0 본체 격상 trigger 자격)**:

| metric                                 | corroboration #1 (PoC #06) | corroboration #2 (PoC #07) | 정합                                |
| -------------------------------------- | -------------------------- | -------------------------- | ----------------------------------- |
| 외부 6 컬럼 자동화                     | 4/6 = 66.7%                | 4/6 = 66.7%                | scale 무관 isomorphic               |
| 본 추가 4 컬럼 + patterns_extension_v2 | ✅                         | ✅                         | ✅ schema isomorphic                |
| AP-{X}-011/012 신규 등재               | AP-EXCHANGE-011 (0건)      | AP-CAPITAL-012 (0건)       | Spring 4.1 + iBATIS 2 spectrum 공통 |

**carry 신규 ( v2.2.0 본체 격상 trigger 자격 충족 / ≥ 2 PoC isomorphic)**:

- ~~**C-v2.2.0-sql-inventory** — `methodology-spec/deliverables/24-sql-inventory.md` 신설~~ ✅ **resolved 2026-05-08** (v2.2.0-rc1 commit `f64e0b2`)
- ~~**C-v2.2.0-sql-schema** — `schemas/sql-inventory.schema.json` 신설~~ ✅ **resolved 2026-05-08** (v2.2.0-rc1 commit `f64e0b2` / 31번째 schema)
- ~~**C-v2.2.0-sql-tool** — `tools/sql-inventory-extractor/` 신설 (workspace 14번째)~~ ✅ **resolved 2026-05-08** (v2.2.0-rc1 commit `e4b0143` / 10 unit test)
- C-v2.2.0-spring41-ibatis2-subrule (≥ 2 PoC corroboration 자격 충족 / PoC #11 종결 후 trigger)
- C-v2.2.0-phase-4-7-multiresponsibility-subrule (단일 PoC / ≥ 2 다중책임 PoC 후 trigger)
- C-domain-PoC07-1~3 (도메인 expert IFRS 회계 담당자 재검증)
- C-PoC07-1~3 (chain 3 영역 — Testcontainers / MockMvc / DBUnit)

**carry resolved (2026-05-07 / C9 closure)**:

- ~~C-v2.2.0-9~~ "Why not AWS SCT" 차별화 절 → ✅ rc1 시점 deliverable §1.2 4 도구 비교 표 + Big-tech 입증 흡수 완료 ( trigger "v2.2.0 final 시" 사실상 implicit 처리 완료 / 추가 보강 ❌)

** carry resolved (2026-05-08 / ADR-CHAIN-008 채택 후 4건)**:

- ~~C-v2.2.0-6~~ ✅ resolved ( Modern ORM PoC #08+#09+#10 종결 + 5 PoC isomorphic 합산 / paradigm-cross MEDIUM 자격 충족)
- ~~C-paradigm-cross-strong-raw-sql~~ ✅ obsolete (ADR-CHAIN-008 §1 신정책 / 2026년 OSS 부재 사실 정탐)
- ~~C-paradigm-cross-DSL-builder-querydsl~~ ✅ obsolete (ADR-CHAIN-008 §1 신정책 / 2026년 OSS 부재 사실 정탐)
- ~~C-ADR-2026-OSS-paradigm-reality~~ ✅ resolved (ADR-CHAIN-008 채택)

** ratchet baseline write 첫 진입** — `examples/poc-07-efiweb-capital-spring41/.aimd/baseline/characterization-coverage.json` (coverage_strategy: ratchet / coverage_ratio: 0.4375 / v2.1.1 PATCH production 첫 사용 케이스).

**no release / no tag** — D11 (b) ≥ 2 PoC isomorphic 후 v2.2.0 본체 격상 별도 plan + 사용자 결단.

**v2.1.0 MINOR release** (2026-05-07 / 같은 날 — DEC-2026-05-07-v2.1.0-release / phase 4.7 (characterization) 본체 격상 / 의도 vs 버그 분리 + Given/When/Then snapshot acceptance oracle / ADR-CHAIN-006 / ≥ 2 PoC corroboration (PoC #06 Spring 4.1 Legacy 17/18=94% + PoC #03 NestJS Modern retrofit 30/30=100%) / 본체 자산 6 + workflow + ADR / unit test 218 → 228 (+10 / characterization-coverage-validator 신설 workspace 13번째) / Senior cooling-off (a) 즉시 final / chain harness 5 요소 변경 ❌ — analysis stage 내부 phase 추가만)

**v2.0.0 MAJOR FINAL release** ¹ (2026-05-07 / 같은 날 — DEC-2026-05-07-v2.0.0-final / chain harness validated 정식 / git tag v2.0.0 / clean clone 재실행 통과 / Senior F4 24h+ cooling-off 통과 / chain 1 planning-spec → chain 2 behavior-spec + acceptance-criteria + 7대 통합 → chain 3 test-spec + 실 test (RED) → chain 4 impl-spec + 실 impl (GREEN / 100% test pass) / 4 gate + revisit loop + chain-driver mechanical enforcement / 218 unit test pass / §8.1 strict 7/7 ✅ / 3 PoC corroboration ✅ / cleanup round 1 + 2-A ~ 2-E 모두 종결 (327 → 256 files / paradigm v2.0.0 정합))

> ¹ **호칭 전환** (DEC-2026-05-06-sub-plan-6-종결 / 2026-05-06): 현 단계 = **chain harness validated** — §8.1 strict 7/7 + ≥ 2 PoC corroboration. sub-plan-1~4 = scaffolding / sub-5 = harness-complete / sub-6 = harness-validated. v2.0.0-rc1 prerelease (Senior F4 / 24h+ 후 final / 같은 날 final tag ❌).

## v2.0 진행 (sub-plan 6 sprint)

| Sprint   | Sub-plan                                                   | 산출                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 상태                               |
| -------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| M+1      | sub-plan-1 (scope)                                         | DEC 3 + lifecycle-contract / CLAUDE.md / skills-axis / agents / STATUS / INDEX                                                                                                                                                                                                                                                                                                                                                                                                                                              | ✅ commit `b466e51`                |
| M+2      | sub-plan-2 (schemas + deliverables + ADR)                  | 6 schema + 6 deliverable + 3 신규 ADR + 3 ADR v2 + UC-\* 통일                                                                                                                                                                                                                                                                                                                                                                                                                                                               | ✅ commit `811ea45`                |
| **M+3a** | **sub-plan-3a (chain validator + workspace)**              | 4 신규 chain validator + 기존 6 도구 chain 모드 확장 + npm workspace + chain-check.yml + ADR-CHAIN-004 + **110 unit test pass**                                                                                                                                                                                                                                                                                                                                                                                             | ✅ DEC-2026-05-06-sub-plan-3a-종결 |
| **M+3b** | **sub-plan-3b (test-impl-pass-validator)**                 | test-impl-pass-validator 신설 (5 framework adapter / result_hash SARIF Appendix F / --allow-execute / flaky retry / 25 unit test) + test-cmd.schema 신설 + flaky_retries_count schema 보강 + chain-check.yml gate #3-4 활성 + workspace **135 unit test pass**                                                                                                                                                                                                                                                              | ✅ DEC-2026-05-06-sub-plan-3b-종결 |
| **M+4**  | **sub-plan-4 (skills + flows)**                            | 13 chain skill 신설 (\_base 2 + planning 3 + spec 3 + test 3 + implement 2 / skills/spec 신규 디렉토리) + 4 chain stage flow ({planning,spec,test,implement}.phase-flow.{json,mermaid}) + flows/sdlc-4stage-flow.{json,mermaid} (master plan SSOT — stages + revisit_edges + 4 gate + cross_cutting + release_eligibility) + agents 4 README placeholder → 정식 채움 ✅ + drift-validator `--check-chain-layout` flag + 3 신규 unit test ( 4 stages / 26 phases / 13 skills / 0 orphans) + workspace **138 unit test pass** | ✅ DEC-2026-05-06-sub-plan-4-종결  |
| **M+5**  | **sub-plan-5 (chain harness driver — 호칭 자격 확보)**     | 5 요소 모두 본격 구현 — tools/chain-driver/ workspace 12번째 + schemas/state.schema.json + intervention-log.schema.json + ADR-CHAIN-005 + hooks/hooks.json + flows/sdlc-4stage-flow.json `harness_status`: scaffolding → harness-complete + workspace **198 unit test pass**.                                                                                                                                                                                                                                               | ✅ DEC-2026-05-06-sub-plan-5-종결  |
| **M+6**  | **sub-plan-6 (PoC + §8.1 strict + v2.0.0-rc1 prerelease)** | PoC #05 sample-user-register e2e (vitest 6/6 GREEN) + PoC #03 NestJS retrofit (chain 1~3 RED dry-run) + scripts/release-readiness.js (§8.1 7/7 자동 검사 + 9 self-test) + drift `--check-state-flow-consistency` + MIGRATION-v1-to-v2.md + version 1.5.0 → 2.0.0-rc1 + flows harness_status: harness-complete → **harness-validated** + workspace **210 test** (201 + 9 release-readiness).                                                                                                                                 | ✅ DEC-2026-05-06-sub-plan-6-종결  |

## v2.1.0 MINOR release (2026-05-07 / 같은 날 v2.0.0 final 후)

DEC-2026-05-07-v2.1.0-release.

phase 4.7 (characterization) 본체 격상. ≥ 2 PoC corroboration 사실 확보 (PoC #06 Spring 4.1 Legacy + PoC #03 NestJS Modern retrofit) → 본체 6 자산 + workflow + ADR 격상.

| 검증 항목                                                  | 결과                                                                                                      |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `npm test --workspaces` 219 pass / 0 fail ( +10 vs v2.0.0) | ✅ characterization-coverage-validator 10 신설 / drift-validator 47 변경 없음 / phase 4.7 entry 자동 인식 |
| release-readiness §8.1 strict 7/7 (target v2.1.0)          | ✅ "v2.1.0 = release-ready"                                                                               |
| version-check 3 source sync at v2.1.0                      | ✅ plugin.json + package.json + CHANGELOG                                                                 |
| build dist `ai-native-methodology-v2.1.0/`                 | ✅ 264 files / shasum 263 OK                                                                              |
| chain harness 5 요소 변경 ❌                               | ✅ analysis stage 내부 phase 추가만                                                                       |

**v2.1.0 본체 격상 자산 (6 + 1 workflow + 1 ADR)**:

1. ✅ `methodology-spec/deliverables/23-characterization-spec.md` ( #16~22 사용 중 / 23 신규)
2. ✅ `schemas/characterization-spec.schema.json` ( 30번째 schema)
3. ✅ `schemas/meta-confidence.schema.json` `inputs_used` enum 12 → 13 (`characterization` 추가)
4. ✅ `skills/analysis-phase-4-7-characterization/SKILL.md` ( skills 19 → 20)
5. ✅ `tools/characterization-coverage-validator/` ( workspace 13번째 / 10 unit test)
6. ✅ `flows/analysis.phase-flow.{json,mermaid}` v1.5.0 → v2.1.0 (phase 4.7 entry + 5-x depends_on 갱신)
7. ✅ `methodology-spec/workflow/phase-4-7-characterization.md` (drift-validator 3-way 회귀 통과)
8. ✅ `docs/adr/ADR-CHAIN-006-phase-4-7-characterization.md` (4 정책 명문화)

**release commit cadence (C1~C7)**:

- C1 (`21d0e4f`) — deliverable + schema + meta-confidence
- C2 (`8a48fb7`) — skill
- C3 (`0209381`) — tool + 10 unit test + workspace 13번째
- C4+5 (`eb4f0e2`) — flow + ADR + workflow + version + CHANGELOG
- C6 (현재) — DEC + STATUS + INDEX
- C7 — git tag `v2.1.0`

**v2.1.x patch trigger (Senior F7 정합)**: release-readiness regress 1+ / Senior HIGH 1+ / 7일 carry > 3건 / 사용자 finding burst.

**Carry (v2.1.x patch / v2.x)**:

| ID         | 항목                                                               | trigger                       |
| ---------- | ------------------------------------------------------------------ | ----------------------------- |
| C-v2.1.0-1 | snapshot Gherkin (.feature) 변환 출력                              | v2.1.x patch / 사용자 finding |
| C-v2.1.0-2 | Modern 환경 명확 비율 ≥ 95% 자동 detect                            | v2.2+                         |
| C-v2.1.0-3 | acceptance oracle threshold dashboard                              | v2.x                          |
| C-v2.1.0-4 | F-PHASE7-001~004 일반화 검토 (≥ 3 PoC corroboration 후)            | ≥ 3 PoC corroboration         |
| C-v2.1.0-5 | ratchet `trend_required=true` 자동 검증 (baseline.js 통합)         | v2.1.x patch                  |
| C-v2.1.0-6 | ts-morph + 실 환경 (DB) snapshot 자동 추출                         | v2.x                          |
| C-v2.1.0-7 | sub-rule 추가 (Spring Boot 3 / FastAPI / Express 등 다른 spectrum) | 사용자 PoC corroboration      |

---

## v2.0.0 MAJOR FINAL release (2026-05-07)

DEC-2026-05-07-v2.0.0-final.

| 검증 항목                                     | 결과                                                                |
| --------------------------------------------- | ------------------------------------------------------------------- |
| clean clone 추출 (`/tmp/aimd-clean-clone.*/`) | ✅ git archive                                                      |
| `npm install` (12 workspace)                  | ✅ 83 packages / 0 vulnerabilities                                  |
| `version-check` (3 source)                    | ✅ all v2.0.0-rc1 → v2.0.0                                          |
| `npm test` 218 pass                           | ✅ chain-driver 68 + 그 외                                          |
| `release:check --target v2.0.0` (clean clone) | ✅ §8.1 strict **7/7** / "release-ready"                            |
| PoC #05 vitest e2e                            | ✅ **6/6 GREEN**                                                    |
| Senior F4 24h+ cooling-off                    | ✅ rc1 (2026-05-06) → final (2026-05-07)                            |
| 본체 환경 release:check 재검증                | ✅ 7/7                                                              |
| build dist                                    | ✅ 256 files / shasum 255 OK / `dist/ai-native-methodology-v2.0.0/` |

**v2.0.0 final 자격 7/7**:

1. ✅ chain harness 5 요소 enforcement (sub-plan-5)
2. ✅ ≥ 2 PoC corroboration (3 = poc-03 + poc-04 + poc-05)
3. ✅ §8.1 strict 7/7
4. ✅ 218 unit test pass
5. ✅ clean clone 재실행 통과
6. ✅ Senior F4 24h+ cooling-off
7. ✅ cleanup round 1 ~ 2-E 모두 종결

**git tag**: `v2.0.0` 의무.

**v2.0.0 → v2.0.x patch trigger** (Senior F7 정합):

- release-readiness regress 1+ / Senior HIGH 1+ / 7일 carry > 3건 / 사용자 finding burst

---

## cleanup round 2-E (2026-05-06) — build artifact path 정합

DEC-2026-05-06-cleanup-round-2-E.

`dist/internal-v<version>/` → **`dist/ai-native-methodology-v<version>/`** (사용자 명시 결단 / v1.4.3 시점 prefix 가 v2.0 paradigm + plugin user 환경 path 와 stale).

| 영역                       | before                      | after                                                          |
| -------------------------- | --------------------------- | -------------------------------------------------------------- |
| build artifact path        | `dist/internal-v2.0.0-rc1/` | `dist/ai-native-methodology-v2.0.0-rc1/`                       |
| plugin user 환경 path 정합 | ❌                          | ✅ (`~/claude-plugins/context-ops-v<version>/` 일치) |
| dist file count            | 256                         | 256 (변경 0 / path rename)                                     |
| shasum                     | —                           | 255 OK                                                         |

7 자산 갱신 (build-plugin.js + README + guides/common-errors + templates/adoption/CLAUDE + templates/README + project root CLAUDE) / historical (archive + DEC + CHANGELOG entry) 보존.

no release / no tag / v2.0.0 final 자격 영향 ❌.

---

## cleanup round 2-C / 2-D (2026-05-06) — journey 자산 + project root sync ( cleanup round 2 series 종결)

DEC-2026-05-06-cleanup-round-2-C-D.

**Round 2-C — guides/ 디렉토리 신설 (5 file)**:

| 자산                              | 의도                                                                             |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `guides/getting-started.md`       | install 직후 첫 100 line / 시나리오 A/B/C + 10분 walkthrough                     |
| `guides/chain-harness-guide.md`   | chain-driver mental model + state.json + mechanical gate trio + revisit detector |
| `guides/common-errors.md`         | FAQ 14건 (install / hook / version / state.blocked / RED-GREEN / build / prompt) |
| `guides/first-prompt-cookbook.md` | 자연어 → skill 34 매핑                                                           |
| `guides/README.md`                | 4 자산 navigation + 호출 cadence                                                 |

build-plugin.js INCLUDE 에 'guides' 추가.

**Round 2-D — project root CLAUDE.md sync**:

- v1.4.3 → v2.0.0-rc1 라벨
- guides/ 항목 추가 (LLM 자동 컨텍스트 / dist 미포함)

**dist file count**: 251 → **256** (+5) / shasum 255 OK.

**cleanup round 2 series 종결**:

| Round         | commit    | 핵심                                            |
| ------------- | --------- | ----------------------------------------------- |
| 1             | `80cb783` | docs/ 9 archive 격리                            |
| 2-A           | `b25a8ad` | paradigm sync (327 → 241)                       |
| 2-B           | `307f55b` | 10 신설 (사용자 진짜 핵심)                      |
| 2-B 후속      | `8b7effe` | 9 도구 표준화 + 10 placeholder + schemas/README |
| **2-C / 2-D** | (현재)    | **journey 자산 4 + project root sync**          |

사용자 진짜 의도 ("정돈 + 각 폴더 visible + journey friction 해소") 모두 정합.

**Carry (v2.1+)**:

- v1.4.0-dev 3 entry CHANGELOG-HISTORY 추가 격리 (CHANGELOG 1060 → ~700 line)
- guides 보강 (사용자 finding 등재 후)
- chain-harness-guide RED→GREEN mermaid 시각화
- v2.0.0 final tag (2026-05-07~ + clean clone PoC #05 e2e 재실행 통과)

no release / no tag / v2.0.0 final 자격 영향 ❌.

---

## cleanup round 2-B 후속 (2026-05-06) — 9 도구 표준화 + 10 placeholder 정돈 + schemas/README 갱신

DEC-2026-05-06-cleanup-round-2-B-followup.

| 영역                           | 처리                                                                                                                                                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9 도구 README 표준 schema 통일 | Purpose / When / In / Out / Exit / Siblings / 참조 (cleanup round 2-B 신설 4 도구 README 와 동일 형식)                                                                                             |
| 10 placeholder README 정돈     | (1) skills/{test,planning,implement} 활성 채움 / (2) skills/design + agents/design + templates/design = v2.x carry / (3) agents/analysis 활성 + templates/{test,planning,implement} lifecycle 정합 |
| schemas/README 갱신            | 11 → **29 schema** (chain v2 6 + state 3 + BE 5 + FE 8 + cross-cutting 4 + 메타 + 유틸) / 5종 물증 if/then 의무 + Ajv 8 strict mode                                                                |
| dist file count                | 251 (변경 없음 / 모두 갱신)                                                                                                                                                                        |
| 변경 file 수                   | 20 (9 tool + 10 placeholder + 1 schemas/README)                                                                                                                                                    |
| Sibling cross-link 그래프      | 각 도구 README 4+ sibling 명시                                                                                                                                                                     |

stale 메시지 제거 ("v1.4.x analysis only" / "v2.0+ scope" → v2.0.0-rc1 chain harness validated 정합).

**Carry (Round 2-C / 2-D)**:

- 2-C: 사용자 journey 자산 신설 (getting-started / chain-harness-guide / common-errors / first-prompt-cookbook)
- 2-D: project root CLAUDE.md sync + v1.4.0-dev 3 entry CHANGELOG-HISTORY 추가 격리 검토

no release / no tag / v2.0.0-rc1 → final 자격 영향 ❌.

---

## cleanup round 2-B (2026-05-06) — 각 폴더 README 정돈 / 사용자 진짜 핵심

DEC-2026-05-06-cleanup-round-2-B.

| 영역                                  | before | after                                          |
| ------------------------------------- | ------ | ---------------------------------------------- |
| dist files                            | 241    | **251** (+10 신설)                             |
| 부재 폴더 README                      | 6      | 0 ( 모두 채움)                                 |
| 부재 도구 README                      | 4      | 0 ( 모두 채움)                                 |
| 도달 path "각 폴더 자산 어떻게 정돈?" | ❌     | ✅                                             |
| 도달 path "어디서 참조됨?"            | ❌     | ✅ (각 README "참조" / "Sibling" 섹션)         |
| 도달 path "언제 호출됨?"              | ❌     | ✅ (각 README "When to call" / "호출 cadence") |

**6 폴더 README 신설**: tools/ ( 12 도구 cadence table) / methodology-spec/ ( phase × deliverable × schema 매트릭스) / agents/ / skills/ / hooks/ / templates/

**4 도구 README 신설**: chain-driver/ ( 5 요소 enforcement) / \_shared/ / schema-validator/ / test-impl-pass-validator/ ( no-simulation 핵심)

표준 schema 통일 = Purpose / When / In / Out / Exit / Siblings / 참조.

**Carry (Round 2-B 후속 + 2-C / 2-D)**:

- Round 2-B 후속: 9 도구 README 표준 schema 통일 + 10 placeholder (agents/{design,analysis} + skills/{design,test,planning,implement} + templates/{design,test,planning,implement}) 정돈 + schemas/README 갱신 검토
- Round 2-C: 사용자 journey 자산 신설 (getting-started / chain-harness-guide / common-errors / first-prompt-cookbook)
- Round 2-D: project root CLAUDE.md sync

no release / no tag / v2.0.0 final 자격 영향 ❌.

---

## cleanup round 2-A (2026-05-06) — plugin artifact paradigm sync + 자산 정돈

DEC-2026-05-06-cleanup-round-2-A.

| 영역                                         | before                       | after                                                             |
| -------------------------------------------- | ---------------------------- | ----------------------------------------------------------------- |
| dist files                                   | 327                          | **241** (-86 / -26%)                                              |
| paradigm version (CLAUDE/README/marketplace) | v1.3.0 / v1.4.2 / v1.x stale | all **v2.0.0-rc1**                                                |
| `CHANGELOG.md`                               | 1865 line                    | **1060 line** (v1.4+ 만) + `CHANGELOG-HISTORY.md` 820 line (신규) |
| dist 안 test/corpus/fixtures                 | 80+ files                    | **0** (workspace developer only)                                  |
| `ADOPTION-README.md` (dist root)             | 1 (별칭)                     | 0 (단일 entry-point 정합)                                         |
| paradigm 명시                                | "한 방향 추출기" 만          | chain harness 4 stage + analysis 범위 한정                        |

**갱신된 자산** (7 항목 / 1 신규):

- `marketplace.json` — description chain harness 정합
- `templates/adoption/CLAUDE.md` (dist root alias) — v2.0.0-rc1 rewrite (chain 4 stage + 12 도구 + 5 요소 mechanical enforcement + 자연어 prompt → skill 표)
- `README.md` — v2.0.0-rc1 rewrite (시나리오 A/B/C + dist 실제 디렉토리 구조 + 12 도구 호출 cmd)
- `flows/README.md` — sdlc-4stage SSOT 명시
- `scripts/build-plugin.js` — EXCLUDE_BASENAMES + INCLUDE 갱신 + ADOPTION-README 별칭 비활성
- `CHANGELOG.md` — split (v1.4+ 만)
- `CHANGELOG-HISTORY.md` — 신규 (v1.0~v1.3.1 archive)

**검증**: version-check ✅ / build 241 files ✅ / shasum -c 240 OK ✅ / EXCLUDE 0 hit ✅ / INCLUDE 정합 ✅.

**Carry (Round 2-B / 2-C / 2-D)**:

- 2-B ( 각 폴더 README 정돈) — agents/skills/hooks/flows/tools/templates/methodology-spec/schemas — **사용자 진짜 핵심** "각 폴더 자산 정돈 + 참조 + 호출 visible"
- 2-C (사용자 journey 자산) — getting-started / chain-harness-guide / common-errors / first-prompt-cookbook
- 2-D (선택) — project root CLAUDE.md sync + v1.4.0-dev 3 entry 압축

no release / no tag / 본체 commit 만 / v2.0.0-rc1 → v2.0.0 final 자격 영향 ❌.

---

## cleanup round 1 (2026-05-06) — docs/ 9 파일 archive 격리

DEC-2026-05-06-cleanup-round-1.

| 영역       | before           | after                                                                                 |
| ---------- | ---------------- | ------------------------------------------------------------------------------------- |
| `docs/`    | 39               | **30** (-9 archive 이동)                                                              |
| `archive/` | 13               | **22** (+9 격리 / `v1.3-adoption/` 6 + `v1.4-evaluation/` 1 + `phase-a-iteration/` 2) |
| 가독성     | 활성 + 폐기 혼재 | 활성만                                                                                |

**B 진행 (9 파일 git mv)**:

- `docs/adoption/{README,v1.3-plan,v1.3-status,v1.3-decisions-index,lessons-learned-2026-05-02}.md` (5) → `archive/v1.3-adoption/`
- `docs/v1.3-promotion-report.md` → `archive/v1.3-adoption/`
- `docs/v1.4-evaluation-report.md` → `archive/v1.4-evaluation/`
- `docs/phase-a-iteration-{guide,0-preflight}.md` (2) → `archive/phase-a-iteration/`
- `rmdir docs/adoption/`

**Link rot 차단 (11건 갱신)**: project root `CLAUDE.md` 4 + `README.md` 4 + `STATUS.md` 2 + `flows/README.md` 1 = 활성 hub 옛 경로 → archive 경로.

**Skip per 사용자**:

- A. PoC 진행 로그 17 (PROGRESS / SESSION-WRAPUP) — "poc 쪽은 신경 안써도 됨"
- C. PoC plan-phase 13 — A 와 동상

**Carry (cleanup round 2 / v2.0.0 final 후)**:

- E. 4 hub (CLAUDE / STATUS / CHANGELOG / INDEX) v2.0 정보 3중 누적 통합

no release / no tag / 본체 commit 만 / v2.0.0-rc1 → final 자격에 영향 ❌.

---

## sub-plan-6 종결 (2026-05-06) — chain harness validated / v2.0.0-rc1

**§8.1 strict 7/7 통과** (DEC-2026-05-06-sub-plan-6-종결 + release-readiness.js):

```
✅ 1. poc_corroboration: 2 PoC (poc-05 + poc-03 retrofit)
✅ 2. real_tool_evidence: 5종 물증 7 필드 (10 fields) all present / sha256 valid
✅ 3. validators_violation: 4 validators 0 critical/high
✅ 4. chain_coverage: 1.0 / threshold 0.85
✅ 5. adr_registry: 5 ADR-CHAIN status: 승인됨 + 결정 section (content-aware)
✅ 6. matrix_greenness: forward=1 / backward=1 / cells=2 / green=2
✅ 7. e2e_cycle_pass: pass=6 / fail=0 (vitest 1.6.1 chain 4 GREEN)
```

### PoC corroboration (≥ 2)

| PoC                                                                                        | scope                                                                                                                     | 결과                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PoC #05 sample-user-register** ( corroboration #1 / e2e 단독 책임)                       | 2 UC + 2 BR + 2 TC + 2 IMPL / vitest 1.6.1 / RED→GREEN                                                                    | chain 1~4 e2e GREEN / matrix 100% / 5종 물증 정합                                                                                                                                                               |
| **PoC #03 NestJS retrofit** (corroboration #2)                                             | chain 1~2 + chain 3 RED dry-run / signup + login subset                                                                   | retrofit 정합 / chain 1~3 schema + validator pass                                                                                                                                                               |
| **PoC #04 mini FE retrofit** (corroboration #3)                                            | chain 1~2 + chain 3 RED dry-run / PAGE-LOGIN 1 UC subset / Zod                                                            | retrofit 정합 / chain 1~3 schema + validator pass / FE 트랙                                                                                                                                                     |
| ** PoC #06 efiweb-exchange-spring41** (corroboration #4 / 신규 axis — chain 1 + phase 4.7) | chain 1 PASS (validator 0 findings + 100% UC) + phase 4.7 (characterization) 정식 첫 적용 (94% acceptance oracle / D2 후) | 4중 적대성 (Spring 4.1.2 Boot❌ + iBATIS 2 + JSP 248 + 테스트 0) 환경에서 chain 1 + phase 4.7 정합 입증. plan §3-A 38.75% / §3-B 75% 사실 확보. DEC-2026-05-07-poc-06-종결 + DEC-2026-05-07-poc-06-domain-결단. |
| ** PoC #03 NestJS phase 4.7 retrofit** (corroboration #5 / phase 4.7 ≥2 PoC 충족 #2)       | characterization 3 자산 (intent-vs-bug + snapshot signup + coverage)                                                      | Modern NestJS spectrum 입증 (30/30 = 100% 명확) — PoC #06 Legacy + PoC #03 Modern 두 spectrum 으로 phase 4.7 v2.1.0 본체 격상 자격 사실 확보. DEC-2026-05-07-poc-07-poc03-phase7-retrofit.                      |

### PoC #06 종결 (2026-05-07 / DEC-2026-05-07-poc-06-종결 / prelim → 정식)

EFI-WEB 사내 IFRS 회계 시스템 `smilegate.ifrs.exchange` 모듈 한정 평가. v2.0.0 final release 후 첫 PoC. 신규 axis (적대성 + phase 4.7 corroboration).

| 항목      | 내용                                                                                                                                                                  |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 모듈      | smilegate.ifrs.exchange (345 Java LOC + 130 SQL XML / 7 Controller endpoint / 3 DB 테이블 + 1 함수 + 1 프로시저)                                                      |
| 적대성    | 4중 극상 (Spring 4.1.2 Boot❌ + iBATIS 2 + JSP 248 + 테스트 0) — PoC #01~#05 어떤 것보다 검증 스택에서 멂                                                             |
| scope     | analysis 4종 + phase 4.7 (characterization / 정식 단계 첫 적용) + chain 1 만                                                                                          |
| 측정 결과 | (a) §3-A 38.75% (단일책임 정합 / 다중책임 -10%p 가능) (b) §3-B **75% 정합** (validator PASS) (c) **phase 4.7 82% acceptance oracle**                                  |
| 산출      | input 4종 / characterization 5종 (snapshot 3 + coverage + intent-vs-bug) / .aimd/output planning-spec.{json,md} / REPORT-day3-measurement.md / PROGRESS-2026-05-07.md |
| 시간      | 4.5시간 (plan 추정 3~4일 대비 ~5배 빠름)                                                                                                                              |
| Finding   | F-PHASE7-001~004 (phase 4.7 본질) + carry 13종 (C-1~C-13)                                                                                                             |
| §8.1 명시 | 본 PoC 1개 결과로 본체 격상 결단 ❌ / phase 4.7 v2.1.0 격상 = ≥2 PoC corroboration 후 (PoC #07 또는 retrofit)                                                         |
| 위치      | `examples/poc-06-efiweb-exchange-spring41/`                                                                                                                           |

### Senior critique (sub-plan-6-research §F) 흡수

- F1 BLOCKER ✅ D25' UC-002 추가 (PoC #05 = 2 UC)
- F2 HIGH ✅ D26' PoC #03 retrofit chain 3 RED dry-run 강제
- F3 HIGH ✅ release-readiness 7 criterion content-aware + 9 self-test (file presence ❌)
- F4 HIGH ✅ D29' v2.0.0-rc1 prerelease / 24h+ 후 final (14차 retract burst 차단)
- F5 HIGH ⏳ sp6-c8 carry (chaos test) — release block ❌
- F6 MED ✅ D27' vitest 채택 (PoC #05 = vitest 1.6.1)
- F7 MED ✅ MIGRATION-v1-to-v2.md + v2.0.1 trigger 명문화

### unit test 회귀 (210 = 201 workspace + 9 release-readiness)

| 영역                        | 직전 (sub-plan-5) | 현재 (sub-plan-6)      |
| --------------------------- | ----------------- | ---------------------- |
| drift-validator             | 44                | **47** (+3 state-flow) |
| 그 외 10 도구               | 94                | 94                     |
| chain-driver                | 60                | 60                     |
| **workspace 합계**          | 198               | ** 201**               |
| release-readiness self-test | —                 | **9**                  |
| **총 합계**                 | 198               | ** 210**               |

### chain harness 호칭 전환 (master plan §H)

| 시점                                | 호칭                        | 자격                                        |
| ----------------------------------- | --------------------------- | ------------------------------------------- |
| sub-plan-1~4                        | chain harness scaffolding   | 부품                                        |
| sub-plan-5                          | chain harness               | 5 요소 코드 enforcement                     |
| ** sub-plan-6 (현재) / v2.0.0-rc1** | **chain harness validated** | **§8.1 strict 7/7 + ≥ 2 PoC corroboration** |

### v2.0.0-rc1 → v2.0.0 final 정책 (Senior F4)

- 같은 날 final tag ❌ — 14차 retract pattern 차단
- final = 2026-05-07~ + clean clone 1회 PoC #05 e2e 재실행 통과 시
- v2.0.1 hot-fix trigger: release-readiness regress 1+ / Senior HIGH 1+ / 7일 carry > 3건

### sp6-c4 PoC #04 mini FE retrofit 진행 (2026-05-06 / Senior F7 부분 closure)

- ✅ chain 1~2 + chain 3 RED dry-run (PAGE-LOGIN 1 use case subset / Zod validation BR-FE)
- ✅ schema-validator 4 file ✅ / chain-coverage 0 findings (UC→BHV 100% / BHV→AC 100%)
- ✅ traceability-matrix 1 cell / forward=0% (impl OUT) / backward=100%
- **§8.1 #1 corroboration 3 PoC** 인식 (release-readiness): poc-03 BE retrofit / **poc-04 FE retrofit (신규)** / poc-05 BE e2e
- Senior F7 (v2.0 = BE-only) 부분 closure → "BE e2e + BE retrofit + FE retrofit"
- sp6-c4 carry → resolved (v2.1+ → v2.0.x 안에서 처리)

### sp6-c8 chaos test 진행 (2026-05-06 / Senior F5)

- ✅ **CAS race detection** — writeStateCAS 에 `options.expectedVersion` 추가 (caller-supplied baseline). 진짜 버그 (함수 내부 read 만으로 외부 race 미검출) 발견 + fix.
- ✅ **intervention-log JSONL** single-writer 가정 하 small/large line 정합 입증 (다중 writer = sp6-c6 carry).
- ✅ **interrupted mid-stage recovery** — `recoverTmpFiles` 검증 + `initState` 재실행 거부 + CLI exit 4 surface.
- 8 chaos test 추가 (chain-driver 60 → **68**) / workspace 201 → **209** / total 210 → **218**.
- Senior F5#1 sp6-c8 carry → resolved (release block 부재 / fix in-place / v2.0.0 final 자격 강화).

---

## sub-plan-5 종결 (2026-05-06) — chain harness 호칭 전환

**5 요소 모두 코드 enforcement 도달** (DEC-2026-05-06-sub-plan-5-종결 + ADR-CHAIN-005):

1. ✅ **Driver / Orchestrator** — `tools/chain-driver/` workspace 12번째 (cli + 6 module: state-store / stage-graph / invoke-skill / gate-eval / revisit-detect / hooks-bridge)
2. ✅ **State 영속** — `schemas/state.schema.json` + state-store.js (atomic write tmp+fdatasync+rename / CAS version compare / Windows fallback / lock 5분 stale auto-release / forward-only migration)
3. ✅ **Mechanical gate** — gate-eval.js + cli `next` — trio 차단: (i) state.blocked 영속 / (ii) cli exit 2 + 동일 메시지 / (iii) PreToolUse permissionDecision=deny. Auto Mode 도 critical/high 위반 시 user 'go' 거부.
4. ✅ **자동 전이 (skill auto-invoke)** — hooks/hooks.json (UserPromptSubmit + PreToolUse) → cli `hooks-bridge`. D21' suppressOutput=true + additionalContext 차단 문구 ("LLM SHALL NOT auto-invoke") / stderr only / LLM 컨텍스트 격리.
5. ✅ **Chain-revisit detector** — revisit-detect.js (`git diff --numstat baseline..HEAD` + path-to-chain whitelist 9 pattern + LOC threshold ≥ 5 + revisit_ignore_globs 학습)

### Senior critique (sub-plan-5-research §F) 흡수

- **F1 BLOCKER** ✅ D21 retract → D21' (hooks stdout LLM context 재주입 차단)
- **F2~F5 HIGH** ✅ trio enforcement / state CAS / revisit LOC threshold / forward-only migration
- **F6~F7 MED** ✅ tmp recovery + intervention-log schema / exit code matrix + dry-run
- **F8 MED** ⏳ sp5-c7 carry (drift `--check-state-flow-consistency`)
- **F9~F10 LOW** ✅ module ≤ 250 LOC / hooks-contract.test.js 5 case

### unit test 회귀 (198 / 12 workspace)

| 도구                          | 직전 (sub-plan-4) | 현재 (sub-plan-5) |
| ----------------------------- | ----------------- | ----------------- |
| drift-validator               | 44                | 44                |
| decision-table-validator      | 11                | 11                |
| formal-spec-link-validator    | 15                | 15                |
| static-runner                 | 16                | 16                |
| schema-validator              | 5                 | 5                 |
| planning-extraction-validator | 5                 | 5                 |
| chain-coverage-validator      | 6                 | 6                 |
| spec-test-link-validator      | 5                 | 5                 |
| traceability-matrix-builder   | 6                 | 6                 |
| test-impl-pass-validator      | 25                | 25                |
| **chain-driver**              | —                 | **60**            |
| **합계**                      | **138**           | **198**           |

master plan §release 자격 80+ → 138 → **198 pass** (sub-plan-5 D24 162+ + Senior F10 165+ 모두 +33 초과 충족).

### no-simulation 정책 강화

- LLM "gate 통과한 척" → trio (i+ii+iii) 봉쇄
- LLM "RED/GREEN 확인한 척" → gate-eval `tests_failed` 자동 검증 (test=0 강제, impl>0 거부)
- LLM "권고 skill 즉시 invoke" → D21' suppressOutput=true + additionalContext 차단 문구로 LLM 컨텍스트 격리

### chain harness 호칭 전환

| 시점                        | 호칭                      | 자격                                                        |
| --------------------------- | ------------------------- | ----------------------------------------------------------- |
| sub-plan-4 종결             | chain harness scaffolding | 사양 + validator + skills + flows + agents + schemas (부품) |
| ** sub-plan-5 종결 (현재)** | **chain harness**         | **5 요소 모두 코드 enforcement 도달**                       |
| sub-plan-6 종결             | chain harness validated   | + ≥ 2 PoC corroboration / §8.1 strict 7/7                   |

### Carry (sub-plan-5)

- sp5-c1 tree-sitter semantic diff (v2.x)
- sp5-c2 다중 사용자 driver state 동시성 (v2.x)
- sp5-c3 hooks 진짜 LLM auto-invoke (v2.x / D21 옵션 B)
- sp5-c4 intervention-log dashboard (sub-plan-6)
- sp5-c5 driver e2e cycle PoC #05 (sub-plan-6)
- sp5-c6 Auto Mode 차단 임계 분포 분석 (sub-plan-6)
- sp5-c7 신설 — drift-validator `--check-state-flow-consistency` (sub-plan-6)

---

## sub-plan-4 종결 (2026-05-06)

**10 항목 모두 통과** (DEC-2026-05-06-sub-plan-4-종결):

1. ✅ 2 \_base skills (build-traceability-matrix + invoke-go-stop-gate)
2. ✅ 3 planning skills (extract-from-legacy / decompose-use-cases / identify-business-intent)
3. ✅ 3 spec skills ( skills/spec- 신규 디렉토리 / compose-behavior-spec / derive-acceptance-criteria / integrate-7대-deliverables)
4. ✅ 3 test skills (generate-test-spec / run-test-evidence / verify-coverage)
5. ✅ 2 implement skills (generate-impl-spec / verify-test-pass)
6. ✅ agents/{planning,spec,test,implement}/README placeholder → 정식 채움 ✅
7. ✅ 4 chain stage flow ({planning,spec,test,implement}.phase-flow.{json,mermaid})
8. ✅ flows/sdlc-4stage-flow.{json,mermaid} 통합 SSOT (stages + revisit_edges + 4 gate + cross_cutting + release_eligibility)
9. ✅ drift-validator `--check-chain-layout` flag + 3 신규 unit test ( 4 stages / 26 phases / 13 skills / 0 orphans / 0 missing)
10. ✅ DEC-2026-05-06-sub-plan-4-종결 + STATUS / INDEX 갱신

### unit test 회귀 (138/138 / 11 workspace)

| 도구            | 직전 (3b) | 현재 (sub-plan-4)        |
| --------------- | --------- | ------------------------ |
| drift-validator | 41        | **44** (+3 chain layout) |
| 그 외 10 도구   | 94        | 94                       |
| **합계**        | **135**   | ** 138**                 |

master plan H §release 자격 80+ → **138 pass = 73%p 초과 달성**.

### chain stage 운영 인터페이스 정식 등재

| 영역                           | 수량   | 위치                                                           |
| ------------------------------ | ------ | -------------------------------------------------------------- |
| chain skill                    | **13** | skills/{\_base,planning,spec,test,implement}/                  |
| chain stage flow               | **4**  | flows/{planning,spec,test,implement}.phase-flow.{json,mermaid} |
| master SSOT                    | **1**  | flows/sdlc-4stage-flow.{json,mermaid}                          |
| chain agent README (정식 채움) | **4**  | agents/{planning,spec,test,implement}/README.md                |

skills-axis chain stage axis 정책 ( §4 v2.0 신설) 운영 입증 — 디렉토리 분리 ❌ + SKILL.md 본문 분기 + manifest SSOT + drift-validator 자동 회귀.

---

## sub-plan-3b 종결 (2026-05-06)

**9 항목 모두 통과** (DEC-2026-05-06-sub-plan-3b-종결):

1. ✅ test-cmd.schema.json 신설 ( ADR-CHAIN-004 §1 contract / framework enum 11종 / shell:true ❌ array argument / if/then for `other`)
2. ✅ test-impl-pass-validator skeleton (workspace 11번째 / package.json + bin)
3. ✅ result-hash 정규화 모듈 (SARIF Appendix F / sha256(sorted_test_names + counts + framework) / 7 unit test)
4. ✅ runner adapter 4종 + other (jest/vitest/junit-xml/pytest/other / fixture-based / 10 unit test)
5. ✅ CLI --allow-execute / --dry-run / --timeout / --flaky-retry (8 unit test)
6. ✅ test-spec / impl-spec schema flaky_retries_count 추가 ( ADR-CHAIN-004 §5)
7. ✅ chain-check.yml gate #3-4 활성 (dry-run only step + strict opt-in step / sub-plan-3a placeholder 교체)
8. ✅ workspace test 110 → **135 pass / 0 fail / 11 workspace** (test-impl-pass-validator +25)
9. ✅ DEC-2026-05-06-sub-plan-3b-종결 등재 + STATUS / INDEX 갱신

### unit test 회귀 (135/135 / 11 workspace)

| 도구                          | 직전 (3a)       | 현재 (3b) |
| ----------------------------- | --------------- | --------- |
| drift-validator               | 41              | 41        |
| decision-table-validator      | 11              | 11        |
| formal-spec-link-validator    | 15              | 15        |
| static-runner                 | 16              | 16        |
| schema-validator              | 5               | 5         |
| spectral-runner               | 0 (passthrough) | 0         |
| planning-extraction-validator | 5               | 5         |
| chain-coverage-validator      | 6               | 6         |
| spec-test-link-validator      | 5               | 5         |
| traceability-matrix-builder   | 6               | 6         |
| **test-impl-pass-validator**  | —               | ** 25**   |
| **합계**                      | **110**         | ** 135**  |

master plan H §release 자격 80+ → **135 pass = 69%p 초과 달성**.

---

## sub-plan-3a 종결 (2026-05-06)

**9 항목 모두 통과** (DEC-2026-05-06-sub-plan-3a-종결):

1. ✅ npm workspace root (10 도구 단일 workspace / S1)
2. ✅ drift-validator chain 2 corpus 5쌍 신규 (BHV-\* state-machine + sequence)
3. ✅ formal-spec-link-validator `--chain-mode` (planning ↔ behavior ↔ acceptance ↔ test ↔ impl backward link + ID pattern)
4. ✅ static-runner lint-no-simulation.sh chain 3/4 evidence 7 필드 + impl-spec source_files commit_hash 의무
5. ✅ schema-validator 6 chain schema 자동 등록 + Ajv 8 if/then 지원 (5 신규 test)
6. ✅ chain-check.yml 별도 워크플로우 ( S2 / workflow_dispatch only / 4 gate step)
7. ✅ --dry-run 의미 3 조합 명문화 (4 신규 도구 README / S3)
8. ✅ ADR-CHAIN-004 신설 (Test Runner Invocation Contract / Aider 패턴 / 5 정책)
9. ✅ unit test 88 → **110 pass** / 0 fail / 9 workspace (master plan H §release 자격 80+ → 38%p 초과 달성)

### unit test 회귀 (110/110)

| 도구                          | 직전   | 현재            |
| ----------------------------- | ------ | --------------- |
| drift-validator               | 36     | 41              |
| decision-table-validator      | 11     | 11              |
| formal-spec-link-validator    | 8      | 15              |
| static-runner                 | 11     | 16              |
| schema-validator              | 0      | 5               |
| spectral-runner               | 0      | 0 (passthrough) |
| planning-extraction-validator | 5      | 5               |
| chain-coverage-validator      | 6      | 6               |
| spec-test-link-validator      | 5      | 5               |
| traceability-matrix-builder   | 6      | 6               |
| **합계**                      | **88** | **110**         |

## sub-plan-3 carry (sub-plan-3b 진입 시)

**사용자 결단 cluster** (sub-plan-3-research.md Senior blocker 3건):

- Blocker 1 (D9 invocation matrix) — ✅ **ADR-CHAIN-004 채택** (Aider 패턴 / `.aimd/config/test-cmd.json` + phase-1-inventory 자동 추론 + override)
- Blocker 2 (test-impl-pass 5 sub-spec) — sub-plan-3b 진입 시점 적용 (Senior + Industry default 모두)
- Blocker 3 (chain-revisit-detector) — **sub-plan-5 (hooks) carry**

### sub-plan-3b carry 항목

| #      | 항목                                                                                                     | 비고                        |
| ------ | -------------------------------------------------------------------------------------------------------- | --------------------------- |
| sp3b-1 | `test-impl-pass-validator` 신규 도구 ( 진짜 runner / 5종 물증 7 필드 / SARIF 2.1.0 / result_hash 정규화) | ADR-CHAIN-004 §5 정합       |
| sp3b-2 | `schemas/test-cmd.schema.json` 신설 (ADR-CHAIN-004 §1)                                                   | —                           |
| sp3b-3 | `--allow-execute` flag + sandbox 정책 (Senior Blocker 2)                                                 | —                           |
| sp3b-4 | flaky retry policy per-test cap 2 + `flaky_retries_count` 필드                                           | Playwright 정합             |
| sp3b-5 | coverage threshold 검증 (chain-coverage-validator 책임 분리)                                             | —                           |
| sp3b-6 | JUnit XML / pytest JSON output adapter                                                                   | Official research           |
| sp3-c1 | mermaid graph view ≥ 100 cell subgraph 분할 정책                                                         | sub-plan-3b 또는 sub-plan-6 |
| sp3-c2 | chain-revisit-detector AI ML 정확도 개선                                                                 | v2.x carry                  |
| sp3-c3 | CI 본격 활성 (PoC #05 데이터 후)                                                                         | sub-plan-6                  |

### commit history ( 6단계 누적)

`b466e51` (sub-plan-1) → `811ea45` (sub-plan-2) → `ccb3f0a` (sub-plan-3a partial) → `edbdd4d` (sub-plan-3a 종결) → `c364c05` (sub-plan-3b 종결) → 본 commit (sub-plan-4 종결).

## sub-plan-5 진입 prerequisite ( 다음 sprint)

| #   | 항목                                          | 상태                                  |
| --- | --------------------------------------------- | ------------------------------------- |
| 1   | ADR-CHAIN-001~004                             | ✅ 4건 등재                           |
| 2   | 7 신규 schema                                 | ✅ 등재                               |
| 3   | 11 chain validator                            | ✅ unit test 138                      |
| 4   | chain-check.yml CI infra                      | ✅ gate #1~#4 모두 step 정의          |
| 5   | 13 chain skill + 5 chain flow + 4 chain agent | ✅ (sub-plan-4)                       |
| 6   | harness 호칭 자격 정의 (5 요소)               | ✅ DEC-2026-05-06-harness-호칭-엄밀화 |

## harness 호칭 단계 (DEC-2026-05-06-harness-호칭-엄밀화 정합)

| 단계                                | 정확한 호칭                           | 보유 자산                                                                      | 상태    |
| ----------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------ | ------- |
| sub-plan-1~4 종결 (현재)            | **chain harness scaffolding**         | 사양 + validator + skills + flows + agents + schemas                           | ✅ 도달 |
| sub-plan-5 종결 후                  | **chain harness** (정식 호칭)         | + driver + state.json + mechanical gate + skill auto-invoke + revisit-detector | 🔜 next |
| sub-plan-6 종결 + v2.0.0 release 후 | **chain harness** ( §8.1 strict 입증) | + ≥ 2 PoC corroboration + e2e cycle pass                                       | ⏳      |

### 5 요소 ( harness 엄밀 정의)

| #   | 요소                   | 의미                                                                                        | 현 (sub-plan-4) |
| --- | ---------------------- | ------------------------------------------------------------------------------------------- | --------------- |
| 1   | Driver / Orchestrator  | "지금 stage X" → "skill Y 호출" → "validator 실행" → "gate 평가" → "next/revisit" 자동 loop | ❌              |
| 2   | State 영속             | `.aimd/state.json` 추적                                                                     | ❌              |
| 3   | Mechanical gate        | gate 미통과 시 다음 stage 차단 (skip 불가)                                                  | ❌              |
| 4   | 자동 전이              | 산출물 완성 → validator 자동 → 다음 skill 자동 호출                                         | ❌              |
| 5   | Chain-revisit detector | impl 변경 → 영향 chain 자동 감지 → 사용자 prompt                                            | ❌              |

### sub-plan-5 carry (hooks + harness)

| #     | 항목                                                                  | 비고                       |
| ----- | --------------------------------------------------------------------- | -------------------------- |
| sp5-1 | hooks/hooks.json 확장 (PostToolUse + PreToolUse + UserPromptSubmit)   | master plan §B             |
| sp5-2 | chain-revisit-detector 구현 (path-to-chain whitelist + 사용자 prompt) | sub-plan-3 carry           |
| sp5-3 | go/stop gate UX 입증 (자연어 prompt → skill 매칭 → cluster 결단)      | sub-plan-4 skill 운영      |
| sp5-4 | intervention_log 분석 dashboard prototype                             | sub-plan-5 또는 sub-plan-6 |
| sp5-5 | hooks 의 skill auto-invoke (gate 자동 호출 / Auto Mode 호환)          | —                          |

## v2.0 carry (master plan §K)

| #   | 항목                                 | 시점                                       |
| --- | ------------------------------------ | ------------------------------------------ |
| K-1 | use case 4종 entry flow 분기         | v2.1+                                      |
| K-2 | impl 70~80% 한계 closure 옵션 B      | v2.x                                       |
| K-3 | design stage skill 본격 채움         | v2.x                                       |
| K-4 | external orchestrator integration    | v2.x                                       |
| K-5 | impl runner multi-framework parallel | v2.x                                       |
| K-6 | tools/ node_modules 경량화           | v2.0.0 후                                  |
| K-7 | 기술 스택 분기 디렉토리              | (영구 — SKILL.md 본문 분기)                |
| K-8 | adoption 외부 워크스페이스           | (영구 — DEC-2026-05-02-adoption-carry-OFF) |
| K-9 | `plugin/` 디렉토리 의도 확인         | sub-plan 진행 중 별도 결단 시              |

---

## 직전 진행 (2026-05-05 ~ 5-3 / 보존)

2026-05-05 v1.4 프로젝트 적합성 평가 보고서 산출 (`archive/v1.4-evaluation/v1.4-evaluation-report.md` 713 line / cleanup round 1 격리) + v2.0 결단 carry 등재. 직전 v1.5.0 MINOR release (2026-05-03 / 98998d5) — ADR-BE-001 negative-space corroboration 정식화 + §8.1 strict 정합 검증대 두 번째 통과 보존.

---

## 방법론 본체 버전

- ** v1.5.0 MINOR release (2026-05-03) ✅ 현재** — ADR-BE-001 ( negative-space corroboration 정식화) 신설 + schemas/error-mapping-spec.schema.json (deliverable 16) 신설 + skills/analysis-phase-5-error-mapping/SKILL.md 신설. §8.1 strict 정합 검증대 두 번째 통과 ( ADR-FE-007 positive-space 와 대칭 — 4 PoC 모두 anti-pattern 보유 ↔ 3 BE PoC 모두 contract 부재). AP-API-001 본체 antipattern 카탈로그 negative-space 첫 등재 (3 BE PoC isomorphic / Spring 2.5 + Spring 3 + NestJS framework 무관). flows/analysis.phase-flow.json v1.4.4 → v1.5.0 (phase 5-1 outputs + error-mapping-spec.json / skills 3 → 4). methodology-spec/skills-axis.md §5 매핑 표 갱신. 검증: drift-validator --check-layout 9 phases / **19 skills** ( 18 → 19) / 0 orphans / 0 missing / 4 tool 회귀 66/66 pass / version-check 3-source sync at v1.5.0 / build 224 files dist/internal-v1.5.0/ + CHECKSUMS. b87cec5 + v1.4.5 흡수. retract risk 명시 (negative-space 정의 v1.6+ 외부 사용 시 재검토 / mapping_mechanism enum framework 추가 시 확장). Cooling-off ❌ ( ADR + schema 신설 = 적용 대상이나 사용자 명시 결단 "나머지 진행" → memory edge case 정합). carry → v1.5.1+ PATCH (ts-morph decorator semantic / AP-API-001 PoC #01 evidence 보강 / antipatterns.schema 본체 카탈로그 / drift-validator BE corpus / extractor agent / deliverable 16 full spec / migration-cautions BE). git tag `v1.5.0`. commit `98998d5`.
- ** v1.4.5 PATCH release (2026-05-03) ✅ 보존** — AP-API-001 자동 회귀 도구 BE 트랙 첫 진입. NestJS sub-rule (`internal.be.api.error-mapping-nestjs-delete-201-decorator-drift`) 신규 — `@Delete + @ApiResponse({status: 201, ...})` decorator drift detect (4 분기 / 순서 양방향 + async 변형) / PoC #03 article.controller.ts:65,68 + 81,85 + 97,99 4 op 정확 매칭. AP-API-001 cross-PoC base 정합 — PoC #03 ap.json 에 static_rule_link 추가 ( PoC #02 mirror + ts-morph carry 명시). 직전 b87cec5 (옵션 2′ / no release / Spring rule + AP-API-001 PoC #02 cross-link / drift-check.yml body scan 통합) 정식 release 통합. §8.1 strict 평가 — patterns ≥ 2 PoC isomorphic + 2 framework (Spring + NestJS) 자연 충족 → static-runner quality 격상 자격. release note = CHANGELOG entry. git tag `v1.4.5`. commit `4dcace9`.
- ** v1.4.4 PATCH release (2026-05-02) ✅ 보존** — manifest SSOT 정식 승격 (`flows/analysis.phase-flow.json` v1.2.2 → v1.4.4 / 9 phase + skills 매핑 + cross_cutting.aspects). `methodology-spec/skills-axis.md` 신설 ( phase ID + skills 디렉토리 axis 분리 정책). drift-validator 0.2.0 → 0.3.0 ( check-phase-skills.js + cli `--check-layout` flag + test 3건 / 36 pass). `.github/workflows/drift-check.yml` 신설 ( CHANGELOG v1.2.1 entry 의 plan 정의만 → 실 구현 흡수). b (rename) carry → v2.0 ( §8.1 corroboration 0 = 본 plugin 의 정책이 본 plugin 자신의 변경 차단 메타 정합 첫 입증). git tag `v1.4.4`. commit `bac7c5d`.
- ** v1.4.3 PATCH release (2026-05-02) ✅ 보존** — 14차 결단 (DEC-2026-05-02-plugin-first) 1일 retract / adoption 분리 워크스페이스 폐기 / workspace 단일 통합 + build script 1차 도입 ( Phase A). 신규 자산: `package.json` (workspace root / private:true / type:module / devDeps only) + `scripts/build-plugin.js` (Official + Industry + Senior 보강 7건 — explicit allow-list / Windows long-path 검증 / SHA256 CHECKSUMS / Agent 4 발견 templates/adoption/ → dist root 동시 복사) + `scripts/version-check.js` (3 source 정합 / source-of-truth = plugin.json) + `.gitignore`. 흡수 자산: `templates/adoption/CLAUDE.md` ( 사용자 직접 편집 / 정책 23 inline / NestJS 4 + Spring 5 PoC #02 추출) + `templates/adoption/README.md` + `archive/methodology-v1.1/` + `docs/adoption/{v1.3-plan,v1.3-status,v1.3-decisions-index,lessons-learned-2026-05-02,README}.md`. 검증: version-check ✅ / build:check 211 files ✅ / build 214 files + CHECKSUMS ✅ / build:diff-check (Senior gate) source mutation 0 ✅ / sha256sum -c 213/213 OK ✅ / `claude plugin install` Version 1.4.3 / Scope user / Status enabled ✅. Phase A 운영: marketplace.json `"source": "./"` 그대로 / dist 부가 출력. Phase B carry: `"source"` → `"./dist/internal-v1.4.3/"` 전환 / release.yml CI / 사내 ADR 1호. Lessons: cadence ≥ 24h cooling-off (Senior / memory 자산화 carry) + 별도 dist sync 함정 (Babel/Yarn/Sentry) + 사용자 직접 편집 silent loss risk ( Agent 4) + §8.1 일반화 ❌ (본 retract specific). carry 5 → 7 → **5** ( DEC-2026-05-02-adoption-carry-OFF 후속 결단 / F4+F5+rename = 본 프로젝트 backlog 제거 / 외부 워크스페이스 = 사용자 자체 영역 / workspace 본체 단일 focus). release note = `decisions/DEC-2026-05-02-adoption-폐기-build-step-신설.md` + `docs/adoption/lessons-learned-2026-05-02.md`. git tag `v1.4.3`. DEC-2026-05-02-adoption-폐기-build-step-신설 + DEC-2026-05-02-adoption-carry-OFF ( no release / no tag / 본체 commit 만).
- ** v1.4.2 PATCH release (2026-05-02) ✅ 보존** — AP-FE-SECURITY-001 (FE applies_to "localStorage 저장") 진짜 도구 직접 confirm 도달 ( implicit 목표 종결). custom Semgrep rule 첫 실현 (`tools/static-runner/rules/jwt-localstorage.yml` / fully qualified slug `internal.fe.security.jwt-localstorage` / 4 분기 pattern / metavariable-regex / Sprint 4 README "별도" carry 의 1년 long-tail 종결). static-runner 0.1.1 → 0.1.2 ( `--extra-rules` 옵션 신규 / multi-config / Semgrep `--config` 멀티 정합) / unit test 9 → 11. drift-check.yml CI ratchet 통합 ( PoC #04 full FE 트랙 신규 step + `--baseline --ratchet` + custom rule 적용 / ADR-010 §2.3 첫 운영 입증 / ratchet dry trial: novel 1 → blocked → exit 1). Official research Q4 carry 해소 ( `--rewrite-rule-ids` default ON 실측). 같은 날 v1.4.0 + v1.4.1 + v1.4.2 = 3 release 빠른 carry resolve cadence 입증. release note = `docs/v1.4.2-release-note.md`. git tag `v1.4.2`. carry 5 → 5 ( 보존 3 + 신규 2: severity 변환 검토 + RSA/JWT 길이 custom rule). DEC-2026-05-02-v1.4.2-carry-2-3-종결.
- ** v1.4.1 PATCH release (2026-05-02) ✅ 보존** — release 같은 날 carry 1 즉시 종결. Semgrep 1.161.0 진짜 실행 ( pip 채널 / Python 3.14 공식 지원 / Docker 가정 깨짐) → 진짜 도구 6 → **7종** + -5%p 패널티 제거 + baseline 첫 작성 (0 findings) + ratchet dry trial pass + ADR-010 외부 적용 첫 입증 (PoC #04 full). 본체 도구 격상 1건 부수 산출 — static-runner 0.1.0 → 0.1.1 (`result_hash: null` + `source_commit_sha: unknown` bug 2건 fix / no-simulation 정책 핵심 필드 위조 차단 효과 복구). release note = `docs/v1.4.1-release-note.md`. git tag `v1.4.1`. implicit 목표 (JWT XSS 4 PoC isomorphic 직접 confirm) = 미달 → carry 2 신규 분리 (custom Semgrep rule 작성 / v1.4.2 또는 v1.5). DEC-2026-05-02-v1.4.1-Semgrep-carry-종결.
- ** v1.4.0 MINOR release (2026-05-02) ✅ 보존** — 사내 표준 v1.3.1 → v1.4.0 격상. FE 트랙 정식 진입 + §8.1 strict 검증대 첫 통과. release 자격 7/7 충족 + 4 carry 명시 (Semgrep / F-FE-006 / i18n / v1.5). release note = `docs/v1.4-release-note.md`. git tag `v1.4.0`. ADR-FE 7건 + schemas 13종 + tools 6종 ( schema-validator 신설) + 4 PoC. DEC-2026-05-02-v1.4.0-release.
- ** v1.4.0-dev 라인 (2026-05-02) — Stage 5 본격 PoC #04 종결 ✅** — §8.1 strict 정합 검증대 첫 통과. yurisldk/realworld-react-fsd 4 Sprint × 4 sprint 게이트 + Stage 5 종결. 본체 격상 3건: drift-validator FE 모드 신설 + schema-validator (Ajv 8) 신설 + ADR-FE-007 신설 ( 본체 antipattern 카탈로그 첫 등재 / AP-FE-SECURITY-001 4 PoC isomorphic + AP-FE-OPTIMISTIC-DRY 3 컴포넌트). 진짜 도구 6종 (ts-morph + Playwright + axe + drift-FE + schema-validator + formal-spec-link FE) + Semgrep carry. Phase 5-2-c 32 snapshot + 16 a11y scan ( 8 page × 4 viewport). form-validation 90/77 BR + URL params validation 2 page isomorphic 정식화. rules.json 80 BR. IR 4계층 정합도 0.99 ratchet 단조 비감소. 신뢰도 0.92 (ADR-009 단계 5). 6 finding (F-FE-001~006). Stage 7 v1.4.0 MINOR release 진입 자격 7/7 충족 + 4 carry 명시 (Semgrep / F-FE-006 / i18n / v1.5). DEC-2026-05-02-v1.4-Stage-5-종결.
- ** v1.4.0-dev 라인 (2026-05-02) — Stage 4 mini-PoC 종결 ✅** — RealWorld React fork (yurisldk/realworld-react-fsd / 527 stars / FSD 약식 / Zod / TanStack Query / react-router v7 / orval+OpenAPI) 1주 fail-fast 검증. 진짜 도구 3종 실행 (ts-morph 24 + Playwright Chromium + axe-core 4.10) → no-simulation 정책 단계 4 도달. form-validation-spec.json 85 validation / 72 BR 자동 등록 ( Stage 7-pre 신설 deliverable 14 핵심 입증 / OpenAPI 67 + Zod-mini URL 5 + HTML5 13). type-spec.json 46 type / framework_neutrality_score 1.0. visual-manifest.json 2 viewport binary 진실. a11y-spec.json WCAG 2.2 AA / 1 unique violation (html-has-lang). IR 4계층 정합도 overall_framework_neutrality_score = 0.99 (target 0.90 / 9%p 초과 / react_idiom_count_in_IR = 0). 4 finding (F-FE-001~004 / 모두 candidate / mini scope 정합). 사상 위반 0. Stage 5 진입 자격 5/5 충족 (사상 + IR + 도구 + finding + 신뢰도) + carry 2건 (Semgrep 환경 + drift-validator FE / Senior 재분류 i18n = 적용 대상 부재 ≠ carry). §8.1 정합 strict — 본체 격상 0건. DEC-2026-05-02-v1.4-Stage-4-mini-PoC-종결.
- ** v1.4.0-dev 라인 (2026-05-01) — BE Sprint 5+ carry-over (환경 무관 부분) 종결 ✅** — drift-validator v0.1.0 → **v0.2.0** 격상 (corpus 14쌍 → 19쌍 / self-test 15 → 25 test) + phase-flow 비교기 신설 ( 본체 phase-flow drift 0 자가 입증) + tools/\_shared/baseline.js 공용 이동 + DTV/static-runner --baseline/--ratchet 통합 + static-runner SARIF→finding 어댑터. 3 도구 unit test 합계 **53/53 pass** ✅. ADR-010 §2.5 정합 도달. 환경 의존 (Semgrep/PMD 진짜 실행) 만 carry. DEC-2026-05-01-Sprint-5-carryover-종결.
- **v1.4.0-dev Stage 7-pre (2026-05-01) ✅** — 본체 격상 8 항목 (ADR-FE-005 보강 [매개체 12 → 13 / Zod 추가] + ADR-FE-006 갱신 [§5.2 carry → resolved] + schema 2 신설 [form-validation-spec / type-spec] + schema 1 확장 [rules source_format/auto_extracted] + deliverable 2 신설 [14 form-validation-spec / 15 type-spec] + workflow 보강 1 [phase-5-2-b §3.1 form_state cross-link]). 외부 LLM 검증 빈틈 5/5 = 100% 해소. DEC-2026-05-01-v1.4-Stage-7-pre-종결.
- **v1.4.0-dev Stage 6 (2026-05-01) ✅** — 본체 격상 8 항목 (ADR-FE-004 + ADR-FE-006 신설 + be-fe-separation.md + ADR-FE-001/003 carry → resolved + deliverable 7 §6.5 + phase-0 §3.4 + legacy-spectrum.schema). 사용자 7 요구사항 7/7 = 100% 도달. 외부 LLM 검증 빈틈 #3/#4/#5 해소. DEC-2026-05-01-v1.4-Stage-6-종결.
- **v1.4.0-dev Stage 3-2 (2026-05-01) ✅** — 본체 격상 2차 12+ 항목 (ADR 2 + schema 5 + deliverable 4 + migration-cautions-fe + phase-6 보강 + 도구 확장 1). G2-1+G2-2+G2-4 정식 반영. Strangler Pattern 채택. schema if/then 강제 4 영역. formal-spec-link-validator FE 4→8 pass. DEC-2026-05-01-v1.4-Stage-3-2-종결.
- **v1.4.0-dev Stage 3-1 (2026-05-01) ✅** — 본체 격상 16+ 항목 (ADR 4 + schema 3 + deliverable 3 + workflow 4 + 도구 시범 1). 사상 기둥 3 (ADR-FE-001/002/005) + 정량 모델 격상 (ADR-009 §2.4) + no-simulation 정책 강화 (visual schema 강제). cross-check 권고 3건 반영 (DTCG / WCAG 2.2 / ICU MF2). drift-validator FE corpus 14→15 pass. DEC-2026-05-01-v1.4-Stage-3-1-종결.
- **v1.4.0-dev Stage 2 (2026-05-01) ✅** — Gate 1/2/3 × 4 = **12 결정 모두 Senior 권고 채택**. spectrum (Modern+jQuery+JSP 예외) / 시나리오 B-Lite / schema 분리 / 매개체 12 / 비기능 a11y+i18n+정적보안 v1.4 / legacy Tier 1~4 / BE/FE 분리 + ADR-FE-004 / ADR-001 갱신 / mini-PoC Stage 3-1 후 / PoC RealWorld only / 신뢰도 0.80 / Sprint mini 1주 + 본격 4-6. DEC-2026-05-01-v1.4-Stage-2-Gate-결단.
- **v1.4.0-dev Stage 1 (2026-05-01) ✅** — research × 3 (공식문서 / 산업 / Senior) 완료. 3 에이전트 합의: Scenario B-Lite / 권위 매개체 12 채택 / 빈틈 Top 5. DEC-2026-05-01-v1.4-Stage-1-research-종결.
- **v1.4.0-dev Stage 0 (2026-05-01) ✅** — FE 트랙 정식 시작. 사용자 진단 "FE 분석 방법이 없잖아" → research-first. 8 Stage 분할. 외부 plan = `~/.claude/plans/be-foamy-jellyfish.md` (3 에이전트 점검 v2). DEC-2026-05-01-v1.4-FE-트랙-진입.
- ** v1.3.0 MINOR release (2026-05-01) ✅ 보존** — 사내 표준 채택 가능 시점 도달. **11 묶음 통합** (C+I+H+K + R+D+§8.1 + L+M+N+O) + Sprint 5 Node 도구 부분 종결 (spectral). no-simulation 정책 첫 실현. 신뢰도 85-92% ( ADR-009 단계 4 — 진짜 도구 1회 실행).
- v1.2.3 PATCH ( v1.3.0 에 흡수) — 본체 격상 7 묶음 (C+I+H+K + R+D+§8.1).
  - C: Phase 4.5 cross-link 의무화 schema
  - I: AP-PERFORMANCE 3 PoC 권위 격상
  - H: Positive finding 패턴 schema (severity:positive + learning_effect_type 4종 + status:logged)
  - K: Lifecycle BR 패턴 (decision_tables required 분리 + br_type enum + current_state_note)
  - **R: NestJS 4 ADR 신설** (Auth-scope / Validation / HttpCode / TypeORM-Integrity)
  - **D: ADR-006 final 격상 + ADR-010 (Baseline + Ratchet) 신규**
  - **§8.1 cross-platform 입증 정식 등재** (README "Platform-Agnostic 입증" 섹션)
  - 본체 갭 closure 7 → 11. ADR 9 → 13개 ( ADR-NEST 4 + ADR-010 1). v1.3.0 release 진입 직전.
- v1.2.2 PATCH — 묶음 M-P2-3 5건 (본체 갭 7건 모두 closed).
- **v1.2.1 PATCH** — drift-validator + decision-table-validator + static-runner + drift-check.yml + Phase 4.5 schema 5종 물증 강제.
- **v1.2.0 MINOR** — 14 묶음 (A~M+P) 통합. ADR-008 + Phase 4.5 정식 + finding-system schema + migration-cautions 의무.
- v1.1.2 PATCH (high 4건 closed) → v1.2.0 흡수

## 시퀀스 진행률

| 시점                                     | 작업                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 상태                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| PoC #01 Phase 0~6                        | RealWorld Spring Boot 2.5                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | ✅ 종결 (2026-04-29)                           |
| PoC #02 Phase 1~6                        | 1chz/realworld-java21-springboot3                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | ✅ 종결 (2026-04-29)                           |
| C-Sprint 1                               | F-074 단방향 round-trip + BR 1건 형식화 시범                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ✅                                             |
| C-Sprint 1.5                             | 다이어그램 신뢰도 강화 + cross-validation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | ✅                                             |
| C-Sprint 2                               | BR 5건 형식화 + cross-validation 의무 + F-074 우선                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | ✅                                             |
| C-Sprint 3                               | Phase 4.5 정식 명세화 + JSON 짝 + α+β + M-P1 병행                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | ✅                                             |
| C-Sprint 4                               | drift-validator + decision-table-validator + static-runner + drift-check.yml + Phase 4.5 schema 5종 물증 + PoC #02 자가 검증 ( 7+3 finding 자동 검출)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | ✅                                             |
| **묶음 M-P2-3**                          | 본체 갭 5건 — api.template.md / phase-flow / ADR-009 / db-schema.template.md / meta-confidence.template.yaml                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ✅ **본 세션**                                 |
| **C-Sprint 5**                           | (carry-over) (1) drift-validator transitionFuzzyMatch 보완 ✅ DEC-A (2026-04-30) / (2) corpus 4쌍→ 19쌍 ✅ Sprint 5+ Phase A / (3) phase-flow 비교기 ✅ Sprint 5+ Phase B / (4) ADR-010 baseline 3 도구 통합 ✅ Sprint 5+ Phase C+D / (5) static tool 실 실행 1회 ⏳ 환경 의존 carry                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 환경 무관 부분 종결 / 환경 의존 1 항목만 carry |
| **시퀀스 B — PoC #03 NestJS**            | Phase 0~4 종결 (Phase 4.5+ carry)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 🔄 **진행 중**                                 |
| 시퀀스 B Phase 4.5 산출                  | 5 산출물 37 파일 (state-machine 6 + sequence 12 + decision-table 12 + invariants 3 + property 3 + manifest 1) + PROGRESS — D1~D6 권고 안 채택 (BR 6 / AR 3 / UC 6 / Sairyss antipattern 권고 / 신뢰도 70-77% / false negative 우선)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | ✅ (2026-04-30 직전 세션)                      |
| 시퀀스 B Phase 4.5 검증                  | drift-validator (9 짝 / 20 breaking → 진짜 8 + 도구 한계 12) + decision-table-validator (6 → 0 enum fix) + DEC 종결 + finding F-145~**F-156** 통합 ( F-154 transitionFuzzyMatch 60% false positive — F-117 재발 입증) + 신뢰도 0.70 → 0.77 (단계 2 → 2.5)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | ✅ (2026-04-30 본 세션)                        |
| **시퀀스 B Phase 4.5+1**                 | **다이어그램 mermaid 보강 (진짜 drift 8 → 0 ✅) — Article persistingArticle compound + User validatingLogin compound + Article 3 self-loop + Follows self-loop + sequence 2 message** + drift 재실행 (breaking 20 → 8 / 진짜 drift 0 / 도구 한계 100%) + 신뢰도 0.77 → **0.80** ( 단계 3 자동 검증 통과 도달 ✅)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | ✅ **본 세션 (2026-04-30)**                    |
| **시퀀스 B Phase 5-1**                   | **api 산출 4종 — openapi.yaml (21 endpoint / 14 schemas / Bearer JWT) + api-extension.json ( Phase 4.5 cross-link 9/21) + api.md (12 REC-API-\*) + \_manifest. F-164 critical 신규 (Article 4 endpoint Auth 부재) + F-161 positive (Bearer 표준 ✅ = PoC #02 F-084 학습 효과) + F-157~F-166 10건. 신뢰도 0.90 / 7대 산출물 5/7**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | ✅ **본 세션 (2026-04-30)**                    |
| **시퀀스 B Phase 6**                     | **antipatterns final 4종 — antipatterns.json (11 AP / critical 2 + high 3 + medium 4 + low 2) + avoid-list.md + migration-cautions.md (NestJS 특이 8 함정 + 학습 효과 3건) + \_manifest. 4 composite view + Phase 4.5 cross-link 4/11 AP + F-161 positive (Bearer 학습 효과) + AP-PERFORMANCE-001 medium → high 격상 (3 PoC 재현). 신뢰도 0.94 / 7대 산출물 6/7**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | ✅ **본 세션 (2026-04-30)**                    |
| ** PoC #03 종결**                        | ** 전체 7대 산출물 6/7 도달** (UI/UX 만 N/A) — 사내 표준 v1.3 격상 데이터 완비                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | ✅ (2026-04-30)                                |
| v1.3.0 MINOR + v1.3.1 PATCH release      | 사내 표준 채택 가능 시점 도달 / D3.2 파일명 컨벤션 정리 (12 rename, c72d29c)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ✅ (2026-05-01 보존)                           |
| v1.4.0-dev Stage 0                       | freeze 해제 + FE 트랙 진입 + 8 Stage 분할 합의 + plan/DEC/STATUS/INDEX/CHANGELOG/memory                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | ✅ (2026-05-01)                                |
| v1.4.0-dev Stage 1                       | research × 3 (공식/산업/Senior) — 9Q × 27 답 + 진단 보고서 + Stage 2 Gate 입력 12 결정                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | ✅ (2026-05-01)                                |
| **v1.4.0-dev Stage 2**                   | Gate 1/2/3 × 4 = 12 결정 모두 Senior 권고 채택 / Stage 3-1 진입 자료 확정                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | ✅ (2026-05-01)                                |
| **v1.4.0-dev Stage 3-1**                 | 본체 격상 1차 — ADR-FE-001/002/005 신설 + ADR-009 §2.4 갱신 + state-map/visual-manifest schema 신설 + ui-spec.schema 확장 + deliverable 8/9 신설 + 7 보강 + phase-5-2 분할 (a/b/c) + drift-validator FE corpus 14→15 pass + formal-spec-link-validator FE 진단 (Stage 3-2 carry). cross-check 1차 사료 권고 3건 반영 (DTCG 정확한 인용 / WCAG 2.2 ratchet / ICU MF2 단계).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | ✅ (2026-05-01)                                |
| **v1.4.0-dev Stage 3-2**                 | 본체 격상 2차 — ADR-FE-003 신설 + ADR-001 §명시적 제외 갱신 + a11y-spec/i18n-spec/static-security-spec/legacy-spectrum schema 신설 + rules.schema 확장 + deliverable 10/11/12/13 신설 + migration-cautions-fe 신설 + phase-6 보강 + formal-spec-link-validator FE 모드 확장 (4→8 pass). G2-1+G2-2+G2-4 정식 반영. Strangler Pattern 채택. schema if/then 강제 4 영역 (a11y/i18n/security/legacy).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | ✅ (2026-05-01)                                |
| **v1.4.0-dev Stage 6**                   | 횡단 정책 — ADR-FE-004 (BE/FE 분리 3 Scenario) + ADR-FE-006 (framework-neutral IR / IR 4계층) 신설 + be-fe-separation.md 신설 + Tier 4 carry 종결 + deliverable 7 §6.5 Screen+Journey 우선. 사용자 요구 7/7 = 100% 도달. 외부 LLM 검증 빈틈 #3/#4/#5 해소.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | ✅ (2026-05-01)                                |
| **v1.4.0-dev Stage 7-pre**               | release 전 마지막 quality 격상 — ADR-FE-005 매개체 12 → 13 (Zod 추가) + form-validation-spec / type-spec schema 신설 + rules.schema source_format/auto_extracted 확장 + deliverable 14/15 신설 + ADR-FE-006 §5.2 carry → resolved + phase-5-2-b §3.1 form_state cross-link. 외부 LLM 검증 빈틈 5/5 = 100% 해소.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | ✅ (2026-05-01)                                |
| ** BE Sprint 5+ carry-over (환경 무관)** | drift-validator v0.1.0 → v0.2.0 / corpus 14 → 19쌍 / self-test 15 → 25 test (Phase A) + phase-flow 비교기 신설 + 본체 phase-flow drift 0 자가 입증 (Phase B) + tools/\_shared/baseline.js 공용 이동 + DTV --baseline/--ratchet 통합 (Phase C) + static-runner SARIF→finding 어댑터 + baseline-mode (Phase D) + DEC + STATUS + INDEX + CHANGELOG + memory (Phase F). 3 도구 합계 53/53 test pass (drift 33 + DTV 11 + static-runner 9). ADR-010 §2.5 정합 도달. 환경 의존 (Semgrep/PMD 진짜 실행 + vacuum/openapi-changes) 만 carry.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | ✅ **본 세션 (2026-05-01)**                    |
| ** methodology-spec doc 압축 정비**      | LLM hot path 정보 농도 격상 — deliverables 1~9 + 4-5 (`8cf8a4d` -533) + workflow phase-0~5-1 (`474d36c` -244) + phase-5-2-a/b (`412d117` -60) + phase-5-2-c/5-2-ui/6 (`9b1c45c` -114) + 잔여 4 파일 (`68ae3df` -18). 누적 5404 → 4422 line (-18% / -982 line). 검증: cross-reference 1건 + ADR 인용 4 파일 보강. 압축 ROI 분류 — placeholder 견본 (templates) 원복 / 사람 hot path (ADR/decisions) 미진행 결정.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | ✅ (2026-05-01)                                |
| ** v1.4.0-dev Stage 4 mini-PoC**         | RealWorld React fork (yurisldk) 1주 fail-fast / no-simulation 단계 4 / IR 0.99 / 신뢰도 0.85 / 4 finding / Stage 5 진입 자격 충족 / §8.1 — 본체 격상 0건                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | ✅ (2026-05-02)                                |
| ** v1.4.0-dev Stage 5 본격 PoC #04**     | yurisldk/realworld-react-fsd 4 Sprint × 5 sprint 게이트. §8.1 strict 정합 검증대 첫 통과. 본체 격상 3건 (drift-validator FE 모드 + schema-validator Ajv 8 + ADR-FE-007 신설 / 본체 antipattern 카탈로그 첫 등재). AP-FE-SECURITY-001 ( 4 PoC isomorphic / Java + Hexagonal + NestJS + React) + AP-FE-OPTIMISTIC-DRY ( 3 컴포넌트). 진짜 도구 6종 + Semgrep carry. 32 snapshot + 16 a11y scan / form-validation 90/77 BR / rules.json 80 BR / 9 SM / 8 page / 19 op + 25 schemas / IR 0.99 단조 비감소 / 신뢰도 0.92 (ADR-009 단계 5) / 6 finding. Stage 7 v1.4.0 MINOR release 진입 자격 7/7 충족 + 4 carry 명시.                                                                                                                                                                                                                                                                                                                                                                                                                     | ✅ (2026-05-02)                                |
| ** v1.4.2 PATCH release**                | AP-FE-SECURITY-001 진짜 도구 직접 confirm + custom Semgrep rule 첫 실현 + drift-check.yml CI ratchet. Custom rule (`jwt-localstorage.yml`) 4 분기 pattern (string vs identifier × bare vs window. prefix) / 545 rules loaded / 77 rules run / 66 files / 1 finding / `auth-storage.ts:20` 매칭. static-runner 0.1.1 → 0.1.2 ( `--extra-rules` 옵션 신규) / unit test 9 → 11 pass. ratchet dry trial: novel 1 / blocked 1 / exit 1 ADR-010 §2.3 CI fail trigger 첫 운영 입증. Official research Q4 carry 해소 ( `--rewrite-rule-ids` default ON 실측 — SARIF ruleId = `<cwd-relative-path>.<rule-id>`). DEC-2026-05-02-v1.4.2-carry-2-3-종결.                                                                                                                                                                                                                                                                                                                                                                                          | ✅ **본 세션 (2026-05-02)**                    |
| ** v1.4.1 PATCH release**                | release 같은 날 carry 1 즉시 종결. Semgrep 1.161.0 pip 채널 (Python 3.14 공식 / Docker 가정 깨짐) PoC #04 full INPUT/src/ 진짜 실행 (544 rules / 76 run / 66 files / 0 findings / 6293 ms / 5종 물증 7 필드 모두 정상). 본체 도구 bug 2건 발견 + 즉시 fix ( static-runner 0.1.0 → 0.1.1) — `result_hash: null` ( no-simulation 핵심 필드 위배 / runner.js:71 `require('node:fs')` ESM throw → catch swallow) + `source_commit_sha: unknown` (cli.js writeBaseline 호출 시 sourceCommitSha 인자 누락) → readFileSync import 추가 + detectGitSha 함수 신설. 9/9 unit test pass. baseline 첫 작성 (0 findings) + ratchet dry trial pass (0/0/0/exit 0) — ADR-010 외부 적용 첫 입증. implicit 목표 (JWT XSS 4 PoC isomorphic 직접 confirm) = 미달 (Semgrep `react-jwt-in-localstorage` 룰 = jwt_decode 임포트 부재로 매칭 0건 / Senior research Q2 정확 입증) → carry 2 신규 분리 (custom Semgrep rule 작성). 진짜 도구 6 → **7종** / -5%p 패널티 제거 / 신뢰도 0.92 → 0.92~0.95 (단계 5 강화). DEC-2026-05-02-v1.4.1-Semgrep-carry-종결. | ✅ **본 세션 (2026-05-02)**                    |

---

## PoC #01 종결 (2026-04-29)

- Phase 0~6 완료 — 7대 산출물 6/7 (UI/UX 제외 100%)
- finding **33건** (closed 10 / promoted 10 / deferred 13)
- AP **15건** (critical 2 / high 2 / medium 7 / low 4)
- raw confidence: Phase 6 0.96
- 핵심 결함: AP-DOMAIN-001 (De Morgan critical) + AP-SECURITY-001 (JWT 21byte critical) + AP-DOMAIN-002 (email/username unique 3중 부재)

## PoC #02 종결 (2026-04-29)

분석 대상: `1chz/realworld-java21-springboot3` (HEAD `93e018e` / Spring Boot 3.3 + Java 21 + Multi-module Hexagonal)

### Phase 1~6 산출

| Phase                       | 산출                                                                                                                              | raw conf | 핵심                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------- |
| 1 (init)                    | inventory.json + stack-detection.md + tree.md + stats.json + \_manifest.yml                                                       | 0.93     | Hexagonal Modular Monolith hybrid 0.65 cap                    |
| 2 (db)                      | schema.json + schema.sql + erd.mermaid + 정합성-검증-보고서.md + \_manifest.yml                                                   | 0.85     | F-048 critical (TagJpaRepository 타입 오류 Senior 발견)       |
| 3 (arch)                    | architecture.json + architecture.md + architecture.mermaid + dependency-graph.mermaid + circular-dependencies.md + \_manifest.yml | 0.92     | LV/CIRCULAR 0건 / F-068 critical (RSA git commit Senior 발견) |
| 4 (domain+rules+AP partial) | domain/_ + rules/_ + antipatterns-partial/\*                                                                                      | 0.83     | 4 Aggregate Root + 25 UC + 14 BR + 6 AP partial               |
| 5-1 (api)                   | openapi.yaml + api-extension.json + api.md + \_manifest.yml                                                                       | 0.93     | 19 op / openapi.yaml ground truth 802 line 사용자 작성        |
| 6 (antipatterns final)      | antipatterns.json (21 AP) + avoid-list.md + \_manifest.yml                                                                        | 0.96     | **3 critical: AP-API-001 / AP-DB-001 / AP-SECURITY-001**      |

### PoC #02 핵심 결함 (사내 적용 시 즉시 수정 critical 3건)

- **AP-API-001 critical** — F-070+F-079+F-085 spec/runtime drift 묶음 (RFC 7231 §4.2.2 + RFC 9110 §15.3 이중 위반)
- **AP-DB-001 critical** — F-048 TagJpaRepository<Tag, Integer> 타입 오류 (1글자 fix: Integer → String)
- **AP-SECURITY-001 critical** — F-068 RSA private key (`server/api/src/main/resources/app.key`) git 직접 commit (PoC #01 isomorphic )

### PoC #02 finding 통계

- finding **43건** (F-042~F-087 / F-079 → F-070 merged)
- promoted 31 / candidate 8 / deferred 4 / closed 0
- F-070 high → critical 격상 (Phase 5-1)
- F-085 low → medium 격상 (Phase 5-1)
- F-081 medium → low 강등 (Phase 5-1)

### PoC #02 5 핵심 결정 (Phase 6 — 윤주스 일괄 승인)

- DEC-001 — AP-API-001 critical 단일 등록 (Phase 5-1 정합)
- DEC-002 — Phase 1-3 누락 candidate 5건 등록 (F-048 / F-068 / F-051 / F-053 / F-069)
- DEC-003 — ID 정규화 6건 (multi-prefix → single)
- DEC-004 — composite view 4건 도입 (PoC #01 1건 → 4건 확장)
- DEC-005 — low candidate 3건 등록 (F-058 / F-076 / F-078)

### PoC #01 ↔ PoC #02 cross-validation (15 AP 외부 검증)

- **비재현 8건 (53%)** — Hexagonal 분리 + Spring Boot 3.x 효과 (학습 효과 입증)
- **재현 4건 (27%)** — v1.2.0 합산 격상 강한 권위 (AP-PERFORMANCE-001 medium → high 격상 / AP-API-001~002 + AP-DB-001 재현)
- **변형 재현 3건 (20%)** — AP-SECURITY-001 (JWT 21byte → RSA git commit isomorphic ) + AP-DOMAIN-002 + AP-ARCH-002

---

## 누적 통계 (PoC #03 Phase 4.5 검증 종결 시점 / 2026-04-30)

```yaml
finding_total: 168 # 158 + Phase 5-1 신규 10 (F-157~F-166)
finding_closed: 10
finding_promoted: 41
finding_deferred: 18
finding_candidate: 60 # +41 (PoC #03 + Phase 4.5)
finding_merged: 1
finding_rejected: 0
finding_phase45_new: 53 # 41 (PoC #02 시퀀스 C) + 12 (PoC #03 Phase 4.5 형식화 9 + 검증 3)

ap_total: 36 # PoC #03 final (Phase 6) 후 +8~12 예상
ap_with_migration_advice: 21

formal_spec_artifacts: 69 # 29 (PoC #02 + sprint) + 40 (PoC #03 — 37 + .validation 3)
methodology_body_tools_added: 3 # drift-validator + decision-table-validator + static-runner

v120_bundles: 16 # A~P
v120_bundles_ready: 16 #  A~P 전체 — Sprint 4 N+O 인프라 산출 완료
이중_렌더링_정합_검증_도구: ✅ # drift-validator 자동화 / 본 세션 PoC #03 첫 외부 적용
이중_렌더링_드리프트_자동검출: PoC #02 → state-machine 7 breaking / PoC #03 → state-machine 17 breaking + sequence 3 breaking
신뢰도_정직표기:
  poc03_phase45: 0.80 #  단계 3 (자동 검증 통과 ✅ — drift 진짜 drift 0 + dmn 0)
  poc02_phase6: 0.96
  방법론_본체: 80-87% # 시뮬 패널티 유지 (실 static tool Sprint 5 carry-over)
신뢰도_목표_after_sprint5: 90-95% # 진짜 Semgrep/PMD 1회 실행 시

unit_tests_passing: 17/17 # drift-validator 6 + dmn-check 7 + static-runner 4
poc03_validation_first_external_application: ✅ #  본 세션 — drift 60% false positive (F-117 재발 = F-154) + dmn 5종 0 hit (BR 표 모두 통과)
poc03_phase_45_plus_1_diagram_fix: ✅ #  다이어그램 보강 8건 — 진짜 drift 0 도달 + 도구 한계 100% (Sprint 5 carry-over)
poc03_phase_5_1_api_complete: ✅ #  21 endpoint + Phase 4.5 cross-link 9/21 + F-164 critical ( Article 4 endpoint Auth 부재 신규)
poc03_phase_6_antipatterns_complete: ✅ #  11 AP + 4 composite view + Phase 4.5 cross-link 4/11 + F-161 positive
poc03_artifacts_progress: 6/7 #  7대 산출물 종결 — UI/UX 만 N/A / BE only

#  3 PoC 통합 (사내 표준 v1.3 격상 데이터 완비)
all_3_pocs_complete: ✅
cumulative_ap_3_pocs: 47 # PoC #01 15 + PoC #02 21 + PoC #03 11
v13_promotion_data_status: ' 완비 — 통합 보고서 archive/v1.3-adoption/v1.3-promotion-report.md (cleanup round 1 격리) + DEC-v1.3-격상-데이터-완비'
v13_promotion_candidates_count: 6 # AP-PERFORMANCE / Positive finding / NestJS 4 ADR / Phase 4.5 cross-link / migration-cautions NestJS / §8.1 정식
saa_application_ready: ✅ #  사내 적용 시작 가능 시점 v1.2.2
v13_release_blocker: 'Sprint 5 진입 의무 ( 환경 의존)'
ci_workflow_files: 1 # .github/workflows/drift-check.yml (drift + static dual mode)
```

---

## Phase 4.5 형식화 시범 (시퀀스 C) 핵심 결과

| Sprint | 핵심                                                                   | 정량                                                                                                  |
| ------ | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1      | BR-EMAIL-UNIQUE 4 산출물 / self-reference 함정 자가 시인               | drift 4건                                                                                             |
| 1.5    | Cross-validation + Static Analyzer **시뮬레이션** + Property test 명세 | drift +11건 / 신뢰도 60-70% → 80-87%                                                                  |
| **2**  | ** F-074 단방향 round-trip 검증 — 자연어 빈약성 44% → 100%**           | drift +19건 / **양쪽 발견 2건 (F-097 high `@Transactional` 부재 / F-098 high Equality on transient)** |

→ **묶음 L (Phase 4.5 정식 도입) 데이터 100% 충분 ✅**.

## v1.2.0 격상 묶음 합산 데이터 (16 묶음 A~P)

| 묶음   | 영역                                              | 외부 검증                                                                                                                                                                                   |
| ------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A      | cross-validation (F-015)                          | F-044 보강                                                                                                                                                                                  |
| B      | 정정 트레이스 (F-022 + F-024)                     | PoC #01 단독                                                                                                                                                                                |
| C      | severity 표준 (F-018)                             | PoC #01 단독                                                                                                                                                                                |
| D      | schema 진화 (F-025)                               | multi-module + Hexagonal 모듈 분리                                                                                                                                                          |
| E      | quality-extraction                                | PoC #01 단독                                                                                                                                                                                |
| F      | 신뢰도 공식 보강                                  | PoC #01 단독                                                                                                                                                                                |
| **G**  | OpenAPI x-extension (ADR-007)                     | **PoC #02 외부 검증 ✅**                                                                                                                                                                    |
| **H**  | multi-module 환경 / **Auth/Crypto 검증**          | **PoC #01+#02 isomorphic ** (AP-SECURITY-001 양 PoC 재현)                                                                                                                                   |
| I      | finding-system 정식화                             | PoC #02 메타 finding                                                                                                                                                                        |
| **J**  | Hexagonal port-adapter 가이드                     | **PoC #02 단독 신규** (F-075)                                                                                                                                                               |
| **K**  | multi-module Outside-in 모범 사례                 | **PoC #02 신규** (F-064/F-065/F-066 positive findings)                                                                                                                                      |
| ** L** | **Phase 4.5 형식화 정식 도입 (ADR-008/009)**      | **C-Sprint 1~3 누적 ✅ 100% — 정식 명세화 완료**                                                                                                                                            |
| **M**  | 방법론 본체 이중 렌더링 갭 해소                   | ** 갭 7건 모두 closed ✅** (P1 2건 Sprint 3 + P2-3 5건 v1.2.2) — api.template.md / phase-flow / ADR-009 / db-schema.template.md / meta-confidence.template.yaml                             |
| **N**  | Drift 자동 검증 도구 (CI)                         | **Sprint 4 적용 ✅** (drift-validator + decision-table-validator + drift-check.yml + 17/17 test pass + PoC #02 자가 검증으로 7+3 finding 자동 검출)                                         |
| **O**  | 진짜 외부 도구 실행 의무화 ()                     | **Sprint 4 인프라 적용 ✅** (static-runner Plugin host + Semgrep/PMD plugin + 5종 물증 schema enforcement + lint-no-simulation.sh). 실행은 Sprint 5 carry-over (Java/Semgrep/PMD 환경 부재) |
| **P**  | 안티패턴 migration_advice + migration-cautions.md | **Sprint 3 적용 ✅**                                                                                                                                                                        |

---

## Archive — session 31차 이하 cutoff (v8.13.2 cleanup / 2026-05-23)

> v8.13.1 carry 잔존 0 + paradigm 안정점 본격 재도달 후 archive cadence 시행 (DEC-2026-05-23-project-cleanup 정합 / 본 session 33차~36차 6 release 활성 보존 / session 31차 이하 본 archive 이전).

**기준일 보존**: 2026-05-18 ( **session 31차 (현 session) — v8.6.0 MINOR (R19 신설) + v8.6.1 MINOR (R20 MCP Ticket Sync Channel 신설) + v8.6.2 PATCH (R20 phase=enter stage 진입 시 의무 작업 Task 확장) + v8.6.3 PATCH (R20 구조 강제 / parent_ticket_id schema 의무 + link_type enum + jira_structure_add_issues 통합 + F-TICKETSYNC-002 missing_parent finding) — PoC-EFI 검증 cycle 1+2 + Tier 1 (ticket-binding policy) + Tier 2.5 (MCP delegation skill) + phase 분리 + hierarchy enforcement — 5 release** — 사용자 "**티켓은 스트럭쳐를 가져야 함**" + "티켓 관리자 에이전트가 있어야 되는 거 아냐?" → R20 channel 안 **4 layer 동시 강제** (policy + schema + skill + finding) / sub-agent 부재 결단 명시 (confirmation gate sub-agent 호환 ❌ + 결정론 axis 침범 위험 + YAGNI / v9.0+ MAJOR carry — ticket-platform-router / ticket-reconciler). **시행**: schema `mcp_invocations[].parent_ticket_id` + `link_type` enum (4 종) + `ticket_ref.structure_complete` + `structure_tree_url` (uri format) + epic_id/initiative_id minLength 1 / SKILL.md `jira_structure_add_issues` + `jira_structure_get` allowed-tools 추가 + phase=exit analysis 끝 step #5 jira_structure_add_issues (Initiative tree 등록) + planning step 1-6 parent_ticket_id= 명시 / ticket-policy.md §Tier 2.5 " Hierarchy 의무 (v8.6.3+ 구조 강제)" subsection (4 layer 동시 강제 / parent 의무 매트릭스 / F-TICKETSYNC-002 finding 정의) / 6 신규 회귀 test (89 → **95/95 pass**). **car 도메인 ticket 수**: 82 동일 (hierarchy = 메타 강제만 / ticket 폭증 ❌) + `jira_structure_add_issues` 1회 호출 (per release cycle). breaking 0 = PATCH. DEC-2026-05-18-r20-mcp-ticket-sync-channel §v8.6.3 확장.

**기준일 보존**: 2026-05-18 ( **session 31차 — v8.6.0 MINOR (R19 신설) + v8.6.1 MINOR (R20 MCP Ticket Sync Channel 신설) + v8.6.2 PATCH (R20 phase=enter stage 진입 시 의무 작업 Task 확장) — PoC-EFI 검증 cycle 1+2 + Tier 1 (ticket-binding policy) + Tier 2.5 (MCP delegation skill) + phase 분리 — 4 release** — 사용자 "단지 티켓 따는것 뿐아니라 각 단계에서 일감을 따는 부분도 필요하다" → R20 channel 안 phase × stage matrix 확장 (phase=enter / phase=exit). B (continuous emit) + C (BHV/AC 별 ticket) = 결정론 axis 침범 + ticket-policy.md §6 결단 위반 → ❌ / A (stage 진입 시 의무 작업 Task) = ✅ 채택. **시행**: ticket-policy.md §Tier 2.5 phase × stage matrix 재작성 + skill phase/uc_id/issuetype_enter 파라미터 + schema phase + uc_id + enter_task_ids field 추가 + 6 신규 회귀 test (83 → 89 pass) + DEC-r20 §확장 section + charter R20 entry 본문 update + CHANGELOG v8.6.2 entry. **car 도메인 7 UC 완주 시 ticket 수**: R20 기존 59 + A 확장 23 = 82 (enter Task analysis/planning 2 + spec/test/implement × 7 UC = 21). breaking 0 = PATCH. DEC-2026-05-18-r20-mcp-ticket-sync-channel §v8.6.2 확장.

**기준일 보존**: 2026-05-18 ( **session 31차 — v8.6.0 MINOR (R19 신설) + v8.6.1 MINOR (R20 MCP Ticket Sync Channel 신설) — PoC-EFI 검증 cycle 1+2 + Tier 1 (ticket-binding policy) + Tier 2.5 (MCP delegation skill) — 3 release** — PoC EFI-WEB IFRS 검증 (Spring 4.1 + iBATIS 2 + JSP / 23 도메인 / read-only) cycle 1+2 종결 후 사용자 마이그레이션 가정 ticket lifecycle 자동화 요구 escalation. **v8.6.0 04bd0a1** = Tier 1 (`methodology-spec/ticket-policy.md` + `decisions/DEC-2026-05-18-ticket-binding-policy.md` + `schemas/traceability-matrix.schema.json::ticket_ref` optional + `methodology-spec/id-conventions.md` §Ticket Binding + 6 회귀 test = 75/75 pass). **v8.6.1 (R20 신설)** = 사용자 "각 단계가 끝날때 마다 상태가 바뀌도 하고 신규 티켓이 생기기도 해야 해" + "나는 jira-confluence mcp 가 있고 이를 이용하고 싶어" → Tier 2.5 MCP delegation (R16/R17 부활 ❌ — DEC-2026-05-15-g1-itsm-permanent-scope-out §31 path "별도 charter 요구 신설 (R18+)" 정합 = 신규 R20 채널). **신규 자산**: DEC-2026-05-18-r20-mcp-ticket-sync-channel + `schemas/ticket-sync-evidence.schema.json` (7-field evidence + evidence_trust enum `real_tool|imported_sarif` / simulated 영구 거부) + `skills/ticket-sync/SKILL.md` (5 stage matrix + confirmation gate + sequential MCP / 결정론 보호 + search-first idempotency + graceful MCP-missing) + `traceability-matrix.ticket_ref.status_history[]` + `hooks/hooks.json` PreToolUse `mcp__wiki-jira-assistant__.*` deny-when-blocked + charter §1 R20 + §2 R20 + 요약 17/17 → 18/18 활성. **사용자 결단 5건 carry** (실 사용 시점): Jira workflow transition target IDs / Confluence emit 범위 / Auto-invoke 정책 / Idempotency / MCP 미연결 대응. 별도 cycle 회귀 검증 = poc-efi-web-1/ cycle 3 후보. breaking 0 = MINOR. DEC-2026-05-18-r20-mcp-ticket-sync-channel + DEC-2026-05-18-ticket-binding-policy + DEC-2026-05-18-runtime-tool-exclusion + DEC-2026-05-18-v85-p1-batch.

**기준일 보존**: 2026-05-18 ( **session 30차 — v8.5.0 MINOR (F-SKILL P1 8 finding batch + 1 ABORT + plugin-authoring-spec §2 S2 강화 + §6 digest baseline refresh) — 1 release** — 사용자 "다음 session 진입은 어떤 의제로?" → AskUserQuestion 4 option → "A. P1 9 finding batch (v8.5.0 MINOR / 권장)" → "진행 해줘" 시행 escalation. **4원칙 ladder full** (plan-v85-p1-batch.md + 2-에이전트 lightweight research [F-015 + Senior critique / 산업 비교 skip] + 사용자 묶음 결단 3 cluster + 시행). ** critical research finding (F-SKILL-016 ABORT)**: F-015 = `disable-model-invocation: true` 가 Claude 모든 invoke 경로 차단 ("Claude can invoke: No") → chain harness body 호출 차단 가능성 높음 → 사용자 결단 **ABORT → P2 carry** + 안전한 대안 `user-invocable: false` REVISE-2 carry. **시행** (additive / breaking 0 / 13 sites edited / 11 files): F-SKILL-001 (anchor §5 4영역 병렬 + 실 매핑) / 003 (4 analysis-\* Korean trigger) / 007 (template count 19→21 + LL-v85-01 drift carry) / 010 (5 skills NL trigger) / 013 (db-schema-erd inventory.json 사전조건) / 017 (§2 S2 per-field 1024-char) / 018 (§6 digest DELTA-1~5 + plugins DELTA-2 + **digest_sha 재계산** skills `b8b2376312b0`→`e2b44d9d0e53` plugins `b0e11058b05e`→`4498207cc547`) / 020 (§2 S2 third-person POV / A only / B audit 25 skills wording P2 carry). **차기 session carry surface 4종**: F-SKILL-016 REVISE-2 / F-SKILL-020-B / F-SKILL-007 drift sub-rule / v9.0 charter review 3종. STOP-3 9-gate ALL ✅. 5 LL 자산화 (LL-v85-01~05). breaking 0 = MINOR. DEC-2026-05-18-v85-p1-batch.

**기준일 보존**: 2026-05-18 ( **session 29차 — v8.4.1 PATCH (L3 skill audit + P0 3 finding corrective + F-SKILL namespace 신설) — 1 release** — 사용자 "나의 스킬들을 분석해 보고 싶다" → AskUserQuestion ×3 (축="품질 감사 (citations / drift / SSOT)" / 깊이="L3 + 산업 비교" / paradigm=Plan A 감사만 / F-SKILL namespace 신설) → 사용자 "진행 해줘" P0 시행 escalation. **L3 audit**: 4원칙 ladder 정합 — 1원칙 plan-skill-l3-audit.md + 2원칙 6 sub-agent 병렬 dispatch (B-shard 1~4 = 329 cell × 7 axis × 47 skill / `_base-official-docs-checker` F-015 Anthropic 공식 docs 7 URL fetch / `_base-industry-case-researcher` N=3 OSS anthropics/skills 136k stars) + `_base-senior-engineer` D7 synthesis → 31 CAND → **24 unified F-SKILL** (medium 4 / low 11 / info 9 / 8 ≥ 2 shard corroboration ✓ / Senior GO @ 0.86) + 3원칙 사용자 묶음 결단. 산출 = `.claude/plans/audit-skill-l3-report.md` (사용자 검토 entry-point) + 5 supporting + DEC-2026-05-18-skill-l3-audit-p0-corrective. **F-SKILL namespace 신설** (`methodology-spec/finding-system.md` / F-SIM/F-PA/F-MB 패턴 정합). **P0 3 finding 즉시 시행 (additive / breaking 0 / 12 sites edited / 9 files)**: F-SKILL-002 `_base-log-finding:15` ghost AP prefix → `id-conventions.md` §3 canonical 9 카테고리 + scope 확장 corroboration (`analysis-quality-antipattern:18` + `analysis-aspect-a11y:27` = 3 skill) / F-SKILL-004 `analysis-input-collection` `_base-` 누락 (2 sites) / F-SKILL-005 `_base/<name>` slash → `_base-<name>` dash 정규화 (Senior 5 chain skills → 실 grep 7 files 9 sites / 2 `_base-*` self-cite 추가 확인). ** 차기 session surface carry**: ① F-021 임계 unhealthy (24 ≥ 20 / actionable=15 caution band / Phase reset ❌ / plugin-authoring-spec S1~S8 maturity signal → v9.0 charter review) / ② skill-citation-validator coverage gap (validator recursive drift / F-SKILL-001+004+005 root) / ③ F-SKILL-024 meta (`_base-*` documented-exception drift attractor / v9.0 charter-level 결단). STOP-3: workspace 414/414·release-readiness **13/13 ready:true**·skill-citation 207 active doc 0 stale·drift 3-way·version 3-way 8.4.1. breaking 0 = PATCH. 7 LL 자산화 (LL-skill-audit-01~07). DEC-2026-05-18-skill-l3-audit-p0-corrective.

**기준일 보존**: 2026-05-18 ( **session 28차 — v8.4.0 MINOR (F-SIM corroboration #2 attained / poc-14 external-user simulation / P1 deadline 14d 전 이행 / 패러독스 해소) — 1 release** — 사용자 4 조건 (시뮬레이션 · 빌드 plugins · 기존 PoC ❌ · 사용자 시점 기록 · 사용 빈도+사용 못하는 경우) → plan ExitPlanMode 승인 → 시행)

**기준일 보존**: 2026-05-17 ( **session 26차 — v6.0.0 MAJOR (묶음 Q ②) + v6.1.0 MINOR (Q-①-followup) + v7.0.0 MAJOR (묶음 Q ⑦ rules.json→business-rules.json / 묶음 Q 완결) — 3 release** — [v7.0.0] 사용자 "하자" → 묶음 Q 잔여 ⑦ 단독 (최대 blast 642 occ·252 files) → "추천안 묶음 + 1-session 시행". 4원칙 full + STOP-3 hard gate. 3-에이전트 — official-docs(파일명=계약 시 MAJOR / $id 파일경로 독립 / 파일명 resolution 비표준) + industry(ESLint v9 파일명 rename=MAJOR / 외부 consumer 0=즉시 MAJOR 가장 가벼움 / "왜 vs 어디" 역사 분리) + Senior REVISE-3(schema key 실측 정정 3 $schema_ref·1 $schema_origin·7 무키 / D1 v7.0.0 MAJOR CONCUR artifact contract+literal consumer = Q-①-followup 결정적 차이 / D5 script ❌ classifier 제약 / STOP-3 신규 / 1-session validated). **결단** = D1 v7.0.0 MAJOR(사실 확정) / D2 Option A(rules.schema.json→business-rules.schema.json 동시) / D3 $id 정합 변경 / D4 역사 보존+활성 SSOT / D5 git mv 12 명령+분류별 Edit(script ❌) / D6 1-session+STOP-3 hard gate. **시행** = git mv 12 (11 PoC rules.json→business-rules.json + schemas/rules.schema.json→business-rules.schema.json / history-preserving R) + $id 정합 변경 + poc-04 $schema_origin value-edit + poc-01/02/03 $schema_ref honesty + 7 무키 fallback auto-correct + 코드 literal 3곳(findings-aggregator:83 / release-readiness:111,266). **   STOP-3 post-mv hard gate** 가  plan·research(Senior REVISE-3 포함 3-에이전트 src-만 봄) 누락 consumer = **6 test 파일 hardcoded `rules.schema.json`/`rules.json` literal**(ENOENT 9+) 검출 → 사용자 결단 "동반 수정 계속"(근본 결함 ❌ / test=활성 자산 / ⑦ 정당한 일부) → 6 test literal 치환 → 재검증 통과 =  LL-i-55 paradigm 본격 입증 (research 수렴 ≠ 코드 착수 충분 / 실측 hard gate=누락-안전망). gate 3/3 = schema-validator 11 PoC VALID + workspace **393/393** + release-readiness **11/11** + 역사(decisions/CHANGELOG/dist) 무수정 + breaking ✅의도 + chain harness validated 본질 보존. DEC-2026-05-17-q7-rules-json-rename + ADR §5.13 patch v16 + §9 **LL-i-57** + CHANGELOG v7.0.0 + INDEX 최상단 + plugin.json 6.1.0→7.0.0 + CLAUDE.md + 7 schema cross-ref + deliverables/skills 활성 SSOT.      **묶음 Q ①②④⑤+Q-①-followup+⑦ 전 항목 종결**. ───── [v6.1.0] 사용자 "1"(묶음 Q 잔여) → "Q-①-followup 먼저"(risk 오름차순 / 11 files / src consumer 0) → "추천안 묶음 + 지금 시행". 3-에이전트 가벼운 research 수렴 = D1 **v6.1.0 MINOR 사실 확정**(choice ❌) — official-docs(semver spec MAJOR 강제 ❌ / public API 경계=프로젝트 재량) + industry(zero-consumer 실용주의 + 연속 MAJOR signal 희석 batch 통설) + Senior REVISE-2(src consumer 0 + poc-04 단일 holder atomic 동시 마이그레이션 = textbook MINOR additive-equivalent / v7.0.0 = semver inflation = 역방향 integrity drift / ① "MINOR=drift"는 alias 폐기+real consumer 한정 / LL-i-52 'semantic-rename≠alias 폐기' → version tier 분리). 시행 = rules.schema.json property `rules_auto_extracted_reference`→`auto_extracted_br_refs` + 최상단 title/description forward-pointer **재작성**(carry→완료 / Senior 누락 보정 = schema 자체 forward-pointer active SSOT) + poc-04 유일 holder atomic key rename + drift-validator canonical-single-alias.test.js 보존→rename후 보존+구명 재유입 0 전환(② businessRule anyOf guard 비교란 확인 = 8/8).  lightweight process = LL-i-54 정당(breaking 동형 ≠ 비용 동형 / 11 file·src consumer 0·순수 rename → full Phase-3 과함 / ① DEC §1#4 문자적 일탈 DEC 명시). 회귀 = poc-04 schema VALID + drift canonical **8/8** + release-readiness 11/11(목표) + MINOR=additive-equivalent(breaking 호칭 ❌ / semver 정합). DEC-2026-05-17-q1-followup-rename + ADR §5.12 patch v15 + §9 **LL-i-56**(scope 분리=version tier 분리 동반 / 일괄 MAJOR=semver inflation) + CHANGELOG v6.1.0 + INDEX 최상단 + plugin.json 6.0.0→6.1.0 + CLAUDE.md. 묶음 Q 잔여 = **⑦ 단독**(rules.json→business-rules.json / 642 occ·252 files / 별도 session + 4원칙 full + cooling-off). ───── [v6.0.0] 선행 (A) stale drift 정정 (memory project_session_22_23_state entry-point sync / git 실측 = v5.0.0 commit·tag·push 완료 확인 = session_handoff_drift). 사용자 "권고를 따를게"(추천안 전부 채택) → 묶음 Q 잔여 ②⑦ risk 오름차순 첫 ②. 4원칙 full — plan + 3-에이전트 research (official-docs anyOf 4→2 description-only INVALID·branch 제거≠property 금지·semver MAJOR 전 VERIFIED / industry-case Cucumber·DMN·OpenAPI 3 독립표준 "free-text 보조/structured 정식" 수렴·dogfooding 즉시시행 정당·반례 Concordion 소수 / Senior REVISE-2 →  close round CONCERN D2 보정) + STOP-1 dry-run 실측 + 사용자 결단. **결단** — D1 description anyOf branch 제거+property optional metadata 보존 / D2 TCA branch 제거+trigger·condition·action·expected_result·rejection_method·verification_location property canonical 보존 ( Senior close round 실소스 — decision-table-validator json-sanity.js expected_result·verification_location REQUIRED_ALWAYS / rejection_method REQUIRED_IF_API + synthesize-gwt-from-tca.mjs = load-bearing consumer → hard-remove ❌) / D3 #06 7 BR 합성 전체 gate / D4 v6.0.0 MAJOR(사실 확정) / D5 지금 시행 / D6 ② 단독. **   STOP-1 해소** = 코드 착수 전 dry-run 실측 (`_q2-dryrun.mjs` / no-simulation) — 전 11 PoC 중 #06 7/7 description-only 가 유일 / TCA-only 0 / 그 외 100 BR 전부 GWT|NL → #06 7 BR NL+GWT 합성 (Sonnet 4.6 batch + 독립 Opus spot-check 4/7 KRW-001·DECIMAL-003·CALCFN-007·COMMA-004 EFI-WEB 원본 line 대조 일치 / echo-chamber 회피) 후 재실측 descOnly=0·tcaOnly=0 = 회귀 면 7 BR(1 PoC) 전부 coverage 증가 = **회귀 아닌 개선 확정** (LL-i-53 / ① poc-04 precedent 동형). **시행** = rules.schema.json `$defs.businessRule.allOf[0].anyOf`4→2(GWT+NL ONLY)+$comment+businessRule/최상단/description property 텍스트 v6.0.0 / description·trigger·condition·action property 보존 / deterministic.js representation_missing 조건`!hasNL&&!hasGWT`+description_only_fallback(low) 폐기→critical 격상(Senior "surfaces louder") / test = chain-schemas 2 accept→REJECT 전환+2 functional VALID 신설 + validator description_only_fallback→representation_missing critical 전환+#06 corpus==7 guard + drift canonical ② anyOf 2 branch+재유입 0+property 보존 3 신설. 영향 3 패키지 = schema-validator 18/18+br-cross-consistency 32/32+drift canonical 8/8 = **58/58 pass** (functional REJECT 4 = vacuous 아님 실증 / #06 guard = 합성 결함 은폐 inverse 차단). ADR §5.11 patch v14+§9 LL-i-54·55+DEC-2026-05-17-q2-br-표현-4to2+INDEX 최상단+CHANGELOG v6.0.0+plugin.json 5.0.0→6.0.0+CLAUDE.md sync. 회귀 = release-readiness **11/11**(목표)+breaking ✅의도+chain harness validated 본질 보존. 묶음 Q 잔여 ⑦+Q-①-followup = breaking carry.)

**기준일 보존**: 2026-05-17 ( **session 25차 — v4.1.0 MINOR (Phase 2 ⑤) + v4.1.1 PATCH (묶음 Q ④) + v5.0.0 MAJOR (묶음 Q ① alias 4중첩 폐기) — 3 release** — v5.0.0 추가 = 사용자 "1"(묶음 Q 잔여 ①②⑦) → risk 오름차순 첫 ① alias 4중첩 폐기. 4원칙 full (plan + 3-에이전트 research + Senior STOP-1 blocking·STOP-2 cooling-off + 사용자 결단 4건). 결단 — #1 지금 시행(cooling-off 사용자 명시 생략) #2 (A)hard 폐기(외부 consumer 부재/dogfooding) #3 summary alias ① 동반 #4 rules_auto_extracted_reference ① scope 외(Q-①-followup carry) / version=v5.0.0 MAJOR 사실 확정(official-docs VERIFIED semver/anyOf) / scope-completion 투명 명시 br_summary 포함(LL-i-52). 시행 = rules.schema.json anyOf 3분기 폐기→required:[business_rules] + 5 alias property 제거(additionalProperties:false hard reject) + 4 PoC 5 key rename(Edit per-file / bulk script=auto-mode 차단→per-file 안전 mechanism) + extractRules canonical 단일. STOP-1 해소 실측 = poc-04 3 BR canonical br-cross-consistency = findings 3 전부 low/critical·high 0/gate pass → 가시화=회귀 아닌 개선 확정(LL-i-53/OpenAPI 3.1 precedent). test 5 fix(alias-accept→alias-REJECT)+6 신설(drift canonical-single guard 5+FE-canonical 1). 회귀 = workspace 381→**387/387**+release-readiness **11/11**+breaking ✅의도+chain harness validated 본질 보존. ADR §5.10 patch v13+§9 LL-i-52·53+DEC-2026-05-17-q1-alias-4중첩-폐기+CHANGELOG v5.0.0+plugin.json 4.1.1→5.0.0. 묶음 Q 잔여 ②⑦+Q-①-followup = breaking carry. ───── [v4.1.1] 사용자 "1"(묶음 Q) → risk 비균등 실측 (① 2 PoC / ② poc-06 7 BR 합성 / ④ additive / ⑦ 265 file) → "④만 먼저 (additive)" 결단 → `methodology-spec/severity-cross-stage-mapping.md` 신설 (rules 5종↔ratchet 4종↔MoSCoW 3종 단일 SSOT / 사용자 매핑 3결단 high→must·info→nice·신규 doc SSOT) + rules.schema·acceptance-criteria.schema $comment cross-ref (ajv inert) + glossary pointer + DEC-2026-05-17-severity-cross-stage-mapping + CHANGELOG v4.1.1 + plugin.json 4.1.0→4.1.1. ①②⑦ = breaking → 별도 session+ cooling-off carry. 회귀 0 (workspace 381/381 / release-readiness 11/11 / schema 기능·데이터 변경 ❌). ───── [v4.1.0] session 25차 진입 시 STATUS drift 청산 (session 20→24 stale / LL-i-46+47 ADR §9 자산화 / ADR §11 후속 list sync carry 등재) → 사용자 "Phase 2 ⑤ 진입". 4원칙 — plan + 3-에이전트 research (Senior CONCUR+조건2+STOP-1 / official-docs if/then VERIFIED / industry-case SARIF·Semgrep·OPA·Spectral 분리 우세 + intent-vs-bug 강제 보존 precedent 부재=novelty) + 사용자 결단 4건 추천안 묶음 + 시행. **결단** — #1 정제된 옵션 C (heavy 실행데이터 layer-2-results/ 분리=산업표준 + BR 안 slim provenance-tagged marker=Semgrep metadata: 패턴) / #2 schema if/then 강제 ( 코드 착수 전 실측 both=0 → 전 PoC vacuous = 회귀 풀이 0 수학 보장 / Senior 조건2 해소) / #3 v4.1.0 MINOR / #4 ⑤ 단독. **시행** — rules.schema.json 2변경 (cross_consistency_check slim 객체 + is_intent⇔classification 양방향 동치 if/then 2블록) + test 17 신설 ( schema-validator functional 11 = if/then 모순 실제 거부 입증 / drift-validator 구조 6) + ADR §5.9 patch v12 + §9 LL-i-51 + DEC-2026-05-17-phase-2-5-cross-consistency-check + INDEX + CHANGELOG v4.1.0 + plugin.json 4.0.1→4.1.0 + CLAUDE.md + deliverables 5 §4.2. **회귀** — workspace 364→**381/381 pass** (신규 17 / 0 fail) + release-readiness **11/11 release-ready** + chain harness validated 본질 보존 / 0 회귀. STOP-1 advisory 해소 (verdict consumer unknown-fatal 부재).

**기준일 보존**: 2026-05-17 ( **session 24차 — 묶음 P prereq 전 chain 종결 ( no version bump / carry only / push)** — 사용자 결단 "묶음 P 해줘" → Sprint 1~3 자율 시행 + gate 결단 3건. **Sprint 1** (schema cleanup / 10 sub-sprint) = 전체 11 PoC rules.json schema VALID + release-readiness `analysis_validator_violation` criterion PoC #01+#05 한정 → 전체 11 PoC auto-discover 전수 격상 (Sprint 1-J = pre-pre-prereq 사각지대 PoC #03 76 errors 계획 외 발견 즉시 보정 / LL-i-46). **Sprint 2** (dual representation / 4 PoC 30 BR) = #02·#04 GWT→NL + #08·#10 NL→GWT additive. **Sprint 3** (Layer 2 LLM / 4 PoC 8 dispatch) = Sonnet 4.6 phase-c + Haiku 4.5 blind retrospect → Layer 2 corroboration **7 PoC 도달** (poc-01/02/03/04/05/08/10 / Phase 2 prereq ≥7 충족). **핵심 발견 = PoC #08 echo-chamber drift** (Sprint 2 GWT 합성 Sonnet 이 is_likely_bug 무시 → PASSWD-006 보안버그 + ORDQRY-005 N+1 정상규칙 정규화 / 동일모델 Sonnet Layer 2 미검출 0.93·0.90 / 독립 Haiku blind 검출 0.55·0.58 = industry-first + Adzic SBE 함정 회피 자격 본격 실측 / LL-i-47 / 처분 = rules.json 변경 ❌ / C-poc08-drift carry). Phase 2 ⑤ 사용자 결단 3건 (#1 보류·별도 session / #2 확정 제약 "분류 보존 강제 포함" 재논의 ❌ / #3 push carry only 18 commit / version bump ❌). DEC-2026-05-17-묶음-P-prereq-종결-phase2-5-보류 + INDEX 등재 + LL-i-46+47 자산화. release-readiness **11/11** + workspace **364/364** + chain harness validated 본질 보존 / 0 회귀.

**기준일 보존**: 2026-05-17 ( **session 23차 — Sprint 1-A 시범 진입 ( no release / carry only)** — 사용자 STRONG-STOP 점검 발화 "drift 없이 가고 있는가? 최초 목적?" 흡수 → 회고 후 "continue — Sprint 1-A" 결단. PoC #06 7 BR ID 4토막 strict 마이그레이션 (BR-EXCHANGE-NNN → BR-EXCHANGE-{KRW/COMPLETE/DECIMAL/COMMA/ANNUAL/GUBUN/CALCFN}-NNN / sub-domain 토막 Sonnet 4.6 sub-agent 자동 합성) + cross-ref 13 file 일괄 갱신 (old ID 잔존 0) + PoC #06 schema-validator INVALID 7 → VALID. 사용자 의제 본격 재정의 — 본 plugin 본격 정체성 = paradigm 자체 입증 (industry-first claim 강화) / 본격 사용자 부재·사용 시점 멀음 / 본격 의제 = Layer 2 LLM corroboration ≥ 7 PoC 도달 (Adzic SBE 함정 회피 자격) / "P 먼저" 결단. commit 70704c2.

**기준일 보존**: 2026-05-17 ( **session 22차 — v4.0.1 PATCH release — rules schema enforcement 강화** — 3-에이전트 research 후 사용자 "추천으로 해줘" 4 결단 묶음. ③ source_grounded_evidence required (auto_extracted=true 한정 / if-then schema) + ⑥ intent_vs_bug_classification 공유 $ref SSOT 신설 (schemas/intent-classification.schema.json) + H-1 (Gherkin tag 표기 수정) + H-2 (Maldonado 인용 오류 수정 / SATD 5 분류 명시). ⑤ cross_consistency_check inline = carry (PoC 적용률 3/14 시기상조 / ≥7 PoC 후 재평가 → 묶음 P prereq source). additive only / breaking change ❌. DEC-2026-05-17-rules-schema-enforcement-strengthen + ADR-CHAIN-011 §5.8 patch v11. drift-validator 신규 5 test (57/57) / workspace 359 → 364/364 / release-readiness 11/11 / chain harness validated 본질 보존. commit 02258da.

**기준일 보존**: 2026-05-17 ( **session 21차 — v4.0.0 MAJOR release — multi-agent paradigm 본격 채택 / DEC-2026-05-15-g5 retract** — plan-skill-invocation-guarantee §B5 옵션 A (사용자 "A로 해줘"). stage 별 sub-agent 5종 신설 (agents/{analysis,planning,spec,test,implement}-agent.md) + 3 base agent 병존 + spike agent archive 이동 (C-3 carry). main agent = orchestrator (skill 직접 호출 ❌ 권고 / Task tool 로 stage agent dispatch) / frontmatter `skills:[...]` 사전 주입 paradigm. lifecycle-contract §Agent column 재작성 + chain-driver hooks-bridge 격상 + agents/README 정책 재작성. DEC-2026-05-15-g5 retract. DEC-2026-05-17-v4-multi-agent-paradigm-채택 (source = DEC-2026-05-17-spike-planning-agent-실험 / archive/v4-spike/). C-1+C-3 본격 흡수 / C-2 (PoC 재실행) + C-4 (design agent) = 후속 carry. plugin.json 3.6.9 → 4.0.0.

**기준일 보존**: 2026-05-16 ( **session 20차 — v3.6.9 PATCH release — A3 시행 / README.md + guides/ 외부 인지 자산 본격 sync (v2.5.1 → v3.6.9)** — 옵션 3 (A2 + A3 묶음) 2번째 / 본 session 마지막 release / 핵심 헤더 갱신 우선 + 본격 본문 재작성 carry / README.md (version 헤더 + 현재 사실 + §8.1 strict 자격 7 → 11 + 자격 목록 4 추가 + install URL + dist artifact path + CHANGELOG cross-link) + guides/ 4 file (README + chain-harness-guide + common-errors + getting-started) 헤더 + 갱신 이력 라인 v3.6.9 entry 추가 / guides/first-prompt-cookbook = paradigm 진화 영향 적음 / plugin.json 3.6.8 → 3.6.9 + CLAUDE.md sync + CHANGELOG v3.6.9 entry + LL-session-20-A3-1 자산화 (외부 인지 자산 drift 누적 잠재 / 12th criterion 후보 `external_doc_version_sync`) / session 20차 = R1+R2+R3+R4+A1+A2+A3 = 7 잔여 결단 + 다음 의제 모두 시행 완료 / v3.6.3~v3.6.9 = **7 release 묶음**

**기준일 보존**: 2026-05-16 ( **session 20차 — v3.6.8 PATCH release — A2 시행 / INDEX.md 본격 archive (session 14차 이전 의사결정 분리)** — 다음 의제 옵션 3 (A2 + A3 둘 다 진행) 2개 묶음 / A2 = INDEX.md cutoff 결단 (session 14차 이하 111 DEC → INDEX-HISTORY.md 137 라인 신설 / session 15차 이후 4 DEC = R4 + G3 + plugin-charter + v2.5.0 final 보존) + INDEX.md 149 → 31 라인 (79% 절감) + Archive cross-link section 신설 / CHANGELOG.md 추가 archive 보류 (이미 v2.4 이전 = CHANGELOG-HISTORY.md 안 archive / v2.6~v3.6.x 사용자 가시화 자산 보존) / plugin.json 3.6.7 → 3.6.8 + CLAUDE.md sync + CHANGELOG v3.6.8 entry + workspace test 359/359 ✅ + release-readiness 11/11 ✅

**기준일 보존**: 2026-05-16 ( **session 20차 — v3.6.7 PATCH release — A1 시행 / release-readiness 11th criterion 신설 (workspace test 회귀 자동 차단) + R2 test 회귀 동시 fix** — 다음 의제 R1 ("release-readiness 11th criterion 신설") 채택 / session 20차 v3.6.3 P0 회귀 (chain-driver Windows path 2 fail) = 본 criterion 부재 = drift 누적 사례 정합 / `scripts/release-readiness.js` 안 `check11_workspaceTestPass` 신설 + `--skip-workspace-test` flag (test cadence 안 사용 / release 본격 시행 시 본 flag ❌ 의무) + Windows EINVAL fix (shell:true) + NODE_TEST_CONTEXT env 제거 (child inherit 회피) + timeout 600s / 동시 R2 회귀 fix (`release-readiness.test.js` 안 9 → 11 expectation 갱신 + ids array 신규 2 추가 + SKIP_WS flag + 신규 A1 본격 spawn case 1) / plugin.json 3.6.6 → 3.6.7 + CLAUDE.md sync + CHANGELOG v3.6.7 entry + LL-session-20-A1-1+2+3 자산화 / workspace test 359/359 ✅ + release-readiness 11/11 ✅ + release-readiness test 11/11 ✅

**기준일 보존**: 2026-05-16 ( **session 20차 — v3.6.6 PATCH release — R4 시행 / PoC #12 + #13 보류 처분 자산화** — 잔여 결단 R4 (session 20차 carry / 마지막 잔여 결단) 시행. 사실 확인 = 둘 다 README.md 만 존재 / `.aimd/` 부재 / chain harness output 0 / prelim 자산 + README 안 "(B) 정책 완화 회귀" 추천 명시 → 옵션 (c) "보류 + (B) 정책 완화 회귀 처분 자산화" 채택 (옵션 (a) 본격 시행 plan + (b) 사내 적용 가이드 + (d) 별도 session 거절) / 근거 4종 (정탐 결과 정합 + ADR-CHAIN-008 strong corroboration 자격 도달 / PoC #06~#11 6 PoC 누적 + 비용 vs 가치 + paradigm 진화 안정점 정합) / `examples/poc-12-rawsql-userdecided/README.md` + `examples/poc-13-querydsl-userdecided/README.md` status = "보류" 명시 + `decisions/DEC-2026-05-16-r4-poc-12-13-보류-자산화.md` 신설 (SSOT) + `decisions/INDEX.md` 역시간순 가장 위 entry 추가 + plugin.json 3.6.5 → 3.6.6 + CLAUDE.md 라인 99 sync + CHANGELOG v3.6.6 entry / **session 20차 = R1+R2+R3+R4 4 잔여 결단 모두 시행 완료** / v3.6.3 + v3.6.4 + v3.6.5 + v3.6.6 = 4 release 묶음 (모두 tag + push 완료)

**기준일 보존**: 2026-05-16 ( **session 20차 — v3.6.5 PATCH release — R3 시행 / STATUS.md 본격 archive (session 14차 이전 분리)** — 잔여 결단 R3 (session 20차 carry / STATUS.md 1871 → 80 라인 / 95.7% 절감) 시행. 옵션 (a) "session 15차 이전 archive / paradigm 진화 분기 cutoff" 채택 (옵션 (b) 강력 + (c) v3.x 기준 + (d) 별도 session 거절) / `decisions/STATUS-HISTORY.md` 신설 (1807 라인 / intro + session 14차 header 23 + session 14차 이전 body 1769) / `decisions/STATUS.md` cleanup (라인 1~22 보존 header + Archive cross-link + 라인 50~101 session 15차 body = 80 라인) / context load 비용 ~96K → ~4K 토큰 절감 / plugin.json 3.6.4 → 3.6.5 + CLAUDE.md 라인 99 v3.6.5 sync (R2 cadence 정합) + CHANGELOG v3.6.5 entry + LL-session-20-06+07 자산화 (STATUS 비대화 = 매 conversation context load 누적 비용 / archive cutoff = paradigm 진화 안정점 자연 분기 활용)

**기준일 보존**: 2026-05-16 ( **session 20차 — v3.6.4 PATCH release — R2 시행 / release-readiness 10th criterion 신설 (CLAUDE.md drift enforcement)** — 잔여 결단 R2 (LL-session-20-02 정합 / CLAUDE.md drift 회피 cadence 정식화) 시행. 옵션 (a) release-readiness 10th criterion 신설 채택 (옵션 (b) PostCommit hook 자동 commit risk + (c) 매뉴얼 양심 의존 거절) / `scripts/release-readiness.js` 안 `check10_claudeMdVersionSync` 신설 + main results array 등록 + header 명세 9→10 자격 갱신 / 즉시 검증 = drift 즉시 검출 (`"plugin.json v3.6.2" ↔ plugin.json=3.6.3`) → CLAUDE.md 라인 99 + plugin.json 3.6.3→3.6.4 sync → **10/10 release-ready** ✅ / 별도 plan-mode plan 자산 (`~/.claude/plans/keen-sleeping-dragonfly.md`) = R1 plan (commit 후 carry) / R2 = direct 진행 (사용자 결단 위임) / LL-session-20-04+05 자산화 (drift enforcement criterion paradigm + paradigm 진화 안정점 후 enforcement cadence 진입 자격)

**기준일 보존**: 2026-05-16 ( **session 20차 — v3.6.3 PATCH release — 점검 + P0 회귀 2건 복구 + CLAUDE.md drift 갱신 + INDEX.md 진행중 결정 2건 이전** — 사용자 명시 "점검해 보자" → 4 영역 점검 (본체 자가 정합 + CLAUDE.md drift + STATUS/INDEX 비대화 + 잔여 carry/다음 의제) / critical 회귀 2건 발견 + 즉시 복구: (1) release-readiness `analysis_validator_violation` ❌ (PoC #01 + #05 rules.json /meta `additionalProperties` violations) → `meta-confidence.schema.json` 안 v3.x 진화 필드 10종 (`source_branch` / `extraction_env` / `raw_confidence` / `expected_confidence_average` / `sample_mode` / `corroboration_eligible` / `sample_mode_rationale` / `phase_b_migration_note` / `phase_d_meta_recovery_note`) 정식 등록 → ✅ 9/9 release-ready 회복 (2) `tools/chain-driver/test/scope-dir.test.js` Windows path 회귀 (Unix `/` 하드코딩 vs Windows `\`) → `join('/root', '.aimd', ...)` platform-aware fix → ✅ 114/114 회복 / workspace 전체 test 359/359 ✅ + release-readiness 9/9 ✅ / CLAUDE.md 본격 갱신 ( v2.6.0 시점 → v3.6.2 / schemas 13 → 39 / tools 12 → 16 / PoC 4 → 14 / plugin-charter SSOT + lifecycle 매트릭스 + FE skill 4종 + orchestrate 5종 + scope/stage 폴더 신설 자산 반영) / INDEX.md "진행중 결정" 2건 (DEC-2026-04-30-v1.2.3 + DEC-2026-04-29-phase-4-5) 모두 후속 release 안 흡수 완료 명시 → "(없음)" 표기 + 사유 명시 / session 20차 = 점검 carry session = v3.6.3 PATCH 자격 (사용자 결단 영역))

**기준일 보존**: 2026-05-15 ( **session 19차 (paradigm 진화 완료점) — v3.6.2 PATCH release — 잔여 carry 묶음 정리** — 사용자 명시 결단 "carry 다 제거" / C1 G6 영구 scope-out (G1 sibling) + C2/C3/C4 라벨 제거 (paradigm history DEC+LL 보존) + C5/C6/C7 PoC 라벨 제거 (PoC session 진입 시 새 결단) / DEC-2026-05-15-carry-cleanup-paradigm-종결 + LL-cleanup-01~02 자산화 / plugin.json 3.6.1 → 3.6.2 + CHANGELOG v3.6.2 entry / plugin must-have 자산 + paradigm 진화 **안정점 도달 명시** / session 19차 = 3 release (v3.6.0 G1 scope-out + v3.6.1 cross-link 보강 + v3.6.2 carry 정리))

**기준일 보존**: 2026-05-15 ( **session 19차 — v3.6.1 PATCH release — carry C10+C8+C9 묶음 (cross-link 문서 보강)** — G5 paradigm 강화 / `tools/spectral-runner/README.md` 호출자 정정 (auto-invoke ❌ / G2 LL-G2-06 정합) + `agents/README.md` 신설 (3 base agent persona 책임 명시 + 본 매트릭스 §Agent column cross-link) + `tools/README.md` 본 매트릭스 §Tool/Validator column cross-link 1줄 + plugin.json 3.6.0 → 3.6.1 + CHANGELOG v3.6.1 entry — session 19차 = v3.6.0 MINOR (G1 영구 scope-out) + v3.6.1 PATCH (cross-link 보강) 2 release)

**기준일 보존**: 2026-05-15 ( **session 19차 — v3.6.0 MINOR release — G1 영구 scope-out / charter Gap 모두 청산** — R16/R17 ITSM/Jira 자동 티켓화 영구 폐기 (사용자 명시 결단 "G1 안해도 됨 잊어줘") / charter §1 R16/R17 strikethrough + scope-out (번호 보존) / §2 요약 활성 15/15 자산 대칭 + scope-out 2 / §3 G1 strikethrough + 영구 폐기 / plugin.json 3.5.0 → 3.6.0 / CHANGELOG v3.6.0 entry / DEC-2026-05-15-g1-itsm-permanent-scope-out + memory feedback_itsm_g1_permanent_scope_out 자산화 (향후 재제안 회피 의무) / LL-G1-01~02 / charter §3 활성 Gap **모두 청산** = plugin must-have 자산 대칭 본격 도달)

**기준일 보존**: 2026-05-15 ( **session 18차 — v3.5.0 MINOR release — G5 종결 (lifecycle 자산 매핑 매트릭스 단일 SSOT)** — charter §3 G5 (R12 lifecycle stage↔asset 매핑표 부재) 종결 / `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스 신설 (본 매트릭스 stage × asset 5 column × 8 row + 부 매트릭스 R8 입력 6 row + Scenario cross-link + 사용 가이드) + 사용자 결단 (column 5 OK / row = 단일 + 부 매트릭스 분리 / v3.5.0 MINOR) + plugin.json 3.4.0 → 3.5.0 + CHANGELOG v3.5.0 entry + DEC-2026-05-15-g5-lifecycle-asset-matrix-종결 + plugin-charter §1 R12 ⚠️→✅ + §2 요약 ✅ 14 / ⚠️ 1 / ❌ 2 + §3 G5 종결 (잔여 charter Gap = **G1 단독 / 후순위**) + LL-G5-01~02 자산화 / ** 본 session = charter §3 활성 Gap 모두 종결 / G1 만 후순위로 잔존**)

**기준일 보존**: 2026-05-15 ( **session 17차 — v3.4.0 MINOR release — G4 종결 (FE skill 보강) — 후보 C 채택** — charter §3 G4 (R14 BE/FE 자산 비대칭) 종결 / `implement-react` + `implement-vue` + `test-playwright` + `analysis-html-template` 4 skill 신설 + `html-template-extract.schema.json` 신설 + 5 test pass (workspace 45/45) + `test-generate-test-spec` 본문 분기 추가 (RTL React 19 / Vue Test Utils Vue 3 / Playwright 위임 reference) + Senior critique STOP-2 (B4 진짜 도구 의무 + LL-G4-03 schema marker) 흡수 + 2원칙 research 4 정정 (React 19 forwardRef / class 분기 보존 / userEvent v14 async / Playwright POM assertion 분리) + 사용자 결단 (후보 C / Vue 3 only / scriptlet 0 absolute / 신규 phase template-analyze) + plugin.json 3.3.0 → 3.4.0 + CHANGELOG v3.4.0 entry + DEC-2026-05-15-g4-fe-skill-track-종결 + plugin-charter §2 R14 ⚠️→✅ + §3 G4 종결 (잔여 G5 > G1) + skills-axis analysis 27→28, implement 2→4, test 3→4 + flows 3 갱신 — LL-G4-01~05 자산화)

**기준일 보존**: 2026-05-15 ( **session 16차 — v3.3.0 MINOR release — G2 종결 + G3 사후 정식 entry** — charter §3 G2 (R8 입력 5종 중 BCDE 미지원) 종결 / `analysis-input-orchestrate` + `analysis-from-{prompt,swagger,plan-doc,figma}` 5 skill + 5 schema 신설 + 25 test pass (workspace 40/40) + orchestrator paradigm (Hybrid 2-B + 2-A escalate / cross-ref + conflict 3-tier 정량 산식) + Senior critique STOP-1 (chain-driver dispatch STRONG-STOP 회피) + REVISE-3 본격 흡수 (escalate rule + schema contract + conflict 정량) + 사용자 3 메타 지적 흡수 (LL-G2-01/02/03 + LL-G2-04 chain-driver axis 오염 회피 + LL-G2-05 LLM 양심 회피 + LL-G2-06 auto-invoke 정책) + plugin.json 3.1.0 → 3.3.0 (v3.2 G3 + v3.3 G2 통합 bump) + CHANGELOG v3.2.0 (G3 사후 정식) + v3.3.0 (G2) entry + DEC-2026-05-15-g2-orchestrate-skill-분리-채택 + plugin-charter §2 R8 ⚠️→✅ + §3 G2 종결 표기 (잔여 G4 > G5 > G1) + skills-axis analysis 22 → 27 + workflow/input.md 3중 양립 paradigm + flows/analysis.phase-flow.json phase 0 skill mapping)

**기준일 보존**: 2026-05-14 ( **session 15차 — v2.5.0 MINOR FINAL release — Phase D 본격 종결 ✅ — ≥ 2 PoC corroboration 본격 입증 + Adzic SBE 함정 회피 자격 본격 도달 + industry-first paradigm 본격 입증 + chain harness validated 본질 보존 ✅** — release-readiness 8/8 → 9/9 격상 ( layer_2_consistency criterion 신설 / per-PoC mean ≥ 0.7 + critical/high drift 0 / additive change paradigm) + regression 회복 ( session 11차 phase B `input/ → output/rules/` 회귀 회복 / release-readiness.js 3 경로 갱신 + PoC #05 rules.json meta 표준 필드 회복) + ≥ 2 PoC corroboration 자산화 ( PHASE-D-2026-05-14-corroboration-final.md / 31 BR / overall_score mean 0.921) + drift BR 2건 DRIFT 격상 자산 ( PHASE-D-2026-05-14-drift-domain-review.md / BR-AUTH-JWT-002 + BR-USER-DELETE-AUTH-001 / 사용자 결단 (2) / rules.json 변경 ❌ / Senior REVISE-3) + plugin.json 2.4.1 → 2.5.0 + br-cross-consistency-validator 0.1.0 → 0.2.0 + chain-driver 0.1.0 → 0.2.0 + CHANGELOG v2.5.0 entry + DEC-2026-05-14-v2.5.0-minor-final + ADR §9 LL-i-44+45 + §11 patch v9 + workspace 312/0 + scripts/test 10/10 = 322/0 pass — v2.5.0 release commit + git tag v2.5.0 + origin push)

## Archive

> session 14차 이전 entry + 그 이전 session body 모두 → [`STATUS-HISTORY.md`](STATUS-HISTORY.md) 이전 ( R3 / v3.6.5 / paradigm 진화 안정점 분기 cutoff).

---

                   **본 session 2026-05-17 session 25차 — v4.1.0 MINOR release — Phase 2 ⑤ cross_consistency_check 신설**:

- ✅ **carry trigger** = DEC-2026-05-17-묶음-P §3 #1 (⑤ 보류·별도 session / ≥7 PoC 재평가 trigger 충족) + 사용자 결단 "Phase 2 ⑤ 진입"
- ✅ **선행 = STATUS drift 청산** (사용자 결단 "STATUS drift 먼저 청산") — STATUS.md session 20→24 stale sync + ADR-CHAIN-011 §9 LL-i-46+47 자산화 + ADR §11 후속 list sync = carry 등재 (`C-adr-chain-011-§11-후속-list-sync`)
- ✅ ** 4원칙 1단계 plan** = `.claude/plans/plan-phase2-5-cross-consistency-check-inline.md`
- ✅ ** 4원칙 2단계 3-에이전트 research** = `.claude/research/research-phase2-5-cross-consistency-check.md`:
  - Senior — CONCUR + 조건1(provenance discriminator) + 조건2(both=0 grep 실측) + STOP-1 advisory(verdict enum) + Q5(⑤ 단독)
  - official-docs — if/then+properties = 값 기반 cross-field 유일 공식 메커니즘 VERIFIED / SARIF result↔rule 분리 표준 VERIFIED
  - industry-case — SARIF·Semgrep·OPA·Spectral 분리 우세 / OpenSpec #666 inline 강제 역사례 / intent-vs-bug 강제 보존 precedent 부재 = novelty
- ✅ ** 코드 착수 전 실측 (Senior 조건2 + STOP-1 해소)** — both=0 (전 11 PoC) → if/then vacuous = 회귀 풀이 0 수학 보장 / is_intent 단독 43 / intent_vs_bug_classification 실사용 0 / verdict consumer unknown-fatal 부재
- ✅ ** 사용자 결단 4건 (추천안 묶음)** = #1 정제된 옵션 C / #2 schema if/then 강제 / #3 v4.1.0 MINOR / #4 ⑤ 단독

### resolved by 본 session ( session 25차)

-     **C-phase-2-5-cross-consistency-check** ( session 24차 carry / 1순위) →     **resolved** (v4.1.0 MINOR release 본격 시행)
- **STATUS drift (session 20→24 stale)** → **resolved** (STATUS sync + LL-i-46+47 자산화 + INDEX 점검)
- **DEC-2026-05-17-묶음-P §3 #2 "분류 보존 강제 포함" 확정 제약** → **resolved** (intent_classification_preserved + classification_drift verdict + is_intent⇔classification if/then 구현)
- **묶음 Q ④ severity cross-stage mapping** ( 사용자 "1"→"④만 먼저") → **resolved** (v4.1.1 PATCH / severity-cross-stage-mapping.md SSOT 신설 + 2 schema $comment / additive / DEC-2026-05-17-severity-cross-stage-mapping)
-      **묶음 Q ① alias 4중첩 폐기** ( 사용자 "1"→잔여 ①②⑦ risk 오름차순 첫) →      **resolved** (v5.0.0 MAJOR / anyOf 3분기 폐기→canonical 단일 + 5 alias property 제거 + 4 PoC 5 key rename + STOP-1 실측 해소 / DEC-2026-05-17-q1-alias-4중첩-폐기)

### 신규 carry ( session 25차)

- **묶음 Q 잔여 ②⑦ + Q-①-followup ( breaking / cooling-off)** = ② BR 표현 4→2 단일화 ( poc-06 7 BR desc-only → NL/GWT 합성 의무 + poc-03 TCA 제거 안전) / ⑦ rules.json→business-rules.json rename ( 265 file blast radius) / Q-①-followup (`rules_auto_extracted_reference`→`auto_extracted_br_refs` semantic-rename / ① scope 외). 각각 별도 plan + Senior critique + 사용자 결단 의무
- **C-poc08-drift-passwd-ordqry** ( Phase D 도메인 전문가 검토 / rules.json 변경 ❌ — 변경 없음 / ⑤ schema = 향후 검출 infra)
- **C-cross-consistency-validator-inline-emit** ( ⑤ schema 신설됨 / br-cross-consistency-validator 가 slim marker 를 BR 에 실제 기록하는 emit path = forward 구현 carry / 현재 both=0·intent_vs_bug 실사용 0 = 데이터 부재로 미발동)
- **C-adr-chain-011-§11-후속-list-sync** (session 25차 식별 / §11 후속 list = v2.5.1까지만 / v2.6~v4.1.0 미기재)
- **C-poc05-haiku-retrospect** ( session 13차 carry / Phase D self-eval-bias 완성)

### Lessons Learned 신규 ( session 25차 / ADR-CHAIN-011 §9)

-       **LL-i-46** (pre-pre-prerequisite 사각지대 재현 / Sprint 1-J PoC #03 — session 25차 자산화)
-         **LL-i-47** (echo-chamber self-eval bias 실측 / PoC #08 — session 25차 자산화)
-          **LL-i-51** ( "양심 의존 → schema enforcement 결정화 paradigm — 단 실측(both=0) 선행 + functional(모순 거부) test 동반 의무" / Phase 2 ⑤)
-        **LL-i-52** (alias 다중첩 폐기 — 순수 rename vs 의미 구분 별개 키 분리 식별 + scope-completion 투명 명시 / 묶음 Q ①)
-         **LL-i-53** (breaking migration latent 결함 동시 수정 = 숨은 가치 / 단 회귀 vs 개선 = 코드 착수 전 dry-run 실측 의무 / 묶음 Q ①)

### release-readiness 11/11 실측 결과

```
node scripts/release-readiness.js --target v5.0.0
✅ 11/11 criteria passed.    v5.0.0 = release-ready.
workspace test 387/387 pass (0 fail) / analysis_validator_violation = 11 PoC 전수 violations 0 (post-migration)
```

functional test 4·5 = if/then 이 모순 BR (is_intent=true+classification="bug" / 역방향) 실제 INVALID = vacuous-everywhere 아님 입증

### 다음 session entry-point ( session 27차+ / 묶음 Q 전 항목 종결 반영)

**선행 점검**: git 실측으로 v6.0.0 `4a98c8f` + v6.1.0 `73ae7c1` + v7.0.0(commit hash 신규) origin push 완료 여부 + tag v6.0.0·v6.1.0·v7.0.0 remote 확인 (session 26차 push = 사용자 직접 실행분 / 미확인 = session_handoff_drift 정정 의무).

1.       **묶음 Q 완결** — ①(v5.0.0)②(v6.0.0)④(v4.1.1)⑤(v4.1.0)+Q-①-followup(v6.1.0)+⑦(v7.0.0) 전 항목 종결. 묶음 Q 잔여 = **없음**.
2.  **별도 carry** (묶음 Q 외 / 1순위 후보) — C-poc08-drift-passwd-ordqry (Phase D 도메인 검토) / C-cross-consistency-validator-inline-emit (⑤ schema validator emit path forward 구현) / C-adr-chain-011-§11-후속-list-sync (§11 후속 list v2.5.1까지만) / C-poc05-haiku-retrospect (Phase D self-eval-bias)
3.  새 의제 = 사용자 결단 (묶음 Q 종결 → paradigm 안정점 재진입 / 점검 cadence 후보)

---

                  **본 session 2026-05-17 session 24차 — 묶음 P prereq 전 chain 종결 ( no version bump / carry only / 18 commit push)**:

- ✅ **carry trigger** = DEC-2026-05-17-rules-schema-enforcement-strengthen §⑤ carry ("≥ 7 PoC 도달 후 재평가") + 사용자 결단 "묶음 P 해줘" (자율 시행 위임)
- ✅ ** 묶음 P 정의** = Sprint 1 (schema cleanup / pre-pre-prereq) → Sprint 2 (NL/GWT dual representation / pre-prereq) → Sprint 3 (Layer 2 LLM corroboration) → Phase 2 본격 (⑤)
- ✅ ** Sprint 1~3 자율 종결 (18 commit b96fb84~85f1e6a)**:
  - Sprint 1 (10 sub-sprint) = 전체 11 PoC rules.json schema VALID + `analysis_validator_violation` criterion PoC #01+#05 한정 → 전체 11 PoC auto-discover 전수 격상
  - Sprint 1-J = pre-pre-prereq 사각지대 PoC #03 (NestJS) INVALID 76 errors 계획 외 발견 → 사각지대 carry 거부 + 즉시 보정 (LL-i-46 자산화)
  - Sprint 2 (4 PoC 30 BR) = #02·#04 GWT→NL + #08·#10 NL→GWT dual representation additive
  - Sprint 3 (4 PoC 8 dispatch) = Sonnet 4.6 phase-c + Haiku 4.5 blind retrospect → Layer 2 corroboration 7 PoC 도달 (poc-01/02/03/04/05/08/10)
- ✅ ** 핵심 발견 — PoC #08 echo-chamber drift 본격 실측** (LL-i-47 자산화):
  - Sprint 2 GWT 합성 (Sonnet 4.6) 이 is_intent=false / is_likely_bug=true 무시 → BR-PETSTORE-PASSWD-006 (평문 password 보안버그) + BR-PETSTORE-ORDQRY-005 (N+1) 정상규칙 정규화
  - 동일 모델 Sonnet 4.6 Layer 2 = 미검출 (0.93·0.90 / echo chamber) / 독립 Haiku 4.5 blind retrospect = 검출 (0.55·0.58 / 2 critical drift)
  - → industry-first paradigm + Adzic SBE 10년 폐기 함정 회피 자격 **본격 실측 입증**
- ✅ ** 사용자 결단 3건 (session 24차 gate)** = #1 Phase 2 ⑤ 보류·별도 session / #2 확정 제약 "분류 보존 강제 포함" (재논의 ❌) / #3 push carry only (version bump ❌)

### resolved by 본 session ( session 24차)

-     **묶음 P prerequisite 전 chain** (Sprint 1+2+3) →     **resolved** (자율 시행 종결 / Layer 2 corroboration 7 PoC 도달 / Phase 2 prereq ≥7 충족)
- **Sprint 1-I `analysis_validator_violation` criterion = PoC #01+#05 한정 사각지대** → **resolved** (전체 11 PoC auto-discover 전수 격상 / `feedback_pre_pre_prerequisite_lacuna` 정합)
- **4 PoC dual representation 부재** (#02·#04·#08·#10) → **resolved** (Sprint 2 / 30 BR additive 합성)

### 신규 carry ( session 24차)

-     **C-phase-2-5-cross-consistency-check** ( 1순위 / 별도 session / 진입 자격 충족 — ≥7 PoC + "분류 보존 강제 포함" 확정 제약 + inline(CodeQL) vs 분리(Spec-Kit) 결단 + v4.1.0 MINOR bump)
- **C-poc08-drift-passwd-ordqry** ( Phase D 도메인 전문가 검토 / rules.json 변경 ❌ / release-readiness check9 poc-08 미산입 의도된 carry)
- **묶음 Q** (P 종결 후) = ① alias 4중첩 폐기 / ② BR 표현 4→2 단일화 / ④ severity cross-stage mapping / ⑦ rules.json → business-rules.json rename
- **C-poc05-haiku-retrospect** ( session 13차 carry / Phase D self-eval-bias 완성) + **C-version-bump-sprint1i-criterion** (Sprint 1-I criterion 격상 = 다음 release v4.1.0 MINOR 후보 일괄)
- **C-adr-chain-011-§11-후속-list-sync** ( session 25차 식별 / §11 후속 list = v2.5.1까지만 / v2.6~v4.0.1 미기재 — 별도 doc sync carry)

### Lessons Learned 신규 ( session 24차 / ADR-CHAIN-011 §9 / session 25차 자산화)

-       **LL-i-46** ( "pre-pre-prerequisite 사각지대 재현 — criterion 부분 적용이 잔여 PoC drift 은폐 / 계획 외 발견 즉시 보정 paradigm" / Sprint 1-J PoC #03)
-         **LL-i-47** ( "echo-chamber self-eval bias 실측 + cross-model blind retrospect 가 dual-representation drift 본격 검출 / industry-first + Adzic SBE 함정 회피 자격 본격 실측" / PoC #08)

### release-readiness 11/11 실측 결과

```
node scripts/release-readiness.js
✅ 11/11 criteria passed.
 workspace test 364/364 / chain harness validated 본질 보존 / 0 회귀.
```

Layer 2 corroboration: poc-01/02/03/04/05/08/10 = **7 PoC** (Phase 2 prereq ≥7 충족) / poc-08 = echo-chamber drift carry (check9 미산입)

### 다음 session entry-point ( session 25차+)

1. **Phase 2 ⑤** (1순위 / 진입 자격 충족) — inline(CodeQL) vs 분리(Spec-Kit) 결단 + "분류 보존 강제 포함" 확정 제약 (재논의 ❌) + v4.1.0 MINOR / 4원칙 (plan + 3-에이전트 research + 사용자 결단 + 시행)
2. **묶음 Q** (P 종결 후 / 4건)
3. **별도 carry** — PoC #05 Haiku retrospect / C-poc08-drift Phase D 검토 / §11 후속 list sync / version 결단

---

                **본 session 2026-05-14 session 15차 — v2.5.0 MINOR FINAL release — Phase D 본격 종결**:

- ✅ **carry trigger** = C-v2.5.0-minor-final-release ( session 14차 carry / critical)
- ✅ ** 4원칙 1단계 plan 자산** = `~/.claude/plans/u-v2.5.0-phase-d-release-final.md` (§0~§9 / Plan U)
- ✅ ** 4원칙 2단계 Senior critique sub-agent ( Sonnet 4.6 / 가벼운 sub-agent / 시간 cap 20분)**:
  -     **STOP-1** (Q-D1 (c) per-BR vs per-PoC 집계 단위 모호 / BR-AUTH-JWT-002 L2=0.65 위반) 발행
  - REVISE 4건 (REVISE-1 check9 집계 단위 명시 + REVISE-2 verification gate + REVISE-3 DRIFT 격상 자산 + REVISE-4 package.json version bump)
  - 자격 검증 4/4 모두 ✅ (≥ 2 PoC corroboration + Adzic 회피 + industry-first + chain harness 본질 보존)
- ✅ ** 사용자 결단** "옵션 A" (Phase D 1 session 전 영역) + "옵션 2" (drift BR 검토 먼저) + 두 BR 모두 (2) DRIFT 격상 자산 채택
- ✅ ** 4원칙 4단계 본격 시행 — 4 단계 통합**:

### resolved by 본 session ( session 15차)

-       **C-v2.5.0-minor-final-release** ( session 14차 carry / critical) →     **resolved** ( v2.5.0 MINOR FINAL release 본격 시행 / git tag + origin push)
-      **Phase D 본격 종결** →     **resolved** (  release-readiness 9/9 + ≥ 2 PoC corroboration + drift BR 처분 + release 모두 시행)
-     **C-phase-d-domain-expert-review-3-drift** ( session 14차 carry / Phase D / 도메인 전문가 검토) →   **resolved** (  사용자 자신 검토 / 두 BR 모두 DRIFT 격상 자산 / rules.json 변경 ❌)
-     **C-phase-d-domain-expert-review-2-drift** ( session 13차 carry) →   **resolved** ( 위와 동일)
- **C-overall-threshold-redesign-phase-c** ( session 11차 carry / Phase C carry) → **resolved** ( release-readiness check9 안 per-PoC mean ≥ 0.7 + chain-driver overall_score (L1+L2)/2 ≥ 0.85 = session 14차 정합)
- **C-release-readiness-9-9-격상** ( session 14차 implicit) → **resolved** ( check9 layer_2_consistency 신설 + scripts/test 10/10)

### 신규 carry ( session 15차)

- **C-jwt-secret-hardcoded-fix** ( Phase D+ / 사내 적용 시 1줄 fix / BR-AUTH-JWT-002 human_review_note 정합)
- **C-nestjs-auth-middleware-delete-fix** ( Phase D+ / 사내 적용 시 1줄 fix / BR-USER-DELETE-AUTH-001 F-140 critical resolved 자격)
- **C-absent-br-gwt-nl-paradigm 보강** ( session 13차 carry / PHASE-D-2026-05-14-drift-domain-review.md = 본격 paradigm 사례 / Phase D+ 본격 명세 작성)
- **C-self-evaluation-bias-retrospect 보존** ( session 13차 carry / Opus/Haiku 교차 검증 별도 session)

### Lessons Learned 신규 ( session 15차 / ADR-CHAIN-011 §9 patch v9)

-         **LL-i-44** ( "drift BR DRIFT 격상 자산 paradigm = rules.json 변경 ❌ 본격 본질 / Phase D session 15차 정합")
-       **LL-i-45** ( "absent BR semantic_inversion 본격 검출 = 본 방법론 가치 본격 입증 / industry-first paradigm 본격 보강")

### 자격 본격 입증 4종 ✅ ( session 15차 결단 핵심)

| 자격                              | 본격 입증                                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| ≥ 2 PoC corroboration             | ✅ 31 BR (PoC #01 13 + PoC #03 18) / Layer 1 + Layer 2 양쪽 통과 / cross-language + cross-platform diversity                   |
| Adzic SBE 10년 폐기 함정 회피     | ✅ Layer 1 + Layer 2 hybrid paradigm 본격 동작 입증 / dual representation + cross-consistency validator + drift carry paradigm |
| industry-first                    | ✅ Spec Kit (90K) / AWS Q / DMN / Spectral / Drools / AutoUAT 모두 cross-consistency validator 부재                            |
| chain harness validated 본질 보존 | ✅ release-readiness 9th criterion = additive change paradigm / no-simulation trio + D21' + content-aware 비손상               |

### release-readiness 9/9 실측 결과

```
node scripts/release-readiness.js --target v2.5.0
✅ 9/9 criteria passed.
   v2.5.0 = release-ready.
```

Layer 2 per-PoC mean: PoC #01=0.848 (n=13) / PoC #03=0.914 (n=18) / PoC #05=0.970 (n=2, sample)

---
