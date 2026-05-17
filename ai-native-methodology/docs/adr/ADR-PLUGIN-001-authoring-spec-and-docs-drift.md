# ADR-PLUGIN-001: Plugin Authoring Spec + 외부 docs drift baseline+ratchet

- 상태: 승인됨 (Accepted) — v7.1.0 MINOR / charter R18
- 일자: 2026-05-17
- 결정자: 윤주스 (TF Lead) — 사용자 질문 "plugin skill/hooks/agent 작성 시 Anthropic 공식 best practice?" → plan 4결단 (R18 정식 / package.json 선행 housekeeping / 감사+백로그만 수정 이연 / staleness 60일)
- 관련: ADR-010 (baseline+ratchet 차용 원천) / ADR-009 (네트워크=§2 dispatch / no-simulation trust ladder) / `methodology-spec/plugin-authoring-spec.md` (단일 SSOT) / `methodology-spec/plugin-charter.md` R18 / DEC-2026-05-17-plugin-authoring-spec / DEC-2026-05-17-package-version-3way-sync-fix (선행) / F-015 (`_base-official-docs-checker`)

---

## 1. 컨텍스트

본 plugin 은 그 자체가 방법론이며 47 skills + 9 agents + `hooks/hooks.json` + `.claude-plugin/{plugin,marketplace}.json` 으로 구성된다. 그러나:

> "이 자산들을 작성할 때 Anthropic 공식 / 업계 best practice 가 있는가?" (사용자 질문 2026-05-17)

기존 상태:
- 저작 규칙 명문 부재 → 신규 skill/agent/hook 작성 시 일관성 drift (silent).
- Anthropic 공식 Claude Code docs 는 **진화**한다 (실측: hooks 이벤트 5→29종 / sub-agents `skills` 공식 필드화 / `system_prompt`·`preloaded_skills` 미존재). 규칙을 한 번 적어도 공식이 바뀌면 stale → 인지 불가.
- 양심 의존("문서 가끔 확인") = 본 repo 가 거부하는 패러다임 (CLAUDE.md "양심 의존 차단").

### 산업 표준 사례 (외부 권위 pin + staleness gate)

- **Renovate / Dependabot** — dependency pin + staleness PR (만료 시 자동 알림)
- **TUF (The Update Framework)** — metadata `expires` 필드 (만료 = 신뢰 거부)
- **SLSA provenance** — freshness / attestation 만료 검증
- **OWASP Dependency-Track** — component EOL/staleness 정책 차단
- **(본 repo 내부)** ADR-010 baseline+ratchet (Slack/GitLab/Dropbox/Figma/Shopify 6 사례) — 기존 grandfather + 신규만 차단

→ **공통 = pin + 만료 임계 + 자동 차단**. 양심 ❌. 본 ADR 은 ADR-010 을 **외부 권위(공식 docs)** 에 재적용.

## 2. 결정

### 2.1 plugin-authoring-spec.md = 단일 SSOT

`methodology-spec/plugin-authoring-spec.md` 신설 — Skill(S1~S7)·Hook(H1~H7)·Agent(A1~A6)·Packaging(P1~P4) 저작 규칙 + §6 공식 docs pin baseline + §7 compliance 매트릭스 + §8 이연 backlog + §9 drift 재검증 + §10 SSOT 선언. 규칙·digest 변경 = 본 문서에서만 (charter·schema·skill 재선언 ❌).

### 2.2 외부 docs drift = ADR-010 baseline+ratchet 차용 (2계층 분리)

- **baseline** = §6 pin 표 (area · official_url · content_anchor · `pinned_guidance_digest` · `last_verified`). 생성 시 실 `_base-official-docs-checker` F-015 dispatch 결과로 seed (암기 작성 ❌ = ADR-009 no-simulation 정합).
- **Layer (i) 네트워크 재검증** — 60일 cadence OR check #12 red OR plugin-authoring PR. `_base-official-docs-checker` ×4 dispatch (§6 area 별). VERIFIED→`last_verified` 갱신 / CONTRADICTS→finding+DEC+규칙·digest 갱신+semver 평가 / INSUFFICIENT-DATA→finding·미갱신(clock 지속). **release-readiness 밖** (네트워크=비결정 / ADR-009 §2 dispatch territory).
- **Layer (ii) 결정적 가드** — `release-readiness.js` check #12 (`authoring_spec_staleness`). §6 `last_verified` 4행 정규식 추출 → `today − last_verified ≤ 60일` 의무. date-math only / 네트워크 ❌ / `check10` 패턴 isomorphic / `--skip-authoring-staleness`=skip≠pass / release 시 flag ❌ 의무.

