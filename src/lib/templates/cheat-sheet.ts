import type { Template } from './types';

export default {
  id: 'cheat-sheet',
  order: 4,
  name: 'Cheat sheet',
  desc: 'Landscape A4, three columns, small type and boxed sections for printing.',
  file: 'cheat-sheet.tex',
  src: String.raw`\documentclass[10pt]{article}

\usepackage[a4paper, landscape, margin=8mm]{geometry}
\usepackage{amsmath, amssymb, amsthm}
\usepackage{multicol}
\usepackage{enumitem}
\usepackage[breakable]{tcolorbox}

\pagestyle{empty}
\setlength{\parindent}{0pt}
\setlength{\parskip}{1pt}
\setlength{\columnsep}{8pt}
\setlength{\columnseprule}{0.2pt}
\setlist{nosep, leftmargin=*}
\AtBeginDocument{%
  \scriptsize
  \setlength{\abovedisplayskip}{2pt}
  \setlength{\belowdisplayskip}{2pt}
  \setlength{\abovedisplayshortskip}{1pt}
  \setlength{\belowdisplayshortskip}{1pt}%
}

% Boxed section: \begin{sheetbox}{Title} ... \end{sheetbox}
\newtcolorbox{sheetbox}[1]{%
  breakable, colback=white, colframe=black, boxrule=0.4pt, arc=1pt,
  left=2pt, right=2pt, top=1pt, bottom=1pt, boxsep=1pt,
  before skip=3pt, after skip=3pt,
  title={#1}, fonttitle=\bfseries\scriptsize}

\begin{document}
\begin{multicols}{3}

\begin{sheetbox}{Algebra}
\begin{itemize}
  \item $(a+b)^2 = a^2 + 2ab + b^2$
  \item $a^2 - b^2 = (a-b)(a+b)$
  \item Quadratic: $x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}$
  \item $\log_a(xy) = \log_a x + \log_a y$
\end{itemize}
\end{sheetbox}

\begin{sheetbox}{Sums}
\[ \sum_{i=1}^{n} i = \frac{n(n+1)}{2}, \qquad \sum_{i=1}^{n} i^2 = \frac{n(n+1)(2n+1)}{6} \]
\[ \sum_{i=0}^{n} r^i = \frac{1 - r^{n+1}}{1 - r} \quad (r \neq 1) \]
\end{sheetbox}

\begin{sheetbox}{Calculus}
\begin{itemize}
  \item $(x^n)' = nx^{n-1}$, \quad $(e^x)' = e^x$, \quad $(\ln x)' = 1/x$
  \item $(fg)' = f'g + fg'$
  \item $\displaystyle \int x^n\,dx = \frac{x^{n+1}}{n+1} + C \quad (n \neq -1)$
\end{itemize}
\end{sheetbox}

\begin{sheetbox}{Logic and sets}
\begin{itemize}
  \item $\neg(p \land q) \equiv \neg p \lor \neg q$
  \item $\neg(p \lor q) \equiv \neg p \land \neg q$
  \item $p \to q \equiv \neg p \lor q$
  \item $\overline{A \cup B} = \overline{A} \cap \overline{B}$
\end{itemize}
\end{sheetbox}

\begin{sheetbox}{Counting}
\[ \binom{n}{k} = \frac{n!}{k!\,(n-k)!}, \qquad \binom{n}{k} = \binom{n-1}{k-1} + \binom{n-1}{k} \]
\end{sheetbox}

\end{multicols}
\end{document}
`,
} satisfies Template;
