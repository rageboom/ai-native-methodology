---
name: analysis-rn-screen-scan
description: |
  React Native 프로젝트에서 파일저장/공유 API 호출 위치를 소스에서 탐색.
  CameraRoll.save() / Share.open() / RNFS.write() / download 등 호출 지점을
  grep으로 발견하고 PolicyGuard 배선이 필요한 화면 목록을 추출.
  inventory.stack_signals.platform = react-native 인 경우에만 발동.
  비모바일(Spring/React 웹) 프로젝트에서 절대 발동하지 말 것.
allowed-tools: Read, Grep, Bash
---

# analysis-rn-screen-scan

React Native 화면에서 Intune PolicyGuard / 보안 정책 가드 배선이 필요한 위치를 자동 탐색.

## 언제 사용

- `inventory.stack_signals.platform = react-native` 확인 후 발동
- analysis 단계에서 PolicyGuard 배선 대상 화면 목록이 필요할 때
- 사용자: "파일 저장 호출 위치 찾아줘" / "공유 차단 배선 어디에 해야 해"

## 탐색 대상 패턴

```bash
# 파일 저장 API
grep -rn "CameraRoll\|RNFS\.write\|downloadFile\|saveToGallery\|saveFile" client/src/

# 공유 API
grep -rn "Share\.open\|Share\.share\|shareFile\|shareContent" client/src/

# 다운로드 관련
grep -rn "downloadAttachment\|saveAttachment\|openAttachment" client/src/
```

## 산출물

`.ai-context/output/rn-screen-scan.json`:

```json
{
  "save_blocked_targets": [
    {
      "file": "client/src/screens/common/EBizCardScreen.tsx",
      "function": "saveToGallery",
      "line": 42,
      "api_call": "CameraRoll.save()",
      "guard_needed": "guardFileSave"
    }
  ],
  "share_blocked_targets": [
    {
      "file": "client/src/screens/common/EBizCardScreen.tsx",
      "function": "shareTheProductDetails",
      "line": 78,
      "api_call": "Share.open()",
      "guard_needed": "guardShare"
    }
  ]
}
```

## 절차

1. `inventory.json`에서 `stack_signals.platform === 'react-native'` 확인. 아니면 종료.
2. `client/src/` 재귀 grep — 파일 저장 API 패턴 탐색.
3. `client/src/` 재귀 grep — 공유 API 패턴 탐색.
4. 각 호출 위치: 파일 경로 + 함수명 + 라인 + `guard_needed` 분류.
5. `rn-screen-scan.json` 산출.
6. Discovery 단계로 전달 — 화면별 배선 UC 자동 생성.

## 주의

- 웹(React) 프로젝트의 `Share` API는 다름. `react-native`의 `Share`만 대상.
- `inventory.stack_signals.platform` 확인 없이 발동 금지.
