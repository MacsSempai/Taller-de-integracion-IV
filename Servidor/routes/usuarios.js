const express = require('express');
const router = express.Router();
const db = require('../db');

// Endpoint para obtener la informacion del cliente
router.get('/cliente/:clienteId', (req, res) => {
    const { clienteId } = req.params;

    db.query('SELECT * FROM usuarios WHERE id = ?', [clienteId], (err, rows) => {
        if (err) {
            console.error('Error al obtener al cliente:', err);
            return res.status(500).json({ message: 'Error al obtener al cliente' });
        }
        res.json(rows);
    });
});

// Endpoint para obtener los datos del inspector
router.get('/inspectores/:id', (req, res) => {
    const inspectorId = req.params.id;

    db.query('SELECT * FROM usuarios WHERE id = ?', [inspectorId], (err, rows) => {
        if (err) {
            console.error('Error al obtener los datos del inspector:', err);
            return res.status(500).json({ message: 'Error al obtener los datos del inspector' });
        }
        res.json(rows);
    });
});

module.exports = router;
