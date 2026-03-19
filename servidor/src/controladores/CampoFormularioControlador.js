const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CampoFormularioControlador = {
    // Listar todos os campos extras de uma loja
    async listar(req, res) {
        try {
            const { empresaId } = req.params;
            const campos = await prisma.campoFormulario.findMany({
                where: { empresaId },
                orderBy: { label: 'asc' } // Ordem alfabética
            });
            return res.json(campos);
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ erro: 'Erro ao listar campos do formulário.' });
        }
    },

    // Criar uma nova pergunta/campo
    async criar(req, res) {
        try {
            const { empresaId, label, tipo, opcoes, obrigatorio } = req.body;
            const novoCampo = await prisma.campoFormulario.create({
                data: {
                    empresaId,
                    label,
                    tipo, // 'TEXT', 'NUMBER' ou 'SELECT'
                    opcoes: opcoes || [], // Se for SELECT, guarda um array de strings
                    obrigatorio: obrigatorio || false,
                    ativo: true
                }
            });
            return res.status(201).json(novoCampo);
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ erro: 'Erro ao criar campo do formulário.' });
        }
    },

    // Atualizar (ex: inativar ou mudar o nome)
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const dados = req.body;
            const campoAtualizado = await prisma.campoFormulario.update({
                where: { id },
                data: dados
            });
            return res.json(campoAtualizado);
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ erro: 'Erro ao atualizar campo do formulário.' });
        }
    },

    // Excluir a pergunta
    async excluir(req, res) {
        try {
            const { id } = req.params;
            await prisma.campoFormulario.delete({ where: { id } });
            return res.status(204).send();
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ erro: 'Erro ao excluir campo do formulário.' });
        }
    }
};

module.exports = CampoFormularioControlador;