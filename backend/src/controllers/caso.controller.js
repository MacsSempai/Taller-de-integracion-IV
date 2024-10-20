import { pool } from '../config/db.js';

// Controlador para crear un nuevo caso
export const createCaso = async (req, res) => {
  try {
    const {
      tipo_siniestro,
      descripcion_siniestro,
      ID_contratista,
      ID_material,
      ID_estado,
      sector,
      sub_sector,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO caso (tipo_siniestro, descripcion_siniestro, ID_contratista, ID_estado)
      VALUES (?, ?, ?, ?)`,
      [tipo_siniestro, descripcion_siniestro, ID_contratista, ID_estado]
    );

    const ID_caso = result.insertId; // ID del caso recién creado
    res.status(201).json({ message: 'Caso creado exitosamente', ID_caso });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el caso', error: error.message });
  }
};

// Controlador para obtener todos los casos
export const getCasos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM caso');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los casos', error: error.message });
  }
};

// Controlador para obtener casos del usuario
export const getCasosUsuario = async (req, res) => {
  try {
    const { ID_usuario } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM caso WHERE ID_Cliente = ?`,
      [ID_usuario]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los casos del usuario', error: error.message });
  }
};

// Controlador para obtener un caso por ID
export const getCasoById = async (req, res) => {
  try {
    const { ID_caso } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM caso WHERE ID_caso = ?`,
      [ID_caso]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el caso', error: error.message });
  }
};

// Controlador para obtener información completa de un caso
export const getCasoCompletoById = async (req, res) => {
  const { ID_caso } = req.params;

  try {
    const query = `
      SELECT 
          c.ID_caso,
          c.tipo_siniestro,
          c.descripcion_siniestro,
          
          -- Información del inspector
          inspector.nombre AS nombre_inspector,
          inspector.apellido AS apellido_inspector,
          inspector.celular AS celular_inspector,
          inspector.correo AS correo_inspector,
          
          -- Información del contratista
          contratista.nombre AS nombre_contratista,
          contratista.apellido AS apellido_contratista,
          contratista.celular AS celular_contratista,
          contratista.correo AS correo_contratista,
          ct.area_trabajo,
          
          -- Información del cliente
          cliente.nombre AS nombre_cliente,
          cliente.apellido AS apellido_cliente,
          cliente.celular AS celular_cliente,
          cliente.correo AS correo_cliente,
          
          -- Información de los sectores
          s.nombre_sector,
          s.dano_sector,
          s.porcentaje_perdida,
          s.total_costo,
          
          -- Información de los subsectores
          ss.nombre_sub_sector,
          ss.tipo_reparacion,
          ss.cantidad_material,
          m.nombre_material,
          m.precio AS precio_material,
          m.medida

      FROM caso c

      -- Join con el inspector
      INNER JOIN usuario inspector ON c.ID_inspector = inspector.ID_usuario

      -- Join con el contratista
      INNER JOIN contratista ct ON c.ID_contratista = ct.ID_contratista
      INNER JOIN usuario contratista ON ct.ID_usuario = contratista.ID_usuario

      -- Join con el cliente
      INNER JOIN usuario cliente ON c.ID_cliente = cliente.ID_usuario

      -- Join con los sectores
      LEFT JOIN sector s ON c.ID_caso = s.ID_caso

      -- Join con los subsectores
      LEFT JOIN subsector ss ON s.ID_sector = ss.ID_sector

      -- Join con los materiales
      LEFT JOIN material m ON ss.ID_material = m.ID_material

      WHERE c.ID_caso = ?;

    `;

    const [result] = await pool.query(query, [ID_caso]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'Caso no encontrado' });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la información completa del caso', error: error.message });
  }
};

// Controlador para actualizar el estado de un caso
export const updateEstadoCaso = async (req, res) => {
  try {
    const { ID_caso } = req.params;
    const { ID_estado } = req.body;

    console.log('ID_caso:', ID_caso);
    console.log('ID_estado:', ID_estado);

    const [result] = await pool.query(
      `UPDATE caso SET ID_estado = ? WHERE ID_caso = ?`,
      [ID_estado, ID_caso]
    );

    if (result.affectedRows > 0) {
      res.json({ message: 'Estado del caso actualizado exitosamente' });
    } else {
      res.status(404).json({ message: 'Caso no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado del caso', error: error.message });
  }
};

