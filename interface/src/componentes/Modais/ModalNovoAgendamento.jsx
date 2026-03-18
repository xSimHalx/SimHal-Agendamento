import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  X, Calendar, Clock, User, Briefcase, 
  ChevronRight, ChevronLeft, Loader2, CheckCircle2,
  Check, Phone, ShoppingCart, BookOpen
} from 'lucide-react';
import { format } from 'date-fns';

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor) / 100);
};

const MOCK_DIAS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function ModalNovoAgendamento({ empresaId, onClose, onSucesso, dataInicial }) {
  const [etapa, setEtapa] = useState(1);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    cliente: { nome: '', sobrenome: '', telefone: '' },
    profissionalId: '',
    servicoId: '',
    data: dataInicial ? format(dataInicial, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    hora: '',
  });

  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [buscandoHorarios, setBuscandoHorarios] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [resP, resS] = await Promise.all([
          axios.get(`http://localhost:3001/api/negocio/profissionais/${empresaId}`),
          axios.get(`http://localhost:3001/api/negocio/servicos/${empresaId}`)
        ]);
        setProfissionais(resP.data);
        setServicos(resS.data.servicos || []);
      } catch (e) {
        console.error("Erro ao carregar dados do modal:", e);
      } finally {
        setCarregando(false);
      }
    };
    if (empresaId) carregarDados();
  }, [empresaId]);

  useEffect(() => {
    const carregarHorarios = async () => {
      if (!formData.profissionalId || !formData.servicoId || !formData.data) return;
      setBuscandoHorarios(true);
      try {
        const res = await axios.get(`http://localhost:3001/api/negocio/disponibilidade`, {
          params: {
            profissionalId: formData.profissionalId,
            servicoId: formData.servicoId,
            data: formData.data
          }
        });
        setHorariosDisponiveis(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setBuscandoHorarios(false);
      }
    };
    carregarHorarios();
  }, [formData.profissionalId, formData.servicoId, formData.data]);

  const handleSubmit = async () => {
    try {
      setCarregando(true);
      const dataHora = new Date(`${formData.data}T${formData.hora}:00`);
      
      await axios.post('http://localhost:3001/api/negocio/agendamentos', {
        ...formData,
        dataHora,
        empresaId
      });
      
      setEtapa(6); // Sucesso
      setTimeout(() => {
        onSucesso();
        onClose();
      }, 2500);
    } catch (e) {
      alert("Erro ao criar agendamento");
    } finally {
      setCarregando(false);
    }
  };

  const profissionalSelecionado = profissionais.find(p => p.id === formData.profissionalId);
  const servicoSelecionado = servicos.find(s => s.id === formData.servicoId);

  // Renderizar Paineis (Estilo AgendamentoCliente)
  const renderizarPainelEsquerdo = () => {
    const infoEtapa = {
      1: { icone: User, titulo: 'Cliente', desc: 'Dados básicos para identificação.' },
      2: { icone: Briefcase, titulo: 'Profissional', desc: 'Quem realizará o atendimento?' },
      3: { icone: BookOpen, titulo: 'Serviço', desc: 'O que será realizado?' },
      4: { icone: Calendar, titulo: 'Data e Hora', desc: 'Escolha o melhor momento.' },
      5: { icone: Check, titulo: 'Confirmação', desc: 'Revise os dados antes de salvar.' },
      6: { icone: CheckCircle2, titulo: 'Salvo!', desc: 'Agendamento registrado.' }
    }[etapa];

    const Icone = infoEtapa.icone;

    return (
      <div className="hidden md:flex w-[240px] bg-slate-50 p-6 flex-col items-center text-center border-r border-slate-100">
        <div className="flex gap-1.5 mb-8">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className={`w-1.5 h-1.5 rounded-full transition-all ${s <= etapa ? 'bg-indigo-600 scale-125' : 'bg-slate-200'}`} />
          ))}
        </div>
        <div className="flex flex-col items-center flex-1 justify-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 mb-4 border border-slate-100">
            <Icone size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-black text-slate-800 mb-2">{infoEtapa.titulo}</h2>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">{infoEtapa.desc}</p>
        </div>
      </div>
    );
  };

  const renderizarResumoDireito = () => (
    <div className="hidden lg:flex w-[240px] bg-slate-50 border-l border-slate-100 flex-col p-6">
      <h3 className="text-[10px] tracking-[0.2em] font-black text-slate-400 uppercase mb-6">Resumo</h3>
      <div className="space-y-4 flex-1">
        {formData.cliente.nome && (
          <div className="animate-in fade-in slide-in-from-right-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Cliente</p>
            <p className="text-sm font-bold text-slate-800 truncate">{formData.cliente.nome} {formData.cliente.sobrenome}</p>
          </div>
        )}
        {profissionalSelecionado && (
          <div className="animate-in fade-in slide-in-from-right-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Profissional</p>
            <p className="text-sm font-bold text-slate-800">{profissionalSelecionado.nome}</p>
          </div>
        )}
        {servicoSelecionado && (
          <div className="animate-in fade-in slide-in-from-right-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Serviço</p>
            <p className="text-sm font-bold text-slate-800">{servicoSelecionado.nome}</p>
          </div>
        )}
        {formData.hora && (
          <div className="animate-in fade-in slide-in-from-right-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Horário</p>
            <p className="text-sm font-bold text-slate-800">{format(new Date(formData.data + 'T00:00:00'), 'dd/MM')} às {formData.hora}</p>
          </div>
        )}
      </div>
      <div className="pt-4 border-t border-slate-200 mt-auto">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Valor Total</p>
        <p className="text-xl font-black text-indigo-600">{formatarMoeda(servicoSelecionado?.preco || 0)}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl h-[600px] rounded-[2rem] shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-300">
        {renderizarPainelEsquerdo()}

        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Header Interno */}
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
            <div>
               <h2 className="text-xl font-black text-slate-800">
                {etapa === 1 && "Dados do Cliente"}
                {etapa === 2 && "Escolha o Profissional"}
                {etapa === 3 && "Selecione o Serviço"}
                {etapa === 4 && "Data e Horário"}
                {etapa === 5 && "Finalizar Agendamento"}
                {etapa === 6 && "Sucesso!"}
               </h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Passo {etapa} de 5</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Conteúdo Central */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {etapa === 1 && (
              <div className="max-w-md mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nome</label>
                    <input 
                      autoFocus
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      value={formData.cliente.nome}
                      onChange={e => setFormData({...formData, cliente: {...formData.cliente, nome: e.target.value}})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Sobrenome</label>
                    <input 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      value={formData.cliente.sobrenome}
                      onChange={e => setFormData({...formData, cliente: {...formData.cliente, sobrenome: e.target.value}})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">WhatsApp</label>
                  <input 
                    placeholder="(00) 00000-0000"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    value={formData.cliente.telefone}
                    onChange={e => setFormData({...formData, cliente: {...formData.cliente, telefone: e.target.value}})}
                  />
                </div>
              </div>
            )}

            {etapa === 2 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4">
                {profissionais.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setFormData({...formData, profissionalId: p.id}); setEtapa(3); }}
                    className={`group flex flex-col items-center p-6 rounded-[2rem] border-2 transition-all ${formData.profissionalId === p.id ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100' : 'border-slate-50 bg-slate-50/50 hover:border-indigo-200 hover:bg-white'}`}
                  >
                    <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-md mb-4 overflow-hidden group-hover:scale-110 transition-transform">
                       <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-black text-2xl">
                        {p.nome.charAt(0)}
                       </div>
                    </div>
                    <span className="font-black text-slate-800 text-sm">{p.nome}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">{p.papel || 'Barbeiro'}</span>
                  </button>
                ))}
              </div>
            )}

            {etapa === 3 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
                {servicos.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setFormData({...formData, servicoId: s.id}); setEtapa(4); }}
                    className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${formData.servicoId === s.id ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-50' : 'border-slate-50 bg-slate-50/50 hover:border-indigo-200 hover:bg-white'}`}
                  >
                    <div className="text-left">
                      <p className="font-black text-slate-800">{s.nome}</p>
                      <p className="text-xs text-slate-400 font-bold">{s.duracao} minutos</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                      <span className="font-black text-indigo-600 text-sm">{formatarMoeda(s.preco)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {etapa === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                 <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <div className="flex justify-between items-center mb-6 px-2">
                       <h3 className="font-black text-slate-800">Escolha o Dia</h3>
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Disponível
                       </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
                        <div key={i} className="text-[10px] font-black text-slate-300 py-2 text-center">{d}</div>
                      ))}
                      {MOCK_DIAS.map(dia => {
                        const selecionado = format(new Date(formData.data + 'T00:00:00'), 'd') === String(dia);
                        return (
                          <button 
                            key={dia}
                            onClick={() => setFormData({...formData, data: `2026-03-${String(dia).padStart(2, '0')}`})}
                            className={`h-10 rounded-xl font-black text-sm transition-all flex flex-col items-center justify-center ${selecionado ? 'bg-indigo-600 text-white shadow-lg scale-110' : 'hover:bg-white text-slate-600'}`}
                          >
                            {dia}
                            <div className={`w-1 h-1 rounded-full mt-0.5 ${selecionado ? 'bg-indigo-300' : 'bg-emerald-400 opacity-50'}`}></div>
                          </button>
                        );
                      })}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="font-black text-slate-800 px-2 flex items-center gap-2">
                      <Clock size={16} className="text-indigo-600" /> Horários Disponíveis
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                      {buscandoHorarios ? (
                        <div className="col-span-4 py-8 flex items-center justify-center gap-2 text-indigo-500 font-bold text-sm">
                          <Loader2 size={20} className="animate-spin" /> Verificando agenda...
                        </div>
                      ) : horariosDisponiveis.map(h => (
                        <button
                          key={h}
                          onClick={() => setFormData({...formData, hora: h})}
                          className={`py-3 rounded-2xl font-black text-sm transition-all border-2 ${formData.hora === h ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-50' : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-indigo-100 hover:bg-white'}`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                 </div>
              </div>
            )}

            {etapa === 5 && (
              <div className="py-8 flex flex-col items-center text-center animate-in zoom-in-95">
                <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mb-8 border border-indigo-100 shadow-inner">
                  <Check size={48} strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Tudo pronto?</h3>
                <p className="text-slate-500 font-medium mb-8 max-w-xs">Revise os dados no resumo lateral e confirme o agendamento.</p>
                <div className="w-full max-w-sm p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-left space-y-3">
                   <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold uppercase text-[10px]">Cliente</span> <span className="font-black text-slate-700">{formData.cliente.nome}</span></div>
                   <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold uppercase text-[10px]">Data</span> <span className="font-black text-slate-700">{format(new Date(formData.data + 'T00:00:00'), 'dd/MM/yyyy')}</span></div>
                   <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold uppercase text-[10px]">Hora</span> <span className="font-black text-slate-700">{formData.hora}</span></div>
                </div>
              </div>
            )}

            {etapa === 6 && (
              <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-90 duration-300">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-xl shadow-emerald-50">
                  <CheckCircle2 size={56} />
                </div>
                <h4 className="text-3xl font-black text-slate-800 mb-2">Concluido!</h4>
                <p className="text-slate-500 font-bold">O agendamento manual foi criado<br/>com sucesso e já está na grade.</p>
              </div>
            )}
          </div>

          {/* Footer Navegação */}
          {etapa < 6 && (
            <div className="px-8 py-6 border-t border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md">
              <button 
                onClick={() => etapa > 1 ? setEtapa(etapa - 1) : onClose()}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-800 font-black text-xs uppercase tracking-widest transition-all"
              >
                <ChevronLeft size={18} /> {etapa === 1 ? 'Cancelar' : 'Voltar'}
              </button>
              
              <button 
                disabled={
                  (etapa === 1 && (!formData.cliente.nome || !formData.cliente.telefone)) ||
                  (etapa === 2 && !formData.profissionalId) ||
                  (etapa === 3 && !formData.servicoId) ||
                  (etapa === 4 && !formData.hora) ||
                  carregando
                }
                onClick={() => etapa === 5 ? handleSubmit() : setEtapa(etapa + 1)}
                className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-300 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 transition-all active:scale-95"
              >
                {carregando ? <Loader2 size={18} className="animate-spin" /> : (etapa === 5 ? "Salvar Agendamento" : "Próximo Passo")} 
                {etapa < 5 && <ChevronRight size={18} />}
              </button>
            </div>
          )}
        </div>

        {renderizarResumoDireito()}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
}
