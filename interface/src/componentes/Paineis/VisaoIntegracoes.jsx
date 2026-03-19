import React, { useState, useEffect } from 'react';
import { 
    Link as LinkIcon, Calendar, Instagram, CreditCard, 
    CheckCircle2, ArrowRight, XCircle, Settings2, 
    Globe, Key, Zap, Info, Loader2, Save, Smartphone, RefreshCw
} from 'lucide-react';
import axios from 'axios';

export default function VisaoIntegracoes({ empresaId }) {
    const [carregando, setCarregando] = useState(true);
    const [estaSalvando, setEstaSalvando] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [statusConexao, setStatusConexao] = useState('disconnected'); // 'open', 'close', 'connecting', 'disconnected'
    
    const [form, setForm] = useState({
        msgBoasVindasAtiva: false,
        msgLembreteAtiva: false
    });

    const API_BASE = 'http://localhost:3001/api/negocio';

    useEffect(() => {
        const carregarConfig = async () => {
            if (!empresaId) return;
            try {
                const res = await axios.get(`${API_BASE}/info/pelo-id/${empresaId}`);
                setForm({
                    msgBoasVindasAtiva: res.data.msgBoasVindasAtiva || false,
                    msgLembreteAtiva: res.data.msgLembreteAtiva || false
                });

                // Verificar status inicial do WhatsApp
                const resStatus = await axios.get(`${API_BASE}/whatsapp/status/${empresaId}`);
                setStatusConexao(resStatus.data.status);
            } catch (erro) {
                console.error("Erro ao carregar integrações:", erro);
            } finally {
                setCarregando(false);
            }
        };
        carregarConfig();
    }, [empresaId]);

    // Polling de status quando o QR Code está aberto
    useEffect(() => {
        let timer;
        if (qrCode && statusConexao !== 'open') {
            timer = setInterval(async () => {
                try {
                    const res = await axios.get(`${API_BASE}/whatsapp/status/${empresaId}`);
                    if (res.data.status === 'open') {
                        setStatusConexao('open');
                        setQrCode(null);
                        clearInterval(timer);
                    }
                } catch (e) {}
            }, 5000);
        }
        return () => clearInterval(timer);
    }, [qrCode, statusConexao, empresaId]);

    const handleGerarQr = async () => {
        setEstaSalvando(true);
        try {
            const res = await axios.get(`${API_BASE}/whatsapp/qrcode/${empresaId}`);
            setQrCode(res.data.base64);
        } catch (erro) {
            alert("Erro ao conectar com o servidor de WhatsApp. Verifique se ele está rodando.");
        } finally {
            setEstaSalvando(false);
        }
    };

    const handleDesconectar = async () => {
        if (!window.confirm("Tem certeza que deseja desconectar seu WhatsApp? As automações pararão de funcionar.")) return;
        setEstaSalvando(true);
        try {
            await axios.delete(`${API_BASE}/whatsapp/desconectar/${empresaId}`);
            setStatusConexao('disconnected');
            setQrCode(null);
        } catch (erro) {
            alert("Erro ao desconectar.");
        } finally {
            setEstaSalvando(false);
        }
    };

    const salvarToggles = async () => {
        try {
            await axios.put(`${API_BASE}/info/${empresaId}`, form);
            setSucesso(true);
            setTimeout(() => setSucesso(false), 3000);
        } catch (e) {
            alert("Erro ao salvar gatilhos.");
        }
    };

    if (carregando) {
        return (
            <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-100 text-slate-400 font-bold uppercase tracking-widest text-xs">
                <Loader2 className="animate-spin mb-4 text-indigo-500" size={32} />
                Sincronizando portal de automação...
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <LinkIcon className="text-indigo-600" /> App & Integrações
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Transforme o SimHal no cérebro do seu negócio.</p>
                </div>
                {sucesso && (
                    <div className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-xl flex items-center gap-2 border border-emerald-100 animate-in slide-in-from-top-4">
                        <CheckCircle2 size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Configurações Salvas!</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* WHATSAPP CENTRALIZADO */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden ring-1 ring-white/10 shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Zap size={140} />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                            {/* AREA DO QR CODE OU STATUS */}
                            <div className="flex-shrink-0">
                                {statusConexao === 'open' ? (
                                    <div className="w-48 h-48 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-[2rem] flex flex-col items-center justify-center text-emerald-400 gap-3">
                                        <Smartphone size={48} className="animate-bounce" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Conectado</span>
                                    </div>
                                ) : qrCode ? (
                                    <div className="p-3 bg-white rounded-[2rem] shadow-2xl relative group">
                                        <img src={qrCode.startsWith('data') ? qrCode : `data:image/png;base64,${qrCode}`} alt="QR Code" className="w-40 h-40" />
                                        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-[2rem]">
                                            <RefreshCw size={24} className="text-slate-800 animate-spin" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-48 h-48 bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-white/20 gap-3">
                                        <Smartphone size={40} />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-center px-4">Aparelho<br/>Desconectado</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-2 h-2 rounded-full ${statusConexao === 'open' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></div>
                                        <h3 className="text-xl font-black tracking-tight">Automação WhatsApp SIMHAL</h3>
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium">Conecte o WhatsApp da sua empresa para enviar confirmações automáticas.</p>
                                </div>

                                {statusConexao === 'open' ? (
                                    <button 
                                        onClick={handleDesconectar}
                                        className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 px-6 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2"
                                    >
                                        <XCircle size={18} /> Desconectar Aparelho
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleGerarQr}
                                        disabled={estaSalvando}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-3"
                                    >
                                        {estaSalvando ? <Loader2 size={18} className="animate-spin" /> : <><RefreshCw size={18} /> {qrCode ? 'Atualizar QR Code' : 'Gerar QR Code de Conexão'}</>}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* TOGGLES */}
                        <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div>
                                    <p className="text-xs font-black">Confirmação (Boas-vindas)</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Dispara assim que o cliente agendar</p>
                                </div>
                                <button 
                                    onClick={() => { setForm(f => ({...f, msgBoasVindasAtiva: !f.msgBoasVindasAtiva})); salvarToggles(); }}
                                    className={`w-12 h-6 rounded-full relative transition-all ${form.msgBoasVindasAtiva ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.msgBoasVindasAtiva ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 opacity-50">
                                <div>
                                    <p className="text-xs font-black">Lembrete Automático (2h antes)</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Reduza as faltas dos clientes</p>
                                </div>
                                <div className="bg-amber-400/20 text-amber-400 text-[8px] font-black px-2 py-0.5 rounded-md uppercase">Em breve</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 flex items-start gap-4">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <Info size={18} />
                        </div>
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                            <strong>Dica de Segurança:</strong> Ao escanear o código, seu WhatsApp será integrado ao SimHal. 
                            Use este recurso apenas para mensagens de serviço (agendamentos). O uso para propagandas em massa pode causar o bloqueio do seu número pelo WhatsApp.
                        </p>
                    </div>
                </div>

                {/* OUTRAS INTEGRAÇÕES (SIDEBAR) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                            <Calendar size={24} />
                        </div>
                        <h3 className="text-md font-black text-slate-800 mb-1">Google Agenda</h3>
                        <p className="text-[11px] text-slate-500 font-medium mb-6 leading-relaxed">Sincronize seus agendamentos diretamente com a agenda do seu celular.</p>
                        <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">Ativar Agora</button>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
                        <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mb-4">
                            <Instagram size={24} />
                        </div>
                        <h3 className="text-md font-black text-slate-800 mb-1">Botão no Instagram</h3>
                        <p className="text-[11px] text-slate-500 font-medium mb-6 leading-relaxed">Transforme seu perfil em uma máquina de reservas com o botão oficial.</p>
                        <button className="w-full py-3 bg-indigo-50 text-indigo-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all">Ver Tutorial</button>
                    </div>
                </div>
            </div>
        </div>
    );
}