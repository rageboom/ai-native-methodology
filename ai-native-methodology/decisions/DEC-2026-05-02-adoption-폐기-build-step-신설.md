# DEC-2026-05-02 — adoption 폐기 + workspace 단일 통합 + build script 1차 도입 (v1.4.3 PATCH)

- 일자: 2026-05-02
- 카테고리: methodology / release / 워크스페이스 구조 재편
- 결정자: 윤주스 (TF Lead) / Auto Mode 위임 + 3 전문가 토론 (Official Docs / Industry Case / Senior Engineer + adoption 코드 변경 탐색)
- 상태: 승인 ( v1.4.3 PATCH release / git tag v1.4.3 / plugin install 회귀 0 검증)
- 관련: DEC-2026-05-02-plugin-first ( 14차 결단 1일 retract) / 본 plan `~/.claude/plans/warm-brewing-moth.md` / DEC-2026-05-02-v1.4.2-carry-2-3-종결

---

## 1. 컨텍스트

### 1.1 14차 결단 retract 사유

"본체 = plugin source / adoption/dist = artifact" 분리 워크스페이스 발상 (DEC-2026-05-02-plugin-first / 14~15차 결단) → 1일 후 본 DEC 로 retract.

**사유**:

- adoption/dist artifact 발상 = 단일 source-of-truth 위배
- frontmatter provenance + build script 만으로 동등 효과 + sync 부담 ↓
- Babel/Yarn/Sentry 3 사례 동일 lesson — "별도 dist sync 비용 > 통합 비용"

### 1.2 사용자 의도 (2026-05-02)

> "결국 빌드 하면 workspace 에 실제 plugin에 포함될 코드들이 생성되는 구조다"
> "원본은 ai-native-methodology 로 하고 싶다"

→ adoption 분리 ❌ → workspace 단일 + build script 신설.

### 1.3 Agent 4 핵심 발견

