# 새 플러그인 추가 가이드 (mis-plugins 마켓플레이스 모노레포)

이 레포는 `@mis-plugins/monorepo` — `plugins/*` 아래 **여러 플러그인을 호스팅하는 마켓플레이스 모노레포**다.
각 플러그인은 독립 semver + Nexus(npm-hosted) 배포를 가지며, 빌드·카탈로그·검증·배포 툴링은 레포 루트 `scripts/` 가 **공유**한다.
새 플러그인은 `plugins/<name>/` 에 아래 규약 파일만 갖추면 공유 툴링이 **자동 인식**한다. (정체성 결정 = `docs/decisions/DEC-2026-06-23-marketplace-monorepo-identity.md`)

> 빠른 시작: `pnpm plugin:new <name>` → TODO 채우기 → `pnpm run catalog:build`.

## 1. 한 줄 스캐폴드

```bash
pnpm plugin:new my-plugin        # = node scripts/new-plugin.js my-plugin
```

`templates/plugin-scaffold/` 를 `plugins/my-plugin/` 으로 복사하고 `__PLUGIN_NAME__` 을 치환한다.
이름 규칙: 소문자로 시작 + 소문자/숫자/대시 (npm 패키지명 규칙). 디렉토리명 = `plugin.json.name` = `@mis-plugins/<name>` suffix (lockstep).

## 2. 플러그인 규약 (공유 툴링이 인식하는 계약)

`plugins/<name>/` 아래:

| 파일 | 요구 | 강제하는 도구 |
|---|---|---|
| `.claude-plugin/plugin.json` | `name`(=디렉토리명) + `version` + description/author/homepage/license/keywords | build-plugin · version-check · build-catalog |
| `package.json` | `name`=`@mis-plugins/<name>`, `version`(plugin.json 과 lockstep), `private:false`, `type:module`, `publishConfig.registry`=`https://repo.smiledev.net/repository/npm-hosted/`, (검증 도구 사용 시)`bundledDependencies`, `repository.directory` | version-check · publish |
| `marketplace-entry.json` | `description` (+ 선택 `versionRange` / `registry`) — 카탈로그 blurb. **빌드 INCLUDE 밖 = 출하 안 됨** | build-catalog (없으면 fail) |
| `CHANGELOG.md` | 첫 `## [vX.Y.Z]` 헤더 = version (변경 이력 SSOT) | version-check 3-way |
| `README.md` | 빌드 페이로드 | build-plugin |
| `scripts/release-readiness.js` | **선택** — 없으면 `release-check` 가 version-check 로 폴백 | release-check |
| 런타임 자산 `agents/`·`skills/`·`hooks/`·`commands/`·`flows/`·`templates/`·`tools/` | build-plugin INCLUDE 목록과 동일 이름이면 자동 출하 | build-plugin |

스캐폴드 직후 `description` / 첫 CHANGELOG 날짜의 `TODO` 를 채우고, 실제 자산(skill/agent/hook)을 추가한다.

## 3. 버전 규칙

- **SSOT = `plugin.json.version`**. `version-check` 가 `plugin.json ↔ CHANGELOG.md 첫 헤더 ↔ package.json` 3개를 정합 검사한다 (불일치 = exit 1).
- 카탈로그 `source.version` range 는 자동: `0.x` → `>=0.1.0 <1.0.0` (minor 자동 수신), `1+` → `^<major>.0.0`. patch/minor 에는 카탈로그 불변(사용자 autoUpdate 가 재해석) — **MAJOR / 새 플러그인 / blurb 변경 시에만** 카탈로그 재배포.

## 4. 빌드 · 카탈로그 · 배포 흐름

```bash
# 검증
node scripts/version-check.js --plugin <name>   # 또는 pnpm run version:check (전체)

# 카탈로그 재생성 — plugins/* → .claude-plugin/marketplace.json 자동 생성
pnpm run catalog:build
pnpm run catalog:build:check                     # drift gate (CI)

# Claude 아티팩트 빌드 (git-subdir 채널)
node scripts/build-plugin.js --plugin <name>     # 또는 pnpm run build:all

# npm 배포 (Nexus npm-hosted 채널)
node scripts/publish.js --plugin <name> --dry-run   # tarball + bundled deps 확인 (업로드 없음)
node scripts/publish.js --plugin <name>             # 실 배포 (.npmrc _authToken 인증)

# 회귀 (빌드+카탈로그 후 diff 0)
pnpm run build:diff-check
```

릴리스 게이트: `node scripts/release-check.js --plugin <name>` — 플러그인이 자기 `scripts/release-readiness.js` 를 소유하면 그걸, 없으면 version-check 로 폴백한다.

## 5. bundledDependencies 주의 (검증 도구가 있는 플러그인)

`source:npm` 설치는 deps 를 install 하지 않으므로, 런타임 의존(ajv 등)은 `package.json` `bundledDependencies` 로 tarball 에 동봉해야 한다.
pnpm 11 워크스페이스(hoisted)는 deps 를 repo-root 에만 둬 plugin-local `node_modules` 가 비므로, `publish.js` 가 plugin dir 에서 `pnpm install --ignore-workspace --node-linker=hoisted` 로 격리 설치해 동봉을 보장한다 (gate 1.5). 도구 없는 단순 플러그인은 이 단계가 자동 skip 된다.

## 6. 거버넌스 위치

- **마켓플레이스-레벨**(레포 전체 결정/빌드/배포) → 레포 루트 `docs/` (`docs/decisions/`, 본 가이드).
- **플러그인-국소**(특정 플러그인 설계/이력) → `plugins/<name>/` (`decisions/`, `docs/adr/`, CHANGELOG 등).
