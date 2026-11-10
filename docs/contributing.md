# Contributing

Thanks for your interest in Proofpad! Bug reports, ideas and pull requests are all welcome.

## Reporting bugs

Open an issue with:

- macOS version and chip (Apple Silicon / Intel)
- `tectonic --version`
- What you did, what you expected, what happened
- For build problems: a minimal `.tex` file that reproduces it, and the error shown in the log panel

## Development setup

Prerequisites: Xcode Command Line Tools, Rust (stable), Node.js 22.13+, Tectonic (`brew install tectonic`).

```bash
git clone https://github.com/FullStacKiki/proofpad.git
cd proofpad
npm install
npm run tauri dev     # app with hot reload
```

Useful scripts:

| Command | What it does |
| --- | --- |
| `npm run tauri dev` | Run the app in development |
| `npm run tauri build` | Build `Proofpad.app` |
| `npm test` | Run unit tests once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run build` | Type-check (`tsc --noEmit`) and build the frontend |
| `npm run thumbnails` | Regenerate template thumbnails (needs Tectonic) |

Read [architecture.md](architecture.md) for a tour of the code.

## Before opening a pull request

Make sure these pass:

```bash
npm test
npm run build
(cd src-tauri && cargo check)
```

And please:

- **Keep pull requests small and focused** — one change per PR, one logical step per commit. Refactors that don't change behaviour go in their own commit.
- **Add tests** for logic that can be tested without a window (parsers, sync/merge logic, helpers). Put them next to the code as `*.test.ts`.
- **Don't break single-file mode.** Opening, editing, saving (⌘S) and compiling a local `.tex` must keep working exactly as before.
- **Keep `vite.config.ts` and `src-tauri/tauri.conf.json` changes deliberate** — they affect the shipped app.
- **Pin new dependencies to versions that have been out for at least a couple of weeks**, and mention why the dependency is needed.
- Describe *what* changed and *how you verified it* (tests, manual steps, screenshots for UI changes).

## Code style

- TypeScript in `strict` mode; no unused locals.
- Match the surrounding code: functional React components with hooks, CodeMirror configuration via extensions/compartments, small modules in `src/lib/`.
- Comments explain *why*, not *what*.
- Commit messages follow a light [Conventional Commits](https://www.conventionalcommits.org) style: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.

## Adding a template

1. Create `src/lib/templates/<id>.ts` that default-exports a `Template` (see `types.ts`). Files in that folder are picked up automatically and sorted by `order`.
2. Run `npm run thumbnails` to generate `src/assets/thumbs/<id>.png`.

## Working on collaboration

Real-time collaboration is in progress; the design is in [collaboration.md](collaboration.md). If you want to help, comment on the related issue first so work isn't duplicated.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](../LICENSE).
