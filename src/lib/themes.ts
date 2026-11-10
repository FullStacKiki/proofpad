type Vars = Record<string, string>;

const LIGHT: Vars = {
  winBg: '#ffffff',
  editorBg: '#ffffff',
  emptyBg: '#f6f6f7',
  toolbar: 'rgba(246, 246, 247, 0.86)',
  hairline: 'rgba(0, 0, 0, 0.11)',
  text: '#1d1d1f',
  text2: 'rgba(0, 0, 0, 0.56)',
  text3: 'rgba(0, 0, 0, 0.32)',
  gutterText: 'rgba(0, 0, 0, 0.26)',
  gutterCur: 'rgba(0, 0, 0, 0.62)',
  curLine: 'rgba(0, 0, 0, 0.035)',
  red: '#ff3b30',
  redText: '#d70015',
  green: '#28cd41',
  orange: '#ff9500',
  accent: '#007aff',
  previewBg: '#e2e2e5',
  capsule: 'rgba(0, 0, 0, 0.045)',
  capsuleSolid: 'rgba(255, 255, 255, 0.94)',
  ctrlBg: '#ffffff',
  ctrlBorder: 'rgba(0, 0, 0, 0.14)',
  ctrlShadow: '0 0.5px 1.5px rgba(0, 0, 0, 0.1)',
  logBg: '#f6f6f7',
  sheetBg: '#f2f2f4',
  sheetBorder: 'rgba(0, 0, 0, 0.15)',
  fieldBg: '#ffffff',
  focusRing: 'rgba(0, 122, 255, 0.35)',
  scrim: 'rgba(0, 0, 0, 0.08)',
  hover: 'rgba(0, 0, 0, 0.055)',
  sel: 'rgba(0, 122, 255, 0.12)',
  switchOff: 'rgba(0, 0, 0, 0.1)',
  groupBg: '#ffffff',
  paperShadow: '0 0 0 0.5px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.08), 0 12px 32px rgba(0, 0, 0, 0.06)',
  sCmd: '#f52a65',
  sEnv: '#2e7de9',
  sOpt: '#b15c00',
  sMath: '#118c74',
  sCom: '#848cb5',
  sBrace: '#9aa0c0',
  sDelim: '#8990b3',
  sText: '#1d1d1f',
};

const DARK: Vars = {
  winBg: '#1e1e20',
  editorBg: '#1f1f23',
  emptyBg: '#1c1c1f',
  toolbar: 'rgba(44, 44, 48, 0.88)',
  hairline: 'rgba(255, 255, 255, 0.09)',
  text: '#e8e8ea',
  text2: 'rgba(255, 255, 255, 0.55)',
  text3: 'rgba(255, 255, 255, 0.3)',
  gutterText: 'rgba(255, 255, 255, 0.24)',
  gutterCur: 'rgba(255, 255, 255, 0.72)',
  curLine: 'rgba(255, 255, 255, 0.04)',
  red: '#ff453a',
  redText: '#ff6961',
  green: '#32d74b',
  orange: '#ff9f0a',
  accent: '#0a84ff',
  previewBg: '#2a2a2d',
  capsule: 'rgba(255, 255, 255, 0.07)',
  capsuleSolid: 'rgba(52, 52, 56, 0.95)',
  ctrlBg: 'rgba(255, 255, 255, 0.11)',
  ctrlBorder: 'rgba(255, 255, 255, 0.06)',
  ctrlShadow: '0 0.5px 1px rgba(0, 0, 0, 0.3)',
  logBg: '#1a1a1d',
  sheetBg: '#2c2c30',
  sheetBorder: 'rgba(255, 255, 255, 0.12)',
  fieldBg: 'rgba(255, 255, 255, 0.06)',
  focusRing: 'rgba(10, 132, 255, 0.45)',
  scrim: 'rgba(0, 0, 0, 0.3)',
  hover: 'rgba(255, 255, 255, 0.07)',
  sel: 'rgba(10, 132, 255, 0.26)',
  switchOff: 'rgba(255, 255, 255, 0.16)',
  groupBg: 'rgba(255, 255, 255, 0.04)',
  paperShadow: '0 0 0 0.5px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.35)',
  sCmd: '#f7768e',
  sEnv: '#7aa2f7',
  sOpt: '#ff9e64',
  sMath: '#73daca',
  sCom: '#565f89',
  sBrace: '#565f89',
  sDelim: '#737aa2',
  sText: '#dcdcdf',
};

interface Scheme {
  base: 'light' | 'dark';
  bg: string; bg2: string; fg: string; accent: string; red: string;
  /** commands, environment/argument names, optional args, math, comments, braces, math delimiters */
  cmd: string; env: string; opt: string; math: string; com: string; brace: string; delim: string;
  /** optional chrome overrides */
  cur?: string; gutter?: string; sel?: string;
}

