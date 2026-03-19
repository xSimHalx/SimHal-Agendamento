const { PrismaClient } = require('@prisma/client');
const { format, addMinutes, startOfDay, endOfDay, eachDayOfInterval, startOfMonth, endOfMonth, isBefore, getDay, isAfter, setHours, setMinutes } = require('date-fns');
const { registrarLog } = require('../utilitarios/auditoria');
const prisma = new PrismaClient();
const WhatsApp = require('../utilitarios/WhatsApp');
const WhatsAppService = require('../servicos/WhatsAppService');
const NotificacaoControlador = require('./NotificacaoControlador');

const AgendamentoControlador = {
  // Criar um novo agendamento (Fluxo do Cliente)
  async criar(req, res) {
    try {
      const {
        dataHora, // Alterado de dataHorario
        empresaId,
        profissionalId,
        servicoId,
        cliente, // { nome, sobrenome, telefone }
        adicionaisIds,
        respostasExtras
      } = req.body;

      // -- VERIFICAÇÃO DE LIMITES POR PLANO --
      const { obterConfigPlano } = require('../utilitarios/PlanosConfig');
      const empresa = await prisma.empresa.findUnique({
        where: { id: empresaId },
        select: { plano: true }
      });
      const configPlano = obterConfigPlano(empresa?.plano);

      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const totalNoMes = await prisma.agendamento.count({
        where: {
          empresaId,
          dataHora: { gte: inicioMes },
          status: { not: 'CANCELADO' }
        }
      });

      if (totalNoMes >= configPlano.maxAgendamentosMes) {
        return res.status(403).json({
          erro: `Limite Mensal Atingido`,
          detalhe: `Seu plano (${configPlano.nome}) permite apenas ${configPlano.maxAgendamentosMes} agendamentos por mês. Faça um upgrade para continuar recebendo reservas.`
        });
      }
      // ----------------------------------------

      // 1. Buscar ou criar o cliente pelo telefone (limitado à empresa)
      let clienteDb = await prisma.cliente.findFirst({
        where: { telefone: cliente.telefone, empresaId }
      });

      if (!clienteDb) {
        clienteDb = await prisma.cliente.create({
          data: {
            nome: cliente.nome,
            sobrenome: cliente.sobrenome,
            telefone: cliente.telefone,
            empresaId
          }
        });
      }

      // 2. Buscar o serviço e adicionais para calcular o valor real
      const servico = await prisma.servico.findUnique({ where: { id: servicoId } });
      if (!servico) return res.status(404).json({ erro: 'Serviço não encontrado.' });

      const adicionaisNoBanco = await prisma.adicional.findMany({
        where: { id: { in: adicionaisIds || [] } }
      });

      const somaAdicionais = adicionaisNoBanco.reduce((acc, ad) => acc + ad.preco, 0);
      const valorFinal = servico.preco + somaAdicionais;

      // 3. Criar o agendamento
      const dataHoraObj = new Date(dataHora);

      // -- NOVA VALIDAÇÃO DE CAPACIDADE --
      const duracaoTotal = servico.duracao + (servico.tempoBuffer || 0);
      const dataFim = new Date(dataHoraObj.getTime() + duracaoTotal * 60000);

      const agendamentosNoIntervalo = await prisma.agendamento.findMany({
        where: {
          profissionalId,
          status: { notIn: ['CANCELADO', 'NOSHOW'] },
          dataHora: {
            lt: dataFim,
          }
        },
        include: { servico: true }
      });

      const conflitos = agendamentosNoIntervalo.filter(ag => {
        const agIni = new Date(ag.dataHora);
        const agFim = new Date(agIni.getTime() + (ag.servico.duracao + (ag.servico.tempoBuffer || 0)) * 60000);
        return dataHoraObj < agFim && dataFim > agIni;
      });

      if (conflitos.length >= (servico.capacidadeMaxima || 1)) {
        return res.status(400).json({ 
          erro: 'Vagas Esgotadas', 
          detalhe: 'Este horário já atingiu o limite máximo de clientes para este serviço.' 
        });
      }
      // ---------------------------------
      const novoAgendamento = await prisma.agendamento.create({
        data: {
          dataHora: dataHoraObj,
          empresaId,
          profissionalId,
          servicoId,
          clienteId: clienteDb.id,
          valorTotal: valorFinal,
          status: 'PENDENTE',
          respostasExtras: respostasExtras || {},
          adicionais: {
            connect: adicionaisIds?.map(id => ({ id })) || []
          }
        },
        include: {
          profissional: true,
          servico: true,
          cliente: true,
          adicionais: true
        }
      });

      const novoAgendamentoCompleto = await prisma.agendamento.findUnique({
        where: { id: novoAgendamento.id },
        include: { 
          cliente: true, 
          servico: true, 
          profissional: true, 
          empresa: true 
        }
      });

      // 4. Disparar Avisos (WhatsApp)
      WhatsApp.notificarDonoNovaReserva(novoAgendamentoCompleto).catch(e => console.error("Erro whats dono:", e));
      const linkCliente = WhatsApp.gerarLinkConfirmacaoCliente(novoAgendamentoCompleto);

      // NOVO: Disparo Automático via API (Evolution API)
      WhatsAppService.enviarConfirmacaoAgendamento(novoAgendamentoCompleto, novoAgendamentoCompleto.empresa)
        .catch(e => console.error("Erro no envio automático WhatsApp:", e));

      // 5. Criar Notificação no Sistema (Sino)
      NotificacaoControlador.criar(
        empresaId, 
        'Novo Agendamento 🛎️', 
        `${cliente.nome} agendou ${servico.nome} para ${format(dataHoraObj, "dd/MM 'às' HH:mm", { locale: require('date-fns/locale').ptBR })}`,
        'SUCCESS'
      ).catch(e => console.error("Erro ao criar notificação sino:", e));

      // Log de Auditoria
      registrarLog(empresaId, cliente.nome, `Realizou um novo agendamento para ${novoAgendamento.dataHora.toLocaleString('pt-BR')}`, 'INFO');

      return res.status(201).json({ 
        mensagem: 'Agendamento criado com sucesso!', 
        agendamento: novoAgendamentoCompleto,
        linkWhatsApp: linkCliente
      });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Falha ao processar agendamento.' });
    }
  },

  // Listar agendamentos para o Admin
  async listarPorEmpresa(req, res) {
    try {
      const { empresaId } = req.params;
      const agendamentos = await prisma.agendamento.findMany({
        where: { empresaId },
        include: {
          profissional: true,
          servico: true,
          cliente: true,
          adicionais: true
        },
        orderBy: { dataHora: 'asc' }
      });
      return res.json(agendamentos);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao carregar agendamentos.' });
    }
  },

  // Listar agendamentos de um dia específico (Para a Grade do Admin)
  async listarPorDia(req, res) {
    try {
      const { empresaId } = req.params;
      const { data } = req.query; // YYYY-MM-DD

      if (!data) return res.status(400).json({ erro: 'Data é obrigatória.' });

      // Ajuste para pegar o dia inteiro independente do fuso
      const inicioDia = new Date(data + 'T00:00:00');
      const fimDia = new Date(data + 'T23:59:59');

      const agendamentos = await prisma.agendamento.findMany({
        where: {
          empresaId,
          dataHora: {
            gte: inicioDia,
            lte: fimDia
          }
        },
        include: {
          profissional: true,
          servico: true,
          cliente: true,
          adicionais: true
        },
        orderBy: { dataHora: 'asc' }
      });

      return res.json(agendamentos);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao carregar agendamentos do dia.' });
    }
  },

  // Atualizar status do agendamento
  async atualizarStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Se o status for CONCLUIDO, cria uma transação de ENTRADA automática
      if (status === 'CONCLUIDO') {
        // Verificar se já existe transação para evitar duplicidade
        const transacaoExistente = await prisma.transacao.findUnique({
          where: { agendamentoId: id }
        });

        if (!transacaoExistente) {
          const agendamento = await prisma.agendamento.findUnique({
            where: { id },
            include: { cliente: true, servico: true }
          });

          await prisma.transacao.create({
            data: {
              empresaId: agendamento.empresaId,
              agendamentoId: id,
              tipo: 'ENTRADA',
              categoria: 'Serviço',
              descricao: `Agendamento: ${agendamento.servico.nome} - Cliente: ${agendamento.cliente.nome}`,
              valor: agendamento.valorTotal,
              responsavelId: agendamento.profissionalId,
              data: new Date()
            }
          });
        }
      }

      const agendamentoAtualizado = await prisma.agendamento.update({
        where: { id },
        data: { status },
        include: {
          cliente: true,
          servico: true,
          profissional: true,
          adicionais: true
        }
      });

      if (status === 'CANCELADO' && agendamentoAtualizado) {
        registrarLog(agendamentoAtualizado.empresaId, 'Painel Admin', `Cancelou agendamento de ${agendamentoAtualizado.cliente.nome} do dia ${agendamentoAtualizado.dataHora.toLocaleString('pt-BR')}`, 'WARNING');
      }

      return res.json(agendamentoAtualizado);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao atualizar status do agendamento.' });
    }
  },
  // BUSCAR HORÁRIOS DISPONÍVEIS (Lógica de Disponibilidade Avançada)
  async buscarDisponibilidade(req, res) {
    try {
      const { profissionalId, data, servicoId } = req.query;

      if (!profissionalId || !data || !servicoId) {
        return res.status(400).json({ erro: 'profissionalId, data e servicoId são obrigatórios.' });
      }

      // 1. Buscar profissional, serviço e empresa (com horários de funcionamento)
      const profissional = await prisma.usuario.findUnique({
        where: { id: profissionalId },
        include: { empresa: true }
      });
      const servico = await prisma.servico.findUnique({ where: { id: servicoId } });

      if (!profissional || !servico) {
        return res.status(404).json({ erro: 'Profissional ou serviço não encontrado.' });
      }

      const { empresa } = profissional;
      // Ajuste para evitar deslocamento de fuso horário ao criar o objeto Date
      const [ano, mes, dia] = data.split('-').map(Number);
      const dataObj = new Date(ano, mes - 1, dia); // Criado no fuso local

      const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
      const diaNome = diasSemana[dataObj.getDay()];

      // 2. Horários de Funcionamento da Loja (Restritivo: se não tem, está FECHADO)
      let expLoja = empresa.horarioFuncionamento?.[diaNome];
      
      if (!expLoja || !Array.isArray(expLoja) || expLoja.length < 2) {
        return res.json([]); // Loja fechada por padrão se não configurada
      }

      // 3. Horários de Trabalho do Profissional (Fallback: Segue a loja)
      let turnosProf = profissional.horariosDeTrabalho?.[diaNome];

      if (!turnosProf || (Array.isArray(turnosProf) && turnosProf.length === 0)) {
        // Se profissional não tem horário definido, assume que ele trabalha o horário da loja
        turnosProf = [expLoja];
      }

      // Normalizar para array de arrays se for o formato antigo ["09:00", "18:00"]
      if (typeof turnosProf[0] === 'string') {
        turnosProf = [turnosProf];
      }

      // 4. Buscar agendamentos e bloqueios existentes para o dia (Fixo no fuso local)
      const inicioDia = new Date(ano, mes - 1, dia, 0, 0, 0, 0);
      const fimDia = new Date(ano, mes - 1, dia, 23, 59, 59, 999);

      const agendamentos = await prisma.agendamento.findMany({
        where: {
          profissionalId,
          dataHora: { gte: inicioDia, lte: fimDia },
          status: { not: 'CANCELADO' }
        },
        include: { servico: true }
      });

      const bloqueios = await prisma.bloqueioAgenda.findMany({
        where: {
          empresaId: empresa.id,
          OR: [
            { profissionalId: null }, // Bloqueio global da loja
            { profissionalId: profissionalId }
          ],
          inicio: { lte: fimDia },
          fim: { gte: inicioDia }
        }
      });

      const slots = [];
      const duracaoServico = servico.duracao;
      const bufferServico = servico.tempoBuffer || 0;
      const capacidadeMaxima = servico.capacidadeMaxima || 1;
      const agora = new Date();
      // Data completa para os horários (usando a mesma referência de ano/mes/dia)
      const dataBase = new Date(ano, mes - 1, dia);

      // Loop por cada turno do profissional
      for (const turno of turnosProf) {
        if (!Array.isArray(turno) || turno.length < 2) continue;

        let [hAtual, mAtual] = turno[0].split(':').map(Number);
        const [hFim, mFim] = turno[1].split(':').map(Number);

        while (hAtual < hFim || (hAtual === hFim && mAtual < mFim)) {
          const slotInicio = new Date(dataBase);
          slotInicio.setHours(hAtual, mAtual, 0, 0);

          const slotFim = new Date(slotInicio);
          slotFim.setMinutes(slotInicio.getMinutes() + duracaoServico + bufferServico);

          const slotHoraTexto = `${String(hAtual).padStart(2, '0')}:${String(mAtual).padStart(2, '0')}`;

          let estaLivre = true;

          // Validações do Slot:

          // A. Está dentro do horário da loja?
          const [hLojaIni, mLojaIni] = expLoja[0].split(':').map(Number);
          const [hLojaFim, mLojaFim] = expLoja[1].split(':').map(Number);
          const lojaInicio = new Date(dataBase); lojaInicio.setHours(hLojaIni, mLojaIni, 0, 0);
          const lojaFim = new Date(dataBase); lojaFim.setHours(hLojaFim, mLojaFim, 0, 0);

          const dentroLoja = slotInicio >= lojaInicio && slotFim <= lojaFim;
          if (!dentroLoja) estaLivre = false;

          // B. Conflita com agendamento?
          const conflitosAg = agendamentos.filter(ag => {
            const agIni = new Date(ag.dataHora);
            const agFim = new Date(agIni);
            agFim.setMinutes(agIni.getMinutes() + ag.servico.duracao + (ag.servico.tempoBuffer || 0));
            return slotInicio < agFim && slotFim > agIni;
          });

          if (conflitosAg.length >= capacidadeMaxima) estaLivre = false;

          // C. Conflita com bloqueio?
          const conflitoBlock = bloqueios.some(bl => {
            const blInicio = new Date(bl.inicio);
            const blFim = new Date(bl.fim);

            if (bl.recorrente) {
              // Se é recorrente, verificamos se o dia da semana bate
              // e se o horário atual do slot intercepta o horário do bloqueio
              if (blInicio.getDay() !== dataObj.getDay()) return false;

              // Criamos datas temporárias para o dia que estamos checando 
              // apenas para comparar o horário (H:m)
              const checkIni = new Date(dataBase); checkIni.setHours(blInicio.getHours(), blInicio.getMinutes(), 0, 0);
              const checkFim = new Date(dataBase); checkFim.setHours(blFim.getHours(), blFim.getMinutes(), 0, 0);

              return slotInicio < checkFim && slotFim > checkIni;
            }

            // Bloqueio em data única
            return slotInicio < blFim && slotFim > blInicio;
          });

          // D. Termina antes do fim do turno atual do profissional?
          const turnoFimDate = new Date(dataBase);
          turnoFimDate.setHours(hFim, mFim, 0, 0);
          const dentroTurno = slotFim <= turnoFimDate;

          // E. Validação final
          if (slotInicio > agora && dentroLoja && dentroTurno && !conflitoBlock && conflitosAg.length < capacidadeMaxima) {
            const vagasOcupadas = conflitosAg.length;
            const vagasRestantes = Math.max(0, capacidadeMaxima - vagasOcupadas);

            slots.push({
              inicio: slotHoraTexto,
              fim: format(slotFim, 'HH:mm'),
              vagasRestantes: capacidadeMaxima > 1 ? vagasRestantes : undefined,
              capacidadeTotal: capacidadeMaxima > 1 ? capacidadeMaxima : undefined
            });
          }

          // Avança 30 minutos para o próximo slot
          mAtual += 30;
          if (mAtual >= 60) {
            hAtual += 1;
            mAtual = 0;
          }
        }
      }

      return res.json(slots);
    } catch (erro) {
      console.error("Erro na disponibilidade:", erro);
      return res.status(500).json({ erro: 'Erro ao calcular disponibilidade.' });
    }
  },

  // BUSCAR DISPONIBILIDADE MENSAL (Novo Endpoint para o Calendário)
  async buscarDisponibilidadeMensal(req, res) {
    try {
      const { profissionalId, servicoId, mes } = req.query; // Formato esperado: YYYY-MM

      if (!profissionalId || !servicoId || !mes) {
        return res.status(400).json({ erro: 'profissionalId, servicoId e mes sao obrigatorios.' });
      }

      const profissional = await prisma.usuario.findUnique({
        where: { id: profissionalId },
        include: { empresa: true }
      });
      const servico = await prisma.servico.findUnique({ where: { id: servicoId } });

      if (!profissional || !servico) {
        return res.status(404).json({ erro: 'Nao encontrado.' });
      }

      const { empresa } = profissional;
      const duracaoServico = servico.duracao;
      const bufferServico = servico.tempoBuffer || 0;

      const [anoStr, mesStr] = mes.split('-');
      const ano = Number(anoStr);
      const mesNum = Number(mesStr) - 1;

      // Início e Fim do mês (Fuso local)
      const inicioMes = new Date(ano, mesNum, 1, 0, 0, 0, 0);
      const fimMes = new Date(ano, mesNum + 1, 0, 23, 59, 59, 999);
      const diasNoMes = fimMes.getDate();

      const agendamentos = await prisma.agendamento.findMany({
        where: {
          profissionalId,
          status: { not: 'CANCELADO' },
          dataHora: { gte: inicioMes, lte: fimMes }
        },
        include: { servico: true }
      });

      const bloqueios = await prisma.bloqueioAgenda.findMany({
        where: {
          empresaId: empresa.id,
          OR: [{ profissionalId: null }, { profissionalId }],
          inicio: { lte: fimMes },
          fim: { gte: inicioMes }
        }
      });

      const disponibilidade = {};
      const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

      const agora = new Date();
      const hojeStr = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;

      for (let d = 1; d <= diasNoMes; d++) {
        const dataStr = `${ano}-${String(mesNum + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const checkData = new Date(ano, mesNum, d);

        if (dataStr < hojeStr) {
          disponibilidade[dataStr] = 'fechado';
          continue;
        }

        const diaNome = diasSemana[checkData.getDay()];

        let expLoja = empresa.horarioFuncionamento?.[diaNome];
        
        if (!expLoja || !Array.isArray(expLoja) || expLoja.length < 2) {
          disponibilidade[dataStr] = 'fechado';
          continue;
        }

        let turnosProf = profissional.horariosDeTrabalho?.[diaNome];
        if (!turnosProf || (Array.isArray(turnosProf) && turnosProf.length === 0)) {
          turnosProf = [expLoja];
        }
        if (typeof turnosProf[0] === 'string') turnosProf = [turnosProf];

        let slotsLivres = 0;

        for (const turno of turnosProf) {
          if (!Array.isArray(turno) || turno.length < 2) continue;
          let [hAtual, mAtual] = turno[0].split(':').map(Number);
          const [hFim, mFim] = turno[1].split(':').map(Number);

          while (hAtual < hFim || (hAtual === hFim && mAtual < mFim)) {
            const slotInicio = new Date(ano, mesNum, d, hAtual, mAtual, 0, 0);

            const slotFim = new Date(slotInicio);
            slotFim.setMinutes(slotFim.getMinutes() + duracaoServico + bufferServico);

            const [hLojaIni, mLojaIni] = expLoja[0].split(':').map(Number);
            const [hLojaFim, mLojaFim] = expLoja[1].split(':').map(Number);
            const lojaInicio = new Date(ano, mesNum, d, hLojaIni, mLojaIni, 0, 0);
            const lojaFim = new Date(ano, mesNum, d, hLojaFim, mLojaFim, 0, 0);

            const dentroLoja = slotInicio >= lojaInicio && slotFim <= lojaFim;

            // Lógica de Vagas (Suporte a Coletivos)
            const conflitosApt = agendamentos.filter(ag => {
              const agIni = new Date(ag.dataHora);
              const agFim = new Date(agIni);
              agFim.setMinutes(agIni.getMinutes() + ag.servico.duracao + (ag.servico.tempoBuffer || 0));
              return slotInicio < agFim && slotFim > agIni;
            });

            const temVaga = conflitosApt.length < (servico.capacidadeMaxima || 1);

            const conflitoBlock = bloqueios.some(bl => {
              const blInicio = new Date(bl.inicio);
              const blFim = new Date(bl.fim);
              if (bl.recorrente) {
                if (blInicio.getDay() !== checkData.getDay()) return false;
                const checkIni = new Date(ano, mesNum, d, blInicio.getHours(), blInicio.getMinutes(), 0, 0);
                const checkFim = new Date(ano, mesNum, d, blFim.getHours(), blFim.getMinutes(), 0, 0);
                return slotInicio < checkFim && slotFim > checkIni;
              }
              return slotInicio < blFim && slotFim > blInicio;
            });

            const turnoFimDate = new Date(ano, mesNum, d, hFim, mFim, 0, 0);
            const dentroTurno = slotFim <= turnoFimDate;

            if (slotInicio > agora && dentroLoja && dentroTurno && !conflitoBlock && temVaga) {
              slotsLivres++;
              break; // Se achou um slot livre no turno, o dia já é "disponivel"
            }

            mAtual += 30;
            if (mAtual >= 60) {
              hAtual += 1;
              mAtual = 0;
            }
          }
          if (slotsLivres > 0) break;
        }

        if (slotsLivres > 0) {
          disponibilidade[dataStr] = 'disponivel';
        } else {
          disponibilidade[dataStr] = 'lotado';
        }
      }

      return res.json(disponibilidade);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao calcular disponibilidade mensal' });
    }
  }
};

module.exports = AgendamentoControlador;
