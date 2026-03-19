const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { startOfMonth, endOfMonth, startOfYesterday, endOfYesterday, subDays } = require('date-fns');

const RelatorioControlador = {
  async obterEstatisticas(req, res) {
    try {
      const { empresaId } = req.params;
      const { periodo } = req.query; // mes_atual, mes_passado, ultimos_30, ano_atual

      let dataInicio = startOfMonth(new Date());
      let dataFim = endOfMonth(new Date());

      // Lógica de filtro por período (Simplificada para o exemplo)
      if (periodo === 'ultimos_30') {
        dataInicio = subDays(new Date(), 30);
        dataFim = new Date();
      }

      // 1. KPIs Gerais
      const kpis = await prisma.agendamento.aggregate({
        where: {
          empresaId,
          status: 'CONCLUIDO',
          dataHora: { gte: dataInicio, lte: dataFim }
        },
        _sum: { valorTotal: true },
        _count: { id: true },
        _avg: { valorTotal: true }
      });

      // 2. Desempenho por Barbeiro
      const desempenhoEquipe = await prisma.agendamento.groupBy({
        by: ['profissionalId'],
        where: {
          empresaId,
          status: 'CONCLUIDO',
          dataHora: { gte: dataInicio, lte: dataFim }
        },
        _sum: { valorTotal: true },
        _count: { id: true }
      });

      // Buscar nomes dos profissionais
      const equipeComNomes = await Promise.all(desempenhoEquipe.map(async (item) => {
        const prof = await prisma.usuario.findUnique({ where: { id: item.profissionalId }, select: { nome: true } });
        return {
          nome: prof?.nome || 'Desconhecido',
          atendimentos: item._count.id,
          faturamento: item._sum.valorTotal || 0
        };
      }));

      // 3. Ranking de Serviços
      const rankingServicos = await prisma.agendamento.groupBy({
        by: ['servicoId'],
        where: {
          empresaId,
          status: 'CONCLUIDO',
          dataHora: { gte: dataInicio, lte: dataFim }
        },
        _count: { id: true }
      });

      const servicosComNomes = await Promise.all(rankingServicos.map(async (item) => {
        const serv = await prisma.servico.findUnique({ where: { id: item.servicoId }, select: { nome: true } });
        return {
          name: serv?.nome || 'Outros',
          value: item._count.id
        };
      }));

      return res.json({
        kpis: {
          faturamentoBruto: kpis._sum.valorTotal || 0,
          totalAtendimentos: kpis._count.id,
          ticketMedio: Math.round(kpis._avg.valorTotal || 0)
        },
        desempenhoEquipe: equipeComNomes,
        rankingServicos: servicosComNomes
      });

    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao gerar relatórios.' });
    }
  }
};

module.exports = RelatorioControlador;
