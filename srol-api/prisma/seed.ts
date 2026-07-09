import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed...');

  // Hashear contraseña
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Upsert: Crear o actualizar usuario admin
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Usuario admin configurado:', user.email);

  // Crear algunas tareas de ejemplo
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Configurar proyecto',
        description: 'Realizar configuración inicial del proyecto',
        status: 'COMPLETED',
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implementar autenticación',
        description: 'Agregar login con JWT',
        status: 'PENDING',
      },
    }),
    prisma.task.create({
      data: {
        title: 'Crear CRUD de tareas',
        description: 'Implementar endpoints REST para tareas',
        status: 'IN_PROGRESS',
      },
    }),
  ]);

  console.log(`✅ ${tasks.length} tareas de ejemplo creadas`);
  console.log('✅ Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });