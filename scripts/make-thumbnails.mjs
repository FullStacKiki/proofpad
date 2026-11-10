// Renders page 1 of every built-in template to src/assets/thumbs/<id>.png.
// Needs Tectonic and macOS `sips`. Run: npm run thumbnails
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const dir = join(root, 'src/lib/templates');
const out = join(root, 'src/assets/thumbs');
const work = join(tmpdir(), 'proofpad-thumbs');
mkdirSync(out, { recursive: true });
mkdirSync(work, { recursive: true });

for (const f of readdirSync(dir).filter((f) => f.endsWith('.ts') && !['index.ts', 'types.ts'].includes(f))) {
  const { id, src, files = [] } = (await import(pathToFileURL(join(dir, f)).href)).default;
  const tex = join(work, `${id}.tex`);
  writeFileSync(tex, src);
  for (const f of files) writeFileSync(join(work, f.name), f.src);
  process.stdout.write(`${id}: compiling… `);
  try {
    execFileSync('tectonic', ['-X', 'compile', '--outdir', work, tex], { stdio: 'pipe' });
    execFileSync('sips', ['-s', 'format', 'png', '--resampleWidth', '420', join(work, `${id}.pdf`), '--out', join(out, `${id}.png`)], { stdio: 'pipe' });
    console.log('ok');
  } catch (e) {
    console.log('FAILED\n' + (e.stderr?.toString() || e.message).split('\n').slice(-8).join('\n'));
    process.exitCode = 1;
  }
}
