# Plan — 패키지 매니저 npm → pnpm 전환

> 작성 2026-06-08 / 4원칙 1단계(깊은 숙지) + 2단계(research) 산출물.
> 관련 memory: [[project_pnpm_migration_intent]] · [[project_source_npm_bundled_deps]] · [[feedback_research_fact_validation]]

## 0. 목표 & scope

본 모노레포의 개발/빌드/배포 패키지 매니저를 **npm → pnpm 으로 전환**한다. 단, **사내 Nexus `source:npm` 배포 채널(npm-hosted publish + serving-static 카탈로그)은 그대로 유지** — pnpm 은 빌드/설치 측 도구일 뿐 publish 레지스트리 프로토콜·플러그인 설치 메커니즘은 불변.

**scope IN**: 루트 workspace 정의 / lockfile / 배포·검증 스크립트 / CI / git hook / 배포 문서.
**scope OUT**: 플러그인 런타임 동작, 산출물 스키마, chain harness 로직, `examples/poc-*/`(워크스페이스 멤버 아님 — glob 비매칭).

## 1. 절대 제약 (불변식 — 위반 시 전환 실패)

1. **bundledDependencies 가 publish tarball 에 동봉돼야 한다.** `source:npm` 설치는 deps 를 install 하지 않으므로, ajv·ajv-formats·fast-xml-parser(+ transitive 5 = 8 packages)가 tarball 의 `node_modules/` 에 실제로 들어가야 검증 도구가 사용자 머신에서 실행됨. **이게 깨지면 v0.19.1 raw-publish 결함 재현.**
2. **Node ≥18 호환 유지** (engines / 사내 사용자·CI). → pnpm **11 금지**(Node 22+ 강제), **pnpm 10.x 핀**.
3. **버전 3-way sync(plugin.json ↔ package.json ↔ CHANGELOG)** 와 release-readiness 게이트는 전환 후에도 동일하게 동작.

## 2. 현 npm 표면 인벤토리 (변경 대상 전수)

| # | 자산 | 현재(npm) | 전환 후(pnpm) |
|---|---|---|---|
| 1 | 루트 `package.json` `"workspaces"` | `["plugins/*","plugins/*/tools/*"]` | **삭제** → `pnpm-workspace.yaml` 로 이전 |
| 2 | `pnpm-workspace.yaml` | 없음 | **신설** (`packages: [plugins/*, plugins/*/tools/*]`) |
| 3 | lockfile | `package-lock.json`(커밋됨) | **삭제** → `pnpm-lock.yaml`(커밋) |
| 4 | `node-linker` | (npm flat 기본) | 루트 `.npmrc` 에 `node-linker=hoisted` **신설** (bundledDeps 안전) |
| 5 | `packageManager` 필드 | 없음 | `"pnpm@10.x"` 추가 (+ corepack) |
| 6 | `scripts/publish.js` | `npm install --no-workspaces` + `npm publish --no-workspaces` | `pnpm install`(hoisted) + `pnpm publish --no-git-checks` (plugin dir) |
| 7 | `release-readiness.js` check#11 | `spawnSync('npm',['test','--workspaces','--if-present'])` | `pnpm -r --if-present test` |
| 8 | 루트 `package.json` scripts | `npm run test --workspaces` 등 | `pnpm -r test` 등 |
| 9 | CI `.github/workflows/drift-check.yml` | `setup-node cache:npm` + `npm install` + `npm test --workspace=…`(경로 `plugins/plugins/…` 버그) | `pnpm/action-setup`(먼저) + `cache:pnpm` + `pnpm install --frozen-lockfile` + `pnpm --filter <name> test` |
| 10 | `scripts/githooks/pre-push` | `npm run test:release` | `pnpm run test:release` |
| 11 | 배포 문서 | `INSTALL-npm.md`·`docs/deploy/nexus-setup.md`·`.npmrc.template` (npm 명령 + stale 플러그인명) | pnpm 명령으로 갱신 + 플러그인명 `context-ops@mis-plugins` 정정(보류분 동시 처리) |
| 12 | 메시지 문자열 | `publish.js`/`build-catalog.js` 안내문 "npm run …" | "pnpm …" |

- **툴 간 상호 의존 없음**(`workspace:`/`file:` 0건) → `workspace:` 프로토콜 치환 불필요 = 전환 단순.
- 워크스페이스 멤버 = `plugins/context-ops` + `tools/*` 32종. `examples/poc-*/` 는 비멤버(불변).

## 3. pnpm 사실 (research / 버전 핀 / 출처 pnpm.io)

