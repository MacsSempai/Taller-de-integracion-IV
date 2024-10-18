import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import archivoRoutes from './routes/archivo.routes.js';
import casoRoutes from './routes/caso.routes.js';
import contratistaRoutes from './routes/contratista.routes.js';
import materialRoutes from './routes/material.routes.js';
import estadoRoutes from './routes/estado.routes.js';
import sectorRoutes from './routes/sector.routes.js';  // Nueva ruta para sectores
import subsectorRoutes from './routes/subsector.routes.js';  // Nueva ruta para subsectores

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
app.use('/api/sectores', sectorRoutes); // Nueva ruta de sectores
app.use('/api/subsectores', subsectorRoutes); // Nueva ruta de subsectores

// Ruta de prueba
app.get('/prueba', (req, res) => {
  res.send('Ruta de prueba funcionando');
});

export default app;
