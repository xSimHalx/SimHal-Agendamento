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
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Plus, Loader2, X } from 'lucide-react';
import axios from 'axios';
import API_URL from '../../servicos/api';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function VisaoFinanceiro({ empresaId }) {
    const [transacoes, setTransacoes] = useState([]);
    const [resumo, setResumo] = useState({ totalEntradas: 0, totalSaidas: 0, saldoLiquido: 0 });
    const [carregando, setCarregando] = useState(true);
    const [modalAberto, setModalAberto] = useState(false);
    const [novaDespesa, setNovaDespesa] = useState({
        descricao: '',
        valor: '',
        categoria: 'Custo Fixo',
        data: format(new Date(), 'yyyy-MM-dd')
    });

    const carregarDados = async () => {
        try {
            setCarregando(true);
            const [resTrans, resResumo] = await Promise.all([
                axios.get(`${API_URL}/api/negocio/financeiro/transacoes/${empresaId}`),
                axios.get(`${API_URL}/api/negocio/financeiro/resumo/${empresaId}`)
            ]);
            setTransacoes(resTrans.data);
            setResumo(resResumo.data);
        } catch (erro) {
            console.error("Erro ao carregar dados financeiros:", erro);
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        if (empresaId) carregarDados();
    }, [empresaId]);

    const handleCriarDespesa = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/negocio/financeiro/transacoes`, {
                ...novaDespesa,
                empresaId,
                tipo: 'SAIDA',
                valor: Math.round(parseFloat(novaDespesa.valor.replace(',', '.')) * 100)
            });
            setModalAberto(false);
            setNovaDespesa({ descricao: '', valor: '', categoria: 'Custo Fixo', data: format(new Date(), 'yyyy-MM-dd') });
            carregarDados();
        } catch (erro) {
            alert("Erro ao salvar despesa.");
        }
    };

    // Preparar dados para o gráfico (Últimos 7 dias)
    const prepararDadosGrafico = () => {
        const hoje = new Date();
        const dias = eachDayOfInterval({
            start: startOfWeek(hoje, { weekStartsOn: 1 }),
            end: endOfWeek(hoje, { weekStartsOn: 1 })
        });

        return dias.map(dia => {
            const transacoesDia = transacoes.filter(t => isSameDay(parseISO(t.data), dia));
            return {
                dia: format(dia, 'eee', { locale: ptBR }),
                entradas: transacoesDia.filter(t => t.tipo === 'ENTRADA').reduce((acc, t) => acc + t.valor / 100, 0),
                saidas: transacoesDia.filter(t => t.tipo === 'SAIDA').reduce((acc, t) => acc + t.valor / 100, 0),
            };
        });
    };

    const formatarMoeda = (valorCentavos) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorCentavos / 100);
    };

    if (carregando) {
        return (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p className="font-bold uppercase tracking-widest text-xs">Sincronizando finanças...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Gestão Financeira</h1>
                    <p className="text-gray-500 text-sm">Visão completa de faturamento e despesas.</p>
                </div>
                <button 
                    onClick={() => setModalAberto(true)}
                    className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-rose-200 active:scale-95"
                >
                    <Plus size={20} />
                    Registrar Saída
                </button>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Entradas</p>
                            <h3 className="text-2xl font-black text-emerald-600 mt-1">{formatarMoeda(resumo.totalEntradas)}</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={100} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Saídas</p>
                            <h3 className="text-2xl font-black text-rose-600 mt-1">{formatarMoeda(resumo.totalSaidas)}</h3>
                        </div>
                        <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <TrendingDown size={24} />
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingDown size={100} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Líquido</p>
                            <h3 className={`text-2xl font-black mt-1 ${resumo.saldoLiquido >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                                {formatarMoeda(resumo.saldoLiquido)}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign size={100} />
                    </div>
                </div>
            </div>

            {/* Gráfico */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Fluxo de Caixa Semanal</h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full">Atualizado em tempo real</span>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={prepararDadosGrafico()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="dia" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tickFormatter={(valor) => `R$${valor}`} 
                                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                                cursor={{ fill: '#f8fafc' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
                            <Bar dataKey="entradas" name="Receitas" fill="#10b981" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="saidas" name="Despesas" fill="#ef4444" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Extrato de Transações */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Extrato Recente</h2>
                    <div className="flex gap-2">
                        <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-3 py-1 rounded-full uppercase">Entrada</span>
                        <span className="bg-rose-50 text-rose-600 text-[9px] font-black px-3 py-1 rounded-full uppercase">Saída</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                <th className="p-6 font-medium">Data</th>
                                <th className="p-6 font-medium">Descrição</th>
                                <th className="p-6 font-medium">Categoria</th>
                                <th className="p-6 font-medium text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {transacoes.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center text-slate-300 font-bold uppercase text-xs tracking-widest italic">
                                        Nenhuma transação registrada ainda...
                                    </td>
                                </tr>
                            ) : (
                                transacoes.map((transacao) => (
                                    <tr key={transacao.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-6 text-xs text-slate-500 font-bold">
                                            {format(parseISO(transacao.data), 'dd MMM, HH:mm', { locale: ptBR })}
                                        </td>
                                        <td className="p-6 text-sm text-slate-800 font-black">
                                            {transacao.descricao}
                                        </td>
                                        <td className="p-6">
                                            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter">
                                                {transacao.categoria}
                                            </span>
                                        </td>
                                        <td className={`p-6 text-sm font-black text-right ${transacao.tipo === 'ENTRADA' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {transacao.tipo === 'ENTRADA' ? '+' : '-'} {formatarMoeda(transacao.valor)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Nova Despesa */}
            {modalAberto && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-rose-50/30">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Nova Despesa</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Dinheiro saindo do caixa</p>
                            </div>
                            <button onClick={() => setModalAberto(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCriarDespesa} className="p-8 space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
                                <input 
                                    required
                                    value={novaDespesa.descricao}
                                    onChange={e => setNovaDespesa({...novaDespesa, descricao: e.target.value})}
                                    placeholder="Ex: Conta de Luz, Aluguel, Fornecedor..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-rose-50 outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor (R$)</label>
                                    <input 
                                        required
                                        value={novaDespesa.valor}
                                        onChange={e => setNovaDespesa({...novaDespesa, valor: e.target.value})}
                                        placeholder="0,00"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-rose-50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                                    <input 
                                        type="date"
                                        value={novaDespesa.data}
                                        onChange={e => setNovaDespesa({...novaDespesa, data: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-rose-50 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                                <select 
                                    value={novaDespesa.categoria}
                                    onChange={e => setNovaDespesa({...novaDespesa, categoria: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-rose-50 outline-none transition-all appearance-none"
                                >
                                    <option value="Custo Fixo">Custo Fixo (Aluguel, Luz)</option>
                                    <option value="Produtos">Produtos / Fornecedores</option>
                                    <option value="Marketing">Marketing / Tráfego</option>
                                    <option value="Manutenção">Manutenção / Limpeza</option>
                                    <option value="Outros">Outros</option>
                                </select>
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-black/10 hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
                            >
                                <Plus size={18} /> Confirmar Despesa
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}