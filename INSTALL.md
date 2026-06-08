# 설치 가이드 — 아무것도 안 깔린 PC 기준

AI-Native 개발 방법론 플러그인(Claude Code)을 **처음부터** 설치하는 최단 절차입니다.
Windows / macOS 둘 다 다룹니다. 순서대로 따라오면 됩니다.

> **전제**: 사내 GHE(`github.smilegate.net`)의 본 repo **read 권한**만 있으면 됩니다.
> 별도 설치 파일을 받을 필요 없습니다 — git URL로 바로 설치합니다.

---

## 1. Node.js 설치 (≥ 22)

Claude Code와 플러그인 도구가 Node 위에서 돕니다.

**Windows** (PowerShell):
```powershell
winget install OpenJS.NodeJS.LTS
```
**macOS** (터미널):
```bash
brew install node      # Homebrew 없으면 https://nodejs.org 에서 LTS 설치
```
설치 확인:
```bash
node -v                # v18 이상이면 OK
```

---

## 2. Git 설치 + GHE 인증

플러그인은 GHE에서 git으로 받아옵니다. git과 GHE 로그인이 필요합니다.

**Windows** (PowerShell):
```powershell
winget install Git.Git GitHub.cli
```
**macOS** (터미널):
```bash
brew install git gh    # git은 보통 이미 설치돼 있음
```
GHE 로그인 (1회만):
```bash
gh auth login --hostname github.smilegate.net
```
> 안내에 따라 브라우저 인증을 마치면 git 인증까지 자동 설정됩니다.
> gh CLI를 안 쓰면, 본 repo를 `git clone` 할 수 있도록 PAT 또는 SSH 키를 설정해도 됩니다.

---

## 3. Claude Code 설치

```bash
npm install -g @anthropic-ai/claude-code
```
설치 확인 + 최초 로그인:
```bash
claude --version       # 버전 출력되면 OK
claude                 # 첫 실행 시 안내에 따라 계정 로그인
```

---

## 4. 플러그인 설치

Claude Code 세션 안에서(`claude` 실행 후 프롬프트에) 아래 3줄을 입력합니다:

```text
/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git
/plugin install context-ops@mis-plugins
/reload-plugins
```

> pin 없는 기본 브랜치(`main`)가 **최신 안정 버전**입니다.

---

## 5. 설치 확인

```text
/plugin
```
대화형 매니저의 **Installed** 탭에서 `context-ops`가 보이면 완료입니다.

---

## 문제 해결

| 증상 | 원인 / 조치 |
|---|---|
| `marketplace add` 가 인증 오류 | 2단계 GHE 인증 미완 → `gh auth login --hostname github.smilegate.net` 다시 실행 |
| `node` / `claude` 명령 없음 | 1·3단계 설치 후 **터미널을 새로 열기** (PATH 갱신) |
| 도구 실행 오류 | Node 버전 확인(`node -v` ≥ 22) |
| (Windows·한국어 + Semgrep 사용 시) 인코딩 깨짐 | 환경변수 `PYTHONUTF8=1` 설정 |

자세한 사용법은 플러그인 본체의 [`ai-native-methodology/README.md`](ai-native-methodology/README.md)를 참고하세요.
