# plan — v1.4.2 PATCH (★ carry 2 custom Semgrep rule + carry 3 drift-check.yml ratchet)

> 일자: 2026-05-02 (★ v1.4.1 PATCH 종결 직후 / 같은 날 carry 2/3 진행)
> 작업자: Auto Mode (4원칙 정합 / 사용자 일괄 승인 "A" 후속)
> 진입 trigger: v1.4.1 종결 후 carry 5건 중 ★ ★ 신규 2건 (carry 2 + carry 3) 진행 결단
> 본 plan = 4원칙 §1 깊은 숙지 산출.

---

## 1. 컨텍스트

### 1.1 직전 작업 (v1.4.1)

- ★ Semgrep p/owasp-top-ten (76 rules) 진짜 실행 → 0 findings / SARIF 5종 물증 정상
- ★ ★ AP-FE-SECURITY-JWT-LOCALSTORAGE 직접 매칭 0건 (★ implicit 미달) — `react-jwt-in-localstorage` 룰은 jwt_decode 임포트 + localStorage.setItem(jwt_decode(...))의 2단계 매칭이라 raw token 저장 패턴에 trigger 안 됨
- baseline 첫 작성 (0 findings) + ratchet dry trial pass

### 1.2 이번 작업 (v1.4.2 PATCH)

★ ★ carry 5건 중 신규 2건 종결:

| carry | 정의 | 우선순위 |
|---|---|---|
| ★ 신규 1 | AP-FE-SECURITY-JWT-LOCALSTORAGE custom Semgrep rule 작성 | ★ 본 plan |
| ★ 신규 2 | drift-check.yml CI 통합 ratchet 모드 default | ★ 본 plan |

### 1.3 ★★ Sprint 4 README 정합

`tools/static-runner/README.md` §1차 plugin 범위:
> ✅ semgrep — `p/owasp-top-ten` ruleset 1차 + ★ 사내 RSA git commit / JWT 길이 custom rule (별도)

→ ★ 본 carry 2 = Sprint 4 README ★ 첫 실현. 본 carry 진행 = ★ "별도" 라벨 작업의 첫 진입.

### 1.4 drift-check.yml 현 상태 (Sprint 4)

이미 ★ ★ ★ 잘 짜여있음:
- PR (diff-aware) / nightly (full / 02:00 UTC) 이중 모드 ✅
- SARIF upload to Code Scanning ✅
- evidence artifact 30일 보존 ✅
- SEMGREP_BASELINE_REF (★ Semgrep 자체 baseline, 본 방법론 baseline 과 별도) ✅

★ ★ **갱신 필요 항목**:
- `--baseline <path> --ratchet` 추가 (ADR-010 정합)
- PoC #04 full 트랙 추가 (현재 PMD/Java/PoC #02 만 명시)
- Custom rule 적용 (`--config rules/custom-jwt-localstorage.yml` 추가)

---

## 2. 자산 인벤토리

### 2.1 도구 측

- `tools/static-runner/src/runner.js` — Semgrep plugin (★ v1.4.1 fix 후 정상)
- `tools/static-runner/src/cli.js` — baseline + ratchet 통합 ✅
- `tools/static-runner/rules/` — ★ 부재 (★ 신설 대상)

### 2.2 PoC #04 full 측

- `INPUT/src/shared/api/auth-storage.ts:20` — `window.localStorage.setItem(TOKEN_STORAGE_KEY, token)` (★ 검증 target)
- `analysis/6-quality/static-security-spec.json` — v1.4.1 갱신본 (★ custom rule 결과 추가 갱신)
- `analysis/6-quality/semgrep-baseline.json` — v1.4.1 산출 (0 findings)

### 2.3 본체 측 갱신 대상

