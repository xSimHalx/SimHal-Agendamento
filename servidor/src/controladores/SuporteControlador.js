const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SuporteControlador {
  async abrirChamado(req, res) {
    try {
      const { empresaId, assunto, mensagem, prioridade } = req.body;
      
      const novo = await prisma.chamadoSuporte.create({
        data: {
          empresaId,
          assunto,
          mensagem,
          prioridade: prioridade || 'NORMAL'
        }
      });
      
      return res.status(201).json(novo);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao abrir chamado.' });
    }
  }

  async listarChamados(req, res) {
    try {
      const { empresaId } = req.params;
      const chamados = await prisma.chamadoSuporte.findMany({
        where: { empresaId },
        orderBy: { criadoEm: 'desc' }
      });
      return res.json(chamados);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao carregar chamados.' });
    }
  }
}

module.exports = new SuporteControlador();
