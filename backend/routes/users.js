const express = require('express');
const bcrypt = require('bcrypt');
const { verificarToken, verificarAdmin } = require('../middlewares/auth');

module.exports = (client) => {
  const router = express.Router();

  router.get('/', verificarToken, verificarAdmin, async (req, res) => {
    try {
      const usuarios = await client.db("nexo").collection("Usuarios").find().toArray();
      const usuariosSeguros = usuarios.map(u => {
        const { contraseña, ...resto } = u;
        return resto;
      });
      res.json(usuariosSeguros);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { ObjectId } = require('mongodb');

    const usuario = await client.db("nexo").collection("Usuarios").findOne({
      _id: new ObjectId(id)
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (!usuario.username) {
      await client.db("nexo").collection("Usuarios").updateOne(
        { _id: usuario._id },
        { $set: { username: usuario.nombre } }
      );
      usuario.username = usuario.nombre;
    }

    const { contraseña, ...usuarioSeguro } = usuario;
    res.json(usuarioSeguro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

  router.post('/register', async (req, res) => {
    try {
      const { 
        tipo, 
        nombre, 
        edad, 
        fotoPerfil,
        municipio,
        estado,
        correo, 
        contraseña 
      } = req.body;

      const usuarioExistente = await client.db("nexo").collection("Usuarios").findOne({ correo });
      if (usuarioExistente) {
        return res.status(400).json({ error: "El correo ya está registrado" });
      }

      const contraseñaEncriptada = await bcrypt.hash(contraseña, 10);

     const nuevoUsuario = {
      nombre: nombre || "",
      username: nombre || "",
      edad: edad || 0,
      fotoPerfil: fotoPerfil || "",
      municipio: municipio || "",
      estado: estado || "",
      correo: correo || "",
      contraseña: contraseñaEncriptada,
      rol: "usuario",
      fechaRegistro: new Date(),
      activo: true
    };

      const result = await client.db("nexo").collection("Usuarios").insertOne(nuevoUsuario);
      res.json({ 
        message: "Usuario creado exitosamente", 
        userId: result.insertedId 
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { correo, contraseña } = req.body;

      if (!correo || !contraseña) {
        return res.status(400).json({ error: "Correo y contraseña son requeridos" });
      }

      const usuario = await client.db("nexo").collection("Usuarios").findOne({ correo });

      if (!usuario) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }

      const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);

      if (!contraseñaValida) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }

      res.json({ 
        message: "Login exitoso",
        token: "token-" + usuario._id,
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          correo: usuario.correo,
          tipo: usuario.tipo,
          edad: usuario.edad,
          estado: usuario.estado,
          municipio: usuario.municipio,
          fotoPerfil: usuario.fotoPerfil,
          rol: usuario.rol || "usuario",
          fechaRegistro: usuario.fechaRegistro
        }
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/:id', verificarToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { ObjectId } = require('mongodb');
      
      const usuarioActual = await client.db("nexo").collection("Usuarios").findOne({ 
        _id: new ObjectId(req.userId) 
      });
      
      const esAdmin = usuarioActual && usuarioActual.rol === 'admin';
      const esPropio = req.userId === id;
      
      if (!esAdmin && !esPropio) {
        return res.status(403).json({ 
          error: "No tienes permisos para editar este usuario" 
        });
      }
      
      const { 
        tipo, nombre, edad, fotoPerfil, municipio,
        estado, correo, contraseña, activo, rol
      } = req.body;
      
      const updateData = {};
      if (tipo !== undefined) updateData.tipo = tipo;
      if (nombre !== undefined) updateData.nombre = nombre;
      if (edad !== undefined) updateData.edad = edad;
      if (fotoPerfil !== undefined) updateData.fotoPerfil = fotoPerfil;
      if (municipio !== undefined) updateData.municipio = municipio;
      if (estado !== undefined) updateData.estado = estado;
      if (correo !== undefined) updateData.correo = correo;
      if (contraseña !== undefined) {
        updateData.contraseña = await bcrypt.hash(contraseña, 10);
      }
      if (activo !== undefined) updateData.activo = activo;
      if (rol !== undefined && esAdmin) updateData.rol = rol;

      await client.db("nexo").collection("Usuarios").updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      
      res.json({ message: "Usuario actualizado exitosamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { ObjectId } = require('mongodb');
      
      if (req.userId === id) {
        return res.status(400).json({ 
          error: "No puedes eliminar tu propia cuenta de administrador" 
        });
      }
      
      await client.db("nexo").collection("Usuarios").deleteOne({ 
        _id: new ObjectId(id) 
      });
      
      res.json({ message: "Usuario eliminado exitosamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};