const express = require('express');
const ProfissionalControlador = require('../controladores/ProfissionalControlador');
const ServicoControlador = require('../controladores/ServicoControlador');
const AgendamentoControlador = require('../controladores/AgendamentoControlador');
const NotificacaoControlador = require('../controladores/NotificacaoControlador');
const AdicionalControlador = require('../controladores/AdicionalControlador');
const NegocioControlador = require('../controladores/NegocioControlador');
const BloqueioControlador = require('../controladores/BloqueioControlador');
const FinanceiroControlador = require('../controladores/FinanceiroControlador');
const RelatorioControlador = require('../controladores/RelatorioControlador');
const MarketingControlador = require('../controladores/MarketingControlador');
const AuditoriaControlador = require('../controladores/AuditoriaControlador');
const AutomacaoControlador = require('../controladores/AutomacaoControlador');
const SuporteControlador = require('../controladores/SuporteControlador');
const AssinaturaControlador = require('../controladores/AssinaturaControlador');
const PagamentoControlador = require('../controladores/PagamentoControlador');
const CampoFormularioControlador = require('../controladores/CampoFormularioControlador');
const WhatsAppControlador = require('../controladores/WhatsAppControlador');

const rotas = express.Router();

// Informações da Empresa
rotas.get('/info/:slug', NegocioControlador.buscarPorSlug);
rotas.get('/info/pelo-id/:id', NegocioControlador.buscarPorId);
rotas.get('/todas', NegocioControlador.listarTodas);
rotas.put('/info/:id', NegocioControlador.atualizar);

// Rotas de Profissionais
rotas.get('/profissionais/:empresaId', ProfissionalControlador.listar);
rotas.post('/profissionais', ProfissionalControlador.criar);
rotas.put('/profissionais/:id', ProfissionalControlador.atualizar);

// Rotas de Serviços
rotas.get('/servicos/:empresaId', ServicoControlador.listar);
rotas.post('/servicos', ServicoControlador.criar);
rotas.put('/servicos/:id', ServicoControlador.atualizar);
rotas.delete('/servicos/:id', ServicoControlador.excluir);

// Rotas de Adicionais
rotas.get('/adicionais/:empresaId', AdicionalControlador.listar);
rotas.post('/adicionais', AdicionalControlador.criar);
rotas.put('/adicionais/:id', AdicionalControlador.atualizar);
rotas.delete('/adicionais/:id', AdicionalControlador.excluir);

// Rotas de Agendamento
rotas.post('/agendamentos', AgendamentoControlador.criar);
rotas.get('/agendamentos/:empresaId', AgendamentoControlador.listarPorEmpresa);

// Rotas: Notificações
rotas.get('/notificacoes/:empresaId', NotificacaoControlador.listar);
rotas.put('/notificacoes/lidas/:empresaId', NotificacaoControlador.marcarComoLidas);
rotas.get('/agendamentos/dia/:empresaId', AgendamentoControlador.listarPorDia);
rotas.put('/agendamentos/status/:id', AgendamentoControlador.atualizarStatus);
rotas.get('/disponibilidade', AgendamentoControlador.buscarDisponibilidade);
rotas.get('/disponibilidade-mensal', AgendamentoControlador.buscarDisponibilidadeMensal);

// Rotas de Bloqueio de Agenda
rotas.get('/bloqueios/:empresaId', BloqueioControlador.listar);
rotas.post('/bloqueios', BloqueioControlador.criar);
rotas.delete('/bloqueios/:id', BloqueioControlador.excluir);

// Rotas de Finanças
rotas.get('/financeiro/transacoes/:empresaId', FinanceiroControlador.listar);
rotas.post('/financeiro/transacoes', FinanceiroControlador.criar);
rotas.get('/financeiro/resumo/:empresaId', FinanceiroControlador.obterResumo);

// Rotas de Relatórios
rotas.get('/relatorios/estatisticas/:empresaId', RelatorioControlador.obterEstatisticas);

// Rotas de Marketing & CRM
rotas.get('/marketing/clientes-sumidos/:empresaId', MarketingControlador.listarClientesSumidos);
rotas.get('/marketing/cupons/:empresaId', MarketingControlador.listarCupons);
rotas.post('/marketing/cupons', MarketingControlador.criarCupom);
rotas.patch('/marketing/cupons/:id/toggle-status', MarketingControlador.toggleStatusCupom);
rotas.delete('/marketing/cupons/:id', MarketingControlador.excluirCupom);

// Rotas de Auditoria & Segurança
rotas.get('/auditoria/logs/:empresaId', AuditoriaControlador.listarLogs);

// Rotas de Automação
rotas.get('/automacao/:empresaId', AutomacaoControlador.listarConfiguracoes);
rotas.patch('/automacao/:empresaId', AutomacaoControlador.atualizarConfiguracao);

// Rotas de Suporte
rotas.post('/suporte/chamados', SuporteControlador.abrirChamado);
rotas.get('/suporte/chamados/:empresaId', SuporteControlador.listarChamados);

// Rotas de Assinatura (SaaS)
rotas.get('/assinatura/:empresaId', AssinaturaControlador.obterDados);
rotas.patch('/assinatura/plano/:empresaId', AssinaturaControlador.atualizarPlano);

// Rotas de Checkout (Pagamento Antecipado)
rotas.post('/checkout/preferencia', PagamentoControlador.criarPreferencia);
rotas.get('/checkout/status/:pagamentoId', PagamentoControlador.verificarStatus);

// Rotas de Campos Personalizados
rotas.get('/campos-formulario/:empresaId', CampoFormularioControlador.listar);
rotas.post('/campos-formulario', CampoFormularioControlador.criar);
rotas.put('/campos-formulario/:id', CampoFormularioControlador.atualizar);
rotas.delete('/campos-formulario/:id', CampoFormularioControlador.excluir);

// Rotas de WhatsApp (Servidor Central)
rotas.get('/whatsapp/qrcode/:empresaId', WhatsAppControlador.gerarQrCode);
rotas.get('/whatsapp/status/:empresaId', WhatsAppControlador.verificarStatus);
rotas.delete('/whatsapp/desconectar/:empresaId', WhatsAppControlador.desconectar);
rotas.post('/whatsapp/teste', WhatsAppControlador.testeEnvio);

module.exports = rotas;
