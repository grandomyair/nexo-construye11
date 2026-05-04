const express = require('express');
const { verificarToken } = require('../middlewares/auth');
const {obtenerOCrearConversacion,enviarMensaje,getMensajes,getConversacionesByUsuario,marcarComoLeidos
} = require('../controllers/conversacionController');

module.exports = (client) => {
  const router = express.Router();

  router.post('/iniciar', verificarToken, (req, res) => obtenerOCrearConversacion(req, res, client));
  router.post('/:conversacionId/mensaje', verificarToken, (req, res) => enviarMensaje(req, res, client));
  router.get('/:conversacionId/mensajes', verificarToken, (req, res) => getMensajes(req, res, client));
  router.get('/usuario/:usuarioId', verificarToken, (req, res) => getConversacionesByUsuario(req, res, client));
  router.patch('/:conversacionId/leidos', verificarToken, (req, res) => marcarComoLeidos(req, res, client));

  return router;
};