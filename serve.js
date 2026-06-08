const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const PORT = 3019;
const TYPES = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2','.woff':'font/woff','.txt':'text/plain','.xml':'application/xml','.avif':'image/avif','.gif':'image/gif' };
http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  let file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
  if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file = file + '.html';
  fs.readFile(file,(err,data)=>{
    if (err){ res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200,{'Content-Type':TYPES[path.extname(file)]||'application/octet-stream'});
    res.end(data);
  });
}).listen(PORT,()=>console.log('Codex (kjtherealtor prod) on http://localhost:'+PORT));
