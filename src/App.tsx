import { useCallback, useEffect, useRef, useState } from 'react';
import { open as openDialog, save as saveDialog } from '@tauri-apps/plugin-dialog';
import { Editor, type EditorHandle } from './components/Editor';
import { Preview } from './components/Preview';
import { LogPanel } from './components/LogPanel';
import { SymbolSheet } from './components/SymbolSheet';
import { listen } from '@tauri-apps/api/event';
import { TemplateSheet } from './components/TemplateSheet';
import { basename, compile, copyFile, dirname, readBytes, readText, writeText } from './lib/api';
import { parseLog, type CompileError } from './lib/log';
import { applyTheme, THEMES } from './lib/themes';
import { loadPref, loadRecents, pushRecent, savePref, type Recent } from './lib/recents';

type Status = 'idle' | 'compiling' | 'success' | 'error' | 'edited';
interface Doc {
  path: string;
  name: string;
  folder: string;
}

const DEBOUNCE_MS = 800;
const hhmm = () => new Date().toTimeString().slice(0, 5);

function recentDate(t: number) {
  const d = new Date(t);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return `Today, ${d.toTimeString().slice(0, 5)}`;
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function useMaxWidth(px: number) {
  const q = `(max-width: ${px}px)`;
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const f = () => setM(mq.matches);
    f();
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, [q]);
  return m;
}

