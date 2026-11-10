import { CATALOG } from './catalog';

export interface Cmd {
  name: string;
  /** Snippet arguments appended after \name, CodeMirror syntax: {${1}}{${2}} */
  args?: string;
  desc: string;
  /** KaTeX source for the preview (math symbols and constructs) */
  tex?: string;
}

const A1 = '{${1}}';
const A2 = '{${1}}{${2}}';

// Constructs that take arguments
const WITH_ARGS: Cmd[] = [
  { name: 'documentclass', args: '[${1:11pt}]{${2:article}}', desc: 'Document class' },
  { name: 'usepackage', args: A1, desc: 'Load a package' },
  { name: 'title', args: A1, desc: 'Document title' },
  { name: 'author', args: A1, desc: 'Document author' },
  { name: 'date', args: '{${1:\\today}}', desc: 'Document date' },
  { name: 'section', args: A1, desc: 'Numbered section' },
  { name: 'section*', args: A1, desc: 'Unnumbered section' },
  { name: 'subsection', args: A1, desc: 'Numbered subsection' },
  { name: 'subsection*', args: A1, desc: 'Unnumbered subsection' },
  { name: 'subsubsection', args: A1, desc: 'Numbered third-level heading' },
  { name: 'subsubsection*', args: A1, desc: 'Unnumbered third-level heading' },
  { name: 'paragraph', args: A1, desc: 'Run-in paragraph heading' },
  { name: 'label', args: A1, desc: 'Name a section, equation or theorem' },
  { name: 'ref', args: A1, desc: 'Reference to a label' },
  { name: 'eqref', args: A1, desc: 'Equation reference with parentheses' },
  { name: 'cite', args: A1, desc: 'Citation' },
  { name: 'footnote', args: A1, desc: 'Footnote' },
  { name: 'textbf', args: A1, desc: 'Bold text' },
  { name: 'textit', args: A1, desc: 'Italic text' },
  { name: 'emph', args: A1, desc: 'Emphasis' },
  { name: 'underline', args: A1, desc: 'Underlined text' },
  { name: 'texttt', args: A1, desc: 'Monospace text' },
  { name: 'textsc', args: A1, desc: 'Small caps' },
  { name: 'textsf', args: A1, desc: 'Sans-serif text' },
  { name: 'text', args: A1, desc: 'Text inside math' },
  { name: 'textcolor', args: '{${1:red}}{${2}}', desc: 'Coloured text (xcolor)' },
  { name: 'colorbox', args: '{${1:yellow}}{${2}}', desc: 'Highlighted text (xcolor)' },
  { name: 'fbox', args: A1, desc: 'Framed box' },
  { name: 'boxed', args: A1, desc: 'Boxed formula', tex: '\\boxed{x}' },
  { name: 'mathbb', args: A1, desc: 'Blackboard bold', tex: '\\mathbb{R}' },
  { name: 'mathcal', args: A1, desc: 'Calligraphic letters', tex: '\\mathcal{P}' },
  { name: 'mathrm', args: A1, desc: 'Upright text in math', tex: '\\mathrm{d}x' },
  { name: 'mathbf', args: A1, desc: 'Bold in math', tex: '\\mathbf{v}' },
  { name: 'mathit', args: A1, desc: 'Italic in math', tex: '\\mathit{ab}' },
  { name: 'mathsf', args: A1, desc: 'Sans-serif in math', tex: '\\mathsf{A}' },
  { name: 'mathfrak', args: A1, desc: 'Fraktur letters', tex: '\\mathfrak{g}' },
  { name: 'operatorname', args: A1, desc: 'Custom operator name', tex: '\\operatorname{rank}' },
  { name: 'frac', args: A2, desc: 'Fraction', tex: '\\frac{a}{b}' },
  { name: 'dfrac', args: A2, desc: 'Display-size fraction', tex: '\\dfrac{a}{b}' },
  { name: 'tfrac', args: A2, desc: 'Text-size fraction', tex: '\\tfrac{a}{b}' },
  { name: 'binom', args: A2, desc: 'Binomial coefficient', tex: '\\binom{n}{k}' },
  { name: 'sqrt', args: A1, desc: 'Square root', tex: '\\sqrt{x}' },
  { name: 'overline', args: A1, desc: 'Overline, complement', tex: '\\overline{A}' },
  { name: 'hat', args: A1, desc: 'Hat accent', tex: '\\hat{x}' },
  { name: 'widehat', args: A1, desc: 'Wide hat accent', tex: '\\widehat{xy}' },
  { name: 'bar', args: A1, desc: 'Bar accent', tex: '\\bar{x}' },
  { name: 'tilde', args: A1, desc: 'Tilde accent', tex: '\\tilde{x}' },
  { name: 'vec', args: A1, desc: 'Vector arrow', tex: '\\vec{v}' },
  { name: 'dot', args: A1, desc: 'Dot accent', tex: '\\dot{x}' },
  { name: 'ddot', args: A1, desc: 'Double dot accent', tex: '\\ddot{x}' },
  { name: 'left', args: '${1:(} ${2} \\right${3:)}', desc: 'Auto-sized left delimiter (with \\right)', tex: '\\left( \\frac{a}{b} \\right)' },
  { name: 'sum', args: '_{${1:i=1}}^{${2:n}}', desc: 'Sum', tex: '\\sum_{i=1}^{n}' },
  { name: 'prod', args: '_{${1:i=1}}^{${2:n}}', desc: 'Product', tex: '\\prod_{i=1}^{n}' },
  { name: 'int', args: '_{${1:a}}^{${2:b}}', desc: 'Integral', tex: '\\int_a^b' },
  { name: 'lim', args: '_{${1:x \\to \\infty}}', desc: 'Limit', tex: '\\lim_{x \\to \\infty}' },
  { name: 'pmod', args: A1, desc: 'Congruence modulus', tex: 'a \\equiv b \\pmod{n}' },
  { name: 'newtheorem', args: '{${1}}{${2}}', desc: 'Declare a theorem-like environment' },
  { name: 'theoremstyle', args: '{${1:definition}}', desc: 'plain, definition or remark' },
  { name: 'newcommand', args: '{\\${1}}[${2:0}]{${3}}', desc: 'Define a new command' },
  { name: 'renewcommand', args: '{\\${1}}{${2}}', desc: 'Redefine a command' },
  { name: 'newenvironment', args: '{${1}}{${2}}{${3}}', desc: 'Define a new environment' },
  { name: 'multicolumn', args: '{${1:2}}{${2:c}}{${3}}', desc: 'Merge table columns' },
  { name: 'vspace', args: '{${1:1em}}', desc: 'Vertical space' },
  { name: 'hspace', args: '{${1:1em}}', desc: 'Horizontal space' },
  { name: 'includegraphics', args: '[width=${1:0.5\\linewidth}]{${2}}', desc: 'Insert an image (graphicx)' },
  { name: 'caption', args: A1, desc: 'Figure or table caption' },
];

