const { client } = require('../utils/db');

// Devuelve todos los municipios de un estado ordenados alfabeticamente
async function getMunicipiosByEstado(req, res) {
  try {
    const estadoId = parseInt(req.params.estadoId);
    const municipios = await client.db("nexo").collection("municipios").find({ estado_id: estadoId }).sort({ nombre: 1 }).toArray();
    res.json({ ok: true, data: municipios });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

// Busca un municipio por su ID, si se envia estado_id tambien filtra por estado
async function getMunicipioById(req, res) {
  try {
    const query = { clave_municipio: parseInt(req.params.municipioId) };
    if (req.query.estado_id) query.estado_id = parseInt(req.query.estado_id);
    const municipio = await client.db("nexo").collection("municipios").findOne(query);

    // Si no se encuentra el municipio devuelve error 404
    if (!municipio) return res.status(404).json({ ok: false, error: "Municipio no encontrado" });
    res.json({ ok: true, data: municipio });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = { getMunicipiosByEstado, getMunicipioById };