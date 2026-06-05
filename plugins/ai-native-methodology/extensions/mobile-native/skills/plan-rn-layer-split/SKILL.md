---
name: plan-rn-layer-split
description: |
  React Native 프로젝트의 task-plan.json 생성 시 layer를 모바일 기준으로 분리.
  ai-native-methodology의 표준 layer(be/fe/db/e2e/infra) 대신
  ios-native / android-native / rn-bridge / rn-component / rn-store로 세분화.
  plan-decompose-and-sequence 실행 후 보완 호출.
  inventory.stack_signals.platform = react-native 인 경우에만 발동.
allowed-tools: Read, Write, Edit
---

# plan-rn-layer-split

React Native task-plan의 layer를 모바일 특화 5종으로 세분화.

## 언제 사용

- `plan-decompose-and-sequence` 완료 후 보완 단계
- task-plan.json의 layer가 `fe` / `infra`로 뭉쳐있을 때
- 사용자: "task layer 모바일 기준으로 분리해줘"

## 모바일 layer 5종

| layer | 대상 | 예시 파일 |
|---|---|---|
| `ios-native` | Swift / Objective-C 네이티브 코드 | `IntuneMAMBridge.swift` |
| `android-native` | Kotlin / Java 네이티브 코드 | `IntuneMAMModule.kt`, `MainApplication.java` |
| `rn-bridge` | NativeModules JS 래퍼 | `MsalAuth.ts`, `IntuneMam.ts` |
| `rn-component` | React Native 화면/컴포넌트 | `EBizCardScreen.tsx`, `UploadControl.tsx` |
| `rn-store` | MobX / Redux / Zustand 상태 | `MamStore.ts`, `AppStore.ts` |

## 처리 절차

1. `task-plan.json` 로드 → `tasks[].layer` 순회.
2. 파일 경로(`files[]`) 기준으로 layer 재분류:
   - `.swift` / `.m` → `ios-native`
   - `.kt` / `.java` → `android-native`
   - `NativeModules` import 있는 `.ts` → `rn-bridge`
   - `Screen.tsx` / `Component.tsx` → `rn-component`
   - `Store.ts` (MobX) → `rn-store`
3. 의존성 그래프 재검증:
   - `ios-native` → `rn-bridge` 의존 확인
   - `android-native` → `rn-bridge` 의존 확인
   - `rn-bridge` → `rn-store` / `rn-component` 의존 확인
4. `task-plan.json` 업데이트.

## 효과

이 skill 적용 후 실행 순서가 명확해집니다:
```
Level 1: ios-native + android-native (병렬)
Level 2: rn-bridge (native 완료 후)
Level 3: rn-store (bridge 완료 후)
Level 4: rn-component (store 완료 후)
```
