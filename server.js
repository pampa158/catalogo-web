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

app.get('/api/productos/todos', (req, res) => {
    if (!fs.existsSync(PRODUCTOS_PATH)) return res.json([]);
    const productos = JSON.parse(fs.readFileSync(PRODUCTOS_PATH));
    res.json(productos);
});

app.get('/api/productos', (req, res) => {
    if (!fs.existsSync(PRODUCTOS_PATH)) return res.json([]);
    const productos = JSON.parse(fs.readFileSync(PRODUCTOS_PATH));
    const visibles = productos.filter(p => p.habilitado);
    res.json(visibles);
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


app.post('/api/productos/:id/toggle', (req, res) => {
    const id = parseInt(req.params.id);
    let productos = JSON.parse(fs.readFileSync(PRODUCTOS_PATH));
    const producto = productos.find(p => p.id === id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    
    producto.habilitado = !producto.habilitado;  // Cambia el estado
    fs.writeFileSync(PRODUCTOS_PATH, JSON.stringify(productos, null, 2));
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
