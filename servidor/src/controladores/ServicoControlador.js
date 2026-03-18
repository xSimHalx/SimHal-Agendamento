const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ServicoControlador = {
  async listar(req, res) {
    try {
      const { empresaId } = req.params;
      const servicos = await prisma.servico.findMany({
        where: { empresaId, ativo: true }
      });
      
      // Buscar adicionais da empresa separadamente para o frontend
      const adicionais = await prisma.adicional.findMany({
        where: { empresaId, ativo: true }
      });

      return res.json({ servicos, adicionais });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao listar serviços.' });
    }
  },

  async criar(req, res) {
    try {
      const { nome, descricao, preco, duracao, empresaId } = req.body;
      const novo = await prisma.servico.create({
        data: { nome, descricao, preco, duracao, empresaId }
      });
      return res.status(201).json(novo);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao criar serviço.' });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, descricao, preco, duracao, ativo } = req.body;
      const atualizado = await prisma.servico.update({
        where: { id },
        data: { nome, descricao, preco, duracao, ativo }
      });
      return res.json(atualizado);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao atualizar serviço.' });
    }
  },

  async excluir(req, res) {
    try {
      const { id } = req.params;
      // Deleção lógica para não quebrar o histórico de agendamentos
      await prisma.servico.update({
        where: { id },
        data: { ativo: false }
      });
      return res.json({ mensagem: 'Serviço removido com sucesso.' });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao excluir serviço.' });
    }
  }
};

module.exports = ServicoControlador;
