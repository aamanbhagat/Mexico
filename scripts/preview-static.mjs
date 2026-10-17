import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = resolve('.vercel/output/static');
const port = Number(process.argv[2] === '--port' ? process.argv[3] : 4321);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('A valid preview port is required');
if (!existsSync(resolve(root, 'index.html'))) throw new Error('Build the Vercel static output before starting the local preview');

const mimeTypes = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
};

createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405).end();
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    if (pathname.includes('\0')) throw new Error('Invalid path');
  } catch {
    response.writeHead(400).end();
    return;
  }

  if (pathname !== '/' && !pathname.endsWith('/') && !extname(pathname)) {
    response.writeHead(308, { Location: `${pathname}/` }).end();
    return;
  }
  if (extname(pathname.slice(0, -1)) && pathname.endsWith('/')) {
    response.writeHead(308, { Location: pathname.slice(0, -1) }).end();
    return;
  }

  const file = resolve(root, `.${pathname}`, pathname.endsWith('/') ? 'index.html' : '');
  if (!file.startsWith(`${root}${sep}`)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    const mime = mimeTypes[extname(file)] ?? 'application/octet-stream';
    response.writeHead(200, {
      'Content-Type': /^(text\/|application\/(json|xml|manifest\+json))/.test(mime) ? `${mime}; charset=utf-8` : mime,
      'Cache-Control': 'no-store',
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    if (error.code !== 'ENOENT' && error.code !== 'EISDIR') throw error;
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : await readFile(resolve(root, '404.html')));
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Static preview ready on port ${port}`);
});
