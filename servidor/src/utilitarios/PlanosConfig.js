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
    permiteMarketing: false,
    permiteFinanceiro: false,
    permiteRelatorios: false,
    permiteIntegracoes: false,
    permiteAutomacao: false,
    permiteLandingPage: false,
    permiteComissoes: false
  },
  BRONZE: {
    nome: 'SS Essencial',
    maxProfissionais: 1,
    maxServicos: 10,
    maxAgendamentosMes: 150,
    permiteCheckout: true,
    permiteMarketing: false,
    permiteFinanceiro: false,
    permiteRelatorios: false,
    permiteIntegracoes: false,
    permiteAutomacao: false,
    permiteLandingPage: false,
    permiteComissoes: false
  },
  GOLD: {
    nome: 'SS Premium',
    maxProfissionais: 5,
    maxServicos: 30,
    maxAgendamentosMes: 1000,
    permiteCheckout: true,
    permiteMarketing: false,
    permiteFinanceiro: true,
    permiteRelatorios: true,
    permiteIntegracoes: false,
    permiteAutomacao: false,
    permiteLandingPage: false,
    permiteComissoes: true
  },
  DIAMOND: {
    nome: 'SS Black (Elite)',
    maxProfissionais: 999999,
    maxServicos: 999999,
    maxAgendamentosMes: 999999,
    permiteCheckout: true,
    permiteMarketing: true,
    permiteFinanceiro: true,
    permiteRelatorios: true,
    permiteIntegracoes: true,
    permiteAutomacao: true,
    permiteLandingPage: true,
    permiteComissoes: true
  }
};

/**
 * Função utilitária para obter a configuração do plano de uma empresa.
 */
function obterConfigPlano(planoNome) {
  const plano = planoNome?.toUpperCase();
  
  // Mapeamento de compatibilidade (Legacy -> New)
  const mapa = {
    'STARTER': 'BRONZE',
    'PRO': 'DIAMOND', // Pro era o topo, então Black (Elite)
    'PREMIUM': 'GOLD' // Premium agora é o plano médio
  };

  const chaveEfetiva = mapa[plano] || plano;
  return PLANOS_CONFIG[chaveEfetiva] || PLANOS_CONFIG.TRIAL;
}

module.exports = {
  PLANOS_CONFIG,
  obterConfigPlano
};
