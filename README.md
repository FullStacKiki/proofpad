# Proofpad

Minimal LaTeX editor for macOS (Apple Silicon). Tauri 2 + React + Vite + TypeScript.

- CodeMirror 6 editor with LaTeX highlighting, line numbers and an optional Vim mode.
- Live PDF preview (pdf.js) with a draggable divider; scroll position is kept across recompiles.
- Compiles with [Tectonic](https://tectonic-typesetting.github.io/) from the Rust backend.
- Errors only show in the compile log after a build. The editor has no autocomplete, snippets, linting or AI.
- Light/dark mode follows the system.

## Setup

1. Install the toolchain:

   ```bash
   xcode-select --install              # if you have not already
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   brew install node tectonic
   ```

   Tectonic downloads its TeX bundle on first use, so the first compile needs network access and takes a while.

2. Install dependencies and run:

   ```bash
   npm install
   npm run tauri dev
   ```

3. Build a `.app`:

   ```bash
   npm run tauri build
   ```

   The bundle is written to `src-tauri/target/release/bundle/macos/Proofpad.app`.

Proofpad looks for `tectonic` in `/opt/homebrew/bin`, `/usr/local/bin`, then `PATH`.

## Usage

| Shortcut | Action |
| --- | --- |
| ⌘N | New from template |
| ⌘O | Open a `.tex` file |
| ⌘S | Save and compile |
| `:w` (Vim mode) | Save and compile |

With **Auto-compile** on, the file is saved and compiled about 800 ms after you stop typing. Click an error in the log to jump to its line.

## Templates

Templates live in `src/lib/templates.ts`. "Proof exercises" is the default; edit its string to change the preamble.

## Layout

- `src/` – React UI (`App.tsx`, `components/`, `lib/log.ts` parses the Tectonic log).
- `src-tauri/src/lib.rs` – commands: `compile`, `read_text`, `write_text`, `read_bytes`, `file_exists`.
- PDFs are built into `$TMPDIR/proofpad/<hash>/`, not next to your `.tex` file.
