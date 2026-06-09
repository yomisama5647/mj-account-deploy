import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirnameFromImportMeta(), '..');
const serveDir = resolve(root, process.argv[2] || '.');
const port = Number(process.env.PORT || 4173);

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff2': 'font/woff2',
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'app://mj-account.local');
    const pathname = decodeURIComponent(url.pathname);
    const requested = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    let filePath = resolve(join(serveDir, requested));

    if (!filePath.startsWith(serveDir + sep) && filePath !== serveDir) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    const info = await stat(filePath).catch(() => null);
    if (info?.isDirectory()) {
      filePath = join(filePath, 'index.html');
    }

    const finalInfo = await stat(filePath).catch(() => null);
    if (!finalInfo?.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': types[extname(filePath)] || 'application/octet-stream',
    });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(500);
    res.end('Server error');
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`Serving ${serveDir}`);
  console.log(`Listening on 0.0.0.0:${port}`);
});

function dirnameFromImportMeta() {
  return dirname(fileURLToPath(import.meta.url));
}
