---
name: analysis-rn-native-bridge
description: |
  React Native 프로젝트에서 네이티브 모듈 구현 시 필요한 보일러플레이트 패턴 분석.
  iOS RCT_EXPORT_MODULE / Android ReactContextBaseJavaModule 패턴,
  MainApplication.java getPackages() 등록 현황을 탐색하고 누락 항목을 발견.
  inventory.stack_signals.platform = react-native 인 경우에만 발동.
allowed-tools: Read, Grep, Bash
---

# analysis-rn-native-bridge

React Native 네이티브 모듈 구현에 필요한 iOS/Android 보일러플레이트 현황 분석.

## 언제 사용

- 새 Native Module 구현 계획 시 (MSAL, Biometrics, Push, etc.)
- analysis 단계에서 native bridge 현황 파악이 필요할 때
- 사용자: "네이티브 모듈 추가하려는데 어떻게 해야 해" / "native bridge 현황 분석해줘"

## 탐색 대상

### iOS
```bash
# 기존 네이티브 모듈 목록
grep -rn "RCT_EXPORT_MODULE\|@objc(.*)" client/ios/ --include="*.swift" --include="*.m"

# 브릿지 헤더
find client/ios/ -name "*Bridging-Header*"
```

### Android
```bash
# 기존 네이티브 모듈
grep -rn "ReactContextBaseJavaModule\|getName()" client/android/ --include="*.kt" --include="*.java"

# 패키지 등록 현황 (핵심)
grep -n "getPackages\|ReactPackage\|PackageList" client/android/app/src/main/java/**/MainApplication.java
```

## 산출물

`.ai-context/output/rn-native-bridge-inventory.json`:

```json
{
  "ios_modules": [
    { "name": "IntuneMAMBridge", "file": "ios/SmartMobile/Intune/IntuneMAMBridge.swift", "registered": true }
  ],
  "android_modules": [
    { "name": "IntuneMAMModule", "file": "android/.../IntuneMAMModule.kt", "registered": false, "missing_in": "MainApplication.java" }
  ],
  "missing_registrations": [
    { "module": "IntuneMAMPackage", "action": "MainApplication.java getPackages()에 new IntuneMAMPackage() 추가 필요" }
  ]
}
```

## 절차

1. iOS Swift/ObjC 파일에서 `RCT_EXPORT_MODULE` grep → 등록된 모듈 목록.
2. Android Kotlin/Java에서 `ReactContextBaseJavaModule` grep → 구현된 모듈 목록.
3. `MainApplication.java`의 `getPackages()` 내용 읽기 → 등록 여부 대조.
4. 누락된 등록 항목 → `missing_registrations[]`에 기록.
5. Discovery 단계로 전달 — 누락 항목이 자동으로 TASK로 생성됨.
