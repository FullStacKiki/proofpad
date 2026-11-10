# Architecture

Proofpad is a [Tauri 2](https://tauri.app) app: a React UI running in the system WebView (WKWebView on macOS) and a small Rust backend that touches the file system and runs Tectonic. There is no server and no database; the `.tex` file on disk is the source of truth.

```
┌──────────────────────── WebView (React + TypeScript) ────────────────────────┐
│                                                                               │
│  App.tsx ── document state, compile loop, shortcuts, toolbar                  │
│    ├── Editor.tsx    CodeMirror 6 (LaTeX mode, Vim, autocomplete)             │
│    ├── Preview.tsx   pdf.js → <canvas> pages                                  │
│    ├── LogPanel.tsx  parsed errors, click → jump to line                      │
│    ├── TemplateSheet / SymbolSheet                                            │
│    └── lib/api.ts    typed wrappers around invoke()                           │
│                                                                               │
└───────────────────────────────┬───────────────────────────────────────────────┘
                                │ Tauri IPC (invoke)
┌───────────────────────────────▼───────────────────────────────────────────────┐
│  src-tauri/src/lib.rs (Rust)                                                   │
│    compile · read_text · write_text · read_bytes · file_exists · copy_file    │
│    list_user_templates · app menu (Help → Symbol Reference)                   │
└───────────────────────────────┬───────────────────────────────────────────────┘
                                │ std::process::Command
                         tectonic -X compile
```

## Frontend

### `App.tsx`

Holds all UI state with `useState` + refs (no external store):

- **Document**: `docRef` (`{ path, name, folder }`), `textRef` (live editor text), `dirty`.
- **Build**: `status` (`idle | compiling | success | error | edited`), `errors`, the last PDF bytes and a version counter.
- **Preferences** (`auto`, `vim`, `autocomplete`, `theme`) persisted to `localStorage` via `lib/recents.ts`, alongside the recent-files list.

Opening a document reads the file, remounts the editor (`key={doc.path}`) with the text as its initial content, and starts a compile.

### `Editor.tsx`

A CodeMirror 6 view created once per document. Text flows **out** of the editor through `onChange(text)`; the app never pushes text back in. Behaviour that can change at runtime (Vim, autocomplete) lives in `Compartment`s and is reconfigured in place.

Two optional mount-time props exist as extension points:

- `undo` — the undo stack and its keymap (defaults to CodeMirror's `history()`).
- `extensions` — extra extensions appended last.

The collaboration work uses these to plug in a Yjs binding without changing single-user behaviour (see [collaboration.md](collaboration.md)).

`lib/latex.ts` is a small stream-parser LaTeX mode with custom highlight tags; `lib/autocomplete.ts` builds completions from `lib/commands.ts` and renders math previews with KaTeX.

### `Preview.tsx`

Renders every page with pdf.js into off-DOM canvases, then swaps them in at once so the scroll position survives a rebuild (and is scaled proportionally on zoom changes). A generation counter discards renders that were overtaken by a newer build.

It imports pdf.js's **legacy** build on purpose: Tauri uses the system WebKit, and the modern build requires Safari 18.4+ features — on older WebKit it fails at import and blanks the whole app.

## Compile pipeline

```
keystroke ─► onChange ─► debounce 800 ms ─► compileNow()
                                              │
                         writeText(path, text)│  (save)
                                              ▼
                                   invoke('compile', path)
                                              │
                    Rust: spawn_blocking → tectonic -X compile --keep-logs
                          --outdir $TMPDIR/proofpad/<hash(path)>/  <path>
                                              │
                         { ok, pdfPath, output, log, durationMs }
                                              │
              ok ──► readBytes(pdfPath) ─► Preview      fail ──► parseLog() ─► LogPanel
```

Details worth knowing:

- **One build at a time.** If a compile is requested while one is running, a single follow-up is queued (`busy` / `queued` refs), so a burst of edits produces at most one extra build.
- **Save before compile.** `compileNow` writes the current text first; ⌘S is "save and compile". Auto-compile off just marks the status *Not Compiled*.
- **Output outside the source folder.** Tectonic writes into `$TMPDIR/proofpad/<16-hex hash of the path>/`. Tectonic runs with the source folder as working directory, so `\input` and images relative to the `.tex` resolve normally.
- **Finding Tectonic.** GUI apps don't inherit the shell `PATH`, so the backend checks `/opt/homebrew/bin` and `/usr/local/bin` before `PATH`.
- **Error parsing** (`lib/log.ts`): first Tectonic's `error: file:line: msg` lines, then `! msg` + `l.N` pairs from the TeX log, otherwise the raw error output. Deduplicated, capped at 50.
- **Stale results.** If the user switches documents mid-build, the result is dropped (`docRef.current?.path !== d.path`).

## Tauri side

`src-tauri/src/lib.rs` exposes plain functions as commands; all of them take absolute paths chosen by the user through the native dialogs (`tauri-plugin-dialog`).

| Command | Purpose |
| --- | --- |
| `compile(path)` | Run Tectonic (on a blocking thread) and return status, PDF path, output and log |
| `read_text` / `write_text` | Load and save `.tex` files |
| `read_bytes` | Return the PDF as a raw IPC response (no JSON/base64 overhead) |
| `file_exists`, `copy_file` | Template creation and PDF export |
| `list_user_templates` | Read `~/Library/Application Support/Proofpad/templates/*.tex` |

The app menu adds *Help → Symbol Reference*, which emits an `open-symbols` event to the UI. Capabilities (`src-tauri/capabilities/default.json`) grant only core window permissions and the dialog plugin.

## Templates and thumbnails

Templates are TypeScript modules in `src/lib/templates/` exporting `{ id, order, name, desc, file, src, files? }`. `files` lists helper files (e.g. `resume.cls`) written next to the document. Thumbnails in `src/assets/thumbs/` are generated by `npm run thumbnails`, which compiles each template with Tectonic and converts page 1 with macOS `sips`.

## Tests

Unit tests use [Vitest](https://vitest.dev) (`npm test`). `vitest.config.ts` extends `vite.config.ts` so the Tauri build configuration stays untouched. Tests live next to the code as `*.test.ts`.
