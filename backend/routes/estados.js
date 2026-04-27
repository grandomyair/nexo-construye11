const express = require('express');

module.exports = (client) => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const estados = await client.db("nexo").collection("Estados").find({}).sort({ nombre: 1 }).toArray();
      res.json({ ok: true, data: estados });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const estado = await client.db("nexo").collection("Estados").findOne({ _id: parseInt(req.params.id) });
      if (!estado) return res.status(404).json({ ok: false, message: "Estado no encontrado" });
      res.json({ ok: true, data: estado });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  return router;
};