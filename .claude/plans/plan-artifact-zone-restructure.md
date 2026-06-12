# plan — canonical 산출물 zone 재구조화 (shared/ + domains/<BC>/)

> 상태 트래커 겸 기록. 4원칙 1(plan)·2(research=진단 워크플로우 wf_48e156f6)·3(승인=2026-06-12 3결정) 완료 → 코드 착수.
> 트리거: 사용자 "공통은 공통대로 도메인은 도메인대로 산출물 구조 변경" + "다른 CLI 다른 도메인 병렬" 목표.

## 승인된 결정 (2026-06-12 / AskUserQuestion)

1. **범위 = 본체-우선 SOFT** — 방법론 본체에 zone 규약 + 로더 추가(backward-compat / opt-in / 평면 레이아웃 계속 valid / HARD gate flip ❌). ep-be-gea 적용. 남은 28 도메인 + worktree 병렬에 모두 적용.
2. **네이밍 = `shared/` + `domains/<BC>/`** (코드베이스 영어 관례 정합 / 파일명 rename ❌ = 디렉토리 이동만).
3. **antipatterns/migration-cautions = 지금 scope-attribution 필드 추가해 분할** — 단 §8.1-안전 구현: 필드는 일반형(`scope: BC-id | "cross_cutting"`)·optional·additive / 값은 prefix 아닌 실판단 / **어떤 validator 도 이 필드로 HARD-gate ❌** / "1-datapoint·≥2도메인서 재검토" 명시 / over-claim ❌.

## 진단 핵심 (wf_48e156f6 / F-015 코드 교차검증 완료)

