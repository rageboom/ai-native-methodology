// Semgrep test fixture for rules/jwt-localstorage.yml.
// 실행: semgrep --test ai-native-methodology/tools/static-runner/rules/
// 형식 — Semgrep testing-rules 페이지 참고 (https://semgrep.dev/docs/writing-rules/testing-rules/).

const t: string = "x";
const v: string = "x";
const TOKEN_STORAGE_KEY = "auth.token";
const value: string = "x";
const json: string = "{}";

// ruleid: internal.fe.security.jwt-localstorage
localStorage.setItem("token", t);

// ruleid: internal.fe.security.jwt-localstorage
localStorage.setItem("jwtKey", v);

// ruleid: internal.fe.security.jwt-localstorage
localStorage.setItem(TOKEN_STORAGE_KEY, value);

// ruleid: internal.fe.security.jwt-localstorage
localStorage.setItem("authToken", t);

// ruleid: internal.fe.security.jwt-localstorage
localStorage.setItem("bearer", t);

// ruleid: internal.fe.security.jwt-localstorage
window.localStorage.setItem("token", t);

// ruleid: internal.fe.security.jwt-localstorage
window.localStorage.setItem(TOKEN_STORAGE_KEY, value);

// ok: internal.fe.security.jwt-localstorage
localStorage.setItem("preferences", json);

// ok: internal.fe.security.jwt-localstorage
localStorage.setItem("theme", "dark");

// ok: internal.fe.security.jwt-localstorage
sessionStorage.setItem("token", t);
