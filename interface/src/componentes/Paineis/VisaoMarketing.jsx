import React, { useState, useEffect } from 'react';
import {
    Megaphone, MessageCircle, Ticket, Plus,
    Search, AlertCircle, Clock, Copy, Check, Target, Loader2, X, Trash2
} from 'lucide-react';
import axios from 'axios';
import API_URL from '../../servicos/api';

export default function VisaoMarketing({ empresaId }) {
    const [abaAtiva, setAbaAtiva] = useState('retencao'); // 'retencao' ou 'cupons'
    const [busca, setBusca] = useState('');
    const [copiado, setCopiado] = useState(null);
    const [clientesSumidos, setClientesSumidos] = useState([]);
    const [cupons, setCupons] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [modalCupomAberto, setModalCupomAberto] = useState(false);
    
    const [novoCupom, setNovoCupom] = useState({
        codigo: '',
        desconto: '',
        tipo: 'PERCENTUAL',
        validade: '',
        limiteUso: 0
    });

    const carregarDados = async () => {
        try {
            setCarregando(true);
            const [resClientes, resCupons] = await Promise.all([
                axios.get(`${API_URL}/api/negocio/marketing/clientes-sumidos/${empresaId}`),
                axios.get(`${API_URL}/api/negocio/marketing/cupons/${empresaId}`)
            ]);
            setClientesSumidos(resClientes.data);
            setCupons(resCupons.data);
        } catch (erro) {
            console.error("Erro ao carregar dados de marketing:", erro);
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        if (empresaId) carregarDados();
    }, [empresaId]);

    const handleCriarCupom = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/negocio/marketing/cupons`, {
                ...novoCupom,
                empresaId
            });
            setModalCupomAberto(false);
            setNovoCupom({ codigo: '', desconto: '', tipo: 'PERCENTUAL', validade: '', limiteUso: 0 });
            carregarDados();
        } catch (erro) {
            alert(erro.response?.data?.erro || "Erro ao criar cupom.");
        }
    };

    const handleExcluirCupom = async (id) => {
        if (!confirm("Tem certeza que deseja excluir permanentemente este cupom?")) return;
        try {
            await axios.delete(`${API_URL}/api/negocio/marketing/cupons/${id}`);
            carregarDados();
        } catch (erro) {
            alert("Erro ao excluir cupom.");
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await axios.patch(`${API_URL}/api/negocio/marketing/cupons/${id}/toggle-status`);
            carregarDados();
        } catch (erro) {
            alert("Erro ao alterar status do cupom.");
        }
    };

    const gerarMensagemWA = (nome) => {
        const primeiroNome = nome.split(' ')[0];
        const cupomAtivo = cupons.find(c => c.status === 'ATIVO')?.codigo || 'VOLTA15';
        return encodeURIComponent(`Fala ${primeiroNome}, tudo beleza? 😎\n\nNotei que faz um tempinho que você não dá um trato no visual com a gente.\n\nPra te animar a voltar, preparei um cupom exclusivo de desconto: *${cupomAtivo}*\n\nBora agendar seu horário?`);
    };

    const abrirWhatsApp = (telefone, nome) => {
        const numeroLimpo = telefone.replace(/\D/g, '');
        const link = `https://wa.me/55${numeroLimpo}?text=${gerarMensagemWA(nome)}`;
        window.open(link, '_blank');
    };

    const copiarCodigo = (codigo) => {
        navigator.clipboard.writeText(codigo);
        setCopiado(codigo);
        setTimeout(() => setCopiado(null), 2000);
    };

    if (carregando) {
        return (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p className="font-bold uppercase tracking-widest text-xs tracking-widest text-center">Analisando base de clientes e campanhas...</p>
            </div>
        );
    }

    const inativosFiltrados = clientesSumidos.filter(c => 
        c.nome.toLowerCase().includes(busca.toLowerCase()) || 
        c.telefone.includes(busca)
    );

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Megaphone className="text-indigo-600" /> Marketing & CRM
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Ferramentas para trazer clientes de volta e aumentar o faturamento.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm relative z-0">
                <div className="flex p-1 bg-slate-100 rounded-2xl w-full md:w-auto">
                    <button
                        onClick={() => setAbaAtiva('retencao')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-black transition-all ${abaAtiva === 'retencao' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Target size={18} /> Clientes Sumidos
                    </button>
                    <button
                        onClick={() => setAbaAtiva('cupons')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-black transition-all ${abaAtiva === 'cupons' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Ticket size={18} /> Cupons de Desconto
                    </button>
                </div>
                <div className="relative w-full md:w-64 px-2">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Conteúdo: Retenção */}
            {abaAtiva === 'retencao' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                    <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-start gap-4">
                        <div className="p-3 bg-white rounded-2xl text-rose-500 shadow-sm">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-md font-black text-rose-800">Recupere o Faturamento Perdido</h3>
                            <p className="text-sm text-rose-600 font-medium mt-1">Baseado nos dados reais, estes clientes não agendam há mais de 30 dias. Utilize a ação direta de WhatsApp para oferecer um incentivo.</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                        <th className="p-6 font-medium">Cliente</th>
                                        <th className="p-6 font-medium">Última Visita</th>
                                        <th className="p-6 font-medium">Serviço Favorito</th>
                                        <th className="p-6 font-medium text-right">Ação Direta</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {inativosFiltrados.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="p-20 text-center text-slate-300 font-bold uppercase text-xs tracking-widest italic">
                                                Nenhum cliente sumido encontrado...
                                            </td>
                                        </tr>
                                    ) : (
                                        inativosFiltrados.map((cliente) => (
                                            <tr key={cliente.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="p-6">
                                                    <p className="text-sm font-black text-slate-800">{cliente.nome}</p>
                                                    <p className="text-xs font-bold text-slate-400">{cliente.telefone}</p>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} className="text-rose-400" />
                                                        <span className="text-sm font-bold text-rose-600">{cliente.diasSumido} dias</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{cliente.ultimaVisitada === 'Sem registros' ? 'Sem registros' : `Última em: ${cliente.ultimaVisita}`}</p>
                                                </td>
                                                <td className="p-6">
                                                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">
                                                        {cliente.servicoFavorito}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <button
                                                        onClick={() => abrirWhatsApp(cliente.telefone, cliente.nome)}
                                                        className="inline-flex items-center justify-center gap-2 bg-emerald-100 hover:bg-emerald-500 text-emerald-700 hover:text-white px-5 py-3 rounded-2xl font-black transition-all text-xs"
                                                    >
                                                        <MessageCircle size={18} /> Promover Reagendamento
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Conteúdo: Cupons */}
            {abaAtiva === 'cupons' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Card Novo Cupom */}
                        <div 
                            onClick={() => setModalCupomAberto(true)}
                            className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer min-h-[220px] group"
                        >
                            <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                                <Plus size={28} />
                            </div>
                            <h3 className="font-black text-slate-800 uppercase tracking-tight">Novo Cupom</h3>
                            <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest opacity-60 text-[9px]">Atraia ou fidelize clientes</p>
                        </div>

                        {/* Lista de Cupons */}
                        {cupons.map((cupom) => (
                            <div key={cupom.id} className={`p-8 rounded-[2.5rem] border relative overflow-hidden transition-all group ${cupom.status === 'ATIVO' ? 'bg-white border-slate-200 shadow-sm hover:border-indigo-200' : 'bg-slate-50 border-slate-100 opacity-70'}`}>

                                {/* Recorte Visual do Cupom */}
                                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-50 rounded-full border-r border-slate-200 -translate-y-1/2"></div>
                                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 rounded-full border-l border-slate-200 -translate-y-1/2"></div>

                                <div className="flex justify-between items-start mb-6">
                                    <div
                                        onClick={() => copiarCodigo(cupom.codigo)}
                                        className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-3 rounded-2xl font-black tracking-[0.2em] cursor-pointer hover:bg-indigo-100 transition-all active:scale-95"
                                        title="Copiar código"
                                    >
                                        <span className="text-sm">{cupom.codigo}</span>
                                        {copiado === cupom.codigo ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="opacity-30" />}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <button 
                                            onClick={() => handleToggleStatus(cupom.id)}
                                            className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all ${cupom.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-600 hover:bg-rose-100 hover:text-rose-600' : 'bg-slate-200 text-slate-500 hover:bg-emerald-100 hover:text-emerald-600'}`}
                                            title={cupom.status === 'ATIVO' ? 'Desativar Cupom' : 'Ativar Cupom'}
                                        >
                                            {cupom.status}
                                        </button>
                                        <button 
                                            onClick={() => handleExcluirCupom(cupom.id)}
                                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                            title="Excluir Permanentemente"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1 mb-6">
                                    <h4 className="text-4xl font-black text-slate-800">{cupom.tipo === 'PERCENTUAL' ? `${cupom.desconto}%` : `R$ ${cupom.desconto / 100}`} OFF</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Válido até {new Date(cupom.validade).toLocaleDateString('pt-BR')}</p>
                                </div>

                                <div className="pt-6 border-t border-dashed border-slate-200 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {cupom.limiteUso > 0 ? `Uso: ${cupom.usos} / ${cupom.limiteUso}` : 'Usos totais:'}
                                    </span>
                                    <span className="text-lg font-black text-slate-800 font-mono tracking-tighter">
                                        {cupom.usos}x
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal de Novo Cupom */}
            {modalCupomAberto && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Criar Promoção</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Defina as regras do seu cupom</p>
                            </div>
                            <button onClick={() => setModalCupomAberto(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCriarCupom} className="p-8 space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código do Cupom</label>
                                <input 
                                    required
                                    value={novoCupom.codigo}
                                    onChange={e => setNovoCupom({...novoCupom, codigo: e.target.value.toUpperCase()})}
                                    placeholder="Ex: BARBA10, VOLTAHOJE"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-slate-300 tracking-widest"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Desconto</label>
                                    <input 
                                        type="number"
                                        required
                                        value={novoCupom.desconto}
                                        onChange={e => setNovoCupom({...novoCupom, desconto: e.target.value})}
                                        placeholder="Ex: 10"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Válido Até</label>
                                    <input 
                                        type="date"
                                        required
                                        value={novoCupom.validade}
                                        onChange={e => setNovoCupom({...novoCupom, validade: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Limite <span className="text-[9px] opacity-60">(0=∞)</span></label>
                                    <input 
                                        type="number"
                                        value={novoCupom.limiteUso}
                                        onChange={e => setNovoCupom({...novoCupom, limiteUso: e.target.value})}
                                        placeholder="Ilimitado"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-black/10 hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
                            >
                                <Ticket size={18} /> Ativar Campanha
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}