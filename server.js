require('dotenv').config();
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PRODUCTOS_PATH = './productos.json';

app.get('/api/productos', (req, res) => {
    if (!fs.existsSync(PRODUCTOS_PATH)) return res.json([]);
    const data = fs.readFileSync(PRODUCTOS_PATH);
    const productos = JSON.parse(data).filter(p => p.habilitado);
    res.json(productos);
});

app.post('/api/login', (req, res) => {
    const { user, pass } = req.body;
    if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
    return res.json({ success: true });
    }
    res.status(401).json({ error: 'Acceso denegado' });
});

app.post('/api/productos', (req, res) => {
    const nuevo = req.body;
    let data = [];
    if (fs.existsSync(PRODUCTOS_PATH)) {
    data = JSON.parse(fs.readFileSync(PRODUCTOS_PATH));
    }
    nuevo.id = Date.now();
    data.push(nuevo);
    fs.writeFileSync(PRODUCTOS_PATH, JSON.stringify(data, null, 2));
    res.json(nuevo);
});

app.delete('/api/productos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (!fs.existsSync(PRODUCTOS_PATH)) return res.json({ success: true });
    let data = JSON.parse(fs.readFileSync(PRODUCTOS_PATH));
    data = data.filter(p => p.id !== id);
    fs.writeFileSync(PRODUCTOS_PATH, JSON.stringify(data, null, 2));
    res.json({ success: true });
});

app.patch('/api/productos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (!fs.existsSync(PRODUCTOS_PATH)) return res.status(404).json({ error: 'No encontrado' });
    let data = JSON.parse(fs.readFileSync(PRODUCTOS_PATH));
    const index = data.findIndex(p => p.id === id);
    if (index !== -1) {
    data[index].habilitado = !data[index].habilitado;
    fs.writeFileSync(PRODUCTOS_PATH, JSON.stringify(data, null, 2));
    res.json(data[index]);
    } else {
    res.status(404).json({ error: 'Producto no encontrado' });
    }
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