- `tools/static-runner/rules/custom-jwt-localstorage.yml` (★ 신규)
- `tools/static-runner/rules/custom-jwt-localstorage.test.yml` (★ 신규 — Semgrep test 패턴)
- `tools/static-runner/README.md` §1차 plugin 범위 (★ "별도" → "v1.4.2 첫 실현")
- `.github/workflows/drift-check.yml` (★ ratchet 모드 + PoC #04 full 트랙 + custom rule)
- `docs/v1.4.2-release-note.md` (★ 신규)
- `docs/adr/ADR-FE-007` cross-link (★ AP-FE-SECURITY-001 진짜 도구 confirm 추가)
- `docs/adr/ADR-010-baseline-ratchet.md` (★ CI 통합 사례 추가)
- `decisions/STATUS.md` 갱신 (★ carry 5 → 3 / carry 2/3 resolved)
- `decisions/INDEX.md` (★ DEC entry)
- `decisions/DEC-2026-05-02-v1.4.2-carry-2-3-종결.md` (★ 신규)
- `CHANGELOG.md` v1.4.2 entry
- `tools/static-runner/package.json` 0.1.1 → 0.1.2

### 2.4 memory

- `project_v140_release_status.md` — v1.4.2 entry 추가
- 신규 후보: `feedback_custom_rule_first_match.md` — custom rule 첫 작성 = 진짜 도구 implicit 목표 종결 패턴

---

## 3. ★ 결단 의뢰 (6 핵심 묶음 — 일괄 승인 패턴)

### D1. Custom rule 위치

**옵션 A (권장)**: `tools/static-runner/rules/` (본체 자산)
- 근거: 사내 적용 시 재사용 가능 / Sprint 4 README 정합 / 다른 PoC 적용 가능
- 영향: 본체 도구 격상 (일관 적용)

**옵션 B**: `examples/poc-04-full-realworld-react/.semgrep/`
- 근거: PoC 측 자산 / 본체 무관
- 단점: 사내 적용 시 재사용 불가 / Sprint 4 README 정합 부재

★ **권장 = A** (본체 자산).

### D2. Rule 갯수

**옵션 A (권장)**: 1 rule 우선 — `jwt-localstorage` 만
- 근거: AP-FE-SECURITY-001 FE applies_to 직접 confirm = ★ implicit 목표 종결 = 본 carry 의 핵심
- 단점: Sprint 4 README 의 다른 custom rule (RSA git commit / JWT 길이) 미실현

**옵션 B**: 3 rule 동시 — `jwt-localstorage` + `rsa-git-commit` + `jwt-secret-length`
- 근거: Sprint 4 README 전부 실현 / AP-FE-SECURITY-001 BE/FE 양쪽 confirm
- 단점: scope 폭증 / 작업 시간 ~2배 / RSA + secret length 는 PoC #01/#02 (Java) 대상 = ★ 본 PATCH 의 PoC #04 트랙 정합 부재 → 별도 carry

★ **권장 = A** (1 rule 우선).

### D3. drift-check.yml 갱신 범위

**옵션 A (권장)**: PoC #04 full 트랙 추가 + `--baseline --ratchet` + custom rule 적용
- 근거: carry 3 명세 정합 / ADR-010 CI 통합 첫 입증
- 변경:
  ```yaml
  - name: run Semgrep on PoC #04 full (★ FE 트랙 / custom rule + ratchet)
    working-directory: ai-native-methodology
    run: |
      node tools/static-runner/src/cli.js \
        --plugin semgrep \
        --target examples/poc-04-full-realworld-react/INPUT/src \
        --output examples/poc-04-full-realworld-react/analysis/6-quality/semgrep-output \
        --ruleset p/owasp-top-ten \
        --extra-rules tools/static-runner/rules/custom-jwt-localstorage.yml \
        --baseline examples/poc-04-full-realworld-react/analysis/6-quality/semgrep-baseline.json \
        --ratchet
  ```
- 단점: ★ static-runner CLI 에 `--extra-rules` 옵션 부재 → static-runner 도구 격상 1건 (★ 본 carry 부수 산출 / multi-config 지원)

**옵션 B**: 기존 trace 만 갱신 — `--baseline --ratchet` 만 추가
- 근거: 빠름
- 단점: PoC #04 트랙 미적용 = 본 PATCH 의 핵심 미달

★ **권장 = A** (full + custom + ratchet).

### D4. baseline 갱신 (Custom rule 추가 후)

**옵션 A (권장)**: 기존 baseline 재작성 (★ custom rule 매칭 1건 = baseline grandfathered 등재)
- 근거: ADR-010 정책 정합 / "기존 결함은 grandfathered" 정합 / 신규 동일 패턴 발견 시 차단
- 단점: 1건 (auth-storage.ts:20) = ★ ★ ★ critical AP 가 grandfathered → 정책 검토 필요

**옵션 B**: baseline 그대로 (0 findings) / custom rule 매칭 시 즉시 차단
- 근거: AP-FE-SECURITY-001 = critical → ADR-010 §2.3 = "★★★ 즉시 차단 (baseline 등재 ❌ — production blocker)"
- 정합: ★ critical severity 는 baseline 등재 ❌ 가 ★ ADR-010 표준 → 옵션 B 가 ADR-010 정합

★ **권장 = B** (★ ADR-010 §2.3 critical = baseline 등재 ❌ 정합).
- 단, 본 carry 는 PoC 검증 = 사내 적용 아님 → ★ test mode 로 차단 검증 만 보고 (CI fail trigger 검증 / 실 fail 처리는 사내 적용 시점)

### D5. 버전

**옵션 A (권장)**: v1.4.2 PATCH 신규 release
- 근거: SemVer 정합 (carry resolve = quality 보완) / git tag v1.4.2 / CHANGELOG 명확
- 단점: tag 1개 증가 (★ v1.4.0 / v1.4.1 / v1.4.2 같은 날 3개)

**옵션 B**: v1.4.1 보강 (tag 갱신 안 함)
- 근거: 같은 날 작업 통합
- 단점: ★ feedback_methodology_body_priority.md 정합 부재 (release 후 보강 안티패턴)

★ **권장 = A** (SemVer 정합).

### D6. Custom rule test 검증

**옵션 A (권장)**: Semgrep 공식 test 패턴 적용 — `custom-jwt-localstorage.test.yml` + `semgrep --test`
- 근거: Semgrep 공식 권장 / Official research Q3 입증
- 산출: rule + test 페어 / CI 에서 자동 검증

**옵션 B**: 단순 manual run only (auth-storage.ts:20 매칭 1건 확인)
- 근거: 빠름
- 단점: ★ 본체 도구 자산 = 자동 test 부재 / 본 방법론 의 ★★★ no-simulation 정책 정합 부재 (★ 도구 자체 검증)

★ **권장 = A** (★ test 정합).

---

## 4. 단계별 실행 (D1=A / D2=A / D3=A / D4=B / D5=A / D6=A 가정)

### Phase A — Custom rule 작성 (15분)

1. `mkdir tools/static-runner/rules/`
2. `tools/static-runner/rules/custom-jwt-localstorage.yml` 신설:
   ```yaml
   rules:
     - id: aimd-jwt-localstorage
       message: |
         JWT/auth token 을 localStorage 에 저장 — XSS 공격 표면.
         ★ ADR-FE-007 / AP-FE-SECURITY-001 / OWASP A02 + A07.
         권고: httpOnly + Secure + SameSite=Lax cookie + CSP 강화.
       severity: ERROR
       languages: [ts, tsx, js, jsx]
       pattern-either:
         - pattern: localStorage.setItem("$KEY", $VAL)
         - pattern: localStorage.setItem(`$KEY`, $VAL)
         - pattern: localStorage.setItem($KEY_VAR, $VAL)
       metavariable-regex:
         metavariable: $KEY
         regex: (?i)(token|jwt|auth|access|bearer|session)
       metadata:
         cwe: CWE-922
         owasp: ['A02:2021', 'A07:2021']
         references:
           - https://owasp.org/www-community/HttpOnly
           - https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html
         category: security
         technology: [react, typescript, javascript]
         license: Internal-Proprietary
   ```
3. `tools/static-runner/rules/custom-jwt-localstorage.test.yml` 신설 (★ Official research Q3 결과 정합)
4. `semgrep --test tools/static-runner/rules/` 통과 검증

### Phase B — Static-runner CLI 격상 (10분)

★ D3 = A 시 `--extra-rules` 옵션 신규 = static-runner 격상 1건 (★ 본 carry 부수 산출):
1. `tools/static-runner/src/runner.js` `SemgrepPlugin` `mandatoryArgs` 갱신:
   ```js
   mandatoryArgs: ({ targetDir, sarifPath, ruleset, extraRules, extraArgs = [] }) => [
     'scan',
     '--config', ruleset ?? 'p/owasp-top-ten',
     ...(extraRules ?? []).flatMap(r => ['--config', r]),
     '--sarif',
     '--sarif-output', sarifPath,
     ...extraArgs,
     targetDir,
   ],
   ```
2. `tools/static-runner/src/cli.js` `--extra-rules <path>` 옵션 추가 (반복 가능)
3. unit test 갱신 + 9 → 10+ pass

### Phase C — PoC #04 full 재실행 (★ custom rule 매칭 검증) (10분)

```
node tools/static-runner/src/cli.js \
  --plugin semgrep \
  --target examples/poc-04-full-realworld-react/INPUT/src \
  --output examples/poc-04-full-realworld-react/analysis/6-quality/semgrep-output-custom \
  --ruleset p/owasp-top-ten \
  --extra-rules tools/static-runner/rules/custom-jwt-localstorage.yml
```

기대 결과:
- ★ ★ ★ 1 finding (auth-storage.ts:20 / aimd-jwt-localstorage / ERROR)
- 5종 물증 7 필드 정상
- ★ AP-FE-SECURITY-001 진짜 도구 직접 confirm ✅ (★ implicit 목표 종결)

### Phase D — drift-check.yml 갱신 (15분)

1. PoC #04 full 트랙 신규 step 추가
2. `--baseline --ratchet` 적용
3. custom rule 적용 (`--extra-rules`)
4. ★ ★ critical severity baseline 등재 정책 명시 (★ ADR-010 §2.3)

### Phase E — PoC #04 full 산출물 갱신 (20분)

1. `examples/poc-04-full-realworld-react/analysis/6-quality/static-security-spec.json` 갱신:
   - ★ custom rule 매칭 1건 추가
   - ★ implicit 목표 미달 → ★ 종결 (custom rule 작성으로)
   - carry 2 신규 → resolved
2. `examples/poc-04-full-realworld-react/analysis/6-quality/semgrep-baseline.json` 변경 정책:
   - ★ 옵션 B (★ critical = baseline 등재 ❌ / ADR-010 §2.3) → baseline 그대로 (0 findings)
   - ratchet 모드 → 매칭 1건 = novel = blocked = exit 1
   - ★ 본 carry 는 보고 only (사내 적용 시점에 실 fail trigger)

### Phase F — 본체 갱신 (45분)

1. `tools/static-runner/package.json` 0.1.1 → **0.1.2** (★ feature add patch)
2. `tools/static-runner/README.md` §1차 plugin 범위 갱신 (★ "별도 → v1.4.2 첫 실현")
3. `docs/v1.4.2-release-note.md` 신설
4. `docs/adr/ADR-FE-007` cross-link 갱신 (★ AP-FE-SECURITY-001 진짜 도구 직접 confirm 사례)
5. `docs/adr/ADR-010-baseline-ratchet.md` §3 (★ CI 통합 사례)
6. `decisions/STATUS.md` 갱신 (★ carry 5 → 3 / carry 2/3 resolved)
7. `decisions/INDEX.md` (DEC entry)
8. `decisions/DEC-2026-05-02-v1.4.2-carry-2-3-종결.md` (★ 신규)
9. `CHANGELOG.md` v1.4.2 entry
10. memory: `project_v140_release_status` 갱신 + 신규 후보 `feedback_custom_rule_first_match.md`

### Phase G — commit + tag (10분)

1. git status (★ plugin 작업 untracked 보존 의무)
2. 명시적 file 명단 stage (★ v1.4.1 패턴 정합)
3. commit
4. git tag v1.4.2

---

## 5. 위험

### 5.1 Custom rule pattern 매칭 실패

- 본 plan 의 pattern 가 yurisldk fork `auth-storage.ts:20` `window.localStorage.setItem(TOKEN_STORAGE_KEY, token)` 매칭 가능?
- **risk**: `TOKEN_STORAGE_KEY` 가 변수 (token-string 의 const)이라 `$KEY_VAR` pattern 정합. metavariable-regex 가 변수 식별자 매칭 vs 변수 값 매칭 — Official research Q1 답변 의존
- **mitigation**: Phase B 검증 시 매칭 0건 시 pattern 보강 (★ 변수 값 추적 / `pattern-source` 활용)

### 5.2 Static-runner CLI 격상 영향

- 기존 9 unit test 깨질 가능성
- **mitigation**: 점진 변경 + test pass 의무

### 5.3 drift-check.yml CI 실 실행 검증 불가

- 본 환경 (Windows local) 에서 GitHub Actions runner 시뮬 불가
- **mitigation**: ★ 본 carry 는 yaml 정합 + local 동치 명령 실행 만 검증. 실 CI 통과 = ★ 다음 push 시 검증 (★ 본 carry scope 외부 carry / 별도 trigger)

### 5.4 critical baseline 등재 ❌ 정책 (D4=B) 의 trade-off

- ADR-010 §2.3 정합이지만 사내 적용 시 즉시 fail trigger
- **mitigation**: 본 carry 는 PoC 검증 only — 사내 적용 시점에 별도 결단 (★ exemption 메커니즘 / quarterly review 등)

---

## 6. 다음 단계 (사용자 승인 후)

1. Official research 1종 완료 대기 (★ Semgrep custom rule syntax / metavariable-regex / test 패턴 / SARIF rule_id)
2. plan 갱신 (research 반영)
3. 사용자 일괄 승인 (D1~D6) → Phase A~G 순차 실행
4. 종결 후 DEC 등재

## 7. ★ Lessons Learned (본 plan 작성 중 도출)

- ★ ★ Sprint 4 README 의 "별도" 라벨 작업이 1년 가까이 carry-over 된 패턴 → ★ 본 carry = 첫 실현 = ★ ★ Sprint 4 의 long-tail carry 닫는 패턴 (★ 사내 적용 진입 자격 강화)
- ★ ADR-010 §2.3 critical = baseline 등재 ❌ 정책의 첫 운영 적용 사례 (★ ADR-010 §3 보강 후보)
- ★ 같은 날 v1.4.0 → v1.4.1 → v1.4.2 = ★ ★ Auto Mode + 4원칙 + 일괄 승인 패턴 = 빠른 carry resolve cadence 입증 (★ 신규 패턴 / memory 후보)
