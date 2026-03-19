const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { subDays } = require('date-fns');

const MarketingControlador = {
  // Listar clientes que não agendam há mais de 30 dias
  async listarClientesSumidos(req, res) {
    try {
      const { empresaId } = req.params;
      const dataLimite = subDays(new Date(), 30);

      // Buscar todos os clientes da empresa
      const clientes = await prisma.cliente.findMany({
        where: { empresaId },
        include: {
          agendamentos: {
            orderBy: { dataHora: 'desc' },
            take: 1
          }
        }
      });

      // Filtrar clientes cujo último agendamento foi há mais de 30 dias (ou nunca agendaram se necessário)
      const sumidos = clientes.filter(cliente => {
        if (cliente.agendamentos.length === 0) return true; // Nunca agendou? Talvez considerar sumido ou novo.
        const ultimaVisita = new Date(cliente.agendamentos[0].dataHora);
        return ultimaVisita < dataLimite;
      }).map(cliente => {
        const ultimaVisita = cliente.agendamentos[0] ? new Date(cliente.agendamentos[0].dataHora) : null;
        const diasSumido = ultimaVisita 
          ? Math.floor((new Date() - ultimaVisita) / (1000 * 60 * 60 * 24)) 
          : 99; // Representação de "há muito tempo"

        return {
          id: cliente.id,
          nome: cliente.nome,
          telefone: cliente.telefone,
          ultimaVisita: ultimaVisita ? ultimaVisita.toLocaleDateString('pt-BR') : 'Sem registros',
          diasSumido,
          servicoFavorito: 'Consultar histórico' // Poderia ser calculado com groupby se quisesse precisão
        };
      });

      return res.json(sumidos);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao buscar clientes inativos.' });
    }
  },

  // CRUD de Cupons
  async listarCupons(req, res) {
    try {
      const { empresaId } = req.params;
      const cupons = await prisma.cupom.findMany({
        where: { empresaId },
        orderBy: { criadoEm: 'desc' }
      });
      return res.json(cupons);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao listar cupons.' });
    }
  },

  async criarCupom(req, res) {
    try {
      const { empresaId, codigo, desconto, tipo, validade, limiteUso } = req.body;
      
      const existe = await prisma.cupom.findUnique({ where: { codigo } });
      if (existe) return res.status(400).json({ erro: 'Este código de cupom já existe.' });

      const novo = await prisma.cupom.create({
        data: {
          empresaId,
          codigo: codigo.toUpperCase(),
          desconto: Number(desconto),
          tipo,
          validade: validade ? new Date(validade) : null,
          limiteUso: limiteUso ? Number(limiteUso) : 0,
        }
      });
      return res.status(201).json(novo);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao criar cupom.' });
    }
  },

  async excluirCupom(req, res) {
    try {
        const { id } = req.params;
        await prisma.cupom.delete({ where: { id } });
        return res.status(204).send();
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao excluir cupom.' });
    }
  },

  async toggleStatusCupom(req, res) {
    try {
      const { id } = req.params;
      const cupom = await prisma.cupom.findUnique({ where: { id } });
      
      if (!cupom) return res.status(404).json({ erro: 'Cupom não encontrado.' });

      const novoStatus = cupom.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';

      const atualizado = await prisma.cupom.update({
        where: { id },
        data: { status: novoStatus }
      });

      return res.json(atualizado);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao alterar status do cupom.' });
    }
  }
};

module.exports = MarketingControlador;