### 2.3 split 정당화 (no-simulation / 결정적 release-readiness 불변)

| 제약 | 네트워크를 release-readiness 에 넣으면 위반 | split 이 충족 |
|---|---|---|
| no-network / 결정적 release-readiness | WebFetch = 비결정·offline/CI 실패·flaky gate | 네트워크는 문서화 cadence (agent dispatch) / gate 는 date 산술만 |
| 양심 의존 차단 | "문서 가끔 확인" = 양심 의존 = 거부 패러다임 | check #12 가 staleness 를 release gate 로 강제 |
| no-simulation (ADR-009) | corpus 기반 digest 작성 = simulation | §6 seed = 실 F-015 dispatch / checker 계약 = corpus fallback ❌ |

### 2.4 grandfather (ADR-010 §2.1 차용)

감사 실 위반 = baseline grandfathered. ratchet = **신규·수정 skill/agent 는 §2·§4 즉시 강제**. 47개 즉시 rewrite 불요 (defect-explosion 회피).

### 2.5 deferred breaking = 본 ADR scope ❌

`spec-integrate-7대-deliverables` 한글 → kebab rename = command-surface = **별도 MAJOR** (3 ref / cooling-off + Senior + STOP-gate / v7.0.0 rename 선례). 본 ADR (v7.1.0 MINOR) = 감사·기록만, 수정 ❌.

## 3. 결과

### Positive

- 저작 규칙 단일 SSOT → 신규 자산 일관성 강제 (ratchet).
- 외부 권위 drift 가 결정적 release gate 로 차단 (양심 비의존).
- 실 F-015 cross-check 가 가설 false-positive 3건 제거 (S1 retrofit 불요 / marketplace 위치 정합 / agent `skills:` 공식 필드) + over-claim 2건 교정 (`system_prompt`·`preloaded_skills` 미존재) → 방법론 정확도 향상.

### 트레이드오프

- check #12 는 calendar-day 의존 (오늘 통과해도 61일 후 무변경 fail) — ★ 의도된 ratchet (ADR-010 "2년 자동 expiry" 동형). 60일 coarse 임계 + `--skip-authoring-staleness` (비release cadence) 로 dev flakiness 회피.
- 네트워크 재검증은 사람이 cadence 를 트리거 (자동화 ❌) — 그러나 check #12 red 가 트리거를 강제 (양심 비의존 유지). 네트워크 자동화 = over-engineering + 제약 위반 → 의도적 미채택.

## 4. 검증

