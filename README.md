# Proofpad

A minimal LaTeX editor for macOS with a live PDF preview. Write on the left, see the typeset page on the right — no TeX distribution to manage, no project setup, no cloud account.

Built with [Tauri 2](https://tauri.app), React, [CodeMirror 6](https://codemirror.net) and [pdf.js](https://mozilla.github.io/pdf.js/); documents are compiled locally by [Tectonic](https://tectonic-typesetting.github.io/).

<!-- Screenshot placeholder: replace with docs/images/main-window.png (editor + preview, light theme). -->
> **Screenshot coming soon** — main window: editor on the left, live PDF preview on the right.

<!-- GIF placeholder: replace with docs/images/live-preview.gif (typing → auto-compile → preview updates). -->
> **Demo GIF coming soon** — typing a formula and watching the preview update.

## Features

- **Live PDF preview** — with Auto-compile on, the file is saved and compiled ~800 ms after you stop typing. The preview keeps its scroll position across recompiles; zoom from 75% to 200%.
- **Fast local builds** — Tectonic runs from the Rust backend; PDFs are built into a temp folder, never next to your `.tex`.
- **Readable errors** — failed builds show a compact log with line numbers; click an error to jump to that line. The last good PDF stays visible.
- **Templates** — 9 built-in starting points (proof exercises, homework, lecture notes, calculus notes, logic & sets, cheat sheet, Beamer slides, résumé, blank article) plus your own templates.
- **Autocomplete (optional)** — LaTeX commands and environments with snippet placeholders, KaTeX previews of math symbols, `\begin{…}` / `\end{…}` pairing and bracket auto-closing.
- **Symbol reference** — searchable catalog of math symbols and text/document commands with rendered previews; insert or copy with one keystroke.
- **Vim mode (optional)** — via `@replit/codemirror-vim`; `:w` saves and compiles.
- **Themes** — System, Light, Dark, Tokyo Night, Tokyo Night Day, One Dark, Gruvbox, Nord, Solarized Light.
- **PDF export** — save the compiled PDF anywhere with ⌘⇧S.
- **Recent files** on the start screen.

## Requirements

| | |
| --- | --- |
| OS | macOS 11 or later (developed on Apple Silicon; Intel is untested) |
| TeX engine | [Tectonic](https://tectonic-typesetting.github.io/) — `brew install tectonic` |
| To build from source | Xcode Command Line Tools, Rust (stable), Node.js **22.13+** |

Tectonic downloads the TeX packages it needs on first use, so the **first compile needs network access** and can take a minute. Later builds are cached and work offline.

Proofpad looks for `tectonic` in `/opt/homebrew/bin`, `/usr/local/bin`, then your `PATH`.

## Install & build from source

There are no prebuilt releases yet; build the app yourself:

```bash
# 1. Toolchain (skip what you already have)
xcode-select --install
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
brew install node tectonic

# 2. Clone and install dependencies
git clone https://github.com/FullStacKiki/proofpad.git
cd proofpad
npm install

# 3a. Run in development (hot reload)
npm run tauri dev

# 3b. Or build a .app bundle
npm run tauri build
```

The bundle is written to `src-tauri/target/release/bundle/macos/Proofpad.app` — drag it into `/Applications`.

> Because the app is not signed/notarized, macOS may block the first launch. Right-click the app → **Open**, or allow it in *System Settings → Privacy & Security*.

Run the test suite with `npm test`.

## Usage

1. **New from Template** (⌘N): pick a template, a file name and a folder.
2. Type. With **Auto-compile** on, the preview updates as you pause; otherwise press ⌘S.
3. If the build fails, click an error in the log to jump to the line.
4. **Save PDF…** (⌘⇧S) exports the compiled PDF.

Toolbar switches toggle **Vim**, **Autocomplete** and **Auto-compile**; preferences are remembered. On narrow windows they move into the **⋯** menu.

**Your own templates:** drop `.tex` files into `~/Library/Application Support/Proofpad/templates/` and they appear under the built-in ones in the template picker.

A step-by-step walkthrough is in [docs/getting-started.md](docs/getting-started.md).

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| ⌘N | New from template |
| ⌘O | Open a `.tex` file |
| ⌘S | Save and compile |
| ⌘⇧S | Save PDF… |
| ⌥G | Symbol reference (also *Help → Symbol Reference*) |
| `:w` (Vim mode) | Save and compile |

In the symbol reference: ↑/↓ to move, ↵ to insert at the cursor, ⌘C to copy the command, Tab to cycle categories, Esc to close.

## Project structure

```
proofpad/
├── src/                     React + TypeScript UI
│   ├── App.tsx              Window layout, document lifecycle, compile loop
│   ├── components/          Editor (CodeMirror), Preview (pdf.js), LogPanel,
│   │                        TemplateSheet, SymbolSheet
│   └── lib/                 api.ts (Tauri command wrappers), log.ts (TeX log parser),
│                            latex.ts (syntax mode), autocomplete.ts, themes.ts,
│                            templates/, symbol catalogs
├── src-tauri/               Rust backend (Tauri 2)
│   └── src/lib.rs           Commands: compile, read_text, write_text, read_bytes,
│                            file_exists, copy_file, list_user_templates; app menu
├── scripts/                 make-thumbnails.mjs (regenerates template previews)
└── docs/                    Guides and design notes
```

How the pieces fit together is described in [docs/architecture.md](docs/architecture.md).

## Roadmap

- [x] Live preview, error log, templates, symbol reference, themes
- [ ] **Real-time collaboration** *(in progress)* — several people editing the same `.tex` at once, Google Docs–style: Yjs CRDT sync through a self-hostable Hocuspocus server, live cursors and presence, invite codes with editor/viewer roles, offline edits that merge on reconnect. Single-user mode stays exactly as it is. Design: [docs/collaboration.md](docs/collaboration.md).
- [ ] Comments on text ranges (after core sync)
- [ ] `proofpad://` invite links
- [ ] Multi-file projects (`\input`, images, `.bib`) in shared rooms
- [ ] Signed and notarized releases

## Contributing

Issues and pull requests are welcome — see [docs/contributing.md](docs/contributing.md).

## License

[MIT](LICENSE) © 2026 Alessandro Ravanelli
