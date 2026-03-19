const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Registra um evento de auditoria no sistema.
 * @param {string} empresaId - ID da empresa.
 * @param {string} usuario - Nome ou identificador do autor da ação.
 * @param {string} acao - Descrição do que foi feito.
 * @param {string} tipo - INFO, WARNING ou DANGER.
 */
async function registrarLog(empresaId, usuario, acao, tipo = 'INFO') {
    try {
        await prisma.logAuditoria.create({
            data: {
                empresaId,
                usuario,
                acao,
                tipo
            }
        });
    } catch (erro) {
        console.error('Erro ao registrar log de auditoria:', erro);
    }
}

module.exports = { registrarLog };
