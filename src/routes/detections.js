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

module.exports = router;