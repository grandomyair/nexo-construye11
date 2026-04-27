const express = require('express');
const { explorar, buscar } = require('../controllers/busquedaController');

module.exports = (client) => {
  const router = express.Router();

  // GET /busqueda/explorar
  router.get('/explorar', (req, res) => explorar(req, res, client));

  // GET /busqueda/buscar?profesion=arquitecto&fecha=2026-04-10
  router.get('/buscar', (req, res) => buscar(req, res, client));

  return router;
};