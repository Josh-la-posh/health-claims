import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dist = path.resolve(__dirname, '..', 'dist');
const port = 5000;

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

const server = http.createServer(async (req, res) => {
  try {
    let p = req.url === '/' ? '/index.html' : req.url;
    // Prevent directory traversal
    p = path.normalize(p).replace(/^\.+/, '');
    const filePath = path.join(dist, p);
    try {
      const data = await fs.readFile(filePath);
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
      res.end(data);
    } catch (err) {
      // If the file doesn't exist, assume a client-side route and return index.html
      try {
        const index = await fs.readFile(path.join(dist, 'index.html'));
        res.writeHead(200, { 'Content-Type': mime['.html'] });
        res.end(index);
      } catch (e) {
        res.writeHead(404);
        res.end('Not found');
      }
    }
  } catch (err) {
    res.writeHead(500);
    res.end('Server error');
  }
});

server.listen(port, () => console.log(`serving dist on http://localhost:${port}`));
