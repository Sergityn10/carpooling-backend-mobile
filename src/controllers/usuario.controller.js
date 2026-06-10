// YouConnext - Usuario Controller
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// Crear un nuevo usuario
exports.crearUsuario = async (req, res) => {
  try {
    const { dni, nombre, apellidos, email, telefono, fotoPerfil, fechaNacimiento } = req.body;

    // Validar campos requeridos
    if (!dni || !nombre) {
      return res.status(400).json({ 
        error: 'DNI y nombre son campos requeridos' 
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { dni }
    });

    if (usuarioExistente) {
      return res.status(409).json({ 
        error: 'Ya existe un usuario con este DNI',
        usuario: usuarioExistente
      });
    }

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        id: uuidv4(),
        dni,
        nombre,
        apellidos,
        email,
        telefono,
        fotoPerfil,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null
      }
    });

    res.status(201).json({
      message: '¡Usuario creado correctamente! 🎉',
      usuario
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener usuario por DNI
exports.obtenerUsuarioPorDNI = async (req, res) => {
  try {
    const { dni } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { dni },
      include: {
        viajesComoConductor: {
          orderBy: { createdAt: 'desc' }
        },
        viajesComoPasajero: {
          include: {
            viaje: {
              include: {
                conductor: true
              }
            }
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener usuario por ID
exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        viajesComoConductor: {
          orderBy: { createdAt: 'desc' }
        },
        viajesComoPasajero: {
          include: {
            viaje: {
              include: {
                conductor: true
              }
            }
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Listar todos los usuarios
exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(usuarios);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar usuario
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellidos, email, telefono, fotoPerfil, fechaNacimiento } = req.body;

    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        nombre,
        apellidos,
        email,
        telefono,
        fotoPerfil,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined
      }
    });

    res.json({
      message: '¡Usuario actualizado! ✏️',
      usuario
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};