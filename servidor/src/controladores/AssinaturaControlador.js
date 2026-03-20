const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AssinaturaControlador {
  async obterDados(req, res) {
    try {
      const { empresaId } = req.params;
      const empresa = await prisma.empresa.findUnique({
        where: { id: empresaId },
        select: {
          plano: true,
          statusAssinatura: true,
          dataVencimento: true,
          faturas: {
            orderBy: { data: 'desc' },
            take: 10
          }
        }
      });

      // -- CALCULAR MÉTRICAS DE USO --
      const usoProfissionais = await prisma.usuario.count({
        where: { empresaId, isProfissional: true }
      });
      const usoServicos = await prisma.servico.count({
        where: { empresaId, ativo: true }
      });
      
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);
      const usoAgendamentosMes = await prisma.agendamento.count({
        where: { empresaId, dataHora: { gte: inicioMes }, status: { not: 'CANCELADO' } }
      });

      const { obterConfigPlano } = require('../utilitarios/PlanosConfig');
      const limites = obterConfigPlano(empresa.plano);

      return res.json({
        ...empresa,
        metricas: {
          profissionais: { uso: usoProfissionais, max: limites.maxProfissionais },
          servicos: { uso: usoServicos, max: limites.maxServicos },
          agendamentos: { uso: usoAgendamentosMes, max: limites.maxAgendamentosMes }
        }
      });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao carregar dados de assinatura.' });
    }
  }

  async atualizarPlano(req, res) {
    try {
      const { empresaId } = req.params;
      const { novoPlano } = req.body;

      // Em um cenário real, aqui haveria a integração com o gateway de pagamento.
      // Por enquanto, atualizamos diretamente no banco para simulação.
      const empresa = await prisma.empresa.update({
        where: { id: empresaId },
        data: { 
          plano: novoPlano,
          statusAssinatura: 'ATIVO',
          dataVencimento: new Date(new Date().setMonth(new Date().getMonth() + 1)) // +1 mês
        }
      });

      // Gerar faturamento fake para o histórico
      const precosBase = {
        'BRONZE': 4990,
        'GOLD': 8990,
        'DIAMOND': 14990
      };

      const valorOriginal = precosBase[novoPlano] || 0;
      const valorComDesconto = Math.floor(valorOriginal * 0.8); // 20% de desconto Beta
      
      if (valorComDesconto > 0) {
        await prisma.fatura.create({
            data: {
                empresaId,
                plano: novoPlano,
                valor: valorComDesconto,
                status: 'PAGO',
                codigo: `FAT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
            }
        });
      }

      return res.json(empresa);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao atualizar plano.' });
    }
  }
}

module.exports = new AssinaturaControlador();
