export interface Sym {
  cat: string;
  /** LaTeX inserted into the document */
  cmd: string;
  name: string;
  /** Italian name, searchable */
  it: string;
  /** Unicode glyph, searchable */
  u?: string;
  /** KaTeX source for the preview; defaults to `cmd` */
  tex?: string;
  /** Caret offset within `cmd` after insertion */
  cursor?: number;
  /** Static HTML preview (used instead of KaTeX, e.g. for text formatting) */
  html?: string;
  /** One-line note shown under the name */
  desc?: string;
  /** Label shown instead of `cmd` (when the inserted snippet is longer) */
  show?: string;
  group?: string;
}

export const S = (cat: string, cmd: string, name: string, it: string, u?: string, extra: Partial<Sym> = {}): Sym => ({ cat, cmd, name, it, u, ...extra });

export const SYMBOLS: Sym[] = [
  S('Logic', '\\forall', 'for all', 'per ogni', '∀'),
  S('Logic', '\\exists', 'there exists', 'esiste', '∃'),
  S('Logic', '\\nexists', 'there does not exist', 'non esiste', '∄'),
  S('Logic', '\\neg', 'not', 'negazione', '¬'),
  S('Logic', '\\land', 'and', 'e, congiunzione', '∧'),
  S('Logic', '\\lor', 'or', 'o, disgiunzione', '∨'),
  S('Logic', '\\to', 'implies, maps to', 'implica, freccia', '→'),
  S('Logic', '\\leftrightarrow', 'double arrow', 'doppia freccia', '↔'),
  S('Logic', '\\implies', 'implies (long)', 'implica', '⟹'),
  S('Logic', '\\iff', 'if and only if', 'se e solo se', '⟺'),
  S('Logic', '\\oplus', 'xor, direct sum', 'o esclusivo, somma diretta', '⊕'),
  S('Logic', '\\top', 'true', 'vero', '⊤'),
  S('Logic', '\\bot', 'false, contradiction', 'falso, contraddizione', '⊥'),

  S('Sets', '\\in', 'element of', 'appartiene', '∈'),
  S('Sets', '\\notin', 'not an element of', 'non appartiene', '∉'),
  S('Sets', '\\subseteq', 'subset or equal', 'sottoinsieme o uguale', '⊆'),
  S('Sets', '\\subset', 'proper subset', 'sottoinsieme proprio', '⊂'),
  S('Sets', '\\supseteq', 'superset or equal', 'sovrainsieme', '⊇'),
  S('Sets', '\\cup', 'union', 'unione', '∪'),
  S('Sets', '\\cap', 'intersection', 'intersezione', '∩'),
  S('Sets', '\\setminus', 'set difference', 'differenza di insiemi', '∖'),
  S('Sets', '\\emptyset', 'empty set', 'insieme vuoto', '∅'),
  S('Sets', '\\mathcal{P}(A)', 'power set', 'insieme delle parti', '𝒫'),
  S('Sets', '\\overline{A}', 'complement', 'complementare'),
  S('Sets', '\\times', 'cartesian product', 'prodotto cartesiano', '×'),

  S('Number sets', '\\mathbb{N}', 'natural numbers', 'numeri naturali', 'ℕ'),
  S('Number sets', '\\mathbb{Z}', 'integers', 'numeri interi', 'ℤ'),
  S('Number sets', '\\mathbb{Z}^+', 'positive integers', 'interi positivi', 'ℤ'),
  S('Number sets', '\\mathbb{Q}', 'rationals', 'numeri razionali', 'ℚ'),
  S('Number sets', '\\mathbb{R}', 'reals', 'numeri reali', 'ℝ'),

  S('Relations', '=', 'equals', 'uguale'),
  S('Relations', '\\neq', 'not equal', 'diverso', '≠'),
  S('Relations', '<', 'less than', 'minore'),
  S('Relations', '>', 'greater than', 'maggiore'),
  S('Relations', '\\leq', 'less than or equal', 'minore o uguale', '≤'),
  S('Relations', '\\geq', 'greater than or equal', 'maggiore o uguale', '≥'),
  S('Relations', '\\equiv', 'equivalent, congruent', 'equivalente, congruo', '≡'),
  S('Relations', '\\approx', 'approximately', 'circa, approssimativamente', '≈'),

  S('Functions', 'f\\colon A \\to B', 'function from A to B', 'funzione da A a B'),
  S('Functions', '\\circ', 'composition', 'composizione', '∘'),
  S('Functions', 'f^{-1}', 'inverse', 'inversa'),
  S('Functions', '\\lfloor x \\rfloor', 'floor', 'parte intera inferiore', '⌊'),
  S('Functions', '\\lceil x \\rceil', 'ceiling', 'parte intera superiore', '⌈'),
  S('Functions', '|x|', 'absolute value', 'valore assoluto'),
  S('Functions', 'n!', 'factorial', 'fattoriale'),

  S('Operators', '\\cdot', 'multiplication dot', 'prodotto', '·'),
  S('Operators', '\\times', 'multiplication, cross', 'moltiplicazione', '×'),
  S('Operators', '\\pm', 'plus or minus', 'più o meno', '±'),
  S('Operators', '\\mp', 'minus or plus', 'meno o più', '∓'),
  S('Operators', '\\frac{a}{b}', 'fraction', 'frazione'),
  S('Operators', '\\sqrt{x}', 'square root', 'radice quadrata', '√'),
  S('Operators', '\\sqrt[n]{x}', 'nth root', 'radice n-esima'),
  S('Operators', 'x^{n}', 'superscript, power', 'apice, potenza'),
  S('Operators', 'x_{n}', 'subscript', 'pedice'),
  S('Operators', '\\sum_{i=1}^{n}', 'sum', 'sommatoria', '∑'),
  S('Operators', '\\prod', 'product', 'produttoria', '∏'),
  S('Operators', '\\infty', 'infinity', 'infinito', '∞'),

  S('Text in math', '\\text{ or }', 'or, in words', 'oppure', undefined, { tex: 'a \\text{ or } b' }),
  S('Text in math', '\\text{ and }', 'and, in words', 'e, in parole', undefined, { tex: 'a \\text{ and } b' }),
  S('Text in math', '\\qquad', 'wide space', 'spazio largo', undefined, { tex: 'a \\qquad b' }),

  S('Proof structure', '\\begin{proof}\n  \n\\end{proof}', 'proof environment', 'ambiente dimostrazione', undefined, { tex: '', cursor: 16 }),
  S('Proof structure', '\\therefore', 'therefore', 'quindi, dunque', '∴'),
  S('Proof structure', '\\blacksquare', 'end of proof (QED)', 'fine dimostrazione', '■'),
];
