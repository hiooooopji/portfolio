import http from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(fileURLToPath(new URL('./dist/', import.meta.url)));
const args = process.argv.slice(2);
const portFlag = args.indexOf('--port');
const port = Number(portFlag >= 0 ? args[portFlag + 1] : process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('Choose a valid port: npm run dev -- --port 3000');
  process.exit(1);
}

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
  '.zip': 'application/zip',
  '.py': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const insideRoot = path => path === root || path.startsWith(root + sep);
const server = http.createServer(async (request, response) => {
  const sendError = (code, message) => {
    response.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(request.method === 'HEAD' ? undefined : message);
  };
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.setHeader('Allow', 'GET, HEAD');
    sendError(405, 'Method not allowed'); return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname.includes('\0')) throw new Error('Invalid path');
  } catch { sendError(400, 'Invalid URL'); return; }
  let path = resolve(root, '.' + pathname);
  if (!insideRoot(path) || pathname.split('/').some(segment => segment.startsWith('.'))) {
    sendError(404, 'Not found'); return;
  }
  try {
    let info = await stat(path);
    if (info.isDirectory()) { path = join(path, 'index.html'); info = await stat(path); }
    path = await realpath(path);
    if (!insideRoot(path) || !info.isFile()) { sendError(404, 'Not found'); return; }
    response.writeHead(200, {
      'Content-Type': types[extname(path)] || 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    if (request.method === 'HEAD') { response.end(); return; }
    const stream = createReadStream(path);
    stream.on('error', () => response.destroy());
    response.on('close', () => stream.destroy());
    stream.pipe(response);
  } catch (error) {
    sendError(['ENOENT', 'ENOTDIR', 'EACCES'].includes(error.code) ? 404 : 500, 'File not available');
  }
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${port} is busy. Try: npm run dev -- --port ${port + 1}`
    : `Could not start the portfolio: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  console.log(`\n  Midnight Workshop\n  Local: http://localhost:${port}\n\n  Edit files and refresh your browser. Press Ctrl+C to stop.\n`);
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => { server.close(); server.closeAllConnections(); });
}