const SCHEMES: Record<string, Scheme> = {
  tokyonight: { base: 'dark', bg: '#1a1b26', bg2: '#16161e', fg: '#c0caf5', accent: '#7aa2f7', red: '#f7768e', cmd: '#f7768e', env: '#7aa2f7', opt: '#ff9e64', math: '#73daca', com: '#565f89', brace: '#565f89', delim: '#737aa2', cur: '#292e42', gutter: '#3b4261', sel: '#283457' },
  tokyoday: { base: 'light', bg: '#e1e2e7', bg2: '#d6d8df', fg: '#3760bf', accent: '#2e7de9', red: '#f52a65', cmd: '#f52a65', env: '#2e7de9', opt: '#b15c00', math: '#118c74', com: '#848cb5', brace: '#848cb5', delim: '#8990b3', cur: '#d0d3e3', gutter: '#a8aecb', sel: '#b7c1e3' },
  onedark: { base: 'dark', bg: '#282c34', bg2: '#21252b', fg: '#abb2bf', accent: '#61afef', red: '#e06c75', cmd: '#e06c75', env: '#61afef', opt: '#d19a66', math: '#56b6c2', com: '#7f848e', brace: '#5c6370', delim: '#7f848e' },
  gruvbox: { base: 'dark', bg: '#282828', bg2: '#1d2021', fg: '#ebdbb2', accent: '#83a598', red: '#fb4934', cmd: '#fb4934', env: '#83a598', opt: '#fe8019', math: '#8ec07c', com: '#928374', brace: '#7c6f64', delim: '#928374' },
  nord: { base: 'dark', bg: '#2e3440', bg2: '#272c36', fg: '#d8dee9', accent: '#88c0d0', red: '#bf616a', cmd: '#bf616a', env: '#81a1c1', opt: '#d08770', math: '#8fbcbb', com: '#7b88a1', brace: '#616e88', delim: '#7b88a1' },
  solarizedlight: { base: 'light', bg: '#fdf6e3', bg2: '#eee8d5', fg: '#586e75', accent: '#268bd2', red: '#dc322f', cmd: '#dc322f', env: '#268bd2', opt: '#cb4b16', math: '#2aa198', com: '#93a1a1', brace: '#b3b8ad', delim: '#93a1a1' },
};

export const THEMES = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'tokyonight', label: 'Tokyo Night' },
  { id: 'tokyoday', label: 'Tokyo Night Day' },
  { id: 'onedark', label: 'One Dark' },
  { id: 'gruvbox', label: 'Gruvbox' },
  { id: 'nord', label: 'Nord' },
  { id: 'solarizedlight', label: 'Solarized Light' },
];

function varsFor(id: string, systemDark: boolean): { vars: Vars; dark: boolean } {
  // System in dark appearance uses Tokyo Night.
  const eff = id === 'system' ? (systemDark ? 'tokyonight' : 'light') : id;
  const sc = SCHEMES[eff];
  if (!sc) {
    const dark = eff === 'dark';
    return { vars: dark ? DARK : LIGHT, dark };
  }
  const dark = sc.base === 'dark';
  return {
    dark,
    vars: {
      ...(dark ? DARK : LIGHT),
      winBg: sc.bg, editorBg: sc.bg, emptyBg: sc.bg2, logBg: sc.bg2, sheetBg: sc.bg2,
      toolbar: sc.bg2 + 'e6', text: sc.fg, sText: sc.fg, accent: sc.accent,
      red: sc.red, redText: sc.red,
      sCmd: sc.cmd, sEnv: sc.env, sOpt: sc.opt, sMath: sc.math, sCom: sc.com, sBrace: sc.brace, sDelim: sc.delim,
      ...(sc.cur ? { curLine: sc.cur } : {}),
      ...(sc.gutter ? { gutterText: sc.gutter, gutterCur: sc.fg } : {}),
      ...(sc.sel ? { sel: sc.sel } : {}),
    },
  };
}

let media: MediaQueryList | null = null;
let current = 'system';
const reapply = () => applyTheme(current);

export function applyTheme(id: string) {
  current = id;
  media ??= window.matchMedia('(prefers-color-scheme: dark)');
  media.removeEventListener('change', reapply);
  if (id === 'system') media.addEventListener('change', reapply);
  const { vars, dark } = varsFor(id, media.matches);
  const root = document.documentElement;
  for (const [k, v] of Object.entries(vars)) root.style.setProperty('--' + k, v);
  root.style.colorScheme = dark ? 'dark' : 'light';
}
