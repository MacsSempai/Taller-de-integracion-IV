import app from './app.js';

const PORT = process.env.PORT || 3000; // Cambia el puerto a 3003 o cualquier otro disponible
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
