const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const ProfissionalControlador = {
  async listar(req, res) {
    try {
      const { empresaId } = req.params;
      const profissionais = await prisma.usuario.findMany({
        where: { 
          empresaId,
          isProfissional: true 
        },
        select: {
          id: true,
          nome: true,
          foto: true,
          role: true,
          email: true,
          telefone: true,
          horariosDeTrabalho: true
        }
      });
      return res.json(profissionais);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao listar profissionais.' });
    }
  },

  async criar(req, res) {
    try {
      const { nome, foto, empresaId, email, telefone, senha, horariosDeTrabalho } = req.body;
      
      // -- VERIFICAÇÃO DE LIMITES POR PLANO --
      const { obterConfigPlano } = require('../utilitarios/PlanosConfig');
      const empresa = await prisma.empresa.findUnique({
        where: { id: empresaId },
        select: { plano: true }
      });
      const configPlano = obterConfigPlano(empresa?.plano);
      
      const totalAtual = await prisma.usuario.count({
        where: { empresaId, isProfissional: true }
      });

      if (totalAtual >= configPlano.maxProfissionais) {
        return res.status(403).json({ 
          erro: `Limite do Plano Atingido`, 
          detalhe: `Seu plano (${configPlano.nome}) permite apenas ${configPlano.maxProfissionais} profissional(is). Faça um upgrade para adicionar mais.` 
        });
      }
      // ----------------------------------------

      const senhaHash = await bcrypt.hash(senha, 10);
      
      const novo = await prisma.usuario.create({
        data: { 
          nome, 
          foto, 
          empresaId, 
          email, 
          telefone,
          senha: senhaHash,
          isProfissional: true,
          role: 'PROFISSIONAL',
          horariosDeTrabalho
        }
      });
      return res.status(201).json(novo);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao criar profissional (verifique se e-mail/telefone já existem).' });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, foto, email, telefone, senha, horariosDeTrabalho } = req.body;
      
      const dadosUpdate = {
        nome,
        foto,
        email,
        telefone,
        horariosDeTrabalho,
        isProfissional: req.body.isProfissional // Suporte para ativar/desativar
      };

      if (senha && senha.trim() !== '') {
        dadosUpdate.senha = await bcrypt.hash(senha, 10);
      }

      const atualizado = await prisma.usuario.update({
        where: { id },
        data: dadosUpdate
      });

      return res.json(atualizado);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao atualizar profissional. Verifique se e-mail/telefone já pertencem a outro usuário.' });
    }
  }
};

module.exports = ProfissionalControlador;
