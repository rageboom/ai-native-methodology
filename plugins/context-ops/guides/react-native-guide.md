# React Native 프로젝트 적용 가이드

> **대상**: React Native (iOS + Android) 프로젝트에서 ai-native-methodology chain harness를 적용하는 개발자.

---

## 1. 핵심 차이 — 웹 vs 모바일

본 방법론은 BE(Spring/NestJS) + FE(React/Vue 웹) 중심으로 설계되어 있다.
React Native 프로젝트에서는 다음 영역이 **플러그인 기본 skill만으로는 자동 처리되지 않는다.**

| 영역 | 웹 프로젝트 | React Native 프로젝트 |
|---|---|---|
| Native Module 등록 | 해당 없음 | `MainApplication.java` `getPackages()` 수동 등록 필요 |
| 화면별 보안 가드 배선 | DOM 이벤트 기반 | CameraRoll/Share API 호출 위치 grep 후 직접 삽입 |
| 플랫폼 이중성 | 단일 코드 | iOS(Swift) + Android(Kotlin) 각각 별도 구현 |
| 빌드 환경 변경 | `package.json` | `Podfile` + `build.gradle` + `AndroidManifest.xml` 동시 수정 |
| Task layer | `be/fe/db/e2e/infra` | `ios-native/android-native/rn-bridge/rn-component/rn-store` |

---

## 2. skills-extensions 설치 (권장)

React Native 프로젝트에서는 `mobile-native-skills` 확장 패키지를 함께 설치하면
위 gap이 자동으로 처리된다.

```bash
# ai-native-methodology 설치 시 extensions/mobile-native 가 함께 포함됨
/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git
/plugin install context-ops@mis-plugins
/reload-plugins
```

> extensions skills는 `ai-native-methodology/extensions/mobile-native/skills/`에 위치.
> 별도 레포 설치 불필요.

### mobile-native extensions가 추가하는 skill

| Skill | 발동 시점 | 해결하는 문제 |
|---|---|---|
| `analysis-rn-screen-scan` | analysis 단계 | CameraRoll/Share API 호출 위치 자동 탐색 → PolicyGuard 배선 대상 목록 산출 |
| `analysis-rn-native-bridge` | analysis 단계 | iOS/Android native module 현황 + `MainApplication.java` 등록 누락 감지 |
| `implement-rn-package-register` | implement 단계 | `MainApplication.java` `getPackages()`에 패키지 자동 등록 |
| `plan-rn-layer-split` | plan 단계 보완 | task layer를 모바일 5종으로 세분화 |

---

## 3. NL 입력 시 모바일 체크리스트 포함

`analysis-input-orchestrate` 진입 전 `.ai-analysis/inputs/`에 아래 파일을 추가하면
chain harness가 모바일 특수 사항을 인식한다.

```markdown
# .ai-analysis/inputs/rn-checklist.md

## React Native 필수 확인 항목
- Native Module 구현 시 반드시 MainApplication.java getPackages()에 등록
- 파일 저장 차단 필요 시 CameraRoll.save() / Share.open() 호출 위치 전체 배선
- 앱 초기화 시점 연결 리스너는 App.tsx 또는 setInitialize() 내에서 등록
- Podfile 수정 후 pod install 실행 필요
- iOS URL Scheme은 Info.plist에 등록 확인
```

> `mobile-native-skills` 설치 시 이 체크리스트가 skill 내에서 자동 처리되므로 수동 입력 불필요.

---

## 4. chain harness 적용 시 플랫폼별 Task 작성 원칙

`plan-decompose-and-sequence` 실행 후 `plan-rn-layer-split` skill로 보완:

```
Level 1 (병렬): TASK-ios-native + TASK-android-native + TASK-infra
Level 2 (병렬): TASK-rn-bridge   ← native 완료 후
Level 3 (병렬): TASK-rn-store    ← bridge 완료 후
Level 4:        TASK-rn-component ← store 완료 후
```

---

## 5. 알려진 한계

| 한계 | 상태 | 비고 |
|---|---|---|
| iOS Swift RCT_EXPORT_MODULE 패턴 자동 인식 | ❌ | `analysis-rn-native-bridge`로 보완 |
| `MainApplication.java` 자동 등록 | ❌ | `implement-rn-package-register`로 보완 |
| 화면 API 호출 위치 자동 탐색 | ❌ | `analysis-rn-screen-scan`으로 보완 |
| Podfile/build.gradle 변경 영향 분석 | ❌ | 수동 확인 필요 |
| `ios-native/android-native` layer 기본 지원 | ❌ | `plan-rn-layer-split`으로 보완 |

---

## 6. 참고 레포

- [callstackincubator/agent-skills](https://github.com/callstackincubator/agent-skills) — RN 성능 최적화 + brownfield migration skills
- [expo/skills](https://github.com/expo/skills) — Expo 공식 skills
- [google/android/skills](https://github.com/google/android) — Android 공식 skills
