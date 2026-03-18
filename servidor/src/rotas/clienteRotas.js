const express = require('express');
const ClienteControlador = require('../controladores/ClienteControlador');

const rotas = express.Router();

rotas.get('/:empresaId', ClienteControlador.listar);
rotas.get('/detalhes/:id', ClienteControlador.buscarPorId);
rotas.post('/', ClienteControlador.criar);
rotas.put('/:id', ClienteControlador.atualizar);
rotas.delete('/:id', ClienteControlador.excluir);

module.exports = rotas;
