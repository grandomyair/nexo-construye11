const { ObjectId } = require('mongodb');
const multer = require('multer');

const DB = 'nexo';
const COLLECTION = 'Portafolio';

// Configura multer para guardar imagenes en memoria con limite de 5MB y solo acepta jpeg, jpg, png y webp
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(file.mimetype)) return cb(null, true);
    cb(new Error('Solo imagenes (jpeg, jpg, png, webp)'));
  }
});

// Sube imagenes del portafolio convirtiendo cada archivo a base64 y guardandolas en la base de datos
const subirImagenesPortafolio = async (req, res, client) => {
  try {
    const { titulo, descripcion, categoria, profesionalId } = req.body;

    // Verifica que se enviaron imagenes
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: 'No se enviaron imagenes' });

    const documento = {
      titulo: titulo || '',
      descripcion: descripcion || '',
      categoria: categoria || '',
      profesionalId: profesionalId ? new ObjectId(profesionalId) : null,
      // Convierte cada imagen a formato base64 para guardarla como texto en MongoDB
      imagenes: req.files.map(file => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`),
      fecha: new Date()
    };

    const result = await client.db(DB).collection(COLLECTION).insertOne(documento);
    res.status(201).json({ message: `${req.files.length} imagen(es) subidas`, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crea un nuevo registro en el portafolio
const createPortafolio = async (req, res, client) => {
  try {
    const result = await client.db(DB).collection(COLLECTION).insertOne(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Devuelve todos los proyectos del portafolio
const getPortafolios = async (req, res, client) => {
  try {
    const result = await client.db(DB).collection(COLLECTION).find().toArray();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Devuelve un proyecto del portafolio por su ID
const getPortafolioById = async (req, res, client) => {
  try {
    const result = await client.db(DB).collection(COLLECTION).findOne({ _id: new ObjectId(req.params.id) });
    if (!result) return res.status(404).json({ message: 'Portafolio no encontrado' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualiza un proyecto del portafolio por su ID
const updatePortafolio = async (req, res, client) => {
  try {
    const result = await client.db(DB).collection(COLLECTION).updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Elimina un proyecto del portafolio por su ID
const deletePortafolio = async (req, res, client) => {
  try {
    const result = await client.db(DB).collection(COLLECTION).deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Devuelve todos los proyectos del portafolio de un profesional ordenados del mas reciente al mas antiguo
async function getPortafolioByProfesionalId(req, res, client) {
  try {
    const { profesionalId } = req.params;
    const result = await client.db(DB).collection(COLLECTION)
      .find({ profesionalId: new ObjectId(profesionalId) })
      .sort({ fecha: -1 })
      .toArray();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  upload, subirImagenesPortafolio, createPortafolio, getPortafolios,
  getPortafolioById, updatePortafolio, deletePortafolio, getPortafolioByProfesionalId
};