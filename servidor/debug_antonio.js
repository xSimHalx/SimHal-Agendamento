const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const antonio = await prisma.usuario.findFirst({
        where: { nome: { contains: 'Antonio' } }
    });
    console.log('--- ANTONIO MARCOS ---');
    console.log('ID:', antonio.id);
    console.log('Horários:', JSON.stringify(antonio.horariosDeTrabalho, null, 2));
    
    const empresa = await prisma.empresa.findUnique({ where: { id: antonio.empresaId } });
    console.log('Empresa:', empresa.nome);
    console.log('Horário Loja:', JSON.stringify(empresa.horarioFuncionamento, null, 2));
    
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

check();
