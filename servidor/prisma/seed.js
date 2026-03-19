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

  // 3. Criar um Profissional (além do admin)
  const profissional = await prisma.usuario.upsert({
    where: { email: 'profissional@simhal.com' },
    update: { isProfissional: true },
    create: {
      nome: 'Carlos Profissional',
      email: 'profissional@simhal.com',
      senha: bcrypt.hashSync('123', 10),
      role: 'PROFISSIONAL',
      isProfissional: true,
      empresaId: empresa.id
    }
  });
  console.log('Profissional de teste criado.');

  // 4. Criar um Serviço
  const servico = await prisma.servico.create({
    data: {
      nome: 'Corte Moderno',
      descricao: 'Corte de cabelo com lavagem e finalização.',
      duracao: 30,
      preco: 5000, // R$ 50,00
      empresaId: empresa.id,
      ativo: true
    }
  });
  console.log('Serviço de teste criado.');

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