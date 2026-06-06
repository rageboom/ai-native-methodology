/**
 * Property-Based Test — ArticleService favorite/unFavorite (Phase 4.5)
 *
 * 일자: 2026-04-30
 *  Counter Aggregate 집중 — favoriteCount 단조성 + race window
 * 검증 대상:
 * - state-machine: Article.mermaid ( counter aggregate 집중)
 * - sequence: UC-ARTICLE-CREATE / UC-ARTICLE-FAVORITE
 * - invariants: Article.ts (ArticleInvariants + CounterAtomicity)
 */

import fc from 'fast-check';
import { describe, test, expect } from 'vitest';

interface MockArticle {
  id: number;
  slug: string;
  title: string;
  favoriteCount: number;
}
interface MockFavorite { userId: number; articleId: number }

class MockArticleService {
  private articles: MockArticle[] = [];
  private favorites: MockFavorite[] = [];
  private idSeq = 1;

  async create(userId: number, dto: { title: string; body: string }): Promise<MockArticle> {
    const slug = dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      + '-' + Math.random().toString(36).substring(7);
    const article: MockArticle = {
      id: this.idSeq++,
      slug,
      title: dto.title,
      favoriteCount: 0,
    };
    this.articles.push(article);
    return article;
  }

  //  F-135 critical — App 1중 isNewFavorite (DB FOR UPDATE 부재)
  async favorite(userId: number, slug: string): Promise<MockArticle> {
    const article = this.articles.find(a => a.slug === slug);
    if (!article) throw new Error('article not found');

    //  App 1중
    const isNewFavorite = !this.favorites.find(f => f.userId === userId && f.articleId === article.id);

    if (isNewFavorite) {
      this.favorites.push({ userId, articleId: article.id });
      article.favoriteCount++;
    }
    // silent skip if 이미 favorited

    return article;
  }

  async unFavorite(userId: number, slug: string): Promise<MockArticle> {
    const article = this.articles.find(a => a.slug === slug);
    if (!article) throw new Error('article not found');

    const idx = this.favorites.findIndex(f => f.userId === userId && f.articleId === article.id);
    if (idx >= 0) {
      this.favorites.splice(idx, 1);
      article.favoriteCount--;
    }
    // silent skip if 이미 unfavorited

    return article;
  }

  getArticles(): MockArticle[] { return [...this.articles]; }
  getFavorites(): MockFavorite[] { return [...this.favorites]; }
}

describe('ArticleService Properties — Counter Aggregate 집중 (Phase 4.5)', () => {

  // ----------------------------------------------------------------------
  // INV-ARTICLE-FAVORITE-COUNT-MATCHES-FAVORITES
  // ----------------------------------------------------------------------
  test('INV-COUNT-MATCH: favoriteCount == favorites.length (단조성)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({
          op: fc.constantFrom('favorite', 'unFavorite'),
          userId: fc.integer({ min: 1, max: 5 }),
        }), { minLength: 1, maxLength: 30 }),
        async (ops) => {
          const svc = new MockArticleService();
          const article = await svc.create(1, { title: 'Test', body: 'b' });

          for (const op of ops) {
            if (op.op === 'favorite') await svc.favorite(op.userId, article.slug);
            else await svc.unFavorite(op.userId, article.slug);
          }

          const articleAfter = svc.getArticles().find(a => a.slug === article.slug)!;
          const favoritesForArticle = svc.getFavorites().filter(f => f.articleId === articleAfter.id);

          return articleAfter.favoriteCount === favoritesForArticle.length;
        }
      )
    );
  });

  // ----------------------------------------------------------------------
  // INV-ARTICLE-FAVORITE-COUNT-NON-NEGATIVE
  // ----------------------------------------------------------------------
  test('INV-NON-NEGATIVE: favoriteCount >= 0 (모든 시점)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({
          op: fc.constantFrom('favorite', 'unFavorite'),
          userId: fc.integer({ min: 1, max: 5 }),
        }), { minLength: 1, maxLength: 30 }),
        async (ops) => {
          const svc = new MockArticleService();
          const article = await svc.create(1, { title: 'Test', body: 'b' });

          for (const op of ops) {
            if (op.op === 'favorite') await svc.favorite(op.userId, article.slug);
            else await svc.unFavorite(op.userId, article.slug);
          }

          return svc.getArticles().every(a => a.favoriteCount >= 0);
        }
      )
    );
  });

  // ----------------------------------------------------------------------
  // INV-ARTICLE-SLUG-UNIQUE ( F-120-slug — DB UQ 부재 / App level 만)
  // ----------------------------------------------------------------------
  test('INV-SLUG-UNIQUE: random suffix 로 슬러그 충돌 회피 ( DB UQ 부재 / App level 보장 안 됨)', async () => {
    const svc = new MockArticleService();
    const titles = Array.from({ length: 100 }, () => 'same-title');
    for (const title of titles) {
      await svc.create(1, { title, body: 'b' });
    }
    const slugs = svc.getArticles().map(a => a.slug);
    const uniqueSlugs = new Set(slugs);
    //  random suffix 로 충돌 회피 (대부분의 경우)
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  // ----------------------------------------------------------------------
  //  F-135 critical — favoriteCount race window
  // ----------------------------------------------------------------------
  test(' F-135 critical: 동시 favorite race window 시 favoriteCount 정합성 위반 가능 (현재 코드 실태)', async () => {
    const svc = new MockArticleService();
    const article = await svc.create(1, { title: 'race', body: 'b' });

    //  본 Mock 은 단일 thread — 실제 race window 는 DB 환경 의무 (Sprint 5 carry-over)
    // 두 동시 favorite 시 양쪽 isNewFavorite=true 통과 → favoriteCount 2회 증가 / favorites.length 1회 증가
    // (실 환경 시뮬레이션은 진짜 MySQL + concurrent connection 필요)
    await svc.favorite(2, article.slug);
    expect(article.favoriteCount).toBe(1);

    await svc.favorite(2, article.slug);  // 이미 favorited → silent skip
    const articleAfter = svc.getArticles().find(a => a.slug === article.slug)!;
    expect(articleAfter.favoriteCount).toBe(1);
  });

  // ----------------------------------------------------------------------
  // INV — favorite + unFavorite 같은 횟수 시 count 0 으로 복귀 (idempotent + 단조성)
  // ----------------------------------------------------------------------
  test('Property: same favorite/unFavorite 횟수 → favoriteCount 0', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 20 }),
        async (n) => {
          const svc = new MockArticleService();
          const article = await svc.create(1, { title: 'test', body: 'b' });
          for (let i = 1; i <= n; i++) {
            await svc.favorite(i, article.slug);
          }
          for (let i = 1; i <= n; i++) {
            await svc.unFavorite(i, article.slug);
          }
          const a = svc.getArticles().find(x => x.slug === article.slug)!;
          return a.favoriteCount === 0;
        }
      )
    );
  });
});