- **샤딩 ⊥ canonical-global**: read model(1 논리 세트·참조·무복사)과 storage layout(파일 1 vs 인덱스+샤드)은 직교. business-rules 가 이미 인덱스+per-BC 샤딩을 canonical-global 아래 시행(DEC-2026-06-09 BR-split STEP3). `sharding_contradicts_canonical=false`.
- **분류**: 공통(repo-wide/cross-cutting) = inventory·architecture·db-schema·scope-carve·code-graph·recovered-adr·run-manifest·error-mapping + domain.json 헤더 / 도메인별(per-BC) = business-rules(이미)·openapi·characterization·formal-spec·sql-inventory·domain.json bounded_contexts[] / 교차혼재 = antipatterns·migration-cautions(F14).
- **로더 투명성 확인**(`tools/_shared/load-business-rules.js`): `bc_files[].file` = 인덱스 dir 기준 상대경로 → leaf 를 `domains/<BC>/business-rules.json` 로 옮기면 인덱스 `file` 값만 변경, 로더 무수정.
- **인덱스 모델 2-tier**: (T1 set-level) `work-unit-manifest.analysis_refs.artifacts` = name→repo-rel-path 맵(findings-aggregator gate#0 가 이미 결정론 resolve) / (T2 artifact-level) business-rules.json `bc_files[]` 패턴.

## 안전장치 (guardrail / 위반 시 read-model 회귀)

- G1 단일 로더 chokepoint 유지 — 직접 `fs.readdir` 샤드 디렉토리 bypass ❌ (sync.js BLOCKER-2 history).
- G2 파일명 basename 불변 — **디렉토리 이동만, rename ❌** (drift-validator baseline set / traceability ANALYSIS_FILENAMES / sync CANONICAL_ANALYSIS_FILES 연쇄 churn 회피).
- G3 hash 불변 — 이동 전 layout-invariance 테스트 GREEN(content-addressed subset-hash 가 layout-invariant 임을 증명, 가정 ❌).
- G4 backward-compat — 로더는 옛 단일파일/평면 경로 계속 수용. 검증 스키마(business-rules.schema.json 등) 무변경, 신규는 additive only.
- G5 샤드 = 단일세트 partition (각 BC 가 정확히 1 샤드 / 재조립 = 1 세트), per-scope 복사 ❌ (= 폐기된 *.subset.json anti-pattern 부활 금지).

## 실행 단계 (의존순 / 테스트 게이트)

- [x] **S1 plan 기록** (본 파일) — DONE
- [x] **S2 lifecycle-contract 규약** — DONE. output/ tree 를 진입점(top-level index) + shared/ + domains/<BC>/ 로 재작성 + 누락 always-on 보강 + zone 규약 문단(SOFT·opt-in·read-model 불변·basename 불변·manifest 인덱스·§8.1).
- [ ] **S3 invariance 테스트 FIRST** — sync.test.js split-invariance 패턴 확장: `hashBusinessRulesSubset(domains/<BC>/ layout) === hash(business-rules/<BC>.json layout)` (full + per-BC). RED→GREEN.
- [x] **S4 스키마(additive)** — DONE(부분). (a) business-rules-index `bc_files[].file` 설명 = domains/<BC>/business-rules.json + 평면 backward-compat / (c) antipatterns + migration-cautions `bc_scope`(BC-id|cross_cutting / 미지정=cross_cutting 안전기본 / SOFT·HARD-gate❌). **(b) domain index/fragment = DEFER**(domain.json=repo-wide BC카탈로그·1-BC 샤딩 degenerate / shared/ 통째 이동만 / ≥2 BC 때 / §8.1). 무회귀 검증: schema-validator42·drift49·br-cross32·chain-driver523·aggregator66·chain-coverage41·plan-coverage47·spec-test-link11·traceability179 GREEN.
- [ ] **S5 load-domain.js = DEFER** — domain.json whole-in-shared 이므로 신규 로더 불필요(≥2 BC 블록 샤딩 시 도입).
- [x] **S6 path 해석 manifest-driven** — DONE. sync.js registerCanonicalSources 가 manifest.analysis_refs.artifacts basename 매칭 우선(없으면 flat output/<name> fallback / detectDrift 는 저장 s.path 추종) + aggregator resolveBusinessRules(zone leaf domains/<BC>/business-rules.json → 평면 leaf → index) · resolveDomain(shared/domain.json → 평면) multi-candidate. 무회귀: aggregator66·chain-driver523 GREEN.
- [x] **S7 전체 테스트 GREEN(이동 전)** — DONE. schema-validator42·drift49·br-cross32·chain-driver523·aggregator66·chain-coverage41·plan-coverage47·spec-test-link11·traceability179 전부 GREEN(SOFT additive = 무회귀 정상).
- [x] **S8 ep-be-gea 이동** — DONE. dir-스캔 검증기 3종(schema-validator·analysis-extraction·formal-spec-link) 전부 **재귀 확인** → 이동 안전 green-light. 이동 실행: per-BC(business-rules leaf→domains/BC-EVENT/business-rules.json + index file 갱신 / openapi·formal-spec·characterization/·sql-inventory/→domains/BC-EVENT/) + 공통 9종→shared/. event/manifest.json analysis_refs 13경로 갱신 + sync --register 재등록(manifest-aware 추종 실증).
- [x] **S8-pre invariance(기능 증명)** — loadBusinessRules(index→domains/BC-EVENT/) = **36 rule 재조립 ✓**(content 동일 = hash 불변 by construction). 형식 guard 테스트(sync.test.js)는 S11 에 추가(hardening).
- [x] **S9 dogfood 검증** — DONE. event analysis gate **7/7 validators ok**(새 zone 경로) / schema-validator 재귀 15 valid(+1 선재 invalid=migration-cautions detection_method enum, 이동·내편집 무관) / spec gate critical0·high0·coverage1.0 / implement gate critical0·high0·test-impl·traceability·code-pointer ok(evidence_missing 3=선재 carry) / **새 failure 0**. 방법론 테스트 chain-driver523·aggregator66 GREEN.
- [ ] **S8b AP/MC bc_scope 값 채움(logical split)** — schema 는 done. ep-be-gea antipatterns.json 10 AP + migration-cautions 에 bc_scope 실판단 부여(진단 분류: AP-DB-003/004·AP-ARCH-001=cross_cutting / AP-SECURITY-001·AP-DOMAIN-001·AP-MAINTAINABILITY-*=BC-EVENT / AP-DB-001/002 재판단). **physical 디렉토리 split = DEFER**(cross-cutting=top-level 유지 silent-omission 방지[F14] / domain-local→domains/<BC>/ 는 AP loader 필요 = §8.1 1-domain 보류 / 사용자 surface).
- [ ] **S10 doc sweep** — skills/ (~269 path-literal) + agent .md(~7) output/shared·domains 경로로. legacy rules.json/schema.json 잔존명 제거.
- [ ] **S11 DEC + CHANGELOG + version** — DEC(storage-layout / DEC-2026-06-07·06-09 직교·보존 / invariance 테스트 = 증거) + INDEX + STATUS + CHANGELOG + plugin.json MINOR bump.

## §8.1 / over-claim 가드

- per-BC 샤딩은 **BC-EVENT 1 도메인**서만 관측(degenerate). 디렉토리 스킴·AP scope 필드 = 1-datapoint. SOFT/opt-in 유지 / HARD gate·auto-split ❌ / ≥2 도메인(reservation-golf 등) corroboration 전까지 "검증됨" 주장 ❌.
- AP scope 필드 = F14 root(scope-attribution 부재) 직접 해소이나 1 PoC 설계 = 재검토 대상 명시.

## Findings (기록)

- **F-ZONE-01 (검증 성공)**: dir-스캔 검증기 3종이 모두 재귀(findJsonFiles/listJsonFilesRecursive/isDirectory) → canonical 산출물을 output/ 하위 zone 으로 옮겨도 gate#0 무영향. "디렉토리 이동만" 이 안전한 이유의 실증 근거.
- **F-ZONE-02 (S6 manifest-aware 실증)**: registerCanonicalSources 가 manifest.analysis_refs.artifacts basename 매칭으로 shared/·domains/ 추종 확인(sync_sources 경로가 zone 따라감). detectDrift 는 저장 s.path 추종이라 등록만 location-aware 면 충분 = 최소 침습.
- **F-ZONE-03 (선재 / 이번 작업 무관)**: ep-be-gea `migration-cautions.json` schema invalid — `caution_groups[0].cautions[4](MC-PRESERVE-STATE-003).evidence.detection_method="code_inspection + test_execution"` 가 enum 밖. 이전 세션 데이터 수정(git diff 280줄)에서 유입 / bc_scope·이동과 무관. 처리=별도(enum 확장 vs 값 정정 = diagnose-before-fix / 사용자 결단).
- **F-ZONE-04 (선재 latent)**: sync `CANONICAL_ANALYSIS_FILES` 에 `db-schema.json` 인데 ep-be-gea 실파일=`schema.json` → register 시 항상 skip(이동 전후 동일). 파일명 정합(G2 no-rename 위배)은 별도 과제 / 현 무회귀.

## 적대적 리뷰 (wf_bf7140f5 / 2026-06-12 / 21 findings·19 진짜·14 caused·2 HIGH)

판정: **설계 건전(read-model 위반 0·stale 중복 0·canonical-global 보존) / 구현 불완전(도구 커버리지·문서·DEC 누락)**.

- [ ] **R-HIGH-1 traceability-matrix-builder --graph zone-aware** — ANALYSIS_FILENAMES(cli.js:32-51) 평면 dir 스캔 → 이동된 architecture/domain/schema/formal-spec/error-mapping/sql-inventory/characterization 노드 조용히 누락(실측 39 vs 44). impl gate 는 --json 모드라 무영향(그래서 안 잡힘). fix = per-kind multi-candidate(dir/ , shared/ , domains/*/ +nested) OR manifest.analysis_refs 구동(aggregator 패턴). **resync 커버리지 라인에 analysis 해소 수 출력**(silent under-synth 가시화).
- [ ] **R-HIGH-2 chain-driver resync-graph** — cli.js:3024/3058 평면 --analysis-dir → R-HIGH-1 의 production 트리거. R-HIGH-1 합성기 fix 가 커버(단일 fix). + 커버리지 라인 보강.
- [ ] **R-MED-3 analysis-* skill EMIT 경로 zone 화** — SKILL.md 산출물 path 가 평면 → 다음 도메인 분석이 평면 재생성(zone 무효화). **campaign 전 필수**(doc sweep 의 핵심 = 단순 prose 아님). agents/analysis-agent.md:109 포함.
- [ ] **R-MED-4 codegraph-coverage zone-aware** — delivDir 평면 읽기(architecture/inventory/openapi) silent degrade(reference-lens 비차단). zone probe.
- [ ] **R-MED-5 bc_scope ↔ F14 정합** — DEC-2026-06-10-validator-path-convention-unify F14 가 "필드 추가 = 1-PoC 과적합 deferred" 명시 → 이번 추가가 충돌. 게다가 **0-datapoint**(미populate). 해소 = superseding DEC(SOFT·no-HARD·≥2도메인 재검토 명시 / F14 를 "필드 금지"→"필드 SOFT 허용·auto-split 보류" 로 narrow) OR 필드 보류.
- [ ] **R-MED-6 DEC 작성** — decisions/DEC-2026-06-12-artifact-zone.md 신설 + INDEX/STATUS 등록(현 인용만·파일 부재).
- [ ] R-LOW: migration-cautions warning 내 옛 BR leaf 경로 prose / business-rules-index bc_files 배열 설명 옛 예시(line 32) / README usage 평면 / FE-track 미검증 carry 명시 / bc_scope "0-datapoint" 로 §8.1 caveat 정밀화.
- 선재(비차단): domain.json·top-level 인덱스 누적 충돌(병렬 머지점) / schema.json sync drift 제외(F-ZONE-04 db-schema 파일명) / listUnbaselinedScopes 평면 guard.
- 기각: F14 prefix-guard(free BC-id string=OK) / shared/ legacy-spectrum·static-security(ep-be-gea 부재=무해).

## 완료 (2026-06-12 / v0.41.0 / 미커밋)

전 단계 + 리뷰 후속 전부 시행:
- S1~S6 ✅ / S8 ep-be-gea 이동 ✅(BR loader 36 재조립·gate 7/7·sync 재등록 추종 실증) / S8b bc_scope schema ✅(값 채움=물리 split deferred / 논리표시).
- R-HIGH-1/2 traceability-matrix-builder `--graph` zone-aware ✅(analysis 노드 39→**46** 복원 / test 179) + resync 자동 커버.
- R-MED-4 codegraph-coverage `zoneFind` ✅(test 121) / R-MED-3·5 skill EMIT sweep ✅(53 path + 3 miss fix / regression 0 / verifier clean) / R-MED-6 DEC ✅ + INDEX 등록 / R-MED-5 bc_scope F14 narrow ✅.
- R-LOW ✅: BR-index 배열 desc · bc_scope 0-datapoint 정밀화 · migration-cautions warning 경로 · FE-track 미검증 carry 명시.
- S11 ✅: plugin.json v0.41.0 + CLAUDE/README "현재 vX" + CHANGELOG [0.41.0] + DEC.
- **검증**: 방법론 테스트 무회귀(schema-validator42·drift49·br-cross32·chain-driver523·aggregator66·plan-coverage47·spec-test-link11·traceability179·codegraph-coverage121) / **release-readiness 41/42**.

## Findings (추가)

- **F-ZONE-05 (선재 / 해소 — 사용자 결단 "allow-identity 마커 보완")**: `shipped_identity_leak` — skills/ticket-sync/env-config-reference.md:71,100 의 `jira.smilegate.net`(사내 도메인) shipped 본문 노출 = release-readiness 유일 fail(선재 / 직전 "42/42" 기록 부정확 = self-recorded-fact 함정 실증). **수정**: :71 prose=인라인 `<!-- allow-identity -->` / curl 예제=`JIRA_HOST` 변수 추출 + `# allow-identity` 주석(파일 내 기존 2 마커 컨벤션 정합 / 예제 가독성 개선). → **release-readiness 42/42 release-ready**. ticket-sync=본질상 SG-MIS 사내 전용 스킬이라 도메인 노출 의도 인정(allow 정당). zone 작업과 독립. ([[internal-source-poc-external-location]])

## Lessons (실패 시 기록)

- **자기검토 편향 실증**: aggregator+sync 만 zone-aware 로 고치고 traceability-matrix-builder 그래프 합성기를 놓침. impl gate(--json 모드)가 GREEN 이라 회귀가 가려짐 → 독립 적대 리뷰가 잡음. 교훈: "게이트 GREEN" ≠ "전 경로 무회귀"(같은 도구의 다른 모드/CLI 경로 별도 확인).
- **self-recorded-fact 함정 실증**: "release 42/42"를 4 doc 에 적었으나 실측은 41/42(선재 ticket-sync leak). 측정 전 단정 금지 — release-readiness 실행 후 수치 기록. ([[feedback_self_recorded_fact_validation]])
