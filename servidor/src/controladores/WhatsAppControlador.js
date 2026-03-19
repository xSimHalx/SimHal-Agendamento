const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configurações Centrais (Em produção, virão do .env)
const API_URL = process.env.WHATSAPP_CENTRAL_URL || 'http://localhost:8080'; // Ex: URL da Evolution API
const API_KEY = process.env.WHATSAPP_CENTRAL_TOKEN || 'SUA_API_KEY_MESTRE';

const WhatsAppControlador = {
    /**
     * Gera ou recupera um QR Code para a empresa
     */
    gerarQrCode: async (req, res) => {
        try {
            const { empresaId } = req.params;
            const instanceName = `empresa_${empresaId.split('-')[0]}`; // Nome amigável

            // 1. Tentar criar a instância (se não existir)
            try {
                await axios.post(`${API_URL}/instance/create`, {
                    instanceName: instanceName,
                    token: instanceName, // Usamos o nome como token da instância
                    qrcode: true
                }, {
                    headers: { 'apikey': API_KEY }
                });
            } catch (e) {
                // Se der erro 403/409, a instância provavelmente já existe, continuamos
                console.log("Instância já deve existir ou erro na criação:", e.response?.data || e.message);
            }

            // 2. Buscar o QR Code atual
            const response = await axios.get(`${API_URL}/instance/connect/${instanceName}`, {
                headers: { 'apikey': API_KEY }
            });

            // Se devolver base64 do QR Code
            return res.json({ 
                base64: response.data.base64 || response.data.code,
                instance: instanceName,
                status: response.data.instance?.state || 'Aguardando'
            });

        } catch (erro) {
            console.error("Erro ao gerar QR Code:", erro.response?.data || erro.message);
            return res.status(500).json({ 
                erro: 'Erro ao conectar ao servidor central de WhatsApp.',
                detalhe: erro.response?.data?.message || erro.message
            });
        }
    },

    /**
     * Verifica se a instância está conectada
     */
    verificarStatus: async (req, res) => {
        try {
            const { empresaId } = req.params;
            const instanceName = `empresa_${empresaId.split('-')[0]}`;

            const response = await axios.get(`${API_URL}/instance/connectionStatus/${instanceName}`, {
                headers: { 'apikey': API_KEY }
            });

            const status = response.data.instance.state; // "open", "close", "connecting"
            
            return res.json({ status });
        } catch (erro) {
            return res.json({ status: 'disconnected' });
        }
    },

    /**
     * Deleta a instância (Desconectar)
     */
    desconectar: async (req, res) => {
        try {
            const { empresaId } = req.params;
            const instanceName = `empresa_${empresaId.split('-')[0]}`;

            await axios.delete(`${API_URL}/instance/logout/${instanceName}`, {
                headers: { 'apikey': API_KEY }
            });

            await axios.delete(`${API_URL}/instance/delete/${instanceName}`, {
                headers: { 'apikey': API_KEY }
            });

            return res.json({ mensagem: 'Desconectado com sucesso.' });
        } catch (erro) {
            console.error("Erro ao desconectar:", erro.message);
            return res.status(500).json({ erro: 'Erro ao desconectar aparelho.' });
        }
    },

    /**
     * Envia uma mensagem de texto (Interno e API)
     */
    enviarMensagem: async (numero, texto, empresaId) => {
        try {
            const instanceName = `empresa_${empresaId.split('-')[0]}`;
            
            // Limpa o número (remove caracteres não numéricos)
            const numeroLimpo = numero.replace(/\D/g, '');
            // Garante o formato internacional (ex: 5511999999999)
            const numeroFinal = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;

            const response = await axios.post(`${API_URL}/message/sendText/${instanceName}`, {
                number: numeroFinal,
                options: {
                    delay: 1200,
                    presence: 'composing',
                    linkPreview: false
                },
                textMessage: {
                    text: texto
                }
            }, {
                headers: { 'apikey': API_KEY }
            });

            return response.data;
        } catch (erro) {
            console.error("Erro ao enviar WhatsApp:", erro.response?.data || erro.message);
            throw erro;
        }
    },

    /**
     * Rota de teste manual
     */
    testeEnvio: async (req, res) => {
        try {
            const { empresaId, numero } = req.body;
            await WhatsAppControlador.enviarMensagem(numero, "Olá! Esta é uma mensagem de teste do seu sistema SimHal Agendamento. 🚀", empresaId);
            return res.json({ mensagem: 'Mensagem enviada com sucesso!' });
        } catch (erro) {
            return res.status(500).json({ erro: 'Falha no envio do teste.', detalhe: erro.message });
        }
    }
};

module.exports = WhatsAppControlador;
