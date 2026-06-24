# DEC-2026-06-24-fe-workspace-monorepo-per-app-ai-context

**결정**: 멀티모듈 repo 배치 규칙(`lifecycle-contract.md` "멀티모듈 repo 배치 규칙")에 **JS/TS 워크스페이스(FE) 모노레포 sub-case**를 additive 보강. 기존 BE 프레이밍의 예외 판별축("독립 배포 + 독립 도메인 / 모듈마다 자기 DB / shared-core+entrypoints")은 FE 워크스페이스에 매핑 불가 → 빌드-아티팩트 기준 판별축("독립 빌드·배포 번들") 추가. 각 `apps/<app>` 가 자체 번들러 설정으로 별도 SPA 번들을 생성하면 **앱별 `apps/<app>/.ai-context/`**(co-located / repo 루트 단일 ❌). 공유 워크스페이스 lib(`apps/common`/`packages/*`)은 빌드타임 소스 의존성이라 레이아웃을 루트로 끌어내리지 않음. (v0.72.0 MINOR / additive·doc-clarification / 스키마·gate·release criteria 무변)

## 배경

사용자가 분석 산출물을 `ep-be-gea`(단일 백엔드 서비스)와 같은 gea 포맷으로 정렬하려다, 소비 repo `mis-fe-admin`의 루트 `.ai-context/`가 **두 앱이 뒤섞인 과도기 상태**임을 발견했다:

- `base/domains/BC-TLM-*`(21) = **apps/tlm**(실사용 분석)
- `base/domains/integration-authority` + `base/shared/*`(`apps/eam` 172 ref) + `base/code-graph.json` = **apps/eam**(종결된 FE dogfood cycle3~5 잔재)
- `tlm/shared/*`(`apps/tlm` 27 ref) = apps/tlm 의 진짜 shared (마이그레이션이 domains 만 옮기고 shared/runtime 미이전 → 절반 정리)

`mis-fe-admin` 은 pnpm 워크스페이스 모노레포이고 `apps/{119,common,eam,gea,hrm,observer,tlm}` 각각이 자체 `vite.config.ts`·`tsconfig.json`·`package.json` 을 가진 **독립 빌드·독립 배포 SPA**다.

**갭(diagnose-before-design / `feedback_diagnose_before_design_check_existing`)**: monorepo 규칙은 **이미 있었다**(`lifecycle-contract.md`). 그러나 판별축이 전적으로 BE 프레이밍 — 기본값 "repo 루트 단일", 예외 "독립 배포 + 독립 도메인(마이크로서비스 / 모듈마다 자기 DB)", 판별축 "모듈 = 배포축(shared-core + entrypoints) → 루트 / 도메인축(독립 서비스) → 모듈별". FE 워크스페이스(각 앱이 독립 번들·배포 SPA)는 이 축에 **legible 하지 않다**:
- "자기 DB" 기준 = FE 매핑 불가(FE 앱은 DB 없음).
- "멀티 entrypoint 가 한 core(`apps/common`) 공유 → repo 루트" 가 **false match** 유발 — `apps/common` 은 런타임 공유 코어가 아니라 **빌드타임 소스 라이브러리**(각 번들에 컴파일 인입)인데, 문구상 "한 core 공유"로 읽혀 잘못된 루트-단일 결론으로 유도.

결과 = FE 모노레포 사용자가 규칙을 적용해도 잘못된 레이아웃(루트 단일)에 도달 → cross-app 산출물 혼재 + codegraph 그래프 노이즈(루트 code-graph 가 eam/tlm 섞임).

## 옵션

- **옵션 1 (채택)**: 기존 BE 규칙 보존 + FE 워크스페이스 sub-case additive 보강(빌드-아티팩트 판별축). 단일 SSOT(`lifecycle-contract.md`)에만 추가, 중복 ❌.
- **옵션 2**: monorepo 전체 규칙을 빌드-단위 중심으로 재작성. → 과격(BE 멀티모듈 선례 무효화 위험 / scope≠module 3 근거 훼손) / 비채택.
- **옵션 3**: 현상 유지(소비 repo 에서 개별 판단). → drift 재발(매번 재발견) / 사용자 명시 요구("플러그인에 담겨라") 위반 / 비채택.

