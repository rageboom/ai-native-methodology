# DEC-2026-05-17-base-prefix-documented-exception

- **상태**: 승인 (★ 사용자 "a 진행" 위임 / Senior GO 0.88 / F-015 = nominal not functional / additive·corrective / v8.2.1 PATCH)
- **일자**: 2026-05-17 (★ session 26차 후속 / v8.2.1 PATCH)
- **결정자**: 윤주스 (TF Lead) — "b 하고 a 진행해줘" (briefing drift 정리 후 §8-2 결단 위임)
- **관련**: ADR-PLUGIN-001 §7 patch v5 + §8 LL-plugin-03 / DEC-2026-05-17-plugin-authoring-docs-drift (직전 v8.2.0 / §8-2 trigger) / DEC-2026-05-17-plugin-authoring-spec (R18 origin / §8-2 신설) / ADR-010 (baseline+ratchet grandfather 원천) / ADR-009 (no-simulation / F-015)

---

## 컨텍스트

`plugin-authoring-spec.md` §8-2 backlog 2번 — `_base-*` skill ×5 + agent ×3 의 leading `_` = 공식 charset 밖 (S3/A1 ⚠️ low). v8.0.0 종결 후 잔여 유일 backlog. §8-2 후속 조건 = "차기 네트워크 재검증서 공식 charset 강제 여부 재평가 후 결단 (rename vs documented-exception)". **v8.2.0 (2026-05-17) F-015 ×5 재검 완료 = trigger 충족** → 결단 의무.

사용자 "b 하고 a 진행" — (b) briefing deck 버전 drift 정리 후 (a) 본 결단 위임. rename = command-surface = v9.0.0 MAJOR breaking → 보수적/non-breaking 인 documented-exception 이 위임 범위 내 안전 선택 (rename = breaking 이라 별도 명시 sign-off 영역 / 본 결단은 그 반대를 택함).

## 결정 — Option A documented-exception (rename ❌)

### §1. 근거 (실 F-015 + Senior critique 이중 corroboration / §8.1 정합)

- **실 F-015 (`_base-official-docs-checker` / 2026-05-17 독립 fetch)**:
  - 공식 skill `name` = "Lowercase letters, numbers, and hyphens only (max 64)" / agent `name` = "lowercase letters and hyphens" (★ "only" 부재·numbers 부재 = 더 약한 서술).
  - leading `_` = 양쪽 charset 밖. **그러나 violation 시 load reject/error/warn 거동 = 공식 docs 미문서화** + `_`-prefix hiding/exclusion/deprioritize 거동 = 미문서화 + plugin namespace `ai-native-methodology:_base-*` insulate.
  - 결론 = **nominal/cosmetic deviation (functional defect ❌)** — 395 test·plugin 로드·F-015 dispatch(`_base-official-docs-checker` 자신이 ×5 실행) 무결이 advisory-consistent 입증.
- **Senior critique = GO 0.88** — rename(Option B) 실 blast ~195 occ / 70 file (flows phase-flow.json·drift-validator src·release-readiness·schemas·briefing·immutable DEC/ADR 14 포함) = v8.0.0(19/13)의 ~10×, **0 functional gain**, LL-i-55/56 회귀 class. ADR-010 baseline+ratchet (ADR-PLUGIN-001 §2.4) 가 정확히 본 케이스 위해 설계 = grandfather + ratchet 신규 한정.

### §2. 시행 (additive·corrective / breaking 0)

- **§7 매트릭스** `_base-*` 행 ⚠️ → ✅ (documented-exception) + 결론 "§8 backlog 잔여 0".
- **§8-2 명세 신설** — 영구 grandfather = 정확 **8 frozen allowlist** (skill 5: log-finding·apply-template·build-traceability-matrix·apply-baseline-ratchet·invoke-go-stop-gate / agent 3: official-docs-checker·senior-engineer·industry-case-researcher) 명시.
- **★ Senior 필수 guardrail 1 — §9 skills digest 가 enforcement-strength encode** (charset 문자열뿐 아니라 "violation 시 거동 미문서화 = advisory-consistent / hard-enforce 전환 시 차기 F-015 CONTRADICTS tripwire"). digest 변경 → skills `digest_sha` 재산출 ea06dc97470e → b8b2376312b0 (★ v8.2.0 digest_sha 메커니즘이 자기 변경을 STALE 검출 = 자기 dogfood 입증).
- **★ Senior 필수 guardrail 2 — release-readiness check #12 no-loophole** — `skills/_base-*` + `agents/_base-*.md` == 정확 8 allowlist 결정적 assert. 9번째 `_base-` 자산 = fail (예외의 loophole 화 차단 / 신규 non-`_base` = S3/A1 ratchet 즉시 강제). check #12 내부 강화 (신 check id ❌ / 13 유지 / digest_sha-into-#12 선례 동형).
- **release-readiness.test.js** — `_base-` allowlist case 신설 (실 디스크 == enumerated 8) + readdirSync import.

