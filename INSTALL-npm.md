# 설치 가이드 (npm/Nexus 경로) — git 계정 없이 설치

플러그인을 **사내 Nexus npm registry**(`repo.smiledev.net`)에서 받습니다. **git/GHE 계정이 없어도, 토큰조차 없어도** 사내망 접근만 있으면 설치·자동갱신됩니다 (npm-public group = 익명 read).
(git 계정이 있는 경우의 git 설치는 [`INSTALL.md`](INSTALL.md) 참고 — 둘 다 동일 플러그인.)

> **전제**: ① Node.js ≥ 18 ② Claude Code 설치(`npm i -g @anthropic-ai/claude-code`) ③ 사내망에서 `repo.smiledev.net` 접근.

---

## 1. Nexus 설정 — 불필요 (익명 read)

`npm-public` group repo 는 익명 read 가 허용돼 있어 **별도 `.npmrc`/토큰 설정 없이** 설치됩니다.
Claude Code 가 marketplace 의 `source.registry`(npm-public)로 직접 받기 때문입니다.

> (npm CLI 로 직접 받는 등 환경상 인증이 요구되면 [`.npmrc.template`](.npmrc.template) [A] 프로필 참고.)

---

## 2. 마켓플레이스 추가 (둘 중 하나)

**(A) URL — git 계정 불필요 (권장):**
```text
/plugin marketplace add https://<사내호스트>/marketplace.json
```
**(B) GHE git — git 계정 있는 경우:**
```text
/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git
```
> 두 경로 모두 플러그인 본체는 `source:npm`(Nexus `npm-public`)에서 받습니다. (A)는 카탈로그 파일 하나만 URL 로 받으므로 git 인증이 전혀 필요 없습니다.

---

## 3. 플러그인 설치

```text
/plugin install ai-native-methodology@mis-plugins
```
(CLI 로도 동일: `claude plugin install ai-native-methodology@mis-plugins`)

---

## 4. 자동 업데이트 켜기 (1회)

`/plugin` → **Marketplaces** 탭 → `mis-plugins` → **Auto-update: On**.

> ⚠️ **정직 안내**:
> - **최초 설치(2·3단계)는 사용자가 1회 직접** 합니다 (CLI 자동 설치는 미지원 — Claude Code 한계 #45323).
> - 그 **이후 버전 갱신은 자동**입니다 — Auto-update 를 켜두면 세션 시작 시 최신 버전을 받습니다.

---

## 5. 확인

```text
/plugin
```
**Installed** 탭에 `ai-native-methodology` 가 보이면 완료. 새 세션 시작 시 SessionStart 메시지("chain harness ready") 표시 = 정상.

---

## 문제 해결

| 증상 | 조치 |
|---|---|
| `install` 시 404 / not found | 패키지 미게시 또는 registry 가 `npm-public`(group) 인지 확인 (hosted 아님) |
| 401/403 인증 오류 | 보통 익명 read 라 불필요. 환경상 막혀 있으면 Nexus User Token 발급 후 `.npmrc` 설정 |
| 도구 실행 시 모듈 오류 | npm 경로는 의존성(ajv 등)이 번들됨 — 재현 시 `/plugin uninstall` 후 재설치 |
| 자동갱신이 안 됨 | 4단계 Auto-update On 확인 / 신버전은 plugin.json 버전이 올라가야 감지됨 |
| `node`/`claude` 명령 없음 | Node ≥18 설치 후 터미널 새로 열기(PATH 갱신) |
