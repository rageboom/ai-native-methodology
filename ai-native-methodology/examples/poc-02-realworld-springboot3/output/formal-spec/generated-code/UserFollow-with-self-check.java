// PoC #02 — UserFollow.java 형식 명세 → 코드 생성 (Phase 4.5 Sprint 2)
// 일자: 2026-04-29
// Source of Truth: 자연어 명세 (rules.json BR-USER-FOLLOW-NO-SELF-001) + 형식 명세 (UserFollow.ts)
// ★ F-074 단방향 round-trip — 자연어 → 형식 → 코드
// 검증: 원본과 비교 ❌ — 원본 코드에 self-follow 검사 부재 (F-074 자체가 코드 부재) ✅
// 변경 사항: line 56-62 추가 (★ F-074 fix — 1 if block + 주석 4 line) — Sprint 2 Static Analyzer drift 정정

package io.zhc1.realworld.model;

import java.time.LocalDateTime;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "user_follow",
        uniqueConstraints = {@UniqueConstraint(columnNames = {"follower_id", "following_id"})})
public class UserFollow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "follower_id")
    private User follower;

    @ManyToOne
    @JoinColumn(name = "following_id")
    private User following;

    @Column(nullable = false, updatable = false)
    private final LocalDateTime createdAt = LocalDateTime.now();

    public UserFollow(User follower, User following) {
        if (follower == null || follower.getId() == null) {
            throw new IllegalArgumentException("follower is null or unknown user.");
        }
        if (following == null || following.getId() == null) {
            throw new IllegalArgumentException("following is null or unknown user.");
        }
        // ★★★ F-074 fix — BR-USER-FOLLOW-NO-SELF-001 (Phase 4.5 Sprint 2 신규)
        // - 형식 명세: invariants/UserFollow.ts UserFollowInvariants.noSelfFollow
        // - 결단 출처: decision-tables/BR-USER-FOLLOW-NO-SELF-001.md §2 (Domain 검증 위치)
        // - 자연어 출처: rules.json BR-USER-FOLLOW-NO-SELF-001 (then: 거부)
        if (follower.getId().equals(following.getId())) {
            throw new IllegalArgumentException("follower and following must be different");
        }

        this.follower = follower;
        this.following = following;
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof UserFollow other && Objects.equals(this.getId(), other.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.getId());
    }
}
