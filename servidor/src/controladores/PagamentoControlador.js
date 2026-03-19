const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PagamentoControlador {
  async criarPreferencia(req, res) {
    try {
      const { empresaId, valorCentavos, servicoNome } = req.body;

      // Simulação de criação de preferência no Mercado Pago
      // Em produção, aqui usaríamos o SDK do Mercado Pago
      const idSimulacao = `PREF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // QR Code PIX Estático Simulado (Copia e Cola)
      const pixCopiaECola = `00020126580014BR.GOV.BCB.PIX0114+55119999999990208SIMHALPAY520400005303986540${(valorCentavos / 100).toFixed(2)}5802BR5913SIMHAL SAAS6008SAO PAULO62070503***6304E21D`;

      return res.json({
        id: idSimulacao,
        pixCopiaECola,
        valorTotal: valorCentavos,
        servico: servicoNome,
        status: 'PENDENTE'
      });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao gerar cobrança.' });
    }
  }

  async verificarStatus(req, res) {
    try {
      const { pagamentoId } = req.params;
      
      // Simulação de verificação de status
      // Para fins de demonstração, sempre retornamos APROVADO após o cliente clicar no botão fictício de "Já paguei"
      return res.json({ status: 'approved' });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao verificar pagamento.' });
    }
  }
}

module.exports = new PagamentoControlador();
