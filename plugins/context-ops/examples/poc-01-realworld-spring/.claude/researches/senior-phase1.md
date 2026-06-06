# Senior Engineer Research — PoC #01 Phase 1 (init / 인벤토리)

> 역할: Senior Backend Engineer (15년차, Spring/Java/JPA, 한국 엔터프라이즈 SI 출신)
> 작성일: 2026-04-27
> 대상 plan: `.claude/plans/plan-phase1.md`
> 동료 research: `.claude/researches/document-phase1.md` (공식문서 리서처), `.claude/researches/case-phase1.md` (테크기업 사례 리서처)
> Work Principles 2원칙 — 3개 에이전트 中 Senior 파트
>
> 톤: 실무 일화 위주. 학술적 정합성보다 "이거 안 하면 나중에 운다"의 우선순위.

---

## §0. 들어가며 — 왜 Phase 1이 가장 위험한가

15년 SI/사내 SM 하면서 제일 많이 본 사고는 **킥오프 직후 1주차**에서 났다. 코드 한 줄 안 쓰고도 망한다. Phase 1 (init) 이 딱 그 1주차 자리다.

이유 3가지:

1. **다 알 것 같은 단계라 검토를 안 한다.** "build.gradle 보면 Java 11에 Spring Boot 2.7이고 JPA잖아요" — 맞다. 근데 거기서 끝나는 게 아니라 "그래서 이 시스템이 뭐로 굴러가는가"를 단정하는 게 Phase 1이다. 단정의 신뢰도는 90%인데 후속 Phase는 그 90%를 100%처럼 쓴다. **오차 누적의 시드(seed)** 가 Phase 1이다.
2. **결정적 처리 비중이 높다는 명세 자체가 함정.** 명세 §6은 "결정적 처리 95%"라 신뢰도가 가장 높다고 적었지만, 그건 *git clone + linguist 라이브러리* 환경 가정이다. **PoC는 web_fetch만 가능**. 결정성 가정이 그대로 깨진다. 명세를 곧이곧대로 따르면 신뢰도를 과대평가한다.
3. **LLM이 "큰 모듈 = 핵심" 본능을 갖고 있다.** 명세 `modules_for_priority_analysis` 가 그걸 부추긴다. 한국 SI 시스템에서 LOC 1위 모듈은 십중팔구 **공통 코드/유틸/Excel 출력 처리** 다. 핵심 도메인은 LOC 3~5위에 숨어 있는 경우가 더 많다.

아래 §1~§8은 위 위험을 구체적 함정 8개로 쪼갠 것. **PoC #01 진행자는 이 8개를 체크리스트로 들고 들어가야 한다.**

---

## §1. build.gradle 의존성만 보고 ORM 단정하는 함정

### 증상

`spring-boot-starter-data-jpa` 한 줄 보고 "JPA 단일, confidence 0.99" 박는다. 디렉토리 트리에 `resources/mapper/` 없고 `@Mapper` import 0건이면 더 자신감이 붙는다.

### 일화

예전에 모 보험사 청구계 분석 들어갔을 때다. build.gradle에 `data-jpa`만 있어서 JPA 시스템이라 적었다. 일주일 뒤 운영 SQL 튜닝 의뢰가 들어와서 까보니 `JdbcTemplate` 으로 직접 쿼리 짠 코드가 전체의 40% 였다. 거기에 어떤 팀은 `NamedParameterJdbcTemplate`, 어떤 팀은 `EntityManager.createNativeQuery` 로 JPA 빌어다가 SQL만 찍어 쓰고 있었다. **의존성에는 안 잡힌다.** spring-boot-starter-jdbc는 starter-data-jpa의 transitive 의존이고, JdbcTemplate은 자동 빈 등록되어 있었기 때문이다.

또 한 번은 RealWorld 비슷한 학습 레포처럼 "JPA만 쓰는 척" 하지만 실제로는 `@Query(nativeQuery = true)` 가 Repository 절반에 깔린 케이스도 있었다. 이건 ORM 종류는 맞지만 **JPQL/native 비율** 이라는 또 다른 축이 빠진 거다. Phase 1에서 잡지 못하면 Phase 2.5 SQL 분석에서 "어 이거 왜 ORM 자동매핑이 아니지?" 하고 다시 돌아온다.

RealWorld는 학습용이라 깨끗할 가능성 90%지만, 사내 시스템 옮길 때 **이 함정이 1순위**다.

