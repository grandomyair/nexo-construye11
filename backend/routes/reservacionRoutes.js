const express = require('express');
const { verificarToken } = require('../middlewares/auth');
const {crearReservacion,confirmarReservacion,rechazarReservacion,solicitarCancelacion,confirmarCancelacion,completarReservacion,
getReservacionesByCliente,getReservacionesByProfesional,getReservacionById
} = require('../controllers/reservacionController');

module.exports = (client) => {
  const router = express.Router();

  router.post('/crear', verificarToken, (req, res) => crearReservacion(req, res, client));
  router.patch('/:id/confirmar', verificarToken, (req, res) => confirmarReservacion(req, res, client));
  router.patch('/:id/rechazar', verificarToken, (req, res) => rechazarReservacion(req, res, client));
  router.patch('/:id/solicitar-cancelacion', verificarToken, (req, res) => solicitarCancelacion(req, res, client));
  router.patch('/:id/confirmar-cancelacion', verificarToken, (req, res) => confirmarCancelacion(req, res, client));
  router.patch('/:id/completar', verificarToken, (req, res) => completarReservacion(req, res, client));
  router.get('/cliente/:id', verificarToken, (req, res) => getReservacionesByCliente(req, res, client));
  router.get('/profesional/:id', verificarToken, (req, res) => getReservacionesByProfesional(req, res, client));
  router.get('/:id', verificarToken, (req, res) => getReservacionById(req, res, client));

  return router;
};