import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, Users, Calendar, DollarSign, 
  ArrowUpRight, ArrowDownRight, Clock, 
  MoreVertical, Plus, Zap, AlertCircle, Target, Loader2, Edit
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { format } from 'date-fns';

export default function VisaoPainel({ usuario, setAbaAtiva }) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [periodo, setPeriodo] = useState(7); // Dias selecionados
  const [menuAcoesAberto, setMenuAcoesAberto] = useState(false);
  const [estaProcessando, setEstaProcessando] = useState(false);
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [novaMeta, setNovaMeta] = useState(0);

  const CORES_CHART = {
    indigo: '#4f46e5',
    rose: '#e11d48',
    emerald: '#10b981',
    slate: '#334155'
  };

  const corTema = CORES_CHART[usuario?.empresa?.corPrimaria] || CORES_CHART.indigo;

  useEffect(() => {
    const empresaId = usuario?.empresa?.id;
    const carregarEstatisticas = async () => {
      setCarregando(true);
      try {
        const res = await axios.get(`http://localhost:3001/api/dashboard/estatisticas/${empresaId}?dias=${periodo}`);
        setDados(res.data);
      } catch (erro) {
        console.error("Erro ao carregar dashboard:", erro);
      } finally {
        setCarregando(false);
      }
    };

    if (empresaId) carregarEstatisticas();
  }, [usuario?.empresa?.id, periodo]);

  const executarAcaoRapida = async (tipo) => {
    setMenuAcoesAberto(false);
    setEstaProcessando(true);
    const empresaId = usuario?.empresa?.id;
    const agora = new Date();

    try {
      if (tipo === 'bloquear_hora') {
        const fim = new Date(agora.getTime() + 60 * 60 * 1000);
        await axios.post('http://localhost:3001/api/negocio/bloqueios', {
          empresaId,
          inicio: agora,
          fim,
          motivo: 'Bloqueio Rápido (1h)'
        });
        alert("Agenda bloqueada pela próxima hora!");
      } else if (tipo === 'fechar_hoje') {
        const fimDia = new Date();
        fimDia.setHours(23, 59, 59, 999);
        await axios.post('http://localhost:3001/api/negocio/bloqueios', {
          empresaId,
          inicio: agora,
          fim: fimDia,
          motivo: 'Fechamento de Emergência (Resto do dia)'
        });
        alert("Loja marcada como fechada para o restante do dia!");
      }
    } catch (erro) {
      console.error("Erro na ação rápida:", erro);
      alert("Não foi possível executar a ação.");
    } finally {
      setEstaProcessando(false);
    }
  };

  const salvarMeta = async () => {
    if (!novaMeta || novaMeta <= 0) return setEditandoMeta(false);
    setEstaProcessando(true);
    try {
      await axios.put(`http://localhost:3001/api/negocio/info/${usuario.empresaId}`, {
         metaMensal: parseInt(novaMeta)
      });
      await carregarDados(); // Recarregar KPIs
      setEditandoMeta(false);
    } catch (erro) {
      console.error("Erro ao salvar meta:", erro);
      alert("Erro ao atualizar meta.");
    } finally {
      setEstaProcessando(false);
    }
  };

  const { stats, graficoFaturamento, distribuicaoServicos, proximosAtendimentos } = dados || {};

  if (carregando) {
    return (
      <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
        <Loader2 className="animate-spin mb-4 text-primary" size={32} />
        Sincronizando estatísticas...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Cabeçalho de Boas-vindas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bem-vindo de volta! 👋</h1>
          <p className="text-slate-500">Acompanhe o desempenho do seu negócio em tempo real.</p>
        </div>
        <div className="flex gap-2 relative">
          <div className="relative">
            <button 
              disabled={estaProcessando}
              onClick={() => setMenuAcoesAberto(!menuAcoesAberto)}
              className={`flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 transition-all shadow-sm ${estaProcessando ? 'opacity-50' : ''}`}
            >
              {estaProcessando ? <Loader2 size={18} className="animate-spin text-amber-500" /> : <Zap size={18} className="text-amber-500" />} 
              Ações Rápidas
            </button>

            {menuAcoesAberto && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuAcoesAberto(false)}></div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                   <div className="p-2 space-y-1">
                      <button 
                         onClick={() => executarAcaoRapida('bloquear_hora')}
                         className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors"
                      >
                         <Clock size={16} className="text-amber-500" />
                         <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-700">Bloquear 1 Hora</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Impede novos agendamentos</span>
                         </div>
                      </button>
                      <button 
                         onClick={() => executarAcaoRapida('fechar_hoje')}
                         className="w-full text-left px-4 py-3 rounded-xl hover:bg-rose-50 flex items-center gap-3 transition-colors group"
                      >
                         <AlertCircle size={16} className="text-rose-400 group-hover:text-rose-500" />
                         <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-700 group-hover:text-rose-600">Fechar por Hoje</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Emergência / Indisponível</span>
                         </div>
                      </button>
                   </div>
                </div>
              </>
            )}
          </div>
          <button 
            onClick={() => setAbaAtiva('agenda')}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-md active:scale-95"
          >
            <Plus size={18} /> Novo Agendamento
          </button>
        </div>
      </div>

      {/* Cards de KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          titulo="Faturamento Hoje" 
          valor={`R$ ${((stats?.faturamentoHoje || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitulo={stats?.tendFaturamento > 0 ? "Em crescimento!" : "Abaixo de ontem"}
          tendencia={stats?.tendFaturamento > 0 ? "up" : stats?.tendFaturamento < 0 ? "down" : "neutral"}
          valorTendencia={`${Math.abs(Number(stats?.tendFaturamento) || 0)}%`}
          icone={<DollarSign className="text-emerald-600" />}
          cor="emerald"
        />
        <KPICard 
          titulo="Agendamentos" 
          valor={stats?.agendamentosHoje || 0}
          subtitulo={`${proximosAtendimentos?.length || 0} pendentes agora`}
          tendencia={stats?.tendAgendamentos > 0 ? "up" : stats?.tendAgendamentos < 0 ? "down" : "neutral"}
          valorTendencia={`${Math.abs(Number(stats?.tendAgendamentos) || 0)}%`}
          icone={<Calendar className="text-indigo-600" />}
          cor="indigo"
        />
        <KPICard 
          titulo="Novos Clientes" 
          valor={stats?.novosClientesHoje || 0}
          subtitulo="Comparado a ontem"
          tendencia={stats?.tendClientes > 0 ? "up" : stats?.tendClientes < 0 ? "down" : "neutral"}
          valorTendencia={`${Math.abs(Number(stats?.tendClientes) || 0)}%`}
          icone={<Users className="text-blue-600" />}
          cor="blue"
        />
        <div 
          onClick={() => {
            if (!editandoMeta) {
              setNovaMeta(stats?.metaMensal || 5000);
              setEditandoMeta(true);
            }
          }}
          className={`bg-white p-5 rounded-2xl border transition-all ${editandoMeta ? 'border-indigo-400 ring-4 ring-indigo-50 shadow-lg' : 'border-slate-200 shadow-sm hover:border-amber-400 cursor-pointer group'}`}
        >
          <div className="flex items-center justify-between mb-3 text-amber-600">
            <div className="p-2.5 rounded-xl bg-amber-50">
              <Target size={20} />
            </div>
            {!editandoMeta && <Edit size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
          </div>
          <p className="text-sm font-medium text-slate-500">Meta Mensal</p>
          <div className="mt-1">
             {editandoMeta ? (
               <div className="flex flex-col gap-2 mt-2 animate-in fade-in zoom-in-95 duration-200">
                 <input 
                   autoFocus
                   type="number" 
                   value={novaMeta}
                   onChange={e => setNovaMeta(e.target.value)}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-black text-slate-800 outline-none focus:border-indigo-500"
                   onKeyDown={e => {
                     if (e.key === 'Enter') salvarMeta();
                     if (e.key === 'Escape') setEditandoMeta(false);
                   }}
                 />
                 <div className="flex gap-2">
                   <button onClick={(e) => { e.stopPropagation(); salvarMeta(); }} className="flex-1 bg-indigo-600 text-white text-[10px] font-black uppercase py-2 rounded-lg hover:bg-indigo-700">Salvar</button>
                   <button onClick={(e) => { e.stopPropagation(); setEditandoMeta(false); }} className="flex-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase py-2 rounded-lg hover:bg-slate-200">Sair</button>
                 </div>
               </div>
             ) : (
               <>
                 <div className="flex justify-between items-baseline mb-1">
                    <span className="text-lg font-black text-slate-800">
                      {stats?.metaMensal > 0 ? (((stats?.faturadoMes / 100) / stats?.metaMensal) * 100).toFixed(0) : 0}%
                    </span>
                    <span className="text-[10px] text-slate-400">R$ {((stats?.faturadoMes || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / {(stats?.metaMensal || 5000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${stats?.metaMensal > 0 ? Math.min(((stats?.faturadoMes / 100) / stats?.metaMensal) * 100, 100) : 0}%` }}
                    />
                 </div>
               </>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de Faturamento */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800">Evolução de Faturamento</h2>
              <select 
                value={periodo} 
                onChange={(e) => setPeriodo(parseInt(e.target.value))}
                className="text-xs bg-slate-50 border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-600 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              >
                <option value={7}>Últimos 7 dias</option>
                <option value={15}>Últimos 15 dias</option>
                <option value={30}>Últimos 30 dias</option>
              </select>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={graficoFaturamento}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={corTema} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={corTema} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Faturamento']}
                  />
                  <Area type="monotone" dataKey="valor" stroke={corTema} strokeWidth={3} fillOpacity={1} fill="url(#colorValor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Pizza - Serviços mais procurados */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-6 font-display">Mix de Serviços</h2>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={distribuicaoServicos}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distribuicaoServicos?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? corTema : '#e2e8f0'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50">
              <p className="text-xs text-slate-400 text-center font-medium italic">Baseado nos últimos {periodo} dias</p>
            </div>
          </div>

          {/* Timeline de Próximos Atendimentos */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800">Próximos Hoje</h2>
                <button onClick={() => setAbaAtiva('agenda')} className="text-indigo-600 text-sm font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all">Ver todos</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {proximosAtendimentos?.length > 0 ? proximosAtendimentos.map((apt) => (
                  <div key={apt.id} className="p-4 rounded-xl border border-slate-50 hover:border-indigo-100 hover:shadow-sm transition-all bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-indigo-600 shadow-sm">
                        {apt.cliente.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{apt.cliente.nome}</p>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{apt.servico.nome}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-sm font-black text-slate-700 bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-100">{format(new Date(apt.dataHora), 'HH:mm')}</span>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 py-10 text-center">
                    <AlertCircle className="mx-auto text-slate-300 mb-2" size={40} />
                    <p className="text-slate-500 font-medium">Nenhum atendimento pendente para hoje.</p>
                  </div>
                )}
             </div>
          </div>

          {/* Novo card de Insight Rápido */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl text-white shadow-lg shadow-indigo-100 flex flex-col justify-between">
             <div className="flex justify-between items-start">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <TrendingUp size={24} />
                </div>
                <button className="text-white/60 hover:text-white transition-colors">
                  <MoreVertical size={20} />
                </button>
             </div>
             <div>
                <h3 className="text-lg font-bold mb-1">Dica de Performance</h3>
                <p className="text-sm text-indigo-100/80 mb-4">Seu serviço mais lucrativo é <b>{distribuicaoServicos?.[0]?.name || '...'}</b>. Considere criar uma promoção para horários de baixa demanda.</p>
                <button className="w-full py-2 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-md hover:bg-slate-50 active:scale-95 transition-all">
                  Ver Estratégias
                </button>
             </div>
          </div>
        </div>
    </div>
  );
}

function KPICard({ titulo, valor, subtitulo, tendencia, valorTendencia, icone, cor }) {
  const cores = {
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3 text-slate-400">
        <div className={`p-2.5 rounded-xl ${cores[cor]}`}>
          {icone}
        </div>
        <button className="hover:text-slate-600 transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{titulo}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-black text-slate-800">{valor}</p>
          {tendencia !== 'neutral' && (
            <span className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tendencia === 'up' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {tendencia === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              {valorTendencia}
            </span>
          )}
        </div>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
          {subtitulo}
        </p>
      </div>
    </div>
  );
}
