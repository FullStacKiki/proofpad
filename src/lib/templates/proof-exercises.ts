import type { Template } from './types';

// TODO: replace with your own preamble (the template you pasted earlier was still the placeholder).
export default {
  id: 'proof-exercises',
  order: 1,
  name: 'Proof exercises',
  desc: 'Exercises with scratch work and solutions.',
  file: 'proof-exercises.tex',
  src: String.raw`\documentclass[11pt]{article}

\usepackage[margin=1in]{geometry}
\usepackage{amsmath, amssymb, amsthm}
\usepackage{parskip}

\theoremstyle{definition}
\newtheorem{exercise}{Exercise}
\theoremstyle{remark}
\newtheorem*{remark}{Remark}

% Rough work, set apart from the final answer.
\newenvironment{scratch}
  {\begin{quote}\small\textit{Scratch work.}\par}
  {\end{quote}}

% A solution is a proof headed "Solution".
\newenvironment{solution}
  {\begin{proof}[Solution]}
  {\end{proof}}

\title{Proof Exercises}
\author{Your Name}
\date{\today}

\begin{document}
\maketitle

\begin{exercise}
Show that the sum of two even integers is even.
\end{exercise}

\begin{scratch}
Write $a = 2m$ and $b = 2n$, then factor out the $2$.
\end{scratch}

\begin{solution}
Let $a = 2m$ and $b = 2n$ for integers $m, n$. Then $a + b = 2(m + n)$, which is even.
\end{solution}

\begin{remark}
The same argument shows that any integer combination of even integers is even.
\end{remark}

\end{document}
`,
} satisfies Template;
