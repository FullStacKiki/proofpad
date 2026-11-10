import type { Template } from './types';

export default {
  id: 'blank-article',
  order: 9,
  name: 'Blank article',
  desc: 'Minimal preamble with amsmath and amsthm.',
  file: 'untitled.tex',
  src: String.raw`\documentclass[11pt]{article}

\usepackage[margin=1in]{geometry}
\usepackage{amsmath, amssymb, amsthm}
\usepackage{parskip}

\title{Untitled}
\author{Your Name}
\date{\today}

\begin{document}
\maketitle

\end{document}
`,
} satisfies Template;
