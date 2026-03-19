const express = require('express');
const router = express.Router();
const WhatsAppControlador = require('../controladores/WhatsAppControlador');

// Rota para gerar/recuperar QR Code
router.get('/qrcode/:empresaId', WhatsAppControlador.gerarQrCode);

// Rota para verificar status da conexão
router.get('/status/:empresaId', WhatsAppControlador.verificarStatus);

// Rota para desconectar/deletar instância
router.delete('/desconectar/:empresaId', WhatsAppControlador.desconectar);

module.exports = router;
