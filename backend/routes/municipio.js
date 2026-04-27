const express = require('express');

module.exports = (client) => {
  const router = express.Router();

  router.get('/estado/:estadoId', async (req, res) => {
    try {
      const estadoId = parseInt(req.params.estadoId);
      const municipios = await client.db("nexo").collection("municipios").find({ estado_id: estadoId }).sort({ nombre: 1 }).toArray();
      res.json({ ok: true, data: municipios });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get('/:municipioId', async (req, res) => {
    try {
      const query = { clave_municipio: parseInt(req.params.municipioId) };
      if (req.query.estado_id) query.estado_id = parseInt(req.query.estado_id);
      const municipio = await client.db("nexo").collection("municipios").findOne(query);
      if (!municipio) return res.status(404).json({ ok: false, error: "Municipio no encontrado" });
      res.json({ ok: true, data: municipio });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  return router;
};