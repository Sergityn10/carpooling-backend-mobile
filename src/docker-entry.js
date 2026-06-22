// YouConnext - Docker Entry Point
// Script que ejecuta migrations y luego inicia el servidor

const { execSync } = require("child_process");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando YouConnext Backend...");

  try {
    // Verificar conexión a la base de datos
    console.log("📊 Verificando conexión a base de datos...");
    await prisma.$connect();
    console.log("✅ Conexión a base de datos establecida");

    // Sincronizar esquema de base de datos directamente con prisma db push (puesto que no hay archivos de migraciones)
    console.log("🔄 Sincronizando esquema de base de datos...");
    try {
      execSync("./node_modules/.bin/prisma db push --force-reset", {
        stdio: "pipe",
        encoding: "utf-8",
      });
      console.log("✅ Base de datos sincronizada y tablas creadas");
    } catch (pushError) {
      console.error(
        "❌ Error al sincronizar base de datos con prisma db push:",
      );
      console.error("stdout:", pushError.stdout);
      console.error("stderr:", pushError.stderr);
      throw pushError;
    }

    // Ejecutar seed (crear roles y admin inicial)
    console.log("🌱 Ejecutando seed...");
    try {
      execSync("node prisma/seed.js", { stdio: "inherit" });
      console.log("✅ Seed completado");
    } catch (seedError) {
      console.log("⚠️  Seed ya ejecutado o error no crítico");
    }

    // Generar cliente si no existe
    console.log("🔧 Verificando cliente Prisma...");
    try {
      execSync("./node_modules/.bin/prisma generate", { stdio: "inherit" });
      console.log("✅ Cliente Prisma generado");
    } catch (generateError) {
      console.log("⚠️  Cliente Prisma ya existe");
    }

    // Importar y ejecutar el servidor
    console.log("🌐 Iniciando servidor...");
    const app = require("./app");
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚗 YouConnext Backend                          ║
║   Corriendo en http://localhost:${PORT}             ║
║   Base de datos: MySQL                            ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("❌ Error al iniciar:", error);
    process.exit(1);
  }
}

main();

// Manejo de errores
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Promise Rejection:", error);
});

process.on("SIGINT", async () => {
  console.log("\n🔴 Cerrando conexión...");
  await prisma.$disconnect();
  process.exit(0);
});
