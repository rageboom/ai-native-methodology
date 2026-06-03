# PoC #16 EFI-WEB car — DB Schema 정합성 검증 보고서

> phase db-schema 산출물 (`schema.json` + `erd.mermaid`) 의 출처 cross-check + drift 명시.

## 출처 비교 매트릭스

| 출처                               | 가용                                                           | 본 PoC 사본 위치 |
| ---------------------------------- | -------------------------------------------------------------- | ---------------- |
| **DDL .sql (IFRS_split)**          | ✅ 6 own tables + 3 functions                                  | `source/ddl/`    |
| **iBATIS sqlmap (call signature)** | ✅ 2 sqlmap / 37 statement / 4 외부 DB 18 object               | `source/sqlmap/` |
| **ERD 파일 (car.erd + ifrs.erd)**  | ⚠️ 형식 unknown (ER/Studio 또는 DA# 추정) / viewer 부재        | `source/erd/`    |
| **운영 DB 직접 query**             | ❌ MSSQL 본 환경 접근 ❌                                       | —                |
| **JPA / ORM entity**               | ❌ Spring 4.1 + iBATIS 2 paradigm = ORM entity 미사용 / DTO 만 | —                |

## drift / 한계 명시

### 1. FK CONSTRAINT 명시 부재 — **모든 FK 추론 의무**

- DDL 6 own tables 안 `CONSTRAINT FK ...` 정의 ❌ (PK CONSTRAINT 만 존재)
- 본 schema 의 foreign_keys 배열 = **컬럼명 컨벤션 (`car_idx → tb_car.idx` / `term_idx → tb_car_user_term.term_idx` / `cost_idx → tb_car_cost.cost_idx`) 기반 추론**
- 영향: 운영 DB 정밀 검증 시 일부 FK 가 의도와 다를 수 있음 (carry)
- finding: F-POC15-DB-001 (medium / FK 추론)

### 2. table/column 이름 case 차이

- 실 DDL: `TB_CAR` / `CAR_NO` 대문자
- 본 schema: `tb_car` / `car_no` 소문자 (snake*case pattern `^[a-z]a-z0-9*]\*$` 정합)
- 모든 컬럼/테이블에 `drift_note` 또는 schema 안 description 명시
- 영향: schema 정합 위함 / 실 SQL 생성 시 case-insensitive MSSQL 동작 의존

### 3. **외부 4 DB 18 object DDL 부재** (의무 carry)

- FIM (3) / SGERP (10 + 1 SP) / e_hr (1) / ekporg (1) = total 16 + 1 SP + 1 view 추정
- 본 schema scope = own 6 table + 3 function + 1 SP signature 만
- 외부 object 의 컬럼/타입 = sqlmap 호출 시그니처 (select 컬럼 list) 추론으로만 부분 가능 / 본 PoC 미진행
- carry 대상: business-rules phase / api phase 에서 외부 의존 BR anchor 추출

### 4. **TB_CAR_COST_SLIP 복합 PK** (schema anti-pattern)

- composite PK = (cost_idx, slip_id, cost_gubun)
- schema description = "단일 PK 권장 — 복합 PK는 안티패턴"
- 영향: 도메인 모델 (domain.json) 안 entity 매핑 시 composite identifier 처리 의무 / DDD value object 후보
- finding: F-POC15-DB-002 (medium / composite PK anti-pattern)

### 5. **TB_CAR_DRIVE 컬럼 drift (drive_dist ↔ distance)**

- TB_CAR_DRIVE 안 거리 컬럼 2개: `drive_dist` (decimal(10,2)) + `distance` (decimal(10,2))
- 의미 중복 가능성 → drift 의심 (drive_dist = 실 운행 거리 vs distance = 자택-근무지 거리?)
- 영향: business-rules phase 정밀 검증 carry
- finding: F-POC15-DB-003 (medium / column 의미 중복)

### 6. ERD 파일 ↔ DDL drift 확인 ❌

- ERD viewer 부재 (car.erd / ifrs.erd 형식 unknown)
- DDL 사본만 source → ERD ↔ DDL 의미 동등성 검증 ❌
- 본 phase 산출 `erd.mermaid` = DDL 만 source (ERD 무관)
- carry: ERD viewer 가용 시 cross-check 의무

## 자동 검증 결과

| 도구                                         | 결과        |
| -------------------------------------------- | ----------- |
| schema-validator (db-schema.schema.json)     | (실행 예정) |
| drift-validator (.json ↔ .mermaid 의미 동등) | (실행 예정) |

## 데이터 구조 summary

```
6 own tables (IFRS.dbo):
  - tb_car (마스터)
    ├─ tb_car_user_term (1:N / car_idx)
    │   └─ tb_car_cost (1:N / term_idx)
    │       └─ tb_car_cost_slip (1:N / cost_idx) → SGERP._TACSlip (외부 FK)
    └─ tb_car_drive (1:N / car_idx)

  + tb_car_cost_nolog (회사별 통합 / 독립 / car 무관)

3 UDFs (IFRS own):
  - fn_get_caruserlistview
  - fn_get_caruserlistview_2
  - fn_split (공통)

1 External SP (SGERP):
  - sg_sacsliprowcarmanagementifquery (차량비용 → 회계전표 IF)
```
