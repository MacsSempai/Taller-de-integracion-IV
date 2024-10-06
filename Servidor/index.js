const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Importar rutas
const loginRoutes = require('./routes/login');
const rolesRoutes = require('./routes/roles');
const casosRoutes = require('./routes/casos');
const usuariosRoutes = require('./routes/usuarios');
const sectoresRoutes = require('./routes/sectores');
const contratistasRoutes = require('./routes/contratistas');

// Usar las rutas
app.use(loginRoutes);
app.use('/roles', rolesRoutes);
app.use('/casos', casosRoutes);
app.use('/usuarios', usuariosRoutes);
app.use(sectoresRoutes);
app.use('/contratistas', contratistasRoutes);

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://192.168.50.101:3000');
});
