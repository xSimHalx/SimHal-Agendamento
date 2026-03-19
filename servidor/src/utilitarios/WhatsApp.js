const { format } = require('date-fns');
const { ptBR } = require('date-fns/locale');

/**
 * Utilitário para centralizar mensagens de WhatsApp.
 * Futuramente pode ser conectado a uma API oficial (Evolution, Twilio, etc).
 */
const WhatsApp = {
  
  /**
   * Gera uma URL de wa.me para o cliente enviar ao profissional
   */
  gerarLinkConfirmacaoCliente(agendamento) {
    const dataFmt = format(new Date(agendamento.dataHora), "dd/MM 'às' HH:mm", { locale: ptBR });
    const telProf = agendamento.profissional?.telefone?.replace(/\D/g, '') || '';
    
    const texto = `Olá! Acabei de realizar um agendamento pelo SimHal:
📅 *Data:* ${dataFmt}
🛠️ *Serviço:* ${agendamento.servico?.nome}
👤 *Cliente:* ${agendamento.cliente?.nome}

Pode me confirmar se está tudo ok?`;

    return `https://wa.me/55${telProf}?text=${encodeURIComponent(texto)}`;
  },

  /**
   * Simula o envio de uma notificação para o dono da loja
   */
  async notificarDonoNovaReserva(agendamento) {
    const dataFmt = format(new Date(agendamento.dataHora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    const telDono = agendamento.empresa?.telefone?.replace(/\D/g, '') || '';
    
    const texto = `🛎️ *NOVA RESERVA REALIZADA!*
----------------------------
👤 *Cliente:* ${agendamento.cliente?.nome}
📞 *Tel:* ${agendamento.cliente?.telefone}
🛠️ *Serviço:* ${agendamento.servico?.nome}
📅 *Quando:* ${dataFmt}
🧔 *Profissional:* ${agendamento.profissional?.nome}
----------------------------
_Mensagem enviada via SimHal Agendamentos_`;

    console.log(`\n[WHATSAPP SIMULATION] Enviando para DONO (${telDono}):`);
    console.log(texto);
    console.log('--------------------------------------------------\n');
    
    return true;
  }
};

module.exports = WhatsApp;
