const express = require('express');
const nodemailer = require('nodemailer');
const { ObjectId } = require('mongodb');
const router = express.Router();

const tokens = new Map();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'nexocontruye373@gmail.com',
    pass: 'akrzzscbrogeztmn'
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = (client) => {

  router.post('/solicitar', async (req, res) => {
  try {
    const { correo } = req.body;
    const usuario = await client.db('nexo').collection('Usuarios')
      .findOne({ correo });

    if (!usuario) {
      return res.status(404).json({ error: 'Correo no registrado' });
    }

    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    tokens.set(token, { correoUsuario: correo, expira: Date.now() + 3600000 });

    await transporter.sendMail({
      from: '"Nexo Construye" <nexocontruye373@gmail.com>',
      to: correo,
      subject: 'Recuperación de contraseña - Nexo Construye',
      html: `...`
    });

    res.json({ message: 'Correo enviado' });
  } catch (err) {
  console.error('Error completo:', err.message);
  res.status(500).json({ error: err.message });
}
});

  router.post('/restablecer', async (req, res) => {
    try {
      const { token, nuevaPassword } = req.body;
      const datos = tokens.get(token);

      if (!datos || Date.now() > datos.expira) {
        return res.status(400).json({ error: 'Token inválido o expirado' });
      }

      await client.db('nexo').collection('Usuarios').updateOne(
        { correo: datos.correoUsuario },
        { $set: { contraseña: nuevaPassword } }
      );

      tokens.delete(token);
      res.json({ message: 'Contraseña actualizada' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};