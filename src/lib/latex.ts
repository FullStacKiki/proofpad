import { StreamLanguage, type StreamParser } from '@codemirror/language';
import { Tag } from '@lezer/highlight';

// Own tags so the highlight style can map them to the theme variables directly.
export const tags = {
  cmd: Tag.define('latexCommand'),
  env: Tag.define('latexEnvName'),
  opt: Tag.define('latexOptional'),
  math: Tag.define('latexMath'),
  brace: Tag.define('latexBrace'),
  delim: Tag.define('latexDelimiter'),
  comment: Tag.define('latexComment'),
};

const MATH_ENVS = /^(equation|align|alignat|flalign|gather|multline|eqnarray|displaymath|math)\*?$/;
/** Commands whose first {argument} is a name (environment, section title, package, label...). */
const NAME_CMDS =
  /^(begin|end|part|chapter|section|subsection|subsubsection|paragraph|subparagraph|newtheorem|usepackage|RequirePackage|documentclass|label|ref|eqref|cite|input|include|theoremstyle|pagestyle|bibliographystyle)$/;

interface State {
  /** open math context: '' (text), '$', '$$', '\\[', '\\(' or 'env' */
  math: '' | '$' | '$$' | '\\[' | '\\(' | 'env';
  mathEnv: string;
  /** last name-taking command (begin, end, section...) */
  kind: string;
  /** waiting for the {name} group of a name-taking command */
  want: boolean;
  /** brace depth inside a name group, 0 when outside */
  argDepth: number;
  argText: string;
  /** bracket depth inside an optional [argument] */
  opt: number;
  /** a command or name group just ended, so a following [..] is an optional argument */
  afterCmd: boolean;
}

export const latexParser: StreamParser<State> = {
  name: 'latex',
  startState: () => ({ math: '', mathEnv: '', kind: '', want: false, argDepth: 0, argText: '', opt: 0, afterCmd: false }),
  copyState: (s) => ({ ...s }),
  blankLine(s) {
    if (s.math === '$') s.math = '';
    s.want = false;
    s.argDepth = 0;
    s.opt = 0;
    s.afterCmd = false;
  },
  token(s, st) {
    const ch0 = s.peek();

    // [optional argument] content
    if (st.opt) {
      if (s.eatSpace()) return null;
      const c = s.peek();
      if (c === '%') return s.skipToEnd(), 'comment';
      if (c === '[' || c === ']') {
        s.next();
        st.opt += c === '[' ? 1 : -1;
        return 'brace';
      }
      s.match(/^[^[\]\s%]+/);
      return 'opt';
    }

    // {name} group of begin/end/section/newtheorem...
    if (st.argDepth) {
      if (s.eatSpace()) {
        st.argText += ' ';
        return null;
      }
      const c = s.peek();
      if (c === '%') return s.skipToEnd(), 'comment';
      if (c === '{' || c === '}') {
        s.next();
        st.argDepth += c === '{' ? 1 : -1;
        if (!st.argDepth) {
          const name = st.argText.trim();
          if (st.kind === 'begin' && MATH_ENVS.test(name)) {
            st.math = 'env';
            st.mathEnv = name;
          } else if (st.kind === 'end' && st.math === 'env' && name === st.mathEnv) {
            st.math = '';
          }
          st.afterCmd = true;
        }
        return 'brace';
      }
      st.argText += s.match(/^[^{}\s%]+/) ? s.current() : '';
      return 'env';
    }

    if (st.want) {
      if (s.eatSpace()) return null;
      if (ch0 === '{') {
        s.next();
        st.want = false;
        st.argDepth = 1;
        st.argText = '';
        return 'brace';
      }
      if (ch0 === '[') {
        s.next();
        st.opt = 1;
        return 'brace';
      }
      st.want = false;
    }

    if (s.eatSpace()) return null;
    const was = st.afterCmd;
    st.afterCmd = false;
    const inMath = st.math !== '';
    const ch = s.peek()!;

    if (ch === '%') return s.skipToEnd(), 'comment';
    if (ch === '\\') {
      s.next();
      const m = s.match(/^[a-zA-Z@]+\*?/) as RegExpMatchArray | null;
      if (m) {
        const name = m[0].replace('*', '');
        if (NAME_CMDS.test(name)) {
          st.want = true;
          st.kind = name;
        } else {
          st.afterCmd = !inMath;
        }
        return 'cmd';
      }
      const c = s.next();
      if (!inMath && c === '[') return (st.math = '\\['), 'delim';
      if (!inMath && c === '(') return (st.math = '\\('), 'delim';
      if (st.math === '\\[' && c === ']') return (st.math = ''), 'delim';
      if (st.math === '\\(' && c === ')') return (st.math = ''), 'delim';
      st.afterCmd = !inMath;
      return 'cmd';
    }
    if (ch === '$') {
      s.next();
      if (!inMath) {
        st.math = s.eat('$') ? '$$' : '$';
      } else if (st.math === '$$') {
        s.eat('$');
        st.math = '';
      } else if (st.math === '$') {
        st.math = '';
      }
      return 'delim';
    }
    if (ch === '[' && was && !inMath) {
      s.next();
      st.opt = 1;
      return 'brace';
    }
    if ('{}[]'.includes(ch)) {
      s.next();
      return 'brace';
    }
    if (!s.match(/^[^\\%${}[\]\s]+/)) s.next();
    return inMath ? 'math' : null;
  },
  tokenTable: tags as unknown as Record<string, Tag>,
  languageData: { commentTokens: { line: '%' } },
};

export const latex = StreamLanguage.define(latexParser);
