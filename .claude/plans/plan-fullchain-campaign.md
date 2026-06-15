# plan — ep-be-gea full-chain 캠페인 (나머지 26 BC × chain 1~5)

> 목적: analysis-only 26 BC 에 full chain(discovery→spec→plan→test→implement) 적용.
> 대상 레포: `/Users/sangcl/Documents/Development/Products/ep-be-gea` (branch `feature/context-ops-test`) — 이하 $GEA.
> 템플릿 SSOT: golf full-chain (`$GEA/.ai-context/resv-golf/{discovery,spec,plan,test,impl}/`) + `RESVE-FULLCHAIN-HANDOFF.md`.
> 환경: JDK17(/opt/homebrew/opt/openjdk@17) + gradlew + /tmp/gea-test.init.gradle 확인됨 → chain 4/5 실 JUnit 가능.

## ★★★ 현재 상태 (2026-06-16) — 생성 100% + Phase 2 통합 100% + GHE push 완료 (캠페인 종료)

> 옛 "16/10" 표기는 superseded. 2026-06-16 통합·push 모두 완료. 실측 기준 현재 상태:

- **체인 생성 = 4 worktree 전부 완주** (마지막 req-stdpkng·biztrip-before 2026-06-15 22:33~22:43 종료 / verdict=pass-with-carries / 날조0).
- **no-fabrication 감사 통과**: real TC 277(result_hash) / pending carry 976 / **위반 0**.
- **Phase 2 통합 = 22 BC 전부 `feature/context-ops-test` 통합 완료** (2026-06-16 / HEAD `e7bd90a2a9`).
- **GHE push 완료** (`c5d1e5d387..e7bd90a2a9` / origin 동기화 ahead0·behind0). **캠페인 종료** — 잔여 backlog = 엔진 per-BC test-class 네임스페이싱(아래 ② / `decisions/finding-ledger.md` **F-DOGFOOD-017** promoted 등재).

### ▶ 통합 결과 (2026-06-16 / 완료)
worktree 별 커밋 후 cherry-pick. base = `bc2f223b4c`(main-4bc) 위 5 cherry-pick:

| cherry-pick → feature/context-ops-test | worktree commit | BC scope |
|---|---|---|
| `1a15e446be` | `d8ce8e5194`(wt1) | issue-secom · issue-visitor · wlfr (3) |
| `b0fe9a26b6` | `3994176b5f`(wt2) | common-calc · employee · hlum-admin · notification · reqmng (5) |
| `9e1e18a62e` | `912ba1772e`(wt3) | biztrip-report · biztrip-settlement · req-bizcard · req-bookreq · req-empcard · req-iteqmt · req-stdpkng (7) |
| `1eb48a530a` | `ebd6d94654`(wt4) | biztrip-admin-request · biztrip-before · biztrip-executive · biztrip-request · eam · req-visitprkng (6) |
| `e7bd90a2a9` | `838728b067`(wt4) | issue-acm (1) — FQN 충돌 rename 해소 |
| **합계** | | **22 BC** |

**통합 시 확정/수정 사항(plan 초안 narrative 정정)**:
- ① `output/` "빈/제외" 단순화는 부정확했음 — Phase 1(`bc2f223b4c`)이 `output/domains/BC-*/domain.json`(use_cases backfill, per-BC additive) + `output/shared/domain.json`(35 BC rollup) + `output/evidence`를 실제 커밋. **확정 scope**: `output/domains/BC-*`는 포함(per-BC, 충돌0), `output/evidence`(공유 단일경로 → 4-way 충돌)는 제외(per-BC evidence 는 각 leaf `test/evidence/` 에 보존), `output/shared/domain.json`은 worktree 무변경(이미 35 BC rollup 완료·커밋 → **추가 sync 불요**).
- ② "BC별 경로 상이 → 충돌0" 위반 1건 발견 = **신규 dogfood finding**: issue-visitor(wt1)·issue-acm(wt4)가 공유 서비스 `FoEntranceAuthorityVisitorRequestRestService` 에 동일 FQN char-test 생성 → 충돌(캠페인 엔진 per-BC test-class 네임스페이싱 부재). 사용자 결정 = **클래스 rename 공존**: issue-acm 본을 `...PiiMaskingCharacterizationTest` 로 rename → 11 TC(lifecycle, wt1) + 3 TC(PII, issue-acm) 모두 보존. 생성 산출물/evidence 는 원본(충돌)명 보존(no-fabrication). 상세 = `$GEA/.ai-context/issue-acm/INTEGRATION-NOTE.md`. → 엔진 개선 backlog.

