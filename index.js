const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const comentariosPath = path.join(__dirname, 'comentarios.json');

// Cargar comentarios desde el archivo al iniciar
let comentarios = [];
if (fs.existsSync(comentariosPath)) {
  try {
    comentarios = JSON.parse(fs.readFileSync(comentariosPath, 'utf8'));
    // Asigna un id único a los comentarios que no lo tengan
    let changed = false;
    comentarios.forEach(c => {
      if (!c.id) {
        c.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        changed = true;
      }
    });
    if (changed) {
      fs.writeFileSync(comentariosPath, JSON.stringify(comentarios, null, 2), 'utf8');
    }
  } catch (e) {
    comentarios = [];
  }
}

function guardarComentarios() {
  fs.writeFileSync(comentariosPath, JSON.stringify(comentarios, null, 2), 'utf8');
}

function renderHTML(comentarios) {
  // Lee el archivo HTML base
  let html = fs.readFileSync(path.join(__dirname, '../pagina_presentacion/comentarios.html'), 'utf8');
  // Genera el HTML de los comentarios con botón de borrar individual
  const comentariosHTML = comentarios.length === 0
    ? '<li>No hay comentarios aún.</li>'
    : comentarios.map(c => `
      <li style="display:flex;justify-content:space-between;align-items:center;">
        <span><strong>${c.nombre}:</strong> ${c.comentario}</span>
        <form method="POST" action="/borrar-individual" style="margin:0;">
          <input type="hidden" name="id" value="${c.id}">
          <button type="submit" style="background:#dc3545;padding:4px 10px;font-size:14px;border-radius:4px;">Borrar</button>
        </form>
      </li>
    `).join('');
  // Reemplaza el contenido de la lista de comentarios
  html = html.replace(
    /<ul id="listaComentarios">[\s\S]*?<\/ul>/,
    `<ul id="listaComentarios">\n${comentariosHTML}\n</ul>`
  );
  // Elimina el script de comentarios del HTML original
  html = html.replace(/<script>[\s\S]*?<\/script>/, '');
  return html;
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    if (req.url === '/' || req.url === '/index.html') {
      // Sirve el HTML con los comentarios
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderHTML(comentarios));
    } else if (req.url === '/comentarios.css') {
      // Sirve el CSS
      const cssPath = path.join(__dirname, '../pagina_presentacion/comentarios.css');
      fs.readFile(cssPath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('CSS no encontrado');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/css' });
          res.end(data);
        }
      });
    } else {
      res.writeHead(404);
      res.end('No encontrado');
    }
  } else if (req.method === 'POST' && (req.url === '/' || req.url === '/index.html')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const parsed = querystring.parse(body);
      if (parsed.nombre && parsed.comentario) {
        // Asigna un id único (timestamp + random)
        comentarios.push({
          id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          nombre: parsed.nombre,
          comentario: parsed.comentario
        });
        guardarComentarios();
      }
      res.writeHead(302, { Location: '/' });
      res.end();
    });
  } else if (req.method === 'POST' && req.url === '/borrar-individual') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const parsed = querystring.parse(body);
      if (parsed.id) {
        comentarios = comentarios.filter(c => c.id !== parsed.id);
        guardarComentarios();
      }
      res.writeHead(302, { Location: '/' });
      res.end();
    });
  } else {
    res.writeHead(405);
    res.end();
  }
});

server.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
