// YouConnext - Express App Configuration
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Importar rutas
const authRoutes = require("./routes/auth.routes");
const usuarioRoutes = require("./routes/usuario.routes");
const viajeRoutes = require("./routes/viaje.routes");
const ubicacionRoutes = require("./routes/ubicacion.routes");

// Middlewares
const { authRequired, requireAdmin } = require("./middleware/auth.middleware");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas públicas (autenticación)
app.use("/api/auth", authRoutes);

// Health check (público)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "🚀 YouConnext API funcionando",
    timestamp: new Date().toISOString(),
  });
});

// Rutas protegidas (requieren token JWT)
app.use("/api/usuarios", authRequired, requireAdmin, usuarioRoutes);
app.use("/api/viajes", authRequired, viajeRoutes);
app.use("/api/ubicaciones", authRequired, ubicacionRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    name: "YouConnext API",
    version: "1.0.0",
    description: "Backend para la app de carpooling YouConnext",
  });
});

module.exports = app;