**상태**: GHE push 완료(`c5d1e5d387..e7bd90a2a9`)로 worktree 보존 조건(push 확인 전) 충족 → `ep-be-gea-wt1~4` 이제 제거 가능(사용자 결정 대기 / 현재 미제거 보존). `tools/context-ops-audit/`는 캠페인 커밋서 제외 유지(별도 영역, 미트래킹).

## 환경 readiness (확인)
- ✅ JDK 17.0.19 / gradlew / init.gradle / NEXUS_USERNAME=anonymous NEXUS_SECRET=anonymous
- scope 네이밍: scope = BC suffix 소문자 (aggregator `BC-${scope.toUpperCase()}`). 예 BC-RESV-BASE → scope `resv-base`.

## 우선순위 (BR 수 기준 + 리스크)

**Wave 1 — pilot (resve family 완성 / golf 템플릿 직결)**
1. BC-RESV-BASE (9 BR) ← 현재 pilot
2. BC-RESV-ATHRT (9 BR)

**Wave 2 — 중간규모·고가치** (biztrip 6 / EAM 30 / EAPRV 17 / issue 3 / req 6 / NOTIFICATION 12 / EMPLOYEE 12 / COMMON-CALC 12 / BATCH-BIRTHDAY 8)

**Wave 3 — 대형 (파이프라인 검증 후, 분할 가능)**: WLFR 125 · HLUM-ADMIN 60 · REQ-STDPKNG 59 · REQMNG 36 · BIZTRIP-SETTLEMENT 31

## chain 별 산출물 + gate (golf 미러 / handoff §3)
- chain1 discovery → `<scope>/discovery/discovery-spec.json` — gate#1: discovery-extraction + schema + br-cross
- chain2 spec → `<scope>/spec/{behavior-spec,acceptance-criteria}.json` — gate#2: chain-coverage + drift + formal-spec-link + schema
- chain3 plan → `<scope>/plan/task-plan.json` — gate#3: plan-coverage + schema
- chain4 test → `<scope>/test/test-spec.json` (+evidence/) — gate#4: test-impl-pass + spec-test-link(--acceptance --test-spec --behavior) + schema. 실행가능 TC=실 JUnit RED, 불가=pending carry(날조❌)
- chain5 implement → `<scope>/impl/{impl-spec,matrix,artifact-graph}.json` — gate#5: test-impl-pass + static-runner + traceability-matrix-builder(--scope-id) + graph-integrity + schema

## gate 실행 (scope 임시 주입 / handoff §4)
findings-aggregator 가 state.json.current_scope 로 scope 해석 → 임시 주입 후 복원 의무.

## 정직 규약
- no-simulation(R19): 실행 못 한 test GREEN 날조 ❌. god-method·SQL-embedded 깊은가드 = pending carry.
- 검증기 > 액면수용: chain agent self-report 재실행 검증 의무.
- 품질1/재작업2/§8.1 과적합 회피.

