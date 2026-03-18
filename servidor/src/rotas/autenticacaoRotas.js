const express = require('express');
const AutenticacaoControlador = require('../controladores/AutenticacaoControlador');

const rotas = express.Router();

rotas.post('/registrar', AutenticacaoControlador.registrar);
rotas.post('/login', AutenticacaoControlador.login);

module.exports = rotas;
