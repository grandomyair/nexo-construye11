const { ObjectId } = require('mongodb');

const COLLECTION = 'Conversacion';
const DB = 'nexo';

// Busca una conversacion existente entre cliente y profesional, si no existe la crea
async function obtenerOCrearConversacion(req, res, client) {
  try {
    const { clienteId, profesionalId, nombreCliente, nombreProfesional } = req.body;

    // Verifica que se enviaron los IDs obligatorios
    if (!clienteId || !profesionalId) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Busca el perfil profesional para obtener su correo
    const perfilProfesional = await client.db(DB).collection('UsuarioProfecional')
      .findOne({ _id: new ObjectId(profesionalId) });

    // Busca el usuario base del profesional usando su correo
    const usuarioBase = await client.db(DB).collection('Usuarios')
      .findOne({ correo: perfilProfesional.correo });

    // Usa el ID del usuario base si existe, si no usa el ID del perfil profesional
    const profesionalUserId = usuarioBase ? usuarioBase._id : new ObjectId(profesionalId);

    // Busca si ya existe una conversacion entre los dos participantes
    let conversacion = await client.db(DB).collection(COLLECTION).findOne({
      participantes: {
        $all: [new ObjectId(clienteId), profesionalUserId]
      }
    });

    // Si no existe la conversacion la crea con los mensajes vacios
    if (!conversacion) {
      const nueva = {
        participantes: [new ObjectId(clienteId), profesionalUserId],
        nombreCliente: nombreCliente || '',
        nombreProfesional: nombreProfesional || '',
        mensajes: [],
        ultimoMensaje: '',
        fechaUltimoMensaje: new Date()
      };
      const result = await client.db(DB).collection(COLLECTION).insertOne(nueva);
      conversacion = { ...nueva, _id: result.insertedId };
    }

    res.json(conversacion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Agrega un nuevo mensaje a la conversacion y lo envia en tiempo real con Socket.io
async function enviarMensaje(req, res, client) {
  try {
    const { conversacionId } = req.params;
    const { autorId, nombreAutor, texto } = req.body;

    // Construye el objeto del mensaje con su ID, autor, texto, fecha y estado de leido
    const mensaje = {
      _id: new ObjectId(),
      autorId: new ObjectId(autorId),
      nombreAutor: nombreAutor || '',
      texto,
      fecha: new Date(),
      leido: false
    };

    // Agrega el mensaje al array de mensajes y actualiza el ultimo mensaje de la conversacion
    await client.db(DB).collection(COLLECTION).updateOne(
      { _id: new ObjectId(conversacionId) },
      {
        $push: { mensajes: mensaje },
        $set: {
          ultimoMensaje: texto,
          fechaUltimoMensaje: new Date()
        }
      }
    );

    // Si Socket.io esta activo emite el mensaje en tiempo real a los participantes
    const io = client._io;
    if (io) {
      io.to(conversacionId).emit('mensaje', mensaje);
    }

    res.status(201).json({ message: 'Mensaje enviado', mensaje });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Devuelve todos los mensajes de una conversacion
async function getMensajes(req, res, client) {
  try {
    const { conversacionId } = req.params;
    const conversacion = await client.db(DB).collection(COLLECTION)
      .findOne({ _id: new ObjectId(conversacionId) });

    // Si no se encuentra la conversacion devuelve error 404
    if (!conversacion) {
      return res.status(404).json({ error: 'Conversacion no encontrada' });
    }

    res.json(conversacion.mensajes || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Devuelve todas las conversaciones de un usuario ordenadas por la mas reciente
async function getConversacionesByUsuario(req, res, client) {
  try {
    const { usuarioId } = req.params;
    const conversaciones = await client.db(DB).collection(COLLECTION)
      .find({ participantes: new ObjectId(usuarioId) })
      .sort({ fechaUltimoMensaje: -1 })
      .toArray();

    res.json(conversaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Marca como leidos los mensajes de la conversacion que no fueron enviados por el usuario actual
async function marcarComoLeidos(req, res, client) {
  try {
    const { conversacionId } = req.params;
    const { usuarioId } = req.body;

    // Actualiza a leido true solo los mensajes que no pertenecen al usuario actual
    await client.db(DB).collection(COLLECTION).updateOne(
      { _id: new ObjectId(conversacionId) },
      { $set: { 'mensajes.$[elem].leido': true } },
      {
        arrayFilters: [
          { 'elem.autorId': { $ne: new ObjectId(usuarioId) } }
        ]
      }
    );

    res.json({ message: 'Mensajes marcados como leidos' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Exporta las funciones para que puedan ser usadas en las rutas
module.exports = {
  obtenerOCrearConversacion,
  enviarMensaje,
  getMensajes,
  getConversacionesByUsuario,
  marcarComoLeidos
};