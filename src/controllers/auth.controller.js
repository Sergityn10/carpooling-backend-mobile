const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} = require("../middleware/auth.middleware");

const prisma = new PrismaClient();

const ACCESS_TOKEN_EXPIRES = "7d";
const REFRESH_TOKEN_EXPIRES = "30d";

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES },
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES },
  );
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const {
      dni,
      nombre,
      apellidos,
      email,
      password,
      telefono,
      fechaNacimiento,
    } = req.body;

    if (!nombre || !email || !password) {
      return res
        .status(400)
        .json({ error: "Nombre, email y contraseña son obligatorios" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const existByEmail = await prisma.usuario.findUnique({ where: { email } });
    if (existByEmail) {
      return res
        .status(409)
        .json({ error: "Ya existe un usuario con este email" });
    }

    if (dni) {
      const existByDNI = await prisma.usuario.findUnique({ where: { dni } });
      if (existByDNI) {
        return res
          .status(409)
          .json({ error: "Ya existe un usuario con este DNI" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        id: uuidv4(),
        dni: dni || null,
        nombre,
        apellidos: apellidos || null,
        email,
        password: hashedPassword,
        telefono: telefono || null,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        rolId: 2, // Por defecto: user
      },
      include: { rol: true },
    });

    const accessToken = generateAccessToken(usuario);
    const refreshToken = generateRefreshToken(usuario);

    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: sanitizeUser(usuario),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error en register:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email y contraseña son obligatorios" });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { rol: true },
    });

    if (!usuario) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const accessToken = generateAccessToken(usuario);
    const refreshToken = generateRefreshToken(usuario);

    res.json({
      message: "Login correcto",
      user: sanitizeUser(usuario),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// POST /api/auth/refresh
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token no proporcionado" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Refresh token expirado",
          code: "REFRESH_TOKEN_EXPIRED",
        });
      }
      return res.status(401).json({ error: "Refresh token inválido" });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      include: { rol: true },
    });
    if (!usuario) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const newAccessToken = generateAccessToken(usuario);
    const newRefreshToken = generateRefreshToken(usuario);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Error en refresh:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// POST /api/auth/me
exports.me = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      include: {
        rol: true,
        viajesComoConductor: { orderBy: { createdAt: "desc" } },
        viajesComoPasajero: {
          include: { viaje: { include: { conductor: true } } },
        },
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(sanitizeUser(usuario));
  } catch (error) {
    console.error("Error en me:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
