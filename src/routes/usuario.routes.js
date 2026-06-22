// YouConnext - Usuario Routes
const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuario.controller");
const { requireAdmin } = require("../middleware/auth.middleware");

// Crear usuario (solo admin)
router.post("/", requireAdmin, usuarioController.crearUsuario);

// Listar usuarios (solo admin)
router.get("/", requireAdmin, usuarioController.listarUsuarios);

// Obtener usuario por ID (propio usuario o admin)
router.get("/:id", usuarioController.obtenerUsuarioPorId);

// Actualizar usuario (propio usuario o admin)
router.put("/:id", usuarioController.actualizarUsuario);

module.exports = router;
