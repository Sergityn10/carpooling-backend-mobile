const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Crear roles
  const adminRole = await prisma.rol.upsert({
    where: { nombre: "admin" },
    update: {},
    create: { id: 1, nombre: "admin", descripcion: "Administrador con acceso total" },
  });

  const userRole = await prisma.rol.upsert({
    where: { nombre: "user" },
    update: {},
    create: { id: 2, nombre: "user", descripcion: "Usuario estándar" },
  });

  const enterpriseRole = await prisma.rol.upsert({
    where: { nombre: "enterprise" },
    update: {},
    create: { id: 3, nombre: "enterprise", descripcion: "Usuario empresarial" },
  });

  console.log("✅ Roles creados:", adminRole.nombre, userRole.nombre, enterpriseRole.nombre);

  // Crear admin por defecto si no existe
  const adminEmail = "admin@youconnext.es";
  const existingAdmin = await prisma.usuario.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("Admin123456!", 10);
    await prisma.usuario.create({
      data: {
        id: uuidv4(),
        nombre: "Admin",
        apellidos: "YouConnext",
        email: adminEmail,
        password: hashedPassword,
        rolId: adminRole.id,
      },
    });
    console.log("✅ Admin creado: admin@youconnext.es / Admin123456!");
  } else {
    console.log("ℹ️  Admin ya existe");
  }

  console.log("🌱 Seed completado");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
