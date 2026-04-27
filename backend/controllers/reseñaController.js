const { ObjectId } = require('mongodb');

const COLLECTION = 'Reseñas';
const COLLECTION_PROFESIONAL = 'UsuarioProfecional';
const DB = 'nexo';

// Crea una nueva resena y recalcula el promedio de calificacion del profesional
async function crearReseña(req, res, client) {
  try {
    const {
      perfilReseñado, autorReseña, nombreAutor,
      calificacion, comentario, proyecto, servicioContratado
    } = req.body;

    // Verifica que se enviaron los campos obligatorios
    if (!perfilReseñado || !autorReseña || !calificacion) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // La calificacion debe estar entre 1 y 5 estrellas
    if (calificacion < 1 || calificacion > 5) {
      return res.status(400).json({ error: 'La calificacion debe ser entre 1 y 5' });
    }

    const nuevaReseña = {
      tipo: 'reseña',
      perfilReseñado: new ObjectId(perfilReseñado),
      autorReseña: new ObjectId(autorReseña),
      nombreAutor: nombreAutor || '',
      calificacion,
      comentario: comentario || '',
      fecha: new Date(),
      proyecto: proyecto || '',
      servicioContratado: servicioContratado || ''
    };

    const result = await client.db(DB).collection(COLLECTION).insertOne(nuevaReseña);

    // Obtiene todas las resenas del profesional para recalcular su promedio
    const todasLasReseñas = await client.db(DB).collection(COLLECTION)
      .find({ perfilReseñado: new ObjectId(perfilReseñado) })
      .toArray();

    const total = todasLasReseñas.length;
    const suma = todasLasReseñas.reduce((acumulador, resena) => acumulador + resena.calificacion, 0);
    const promedio = parseFloat((suma / total).toFixed(1));

    // Actualiza el promedio y el total de resenas en el perfil del profesional
    await client.db(DB).collection(COLLECTION_PROFESIONAL).updateOne(
      { _id: new ObjectId(perfilReseñado) },
      { $set: { calificacionPromedio: promedio, totalReseñas: total } }
    );

    res.status(201).json({ message: 'Resena creada', id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Devuelve todas las resenas de un profesional ordenadas de la mas reciente a la mas antigua
async function getReseñasByProfesional(req, res, client) {
  try {
    const { id } = req.params;
    const reseñas = await client.db(DB).collection(COLLECTION)
      .find({ perfilReseñado: new ObjectId(id) })
      .sort({ fecha: -1 })
      .toArray();
    res.json(reseñas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Devuelve una resena por su ID
async function getReseñaById(req, res, client) {
  try {
    const { id } = req.params;
    const reseña = await client.db(DB).collection(COLLECTION)
      .findOne({ _id: new ObjectId(id) });
    if (!reseña) return res.status(404).json({ error: 'Resena no encontrada' });
    res.json(reseña);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Elimina una resena y recalcula el promedio de calificacion del profesional
async function eliminarReseña(req, res, client) {
  try {
    const { id } = req.params;

    const reseña = await client.db(DB).collection(COLLECTION)
      .findOne({ _id: new ObjectId(id) });
    if (!reseña) return res.status(404).json({ error: 'Resena no encontrada' });

    await client.db(DB).collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });

    // Recalcula el promedio con las resenas que quedan despues de eliminar
    const restantes = await client.db(DB).collection(COLLECTION)
      .find({ perfilReseñado: reseña.perfilReseñado })
      .toArray();

    const total = restantes.length;
    const promedio = total > 0
      ? parseFloat((restantes.reduce((acumulador, resena) => acumulador + resena.calificacion, 0) / total).toFixed(1))
      : 0;

    await client.db(DB).collection(COLLECTION_PROFESIONAL).updateOne(
      { _id: reseña.perfilReseñado },
      { $set: { calificacionPromedio: promedio, totalReseñas: total } }
    );

    res.json({ message: 'Resena eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { crearReseña, getReseñasByProfesional, getReseñaById, eliminarReseña };