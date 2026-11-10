import type { Template } from './types';

export type { Template };

// Every file in this folder (except index/types) default-exports one Template.
const mods = import.meta.glob<{ default: Template }>(['./*.ts', '!./index.ts', '!./types.ts'], { eager: true });
export const TEMPLATES: Template[] = Object.values(mods)
  .map((m) => m.default)
  .sort((a, b) => a.order - b.order);

const thumbs = import.meta.glob<string>('../../assets/thumbs/*.png', { eager: true, query: '?url', import: 'default' });
export const thumbFor = (id: string): string | undefined => thumbs[`../../assets/thumbs/${id}.png`];
