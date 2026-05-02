# DEC-2026-05-02 — JWT secret weak + RSA private key commit custom Semgrep rule (★ no release)

- 일자: 2026-05-02
- 카테고리: methodology / poc-tooling / static-runner quality 격상
- 결정자: Auto Mode (4원칙 정합 / 사용자 "일단 계속 진행해보자" 결단)
- 상태: 승인 (★ no release / no tag / 본체 commit 만)
- 관련: DEC-2026-05-02-v1.4.2-carry-2-3-종결 (★ §6 신규 carry 2건 trigger) / DEC-2026-04-29-static-tool-실행-의무화 / ADR-010 §2.3

---

## 1. 컨텍스트

### 1.1 v1.4.2 §6 신규 carry 2건

DEC-2026-05-02-v1.4.2-carry-2-3-종결 §6:
- ★ 신규 1: sarif-to-finding 어댑터 severity 변환 (HIGH → medium) 검토 (★ 본 결단 scope 외부 / 별도 carry 보존)
- ★ 신규 2: ★ ★ "RSA git commit + JWT secret 길이 custom rule (Sprint 4 README 의 다른 별도 carry)" — ★ ★ 본 결단 종결

### 1.2 학습 코퍼스

- PoC #01 (Spring Boot 2.5) — F-AP-SECURITY-001 critical: JWT secret 21 byte hardcode (HMAC-SHA256 권고 ≥ 32 byte 미달)
- PoC #02 (Spring Boot 3.3 Hexagonal) — F-068 critical: `server/api/src/main/resources/app.key` RSA private key git 직접 commit
- PoC #03 (NestJS) — F-161 positive: Bearer 표준 ✅ 학습 효과 (비재현)
- PoC #04 (React FSD) — AP-FE-SECURITY-001 (FE localStorage / 별개 영역 / v1.4.2 종결)

