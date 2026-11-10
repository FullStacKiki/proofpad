import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Compartment, EditorState } from '@codemirror/state';
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { latex, tags as lt } from '../lib/latex';
import { latexAutocomplete } from '../lib/autocomplete';
import { Vim, vim } from '@replit/codemirror-vim';

export interface EditorHandle {
  jumpToLine(line: number): void;
  focus(): void;
  /** Insert at the cursor; `cursor` is the caret offset within `text` afterwards. */
  insert(text: string, cursor?: number): void;
}

interface Props {
  initial: string;
  vim: boolean;
  autocomplete: boolean;
  onChange(text: string): void;
  onSave(): void;
}

// Vim ":w" saves (and therefore compiles).
let saveHook: () => void = () => {};
Vim.defineEx('write', 'w', () => saveHook());

const highlight = HighlightStyle.define([
  { tag: lt.cmd, color: 'var(--sCmd)' },
  { tag: lt.env, color: 'var(--sEnv)' },
  { tag: lt.opt, color: 'var(--sOpt)' },
  { tag: lt.math, color: 'var(--sMath)' },
  { tag: lt.brace, color: 'var(--sBrace)' },
  { tag: lt.delim, color: 'var(--sDelim)' },
  { tag: lt.comment, color: 'var(--sCom)', fontStyle: 'italic' },
]);

const theme = EditorView.theme({
  '&': { height: '100%', backgroundColor: 'var(--editorBg)', color: 'var(--sText)' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': {
    fontFamily: "'SF Mono', SFMono-Regular, ui-monospace, Menlo, monospace",
    fontSize: '12.5px',
    lineHeight: '19px',
    padding: '10px 0 120px',
  },
  '.cm-content': { caretColor: 'var(--text)', padding: 0 },
  '.cm-line': { padding: '0 32px 0 4px' },
  '.cm-gutters': {
    backgroundColor: 'var(--editorBg)',
    color: 'var(--gutterText)',
    border: 'none',
    fontSize: '11px',
  },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 14px 0 0', minWidth: '52px' },
  '.cm-activeLine': { backgroundColor: 'var(--curLine)' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--curLine)', color: 'var(--gutterCur)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--sel) !important',
  },
  '.cm-snippetField': { backgroundColor: 'var(--sel)' },
  '.cm-tooltip.cm-tooltip-autocomplete': {
    background: 'var(--sheetBg)',
    border: '0.5px solid var(--sheetBorder)',
    borderRadius: '8px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
    overflow: 'hidden',
  },
  '.cm-tooltip-autocomplete > ul': { fontFamily: "'SF Mono', ui-monospace, Menlo, monospace", fontSize: '12px', maxHeight: '260px' },
  '.cm-tooltip-autocomplete > ul > li': { display: 'flex', alignItems: 'center', padding: '2px 10px', color: 'var(--text)', lineHeight: '22px' },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': { background: 'var(--sel)', color: 'var(--text)' },
  '.cm-completionLabel': { color: 'var(--sCmd)' },
  '.cm-completionDetail': { color: 'var(--text2)', fontStyle: 'normal', fontFamily: '-apple-system, sans-serif', marginLeft: '12px', fontSize: '11px' },
  '.pp-prev': { display: 'inline-block', width: '52px', flex: 'none', textAlign: 'center', fontSize: '12px' },
  '.cm-cursor': { borderLeftColor: 'var(--text)' },
  '.cm-fat-cursor': { background: 'var(--accent) !important', color: '#fff !important' },
  '&:not(.cm-focused) .cm-fat-cursor': { outline: '1px solid var(--accent)', background: 'transparent !important' },
});

export const Editor = forwardRef<EditorHandle, Props>(function Editor(props, ref) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const vimComp = useRef(new Compartment());
  const acComp = useRef(new Compartment());
  const cb = useRef(props);
  cb.current = props;

  useEffect(() => {
    saveHook = () => cb.current.onSave();
    const state = EditorState.create({
      doc: props.initial,
      extensions: [
        vimComp.current.of(props.vim ? vim() : []),
        acComp.current.of(props.autocomplete ? latexAutocomplete() : []),
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        drawSelection(),
        EditorView.lineWrapping,
        latex,
        syntaxHighlighting(highlight),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        EditorView.contentAttributes.of({
          spellcheck: 'false',
          autocorrect: 'off',
          autocapitalize: 'off',
          autocomplete: 'off',
        }),
        theme,
        EditorView.updateListener.of((u) => {
          if (u.docChanged) cb.current.onChange(u.state.doc.toString());
        }),
      ],
    });
    const v = new EditorView({ state, parent: host.current! });
    view.current = v;
    v.focus();
    return () => v.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    view.current?.dispatch({ effects: vimComp.current.reconfigure(props.vim ? vim() : []) });
  }, [props.vim]);

  useEffect(() => {
    view.current?.dispatch({ effects: acComp.current.reconfigure(props.autocomplete ? latexAutocomplete() : []) });
  }, [props.autocomplete]);

  useImperativeHandle(ref, () => ({
    focus: () => view.current?.focus(),
    insert(text: string, cursor?: number) {
      const v = view.current;
      if (!v) return;
      const { from, to } = v.state.selection.main;
      v.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + (cursor ?? text.length) },
        scrollIntoView: true,
      });
      v.focus();
    },
    jumpToLine(n: number) {
      const v = view.current;
      if (!v) return;
      const line = v.state.doc.line(Math.min(Math.max(n, 1), v.state.doc.lines));
      v.dispatch({
        selection: { anchor: line.from, head: line.to },
        effects: EditorView.scrollIntoView(line.from, { y: 'center' }),
      });
      v.focus();
    },
  }));

  return <div className="editor" ref={host} />;
});
