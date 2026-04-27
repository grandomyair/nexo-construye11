const { client } = require('../utils/db');

// Devuelve todos los estados ordenados alfabeticamente
async function getEstados(req, res) {
  try {
    const estados = await client.db("nexo").collection("estados").find({}).sort({ nombre: 1 }).toArray();
    res.json({ ok: true, data: estados });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

// Busca un estado por su ID, si no existe devuelve error 404
async function getEstadoById(req, res) {
  try {
    const estado = await client.db("nexo").collection("estados").findOne({ _id: parseInt(req.params.id) });
    if (!estado) return res.status(404).json({ ok: false, error: "Estado no encontrado" });
    res.json({ ok: true, data: estado });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

// Exporta las funciones para que puedan ser usadas en las rutas
module.exports = { getEstados, getEstadoById };