export default function App() {
  const [doc, setDoc] = useState<Doc | null>(null);
  const [initial, setInitial] = useState('');
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<CompileError[]>([]);
  const [logOpen, setLogOpen] = useState(true);
  const [buildTime, setBuildTime] = useState('');
  const [dur, setDur] = useState('');
  const [pdf, setPdf] = useState<{ bytes: Uint8Array; v: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [auto, setAuto] = useState<boolean>(() => loadPref('auto', true));
  const [vimOn, setVimOn] = useState<boolean>(() => loadPref('vim', false));
  const [theme, setTheme] = useState<string>(() => loadPref('theme', 'system'));
  const [acOn, setAcOn] = useState<boolean>(() => loadPref('autocomplete', false));
  const [menuOpen, setMenuOpen] = useState(false);
  const narrow = useMaxWidth(899);
  const [ratio, setRatio] = useState(0.5);
  const [dragging, setDragging] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [symbols, setSymbols] = useState(false);
  const [recents, setRecents] = useState<Recent[]>(() => loadRecents());
  const [openErr, setOpenErr] = useState('');

  const docRef = useRef<Doc | null>(null);
  const textRef = useRef('');
  const autoRef = useRef(auto);
  const pdfPathRef = useRef<string | null>(null);
  const [toast, setToast] = useState('');
  const busy = useRef(false);
  const queued = useRef(false);
  const timer = useRef<number>(0);
  const ver = useRef(0);
  const editor = useRef<EditorHandle>(null);
  const body = useRef<HTMLDivElement>(null);
  autoRef.current = auto;
  useEffect(() => applyTheme(theme), [theme]);

  const compileNow = useCallback(async () => {
    const d = docRef.current;
    if (!d) return;
    window.clearTimeout(timer.current);
    if (busy.current) {
      queued.current = true;
      return;
    }
    busy.current = true;
    setStatus('compiling');
    try {
      const text = textRef.current;
      await writeText(d.path, text);
      if (textRef.current === text) setDirty(false);
      const r = await compile(d.path);
      if (docRef.current?.path !== d.path) return;
      setBuildTime(hhmm());
      setDur((r.durationMs / 1000).toFixed(1) + ' s');
      if (r.ok && r.pdfPath) {
        const bytes = await readBytes(r.pdfPath);
        pdfPathRef.current = r.pdfPath;
        setErrors([]);
        setPdf({ bytes, v: ++ver.current });
        setStatus('success');
      } else {
        setErrors(parseLog(r.output, r.log));
        setLogOpen(true);
        setStatus('error');
      }
    } catch (e) {
      setErrors([{ line: 0, msg: String(e), ctx: '' }]);
      setLogOpen(true);
      setStatus('error');
    } finally {
      busy.current = false;
      if (queued.current) {
        queued.current = false;
        void compileNow();
      }
    }
  }, []);

  const openPath = useCallback(
    async (path: string) => {
      try {
        const text = await readText(path);
        const d = { path, name: basename(path), folder: basename(dirname(path)) };
        window.clearTimeout(timer.current);
        docRef.current = d;
        textRef.current = text;
        setInitial(text);
        setDoc(d);
        setDirty(false);
        setPdf(null);
        pdfPathRef.current = null;
        setErrors([]);
        setStatus('idle');
        setSheet(false);
        setOpenErr('');
        setRecents(pushRecent(path));
        void compileNow();
      } catch (e) {
        setOpenErr(`Could not open ${basename(path)}: ${e}`);
      }
    },
    [compileNow],
  );

  const goHome = useCallback(async () => {
    const d = docRef.current;
    if (!d) return;
    window.clearTimeout(timer.current);
    try {
      await writeText(d.path, textRef.current);
    } catch {
      /* keep going: the editor text is not lost if the write fails, but we are leaving it */
    }
    docRef.current = null;
    setDoc(null);
    setDirty(false);
    setPdf(null);
        pdfPathRef.current = null;
    setErrors([]);
    setStatus('idle');
    setRecents(loadRecents());
  }, []);

  const exportPdf = useCallback(async () => {
    const d = docRef.current;
    const from = pdfPathRef.current;
    if (!d || !from) return;
    try {
      const to = await saveDialog({
        defaultPath: `${dirname(d.path)}/${d.name.replace(/\.tex$/, '')}.pdf`,
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
      });
      if (!to) return;
      await copyFile(from, to);
      setToast(`Saved ${basename(to)}`);
    } catch (e) {
      setToast(`Could not save PDF: ${e}`);
    }
    window.setTimeout(() => setToast(''), 3000);
  }, []);

  const openFile = useCallback(async () => {
    const p = await openDialog({ multiple: false, filters: [{ name: 'LaTeX', extensions: ['tex'] }] });
    if (typeof p === 'string') void openPath(p);
  }, [openPath]);

  const onChange = useCallback(
    (text: string) => {
      textRef.current = text;
      setDirty(true);
      window.clearTimeout(timer.current);
      if (autoRef.current) timer.current = window.setTimeout(() => void compileNow(), DEBOUNCE_MS);
      else setStatus((s) => (s === 'compiling' ? s : 'edited'));
    },
    [compileNow],
  );

  // Cmd+S / Cmd+O / Cmd+N
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (e.shiftKey) {
        if (k === 's') {
          e.preventDefault();
          void exportPdf();
        }
        return;
      }
      if (k === 's') {
        e.preventDefault();
        void compileNow();
      } else if (k === 'o') {
        e.preventDefault();
        void openFile();
      } else if (k === 'n') {
        e.preventDefault();
        setSheet(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [compileNow, openFile, exportPdf]);

  // Option+G / Help > Symbol Reference. Matched on the physical key, since Option+G types "©".
  useEffect(() => {
    const toggle = () => setSymbols((o) => !o);
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && !e.metaKey && !e.ctrlKey && e.code === 'KeyG') {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }
    };
    window.addEventListener('keydown', onKey, true);
    const un = listen('open-symbols', toggle).catch(() => () => {});
    return () => {
      window.removeEventListener('keydown', onKey, true);
      void un.then((f) => f());
    };
  }, []);

  // Divider drag
  useEffect(() => {
    if (!dragging) return;
    const move = (e: MouseEvent) => {
      const r = body.current?.getBoundingClientRect();
      if (r) setRatio(Math.min(0.75, Math.max(0.25, (e.clientX - r.left) / r.width)));
    };
    const up = () => setDragging(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [dragging]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !(e.target as Element).closest('.overflow-wrap')) setMenuOpen(false);
    };
    window.addEventListener('mousedown', close);
    window.addEventListener('keydown', close);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('keydown', close);
    };
  }, [menuOpen]);
  useEffect(() => {
    if (!narrow) setMenuOpen(false);
  }, [narrow]);

  const nErr = errors.length;
  const st = !doc
    ? { label: 'No Document', detail: '', dot: 'var(--text3)', dc: '' }
    : status === 'compiling'
      ? { label: `Compiling ${doc.name}…`, detail: '', dot: '', dc: '' }
      : status === 'success'
        ? { label: 'Build Succeeded', detail: `${dur} · ${buildTime}`, dot: 'var(--green)', dc: '' }
        : status === 'error'
          ? { label: 'Build Failed', detail: `${nErr} error${nErr === 1 ? '' : 's'}`, dot: 'var(--red)', dc: 'var(--redText)' }
          : status === 'edited'
            ? { label: 'Not Compiled', detail: '⌘S to compile', dot: 'var(--text3)', dc: '' }
            : { label: 'Ready', detail: '', dot: 'var(--text3)', dc: '' };

  const time = status === 'success' || status === 'error' ? buildTime : '';
  const toggles = [
    { label: 'Vim', on: vimOn, flip: () => (setVimOn(!vimOn), savePref('vim', !vimOn)) },
    { label: 'Autocomplete', on: acOn, flip: () => (setAcOn(!acOn), savePref('autocomplete', !acOn)) },
    { label: 'Auto-compile', on: auto, flip: () => (setAuto(!auto), savePref('auto', !auto)) },
  ];
  const themeSelect = (
    <select
      className="theme-select"
      title="Theme"
      value={theme}
      onChange={(e) => {
        setTheme(e.target.value);
        savePref('theme', e.target.value);
      }}
    >
      {THEMES.map((t) => (
        <option key={t.id} value={t.id}>
          {t.label}
        </option>
      ))}
    </select>
  );

  return (
    <div className={`win ${dragging ? 'dragging' : ''}`}>
      <div className="toolbar" data-tauri-drag-region>
        <div className="tb-left" data-tauri-drag-region>
          <button className="icon-btn" title="Home" style={{ opacity: doc ? 1 : 0.4 }} onClick={() => void goHome()}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round">
              <path d="M2.5 7.5 8 2.5l5.5 5M4 6.8V13h8V6.8M6.8 13V9.5h2.4V13" />
            </svg>
          </button>
          <div className="titles" data-tauri-drag-region>
            <div className="title">{doc ? doc.name : 'Proofpad'}</div>
            {doc && (
              <div className="subtitle">
                {doc.folder}
                {dirty ? ' — Edited' : ''}
              </div>
            )}
          </div>
        </div>
        <div className="tb-center" data-tauri-drag-region>
          <div
            className={`capsule ${nErr ? 'clickable' : ''}`}
            title={`${st.label}${st.detail ? ' · ' + st.detail : ''}`}
            onClick={() => nErr && setLogOpen(true)}
          >
            {status === 'compiling' ? <span className="spinner" /> : <span className="dot" style={{ background: st.dot }} />}
            <span className="capsule-label">{st.label}</span>
            <span className="capsule-detail" style={{ color: st.dc || undefined }}>
              {st.detail}
            </span>
            <span className="capsule-time">{time}</span>
          </div>
        </div>
        <div className="tb-right">
          {!narrow && (
            <>
              {themeSelect}
              {toggles.map((t) => (
                <div key={t.label} className="ctrl" style={{ opacity: doc ? 1 : 0.4 }}>
                  <span className="muted">{t.label}</span>
                  <Switch on={t.on} onClick={() => doc && t.flip()} />
                </div>
              ))}
              <div className="sep" />
            </>
          )}
          <button className="icon-btn" title="Compile (⌘S)" style={{ opacity: doc ? 1 : 0.4 }} onClick={() => void compileNow()}>
            <span className="play" />
          </button>
          <button className="icon-btn" title="Save PDF… (⌘⇧S)" style={{ opacity: pdf ? 1 : 0.4 }} disabled={!pdf} onClick={() => void exportPdf()}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2.5v7.5M5 7.5 8 10.5l3-3M3 11.5v1.5h10v-1.5" />
            </svg>
          </button>
          <button className="btn tpl-btn" title="New from Template" onClick={() => setSheet(true)}>
            <span className="docicon" />
            <span className="tpl-label">New from Template</span>
          </button>
          {narrow && (
            <div className="overflow-wrap">
              <button className="icon-btn" title="More" onClick={() => setMenuOpen(!menuOpen)}>
                <span className="dots">⋯</span>
              </button>
              {menuOpen && (
                <div className="overflow-menu">
                  <div className="om-row">
                    <span>Theme</span>
                    {themeSelect}
                  </div>
                  {toggles.map((t) => (
                    <div key={t.label} className="om-row" style={{ opacity: doc ? 1 : 0.5 }} onClick={() => doc && t.flip()}>
                      <span>{t.label}</span>
                      <Switch on={t.on} onClick={() => {}} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="body" ref={body}>
        {doc ? (
          <>
            <div className="left" style={{ width: `${(ratio * 100).toFixed(2)}%` }}>
              <Editor
                key={doc.path}
                ref={editor}
                initial={initial}
                vim={vimOn}
                autocomplete={acOn}
                onChange={onChange}
                onSave={() => void compileNow()}
              />
              {nErr > 0 && (
                <LogPanel
                  errors={errors}
                  open={logOpen}
                  buildTime={buildTime}
                  onToggle={() => setLogOpen(!logOpen)}
                  onJump={(l) => editor.current?.jumpToLine(l)}
                />
              )}
            </div>
            <div
              className={`divider ${dragging ? 'active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDoubleClick={() => setRatio(0.5)}
            />
            <Preview
              data={pdf?.bytes ?? null}
              version={pdf?.v ?? 0}
              zoom={zoom}
              onZoom={setZoom}
              stale={status === 'error' && !!pdf}
              noBuild={!pdf && status !== 'compiling'}
            />
          </>
        ) : (
          <div className="empty">
            <div className="empty-inner">
              <div className="empty-title">No Document Open</div>
              <div className="muted empty-sub">Start a new proof from a template, or open an existing .tex file.</div>
              <div className="empty-btns">
                <button className="btn primary big" onClick={() => setSheet(true)}>
                  New from Template…
                </button>
                <button className="btn big" onClick={() => void openFile()}>
                  Open…
                </button>
              </div>
              {openErr && <div className="open-err">{openErr}</div>}
              {recents.length > 0 && (
                <div className="recents">
                  <div className="recents-h">Recent</div>
                  <div className="group">
                    {recents.map((r) => (
                      <div key={r.path} className="recent" onClick={() => void openPath(r.path)}>
                        <span className="docicon big" />
                        <span className="recent-text">
                          <span>{basename(r.path)}</span>
                          <span className="muted small">{dirname(r.path).replace(/^\/Users\/[^/]+/, '~')}</span>
                        </span>
                        <span className="muted small">{recentDate(r.openedAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
      {symbols && (
        <SymbolSheet
          canInsert={!!doc}
          onClose={() => {
            setSymbols(false);
            editor.current?.focus();
          }}
          onInsert={(text, cursor) => editor.current?.insert(text, cursor)}
        />
      )}
      {sheet && <TemplateSheet onClose={() => setSheet(false)} onCreated={(p) => void openPath(p)} />}
    </div>
  );
}

function Switch({ on, onClick }: { on: boolean; onClick(): void }) {
  return (
    <div className={`switch ${on ? 'on' : ''}`} onClick={onClick}>
      <div className="knob" />
    </div>
  );
}
