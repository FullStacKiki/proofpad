import type { Template } from './types';

export default {
  id: 'beamer-slides',
  order: 7,
  name: 'Beamer slides',
  desc: 'Clean slides: title, theorem with proof, bullet points.',
  file: 'slides.tex',
  src: String.raw`\documentclass[aspectratio=169]{beamer}

\usepackage{amsmath, amssymb, amsthm}

\usetheme{default}
\setbeamertemplate{navigation symbols}{}
\setbeamertemplate{footline}[frame number]

\title{Presentation Title}
\author{Your Name}
\date{\today}

\begin{document}

\begin{frame}
  \titlepage
\end{frame}

\begin{frame}{A theorem}
  \begin{theorem}
    $\sqrt{2}$ is irrational.
  \end{theorem}
  \begin{proof}
    Suppose $\sqrt{2} = a/b$ in lowest terms. Then $a^2 = 2b^2$, so $a$ is even, say $a = 2c$.
    Then $b^2 = 2c^2$, so $b$ is even too, contradicting lowest terms.
  \end{proof}
\end{frame}

\begin{frame}{Key points}
  \begin{itemize}
    \item First point
    \item Second point, with math: $e^{i\pi} + 1 = 0$
    \item Third point
  \end{itemize}
\end{frame}

\end{document}
`,
} satisfies Template;
