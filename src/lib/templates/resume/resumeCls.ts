// Independent implementation of a one-page resume class with the interface made popular by
// Trey Hunner's resume.cls (\name, \address, rSection, rSubsection). Not a copy of that file:
// the original LaTeXTemplates version is CC BY-NC-SA and may not be redistributed.
export default String.raw`%% resume.cls: simple one-page resume class (A4)
%% Commands: \name{}, \address{} (repeatable), rSection{Title}, rSubsection{Title}{Years}{Subtitle}{Place}
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{resume}[2026/11/06 Simple one-page resume class]

\LoadClass[11pt,a4paper]{article}

\RequirePackage[parfill]{parskip}
\RequirePackage{array}
\RequirePackage{ifthen}

\pagestyle{empty}

%% ---- Heading: name and address lines ----
\gdef\@name{}
\gdef\@addresses{}
\newcommand{\name}[1]{\gdef\@name{#1}}
\newcommand{\address}[1]{\g@addto@macro\@addresses{\printaddress{#1}}}
\newcommand{\addressSep}{$\diamond$}
\newcommand{\namesize}{\LARGE}

\newcommand{\printname}{%
  \begingroup
    \centering{\namesize\bfseries\MakeUppercase{\@name}}\par
  \endgroup
  \medskip
}

\newcommand{\printaddress}[1]{%
  \begingroup
    \def\\{\addressSep\ }%
    \centerline{#1}%
  \endgroup
  \par
  \addvspace{\topsep}%
}

\AtBeginDocument{\printname\@addresses}

%% ---- Sections ----
\newenvironment{rSection}[1]{%
  \par\addvspace{\medskipamount}%
  {\bfseries\MakeUppercase{#1}}\par\nobreak
  \vspace{2pt}\hrule\nobreak
  \begin{list}{}{\setlength{\leftmargin}{1.5em}\setlength{\topsep}{4pt}\setlength{\parsep}{0pt}}%
  \item[]
}{%
  \end{list}%
}

%% ---- Entries: title / years, then optional subtitle / place, then bullet items ----
\newenvironment{rSubsection}[4]{%
  \setlength{\parskip}{0pt}%
  {\bfseries #1}\hfill #2\par
  \ifthenelse{\equal{#3}{}}{}{{\itshape #3}\hfill{\itshape #4}\par}%
  \smallskip
  \begin{list}{$\bullet$}{%
    \setlength{\leftmargin}{1.2em}\setlength{\labelwidth}{1em}%
    \setlength{\itemsep}{0pt}\setlength{\topsep}{0pt}\setlength{\parsep}{0pt}\setlength{\partopsep}{0pt}}%
}{%
  \end{list}%
  \vspace{0.4em}%
}
`;
