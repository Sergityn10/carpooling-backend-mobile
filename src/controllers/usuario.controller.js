// YouConnext - Usuario Controller
const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

// Crear un nuevo usuario
exports.crearUsuario = async (req, res) => {
  try {
    const {
      dni,
      nombre,
      apellidos,
      email,
      password,
      telefono,
      fotoPerfil,
      fechaNacimiento,
    } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: "Nombre, email y contraseña son campos requeridos",
      });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    if (dni) {
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { dni },
      });

      if (usuarioExistente) {
        return res.status(409).json({
          error: "Ya existe un usuario con este DNI",
          usuario: sanitizeUser(usuarioExistente),
        });
      }
    }

    const existByEmail = await prisma.usuario.findUnique({ where: { email } });
    if (existByEmail) {
      return res
        .status(409)
        .json({ error: "Ya existe un usuario con este email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        id: uuidv4(),
        dni: dni || null,
        nombre,
        apellidos,
        email,
        password: hashedPassword,
        telefono,
        fotoPerfil,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
      },
    });

    res.status(201).json({
      message: "¡Usuario creado correctamente! 🎉",
      usuario: sanitizeUser(usuario),
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener usuario por ID (propio usuario o admin)
exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    // Solo el propio usuario o un admin pueden ver los datos
    if (req.user.id !== id && req.user.rol !== "admin") {
      return res
        .status(403)
        .json({ error: "No tienes permisos para ver este usuario" });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        rol: true,
        viajesComoConductor: {
          orderBy: { createdAt: "desc" },
        },
        viajesComoPasajero: {
          include: {
            viaje: {
              include: {
                conductor: true,
              },
            },
          },
        },
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(sanitizeUser(usuario));
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Listar todos los usuarios
exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { createdAt: "desc" },
      include: { rol: true },
    });

    res.json(usuarios.map(sanitizeUser));
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Actualizar usuario (propio usuario o admin)
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellidos, email, telefono, fotoPerfil, fechaNacimiento } =
      req.body;

    // Solo el propio usuario o un admin pueden actualizar
    if (req.user.id !== id && req.user.rol !== "admin") {
      return res
        .status(403)
        .json({ error: "No tienes permisos para actualizar este usuario" });
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        nombre,
        apellidos,
        email,
        telefono,
        fotoPerfil,
        fechaNacimiento: fechaNacimiento
          ? new Date(fechaNacimiento)
          : undefined,
      },
    });

    res.json({
      message: "¡Usuario actualizado! ✏️",
      usuario: sanitizeUser(usuario),
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
