const { ObjectId } = require('mongodb');

const COLLECTION = 'UsuarioProfecional';
const DB = 'nexo';

// Crea un nuevo perfil profesional y actualiza el tipo del usuario base a profesional
async function crearPerfilProfesional(req, res, client) {
  try {
    const {
      nombre, correo, fotoPerfil, municipio, edad, estado,
      profesion, especialidad, areaServicio,
      cedulaProfesional, añosExperiencia, biografia,
      servicios, etiquetas, portafolio
    } = req.body;

    // Verifica que no exista ya un perfil profesional con ese correo
    const existente = await client.db(DB).collection(COLLECTION).findOne({ correo });
    if (existente) {
      return res.status(400).json({ error: "Ya existe un perfil profesional con ese correo" });
    }

    const nuevoPerfil = {
      tipo: "profesional",
      nombre: nombre || "",
      edad: edad || 0,
      fotoPerfil: fotoPerfil || "",
      estado: estado || "",
      municipio: municipio || "",
      correo: correo || "",
      fechaRegistro: new Date(),
      activo: true,
      profesion: profesion || "",
      especialidad: especialidad || "",
      areaServicio: areaServicio || [],
      cedulaProfesional: cedulaProfesional || "",
      añosExperiencia: añosExperiencia || 0,
      biografia: biografia || "",
      servicios: servicios || [],
      etiquetas: etiquetas || [],
      portafolio: portafolio || [],
      estadoPerfil: "activo",
      popularidad: 0,
      calificacionPromedio: 0,
      totalReseñas: 0,
      proyectosCompletados: 0,
      fechasNoDisponibles: [],
      reseñasRecibidas: [],
      rol: profesion || ""
    };

    const result = await client.db(DB).collection(COLLECTION).insertOne(nuevoPerfil);

    // Actualiza el tipo del usuario en la coleccion Usuarios a profesional
    await client.db(DB).collection('Usuarios').updateOne(
      { correo: correo },
      { $set: { tipo: 'profesional' } }
    );

    res.status(201).json({ message: "Perfil profesional creado", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Devuelve todos los perfiles profesionales
async function getPerfilProfesional(req, res, client) {
  try {
    const perfiles = await client.db(DB).collection(COLLECTION).find().toArray();
    res.json(perfiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Devuelve un perfil profesional por su ID
async function getPerfilProfesionalById(req, res, client) {
  try {
    const { id } = req.params;
    const perfil = await client.db(DB).collection(COLLECTION).findOne({ _id: new ObjectId(id) });
    if (!perfil) return res.status(404).json({ error: "Perfil no encontrado" });
    res.json(perfil);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Actualiza solo los campos permitidos de un perfil profesional
async function actualizarPerfilProfesional(req, res, client) {
  try {
    const { id } = req.params;
    const campos = req.body;

    const updateData = {};
    const permitidos = [
      'nombre', 'edad', 'fotoPerfil', 'estado', 'municipio', 'correo',
      'profesion', 'especialidad', 'areaServicio', 'cedulaProfesional',
      'añosExperiencia', 'biografia', 'servicios', 'etiquetas',
      'portafolio', 'estadoPerfil', 'activo'
    ];

    // Solo agrega al objeto de actualizacion los campos que esten en la lista de permitidos
    permitidos.forEach(campo => {
      if (campos[campo] !== undefined) updateData[campo] = campos[campo];
    });

    const result = await client.db(DB).collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) return res.status(404).json({ error: "Perfil no encontrado" });
    res.json({ message: "Perfil actualizado exitosamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Elimina un perfil profesional por su ID
async function eliminarPerfilProfesional(req, res, client) {
  try {
    const { id } = req.params;
    const result = await client.db(DB).collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Perfil no encontrado" });
    res.json({ message: "Perfil eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Devuelve un perfil profesional buscando por correo electronico
async function getPerfilProfesionalByCorreo(req, res, client) {
  try {
    const { correo } = req.params;
    const perfil = await client.db(DB).collection(COLLECTION).findOne({ correo });
    if (!perfil) return res.status(404).json({ error: "Perfil no encontrado" });
    res.json(perfil);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  crearPerfilProfesional, getPerfilProfesional, getPerfilProfesionalById,
  getPerfilProfesionalByCorreo, actualizarPerfilProfesional, eliminarPerfilProfesional
};