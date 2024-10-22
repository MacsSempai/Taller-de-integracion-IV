// server.js
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs'); // Para el hash de las contraseñas

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'segurapp'
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
        throw err;
    }
    console.log('Conectado a la base de datos');
});

// Configurar nodemailer para enviar correos
const transporter = nodemailer.createTransport({
    service: 'Gmail', // O el servicio de correo que utilices
    auth: {
        user: 'henriquezsofia10@gmail.com', // Reemplaza con tu correo
        pass: 'sofi_1302', // Reemplaza con tu contraseña
    },
});

// Ruta para solicitar la recuperación de contraseña
app.post('/api/recover-password', (req, res) => {
    const { email } = req.body;

    db.query('SELECT * FROM usuarios WHERE correo = ?', [email], (err, results) => {
        if (err) {
            console.error('Error al buscar usuario:', err);
            return res.status(500).json({ error: 'Error al buscar usuario' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Generar token de recuperación
        const token = crypto.randomBytes(20).toString('hex');
        const expirationTime = Date.now() + 3600000; // 1 hora

        // Almacenar el token y la expiración en la base de datos
        db.query(
            'UPDATE usuarios SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE correo = ?',
            [token, expirationTime, email],
            (err, results) => {
                if (err) {
                    console.error('Error al guardar token:', err);
                    return res.status(500).json({ error: 'Error al guardar token' });
                }

                // Enviar correo con el enlace de recuperación
                const mailOptions = {
                    to: email,
                    from: 'noreply@tuapp.com',
                    subject: 'Recuperar contraseña',
                    text: `Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para restablecerla:
                    http://localhost:3000/reset-password/${token}`,
                };

                transporter.sendMail(mailOptions, (err, response) => {
                    if (err) {
                        console.error('Error al enviar el correo:', err);
                        return res.status(500).json({ message: 'Error al enviar el correo' });
                    }
                    res.status(200).json({ message: 'Correo de recuperación enviado con éxito' });
                });
            }
        );
    });
});

// Ruta para restablecer la contraseña
app.post('/api/reset-password/:token', (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    db.query('SELECT * FROM usuarios WHERE resetPasswordToken = ? AND resetPasswordExpires > ?', [token, Date.now()], (err, results) => {
        if (err) {
            console.error('Error al buscar token:', err);
            return res.status(500).json({ error: 'Error al buscar token' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        // Hashear la nueva contraseña
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Actualizar la contraseña y eliminar el token
        db.query(
            'UPDATE usuarios SET contraseña = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE resetPasswordToken = ?',
            [hashedPassword, token],
            (err, results) => {
                if (err) {
                    console.error('Error al actualizar contraseña:', err);
                    return res.status(500).json({ error: 'Error al actualizar contraseña' });
                }
                res.status(200).json({ message: 'Contraseña actualizada correctamente' });
            }
        );
    });
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
            // Devuelve el usuario y el rol en la respuesta
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

    db.query('SELECT * FROM casos WHERE inspector_id = ?', [usuarioId], (err, rows) => {
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


// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://192.168.1.4:3000');
});
