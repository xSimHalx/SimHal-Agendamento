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
  BRONZE: {
    nome: 'Bronze',
    maxProfissionais: 1,
    maxServicos: 10,
    maxAgendamentosMes: 150,
    permiteCheckout: true,
    permiteMarketing: false
  },
  GOLD: {
    nome: 'Gold',
    maxProfissionais: 5,
    maxServicos: 30,
    maxAgendamentosMes: 1000,
    permiteCheckout: true,
    permiteMarketing: true
  },
  DIAMOND: {
    nome: 'Diamond',
    maxProfissionais: 999999, // Ilimitado
    maxServicos: 999999,      // Ilimitado
    maxAgendamentosMes: 999999, // Ilimitado
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
