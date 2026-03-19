const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AuditoriaControlador {
  async listarLogs(req, res) {
    try {
      const { empresaId } = req.params;
      const logs = await prisma.logAuditoria.findMany({
        where: { empresaId },
        orderBy: { dataHora: 'desc' },
        take: 100 // Limitar aos últimos 100
      });
      return res.json(logs);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao carregar logs.' });
    }
  }
}

module.exports = new AuditoriaControlador();
