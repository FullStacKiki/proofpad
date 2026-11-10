import {
  acceptCompletion,
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  snippet,
  snippetCompletion,
  startCompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
} from '@codemirror/autocomplete';
import { EditorState, Prec, type Extension } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import katex from 'katex';
import { COMMANDS, STANDARD_ENVS } from './commands';

type C = Completion & { tex?: string };

const BEGIN_TPL = '\\begin{${1}}\n  ${2}\n\\end{${1}}';

const items: { name: string; completion: C }[] = [
  ...COMMANDS.map((c) => {
    const label = '\\' + c.name;
    const base = { label, type: c.args ? 'function' : 'keyword', detail: c.desc, tex: c.tex };
    const completion: C = c.args ? (snippetCompletion(label + c.args, base) as C) : base;
    return { name: c.name, completion };
  }),
  {
    name: 'begin',
    completion: {
      label: '\\begin',
      type: 'function',
      detail: 'Start an environment (adds \\end)',
      apply: (view, completion, from, to) => {
        snippet(BEGIN_TPL)(view, completion, from, to);
        startCompletion(view); // offer environment names in the first field
      },
    },
  },
  {
    name: 'end',
    completion: {
      label: '\\end',
      type: 'function',
      detail: 'Close the innermost open environment',
      apply: (view, _c, from, to) => {
        const name = openEnvs(view.state.sliceDoc(0, from)).pop();
        const text = `\\end{${name ?? ''}}`;
        view.dispatch({ changes: { from, to, insert: text }, selection: { anchor: from + 5 + (name?.length ?? 0) }, userEvent: 'input.complete' });
        if (!name) {
          view.dispatch({ selection: { anchor: from + 5 } });
          startCompletion(view);
        }
      },
    },
  },
];

function usage(text: string): Map<string, number> {
  const m = new Map<string, number>();
  for (const x of text.matchAll(/\\([a-zA-Z]+\*?)/g)) m.set(x[1], (m.get(x[1]) ?? 0) + 1);
  return m;
}

function definedEnvs(text: string): string[] {
  const names = new Set<string>();
  for (const m of text.matchAll(/\\(?:newtheorem|newenvironment|renewenvironment|provideenvironment|newtcolorbox)\*?\{([A-Za-z*]+)\}/g)) names.add(m[1]);
  return [...names];
}

function openEnvs(textBefore: string): string[] {
  const stack: string[] = [];
  for (const m of textBefore.matchAll(/\\(begin|end)\{([^}]*)\}/g)) {
    if (m[1] === 'begin') stack.push(m[2]);
    else {
      const i = stack.lastIndexOf(m[2]);
      if (i >= 0) stack.splice(i, 1);
    }
  }
  return stack;
}

function source(ctx: CompletionContext): CompletionResult | null {
  const env = ctx.matchBefore(/\\(begin|end)\{[A-Za-z*]*/);
  if (env) {
    const doc = ctx.state.doc.toString();
    const defined = new Set(definedEnvs(doc));
    const inner = env.text.startsWith('\\end') ? openEnvs(doc.slice(0, env.from)).pop() : undefined;
    const names = [...new Set([...(inner ? [inner] : []), ...defined, ...STANDARD_ENVS])];
    return {
      from: env.from + env.text.indexOf('{') + 1,
      options: names.map((n) => ({
        label: n,
        type: 'keyword',
        detail: n === inner ? 'open' : defined.has(n) ? 'this file' : undefined,
        boost: n === inner ? 99 : defined.has(n) ? 10 : 0,
      })),
      validFor: /^[A-Za-z*]*$/,
    };
  }

  const cmd = ctx.matchBefore(/\\[a-zA-Z@]*/);
  if (!cmd) return null;
  if (cmd.from > 0 && ctx.state.sliceDoc(cmd.from - 1, cmd.from) === '\\') return null; // "\\" line break
  const typed = cmd.text.slice(1);
  const freq = usage(ctx.state.doc.toString());
  freq.set(typed, (freq.get(typed) ?? 1) - 1); // do not count the command being typed
  const ranked = items
    .map((it, order) => ({ it, order, tier: it.name.startsWith(typed) ? 0 : it.name.toLowerCase().includes(typed.toLowerCase()) ? 1 : 2 }))
    .filter((x) => x.tier < 2)
    .sort((a, b) => a.tier - b.tier || (freq.get(b.it.name) ?? 0) - (freq.get(a.it.name) ?? 0) || a.order - b.order);
  if (!ranked.length) return null;
  return { from: cmd.from, options: ranked.slice(0, 60).map((x) => x.it.completion), filter: false };
}

const previews = new Map<string, string>();
function preview(tex: string) {
  let h = previews.get(tex);
  if (h === undefined) {
    try {
      h = katex.renderToString(tex, { throwOnError: false, output: 'html' });
    } catch {
      h = '';
    }
    previews.set(tex, h);
  }
  return h;
}

// \[ \( \{ get their escaped closing partner; a doubled backslash (line break) does not count.
const ESCAPED: Record<string, string> = { '[': '\\]', '(': '\\)', '{': '\\}' };
const escapedPairs = EditorView.inputHandler.of((view, from, to, text) => {
  if (from !== to || !ESCAPED[text]) return false;
  const before = view.state.sliceDoc(Math.max(0, from - 20), from);
  const slashes = /\\*$/.exec(before)![0].length;
  if (slashes % 2 !== 1) return false;
  view.dispatch({ changes: { from, insert: text + ESCAPED[text] }, selection: { anchor: from + 1 }, userEvent: 'input.type' });
  return true;
});

const deleteEscapedPair = (view: EditorView) => {
  const { from, to } = view.state.selection.main;
  if (from !== to) return false;
  for (const [open, close] of Object.entries(ESCAPED)) {
    if (view.state.sliceDoc(from - 2, from) === '\\' + open && view.state.sliceDoc(from, from + 2) === close) {
      view.dispatch({ changes: { from: from - 2, to: from + 2 }, selection: { anchor: from - 2 }, userEvent: 'delete.backward' });
      return true;
    }
  }
  return false;
};

export function latexAutocomplete(): Extension {
  return [
    autocompletion({
      override: [source],
      icons: false,
      maxRenderedOptions: 60,
      addToOptions: [
        {
          position: 10,
          render(c) {
            const el = document.createElement('span');
            el.className = 'pp-prev';
            const tex = (c as C).tex;
            if (tex) el.innerHTML = preview(tex);
            return el;
          },
        },
      ],
    }),
    closeBrackets(),
    EditorState.languageData.of(() => [{ closeBrackets: { brackets: ['(', '[', '{', '$'] } }]),
    Prec.highest(escapedPairs),
    Prec.high(keymap.of([{ key: 'Tab', run: acceptCompletion }, { key: 'Backspace', run: deleteEscapedPair }, ...closeBracketsKeymap])),
  ];
}
