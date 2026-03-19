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
    }
};

module.exports = WhatsAppControlador;
