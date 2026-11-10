import { useEffect, useMemo, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { ALL, GROUPS, filterCatalog, type Sym } from '../lib/catalog';

interface Props {
  canInsert: boolean;
  onClose(): void;
  onInsert(text: string, cursor?: number): void;
}

function Glyph({ s }: { s: Sym }) {
  if (s.html) return <span className="sym-html" dangerouslySetInnerHTML={{ __html: s.html }} />;
  const tex = s.tex ?? (s.group === 'Math symbols' ? s.cmd : '');
  if (!tex) return null;
  let html = '';
  try {
    html = katex.renderToString(tex, { throwOnError: false, output: 'html' });
  } catch {
    return <span>{s.u ?? s.cmd}</span>;
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function SymbolSheet({ canInsert, onClose, onInsert }: Props) {
  const [q, setQ] = useState('');
  const [hl, setHl] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const [cat, setCat] = useState(ALL);
  const items = useMemo(() => filterCatalog(q, cat), [q, cat]);
  const cats = useMemo(() => [ALL, ...GROUPS.flatMap((g) => g.cats)], []);

  useEffect(() => setHl(0), [q, cat]);
  useEffect(() => {
    list.current?.querySelector('.hl')?.scrollIntoView({ block: 'nearest' });
  }, [hl, items]);

  const copy = (s: Sym) => {
    void navigator.clipboard.writeText(s.cmd);
    onClose();
  };
  const choose = (s: Sym) => {
    if (!canInsert) return copy(s);
    onInsert(s.cmd, s.cursor);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const cur = items[hl];
    if (e.key === 'Tab') {
      e.preventDefault();
      const i = cats.indexOf(cat);
      setCat(cats[(i + (e.shiftKey ? cats.length - 1 : 1)) % cats.length]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHl((h) => Math.min(h + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHl((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (cur) choose(cur);
    } else if (e.metaKey && e.key.toLowerCase() === 'c' && cur && e.currentTarget.selectionStart === e.currentTarget.selectionEnd) {
      e.preventDefault();
      copy(cur);
    }
  };

  let lastCat = '';
  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet sym">
        <div className="sym-search">
          <input
            autoFocus
            spellCheck={false}
            autoComplete="off"
            placeholder="Search: forall, per ogni, ∀, bold, grassetto, tabella…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>
        <div className="sym-body">
          <div className="sym-side">
            {[ALL].map((c) => (
              <div key={c} className={`sym-tab ${cat === c ? 'on' : ''}`} onMouseDown={(e) => (e.preventDefault(), setCat(c))}>
                {c}
              </div>
            ))}
            {GROUPS.map((g) => (
              <div key={g.group}>
                <div className="sym-cat">{g.group}</div>
                {g.cats.map((c) => (
                  <div key={c} className={`sym-tab ${cat === c ? 'on' : ''}`} onMouseDown={(e) => (e.preventDefault(), setCat(c))}>
                    {c}
                  </div>
                ))}
              </div>
            ))}
          </div>
        <div className="sym-list" ref={list}>
            {items.length === 0 && <div className="sym-empty">No matching symbols</div>}
            {items.map((s, i) => {
              const head = s.cat !== lastCat ? <div className="sym-cat">{s.cat}</div> : null;
              lastCat = s.cat;
              return (
                <div key={s.cat + s.cmd + s.name}>
                  {head}
                  <div className={`sym-row ${i === hl ? 'hl' : ''}`} onMouseMove={() => setHl(i)} onClick={() => choose(s)}>
                    <span className="sym-glyph">
                      <Glyph s={s} />
                    </span>
                    <span className="sym-name">{s.name}{s.desc && <span className="sym-desc">{s.desc}</span>}</span>
                    <span className="sym-cmd">{s.show ?? s.cmd.split('\n')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="sym-foot">
          <span>↵ insert</span>
          <span>⌘C copy</span>
          <span>⇥ category</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
