# 현재 상태 (Live Snapshot)

> 휘발성 진행 상태. 영속 컨텍스트는 [`/CLAUDE.md`](../../CLAUDE.md), 결정 이력은 [INDEX.md](INDEX.md).
> 본 파일은 phase / sprint 종결 시 갱신.

**기준일**: 2026-05-05 (★ ★ ★ ★ ★ **v1.5.0 MINOR release** / ★ ★ ★ ADR-BE-001 negative-space corroboration 정식화 = ★ §8.1 strict 정합 검증대 ★ 두 번째 통과 (★ ADR-FE-007 positive-space 와 대칭) / git tag v1.5.0 / ★ 2026-05-03 같은 날 b87cec5 (옵션 2′ no release) + v1.4.5 PATCH (옵션 2 / NestJS sub-rule + AP-API-001 cross-PoC base 정합) + v1.5.0 MINOR (★ 옵션 3 / ADR-BE-001 + schemas/error-mapping-spec + skills/phase-5-error-mapping) = ★ 3 commit cadence / ★ ★ 직전 release line v1.4.x 5건 모두 보존)

---

## 방법론 본체 버전

- **★ ★ ★ ★ ★ v1.5.0 MINOR release (2026-05-03) ✅ 현재** — ★ ★ ★ ★ ADR-BE-001 (★ negative-space corroboration 정식화) 신설 + schemas/error-mapping-spec.schema.json (deliverable 16) 신설 + skills/analysis/phase-5-error-mapping/SKILL.md 신설. ★ ★ ★ §8.1 strict 정합 검증대 ★ 두 번째 통과 (★ ADR-FE-007 positive-space 와 ★ 대칭 — ★ 4 PoC 모두 anti-pattern 보유 ↔ ★ 3 BE PoC 모두 contract 부재). ★ AP-API-001 본체 antipattern 카탈로그 negative-space 첫 등재 (3 BE PoC isomorphic / Spring 2.5 + Spring 3 + NestJS framework 무관). ★ flows/analysis.phase-flow.json v1.4.4 → v1.5.0 (phase 5-1 outputs + error-mapping-spec.json / skills 3 → 4). ★ methodology-spec/skills-axis.md §5 매핑 표 갱신. ★ 검증: drift-validator --check-layout 9 phases / **19 skills** (★ 18 → 19) / 0 orphans / 0 missing / 4 tool 회귀 66/66 pass / version-check 3-source sync at v1.5.0 / build 224 files dist/internal-v1.5.0/ + CHECKSUMS. ★ ★ b87cec5 + v1.4.5 흡수. ★ retract risk 명시 (negative-space 정의 v1.6+ 외부 사용 시 재검토 / mapping_mechanism enum framework 추가 시 확장). ★ Cooling-off ❌ (★ ADR + schema 신설 = 적용 대상이나 ★ 사용자 명시 결단 "나머지 진행" → memory edge case 정합). ★ carry → v1.5.1+ PATCH (ts-morph decorator semantic / AP-API-001 PoC #01 evidence 보강 / antipatterns.schema 본체 카탈로그 / drift-validator BE corpus / extractor agent / deliverable 16 full spec / migration-cautions BE). git tag `v1.5.0`. commit `98998d5`.
- **★ ★ ★ v1.4.5 PATCH release (2026-05-03) ✅ 보존** — ★ ★ ★ AP-API-001 자동 회귀 도구 BE 트랙 첫 진입. NestJS sub-rule (`internal.be.api.error-mapping-nestjs-delete-201-decorator-drift`) 신규 — `@Delete + @ApiResponse({status: 201, ...})` decorator drift detect (4 분기 / 순서 양방향 + async 변형) / PoC #03 article.controller.ts:65,68 + 81,85 + 97,99 ★ 4 op 정확 매칭. ★ AP-API-001 cross-PoC base 정합 — PoC #03 ap.json 에 static_rule_link 추가 (★ PoC #02 mirror + ts-morph carry 명시). ★ 직전 b87cec5 (옵션 2′ / no release / Spring rule + AP-API-001 PoC #02 cross-link / drift-check.yml body scan 통합) ★ 정식 release 통합. ★ ★ §8.1 strict 평가 — patterns ≥ 2 PoC isomorphic + 2 framework (Spring + NestJS) 자연 충족 → static-runner quality 격상 자격. release note = CHANGELOG entry. git tag `v1.4.5`. commit `4dcace9`.
- **★ ★ ★ v1.4.4 PATCH release (2026-05-02) ✅ 보존** — ★ ★ ★ manifest SSOT 정식 승격 (`flows/analysis.phase-flow.json` v1.2.2 → v1.4.4 / 9 phase + skills 매핑 + cross_cutting.aspects). `methodology-spec/skills-axis.md` 신설 (★ phase ID + skills 디렉토리 axis 분리 정책). drift-validator 0.2.0 → 0.3.0 (★ check-phase-skills.js + cli `--check-layout` flag + test 3건 / 36 pass). `.github/workflows/drift-check.yml` 신설 (★ CHANGELOG v1.2.1 entry 의 plan 정의만 → 실 구현 흡수). ★ ★ ★ b (rename) carry → v2.0 (★ §8.1 corroboration 0 = 본 plugin 의 정책이 본 plugin 자신의 변경 차단 메타 정합 첫 입증). git tag `v1.4.4`. commit `bac7c5d`.
- **★ ★ ★ ★ v1.4.3 PATCH release (2026-05-02) ✅ 보존** — ★ ★ ★ 14차 결단 (DEC-2026-05-02-plugin-first) 1일 retract / adoption 분리 워크스페이스 폐기 / workspace 단일 통합 + build script 1차 도입 (★ Phase A). ★ 신규 자산: `package.json` (workspace root / private:true / type:module / devDeps only) + `scripts/build-plugin.js` (Official + Industry + Senior 보강 7건 — explicit allow-list / Windows long-path 검증 / SHA256 CHECKSUMS / Agent 4 발견 templates/adoption/ → dist root 동시 복사) + `scripts/version-check.js` (3 source 정합 / source-of-truth = plugin.json) + `.gitignore`. ★ 흡수 자산: `templates/adoption/CLAUDE.md` (★ ★ ★ 사용자 직접 편집 / 정책 23 inline / NestJS 4 + Spring 5 PoC #02 추출) + `templates/adoption/README.md` + `archive/methodology-v1.1/` + `docs/adoption/{v1.3-plan,v1.3-status,v1.3-decisions-index,lessons-learned-2026-05-02,README}.md`. ★ 검증: version-check ✅ / build:check 211 files ✅ / build 214 files + CHECKSUMS ✅ / build:diff-check (Senior gate) source mutation 0 ✅ / sha256sum -c 213/213 OK ✅ / `claude plugin install` Version 1.4.3 / Scope user / Status enabled ✅. ★ Phase A 운영: marketplace.json `"source": "./"` 그대로 / dist 부가 출력. ★ Phase B carry: `"source"` → `"./dist/internal-v1.4.3/"` 전환 / release.yml CI / 사내 ADR 1호. ★ Lessons: cadence ≥ 24h cooling-off (Senior / memory 자산화 carry) + 별도 dist sync 함정 (Babel/Yarn/Sentry) + 사용자 직접 편집 silent loss risk (★ Agent 4) + §8.1 일반화 ❌ (본 retract specific). carry 5 → 7 → ★ ★ **5** (★ DEC-2026-05-02-adoption-carry-OFF 후속 결단 / F4+F5+rename = ★ 본 프로젝트 backlog 제거 / 외부 워크스페이스 = 사용자 자체 영역 / ★ workspace 본체 단일 focus). release note = `decisions/DEC-2026-05-02-adoption-폐기-build-step-신설.md` + `docs/adoption/lessons-learned-2026-05-02.md`. git tag `v1.4.3`. DEC-2026-05-02-adoption-폐기-build-step-신설 + ★ ★ DEC-2026-05-02-adoption-carry-OFF (★ no release / no tag / 본체 commit 만).
- **★ ★ ★ v1.4.2 PATCH release (2026-05-02) ✅ 보존** — ★ ★ ★ ★ AP-FE-SECURITY-001 (FE applies_to "localStorage 저장") ★ 진짜 도구 직접 confirm 도달 (★ implicit 목표 종결). ★ ★ ★ custom Semgrep rule 첫 실현 (`tools/static-runner/rules/jwt-localstorage.yml` / fully qualified slug `internal.fe.security.jwt-localstorage` / 4 분기 pattern / metavariable-regex / Sprint 4 README "별도" carry 의 1년 long-tail 종결). ★ ★ static-runner 0.1.1 → 0.1.2 (★ `--extra-rules` 옵션 신규 / multi-config / Semgrep `--config` 멀티 정합) / unit test 9 → 11. ★ ★ drift-check.yml CI ratchet 통합 (★ PoC #04 full FE 트랙 신규 step + `--baseline --ratchet` + custom rule 적용 / ADR-010 §2.3 첫 운영 입증 / ratchet dry trial: novel 1 → blocked → exit 1). ★ Official research Q4 carry 해소 (★ `--rewrite-rule-ids` default ON 실측). ★ ★ 같은 날 v1.4.0 + v1.4.1 + v1.4.2 = 3 release 빠른 carry resolve cadence 입증. release note = `docs/v1.4.2-release-note.md`. git tag `v1.4.2`. carry 5 → 5 (★ 보존 3 + 신규 2: severity 변환 검토 + RSA/JWT 길이 custom rule). DEC-2026-05-02-v1.4.2-carry-2-3-종결.
- **★ ★ v1.4.1 PATCH release (2026-05-02) ✅ 보존** — ★ release 같은 날 carry 1 즉시 종결. ★ Semgrep 1.161.0 진짜 실행 (★ pip 채널 / Python 3.14 공식 지원 / Docker 가정 깨짐) → ★ 진짜 도구 6 → **7종** + ★ -5%p 패널티 제거 + ★ baseline 첫 작성 (0 findings) + ★ ratchet dry trial pass + ★ ADR-010 외부 적용 첫 입증 (PoC #04 full). ★ ★ ★ 본체 도구 격상 1건 부수 산출 — static-runner 0.1.0 → 0.1.1 (`result_hash: null` + `source_commit_sha: unknown` bug 2건 fix / ★ ★ ★ no-simulation 정책 핵심 필드 위조 차단 효과 복구). release note = `docs/v1.4.1-release-note.md`. git tag `v1.4.1`. ★ ★ implicit 목표 (JWT XSS 4 PoC isomorphic 직접 confirm) = 미달 → carry 2 신규 분리 (custom Semgrep rule 작성 / v1.4.2 또는 v1.5). DEC-2026-05-02-v1.4.1-Semgrep-carry-종결.
- **★★★★★★★ v1.4.0 MINOR release (2026-05-02) ✅ 보존** — ★ ★ ★ 사내 표준 v1.3.1 → v1.4.0 격상. ★ FE 트랙 정식 진입 + §8.1 strict 검증대 첫 통과. release 자격 7/7 충족 + 4 carry 명시 (Semgrep / F-FE-006 / i18n / v1.5). release note = `docs/v1.4-release-note.md`. git tag `v1.4.0`. ADR-FE 7건 + schemas 13종 + tools 6종 (★ schema-validator 신설) + 4 PoC. DEC-2026-05-02-v1.4.0-release.
- **★★★★★ v1.4.0-dev 라인 (2026-05-02) — Stage 5 본격 PoC #04 종결 ✅** — ★ ★ ★ §8.1 strict 정합 검증대 ★ 첫 통과. yurisldk/realworld-react-fsd 4 Sprint × 4 sprint 게이트 + Stage 5 종결. ★ ★ ★ ★ 본체 격상 3건: drift-validator FE 모드 신설 + schema-validator (Ajv 8) 신설 + ★ ADR-FE-007 신설 (★ 본체 antipattern 카탈로그 첫 등재 / AP-FE-SECURITY-001 4 PoC isomorphic + AP-FE-OPTIMISTIC-DRY 3 컴포넌트). ★ 진짜 도구 6종 (ts-morph + Playwright + axe + drift-FE + schema-validator + formal-spec-link FE) + Semgrep carry. ★ Phase 5-2-c 32 snapshot + 16 a11y scan (★ 8 page × 4 viewport). ★ form-validation 90/77 BR + URL params validation 2 page isomorphic 정식화. ★ rules.json 80 BR. ★ IR 4계층 정합도 0.99 ratchet 단조 비감소. ★ 신뢰도 0.92 (ADR-009 단계 5). 6 finding (F-FE-001~006). ★ Stage 7 v1.4.0 MINOR release 진입 자격 7/7 충족 + 4 carry 명시 (Semgrep / F-FE-006 / i18n / v1.5). DEC-2026-05-02-v1.4-Stage-5-종결.
- **★★★ v1.4.0-dev 라인 (2026-05-02) — Stage 4 mini-PoC 종결 ✅** — RealWorld React fork (yurisldk/realworld-react-fsd / 527 stars / FSD 약식 / Zod / TanStack Query / react-router v7 / orval+OpenAPI) 1주 fail-fast 검증. ★ 진짜 도구 3종 실행 (ts-morph 24 + Playwright Chromium + axe-core 4.10) → ★ no-simulation 정책 단계 4 도달. ★ form-validation-spec.json 85 validation / ★ 72 BR 자동 등록 (★ Stage 7-pre 신설 deliverable 14 핵심 입증 / OpenAPI 67 + Zod-mini URL 5 + HTML5 13). ★ type-spec.json 46 type / framework_neutrality_score 1.0. ★ visual-manifest.json 2 viewport binary 진실. ★ a11y-spec.json WCAG 2.2 AA / 1 unique violation (html-has-lang). ★ IR 4계층 정합도 overall_framework_neutrality_score = ★ 0.99 (target 0.90 / 9%p 초과 / react_idiom_count_in_IR = 0). ★ 4 finding (F-FE-001~004 / 모두 candidate / mini scope 정합). 사상 위반 0. ★ Stage 5 진입 자격 5/5 충족 (사상 + IR + 도구 + finding + 신뢰도) + carry 2건 (Semgrep 환경 + drift-validator FE / Senior 재분류 i18n = 적용 대상 부재 ≠ carry). ★ §8.1 정합 strict — 본체 격상 0건. DEC-2026-05-02-v1.4-Stage-4-mini-PoC-종결.
- **★ v1.4.0-dev 라인 (2026-05-01) — BE Sprint 5+ carry-over (환경 무관 부분) 종결 ✅** — drift-validator v0.1.0 → ★ **v0.2.0** 격상 (corpus 14쌍 → ★ 19쌍 / self-test 15 → ★ 25 test) + ★ phase-flow 비교기 신설 (★★★ 본체 phase-flow drift 0 자가 입증) + ★ tools/_shared/baseline.js 공용 이동 + DTV/static-runner --baseline/--ratchet 통합 + static-runner SARIF→finding 어댑터. 3 도구 unit test 합계 ★ **53/53 pass** ✅. ADR-010 §2.5 정합 도달. 환경 의존 (Semgrep/PMD 진짜 실행) 만 carry. DEC-2026-05-01-Sprint-5-carryover-종결.
- **v1.4.0-dev Stage 7-pre (2026-05-01) ✅** — 본체 격상 8 항목 (ADR-FE-005 보강 [매개체 12 → ★ 13 / Zod 추가] + ADR-FE-006 갱신 [§5.2 carry → ★ resolved] + schema 2 신설 [form-validation-spec / type-spec] + schema 1 확장 [rules source_format/auto_extracted] + deliverable 2 신설 [14 form-validation-spec / 15 type-spec] + workflow 보강 1 [phase-5-2-b §3.1 form_state cross-link]). ★★★ 외부 LLM 검증 빈틈 5/5 = 100% 해소. DEC-2026-05-01-v1.4-Stage-7-pre-종결.
- **v1.4.0-dev Stage 6 (2026-05-01) ✅** — 본체 격상 8 항목 (ADR-FE-004 + ★ ADR-FE-006 신설 + be-fe-separation.md + ADR-FE-001/003 carry → resolved + deliverable 7 §6.5 + phase-0 §3.4 + legacy-spectrum.schema). ★★★ 사용자 7 요구사항 7/7 = 100% 도달. 외부 LLM 검증 빈틈 #3/#4/#5 해소. DEC-2026-05-01-v1.4-Stage-6-종결.
- **v1.4.0-dev Stage 3-2 (2026-05-01) ✅** — 본체 격상 2차 12+ 항목 (ADR 2 + schema 5 + deliverable 4 + migration-cautions-fe + phase-6 보강 + 도구 확장 1). ★ G2-1+G2-2+G2-4 정식 반영. Strangler Pattern 채택. schema if/then 강제 4 영역. formal-spec-link-validator FE 4→8 pass. DEC-2026-05-01-v1.4-Stage-3-2-종결.
- **v1.4.0-dev Stage 3-1 (2026-05-01) ✅** — 본체 격상 16+ 항목 (ADR 4 + schema 3 + deliverable 3 + workflow 4 + 도구 시범 1). ★ 사상 기둥 3 (ADR-FE-001/002/005) + ★ 정량 모델 격상 (ADR-009 §2.4) + ★ no-simulation 정책 강화 (visual schema 강제). cross-check 권고 3건 반영 (DTCG / WCAG 2.2 / ICU MF2). drift-validator FE corpus 14→15 pass. DEC-2026-05-01-v1.4-Stage-3-1-종결.
- **v1.4.0-dev Stage 2 (2026-05-01) ✅** — Gate 1/2/3 × 4 = **12 결정 모두 Senior 권고 채택**. spectrum (Modern+jQuery+JSP 예외) / 시나리오 B-Lite / schema 분리 / 매개체 12 / 비기능 a11y+i18n+정적보안 v1.4 / legacy Tier 1~4 / BE/FE 분리 + ADR-FE-004 / ADR-001 갱신 / mini-PoC Stage 3-1 후 / PoC RealWorld only / 신뢰도 0.80 / Sprint mini 1주 + 본격 4-6. DEC-2026-05-01-v1.4-Stage-2-Gate-결단.
- **v1.4.0-dev Stage 1 (2026-05-01) ✅** — research × 3 (공식문서 / 산업 / Senior) 완료. 3 에이전트 합의: Scenario B-Lite / 권위 매개체 12 채택 / 빈틈 Top 5. DEC-2026-05-01-v1.4-Stage-1-research-종결.
- **v1.4.0-dev Stage 0 (2026-05-01) ✅** — FE 트랙 정식 시작. 사용자 진단 "FE 분석 방법이 없잖아" → research-first. 8 Stage 분할. 외부 plan = `~/.claude/plans/be-foamy-jellyfish.md` (3 에이전트 점검 v2). DEC-2026-05-01-v1.4-FE-트랙-진입.
- **★★★ v1.3.0 MINOR release (2026-05-01) ✅ 보존** — 사내 표준 채택 가능 시점 도달. **11 묶음 통합** (C+I+H+K + R+D+§8.1 + L+M+N+O) + Sprint 5 Node 도구 부분 종결 (spectral). ★★★ no-simulation 정책 첫 실현. 신뢰도 85-92% (★ ADR-009 단계 4 — 진짜 도구 1회 실행).
- v1.2.3 PATCH (★ v1.3.0 에 흡수) — 본체 격상 7 묶음 (C+I+H+K + R+D+§8.1).
  - C: Phase 4.5 cross-link 의무화 schema
  - I: AP-PERFORMANCE 3 PoC 권위 격상
  - H: Positive finding 패턴 schema (severity:positive + learning_effect_type 4종 + status:logged)
  - K: Lifecycle BR 패턴 (decision_tables required 분리 + br_type enum + current_state_note)
  - **R: NestJS 4 ADR 신설** (Auth-scope / Validation / HttpCode / TypeORM-Integrity)
  - **D: ADR-006 final 격상 + ADR-010 (Baseline + Ratchet) 신규**
  - **§8.1 cross-platform 입증 정식 등재** (README "Platform-Agnostic 입증" 섹션)
  - 본체 갭 closure 7 → 11. ADR 9 → 13개 (★ ADR-NEST 4 + ADR-010 1). v1.3.0 release 진입 직전.
- v1.2.2 PATCH — 묶음 M-P2-3 5건 (본체 갭 7건 모두 closed).
- **v1.2.1 PATCH** — drift-validator + decision-table-validator + static-runner + drift-check.yml + Phase 4.5 schema 5종 물증 강제.
- **v1.2.0 MINOR** — 14 묶음 (A~M+P) 통합. ADR-008 + Phase 4.5 정식 + finding-system schema + migration-cautions 의무.
- v1.1.2 PATCH (high 4건 closed) → v1.2.0 흡수

## 시퀀스 진행률

| 시점 | 작업 | 상태 |
|---|---|---|
| PoC #01 Phase 0~6 | RealWorld Spring Boot 2.5 | ✅ 종결 (2026-04-29) |
| PoC #02 Phase 1~6 | 1chz/realworld-java21-springboot3 | ✅ 종결 (2026-04-29) |
| C-Sprint 1 | F-074 단방향 round-trip + BR 1건 형식화 시범 | ✅ |
| C-Sprint 1.5 | 다이어그램 신뢰도 강화 + cross-validation | ✅ |
| C-Sprint 2 | BR 5건 형식화 + cross-validation 의무 + F-074 우선 | ✅ |
| C-Sprint 3 | Phase 4.5 정식 명세화 + JSON 짝 + α+β + M-P1 병행 | ✅ |
| C-Sprint 4 | drift-validator + decision-table-validator + static-runner + drift-check.yml + Phase 4.5 schema 5종 물증 + PoC #02 자가 검증 (★ 7+3 finding 자동 검출) | ✅ |
| **묶음 M-P2-3** | 본체 갭 5건 — api.template.md / phase-flow / ADR-009 / db-schema.template.md / meta-confidence.template.yaml | ✅ **본 세션** |
| **C-Sprint 5** | (carry-over) (1) drift-validator transitionFuzzyMatch 보완 ✅ DEC-A (2026-04-30) / (2) corpus 4쌍→★ 19쌍 ✅ Sprint 5+ Phase A / (3) ★ phase-flow 비교기 ✅ Sprint 5+ Phase B / (4) ADR-010 baseline 3 도구 통합 ✅ Sprint 5+ Phase C+D / (5) static tool 실 실행 1회 ⏳ 환경 의존 carry | ★ 환경 무관 부분 종결 / 환경 의존 1 항목만 carry |
| **시퀀스 B — PoC #03 NestJS** | Phase 0~4 종결 (Phase 4.5+ carry) | 🔄 **진행 중** |
| 시퀀스 B Phase 4.5 산출 | 5 산출물 37 파일 (state-machine 6 + sequence 12 + decision-table 12 + invariants 3 + property 3 + manifest 1) + PROGRESS — D1~D6 권고 안 채택 (BR 6 / AR 3 / UC 6 / Sairyss antipattern 권고 / 신뢰도 70-77% / false negative 우선) | ✅ (2026-04-30 직전 세션) |
| 시퀀스 B Phase 4.5 검증 | drift-validator (9 짝 / 20 breaking → 진짜 8 + 도구 한계 12) + decision-table-validator (6 → 0 enum fix) + DEC 종결 + finding F-145~**F-156** 통합 (★ F-154 transitionFuzzyMatch 60% false positive — F-117 재발 입증) + 신뢰도 0.70 → 0.77 (단계 2 → 2.5) | ✅ (2026-04-30 본 세션) |
| **시퀀스 B Phase 4.5+1** | **다이어그램 mermaid 보강 (진짜 drift 8 → 0 ✅) — Article persistingArticle compound + User validatingLogin compound + Article 3 self-loop + Follows self-loop + sequence 2 message** + drift 재실행 (breaking 20 → 8 / 진짜 drift 0 / 도구 한계 100%) + 신뢰도 0.77 → **0.80** (★ 단계 3 자동 검증 통과 도달 ✅) | ✅ **본 세션 (2026-04-30)** |
| **시퀀스 B Phase 5-1** | **api 산출 4종 — openapi.yaml (21 endpoint / 14 schemas / Bearer JWT) + api-extension.json (★ Phase 4.5 cross-link 9/21) + api.md (12 REC-API-*) + _manifest. ★★★ F-164 critical 신규 (Article 4 endpoint Auth 부재) + F-161 positive (Bearer 표준 ✅ = PoC #02 F-084 학습 효과) + F-157~F-166 10건. 신뢰도 0.90 / 7대 산출물 5/7** | ✅ **본 세션 (2026-04-30)** |
| **시퀀스 B Phase 6** | **antipatterns final 4종 — antipatterns.json (11 AP / critical 2 + high 3 + medium 4 + low 2) + avoid-list.md + ★ migration-cautions.md (NestJS 특이 8 함정 + 학습 효과 3건) + _manifest. 4 composite view + Phase 4.5 cross-link 4/11 AP + ★★ F-161 positive (Bearer 학습 효과) + AP-PERFORMANCE-001 medium → high 격상 (3 PoC 재현). 신뢰도 0.94 / 7대 산출물 6/7** | ✅ **본 세션 (2026-04-30)** |
| **★★★ PoC #03 종결** | **★★ 전체 7대 산출물 6/7 도달** (UI/UX 만 N/A) — 사내 표준 v1.3 격상 데이터 완비 | ✅ (2026-04-30) |
| v1.3.0 MINOR + v1.3.1 PATCH release | 사내 표준 채택 가능 시점 도달 / D3.2 파일명 컨벤션 정리 (12 rename, c72d29c) | ✅ (2026-05-01 보존) |
| v1.4.0-dev Stage 0 | freeze 해제 + FE 트랙 진입 + 8 Stage 분할 합의 + plan/DEC/STATUS/INDEX/CHANGELOG/memory | ✅ (2026-05-01) |
| v1.4.0-dev Stage 1 | research × 3 (공식/산업/Senior) — 9Q × 27 답 + 진단 보고서 + Stage 2 Gate 입력 12 결정 | ✅ (2026-05-01) |
| **v1.4.0-dev Stage 2** | Gate 1/2/3 × 4 = 12 결정 모두 Senior 권고 채택 / Stage 3-1 진입 자료 확정 | ✅ (2026-05-01) |
| **v1.4.0-dev Stage 3-1** | 본체 격상 1차 — ADR-FE-001/002/005 신설 + ADR-009 §2.4 갱신 + state-map/visual-manifest schema 신설 + ui-spec.schema 확장 + deliverable 8/9 신설 + 7 보강 + phase-5-2 분할 (a/b/c) + ★ drift-validator FE corpus 14→15 pass + ★ formal-spec-link-validator FE 진단 (Stage 3-2 carry). cross-check 1차 사료 권고 3건 반영 (DTCG 정확한 인용 / WCAG 2.2 ratchet / ICU MF2 단계). | ✅ (2026-05-01) |
| **v1.4.0-dev Stage 3-2** | 본체 격상 2차 — ADR-FE-003 신설 + ADR-001 §명시적 제외 갱신 + a11y-spec/i18n-spec/static-security-spec/legacy-spectrum schema 신설 + rules.schema 확장 + deliverable 10/11/12/13 신설 + migration-cautions-fe 신설 + phase-6 보강 + ★ formal-spec-link-validator FE 모드 확장 (4→8 pass). G2-1+G2-2+G2-4 정식 반영. Strangler Pattern 채택. schema if/then 강제 4 영역 (a11y/i18n/security/legacy). | ✅ (2026-05-01) |
| **v1.4.0-dev Stage 6** | 횡단 정책 — ADR-FE-004 (BE/FE 분리 3 Scenario) + ★ ADR-FE-006 (framework-neutral IR / IR 4계층) 신설 + be-fe-separation.md 신설 + Tier 4 carry 종결 + deliverable 7 §6.5 Screen+Journey 우선. 사용자 요구 7/7 = 100% 도달. 외부 LLM 검증 빈틈 #3/#4/#5 해소. | ✅ (2026-05-01) |
| **v1.4.0-dev Stage 7-pre** | release 전 마지막 quality 격상 — ★ ADR-FE-005 매개체 12 → 13 (Zod 추가) + form-validation-spec / type-spec schema 신설 + rules.schema source_format/auto_extracted 확장 + deliverable 14/15 신설 + ADR-FE-006 §5.2 carry → resolved + phase-5-2-b §3.1 form_state cross-link. ★★★ 외부 LLM 검증 빈틈 5/5 = 100% 해소. | ✅ (2026-05-01) |
| **★★★ BE Sprint 5+ carry-over (환경 무관)** | drift-validator v0.1.0 → ★ v0.2.0 / corpus 14 → 19쌍 / self-test 15 → 25 test (Phase A) + ★ phase-flow 비교기 신설 + ★★★ 본체 phase-flow drift 0 자가 입증 (Phase B) + tools/_shared/baseline.js 공용 이동 + DTV --baseline/--ratchet 통합 (Phase C) + static-runner SARIF→finding 어댑터 + baseline-mode (Phase D) + DEC + STATUS + INDEX + CHANGELOG + memory (Phase F). 3 도구 합계 53/53 test pass (drift 33 + DTV 11 + static-runner 9). ADR-010 §2.5 정합 도달. 환경 의존 (Semgrep/PMD 진짜 실행 + vacuum/openapi-changes) 만 carry. | ✅ **본 세션 (2026-05-01)** |
| **★ methodology-spec doc 압축 정비** | LLM hot path 정보 농도 격상 — deliverables 1~9 + 4-5 (`8cf8a4d` -533) + workflow phase-0~5-1 (`474d36c` -244) + phase-5-2-a/b (`412d117` -60) + phase-5-2-c/5-2-ui/6 (`9b1c45c` -114) + 잔여 4 파일 (`68ae3df` -18). 누적 5404 → 4422 line (-18% / -982 line). 검증: cross-reference 1건 + ADR 인용 4 파일 보강. ★ 압축 ROI 분류 — placeholder 견본 (templates) 원복 / 사람 hot path (ADR/decisions) 미진행 결정. | ✅ (2026-05-01) |
| **★★★ v1.4.0-dev Stage 4 mini-PoC** | RealWorld React fork (yurisldk) 1주 fail-fast / no-simulation 단계 4 / IR 0.99 / 신뢰도 0.85 / 4 finding / Stage 5 진입 자격 충족 / §8.1 — 본체 격상 0건 | ✅ (2026-05-02) |
| **★★★★★ v1.4.0-dev Stage 5 본격 PoC #04** | yurisldk/realworld-react-fsd 4 Sprint × 5 sprint 게이트. ★ ★ ★ §8.1 strict 정합 검증대 ★ 첫 통과. ★ ★ ★ ★ 본체 격상 3건 (drift-validator FE 모드 + schema-validator Ajv 8 + ★ ★ ADR-FE-007 신설 / 본체 antipattern 카탈로그 첫 등재). ★ AP-FE-SECURITY-001 (★ ★ ★ ★ 4 PoC isomorphic / Java + Hexagonal + NestJS + React) + AP-FE-OPTIMISTIC-DRY (★ 3 컴포넌트). 진짜 도구 6종 + Semgrep carry. 32 snapshot + 16 a11y scan / form-validation 90/77 BR / rules.json 80 BR / 9 SM / 8 page / 19 op + 25 schemas / IR 0.99 단조 비감소 / 신뢰도 0.92 (ADR-009 단계 5) / 6 finding. ★ Stage 7 v1.4.0 MINOR release 진입 자격 7/7 충족 + 4 carry 명시. | ✅ (2026-05-02) |
| **★ ★ ★ v1.4.2 PATCH release** | ★ ★ AP-FE-SECURITY-001 진짜 도구 직접 confirm + custom Semgrep rule 첫 실현 + drift-check.yml CI ratchet. Custom rule (`jwt-localstorage.yml`) 4 분기 pattern (string vs identifier × bare vs window. prefix) / 545 rules loaded / 77 rules run / 66 files / 1 finding / `auth-storage.ts:20` 매칭. ★ ★ static-runner 0.1.1 → 0.1.2 (★ `--extra-rules` 옵션 신규) / unit test 9 → 11 pass. ratchet dry trial: novel 1 / blocked 1 / exit 1 ★ ADR-010 §2.3 CI fail trigger 첫 운영 입증. ★ Official research Q4 carry 해소 (★ `--rewrite-rule-ids` default ON 실측 — SARIF ruleId = `<cwd-relative-path>.<rule-id>`). DEC-2026-05-02-v1.4.2-carry-2-3-종결. | ✅ **본 세션 (2026-05-02)** |
| **★ ★ v1.4.1 PATCH release** | ★ release 같은 날 carry 1 즉시 종결. ★ Semgrep 1.161.0 ★ pip 채널 (Python 3.14 공식 / Docker 가정 깨짐) PoC #04 full INPUT/src/ 진짜 실행 (544 rules / 76 run / 66 files / 0 findings / 6293 ms / 5종 물증 7 필드 모두 정상). ★ ★ ★ 본체 도구 bug 2건 발견 + 즉시 fix (★ static-runner 0.1.0 → 0.1.1) — `result_hash: null` (★★★ no-simulation 핵심 필드 위배 / runner.js:71 `require('node:fs')` ESM throw → catch swallow) + `source_commit_sha: unknown` (cli.js writeBaseline 호출 시 sourceCommitSha 인자 누락) → readFileSync import 추가 + detectGitSha 함수 신설. 9/9 unit test pass. baseline 첫 작성 (0 findings) + ratchet dry trial pass (0/0/0/exit 0) — ★ ADR-010 외부 적용 첫 입증. ★ implicit 목표 (JWT XSS 4 PoC isomorphic 직접 confirm) = 미달 (Semgrep `react-jwt-in-localstorage` 룰 = jwt_decode 임포트 부재로 매칭 0건 / Senior research Q2 정확 입증) → carry 2 신규 분리 (custom Semgrep rule 작성). 진짜 도구 6 → **7종** / -5%p 패널티 제거 / 신뢰도 0.92 → 0.92~0.95 (단계 5 강화). DEC-2026-05-02-v1.4.1-Semgrep-carry-종결. | ✅ **본 세션 (2026-05-02)** |

---

## PoC #01 종결 (2026-04-29)

- Phase 0~6 완료 — 7대 산출물 6/7 (UI/UX 제외 100%)
- finding **33건** (closed 10 / promoted 10 / deferred 13)
- AP **15건** (critical 2 / high 2 / medium 7 / low 4)
- raw confidence: Phase 6 0.96
- 핵심 결함: AP-DOMAIN-001 (De Morgan critical) + AP-SECURITY-001 (JWT 21byte critical) + AP-DOMAIN-002 (email/username unique 3중 부재)

## PoC #02 종결 (2026-04-29)

분석 대상: `1chz/realworld-java21-springboot3` (HEAD `93e018e` / Spring Boot 3.3 + Java 21 + Multi-module Hexagonal)

### Phase 1~6 산출

| Phase | 산출 | raw conf | 핵심 |
|---|---|---|---|
| 1 (init) | inventory.json + stack-detection.md + tree.md + stats.json + _manifest.yml | 0.93 | Hexagonal Modular Monolith hybrid 0.65 cap |
| 2 (db) | schema.json + schema.sql + erd.mermaid + 정합성-검증-보고서.md + _manifest.yml | 0.85 | F-048 critical (TagJpaRepository 타입 오류 ★ Senior 발견) |
| 3 (arch) | architecture.json + architecture.md + architecture.mermaid + dependency-graph.mermaid + circular-dependencies.md + _manifest.yml | 0.92 | LV/CIRCULAR 0건 / F-068 critical (RSA git commit ★ Senior 발견) |
| 4 (domain+rules+AP partial) | domain/* + rules/* + antipatterns-partial/* | 0.83 | 4 Aggregate Root + 25 UC + 14 BR + 6 AP partial |
| 5-1 (api) | openapi.yaml + api-extension.json + api.md + _manifest.yml | 0.93 | 19 op / openapi.yaml ground truth 802 line 사용자 작성 |
| 6 (antipatterns final) | antipatterns.json (21 AP) + avoid-list.md + _manifest.yml | 0.96 | **3 critical: AP-API-001 / AP-DB-001 / AP-SECURITY-001** |

### PoC #02 핵심 결함 (사내 적용 시 즉시 수정 critical 3건)

- **AP-API-001 critical** — F-070+F-079+F-085 spec/runtime drift 묶음 (RFC 7231 §4.2.2 + RFC 9110 §15.3 이중 위반)
- **AP-DB-001 critical** — F-048 TagJpaRepository<Tag, Integer> 타입 오류 (1글자 fix: Integer → String)
- **AP-SECURITY-001 critical** — F-068 RSA private key (`server/api/src/main/resources/app.key`) git 직접 commit (PoC #01 isomorphic ★)

### PoC #02 finding 통계

- finding **43건** (F-042~F-087 / F-079 → F-070 merged)
- promoted 31 / candidate 8 / deferred 4 / closed 0
- F-070 high → critical 격상 (Phase 5-1)
- F-085 low → medium 격상 (Phase 5-1)
- F-081 medium → low 강등 (Phase 5-1)

### PoC #02 5 핵심 결정 (Phase 6 — 윤주스 일괄 승인)

- DEC-001 — AP-API-001 critical 단일 등록 (Phase 5-1 정합)
- DEC-002 ★ — Phase 1-3 누락 candidate 5건 등록 (F-048 / F-068 / F-051 / F-053 / F-069)
- DEC-003 — ID 정규화 6건 (multi-prefix → single)
- DEC-004 — composite view 4건 도입 (PoC #01 1건 → 4건 확장)
- DEC-005 — low candidate 3건 등록 (F-058 / F-076 / F-078)

### PoC #01 ↔ PoC #02 cross-validation (15 AP 외부 검증)

- **비재현 8건 (53%)** — Hexagonal 분리 + Spring Boot 3.x 효과 (학습 효과 입증)
- **재현 4건 (27%)** — v1.2.0 합산 격상 강한 권위 (AP-PERFORMANCE-001 medium → high 격상 / AP-API-001~002 + AP-DB-001 재현)
- **변형 재현 3건 (20%)** — AP-SECURITY-001 (JWT 21byte → RSA git commit isomorphic ★) + AP-DOMAIN-002 + AP-ARCH-002

---

## 누적 통계 (PoC #03 Phase 4.5 검증 종결 시점 / 2026-04-30)

```yaml
finding_total: 168         # 158 + Phase 5-1 신규 10 (F-157~F-166)
finding_closed: 10
finding_promoted: 41
finding_deferred: 18
finding_candidate: 60      # +41 (PoC #03 + Phase 4.5)
finding_merged: 1
finding_rejected: 0
finding_phase45_new: 53    # 41 (PoC #02 시퀀스 C) + 12 (PoC #03 Phase 4.5 형식화 9 + 검증 3)

ap_total: 36              # PoC #03 final (Phase 6) 후 +8~12 예상
ap_with_migration_advice: 21

formal_spec_artifacts: 69  # 29 (PoC #02 + sprint) + 40 (PoC #03 — 37 + .validation 3)
methodology_body_tools_added: 3  # drift-validator + decision-table-validator + static-runner

v120_bundles: 16           # A~P
v120_bundles_ready: 16     # ★ A~P 전체 — Sprint 4 N+O 인프라 산출 완료
이중_렌더링_정합_검증_도구: ✅   # drift-validator 자동화 / 본 세션 PoC #03 첫 외부 적용 ★
이중_렌더링_드리프트_자동검출: PoC #02 → state-machine 7 breaking / PoC #03 → state-machine 17 breaking + sequence 3 breaking
신뢰도_정직표기:
  poc03_phase45: 0.80     # ★ 단계 3 (자동 검증 통과 ✅ — drift 진짜 drift 0 + dmn 0)
  poc02_phase6: 0.96
  방법론_본체: 80-87%      # 시뮬 패널티 유지 (실 static tool Sprint 5 carry-over)
신뢰도_목표_after_sprint5: 90-95%  # 진짜 Semgrep/PMD 1회 실행 시

unit_tests_passing: 17/17  # drift-validator 6 + dmn-check 7 + static-runner 4
poc03_validation_first_external_application: ✅  # ★★ 본 세션 — drift 60% false positive (F-117 재발 = F-154) + dmn 5종 0 hit (BR 표 모두 통과)
poc03_phase_45_plus_1_diagram_fix: ✅  # ★★ 다이어그램 보강 8건 — 진짜 drift 0 도달 + 도구 한계 100% (Sprint 5 carry-over)
poc03_phase_5_1_api_complete: ✅       # ★★ 21 endpoint + Phase 4.5 cross-link 9/21 + F-164 critical (★★★ Article 4 endpoint Auth 부재 신규)
poc03_phase_6_antipatterns_complete: ✅  # ★★★ 11 AP + 4 composite view + Phase 4.5 cross-link 4/11 + F-161 positive
poc03_artifacts_progress: 6/7            # ★★ 7대 산출물 종결 — UI/UX 만 N/A / BE only

# ★★★ 3 PoC 통합 (사내 표준 v1.3 격상 데이터 완비)
all_3_pocs_complete: ✅
cumulative_ap_3_pocs: 47   # PoC #01 15 + PoC #02 21 + PoC #03 11
v13_promotion_data_status: "★★★ 완비 — 통합 보고서 docs/v1.3-promotion-report.md + DEC-v1.3-격상-데이터-완비"
v13_promotion_candidates_count: 6  # AP-PERFORMANCE / Positive finding / NestJS 4 ADR / Phase 4.5 cross-link / migration-cautions NestJS / §8.1 정식
saa_application_ready: ✅  # ★★ 사내 적용 시작 가능 시점 v1.2.2
v13_release_blocker: "Sprint 5 진입 의무 (★ 환경 의존)"
ci_workflow_files: 1       # .github/workflows/drift-check.yml (drift + static dual mode)
```

---

## Phase 4.5 형식화 시범 (시퀀스 C) 핵심 결과

| Sprint | 핵심 | 정량 |
|---|---|---|
| 1 | BR-EMAIL-UNIQUE 4 산출물 / self-reference 함정 자가 시인 | drift 4건 |
| 1.5 | Cross-validation + Static Analyzer **시뮬레이션** + Property test 명세 | drift +11건 / 신뢰도 60-70% → 80-87% |
| **2** | **★★★ F-074 단방향 round-trip 검증 — 자연어 빈약성 44% → 100%** | drift +19건 / **양쪽 발견 ★★ 2건 (F-097 high `@Transactional` 부재 / F-098 high Equality on transient)** |

→ **묶음 L (Phase 4.5 정식 도입) 데이터 100% 충분 ✅**.

## v1.2.0 격상 묶음 합산 데이터 (16 묶음 A~P)

| 묶음 | 영역 | 외부 검증 |
|---|---|---|
| A | cross-validation (F-015) | F-044 보강 ★ |
| B | 정정 트레이스 (F-022 + F-024) | PoC #01 단독 |
| C | severity 표준 (F-018) | PoC #01 단독 |
| D | schema 진화 (F-025) | multi-module + Hexagonal 모듈 분리 |
| E | quality-extraction | PoC #01 단독 |
| F | 신뢰도 공식 보강 | PoC #01 단독 |
| **G** | OpenAPI x-extension (ADR-007) | **PoC #02 외부 검증 ✅** |
| **H** | multi-module 환경 / **Auth/Crypto 검증** | **PoC #01+#02 isomorphic ★★★** (AP-SECURITY-001 양 PoC 재현) |
| I | finding-system 정식화 | PoC #02 메타 finding |
| **J** | Hexagonal port-adapter 가이드 | **PoC #02 단독 신규** (F-075) |
| **K** | multi-module Outside-in 모범 사례 | **PoC #02 신규** (F-064/F-065/F-066 positive findings) |
| **★ L** | **Phase 4.5 형식화 정식 도입 (ADR-008/009)** | **C-Sprint 1~3 누적 ✅ 100% — 정식 명세화 완료** |
| **M** | 방법론 본체 이중 렌더링 갭 해소 | **★ 갭 7건 모두 closed ✅** (P1 2건 Sprint 3 + P2-3 5건 v1.2.2) — api.template.md / phase-flow / ADR-009 / db-schema.template.md / meta-confidence.template.yaml |
| **N** | Drift 자동 검증 도구 (CI) | **Sprint 4 적용 ✅** (drift-validator + decision-table-validator + drift-check.yml + 17/17 test pass + PoC #02 자가 검증으로 7+3 finding 자동 검출) |
| **O** | 진짜 외부 도구 실행 의무화 (★★★) | **Sprint 4 인프라 적용 ✅** (static-runner Plugin host + Semgrep/PMD plugin + 5종 물증 schema enforcement + lint-no-simulation.sh). 실행은 Sprint 5 carry-over (Java/Semgrep/PMD 환경 부재) |
| **P** | 안티패턴 migration_advice + migration-cautions.md | **Sprint 3 적용 ✅** |
