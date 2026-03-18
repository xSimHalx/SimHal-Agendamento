const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const AdicionalControlador = {
  async listar(req, res) {
    try {
      const { empresaId } = req.params;
      const adicionais = await prisma.adicional.findMany({
        where: { empresaId }
      });
      return res.json(adicionais);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao listar adicionais.' });
    }
  },

  async criar(req, res) {
    try {
      const { nome, descricao, preco, empresaId } = req.body;
      const novo = await prisma.adicional.create({
        data: { nome, descricao, preco, empresaId }
      });
      return res.status(201).json(novo);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao criar adicional.' });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, descricao, preco, ativo } = req.body;
      const atualizado = await prisma.adicional.update({
        where: { id },
        data: { nome, descricao, preco, ativo }
      });
      return res.json(atualizado);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao atualizar adicional.' });
    }
  },

  async excluir(req, res) {
    try {
      const { id } = req.params;
      await prisma.adicional.delete({
        where: { id }
      });
      return res.json({ mensagem: 'Adicional removido com sucesso.' });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao excluir adicional.' });
    }
  }
};

module.exports = AdicionalControlador;
