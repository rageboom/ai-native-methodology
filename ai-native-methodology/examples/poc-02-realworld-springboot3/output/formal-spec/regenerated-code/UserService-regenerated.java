// PoC #02 — UserService 재생성 (Phase 4.5 Sprint 1 / Direction D)
// 일자: 2026-04-29
// Source: 형식 명세만으로 생성 (원본 코드 미참조)
//   - state-machines/User-Account.mermaid
//   - sequence-diagrams/UC-USER-SIGNUP.mermaid
//   - decision-tables/BR-USER-EMAIL-UNIQUE-001.md
//   - invariants/User.ts
// Direction: L1/L2 명세 → 코드
// 비교 대상: source/realworld-java21-springboot3/module/core/src/main/java/io/zhc1/realworld/service/UserService.java

package io.zhc1.realworld.service;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;  //  Sprint 1 발견 — 원본 누락
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import io.zhc1.realworld.model.PasswordEncoder;
import io.zhc1.realworld.model.User;
import io.zhc1.realworld.model.UserRegistry;
import io.zhc1.realworld.model.UserRepository;

/**
 * UserService — 명세 기반 재생성 (Direction D).
 *
 * <p>형식 명세에서 도출된 구조:
 * <ul>
 *   <li>signup: existsBy → User constructor → encryptPassword → save (race-safe 보강)</li>
 *   <li>login: null/blank check → findByEmail → matches</li>
 *   <li>updateUserDetails:  F-071 정합 (UserService 가 검증, Adapter 는 save)</li>
 *   <li>getUser by id/username: findOrThrow</li>
 * </ul>
 *
 * <p> 형식화 발견 갭 (원본 대비 개선 사항):
 * <ul>
 *   <li>F-058: DataIntegrityViolationException catch + IAE 변환 (race window 보강)</li>
 *   <li>F-071: updateUserDetails 검증을 Service 가 수행 (Hexagonal 정합)</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * INV-USER-EMAIL-UNIQUE + INV-USER-USERNAME-UNIQUE + INV-USER-PASSWORD-ENCRYPTED 보장.
     * <p>Decision Table BR-USER-EMAIL-UNIQUE-001 참조.
     */
    public User signup(UserRegistry registry) {
        // L1 사전 체크 (App 1중 race-prone — 정상 경로 빠른 거절)
        if (userRepository.existsBy(registry.email(), registry.username())) {
            throw new IllegalArgumentException("email or username is already exists.");
        }

        // L2 도메인 검증 (User constructor null/blank)
        var requester = new User(registry);
        requester.encryptPassword(passwordEncoder, registry.password());

        // L3 DB UQ (race-safe) +  F-058 fix: race window catch
        try {
            return userRepository.save(requester);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("email or username is already exists.", ex);
        }
    }

    public User login(String email, String password) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("email is required.");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("password is required.");
        }

        return userRepository
                .findByEmail(email)
                .filter(user -> passwordEncoder.matches(password, user.getPassword()))
                .orElseThrow(() -> new IllegalArgumentException("invalid email or password."));
    }

    /**
     *  F-071 정합: 검증을 Service 가 수행 (원본은 Adapter 가 위반).
     * Adapter 는 단순 save 만 (리팩터 권고).
     */
    public User updateUserDetails(
            UUID userId, String email, String username, String password, String bio, String imageUrl) {
        if (userId == null) {
            throw new IllegalArgumentException("user id is required.");
        }

        var user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("user not found."));

        // F-071 정합: 검증 책임 Service 로 이전
        if (!user.equalsEmail(email) && userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("email is already exists.");
        }
        if (!user.equalsUsername(username) && userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("username is already exists.");
        }

        // 도메인 변경 (User 의 setter 가 null/blank skip 정책 보장)
        user.setEmail(email);
        user.setUsername(username);
        user.encryptPassword(passwordEncoder, password);
        user.setBio(bio);
        user.setImageUrl(imageUrl);

        //  F-058 동일 fix: race window catch (updateUserDetails 도 동일 위험)
        try {
            return userRepository.save(user);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("email or username is already exists.", ex);
        }
    }

    public User getUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("user not found."));
    }

    public User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("user not found."));
    }
}
