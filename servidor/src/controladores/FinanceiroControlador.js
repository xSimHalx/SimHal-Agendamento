const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const FinanceiroControlador = {
  // Listar todas as transações de uma empresa
  async listar(req, res) {
    try {
      const { empresaId } = req.params;
      const transacoes = await prisma.transacao.findMany({
        where: { empresaId },
        orderBy: { data: 'desc' },
        include: {
          responsavel: {
            select: { nome: true }
          }
        }
      });
      return res.json(transacoes);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao listar transações.' });
    }
  },

  // Criar uma nova transação (Ex: Despesa Manual)
  async criar(req, res) {
    try {
      const { empresaId, tipo, categoria, descricao, valor, responsavelId, data } = req.body;

      if (!empresaId || !tipo || !valor) {
        return res.status(400).json({ erro: 'Dados incompletos para a transação.' });
      }

      const novaTransacao = await prisma.transacao.create({
        data: {
          empresaId,
          tipo, // ENTRADA ou SAIDA
          categoria,
          descricao,
          valor: parseInt(valor), // Garantir que está em centavos
          responsavelId,
          data: data ? new Date(data) : new Date()
        }
      });

      return res.status(201).json(novaTransacao);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao criar transação.' });
    }
  },

  // Obter resumo financeiro (Cards)
  async obterResumo(req, res) {
    try {
      const { empresaId } = req.params;
      
      const transacoes = await prisma.transacao.findMany({
        where: { empresaId }
      });

      const totalEntradas = transacoes
        .filter(t => t.tipo === 'ENTRADA')
        .reduce((acc, t) => acc + t.valor, 0);

      const totalSaidas = transacoes
        .filter(t => t.tipo === 'SAIDA')
        .reduce((acc, t) => acc + t.valor, 0);

      const saldoLiquido = totalEntradas - totalSaidas;

      return res.json({
        totalEntradas,
        totalSaidas,
        saldoLiquido
      });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao obter resumo financeiro.' });
    }
  }
};

module.exports = FinanceiroControlador;
