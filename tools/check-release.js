import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const requiredFiles = [
  'index.html',
  'manifest.json',
  'sw.js',
  'styles/main.css',
  'scripts/app.js',
  'scripts/auth.js',
  'scripts/records.js',
  'scripts/storage.js',
  'scripts/ui.js',
  'icon-192.png',
  'icon-512.png',
  'fonts/zcool-kuaile-23-400-normal.woff2',
  'fonts/zcool-kuaile-21-400-normal.woff2',
  'fonts/caveat-latin-400-normal.woff2',
  'fonts/caveat-latin-700-normal.woff2',
];

const sensitiveFilePattern = /(^|[._-])(env|secret|secrets|key|token|password|passwd|credential|credentials)([._-]|$)/i;
const localReferencePattern = /(localhost|127\.0\.0\.1|\/Users\/|file:\/\/|C:\\)/i;
const results = [];

await check('dist directory exists', async () => {
  const info = await stat(dist).catch(() => null);
  return info?.isDirectory() === true;
});

for (const file of requiredFiles) {
  await check(`dist/${file} exists`, async () => {
    const info = await stat(join(dist, file)).catch(() => null);
    return info?.isFile() === true;
  });
}

await check('dist has no sensitive-looking files', async () => {
  const files = await walk(dist);
  return files.every((file) => !sensitiveFilePattern.test(relative(dist, file)));
});

await check('dist/index.html has no local-only references', async () => {
  const html = await readFile(join(dist, 'index.html'), 'utf8');
  return !localReferencePattern.test(html);
});

const failed = results.filter((item) => !item.pass);
for (const item of results) {
  console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.name}`);
  if (item.error) console.log(`  ${item.error}`);
}

if (failed.length > 0) {
  console.error(`Release check failed: ${failed.length} issue(s).`);
  process.exit(1);
}

console.log('Release check passed.');

async function check(name, fn) {
  try {
    results.push({ name, pass: await fn() });
  } catch (error) {
    results.push({ name, pass: false, error: error.message });
  }
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}
