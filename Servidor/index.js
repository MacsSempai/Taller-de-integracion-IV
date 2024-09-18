require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
  } else {
    console.log('Conectado a la base de datos.');
  }
});

// Ruta para obtener datos del cliente
app.get('/api/client', (req, res) => {
  const query = 'SELECT nombre, rut, direccion, comuna FROM clientes WHERE id = ?'; // Ajusta el WHERE según necesites
  const clientId = 1; // Cambia esto por el ID que necesites

  db.query(query, [clientId], (err, results) => {
    if (err) {
      res.status(500).send('Error al obtener datos del cliente');
    } else {
      res.json(results[0]);
    }
  });
});

// Ruta para obtener datos de contratistas
app.get('/api/contractors', (req, res) => {
  const query = 'SELECT id, nombre AS name, porcentaje AS percentage, costo_transporte AS transportationCost, areas FROM contratistas';

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Error al obtener contratistas');
    } else {
      res.json(results);
    }
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