- release-readiness **12/12** (A1 본격 spawn `criteria_total=12 passed=12 ready=true exit 0`) + `release-readiness.test.js` **12/12 pass** (check #12 happy + skip≠pass + id 정합 신규 case 포함).
- version-check **3-way 7.1.0** (선행 housekeeping DEC-2026-05-17-package-version-3way-sync-fix 로 package.json 청산 후 정상 bump).
- workspace test green / drift-validator 3-way 불변 (skill/agent/flow 무수정 = §8 이연의 안전 속성).
- §6 pin = 실 `_base-official-docs-checker` ×4 VERIFIED (2026-05-17 / canonical `code.claude.com/docs/en/*`).

## 5. 본 방법론 적용

- charter **R18** 정식 신설 (§5 backlog 격상 아닌 신규 정식 R / 사용자 결단).
- `release-readiness.js` check #12 = 11/11 → **12/12**.
- §9 Layer i cadence = 향후 운영 절차 (60일 / `_base-official-docs-checker` dispatch / CONTRADICTS 시 DEC).
- CLAUDE.md 핵심 디렉토리 + 참고 § pointer.

## 6. 참조

- 공식 Claude Code docs (실 F-015 VERIFIED 2026-05-17): `code.claude.com/docs/en/skills` · `/hooks` · `/sub-agents` · `/plugins-reference`
- ADR-010 (baseline+ratchet 원천 / Slack·GitLab·Dropbox·Figma·Shopify 6 사례) · ADR-009 (no-simulation trust ladder / 네트워크=§2)
- 산업 사례 — Renovate/Dependabot pin+staleness · TUF metadata `expires` · SLSA freshness · OWASP Dependency-Track EOL
- `methodology-spec/plugin-authoring-spec.md` (단일 SSOT) · DEC-2026-05-17-plugin-authoring-spec · DEC-2026-05-17-package-version-3way-sync-fix

---

## §7 patch 영역 (★ 향후 §9 Layer i CONTRADICTS 발생 시 patch vN + Lessons Learned LL-i-NN accretion / ADR-CHAIN-011 §5·§9 패턴 차용)

- **patch v1 (2026-05-17 / v8.0.0 MAJOR / §8-1 deferred backlog 종결)** — §2.5 가 scope-out 했던 `spec-integrate-7대-deliverables` 한글 skill rename 을 사용자 결단("1 바꾸자")으로 본격 시행. 새 name = `spec-integrate-deliverables` (Senior GO+REVISE conf 0.88 — "7" = stale noise / 실제 ~17 산출물 통합 / skills-axis 의미-ID + v2.6.0 무의미 숫자토큰 제거 선례). 실 blast = 19 occ / 13 files (v7.0.0 대비 ~13× 작음 / fully grep-able). 분류 — 활성 코드 5(git mv dir + spec-agent.md×3 + spec.phase-flow.{json,mermaid}) + 활성 문서 7(skills-axis·lifecycle-contract·guides×2·README×2) literal 치환 / SSOT plugin-authoring-spec §7·§8 = content-aware(❌→✅ resolved / blind swap ❌) / ★ 본 §2.5 line 57 literal + DEC-2026-05-17-plugin-authoring-spec = audit-time 기록 **보존**(역사 무수정 / LL-i-52) / CHANGELOG 구 entry 무수정. v8.0.0 MAJOR (P2′ command-surface = 비협상 / 선례 v7.0.0 D1). STOP-3 hard gate (sweep A/B/C + drift-validator 3-way + release-readiness 12/12 incl check #12 dogfood green). DEC-2026-05-17-skill-name-rename.

- **patch v2 (2026-05-17 / v8.1.0 MINOR / R18 내부정합 enforcement 신설)** — 사용자 "skill 내용 로직 확인 가능한가" → A(내부 인용 실존 결정적 검사) 채택. 47 SKILL.md 전수 스캔 → 37 stale dead-link 검출 (doc 재구조화 4중 미전파: deliverables 재번호·workflow phase→semantic·schema -spec 접미·v7.0.0 rename + template·ADR 정확명). ★ 기존 validator 전 사각(drift=flows·formal-spec-link=chain·SKILL.md 산문 무검증) 노출 → 신규 `tools/skill-citation-validator/`(npm workspace 17번째 / AI 추론 0%) + release-readiness **check #13** (`skill_citation_integrity` / 12→13/13). 14 SKILL.md / 20 인용 ground truth 정밀 수정 (비-breaking 내부 dead-link / 추정 ❌ LL-i-55 / false-positive carry·tool·DEC.md·ADR-007부재 정확 분리). dogfood green + test 2/2. 정직 명시 — A=결정적 가능 / C(지시 설계품질)=ADR-009 simulation 증명불가 scope ❌. DEC-2026-05-17-skill-citation-integrity / LL-i-59.

- **patch v3 (2026-05-17 / v8.1.1 PATCH / skill-citation-validator repo-wide 확장 + FP 교정)** — 사용자 "전체 레포 스캔" → validator scope SKILL.md→repo-wide active 표면. 결정적 버그 교정 = DEC/ADR exact-match→**prefix-match**(파일명 descriptive suffix FP / 34→0) + relative-path 해석 + ABSENCE_CTX 확장(supersession·future-carry·흡수) + migration/absorption 표-header 인식(LL-i-52). EXCLUDE = history + dist + examples + **docs/adr/**(ADR=immutable decision record) + **templates/adoption/**(downstream scaffold). repo-wide raw → HISTORY 453+POC 41 정직분리 → 활성 실 stale 31/15file → 0. 동일 schema-drift class 활성 SSOT 잔존 수정(lifecycle-contract 자산매핑·id-conventions·README·severity·schemas/README·planning-doc-format·deliverables 4·br-cross skill). corrective·non-breaking(check#13·tool=v8.1.0 기존) = PATCH. DEC-2026-05-17-repo-wide-citation-scan / LL-i-60.

- **patch v4 (2026-05-17 / v8.2.0 MINOR / §9 Layer i on-demand 발동 + META blind-spot closure)** — 사용자 "공식 best practice 재확인+비교+개선" → §9 Layer i 실 F-015 ×5 재검 (skills/hooks/sub-agents/plugins-reference + matcher/if 정밀). 판정 = skills·sub-agents·plugins **VERIFIED-IDENTICAL** / hooks **VERIFIED-WITH-DELTA**. ★ Explore pre-research 가설 3건(event 30+·sub-agent name-only·P2 stale) = 실 F-015 가 **모두 반증** + matcher "invented" 1-checker 오판 = 독립 정밀 재검으로 H4 보존. 시행 = §2 S8(auto-compaction budget) + §3 H8(per-handler if·timeout default·handler 5종·matcher≠if) **additive 신설** (H1~H7·§4·§5 무변 / 거짓 규칙 0). ★ META — §6 `digest_sha` 컬럼 + check #12 `sha256(digest)` 선두12hex 재계산 일치 결정적 assert (6→7 cell / fail-closed-on-`|` 유지) + §9 Layer i VERIFIED-IDENTICAL/WITH-DELTA 분기 + 불변식 ("last_verified bump ⟺ 실 F-015 run AND digest_sha 일관") → "§6 날짜만 fresh / 규칙 stale" 사각 결정적 차단 (precedent check #13 · TUF expires+hash). breaking 0 = MINOR (P2′ MAJOR 트리거 0 / v8.1.0 skill-citation-validator MINOR 동형). check 수 13 유지 (check #12 내부 강화). release-readiness 13/13 + digest_sha regression-guard test 신설 + drift-validator 3-way 불변. DEC-2026-05-17-plugin-authoring-docs-drift / LL-plugin-02.

- **patch v5 (2026-05-17 / v8.2.1 PATCH / §8-2 backlog 2번 종결 = backlog 잔여 0)** — v8.2.0 F-015 ×5 재검 완료 = §8-2 trigger 충족 → `_base-*` skill5+agent3 rename(v9.0.0 MAJOR / ~195 occ·70 file / 0 functional gain / LL-i-55·56 회귀 class) vs documented-exception 결단. 실 F-015(공식 charset verbatim 확인하되 **violation enforcement·`_`-prefix hiding 거동 미문서화** = nominal not functional / 395 test·F-015 dispatch·namespace 무결) + Senior GO 0.88 → **documented-exception**. §7 행 ⚠️→✅ + §8-2 8 frozen allowlist 명세. ★ Senior 필수 guardrail = (1) §9 skills digest 가 enforcement-strength encode (hard-enforce 전환 시 차기 F-015 CONTRADICTS tripwire / 없으면 REVISE) — digest 변경 → skills digest_sha 재산출(ea06→b8b2 = v8.2.0 메커니즘 자기 dogfood) (2) check #12 가 정확 8 allowlist 결정적 assert (9번째 `_base-` = fail / loophole ❌ / 신규 non-`_base`=ratchet). check 13 유지(#12 내부 강화 / digest_sha-into-#12 선례). PATCH (문서종결+이미참 invariant 형식화 / consumer 영향 0 / LL-i-56 정합). DEC-2026-05-17-base-prefix-documented-exception / LL-plugin-03.

- **patch v6 (2026-05-17 / v8.2.2 PATCH / §7 규칙 적용 감사 — spec 무변경 / corrective sweep)** — 사용자 "각 영역 별 파일별 품질 검증" → plugin-authoring 4영역 60 단위 파일별 감사(§2~§5 규칙 L1 + L2 의미·claim accuracy + L3 §8.1·no-simulation / 10 sub-agent 배치 + XV 독립 재검증 = F-015 dogfood). ★ 본 patch = §2~§5 **규칙 본문 무변경** (위반 적용·교정만 / §7 매트릭스 = area-level 유지 / 파일-level 매트릭스는 disposable working artifact `examples/_audits/2026-05-17-*.md`). L1 구조 60/60 PASS — 결함 전부 **L2 인용 drift** (skill-citation-validator check #13 의 구조적 사각 = "본문·CLI 예제 내 bare artifact 파일명(rules.json)"; class = schema/repo-path/ADR/DEC 만 → bare token 미포함). post-dedupe 10 finding = `methodology-spec/finding-system.md` **Body Finding Ledger `F-PA-NNN` namespace 신설** (PoC F-NNN 시퀀스와 분리 / 첫 body-level ledger). corrective: resolved 8 + wontfix 2. breaking 0 = PATCH (doc-corrective + schema $id 정합($ref 의존 0 / CHANGELOG v7.0.0 미완 보정) + chain-driver buildBlockOutput `hookEventName` additive optional default). STOP-3 hard gate (잔여 grep 0 + skill-citation 0 + release-readiness 13/13 incl workspace 395+ + drift 3-way 불변). DEC-2026-05-17-plugin-authoring-file-audit / LL-plugin-04.

- **patch v7 (2026-05-17 / v8.2.3 PATCH / 확장 감사 methodology-body — spec 무변경 / corrective sweep)** — F-PA cycle 후 사용자 "1,2,3 다하자 순서대로" → Area E deliverables 25 + F schemas 39 + G tools 18 = 82 단위 파일별 감사(F-PA 동형 8 sub-agent + ground-truth XV). ★ 본 patch = §2~§5 **규칙 본문 무변경** (위반 적용·교정만 / §7 area-level 유지 / 파일-level = disposable working artifact). GREEN 74 / RED 8(전부 Area G tools README↔cli.js 문서 drift / 코드·test·no-sim 정상). Area E·F 구조 거의 완벽 — **$id↔filename 0 불일치 (F-PA-009 = singleton 확인)** / $ref 0 broken. post-dedupe F-MB **9건** = `finding-system.md` Body Finding Ledger **F-MB namespace 신설** (F-PA 와 분리). corrective resolved 8 + deferred 1(F-MB-009 = tool src·test·history `rules.json` LL-i-55 함정존 forensic 별건). P2′ = PATCH (F-MB-002/003 schema-contract touch 이나 0-consumer 검증 + canonical 정렬 + schema-validator 전 11 PoC 0-regression 결정적 = F-PA-009 선례 동형 / breaking 0). STOP-3 hard gate (잔여 grep 0 + skill-citation 0 + release-readiness 13/13 incl schema-validator 11 PoC·workspace 395+·drift 3-way·version-check 3-way 8.2.3). DEC-2026-05-17-plugin-authoring-mb-audit / LL-plugin-05.

## §8 Lessons Learned

- **LL-plugin-01** — 외부 권위(공식 docs) 는 코드 의존성과 동형으로 drift 한다. pin baseline + 결정적 staleness gate (date-math) + 네트워크 재검증 cadence 분리 = ADR-010 을 외부 권위에 재적용한 paradigm. 실 F-015 cross-check 가 main-agent 사전 research 의 가설 false-positive 3건 + over-claim 2건을 제거 → "research 수렴만으로 단정 ❌ / 1차 출처 독립 fetch 의무" (memory `feedback_sub_agent_validation` 정합).
- **LL-plugin-02 (v8.2.0)** — §6 `last_verified`=today 라도 규칙 본문·digest 는 stale 가능 (날짜 freshness ≠ content 정합) = §9 Layer i 의 content-reconciliation blind spot. `digest_sha` 결정적 결합 (check #12 재계산 assert) 이 digest 변경과 commitment 동반이동을 강제 — content-correctness 는 offline 증명 불가하나 content-commitment 일관성은 결정적 (TUF metadata expires+hash·check #13 동형 / 양심 비의존 유지). ★ Explore pre-research 가설 3건이 실 F-015 ×5 로 전부 반증 = "sub-agent research 수렴 ≠ 사실 / 가설 ≠ 결론 / 1차 출처 독립 fetch 가 quality 1순위·재작업 회피 결정" (`feedback_sub_agent_validation` 본격 강화). 단일 checker "matcher invented" 오판을 독립 정밀 재검으로 교정 = §8.1 단일 출처 과적합 회피 입증.
- **LL-plugin-05 (v8.2.3)** — corrective sweep 안전 경계 = **활성 DOC 표면 vs 실행 코드/test/dated-history**. 동일 drift class 라도 doc = 안전 3-step sweep / tool src·test fixture·migration script·PHASE·SPIKE·layer-2-results = blanket ❌ (intentional fixture / 구-format 처리 대상 / immutable 측정기록 → blanket 시 workspace 395+ release gate 자해 = v7.0.0 LL-i-55·57 hidden-test-literal class 정확 재현). F-MB-009 분리·forensic-defer = 품질 1순위·재작업 최소화. ★ ground-truth-before-edit 가 3번째 재작업 차단 — `to_artifact: rules` = lifecycle-contract SSOT(:207 + 7대 table) logical 자산명 **불변**(파일만 v7.0.0 rename) → sub-agent F-MB-001 변종 과탐 / blanket 변경 시 6 deliverable logical id 파괴 (FP-1·F-PA-007 에 이은 누적 = "sub-agent verdict 맹신 ❌ / 1차 출처 SSOT 독립 read 의무"). ★ schema-contract touch 의 P2′ 등급 = 기계적 "schema 변경=MAJOR" 아닌 **실 consumer-impact + 결정적 입증** 기반 — F-MB-002/003 = 0-consumer 검증 + canonical 정렬(신 제약 아닌 잠재 불일치 제거) + schema-validator 전 11 PoC 0-regression → PATCH (F-PA-009 동형 / v6.0.0 실-PoC-break MAJOR 와 결정적 분리 / semver inflation 회피).
- **LL-plugin-04 (v8.2.2)** — 결정적 validator(skill-citation-validator)는 그 citation **class 정의 밖**의 drift 를 구조적으로 못 본다 (bare artifact 파일명 `rules.json` = schema/repo-path/ADR/DEC 4 class 어디에도 미해당 → check #13 "0 stale" 인데 실 13 skill+5 workflow SSOT doc 에 stale). 결정적 가드의 "green" 은 그 가드가 보는 표면에 한정 — L2 의미 감사(사람·LLM 판단 + 실파일 ground-truth)가 보완 axis. ★ ground-truth-before-edit 가 재작업 2건 차단: (1) FP-1 `_base-apply-template` 1차 RED 오탐(실제 rules.json 무관) (2) F-PA-007 1차 오진("skill 틀림" → 실제 skill 인용 정확 / ADR **파일명**이 self-stale 12 vs 본문 13) — sub-agent 1차 verdict 맹신 시 정확한 인용을 깨뜨릴 뻔 = LL-plugin-01·02 의 "research/verdict 수렴 ≠ 사실, 1차 출처 독립 read 의무" 본격 재확인. body-level finding 은 `finding-system.md` Body Finding Ledger `F-PA-NNN`(PoC F-NNN 분리)로 durable 고정 — disposable audit artifact(`examples/_audits/`)와 SSOT(ledger 처분표) 분리 = LL-audit-04 정합. corrective sweep 의 scope 가 XV 시점(13 skill)보다 SSOT 근원(5 workflow doc + schema $id)까지 확대된 것은 "drift 는 표면이 아니라 근원에서 차단" 원칙.
- **LL-plugin-03 (v8.2.1)** — "공식 규칙 위반" ≠ "functional defect". F-015 가 charset 규칙은 verbatim 확인하되 **violation 시 enforcement 거동이 docs 에 미문서화** 임을 분리 입증 = nominal vs functional 구분이 rename(MAJOR ~195 occ·70 file·0 gain) vs documented-exception(PATCH) 갈림. 방법론이 자기 규칙을 *문서화·bounded·ratchet-보존* 예외로 면제 = credibility 손상 ❌ (baseline+ratchet paradigm 작동 시연 / silent drift 가 손상) — 단 frozen allowlist + 결정적 no-loophole guard(9번째 차단) 동반 의무. deferred-liability(미래 hard-enforce)는 enforcement-strength digest tripwire 로 §9 Layer i 가 포착하도록 encode = 사각 닫음 (LL-plugin-02 digest_sha 사상 연장). ★ digest 변경이 즉시 digest_sha STALE 검출 = v8.2.0 메커니즘 1 release 만에 자기 dogfood 실효 입증. Senior 가 자기 추천 최강 반론(미래 hard-enforce) 명시 + guardrail 없으면 REVISE 조건부 = 과적합 회피 (`feedback_decision_cadence` — breaking 회피 보수 선택 = 위임 범위 안전).
