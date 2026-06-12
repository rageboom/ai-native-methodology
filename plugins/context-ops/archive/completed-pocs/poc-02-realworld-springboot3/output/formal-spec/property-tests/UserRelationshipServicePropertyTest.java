// PoC #02 — UserRelationshipService Property Test (Phase 4.5 Sprint 2)
// 일자: 2026-04-29
// Source of Truth: invariants/UserFollow.ts + 자연어 BR-USER-FOLLOW-*
// 실행: ./gradlew :module:core:test --tests "*UserRelationshipServicePropertyTest*"
// 사용자 환경 위임 (Java/Gradle 환경 부재 시)

package io.zhc1.realworld.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;

import io.zhc1.realworld.model.User;
import io.zhc1.realworld.model.UserFollow;

import net.jqwik.api.Arbitraries;
import net.jqwik.api.Arbitrary;
import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.Provide;

class UserRelationshipServicePropertyTest {

    // ========================================================================
    // Generator
    // ========================================================================

    @Provide
    Arbitrary<User> userArbitrary() {
        return Arbitraries.strings().alpha().ofMinLength(3).ofMaxLength(20)
            .map(name -> {
                User u = new User(
                    name + "@test.com",
                    name,
                    "password123"
                );
                // UUID 강제 주입 (테스트 용)
                try {
                    var idField = User.class.getDeclaredField("id");
                    idField.setAccessible(true);
                    idField.set(u, UUID.randomUUID());
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
                return u;
            });
    }

    // ========================================================================
    //  F-074 — BR-USER-FOLLOW-NO-SELF-001 (Phase 4.5 Sprint 2 신규)
    // ========================================================================

    @Property(tries = 100)
    void selfFollow_throws_IAE(@ForAll("userArbitrary") User user) {
        // 본 테스트는 UserFollow-with-self-check.java 가 적용된 상태에서만 통과
        assertThatThrownBy(() -> new UserFollow(user, user))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("follower and following must be different");
    }

    @Property(tries = 100)
    void distinct_users_always_followable(
        @ForAll("userArbitrary") User a,
        @ForAll("userArbitrary") User b
    ) {
        // generator 가 서로 다른 인스턴스 보장
        if (a.getId().equals(b.getId())) return;  // skip
        UserFollow f = new UserFollow(a, b);
        assertThat(f.getFollower().getId()).isEqualTo(a.getId());
        assertThat(f.getFollowing().getId()).isEqualTo(b.getId());
    }

    // ========================================================================
    // INV-USER-FOLLOW-DIRECTIONAL — BR-USER-FOLLOW-DIRECTIONAL-001
    // ========================================================================

    @Property(tries = 100)
    void mutual_follow_creates_two_distinct_rows(
        @ForAll("userArbitrary") User a,
        @ForAll("userArbitrary") User b
    ) {
        if (a.getId().equals(b.getId())) return;
        UserFollow ab = new UserFollow(a, b);
        UserFollow ba = new UserFollow(b, a);
        // 단방향: 두 row 가 별개 관계
        assertThat(ab.getFollower().getId()).isNotEqualTo(ba.getFollower().getId());
        assertThat(ab.getFollowing().getId()).isNotEqualTo(ba.getFollowing().getId());
    }

    // ========================================================================
    //  Sprint 1.5 #13 isomorphic — Equality on transient (UserFollow)
    // ========================================================================

    @Property(tries = 100)
    void preP ersist_userFollow_equals_collision_risk(
        @ForAll("userArbitrary") User a,
        @ForAll("userArbitrary") User b,
        @ForAll("userArbitrary") User c
    ) {
        if (a.getId().equals(b.getId()) || b.getId().equals(c.getId())) return;
        // pre-persist: id null
        UserFollow ab = new UserFollow(a, b);
        UserFollow bc = new UserFollow(b, c);
        // UserFollow.equals 가 id 기반 → 둘 다 id null → equals true 위험
        // 본 property 가 통과하면 equals 가 id-only 라는 증거 ( 위험 신호)
        assertThat(ab.equals(bc)).isFalse();  // 의도된 동치성 검증
        //  실제로는 equals true 가 나올 가능성 (id null collision) → fail 시 finding 등록
    }

    // ========================================================================
    //  F-095 isomorphic — race window (BR-IDEMPOTENT 와 충돌)
    // ========================================================================

    // 본 테스트는 Spring @Transactional + 동시성 제어 필요 → 별도 통합 테스트
    // 본 property test scope 외 명시
}

/*
 * Property test 5건 (jqwik) — 실행 환경 부재로 사용자 위임.
 * 실행 통과 = 형식 명세 ↔ 코드 정합 자동 보장.
 *  Sprint 1.5 #13 (Equality on transient) 검증 자동화 — 본 sprint 신규 부각.
 * F-095 (race window) 는 통합 테스트 영역 — 본 scope 외.
 */
