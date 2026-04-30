# BR-ARTICLE-COMMENT-EAGER-001 — Decision Table (Phase 4.5)

> **일자**: 2026-04-30 (Phase 4.5 추가 형식화 / B 작업)
> **Source of Truth**: 코드 (article.entity.ts:38 @OneToMany eager:true)
> **PoC #02 cross-validation**: ★★ F-051 EAGER N+1 → ★ F-124 재현 (3 PoC 권위 — AP-PERFORMANCE-001 high 격상)

---

## 1. 정책 문장 (자연어 — L0)

> rules.json BR-ARTICLE-COMMENT-EAGER-001
> - condition: "—"
> - action: "comments OneToMany {eager:true}"
> - expected_result: "comments 항상 로드"
> - current_state: "★ partial — N+1 위험 F-124"

**자연어 3 / 9 = 33%** (★ PoC #02 동형 — eager loading 의 본질적 자연어 빈약).

---

## 2. L1 결정표 (현재 코드)

### 2-A. find 시점 분기

| 호출 | comments eager:true | 쿼리 수 | 메모리 |
|:---:|:---:|:---:|:---:|
| findOne(slug) | ✅ | 1 (article) + 1 (comments) = 2 | 적음 |
| findAll() N article | ✅ | 1 (article list) + N (comments) = **N+1** | ★ N×M scale |
| findFeed() N follow article | ✅ | 1 (feed) + N (comments) = **N+1** | ★ N×M scale |

→ **★ F-124 N+1**: list endpoint (findAll / findFeed) 가 N+1 query 발생.

### 2-B. ★ N+1 정량 (PoC #03 RealWorld 시나리오)

```
findAll limit=20 default — N=20 article
20 article × 평균 3 comment = 60 comments

쿼리 수: 1 (article list) + 20 (comments per article) = 21 queries

대규모 시나리오:
limit=100 (★ no max cap — F-165) → 1 + 100 = 101 queries
limit=1000 (★★ OWASP API4 위반) → 1 + 1000 = 1001 queries
```

→ **★ limit cap 미존재 (F-165) + EAGER (F-124)** = **★★ DDoS 위험** (단일 GET /articles?limit=10000 으로 10001 queries).

---

## 3. L2 Refinement Type

```typescript
namespace ArticleInvariants {
  // INV — list endpoint 의 query count <= 2 (1 article + 1 comment join)
  export const queryCountInvariant = async (
    repo: Repository<ArticleEntity>,
    queryFn: () => Promise<ArticleEntity[]>,
  ): Promise<{ queryCount: number; valid: boolean }> => {
    const counter = createQueryCounter(repo);
    await queryFn();
    const queryCount = counter.count;
    return { queryCount, valid: queryCount <= 2 };
  };
}
```

---

## 4. 코드 생성안 (Direction D 권고 — F-124 fix)

### 4-A. eager:false default

```typescript
@Entity('article')
export class ArticleEntity {
  // ★ NEW (F-124 fix)
  @OneToMany(() => CommentEntity, c => c.article, { eager: false })  // ★ false default
  comments: CommentEntity[];
  // ...
}
```

### 4-B. ★ findAll 시 명시적 leftJoinAndSelect

```typescript
async findAll(query: ArticlesQuery): Promise<ArticlesRO> {
  const qb = this.articleRepository.createQueryBuilder('article')
    .leftJoinAndSelect('article.author', 'author')
    .leftJoinAndSelect('article.comments', 'comments')   // ★ NEW (1 query)
    .take(Math.min(query.limit ?? 20, 50))               // ★ F-165 fix (max cap 50)
    .skip(query.offset ?? 0);

  const [articles, count] = await qb.getManyAndCount();
  return { articles: articles.map(a => this.buildArticleRO(a)), articlesCount: count };
}
```

→ **1 query (article + author + comments JOIN)** = N+1 → 1 격상.

### 4-C. ★ N+1 회귀 방지 unit test

```typescript
describe('ArticleService.findAll', () => {
  it('should make at most 2 queries (★ F-124 회귀 방지)', async () => {
    const counter = createQueryCounter(dataSource);
    await service.findAll({ limit: 20 });
    expect(counter.count).toBeLessThanOrEqual(2);
  });
});
```

---

## 5. 발견된 신규 finding

| # | finding | 심각도 | 근거 |
|---|---|---|---|
| F-124 | EAGER N+1 (★ PoC #01 F-006 + PoC #02 F-051 cross-val 재현 / 3 PoC 권위) | high (★ medium → high 격상) | §2-A |
| F-165 (cumul) | limit no max cap → ★★ DDoS 위험 (1만 query 가능) | medium | §2-B |

---

## 6. PoC #01 + #02 + #03 cross-validation (★ 3 PoC 권위)

| 항목 | PoC #01 F-006 | PoC #02 F-051 | PoC #03 F-124 |
|---|---|---|---|
| eager loading | EAGER 적용 | EAGER 적용 | eager:true |
| N+1 검출 | ✅ | ✅ | ✅ |
| 권고 | LAZY default + 명시적 fetch | LAZY default + @EntityGraph | eager:false + leftJoinAndSelect |
| AP 등급 | medium | medium | ★ high (3 PoC 권위 격상) |

→ **★★ 3 PoC 동형 재현 = AP-PERFORMANCE-001 medium → high 격상 정식 데이터** ★ (v1.3 격상 후보 #1).

→ **★ EAGER N+1 = 본 방법론 검출 가장 안정적 보편 결함** (Java/Hibernate / Java/JPA / TypeScript/TypeORM 모두 동일 메커니즘).