- **pnpm 10.x 핀** (로컬 이미 10.33.0). pnpm 11 = Node 22+ 강제 → 부적격. pnpm 11.0.0~11.0.8 엔 bundledDeps tarball 누락 회귀(#11519, 11.0.9 fix) — pnpm 10 은 회귀 무관.
- **bundledDependencies** = `pnpm pack`/`pnpm publish` 가 npm 과 동일하게 동봉(정상). 단 isolated(심링크) 기본 → **`node-linker=hoisted`(pnpm10=.npmrc) 권장**으로 flat node_modules 확보 후 pack. **실측 검증 의무**.
- `package.json "workspaces"` 는 pnpm 이 **무시** → `pnpm-workspace.yaml` 필수. glob 동일 지원.
- `pnpm publish` = 단일 패키지 opt-in(워크스페이스 전체는 `-r` 명시). `publishConfig.registry` 존중. `--no-git-checks` = 브랜치/clean 검사 생략.
- 명령 매핑: `npm ci`→`pnpm install --frozen-lockfile` / `npm test --workspace=<p>`→`pnpm --filter <name> test` / `npm run x --workspaces`→`pnpm -r run x`.
- **함정**: pnpm10 은 의존 **lifecycle script 기본 미실행**(`onlyBuiltDependencies` 등재 필요). ajv/ajv-formats/fast-xml-parser = pure JS 라 영향 적음(확인 필요). phantom-dep 차단(hoisted 로 완화). `node_modules/.bin` 경로 차이.

## 4. 위험 (research P0/P1)

- **P0-1 bundledDeps tarball 동봉**: pnpm pack 결과 tarball 에 `node_modules/ajv/…` 실재 여부 = 전환 성패. → Phase 2 GREEN 게이트로 `tar tzf` 실측(v0.19.1 잡은 그 테스트).
- **P0-2 pnpm 버전 핀**: 10.x 고정. corepack `packageManager` 로 강제. CI 도 10 핀.
- **P1-1 lifecycle script 기본 off**: 8 동봉 패키지 중 postinstall 필요분 없는지 확인. 있으면 `onlyBuiltDependencies` 등재.
- **P1-2 release-readiness #11**: pnpm 미전환 시 0/0 false-positive 위험 → 명시 수정 + 실행 실측.

## 5. 단계별 마이그레이션 (각 단계 = 검증 게이트)

**Phase 0 — 준비/핀**
- corepack `enable pnpm` + 루트 `package.json` `"packageManager":"pnpm@10.x"` + `.npmrc` `node-linker=hoisted`.
- `pnpm-workspace.yaml` 신설(globs 이전) + 루트 `"workspaces"` 삭제.
- `pnpm import` 로 package-lock → pnpm-lock 시드 후 `pnpm install` → `package-lock.json` 삭제.
- ✅ 게이트: `pnpm install` 성공 + 32 워크스페이스 인식(`pnpm -r list --depth -1`).

**Phase 1 — 스크립트/검증 전환**
- `release-readiness.js` #11 → `pnpm -r --if-present test`.
- 루트 `package.json` scripts → pnpm.
- `publish.js` 격리 설치/publish 로직 → pnpm(hoisted) 경로.
- ✅ 게이트: `pnpm run release:check`(40/40) + `pnpm -r test`(1444+ pass) 통과.

**Phase 2 — 배포 경로 실측 (P0 핵심 GREEN 게이트)**
- plugin dir 에서 `pnpm pack` → tarball 풀어 `node_modules/ajv|ajv-formats|fast-xml-parser/package.json` 존재 + node_modules 엔트리수(npm 기준 594) 동등 확인.
- `pnpm publish --dry-run` 로 페이로드 비교(파일수 5317±).
- ✅ 게이트: **bundledDeps 8 동봉 실측 확인**. 실패 시 → fallback(아래) 또는 중단.
- (실배포는 별도 — 버전 bump 동반 / 본 plan 은 메커니즘 검증까지)

**Phase 3 — CI / hook / 문서**
- `drift-check.yml` pnpm 화 + `plugins/plugins/…` 경로 버그 동시 수정.
- `pre-push` → pnpm.
- 문서 3종 pnpm 명령 갱신 + 플러그인명 stale 정정.
- ✅ 게이트: CI 통과(또는 act/로컬 모사) + `pnpm run test:release`.

## 6. Fallback (P0-1 실패 시)

`pnpm pack` 이 bundledDeps 를 안 담으면: ① `node-linker=hoisted` 재확인 → ② 그래도 안 되면 **publish 단계만 npm 유지(하이브리드)** — dev/install 은 pnpm, `publish.js` 의 tarball 생성만 `npm install --no-workspaces` + `npm publish` 보존. 정직하게 "배포 bundling 은 npm" 명시. (최후수단 / 우선은 순수 pnpm 검증)

## 7. 롤백

전환은 단일 PR/브랜치. 실패 시 `git revert` 로 package-lock.json + workspaces 필드 복원. node_modules 재설치(`npm install`)로 원복. 배포 채널 자체는 안 건드리므로 사용자 영향 0.

## 8. 사용자 승인 결정 (2026-06-08 확정)

1. **pnpm 버전** → ✅ **pnpm 10.x 핀** (Node ≥18 유지 / 로컬 10.33.0).
2. **node-linker** → ✅ `hoisted` (npm 동형/안전).
3. **Fallback** → ❌ **하이브리드 금지 / 순수 pnpm 고수.** Phase 2 에서 `pnpm pack` 이 bundledDeps 를 안 담으면 **하이브리드 없이 중단·보고**(전환 보류/재설계).
4. **lockfile** → ✅ pnpm-lock.yaml 커밋.
5. **stale 문서 정정** → ✅ 포함 (INSTALL-npm.md `ai-native-methodology@mis-plugins`→`context-ops@mis-plugins`) — Phase 3 에서 처리.
6. **착수 범위** → ✅ **Phase 0~2 먼저** (핵심 P0 검증까지). Phase 3(CI/hook/문서)는 P0 GREEN 후 별도.

> 브랜치 `chore/pnpm-migration` 단일 작업. 배포 채널 불변(사용자 영향 0).

## 9. Lessons (Phase 0~2 완료 / 2026-06-08)

**Phase 0~2 = GREEN.** release:check 40/40 + workspace test 1444/1446 pass/0 fail + pnpm publish dry-run bundled deps 8 / 5317 files (npm 동등).

전환 중 발견:
- **P0 bundledDeps 동봉 = 성공**: `.npmrc node-linker=hoisted` → `pnpm pack` tarball 에 node_modules 594 엔트리(ajv/ajv-formats/fast-xml-parser) 동봉, npm 기준과 정확히 일치. 순수 pnpm 으로 충분(하이브리드 불필요).
- **★ workspace test 함정 2종 (node 22+ 환경)**:
  1. **pnpm recursive 러너 ↔ node:test process-isolation 충돌** — node 22+ 는 test 파일별 process isolation 이 기본인데, `pnpm -r run test`/`--filter` 의 멀티패키지 러너 하에서 child spawn 이 "run() recursively … skipping running files" 로 파일 통째 skip(undercount). in-dir `pnpm run`·`pnpm exec node --test` 는 정상. → **`--test-isolation=none`(node 22+ 한정 / 18~21 미존재) 으로 단일 프로세스 실행 시 해소.**
  2. **cross-package temp-file race** — pnpm 병렬 실행 시 `skill-citation-validator` dogfood(repo 스캔)가 `inflation-lint` 가 동시 생성한 `_tmp_inflation_lint/absolute.md` 를 건드려 ENOENT fail. npm 은 순차라 비표면. → **`--workspace-concurrency=1`(순차) 로 해소.**
  - 두 fix 결합 = npm 과 동일 1444/1446/0. release-readiness #11 에 node-version 조건부로 박음.
- **node 버전 주의**: `--test-isolation` 은 node 22+ 만 존재 → .npmrc 전역 node-options 금지(node 18/20 CI 깨짐). 게이트 내 조건부가 정답.

## 10. Phase 3 완료 (2026-06-08)

- ✅ CI `drift-check.yml` pnpm 화 — 3 job 모두 `pnpm/action-setup@v4`(setup-node 먼저) + `cache:pnpm`/`pnpm-lock.yaml` + `pnpm install --frozen-lockfile` + `pnpm --filter <pkg> test`/`pnpm run …`/`pnpm test`. `plugins/plugins/…` 중복경로 버그 → `--filter @mis-plugins/<tool>` 로 수정.
- ✅ `pre-push` hook pnpm 화 (test:release + node_modules 안내).
- ✅ 메시지 문자열 pnpm 화 — build-catalog/publish-catalog/publish/setup-git-hooks.
- ✅ 문서 — nexus-setup.md(pnpm 명령 + node-linker 주의) / INSTALL·INSTALL-npm pnpm 무관(유저 install 채널 불변) + **stale 플러그인명 전수 정정** `ai-native-methodology@mis-plugins`→`context-ops@mis-plugins` (README·guides·extensions 9파일 / rename 누락분).
- ✅ release:check 40/40 유지 (skill_citation·readme_version 포함).
- 잔여(별도): corepack 핸드오프 사내 환경 실측 / (선택) skill-citation↔inflation-lint temp-file 격리로 병렬 복원.

> ⚠ 용어 보존: "npm 패키지 / npm-hosted / source:npm / npm 토큰 / npm-public" = Nexus npm-레지스트리 포맷 정확 용어 → pnpm 전환에도 불변(미수정).
