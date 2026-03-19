const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AutomacaoControlador {
  async listarConfiguracoes(req, res) {
    try {
      const { empresaId } = req.params;
      const empresa = await prisma.empresa.findUnique({
        where: { id: empresaId },
        select: {
          autoLembrete: true,
          autoAniversario: true,
          autoAvaliacao: true,
          autoBloqueioFalta: true
        }
      });
      return res.json(empresa);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao carregar automações.' });
    }
  }

  async atualizarConfiguracao(req, res) {
    try {
      const { empresaId } = req.params;
      const { campo, valor } = req.body; // campo: 'autoLembrete', valor: true/false

      const empresa = await prisma.empresa.update({
        where: { id: empresaId },
        data: { [campo]: valor }
      });
      
      return res.json(empresa);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao atualizar automação.' });
    }
  }
}

module.exports = new AutomacaoControlador();
