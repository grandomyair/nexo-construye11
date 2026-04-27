const express = require('express');
const { verificarToken } = require('../middlewares/auth');
const {
  guardarFechaHoras,
  getFechasByProfesional,
  getFechaByDia,
  eliminarFecha
} = require('../controllers/fechaNoDisponibleController');

module.exports = (client) => {
  const router = express.Router();

  router.post('/guardar', verificarToken, (req, res) => guardarFechaHoras(req, res, client));
  router.get('/profesional/:profesionalId', verificarToken, (req, res) => getFechasByProfesional(req, res, client));
  router.get('/profesional/:profesionalId/dia/:fecha', verificarToken, (req, res) => getFechaByDia(req, res, client));
  router.delete('/:id', verificarToken, (req, res) => eliminarFecha(req, res, client));

  return router;
};