사용자 결정(2026-06-24): ① 앱별 co-located `.ai-context`(독립 빌드 단위 근거) ② 소스참조 `apps/<app>/`→`src/` rebase(self-contained) ③ 규칙을 플러그인에 codify ④ mis-fe-admin 에 적용해 PoC 확보.

## 결정 (옵션 1 시행)

- **`methodology-spec/lifecycle-contract.md`** "멀티모듈 repo 배치 규칙" 에 sub-case bullet 추가:
  - 판별축 = **"독립 빌드·배포 아티팩트"**(BE "자기 DB" 대응물). 자체 번들러 설정(vite/webpack/next + 자기 tsconfig·package.json) → 별도 SPA 번들 = **예외 → 앱별 `apps/<app>/.ai-context/`**.
  - 빌드 단위 = 분석·codegraph 인덱싱 단위 일치 → cross-app 노이즈 제거.
  - 공유 워크스페이스 lib(`apps/common`/`packages/*`) = 빌드타임 소스 의존성 → "한 core 공유 → 루트" **오판 금지** / shared-kernel 1회 분석 또는 cross-app 참조.
  - 참조 altitude: 앱-내부 = 앱 루트 상대(`src/...`) → self-contained(gea 단일-repo 동형) / 외부 앱·공유 lib = repo-상대 보존.
  - 기존 `analysis-scope-carve --scope-root apps/<app>` 와 정합.
- **trust 불변**: 본 결정은 문서 가이드(reference)만 — 결정론 도구·gate·스키마 무변경. `.ai-context` 경로는 여전히 cwd 기준 해소(코드 무변경).

## 검증

- **corroboration = 1 PoC(FE 첫)**: mis-fe-admin apps/tlm(BC-TLM-* 21 도메인) + apps/eam(integration-authority) 를 앱별 `.ai-context/` 로 분리 적용 — 규칙대로 빌드-아티팩트 판별축이 올바른 레이아웃을 산출함을 실증. 적용 후 schema-validator 273+ VALID / 참조 무결성 잔여 0 확인(소비 repo 커밋).
- **회귀 0**: 본 변경은 methodology-spec 문서 1곳 + DEC + 버전 3-way 만 — 도구·테스트·스키마 무변경 → chain-driver / schema-validator / drift-validator 영향 없음.
- **오판 사례 재현**: 보강 전 문구로 mis-fe-admin 판정 시 "apps/common 공유 → 루트 단일" false match 도달 가능함을 §배경에 기록.

## 후속 / §8.1

- **§8.1 면제 사유**: additive·doc-clarification(기존 규칙 보강 / 신규 mechanism·schema·gate ❌). release criteria(42) 무변. hard 격상 불필요 — 본 항목은 결정론 gate 가 아닌 배치 가이드.
- **HARD/본체 격상 게이트**: FE 모노레포 corroboration = **현재 1 PoC**(mis-fe-admin). nx/turbo 등 타 워크스페이스 도구 또는 2번째 FE 모노레포 적용 시 본체 사례 보강(별도 promotion 불필요 — 이미 본문 규칙 / 추가는 예시 누적).
- **carry**: 공유 lib(`apps/common`) 자체의 `.ai-context` 보유 여부(shared-kernel 전용 트리 vs cross-app 참조)는 미사용 — 첫 공유-lib 분석 시 결정. FE-track per-BC 배치(`lifecycle-contract.md` FE-track "미검증 carry")와 동일 선상의 FE 실증 누적.

## Relates

- `lifecycle-contract.md` "멀티모듈 repo 배치 규칙"(보강 대상 / BE 모) + FE-track per-BC carry(FE 실증 누적 형제)
- `skills/analysis-scope-carve`(`--scope-root apps/<app>` / FE 모노레포 분석 한정 기존 메커니즘)
- `DEC-2026-06-16-ai-context-layout-restructure`(3-bucket base/scopes/runtime 레이아웃 모)
- `feedback_diagnose_before_design_check_existing`(monorepo 규칙 이미 존재 실측 → 갭만 보강)
- 소비 repo memory: `project_bo_migration_tlm_analysis`(apps/tlm 분석 / 경로 이전 적용처)
