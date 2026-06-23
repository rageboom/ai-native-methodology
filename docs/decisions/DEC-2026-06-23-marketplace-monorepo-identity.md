# DEC-2026-06-23-marketplace-monorepo-identity

**레포 정체성 = `@mis-plugins/monorepo` 마켓플레이스 모노레포(N개 플러그인 호스팅)로 정식 명문화. context-ops = 그중 한 플러그인(flagship = AI-Native 개발 방법론).** / additive·non-gating / 구조·문서 결정.

**상태**: 채택·시행 (2026-06-23). 4원칙 §3 사용자 승인 후 일괄 시행 (plan `compressed-conjuring-patterson.md`).
**유형**: 운영/구조 결정(DEC). chain gate paradigm·context-ops 방법론 본문 무변(ADR 아님). 빌드/배포 인프라 무변(이미 일반화돼 있었음을 확인·명문화).
**plan SSOT**: `.claude/plans/compressed-conjuring-patterson.md`.

## 1. 문제 — 정체성 모순

레포의 **인프라**는 이미 다중 플러그인 마켓플레이스 모노레포다:

- 루트 `package.json` = `@mis-plugins/monorepo` ("plugins/* 각 플러그인 독립 semver + Nexus 배포 / 카탈로그 자동 생성 / scripts/ 공유").
- `scripts/_plugins.js`(`listPlugins`/`pluginDir`/`resolveTargets`/`REPO_ROOT`)를 모든 dev 스크립트가 공유 — `build-plugin.js --all` / `build-catalog.js`(plugins/* → `marketplace.json` 자동 생성 + `--check` drift gate) / `version-check.js --all` / `publish.js --all` / `release-check.js`(플러그인별 `scripts/release-readiness.js` 디스패처 + version-check 폴백).
- pnpm-workspace = `plugins/*` + `plugins/*/tools/*`. 카탈로그 `marketplace.json` 은 생성물(손편집 ❌).

그러나 **CLAUDE.md(= LLM 운영 컨텍스트 SSOT)는 "본 레포 = 사내 표준 AI-Native 개발 방법론 / 식별자 = context-ops"** 로 선언 — 즉 레포 = 단일 플러그인. 형제 플러그인을 추가하는 순간 이 선언이 거짓이 된다. "다른 플러그인 추가 + 동일 빌드/배포" 요청의 실제 본질은 빌드 작업이 아니라 **정체성 전환 결정**이었다(사용자가 "방법론적 문제"로 직접 지목).

## 2. 결정

1. **레포 정체성 = mis-plugins 마켓플레이스 모노레포** 로 정식 명문화. `plugins/*` = 독립 semver + Nexus 배포 플러그인의 집합. 빌드/배포/검증 = `scripts/` 공유 + 카탈로그(`marketplace.json`) 자동 생성.
2. **context-ops 의 위상 재정의** — 레포 = 방법론 자체가 아니라, context-ops 가 그 안의 **flagship 플러그인(= AI-Native 개발 방법론)**. 방법론 개념명·본문·chain harness 는 불변, 스코프 표기만 "한 플러그인의 컨텍스트"로 명확화.
3. **새 플러그인 규약 canonical** — `plugins/<name>/` 의 계약 파일(plugin.json / package.json `@mis-plugins/<name>` + publishConfig / marketplace-entry.json / CHANGELOG / README / 선택 release-readiness.js)을 `docs/add-a-plugin.md` 에 SSOT 로 고정. 재사용 스캐폴드(`templates/plugin-scaffold/`) + 생성기(`scripts/new-plugin.js` / `pnpm plugin:new`) 신설.
4. **거버넌스 위치 분리** — 마켓플레이스-레벨 결정/문서는 **레포 루트 `docs/`**(`docs/decisions/` = 본 INDEX, `docs/add-a-plugin.md`). 플러그인-국소 결정은 계속 `plugins/<name>/`(예: `plugins/context-ops/decisions/`). 레포 전체 결정을 한 플러그인 안에 묻지 않는다(정체성 모순 재발 방지).

## 3. 대안 / 기각

- **(A) 별도 마켓플레이스 레포로 분리** — 인프라가 이미 모노레포로 일반화돼 있고, 공유 툴링 복제(drift)를 새로 만드는 비용이 큼. 기각.
- **(B) CLAUDE.md 최소 포인터만** — 정체성 모순을 미봉. 사용자가 "정식 reframe" 선택. 기각.
- **(C) 마켓플레이스 DEC 를 `plugins/context-ops/decisions/` 에 둠** — "context-ops 는 한 플러그인일 뿐"이라는 결정 자체와 모순(레포 결정을 플러그인 안에 둠). 기각 → 루트 `docs/decisions/` 채택.

## 4. 시행

- 신규: `templates/plugin-scaffold/**`, `scripts/new-plugin.js`(+ 루트 `package.json` `plugin:new`), `docs/add-a-plugin.md`, `docs/decisions/{INDEX.md, 본 DEC}`.
- 수정: `CLAUDE.md` — §0 "레포 정체성(마켓플레이스 모노레포)" 신설 + "식별자 ≠ 개념명" 단락 갱신(마켓플레이스=mis-plugins / 네임스페이스=@mis-plugins/* / context-ops = 한 플러그인) + 기존 방법론 본문을 "context-ops 플러그인" 스코프로 래핑(내용 보존).
- 무변경(재사용 확인): `scripts/_plugins.js` / `build-catalog.js` / `build-plugin.js` / `publish.js` / `version-check.js` / `release-check.js` / pnpm-workspace.yaml.

## 5. 검증

임시 `demo-probe` 플러그인을 `pnpm plugin:new` 로 스캐폴드 → version-check 정합 / `catalog:build` 가 2 entries 자동 생성 / build-plugin `--check` / publish `--dry-run` 통과 → 제거 후 카탈로그 1 entry 원복 + `build:diff-check` green(context-ops 무영향) 확인. (예시 플러그인은 커밋하지 않음 — 스캐폴드+가이드 자산만 출하.)

## 6. §8.1 면제

순수 additive — chain gate matrix / release-readiness criteria / 스키마 / context-ops 방법론 본문 무변. 빌드/배포 스크립트 로직 무변(새 스크립트 1개만 추가). 본 결정은 단일 PoC 과적합과 무관(문서·정체성·반복 가능 스캐폴드).

Relates: 루트 `package.json`(@mis-plugins/monorepo 선언) · `scripts/_plugins.js`(멀티 플러그인 helper) · `docs/add-a-plugin.md`(규약 SSOT) · memory `project_branch_per_task_git_hygiene` · `policy_ssot_consolidation`(복제 ❌ / 공통은 canonical 추출) · `feedback_diagnose_before_design_check_existing`(인프라 이미 일반화됨을 실측 후 진단).
