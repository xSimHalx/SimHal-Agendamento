import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Check, Loader2, Plus, Info, MessageSquare, XCircle, CheckCircle2, Phone, Clock, User, Calendar as CalendarIcon, 
  ChevronRight, ChevronLeft, MoreVertical, AlertCircle
} from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ModalNovoAgendamento from '../Modais/ModalNovoAgendamento';

const CORES_STATUS = {
  PENDENTE: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMADO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CONCLUIDO: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  CANCELADO: 'bg-slate-100 text-slate-500 border-slate-200',
};

const HORAS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
];

export default function VisaoAgenda({ empresaId, profissionalId }) {
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [agendamentos, setAgendamentos] = useState([]);
  const [bloqueios, setBloqueios] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [agendamentoAtivo, setAgendamentoAtivo] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [dataAberturaModal, setDataAberturaModal] = useState(null);
  const [profissionalAberturaModal, setProfissionalAberturaModal] = useState(null);
  const [visao, setVisao] = useState('dia'); // 'dia' ou 'mes'

  const carregarDados = useCallback(async () => {
    if (!empresaId) return;
    setCarregando(true);
    try {
      const [resP, resA, resB] = await Promise.all([
        axios.get(`http://localhost:3001/api/negocio/profissionais/${empresaId}`),
        axios.get(`http://localhost:3001/api/negocio/agendamentos/dia/${empresaId}?data=${format(dataSelecionada, 'yyyy-MM-dd')}`),
        axios.get(`http://localhost:3001/api/negocio/bloqueios/${empresaId}`)
      ]);

      let listaPros = resP.data;
      if (profissionalId) {
        listaPros = listaPros.filter(p => p.id === profissionalId);
      }

      setProfissionais(listaPros);
      setAgendamentos(resA.data);
      setBloqueios(resB.data);
    } catch (erro) {
      console.error("Erro na agenda:", erro);
    } finally {
      setCarregando(false);
    }
  }, [empresaId, dataSelecionada, profissionalId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const abrirModalComDados = (hora, profissional) => {
    const [h, m] = hora.split(':');
    const novaData = new Date(dataSelecionada);
    novaData.setHours(parseInt(h), parseInt(m), 0, 0);
    
    setDataAberturaModal(novaData);
    setProfissionalAberturaModal(profissional);
    setModalAberto(true);
  };

  const mudarStatus = async (id, novoStatus) => {
    try {
      const res = await axios.put(`http://localhost:3001/api/negocio/agendamentos/status/${id}`, { status: novoStatus });
      setAgendamentos(agendamentos.map(a => a.id === id ? res.data : a));
      if (agendamentoAtivo?.id === id) setAgendamentoAtivo(res.data);
    } catch (erro) {
      alert("Erro ao mudar status");
    }
  };

  const excluirBloqueio = async (id) => {
    if (!window.confirm("Deseja remover este bloqueio e liberar o horário?")) return;
    try {
      await axios.delete(`http://localhost:3001/api/negocio/bloqueios/${id}`);
      carregarDados();
    } catch (erro) {
      alert("Erro ao excluir bloqueio.");
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500">
      {/* Controles do Topo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button 
              onClick={() => setDataSelecionada(subDays(dataSelecionada, 1))}
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
            <div className="px-4 flex items-center gap-2">
              <CalendarIcon size={18} className="text-indigo-600" />
              <span className="font-bold text-slate-800 min-w-[140px] text-center">
                {format(dataSelecionada, "dd 'de' MMMM", { locale: ptBR })}
              </span>
            </div>
            <button 
              onClick={() => setDataSelecionada(addDays(dataSelecionada, 1))}
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"
            >
              <ChevronRight size={20} className="text-slate-600" />
            </button>
          </div>
          <button 
            onClick={() => setDataSelecionada(new Date())}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            Hoje
          </button>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button 
             onClick={() => setVisao('dia')}
             className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${visao === 'dia' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Dia
           </button>
           <button 
             onClick={() => setVisao('mes')}
             className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${visao === 'mes' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Mês
           </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            {carregando && <Loader2 size={16} className="animate-spin text-indigo-400" />}
            <p className="text-sm text-slate-500 font-medium whitespace-nowrap">
              {agendamentos.length} agendamentos
            </p>
          </div>
          <button 
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-black text-sm shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus size={18} /> Novo Agendamento
          </button>
        </div>
      </div>

      {modalAberto && (
        <ModalNovoAgendamento 
          empresaId={empresaId} 
          dataInicial={dataAberturaModal || dataSelecionada}
          profissionalInicial={profissionalAberturaModal}
          onClose={() => {
            setModalAberto(false);
            setDataAberturaModal(null);
            setProfissionalAberturaModal(null);
          }} 
          onSucesso={carregarDados}
        />
      )}

      {/* Conteúdo da Agenda */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {visao === 'dia' ? (
          <>
            {/* Cabeçalho de Profissionais */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              <div className="w-20 border-r border-slate-100 flex items-center justify-center">
                 <Clock size={16} className="text-slate-400" />
              </div>
              <div className="flex flex-1 overflow-x-auto scrollbar-hide">
                {profissionais.map(p => (
                  <div key={p.id} className="min-w-[200px] flex-1 border-r border-slate-100 p-3 text-center">
                    <p className="text-sm font-black text-slate-800">{p.nome}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{p.papel || 'Profissional'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Corpo da Agenda */}
            <div className="flex-1 overflow-y-auto relative">
              {HORAS.map(hora => (
                <div key={hora} className="flex border-b border-slate-50 min-h-[60px] group">
                  {/* Coluna de Hora */}
                  <div className="w-20 border-r border-slate-100 flex flex-col items-center justify-start py-2 bg-slate-50/30 group-hover:bg-slate-50 transition-colors">
                    <span className="text-[11px] font-black text-slate-400">{hora}</span>
                  </div>

                  {/* Colunas de Profissionais */}
                  <div className="flex flex-1 overflow-x-auto scrollbar-hide">
                     {profissionais.map(profissional => {
                       const agendamento = agendamentos.find(a => {
                         const horaAg = format(new Date(a.dataHora), 'HH:mm');
                         return a.profissionalId === profissional.id && horaAg === hora;
                       });

                       const bloqueio = bloqueios.find(bl => {
                         const blInicio = new Date(bl.inicio);
                         const blFim = new Date(bl.fim);
                         const [h, m] = hora.split(':');
                         const slotTime = new Date(dataSelecionada);
                         slotTime.setHours(parseInt(h), parseInt(m), 0, 0);

                         if (bl.recorrente) {
                            if (blInicio.getDay() !== dataSelecionada.getDay()) return false;
                            const checkIni = new Date(dataSelecionada); checkIni.setHours(blInicio.getHours(), blInicio.getMinutes(), 0, 0);
                            const checkFim = new Date(dataSelecionada); checkFim.setHours(blFim.getHours(), blFim.getMinutes(), 0, 0);
                            return slotTime >= checkIni && slotTime < checkFim && (bl.profissionalId === null || bl.profissionalId === profissional.id);
                         }

                         return slotTime >= blInicio && slotTime < blFim && (bl.profissionalId === null || bl.profissionalId === profissional.id);
                       });

                       return (
                         <div 
                            key={profissional.id} 
                            className="min-w-[200px] flex-1 border-r border-slate-100 relative p-1 hover:bg-slate-50/50 cursor-pointer transition-colors"
                            onClick={() => !agendamento && !bloqueio && abrirModalComDados(hora, profissional)}
                         >
                           {agendamento && (
                             <div 
                               onClick={(e) => { e.stopPropagation(); setAgendamentoAtivo(agendamento); }}
                               className={`absolute inset-1 rounded-xl border p-2 cursor-pointer shadow-sm transition-all hover:scale-[1.02] hover:shadow-md z-10 overflow-hidden ${CORES_STATUS[agendamento.status] || 'bg-slate-100'}`}
                             >
                               <div className="flex items-start justify-between">
                                 <p className="text-xs font-black truncate">{agendamento.cliente.nome}</p>
                                 <Info size={12} className="opacity-40" />
                               </div>
                               <p className="text-[10px] opacity-70 truncate font-bold">{agendamento.servico.nome}</p>
                               <div className="mt-1 flex gap-1">
                                  <div className={`w-1.5 h-1.5 rounded-full ${agendamento.status === 'CONCLUIDO' ? 'bg-indigo-400' : 'bg-current opacity-40'}`}></div>
                               </div>
                             </div>
                           )}

                           {bloqueio && !agendamento && (
                             <div 
                               onClick={(e) => { e.stopPropagation(); excluirBloqueio(bloqueio.id); }}
                               className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#f8fafc,#f8fafc_10px,#fef2f2_10px,#fef2f2_20px)] border border-rose-100/50 opacity-80 flex items-center justify-center p-2 cursor-pointer hover:opacity-100 transition-all group"
                               title="Clique para remover bloqueio"
                             >
                               <div className="flex flex-col items-center">
                                  <XCircle size={14} className="text-rose-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest text-center">{bloqueio.motivo || 'Indisponível'}</span>
                               </div>
                             </div>
                           )}
                         </div>
                       );
                     })}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <VisaoMensal 
            dataSelecionada={dataSelecionada} 
            setDataSelecionada={setDataSelecionada} 
            setVisao={setVisao}
            agendamentos={agendamentos}
            bloqueios={bloqueios}
          />
        )}
      </div>

      {/* Drawer Lateral de Detalhes */}
      {agendamentoAtivo && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" 
            onClick={() => setAgendamentoAtivo(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 animate-in slide-in-from-right duration-300 border-l border-slate-100 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-800">Detalhes do Agendamento</h3>
              <button onClick={() => setAgendamentoAtivo(null)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm border border-slate-100">
                <XCircle size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-100">
                  {agendamentoAtivo.cliente.nome.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-black text-slate-800">{agendamentoAtivo.cliente.nome} {agendamentoAtivo.cliente.sobrenome}</p>
                  <p className="text-sm text-slate-500 flex items-center gap-1 font-medium">
                    <Phone size={14} /> {agendamentoAtivo.cliente.telefone}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Clock size={18} /></div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Horário e Duração</p>
                    <p className="text-sm font-bold text-slate-800">
                      {format(new Date(agendamentoAtivo.dataHora), 'HH:mm')} • {agendamentoAtivo.servico.duracao} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Info size={18} /></div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Serviço</p>
                    <p className="text-sm font-bold text-slate-800">{agendamentoAtivo.servico.nome}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><User size={18} /></div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Profissional</p>
                    <p className="text-sm font-bold text-slate-800">{agendamentoAtivo.profissional.nome}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-4">Gerenciar Status</p>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => mudarStatus(agendamentoAtivo.id, 'CONFIRMADO')}
                    className={`flex items-center justify-between p-3 rounded-xl border font-bold text-sm transition-all ${agendamentoAtivo.status === 'CONFIRMADO' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'}`}
                  >
                    <span>Confirmar Presença</span>
                    {agendamentoAtivo.status === 'CONFIRMADO' && <Check size={18} />}
                  </button>
                  <button 
                    onClick={() => mudarStatus(agendamentoAtivo.id, 'CONCLUIDO')}
                    className={`flex items-center justify-between p-3 rounded-xl border font-bold text-sm transition-all ${agendamentoAtivo.status === 'CONCLUIDO' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'}`}
                  >
                    <span>Finalizar Atendimento</span>
                    {agendamentoAtivo.status === 'CONCLUIDO' && <Check size={18} />}
                  </button>
                  <button 
                    onClick={() => mudarStatus(agendamentoAtivo.id, 'CANCELADO')}
                    className={`flex items-center justify-between p-3 rounded-xl border font-bold text-sm transition-all ${agendamentoAtivo.status === 'CANCELADO' ? 'bg-red-600 text-white border-red-600' : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'}`}
                  >
                    <span>Cancelar Horário</span>
                    {agendamentoAtivo.status === 'CANCELADO' && <Check size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
               <button className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-black shadow-lg shadow-emerald-100 transition-all active:scale-95">
                  <MessageSquare size={20} /> Conversar no WhatsApp
               </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function VisaoMensal({ dataSelecionada, setDataSelecionada, setVisao, agendamentos, bloqueios }) {
  const startMonth = new Date(dataSelecionada.getFullYear(), dataSelecionada.getMonth(), 1);
  const endMonth = new Date(dataSelecionada.getFullYear(), dataSelecionada.getMonth() + 1, 0);
  
  const startGrid = subDays(startMonth, startMonth.getDay());
  const days = [];
  let curr = startGrid;

  while(curr <= endMonth || days.length % 7 !== 0) {
    days.push(new Date(curr));
    curr = addDays(curr, 1);
  }

  const DIAS_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-300">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {DIAS_ABREV.map(d => (
          <div key={d} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 last:border-0">
            {d}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
        {days.map((day, i) => {
          const isSelected = format(day, 'yyyy-MM-dd') === format(dataSelecionada, 'yyyy-MM-dd');
          const isOtherMonth = day.getMonth() !== dataSelecionada.getMonth();
          const diaAgendamentos = agendamentos.filter(a => format(new Date(a.dataHora), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
          const diaBloqueio = bloqueios.some(bl => {
            const blInicio = format(new Date(bl.inicio), 'yyyy-MM-dd');
            const blFim = format(new Date(bl.fim), 'yyyy-MM-dd');
            const dStr = format(day, 'yyyy-MM-dd');
            return dStr >= blInicio && dStr <= blFim;
          });

          return (
            <div 
              key={i} 
              onClick={() => { setDataSelecionada(day); setVisao('dia'); }}
              className={`min-h-[100px] border-r border-b border-slate-100 p-2 cursor-pointer transition-all hover:bg-slate-50 flex flex-col gap-1 relative ${isOtherMonth ? 'bg-slate-50/30' : ''} ${isSelected ? 'bg-indigo-50/30 ring-1 ring-inset ring-indigo-100' : ''}`}
            >
              <span className={`text-xs font-bold ${isOtherMonth ? 'text-slate-300' : isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>
                {day.getDate()}
              </span>
              
              <div className="space-y-1">
                {diaAgendamentos.slice(0, 3).map(a => (
                  <div key={a.id} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 truncate">
                    {format(new Date(a.dataHora), 'HH:mm')} {a.cliente.nome}
                  </div>
                ))}
                {diaAgendamentos.length > 3 && (
                  <span className="text-[8px] font-black text-slate-400 ml-1">+{diaAgendamentos.length - 3} mais</span>
                )}
              </div>

              {diaBloqueio && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-400 shadow-sm animate-pulse" title="Dia com bloqueios"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
