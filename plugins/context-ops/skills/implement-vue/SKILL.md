---
name: implement-vue
description: Use when chain 5 impl generation for Vue 3 SFC. Reads test-spec + behavior-spec + acceptance-criteria, generates .vue files (Composition API + <script setup> default). Track = FE. Vue 3 only (Vue 2 legacy = carry). Vue Test Utils 2.x 통합 + vitest GREEN 100% pass 의무.
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
---

# implement-vue — Vue 3 SFC impl 생성 (chain 5 FE 트랙)

`implement-generate-impl-spec` 의 FE-Vue 분기 위임. Vue 3 Composition API paradigm.

> **단일 책임**: Vue 3 SFC impl 생성. React/BE 는 각각 별도 skill.

## 사전 조건

- chain 4 (test) 종결 + gate #4 go 결단 후
- inventory.json 안 Vue 3 stack signals (`vue` ≥ 3.0 / `@vue/test-utils` 2.x)
- test-spec.json 의 TC-\* 중 Vue Test Utils pattern 검출

## 입력

- `<project>/.ai-context/base/test-spec.json`
- `<project>/.ai-context/base/behavior-spec.json`
- `<project>/.ai-context/base/acceptance-criteria.json`
- `<project>/.ai-context/base/shared/inventory.json`
- `<project>/package.json` (vue 버전 확인 / 3.x 의무)

## 산출물

- `src/**/*.vue` (SFC)
- `src/**/*.composable.ts` (composable 분리 시)
- `<project>/.ai-context/base/impl-spec.json` (FE 트랙 entry / framework 버전은 `modules[].framework: "vue-3"` — schema modules.items.framework 필드)

## paradigm (Vue 3 only / 2026-05-15 사용자 결단)

### 1. Composition API + `<script setup>` 우선 (default)

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

defineProps<{ initialEmail?: string }>();
const emit = defineEmits<{ submit: [email: string, password: string] }>();

const email = ref('');
const password = ref('');
const isValid = computed(
	() => email.value.includes('@') && password.value.length >= 8,
);

async function handleSubmit() {
	if (isValid.value) emit('submit', email.value, password.value);
}
</script>

<template>
	<form @submit.prevent="handleSubmit">
		<input v-model="email" type="email" />
		<input v-model="password" type="password" />
		<button type="submit" :disabled="!isValid">Login</button>
	</form>
</template>
```

### 2. Options API legacy 분기 (본문 분기만 / 디렉토리 분리 ❌)

legacy Vue 3 + Options API 케이스 = 본문 분기 시 명시:

```vue
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
	data() {
		return { email: '', password: '' };
	},
	methods: {
		handleSubmit() {
			/* ... */
		},
	},
});
</script>
```

### 3. composable 분리

reusable logic = `src/composables/useLogin.ts`:

```ts
import { ref, computed } from 'vue';
export function useLogin() {
  const email = ref('');
  const password = ref('');
  const isValid = computed(() => /* ... */);
  return { email, password, isValid };
}
```

### 4. Vue 2 legacy = carry (본 skill scope 외)

Vue 2 Options API + filter + Vue.extend 패턴 = 본 skill ❌ / 별도 carry skill (`implement-vue-2`) — 사용자 결단 후 진행.

## 절차

1. **vue 버전 확인** — `package.json` 의 `dependencies.vue` ≥ "3.0.0" 의무. 2.x 시 state.blocked + 사용자 안내 (Vue 2 carry).
2. **test-spec 의 Vue Test Utils TC-\* filter** — `source_file` path 분석 → SFC path 매핑 (예: `src/auth/LoginForm.test.ts` → `src/auth/LoginForm.vue`).
3. **SFC generate** — Gherkin → template + script setup + style 매핑.
4. **composable generate** — reusable logic = `src/composables/use*.ts`.
5. **commit_hash 채움** — `implement-generate-impl-spec` §4 동일 paradigm.
6. **vitest 진짜 호출** — `npx vitest run` (사용자 명시 / auto-invoke ❌). 100% pass GREEN 의무.
7. **impl-spec.json `modules[].framework` 에 `"vue-3"` 명시** (schema modules.items.framework 기존 필드 / top-level vue_version ❌ = additionalProperties:false reject).

## GREEN 의무

- 모든 Vue Test Utils + vitest test 100% pass
- fail 발생 시 revisit cycle (test/spec/planning)

## 70~80% 한계 명시

원칙 + 두 axis → `methodology-spec/policies/automation-boundary.md`.

자동 generate ≥ 80% / 사용자 검토 ≤ 20% (composition vs options 결단 / composable 추출 / Pinia store 통합 등).

## 본체 명세 참조

- `methodology-spec/plugin-charter.md` §1 R14 + §3 G4
- `skills/implement-generate-impl-spec/SKILL.md` (본 skill 의 BE sibling)
- `skills/implement-react/SKILL.md` (FE React sibling)
- Vue 3 공식: https://vuejs.org/

## When NOT to invoke

- Vue 2 — `implement-vue-2` carry 또는 사용자 명시 (본 skill ❌)
- React / Svelte / Solid — 각각 별도 skill
- BE impl — `implement-generate-impl-spec` 본문 분기
- LLM auto-invoke `npx vitest` ❌ (사용자 명시 의무)
