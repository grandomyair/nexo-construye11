const { ObjectId } = require('mongodb');

const COLLECTION = 'Fecha No Disponible';
const DB = 'nexo';
const TOTAL_HORAS = 13;

// Guarda las horas bloqueadas de un dia, si ya existe el registro lo actualiza
async function guardarFechaHoras(req, res, client) {
  try {
    const { profesionalId, fecha, horas } = req.body;

    // Verifica que se enviaron los campos obligatorios
    if (!profesionalId || !fecha || !horas) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Busca si ya existe un registro de bloqueo para ese profesional en esa fecha
    const existente = await client.db(DB).collection(COLLECTION).findOne({
      profesionalId: new ObjectId(profesionalId),
      fecha
    });

    // Si ya existe actualiza las horas bloqueadas
    if (existente) {
      await client.db(DB).collection(COLLECTION).updateOne(
        { _id: existente._id },
        { $set: { horas } }
      );
      return res.json({ message: 'Horas actualizadas' });
    }

    // Si no existe crea un nuevo registro con las horas bloqueadas
    await client.db(DB).collection(COLLECTION).insertOne({
      profesionalId: new ObjectId(profesionalId),
      fecha,
      horas
    });

    res.status(201).json({ message: 'Fecha bloqueada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Devuelve todas las fechas bloqueadas de un profesional ordenadas por fecha
async function getFechasByProfesional(req, res, client) {
  try {
    const { profesionalId } = req.params;
    const fechas = await client.db(DB).collection(COLLECTION)
      .find({ profesionalId: new ObjectId(profesionalId) })
      .sort({ fecha: 1 })
      .toArray();
    res.json(fechas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Devuelve las horas bloqueadas de un dia especifico para un profesional
async function getFechaByDia(req, res, client) {
  try {
    const { profesionalId, fecha } = req.params;
    const bloqueo = await client.db(DB).collection(COLLECTION).findOne({
      profesionalId: new ObjectId(profesionalId),
      fecha
    });
    // Si no hay bloqueo para ese dia devuelve un array de horas vacio
    res.json(bloqueo || { horas: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Elimina un registro de fecha bloqueada por su ID
async function eliminarFecha(req, res, client) {
  try {
    const { id } = req.params;
    const result = await client.db(DB).collection(COLLECTION)
      .deleteOne({ _id: new ObjectId(id) });

    // Si no se encontro el registro devuelve error 404
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Fecha no encontrada' });
    }
    res.json({ message: 'Fecha eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Exporta las funciones para que puedan ser usadas en las rutas
module.exports = {
  guardarFechaHoras,
  getFechasByProfesional,
  getFechaByDia,
  eliminarFecha
};