→ ★ AP-SECURITY-001 BE = 2 PoC isomorphic (PoC #01 + PoC #02) + 1 PoC positive (PoC #03 학습 효과) → ★ §8.1 strict 임계 ≥ 3 isomorphic 미달 → ★ ★ 본체 ADR / schema 격상 ❌ / static-runner quality 격상 영역만.

---

## 2. 결정 (D1~D5)

| # | 항목 | 결단 | 근거 |
|---|---|---|---|
| **D1** | rule 분리 vs 통합 | ★ **2 rule 분리** (`jwt-secret-weak` + `rsa-private-key-commit`) | 도메인 다름 (length 검사 vs PEM detection) / 매칭 패턴 본질적 차이 |
| **D2** | rule slug | `internal.be.security.jwt-secret-weak` + `internal.be.security.rsa-private-key-commit` | jwt-localstorage 의 `internal.fe.security.*` 패턴 정합 (`be` axis 적용) |
| **D3** | 본체 자산화 | ★ **❌** — `tools/static-runner/rules/` 안 자산만 / ADR / schema / methodology-spec 진입 ❌ | §8.1 strict 임계 미달 (AP-SECURITY-001 BE 2 PoC) |
| **D4** | release / tag | ★ **❌** — no release / no tag / 본체 commit 만 | release worthy ❌ (v1.4.2 jwt-localstorage 와 차이 = 4 PoC vs 2 PoC + ADR ❌) |
| **D5** | drift-check.yml CI 통합 | body 본 step 에 `--extra-rules` 2건 추가 | 단일 step / baseline 추가 ❌ (★ workspace 자체 false positive 검증 carry) |

---

## 3. 실행 결과

### 3.1 신규 자산 (4 파일)

- `tools/static-runner/rules/jwt-secret-weak.yml` (★ neu)
  - severity: ERROR / languages: [generic]
  - pattern-either 2 분기:
    - (1) yaml/properties: `jwt.secret: "short"` / `JWT_SECRET=short` (regex / length 1~31)
    - (2) Java/JS/TS hardcode: `String JWT_SECRET = "short"` (regex / length 1~31)
  - paths.exclude: test fixture + 본 rules 디렉토리 self-exclude (★ 자기 fixture false positive 회피)
  - metadata: CWE-326 / OWASP A02:2021 / cross_poc_isomorphic_count 2

- `tools/static-runner/rules/jwt-secret-weak.txt` (★ neu / Semgrep test fixture)
  - 7 positive cases + 5 negative cases

- `tools/static-runner/rules/rsa-private-key-commit.yml` (★ neu)
  - severity: ERROR / languages: [generic]
  - pattern-either 6 분기 (RSA / PRIVATE / ENCRYPTED / OPENSSH / EC / DSA PEM header)
  - paths.exclude: test fixture + 본 rules 디렉토리 self-exclude
  - metadata: CWE-321 + CWE-798 / OWASP A02 + A07:2021 / cross_poc_isomorphic_count 2

- `tools/static-runner/rules/rsa-private-key-commit.txt` (★ neu / Semgrep test fixture)
  - 5 positive cases (RSA / PRIVATE / OPENSSH / EC / ENCRYPTED) + 3 negative cases (PUBLIC KEY / CERTIFICATE / hardcode token)

### 3.2 갱신 자산 (1 파일)

- `.github/workflows/drift-check.yml` body 본 step
  - `--extra-rules tools/static-runner/rules/jwt-secret-weak.yml`
  - `--extra-rules tools/static-runner/rules/rsa-private-key-commit.yml`

### 3.3 검증

| 검증 | 결과 |
|---|---|
| `semgrep --test` jwt-secret-weak | ✅ 1/1 All tests passed |
| `semgrep --test` rsa-private-key-commit | ✅ 1/1 All tests passed |
| ★ PoC #01/02 INPUT/ 진짜 매칭 | ❌ source 부재 (★ workspace 외부 영역 / carry) |
| workspace 본체 진짜 Semgrep 실행 | ⏳ drift-check.yml CI 다음 push 시 자동 / 본 commit 검증 ❌ |

★ no-simulation 단계 = ★ 단계 4 (★ Semgrep --test 통과 + drift-check.yml CI 통합 / 단계 5 = source 매칭 검증 carry).

---

## 4. carry

| # | carry | 영역 |
|---|---|---|
| 1 | PoC #01/02 source 재clone + jwt-secret-weak / rsa-private-key-commit 매칭 검증 | v1.5 / 사내 적용 시 |
| 2 | 본 rule 의 workspace 본체 진짜 매칭 false positive 검증 | drift-check.yml CI 다음 push 자동 |
| 3 | sarif-to-finding 어댑터 severity 변환 (HIGH → medium) 검토 (★ v1.4.2 §6 신규 1 보존) | v1.5 |

---

## 5. Lessons

1. ★ 자기 fixture self-exclude 의무 (★ 일반화 가능 패턴) — Semgrep custom rule 의 test fixture 가 자기 rule 의 매칭 대상이 됨 / `paths.exclude` 안 본 rules 디렉토리 self-exclude 명시 의무 (★ jwt-localstorage.yml 에는 누락 / v1.4.2 carry 후속 보강 carry).
2. ★ §8.1 strict 임계 (≥ 3 PoC isomorphic) = ★ 본체 ADR / schema 격상 vs static-runner quality 격상 분기점 — AP-SECURITY-001 BE 는 본체 ADR ❌ / tools 자산만.
3. ★ release worthy 판정 — 4 PoC isomorphic + 본체 ADR 매핑 (v1.4.2) vs 2 PoC + 본체 ADR ❌ (본 결단) → 후자 = no release / no tag.

---

## 6. 종결 진술

> ★ v1.4.2 §6 신규 carry 2건 (jwt-secret-weak + rsa-private-key-commit) ★ 종결.
> ★ Semgrep --test 양쪽 통과 / drift-check.yml CI 통합 / paths.exclude self-exclude 적용.
> ★ no release / no tag / 본체 commit 만 (★ §8.1 strict 임계 미달 / AP-SECURITY-001 BE 2 PoC isomorphic).
> ★ carry 3건 보존 (PoC source 매칭 / workspace false positive / severity 변환).

**End of DEC-2026-05-02-jwt-rsa-custom-rule.**
