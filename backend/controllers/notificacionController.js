const { ObjectId } = require('mongodb');

const COLLECTION = 'Notificacion';
const DB = 'nexo';

// Crea una notificacion para un usuario y la emite en tiempo real con Socket.io
async function crearNotificacion(client, usuarioId, tipo, mensaje, reservacionId = null) {
  try {
    await client.db(DB).collection(COLLECTION).insertOne({
      usuarioId: new ObjectId(usuarioId),
      tipo,
      mensaje,
      reservacionId: reservacionId ? new ObjectId(reservacionId) : null,
      leida: false,
      fecha: new Date()
    });

    // Si Socket.io esta activo emite la notificacion a la sala personal del usuario
    const io = client._io;
    if (io) {
      io.to(`user_${usuarioId}`).emit('notificacion', { tipo, mensaje });
    }
  } catch (err) {
    console.error('Error creando notificacion:', err.message);
  }
}

// Devuelve todas las notificaciones de un usuario ordenadas de la mas reciente a la mas antigua
async function getNotificaciones(req, res, client) {
  try {
    const { usuarioId } = req.params;
    const notificaciones = await client.db(DB).collection(COLLECTION)
      .find({ usuarioId: new ObjectId(usuarioId) })
      .sort({ fecha: -1 })
      .toArray();
    res.json(notificaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Cuenta cuantas notificaciones no leidas tiene un usuario
async function contarNoLeidas(req, res, client) {
  try {
    const { usuarioId } = req.params;
    const total = await client.db(DB).collection(COLLECTION)
      .countDocuments({ usuarioId: new ObjectId(usuarioId), leida: false });
    res.json({ total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Marca todas las notificaciones no leidas de un usuario como leidas
async function marcarTodasLeidas(req, res, client) {
  try {
    const { usuarioId } = req.params;
    await client.db(DB).collection(COLLECTION).updateMany(
      { usuarioId: new ObjectId(usuarioId), leida: false },
      { $set: { leida: true } }
    );
    res.json({ message: 'Notificaciones marcadas como leidas' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Elimina una notificacion por su ID
async function eliminarNotificacion(req, res, client) {
  try {
    const { id } = req.params;
    await client.db(DB).collection(COLLECTION)
      .deleteOne({ _id: new ObjectId(id) });
    res.json({ message: 'Notificacion eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  crearNotificacion,
  getNotificaciones,
  contarNoLeidas,
  marcarTodasLeidas,
  eliminarNotificacion
};