### 대응책

1. **의존성 외 4개 단서 동시 점검.** ① `JdbcTemplate` import 검색 (`org.springframework.jdbc.core.JdbcTemplate`), ② `@Query(nativeQuery = true)` 검색, ③ `EntityManager.createNativeQuery` 검색, ④ `application.properties` 의 `spring.datasource.*` 직접 사용 흔적.
2. **`stack.backend.orm[]` 에 "primary" / "secondary" 구분 필드 추가** (명세 §4.2 확장 finding 후보). JPA primary + JdbcTemplate secondary 같은 표현 가능해야 한다.
3. **Phase 1에서 단정하지 말고 "확정 + 검증 보류" 두 단계로.** confidence 0.99 가 아니라 0.9 + "Phase 2.5 SQL 추출 후 재산정" 메모.
4. **RealWorld 예외 처리.** `source-info.md` 가 "JPA 단일" ground truth로 줬으면 그건 신뢰. 하지만 **사내 시스템 적용 시 본 함정이 그대로 살아있음을 inventory.warnings에 기록**.

---

## §2. 디렉토리 구조로 아키텍처 패턴 단정의 위험

### 증상

`controller/`, `service/`, `repository/` 보이면 무조건 "Layered, confidence 0.7" 박는다. RealWorld는 거기에 `domain/` 까지 있어서 "Hexagonal? DDD-lite?" 라고 살짝 끼워 넣고 싶은 욕망이 생긴다.

### 일화

15년 전에 자바 EE 프로젝트 하나가 있었는데, 디렉토리는 정확히 `controller/service/dao/vo` 4단 Layered 였다. 그런데 까보니 service에서 다른 service의 dao를 직접 부르고, controller에서 dao를 바로 부르는 라인도 30% 가까이 있었다. **디렉토리는 Layered, 실제는 스파게티.** 신입이 Ctrl+Click 한 번 했다가 의존 그래프 보고 "이게 뭐죠?" 했던 기억.

또 다른 케이스. 모 게임사 백오피스에서 `domain/` 에 POJO 만 있고 (RealWorld와 동일), `application/` 에 service 가 있어서 처음 봤을 때 "오 클린 아키텍처 적용했네" 했다. 그런데 application service 가 바로 `infrastructure/jpa/` 의 EntityManager 를 import 해서 쓰고 있었다. **포트도 어댑터도 없는 클린 아키텍처 레이아웃**. 디렉토리만 Hexagonal 인 거다.

RealWorld도 비슷하다. `domain/` 에 POJO 가 있다는 사실은 **POJO 로 짰다**는 사실이지, **DDD/Hexagonal 적용**의 증거가 아니다. 학습용 레포라서 깔끔할 뿐, 패턴 단정은 위험하다.

### 대응책

1. **Phase 1에서는 "후보(candidates)" 까지만.** 명세 키 이름이 `architecture_style_candidates` 인 건 잘 지은 거다. Phase 3 (arch) 에서 의존 그래프 그려보고 확정해야 한다.
2. **각 후보 confidence 상한 0.7 강제.** 디렉토리 단서만으로는 0.7 초과 금지. 의존 그래프 + 사용자 인터뷰가 추가되어야 0.8+.
3. **evidence 배열에 "디렉토리 외 단서" 빈칸 명시.** Phase 3에서 채울 자리. 예: `evidence: ["controller/service/repository 디렉토리", "<TBD: 의존 방향 검증 Phase 3>"]`.
4. **POJO 도메인이 있다고 DDD라 적지 말 것.** "POJO domain" 사실만 적고 패턴 라벨은 보류. 이게 가장 흔한 실수다.

---

## §3. LOC 통계의 함정 (web_fetch 환경)

### 증상

GitHub Languages API가 byte 단위로 주는데, 그걸 LOC인 줄 알고 그대로 쓴다. 또는 byte/35 (Java 평균) 으로 환산해놓고 confidence 0.95 박는다.

### 일화

예전에 사내 코드 분석 자동화 도구 만들 때, GitHub Languages API 결과를 LOC라고 우겨서 보고서를 올린 신입이 있었다. PM이 "Java 87,543 라인 이라고 적혀 있는데 실제 cloc 돌려보니 12,000 라인이네요?" 하고 지적해서 **byte vs LOC 혼동**이 발견됐다. 87,543은 byte 였다. 35로 나누면 약 2,500 LOC. cloc 결과와도 다르다 (cloc는 주석/공백 제외, 우리 환산은 포함).

