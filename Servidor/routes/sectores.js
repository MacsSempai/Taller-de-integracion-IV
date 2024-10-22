const express = require('express');
const router = express.Router();
const db = require('../db');

// Endpoint para obtener los sectores de un caso
router.get('/sectores/:casoId', (req, res) => {
    const { casoId } = req.params;

    db.query('SELECT * FROM sectores WHERE caso_id = ?', [casoId], (err, rows) => {
        if (err) {
            console.error('Error al obtener los sectores:', err);
            return res.status(500).json({ message: 'Error al obtener los sectores' });
        }
        res.json(rows);
    });
});

// Endpoint para obtener los subsectores de un sector
router.get('/subsectores/:sectorId', (req, res) => {
    const { sectorId } = req.params;

    db.query('SELECT * FROM subsectores WHERE sector_id = ?', [sectorId], (err, rows) => {
        if (err) {
            console.error('Error al obtener los subsectores:', err);
            return res.status(500).json({ message: 'Error al obtener los subsectores' });
        }
        res.json(rows);
    });
});

module.exports = router;
