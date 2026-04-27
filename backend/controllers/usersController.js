const { client } = require('../utils/db');

// Crea un nuevo usuario verificando que no exista ya uno con el mismo correo
async function createUser(req, res) {
  try {
    const { email, username, password } = req.body;

    // Verifica que se enviaron todos los campos obligatorios
    if (!email || !username || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Verifica que no exista ya un usuario con ese correo
    const existingUser = await client.db("nexo").collection("Usuarios").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Usuario ya registrado" });
    }

    const result = await client.db("nexo").collection("Usuarios").insertOne({ email, username, password });
    res.status(201).json({ message: "Usuario registrado", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Devuelve todos los usuarios registrados
async function getAllUsers(req, res) {
  try {
    const users = await client.db("nexo").collection("Usuarios").find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Devuelve un usuario por su ID, si no existe devuelve error 404
async function getUserById(req, res) {
  try {
    const id = req.params.id;
    const user = await client.db("nexo").collection("Usuarios").findOne({ _id: new require('mongodb').ObjectId(id) });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Actualiza el correo, nombre de usuario y contrasena de un usuario por su ID
async function updateUser(req, res) {
  try {
    const id = req.params.id;
    const { email, username, password } = req.body;
    const result = await client.db("nexo").collection("Usuarios").updateOne(
      { _id: new require('mongodb').ObjectId(id) },
      { $set: { email, username, password } }
    );

    if (result.matchedCount === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ message: "Usuario actualizado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Elimina un usuario por su ID
async function deleteUser(req, res) {
  try {
    const id = req.params.id;
    const result = await client.db("nexo").collection("Usuarios").deleteOne({ _id: new require('mongodb').ObjectId(id) });

    if (result.deletedCount === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser };