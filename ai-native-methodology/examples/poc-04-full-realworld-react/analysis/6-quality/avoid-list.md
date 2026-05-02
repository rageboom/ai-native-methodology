# avoid-list.md — PoC #04 full Stage 5 antipatterns 회피 가이드

> ★ 6 antipattern (high 1 / serious 1 / medium 3 / low 1)
> 일자: 2026-05-02 (Sprint 5-3)

---

## ★ ★ ★ 본체 격상 후보 (★ G4 strict 임계 도달 ≥ 3)

### AP-FE-SECURITY-JWT-LOCALSTORAGE (high)

★ ★ ★ ★ **4 PoC isomorphic** — JWT 토큰 보안 패턴 위험:
- PoC #01 Spring Boot 2.5: AP-SECURITY-001 critical (21byte secret)
- PoC #02 Hexagonal: RSA private key git commit critical
- PoC #03 NestJS: Bearer JWT (positive 학습 효과)
- **PoC #04 full React FSD**: localStorage XSS 노출 surface

→ ★ ★ ★ **신규 시스템 구축 시**:
- httpOnly cookie + CSRF token (★ BE 협조 의무)
- short-lived access token (5min) + refresh token (httpOnly)
- 강한 CSP (script-src 제한)
- ★ ★ localStorage JWT 저장 ❌ 절대

### AP-FE-OPTIMISTIC-INCONSISTENT (medium)

★ 3 컴포넌트 isomorphic — Optimistic update 코드 중복.

→ ★ shared/ui/FavoriteButton 추상화 의무 / 페이지별 중복 ❌

---

## ★ G4 candidate (carry / adoption 합산 시 격상)

- AP-FE-FOLLOW-INCONSISTENT (2 components)
- AP-FE-EDITOR-MISSING-HTML5-VALIDATION (1 PoC / Editor 만)
- AP-FE-A11Y-HTML-LANG-MISSING (1 fork / 8 page isomorphic root)
- AP-FE-FLOW-INCOMPLETE-ARTICLE-DELETE (1 PoC / Stage 4 carry)

---

## ★ 회피 우선순위 (사내 적용 시)

1. ★ ★ ★ JWT localStorage 절대 ❌ → httpOnly cookie
2. ★ ★ Optimistic update 추상화 ★ shared/ui/ 컴포넌트
3. ★ Editor + 모든 form HTML5 native required 일관 적용
4. ★ <html lang="..."> 강제 (★ index.html template)
5. ★ delete 액션 후 redirect 의무 명시
6. ★ Follow/Favorite 토글 패턴 추상화
