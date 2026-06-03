# Nexus npm registry — 배포 런북 (repo.smiledev.net)

본 플러그인은 `source:npm` 으로 배포됩니다. 사내 Nexus(`https://repo.smiledev.net/`)에 npm registry 3종이 **이미 구성**돼 있습니다 (2026-06-02 확인).

## 1. 구성된 repository (확인됨)

| repo          | type         | 용도                                            | URL                                                 |
| ------------- | ------------ | ----------------------------------------------- | --------------------------------------------------- |
| `npm-hosted`  | npm (hosted) | 사내 패키지 publish 대상                        | `https://repo.smiledev.net/repository/npm-hosted/`  |
| `npm-central` | npm (proxy)  | 공개 npm passthrough (→ registry.npmjs.org)     | `https://repo.smiledev.net/repository/npm-central/` |
| `npm-public`  | npm (group)  | **사용자 consume 단일 URL** (hosted+proxy 통합) | `https://repo.smiledev.net/repository/npm-public/`  |

> 사용자는 **`npm-public` group URL 하나**로 사내+공개 패키지를 모두 받습니다. publish 만 `npm-hosted` 직접.

## 2. 인증 / 익명 read (확인됨)

- **`npm-public` group = 익명 read 허용** (확인: `npm-public/lodash` → 200, `npm ping` → PONG).
  → **일반 사용자는 토큰 없이 설치·자동갱신 가능** (git 계정도 토큰도 불필요 = 최소 마찰).
- **`npm-hosted` write = 인증 필요** (확인: 무인증 PUT → 401).
  → 배포자만 hosted write 권한 계정의 User Token(`NpmToken.xxxx`) 필요.

## 3. publish (배포자)

```bash
# 1) .npmrc 에 PUBLISH 프로필(hosted 토큰) 설정 — .npmrc.template [B] 참고
#    //repo.smiledev.net/repository/npm-hosted/:_authToken=<당신의 hosted-write User Token>
# 2) 플러그인 workspace 에서
cd ai-native-methodology
npm install                      # bundledDependencies(ajv 등) node_modules 채움 (필수)
npm run publish:plugin:dry       # version-check + tarball 내용 + bundled deps 8 확인 (업로드 없음)
npm run publish:plugin           # publishConfig.registry(npm-hosted)로 publish
```

> ⚠️ npm 레지스트리는 보통 **같은 버전 재publish 불가**. release 마다 plugin.json+package.json+CHANGELOG 3-way 버전 bump 후 publish (version-check 강제).

## 4b. 카탈로그(marketplace.json) URL 호스팅 — 통일 설치 경로

모든 사용자(git 계정 無 포함)가 동일 URL 로 설치하도록, 카탈로그를 Nexus raw repo(`serving-static`)에 올립니다.

- **canonical URL**: `https://repo.smiledev.net/repository/serving-static/mis-plugins/marketplace.json` (익명 read)
- 업로드 (raw write 권한 계정 / 비밀번호는 prompt):
  ```bash
  cd ai-native-methodology
  npm run publish:catalog:dry            # 검증 + 미리보기
  npm run publish:catalog -- --user <nexus-id>   # 업로드 (curl 이 비번 prompt)
  ```
- **cadence**: 카탈로그 version 은 RANGE(`^12.0.0`) → 일반 release(patch/minor)에는 **불변, 재업로드 불요**. 사용자 autoUpdate 가 범위를 Nexus 에 재해석해 새 버전 수신. **MAJOR range 이동(^12→^13) / description / 새 플러그인 추가 시에만** `publish:catalog` 재실행.
- npm 패키지 publish(`publish:plugin`, npm-hosted, npm 토큰)와 **별개 채널·별개 인증**(raw, HTTP Basic).

## 4. 검증 (실 Nexus end-to-end)

```bash
# group repo 에서 받아지는지 (익명)
npm view @ai-native-methodology/plugin --registry https://repo.smiledev.net/repository/npm-public/
# 클린 머신(git 계정 無, 토큰 無)에서 설치
claude plugin marketplace add https://<카탈로그-host>/marketplace.json   # 또는 GHE git
claude plugin install ai-native-methodology@mis-plugins
```

## 핵심 주의 (Phase 0 실측)

- `source:npm` 설치는 **deps 를 `npm install` 하지 않음** → 외부 의존(ajv/ajv-formats/fast-xml-parser)은
  `package.json` `bundledDependencies` 로 tarball 에 동봉됨 (top-level 3개 선언 → transitive 5개 자동 포함 = 8 packages).
  publish 전 `npm install` 로 node_modules 가 채워져 있어야 동봉됨.
- 자동갱신 감지는 `.claude-plugin/plugin.json.version` 기준 → release 마다 3-way lockstep bump.
- 카탈로그(marketplace.json)는 모든 엔트리가 `source:npm` 이라 URL 호스팅 시에도 상대경로 파손 없음.
