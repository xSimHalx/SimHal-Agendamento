const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BloqueioControlador = {
  // Criar um novo bloqueio
  async criar(req, res) {
    try {
      const { empresaId, profissionalId, inicio, fim, motivo, recorrente } = req.body;
      
      const novoBloqueio = await prisma.bloqueioAgenda.create({
        data: {
          empresaId,
          profissionalId,
          inicio: new Date(inicio),
          fim: new Date(fim),
          motivo,
          recorrente: recorrente || false
        }
      });
      
      return res.status(201).json(novoBloqueio);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao criar bloqueio de agenda.' });
    }
  },

  // Listar bloqueios de uma empresa
  async listar(req, res) {
    try {
      const { empresaId } = req.params;
      const bloqueios = await prisma.bloqueioAgenda.findMany({
        where: { empresaId },
        include: { profissional: true },
        orderBy: { inicio: 'asc' }
      });
      return res.json(bloqueios);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao listar bloqueios.' });
    }
  },

  // Excluir um bloqueio
  async excluir(req, res) {
    try {
      const { id } = req.params;
      await prisma.bloqueioAgenda.delete({ where: { id } });
      return res.status(204).send();
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao excluir bloqueio.' });
    }
  }
};

module.exports = BloqueioControlador;
