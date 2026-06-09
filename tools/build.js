import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');

const entries = [
  'index.html',
  'manifest.json',
  'sw.js',
  'styles',
  'scripts',
  'fonts',
  'icon-192.png',
  'icon-512.png',
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of entries) {
  await cp(join(root, entry), join(dist, entry), {
    recursive: true,
    filter: (source) => !source.endsWith('.DS_Store'),
  });
}

console.log('Build complete: dist/');
