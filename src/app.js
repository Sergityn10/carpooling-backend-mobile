// YouConnext - Express App Configuration
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const usuarioRoutes = require('./routes/usuario.routes');
const viajeRoutes = require('./routes/viaje.routes');
const ubicacionRoutes = require('./routes/ubicacion.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/viajes', viajeRoutes);
app.use('/api/ubicaciones', ubicacionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '🚀 YouConnext API funcionando',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    name: 'YouConnext API',
    version: '1.0.0',
    description: 'Backend para la app de carpooling YouConnext'
  });
});

module.exports = app;