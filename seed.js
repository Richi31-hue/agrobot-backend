require('dotenv').config();
const mongoose = require('mongoose');
const Detection = require('./src/models/Detection');

const clasesPosibles = ['mancha_foliar', 'roya_maiz', 'tizon_tardio', 'saludable', 'antracnosis'];
const cultivos = ['maiz', 'frijol', 'tomate'];
const zonas = ['zona-1', 'zona-2', 'zona-3', 'zona-4'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Conectado a MongoDB');

  await Detection.deleteMany({});
  console.log('🧹 Detecciones anteriores borradas');

  const detecciones = [];
  for (let i = 0; i < 100; i++) {
    detecciones.push({
      cultivo: randomItem(cultivos),
      clase: randomItem(clasesPosibles),
      confianza: (Math.random() * 0.3 + 0.7).toFixed(2),
      zona: randomItem(zonas),
      timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60)
    });
  }

  await Detection.insertMany(detecciones);
  console.log(`🌱 ${detecciones.length} detecciones de prueba insertadas`);
  process.exit();
}

seed();