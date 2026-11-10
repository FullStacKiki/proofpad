import type { Template } from './types';

export default {
  id: 'logic-sets',
  order: 5,
  name: 'Logic & sets',
  desc: 'Truth table, chain of equivalences with law names, membership table.',
  file: 'logic-sets.tex',
  src: String.raw`\documentclass[11pt]{article}

\usepackage[margin=1in]{geometry}
\usepackage{amsmath, amssymb, amsthm}
\usepackage{array}
\usepackage{parskip}

\theoremstyle{definition}
\newtheorem{exercise}{Exercise}
\newenvironment{solution}
  {\begin{proof}[Solution]}
  {\end{proof}}

\newcommand{\T}{\mathrm{T}}
\newcommand{\F}{\mathrm{F}}

\title{Logic and Sets}
\author{Your Name}
\date{\today}

\begin{document}
\maketitle

\section*{Truth table}

\begin{exercise}
Show that $p \to q$ is logically equivalent to $\neg p \lor q$.
\end{exercise}

\begin{solution}
The last two columns agree in every row.
\begin{center}
\begin{tabular}{c c | c c c}
  $p$ & $q$ & $p \to q$ & $\neg p$ & $\neg p \lor q$ \\
  \hline
  T & T & T & F & T \\
  T & F & F & F & F \\
  F & T & T & T & T \\
  F & F & T & T & T \\
\end{tabular}
\end{center}
\end{solution}

\section*{Chain of equivalences}

\begin{exercise}
Simplify $\neg(p \lor q) \land p$.
\end{exercise}

\begin{solution}
\begin{align*}
  \neg(p \lor q) \land p
    &\equiv (\neg p \land \neg q) \land p && \text{(De Morgan)} \\
    &\equiv \neg q \land (\neg p \land p) && \text{(associativity, commutativity)} \\
    &\equiv \neg q \land \F               && \text{(negation law)} \\
    &\equiv \F                            && \text{(domination law)}
\end{align*}
\end{solution}

\section*{Membership table}

\begin{exercise}
Prove that $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$.
\end{exercise}

\begin{solution}
Write $1$ if an element belongs to the set and $0$ otherwise. The two highlighted columns are identical.
\begin{center}
\begin{tabular}{c c c | c | c | c c | c}
  $A$ & $B$ & $C$ & $B \cup C$ & $A \cap (B \cup C)$ & $A \cap B$ & $A \cap C$ & $(A \cap B) \cup (A \cap C)$ \\
  \hline
  0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 \\
  0 & 0 & 1 & 1 & 0 & 0 & 0 & 0 \\
  0 & 1 & 0 & 1 & 0 & 0 & 0 & 0 \\
  0 & 1 & 1 & 1 & 0 & 0 & 0 & 0 \\
  1 & 0 & 0 & 0 & 0 & 0 & 0 & 0 \\
  1 & 0 & 1 & 1 & 1 & 0 & 1 & 1 \\
  1 & 1 & 0 & 1 & 1 & 1 & 0 & 1 \\
  1 & 1 & 1 & 1 & 1 & 1 & 1 & 1 \\
\end{tabular}
\end{center}
\end{solution}

\end{document}
`,
} satisfies Template;
