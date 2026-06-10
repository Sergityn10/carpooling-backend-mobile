// YouConnext - Viaje Controller
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const prisma = new PrismaClient();

// Helper para generar código QR único
const generarCodigoQR = () => {
  return uuidv4().split('-')[0].toUpperCase();
};

// Crear un nuevo viaje (viaje rápido)
exports.crearViaje = async (req, res) => {
  try {
    const {
      conductorDNI,
      matricula,
      modeloVehiculo,
      colorVehiculo,
      puntoInicialLat,
      puntoInicialLng,
      puntoInicialDireccion,
      puntoInicialNombre,
      puntoFinalLat,
      puntoFinalLng,
      puntoFinalDireccion,
      puntoFinalNombre
    } = req.body;

    // Validar campos requeridos
    if (!conductorDNI || !matricula || !puntoInicialLat || !puntoInicialLng || 
        !puntoFinalLat || !puntoFinalLng) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: conductorDNI, matricula, y coordenadas de inicio/fin' 
      });
    }

    // Buscar conductor
    const conductor = await prisma.usuario.findUnique({
      where: { dni: conductorDNI }
    });

    if (!conductor) {
      return res.status(404).json({ 
        error: 'Conductor no encontrado. Primero crea el usuario.' 
      });
    }

    // Generar código QR único
    let codigoQR = generarCodigoQR();
    let codigoUnico = false;
    while (!codigoUnico) {
      const existente = await prisma.viaje.findUnique({ where: { codigoQR } });
      if (!existente) {
        codigoUnico = true;
      } else {
        codigoQR = generarCodigoQR();
      }
    }

    // Crear viaje
    const viaje = await prisma.viaje.create({
      data: {
        id: uuidv4(),
        conductorId: conductor.id,
        matricula: matricula.toUpperCase(),
        modeloVehiculo,
        colorVehiculo,
        puntoInicialLat: parseFloat(puntoInicialLat),
        puntoInicialLng: parseFloat(puntoInicialLng),
        puntoInicialDireccion,
        puntoInicialNombre,
        puntoFinalLat: parseFloat(puntoFinalLat),
        puntoFinalLng: parseFloat(puntoFinalLng),
        puntoFinalDireccion,
        puntoFinalNombre,
        codigoQR,
        estado: 'pendiente'
      },
      include: {
        conductor: true,
        pasajeros: {
          include: { usuario: true }
        }
      }
    });

    // Generar imagen del código QR
    const qrDataUrl = await QRCode.toDataURL(
      `youconnext://unirse/${viaje.id}`,
      { width: 300, margin: 2 }
    );

    res.status(201).json({
      message: '¡Viaje creado! 🚗✨',
      viaje,
      codigoQR: qrDataUrl,
      codigoTexto: codigoQR
    });
  } catch (error) {
    console.error('Error al crear viaje:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener viaje por ID
exports.obtenerViaje = async (req, res) => {
  try {
    const { id } = req.params;

    const viaje = await prisma.viaje.findUnique({
      where: { id },
      include: {
        conductor: true,
        pasajeros: {
          include: { usuario: true }
        },
        ubicaciones: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!viaje) {
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }

    res.json(viaje);
  } catch (error) {
    console.error('Error al obtener viaje:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener viaje por código QR
exports.obtenerViajePorQR = async (req, res) => {
  try {
    const { codigo } = req.params;

    const viaje = await prisma.viaje.findUnique({
      where: { codigoQR: codigo },
      include: {
        conductor: true,
        pasajeros: {
          include: { usuario: true }
        }
      }
    });

    if (!viaje) {
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }

    res.json(viaje);
  } catch (error) {
    console.error('Error al buscar viaje por QR:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Unirse a un viaje via QR
exports.unirseViaje = async (req, res) => {
  try {
    const { codigoQR, pasajeroDNI } = req.body;

    if (!codigoQR || !pasajeroDNI) {
      return res.status(400).json({ 
        error: 'Código QR y DNI del pasajero son requeridos' 
      });
    }

    // Buscar viaje
    const viaje = await prisma.viaje.findUnique({
      where: { codigoQR }
    });

    if (!viaje) {
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }

    // Verificar que el viaje aún está activo
    if (viaje.estado === 'completado' || viaje.estado === 'cancelado') {
      return res.status(400).json({ 
        error: 'Este viaje ya no está disponible' 
      });
    }

    // Buscar pasajero
    const pasajero = await prisma.usuario.findUnique({
      where: { dni: pasajeroDNI }
    });

    if (!pasajero) {
      return res.status(404).json({ 
        error: 'Pasajero no encontrado. Primero crea el usuario.' 
      });
    }

    // Verificar que no sea el conductor
    if (pasajero.id === viaje.conductorId) {
      return res.status(400).json({ 
        error: 'No puedes unirte a tu propio viaje como pasajero' 
      });
    }

    // Verificar que no esté ya en el viaje
    const yaExiste = await prisma.viajePasajero.findUnique({
      where: {
        viajeId_usuarioId: {
          viajeId: viaje.id,
          usuarioId: pasajero.id
        }
      }
    });

    if (yaExiste) {
      return res.status(400).json({ 
        error: 'Ya estás en este viaje' 
      });
    }

    // Unir pasajero al viaje
    const viajePasajero = await prisma.viajePasajero.create({
      data: {
        id: uuidv4(),
        viajeId: viaje.id,
        usuarioId: pasajero.id
      },
      include: {
        viaje: {
          include: { conductor: true }
        },
        usuario: true
      }
    });

    res.status(201).json({
      message: '¡Te has unido al viaje! 🎉',
      viajePasajero
    });
  } catch (error) {
    console.error('Error al unirse al viaje:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Iniciar un viaje
exports.iniciarViaje = async (req, res) => {
  try {
    const { id } = req.params;

    const viaje = await prisma.viaje.update({
      where: { id },
      data: {
        estado: 'activo',
        fechaInicio: new Date()
      },
      include: {
        conductor: true,
        pasajeros: {
          include: { usuario: true }
        }
      }
    });

    res.json({
      message: '¡Viaje iniciado! 🟢',
      viaje
    });
  } catch (error) {
    console.error('Error al iniciar viaje:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Completar un viaje
exports.completarViaje = async (req, res) => {
  try {
    const { id } = req.params;
    const { distanciaKm } = req.body;

    const viaje = await prisma.viaje.update({
      where: { id },
      data: {
        estado: 'completado',
        fechaFin: new Date(),
        distanciaKm: distanciaKm ? parseFloat(distanciaKm) : null
      },
      include: {
        conductor: true,
        pasajeros: {
          include: { usuario: true }
        },
        ubicaciones: true
      }
    });

    res.json({
      message: '¡Viaje completado! ✅',
      viaje
    });
  } catch (error) {
    console.error('Error al completar viaje:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Cancelar un viaje
exports.cancelarViaje = async (req, res) => {
  try {
    const { id } = req.params;

    const viaje = await prisma.viaje.update({
      where: { id },
      data: {
        estado: 'cancelado',
        fechaFin: new Date()
      },
      include: {
        conductor: true,
        pasajeros: {
          include: { usuario: true }
        }
      }
    });

    res.json({
      message: 'Viaje cancelado 🛑',
      viaje
    });
  } catch (error) {
    console.error('Error al cancelar viaje:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Listar viajes activos
exports.listarViajesActivos = async (req, res) => {
  try {
    const viajes = await prisma.viaje.findMany({
      where: {
        estado: { in: ['pendiente', 'activo'] }
      },
      include: {
        conductor: true,
        pasajeros: {
          include: { usuario: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(viajes);
  } catch (error) {
    console.error('Error al listar viajes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Listar todos los viajes
exports.listarViajes = async (req, res) => {
  try {
    const viajes = await prisma.viaje.findMany({
      include: {
        conductor: true,
        pasajeros: {
          include: { usuario: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(viajes);
  } catch (error) {
    console.error('Error al listar viajes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener historial de viajes de un usuario
exports.obtenerHistorialUsuario = async (req, res) => {
  try {
    const { dni } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { dni },
      include: {
        viajesComoConductor: {
          include: {
            pasajeros: {
              include: { usuario: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        viajesComoPasajero: {
          include: {
            viaje: {
              include: {
                conductor: true,
                pasajeros: {
                  include: { usuario: true }
                }
              }
            }
          },
          orderBy: { joinedAt: 'desc' }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      conductor: usuario.viajesComoConductor,
      pasajero: usuario.viajesComoPasajero.map(vp => vp.viaje)
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};