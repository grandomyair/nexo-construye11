const express = require('express');
const router = express.Router();
const portafolioController = require('../controllers/portafolioController');

module.exports = (client) => {

  router.post('/imagenes', portafolioController.upload.array('imagenes', 20), 
  (req, res) => portafolioController.subirImagenesPortafolio(req, res, client));
  router.post('/', (req, res) => portafolioController.createPortafolio(req, res, client));
  router.get('/', (req, res) => portafolioController.getPortafolios(req, res, client));
  router.get('/profesional/:profesionalId', (req, res) => portafolioController.getPortafolioByProfesionalId(req, res, client));
  router.get('/:id', (req, res) => portafolioController.getPortafolioById(req, res, client));
  router.put('/:id', (req, res) => portafolioController.updatePortafolio(req, res, client));
  router.delete('/:id', (req, res) => portafolioController.deletePortafolio(req, res, client));

  return router;
};