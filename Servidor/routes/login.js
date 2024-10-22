const express = require('express');
const router = express.Router();
const db = require('../db');

// Endpoint de login
router.post('/login', (req, res) => {
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

module.exports = router;
