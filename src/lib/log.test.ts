import { describe, expect, it } from 'vitest';
import { parseLog } from './log';

describe('parseLog', () => {
  it('reads Tectonic "error: file:line: msg" lines and pulls context from the log', () => {
    const output = 'error: main.tex:12: Undefined control sequence\n';
    const log = 'blah\nl.12 \\foo\n';
    expect(parseLog(output, log)).toEqual([
      { line: 12, msg: 'Undefined control sequence', ctx: 'l.12 \\foo' },
    ]);
  });

  it('falls back to "! msg" + "l.N" pairs in the TeX log', () => {
    const log = '! Missing $ inserted.\n<inserted text>\nl.7 x^2\n';
    expect(parseLog('', log)).toEqual([{ line: 7, msg: 'Missing $ inserted.', ctx: 'l.7 x^2' }]);
  });

  it('dedupes repeated errors', () => {
    const output = 'error: a.tex:3: Boom\nerror: a.tex:3: Boom\n';
    expect(parseLog(output, '')).toHaveLength(1);
  });

  it('surfaces raw output when nothing is parseable', () => {
    expect(parseLog('error: something odd\n', '')).toEqual([{ line: 0, msg: 'error: something odd', ctx: '' }]);
    expect(parseLog('', '')[0].msg).toBe('Compilation failed.');
  });
});
