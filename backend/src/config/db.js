// import { query } from 'express';
// import admin from 'firebase-admin';
// import { QuerySnapshot } from 'firebase-admin/firestore';
// import serviceAccount from '../../serviceAccountKeys.js'; // Asegúrate de que la ruta sea correcta

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// const db = admin.firestore();

// let customersRef = db.collection('Customers');

// customersRef.get().then((querySnapshot) => {
//   querySnapshot.forEach((doc) => {
//     console.log(doc.id, ' => ', doc.data());
//   });
// });

import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Conexión a la base de datos
export const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT),
  connectionLimit: 5,
});
