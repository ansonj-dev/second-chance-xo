import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const html = await readFile(new URL('./index.html', import.meta.url));
createServer(async (req,res) => {
  if (req.url === '/template.json') { try { res.setHeader('Content-Type','application/json'); res.end(await readFile(new URL('./dist/second-chance.xo.json',import.meta.url))); } catch { res.writeHead(404); res.end('Run npm run export first.'); } return; }
  res.setHeader('Content-Type','text/html; charset=utf-8'); res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"); res.end(html);
}).listen(4202, '127.0.0.1', () => console.log('Second Chance workbench: http://127.0.0.1:4202'));
