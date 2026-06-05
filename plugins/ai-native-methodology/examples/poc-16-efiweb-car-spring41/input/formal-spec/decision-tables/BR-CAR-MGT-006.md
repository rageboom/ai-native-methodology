# Decision Table — BR-CAR-MGT-006 Leader 사용자 식별

> BR-CAR-MGT-006.json 와 의미 동등 (이중 렌더링)

## Trigger

`selectLeaderUserId` SQL 호출 (HTTP /ifrs/car/* endpoint 진입 시 세션 사용자가 Leader 인지 확인)

## 결정 표

| # | PFLE_STATUS_CD | USER_FG_HR | USER_ID match | Result |
|---|---|---|---|---|
| 1 | 'PS10' (활성) | 'E10' (직원) | sessionId == DB USER_ID | ✅ Leader / USER_ID 반환 |
| 2 | 'PS10' | 'E10' | sessionId != DB USER_ID | ❌ non-Leader / 0 row |
| 3 | != 'PS10' | * | * | ❌ non-Leader / 0 row |
| 4 | * | != 'E10' | * | ❌ non-Leader / 0 row |

## Action

```sql
SELECT USER_ID as userId
FROM FIM.dbo.TB_USER WITH(NOLOCK)
WHERE PFLE_STATUS_CD = 'PS10'
AND USER_FG_HR = 'E10'
AND USER_ID = #sessionId#
```

## Expected Result

- **Leader** (1 row 반환) — 세션 사용자가 Leader 권한 보유
- **non-Leader** (0 row) — 권한 거부 / Service layer 에서 null 체크 후 분기

## Verification Location

- `source/sqlmap/carMgt.xml` (selectLeaderUserId)
- `source/java/smilegate/ifrs/car/service/impl/CarMgtServiceImpl.java` (getLeaderUserId)

## Current State

**partial** — FIM 외부 DB 의존 / PFLE_STATUS_CD ('PS10' 활성) + USER_FG_HR ('E10' 직원) 코드 의미는 사내 컨벤션 + 컬럼명 추정. 본 PoC source 외부.

## Rejection Method

Service layer (CarMgtServiceImpl) 가 null/empty result 시 권한 거부 처리. 정확한 분기 위치 = 마이그레이션 시 Spring Security `@PreAuthorize` 또는 별도 Filter 로 격상 권고.
