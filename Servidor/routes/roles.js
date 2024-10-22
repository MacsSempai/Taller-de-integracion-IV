const express = require('express');
const router = express.Router();
const db = require('../db');

// Endpoint para obtener los roles del usuario
router.get('/:rolId', (req, res) => {
    const { rolId } = req.params;

    db.query('SELECT * FROM roles WHERE id = ?', [rolId], (err, rows) => {
        if (err) {
            console.error('Error al obtener los roles:', err);
            return res.status(500).json({ message: 'Error al obtener los roles' });
        }
        res.json(rows);
    });
});

module.exports = router;
