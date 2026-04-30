# ADR-NEST-004: TypeORM 무결성 표준 — UQ + FK + Atomic Counter + LAZY default

- 상태: 승인됨 (Accepted) — 묶음 R #4
- 일자: 2026-04-30
- 관련: PoC #03 AP-DB-001 (critical) + AP-PERFORMANCE-001 (high — 3 PoC 권위) / F-120 + F-121 + F-133 + F-135 + F-124 (cumul 5)

---

## 1. 컨텍스트

PoC #03 분석 결과 **TypeORM 사용 시 무결성 결함 critical**:
- DB UQ 부재 — User username/email + Article slug + Follows pair (F-120 + F-133)
- FK 부재 — Follows.followerId/followingId → user.id 참조 ❌ (F-121)
- Counter race window — favoriteCount = favorites.length App 1중 (F-135)
- EAGER N+1 — comments eager:true (F-124 — ★ 3 PoC 재현 권위)

→ **AP-DB-001 critical + AP-PERFORMANCE-001 high (★ 3 PoC 권위 격상)**.

## 2. 결정

### 2.1 ★ DB UQ 의무 — App pre-check 단독 금지

```typescript
@Entity('user')
@Index(['username'], { unique: true })
@Index(['email'], { unique: true })
export class UserEntity {
  // ...
}
```

App pre-check 만으로는 race-prone. **DB UQ 가 ground truth**.

### 2.2 ★ Many-to-Many UQ pair + FK 의무

```typescript
@Entity('follows')
@Index(['followerId', 'followingId'], { unique: true })
@Check('follower_id <> following_id')
export class FollowsEntity {
  @ManyToOne(() => UserEntity, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'followerId'})
  follower: UserEntity;

  @ManyToOne(() => UserEntity, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'followingId'})
  following: UserEntity;
}
```

### 2.3 ★★ Counter atomic UPDATE 의무 — App splice + count++ 금지

```typescript
// ❌ App level (race-prone)
article.favorites.push(user);
article.favoriteCount++;
await repo.save(article);

// ✅ Atomic UPDATE (race-safe)
await dataSource.transaction(async (mgr) => {
  await mgr.insert(ArticleFavoriteEntity, {userId, articleId});  // ★ DB UQ pair
  await mgr.increment(ArticleEntity, {id: articleId}, 'favoriteCount', 1);
});
```

또는 `@Version` optimistic lock.

### 2.4 ★ EAGER:false default + 명시적 fetch

```typescript
@Entity('article')
export class ArticleEntity {
  @OneToMany(() => CommentEntity, c => c.article, { eager: false })  // ★ default
  comments: CommentEntity[];
}

// ★ 명시적 fetch
const articles = await this.repository.find({
  relations: ['comments', 'author']
});
```

★ 3 PoC 재현 권위 — Hibernate / JPA / TypeORM 정설.

### 2.5 ★ catch QueryFailedError → ConflictException 변환

```typescript
try {
  await repo.save(user);
} catch (e) {
  if (e.code === 'ER_DUP_ENTRY') {
    throw new ConflictException('username already exists');  // ★ 409
  }
  throw e;
}
```

### 2.6 ★ synchronize: true 절대 금지 (production)

migration 도구 (typeorm migrations / @nestjs/cli) 의무 사용.

## 3. 결과

### 3.1 Positive 효과

- ★ race-safe + idempotent 동시 보장
- ★ N+1 query 회피 (Performance high 격상 데이터 정합)
- ★ DB level 무결성 = App level 의존 최소화

### 3.2 트레이드오프

- ★ migration 도구 학습 부담
- ★ Aggregate 생성자 + DB UQ + FK 모두 작성 부담
- ★ @Version 도입 시 entity 갱신

## 4. 검증

- migration 파일 = `SHOW CREATE TABLE` 검증 (UQ + FK + Check)
- concurrent INSERT 시뮬레이션 E2E (k6 / supertest)
- jest + typeorm-query-counter — N+1 회귀 방지

## 5. 본 방법론 적용

`migration-cautions.md` § B-1 — 신규 NestJS / TypeORM 프로젝트 의무.

---

**End of ADR-NEST-004.**
