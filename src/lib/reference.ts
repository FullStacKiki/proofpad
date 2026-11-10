import type { Sym } from './symbols';

const MARK = '⌖';

/** Snippet with an optional ⌖ marking where the caret goes. */
function D(cat: string, raw: string, name: string, it: string, desc: string, extra: Partial<Sym> = {}): Sym {
  const i = raw.indexOf(MARK);
  return { cat, cmd: raw.replace(MARK, ''), cursor: i < 0 ? undefined : i, name, it, desc, ...extra };
}

const R = String.raw;
const SERIF = "font-family:'Latin Modern Roman','Computer Modern','Times New Roman',serif";

const TF = 'Text formatting';
const FS = 'Font size';
const FF = 'Fonts & packages';
const DS = 'Document structure';
const LI = 'Lists';
const TB = 'Tables';
const ME = 'Math environments';
const TH = 'Theorems';
const SP = 'Spacing & layout';
const BX = 'Boxes & emphasis';
const RF = 'References';
const SC = 'Special characters';

const sizes: [string, number, string, string][] = [
  ['tiny', 5, 'tiny, very small', 'minuscolo, piccolissimo'],
  ['scriptsize', 7, 'script size, very small', 'molto piccolo'],
  ['footnotesize', 8, 'footnote size, small', 'piccolo, nota a piè di pagina'],
  ['small', 9, 'small', 'piccolo'],
  ['normalsize', 10, 'normal size', 'dimensione normale'],
  ['large', 12, 'large', 'grande'],
  ['Large', 14.4, 'larger', 'più grande'],
  ['LARGE', 17.3, 'very large', 'molto grande'],
  ['huge', 20.7, 'huge', 'enorme'],
  ['Huge', 24.9, 'largest', 'gigante, il più grande'],
];

