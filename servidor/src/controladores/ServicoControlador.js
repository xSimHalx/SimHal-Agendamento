const { PrismaClient } = require('@prisma/client');
const { registrarLog } = require('../utilitarios/auditoria');
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

      // -- VERIFICAÇÃO DE LIMITES POR PLANO --
      const { obterConfigPlano } = require('../utilitarios/PlanosConfig');
      const empresa = await prisma.empresa.findUnique({
        where: { id: empresaId },
        select: { plano: true }
      });
      const configPlano = obterConfigPlano(empresa?.plano);

      const totalAtual = await prisma.servico.count({
        where: { empresaId, ativo: true }
      });

      if (totalAtual >= configPlano.maxServicos) {
        return res.status(403).json({ 
          erro: `Limite do Plano Atingido`, 
          detalhe: `Seu plano (${configPlano.nome}) permite apenas ${configPlano.maxServicos} serviços ativos. Faça um upgrade para adicionar mais.` 
        });
      }
      // ----------------------------------------

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
      const servico = await prisma.servico.findUnique({ where: { id } });
      
      // Deleção lógica para não quebrar o histórico de agendamentos
      await prisma.servico.update({
        where: { id },
        data: { ativo: false }
      });

      if (servico) {
        registrarLog(servico.empresaId, 'Painel Admin', `Removeu o serviço: ${servico.nome}`, 'DANGER');
      }

      return res.json({ mensagem: 'Serviço removido com sucesso.' });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao excluir serviço.' });
    }
  }
};

module.exports = ServicoControlador;
