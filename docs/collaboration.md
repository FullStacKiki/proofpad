# Real-time collaboration

> **Status: work in progress — design document.** Nothing below ships yet except the editor extension points. This describes the agreed plan; details may change as it is implemented. Progress is tracked in the [roadmap](../README.md#roadmap).

## Goal

Several people edit the same `.tex` document at the same time, Google Docs–style, while **single-user local mode keeps working exactly as it does today** when you're not in a room.

## Architecture

```
┌──────────── Proofpad (each user) ────────────┐        ┌──── server/ (Node) ────┐
│ CodeMirror ⇄ yCollab(Y.Text, awareness)      │  wss   │ Hocuspocus             │
│        │            │                        │◀──────▶│  onAuthenticate: token │
│   textRef/onChange  HocuspocusProvider       │        │  → role (readOnly)     │
│        │            y-indexeddb (offline)    │        │  SQLite persistence    │
│  debounce → write working copy → tectonic    │        │  POST /rooms (create)  │
└──────────────────────────────────────────────┘        └────────────────────────┘
```

- **CRDT:** [Yjs](https://yjs.dev). The document is a `Y.Text`; concurrent edits merge without conflicts.
- **Editor binding:** [`y-codemirror.next`](https://github.com/yjs/y-codemirror.next) (`yCollab`), plugged in through the editor's `extensions` prop. Undo uses `Y.UndoManager` through the `undo` prop, so ⌘Z only undoes *your* edits.
- **Sync server:** [Hocuspocus](https://tiptap.dev/docs/hocuspocus) — self-hostable Node server, in `server/`, deployable to Fly.io.
- **Offline:** [`y-indexeddb`](https://github.com/yjs/y-indexeddb) persists each room's document state in the WebView; edits made offline merge automatically on reconnect.

## Client modules (`src/collab/`, planned)

| Module | Responsibility |
| --- | --- |
| `types.ts` | `SyncTransport` interface: `connect`, `destroy`, `awareness`, `status`, `synced`. Hocuspocus is the default implementation; y-websocket or a hosted provider could replace it without touching the editor or app. |
| `auth.ts` | `AuthProvider` interface: `getIdentity()`, `getToken(room)`. v1 = display name + room token; a Supabase implementation can be added later. |
| `invite.ts` | Encode/parse invite codes: `pp1:<base64url({ server, room, token })>`. |
| `seed.ts` | Seed the shared doc from the host's file **exactly once**: only the room creator, only after the first sync, only if `Y.Text` is empty and a `meta.seeded` flag is unset. Prevents duplicated content when two clients seed concurrently. |
| `useCollab.ts` | React hook: session lifecycle, connection status, peer list. |
| `comments.ts` | *(phase 2)* Comments on text ranges stored in a `Y.Array`, anchored with `Y.RelativePosition`, resolvable/reopenable. |

## Server (`server/`, planned)

- **Hocuspocus** with SQLite persistence (pluggable `Database` extension, so Postgres/S3 can be swapped in).
- **Tokens:** stateless, HMAC-signed `{ room, role, exp }` with a server secret. `onAuthenticate` verifies the token and sets `connection.readOnly` for viewers — roles are enforced by the server, not just the UI.
- **`POST /rooms`** returns `{ roomId, editorToken, viewerToken }`. An optional `CREATE_KEY` restricts who can create rooms on a given server.
- **Deploy:** Dockerfile + `fly.toml` with a volume for the SQLite file.
- **Future auth:** replace the `verify()` function with Supabase JWT verification and a room-membership table; the client switches `AuthProvider`. No other changes needed.

## User flows

**Share (host)** — *Share* creates a room on the configured server, seeds it from the open document and offers two invite codes (editor / viewer) to copy. The host keeps editing their own `.tex` file; ⌘S keeps saving it as before.

**Join (guest)** — *Join…* on the start screen asks for a display name and an invite code. The guest gets a working copy in the app-data folder (`rooms/<roomId>/<name>.tex`) that Tectonic compiles; *Save a copy…* exports it anywhere.

**Presence** — remote cursors and selections with the collaborator's name and color; avatars of who's online in the toolbar (up to 4, then "+N"); a connection indicator (online / connecting / offline).

**Viewers** — the editor is read-only (`EditorState.readOnly`), and the server rejects their updates regardless.

**Leave** — leaving a room returns to local mode; the working copy stays on disk.

## PDF preview in a room

Every participant compiles **locally** with their own Tectonic — no PDFs travel over the network.

- Your own edits keep the 800 ms auto-compile debounce.
- Remote edits are recognised by the Yjs sync annotation on the transaction and use a longer, trailing debounce (~2.5 s), so a collaborator's typing doesn't trigger a build per keystroke.
- The existing "one build at a time + one queued" rule still applies.
- The status capsule notes who caused the rebuild (e.g. *Updated by Ana*).

## Offline and merging

- Local edits are applied to the Yjs doc immediately and persisted to IndexedDB, and the working copy on disk keeps being written — compiling works offline too.
- On reconnect the provider exchanges state vectors with the server and both sides apply what they're missing. Yjs guarantees convergence; there is no manual conflict resolution.

## Testing plan

- Two `Y.Doc`s editing concurrently converge to the same text.
- Offline edits on both sides merge on reconnect.
- Concurrent seeding does not duplicate content.
- A viewer's update is rejected by the server.
- Integration: an in-process Hocuspocus server with two real providers ends up with matching text.
- Invite codes round-trip through encode/parse.
- *(phase 2)* Comment anchors survive edits around them.

## Implementation steps

1. ✅ Repository + Vitest
2. ✅ Editor extension points (`undo`, `extensions` props)
3. `server/`: Hocuspocus, signed tokens, `/rooms`, SQLite, Dockerfile, `fly.toml`, tests
4. `src/collab/`: transport, auth, invite codes, seeding, tests
5. Editor binding, offline persistence, room-aware save path, remote-edit compile debounce
6. Share / Join dialogs, recent rooms, leave room
7. Presence: cursors, toolbar avatars, connection status
8. Documentation: running and deploying the server
9. *(phase 2)* Comments

## Known limitations (v1)

- **Single file only.** Only the main `.tex` is synced. `\input` files, images and `.bib` files are not shared yet, so guests can only compile self-contained documents.
- **Invite codes are bearer tokens.** Anyone holding a code can join until it expires (default 30 days); individual codes can't be revoked until accounts/membership exist.
- **Paste-only invites.** Clickable `proofpad://` links come later (they need Tauri's deep-link plugin).
- **Vim + Yjs undo** needs explicit mapping of Vim's `u` / `Ctrl-R` to the Yjs undo manager.