`adoption/dist/internal-v1.3/CLAUDE.md` + `README.md` = 사용자 직접 편집 ( 정책 23 inline / NestJS 4 + Spring 5 PoC #02 추출 / 사내 진입점 READ FIRST). 단순 stale clone 가정 ❌ → **흡수 의무**.

---

## 2. 결정 (D1~D7 / 사용자 일괄 승인)

| #      | 결정                         | 채택 옵션                                                               | 근거                                               |
| ------ | ---------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| **D1** | adoption 폴더 처리           | **완전 폐기 + 자산 흡수**                                               | 4원칙 §4 / Babel/Yarn/Sentry lesson 일치           |
| **D2** | adoption 자산별 분류         | ( §3 표)                                                                | dist CLAUDE.md+README.md 흡수 필수 발견 ( Agent 4) |
| **D3** | Build step 신설              | **Phase A build script + Phase B `"source"` 전환 carry**                | 사용자 진술 정합 / Senior cadence 권고             |
| **D4** | Build script 위치            | **Node `scripts/build-plugin.js` + root `package.json` (devDeps only)** | tool ecosystem (Node) + Senior 보강                |
| **D5** | Version sync source-of-truth | **`.claude-plugin/plugin.json.version`** ( Anthropic 공식 권고 정합)    | "plugin.json value always wins silently"           |
| **D6** | Lessons Learned              | **14차 결단 1일 retract 사유 명시 + cadence ≥ 24h cooling-off carry**   | Senior 보강 / 4원칙 §4                             |
| **D7** | §8.1 일반화 분류             | **본 retract = 본 워크스페이스 specific / 본체 자산화 ❌**              | Senior 보강 / §8.1 strict 정합                     |

---

## 3. 자산 처리 결과

### 3.1 흡수 ( Agent 4 발견 우선)

| 자산 (adoption/)                           | workspace 이관 위치                              |
| ------------------------------------------ | ------------------------------------------------ |
| `dist/internal-v1.3/CLAUDE.md`             | `templates/adoption/CLAUDE.md` ( 정책 23 inline) |
| `dist/internal-v1.3/README.md`             | `templates/adoption/README.md` ( 사내 진입점)    |
| `methodology-v1.1/` (.claude/ 13 metadata) | `archive/methodology-v1.1/`                      |
| `work/plan.md` (340줄)                     | `docs/adoption/v1.3-plan.md`                     |
| `work/STATUS.md` (58줄)                    | `docs/adoption/v1.3-status.md`                   |
| `work/decisions/INDEX.md` (42줄)           | `docs/adoption/v1.3-decisions-index.md`          |

모든 흡수 파일 frontmatter provenance 추가 (source / original*path / absorbed_at / status / 사용자*직접\_편집).

### 3.2 폐기 (변경 0 또는 placeholder)

- `adoption/CLAUDE.md` ( stale)
- `adoption/ai-native-methodology/` v1.3.0 클론 ( workspace v1.4.3 superset / 변경 0)
- `adoption/dist/internal-v1.3/` 나머지 ( 41 파일 삭제 + 12 rename = build script exclude 정책 흡수)
- `adoption/work/research/` ( 빈 placeholder)
- `adoption/poc-fe-04-realworld-react/` ( 실 산출물 0 / workspace examples/poc-04-full-realworld-react/ 가 superset)
- `adoption/.git`, `.github`, `.claude`, `.gitignore`

### 3.3 Carry ( 사용자 결단 / lock 으로 자동 미실행)

- ⏳ `adoption/legacy-analyzer/` → `harness-engineering-study/` 외부 이관 ( 사용자 결단)
- ⏳ `ai-native-methodology-adoption/` → `.deprecated-2026-05-02/` rename ( 외부 프로세스 lock 으로 자동 실패 / 사용자 수동 처리)

---

## 4. Build step 1차 도입 (Phase A)

### 4.1 신규 자산

- `package.json` ( workspace root / private:true / type:module / devDeps only)
- `scripts/build-plugin.js` ( Official + Industry + Senior 보강 7건):
  - explicit allow-list ( VSCode `vsce` node_modules 사고 회피)
  - try/catch + Windows long-path (>260) 검증 ( Official `fs.cpSync` Stability "1 - Experimental")
  - `../` traversal 금지 / self-contained 보장
  - SHA256 manifest `CHECKSUMS.txt` ( Industry — Shopify CLI v3.50+)
  - templates/adoption/CLAUDE.md + README.md → dist root 동시 복사 ( Agent 4 발견)
  - dry-run mode (`--check`)
- `scripts/version-check.js` ( plugin.json + CHANGELOG + package.json 3 source 정합)
- `.gitignore` 신규 (`/dist/` `node_modules/` `package-lock.json` `tools/**/out/`)

### 4.2 Phase A 운영

- workspace `marketplace.json` `"source": "./"` 그대로 유지 ( v1.4.2 install 회귀 0)
- `dist/internal-v1.4.3/` = 부가 출력 ( install 메커니즘 영향 0)

### 4.3 Phase B carry ( 사내 marketplace push 직전)

- marketplace.json `"source"` `"./"` → `"./dist/internal-v1.4.3/"` 전환
- `.github/workflows/release.yml` CI build 자동화 + dist 커밋 강제 gate
- `${CLAUDE_PLUGIN_DATA}` tool node_modules survive update 패턴
- 사내 ADR 1호 신설 ( Anthropic 공식 build 정책 부재 → 사내 표준 정착)

---

## 5. 검증 결과

| 검증                            | 결과                                                       | 출처            |
| ------------------------------- | ---------------------------------------------------------- | --------------- |
| `version-check.js`              | ✅ all 3 sources in sync at v1.4.3                         | D5              |
| `build-plugin.js --check`       | ✅ would copy: 211 files                                   | Industry 보강 1 |
| `build-plugin.js` (실 build)    | ✅ copied 214 files + CHECKSUMS.txt                        | Plan            |
| build:diff-check ( Senior gate) | ✅ source tree 변화 0 ( build 재실행 후 git status 변화 0) | Senior 보강     |
| `sha256sum -c CHECKSUMS.txt`    | ✅ 213/213 OK                                              | Industry 보강 2 |
| `claude plugin install`         | ✅ Version: 1.4.3 / Scope: user / Status: ✔ enabled        | Plan            |

---

## 6. Lessons Learned ( Senior 보강 §4)

1. **결단 cadence ≥ 24h cooling-off** ( general / memory 자산화 후보 — `feedback_decision_cadence_24h_cooling_off`):
   - 14차 결단 → 본 plan retract = 1일 ( 너무 빠름)
   - plan.md 비용 > revert 비용 역전 risk

2. **별도 dist workspace 운영 sync 비용 함정** ( general):
   - Babel/Yarn/Sentry 3 사례 동일 lesson
   - sync 자동화가 100% 신뢰 가능할 때만 별도 dist 정당화

3. **사용자 직접 편집 silent loss risk** ( Agent 4 / general):
   - adoption 폐기 결단 시 dist 안 customization 식별 의무
   - 단순 stale clone 가정 ❌ → 명시적 diff 검증 + 흡수

4. **본 retract 자체 = 본 워크스페이스 specific** ( §8.1 일반화 ❌ / 본체 자산화 ❌):
   - §8.1 컴포넌트 ≥ 3 임계 미달
   - 단, build script 패턴 + frontmatter provenance + adoption 폐기 절차 = ✅ general

상세: `docs/adoption/lessons-learned-2026-05-02.md`

---

## 7. 관련 메모리 갱신

- `project_adoption_workspace.md` — adoption 폐기 + workspace 단일 정의 / 14차 결단 retract trace
- `feedback_methodology_body_priority.md` — build artifact = 4번째 영역 / dist 만 사내 배포 / source 만 본체 진화
- 신규 후보 `feedback_decision_cadence_24h_cooling_off.md` ( Senior 권고)

---

## 8. 종결 진술

> v1.4.3 PATCH = 14차 결단 1일 retract / adoption 분리 워크스페이스 폐기 / workspace 단일 통합 / build script 1차 도입.
> Phase A 운영 = workspace `"source": "./"` 그대로 / `dist/internal-v1.4.3/` 부가 출력 / install 회귀 0 입증.
> Phase B carry = 사내 marketplace push 직전 `"source"` 전환 + release.yml CI 자동화.
> Senior 권고 — 결단 cadence ≥ 24h cooling-off → memory 자산화 carry.

**End of DEC-2026-05-02-adoption-폐기-build-step-신설.**
