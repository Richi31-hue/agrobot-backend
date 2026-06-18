const mongoose = require('mongoose');

const DetectionSchema = new mongoose.Schema({
  cultivo: { type: String, enum: ['maiz', 'frijol', 'tomate'], required: true },
  clase: { type: String, required: true },
  confianza: { type: Number, required: true },
  imagen_url: String,
  zona: { type: String, default: 'zona-1' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Detection', DetectionSchema);