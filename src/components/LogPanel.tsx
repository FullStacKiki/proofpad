import type { CompileError } from '../lib/log';

interface Props {
  errors: CompileError[];
  open: boolean;
  buildTime: string;
  onToggle(): void;
  onJump(line: number): void;
}

export function LogPanel({ errors, open, buildTime, onToggle, onJump }: Props) {
  const n = errors.length;
  return (
    <div className="log">
      <div className="log-head" onClick={onToggle}>
        <span className={`chev ${open ? 'open' : ''}`} />
        <span className="bang">!</span>
        <b>
          {n} Error{n === 1 ? '' : 's'}
        </b>
        <span className="grow" />
        <span className="muted">Compile log · {buildTime}</span>
      </div>
      {open && (
        <div className="log-rows">
          {errors.map((e, i) => (
            <div
              key={i}
              className="log-row"
              style={{ cursor: e.line ? 'pointer' : 'default' }}
              onClick={() => e.line && onJump(e.line)}
            >
              <span className="log-line">{e.line ? `Line ${e.line}` : 'Error'}</span>
              <span className="log-msg">{e.msg}</span>
              <span />
              <span className="log-ctx">{e.ctx}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
