const mysql = require('mysql2');

// Configurar la conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'segurapp'
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
        throw err;
    }
    console.log('Conectado a la base de datos');
});

module.exports = db;
