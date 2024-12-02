import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { pool } from '../config/db.js';
dotenv.config();

// Almacenamiento temporal en memoria
const verificationCodes = {};

// Generador de código único de 6 caracteres
const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Eliminar código después de que expire
const setExpiration = (email, expirationTime) => {
    setTimeout(() => {
        if (verificationCodes[email] && verificationCodes[email].expiresAt <= Date.now()) {
            delete verificationCodes[email];
        }
    }, expirationTime);
};

export const recoverPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Por favor ingresa tu correo electrónico.' });
    }

    try {
        // Verificar si el usuario existe en la base de datos
        const [rows] = await pool.query('SELECT * FROM Usuario WHERE correo = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontró un usuario con ese correo electrónico.' });
        }

        // Verificar si ya existe un código activo
        if (verificationCodes[email] && verificationCodes[email].expiresAt > Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'Ya tienes un código activo. Revisa tu correo.',
            });
        }

        // Genera un código único de 6 caracteres
        const verificationCode = generateCode();

        // Configuración del correo electrónico
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Recuperación de contraseña - Código de verificación',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="text-align: center; padding: 20px; background-color: #f4f4f4;">
                        <h1 style="color: #007BFF;">Recuperación de Contraseña</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>Hola,</p>
                        <p>Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código para completar el proceso:</p>
                        <div style="text-align: center; margin: 20px 0;">
                            <span style="font-size: 24px; font-weight: bold; color: #007BFF; border: 1px solid #007BFF; padding: 10px 20px; border-radius: 5px; display: inline-block;">
                                ${verificationCode}
                            </span>
                        </div>
                        <p>Este código es válido por <strong>15 minutos</strong>. Si no solicitaste restablecer tu contraseña, ignora este correo.</p>
                        <p>Gracias,</p>
                        <p>El equipo de SegurApp</p>
                    </div>
                    <div style="text-align: center; padding: 10px; background-color: #f4f4f4; font-size: 12px; color: #666;">
                        <p>No respondas a este correo. Si necesitas ayuda, contáctanos en <a href="mailto:soporte@segurapp.com" style="color: #007BFF;">soporte@segurapp.com</a>.</p>
                    </div>
                </div>
            `,
        };

        // Enviar el correo y almacenar el código solo si se envía con éxito
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo:', error);
                return res.status(500).json({ success: false, message: 'Ocurrió un error al enviar el correo.' });
            }

            console.log('Correo enviado:', info.response);

            // Guarda el código en la memoria temporal con expiración de 15 minutos
            verificationCodes[email] = {
                code: verificationCode,
                expiresAt: Date.now() + 15 * 60 * 1000, // Tiempo actual + 15 minutos
            };
            setExpiration(email, 15 * 60 * 1000); // Elimina automáticamente el código después de 15 minutos

            res.status(200).json({ success: true, message: 'Te hemos enviado un correo con el código de verificación.' });
        });
    } catch (error) {
        console.error('Error en el proceso de recuperación:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
};

export const verifyCode = async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ success: false, message: 'Faltan datos obligatorios.' });
    }

    console.log('Códigos de verificación:', verificationCodes);

    try {
        const verificationData = verificationCodes[email];

        if (!verificationData) {
            return res.status(400).json({ success: false, message: 'Código no encontrado o expirado.' });
        }

        if (verificationData.expiresAt < Date.now()) {
            delete verificationCodes[email];
            return res.status(400).json({ success: false, message: 'El código ha expirado.' });
        }

        if (verificationData.code !== code) {
            return res.status(400).json({ success: false, message: 'Código incorrecto.' });
        }

        // Código válido
        delete verificationCodes[email]; // Elimina el código después de la verificación
        res.status(200).json({ success: true, message: 'Código verificado correctamente.' });
    } catch (error) {
        console.error('Error al verificar el código:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
};

export const resetPassword = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Faltan datos obligatorios.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        // Encriptar la nueva contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Actualizar la contraseña en la base de datos
        await pool.query('UPDATE Usuario SET contrasena = ? WHERE correo = ?', [
            hashedPassword,
            email,
        ]);

        res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente.' });
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
};