// Plain commands: name -> description
const PLAIN: [string, string][] = [
  ['maketitle', 'Typeset title, author and date'], ['tableofcontents', 'Table of contents'], ['newpage', 'Start a new page'],
  ['appendix', 'Switch to appendices'], ['item', 'List item'], ['hline', 'Horizontal table rule'], ['centering', 'Centre the content'],
  ['medskip', 'Medium vertical gap'], ['bigskip', 'Big vertical gap'], ['smallskip', 'Small vertical gap'], ['noindent', 'No paragraph indent'],
  ['quad', 'Space of 1em'], ['qquad', 'Space of 2em'], ['qedhere', 'Place the QED box here'], ['today', "Today's date"],
  ['tiny', 'Font size: tiny'], ['scriptsize', 'Font size: script'], ['footnotesize', 'Font size: footnote'], ['small', 'Font size: small'],
  ['normalsize', 'Font size: normal'], ['large', 'Font size: large'], ['Large', 'Font size: larger'], ['LARGE', 'Font size: very large'],
  ['huge', 'Font size: huge'], ['Huge', 'Font size: largest'],
  ...['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'varepsilon', 'zeta', 'eta', 'theta', 'vartheta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi', 'varpi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'varphi', 'chi', 'psi', 'omega', 'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma', 'Upsilon', 'Phi', 'Psi', 'Omega'].map(
    (g): [string, string] => [g, `Greek ${g}`],
  ),
  ['cdot', 'Multiplication dot'], ['times', 'Multiplication, product'], ['div', 'Division'], ['pm', 'Plus or minus'], ['mp', 'Minus or plus'],
  ['leq', 'Less than or equal'], ['geq', 'Greater than or equal'], ['neq', 'Not equal'], ['approx', 'Approximately'], ['equiv', 'Equivalent, congruent'],
  ['sim', 'Similar'], ['simeq', 'Similar or equal'], ['cong', 'Congruent'], ['propto', 'Proportional to'], ['ll', 'Much less'], ['gg', 'Much greater'],
  ['subset', 'Proper subset'], ['subseteq', 'Subset or equal'], ['supset', 'Proper superset'], ['supseteq', 'Superset or equal'],
  ['in', 'Element of'], ['notin', 'Not an element of'], ['ni', 'Contains as element'], ['cup', 'Union'], ['cap', 'Intersection'],
  ['setminus', 'Set difference'], ['emptyset', 'Empty set'], ['varnothing', 'Empty set (slashed)'],
  ['forall', 'For all'], ['exists', 'There exists'], ['nexists', 'There does not exist'], ['neg', 'Not'], ['land', 'And'], ['lor', 'Or'],
  ['oplus', 'XOR, direct sum'], ['otimes', 'Tensor product'], ['top', 'True'], ['bot', 'False'],
  ['to', 'Arrow, implies'], ['mapsto', 'Maps to'], ['implies', 'Implies'], ['iff', 'If and only if'], ['Rightarrow', 'Double right arrow'],
  ['Leftarrow', 'Double left arrow'], ['Leftrightarrow', 'Double two-way arrow'], ['rightarrow', 'Right arrow'], ['leftarrow', 'Left arrow'],
  ['leftrightarrow', 'Two-way arrow'], ['longrightarrow', 'Long right arrow'], ['uparrow', 'Up arrow'], ['downarrow', 'Down arrow'],
  ['infty', 'Infinity'], ['partial', 'Partial derivative'], ['nabla', 'Nabla, gradient'], ['ldots', 'Low dots'], ['cdots', 'Centred dots'],
  ['vdots', 'Vertical dots'], ['ddots', 'Diagonal dots'], ['therefore', 'Therefore'], ['because', 'Because'], ['blacksquare', 'End of proof'],
  ['circ', 'Composition'], ['lfloor', 'Left floor'], ['rfloor', 'Right floor'], ['lceil', 'Left ceiling'], ['rceil', 'Right ceiling'],
  ['langle', 'Left angle bracket'], ['rangle', 'Right angle bracket'], ['mid', 'Divides, such that'], ['nmid', 'Does not divide'],
  ['parallel', 'Parallel'], ['perp', 'Perpendicular'], ['angle', 'Angle'], ['triangle', 'Triangle'], ['prime', 'Prime'], ['aleph', 'Aleph'],
  ['hbar', 'Reduced Planck constant'], ['ell', 'Script l'], ['Re', 'Real part'], ['Im', 'Imaginary part'],
  ['log', 'Logarithm'], ['ln', 'Natural logarithm'], ['exp', 'Exponential'], ['sin', 'Sine'], ['cos', 'Cosine'], ['tan', 'Tangent'], ['cot', 'Cotangent'],
  ['arcsin', 'Inverse sine'], ['arccos', 'Inverse cosine'], ['arctan', 'Inverse tangent'], ['sinh', 'Hyperbolic sine'], ['cosh', 'Hyperbolic cosine'],
  ['tanh', 'Hyperbolic tangent'], ['max', 'Maximum'], ['min', 'Minimum'], ['sup', 'Supremum'], ['inf', 'Infimum'], ['limsup', 'Limit superior'],
  ['liminf', 'Limit inferior'], ['gcd', 'Greatest common divisor'], ['det', 'Determinant'], ['dim', 'Dimension'], ['ker', 'Kernel'], ['deg', 'Degree'],
  ['arg', 'Argument'], ['Pr', 'Probability'], ['bmod', 'Binary modulo'], ['mod', 'Modulo'],
];

