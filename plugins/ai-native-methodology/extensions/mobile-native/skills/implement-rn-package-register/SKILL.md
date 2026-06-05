---
name: implement-rn-package-register
description: |
  React Native Android 네이티브 모듈을 MainApplication.java/kt의 getPackages()에
  자동으로 등록. analysis-rn-native-bridge의 missing_registrations 결과를 입력으로 받아
  실제 코드 수정까지 수행. iOS는 자동 링크(autolinking)로 불필요.
  inventory.stack_signals.platform = react-native 인 경우에만 발동.
allowed-tools: Read, Edit, Bash
---

# implement-rn-package-register

Android `MainApplication.java` / `MainApplication.kt`에 ReactPackage 등록 자동화.

## 언제 사용

- 새 Native Module(IntuneMAMPackage, BiometricPackage 등) 구현 후
- `analysis-rn-native-bridge`의 `missing_registrations[]`가 비어있지 않을 때
- 사용자: "MainApplication에 패키지 등록해줘" / "native module 등록 누락됐대"

## 입력

- `.aimd/output/rn-native-bridge-inventory.json`의 `missing_registrations[]`
- `MainApplication.java` / `MainApplication.kt` 현재 내용

## 처리 절차

1. `rn-native-bridge-inventory.json` 로드 → `missing_registrations[]` 확인.
2. `MainApplication.java` (또는 `.kt`) 읽기 → `getPackages()` 위치 찾기.
3. 각 누락 패키지:
   - import 문 상단에 추가
   - `getPackages()` 내부 list에 `new XxxPackage()` 추가
4. 수정 후 검증:
   ```bash
   grep -n "XxxPackage" MainApplication.java  # 등록 확인
   ```

## 예시 (Java)

```java
// 추가되는 import
import com.smilenet.smileapp2.intune.IntuneMAMPackage;

// getPackages() 내부
@Override
protected List<ReactPackage> getPackages() {
  List<ReactPackage> packages = new PackageList(this).getPackages();
  packages.add(new IntuneMAMPackage());  // ← 자동 삽입
  return packages;
}
```

## 주의

- Java 프로젝트인지 Kotlin 프로젝트인지 먼저 확인.
- `new PackageList(this).getPackages()` 패턴 사용 시 autolinking 활성화 확인.
- iOS는 `autolinking` 또는 `AppDelegate`에서 처리 — 본 skill 대상 아님.
