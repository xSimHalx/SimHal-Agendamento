import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Plus, Edit, Trash2, X, Save, Search,
  Briefcase, ShoppingCart, Clock, CheckCircle2,
  AlertCircle, MoreVertical, Loader2, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useTermos } from '../../hooks/useTermos';
import API_URL from '../../servicos/api';

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor) / 100);
};

export default function VisaoServicos({ empresa }) {
  const empresaId = empresa?.id;
  const t = useTermos(empresa);
  const [abaAtiva, setAbaAtiva] = useState('principais'); // 'principais' ou 'adicionais'
  const [servicos, setServicos] = useState([]);
  const [adicionais, setAdicionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');

  // Estado do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nome: '', descricao: '', preco: '', duracao: 30, tempoBuffer: 0, capacidadeMaxima: 1 });

  const carregarDados = useCallback(async () => {
    if (!empresaId) return;
    setCarregando(true);
    try {
      const response = await axios.get(`${API_URL}/api/negocio/servicos/${empresaId}`);
      // A API de serviços já retorna tanto servicos quanto adicionais
      setServicos(response.data.servicos || []);
      setAdicionais(response.data.adicionais || []);
    } catch (erro) {
      console.error("Erro ao carregar serviços/adicionais:", erro);
    } finally {
      setCarregando(false);
    }
  }, [empresaId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const abrirModal = (item = null) => {
    if (item) {
      setEditando(item);
      setForm({
        nome: item.nome,
        descricao: item.descricao || '',
        preco: item.preco ? (item.preco / 100).toFixed(2) : '',
        duracao: item.duracao || 30,
        tempoBuffer: item.tempoBuffer || 0,
        capacidadeMaxima: item.capacidadeMaxima || 1
      });
    } else {
      setEditando(null);
      setForm({ nome: '', descricao: '', preco: '', duracao: 30, tempoBuffer: 0, capacidadeMaxima: 1 });
    }
    setModalAberto(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      const baseUri = abaAtiva === 'principais' ? 'servicos' : 'adicionais';
      const dados = { ...form, preco: Math.round(parseFloat(form.preco || 0) * 100), empresaId };

      if (editando) {
        await axios.put(`${API_URL}/api/negocio/${baseUri}/${editando.id}`, dados);
      } else {
        await axios.post(`${API_URL}/api/negocio/${baseUri}`, dados);
      }

      setModalAberto(false);
      carregarDados();
    } catch (erro) {
      alert("Erro ao salvar item.");
    }
  };

  const alternarStatus = async (item) => {
    try {
      const baseUri = abaAtiva === 'principais' ? 'servicos' : 'adicionais';
      await axios.put(`${API_URL}/api/negocio/${baseUri}/${item.id}`, {
        ...item,
        ativo: !item.ativo
      });
      carregarDados();
    } catch (erro) {
      console.error("Erro ao alternar status:", erro);
    }
  };

  const excluir = async (id) => {
    if (!window.confirm("Deseja realmente excluir este item?")) return;
    try {
      const baseUri = abaAtiva === 'principais' ? 'servicos' : 'adicionais';
      await axios.delete(`${API_URL}/api/negocio/${baseUri}/${id}`);
      carregarDados();
    } catch (erro) {
      console.error("Erro ao excluir:", erro);
    }
  };

  const itemsFiltrados = (abaAtiva === 'principais' ? servicos : adicionais).filter(item =>
    item.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Cabeçalho de Gestão */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Catálogo de {t.Servicos}</h1>
          <p className="text-slate-500 font-medium">Gerencie seus {t.servicos} principais e adicionais.</p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} /> Novo {abaAtiva === 'principais' ? t.Servico : 'Adicional'}
        </button>
      </div>

      {/* Tabs e Busca */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex p-1 bg-slate-100 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => setAbaAtiva('principais')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-black transition-all ${abaAtiva === 'principais' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Briefcase size={18} /> {t.Servicos} Principais
          </button>
          <button
            onClick={() => setAbaAtiva('adicionais')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-black transition-all ${abaAtiva === 'adicionais' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ShoppingCart size={18} /> Adicionais
          </button>
        </div>
        <div className="relative w-full md:w-64 px-2">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar item..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
          />
        </div>
      </div>

      {carregando ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando catálogo...</p>
        </div>
      ) : itemsFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-center px-6">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={40} className="text-slate-300" />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2">Nada por aqui ainda</h2>
          <p className="text-slate-500 max-w-xs mb-8">Nenhum {abaAtiva === 'principais' ? t.servico : 'adicional'} encontrado para sua busca ou cadastro.</p>
          <button onClick={() => abrirModal()} className="text-indigo-600 font-black text-sm hover:underline">Começar agora &rarr;</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itemsFiltrados.map(item => (
            <div key={item.id} className={`group bg-white p-6 rounded-[2rem] border-2 transition-all hover:shadow-xl hover:shadow-slate-100 flex flex-col ${item.ativo ? 'border-slate-100' : 'border-slate-50 opacity-60'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${abaAtiva === 'principais' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {abaAtiva === 'principais' ? <Briefcase size={20} /> : <ShoppingCart size={20} />}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{item.nome}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.ativo ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.ativo ? 'Ativo' : 'Inativo'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => abrirModal(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-slate-50 bg-white"><Edit size={16} /></button>
                  <button onClick={() => excluir(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-slate-50 bg-white"><Trash2 size={16} /></button>
                </div>
              </div>

              <p className="text-sm text-slate-500 mb-8 line-clamp-3 min-h-[60px] font-medium leading-relaxed italic pr-4">
                {item.descricao || 'Sem descrição cadastrada'}
              </p>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                <div className="flex flex-col">
                  {abaAtiva === 'principais' && (
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                      <Clock size={12} /> {item.duracao} MINUTOS
                    </div>
                  )}
                  <span className="font-black text-slate-800 text-2xl">{formatarMoeda(item.preco)}</span>
                </div>
                <button
                  onClick={() => alternarStatus(item)}
                  className={`p-2 rounded-xl transition-all ${item.ativo ? 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                  title={item.ativo ? 'Desativar' : 'Ativar'}
                >
                  {item.ativo ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Premium */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="font-black text-slate-800 text-2xl">{editando ? 'Editar' : 'Novo'} {abaAtiva === 'principais' ? t.Servico : 'Adicional'}</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Catálogo Profissional</p>
              </div>
              <button onClick={() => setModalAberto(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-100 bg-white/50"><X size={24} className="text-slate-400" /></button>
            </div>
            <form onSubmit={salvar} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Item</label>
                <input
                  required
                  type="text"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-black text-slate-800"
                  placeholder="Ex: Corte Degrade / Barba Premium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição Detalhada</label>
                <textarea
                  value={form.descricao}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium text-slate-700 h-24 resize-none"
                  placeholder="Explique os detalhes do serviço para seu cliente..."
                />
              </div>
              <div className={`grid ${abaAtiva === 'principais' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço (R$)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={form.preco}
                    onChange={e => setForm({ ...form, preco: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-black text-slate-800"
                    placeholder="0.00"
                  />
                </div>
                {abaAtiva === 'principais' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duração (Min)</label>
                      <input
                        required
                        type="number"
                        value={form.duracao}
                        onChange={e => setForm({ ...form, duracao: parseInt(e.target.value) })}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-black text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preparo (Min)</label>
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={form.tempoBuffer}
                        onChange={e => setForm({ ...form, tempoBuffer: parseInt(e.target.value) || 0 })}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-black text-slate-800"
                        placeholder="Ex: 15"
                      />
                      <p className="text-[9px] text-slate-400 mt-1 ml-1 font-medium leading-tight">Limpeza/Descanso.</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vagas (Capac.)</label>
                      <input
                        type="number"
                        min="1"
                        value={form.capacidadeMaxima}
                        onChange={e => setForm({ ...form, capacidadeMaxima: parseInt(e.target.value) || 1 })}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-black text-slate-800"
                      />
                      <p className="text-[9px] text-slate-400 mt-1 ml-1 font-medium leading-tight">Clientes/slot.</p>
                    </div>
                  </>
                )}
              </div>
              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="flex-1 px-6 py-4 border-2 border-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-50 transition-all text-sm uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-[2] px-6 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95 text-sm uppercase tracking-widest"
                >
                  <Save size={20} /> {editando ? 'Salvar Alterações' : 'Criar Novo Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
