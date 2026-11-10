import type { Template } from './types';

export default {
  id: 'homework',
  order: 2,
  name: 'Homework submission',
  desc: 'Course header, numbered problems with solutions, "Page X of Y" footer.',
  file: 'homework-1.tex',
  src: String.raw`\documentclass[11pt]{article}

\usepackage[margin=1in, headheight=14pt]{geometry}
\usepackage{amsmath, amssymb, amsthm}
\usepackage{parskip}
\usepackage{fancyhdr}
\usepackage{lastpage}

% --- Fill these in ---
\newcommand{\course}{Discrete Mathematics}
\newcommand{\hwnumber}{1}
\newcommand{\student}{Your Name}
\newcommand{\studentid}{12345678}
\newcommand{\duedate}{January 15, 2027}

\theoremstyle{definition}
\newtheorem{problem}{Problem}
\newenvironment{solution}
  {\begin{proof}[Solution]}
  {\end{proof}}

\pagestyle{fancy}
\fancyhf{}
\lhead{\course}
\rhead{Homework \hwnumber}
\cfoot{Page \thepage\ of \pageref{LastPage}}

\begin{document}

\begin{center}
  {\Large\bfseries \course\ --- Homework \hwnumber}\\[6pt]
  \student\ (ID: \studentid) \qquad Due: \duedate
\end{center}
\hrule
\bigskip

\begin{problem}
Prove that for every integer $n \geq 1$,
\[
  1 + 2 + \cdots + n = \frac{n(n+1)}{2}.
\]
\end{problem}

\begin{solution}
We use induction on $n$. For $n = 1$ both sides equal $1$.
Assume the formula holds for some $k \geq 1$. Then
\[
  1 + \cdots + k + (k+1) = \frac{k(k+1)}{2} + (k+1) = \frac{(k+1)(k+2)}{2},
\]
which is the formula for $k + 1$.
\end{solution}

\begin{problem}
Show that if $n^2$ is even, then $n$ is even.
\end{problem}

\begin{solution}
We prove the contrapositive. Suppose $n = 2m + 1$ is odd. Then
$n^2 = 2(2m^2 + 2m) + 1$ is odd.
\end{solution}

\end{document}
`,
} satisfies Template;
