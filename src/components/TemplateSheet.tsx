import { useEffect, useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { documentDir } from '@tauri-apps/api/path';
import { TEMPLATES, thumbFor } from '../lib/templates';
import { basename, fileExists, listUserTemplates, readText, writeText } from '../lib/api';
import { loadPref, savePref } from '../lib/recents';

interface Props {
  onClose(): void;
  onCreated(path: string): void;
}

interface Item {
  id: string;
  name: string;
  desc: string;
  file: string;
  src: string;
  files?: { name: string; src: string }[];
  thumb?: string;
  mine: boolean;
}
const BUILTIN: Item[] = TEMPLATES.map((t) => ({ ...t, thumb: thumbFor(t.id), mine: false }));

export function TemplateSheet({ onClose, onCreated }: Props) {
  const [mine, setMine] = useState<Item[]>([]);
  const items = [...BUILTIN, ...mine];
  const [sel, setSel] = useState(0);
  const [name, setName] = useState(BUILTIN[0].file);
  const [dir, setDir] = useState<string>(loadPref('lastDir', ''));
  const [err, setErr] = useState('');

  useEffect(() => {
    listUserTemplates()
      .then((l) => setMine(l.map((u) => ({ id: 'user:' + u.file, name: u.name, desc: 'Your template', file: u.file, src: u.src, mine: true }))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!dir) documentDir().then(setDir).catch(() => {});
  }, [dir]);

  const choose = (i: number) => {
    setSel(i);
    setName(items[i].file);
    setErr('');
  };

  const pickDir = async () => {
    const d = await open({ directory: true, defaultPath: dir || undefined });
    if (typeof d === 'string') setDir(d);
  };

  const create = async (i = sel) => {
    let file = name.trim();
    if (!file) return setErr('Enter a file name.');
    if (!file.endsWith('.tex')) file += '.tex';
    if (!dir) return setErr('Choose a folder.');
    const path = `${dir}/${file}`;
    try {
      if (await fileExists(path)) return setErr('A file with that name already exists.');
      // Extra files (e.g. resume.cls) go next to the document. An identical copy already there is
      // fine; a different one is never overwritten.
      const extras = (items[i].files ?? []).map((f) => ({ ...f, path: `${dir}/${f.name}` }));
      const toWrite: typeof extras = [];
      for (const f of extras) {
        if (!(await fileExists(f.path))) toWrite.push(f);
        else if ((await readText(f.path)) !== f.src) return setErr(`${f.name} already exists in this folder with different content.`);
      }
      for (const f of toWrite) await writeText(f.path, f.src);
      await writeText(path, items[i].src);
      savePref('lastDir', dir);
      onCreated(path);
    } catch (e) {
      setErr(String(e));
    }
  };

  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="sheet"
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
          if (e.key === 'Enter') create();
        }}
      >
        <div className="sheet-head">
          <div className="sheet-title">New from Template</div>
          <div className="muted">Choose a starting point for your document.</div>
        </div>
        <div className="tpl-scroll">
          {[false, true].map((isMine) => {
            const group = items.map((t, i) => ({ t, i })).filter((x) => x.t.mine === isMine);
            if (isMine && !group.length) {
              return (
                <div key="mine" className="muted tpl-hint">
                  My templates: put .tex files in ~/Library/Application Support/Proofpad/templates
                </div>
              );
            }
            return (
              <div key={String(isMine)}>
                {isMine && <div className="tpl-group">My templates</div>}
                <div className="tpl-grid">
                  {group.map(({ t, i }) => (
                    <div
                      key={t.id}
                      className={`tpl ${i === sel ? 'sel' : ''}`}
                      onClick={() => choose(i)}
                      onDoubleClick={() => {
                        choose(i);
                        create(i);
                      }}
                    >
                      <div className="tpl-thumb">
                        {t.thumb ? (
                          <img src={t.thumb} alt="" draggable={false} />
                        ) : (
                          <>
                            <i style={{ width: '58%', height: 4, margin: '0 auto', background: '#55555A' }} />
                            <i style={{ width: '32%', height: 2, margin: '4px auto 5px', background: '#9A9AA0' }} />
                            <i style={{ width: '90%' }} />
                            <i style={{ width: '70%' }} />
                          </>
                        )}
                      </div>
                      <div className="tpl-name">{t.name}</div>
                      <div className="muted tpl-desc">{t.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="sheet-form">
          <label>Name:</label>
          <input
            autoFocus
            spellCheck={false}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErr('');
            }}
          />
          <label>Where:</label>
          <button className="select" onClick={pickDir} title={dir}>
            <span>{dir ? basename(dir) : '…'}</span>
            <span className="muted">▾</span>
          </button>
        </div>
        {err && <div className="sheet-err">{err}</div>}
        <div className="sheet-foot">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={() => create()}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
