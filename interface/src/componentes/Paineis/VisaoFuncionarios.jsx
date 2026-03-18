import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Edit, Trash2, X, Save, Search, 
  UserCheck, Smartphone, Lock, Mail, 
  Loader2, CheckCircle2, AlertCircle, Camera, Clock, Trash
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/negocio/profissionais';

export default function VisaoFuncionarios({ empresaId }) {
  const [funcionarios, setFuncionarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  
  // Estado do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [estaSalvando, setEstaSalvando] = useState(false);
  const [form, setForm] = useState({ 
    nome: '', 
    email: '', 
    telefone: '', 
    senha: '', 
    foto: '',
    role: 'PROFISSIONAL',
    horariosDeTrabalho: {
      segunda: [["09:00", "18:00"]],
      terca: [["09:00", "18:00"]],
      quarta: [["09:00", "18:00"]],
      quinta: [["09:00", "18:00"]],
      sexta: [["09:00", "18:00"]],
      sabado: [["09:00", "12:00"]],
      domingo: []
    }
  });

  const DIAS_SEMANA = [
    { id: 'segunda', label: 'Seg' },
    { id: 'terca', label: 'Ter' },
    { id: 'quarta', label: 'Qua' },
    { id: 'quinta', label: 'Qui' },
    { id: 'sexta', label: 'Sex' },
    { id: 'sabado', label: 'Sáb' },
    { id: 'domingo', label: 'Dom' }
  ];

  const carregarFuncionarios = useCallback(async () => {
    if (!empresaId) return;
    setCarregando(true);
    try {
      const response = await axios.get(`${API_URL}/${empresaId}`);
      setFuncionarios(Array.isArray(response.data) ? response.data : []);
    } catch (erro) {
      console.error("Erro ao buscar equipe:", erro);
    } finally {
      setCarregando(false);
    }
  }, [empresaId]);

  useEffect(() => {
    carregarFuncionarios();
  }, [carregarFuncionarios]);

  const abrirModal = (func = null) => {
    if (func) {
      setEditando(func);
      setForm({
        nome: func.nome,
        email: func.email || '',
        telefone: func.telefone || '',
        senha: '', // Senha não deve ser retornada/editada assim
        foto: func.foto || '',
        role: func.role || 'PROFISSIONAL',
        horariosDeTrabalho: func.horariosDeTrabalho || {
          segunda: [["09:00", "18:00"]],
          terca: [["09:00", "18:00"]],
          quarta: [["09:00", "18:00"]],
          quinta: [["09:00", "18:00"]],
          sexta: [["09:00", "18:00"]],
          sabado: [["09:00", "12:00"]],
          domingo: []
        }
      });
    } else {
      setEditando(null);
      setForm({ 
        nome: '', 
        email: '', 
        telefone: '', 
        senha: '', 
        foto: '',
        role: 'PROFISSIONAL',
        horariosDeTrabalho: {
          segunda: [["09:00", "18:00"]],
          terca: [["09:00", "18:00"]],
          quarta: [["09:00", "18:00"]],
          quinta: ["09:00", "18:00"],
          sexta: ["09:00", "18:00"],
          sabado: ["09:00", "12:00"],
          domingo: []
        }
      });
    }
    setModalAberto(true);
  };

  const salvarFuncionario = async (e) => {
    e.preventDefault();
    setEstaSalvando(true);
    try {
      const dados = { ...form, empresaId };
      
      if (editando) {
        await axios.put(`${API_URL}/${editando.id}`, dados);
      } else {
        await axios.post(API_URL, dados);
      }
      
      setModalAberto(false);
      carregarFuncionarios();
    } catch (erro) {
      alert(erro.response?.data?.erro || "Erro ao salvar funcionário.");
    } finally {
      setEstaSalvando(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limite
        alert("A imagem é muito grande! Escolha uma de até 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, foto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTurnoDia = (diaId) => {
    const novosHorarios = { ...form.horariosDeTrabalho };
    if (novosHorarios[diaId] && novosHorarios[diaId].length > 0) {
      novosHorarios[diaId] = [];
    } else {
      novosHorarios[diaId] = [["09:00", "18:00"]];
    }
    setForm({ ...form, horariosDeTrabalho: novosHorarios });
  };

  const handleHorarioChange = (diaId, turnoIndex, timeIndex, valor) => {
    const novosHorarios = { ...form.horariosDeTrabalho };
    novosHorarios[diaId][turnoIndex][timeIndex] = valor;
    setForm({ ...form, horariosDeTrabalho: novosHorarios });
  };

  const adicionarTurno = (diaId) => {
    const novosHorarios = { ...form.horariosDeTrabalho };
    novosHorarios[diaId] = [...(novosHorarios[diaId] || []), ["13:00", "18:00"]];
    setForm({ ...form, horariosDeTrabalho: novosHorarios });
  };

  const removerTurno = (diaId, index) => {
    const novosHorarios = { ...form.horariosDeTrabalho };
    novosHorarios[diaId] = novosHorarios[diaId].filter((_, i) => i !== index);
    setForm({ ...form, horariosDeTrabalho: novosHorarios });
  };

  const itemsFiltrados = funcionarios.filter(f => 
    f.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Gestão da Equipe</h1>
          <p className="text-slate-500 font-medium">Cadastre profissionais e defina seus acessos mobile.</p>
        </div>
        <button 
          onClick={() => abrirModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20}/> Novo Profissional
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome..."
          className="flex-1 bg-transparent border-none outline-none font-medium text-slate-600"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Lista de Profissionais */}
      {carregando ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-100 text-slate-400 font-bold uppercase tracking-widest text-xs">
          <Loader2 className="animate-spin mb-4 text-indigo-500" size={32} />
          Carregando equipe...
        </div>
      ) : itemsFiltrados.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
            <UserCheck size={40} />
          </div>
          <h3 className="text-lg font-black text-slate-800">Nenhum profissional</h3>
          <p className="text-slate-400 max-w-xs">Adicione barbeiros e profissionais para começarem a usar a agenda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itemsFiltrados.map(f => (
            <div key={f.id} className="group bg-white p-6 rounded-[2rem] border-2 border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 font-black text-2xl overflow-hidden group-hover:scale-105 transition-transform">
                    {f.foto ? <img src={f.foto} alt={f.nome} className="w-full h-full object-cover" /> : f.nome.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{f.nome}</h3>
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{f.role || 'Profissional'}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => abrirModal(f)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-slate-50 bg-slate-50/50"><Edit size={16}/></button>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-3 text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                  <Mail size={16} />
                  <span className="text-xs font-bold truncate">{f.email || 'Não cadastrado'}</span>
                </div>
                <div className="flex items-center gap-3 text-indigo-600 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/30">
                  <Smartphone size={16} />
                  <span className="text-xs font-black">{f.telefone || 'Sem acesso celular'}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                 <span>Status</span>
                 <span className="flex items-center gap-1.5 text-emerald-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Ativo
                 </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h2 className="text-2xl font-black text-slate-800">{editando ? 'Editar Acesso' : 'Adicionar Membro'}</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Credenciais de Equipe</p>
               </div>
               <button onClick={() => setModalAberto(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-100 bg-white/50"><X size={24} className="text-slate-400" /></button>
            </div>
            
            <form onSubmit={salvarFuncionario} className="p-8 space-y-6">
               <div className="flex justify-center mb-8">
                  <div 
                    className="relative group cursor-pointer"
                    onClick={() => document.getElementById('foto-input').click()}
                  >
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 transition-all overflow-hidden">
                       {form.foto ? (
                         <img src={form.foto} alt="Preview" className="w-full h-full object-cover" />
                       ) : (
                         <Camera size={32} />
                       )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                       <Plus size={16} />
                    </div>
                    <input 
                      id="foto-input"
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                    <input 
                      required
                      placeholder="Ex: João Barbeiro"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                      value={form.nome}
                      onChange={e => setForm({...form, nome: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail (Opcional)</label>
                     <input 
                       type="email"
                       placeholder="equipe@barbearia.com"
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                       value={form.email}
                       onChange={e => setForm({...form, email: e.target.value})}
                     />
                   </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Smartphone size={10}/> Telefone (Login)</label>
                      <input 
                        required
                        placeholder="(00) 00000-0000"
                        className="w-full bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-4 text-sm font-black text-indigo-700 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                        value={form.telefone}
                        onChange={e => setForm({...form, telefone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Lock size={10}/> Senha</label>
                      <input 
                        required={!editando}
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                        value={form.senha}
                        onChange={e => setForm({...form, senha: e.target.value})}
                      />
                    </div>
                  </div>
               </div>

               {/* Expediente do Profissional */}
               <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Clock size={12} /> Horários de Trabalho
                  </h3>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {DIAS_SEMANA.map(dia => (
                       <div key={dia.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-black uppercase text-slate-500">{dia.label}</span>
                             <button 
                                type="button"
                                onClick={() => toggleTurnoDia(dia.id)}
                                className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg transition-all ${form.horariosDeTrabalho[dia.id]?.length > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}
                             >
                                {form.horariosDeTrabalho[dia.id]?.length > 0 ? 'Trabalha' : 'Folga'}
                             </button>
                          </div>

                          {form.horariosDeTrabalho[dia.id]?.length > 0 && (
                             <div className="space-y-2">
                                {form.horariosDeTrabalho[dia.id].map((turno, tIdx) => (
                                   <div key={tIdx} className="flex items-center gap-2">
                                      <input 
                                         type="time" 
                                         value={turno[0]}
                                         onChange={(e) => handleHorarioChange(dia.id, tIdx, 0, e.target.value)}
                                         className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700 w-24"
                                      />
                                      <span className="text-[9px] font-bold text-slate-300">até</span>
                                      <input 
                                         type="time" 
                                         value={turno[1]}
                                         onChange={(e) => handleHorarioChange(dia.id, tIdx, 1, e.target.value)}
                                         className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700 w-24"
                                      />
                                      {tIdx > 0 && (
                                         <button 
                                            type="button"
                                            onClick={() => removerTurno(dia.id, tIdx)}
                                            className="text-rose-400 hover:text-rose-600 p-1"
                                         >
                                            <Trash size={14} />
                                         </button>
                                      )}
                                   </div>
                                ))}
                                {form.horariosDeTrabalho[dia.id].length < 2 && (
                                   <button 
                                      type="button"
                                      onClick={() => adicionarTurno(dia.id)}
                                      className="text-[9px] font-black text-indigo-500 hover:text-indigo-700 flex items-center gap-1 mt-1"
                                   >
                                      <Plus size={10} /> Adicionar Turno (Almoço)
                                   </button>
                                )}
                             </div>
                          )}
                       </div>
                    ))}
                  </div>
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
                     disabled={estaSalvando}
                     className="flex-[2] px-6 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95 text-sm uppercase tracking-widest disabled:bg-slate-200"
                  >
                     {estaSalvando ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20} /> {editando ? 'Salvar Acesso' : 'Criar Profissional'}</>}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