또 다른 함정. Java 평균 byte/LOC 35는 *일반적인 비즈니스 코드* 기준이다. **POJO 도메인은 50~80**, **Lombok 적용 코드는 25~30**, **DTO만 있는 클래스는 100+**. RealWorld 는 도메인이 POJO + Lombok도 안 쓴다고 source-info.md 에 적혀 있어서 byte/35 가 맞지 않는다. 50 정도로 나눠야 실제에 가깝다. 하지만 **테스트 코드는 또 다르다** (assertion 많아서 30~40). 디렉토리별로 환산식이 다르다는 사실 자체가 byte/LOC 환산의 한계를 보여준다.

### 대응책

1. **`stats.json` 에 `loc` 키 쓰지 말고 `estimated_loc` + `loc_method` + `loc_confidence` 3 키 강제.**
   - `loc_method: "byte_size_div_35_java_default"`
   - `loc_confidence: 0.5~0.7`
   - `warning: "exact LOC requires git clone + cloc/scc"`
2. **byte 기반 정확한 값(Languages API 응답)은 별도 보존.** `bytes_per_language` 키로 원본 보존.
3. **inventory.json `total_loc` 명세 키 자체에 finding.** F-008 후보로 정식 기록.
4. **PoC #01에서 정확도 검증.** 가능하면 raw blob fetch 로 1~2개 파일 직접 LOC 카운트하여 환산식 오차 보고.

---

## §4. 분석 우선순위 모듈 선정의 함정 (LLM의 "큰 모듈 = 핵심" 본능)

### 증상

`modules_for_priority_analysis` 에 LOC 1순위 디렉토리를 무조건 1번으로 넣는다. 명세 예시 자체가 "loc: 12000" + "가장 큰 모듈, 핵심 도메인 후보" 라고 본능을 부추긴다.

### 일화

이게 한국 SI에서 제일 많이 봤다. 모 카드사 가맹점 정산 시스템 분석할 때, LOC 1위는 `common/` 패키지 (8천 라인), 2위는 `excel/` (5천 라인 — 엑셀 다운로드 처리), 3위가 정산 도메인 (`settlement/`, 4천 라인) 이었다. 만약 LLM이 자동 추천 했으면 common이랑 excel 까보면서 일주일 날렸을 거다. 정작 핵심은 정산 로직 내부의 **300줄짜리 수수료 계산 함수** 였다.

한국 SI 시스템 LOC 분포 패턴 (경험칙):

- **공통/유틸 패키지**: 항상 LOC 1~3위 (Excel/PDF/암호화/공통예외/공통DTO)
- **로그/감사**: 의외로 큼 (감사 컬럼 자동 채우기, 변경이력 트래킹)
- **배치 잡**: 야간 배치 잡이 도메인보다 큰 경우 흔함
- **핵심 도메인**: LOC는 작지만 **함수 1개가 비즈니스 결정 30개 묶고 있음**

LLM은 LOC를 보지만, **의사결정 밀도(decision density)** 를 못 본다. PoC #01의 ground truth (`source-info.md`) 가 Article을 우선으로 명시한 건 이것 때문이다. RealWorld에서 Article은 LOC 1위가 아닐 수 있다 (User나 공통 더 클 수도). 하지만 **CRUD + favorite + tag + slug + author 라는 5축이 엮여 있는 거의 유일한 도메인** 이다.

### 대응책

1. **LLM 추천 + ground truth 양쪽 모두 inventory에 보존.** 일치하면 confidence 0.95, 불일치하면 source-info.md 우선 + LLM 추천을 evidence로 보존 + warning.
2. **"reason" 필드에 LOC만 쓰지 말 것.** reason은 ① 도메인 중요도 (사용자 확인), ② 의존 in-degree 추정, ③ 외부 인터페이스 수, ④ LOC 의 4축 중 가장 강한 것 명시.
3. **finding 후보**: 명세 `modules_for_priority_analysis[].reason` 가이드 부재. LOC 외 축 의무화.
4. **PoC #01 한정**: source-info.md 의 Article 명시를 무조건 1순위로.

---

## §5. web_fetch 환경의 결정적 처리 한계 (명세 "결정성 95%" 가정 vs 실제 추정 위주)

### 증상