### §3. 정직한 범위 + tier

- 잔여 risk = 미래 Claude Code 가 charset hard-enforce 시 8 동시 break (Senior 자기 반론 / conf 0.88 사유). mitigation = guardrail 1 tripwire (enforcement-strength digest → 차기 F-015 CONTRADICTS). closed 아닌 deferred-liability 정직 명시.
- tier = **PATCH (v8.2.1)** — 문서 종결 + 이미 참인 invariant 형식화 + check #12 내부 강화(신 check ❌ / digest_sha-into-#12 선례). consumer 영향 0 (repo 이미 8 정합 / `_base-`=internal). LL-i-56 semver inflation 회피 정합. Senior 도 guardrail 3 = "PATCH only".

---

## 회귀 검증

- release-readiness **13/13** — check #12 green(§6 4행 ≤60d + digest_sha 4행 일치 incl 재산출 skills b8b2 + `_base-` 8 allowlist 정합)
- release-readiness.test.js — digest_sha regression-guard + `_base-` allowlist case 신설 / 전 green
- skill-citation-validator 0 stale (dogfood) / version-check 3-way 8.2.1 / workspace test green
- drift-validator 3-way 불변 (skill/agent/flow 무편집 = methodology-spec+scripts+decisions+briefing 만)
- breaking 0 (rename ❌ / 8 자산 무변 / ADR-010 영구 grandfather / 신규 non-`_base` ratchet 유지)

---

## Lessons Learned

- **LL-plugin-03** — "공식 규칙 위반" ≠ "functional defect". F-015 가 charset 규칙은 verbatim 확인하되 **violation 시 enforcement 거동이 docs 에 미문서화** 임을 분리 입증 → nominal vs functional 구분이 rename(MAJOR)/accept(PATCH) 갈림. 방법론이 자기 규칙을 *문서화된·bounded·ratchet-보존* 예외로 면제 = credibility 손상 ❌ (오히려 baseline+ratchet paradigm 작동 시연 / silent drift 가 손상). 단 예외는 frozen allowlist + 결정적 no-loophole guard 동반 의무 (9번째 차단). deferred-liability(미래 hard-enforce) 는 enforcement-strength digest tripwire 로 §9 Layer i 가 포착하도록 encode = 사각 닫음 (v8.2.0 digest_sha 와 동일 사상). ★ digest 변경이 digest_sha STALE 를 즉시 검출 = v8.2.0 메커니즘 자기 dogfood (1 release 만에 실효 입증).
- **§8.1 정합** — 단일 출처 ❌. F-015(공식 1차 출처) + Senior critique(설계 압력) + ADR-010 선례 = ≥2 독립 corroboration. Senior 가 자기 추천의 최강 반론(미래 hard-enforce)을 명시 → guardrail 1 없으면 REVISE 조건부 = 과적합 회피.

---

## 출처

- 사용자 위임 ("b 하고 a 진행해줘" / 2026-05-17 / session 26차 후속)
- 실 F-015 — `_base-official-docs-checker` 독립 fetch (skills/sub-agents charset enforcement / `code.claude.com/docs/en/{skills,sub-agents,plugins-reference}` / 2026-05-17) — verdict: charset verbatim 확인 / enforcement 거동 미문서화 = nominal
- Senior critique — `_base-senior-engineer` GO 0.88 + 최강 반론(미래 hard-enforce) + 필수 guardrail 1·2
- 선례 — ADR-010 baseline+ratchet (grandfather + ratchet 신규 한정) / ADR-PLUGIN-001 §2.4·§7 patch v1(v8.0.0 rename 대비) / LL-i-55·56 (추정수정·semver inflation 회피)
