const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.usuario.update({
    where: { email: 'tste@gmail.com' },
    data: { role: 'ADMIN' }
  });
  console.log('Usuário atualizado:', user);
}

main().catch(err => console.error(err)).finally(() => prisma.$disconnect());
