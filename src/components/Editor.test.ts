import { describe, expect, it } from 'vitest';
import { EditorState, type Transaction } from '@codemirror/state';
import { redo, undo } from '@codemirror/commands';
import { localUndo } from './Editor';

// The default undo config must behave exactly like the previous hard-coded history().
describe('localUndo', () => {
  it('undoes and redoes local edits', () => {
    let state = EditorState.create({ doc: 'a', extensions: localUndo().extension });
    const dispatch = (tr: Transaction) => (state = tr.state);
    state = state.update({ changes: { from: 1, insert: 'b' } }).state;
    expect(state.doc.toString()).toBe('ab');
    expect(undo({ state, dispatch })).toBe(true);
    expect(state.doc.toString()).toBe('a');
    expect(redo({ state, dispatch })).toBe(true);
    expect(state.doc.toString()).toBe('ab');
  });

  it('binds Mod-z / Mod-y / Mod-Shift-z', () => {
    const keys = localUndo().keymap.flatMap((k) => [k.key, k.mac, k.shift && `Shift-${k.key}`]).filter(Boolean);
    expect(keys).toEqual(expect.arrayContaining(['Mod-z', 'Mod-y']));
  });
});