명세 §6이 "결정적 처리 95%, 신뢰도 가장 높음"이라 적어놨고, 그걸 그대로 manifest의 `phase_1_init: 0.95` 로 베껴 적는다. 실제로는 web_fetch만 가능한 환경에서 절반은 추정이다.

### 일화

예전에 사내 자동 분석 도구 PoC 할 때, 첫 버전이 git clone + cloc + tokei + linguist + tree-sitter 다 박아넣은 환경이었다. 그때 LOC, 언어 분포, 함수 수, 클래스 수 다 정확히 나왔다. 결정성 95%가 맞았다.

근데 외부 SI 사이트 보안 정책상 git clone 못 하고 sourcetree로 zip 내려받아야 하는 고객이 있어서 **"web 환경에서 동등 분석"** 요구를 받았다. 그 순간 모든 게 추정으로 바뀌었다. byte는 알아도 LOC는 모르고, AST 못 만드니까 함수/클래스 수도 정규식 추정. **"결정성"의 정의가 환경에 종속된다**는 걸 그때 처음 깨달았다.

PoC #01은 web_fetch + raw blob fetch 환경이다. 학습 코퍼스 + 1차 fetch 권한 거부까지 있었다 (document-phase1.md §0 참조). 명세의 "결정성 95%"는 git clone + 라이브러리 환경 가정이다. **그대로 신뢰도 베껴 적으면 안 된다.**

### 대응책

1. **manifest의 `phase_1_init: 0.95` 를 환경별로 분리.** `phase_1_init.git_clone_env: 0.95`, `phase_1_init.web_fetch_env: 0.85`.
2. **각 산출물 항목에 `extraction_method` 필수.** `deterministic`, `pattern_matching`, `estimation`, `llm_inference`.
3. **finding F-009 정식 기록**: "Phase 1 명세 §6 신뢰도 표가 환경 종속성 미명시. web_fetch 환경 신뢰도 별도 표 필요."
4. **inventory.warnings 배열 의무화.** 환경 종속 추정 항목 모두 warnings에 명시.

---

## §6. 신뢰도 메타 산정에서 자주 하는 실수

### 증상

세 가지 패턴:

(a) **manifest 0.95 그대로 복사.**
(b) **`element_count` 를 항목 수로 오해.** ADR-003 §7의 가중평균은 "추출된 요소 수" 가 가중치다. 의존성 30개 추출했으면 `element_count: 30`. 근데 항목(field) 수로 오해해서 `element_count: 1` 박는 경우 흔하다.
(c) **cap 0.98 무지성 적용.** raw average 가 0.93 인데 "어차피 cap 0.98 이니까 0.95 박자" 하고 올린다. **cap은 상한, 하한이 아니다.**

### 일화

ADR-003 만들 때 한참 토론했던 부분이다. 처음엔 "신뢰도 = 평균" 했는데, 영역별 elements 수가 100 vs 1 이면 평균이 의미가 없었다. 그래서 가중평균으로 갔다. 그런데 그 가중치 (`element_count`) 를 어떻게 세는지가 또 함정. **"의존성 30개" 면 element_count는 30**. **"ORM 자동 감지" 는 결과가 boolean 같지만 사실 detected ORM 의 수**. 1개면 1, 혼재면 2. **"디렉토리 트리"는 1**. element_count 정의가 명세에 없는 게 finding 후보다 (F-011 신규).

또 cap 0.98 얘기. 한국 SI 에서 "보고서 수치 보정" 문화가 있어서, 0.93 같은 어중간한 숫자보다 0.95 이쁜 숫자로 올리는 관성이 있다. PoC에서 그러면 안 된다. **raw 가 0.93 이면 0.93 그대로**.

### 대응책

1. **inventory.json `meta.expected_confidence_average` 산정 절차 명시:** 각 영역의 `confidence` × `element_count` 합계 / `element_count` 합계.
2. **`_manifest.yml` 의 `expected` 값과 실제 `expected_confidence_average` 차이 5% 이상이면 warning.**
3. **cap 0.98 적용 케이스 별도 명시.** raw < 0.98 면 raw 그대로. raw >= 0.98 만 0.98로 클립 + `cap_applied: true`.
4. **finding F-011 후보**: "ADR-003 가중평균 산정 시 `element_count` 정의 가이드 부재."

---

## §7. PoC 진행 자체의 함정 (finding 0건 = 검증 가치 0)

### 증상

