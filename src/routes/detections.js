const express = require('express');
const router = express.Router();
const multer = require('multer');
const Detection = require('../models/Detection');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Mapeo de clases detectadas -> nivel de severidad
// Ajusta esto cuando tengan las clases reales del modelo
const SEVERIDAD_MAP = {
  'tizon_tardio': 'alta_infestacion',
  'roya_maiz': 'alta_infestacion',
  'mancha_foliar': 'en_riesgo',
  'antracnosis': 'en_riesgo',
  'saludable': 'saludable'
};

function obtenerSeveridad(clase) {
  return SEVERIDAD_MAP[clase] || 'en_riesgo'; // default si llega una clase no mapeada
}

router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    if (req.body.confianza < 0.75) {
      return res.status(200).json({ ok: false, msg: 'Confianza muy baja, descartado' });
    }
    const detection = new Detection({
      ...req.body,
      imagen_url: req.file ? req.file.path : null
    });
    await detection.save();
    res.status(201).json({ ok: true, id: detection._id });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const detections = await Detection.find().sort({ timestamp: -1 }).limit(50);
    res.json(detections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/latest', async (req, res) => {
  try {
    const latest = await Detection.findOne().sort({ timestamp: -1 });
    res.json(latest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Estadísticas generales: porcentaje por nivel de severidad
router.get('/stats', async (req, res) => {
  try {
    const total = await Detection.countDocuments();

    if (total === 0) {
      return res.json({
        total: 0,
        porSeveridad: {
          alta_infestacion: { count: 0, porcentaje: 0 },
          en_riesgo: { count: 0, porcentaje: 0 },
          saludable: { count: 0, porcentaje: 0 }
        }
      });
    }

    const todasLasDetecciones = await Detection.find({}, 'clase');

    const conteo = {
      alta_infestacion: 0,
      en_riesgo: 0,
      saludable: 0
    };

    todasLasDetecciones.forEach(d => {
      const severidad = obtenerSeveridad(d.clase);
      conteo[severidad] = (conteo[severidad] || 0) + 1;
    });

    const porSeveridad = {};
    Object.keys(conteo).forEach(key => {
      porSeveridad[key] = {
        count: conteo[key],
        porcentaje: Math.round((conteo[key] / total) * 100)
      };
    });

    res.json({ total, porSeveridad });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Estadísticas por zona (para "Cobertura del campo")
router.get('/stats/zonas', async (req, res) => {
  try {
    const porZona = await Detection.aggregate([
      { $group: { _id: '$zona', count: { $sum: 1 } } }
    ]);
    res.json(porZona);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;