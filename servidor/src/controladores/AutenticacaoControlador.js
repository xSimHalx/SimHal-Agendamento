const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registrarLog } = require('../utilitarios/auditoria');

const prisma = new PrismaClient();

const AutenticacaoControlador = {
  // Registro de nova Empresa e Usuário Dono
  async registrar(req, res) {
    try {
      const { nome, empresa, email, senha } = req.body;

      // Verificar se usuário já existe
      const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, 10);

      // Criar Empresa e Usuário em uma transação
      const resultado = await prisma.$transaction(async (tx) => {
        // Criar empresa com slug amigável
        const slugBase = empresa.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
          .replace(/ /g, '-')
          .replace(/[^\w-]+/g, '');
        
        let slugFinal = slugBase;
        // Verificar se slug já existe (simples, pode precisar de sufixo se houver colisão no futuro)
        const slugExistente = await tx.empresa.findUnique({ where: { slug: slugBase } });
        if (slugExistente) {
          slugFinal = `${slugBase}-${Math.floor(Math.random() * 1000)}`;
        }

        const novaEmpresa = await tx.empresa.create({
          data: {
            nome: empresa,
            slug: slugFinal,
          },
        });

        // Lógica de Super Admin
        const role = email === 'simhal2016@gmail.com' ? 'ADMIN' : 'DONO';

        const novoUsuario = await tx.usuario.create({
          data: {
            nome,
            email,
            senha: senhaHash,
            empresaId: novaEmpresa.id,
            role,
          },
        });

        return { novaEmpresa, novoUsuario };
      });

      return res.status(201).json({ mensagem: 'Empresa registrada com sucesso!', dados: resultado });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Falha ao registrar empresa.' });
    }
  },

  // Login de Usuário
  async login(req, res) {
    try {
      const { email, telefone, senha } = req.body;

      const usuario = await prisma.usuario.findFirst({
        where: {
          OR: [
            { email: email || undefined },
            { telefone: telefone || undefined }
          ]
        },
        include: { empresa: true },
      });

      if (!usuario) {
        return res.status(401).json({ erro: 'Credenciais inválidas.' });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
      }

      // Gerar Token JWT
      const token = jwt.sign(
        { id: usuario.id, empresaId: usuario.empresaId, role: usuario.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Registrar Log de Auditoria
      registrarLog(usuario.empresaId, usuario.nome, 'Realizou login no sistema', 'INFO');

      return res.json({
        mensagem: 'Login realizado!',
        usuario: { 
          id: usuario.id, 
          nome: usuario.nome, 
          email: usuario.email, 
          role: usuario.role,
          empresaId: usuario.empresaId 
        },
        empresa: usuario.empresa,
        token,
      });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  },
};

module.exports = AutenticacaoControlador;
