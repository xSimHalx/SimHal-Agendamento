import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Plus, Edit, Trash2, X, User, Phone, Mail, 
  Calendar, Clock, DollarSign, FileText, ChevronRight, 
  Loader2, BadgeCheck, History, Star, Save
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTermos } from '../../hooks/useTermos';
import API_URL from '../../servicos/api';

const API_BASE = `${API_URL}/api/clientes`;

export default function VisaoClientes({ empresa }) {
  const empresaId = empresa?.id;
  const t = useTermos(empresa);
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  
  // Estado do Detalhe (Slide-over)
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [detalhesCarregando, setDetalhesCarregando] = useState(false);
  const [historico, setHistorico] = useState([]);
  
  // Estado do Modal de Cadastro
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [estaSalvando, setEstaSalvando] = useState(false);
  const [form, setForm] = useState({ 
    nome: '', 
    sobrenome: '', 
    telefone: '', 
    email: '', 
    notas: '' 
  });
  const [feedback, setFeedback] = useState({ tipo: null, msg: '' });
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState(null);

  const carregarClientes = useCallback(async () => {
    if (!empresaId) return;
    setCarregando(true);
    try {
      const response = await axios.get(`${API_BASE}/${empresaId}`);
      setClientes(Array.isArray(response.data) ? response.data : []);
    } catch (erro) {
      console.error("Erro ao buscar clientes:", erro);
    } finally {
      setCarregando(false);
    }
  }, [empresaId]);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  const buscarDetalhes = async (cliente) => {
    setClienteSelecionado(cliente);
    setDetalhesCarregando(true);
    try {
      const res = await axios.get(`${API_BASE}/detalhes/${cliente.id}`);
      setHistorico(res.data.agendamentos || []);
    } catch (erro) {
      console.error("Erro ao buscar detalhes:", erro);
    } finally {
      setDetalhesCarregando(false);
    }
  };

  const abrirModal = (c = null) => {
    if (c) {
      setEditando(c);
      setForm({
        nome: c.nome,
        sobrenome: c.sobrenome || '',
        telefone: c.telefone,
        email: c.email || '',
        notas: c.notas || ''
      });
    } else {
      setEditando(null);
      setForm({ nome: '', sobrenome: '', telefone: '', email: '', notas: '' });
    }
    setModalAberto(true);
  };

  const salvarCliente = async (e) => {
    e.preventDefault();
    setEstaSalvando(true);
    try {
      const dados = { ...form, empresaId };
      if (editando) {
        await axios.put(`${API_BASE}/${editando.id}`, dados);
      } else {
        await axios.post(API_BASE, dados);
      }
      setFeedback({ tipo: 'sucesso', msg: `${t.Cliente} salvo com sucesso!` });
      setModalAberto(false);
      carregarClientes();
    } catch (erro) {
      setFeedback({ tipo: 'erro', msg: 'Erro ao salvar cliente.' });
    } finally {
      setEstaSalvando(false);
      setTimeout(() => setFeedback({ tipo: null, msg: '' }), 3000);
    }
  };

  const excluirCliente = async (id) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);
      setFeedback({ tipo: 'sucesso', msg: 'Cliente excluído.' });
      carregarClientes();
      if (clienteSelecionado?.id === id) setClienteSelecionado(null);
      setConfirmacaoExclusao(null);
    } catch (erro) {
      setFeedback({ tipo: 'erro', msg: 'Erro ao excluir.' });
      setTimeout(() => setFeedback({ tipo: null, msg: '' }), 3000);
    }
  };

  const clientesFiltrados = clientes.filter(c => 
    `${c.nome} ${c.sobrenome}`.toLowerCase().includes(busca.toLowerCase()) ||
    c.telefone.includes(busca)
  );

  return (
    <div className="relative h-full flex flex-col gap-6 animate-in fade-in duration-700">
      {/* Toast Animado */}
      {feedback.msg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md ${feedback.tipo === 'sucesso' ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-rose-500/90 text-white border-rose-400'}`}>
            <BadgeCheck size={20} />
            <span className="font-bold text-sm">{feedback.msg}</span>
          </div>
        </div>
      )}

      {/* Modal de Confirmação Premium */}
      {confirmacaoExclusao && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6">
              <Trash2 size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Excluir {t.Cliente}?</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">Esta ação é permanente e removerá todo o histórico de agendamentos deste {t.cliente}.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmacaoExclusao(null)} className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest">Cancelar</button>
              <button onClick={() => excluirCliente(confirmacaoExclusao)} className="flex-1 px-6 py-4 bg-rose-500 text-white font-black rounded-2xl hover:bg-rose-600 transition-all text-xs uppercase tracking-widest shadow-lg shadow-rose-100">Excluir</button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">CRM de {t.Clientes}</h1>
          <p className="text-slate-500 font-medium">Gerencie o relacionamento e histórico da sua base.</p>
        </div>
        <button 
          onClick={() => abrirModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20}/> Novo {t.Cliente}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou telefone..." 
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-3xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-medium text-slate-600"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {carregando ? (
          <div className="col-span-full py-20 flex flex-col items-center text-slate-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            Sincronizando clientes...
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <User className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold">Nenhum {t.cliente} encontrado.</p>
          </div>
        ) : (
          clientesFiltrados.map(c => (
            <div 
              key={c.id} 
              onClick={() => buscarDetalhes(c)}
              className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50 hover:border-indigo-100 transition-all cursor-pointer flex flex-col gap-4 relative overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xl border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  {c.nome.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg leading-tight uppercase tracking-tight">{c.nome} {c.sobrenome}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mt-1">
                    <Phone size={12} /> {c.telefone}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atendimentos</p>
                   <p className="text-sm font-black text-slate-800">{c._count?.agendamentos || 0}</p>
                </div>
                <div className="bg-emerald-50/50 rounded-2xl p-3 border border-emerald-100/50">
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Status</p>
                   <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                     <BadgeCheck size={10}/> {(c._count?.agendamentos || 0) > 3 ? 'Recorrente' : 'Novo'}
                   </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ver Histórico</span>
                 <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" size={18} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Slide-over de Detalhes (CRM) */}
      {clienteSelecionado && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setClienteSelecionado(null)}></div>
          <div className="absolute inset-y-0 right-0 max-w-xl w-full flex">
            <div className="h-full w-full bg-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-500 overflow-hidden rounded-l-[3rem]">
              
              {/* Header Detalhe */}
              <div className="p-8 bg-slate-50 border-b border-slate-100 flex flex-col gap-6 relative">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-600 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-indigo-100">
                      {clienteSelecionado.nome.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-2">
                        {clienteSelecionado.nome} {clienteSelecionado.sobrenome}
                      </h2>
                      <div className="flex gap-2">
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {historico.length > 5 ? 'Cliente VIP' : 'Cliente Premium'}
                        </span>
                        <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">ID: {clienteSelecionado.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setClienteSelecionado(null)} className="p-3 hover:bg-slate-200 rounded-2xl transition-all text-slate-400"><X size={24} /></button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                    <History className="mx-auto text-indigo-500 mb-2" size={20} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visitas</p>
                    <p className="text-lg font-black text-slate-800">{historico.length}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                    <Star className="mx-auto text-amber-500 mb-2" size={20} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gasto Total</p>
                    <p className="text-lg font-black text-slate-800">R$ {historico.reduce((acc, current) => acc + (Number(current.valorTotal) / 100), 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                    <Calendar className="mx-auto text-emerald-500 mb-2" size={20} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Última Vez</p>
                    <p className="text-[11px] font-black text-slate-800">
                      {historico[0] ? format(new Date(historico[0].dataHora), 'dd/MM/yy') : '--'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Conteúdo scrollable */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                
                {/* Informações de Contato */}
                <section>
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    <Phone size={14} /> Informações de Contato
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center group/wa">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">WhatsApp</p>
                        <p className="text-sm font-bold text-slate-800">{clienteSelecionado.telefone}</p>
                      </div>
                      <a 
                        href={`https://wa.me/55${clienteSelecionado.telefone.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        <Phone size={16} />
                      </a>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 mb-1">E-mail</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{clienteSelecionado.email || 'Não informado'}</p>
                    </div>
                  </div>
                </section>

                {/* Notas de Preferência */}
                <section>
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    <FileText size={14} /> Preferências e Observações
                  </h4>
                  <div className="bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100 relative group">
                    <p className="text-sm font-medium text-slate-700 italic">
                      {clienteSelecionado.notas || "Nenhuma observação técnica cadastrada. Clique em editar para adicionar preferências de corte ou produtos."}
                    </p>
                    <button onClick={() => abrirModal(clienteSelecionado)} className="absolute top-4 right-4 p-2 bg-white rounded-xl shadow-sm border border-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit size={14} className="text-indigo-600" />
                    </button>
                  </div>
                </section>

                {/* Linha do Tempo (Histórico) */}
                <section>
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    <Clock size={14} /> Linha do Tempo de Atendimentos
                  </h4>
                  {detalhesCarregando ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-300" /></div>
                  ) : historico.length === 0 ? (
                    <p className="text-center text-slate-400 py-10 italic">Nenhum atendimento realizado ainda.</p>
                  ) : (
                    <div className="space-y-4">
                      {historico.map((h, idx) => (
                        <div key={h.id} className="relative pl-8 before:absolute before:left-[11px] before:top-0 before:bottom-0 before:w-0.5 before:bg-slate-100 last:before:h-8">
                          <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${idx === 0 ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center hover:bg-slate-50 transition-colors">
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                  {format(new Date(h.dataHora), "dd 'de' MMMM", { locale: ptBR })}
                               </p>
                               <h5 className="font-black text-slate-800 mt-1">{h.servico?.nome}</h5>
                               <p className="text-xs text-slate-500 font-medium">Com {h.profissional?.nome}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-black text-indigo-600">R$ {(Number(h.valorTotal) / 100).toFixed(2)}</p>
                               <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">{h.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Footer Detalhe */}
              <div className="p-8 border-t border-slate-100 bg-white flex gap-4">
                <button 
                  onClick={() => abrirModal(clienteSelecionado)}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-100"
                >
                  <Edit size={18} /> Editar {t.Cliente}
                </button>
                <button 
                  onClick={() => setConfirmacaoExclusao(clienteSelecionado.id)}
                  className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all border border-red-100"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cadastro/Edição */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-start sm:items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-200 my-auto overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh] sm:max-h-[90vh]">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{editando ? 'Editar CRM' : 'Novo Registro'}</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Dados do {t.Cliente}</p>
               </div>
                <button onClick={() => setModalAberto(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-100 bg-white/50"><X size={24} className="text-slate-400" /></button>
             </div>
             
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <form id="form-cliente" onSubmit={salvarCliente} className="p-8 space-y-6 pb-0">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome</label>
                    <input required placeholder="João" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sobrenome</label>
                    <input placeholder="Silva" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all" value={form.sobrenome} onChange={e => setForm({...form, sobrenome: e.target.value})} />
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp / Telefone</label>
                  <input required placeholder="(00) 00000-0000" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} />
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail (Opcional)</label>
                  <input type="email" placeholder="cliente@email.com" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-black">Preferências e Observações Técnicas</label>
                  <textarea rows="3" placeholder="Ex: Degradê na zero, risquinho na sobrancelha, gosta de café..." className="w-full bg-indigo-50/20 border border-indigo-100/50 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-indigo-50 outline-none transition-all resize-none" value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} />
                </div>
              </form>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
               <button type="button" onClick={() => setModalAberto(false)} className="flex-1 px-6 py-4 border-2 border-slate-200 bg-white text-slate-500 font-black rounded-2xl hover:bg-slate-50 transition-all text-sm uppercase tracking-widest">Cancelar</button>
               <button form="form-cliente" type="submit" disabled={estaSalvando} className="flex-[2] px-6 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95 text-sm uppercase tracking-widest disabled:bg-slate-200">
                  {estaSalvando ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> {editando ? 'Atualizar Ficha' : `Salvar no CRM`}</>}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Injeção de Scrollbar Customizado */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
}
