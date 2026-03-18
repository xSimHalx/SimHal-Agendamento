const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: { empresa: true }
    });
    console.log('--- USUARIOS ---');
    usuarios.forEach(u => {
      console.log(`ID: ${u.id}, Nome: ${u.nome}, Role: ${u.role}, Empresa: ${u.empresa.nome} (${u.empresaId})`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

check();
