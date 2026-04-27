const express = require('express');
const { verificarToken } = require('../middlewares/auth');
const {crearPerfilProfesional,getPerfilProfesional,getPerfilProfesionalById,getPerfilProfesionalByCorreo,actualizarPerfilProfesional,
eliminarPerfilProfesional
} = require('../controllers/userProfecionalController');

module.exports = (client) => {
  const router = express.Router();

  router.post('/crear', verificarToken, (req, res) => crearPerfilProfesional(req, res, client));
  router.get('/', verificarToken, (req, res) => getPerfilProfesional(req, res, client));
  router.get('/correo/:correo', verificarToken, (req, res) => getPerfilProfesionalByCorreo(req, res, client));
  router.get('/:id', verificarToken, (req, res) => getPerfilProfesionalById(req, res, client));
  router.put('/:id', verificarToken, (req, res) => actualizarPerfilProfesional(req, res, client));
  router.delete('/:id', verificarToken, (req, res) => eliminarPerfilProfesional(req, res, client));

  return router;
};