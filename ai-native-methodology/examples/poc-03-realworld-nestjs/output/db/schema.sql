--  G6 v1.2.2 ORM sub-section (b) TypeORM 정합 — algorithm-extracted DDL
-- 출처: src/**/*.entity.ts (5 entity) + ormconfig.json.example synchronize:true
-- 추출 방법: TypeORM default naming algorithm + @Column / @ManyToOne / @ManyToMany / @JoinTable 데코레이터 매핑
--  no-simulation 정합 — 운영 DB 접근 부재 / AI 추론 ❌ / 알고리즘 적용 ✅
-- 정직 표기: synchronize:true 자동 생성 결과의 실제 산출 검증 불가 (Sprint 5 carry-over)
--
-- 본 SQL 은 추정 — 사용자가 nest start + SHOW CREATE TABLE 로 검증 의무.
-- 검증 시 5종 물증 의무 (formal-spec.schema cross_validation):
--   - tool_version: TypeORM 0.2.24
--   - tool_stdout_path / tool_stderr_path: nest start 로그 + mysql -e 'SHOW CREATE TABLE *' 결과
--   - invocation_timestamp + duration_ms
--   - result_hash: SHA256 of SHOW CREATE TABLE 출력
--   - reproduction_command: docker run mysql + nest start (MYSQL_HOST=localhost) + nest cli

-- ───────────────────────────────────────────────────
--  결함 인덱스 (F-120 critical / F-121 high — 진입 즉시 Phase 6 격상)
-- ───────────────────────────────────────────────────
--  DB UQ 제약 0건 (모든 entity 의 @Column 에 unique:true 부재)
--   → user.username / user.email / article.slug / tag.tag 모두 race-prone
--   → PoC #02 AP-DOMAIN-002 isomorphic + 더 나쁜 (PoC #02 = 2중 / PoC #03 = 1중)
--  FK 제약 부재: follows.followerId / follows.followingId
--   → @ManyToOne 관계 부재 → referential integrity 부재
--   → cascade delete 미정의 → orphan row 가능
-- ───────────────────────────────────────────────────

CREATE TABLE `user` (
  `id`        int          NOT NULL AUTO_INCREMENT,
  `username`  varchar(255) NOT NULL,                      --  unique 제약 부재 (F-120)
  `email`     varchar(255) NOT NULL,                      --  unique 제약 부재 (F-120)
  `bio`       varchar(255) NOT NULL DEFAULT '',
  `image`     varchar(255) NOT NULL DEFAULT '',
  `password`  varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `article` (
  `id`            int          NOT NULL AUTO_INCREMENT,
  `slug`          varchar(255) NOT NULL,                  --  unique 제약 부재 (F-120) — slugify random suffix 회피만
  `title`         varchar(255) NOT NULL,
  `description`   varchar(255) NOT NULL DEFAULT '',
  `body`          varchar(255) NOT NULL DEFAULT '',       --  varchar(255) — text 권장 (F-133 신규 후보)
  `created`       timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated`       timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tagList`       text         NOT NULL,                  --  TypeORM simple-array — comma-separated. TagEntity 와 별개 (F-123)
  `favoriteCount` int          NOT NULL DEFAULT 0,        --  분산 환경 race 위험
  `authorId`      int          DEFAULT NULL,              -- (implicit FK from @ManyToOne author)
  PRIMARY KEY (`id`),
  KEY `FK_article_author` (`authorId`),
  CONSTRAINT `FK_article_author` FOREIGN KEY (`authorId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `comment` (                                 --  @Entity() default — 다른 entity 는 명시적 @Entity('xxx')
  `id`        int          NOT NULL AUTO_INCREMENT,
  `body`      varchar(255) NOT NULL,                     --  varchar(255) — comment body 길이 부족 가능
  `articleId` int          DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_comment_article` (`articleId`),
  CONSTRAINT `FK_comment_article` FOREIGN KEY (`articleId`) REFERENCES `article` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tag` (
  `id`  int          NOT NULL AUTO_INCREMENT,
  `tag` varchar(255) NOT NULL,                            --  unique 제약 부재 — tag 중복 가능
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
--  F-122 — TagEntity insert 코드 부재 → 빈 테이블 가능성 (dead code)

CREATE TABLE `follows` (
  `id`          int NOT NULL AUTO_INCREMENT,
  `followerId`  int NOT NULL,                             --  FK 제약 부재 (F-121 high)
  `followingId` int NOT NULL,                             --  FK 제약 부재 (F-121 high)
  PRIMARY KEY (`id`)
  --  (followerId, followingId) composite UQ 부재 → 중복 follow 가능 (App pre-check ProfileService.follow 만)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────
--  TypeORM auto-generated junction table — UserEntity.favorites @ManyToMany @JoinTable
--  실 명명 검증 의무 (Sprint 5 carry-over) — TypeORM 의 default junction 명명 = 'user_entity_favorites_article_entity' 또는 사용자 명시
-- ───────────────────────────────────────────────────
CREATE TABLE `user_entity_favorites_article_entity` (
  `userEntityId`    int NOT NULL,
  `articleEntityId` int NOT NULL,
  PRIMARY KEY (`userEntityId`, `articleEntityId`),
  KEY `IDX_userEntityId` (`userEntityId`),
  KEY `IDX_articleEntityId` (`articleEntityId`),
  CONSTRAINT `FK_userEntity_favorite` FOREIGN KEY (`userEntityId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_articleEntity_favorite` FOREIGN KEY (`articleEntityId`) REFERENCES `article` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--  Caveat: 본 schema.sql 은 entity 데코레이터 + TypeORM 알고리즘 추정.
-- 실 prod DDL 검증 시 사용자가 nest start + mysqldump 또는 SHOW CREATE TABLE 결과 첨부 의무.
