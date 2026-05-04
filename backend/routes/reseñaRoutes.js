const express = require('express');
const { verificarToken } = require('../middlewares/auth');
const {crearReseña,getReseñasByProfesional,getReseñaById,eliminarReseña
} = require('../controllers/reseñaController');

module.exports = (client) => {
  const router = express.Router();

  router.post('/crear', verificarToken, (req, res) => crearReseña(req, res, client));
  router.get('/profesional/:id', verificarToken, (req, res) => getReseñasByProfesional(req, res, client));
  router.get('/:id', verificarToken, (req, res) => getReseñaById(req, res, client));
  router.delete('/:id', verificarToken, (req, res) => eliminarReseña(req, res, client));

  return router;
};