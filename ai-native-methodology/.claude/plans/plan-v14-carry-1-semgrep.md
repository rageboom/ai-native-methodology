# plan — v1.4.0 carry 1 Semgrep 진짜 실행 종결

> 일자: 2026-05-02 (v1.4.0 release 직후 / 4 carry 중 #1 진입)
> 작업자: Auto Mode (4원칙 정합)
> 진입 trigger: 사용자 "1" 결단 (carry 4 옵션 중 Semgrep 1순위 채택)
> 본 plan = 4원칙 §1 깊은 숙지 산출.
> 다음 단계 = §2 가벼운 sub-agent research (memory `feedback_lightweight_sub_agent.md`) → §3 사용자 일괄 승인 → §4 코드 착수.

---

## 1. 컨텍스트 (★ 전제 깨짐 발견 — 가장 중요)

### 1.1 release note §4.1 의 carry 정의

```
★ ★ Semgrep CLI Docker 진짜 실행 (★ G2 carry)
- 환경: Windows Docker Desktop 부재 / WSL2 또는 Linux runner 위임
- 영향: ★ static-security-spec.json 1차 grep fallback 만 (★ JWT XSS confirm)
- 일정: v1.5 또는 adoption 트랙 진입 시 진짜 실행 의무
```

→ **전제: "Docker 만 진짜 실행 채널"**.

### 1.2 ★★★ 본 plan 의 핵심 발견 (★ research × 2 검증 후 강화)

**Semgrep 은 pip 으로 진짜 실행 가능 (Python 3.14 = ★ 공식 지원)**.

```
$ python --version
Python 3.14.1

$ python -m pip install --dry-run semgrep
Would install ... semgrep-1.161.0
```

★ **research 검증 결과** (Official agent):
- PyPI classifier `Python :: 3.14` 정식 등재 (1.161.0)
- `cli/pyproject.toml` `requires-python = ">=3.10"` (상한 없음)
- wheel ABI tag = `cp310...cp314` 빌드됨
- glom SyntaxWarning (Python 3.14) = issue #11460 closed (1.161.0 fix)

→ **release note §4.1 carry 의 "Docker 부재 = 진짜 실행 불가" 전제 ★ 결정적으로 깨짐**. Windows native binary / choco / winget 등 없으나 pip/pipx/uv 채널 충분.

### 1.3 ★★★ 핵심 risk 발견 (★ Senior research)

**JWT localStorage 직접 매칭 실패 가능성** — carry 1 의 implicit 핵심 목적 (4 PoC isomorphic AP-FE-SECURITY-JWT-LOCALSTORAGE 진짜 도구 confirm) 이 단순 1회 실행으로 ★ 미달 가능성.

근거 (raw):
- Semgrep `react-jwt-in-localstorage` 룰 pattern = 2단계:
  - (a) `jwt_decode` 또는 동치 임포트
  - (b) `localStorage.setItem(..., jwt_decode(...))` 또는 그 결과 변수
- target `examples/poc-04-full-realworld-react/INPUT/src/shared/api/auth-storage.ts:20` = `window.localStorage.setItem(TOKEN_STORAGE_KEY, token)` (raw token, **`jwt_decode` 임포트 0건**)

→ ★ **룰 매칭 0건 가능성 농후**. 그러나 carry 1 의 명목 목표 (Semgrep 진짜 실행 + SARIF + 5종 물증) 는 통과 가능 = **success criteria 분리 의무**.

### 1.3 carry 종결 시 효과

| 영역 | Before (v1.4.0) | After (carry 1 종결) |
|---|---|---|
| 진짜 도구 종류 | 6종 (ts-morph + Playwright + axe + drift-FE + schema-validator + formal-spec-link FE) | **7종** (+ Semgrep) |
| -5%p 패널티 | 적용 (Semgrep grep fallback) | **제거** |
| 신뢰도 (PoC #04 full Phase 6) | 0.92 (단계 5) | **0.92~0.95** (단계 5+ 강화) |
| static-security-spec.json `semgrep_real_run` | `false` | `true` |
| static-security-spec.json `tool_primary_status` | `carry_to_user` | `done` |
| 4 PoC isomorphic JWT XSS confirm | grep matches=1 (간접) | **Semgrep SARIF rule match (직접)** ★ |
| baseline 자산 | 부재 | 첫 작성 (ratchet 진입 자격) |
| ADR-010 정합 | baseline+ratchet 자체 입증 (BE phase-flow) | **PoC #04 full 외부 적용 입증** |

---

## 2. 자산 인벤토리 (전수 조사 결과)

### 2.1 도구 측 (★ 모두 준비됨)

- `tools/static-runner/src/runner.js` — Semgrep plugin (preflight + scan + SARIF + 5종 물증) ✅
- `tools/static-runner/src/cli.js` — `--baseline / --ratchet / --write-baseline` 통합 ✅
- `tools/static-runner/src/sarif-to-finding.js` — SARIF → finding 어댑터 ✅
- `tools/_shared/baseline.js` — 공용 baseline 로직 ✅
- `tools/static-runner/test/` — 9 unit test pass ✅

→ **도구 신규 작업 0건**. carry 종결 = **운영 1회 실행** 만.

### 2.2 PoC #04 full 측

- `examples/poc-04-full-realworld-react/INPUT/` — yurisldk/realworld-react-fsd fork (target 후보 1순위)
- `examples/poc-04-full-realworld-react/analysis/6-quality/static-security-spec.json` — 갱신 대상 (1차 grep fallback 산출)
- `examples/poc-04-full-realworld-react/_tools/node_modules/` — Playwright/axe-core 등 설치됨

### 2.3 본체 측 (carry 갱신 대상)

- `docs/v1.4-release-note.md` §4.1 (carry 1 → resolved)
- `docs/v1.4-release-note.md` §3.3 (진짜 도구 6종 → 7종)
- `docs/v1.4-release-note.md` §5 (단계 5 0.92 → 0.92~0.95)
- `docs/adr/ADR-009-다이어그램-신뢰-모델.md` (★ 갱신 검토 — 단계 5 정의에 Semgrep pip 채널 추가 여부)
- `docs/adr/ADR-010-baseline-ratchet.md` (★ 외부 적용 첫 입증 사례 추가)
- `decisions/STATUS.md` (★ carry 4 → 3건 / Semgrep resolved)
- `decisions/INDEX.md` (★ DEC 신규 entry)
- `decisions/DEC-2026-05-02-v1.4-carry-1-Semgrep-종결.md` (신규)
- `CHANGELOG.md` (v1.4.0 release note 보강 또는 v1.4.1 PATCH 진입 결단)

### 2.4 memory 측 (갱신 대상)

- `memory/project_v140_release_status.md` — 4 carry → 3 carry
- `memory/project_v140_fe_track.md` — 신뢰도 0.92 → 0.92~0.95
- ★ 신규 memory 후보: `feedback_semgrep_pip_channel.md` — Docker 가정 없이도 pip 채널로 진짜 실행 가능 (★ release note carry 가정 깨짐 패턴)

---

## 3. ★ 결단 의뢰 (5 핵심 묶음 — 일괄 승인 패턴)

### D1. Target 범위

**옵션 A (권장)**: PoC #04 full **단독**
- 근거: release note §4.1 carry 명시 = PoC #04 full / JWT XSS 4 PoC isomorphic confirm 목적 / 단일 PoC 적용 시 작업 시간 ~1시간
- 단점: BE Sprint 5+ carry (PoC #02/#03 Java/TS) 미처리 → 별도 carry 항목으로 이전

**옵션 B**: PoC #04 full + PoC #03 NestJS 동시
- 근거: BE Sprint 5+ carry-over 도 함께 종결 (TS 환경 동일)
- 단점: 작업 시간 ~2시간 / 산출물 갱신 2배

**옵션 C**: 4 PoC 전체 + 본체 자가 적용
- 근거: 완벽 정합 / ★★★ 자가 입증 패턴 5번째 (phase-flow drift 0 자가 입증 모방)
- 단점: PoC #02 Java = PMD 별도 환경 prerequisite / 작업 시간 ~4시간

★ **권장 = A**. ★ §8.1 strict 단일 PoC 과적합 회피 (memory `feedback_quality_priority.md`) 정합 — PoC #04 full = release note carry 명시 = 1 PoC 단독 적용 = 그대로 정합.

### D2. baseline 정책

**옵션 A (권장)**: 첫 baseline 작성 — `--write-baseline` (★ ratchet 진입 자격 확보)
- 근거: ADR-010 정합 / 첫 운영 = baseline 시점 / 차후 ratchet 모드 진입 시 즉시 활용
- baseline 위치: `examples/poc-04-full-realworld-react/analysis/6-quality/semgrep-baseline.json`

**옵션 B**: baseline 없이 단순 1회 실행
- 근거: 빠름
- 단점: ADR-010 정합 부재 / 차후 재실행 시 baseline 첫 작성 시점 기록 누락

★ **권장 = A**.

### D3. ruleset

**옵션 A (권장)**: `p/owasp-top-ten` (Semgrep plugin default)
- 근거: ADR-FE-007 + AP-FE-SECURITY-001 (4 PoC isomorphic) 의 OWASP A02 (cryptography) / A03 (XSS) 정합 / static-runner default
- 적용 룰: ~150+ (semgrep registry)

**옵션 B**: `p/typescript` + `p/react` 동시 적용
- 근거: TypeScript+React 특화 룰 추가
- 단점: 노이즈 ↑ / 첫 baseline 시 분류 비용 ↑

**옵션 C**: 사내 custom ruleset (JWT 길이 / RSA git commit) 별도 신설
- 근거: 사내 적용 시 직접 사용 가능 자산
- 단점: 별도 작업 (Sprint 4 README §1차 plugin 범위 의 후속)

★ **권장 = A** (최소 scope). C 는 별도 carry (v1.5 또는 adoption 트랙).

### D4. 결과 처리 — 신규 finding 발견 시

**옵션 A (권장)**: 새 finding F-FE-007+ 등재 / candidate / Phase 6 추가
- 근거: 진짜 도구 = 새 finding 발견 가능성 = 정상 / candidate 단계 등재 = §8.1 strict 정합
- 단점: 작업 시간 +30분 (finding 별)

**옵션 B**: 보고만 — finding 등재 별도 carry
- 근거: 빠름
- 단점: ★★★ no-simulation 정책 정합성 (진짜 도구 결과 = 즉시 등재 의무) 부재

★ **권장 = A**.

### D5. 본체 자가 적용 (Bonus)

**옵션 A**: 본 세션 포함 — 본체 `tools/` 에 Semgrep 1회 적용 (자가 입증 패턴 5번째)
- 근거: ★★★ phase-flow drift 0 자가 입증 (Sprint 5+ Phase B) 모방 / 본체 신뢰도 격상
- 단점: 작업 시간 +30분

**옵션 B (권장)**: 별도 carry — 본 세션은 PoC #04 full 만
- 근거: D1 = A (단독) 정합 / scope 최소화 / 자가 적용 자체는 큰 가치 추가 없음 (drift-validator 와 달리 Semgrep 은 코드 검증 도구라 자가 적용 = 본체 코드 보안만 검증 / 패턴 입증 가치 작음)
- 단점: 자가 입증 한 번 더 미룸

★ **권장 = B**.

---

## 4. 단계별 실행 (D1=A / D2=A / D3=A / D4=A / D5=B 가정)

### Phase A — 환경 준비 (10분)

1. `python -m pip install semgrep` — 진짜 설치
2. `semgrep --version` — 환경 확인
3. preflight 통과 검증: `node tools/static-runner/src/cli.js --plugin semgrep --target ai-native-methodology/examples/poc-04-full-realworld-react/INPUT/src --output /tmp/semgrep-test --ruleset p/owasp-top-ten` (dry trial)

### Phase B — Semgrep 진짜 실행 (15분)

1. target 디렉토리: `examples/poc-04-full-realworld-react/INPUT/src/`
2. output 디렉토리: `examples/poc-04-full-realworld-react/analysis/6-quality/semgrep-output/`
3. ruleset: `p/owasp-top-ten`
4. baseline 없이 1회 실행 (`--write-baseline` 다음 phase 에서 별도)
5. 산출:
   - `semgrep-output/semgrep.stdout.log`
   - `semgrep-output/semgrep.stderr.log`
   - `semgrep-output/semgrep.sarif`
   - `semgrep-output/static-runner.evidence.json` (5종 물증)

### Phase C — 결과 분석 + finding 등재 (30분)

1. SARIF 결과 분석:
   - JWT localStorage XSS 직접 confirm? (★ release note carry 의 핵심 목적)
   - 신규 OWASP finding 발견 여부
   - 신규 finding 발견 시 → F-FE-007+ 등재 (Phase 6 finding 카탈로그)
2. finding candidate 등재 (D4 = A 정합)
3. PoC #04 full Phase 6 finding 카탈로그 보강

### Phase D — baseline 첫 작성 (10분)

1. `node tools/static-runner/src/cli.js --plugin semgrep --target <target> --output <output> --ruleset p/owasp-top-ten --write-baseline examples/poc-04-full-realworld-react/analysis/6-quality/semgrep-baseline.json`
2. baseline 산출 검증
3. ratchet 모드 dry trial 1회 (`--baseline <path> --ratchet`) — grandfathered 분류 정합 확인

### Phase E — 산출물 갱신 (30분)

1. `examples/poc-04-full-realworld-react/analysis/6-quality/static-security-spec.json` 갱신:
   - `meta.captured_by`: `"real (★ Semgrep carry — Docker 환경 부재)"` → `"real (★ Semgrep pip 채널 진짜 실행 ✅)"`
   - `meta.tool_primary_status`: `carry_to_user` → `done`
   - `deliverable_12_compliance.semgrep_real_run`: `false` → `true`
   - `deliverable_12_compliance.semgrep_carry_reason`: 제거
   - `deliverable_12_compliance.no_simulation_penalty`: 제거
   - rules_applied_via_semgrep[] 신설 (SARIF 결과 정합)
2. PoC #04 full 의 `_manifest.yml` 보강 (5종 물증 cross-link)
3. PoC #04 full Phase 6 finding 카탈로그 갱신

### Phase F — 본체 갱신 (45분)

1. `docs/v1.4-release-note.md`:
   - §3.3 — "진짜 도구 6종 + Semgrep carry" → "진짜 도구 7종 (★ Semgrep pip 채널)"
   - §4.1 — carry 1 entry → resolved
   - §5 — 단계 5 정의에 "Semgrep pip 채널 진짜 실행" 추가
   - §9 — "4 carry 명시" → "3 carry 명시" + Semgrep resolved
2. `docs/adr/ADR-009-다이어그램-신뢰-모델.md`:
   - §4.3 — `tools/static-runner/` 의 Semgrep PoC #04 full 1회 실 실행 → 단계 5 도달 사례 추가
3. `docs/adr/ADR-010-baseline-ratchet.md` (★ 위치 확인):
   - 외부 적용 첫 입증 사례 추가 (PoC #04 full)
4. `decisions/STATUS.md`:
   - 기준일 갱신 + carry 4 → 3
   - 시퀀스 진행률 entry 추가
5. `decisions/INDEX.md`:
   - DEC 신규 entry
6. `decisions/DEC-2026-05-02-v1.4-carry-1-Semgrep-종결.md` 신설
7. `CHANGELOG.md`:
   - v1.4.0 release note 보강 또는 v1.4.1 PATCH 신규 entry (★ D6 결단 — §5 후술)
8. memory:
   - `project_v140_release_status.md` 갱신
   - `project_v140_fe_track.md` 갱신
   - `feedback_semgrep_pip_channel.md` 신규 (Docker 가정 없이 pip 채널 진짜 실행 가능 패턴)
   - MEMORY.md index 갱신

### Phase G — commit (10분)

1. git status 확인
2. 본체 + PoC + memory 변경 stage
3. commit message: `v1.4.0 carry 1 종결 — Semgrep pip 채널 진짜 실행 (★ release note carry 가정 깨짐)`
4. git tag 결단 (★ D6 — v1.4.1 PATCH 진입 여부)

---

## 5. ★ 추가 결단 (D6) — 버전 정책

### D6. v1.4.0 보강 vs v1.4.1 PATCH 진입

**옵션 A**: v1.4.0 release note 보강만 (★ tag 갱신 없음)
- 근거: release 직후 carry 종결 = release note 의 자연스러운 후속 / SemVer 측 변경 0
- 단점: git tag `v1.4.0` 시점과 release note 내용 불일치 (release 시점 = carry 4 / 보강 후 = carry 3)

**옵션 B (권장)**: v1.4.1 PATCH release 진입
- 근거: SemVer 정합 (PATCH = 호환 버그/품질 보완) / carry 종결 = quality 보완 / git tag `v1.4.1` 신규 / CHANGELOG entry 명확
- 단점: tag 1개 증가

★ **권장 = B** (SemVer 정합 + 명확성).

---

## 6. ★ 위험 / 검증 (★ research 2종 검증 후 강화)

### 6.1 ★ ~~Semgrep pip 설치 실패~~ → **★ 해소** (Official research)

- Python 3.14 = ★ 공식 지원 (PyPI classifier / pyproject.toml `>=3.10` / glom #11460 fix)
- pip dry-run 통과 → 실 install 안전

### 6.2 ★ ★ ★ Windows tmp PermissionError (★ 가장 큰 risk) — issue #11403

- **상세**: `C:\Users\..\AppData\Local\Temp\..` PermissionError (config 단계 임시 디렉토리 접근 실패)
- **재현 환경**: v1.146.0 / Python 3.12.7 / Windows 11 → ★ 미해결 보고 (1.161.0 fix 여부 = 모름)
- **본 환경 정합**: Windows 11 Pro / Python 3.14.1 → ★ 재현 가능성 실재
- **Mitigation 4종 (Phase A 진입 시 의무)**:
  1. `pip install "semgrep>=1.161.0"` 정확 pin
  2. `$env:PYTHONUTF8 = "1"` (한글 path / 주석 깨짐 방지)
  3. `$env:TMP = "C:\semgrep-tmp"` (ASCII 경로 override)
  4. `--include="src/**"` scope 제한 (탐색 시간 단축 + tmp 압박 ↓)
- **Fail-safe**: Phase A preflight 실패 시 즉시 carry 유지 / release note 보존

### 6.3 ★ ★ JWT localStorage 직접 매칭 실패 가능성 (★ implicit 목표 미달)

- §1.3 정합. `react-jwt-in-localstorage` 룰 매칭 0건 가능성 ★
- **본 carry 의 success criteria 분리 의무** (★ §7 신설):
  - 명목 (Semgrep 진짜 실행 + SARIF + 5종 물증) = 통과 가능
  - implicit (AP-FE-SECURITY-JWT-LOCALSTORAGE 직접 confirm) = ★ 미달 가능성
- **결과 처리**: 매칭 0건 시 보고서에 "왜 못 잡았는가" 분석 (jwt_decode 임포트 부재 = raw token 저장) + custom rule 작성 별도 carry 명시 (v1.4.2 또는 v1.5)

### 6.4 ★ noise (false positive) 추정 (★ Senior research)

- 총 finding 추정 20~75건 / FP 40~60%
- baseline 첫 작성 시 grandfathered 15~50건
- **분류 부담**: 2~6시간 추정 (★ 본 plan 시간 추정에 반영 — Phase E 30분 → 2~6시간 갱신)

### 6.5 SARIF 옵션 정합 (Official research)

- `--sarif` (stdout) + `--sarif-output <path>` (사본) = ★ deprecated 아님 (CLI reference 정합)
- 본체 static-runner plugin `mandatoryArgs` 그대로 통과 가능
- SARIF 형식 버전 (2.1.0 여부) = 모름 → 런타임 출력 직접 확인 의무

### 6.6 ruleset 의 정확 룰 갯수 = 모름 (Official research)

- `p/owasp-top-ten` ≈ ~500 룰 (Sprocket Security 블로그 인용 — 신뢰도 중)
- 정확 카운트 = ★ 모름 (registry SPA / API 404)
- TS/React 룰 포함 = 간접 입증 (semgrep blog 2025 / semgrep-rules repo)
- 런타임 `semgrep --config p/owasp-top-ten --dump-config` 으로 정확 확인 가능

---

## 7. ★ Success Criteria 분리 (★ Senior research 추가 경고 반영)

### 7.1 명목 success (★ carry 1 종결 의무)

- ✅ Semgrep 1.161.0+ pip 채널 진짜 실행 1회
- ✅ SARIF 산출 + 5종 물증 (`tool_version` / `stdout_path` / `stderr_path` / `invocation_timestamp` + `duration_ms` / `result_hash` / `reproduction_command`)
- ✅ baseline 첫 작성 (`semgrep-baseline.json`)
- ✅ static-security-spec.json 갱신 (`semgrep_real_run: true`)
- ✅ -5%p 패널티 제거
- ✅ ADR-009 단계 5 강화 (진짜 도구 6 → 7종)

→ ★ 본 항목 통과 시 carry 1 종결 ✅. (Senior 권고: Q4 + 추가 경고 1)

### 7.2 ★ implicit (선택 — 미달 가능)

- ⚠ AP-FE-SECURITY-JWT-LOCALSTORAGE 룰 직접 매칭
- 미달 시 처리:
  - 보고서에 "왜 못 잡았는가" 분석 추가 (`auth-storage.ts` raw token 저장 / `jwt_decode` 임포트 부재)
  - custom rule 작성 별도 carry 등재 (★ v1.4.2 PATCH 또는 v1.5)
  - 본 carry 1 = ★ implicit 미달이지만 명목 통과로 종결 (Senior 추가 경고 1 정합)

## 8. 다음 단계 (사용자 승인 후)

1. ✅ 가벼운 sub-agent research 2종 완료 (memory `feedback_lightweight_sub_agent.md` 정합):
   - Senior: 예상 finding 20~75 / FP 40~60% / JWT 매칭 실패 가능 / Windows tmp risk / D1+D3+D6 권고
   - Official: Python 3.14 공식 / `--sarif-output` 정합 / Windows beta + pip/pipx/uv 채널 / native binary 부재
2. ✅ plan 갱신 완료 (research 반영)
3. ⏳ 사용자 일괄 승인 (5~6 핵심 묶음 D1~D7) → Phase A~G 순차 실행
4. ⏳ 종결 후 결단 묶음 모두 DEC 등재

---

## 8. Lessons Learned (★ 본 plan 자체 작성 중 도출)

- ★★★ release note 의 carry 정의 = "환경 가정 (Docker)" 에 묶여 있는데, 채널 다양성 (pip / Docker / native binary) 검증 안 된 채로 carry 명시한 것 = **carry 정의 시 환경 옵션 전수 조사 필요** 패턴.
- 본 plan 작성 = **release 직후 carry 가정 재검증 = 가치 있는 sanity check** 입증.
- 향후 carry 명시 시 → "환경 가정" 컬럼 별도 + "다른 채널 가능성 검증 여부" 명시 의무.
