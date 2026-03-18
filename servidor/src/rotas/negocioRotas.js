const express = require('express');
const ProfissionalControlador = require('../controladores/ProfissionalControlador');
const ServicoControlador = require('../controladores/ServicoControlador');
const AgendamentoControlador = require('../controladores/AgendamentoControlador');
const AdicionalControlador = require('../controladores/AdicionalControlador');
const NegocioControlador = require('../controladores/NegocioControlador');
const BloqueioControlador = require('../controladores/BloqueioControlador');

const rotas = express.Router();

// Informações da Empresa
rotas.get('/info/:slug', NegocioControlador.buscarPorSlug);
rotas.get('/info/pelo-id/:id', NegocioControlador.buscarPorId);
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
rotas.get('/agendamentos/dia/:empresaId', AgendamentoControlador.listarPorDia);
rotas.put('/agendamentos/status/:id', AgendamentoControlador.atualizarStatus);
rotas.get('/disponibilidade', AgendamentoControlador.buscarDisponibilidade);
rotas.get('/disponibilidade-mensal', AgendamentoControlador.buscarDisponibilidadeMensal);

// Rotas de Bloqueio de Agenda
rotas.get('/bloqueios/:empresaId', BloqueioControlador.listar);
rotas.post('/bloqueios', BloqueioControlador.criar);
rotas.delete('/bloqueios/:id', BloqueioControlador.excluir);

module.exports = rotas;