Phase 1 끝났는데 finding 0건이다. "다 잘 돌았네요" 하고 Phase 2 넘어간다. **이게 가장 큰 실패다.**

### 일화

이건 일화라기보다 PoC 의 본질이다. 사내 PoC 회고 때 자주 봤다. PoC 끝나고 "잘 되더라고요" 만 나오면 **PoC를 안 한 것과 동일**하다. 본 사업에서 fail 났을 때 "그때 검증했잖아요" 라고 변명할 단서만 만든 거다.

PoC #01 의 진짜 KPI는:

- finding 5건 이상 (반드시 5건 이상이어야 v1.1.2 재료가 된다)
- 신뢰도 측정 차이 ±5% 이내
- Phase별 산출물 완성도 (schema 통과)

**finding 0~2건이면 PoC 실패**다. 명세를 너무 깨끗하게 따라가서 빈틈이 안 보였거나, 빈틈을 찾았는데 기록을 안 한 거다. 둘 다 실패.

특히 Phase 1은 **명세에 빈틈이 많은 단계** (schema 부재, web_fetch 환경 미고려, frontend omit 가이드 부재, total_loc 의미 모호 등). 여기서 finding 0건 나오면 의도적으로 눈 감은 거다.

### 대응책

1. **finding 후보 사전 등록.** R-Phase1-1~5 + F-007~F-011 후보 사전 등록. **최소 3건은 정식 finding 으로 등록**.
2. **"명세 빈틈" 으로 표현 안 되는 finding 도 적극 기록.**
3. **finding 의 severity / 영향도 등급 표기.** v1.1.2 즉시 반영 vs v1.2 후보 vs 메모만 의 3등급.
4. **회고 섹션에 "왜 이게 finding 되어야 하는가" chain 으로 명시.**

---

## §8. RealWorld 특화 함정

### 8.1 학습용 spec 깨끗 vs 사내 차이

#### 증상

RealWorld 가 너무 깨끗해서 PoC 결과가 "다 잘 됐다"는 결론으로 흐른다. 실제 사내 시스템은 훨씬 더럽다.

#### 일화

RealWorld 류 학습용 레포 분석한 적이 있었는데, 모든 게 책에 나오는 대로였다. 디렉토리 4단 정확히, 의존성 깔끔, 테스트 100%, README 완비. PoC 자동화 도구가 잘 돌았다. 사내 적용 한 번에 깨졌다. 사내 코드는:

- `controller/service/repository` 외에 `helper/util/manager/business/biz/cmm/cm` 등 정의 없는 디렉토리 7~10개
- README 없음 또는 3년 전 버전
- build.gradle 에 사내 ivy 저장소 + 사내 transitive 의존성
- 의존성 30개 → 200개
- 테스트 커버리지 30% 이하, 통과율 70%
- 한글 주석/한글 패키지명 일부

**PoC 가 RealWorld 잘 분석한다 ≠ 사내 잘 분석한다.**

#### 대응책

1. **PoC 결과 보고서 첫 페이지에 "일반화 한계" 명시.**
2. **사내 차이 시뮬레이션 시나리오 finding 후보 (F-012).**
3. **PoC #02 후보 제안.** 좀 더 dirty 한 OSS 또는 사내 레포로 실행.

### 8.2 JaCoCo 100% = 품질 100% 오해

#### 증상

source-info.md 에 "JaCoCo 커버리지 100%" 라고 되어 있어서 "이 레포는 검증된 거" 라는 인상을 준다. Phase 1 inventory에 "test_coverage: 100%, quality: high" 같이 적고 싶은 욕망.

#### 일화

JaCoCo 100% 시스템 까봤다가 충격 받은 적 있다. 모든 메서드가 호출은 됐는데 **assertion 이 거의 없었다**. `service.create(input)` 호출만 하고 결과 검증 없는 테스트가 30%, `verify(mock).method()` 만 하고 비즈니스 검증 없는 테스트가 또 30%. 커버리지는 line/branch coverage 지 **assertion coverage** 가 아니다.

#### 대응책

1. **inventory 에 `test_coverage` 박지 말 것.** Phase 7 (test) 범위.
2. **source-info.md 의 "100%" 는 ground truth 메타로만 보존.**
3. **JaCoCo report fetch 가능하면 line/branch/instruction 분리 기록.**

### 8.3 drawio 다이어그램 drift

#### 증상

source-info.md 에 drawio 다이어그램이 ground truth로 들어 있다. "다이어그램이 있으니까 아키텍처 검증 끝" 이라 생각.

