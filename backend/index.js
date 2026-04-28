require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const http = require('http');
const { Server } = require('socket.io');
const passport = require('passport');
const session = require('express-session');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');

// Crea la aplicacion de Express y el servidor HTTP
const app = express();
const server = http.createServer(app);

// Configura Socket.io permitiendo conexiones desde cualquier origen
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const port = 3000;

// Permite peticiones desde el frontend en localhost:8100
app.use(cors({
  origin: 'http://localhost:8100',
  credentials: true
}));

// Permite recibir JSON y formularios con un limite de 10mb
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Configura las sesiones necesarias para que Passport funcione
app.use(session({
  secret: 'nexo-secret-session',
  resave: false,
  saveUninitialized: false
}));

// Inicializa Passport para manejar la autenticacion
app.use(passport.initialize());
app.use(passport.session());

// Cadena de conexion a MongoDB Atlas 
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

// Conecta la aplicacion a MongoDB Atlas
async function connectDB() {
  try {
    await client.connect();
    console.log("Conectado a MongoDB Atlas");
  } catch (error) {
    console.error("Error MongoDB:", error);
  }
}

connectDB();

// Adjunta Socket.io al cliente de MongoDB para usarlo en los controladores
client._io = io;
app.set('mongoClient', client);

// Configura la autenticacion con Google OAuth usando las credenciales del archivo .env
passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  'http://localhost:3000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const correo = profile.emails[0].value;
    const nombre = profile.displayName;

    // Busca si el usuario ya existe en la base de datos
    let usuario = await client.db('nexo').collection('Usuarios')
      .findOne({ correo });

    // Si no existe lo crea con los datos de su cuenta de Google
    if (!usuario) {
      const result = await client.db('nexo').collection('Usuarios').insertOne({
        nombre,
        correo,
        rol: 'usuario',
        fechaRegistro: new Date()
      });
      usuario = await client.db('nexo').collection('Usuarios')
        .findOne({ _id: result.insertedId });
    }

    return done(null, usuario);
  } catch (err) {
    return done(err, null);
  }
}));

// Guarda solo el ID del usuario en la sesion
passport.serializeUser((user, done) => done(null, user._id.toString()));

// Recupera el usuario completo desde la base de datos usando el ID guardado en la sesion
passport.deserializeUser(async (id, done) => {
  const { ObjectId } = require('mongodb');
  const user = await client.db('nexo').collection('Usuarios')
    .findOne({ _id: new ObjectId(id) });
  done(null, user);
});

// Ruta que inicia el flujo de autenticacion con Google solicitando perfil y correo
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Ruta de callback donde Google redirige despues de autenticar al usuario
// Genera el token y redirige al frontend con los datos del usuario
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:8100/login' }),
  (req, res) => {
    const usuario = req.user;
    const token = `token-${usuario._id}`;
    const datos = encodeURIComponent(JSON.stringify({
      id: usuario._id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol || 'usuario'
    }));
    res.redirect(`http://localhost:8100/login?token=${token}&usuario=${datos}`);
  }
);

// Rutas para recuperacion de contrasena por correo
const recuperarPasswordRoutes = require('./routes/recuperarPassword');
app.use('/auth/password', recuperarPasswordRoutes(client));

// Rutas de usuarios
const usersRoutes = require('./routes/users')(client);
app.use('/users', usersRoutes);

// Rutas de perfiles profesionales
const userProfecionalRoutes = require('./routes/userProfecional')(client);
app.use('/profesionales', userProfecionalRoutes);

// Rutas de estados de la republica
const estadosRoutes = require('./routes/estados')(client);
app.use('/estados', estadosRoutes);

// Rutas de municipios
const municipiosRoutes = require('./routes/municipio')(client);
app.use('/municipio', municipiosRoutes);

// Rutas del portafolio de proyectos
const portafolioRoutes = require('./routes/portafolio')(client);
app.use('/portafolio', portafolioRoutes);

// Rutas de resenas
const reseñaRoutes = require('./routes/reseñaRoutes');
app.use('/api/resenas', reseñaRoutes(client));

// Rutas de reservaciones
const reservacionRoutes = require('./routes/reservacionRoutes');
app.use('/reservaciones', reservacionRoutes(client));

// Rutas de busqueda de profesionales
const busquedaRoutes = require('./routes/busquedaRoutes');
app.use('/busqueda', busquedaRoutes(client));

// Rutas de fechas no disponibles de la agenda
const fechaNoDisponibleRoutes = require('./routes/fechaNoDisponibleRoutes');
app.use('/fechas-no-disponibles', fechaNoDisponibleRoutes(client));

// Rutas de conversaciones y chat
const conversacionRoutes = require('./routes/conversacionRoutes');
app.use('/conversaciones', conversacionRoutes(client));

// Rutas de notificaciones
const notificacionRoutes = require('./routes/notificacionRoutes');
app.use('/notificaciones', notificacionRoutes(client));

// Maneja las conexiones de Socket.io en tiempo real
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Une al socket a la sala de una conversacion para recibir sus mensajes
  socket.on('unirse', (conversacionId) => {
    socket.join(conversacionId);
    console.log(`Socket ${socket.id} se unio a sala: ${conversacionId}`);
  });

  // Une al socket a la sala personal del usuario para recibir sus notificaciones
  socket.on('unirse_usuario', (usuarioId) => {
    socket.join(`user_${usuarioId}`);
    console.log(`Socket ${socket.id} se unio a sala personal: user_${usuarioId}`);
  });

  // Reenvía el mensaje a todos los participantes de la conversacion
  socket.on('mensaje', (data) => {
    io.to(data.conversacionId).emit('mensaje', data.mensaje);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

app.set('io', io);

// Inicia el servidor en el puerto 3000
server.listen(port, () => {
  console.log(`Servidor backend en http://localhost:${port}`);
});