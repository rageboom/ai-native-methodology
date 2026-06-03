// prompt-node-match.test.js — ★ 의도③ NL 라우팅 코어 (_shared/prompt-node-match.js) 단위 test.
//   matchPromptToNodes (결정론 substring 매칭) + isConfidentTop (tie/약매칭 degrade) 검증.
//   ★ 거동 동결 증명 (Senior must-fix #3): includeTitle:false → title 보유 노드서도 title 매칭 0
//      (federator resolvePromptToNodes 무회귀 = 같은 후보 + includeTitle:false).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { matchPromptToNodes, isConfidentTop, STRONG_MATCH_THRESHOLD } from '../../_shared/prompt-node-match.js';

const NODES = [
  { id: 'BHV-USER-001', state: 'active', title: '회원가입', code_pointers: [{ path: 'src/user/SignupService.kt', symbol: 'checkDuplicate' }] },
  { id: 'UC-USER-001', state: 'active', title: '회원가입' },
  { id: 'AC-USER-001', state: 'active', title: '회원가입 성공' },
  { id: 'BHV-ARTICLE-001', state: 'active', title: '게시글 작성' },
  { id: 'TASK-USER-002', state: 'propose', title: '회원가입' }, // 후보는 호출부 선별 — 매처는 받은 것만
];

describe('matchPromptToNodes (_shared / 결정론)', () => {
  it('id 전체 언급 = +5 최상위', () => {
    const r = matchPromptToNodes('BHV-USER-001 바꾸려는데', NODES);
    assert.equal(r[0].node_id, 'BHV-USER-001');
    assert.equal(r[0].score, 5);
    assert.ok(r[0].matched.includes('id:BHV-USER-001'));
  });

  it('symbol 언급 = +3', () => {
    const r = matchPromptToNodes('checkDuplicate 로직 변경', NODES);
    assert.equal(r[0].node_id, 'BHV-USER-001');
    assert.ok(r[0].matched.some((m) => m.startsWith('symbol:')));
  });

  it('file stem 언급 = +2', () => {
    const r = matchPromptToNodes('signupservice 수정', NODES);
    assert.ok(r.some((m) => m.node_id === 'BHV-USER-001' && m.matched.some((x) => x.startsWith('file:'))));
  });

  it('★ includeTitle:false → title 보유 노드서도 title 매칭 0 (거동 동결 / federator 무회귀)', () => {
    const r = matchPromptToNodes('회원가입', NODES, { includeTitle: false });
    assert.deepEqual(r, []); // title 만 일치하는데 includeTitle off → 빈 결과
  });

  it('includeTitle:true → title substring 매칭 +2 (매처는 받은 후보 전부 / state 필터=호출부 책임)', () => {
    const r = matchPromptToNodes('회원가입', NODES, { includeTitle: true });
    const ids = r.map((x) => x.node_id).sort();
    // title="회원가입" = BHV/UC/TASK(propose 도 받았으니 매칭 — state 필터는 navigate 호출부가 함).
    // AC title="회원가입 성공"은 prompt substring 아님 → 제외.
    assert.deepEqual(ids, ['BHV-USER-001', 'TASK-USER-002', 'UC-USER-001']);
    assert.ok(r.every((x) => x.score === 2));
  });

  it('빈/공백 prompt = 빈 결과', () => {
    assert.deepEqual(matchPromptToNodes('', NODES, { includeTitle: true }), []);
    assert.deepEqual(matchPromptToNodes('   ', NODES, { includeTitle: true }), []);
  });

  it('동점 = node_id asc 결정론 정렬', () => {
    const r = matchPromptToNodes('회원가입', NODES, { includeTitle: true });
    assert.equal(r[0].node_id, 'BHV-USER-001'); // BHV < UC
  });

  it('matched 식별자 없는 산문 = 빈 결과 (동의어/임베딩 ❌)', () => {
    assert.deepEqual(matchPromptToNodes('화면이 깨졌어요', NODES, { includeTitle: true }), []);
  });
});

describe('isConfidentTop (tie/약매칭 degrade / Senior must-fix #1)', () => {
  it('strong + unique = confident', () => {
    assert.equal(isConfidentTop([{ node_id: 'A', score: 5 }, { node_id: 'B', score: 2 }]), true);
  });
  it('tie (동점 top) = not confident', () => {
    assert.equal(isConfidentTop([{ node_id: 'A', score: 3 }, { node_id: 'B', score: 3 }]), false);
  });
  it('약매칭 (top.score < threshold) = not confident', () => {
    assert.equal(isConfidentTop([{ node_id: 'A', score: 2 }]), false);
    assert.equal(STRONG_MATCH_THRESHOLD, 3);
  });
  it('빈 = not confident', () => {
    assert.equal(isConfidentTop([]), false);
  });
});
