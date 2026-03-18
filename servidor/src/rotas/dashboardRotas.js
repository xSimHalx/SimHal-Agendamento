const express = require('express');
const rotas = express.Router();
const DashboardControlador = require('../controladores/DashboardControlador');

rotas.get('/estatisticas/:empresaId', DashboardControlador.getStats);

module.exports = rotas;
