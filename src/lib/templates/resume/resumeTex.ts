export default String.raw`\documentclass{resume}
\usepackage[a4paper, left=0.75in, right=0.75in, top=0.6in, bottom=0.6in]{geometry}

\name{Your Name}
\address{Street 1 \\ City, Country}
\address{+00 000 000 0000 \\ you@example.com}

\begin{document}

\begin{rSection}{Education}
{\bfseries Degree in Subject} \hfill 2020--2024 \\
{\itshape University Name} \hfill {\itshape City, Country} \\
Thesis or notable coursework: placeholder text.
\end{rSection}

\begin{rSection}{Projects}
\begin{rSubsection}{Project One}{2024}{Role or main technology}{github.com/you/project-one}
  \item One line describing what the project does.
  \item One line about a result or something you learned.
\end{rSubsection}

\begin{rSubsection}{Project Two}{2023}{Role or main technology}{github.com/you/project-two}
  \item One line describing what the project does.
\end{rSubsection}
\end{rSection}

\begin{rSection}{Experience}
\begin{rSubsection}{Company Name}{2023 -- Present}{Job Title}{City, Country}
  \item Responsibility or achievement, with a measurable outcome if you have one.
  \item Another responsibility or achievement.
\end{rSubsection}

\begin{rSubsection}{Previous Company}{2021 -- 2023}{Job Title}{City, Country}
  \item Responsibility or achievement.
\end{rSubsection}
\end{rSection}

\begin{rSection}{Skills}
\begin{tabular}{@{} >{\bfseries}l @{\hspace{4ex}} l}
  Languages & Language A, Language B, Language C \\
  Tools     & Tool A, Tool B, Tool C \\
  Other     & Skill A, Skill B \\
\end{tabular}
\end{rSection}

\end{document}
`;
