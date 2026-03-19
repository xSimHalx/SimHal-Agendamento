import React, { useState } from 'react';
import { HelpCircle, MessageCircle, PlayCircle, FileText, X, Send, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';
import API_URL from '../../servicos/api';

export default function VisaoSuporte({ empresaId }) {
    const [modalAberto, setModalAberto] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [form, setForm] = useState({ assunto: '', mensagem: '', prioridade: 'NORMAL' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setEnviando(true);
            await axios.post(`${API_URL}/api/negocio/suporte/chamados`, {
                ...form,
                empresaId
            });
            setSucesso(true);
            setTimeout(() => {
                setSucesso(false);
                setModalAberto(false);
                setForm({ assunto: '', mensagem: '', prioridade: 'NORMAL' });
            }, 3000);
        } catch (erro) {
            alert("Erro ao enviar chamado. Tente novamente mais tarde.");
        } finally {
            setEnviando(false);
        }
    };
    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <HelpCircle className="text-indigo-600" /> Central de Ajuda
                </h1>
                <p className="text-slate-500 text-sm font-medium mt-1">Precisa de ajuda com o sistema? Estamos aqui para você.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Contato Direto */}
                <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] flex flex-col items-center text-center hover:shadow-lg transition-all cursor-pointer group">
                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-200">
                        <MessageCircle size={32} />
                    </div>
                    <h3 className="text-lg font-black text-emerald-900 mb-2">Suporte via WhatsApp</h3>
                    <p className="text-sm text-emerald-700 font-medium mb-6">Fale diretamente com nossa equipe de sucesso do cliente.</p>
                    <button 
                        onClick={() => setModalAberto(true)}
                        className="mt-auto px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors w-full"
                    >
                        Chamar no Chat
                    </button>
                </div>

                {/* Vídeos */}
                <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] flex flex-col items-center text-center hover:shadow-lg transition-all cursor-pointer group">
                    <div className="w-16 h-16 bg-slate-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <PlayCircle size={32} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-2">Vídeos Tutoriais</h3>
                    <p className="text-sm text-slate-500 font-medium mb-6">Aprenda a configurar seu negócio, serviços e profissionais em minutos.</p>
                    <button className="mt-auto px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors w-full">
                        Assistir
                    </button>
                </div>

                {/* Documentação */}
                <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] flex flex-col items-center text-center hover:shadow-lg transition-all cursor-pointer group">
                    <div className="w-16 h-16 bg-slate-100 text-amber-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-2">Base de Conhecimento</h3>
                    <p className="text-sm text-slate-500 font-medium mb-6">Artigos completos detalhando cada funcionalidade do painel.</p>
                    <button className="mt-auto px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors w-full">
                        Ler Artigos
                    </button>
                </div>
            </div>


            {/* Modal Abrir Chamado */}
            {modalAberto && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {sucesso ? (
                            <div className="p-12 text-center space-y-4">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800">Chamado Aberto!</h3>
                                <p className="text-sm text-slate-500 font-medium">Nossa equipe entrará em contato em breve através do seu e-mail cadastrado.</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Novo Chamado</h3>
                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Explique o seu problema ou dúvida</p>
                                    </div>
                                    <button onClick={() => setModalAberto(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assunto</label>
                                        <input 
                                            required
                                            value={form.assunto}
                                            onChange={e => setForm({...form, assunto: e.target.value})}
                                            placeholder="Ex: Erro ao cancelar agendamento"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prioridade</label>
                                        <select 
                                            value={form.prioridade}
                                            onChange={e => setForm({...form, prioridade: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black focus:ring-4 focus:ring-indigo-50 outline-none transition-all cursor-pointer"
                                        >
                                            <option value="NORMAL">Normal</option>
                                            <option value="URGENTE">Urgente (Problema técnico)</option>
                                            <option value="SUGESTAO">Sugestão de funcionalidade</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensagem Detalhada</label>
                                        <textarea 
                                            required
                                            value={form.mensagem}
                                            onChange={e => setForm({...form, mensagem: e.target.value})}
                                            rows={4}
                                            placeholder="Conte-nos o que está acontecendo..."
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-slate-300 resize-none"
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={enviando}
                                        className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-black/10 hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {enviando ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Enviar Chamado</>}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}