export const DOC_SYMBOLS: Sym[] = [
  // ---- Text formatting
  D(TF, '\\textbf{⌖}', 'bold', 'grassetto, neretto', 'Bold face', { html: '<b>Bold</b>' }),
  D(TF, '\\textit{⌖}', 'italic', 'corsivo', 'Italic shape', { html: '<i>Italic</i>' }),
  D(TF, '\\emph{⌖}', 'emphasis', 'enfasi, evidenziare', 'Italic in upright text, upright inside italics', { html: '<i>Emphasis</i>' }),
  D(TF, '\\underline{⌖}', 'underline', 'sottolineato', 'Underlined text', { html: '<u>Underline</u>' }),
  D(TF, '\\texttt{⌖}', 'monospace, typewriter', 'monospazio, macchina da scrivere', 'Fixed-width font', { html: '<span style="font-family:Menlo,monospace;font-size:.85em">Mono</span>' }),
  D(TF, '\\textsc{⌖}', 'small caps', 'maiuscoletto', 'Small capitals', { html: '<span style="font-variant:small-caps">Small caps</span>' }),
  D(TF, '\\textsf{⌖}', 'sans serif', 'senza grazie, bastoni', 'Sans-serif font', { html: '<span style="font-family:Helvetica,Arial,sans-serif">Sans</span>' }),

  // ---- Font size
  ...sizes.map(([n, pt, name, it]) =>
    D(FS, `{\\${n} ⌖}`, `${name} (${pt}pt)`, it, 'Declaration: the snippet scopes it in braces. Sizes shown for a 10pt document', {
      show: `\\${n}`,
      html: `<span style="font-size:${(pt * 1.3).toFixed(1)}px;line-height:1">Aa</span>`,
    }),
  ),

  // ---- Fonts & packages (preamble)
  D(FF, '\\usepackage{lmodern}', 'Latin Modern', 'font Latin Modern', 'Sharper vector version of the default Computer Modern', { html: `<span style="${SERIF}">Aa</span>` }),
  D(FF, '\\usepackage{mathpazo}', 'Palatino (mathpazo)', 'font Palatino', 'Palatino text and matching math', { html: '<span style="font-family:Palatino,\'Palatino Linotype\',serif">Aa</span>' }),
  D(FF, '\\usepackage{times}', 'Times', 'font Times', 'Times-like text; math stays Computer Modern', { html: '<span style="font-family:\'Times New Roman\',Times,serif">Aa</span>' }),
  D(FF, '\\usepackage{helvet}\n\\renewcommand{\\familydefault}{\\sfdefault}', 'Helvetica, all sans serif', 'font Helvetica, tutto senza grazie', 'Helvetica as the document font', {
    show: '\\usepackage{helvet} + \\sfdefault',
    html: '<span style="font-family:Helvetica,Arial,sans-serif">Aa</span>',
  }),
  D(FF, '\\usepackage{fontspec}\n\\setmainfont{⌖}', 'any system font (fontspec)', 'qualsiasi font di sistema', 'Use an installed font by name; works with Tectonic (XeTeX)', { show: '\\usepackage{fontspec} + \\setmainfont{…}' }),

  // ---- Document structure
  D(DS, '\\documentclass[11pt]{⌖article}', 'document class', 'classe del documento', 'First line of every document', {}),
  D(DS, '\\title{⌖}', 'title', 'titolo', 'Sets the title used by \\maketitle'),
  D(DS, '\\author{⌖}', 'author', 'autore', 'Sets the author used by \\maketitle'),
  D(DS, '\\date{⌖\\today}', 'date', 'data', 'Sets the date; use \\date{} to hide it'),
  D(DS, '\\maketitle', 'print title block', 'stampa il titolo', 'Typesets title, author and date'),
  D(DS, '\\section{⌖}', 'section', 'sezione', 'Numbered section'),
  D(DS, '\\section*{⌖}', 'section (unnumbered)', 'sezione senza numero', 'Section without a number or TOC entry'),
  D(DS, '\\subsection{⌖}', 'subsection', 'sottosezione', 'Numbered subsection'),
  D(DS, '\\subsection*{⌖}', 'subsection (unnumbered)', 'sottosezione senza numero', 'Subsection without a number'),
  D(DS, '\\subsubsection{⌖}', 'subsubsection', 'sotto-sottosezione', 'Numbered third-level heading'),
  D(DS, '\\subsubsection*{⌖}', 'subsubsection (unnumbered)', 'sotto-sottosezione senza numero', 'Third-level heading without a number'),
  D(DS, '\\tableofcontents', 'table of contents', 'indice, sommario', 'Compile twice to update it'),
  D(DS, '\\newpage', 'new page', 'nuova pagina, interruzione di pagina', 'Starts a new page'),
  D(DS, '\\appendix', 'appendix', 'appendice', 'Following sections are lettered A, B, C…'),

  // ---- Lists
  D(LI, '\\begin{itemize}\n  \\item ⌖\n  \\item \n\\end{itemize}', 'bullet list (itemize)', 'elenco puntato', 'Unordered list'),
  D(LI, '\\begin{enumerate}\n  \\item ⌖\n  \\item \n\\end{enumerate}', 'numbered list (enumerate)', 'elenco numerato', 'Ordered list'),
  D(LI, '\\begin{description}\n  \\item[⌖] \n  \\item[] \n\\end{description}', 'description list', 'elenco descrittivo, glossario', 'Term and explanation pairs'),
  D(LI, '\\begin{enumerate}[label=(\\alph*)]\n  \\item ⌖\n  \\item \n\\end{enumerate}', 'custom labels (enumitem)', 'etichette personalizzate, (a) (b)', 'Needs \\usepackage{enumitem}; try label=\\roman*. or label=\\arabic*)'),
  D(LI, '\\usepackage{enumitem}', 'enumitem package', 'pacchetto enumitem', 'Customise list labels and spacing'),

  // ---- Tables
  D(TB, R`\begin{tabular}{|c|c|}
  \hline
  ⌖ &  \\
  \hline
   &  \\
  \hline
\end{tabular}`, 'table (tabular)', 'tabella', 'Columns |c|c| centred with rules; use l or r to align left or right', {
    tex: R`\begin{array}{|c|c|}\hline a & b \\ \hline c & d \\ \hline\end{array}`,
  }),
  D(TB, '\\hline', 'horizontal rule', 'linea orizzontale', 'Line between table rows'),
  D(TB, '\\multicolumn{2}{|c|}{⌖}', 'merge columns', 'unisci colonne', 'Spans cells across columns: \\multicolumn{n}{align}{text}'),
  D(TB, R`\begin{tabular}{c c | c c}
  $p$ & $q$ & $p \land q$ & $p \lor q$ \\
  \hline
  T & T & T & T \\
  T & F & F & T \\
  F & T & F & T \\
  F & F & F & F \\
\end{tabular}`, 'truth table', 'tabella di verità', 'Two variables with AND and OR columns', {
    show: '\\begin{tabular}{c c | c c} …',
    tex: R`\begin{array}{cc|cc} p & q & p\land q & p\lor q \\ \hline T&T&T&T \\ T&F&F&T \\ F&T&F&T \\ F&F&F&F \end{array}`,
  }),

  // ---- Math environments
  D(ME, '$⌖$', 'inline math', 'formula nel testo', 'Math inside a line of text', { tex: 'a^2 + b^2 = c^2' }),
  D(ME, '\\[\n  ⌖\n\\]', 'display math', 'formula in evidenza, centrata', 'Unnumbered centred equation', { tex: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}' }),
  D(ME, '\\begin{equation}\n  ⌖\n\\end{equation}', 'numbered equation', 'equazione numerata', 'Gets a number; add \\label{eq:...} to reference it', { tex: 'E = mc^2 \\quad (1)' }),
  D(ME, R`\begin{align*}
  ⌖ &=  \\
   &= 
\end{align*}`, 'aligned equations (align*)', 'equazioni allineate', 'Align at & ; \\\\ starts a new line; needs amsmath', {
    tex: R`\begin{aligned} a &= b + c \\ &= d \end{aligned}`,
  }),
  D(ME, R`f(x) = \begin{cases}
  ⌖ & \text{if } x \geq 0, \\
   & \text{otherwise.}
\end{cases}`, 'piecewise (cases)', 'funzione a tratti, definizione per casi', 'Case distinction; needs amsmath', {
    tex: R`f(x) = \begin{cases} x & \text{if } x \geq 0 \\ -x & \text{otherwise} \end{cases}`,
  }),
  D(ME, R`\begin{matrix}
  ⌖ &  \\
   & 
\end{matrix}`, 'matrix (no brackets)', 'matrice senza parentesi', 'Needs amsmath', { tex: R`\begin{matrix} a & b \\ c & d \end{matrix}` }),
  D(ME, R`\begin{pmatrix}
  ⌖ &  \\
   & 
\end{pmatrix}`, 'matrix (parentheses)', 'matrice tonda', 'Also bmatrix [ ], vmatrix | |; needs amsmath', { tex: R`\begin{pmatrix} a & b \\ c & d \end{pmatrix}` }),

  // ---- Theorems
  D(TH, '\\newtheorem{⌖theorem}{Theorem}', 'declare a theorem environment', 'definisci un ambiente teorema', 'Preamble; add [section] at the end to number by section'),
  D(TH, '\\theoremstyle{plain}', 'theorem style: plain', 'stile teorema: plain', 'Italic body; for theorems, lemmas, corollaries'),
  D(TH, '\\theoremstyle{definition}', 'theorem style: definition', 'stile teorema: definizione', 'Upright body; for definitions and examples'),
  D(TH, '\\theoremstyle{remark}', 'theorem style: remark', 'stile teorema: osservazione', 'Upright body, italic head; for remarks and notes'),
  D(TH, '\\begin{theorem}[⌖]\n  \n\\end{theorem}', 'theorem environment', 'ambiente teorema', 'Needs \\newtheorem{theorem}{Theorem}'),
  D(TH, '\\begin{proof}[Proof of ⌖]\n  \n\\end{proof}', 'proof with custom title', 'dimostrazione con titolo', 'Ends with a □; omit [..] for plain "Proof."'),
  D(TH, '\\qedhere', 'put the QED box here', 'sposta il quadratino di fine dimostrazione', 'Use at the end of a displayed equation inside a proof'),

  // ---- Spacing & layout
  D(SP, '\\medskip', 'medium vertical gap', 'spazio verticale medio', 'About 6pt'),
  D(SP, '\\bigskip', 'big vertical gap', 'spazio verticale grande', 'About 12pt'),
  D(SP, '\\vspace{⌖1em}', 'vertical space', 'spazio verticale', 'Any length: 1em, 2ex, 5mm'),
  D(SP, '\\hspace{⌖1em}', 'horizontal space', 'spazio orizzontale', 'Any length; use \\hspace*{} at line start'),
  D(SP, '\\quad', 'space of 1em', 'spazio di 1em', 'Also \\qquad for 2em'),
  D(SP, '\\qquad', 'space of 2em', 'spazio di 2em', 'Wide gap in text or math'),
  D(SP, '\\noindent', 'no paragraph indent', 'senza rientro', 'Start a paragraph flush left'),
  D(SP, '\\\\', 'line break', 'a capo', 'Breaks the line but stays in the same paragraph'),
  D(SP, '\n\n', 'blank line = new paragraph', 'riga vuota = nuovo paragrafo', 'A blank line ends the paragraph; \\\\ only breaks the line', { show: '(blank line)' }),
  D(SP, '\\usepackage[margin=⌖1in]{geometry}', 'page margins (geometry)', 'margini della pagina', 'Preamble; also a4paper, landscape, top=, left='),

  // ---- Boxes & emphasis
  D(BX, '\\fbox{⌖}', 'framed box', 'riquadro con bordo', 'Text inside a rectangle', { html: '<span style="border:1px solid currentColor;padding:1px 4px">Boxed</span>' }),
  D(BX, '\\boxed{⌖}', 'boxed formula (math)', 'formula incorniciata', 'Math mode only; needs amsmath', { tex: '\\boxed{x^2 + y^2 = r^2}' }),
  D(BX, '\\colorbox{yellow}{⌖}', 'highlighted text (xcolor)', 'testo evidenziato con colore', 'Needs \\usepackage{xcolor}; also \\textcolor{red}{…}', { html: '<span style="background:#ffeb3b;color:#111;padding:1px 3px">Highlight</span>' }),

  // ---- References
  D(RF, '\\label{⌖}', 'label', 'etichetta', 'Name a section, equation or theorem; e.g. eq:euler'),
  D(RF, '\\ref{⌖}', 'reference (number)', 'riferimento (numero)', 'Prints the number of a label; use ~\\ref{} for a non-breaking space', { html: '1' }),
  D(RF, '\\eqref{⌖}', 'equation reference', 'riferimento a equazione', 'Prints (n) with parentheses; needs amsmath', { html: '(1)' }),
  D(RF, '\\footnote{⌖}', 'footnote', 'nota a piè di pagina', 'Text at the bottom of the page', { html: 'text<sup>1</sup>' }),
  D(RF, '\\cite{⌖}', 'citation', 'citazione bibliografica', 'Refers to a \\bibitem key', { html: '[1]' }),
  D(RF, '\\begin{thebibliography}{9}\n  \\bibitem{⌖key} Author, \\emph{Title}, Publisher, Year.\n\\end{thebibliography}', 'bibliography (basic)', 'bibliografia semplice', 'Put near the end; {9} is the widest label'),

  // ---- Special characters
  D(SC, '\\%', 'percent', 'percento', 'Plain % starts a comment', { html: '%' }),
  D(SC, '\\$', 'dollar', 'dollaro', 'Plain $ starts math', { html: '$' }),
  D(SC, '\\&', 'ampersand', 'e commerciale', 'Plain & separates table cells', { html: '&amp;' }),
  D(SC, '\\#', 'hash', 'cancelletto', 'Number sign', { html: '#' }),
  D(SC, '\\_', 'underscore', 'trattino basso', 'Plain _ is a subscript in math only', { html: '_' }),
  D(SC, '\\{', 'left brace', 'graffa aperta', 'Literal {', { html: '{' }),
  D(SC, '\\}', 'right brace', 'graffa chiusa', 'Literal }', { html: '}' }),
  D(SC, '\\textbackslash', 'backslash', 'barra rovesciata', 'Literal \\', { html: '\\' }),
  D(SC, "``⌖''", 'curly quotes', 'virgolette', 'Two backticks open, two apostrophes close', { html: '&ldquo;quoted&rdquo;' }),
];
