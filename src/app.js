require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/detections', require('./routes/detections'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error MongoDB:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 AgroBot Backend corriendo en puerto ${PORT}`));1