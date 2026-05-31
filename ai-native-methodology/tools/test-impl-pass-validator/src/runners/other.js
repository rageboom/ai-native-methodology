// `other` framework — stdout regex fallback (test-cmd.json.stdout_parser 의무).
// 사용자가 명시한 pass/fail/skip regex 로 stdout 파싱.

export const FRAMEWORK = 'other';

export function parseStdout(stdoutText, parser) {
  if (!parser) {
    throw new Error('other adapter — stdout_parser 의무 (test-cmd.json schema if/then 강제)');
  }

  // count_mode (★ T16): 'capture'(default) = group 1 의 숫자 / 'occurrences' = global match 횟수.
  //   occurrences = per-test 라인(go `--- PASS:` 등 / 집계 카운트 라인 부재 framework)을 정직 집계.
  const mode = parser.count_mode;
  const extract = (regexStr) => {
    if (!regexStr) return 0;
    try {
      if (mode === 'occurrences') {
        const matches = stdoutText.match(new RegExp(regexStr, 'gm'));
        return matches ? matches.length : 0;
      }
      const m = stdoutText.match(new RegExp(regexStr));
      return m && m[1] ? Number(m[1]) : 0;
    } catch {
      return 0;
    }
  };

  const pass_count = extract(parser.pass_regex);
  const fail_count = extract(parser.fail_regex);
  const skip_count = extract(parser.skip_regex);

  let test_names = [];
  if (parser.test_name_regex) {
    try {
      const re = new RegExp(parser.test_name_regex, 'gm');
      let m;
      while ((m = re.exec(stdoutText)) !== null) {
        if (m[1]) test_names.push(m[1]);
      }
    } catch {/* ignore regex errors */}
  }

  return {
    framework: FRAMEWORK,
    pass_count,
    fail_count,
    skip_count,
    total: pass_count + fail_count + skip_count,
    test_names,
    success: fail_count === 0 && pass_count > 0,
  };
}
