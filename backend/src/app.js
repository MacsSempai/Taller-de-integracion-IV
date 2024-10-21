// app.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import archivoRoutes from './routes/archivo.routes.js';
import casoRoutes from './routes/caso.routes.js';
import contratistaRoutes from './routes/contratista.routes.js';
import materialRoutes from './routes/material.routes.js';
import estadoRoutes from './routes/estado.routes.js';
import sectorRoutes from './routes/sector.routes.js';
import subsectorRoutes from './routes/subsector.routes.js';
import trabajosRoutes from './routes/trabajos.routes.js'; // Importar las rutas de trabajos
import filesRoutes from './routes/files.routes.js'; // Importar las rutas de archivos

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configurar rutas
app.use('/api/archivos', archivoRoutes);
app.use('/api/casos', casoRoutes);
app.use('/api/contratistas', contratistaRoutes);
app.use('/api/materiales', materialRoutes);
app.use('/api/estados-caso', estadoRoutes);
app.use('/api/sectores', sectorRoutes);
app.use('/api/subsectores', subsectorRoutes);
app.use('/api/trabajos', trabajosRoutes); // Usar las rutas de trabajos
app.use('/api/files', filesRoutes); // Usar las rutas de archivos

// Ruta de prueba
app.get('/prueba', (req, res) => {
  res.send('Ruta de prueba funcionando');
});

export default app;
