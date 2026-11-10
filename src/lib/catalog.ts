import { SYMBOLS, type Sym } from './symbols';
import { DOC_SYMBOLS } from './reference';

export type { Sym };

export const MATH_GROUP = 'Math symbols';
export const DOC_GROUP = 'Text & document';

export const CATALOG: Sym[] = [
  ...SYMBOLS.map((s) => ({ ...s, group: MATH_GROUP })),
  ...DOC_SYMBOLS.map((s) => ({ ...s, group: DOC_GROUP })),
];

/** Sidebar structure: group -> categories, in catalog order. */
export const GROUPS: { group: string; cats: string[] }[] = [MATH_GROUP, DOC_GROUP].map((group) => ({
  group,
  cats: [...new Set(CATALOG.filter((s) => s.group === group).map((s) => s.cat))],
}));

export const ALL = 'All';

export function filterCatalog(q: string, cat: string): Sym[] {
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
  return CATALOG.filter((s) => {
    if (cat !== ALL && s.cat !== cat) return false;
    if (!tokens.length) return true;
    const hay = `${s.name} ${s.it} ${s.desc ?? ''} ${s.cmd} ${s.cmd.replace(/\\/g, '')} ${s.u ?? ''} ${s.cat}`.toLowerCase();
    return tokens.every((t) => hay.includes(t));
  });
}