// Reuse the Option+G reference: its English names describe commands, and any simple \command we did not list is added.
const refByCmd = new Map(CATALOG.map((s) => [s.cmd, s]));

export const COMMANDS: Cmd[] = (() => {
  const seen = new Set<string>();
  const out: Cmd[] = [];
  const push = (c: Cmd) => {
    if (seen.has(c.name)) return;
    seen.add(c.name);
    out.push(c);
  };
  for (const c of WITH_ARGS) push(c);
  for (const [name, desc] of PLAIN) {
    const ref = refByCmd.get('\\' + name);
    const math = ref?.group === 'Math symbols' || /^[a-zA-Z]+$/.test(name) && !ref && !/^(maketitle|tableofcontents|newpage|appendix|item|hline|centering|medskip|bigskip|smallskip|noindent|quad|qquad|qedhere|today|tiny|scriptsize|footnotesize|small|normalsize|large|Large|LARGE|huge|Huge)$/.test(name);
    push({ name, desc: ref?.name ? ref.name[0].toUpperCase() + ref.name.slice(1) : desc, tex: math ? '\\' + name : undefined });
  }
  for (const s of CATALOG) {
    const m = /^\\([a-zA-Z]+)$/.exec(s.cmd);
    if (m && s.group === 'Math symbols') push({ name: m[1], desc: s.name[0].toUpperCase() + s.name.slice(1), tex: s.cmd });
  }
  return out;
})();

export const STANDARD_ENVS = [
  'itemize', 'enumerate', 'description', 'align*', 'align', 'equation', 'equation*', 'gather*', 'multline*', 'cases', 'matrix', 'pmatrix', 'bmatrix',
  'vmatrix', 'array', 'tabular', 'center', 'figure', 'table', 'tikzpicture', 'proof', 'theorem', 'lemma', 'corollary', 'proposition', 'definition',
  'example', 'remark', 'exercise', 'solution', 'scratch', 'document', 'abstract', 'quote', 'verbatim', 'minipage', 'split', 'multicols', 'frame',
];
