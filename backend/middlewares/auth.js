// Verifica que la peticion incluya un token valido en el header Authorization
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  // Si no se envio token rechaza la peticion con error 401
  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  // Extrae el ID del usuario del token y lo agrega a la peticion para usarlo en las rutas
  const userId = token.replace('token-', '');
  req.userId = userId;
  next();
};

// Verifica que el usuario autenticado tenga rol de administrador
const verificarAdmin = async (req, res, next) => {
  try {
    const { ObjectId } = require('mongodb');
    const client = req.app.get('mongoClient');

    // Busca el usuario en la base de datos usando el ID extraido del token
    const usuario = await client.db("nexo").collection("Usuarios").findOne({
      _id: new ObjectId(req.userId)
    });

    // Si el usuario no existe o no tiene rol de admin rechaza la peticion con error 403
    if (!usuario || usuario.rol !== 'admin') {
      return res.status(403).json({
        error: "Acceso denegado. Requiere rol de administrador"
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { verificarToken, verificarAdmin };