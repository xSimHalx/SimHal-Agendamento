import React, { useState, useEffect } from 'react';
import {
  Settings, Globe, Smartphone, Palette, Save,
  ExternalLink, CheckCircle2, Loader2, AlertCircle, Copy,
  MapPin, Instagram, Facebook, Camera, Plus, Clock, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

export default function VisaoConfiguracoes({ empresaId }) {
  const [empresa, setEmpresa] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [estaSalvando, setEstaSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    slug: '',
    telefone: '',
    corPrimaria: 'indigo',
    logo: '',
    endereco: '',
    instagram: '',
    facebook: '',
    exigirPagamentoAntecipado: false,
    customLabels: {
      profissional: 'Barbeiro',
      servico: 'Serviço',
      cliente: 'Cliente',
      agendamento: 'Agendamento'
    },
    horarioFuncionamento: {}
  });
  const [bloqueios, setBloqueios] = useState([]);
  const [novoBloqueio, setNovoBloqueio] = useState({
    inicio: '',
    fim: '',
    motivo: '',
    recorrente: false,
    profissionalId: null
  });
  const [profissionais, setProfissionais] = useState([]);
  const [campos, setCampos] = useState([]);
  const [novoCampo, setNovoCampo] = useState({ label: '', tipo: 'TEXT', obrigatorio: false });
  const [criandoCampo, setCriandoCampo] = useState(false);

  const DIAS_SEMANA = [
    { id: 'segunda', label: 'Segunda' },
    { id: 'terca', label: 'Terça' },
    { id: 'quarta', label: 'Quarta' },
    { id: 'quinta', label: 'Quinta' },
    { id: 'sexta', label: 'Sexta' },
    { id: 'sabado', label: 'Sábado' },
    { id: 'domingo', label: 'Domingo' }
  ];

  const CORES = {
    indigo: { hex: '#4f46e5', bg: 'bg-indigo-600', text: 'text-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-100' },
    rose: { hex: '#e11d48', bg: 'bg-rose-600', text: 'text-rose-600', light: 'bg-rose-50', border: 'border-rose-100' },
    emerald: { hex: '#10b981', bg: 'bg-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-100' },
    slate: { hex: '#334155', bg: 'bg-slate-800', text: 'text-slate-800', light: 'bg-slate-50', border: 'border-slate-100' }
  };

  const carregarBloqueios = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/negocio/bloqueios/${empresaId}`);
      setBloqueios(res.data);
    } catch (erro) {
      console.error(erro);
    }
  };

  const carregarProfissionais = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/negocio/profissionais/${empresaId}`);
      setProfissionais(res.data);
    } catch (erro) {
      console.error(erro);
    }
  };

  const carregarCampos = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/negocio/campos-formulario/${empresaId}`);
      setCampos(res.data);
    } catch (erro) {
      console.error(erro);
    }
  };

  const criarCampo = async () => {
    if (!novoCampo.label) return;
    setCriandoCampo(true);
    try {
      await axios.post('http://localhost:3001/api/negocio/campos-formulario', {
        ...novoCampo,
        empresaId
      });
      setNovoCampo({ label: '', tipo: 'TEXT', obrigatorio: false });
      carregarCampos();
    } catch (erro) {
      alert("Erro ao criar campo.");
    } finally {
      setCriandoCampo(false);
    }
  };

  const excluirCampo = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/negocio/campos-formulario/${id}`);
      carregarCampos();
    } catch (erro) {
      alert("Erro ao excluir campo.");
    }
  };

  const criarBloqueio = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/negocio/bloqueios', {
        ...novoBloqueio,
        empresaId
      });
      setNovoBloqueio({ inicio: '', fim: '', motivo: '', recorrente: false, profissionalId: null });
      carregarBloqueios();
    } catch (erro) {
      alert("Erro ao criar bloqueio.");
    }
  };

  const excluirBloqueio = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/negocio/bloqueios/${id}`);
      carregarBloqueios();
    } catch (erro) {
      alert("Erro ao excluir bloqueio.");
    }
  };

  useEffect(() => {
    const carregarConfig = async () => {
      if (!empresaId) return;
      try {
        const res = await axios.get(`http://localhost:3001/api/negocio/info/pelo-id/${empresaId}`);
        setEmpresa(res.data);
        setForm({
          nome: res.data.nome || '',
          slug: res.data.slug || '',
          telefone: res.data.telefone || '',
          corPrimaria: res.data.corPrimaria || 'indigo',
          logo: res.data.logo || '',
          endereco: res.data.endereco || '',
          instagram: res.data.instagram || '',
          facebook: res.data.facebook || '',
          exigirPagamentoAntecipado: res.data.exigirPagamentoAntecipado || false,
          customLabels: res.data.customLabels || {
            profissional: 'Barbeiro',
            servico: 'Serviço',
            cliente: 'Cliente',
            agendamento: 'Agendamento'
          },
          horarioFuncionamento: res.data.horarioFuncionamento || {
            segunda: ["08:00", "18:00"],
            terca: ["08:00", "18:00"],
            quarta: ["08:00", "18:00"],
            quinta: ["08:00", "18:00"],
            sexta: ["08:00", "18:00"],
            sabado: ["08:00", "12:00"],
            domingo: null
          }
        });
        carregarBloqueios();
        carregarProfissionais();
        carregarCampos();
      } catch (erro) {
        console.error("Erro ao carregar configurações:", erro);
      } finally {
        setCarregando(false);
      }
    };
    carregarConfig();
  }, [empresaId]);

  const salvarConfig = async (e) => {
    e.preventDefault();
    setEstaSalvando(true);
    setSucesso(false);
    try {
      await axios.put(`http://localhost:3001/api/negocio/info/${empresaId}`, form);
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (erro) {
      alert("Erro ao salvar configurações. O link (slug) já pode estar em uso.");
    } finally {
      setEstaSalvando(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("A logo é muito grande! Use uma imagem de até 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const copiarLink = () => {
    const link = `${window.location.origin}/${form.slug}`;
    navigator.clipboard.writeText(link);
    alert("Link copiado para a área de transferência!");
  };

  const toggleDia = (diaId) => {
    const novoHorario = { ...form.horarioFuncionamento };
    if (novoHorario[diaId]) {
      novoHorario[diaId] = null;
    } else {
      novoHorario[diaId] = ["08:00", "18:00"];
    }
    setForm({ ...form, horarioFuncionamento: novoHorario });
  };

  const alterarHorario = (diaId, index, valor) => {
    const novoHorario = { ...form.horarioFuncionamento };
    if (novoHorario[diaId]) {
      novoHorario[diaId][index] = valor;
      setForm({ ...form, horarioFuncionamento: novoHorario });
    }
  };

  if (carregando) {
    return (
      <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-100 text-slate-400 font-bold uppercase tracking-widest text-xs">
        <Loader2 className="animate-spin mb-4 text-indigo-500" size={32} />
        Sincronizando configurações...
      </div>
    );
  }

  const temaAtual = CORES[form.corPrimaria] || CORES.indigo;

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Coração do Negócio</h1>
          <p className="text-slate-500 font-medium">Personalize sua identidade, cores e canais de contato.</p>
        </div>
        {sucesso && (
          <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl flex items-center gap-2 border border-emerald-100 animate-in slide-in-from-top-4 shadow-sm">
            <CheckCircle2 size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Alterações aplicadas!</span>
          </div>
        )}
      </div>

      <form onSubmit={salvarConfig} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LADO ESQUERDO: CONFIGURAÇÕES */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Alerta de Configuração Pendente */}
          {!empresa?.horarioFuncionamento && (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2.5rem] flex items-start gap-4 animate-pulse">
              <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Expediente não configurado</h4>
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  Sua agenda está atualmente <strong>BLOQUEADA</strong> para os clientes. 
                  Defina o horário de funcionamento abaixo e clique em "Publicar Alterações" para começar a receber reservas.
                </p>
              </div>
            </div>
          )}

          {/* Sessão 1: Identidade e Logo */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-start justify-between">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Globe size={14} /> Marca & Identidade
              </h3>
              {/* Upload de Logo */}
              <div className="flex flex-col items-center gap-2">
                <div
                  onClick={() => document.getElementById('logo-upload').click()}
                  className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 transition-all group relative"
                >
                  {form.logo ? (
                    <img src={form.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <Camera size={24} className="text-slate-300 group-hover:text-indigo-400" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-all">
                    <Plus size={16} className="text-white opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
                <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                <span className="text-[9px] font-black text-slate-400 uppercase">Logo da Loja</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Empresa</label>
                <input
                  required
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: SimHal Barber Shop"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link de Agendamento</label>
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                  <div className="bg-slate-100 px-4 py-4 border-r border-slate-200">
                    <span className="text-slate-400 font-black text-[10px] uppercase tracking-wider whitespace-nowrap">simhal.pro/</span>
                  </div>
                  <input
                    required
                    value={form.slug}
                    onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="seu-link"
                    className="w-full bg-transparent p-4 text-sm font-black outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sessão 2: Contato e Localização */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Smartphone size={14} /> Contato & Localização
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp de Contato</label>
                <input
                  value={form.telefone}
                  onChange={e => setForm({ ...form, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><MapPin size={10} /> Endereço Completo</label>
                <input
                  value={form.endereco}
                  onChange={e => setForm({ ...form, endereco: e.target.value })}
                  placeholder="Rua, Número, Bairro, Cidade"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Instagram size={10} /> Instagram (Arroba)</label>
                <input
                  value={form.instagram}
                  onChange={e => setForm({ ...form, instagram: e.target.value.replace('@', '') })}
                  placeholder="@seunegocio"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Facebook size={10} /> Facebook (Slug)</label>
                <input
                  value={form.facebook}
                  onChange={e => setForm({ ...form, facebook: e.target.value })}
                  placeholder="facebook.com/seunegocio"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Sessão 3: Expediente da Loja */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock size={14} /> Expediente da Loja
            </h3>

            <div className="space-y-3">
              {DIAS_SEMANA.map(dia => (
                <div key={dia.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-slate-100/30 transition-all">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleDia(dia.id)}
                      className={`w-10 h-6 rounded-full relative transition-all ${form.horarioFuncionamento?.[dia.id] ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.horarioFuncionamento?.[dia.id] ? 'left-5' : 'left-1'}`} />
                    </button>
                    <span className={`text-[11px] font-black uppercase tracking-wider ${form.horarioFuncionamento?.[dia.id] ? 'text-slate-700' : 'text-slate-400'}`}>
                      {dia.label}
                    </span>
                  </div>

                  {form.horarioFuncionamento?.[dia.id] ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={form.horarioFuncionamento[dia.id][0] || '08:00'}
                        onChange={(e) => alterarHorario(dia.id, 0, e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                      <span className="text-slate-400 font-bold">às</span>
                      <input
                        type="time"
                        value={form.horarioFuncionamento[dia.id][1] || '18:00'}
                        onChange={(e) => alterarHorario(dia.id, 1, e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                  ) : (
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full">Fechado</span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 font-medium italic">* Os horários de agendamento automáticos respeitarão este expediente.</p>
          </div>

          {/* Sessão 4: Bloqueios de Agenda */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <AlertCircle size={14} className="text-rose-400" /> Bloqueios de Agenda
            </h3>

            <div className="space-y-4">
              {/* Formulário Rápido */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                <p className="text-[10px] font-black uppercase text-slate-400">Novo Bloqueio (Férias / Feriados)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="datetime-local"
                    value={novoBloqueio.inicio}
                    onChange={e => setNovoBloqueio({ ...novoBloqueio, inicio: e.target.value })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                  <input
                    type="datetime-local"
                    value={novoBloqueio.fim}
                    onChange={e => setNovoBloqueio({ ...novoBloqueio, fim: e.target.value })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <input
                  placeholder="Motivo (Ex: Feriado Nacional)"
                  value={novoBloqueio.motivo}
                  onChange={e => setNovoBloqueio({ ...novoBloqueio, motivo: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
                <div className="flex items-center justify-between gap-4">
                  <select
                    value={novoBloqueio.profissionalId || ''}
                    onChange={e => setNovoBloqueio({ ...novoBloqueio, profissionalId: e.target.value || null })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold flex-1"
                  >
                    <option value="">Toda a Loja</option>
                    {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                  <button
                    onClick={criarBloqueio}
                    className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                  >
                    Bloquear
                  </button>
                </div>
              </div>

              {/* Listagem */}
              <div className="space-y-2">
                {bloqueios.map(bl => (
                  <div key={bl.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all">
                    <div>
                      <p className="text-xs font-black text-slate-700">{bl.motivo}</p>
                      <p className="text-[9px] font-bold text-slate-400">
                        {format(new Date(bl.inicio), "dd/MM HH:mm")} até {format(new Date(bl.fim), "dd/MM HH:mm")}
                        {bl.profissionalId ? ` • ${bl.profissional?.nome}` : ' • Loja toda'}
                      </p>
                    </div>
                    <button onClick={() => excluirBloqueio(bl.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                      <Plus size={16} className="rotate-45" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sessão 5: Cores */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Palette size={14} /> Cor da Marca
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(CORES).map(([id, info]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setForm({ ...form, corPrimaria: id })}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${form.corPrimaria === id ? `border-slate-800 ${info.light} shadow-md scale-105` : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                >
                  <div className={`w-10 h-10 rounded-2xl shadow-inner ${info.bg}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sessão 6: Terminologia do Negócio (White-label) */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Globe size={14} /> Terminologia do Negócio
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Configure como o sistema deve chamar seus recursos (ex: Médico, Paciente, Consulta).</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Como chamar o "Profissional"?</label>
                <input
                  value={form.customLabels.profissional}
                  onChange={e => setForm({ ...form, customLabels: { ...form.customLabels, profissional: e.target.value } })}
                  placeholder="Ex: Barbeiro, Médico, Instrutor"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Como chamar o "Serviço"?</label>
                <input
                  value={form.customLabels.servico}
                  onChange={e => setForm({ ...form, customLabels: { ...form.customLabels, servico: e.target.value } })}
                  placeholder="Ex: Corte, Consulta, Aula"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Como chamar o "Cliente"?</label>
                <input
                  value={form.customLabels.cliente}
                  onChange={e => setForm({ ...form, customLabels: { ...form.customLabels, cliente: e.target.value } })}
                  placeholder="Ex: Cliente, Paciente, Aluno"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Como chamar o "Agendamento"?</label>
                <input
                  value={form.customLabels.agendamento}
                  onChange={e => setForm({ ...form, customLabels: { ...form.customLabels, agendamento: e.target.value } })}
                  placeholder="Ex: Agendamento, Reserva, Consulta"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Sessão 8: Políticas de Agendamento */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" /> Políticas de Agendamento
            </h3>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-black text-slate-800">Pagamento Antecipado (Checkout)</h4>
                <p className="text-xs text-slate-500 font-medium">Exigir pagamento total ou sinal via PIX/Cartão para confirmar o agendamento.</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, exigirPagamentoAntecipado: !form.exigirPagamentoAntecipado })}
                className={`w-14 h-8 rounded-full relative transition-all shadow-inner ${form.exigirPagamentoAntecipado ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${form.exigirPagamentoAntecipado ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Sessão 7: Form Builder (Campos Personalizados) */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Plus size={14} className="text-indigo-500" /> Formulário Extra de Checkout
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Capture informações específicas em cada agendamento (ex: Placa do Carro, Raça do Pet, Nome da Empresa).</p>

            <div className="space-y-4">
               {/* Formulário Rápido */}
               <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Pergunta / Label</label>
                      <input 
                        placeholder="Ex: Qual a placa do seu carro?" 
                        value={novoCampo.label}
                        onChange={e => setNovoCampo({...novoCampo, label: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-indigo-50 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Resposta</label>
                        <select 
                          value={novoCampo.tipo}
                          onChange={e => setNovoCampo({...novoCampo, tipo: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-xs font-bold outline-none"
                        >
                          <option value="TEXT">Texto Livre</option>
                          <option value="NUMBER">Número</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Obrigatório?</label>
                        <button 
                          type="button"
                          onClick={() => setNovoCampo({...novoCampo, obrigatorio: !novoCampo.obrigatorio})}
                          className={`w-full h-[42px] border rounded-xl flex items-center justify-center gap-2 transition-all font-black text-[10px] uppercase tracking-widest ${novoCampo.obrigatorio ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-400'}`}
                        >
                          {novoCampo.obrigatorio ? 'Sim' : 'Não'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={criarCampo}
                    disabled={criandoCampo || !novoCampo.label}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
                  >
                    {criandoCampo ? 'Adicionando...' : 'Adicionar Campo ao Checkout'}
                  </button>
               </div>

               {/* Listagem de Campos */}
               <div className="space-y-3">
                  {campos.length === 0 ? (
                    <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                       <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Nenhum campo extra configurado</p>
                    </div>
                  ) : (
                    campos.map(campo => (
                      <div key={campo.id} className="group p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                               <Plus size={14} />
                            </div>
                            <div>
                               <p className="text-xs font-black text-slate-700">{campo.label} {campo.obrigatorio && <span className="text-rose-400">*</span>}</p>
                               <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-50 px-2 py-0.5 rounded-md">{campo.tipo}</span>
                                  {campo.obrigatorio && <span className="text-[9px] font-black text-rose-300 uppercase italic">Obrigatório</span>}
                               </div>
                            </div>
                         </div>
                         <button 
                           type="button"
                           onClick={() => excluirCampo(campo.id)}
                           className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                         >
                            <Plus size={16} className="rotate-45" />
                         </button>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: PREVIEW REAL */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl space-y-8 sticky top-8">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em] text-center">Dashboard do Cliente</h3>

            <div className="space-y-6">
              {/* Preview Card */}
              <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/20 text-slate-800 space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white p-2 ${temaAtual.bg}`}>
                    {form.logo ? <img src={form.logo} className="w-full h-full object-cover rounded-xl" alt="logo" /> : <Settings size={24} />}
                  </div>
                  <div>
                    <p className="text-xs font-black truncate max-w-[140px]">{form.nome || 'Sua Loja'}</p>
                    <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tight">
                      <MapPin size={8} /> {form.endereco ? 'Endereço Definido' : 'Cidade, Estado'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className={`w-full h-10 rounded-xl flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest shadow-lg transition-all ${temaAtual.bg}`}>
                    Agendar Agora
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-8 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center"><Instagram size={12} className={temaAtual.text} /></div>
                    <div className="flex-1 h-8 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center"><Smartphone size={12} className={temaAtual.text} /></div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="space-y-3 pt-4">
                <button
                  type="button"
                  onClick={copiarLink}
                  className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 p-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  <Copy size={16} /> Copiar Link Público
                </button>
                <a
                  href={`/${form.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full flex items-center justify-center gap-2 p-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${temaAtual.bg} hover:brightness-110`}
                >
                  <ExternalLink size={16} /> Ver Online
                </a>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <button
                type="submit"
                disabled={estaSalvando}
                className="w-full bg-white text-slate-900 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-black/10 hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:bg-slate-700 disabled:text-slate-400"
              >
                {estaSalvando ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Publicar Alterações</>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
