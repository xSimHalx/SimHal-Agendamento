const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpeza de banco de dados iniciada...');

  // Ordem reversa para evitar erros de Foreign Key
  await prisma.notificacao.deleteMany({});
  await prisma.logAuditoria.deleteMany({});
  await prisma.chamadoSuporte.deleteMany({});
  await prisma.transacao.deleteMany({});
  await prisma.agendamento.deleteMany({});
  await prisma.bloqueioAgenda.deleteMany({});
  await prisma.adicional.deleteMany({});
  await prisma.servico.deleteMany({});
  await prisma.cupom.deleteMany({});
  await prisma.campoFormulario.deleteMany({});
  await prisma.cliente.deleteMany({});
  await prisma.fatura.deleteMany({});
  
  // Deletar usuários EXCETO o admin principal
  const adminEmail = 'simhal2016@gmail.com';
  await prisma.usuario.deleteMany({
    where: {
      email: { not: adminEmail }
    }
  });

  console.log('✅ Banco de dados limpo com sucesso!');
  console.log('ℹ️ O usuário simhal2016@gmail.com foi preservado.');
  console.log('🚀 Dica: Rode "node prisma/seed.js" para recriar um serviço e empresa de teste se necessário.');
}

main()
  .catch((e) => {
    console.error('❌ Erro na limpeza:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
