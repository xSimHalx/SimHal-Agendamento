const axios = require('axios');

// Configurações Centrais do Servidor Central (SaaS Level)
const API_URL = process.env.WHATSAPP_CENTRAL_URL || 'http://localhost:8080';
const API_KEY = process.env.WHATSAPP_CENTRAL_TOKEN || 'SUA_API_KEY_MESTRE_AQUI';

/**
 * WhatsAppService - Serviço centralizado que utiliza o Servidor Mestre
 */
const WhatsAppService = {
  /**
   * Envia uma mensagem de texto usando a instância da empresa
   */
  enviarMensagem: async (empresaId, para, mensagem) => {
    try {
      // Nome da instância segue o padrão empresa_id (primeiro bloco do UUID)
      const instanceName = `empresa_${empresaId.split('-')[0]}`;

      // Limpar o número para conter apenas dígitos
      const numeroLimpo = para.replace(/\D/g, '');
      const numeroFinal = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;

      const url = `${API_URL}/message/sendText/${instanceName}`;
      
      const payload = {
        number: numeroFinal,
        options: {
          delay: 1200,
          presence: "composing",
          linkPreview: false
        },
        textMessage: {
          text: mensagem
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          'apikey': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      console.log(`[WhatsApp Central] Mensagem enviada para ${para} (Instância: ${instanceName})`);
      return true;
    } catch (error) {
      console.error(`[WhatsApp Central] Erro ao enviar:`, error.response?.data || error.message);
      return false;
    }
  },

  /**
   * Envia mensagem de confirmação de agendamento (Boas-vindas)
   */
  enviarConfirmacaoAgendamento: async (agendamento, empresa) => {
    // Só envia se o lojista ativou o gatilho no painel
    if (!empresa.msgBoasVindasAtiva) return;

    const dataHora = new Date(agendamento.dataHora).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const mensagem = `✅ *AGENDAMENTO CONFIRMADO!*\n\nOlá *${agendamento.cliente.nome}*,\nSeu horário em *${empresa.nome}* foi reservado com sucesso!\n\n📅 *Data:* ${dataHora}\n✂️ *Serviço:* ${agendamento.servico.nome}\n👤 *Profissional:* ${agendamento.profissional.nome}\n\n📍 *Local:* ${empresa.endereco || 'Endereço da Loja'}\n\nTe esperamos lá! 🚀`;

    return WhatsAppService.enviarMensagem(empresa.id, agendamento.cliente.telefone, mensagem);
  }
};

module.exports = WhatsAppService;
