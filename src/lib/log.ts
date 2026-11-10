export interface CompileError {
  /** 1-based line, 0 when the log gives none */
  line: number;
  msg: string;
  ctx: string;
}

/** Extract errors with line numbers from Tectonic output and the TeX .log file. */
export function parseLog(output: string, log: string): CompileError[] {
  const ctxFor = (line: number) => {
    const m = new RegExp(`^l\\.${line} (.*)$`, 'm').exec(log + '\n' + output);
    return m ? `l.${line} ${m[1].trim()}` : '';
  };
  const errs: CompileError[] = [];
  const seen = new Set<string>();
  const push = (line: number, msg: string) => {
    const key = `${line}:${msg}`;
    if (seen.has(key)) return;
    seen.add(key);
    errs.push({ line, msg, ctx: line ? ctxFor(line) : '' });
  };

  // Tectonic: "error: file.tex:35: Undefined control sequence"
  for (const l of output.split('\n')) {
    const m = /^error: (.+?):(\d+): (.*)$/.exec(l.trim());
    if (m) push(Number(m[2]), m[3]);
  }

  // TeX log: "! Undefined control sequence." followed by "l.35 ..."
  if (!errs.length) {
    const lines = log.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].startsWith('! ')) continue;
      const msg = lines[i].slice(2).trim();
      for (let j = i + 1; j < Math.min(i + 12, lines.length); j++) {
        const m = /^l\.(\d+) /.exec(lines[j]);
        if (m) {
          push(Number(m[1]), msg);
          break;
        }
      }
    }
  }

  // Nothing parseable: surface the raw error lines.
  if (!errs.length) {
    const raw = output.split('\n').filter((l) => /^error/i.test(l.trim()));
    const text = (raw.length ? raw : output.trim().split('\n').slice(-3)).join(' ').trim();
    push(0, text || 'Compilation failed.');
  }
  return errs.slice(0, 50);
}
