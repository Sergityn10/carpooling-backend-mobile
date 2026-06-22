// YouConnext - UbicacionTrayecto Controller
const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

// Registrar una nueva ubicación GPS
exports.registrarUbicacion = async (req, res) => {
  try {
    const {
      viajeId,
      usuarioId,
      latitud,
      longitud,
      precision,
      velocidad,
      altitud,
    } = req.body;

    // Validar campos requeridos
    if (
      !viajeId ||
      !usuarioId ||
      latitud === undefined ||
      longitud === undefined
    ) {
      return res.status(400).json({
        error: "viajeId, usuarioId, latitud y longitud son requeridos",
      });
    }

    // Verificar que el viaje existe
    const viaje = await prisma.viaje.findUnique({
      where: { id: viajeId },
    });

    if (!viaje) {
      return res.status(404).json({ error: "Viaje no encontrado" });
    }

    // Crear registro de ubicación
    const ubicacion = await prisma.ubicacionTrayecto.create({
      data: {
        id: uuidv4(),
        viajeId,
        usuarioId,
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud),
        precision: precision ? parseFloat(precision) : null,
        velocidad: velocidad ? parseFloat(velocidad) : null,
        altitud: altitud ? parseFloat(altitud) : null,
      },
      include: {
        viaje: true,
        usuario: true,
      },
    });

    res.status(201).json({
      message: "Ubicación registrada 📍",
      ubicacion,
    });
  } catch (error) {
    console.error("Error al registrar ubicación:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Registrar múltiples ubicaciones (batch)
exports.registrarUbicacionesBatch = async (req, res) => {
  try {
    const { ubicaciones } = req.body;

    if (
      !ubicaciones ||
      !Array.isArray(ubicaciones) ||
      ubicaciones.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Se requiere un array de ubicaciones" });
    }

    // Validar y preparar datos
    const ubicacionesValidas = [];
    const errores = [];

    for (let i = 0; i < ubicaciones.length; i++) {
      const u = ubicaciones[i];
      if (
        !u.viajeId ||
        !u.usuarioId ||
        u.latitud === undefined ||
        u.longitud === undefined
      ) {
        errores.push({ index: i, error: "Faltan campos requeridos" });
        continue;
      }

      ubicacionesValidas.push({
        id: uuidv4(),
        viajeId: u.viajeId,
        usuarioId: u.usuarioId,
        latitud: parseFloat(u.latitud),
        longitud: parseFloat(u.longitud),
        precision: u.precision ? parseFloat(u.precision) : null,
        velocidad: u.velocidad ? parseFloat(u.velocidad) : null,
        altitud: u.altitud ? parseFloat(u.altitud) : null,
        timestamp: u.timestamp ? new Date(u.timestamp) : new Date(),
      });
    }

    // Insertar todas las ubicaciones válidas
    const ubicacionesCreadas = await prisma.ubicacionTrayecto.createMany({
      data: ubicacionesValidas,
    });

    res.status(201).json({
      message: `¡${ubicacionesCreadas.count} ubicaciones registradas! 📍`,
      creadas: ubicacionesCreadas.count,
      errores: errores.length > 0 ? errores : undefined,
    });
  } catch (error) {
    console.error("Error al registrar ubicaciones batch:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener ubicaciones de un viaje
exports.obtenerUbicacionesViaje = async (req, res) => {
  try {
    const { viajeId } = req.params;

    const ubicaciones = await prisma.ubicacionTrayecto.findMany({
      where: { viajeId },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
          },
        },
      },
      orderBy: { timestamp: "asc" },
    });

    res.json(ubicaciones);
  } catch (error) {
    console.error("Error al obtener ubicaciones:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener última ubicación de un viaje
exports.obtenerUltimaUbicacion = async (req, res) => {
  try {
    const { viajeId } = req.params;

    const ubicacion = await prisma.ubicacionTrayecto.findFirst({
      where: { viajeId },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    if (!ubicacion) {
      return res
        .status(404)
        .json({ error: "No hay ubicaciones registradas para este viaje" });
    }

    res.json(ubicacion);
  } catch (error) {
    console.error("Error al obtener última ubicación:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener ubicaciones de un usuario en un viaje específico
exports.obtenerUbicacionesUsuario = async (req, res) => {
  try {
    const { viajeId, usuarioId } = req.params;

    const ubicaciones = await prisma.ubicacionTrayecto.findMany({
      where: {
        viajeId,
        usuarioId,
      },
      orderBy: { timestamp: "asc" },
    });

    res.json(ubicaciones);
  } catch (error) {
    console.error("Error al obtener ubicaciones:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Calcular distancia recorrida en un viaje
exports.calcularDistancia = async (req, res) => {
  try {
    const { viajeId } = req.params;

    const ubicaciones = await prisma.ubicacionTrayecto.findMany({
      where: { viajeId },
      orderBy: { timestamp: "asc" },
    });

    if (ubicaciones.length < 2) {
      return res.json({
        distanciaKm: 0,
        mensaje:
          "Se necesitan al menos 2 ubicaciones para calcular la distancia",
      });
    }

    // Calcular distancia usando fórmula de Haversine
    const calcularHaversine = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radio de la Tierra en km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    let distanciaTotal = 0;
    for (let i = 1; i < ubicaciones.length; i++) {
      const anterior = ubicaciones[i - 1];
      const actual = ubicaciones[i];
      distanciaTotal += calcularHaversine(
        anterior.latitud,
        anterior.longitud,
        actual.latitud,
        actual.longitud,
      );
    }

    res.json({
      distanciaKm: Math.round(distanciaTotal * 100) / 100,
      numeroPuntos: ubicaciones.length,
      primeraUbicacion: ubicaciones[0],
      ultimaUbicacion: ubicaciones[ubicaciones.length - 1],
    });
  } catch (error) {
    console.error("Error al calcular distancia:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
