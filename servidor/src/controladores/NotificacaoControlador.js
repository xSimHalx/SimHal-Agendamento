const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const NotificacaoControlador = {
  // Listar notificações da empresa
  async listar(req, res) {
    try {
      const { empresaId } = req.params;
      const notificacoes = await prisma.notificacao.findMany({
        where: { empresaId },
        orderBy: { criadoEm: 'desc' },
        take: 20
      });
      return res.json(notificacoes);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao listar notificações.' });
    }
  },

  // Marcar todas como lidas
  async marcarComoLidas(req, res) {
    try {
      const { empresaId } = req.params;
      await prisma.notificacao.updateMany({
        where: { empresaId, lida: false },
        data: { lida: true }
      });
      return res.json({ mensagem: 'Notificações marcadas como lidas.' });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao atualizar notificações.' });
    }
  },

  // Criar uma notificação (Uso interno)
  async criar(empresaId, titulo, mensagem, tipo = 'INFO') {
    try {
      return await prisma.notificacao.create({
        data: {
          empresaId,
          titulo,
          mensagem,
          tipo
        }
      });
    } catch (erro) {
      console.error("Erro ao criar notificação interna:", erro);
    }
  }
};

module.exports = NotificacaoControlador;
