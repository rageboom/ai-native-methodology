# legacy-korean rule pack (v8.8.0+)

cycle-7 (car / 2026-05-21) dogfood 가 표면화한 5 critical 발견의 Semgrep rule 자산화.

본 rule pack 은 vendored upstream subtree (`tools/semgrep-rules/`) 를 폴루션하지 않도록 `tools/static-runner/rules/legacy-korean/` 별 dir 에 배치. static-runner `--extra-rules` 옵션으로 명시 invocation 또는 chain harness analysis stage 의 sub-agent SKILL 안 추천 ruleset.

## 사용

```bash
npx static-runner \
  --plugin semgrep \
  --target /path/to/legacy/src \
  --output /path/to/evidence \
  --ruleset 'p/owasp-top-ten' \
  --extra-rules ai-native-methodology/tools/static-runner/rules/legacy-korean/
```

## 5 rule

| id | severity | trigger finding | cycle origin |
|---|---|---|---|
| `legacy-korean.pii-realname-with-test-comment` | ERROR | F-CYCLE7-001 (CarCostServiceImpl.java:92 hardcoded 실명 5인 + // 테스트용) | cycle-7 |
| `legacy-korean.eclipse-todo-catch` | WARNING | AP-CYCLE7-CODE-001 (CarMgtServiceImpl.java:209 SATD) | cycle-7 |
| `legacy-korean.jsp-scriptlet-raw-output` | ERROR | AP-CYCLE7-FE-RENDER-001 (carInclude.jsp:6 XSS) | cycle-7 |
| `legacy-korean.interceptor-no-rbac` | ERROR | SEC-CAR-001 / F-CYCLE6-002 (preHandle 권한 검증 0) | cycle-7 |
| `legacy-korean.sso-bypass-via-request-param` | ERROR | SEC-CAR-002 (LOCAL toggle SSO bypass) | cycle-7 |

## §8.1 ≥2 PoC corroboration status

- **pii-realname-with-test-comment** = single PoC (cycle-7) — mandatory enforcement 격상은 v8.9+ ≥2 PoC carry
- **eclipse-todo-catch** = pattern 자체는 일반 Eclipse 패턴 / cycle-7 단 1 PoC carry
- **jsp-scriptlet-raw-output** = 일반 OWASP XSS 패턴 / cycle-7 = 사내 정합 carry
- **interceptor-no-rbac** = best-effort negative pattern / cycle-6 F-CYCLE6-002 + cycle-7 cross-link 2 PoC ✅
- **sso-bypass-via-request-param** = 일반 LOCAL toggle 패턴 / cycle-7 단 1 PoC carry

## v8.9+ carry

| 항목 | 사유 |
|---|---|
| pii-realname-with-test-comment ≥2 PoC | cycle-8+ 신규 mock PoC 확보 후 |
| ast-grep 변환 (TS/JS 도메인) | NestJS / React stack legacy 검출 |
| 추가 rule (cycle-8+ 발견) | bod / capital / billing tier-3 cluster 진입 시 |

## DEC

- DEC-2026-05-21-v8.8.0-cycle7-evolution.md §Tier 2.1
