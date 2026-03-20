import React, { useState, useEffect } from 'react';
import {
    CreditCard, CheckCircle2, Zap, Download,
    ShieldCheck, Crown, AlertCircle, CalendarDays,
    ArrowRight, Loader2, QrCode, ClipboardCheck
} from 'lucide-react';
import axios from 'axios';
import API_URL from '../../servicos/api';

const PLANOS = [
    {
        id: 'bronze',
        nome: 'SS Essencial',
        preco: 'R$ 49,90',
        precoOriginal: 'R$ 51,90',
        periodo: '/mês',
        descricao: 'O plano ideal para quem atende sozinho.',
        recursos: [
            '1 Profissional / Cadeira',
            'Agenda Online 24/7',
            'CRM de Clientes Básico',
            'Painel de Controle',
            'Suporte via Chat'
        ],
        recommended: false,
        cor: 'slate',
        icone: <Zap className="text-slate-400" size={32} />
    },
    {
        id: 'gold',
        nome: 'SS Premium',
        preco: 'R$ 55,90',
        precoOriginal: 'R$ 119,90',
        periodo: '/mês',
        descricao: 'Gestão de equipe e controle financeiro total.',
        recursos: [
            'Até 5 Profissionais',
            'Financeiro & Caixa',
            'Cálculo de Comissões',
            'Relatórios de Performance',
            'Cores da sua Marca'
        ],
        recommended: true,
        cor: 'amber',
        icone: <Crown className="text-amber-500" size={32} />
    },
    {
        id: 'diamond',
        nome: 'SS Black (Elite)',
        preco: 'R$ 119,00',
        precoOriginal: 'R$ 149,90',
        periodo: '/mês',
        descricao: 'Poder máximo, automação e site exclusivo.',
        recursos: [
            'Profissionais Ilimitados',
            'Mini Site / Landing Page',
            'Automação de WhatsApp',
            'Marketing (Fidelidade)',
            'Checkout Builder & API'
        ],
        recommended: false,
        cor: 'dark',
        icone: <ShieldCheck className="text-indigo-400" size={32} />
    }
];

