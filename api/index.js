const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'comentarios.json');

app.use(cors());
app.use(express.json());

// Leer comentarios
function leerComentarios() {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return data ? JSON.parse(data) : [];
}

// Guardar comentarios
function guardarComentarios(comentarios) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(comentarios, null, 2));
}

// GET /comentarios
app.get('/comentarios', (req, res) => {
    const comentarios = leerComentarios();
    res.json(comentarios);
});

// Al agregar un comentario, asigna un id único (por ejemplo, Date.now())
app.post('/comentarios', (req, res) => {
    const { nombre, comentario } = req.body;
    if (!nombre || !comentario) {
        return res.status(400).json({ error: 'Faltan campos' });
    }
    const comentarios = leerComentarios();
    const nuevoComentario = { id: Date.now(), nombre, comentario };
    comentarios.unshift(nuevoComentario);
    guardarComentarios(comentarios);
    res.status(201).json({ ok: true });
});

// Nueva ruta DELETE para borrar por id
app.delete('/comentarios/:id', (req, res) => {
    const id = Number(req.params.id); // Asegura que sea número
    let comentarios = leerComentarios();
    const prevLength = comentarios.length;
    comentarios = comentarios.filter(c => Number(c.id) !== id); // Compara como número
    if (comentarios.length === prevLength) {
        return res.status(404).json({ error: 'Comentario no encontrado' });
    }
    guardarComentarios(comentarios);
    res.json({ ok: true });
});

app.listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}`);
});
