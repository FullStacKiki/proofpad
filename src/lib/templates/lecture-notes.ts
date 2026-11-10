import type { Template } from './types';

export default {
  id: 'lecture-notes',
  order: 3,
  name: 'Lecture notes',
  desc: 'One section per lecture, environments numbered by section, table of contents.',
  file: 'lecture-notes.tex',
  src: String.raw`\documentclass[11pt]{article}

\usepackage[margin=1in]{geometry}
\usepackage{amsmath, amssymb, amsthm}
\usepackage{parskip}

% Numbered by section, all sharing one counter.
\newtheorem{theorem}{Theorem}[section]
\newtheorem{lemma}[theorem]{Lemma}
\newtheorem{corollary}[theorem]{Corollary}
\theoremstyle{definition}
\newtheorem{definition}[theorem]{Definition}
\newtheorem{example}[theorem]{Example}

\title{Number Theory: Lecture Notes}
\author{Your Name}
\date{\today}

\begin{document}
\maketitle
\tableofcontents
\bigskip

\section{Lecture 1: Divisibility and primes}

\begin{definition}
An integer $a$ \emph{divides} an integer $b$, written $a \mid b$, if $b = ak$ for some integer $k$.
An integer $p > 1$ is \emph{prime} if its only positive divisors are $1$ and $p$.
\end{definition}

\begin{lemma}
If $a \mid b$ and $a \mid c$, then $a \mid (bx + cy)$ for all integers $x, y$.
\end{lemma}

\begin{proof}
Write $b = ak$ and $c = al$. Then $bx + cy = a(kx + ly)$.
\end{proof}

\begin{theorem}[Euclid]
There are infinitely many primes.
\end{theorem}

\begin{proof}
Suppose $p_1, \dots, p_n$ were all the primes and let $N = p_1 \cdots p_n + 1$.
No $p_i$ divides $N$, so any prime factor of $N$ is a new prime, a contradiction.
\end{proof}

\begin{corollary}
There is no largest prime.
\end{corollary}

\begin{example}
$2 \cdot 3 \cdot 5 \cdot 7 + 1 = 211$ is prime, while $2 \cdot 3 \cdot 5 \cdot 7 \cdot 11 \cdot 13 + 1 = 30031 = 59 \cdot 509$.
\end{example}

\section{Lecture 2: Congruences}

\begin{definition}
For $m \geq 1$, we write $a \equiv b \pmod{m}$ if $m \mid (a - b)$.
\end{definition}

\begin{theorem}
Congruence modulo $m$ is an equivalence relation, and if $a \equiv b$ and $c \equiv d \pmod{m}$
then $a + c \equiv b + d$ and $ac \equiv bd \pmod{m}$.
\end{theorem}

\begin{proof}
Reflexivity, symmetry and transitivity follow from Lemma~1.2. For the product,
$ac - bd = a(c - d) + d(a - b)$ is divisible by $m$.
\end{proof}

\begin{example}
Since $10 \equiv 1 \pmod{9}$, a number is divisible by $9$ exactly when its digit sum is.
\end{example}

\end{document}
`,
} satisfies Template;
