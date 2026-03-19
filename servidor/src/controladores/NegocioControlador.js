const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const NegocioControlador = {
  async buscarPorSlug(req, res) {
    try {
      const { slug } = req.params;
      const empresa = await prisma.empresa.findUnique({
        where: { slug }
      });

      if (!empresa) {
        return res.status(404).json({ erro: 'Empresa não encontrada.' });
      }

      return res.json(empresa);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao buscar informações da empresa.' });
    }
  },

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const empresa = await prisma.empresa.findUnique({
        where: { id }
      });

      if (!empresa) {
        return res.status(404).json({ erro: 'Empresa não encontrada.' });
      }

      return res.json(empresa);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao buscar informações da empresa pelo ID.' });
    }
  },
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const camposPossiveis = [
        'nome', 'slug', 'telefone', 'corPrimaria', 'logo',
        'endereco', 'instagram', 'facebook', 'horarioFuncionamento',
        'exigirPagamentoAntecipado', 'autoLembrete',
        'autoAniversario', 'autoAvaliacao', 'autoBloqueioFalta', 'customLabels',
        'whatsappApiUrl', 'whatsappApiToken', 'whatsappInstanceName', 
        'msgBoasVindasAtiva', 'msgLembreteAtiva'
      ];

      const dadosParaAtualizar = {};
      camposPossiveis.forEach(campo => {
        if (req.body[campo] !== undefined) {
          dadosParaAtualizar[campo] = req.body[campo];
        }
      });

      // 1. Verificar se o novo slug já existe em OUTRA empresa (se enviado)
      if (dadosParaAtualizar.slug) {
        const existe = await prisma.empresa.findFirst({
          where: {
            slug: dadosParaAtualizar.slug,
            NOT: { id }
          }
        });

        if (existe) {
          return res.status(400).json({ erro: 'Este link de agendamento já está sendo usado por outra loja.' });
        }
      }

      const empresa = await prisma.empresa.update({
        where: { id },
        data: dadosParaAtualizar
      });

      return res.json(empresa);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao atualizar informações da empresa.' });
    }
  },

  async listarTodas(req, res) {
    try {
      const empresas = await prisma.empresa.findMany({
        select: {
          id: true,
          nome: true,
          slug: true,
          logo: true,
          endereco: true,
          telefone: true
        }
      });
      return res.json(empresas);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao listar empresas.' });
    }
  }
};

module.exports = NegocioControlador;
