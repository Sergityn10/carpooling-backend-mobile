// YouConnext - Server Entry Point
const app = require('./app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

async function main() {
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect();
    console.log('✅ Conexión a base de datos establecida');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚗 YouConnext Backend                          ║
║   Servidor corriendo en http://localhost:${PORT}    ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

main();

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});

// Cerrar conexión con la BD al salir
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('🔴 Conexión a base de datos cerrada');
  process.exit(0);
});