export default function VisaoAssinatura({ empresaId }) {
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [abaAtiva, setAbaAtiva] = useState('visao_geral');
    const [upgrading, setUpgrading] = useState(false);
    const [showModalPagamento, setShowModalPagamento] = useState(false);
    const [planoSelecionado, setPlanoSelecionado] = useState(null);

    const carregarDados = async () => {
        try {
            setCarregando(true);
            const res = await axios.get(`${API_URL}/api/negocio/assinatura/${empresaId}`);
            setDados(res.data);
        } catch (erro) {
            console.error("Erro ao carregar assinatura:", erro);
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        if (empresaId) carregarDados();
    }, [empresaId]);

    const iniciarUpgrade = (plano) => {
        setPlanoSelecionado(plano);
        setShowModalPagamento(true);
    };

    const confirmarPagamento = async () => {
        try {
            setUpgrading(true);
            setShowModalPagamento(false);
            await axios.patch(`${API_URL}/api/negocio/assinatura/plano/${empresaId}`, {
                novoPlano: planoSelecionado.id.toUpperCase()
            });
            await carregarDados();
            alert(`Plano ${planoSelecionado.nome} ativado com sucesso!`);
        } catch (erro) {
            alert("Erro ao realizar upgrade.");
        } finally {
            setUpgrading(false);
        }
    };

    if (carregando) {
        return (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p className="font-bold uppercase tracking-widest text-xs tracking-widest text-center text-slate-400">Carregando dados financeiros...</p>
            </div>
        );
    }

    const planoBruto = dados?.plano?.toLowerCase() || 'trial';
    const planoAtual = {
        'starter': 'bronze',
        'pro': 'gold',
        'premium': 'diamond'
    }[planoBruto] || planoBruto;

    const nomesExibicao = {
        'bronze': 'SS Essencial',
        'gold': 'SS Premium',
        'diamond': 'SS Black (Elite)',
        'trial': 'Período de Teste'
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Crown className="text-amber-500" /> Minha Assinatura
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Gerencie seu plano, faturamento e limites do SimHal.</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-slate-200 active:scale-95 text-sm">
                    <CreditCard size={18} />
                    Atualizar Cartão
                </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-white p-1 rounded-2xl w-fit border border-slate-200 shadow-sm">
                <button
                    onClick={() => setAbaAtiva('visao_geral')}
                    className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${abaAtiva === 'visao_geral' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Visão Geral
                </button>
                <button
                    onClick={() => setAbaAtiva('faturas')}
                    className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${abaAtiva === 'faturas' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Histórico de Faturas
                </button>
            </div>

            {abaAtiva === 'visao_geral' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                    {/* Resumo do Plano Atual */}
                    <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-indigo-800">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

                        <div className="relative z-10 space-y-4 flex-1">
                            <div className="inline-flex items-center gap-1.5 bg-indigo-800/50 border border-indigo-700 px-3 py-1 rounded-full text-xs font-black tracking-widest text-indigo-200 uppercase">
                                <ShieldCheck size={14} /> Plano Ativo
                            </div>
                            <h2 className="text-2xl md:text-5xl font-black tracking-tight uppercase">SimHal {nomesExibicao[planoAtual] || planoAtual}</h2>
                            <p className="text-indigo-200 font-medium max-w-md italic">
                                {planoAtual === 'gold' ? 'Sua barbearia está crescendo com o poder do nível Premium.' : 
                                 planoAtual === 'diamond' ? 'Poder total: Você está no topo com o nível Black.' :
                                 'O nível Essencial para quem busca profissionalismo e organização.'}
                            </p>
                        </div>

                        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl w-full md:w-auto min-w-[280px]">
                            <p className="text-[10px] uppercase tracking-widest text-indigo-200 font-black mb-1">Próxima Cobrança</p>
                            <div className="flex items-end gap-2 mb-4">
                                <span className="text-3xl font-black">
                                    {planoAtual === 'bronze' ? 'R$ 39,90' : 
                                     planoAtual === 'gold' ? 'R$ 71,90' : 
                                     planoAtual === 'diamond' ? 'R$ 119,90' : 'Grátis'}
                                </span>
                                <span className="text-xs text-indigo-300 mb-1 font-bold">/mês</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-indigo-100 font-medium border-t border-white/10 pt-4 mb-4">
                                <CalendarDays size={16} /> {dados?.dataVencimento ? new Date(dados.dataVencimento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Vencimento não definido'}
                            </div>
                            <button className="w-full bg-white text-indigo-900 py-3 rounded-xl font-black text-sm hover:bg-indigo-50 transition-colors">
                                Gerenciar Assinatura
                            </button>
                        </div>
                    </div>

                    {/* Indicadores de Uso */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MetricaUso 
                            titulo="Profissionais" 
                            uso={dados?.metricas?.profissionais?.uso || 0} 
                            max={dados?.metricas?.profissionais?.max || 1} 
                            unidade="un"
                        />
                        <MetricaUso 
                            titulo="Serviços Ativos" 
                            uso={dados?.metricas?.servicos?.uso || 0} 
                            max={dados?.metricas?.servicos?.max || 3} 
                            unidade="un"
                        />
                        <MetricaUso 
                            titulo="Agendamentos/Mês" 
                            uso={dados?.metricas?.agendamentos?.uso || 0} 
                            max={dados?.metricas?.agendamentos?.max || 30} 
                            unidade="reservas"
                        />
                    </div>

                    {/* Planos Disponíveis */}
                    <div>
                        <div className="mb-6">
                            <h3 className="text-lg font-black text-slate-800">Evolua seu negócio</h3>
                            <p className="text-sm text-slate-500 font-medium">Faça upgrade quando precisar de mais recursos.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {PLANOS.map((plano) => (
                                <div
                                    key={plano.id}
                                    className={`p-8 rounded-[2.5rem] border-2 relative flex flex-col transition-all ${
                                        plano.id === 'diamond' 
                                            ? 'bg-slate-900 border-slate-800 text-white shadow-2xl' 
                                            : planoAtual === plano.id
                                                ? 'border-indigo-600 bg-indigo-50/30'
                                                : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
                                    } ${plano.recomendado && planoAtual !== plano.id ? 'shadow-xl shadow-indigo-100/50 border-indigo-200' : ''}`}
                                >
                                    {plano.recomendado && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm z-10">
                                            Mais Popular
                                        </div>
                                    )}

                                    <div className="mb-6 flex justify-between items-start">
                                        <div>
                                            <h4 className={`text-2xl font-black ${plano.id === 'diamond' ? 'text-white' : 'text-slate-800'}`}>{plano.nome}</h4>
                                            <p className={`text-xs font-medium mt-1 h-10 ${plano.id === 'diamond' ? 'text-slate-400' : 'text-slate-500'}`}>{plano.descricao}</p>
                                        </div>
                                        <div className={`p-3 rounded-2xl ${plano.id === 'diamond' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                            {plano.icone}
                                        </div>
                                    </div>

                                    <div className="mb-6 flex flex-col">
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-4xl font-black ${plano.id === 'diamond' ? 'text-white' : 'text-slate-900'}`}>{plano.preco}</span>
                                            <span className={`text-sm font-bold ${plano.id === 'diamond' ? 'text-slate-400' : 'text-slate-500'}`}>{plano.periodo}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-400 line-through font-bold">{plano.precoOriginal}</span>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                                plano.id === 'diamond' ? 'bg-indigo-500 text-white' : 'bg-emerald-50 text-emerald-500'
                                            }`}>Beta -20%</span>
                                        </div>
                                    </div>

                                    <button
                                        disabled={planoAtual === plano.id || upgrading}
                                        onClick={() => iniciarUpgrade(plano)}
                                        className={`w-full py-3 rounded-xl font-black text-sm transition-all mb-8 ${planoAtual === plano.id
                                                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                                : plano.recomendado
                                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'
                                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                            }`}
                                    >
                                        {upgrading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 
                                         planoAtual === plano.id ? 'Seu Plano Atual' : 'Fazer Upgrade'}
                                    </button>

                                    <div className="space-y-4 mt-auto">
                                        <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${plano.id === 'diamond' ? 'text-slate-500' : 'text-slate-400'}`}>O que está incluso</p>
                                        {plano.recursos.map((recurso, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <CheckCircle2 size={18} className={`shrink-0 ${
                                                    plano.id === 'diamond' 
                                                        ? 'text-indigo-400' 
                                                        : planoAtual === plano.id ? 'text-indigo-600' : 'text-slate-400'
                                                }`} />
                                                <span className={`text-sm font-bold ${plano.id === 'diamond' ? 'text-slate-300' : 'text-slate-600'}`}>{recurso}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {abaAtiva === 'faturas' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-lg font-black text-slate-800">Histórico de Pagamentos</h2>
                                <p className="text-xs text-slate-500 font-medium">Recibos das suas mensalidades do SimHal.</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                                        <th className="p-6 font-medium">Fatura</th>
                                        <th className="p-6 font-medium">Data</th>
                                        <th className="p-6 font-medium">Plano</th>
                                        <th className="p-6 font-medium">Status</th>
                                        <th className="p-6 font-medium text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(dados?.faturas || []).map((fatura, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-6">
                                                <p className="text-sm font-black text-slate-800">{fatura.codigo}</p>
                                                <p className="text-xs font-bold text-slate-400">R$ {(fatura.valor / 100).toFixed(2).replace('.', ',')}</p>
                                            </td>
                                            <td className="p-6 text-sm text-slate-600 font-bold">{new Date(fatura.data).toLocaleDateString('pt-BR')}</td>
                                            <td className="p-6">
                                                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-black uppercase">
                                                    {fatura.plano}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg w-fit">
                                                    <CheckCircle2 size={14} /> {fatura.status}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <button className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold transition-all text-xs">
                                                    <Download size={14} /> Recibo
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!dados?.faturas || dados.faturas.length === 0) && (
                                        <tr>
                                            <td colSpan="5" className="p-20 text-center text-slate-300 font-bold uppercase text-xs tracking-widest italic border-none">
                                                Nenhuma fatura encontrada...
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de Pagamento PIX */}
            {showModalPagamento && planoSelecionado && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <QrCode size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">Pagamento via PIX</h3>
                            <p className="text-sm text-slate-500 font-medium italic">Plano: <span className="text-indigo-600 font-bold uppercase">{planoSelecionado.nome}</span></p>
                            
                            {/* QR Code Fictício */}
                            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 aspect-square flex items-center justify-center relative group overflow-hidden">
                                <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-800">Demonstração</p>
                                </div>
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SimHalPaymentsMockPIX_${planoSelecionado.id}`} 
                                    alt="QR Code PIX"
                                    className="w-48 h-48 mix-blend-multiply opacity-80"
                                />
                            </div>

                            <div className="bg-indigo-50 p-4 rounded-2xl flex items-center justify-between gap-4 border border-indigo-100">
                                <div className="text-left overflow-hidden">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">PIX Copia e Cola</p>
                                    <p className="text-xs font-bold text-indigo-900 truncate">00020126330014BR.GOV.BCB.PIX0111SimHalSaaSApp...</p>
                                </div>
                                <button className="p-2 bg-white text-indigo-600 rounded-lg shadow-sm hover:bg-indigo-600 hover:text-white transition-all">
                                    <ClipboardCheck size={18} />
                                </button>
                            </div>

                            <div className="pt-6 grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setShowModalPagamento(false)}
                                    className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-sm transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={confirmarPagamento}
                                    className="py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                                >
                                    Já Paguei <ArrowRight size={16} />
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-4">O sistema reconhecerá o pagamento em até 1 minuto.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MetricaUso({ titulo, uso, max, unidade }) {
    const porcentagem = Math.min((uso / max) * 100, 100);
    const idLimitado = uso >= max;

    return (
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{titulo}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${idLimitado ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-600'}`}>
                    {uso} / {max >= 999 ? '∞' : max} {unidade}
                </span>
            </div>
            <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100/50">
                <div 
                    className={`h-full transition-all duration-1000 ${idLimitado ? 'bg-rose-400' : 'bg-indigo-500'}`} 
                    style={{ width: `${porcentagem}%` }}
                />
            </div>
            {idLimitado && (
                <p className="text-[9px] font-bold text-rose-400 animate-pulse text-center uppercase tracking-tight">Limite atingido! Considere upgrade.</p>
            )}
        </div>
    );
}