#### 일화

다이어그램과 코드의 drift는 SI에서 1순위 의심 대상이다. 사내 시스템 보면 다이어그램은 6개월 전, 코드는 어제 머지된 게 흔하다. RealWorld 같은 학습용도 마찬가지로 **drawio 작성 시점 ≠ 현재 main 시점** 일 수 있다.

#### 대응책

1. **inventory.meta 에 `auxiliary_inputs[].commit_sha_at_input_time` 필드 추가 finding.**
2. **Phase 3 (arch) 에서 drawio vs 코드 의존 그래프 diff 의무화 finding.**
3. **PoC #01 한정**: drawio 검증은 Phase 3로 미루고, Phase 1에서는 메모만.

---

## §9. Phase 1 절대 하지 말 것 5개 (Don'ts)

| # | Don't | 이유 |
|---|---|---|
| 1 | build.gradle 의존성만 보고 ORM confidence 0.99 박기 | §1 — JdbcTemplate/native query 미감지. |
| 2 | 디렉토리 구조로 아키텍처 패턴 confidence 0.7 초과 | §2 — 의존 그래프 없이 단정 금지. |
| 3 | byte 단위 Languages API 결과를 LOC로 그대로 쓰기 | §3 — `estimated_loc` + method + confidence 의무. |
| 4 | LLM "큰 모듈 = 핵심" 추천을 ground truth 우선 없이 채택 | §4 — source-info.md 우선. |
| 5 | manifest 0.95 그대로 inventory `expected_confidence_average` 복사 | §5, §6 — 영역별 가중평균 + element_count + cap 의미. |

---

## §10. Phase 1 꼭 확인할 것 5개 (Do's)

| # | Do | 검증 방법 |
|---|---|---|
| 1 | build.gradle 의존성 + 4단서 (JdbcTemplate, nativeQuery, EntityManager native, datasource 직접) 모두 점검 | raw blob fetch 추가 |
| 2 | Trees API truncated 여부 inventory.meta 에 보존 | API 응답의 `truncated` 필드 |
| 3 | LOC를 `estimated_loc` + `loc_method` + `loc_confidence` 3키로 분리 | stats.json |
| 4 | LLM 우선순위 추천 + source-info.md 양쪽 보존 + 일치/불일치 표기 | inventory에 source 필드 |
| 5 | finding 최소 3건 이상 (F-007~F-011 中) 정식 등록 | findings/poc-findings.md |

---

## §11. Senior 한마디

Phase 1은 **"다 알 것 같지만 80%만 안다"** 의 단계다. 명세대로 build.gradle + 디렉토리 트리 fetch 하면 80%는 잡힌다. 나머지 20%가 후속 Phase 5개의 신뢰도를 결정한다.

특히 한국 SI 환경 적용 시:

- **"의존성 외 단서 4개"** (JdbcTemplate/nativeQuery/EntityManager native/datasource 직접) 가 핵심이다.
- **"LOC 1위 ≠ 핵심 도메인"** 은 거의 100% 사실이다. ground truth 우선 + LLM 추천을 evidence 로.
- **"확정 + 보류" 두 단계** — Phase 1 단정의 절반은 Phase 2~5에서 재산정되어야 한다.

PoC #01 한정으로 가장 중요한 건:

- **finding 최소 3건 이상.** 0건은 PoC 실패.
- **명세 빈틈 발견 시 즉시 기록.** 머릿속에 두지 말고 findings/poc-findings.md 에 박아라.
- **"web_fetch 환경에서 명세 결정성 95% 가정 깨진다"** 는 사실 자체가 가장 큰 finding 후보.

마지막으로. Phase 1에서 시간 더 쓰는 게 후속 Phase 5개 시간 단축으로 돌아온다. **여기서 아끼면 거기서 운다.** 한국 SI 에서 15년 동안 본 거의 유일한 진리다.

---

## §12. 참고

- 동료 research: `document-phase1.md` (공식문서), `case-phase1.md` (테크기업 사례)
- plan: `plan-phase1.md` (R-Phase1-1~5 리스크)
- Phase 명세: `methodology-spec/workflow/phase-1-init.md` (§7 흔한 함정 — 본 research 가 보강)
- ADR-003: 신뢰도 가중평균
- 상위 plan: `methodology-v1.1/.claude/plans/plan-poc-realworld.md`
