const { ObjectId } = require('mongodb');
const { crearNotificacion } = require('./notificacionController');

const COLLECTION = 'Reservaciones';
const DB = 'nexo';

// Crea una nueva reservacion y notifica al profesional
async function crearReservacion(req, res, client) {
  try {
    const {
      cliente, profesional, nombreCliente, nombreProfesional,
      servicio, fecha, hora
    } = req.body;

    // Verifica que se enviaron los campos obligatorios
    if (!cliente || !profesional || !fecha || !hora) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const nuevaReservacion = {
      tipo: 'reservacion',
      cliente: new ObjectId(cliente),
      profesional: new ObjectId(profesional),
      nombreCliente: nombreCliente || '',
      nombreProfesional: nombreProfesional || '',
      servicio: servicio || '',
      fecha,
      hora,
      estado: 'pendiente',
      fechaSolicitud: new Date(),
      fechaConfirmacion: null
    };

    const result = await client.db(DB).collection(COLLECTION).insertOne(nuevaReservacion);

    // Busca el perfil profesional para obtener su usuario base y enviarle la notificacion
    const perfilProfesional = await client.db(DB).collection('UsuarioProfecional')
      .findOne({ _id: new ObjectId(profesional) });

    if (perfilProfesional) {
      const usuarioBase = await client.db(DB).collection('Usuarios')
        .findOne({ correo: perfilProfesional.correo });

      if (usuarioBase) {
        await crearNotificacion(
          client,
          usuarioBase._id.toString(),
          'reserva_nueva',
          `${nombreCliente} quiere reservar tu servicio el ${fecha} a las ${hora}`,
          result.insertedId.toString()
        );
      }
    }

    res.status(201).json({ message: 'Reservacion creada', id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Confirma una reservacion pendiente, bloquea la hora en la agenda del profesional y notifica al cliente
async function confirmarReservacion(req, res, client) {
  try {
    const { id } = req.params;

    const reservacion = await client.db(DB).collection(COLLECTION)
      .findOne({ _id: new ObjectId(id) });

    if (!reservacion) return res.status(404).json({ error: 'Reservacion no encontrada' });

    // Solo se pueden confirmar reservaciones que esten en estado pendiente
    if (reservacion.estado !== 'pendiente') {
      return res.status(400).json({ error: 'Solo se pueden confirmar reservaciones pendientes' });
    }

    await client.db(DB).collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $set: { estado: 'confirmada', fechaConfirmacion: new Date() } }
    );

    // Bloquea la hora en la agenda del profesional para que no pueda recibir otra reserva en ese horario
    const perfilProfesional = await client.db(DB).collection('UsuarioProfecional')
      .findOne({ _id: reservacion.profesional });

    if (perfilProfesional) {
      const fechaNoDispCollection = client.db(DB).collection('Fecha No Disponible');
      const existente = await fechaNoDispCollection.findOne({
        profesionalId: reservacion.profesional,
        fecha: reservacion.fecha
      });

      // Si ya existe un registro para esa fecha agrega la hora, si no crea uno nuevo
      if (existente) {
        await fechaNoDispCollection.updateOne(
          { _id: existente._id },
          { $addToSet: { horas: reservacion.hora } }
        );
      } else {
        await fechaNoDispCollection.insertOne({
          profesionalId: reservacion.profesional,
          fecha: reservacion.fecha,
          horas: [reservacion.hora],
          motivo: 'Reservacion confirmada'
        });
      }
    }

    // Notifica al cliente que su reserva fue aceptada
    await crearNotificacion(
      client,
      reservacion.cliente.toString(),
      'reserva_aceptada',
      `${reservacion.nombreProfesional} acepto tu reserva del ${reservacion.fecha} a las ${reservacion.hora}`,
      id
    );

    res.json({ message: 'Reservacion confirmada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Rechaza una reservacion y notifica al cliente
async function rechazarReservacion(req, res, client) {
  try {
    const { id } = req.params;

    const reservacion = await client.db(DB).collection(COLLECTION)
      .findOne({ _id: new ObjectId(id) });

    if (!reservacion) return res.status(404).json({ error: 'Reservacion no encontrada' });

    await client.db(DB).collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $set: { estado: 'rechazada', fechaRechazo: new Date() } }
    );

    // Notifica al cliente que su reserva fue rechazada
    await crearNotificacion(
      client,
      reservacion.cliente.toString(),
      'reserva_rechazada',
      `${reservacion.nombreProfesional} rechazo tu reserva del ${reservacion.fecha} a las ${reservacion.hora}`,
      id
    );

    res.json({ message: 'Reservacion rechazada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Envia una solicitud de cancelacion al otro participante de la reserva y le notifica
async function solicitarCancelacion(req, res, client) {
  try {
    const { id } = req.params;
    const { solicitadoPor } = req.body;

    // Verifica que se indico quien solicita la cancelacion
    if (!solicitadoPor) {
      return res.status(400).json({ error: 'Indica quien solicita la cancelacion' });
    }

    const reservacion = await client.db(DB).collection(COLLECTION)
      .findOne({ _id: new ObjectId(id) });

    if (!reservacion) return res.status(404).json({ error: 'Reservacion no encontrada' });

    // Asigna el nuevo estado segun quien solicita la cancelacion
    const nuevoEstado = solicitadoPor === 'cliente'
      ? 'solicitud_cancelacion_cliente'
      : 'solicitud_cancelacion_profesional';

    await client.db(DB).collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $set: { estado: nuevoEstado, fechaSolicitudCancelacion: new Date() } }
    );

    // Si el cliente solicita la cancelacion notifica al profesional
    if (solicitadoPor === 'cliente') {
      const perfilProfesional = await client.db(DB).collection('UsuarioProfecional')
        .findOne({ _id: reservacion.profesional });
      if (perfilProfesional) {
        const usuarioBase = await client.db(DB).collection('Usuarios')
          .findOne({ correo: perfilProfesional.correo });
        if (usuarioBase) {
          await crearNotificacion(
            client,
            usuarioBase._id.toString(),
            'cancelacion_solicitada',
            `${reservacion.nombreCliente} solicita cancelar la reserva del ${reservacion.fecha} a las ${reservacion.hora}`,
            id
          );
        }
      }
    } else {
      // Si el profesional solicita la cancelacion notifica al cliente
      await crearNotificacion(
        client,
        reservacion.cliente.toString(),
        'cancelacion_solicitada',
        `${reservacion.nombreProfesional} solicita cancelar la reserva del ${reservacion.fecha} a las ${reservacion.hora}`,
        id
      );
    }

    res.json({ message: 'Solicitud de cancelacion enviada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Confirma la cancelacion de una reserva y libera la hora bloqueada en la agenda del profesional
async function confirmarCancelacion(req, res, client) {
  try {
    const { id } = req.params;

    const reservacion = await client.db(DB).collection(COLLECTION)
      .findOne({ _id: new ObjectId(id) });

    if (!reservacion) return res.status(404).json({ error: 'Reservacion no encontrada' });

    await client.db(DB).collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $set: { estado: 'cancelada', fechaCancelacion: new Date() } }
    );

    // Busca el bloqueo de esa fecha en la agenda del profesional para eliminar la hora
    const fechaNoDispCollection = client.db(DB).collection('Fecha No Disponible');
    const bloqueo = await fechaNoDispCollection.findOne({
      profesionalId: reservacion.profesional,
      fecha: reservacion.fecha
    });

    if (bloqueo) {
      // Elimina la hora cancelada del array de horas bloqueadas
      const horasActualizadas = bloqueo.horas.filter(hora => hora !== reservacion.hora);

      // Si no quedan horas bloqueadas en ese dia elimina el registro completo
      if (horasActualizadas.length === 0) {
        await fechaNoDispCollection.deleteOne({ _id: bloqueo._id });
      } else {
        await fechaNoDispCollection.updateOne(
          { _id: bloqueo._id },
          { $set: { horas: horasActualizadas } }
        );
      }
    }

    res.json({ message: 'Reservacion cancelada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Marca una reservacion confirmada como completada y notifica al cliente para que califique
async function completarReservacion(req, res, client) {
  try {
    const { id } = req.params;

    const reservacion = await client.db(DB).collection(COLLECTION)
      .findOne({ _id: new ObjectId(id) });

    if (!reservacion) return res.status(404).json({ error: 'Reservacion no encontrada' });

    // Solo se pueden completar reservaciones que esten confirmadas
    if (reservacion.estado !== 'confirmada') {
      return res.status(400).json({ error: 'Solo se pueden completar reservaciones confirmadas' });
    }

    await client.db(DB).collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $set: { estado: 'completada', fechaCompletado: new Date() } }
    );

    // Notifica al cliente que el trabajo fue completado y puede dejar su calificacion
    await crearNotificacion(
      client,
      reservacion.cliente.toString(),
      'trabajo_completado',
      `${reservacion.nombreProfesional} marco el trabajo como completado. Por favor validalo y deja tu calificacion.`,
      id
    );

    res.json({ message: 'Reservacion completada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Devuelve todas las reservaciones de un cliente ordenadas de la mas reciente a la mas antigua
async function getReservacionesByCliente(req, res, client) {
  try {
    const { id } = req.params;
    const reservaciones = await client.db(DB).collection(COLLECTION)
      .find({ cliente: new ObjectId(id) })
      .sort({ fechaSolicitud: -1 })
      .toArray();
    res.json(reservaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Devuelve todas las reservaciones de un profesional ordenadas de la mas reciente a la mas antigua
async function getReservacionesByProfesional(req, res, client) {
  try {
    const { id } = req.params;
    const reservaciones = await client.db(DB).collection(COLLECTION)
      .find({ profesional: new ObjectId(id) })
      .sort({ fechaSolicitud: -1 })
      .toArray();
    res.json(reservaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Devuelve una reservacion por su ID
async function getReservacionById(req, res, client) {
  try {
    const { id } = req.params;
    const reservacion = await client.db(DB).collection(COLLECTION)
      .findOne({ _id: new ObjectId(id) });
    if (!reservacion) return res.status(404).json({ error: 'Reservacion no encontrada' });
    res.json(reservacion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  crearReservacion,
  confirmarReservacion,
  rechazarReservacion,
  solicitarCancelacion,
  confirmarCancelacion,
  completarReservacion,
  getReservacionesByCliente,
  getReservacionesByProfesional,
  getReservacionById
};