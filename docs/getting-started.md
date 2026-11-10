# Getting started

This guide takes you from a fresh Mac to an exported PDF. It takes about 15 minutes, most of which is installing the toolchain and Tectonic's first download.

## 1. Install the tools

Proofpad has no prebuilt release yet, so you build it from source once.

```bash
xcode-select --install                                           # Apple's command-line tools
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh   # Rust
brew install node tectonic                                       # Node.js 22.13+ and the TeX engine
```

Check that everything is on your `PATH`:

```bash
node --version      # v22.13 or newer
cargo --version
tectonic --version
```

## 2. Build Proofpad

```bash
git clone https://github.com/FullStacKiki/proofpad.git
cd proofpad
npm install
npm run tauri build
```

When it finishes, open `src-tauri/target/release/bundle/macos/` and drag **Proofpad.app** into `/Applications`.

The app is not signed, so on first launch macOS may say it can't verify the developer. Right-click Proofpad → **Open** → **Open**. You only need to do this once.

> Prefer to hack on it? `npm run tauri dev` runs the app with hot reload instead of building a bundle.

## 3. Your first document

1. Launch Proofpad. The start screen offers **New from Template…** and **Open…**.
2. Click **New from Template…** (or press **⌘N**).
3. Pick **Proof exercises** (the default). Each card shows a thumbnail of the first page.
4. Enter a file name, e.g. `week1.tex`, and choose a folder. Proofpad remembers the last folder you used.
5. Click **Create**. The file is written to disk and opened.

The first compile starts immediately. **The very first build downloads TeX packages** and can take a minute — the status capsule at the top shows *Compiling…*. When it turns green (*Build Succeeded*) the PDF appears on the right.

## 4. Live preview

With **Auto-compile** on (the default), Proofpad saves and recompiles about 800 ms after you stop typing. Try it: change a heading and pause.

- The preview keeps its scroll position across rebuilds, so you stay on the page you're working on.
- Use **−** / **+** in the bottom-right corner to zoom (75%–200%).
- Drag the divider between editor and preview to resize; double-click it to reset to 50/50.
- Prefer to compile on demand? Turn **Auto-compile** off in the toolbar and press **⌘S** when you want a build.

### When a build fails

Type `\foo` somewhere and pause. The capsule turns red (*Build Failed · 1 error*) and a log panel opens under the editor:

- Each entry shows the line number, the TeX message and the offending source line.
- Click an entry to jump to and select that line.
- The preview keeps showing the **last successful build**, with a small *Showing last successful build* banner.

Fix the error and the panel disappears on the next good build.

## 5. Writing faster

- **Autocomplete** — turn it on in the toolbar. Typing `\` suggests commands with descriptions; math symbols show a rendered preview. Commands with arguments insert snippets: press **Tab** to accept, then **Tab** through the placeholders. `\begin{…}` completes environment names, and the matching `\end{…}` is inserted for you.
- **Symbol reference** — press **⌥G** (or *Help → Symbol Reference*). Search by name, by command or by the symbol itself (`forall`, `∀`, `bold`…). **↵** inserts at the cursor, **⌘C** copies the command, **Tab** cycles categories.
- **Vim mode** — toggle **Vim** in the toolbar. `:w` saves and compiles.

## 6. Templates

Built-in templates cover proof exercises, homework submissions, lecture notes, calculus notes, logic & sets, a printable cheat sheet, Beamer slides, a résumé and a blank article. Some templates add helper files next to your document (the résumé adds `resume.cls`).

### Your own templates

Any `.tex` file in

```
~/Library/Application Support/Proofpad/templates/
```

shows up in the template picker after the built-ins (the folder is created the first time you open the picker). The file name becomes the template name — `Problem set.tex` appears as *Problem set*.

## 7. Export the PDF

Press **⌘⇧S** (or the download-arrow button in the toolbar) and choose where to save. The default is next to your `.tex`, with the same name.

Proofpad never writes build output next to your source: PDFs and logs live in `$TMPDIR/proofpad/<hash>/`, so your folders stay clean until you export.

## 8. Themes and layout

- The theme menu in the toolbar offers System, Light, Dark and several editor palettes (Tokyo Night, One Dark, Gruvbox, Nord, Solarized Light…).
- On narrow windows the toolbar switches collapse into the **⋯** menu.
- The **Home** button (top left) saves the document and returns to the start screen, where recent files are listed.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| *Tectonic not found* | `brew install tectonic`. Proofpad checks `/opt/homebrew/bin`, `/usr/local/bin`, then `PATH`. |
| First build hangs on *Compiling…* | Tectonic is downloading its bundle; check your network and wait. |
| A package is missing | Tectonic fetches packages on demand — rebuild while online. |
| macOS won't open the app | Right-click → **Open**, or *System Settings → Privacy & Security → Open Anyway*. |
