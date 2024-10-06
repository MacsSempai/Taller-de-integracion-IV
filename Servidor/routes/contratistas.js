const express = require('express');
const router = express.Router();
const db = require('../db');

// Endpoint para obtener la lista de contratistas
router.get('/', (req, res) => {
    db.query('SELECT * FROM contratistas', (err, rows) => {
        if (err) {
            console.error('Error al obtener los contratistas:', err);
            return res.status(500).json({ message: 'Error al obtener los contratistas' });
        }
        res.json(rows);
    });
});

module.exports = router;
