const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o Seed...');

  // 1. Criar Empresa
  const empresa = await prisma.empresa.upsert({
    where: { slug: 'barbearia-simhal' },
    update: {},
    create: {
      nome: 'Barbearia SimHal SaaS',
      slug: 'barbearia-simhal',
      telefone: '(11) 99999-8888',
      planoAtual: 'PREMIUM',
      statusAssinatura: 'ATIVO'
    }
  });

  console.log(`Empresa criada: ${empresa.nome}`);

  // 2. Criar Usuários (Dono e Profissionais)
  const dono = await prisma.usuario.upsert({
    where: { email: 'simhal2016@gmail.com' },
    update: {},
    create: {
      nome: 'SimHal Admin',
      email: 'simhal2016@gmail.com',
      telefone: '11999998888',
      senha: bcrypt.hashSync('123', 10), 
      role: 'ADMIN',
      empresaId: empresa.id
    }
  });

  console.log('Admin Principal criado.');

  console.log('Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });