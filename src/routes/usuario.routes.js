// YouConnext - Usuario Routes
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');

// Crear usuario
router.post('/', usuarioController.crearUsuario);

// Listar usuarios
router.get('/', usuarioController.listarUsuarios);

// Obtener usuario por DNI
router.get('/dni/:dni', usuarioController.obtenerUsuarioPorDNI);

// Obtener usuario por ID
router.get('/:id', usuarioController.obtenerUsuarioPorId);

// Actualizar usuario
router.put('/:id', usuarioController.actualizarUsuario);

module.exports = router;