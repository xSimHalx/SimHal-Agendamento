/**
 * Configuração centralizada de limites por plano do SimHal SaaS.
 * 
 * Limites definidos para cada nível de assinatura.
 */
const PLANOS_CONFIG = {
  TRIAL: {
    nome: 'Trial',
    maxProfissionais: 1,
    maxServicos: 3,
    maxAgendamentosMes: 30,
    permiteCheckout: false,
    permiteMarketing: false
  },
  STARTER: {
    nome: 'Starter',
    maxProfissionais: 3,
    maxServicos: 10,
    maxAgendamentosMes: 150,
    permiteCheckout: true,
    permiteMarketing: false
  },
  PRO: {
    nome: 'Pro',
    maxProfissionais: 10,
    maxServicos: 30,
    maxAgendamentosMes: 1000,
    permiteCheckout: true,
    permiteMarketing: true
  },
  PREMIUM: {
    nome: 'Premium',
    maxProfissionais: 9999, // Ilimitado
    maxServicos: 9999,      // Ilimitado
    maxAgendamentosMes: 99999, // Ilimitado
    permiteCheckout: true,
    permiteMarketing: true
  }
};

/**
 * Função utilitária para obter a configuração do plano de uma empresa.
 */
function obterConfigPlano(planoNome) {
  const plano = planoNome?.toUpperCase();
  return PLANOS_CONFIG[plano] || PLANOS_CONFIG.TRIAL;
}

module.exports = {
  PLANOS_CONFIG,
  obterConfigPlano
};
