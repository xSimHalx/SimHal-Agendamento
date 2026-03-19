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
      id: '8a8a0c7c-ee0f-4a4a-9dde-93460d074ad2',
      nome: 'Barbearia SimHal SaaS',
      slug: 'barbearia-simhal',
      telefone: '(11) 99999-8888',
      plano: 'PREMIUM',
      statusAssinatura: 'ATIVO',
      horarioFuncionamento: {
        segunda: ["08:00", "18:00"],
        terca: ["08:00", "18:00"],
        quarta: ["08:00", "18:00"],
        quinta: ["08:00", "18:00"],
        sexta: ["08:00", "18:00"],
        sabado: ["08:00", "12:00"],
        domingo: null
      }
    }
  });

  console.log(`Empresa criada: ${empresa.nome}`);

  // 2. Criar Usuários (Dono e Profissionais)
  const dono = await prisma.usuario.upsert({
    where: { email: 'simhal2016@gmail.com' },
    update: {},
    create: {
      id: '2abc50f6-9ea2-4deb-93f2-11dc727671a3',
      nome: 'SimHal Admin',
      email: 'simhal2016@gmail.com',
      telefone: '11999998888',
      senha: bcrypt.hashSync('123', 10), 
      role: 'ADMIN',
      isProfissional: true,
      empresaId: empresa.id
    }
  });

  console.log('Admin Principal criado.');

  console.log('Seed finalizado com sucesso! (Apenas Admin e Empresa criados)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });