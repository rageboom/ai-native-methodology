# ADR-NEST-002: class-validator + ValidationPipe 표준

- 상태: 승인됨 (Accepted) — 묶음 R #2
- 일자: 2026-04-30
- 관련: ADR-NEST-001 (sibling 묶음 R #1 — Auth scope) / ADR-NEST-003 (sibling 묶음 R #3 — @HttpCode) / ADR-NEST-004 (sibling 묶음 R #4 — TypeORM 무결성) / PoC #03 AP-VALIDATION-001 (high) / F-128 + F-127 + F-143 + F-162 (cumul)

---

## 1. 컨텍스트

PoC #03 분석 결과 **class-validator coverage 12% (6/50+ 필드)**. UpdateUserDto / CreateArticleDto / CreateCommentDto = **0 validator**. UserService.update validate 미호출 (F-143). Service 단 manual throw 분산.

→ OWASP API1 (mass assignment 위험) + Senior 위험 3 정량 입증.

## 2. 결정

### 2.1 ★ ValidationPipe 글로벌 의무

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // ★ DTO 외 필드 차단
  forbidNonWhitelisted: true, // ★ DTO 외 필드 시 400
  transform: true            // ★ 타입 자동 변환
}));
```

### 2.2 ★ 모든 input DTO = class-validator 의무

```typescript
export class CreateUserDto {
  @IsNotEmpty() @MinLength(3) @MaxLength(20) username: string;
  @IsNotEmpty() @IsEmail() email: string;
  @IsNotEmpty() @MinLength(8) password: string;
}

export class UpdateUserDto {
  @IsOptional() @IsString() @MinLength(3) @MaxLength(20) username?: string;
  @IsOptional() @IsEmail() email?: string;  // ★ F-143 fix
  @IsOptional() @MaxLength(500) bio?: string;
}
```

### 2.3 ★★ Domain Aggregate constructor invariant 의무

DTO 검증만으로는 domain invariant 보장 안 됨. Aggregate 생성자 throw 의무:

```typescript
@Entity('follows')
export class FollowsEntity {
  constructor(followerId: number, followingId: number) {
    if (followerId === followingId) {
      throw new Error('follower and following must differ');  // ★ Domain invariant
    }
    // ...
  }
}
```

→ Sairyss DDD-Hexagon 정설 정합.

### 2.4 ★ Service.create + Service.update 둘 다 validate 의무

```typescript
async update(userId: number, dto: UpdateUserDto) {
  const user = await this.findOne(userId);
  Object.assign(user, dto);

  const errors = await validate(user);  // ★ NEW (F-143 fix)
  if (errors.length) throw new HttpException({errors}, 400);

  await this.userRepository.save(user);
}
```

## 3. 결과

### 3.1 Positive 효과

- ★ OWASP API1 (mass assignment) 회피
- ★ Domain invariant 보장 (Aggregate 생성자 throw)
- ★ DTO + Domain + DB 3중 안전망

### 3.2 트레이드오프

- ★ DTO 작성 부담 — input/update/patch 별 분리 의무
- ★ Aggregate 생성자 throw 시 테스트 부담

## 4. 검증

- supertest negative test — empty / null / overflow / invalid email boundary
- ts-morph rule — DTO field 가 validator decorator 없으면 차단
- Aggregate constructor unit test — boundary throw 검증

## 5. 본 방법론 적용

`migration-cautions.md` § D — 신규 NestJS 프로젝트 design 단계 의무.

---

**End of ADR-NEST-002.**
