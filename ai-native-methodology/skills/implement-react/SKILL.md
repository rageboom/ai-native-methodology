---
name: implement-react
description: Use when chain 4 impl generation for React 19 components / hooks / contexts. Reads test-spec + behavior-spec + acceptance-criteria, generates React component files (.tsx/.jsx) following React 19 paradigm (forwardRef deprecated / ref prop direct / class component 분기 보존). Track = FE. RTL test 100% pass GREEN 의무.
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
---

# implement-react — React 19 컴포넌트/hook impl 생성 (chain 4 FE 트랙)

`implement-generate-impl-spec` 의 FE-React 분기 위임. React 19 paradigm + RTL 통합.

> **단일 책임**: React 19 컴포넌트/hook/context impl 생성. BE impl (nestjs/spring/fastapi) 은 `implement-generate-impl-spec` 본문 분기.

## 사전 조건

- chain 3 (test) 종결 + gate #3 go 결단 후
- inventory.json 안 React 19 / Tailwind / TanStack 같은 stack signals 검출
- test-spec.json 의 TC-* 중 `framework: "jest"` 또는 `"vitest"` + RTL pattern 검출

## 입력

- `<project>/.aimd/output/test-spec.json` (TC-* + source_file path)
- `<project>/.aimd/output/behavior-spec.json` (BHV-* contract)
- `<project>/.aimd/output/acceptance-criteria.json` (AC-* Gherkin)
- `<project>/.aimd/output/inventory.json` (stack signals)
- `<project>/package.json` (react 버전 확인 / 19.x 의무)

## 산출물

- `src/**/*.{tsx,jsx}` (component)
- `src/**/*.hook.ts` (custom hook)
- `src/**/*.context.tsx` (Context Provider)
- `<project>/.aimd/output/impl-spec.json` (FE 트랙 entry / framework 버전은 `modules[].framework: "react-19"` — schema modules.items.framework 필드)

## paradigm (★ React 19 / research 흡수)

### 1. ref paradigm
- **`forwardRef` deprecated** — React 19 부터 functional component 가 `ref` 일반 prop 으로 직접 받음
- `import { forwardRef }` ❌ / ESLint `no-forward-ref` rule 활성 권장
- **class component 분기 보존** — class 도 ref 전달 가능 (mechanism 다름 / class 폐기 ❌)

### 2. functional component default
```tsx
// React 19 paradigm — ref prop direct
type LoginFormProps = {
  ref?: React.Ref<HTMLFormElement>;
  onSubmit: (email: string, password: string) => Promise<void>;
};
export function LoginForm({ ref, onSubmit }: LoginFormProps) {
  return <form ref={ref}>{/* ... */}</form>;
}
```

### 3. React 19 신규 hooks 흡수
- **`useActionState`** — form action + pending state 통합 (서버 액션 / RSC 정합)
  ```tsx
  const [state, action, pending] = useActionState(loginAction, null);
  ```
- **`useOptimistic`** — 낙관적 UI 업데이트
- **`useFormStatus`** — `<form>` 안 child 가 pending/data 직접 read
- **`use()` API** — Promise + Context 조건부 read (Suspense 통합 / hooks rules 우회 가능)

### 4. 기존 hooks 시그니처 = 무변화
`useState` / `useEffect` / `useMemo` / `useCallback` — React 19 시그니처 동일. 단 React Compiler RC 도입 후 `useMemo`/`useCallback` 수동 사용 권장 약화.

## 절차

1. **react 버전 확인** — `package.json` 의 `dependencies.react` ≥ "19.0.0" 의무. 18.x 이하 시 사용자 안내 (`implement-react-18` 별도 carry skill 또는 사용자 명시).
2. **test-spec 의 RTL TC-* filter** — `source_file` path 분석 → component path 매핑 (예: `src/auth/LoginForm.test.tsx` → `src/auth/LoginForm.tsx`).
3. **컴포넌트 generate** — Gherkin Given/When/Then → JSX / hooks 매핑:
   - Given = props / context / initial state
   - When = event handler (onClick / onSubmit)
   - Then = rendered output / API call / state mutation
4. **hook generate** — reusable logic = `use*` 파일 (예: `src/auth/useLogin.ts`).
5. **Context Provider generate** — 전역 상태 = `src/contexts/Auth.context.tsx`.
6. **commit_hash 채움** — `implement-generate-impl-spec` §4 동일 paradigm.
7. **RTL test 진짜 호출** — `npx jest` 또는 `npx vitest` (사용자 명시 / auto-invoke ❌). 100% pass GREEN 의무 (fail_count = 0).
8. **impl-spec.json `modules[].framework` 에 `"react-19"` 명시** — drift-validator 추적용 (★ schema modules.items.framework 기존 필드 / top-level react_version ❌ = additionalProperties:false reject).

## GREEN 의무 (chain 4 종결 조건)

- 모든 RTL test 100% pass (test-impl-pass-validator ok=true / fail_count=0)
- fail 발생 시 revisit:test / revisit:spec / revisit:planning 결단

## 70~80% 한계 명시

자동 generate ≥ 80% (boilerplate / Gherkin 매칭 코드) / 사용자 검토 ≤ 20% (component composition / hook abstraction / performance).

## 본체 명세 참조

- `methodology-spec/plugin-charter.md` §1 R14 + §3 G4
- `skills/implement-generate-impl-spec/SKILL.md` (본 skill 의 BE sibling)
- `docs/adr/ADR-CHAIN-001-chain-4-stage-enforcement.md` §1 (이중 렌더링 chain 4) §3 (no-simulation)
- React 19 공식: https://react.dev/blog/2024/12/05/react-19

## When NOT to invoke

- React 18 이하 — `implement-react-18` 별도 carry 또는 사용자 명시 (forwardRef 패턴 차이)
- BE impl (Spring / NestJS / FastAPI 등) — `implement-generate-impl-spec` 본문 분기
- Vue / Svelte / Solid — 각각 `implement-vue` / `implement-svelte` (carry) 등
- LLM auto-invoke `npx jest` ❌ (사용자 명시 의무)
