const express = require('express');
const { verificarToken } = require('../middlewares/auth');
const {getNotificaciones,contarNoLeidas,marcarTodasLeidas,eliminarNotificacion,eliminarTodasNotificaciones
} = require('../controllers/notificacionController');

module.exports = (client) => {
  const router = express.Router();

  router.get('/usuario/:usuarioId', verificarToken, (req, res) => getNotificaciones(req, res, client));
  router.get('/usuario/:usuarioId/count', verificarToken, (req, res) => contarNoLeidas(req, res, client));
  router.patch('/usuario/:usuarioId/leer', verificarToken, (req, res) => marcarTodasLeidas(req, res, client));
  router.delete('/todas/:usuarioId', verificarToken, (req, res) => eliminarTodasNotificaciones(req, res, client));
  router.delete('/:id', verificarToken, (req, res) => eliminarNotificacion(req, res, client));

  return router;
};