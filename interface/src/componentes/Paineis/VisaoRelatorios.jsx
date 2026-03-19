import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    Download,
    TrendingUp,
    Users,
    Scissors,
    Calendar,
    Award,
    Loader2
} from 'lucide-react';
import axios from 'axios';

const CORES_PIE = ['#4f46e5', '#10b981', '#f59e0b', '#0ea5e9', '#64748b'];

export default function VisaoRelatorios({ empresaId }) {
    const [periodo, setPeriodo] = useState('mes_atual');
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);

    const carregarEstatisticas = async () => {
        try {
            setCarregando(true);
            const res = await axios.get(`http://localhost:3001/api/negocio/relatorios/estatisticas/${empresaId}?periodo=${periodo}`);
            setDados(res.data);
        } catch (erro) {
            console.error("Erro ao carregar relatórios:", erro);
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        if (empresaId) carregarEstatisticas();
    }, [empresaId, periodo]);

    const formatarMoeda = (valorCentavos) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorCentavos / 100);
    };

    if (carregando || !dados) {
        return (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p className="font-bold uppercase tracking-widest text-xs tracking-widest">Processando métricas...</p>
            </div>
        );
    }

    const { kpis, desempenhoEquipe, rankingServicos } = dados;

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Relatórios Analíticos</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Métricas de desempenho e inteligência do negócio.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={periodo}
                        onChange={(e) => setPeriodo(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm cursor-pointer"
                    >
                        <option value="mes_atual">Este Mês</option>
                        <option value="ultimos_30">Últimos 30 dias</option>
                        <option value="ano_atual">Este Ano</option>
                    </select>
                    <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-slate-200 active:scale-95 text-sm">
                        <Download size={18} />
                        Exportar PDF
                    </button>
                </div>
            </div>

            {/* KPIs (Indicadores Chave) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Ticket Médio */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket Médio</p>
                            <h3 className="text-3xl font-black text-indigo-600 mt-2">{formatarMoeda(kpis.ticketMedio)}</h3>
                            <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-1">
                                <TrendingUp size={14} /> Média por atendimento
                            </p>
                        </div>
                        <div className="p-4 bg-indigo-50 text-indigo-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <TrendingUp size={28} />
                        </div>
                    </div>
                </div>

                {/* Total de Atendimentos */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atendimentos Concluídos</p>
                            <h3 className="text-3xl font-black text-slate-800 mt-2">{kpis.totalAtendimentos}</h3>
                            <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-1">
                                <Calendar size={14} /> Serviços finalizados
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 text-slate-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <Users size={28} />
                        </div>
                    </div>
                </div>

                {/* Faturamento Bruto */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faturamento Período</p>
                            <h3 className="text-3xl font-black text-emerald-600 mt-2">{formatarMoeda(kpis.faturamentoBruto)}</h3>
                            <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-1">
                                Soma total (CONCLUÍDOS)
                            </p>
                        </div>
                        <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <Scissors size={28} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico 1: Desempenho por Barbeiro */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Award size={20} /></div>
                        <div>
                            <h2 className="text-lg font-black text-slate-800 tracking-tight">Desempenho da Equipe</h2>
                            <p className="text-xs text-slate-400 font-bold">Produção individual no período</p>
                        </div>
                    </div>

                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={desempenhoEquipe} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="nome" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }} width={100} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value, name) => [name === 'Faturamento' ? formatarMoeda(value) : value, name]}
                                />
                                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
                                <Bar dataKey="atendimentos" name="Serviços" fill="#4f46e5" radius={[0, 6, 6, 0]} barSize={20} />
                                <Bar dataKey="faturamento" name="Faturamento (R$)" fill="#10b981" radius={[0, 6, 6, 0]} barSize={10} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gráfico 2: Ranking de Serviços */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Scissors size={20} /></div>
                        <div>
                            <h2 className="text-lg font-black text-slate-800 tracking-tight">Serviços Mais Procurados</h2>
                            <p className="text-xs text-slate-400 font-bold">Distribuição por quantidade</p>
                        </div>
                    </div>

                    <div className="h-80 w-full">
                        {rankingServicos.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-300 font-bold uppercase text-xs">Sem dados no período</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={rankingServicos}
                                        cx="50%"
                                        cy="40%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {rankingServicos.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CORES_PIE[index % CORES_PIE.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 800 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}