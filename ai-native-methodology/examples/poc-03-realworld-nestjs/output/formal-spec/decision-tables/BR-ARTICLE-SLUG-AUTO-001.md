# BR-ARTICLE-SLUG-AUTO-001 — Decision Table (Phase 4.5)

> **일자**: 2026-04-30 (Phase 4.5 추가 형식화 / B 작업)
> **Source of Truth**: 코드 (article.service.ts:200-220 create)
> **PoC #02 cross-validation**: ★ F-053 (titleToSlug ASCII-only) → ★ F-053-variant 재현 (random suffix 변형)

---

## 1. 정책 문장 (자연어 — L0)

> rules.json BR-ARTICLE-SLUG-AUTO-001
> - condition: "create 호출"
> - action: "slug = slug(title, {lower:true}) + '-' + Math.random().toString(36)"
> - expected_result: "slug 자동 생성 (random suffix 로 unique 회피)"
> - current_state: "★ partial — DB UQ 부재 + slug update 미구현"

**자연어 4 / 9 = 44%**.

---

## 2. L1 결정표 (현재 코드)

### 2-A. create 분기 (POST /api/articles)

| title 정합 | slug-base 생성 | random suffix 생성 | DB INSERT | 결과 | HTTP | 비고 |
|:---:|:---:|:---:|:---:|---|---|---|
| ❌ (blank) | * | * | * | "title required" | 400 | (★ DTO validator 부재 — F-162) |
| ✅ | ✅ | ✅ (★ 60M) | ✅ | DB 저장 | 201 | 정상 (★ 0.08% 충돌 N=10K) |
| ✅ | ✅ | ✅ | **★ 충돌** | **★★ undefined behavior** | ? | ★ DB UQ 부재 = 양쪽 row INSERT 성공 (정합성 손실) |

→ **★ F-120-slug critical**: DB UQ 부재 시 race window — slug 충돌 시 양쪽 row 모두 INSERT 성공.

### 2-B. update 분기 (PUT /api/articles/:slug) — ★ F-126

| title 변경 | 현재 코드 | 결과 |
|:---:|:---:|---|
| ❌ (title 동일) | slug 유지 | 정상 |
| ✅ (title 변경) | **★ slug 미업데이트** (TODO 주석) | ★ SEO 손실 + slug 일관성 결여 |

→ **★ F-126**: `// Todo: update slug also when title gets changed` (article.controller.ts:61).

---

## 3. 충돌 확률 정량 (★ random suffix 분석)

```
현재: Math.random().toString(36).substring(7) = 5 chars / 36^5 ≈ 60M

Birthday paradox 충돌 확률 ≈ 1 - exp(-N²/(2*60M))

N=1,000:    0.0008%
N=10,000:   0.083%
N=100,000:  8.0%       ← ★ 100K Article 도달 시 위험
N=1,000,000: 99.96%    ← ★★ 1M 시 거의 확실
```

→ **현재 = 소규모 OK / 중규모 위험 / 대규모 critical**.

---

## 4. L2 Refinement Type

```typescript
type Slug = string & {
  __refinement: { kebabCase: true; uniqueDB: true };  // DB UQ 보장
};

namespace ArticleInvariants {
  // INV — 모든 slug 가 (title 의 slugify(lower) + '-' + suffix) 형식
  export const isValidSlug = (slug: string): slug is Slug =>
    /^[a-z0-9-]+-[a-z0-9]{5,}$/.test(slug);

  // INV — DB level (Article repository 검증)
  export const allSlugsUnique = async (repo: Repository<ArticleEntity>): Promise<boolean> => {
    const rows = await repo.query('SELECT slug, COUNT(*) c FROM article GROUP BY slug HAVING c > 1');
    return rows.length === 0;
  };
}
```

---

## 5. 코드 생성안 (Direction D 권고)

### 5-A. DB UQ 추가 (F-120-slug fix)

```typescript
@Entity('article')
@Index(['slug'], { unique: true })  // ★ NEW
export class ArticleEntity {
  @Column() slug: string;
  // ...
}
```

### 5-B. catch QueryFailedError → 재생성 retry (race-safe pattern)

```typescript
async create(userId: number, dto: CreateArticleDto, retryCount = 0): Promise<ArticleRO> {
  if (retryCount >= 3) throw new HttpException('Slug generation failed', 500);

  const slug = this.generateSlug(dto.title);
  const article = new ArticleEntity({slug, ...dto, author: await this.findAuthor(userId)});

  try {
    return await this.articleRepository.save(article);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return this.create(userId, dto, retryCount + 1);  // ★ regenerate
    }
    throw e;
  }
}
```

### 5-C. ★ Article setTitle slug regenerate (F-126 fix)

```typescript
async update(slug: string, dto: UpdateArticleDto): Promise<ArticleRO> {
  const article = await this.articleRepository.findOne({where: {slug}});
  if (!article) throw new HttpException('Article not found', 404);

  if (dto.title && dto.title !== article.title) {
    article.title = dto.title;
    article.slug = this.generateSlug(dto.title);  // ★ NEW (F-126 fix)
  }
  Object.assign(article, dto);

  return await this.articleRepository.save(article);
}
```

### 5-D. (★ 권고) random suffix 7 chars 또는 nanoid

```typescript
// 현재 5 chars → 7 chars
const suffix = Math.random().toString(36).substring(2, 9);  // ★ 7 chars

// 또는 nanoid (더 안전)
import { nanoid } from 'nanoid';
const suffix = nanoid(10);
```

---

## 6. 발견된 신규 finding

| # | finding | 심각도 | 근거 |
|---|---|---|---|
| F-053-variant | random suffix slug (PoC #02 F-053 변형) | medium | §2-A row 3 |
| F-120-slug | DB UQ 부재 → 충돌 시 정합성 손실 | high | §2-A row 3 + §3 |
| F-126 | Article update 시 slug 미업데이트 (TODO) | medium | §2-B + §5-C |
| F-169 신규 | random suffix 5 chars 부족 (대규모 위험) | low | §3 |

---

## 7. PoC #02 cross-validation 결과

| 항목 | PoC #02 F-053 (titleToSlug) | PoC #03 BR-ARTICLE-SLUG-AUTO-001 |
|---|---|---|
| slug 생성 | titleToSlug (ASCII-only) | slugify(lower) + Math.random suffix |
| DB UQ | ✅ 존재 | ❌ 부재 (F-120-slug) |
| 충돌 처리 | 한국어 등 non-ASCII fail | random 의존 (★ 0.08% N=10K) |
| update 시 slug | (PoC #02 미발견 영역) | ★ F-126 TODO 미업데이트 |
| 권고 | nano-id 도입 + DB UQ | ★ DB UQ 추가 + nanoid + F-126 fix |

→ **★ F-053-variant 재현** (slug 생성 함정) + **★ DB UQ 부재 신규** (PoC #02 보다 더 위험) + **★ F-126 신규** (NestJS / TypeORM 특이).
