# 산출물 #4: DB 스키마 (Database Schema)

> **사상**: Schema-First (ADR-001 — 다중 출처 통합 시 운영 DB > ORM > ERD 우선순위)
> **schema**: `schemas/db-schema.schema.json` · **template**: `templates/analysis/erd.template.mermaid`
> **생성 phase**: `db-schema` phase (`/analyze-db`)

---

## 1. 목적

**답하는 질문**: "이 시스템의 데이터는 어떻게 영속되는가?"

**AI 재구현 시 활용**: DDL 자동 생성 / migration 작성

---

## 2. 형식

```
output/db/
├── schema.json                    # AI용 (구조화)
├── schema.sql                     # 통합 SQL (CREATE TABLE)
├── erd.mermaid                    # ERD (Mermaid erDiagram)
├── 정합성-검증-보고서.md           # 다중 출처 시 (보조)
└── tables/                        # 테이블별 상세 (선택)
    ├── orders.md
    └── users.md
```

**다중 출처 통합 우선순위**: 운영 DB (실제 동작) > ORM (코드 의도) > ERD (문서)

---

## 3. 추출 범위

### 3.1 추출 대상 (출처 / 방법 / 신뢰도)

| 항목 | 추출 출처 | 방법 | 신뢰도 (소스만 / +ERD / +운영DB) |
|---|---|---|---|
| 테이블/컬럼 | ORM 엔티티, Migration, ERD, 운영DB | 결정적 | 0.85 / 0.95 / 0.98 |
| PK/FK | ORM 어노테이션, ERD 관계 | 결정적 | 0.70 / 0.95 / 0.95 |
| 인덱스 | 운영 DB INFORMATION_SCHEMA | 결정적 | — / — / 0.98 |
| 컬럼 의미 | ERD 코멘트, ORM JavaDoc | 결정적 + LLM | — / 0.85 / 0.85 |
| 테이블 그룹 (도메인 매핑) | 패키지 구조 + 테이블 접두어 | LLM 추론 | 0.65 |

**입력**: 소스 코드 + (선택) ERD + (선택) 운영 DB 접근

### 3.2 미추출 (의도적)

- 쿼리 성능, 실행 계획 → NFR 영역
- 데이터 마이그레이션 전략 → v2 (재구현 단계)

---

## 4. 검증 체크리스트

```
□ schema.json schema 검증 통과
□ erd.mermaid 렌더링 확인
□ 모든 테이블에 PK 명시
□ FK 명시 또는 부재 사유 기록
□ 정합성 검증 보고서 사람 검토 (다중 출처 시)
□ severity=high 항목 모두 결정 완료
```

---

## 5. 산출물 간 참조

| 방향 | 의미 |
|---|---|
| DB → DOM | Table ↔ Entity |
| DB → RULES | CHECK / UNIQUE 제약 |
| DB → ARCH | 테이블 그룹 |
| DB → AP | unused table 등록 |

---

## 6. 흔한 함정

### 6.1 ERD 를 무조건 SoT 로
- 증상: 옛 ERD 를 신뢰하여 운영 DB 와 불일치 무시
- 대응: 통합 우선순위 정책 (DB > ORM > ERD)

### 6.2 deprecated 테이블 포함
- 증상: 코드에서 안 쓰는 테이블도 추출
- 대응: ORM 사용 추적 → 사용 흔적 없으면 AP-DB-UNUSED-XXX

### 6.3 ORM 우회 SQL 무시
- 증상: JPA + Native Query 혼재인데 ORM 만 봄
- 대응: Native Query 위치 함께 기록 → `business-logic` phase 5.A 로 전달
