// YouConnext - UbicacionTrayecto Routes
const express = require("express");
const router = express.Router();
const ubicacionController = require("../controllers/ubicacion.controller");

// Registrar ubicación
router.post("/", ubicacionController.registrarUbicacion);

// Registrar múltiples ubicaciones (batch)
router.post("/batch", ubicacionController.registrarUbicacionesBatch);

// Obtener ubicaciones de un viaje
router.get("/viaje/:viajeId", ubicacionController.obtenerUbicacionesViaje);

// Obtener última ubicación de un viaje
router.get(
  "/viaje/:viajeId/ultima",
  ubicacionController.obtenerUltimaUbicacion,
);

// Calcular distancia recorrida en un viaje
router.get("/viaje/:viajeId/distancia", ubicacionController.calcularDistancia);

// Obtener ubicaciones de un usuario en un viaje
router.get(
  "/viaje/:viajeId/usuario/:usuarioId",
  ubicacionController.obtenerUbicacionesUsuario,
);

module.exports = router;
