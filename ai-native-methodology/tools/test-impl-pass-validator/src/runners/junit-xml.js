// JUnit5 / Maven Surefire / Gradle JUnit XML adapter.
// XML schema: <testsuites> { tests, failures, errors, skipped, <testsuite> { tests, ... <testcase name=... classname=... > [<failure>|<error>|<skipped>] } } }
// 외부 의존성 ❌ — 본 도구는 단순 정규식 기반 파싱 (Junit XML format 안정 + 표준).

export const FRAMEWORK = 'junit5';

// Note: 본 파서는 단순 case 만 지원 (testsuite + testcase 1단 nested).
// 복잡한 multi-suite 는 production 진입 후 sax-parser 도입 carry.
export function parseJunitXml(xmlText) {
  const testcaseRe = /<testcase\s+([^>]+?)(?:\/>|>([\s\S]*?)<\/testcase>)/g;
  const attrRe = /(\w+)="([^"]*)"/g;
  const test_names = [];
  const tests = [];  // ★ F-I05 — per-test {name,status} (S2 correlateByTcId 용 / additive).
  let pass_count = 0;
  let fail_count = 0;
  let skip_count = 0;

  let m;
  while ((m = testcaseRe.exec(xmlText)) !== null) {
    const attrs = {};
    let am;
    const attrStr = m[1];
    while ((am = attrRe.exec(attrStr)) !== null) {
      attrs[am[1]] = am[2];
    }
    const inner = m[2] ?? '';

    const fullName = (attrs.classname ?? '') + (attrs.classname ? '.' : '') + (attrs.name ?? '');

    let status;
    if (/<failure\b/.test(inner) || /<error\b/.test(inner)) {
      fail_count++;
      status = 'fail';
    } else if (/<skipped\b/.test(inner)) {
      skip_count++;
      status = 'skip';
    } else {
      pass_count++;
      status = 'pass';
    }
    if (fullName) {
      test_names.push(fullName);
      tests.push({ name: fullName, status });
    }
  }

  // top-level <testsuites tests="N" failures="M" .../> 가 있으면 cross-check (single source of truth)
  const summaryRe = /<testsuites?\s+([^>]+?)(?:\/>|>)/;
  const summaryMatch = summaryRe.exec(xmlText);
  if (summaryMatch) {
    const sa = {};
    let am;
    while ((am = attrRe.exec(summaryMatch[1])) !== null) sa[am[1]] = am[2];
    if (sa.tests !== undefined) {
      // 만약 testcase 합산과 다르면 testsuite 의 attribute 우선 (★ XML metadata 가 ground truth)
      const total = Number(sa.tests);
      const f = Number(sa.failures ?? 0);
      const e = Number(sa.errors ?? 0);
      const s = Number(sa.skipped ?? 0);
      if (Number.isFinite(total)) {
        return {
          framework: FRAMEWORK,
          pass_count: Math.max(0, total - f - e - s),
          fail_count: f + e,
          skip_count: s,
          total,
          test_names,
          tests,
          success: f === 0 && e === 0 && total > 0,
        };
      }
    }
  }

  return {
    framework: FRAMEWORK,
    pass_count,
    fail_count,
    skip_count,
    total: pass_count + fail_count + skip_count,
    test_names,
    tests,
    success: fail_count === 0 && (pass_count + skip_count) > 0,
  };
}

export function buildArgs(testCmdArgs = []) {
  // mvn / gradle 모두 표준 surefire / gradle XML 산출 자동화 — 추가 인자 없음.
  return [...testCmdArgs];
}