## 진행 로그
- [x] Wave1-1 BC-RESV-BASE: chain1~5 ✅ (실 JUnit 11/11 fail0 / verify pass-with-carries 날조0 / carry 3 TC pending). pilot — 파이프라인 검증 + 본체 v0.46.6 폭로.
- [x] Wave1-2 BC-RESV-ATHRT: chain1~5 ✅ (범용 엔진 fullchain-bc.mjs / use_cases backfill→gate#1 100% / 실 JUnit 12 method fail0 / matrix→traceability-matrix.schema.json v0.46.6 확인 / graph orphan0 / verify pass-with-carries 날조0 / carry 2 TC[operateAssetFavorite god-method·setAssetFavorite 비결정] pending). manifest stage→implement 갱신. **→ resve family 7/7 완성**.
- [x] Wave1-3 BC-BATCH-BIRTHDAY: chain1~5 ✅ (token=BATCHBIRTHDAY / 실 JUnit 8/8 fail0 sha256 일치 / matrix v0.46.6 auto-route / graph orphan0 / verify pass-with-carries 날조0 / carry 2 TC[LocalDate.now god-method·recursive CTE SQL-embedded] pending). → **내 3 gap BC(BASE·ATHRT·BIRTHDAY) 전부 full chain 완성**.
- [x] Wave2-1 BC-EAPRV: chain1~5 ✅ (전자결재 엔진 / 세션한도로 test 중단→**resume 성공**[wf_d439e673-e07 캐시 재사용] / verify pass-with-carries 날조0 / use_cases 보유=backfill skip 확인). 메인 repo 미커밋.

## ★ 병렬 worktree 배치 (나머지 22 BC / 2026-06-15)
4 git worktree(`ep-be-gea-wt1~4` / branch campaign/fullchain-wt1~4 / base ddea2fb49b) + 배치 워크플로 `fullchain-batch.mjs`(repoRoot 파라미터화 / per-BC-leaf gate·backfill[shared 무접촉] / worktree-격리 state.json / BC당 stop 시 다음 BC 계속).
- WT1 `wf_b49450c2-374` (3 BC): issue-secom · issue-visitor · **wlfr(125 BR=최대)**
- WT2 `wf_8a8814a7-5a1` (5 BC): common-calc · employee · notification · reqmng · hlum-admin
- WT3 `wf_52f2c92e-5f3` (7 BC): req-bookreq · biztrip-report · req-bizcard · req-iteqmt · req-empcard · biztrip-settlement · req-stdpkng
- WT4 `wf_24173bcf-431` (7 BC): req-visitprkng · biztrip-executive · issue-acm · biztrip-request · biztrip-admin-request · eam · biztrip-before
충돌 제거: ① runner worktree-relative(PROJ=스크립트위치 / 각 worktree 자기 build/) ② backfill·gate=per-BC-leaf만(shared/domain.json 무접촉 → merge 충돌0). 12 cores → 4 병렬 gradle 여유.
머지 전략(캠페인 후): worktree별 .ai-context/<scope>/ + 테스트 .java = BC별 상이 경로 → 클린. shared/domain.json use_cases 일괄 sync = 메인서 1회(leaf SSOT→shared rollup). 그 후 worktree remove.

## ep-be-gea config fix (BIRTHDAY gate 폭로 / 23 BC 공통)
- **test-cmd.json 결함**: 러너 `run-resve-char-tests.sh` 가 PROJ=`ep-be-gea-resve-domains`(**사라진 worktree 클론**) + resve 전용 → 비-resve scope 의 gate#5 Step-1(`--allow-execute`)이 wrong-suite 실행 → test-impl-pass-validator non-authoritative(per-TC actual:null). gate agent 가 직접 gradle 로 GREEN 확증해 워크어라운드했으나 매 BC HIGH 재발.
- **fix**: `run-char-tests.sh`(scope-aware / 메인 레포 PROJ / state.json.current_scope→test-spec source_file 에서 *CharacterizationTest 클래스 자가도출 → 그 클래스만 실행 / JAVA_HOME·NEXUS export) + test-cmd.json report_path=gradle test-results 디렉토리(reconcile=TC-id 매칭이라 타 scope XML 무시). **smoke test 통과**: resv-base 주입→BoResveRestServiceCharacterizationTest 만 실행 BUILD SUCCESSFUL/aggregate 11 fail0. ep-be-gea 커밋 대기(GHE).

## 범용 엔진 정착 (fullchain-bc.mjs)
- args={scope,bc,token,service} 파라미터화 (하네스가 args 를 string 으로 전달 → 스크립트 `JSON.parse` 보강).
- Discovery(chain1)+use_cases backfill(16 BC 공통 역동기화)+gate#1 → Spec/Plan/Test(실 JUnit)/Implement(matrix+graph)/Verify. 각 stage 독립 gate + 1회 repair retry.
- 카덴스: BC당 ~1hr wall-clock / ~3.6M tokens / gradle 충돌 회피 위해 **순차**(병렬 시 build/test-results clobber — worktree 격리 필요).

## 재발 관측 (방법론 명료성 / 비차단)
- matrix.json 이 pending TC 행도 status='green' 표기 (green=link-coverage 기준이지 execution 기준 아님). BASE+ATHRT 둘 다 verify 가 지적 = 2-datapoint. builder 결정론 출력(byte-identical)이라 날조 아니나 리뷰어 오독 위험 → matrix 의미(linkage) vs test-spec(execution) split 문서화/별 axis 권고 (§8.1 design-clarity / 캠페인 중 누적 → 별도 결단).
- discovery-extraction-validator BR-source shape 인식 invocation-sensitive (ATHRT verify 가 1 HIGH 오탐 보고 / gate 호출에선 LOW) — 검증기 robustness carry.

## 본체 finding (pilot 폭로 / strict 검증 = drift 노출)
- **F-BODY-1 (medium / systemic)**: traceability-matrix-builder/src/builder.js:225-265 가 top-level {derived_from, do_not_edit_manually, matrix, coverage_summary} emit ↔ traceability-matrix.schema.json required:["meta","matrix","coverage_summary"]+additionalProperties:false. 빌더 산출이 자기 canonical schema FAIL. golf 포함 10 full-chain BC 전부 동일. → 빌더↔스키마 SSOT 정렬 필요.
- **F-BODY-2 (low)**: 산출 파일명 matrix.json → schema-validator auto-route 가 matrix.schema.json(미존재) 매핑→skip(false-green). canonical=traceability-matrix.json 으로 정합 필요.

## ★★ 다음 세션 재개 핸드오프 (2026-06-15 15:36 중단 / 사용자 "다음 세션에서")

**진척: 26 analysis-only BC 중 16 완료 / 10 잔여.**

### 완료 16 BC (full chain 1~5 / 재실행 ❌)
- 메인 repo `ep-be-gea`: resv-base · resv-athrt · batch-birthday · eaprv (4)
- WT1 `ep-be-gea-wt1`: issue-secom · issue-visitor · wlfr (3)
- WT2 `ep-be-gea-wt2`: common-calc · employee · notification (3)
- WT3 `ep-be-gea-wt3`: req-bookreq · biztrip-report · req-bizcard (3)
- WT4 `ep-be-gea-wt4`: req-visitprkng · biztrip-executive · issue-acm (3)

### 잔여 10 BC (다음 세션 대상 / matrix.json 부재로 미완주)
| worktree | BC (scope) | 비고 |
|---|---|---|
| wt2 | reqmng(36 BR) · hlum-admin(60) | reqmng 중단 시 DS까지 / 둘 다 처음부터 |
| wt3 | req-iteqmt · req-empcard · biztrip-settlement(31) · req-stdpkng(59) | iteqmt DSP까지 |
| wt4 | biztrip-request · biztrip-admin-request · eam · biztrip-before | request DSP까지 |

### ▶ 라이브 재개 (2026-06-15 ~18:05 / 새 세션 디스크 기반 배치 / 3 Workflow 병렬 launch)
이전 세션 wf(`wf_b49450c2` 등) 은 세션 종료로 사망(same-session-only). 새 세션에서 `fullchain-batch.mjs` 잔여 10 BC 재launch:
- **wt2** `wf_d275bcc0-4ba` (task w4nc754b4): reqmng · hlum-admin
- **wt3** `wf_85af946b-6d5` (task w0o6th9gc): req-iteqmt · req-empcard · biztrip-settlement · req-stdpkng
- **wt4** `wf_6c0189dc-64c` (task wgbvqa4lx): biztrip-request · biztrip-admin-request · eam · biztrip-before

환경 preflight 통과(`/tmp/gea-test.init.gradle`·JDK17.0.19·worktree state.json·analysis leaf 전수 present). 일부 BC leaf json 1~2개(biztrip-settlement/admin-request/before/request) = discovery gate 약체 가능 → per-BC stop-and-continue. 진행=`/workflows` / 완료 시 task-notification. **세션 또 끊기면 동일 절차로 재launch**(resumeFromRunId 불가).

### 재개 방법 (★ resumeFromRunId 는 same-session-only → 안 됨 / 디스크 기반 새 배치)
1. **worktree 보존 의무**: `ep-be-gea-wt1~4` 절대 remove ❌ (완료 BC 산출물 미커밋 — working tree 에만 존재). git worktree list 로 확인.
2. 부분 진행 BC(reqmng/req-iteqmt/biztrip-request)는 **처음부터** 재실행(배치가 BC 단위 chain1부터 / 기존 부분 산출물 덮어씀 — 무해).
3. 재개 = `fullchain-batch.mjs`(`.claude/workflows/`) 에 잔여 BC 만 args 로:
   - wt2: `{"repoRoot":".../ep-be-gea-wt2","bcs":[{"scope":"reqmng","bc":"BC-REQMNG"},{"scope":"hlum-admin","bc":"BC-HLUM-ADMIN"}]}`
   - wt3: `{"repoRoot":".../ep-be-gea-wt3","bcs":[{"scope":"req-iteqmt","bc":"BC-REQ-ITEQMT"},{"scope":"req-empcard","bc":"BC-REQ-EMPCARD"},{"scope":"biztrip-settlement","bc":"BC-BIZTRIP-SETTLEMENT"},{"scope":"req-stdpkng","bc":"BC-REQ-STDPKNG"}]}`
   - wt4: `{"repoRoot":".../ep-be-gea-wt4","bcs":[{"scope":"biztrip-request","bc":"BC-BIZTRIP-REQUEST"},{"scope":"biztrip-admin-request","bc":"BC-BIZTRIP-ADMIN-REQUEST"},{"scope":"eam","bc":"BC-EAM"},{"scope":"biztrip-before","bc":"BC-BIZTRIP-BEFORE"}]}`
   (3 Workflow 병렬 launch / token=BC suffix / service 생략 가능=test-spec 자가도출)
4. **gradle 환경**: JAVA_HOME=/opt/homebrew/opt/openjdk@17 + NEXUS anonymous (러너가 export / 검증됨).
5. **graph-synthesizer fix(v0.46.7) 이미 커밋(`3ff06e67`)** → 잔여 BC 는 graph-integrity orphan repair 없이 통과.

### ★ 브랜치 정리 완료 (2026-06-15 Phase 1 / 데이터손실 0)
ep-be-gea 브랜치 위생 정리됨 (사용자: "캠페인은 context-ops-test 로 다 모은다 / MIS-284 는 기능 개발만 한 것으로 끝"):
| 브랜치 | sha | 내용 |
|---|---|---|
| **`feature/context-ops-test`** (메인 체크아웃) | `bc2f223b4c` | config 러너(`b0c7276691` cherry-pick) + **메인 4 BC full-chain 산출물**(resv-base·resv-athrt·batch-birthday·eaprv / `bc2f223b4c`) + gap-3bc(`3733818dfb`). origin 대비 **ahead 38**(push 대기/망). |
| **`feature/MIS-284-notification-after-commit`** | `3f4a145f1e` | **기능 커밋만**(wlfr 알림 @TransactionalEventListener). config·캠페인 흔적 0. **origin 과 동기**(sha 동일 → push 불필요). |
| `campaign/fullchain-wt1~4` | `ddea2fb49b` | base(config 러너 포함) + 16 BC uncommitted(Phase 2 통합 대상). |

- 정리 절차(복구 가능 명령만): stash -u → context-ops-test 전환 → `cherry-pick ddea2fb49b`(config) → stash pop → 4 BC 산출물 커밋 → `branch -f MIS-284 3f4a145f1e`(config 분리). `reset --hard` 미사용.
- config 원본 `ddea2fb49b` 는 campaign/* 4 가 참조 → GC 안전.
- **`ep-be-gea/tools/context-ops-audit/`** = 별도 작업(.ai-context 트리 정합 감사 1회용 도구) → untracked 유지, 캠페인 커밋서 제외. (companion-mcp 계열 / 사용자 별도 작업 영역).
- ★ 다음 세션 메인 repo 는 `feature/context-ops-test` 체크아웃 상태 — Phase 2 통합도 이 브랜치로.

### 캠페인 후 머지/정리 (전체 26 완료 시)
- 각 worktree `.ai-context/<scope>/` + 신규 테스트 `.java` = BC별 상이 경로 → 메인 머지 클린.
- shared/domain.json use_cases = 메인서 일괄 sync(leaf SSOT→shared rollup / 캠페인 중 per-BC-leaf 만 수정해 충돌 0).
- 머지·커밋(ep-be-gea GHE) 후 `git worktree remove ep-be-gea-wt1~4` + branch `campaign/fullchain-wt1~4` 삭제.
- ep-be-gea config(`run-char-tests.sh`) 는 context-ops-test 에 `b0c7276691` 로 커밋됨(MIS-284 의 `ddea2fb49b` 에서 cherry-pick).

### 미커밋/미해결 carry
- **메인 4 BC 산출물 = context-ops-test `bc2f223b4c` 로 커밋 완료**(Phase 1). WT 완료 12 BC 산출물 = worktree uncommitted(Phase 2 통합 대상). 둘 다 GHE push 대기(망 / context-ops-test ahead 38).
- companion-mcp draft(`2999ab23`) findings-aggregator·chain-driver 4 test fail = **별도 작업 영역**(사용자 지시 미접촉 / 캠페인 gate 무관).
- 누적 관측(비차단): matrix.json 이 pending TC 행도 status=green(link-coverage 기준 / execution 아님 / verify 가 매번 지적) — 캠페인 후 matrix 의미 split 문서화 결단 후보.

## Lessons Learned
- pilot 성공: chain 2~5 + 실 JUnit RED/GREEN + 적대검증 파이프라인 작동. repair 루프 유효(graph orphan 자동 해소).
- use_cases[] backfill = 16 BC 공통 선행작업(discovery 도출 UC → domain.json 역동기화). 캠페인 표준 편입.
- strict explicit schema 검증이 10 BC latent matrix drift 폭로 = 본체 우선 처리 대상(feedback_methodology_body_priority).
