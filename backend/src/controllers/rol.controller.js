import { pool } from '../config/db.js';

// Obtener todos los roles
export const getRol = async (req, res) => {
  try {
    const conn = await pool.getConnection();

    const roles = await conn.query('SELECT * FROM Rol ');
    res.json(roles[0]);
  } catch (error) {
    console.log('Algo salió mal');
    res.status(500).json({ error: error.message });
  }
};

// Obtener un rol por su ID
export const getRolporID = async (req, res) => {
  try {
    const { id } = req.params;

    // Asegúrate de que el id_usuario sea válido
    if (!id) {
      return res.status(400).json({ error: "El ID del usuario es requerido" });
    }

    console.log(id);

    const conn = await pool.getConnection();
    try {
      // Consulta que une las tablas Usuario y Rol
      const query = `
        SELECT R.nombre_rol 
        FROM Usuario U
        JOIN Rol R ON U.id_rol = R.id_rol
        WHERE U.id_usuario = ?`;
        
      const roles = await conn.query(query, [id]);
      console.log(roles[0][0].nombre_rol);

      // Verifica si se encontró el rol
      if (roles[0].length === 0) {
        return res.status(404).json({ error: "Rol no encontrado para el ID de usuario proporcionado" });
      }

      // Devuelve solo el nombre del rol
      res.json(roles[0][0].nombre_rol); // Accede directamente al nombre_rol
    } finally {
      // Asegúrate de liberar la conexión después de usarla
      conn.release();
    }
  } catch (error) {
    console.log('Algo salió mal', error);
    res.status(500).json({ error: error.message });
  }
};

// Registrar un nuevo rol
export const registerRol = async (req, res) => {
  try {
    const {
      nombre_rol,
      puede_editar_precios,
      puede_ver_casos,
      puede_generar_excel,
      puede_generar_informe_pdf,
    } = req.body;

    // Crea un objeto con los datos que vas a insertar
    const newRole = {
      nombre_rol,
      puede_editar_precios,
      puede_ver_casos,
      puede_generar_excel,
      puede_generar_informe_pdf,
    };

    const conn = await pool.getConnection();

    await conn.query('INSERT INTO Rol SET ?', [newRole]);
    res.json(newRole);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
