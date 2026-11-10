import type { Template } from './types';

export default {
  id: 'calculus-notes',
  order: 6,
  name: 'Calculus notes',
  desc: 'Limits, derivatives and integrals with boxed formulas and a pgfplots graph.',
  file: 'calculus-notes.tex',
  src: String.raw`\documentclass[11pt]{article}

\usepackage[margin=1in]{geometry}
\usepackage{amsmath, amssymb, amsthm}
\usepackage{parskip}
\usepackage{pgfplots}
\pgfplotsset{compat=1.17}

\theoremstyle{definition}
\newtheorem{example}{Example}[section]

\title{Calculus Notes}
\author{Your Name}
\date{\today}

\begin{document}
\maketitle

\section{Limits}

\[
  \boxed{\lim_{x \to 0} \frac{\sin x}{x} = 1}
\]

\begin{example}
$\displaystyle \lim_{x \to 2} \frac{x^2 - 4}{x - 2} = \lim_{x \to 2} (x + 2) = 4.$
\end{example}

\section{Derivatives}

\[
  \boxed{f'(a) = \lim_{h \to 0} \frac{f(a+h) - f(a)}{h}}
  \qquad
  \boxed{(x^n)' = n x^{n-1}}
\]

\begin{example}
By the product rule, $(x^2 \sin x)' = 2x \sin x + x^2 \cos x$.
\end{example}

The tangent to $f(x) = x^2$ at $x = 1$ is $y = 2x - 1$.

\begin{center}
\begin{tikzpicture}
\begin{axis}[
  axis lines=middle, xlabel=$x$, ylabel=$y$,
  domain=-2:3, samples=100, ymin=-2, ymax=6,
  width=0.7\linewidth, legend pos=north west]
  \addplot[thick, blue] {x^2};
  \addlegendentry{$f(x) = x^2$}
  \addplot[dashed, red] {2*x - 1};
  \addlegendentry{tangent at $x = 1$}
\end{axis}
\end{tikzpicture}
\end{center}

\section{Integrals}

\[
  \boxed{\int x^n \, dx = \frac{x^{n+1}}{n+1} + C \quad (n \neq -1)}
\]

\[
  \boxed{\int_a^b f'(x) \, dx = f(b) - f(a)}
\]

\begin{example}
$\displaystyle \int_0^1 x^2 \, dx = \left[\frac{x^3}{3}\right]_0^1 = \frac{1}{3}.$
\end{example}

\end{document}
`,
} satisfies Template;
