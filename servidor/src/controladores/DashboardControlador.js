const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { startOfDay, endOfDay, subDays, format, startOfMonth } = require('date-fns');

const DashboardControlador = {
  getStats: async (req, res) => {
    try {
      const { empresaId } = req.params;
      const { dias = 7 } = req.query; // Padrão 7 dias se não enviado
      const numDias = parseInt(dias);

      const hoje = new Date();
      const inicioHoje = startOfDay(hoje);
      const fimHoje = endOfDay(hoje);
      const inicioPeriodo = startOfDay(subDays(hoje, numDias - 1));

      // 1. KPIs Rápidos (Comparação Hoje vs Ontem)
      const ontem = subDays(hoje, 1);
      const inicioOntem = startOfDay(ontem);
      const fimOntem = endOfDay(ontem);

      const agendamentosHoje = await prisma.agendamento.findMany({
        where: { empresaId, dataHora: { gte: inicioHoje, lte: fimHoje }, status: 'CONCLUIDO' }
      });
      const faturamentoHoje = agendamentosHoje.reduce((acc, curr) => acc + Number(curr.valorTotal || 0), 0);

      const agendamentosOntem = await prisma.agendamento.findMany({
        where: { empresaId, dataHora: { gte: inicioOntem, lte: fimOntem }, status: 'CONCLUIDO' }
      });
      const faturamentoOntem = agendamentosOntem.reduce((acc, curr) => acc + Number(curr.valorTotal || 0), 0);

      const tendFaturamento = faturamentoOntem > 0 ? ((faturamentoHoje - faturamentoOntem) / faturamentoOntem) * 100 : 0;

      const totalAgendamentosHoje = await prisma.agendamento.count({
        where: { empresaId, dataHora: { gte: inicioHoje, lte: fimHoje } }
      });
      const totalAgendamentosOntem = await prisma.agendamento.count({
        where: { empresaId, dataHora: { gte: inicioOntem, lte: fimOntem } }
      });
      const tendAgendamentos = totalAgendamentosOntem > 0 ? ((totalAgendamentosHoje - totalAgendamentosOntem) / totalAgendamentosOntem) * 100 : 0;

      const novosClientesHoje = await prisma.cliente.count({
        where: { empresaId, criadoEm: { gte: inicioHoje, lte: fimHoje } }
      });
      const novosClientesOntem = await prisma.cliente.count({
        where: { empresaId, criadoEm: { gte: inicioOntem, lte: fimOntem } }
      });
      const tendClientes = novosClientesOntem > 0 ? ((novosClientesHoje - novosClientesOntem) / novosClientesOntem) * 100 : 0;

      // 2. Gráfico de Faturamento (Dinâmico por período)
      // ... (mantém o loop do gráfico igual)
      const graficoFaturamento = [];
      for (let i = numDias - 1; i >= 0; i--) {
        const dia = subDays(hoje, i);
        const inicioDia = startOfDay(dia);
        const fimDia = endOfDay(dia);

        const agendamentosDia = await prisma.agendamento.findMany({
          where: { empresaId, dataHora: { gte: inicioDia, lte: fimDia }, status: 'CONCLUIDO' }
        });

        const totalDia = agendamentosDia.reduce((acc, curr) => acc + Number(curr.valorTotal || 0), 0);
        graficoFaturamento.push({
          data: format(dia, 'dd/MM'),
          valor: totalDia
        });
      }

      // 3. Distribuição de Serviços
      const agendamentosPeriodo = await prisma.agendamento.findMany({
        where: { empresaId, dataHora: { gte: inicioPeriodo, lte: fimHoje }, status: 'CONCLUIDO' },
        include: { servico: true }
      });

      const contagemServicos = {};
      agendamentosPeriodo.forEach(a => {
        const nome = a.servico.nome;
        contagemServicos[nome] = (contagemServicos[nome] || 0) + 1;
      });

      const distribuicaoServicos = Object.entries(contagemServicos)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // 4. Próximos Atendimentos
      const proximosAtendimentos = await prisma.agendamento.findMany({
        where: { empresaId, dataHora: { gte: hoje, lte: fimHoje } },
        include: { cliente: true, profissional: true, servico: true },
        orderBy: { dataHora: 'asc' },
        take: 5
      });

      // 5. Meta Mensal
      const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
      const metaReal = empresa?.metaMensal || 5000;

      const inicioMes = startOfMonth(hoje);
      const faturamentoMes = await prisma.agendamento.findMany({
        where: { empresaId, dataHora: { gte: inicioMes, lte: fimHoje }, status: 'CONCLUIDO' }
      });
      const totalMes = faturamentoMes.reduce((acc, curr) => acc + Number(curr.valorTotal || 0), 0);

      return res.json({
        stats: {
          faturamentoHoje,
          tendFaturamento: tendFaturamento.toFixed(1),
          agendamentosHoje: totalAgendamentosHoje,
          tendAgendamentos: tendAgendamentos.toFixed(1),
          novosClientesHoje,
          tendClientes: tendClientes.toFixed(1),
          metaMensal: metaReal, 
          faturadoMes: totalMes
        },
        graficoFaturamento,
        distribuicaoServicos,
        proximosAtendimentos
      });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao buscar estatísticas do dashboard.' });
    }
  }
};

module.exports = DashboardControlador;
