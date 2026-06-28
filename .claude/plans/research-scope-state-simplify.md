# research — scope_states 제거 / chain 상태 단순화 (§2)

> 4원칙 §2 에이전트 팀 토론. Senior 적대 검토 + 산업 선례 2병렬. 2026-06-25.
> 짝 plan: `plan-scope-state-simplify.md`

---

## 결론 한 줄

방향(D1)은 실측상 타당하나 **plan 그대로 착수하면 재작업** — Senior **REVISE**. 두 검토가 같은 급소로 수렴: **① 起動 reconcile 타이밍 미정의 ② SSOT(manifest) 부재 시 fallback 미정의**.

## A. Senior 적대 검토 (코드 직독 / grep+Read / no-tool-sim)

**plan 의 실측 오류 3건 (이게 REVISE 사유):**

1. **revisit baseline = dead field.** `git_baseline_sha` 는 **write 되는 곳이 0**, read 2곳(cli.js:537·2169) 모두 `|| 'HEAD~1'` fallback. 현 revisit 은 항상 HEAD~1. → plan §6-3 "baseline 전역화 오작동" 은 **존재하지 않는 위험**. schema 2.0 에서 제거 + finding 등록으로 재분류.
2. **마이그레이션 "손실 0" 은 거짓 (task 포인터).** `MIGRATIONS` 프로덕션 비어있음(test만 2.0→3.0). `current_task` 가 `scope_states[scope]` 내부에 살고 enter/finish/clear-task 3 커맨드가 `ac.scoped` 게이트로 소비(cli.js:3746/3862/3991). 비활성 scope 의 current_task 는 manifest 에 없어 **손실 불가피**. → "진행위치 손실 0 / task 포인터는 archive" 로 정정.
3. **역방향 stage 매퍼 부재.** manifest enum 은 `impl`+`implement`, `discovery`+`planning` 양쪽 허용. `stageToManifestStage` 는 `implement→impl` 단방향뿐(cli.js:65). manifest→chain 역매퍼 없음. → S1 에 역매퍼 신설 필수(plan 누락).

**위험도 매트릭스:**

| # | 항목 | 위험 | 권고 |
| --- | --- | --- | --- |
| 1 | **analysis-무-manifest 갭** | **H** | `MANIFEST_STAGES` 에 analysis 없음. greenfield/pre-discovery 는 `current_chain='analysis'` 인데 유도 소스 구조적 부재. → 3단 fallback: ①scope+manifest→유도 ②scope+무manifest→lazy-seed후유도 ③scope=null→`analysis` 하드디폴트 |
| 2 | non-scoped compat | M | 전역 `current_chain/stage_progress` **남겨야** (analysis는 manifest 없음). D3=강제❌ |
| 3 | revisit baseline | L | dead field. 위험 무효(위 오류 1) |
| 4 | derived reconcile | **H** | reconcile = 起動 1곳(readState 직후). 역매퍼 신설. plan S1 누락 → slice 추가 |
| 5 | 마이그레이션 손실 | **H** | `1.0->2.0` 명시 등록 + current_task 흡수 + 비활성분 intervention-log archive |

**설계 결정 권고:**
- **D2 = `current_chain` 캐시 유지 + 起動 reconcile.** analysis 단계는 manifest SSOT 가 없어 완전 유도 불가 — 캐시가 analysis 의 유일 진실 소스.
- **D3 = non-scoped 전역 모드 1급 유지.** 강제 시 greenfield/analysis 붕괴(2순위 위반).

**놓친 리스크:**
- **§8.1 과적합** — body(schema/state-store/cli) **breaking 격상**은 ≥2 PoC corroboration 의무(CLAUDE.md §8.1). plan §5 "윤주스 1건이면 충분" 은 격상 근거 부족. **S5 dogfood 에 ≥2 PoC(poc-17/poc-18 등) 실 state.json round-trip(init→next×N→migrate→derive) 회귀** 필요.
- (미확인) hooks-bridge.js 본문 reconcile 영향 — 시그니처만 봄. 정밀 평가 시 본문 read 권고.

## B. 산업 선례 (1차 출처 fetch / version-pinned / F-015)

| 도구 | SSOT vs 커서 | 교훈 |
| --- | --- | --- |
| **Git** (v2.x internals) | objects(content-addressed)=SSOT / HEAD·refs=포인터 커서 / index=쓰기버퍼 | `git status` 처럼 起動 시 SSOT→커서 재유도가 자연. refs=lightweight pointer 패턴과 우리 "manifest=SSOT + 커서" 정확히 대응 |
| **Terraform** (v1.x) | tfstate=SSOT / in-memory refresh=휘발성 / lock=동시writer 별도채널 | "reconcile은 read-only 먼저, 쓰기는 commit 완료 후만"(refresh-only→apply 분리). 커서 갱신은 stage 완료 후 manifest commit 으로만 |
| **LSP** (3.17) | didOpen 후 in-memory=master / didClose 시 디스크 복귀 / version=null이면 디스크 master | **커서 유효구간을 명시 이벤트로 경계.** 우리 = "起動 reconcile~프로세스 종료" 가 커서 소유구간, 그 밖은 manifest 가 master 라는 계약을 코드에 명시 |

출처: git-scm.com/book/en/v2/Git-Internals-Git-Objects · developer.hashicorp.com/terraform/language/state(+/locking, tutorials/state/resource-drift) · microsoft.github.io/language-server-protocol/specifications/lsp/3.17

**공통 함정 (두 함정으로 수렴):**
- **reconcile 타이밍 미정의** — 성능상 skip/캐시단락 시 SSOT 변경돼도 커서 stale (Terraform refresh deprecation 배경).
- **SSOT 부재 fallback 미정의** — manifest 없거나 손상 시 "0단계 초기화 vs fail-closed" 미정의면 silent loss/중복실행 (Terraform local state 분실 = 파괴적).
- stale cursor after external write(병렬 브랜치 체크아웃) / 같은 브랜치 병렬 실행 동시 writer(우리는 워크트리 격리로 위임하나 동일브랜치 병렬 시 재발).

**종합: 청신호 (업계 표준 패턴).** 단 두 계약 필수 — ① 커서 접근 전 reconcile 완료 강제(skip 금지) ② SSOT 부재 시 명시 fail-closed/fallback.

## C. 합성 — plan 에 반영할 것

1. §3 목표: "완전 유도" → **"current_chain 캐시 + 起動 reconcile"** (analysis 갭 때문). D2 확정.
2. §6-3(revisit baseline) 삭제 → schema 2.0 에서 dead field 제거 + finding 등록.
3. §5 마이그레이션: "손실 0" → **"진행위치 손실 0 / current_task 비활성분 archive"** + `1.0->2.0` 명시 등록 + current_task 전역 흡수.
4. §7 slice: S1 에 **역방향 stage 매퍼** + migration 명시 / **起動 reconcile chokepoint slice 신설**(readState 직후) / 3단 fallback(analysis 하드디폴트 포함).
5. §6 신규: **analysis-무-manifest 갭**(H) 명문화.
6. §5/S5: **≥2 PoC round-trip 회귀**로 격상 근거(§8.1) — 1건 마이그레이션 검증 ≠ 격상.
7. 계약 2종(LSP/Terraform 차용): 커서 접근 전 reconcile 완료 강제 + SSOT 부재 fail-closed.
8. D3 확정: non-scoped 1급 유지.
