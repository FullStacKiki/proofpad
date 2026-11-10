import type { Template } from './types';
import cls from './resume/resumeCls.ts';
import tex from './resume/resumeTex.ts';

export default {
  id: 'resume',
  order: 8,
  name: 'Resume',
  desc: 'One-page A4 CV with Education, Projects, Experience, Skills. Adds resume.cls.',
  file: 'resume.tex',
  src: tex,
  files: [{ name: 'resume.cls', src: cls }],
} satisfies Template;
