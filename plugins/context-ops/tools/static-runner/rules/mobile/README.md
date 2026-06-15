# Mobile Custom Semgrep Rules

React Native(iOS/Android) + Android 네이티브 대상 보안 룰.
SN15-MOBILE-2 스택(RN 0.72 + TypeScript + Java) 기반 설계. v0.20.0 도입.

## 룰 목록

| 파일 | ID | 언어 | CWE | 심각도 | 안티패턴 |
|------|----|------|-----|--------|----------|
| asyncstorage-sensitive-data.yml | internal.mobile.security.asyncstorage-sensitive-data | js, ts | CWE-922 | HIGH | AP-SECURITY-RN-ASYNCSTORAGE-001 |
| rn-cleartext-traffic.yml | internal.mobile.security.rn-cleartext-traffic | js, ts | CWE-319 | MEDIUM | AP-SECURITY-RN-CLEARTEXT-001 |
| android-insecure-shared-prefs.yml | internal.mobile.security.android-insecure-shared-prefs | java | CWE-732 | HIGH | AP-SECURITY-ANDROID-PREFS-001 |

## 실행

```bash
# 단일 룰 테스트 (semgrep --test)
cd rules/mobile
semgrep --test --config asyncstorage-sensitive-data.yml asyncstorage-sensitive-data.ts
semgrep --test --config rn-cleartext-traffic.yml rn-cleartext-traffic.ts
semgrep --test --config android-insecure-shared-prefs.yml android-insecure-shared-prefs.java

# static-runner 통해 RN 프로젝트 전체 스캔
node ${CLAUDE_PLUGIN_ROOT}/tools/static-runner/src/cli.js \
  --plugin semgrep \
  --target /path/to/SN15-MOBILE-2/client/src \
  --output ./out \
  --extra-rules tools/static-runner/rules/mobile/asyncstorage-sensitive-data.yml \
  --extra-rules tools/static-runner/rules/mobile/rn-cleartext-traffic.yml

# Android 네이티브 스캔 (java)
node ${CLAUDE_PLUGIN_ROOT}/tools/static-runner/src/cli.js \
  --plugin semgrep \
  --target /path/to/SN15-MOBILE-2/client/android \
  --output ./out \
  --extra-rules tools/static-runner/rules/mobile/android-insecure-shared-prefs.yml
```

## 커버리지

| 플랫폼 | 언어 | Semgrep 번들 ruleset | 커스텀 룰 |
|--------|------|---------------------|-----------|
| React Native (공통) | TypeScript / JavaScript | `semgrep-rules/javascript`, `typescript` | asyncstorage-sensitive-data, rn-cleartext-traffic |
| Android 네이티브 | Java | `semgrep-rules/java` | android-insecure-shared-prefs |
| Android 네이티브 | Kotlin | `semgrep-rules/kotlin` | — (추후 추가) |
| iOS 네이티브 | Swift | `semgrep-rules/swift` | — (추후 추가) |

## 관련

- `rules/jwt-localstorage.yml` — 동형 웹 룰 (AP-FE-SECURITY-001 / localStorage)
- OWASP Mobile Top 10 2024: https://owasp.org/www-project-mobile-top-10/
