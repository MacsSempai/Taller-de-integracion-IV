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
      `SELECT * FROM caso WHERE ID_Cliente = ? OR ID_inspector = ? OR ID_contratista = ?`,
      [ID_usuario, ID_usuario, ID_usuario]
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
          u_cliente.ID_usuario AS ID_cliente,
          u_cliente.nombre AS nombre_cliente,
          u_cliente.apellido AS apellido_cliente,
          u_cliente.celular AS celular_cliente,
          u_cliente.correo AS correo_cliente,
          u_cliente.direccion AS direccion_cliente,
          u_cliente.comuna AS comuna_cliente,
          
          u_inspector.ID_usuario AS ID_inspector,
          u_inspector.nombre AS nombre_inspector,
          u_inspector.apellido AS apellido_inspector,
          u_inspector.celular AS celular_inspector,
          u_inspector.correo AS correo_inspector,
          u_inspector.direccion AS direccion_inspector,
          u_inspector.comuna AS comuna_inspector,
          
          u_contratista.ID_usuario AS ID_contratista,
          u_contratista.nombre AS nombre_contratista,
          u_contratista.apellido AS apellido_contratista,
          u_contratista.celular AS celular_contratista,
          u_contratista.correo AS correo_contratista,
          u_contratista.direccion AS direccion_contratista,
          u_contratista.comuna AS comuna_contratista,
          
          c.ID_caso,
          c.tipo_siniestro,
          c.descripcion_siniestro,
          c.ID_estado,
          
          a.ID_archivo,
          a.tipo_de_archivo,
          a.ruta_archivo,
          
          s.ID_sector,
          s.nombre_sector,
          s.dano_sector,
          s.porcentaje_perdida,
          s.total_costo,
          
          ss.ID_sub_sector,
          ss.nombre_sub_sector,
          ss.cantidad_material,
          ss.tipo_reparacion
      FROM 
          caso c
      JOIN 
          usuario u_cliente ON c.ID_Cliente = u_cliente.ID_usuario
      JOIN 
          usuario u_inspector ON c.ID_inspector = u_inspector.ID_usuario
      JOIN 
          usuario u_contratista ON c.ID_contratista = u_contratista.ID_usuario
      LEFT JOIN 
          archivo a ON c.ID_caso = a.ID_caso
      LEFT JOIN 
          sector s ON c.ID_caso = s.ID_caso
      LEFT JOIN 
          subsector ss ON s.ID_sector = ss.ID_sector
      WHERE 
          c.ID_caso = ?;
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

// Controlador para crear un nuevo caso, el controlador recibe el tipo de siniestro y la descripción del siniestro, luego se elige un inspector en funcion a cuantos casos tiene asignados
export const createNuevoCaso = async (req, res) => {
  try {
    const { tipo_siniestro, descripcion_siniestro, ID_usuario, ID_contratista } = req.body;

    // Seleccionar el inspector con menos casos asignados
    const [rows] = await pool.query(
      `SELECT ID_inspector, COUNT(ID_caso) AS casos_asignados
      FROM caso
      WHERE ID_inspector IS NOT NULL
      GROUP BY ID_inspector
      ORDER BY casos_asignados ASC
      LIMIT 1;
      `
    );

    const inspector = rows[0]; // Asegura que tomes el primer resultado del array
    if (!inspector) {
      return res.status(404).json({ message: 'No hay inspectores disponibles' });
    }

    console.log('Inspector seleccionado:', inspector.ID_inspector);

    const [result] = await pool.query(
      `INSERT INTO caso (tipo_siniestro, descripcion_siniestro, ID_Cliente, ID_inspector, ID_contratista, ID_estado)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [tipo_siniestro, descripcion_siniestro, ID_usuario, inspector.ID_inspector, ID_contratista]
    );

    const ID_caso = result.insertId; // ID del caso recién creado
    res.status(201).json({ message: 'Caso creado exitosamente', ID_caso });
  } catch (error) {
    console.error('Error al crear el caso:', error);
    res.status(500).json({ message: 'Error al crear el caso', error: error.message });
  }
};
