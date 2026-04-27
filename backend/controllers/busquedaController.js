const { ObjectId } = require('mongodb');

// Nombre de la coleccion de perfiles profesionales en MongoDB
const COLLECTION = 'UsuarioProfecional';

// Nombre de la coleccion que guarda las fechas bloqueadas de cada profesional
const COLLECTION_FECHAS = 'Fecha No Disponible';

// Nombre de la base de datos
const DB = 'nexo';

// Total de horas disponibles en un dia (de 08:00 a 20:00 son 13 horas)
const TOTAL_HORAS = 13;

// Funcion que devuelve todos los profesionales activos ordenados por calificacion de mayor a menor
async function explorar(req, res, client) {
  try {
    // Busca todos los perfiles con estadoPerfil igual a activo y los ordena por calificacionPromedio descendente
    const perfiles = await client.db(DB).collection(COLLECTION)
      .find({ estadoPerfil: 'activo' })
      .sort({ calificacionPromedio: -1 })
      .toArray();

    // Devuelve la lista de perfiles encontrados
    res.json(perfiles);
  } catch (err) {
    // Si ocurre un error devuelve el mensaje de error con codigo 500
    res.status(500).json({ error: err.message });
  }
}

// Funcion que busca profesionales activos filtrando por profesion y fecha de disponibilidad
async function buscar(req, res, client) {
  try {
    // Obtiene los parametros de busqueda desde la URL (?profesion=Arquitecto&fecha=2026-04-22)
    const { profesion, fecha } = req.query;

    // Filtro base: solo perfiles activos
    const filtro = { estadoPerfil: 'activo' };

    // Si se envio una profesion agrega condiciones de busqueda al filtro
    if (profesion) {
      // $or significa que se cumple si alguna de las condiciones es verdadera
      filtro.$or = [
        // Busca coincidencia exacta en el campo profesion sin importar mayusculas o minusculas
        { profesion: { $regex: `^${profesion}$`, $options: 'i' } },
        // Busca si alguna etiqueta del profesional contiene la palabra buscada
        { etiquetas: { $elemMatch: { $regex: profesion, $options: 'i' } } },
        // Busca si la especialidad del profesional contiene la palabra buscada
        { especialidad: { $regex: profesion, $options: 'i' } }
      ];
    }

    // Obtiene los perfiles que cumplen el filtro ordenados por calificacion de mayor a menor
    let perfiles = await client.db(DB).collection(COLLECTION)
      .find(filtro)
      .sort({ calificacionPromedio: -1 })
      .toArray();

    // Si se envio una fecha filtra los profesionales que tienen ese dia completamente bloqueado
    if (fecha) {
      // Busca todos los registros de fechas bloqueadas que coincidan con la fecha enviada
      const bloqueados = await client.db(DB).collection(COLLECTION_FECHAS)
        .find({ fecha })
        .toArray();

      // Filtra solo los profesionales que tienen las 13 horas del dia bloqueadas (dia completo no disponible)
      // y obtiene sus IDs como texto
      const idsBloqueados = bloqueados
        .filter(bloqueo => bloqueo.horas && bloqueo.horas.length >= TOTAL_HORAS)
        .map(bloqueo => bloqueo.profesionalId.toString());

      // Elimina de la lista a los profesionales que tienen el dia completo bloqueado
      perfiles = perfiles.filter(profesional =>
        !idsBloqueados.includes(profesional._id.toString())
      );
    }

    // Devuelve la lista final de profesionales disponibles
    res.json(perfiles);
  } catch (err) {
    // Si ocurre un error devuelve el mensaje de error con codigo 500
    res.status(500).json({ error: err.message });
  }
}

// Exporta las funciones para que puedan ser usadas en las rutas
module.exports = { explorar, buscar };