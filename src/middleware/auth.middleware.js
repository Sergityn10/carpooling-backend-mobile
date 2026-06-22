const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET || "youconnext_access_secret_2024";
const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || "youconnext_refresh_secret_2024";

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = { id: decoded.id, email: decoded.email, rol: decoded.rol };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expirado", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ error: "Token inválido" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || !req.user.rol || req.user.rol !== "admin") {
    return res
      .status(403)
      .json({ error: "Acceso denegado: se requiere rol de administrador" });
  }
  next();
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
      req.user = { id: decoded.id, email: decoded.email, rol: decoded.rol };
    } catch (err) {
      // Token inválido o expirado: no bloqueamos, simplemente no asignamos req.user
    }
  }

  next();
}

module.exports = {
  authRequired,
  requireAdmin,
  optionalAuth,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
};
