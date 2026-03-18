const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ClienteControlador = {
  // Listar todos os clientes de uma empresa
  async listar(req, res) {
    try {
      const { empresaId } = req.params;
      const clientes = await prisma.cliente.findMany({
        where: { empresaId },
        include: {
          _count: {
            select: { agendamentos: true }
          }
        },
        orderBy: { nome: 'asc' }
      });
      return res.json(clientes);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao listar clientes.' });
    }
  },

  // Buscar detalhes de um cliente (incluindo histórico)
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const cliente = await prisma.cliente.findUnique({
        where: { id },
        include: {
          agendamentos: {
            include: {
              servico: true,
              profissional: true
            },
            orderBy: { dataHora: 'desc' }
          }
        }
      });
      if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado.' });
      return res.json(cliente);
    } catch (erro) {
      return res.status(500).json({ erro: 'Erro ao buscar cliente.' });
    }
  },

  // Criar novo cliente
  async criar(req, res) {
    try {
      const { nome, sobrenome, telefone, email, notas, empresaId } = req.body;
      const novoCliente = await prisma.cliente.create({
        data: { nome, sobrenome, telefone, email, notas, empresaId }
      });
      return res.status(201).json(novoCliente);
    } catch (erro) {
      return res.status(500).json({ erro: 'Erro ao criar cliente.' });
    }
  },

  // Atualizar cliente
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;
      const clienteAtualizado = await prisma.cliente.update({
        where: { id },
        data: dados
      });
      return res.json(clienteAtualizado);
    } catch (erro) {
      return res.status(500).json({ erro: 'Erro ao atualizar cliente.' });
    }
  },

  // Excluir cliente
  async excluir(req, res) {
    try {
      const { id } = req.params;
      
      // Antes de excluir o cliente, precisamos saber que o Prisma vai lidar com a integridade referencial.
      // De acordo com o schema, agendamentos NÃO têm onDelete: Cascade para clientes por padrão.
      // Se houver agendamentos, a exclusão pode falhar.
      // Vou primeiro deletar os agendamentos vinculados ou deixar que o erro aconteça se preferido.
      // Mas para uma experiência "limpa", vou remover os agendamentos dele primeiro.
      
      await prisma.agendamento.deleteMany({ where: { clienteId: id } });
      await prisma.cliente.delete({ where: { id } });
      
      return res.json({ mensagem: 'Cliente e histórico removidos com sucesso.' });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao excluir cliente. Verifique se ele possui registros vinculados.' });
    }
  }
};

module.exports = ClienteControlador;
