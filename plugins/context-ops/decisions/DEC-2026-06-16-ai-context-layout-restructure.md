# DEC-2026-06-16-ai-context-layout-restructure

**`.ai-context/` 온-디스크 레이아웃을 3-버킷(base/scopes/runtime) + 루트 싱글톤으로 재구조화 — read-alias 비파괴 (accepted / v0.48.0 MINOR)**

## 맥락 (사용자 요청 / ep-be-gea dogfood 점검)

ep-be-gea `.ai-context/`(1016파일/35 scope) 점검에서 최상위가 **평면**임이 드러남: scope dir 35개 + `output/` + `config/` + 흩어진 파일들이 한 층에 섞여 "리스팅이 지저분"하고, `listScopes()` 가 **deny-list** 라서 `config`/`evidence`/`findings` 를 scope 로 **오분류**(실증: `listScopes('poc-18')` → `["config","core","evidence","findings"]`). 더해 `output/` 이라는 이름이 "한 번 뱉고 버리는 빌드 결과물"을 연상시켜, 이 디렉토리의 정체성(P1 "평생 유지·동기화되는 LLM 운영 컨텍스트 = base")과 **이름이 충돌**.

## 사실 확인 (결정론 / 추정 ❌)

- **레이아웃 SSOT** = `tools/chain-driver/src/state-store.js`(ensureAimdDir·scopeDirPath·ensureScopeDir·writeManifest/readManifest·listScopes·intervention 기본값).
- 영향 범위 = 코드 ~18 파일/~81 하드코딩 + 테스트 29파일/~198단언 + 문서/스킬/스키마 ~129파일/867참조.
- **재사용 자산**: `findings-aggregator` `resolveChainArtifact()`(이미 new→old existsSync 폴백) = alias 선례 / `_shared/project-root.js` `resolveProjectRoot()` 는 `/.ai-context/` **부모**를 키로 잡아 **이미 layout-agnostic**(base/·scopes/ 무변경 작동 / 코드 변경 0 — 테스트 lock 만).
- 스키마는 path 문자열을 **강제하지 않음**(문서용) → 인스턴스 reject 위험 0.
- 산출물 정체 확인: `context-cache.json` = `meta.derived_from` 이 해당 scope 의 `impl/artifact-graph.json` → **per-scope 파생물**(scope 내 유지). `baseline-*.json`·`HANDOFF.md` = 스킬 컨벤션상 **커밋되는 정식 산출물**(루트 싱글톤). `*-char-test-aggregate.xml` = dogfood 캠페인 스크래치(플러그인 참조 0 / 레이아웃 무관).

## 결정 (사용자 확정 2026-06-16)

1. **3-버킷 + 루트 싱글톤**:
   - `base/` (was `output/`) — analysis 정본: `shared/` · `domains/BC-*/` · index json(business-rules/antipatterns/migration-cautions).
   - `scopes/<scope>/` (was 최상위 평면) — work-unit: `manifest.json` + `discovery|spec|plan|test|impl/` (+ `impl/context-cache.json`).
   - `runtime/` (신규) — 휘발/운영: `config/` · findings-*.json · `intervention-log.jsonl` · `tool-runs/` · `evidence/` · `layer-2-results/` · `baseline-evidence/` · `cascade-plan.json`.
   - 루트 싱글톤: `state.json` · `input.json` · `HANDOFF.md` · `baseline-*.json`.
2. **read-alias 불변식** (비파괴): 경로 구성 SSOT = 신규 `tools/_shared/ai-context-layout.js`. `*Path(...)` = 쓰기(항상 NEW) / `*ForRead(...)` = 읽기(NEW 존재 시 NEW, 없으면 OLD 폴백, 둘 다 없으면 NEW). 배포된 구 `output/`·최상위 scope 디스크 **무손상** → semver **MINOR**(state schema version 불변 / additive).
3. **listScopes deny→allow**: NEW 레이아웃은 `scopes/` 직접 readdir(allow-list) → config/evidence/findings 오분류 **구조적 제거**. OLD 폴백 분기는 deny-list 정밀화(base/runtime/scopes/evidence/findings 등 제외) 보존.
4. **hooks-bridge 차단 확대**: `state.blocked` 시 Write 차단을 `output/` 한정 → **`.ai-context/` 전체**(base/scopes/runtime + Windows 백슬래시) — 우회 방지.
5. **migrate-layout 커맨드**(신규 `chain-driver migrate-layout <project> [--dry-run]`) = 구 디스크 인플레이스 컷오버(멱등·dry-run·충돌거부·state intervention_log_path 갱신+이벤트). 기존 `migrate`(state schema 버전)와 직교. **auto-run ❌**(alias 가 자동이주 불필요화 / 명시 도구).

## 대안 (기각)

- **최소안(base 개명만)** — scope wrap·listScopes 결함 미해소(기각: 결함 잔존).
- **하드 컷오버(alias 없이)** — 배포 디스크 즉시 파손 = MAJOR + 강제 마이그레이션(기각: 재작업 최소화 위배).
- **project-root.js 변경** — 불필요(이미 layout-agnostic / 테스트 lock 만).

## 구현 (v0.48.0)

7-phase + 단계별 게이트: ①모듈+34테스트 ②project-root lock ③state-store SSOT+schema ④chain-driver 소비자(cli/hooks/sync) ⑤주변 도구 10종 ⑥migrate-layout+8테스트 ⑦문서 sweep(110파일 결정론 perl 치환 / runtime-vs-base 분기 순서 인코딩 / decisions·examples·CHANGELOG 역사 보존). **전체 1867+34 테스트 GREEN / output 잔여 0**. anti-false-green: 읽기-alias 테스트마다 "쓰기는 NEW, OLD 부재" 음성 단언 페어링.

## 범위 밖 (후속 별도 결단)

ep-be-gea 1016파일 실이주(`migrate-layout` 실행) + `*-char-test-aggregate.xml` 스크래치 청소 + `RESVE-FULLCHAIN-HANDOFF.md`→`HANDOFF.md` 정합 = 본 플러그인 작업 완료 후 사용자 승인 게이트.

Relates: `methodology-spec/lifecycle-contract.md`(File Location Convention) · `id-conventions.md`(scope §) · DEC-2026-06-15-bc-verdict-classification(per-BC 샤딩 선행) · feedback `db_always_on`·`diagnose_before_design_check_existing`(baseline→runtime 정정 = 기존 스킬 컨벤션 실측 후 교정).
