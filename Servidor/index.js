// server.js
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'segurapp'
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
        throw err;
    }
    console.log('Conectado a la base de datos');
});

// Endpoint de login
app.post('/login', (req, res) => {
    const { correo, contraseña } = req.body;

    db.query('SELECT * FROM usuarios WHERE correo = ? AND contraseña = ?', [correo, contraseña], (err, results) => {
        if (err) {
            console.error('Error en la consulta de login:', err);
            return res.status(500).json({ error: 'Error en la consulta' });
        }
        if (results.length > 0) {
            res.json({ message: 'Login exitoso', user: results[0], userRole: results[0].rol_id, usuarioId: results[0].id });
            console.log('Login exitoso:', results[0]);
        } else {
            res.status(401).json({ message: 'Credenciales incorrectas' });
            console.log('Credenciales incorrectas');
        }
    });
});

// Endpoint para obtener los roles del usuario (según su rol ID)
app.get('/roles/:rolId', (req, res) => {
    const { rolId } = req.params;

    db.query('SELECT * FROM roles WHERE id = ?', [rolId], (err, rows) => {
        if (err) {
            console.error('Error al obtener los roles:', err);
            return res.status(500).json({ message: 'Error al obtener los roles' });
        }
        res.json(rows);
    });
});

// Endpoint para obtener los casos del usuario (según su ID)
app.get('/casos/:usuarioId', (req, res) => {
    const { usuarioId } = req.params;

    db.query('SELECT * FROM casos WHERE inspector_id = ? OR cliente_id = ?', [usuarioId, usuarioId], (err, rows) => {
        if (err) {
            console.error('Error al obtener los casos:', err);
            return res.status(500).json({ message: 'Error al obtener los casos' });
        }
        res.json(rows);
    });
});

// Endpoint para obtener la informacion del cliente de un caso
app.get('/cliente/:clienteId', (req, res) => {
    const { clienteId } = req.params;

    db.query('SELECT * FROM usuarios WHERE id = ?', [clienteId], (err, rows) => {
        if (err) {
            console.error('Error al obtener al cliente:', err);
            return res.status(500).json({ message: 'Error al obtener al cliente' });
        }
        res.json(rows);
    });
});

// Endpoint para obtener la lista de contratistas
app.get('/contratistas', (req, res) => {
    db.query('SELECT * FROM contratistas', (err, rows) => {
        if (err) {
            console.error('Error al obtener los contratistas:', err);
            return res.status(500).json({ message: 'Error al obtener los contratistas' });
        }
        res.json(rows);
    });
});

// endpoint para obtener los detalles de un caso por su ID
app.get('/casos/:casoId', (req, res) => {
    const { casoId } = req.params;

    db.query('SELECT * FROM casos WHERE id = ?', [casoId], (err, rows) => {
        if (err) {
            console.error('Error al obtener los detalles del caso:', err);
            return res.status(500).json({ message: 'Error al obtener los detalles del caso' });
        }
        res.json(rows);
    });
});

// Endpoint para obtener los sectores de un caso por su ID
app.get('/sectores/:casoId', (req, res) => {
    const { casoId } = req.params;

    db.query('SELECT * FROM sectores WHERE caso_id = ?', [casoId], (err, rows) => {
        if (err) {
            console.error('Error al obtener los sectores:', err);
            return res.status(500).json({ message: 'Error al obtener los sectores' });
        }
        res.json(rows);
    });
});

// Endpoint para obtener los subsectores de un sector por su ID
app.get('/subsectores/:sectorId', (req, res) => {
    const { sectorId } = req.params;

    db.query('SELECT * FROM subsectores WHERE sector_id = ?', [sectorId], (err, rows) => {
        if (err) {
            console.error('Error al obtener los subsectores:', err);
            return res.status(500).json({ message: 'Error al obtener los subsectores' });
        }
        res.json(rows);
    });
});

// Endpoint para obtener los datos del inspector con su ID
app.get('/inspectores/:id', (req, res) => {
    const inspectorId = req.params.id;

    db.query('SELECT * FROM usuarios WHERE id = ?', [inspectorId], (err, rows) => {
        if (err) {
            console.error('Error al obtener los datos del inspector:', err);
            return res.status(500).json({ message: 'Error al obtener los datos del inspector' });
        }
        res.json(rows);
    });
});


// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://192.168.50.101:3000');
});
