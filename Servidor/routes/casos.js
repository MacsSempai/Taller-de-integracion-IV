const express = require('express');
const router = express.Router();
const db = require('../db');

// Endpoint para obtener los casos del usuario
router.get('/usuario/:usuarioId', (req, res) => {
    const { usuarioId } = req.params;

    db.query('SELECT * FROM casos WHERE inspector_id = ? OR cliente_id = ? OR liquidador_id = ?', [usuarioId, usuarioId, usuarioId], (err, rows) => {
        if (err) {
            console.error('Error al obtener los casos:', err);
            return res.status(500).json({ message: 'Error al obtener los casos' });
        }
        res.json(rows);
    });
});

// Endpoint para obtener los detalles de un caso por su ID
router.get('/:casoId', (req, res) => {
    const { casoId } = req.params;

    db.query('SELECT * FROM casos WHERE id = ?', [casoId], (err, rows) => {
        if (err) {
            console.error('Error al obtener los detalles del caso:', err);
            return res.status(500).json({ message: 'Error al obtener los detalles del caso' });
        }
        res.json(rows);
    });
});

// Endpoint para actualizar el estado de un caso
router.put('/:casoId', (req, res) => {
    const { casoId } = req.params;
    const { estado } = req.body;

    db.query('UPDATE casos SET estado = ? WHERE id = ?', [estado, casoId], (err, result) => {
        if (err) {
            console.error('Error al actualizar el estado del caso:', err);
            return res.status(500).json({ message: 'Error al actualizar el estado del caso' });
        }
        res.json({ message: 'Estado actualizado' });
    });
});

module.exports = router;
