// YouConnext - Viaje Routes
const express = require("express");
const router = express.Router();
const viajeController = require("../controllers/viaje.controller");

// Crear viaje (viaje rápido)
router.post("/", viajeController.crearViaje);

// Listar viajes activos
router.get("/activos", viajeController.listarViajesActivos);

// Listar todos los viajes
router.get("/", viajeController.listarViajes);

// Obtener viaje por código QR
router.get("/qr/:codigo", viajeController.obtenerViajePorQR);

// Obtener historial de un usuario
router.get("/historial/:id", viajeController.obtenerHistorialUsuario);

// Unirse a un viaje
router.post("/unirse", viajeController.unirseViaje);

// Obtener viaje por ID
router.get("/:id", viajeController.obtenerViaje);

// Iniciar viaje
router.put("/:id/iniciar", viajeController.iniciarViaje);

// Completar viaje
router.put("/:id/completar", viajeController.completarViaje);

// Cancelar viaje
router.put("/:id/cancelar", viajeController.cancelarViaje);

module.exports = router;
