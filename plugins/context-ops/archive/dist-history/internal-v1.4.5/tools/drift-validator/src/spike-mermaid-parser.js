#!/usr/bin/env node
// Sprint 4 Phase B — 30분 spike
// 목적: @mermaid-js/parser v1.x 가 stateDiagram-v2 / sequenceDiagram 두 grammar 를 실제 지원하는지 확인.
// 결과 미지원 시: zabaca/mermaid-validate 위탁 또는 정규식 fallback 결정.

import { parse } from '@mermaid-js/parser';

const stateMachineSample = `stateDiagram-v2
    [*] --> Anonymous
    Anonymous --> Registered: signup (email, username, password)
    Registered --> Authenticated: login (BCrypt match)
    Authenticated --> Registered: logout
    Authenticated --> [*]: account close
`;

const sequenceSample = `sequenceDiagram
    actor User
    participant API as UserController
    participant Service as UserService
    participant DB as UserRepository

    User->>API: POST /api/users (email, username, password)
    API->>Service: signup(request)
    Service->>DB: existsByEmailOrUsername()
    DB-->>Service: false
    Service->>DB: save(user)
    DB-->>Service: persisted
    Service-->>API: UserResponse
    API-->>User: 201 Created
`;

async function tryParse(label, diagramType, text) {
  process.stdout.write(`[spike] ${label} (parse('${diagramType}', ...)) — `);
  try {
    const ast = parse(diagramType, text);
    const summary = ast ? Object.keys(ast).slice(0, 5).join(',') : '(empty)';
    console.log(`✅ OK — top-keys: ${summary}`);
    return { ok: true, ast };
  } catch (err) {
    console.log(`❌ FAIL — ${err?.message ?? err}`);
    return { ok: false, error: String(err?.message ?? err) };
  }
}

const results = {
  parser_version: '@mermaid-js/parser ^1.1.0',
  node_version: process.version,
  state_machine: await tryParse('stateDiagram-v2', 'stateDiagram', stateMachineSample),
  sequence: await tryParse('sequenceDiagram', 'sequenceDiagram', sequenceSample),
};

const stateOk = results.state_machine.ok;
const seqOk = results.sequence.ok;

console.log('\n[spike] === RESULT ===');
console.log(`stateDiagram-v2 grammar  : ${stateOk ? '✅ supported' : '❌ unsupported'}`);
console.log(`sequenceDiagram grammar  : ${seqOk ? '✅ supported' : '❌ unsupported'}`);

let decision;
if (stateOk && seqOk) {
  decision = 'A — @mermaid-js/parser 직접 사용 (두 grammar 모두 지원)';
} else if (stateOk || seqOk) {
  decision = `B — 부분 지원 (state=${stateOk}, seq=${seqOk}) → 미지원 grammar 만 정규식 fallback`;
} else {
  decision = 'C — 두 grammar 모두 미지원 → @zabaca/mermaid-validate 위탁 또는 정규식 fallback';
}
console.log(`\n[spike] decision        : ${decision}`);
console.log('[spike] full results JSON below:');
console.log(JSON.stringify(results, null, 2));
