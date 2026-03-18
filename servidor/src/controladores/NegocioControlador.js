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
      const { nome, slug, telefone, corPrimaria, logo, endereco, instagram, facebook, horarioFuncionamento, metaMensal } = req.body;

      const empresa = await prisma.empresa.update({
        where: { id },
        data: { nome, slug, telefone, corPrimaria, logo, endereco, instagram, facebook, horarioFuncionamento, metaMensal }
      });

      return res.json(empresa);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao atualizar informações da empresa. Verifique se o slug já existe.' });
    }
  }
};

module.exports = NegocioControlador;
