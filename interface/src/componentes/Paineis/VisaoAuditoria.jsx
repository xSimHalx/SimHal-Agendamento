import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock, Search, Filter, Loader2 } from 'lucide-react';
import axios from 'axios';
import API_URL from '../../servicos/api';

export default function VisaoAuditoria({ empresaId }) {
    const [logs, setLogs] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [busca, setBusca] = useState('');

    const carregarLogs = async () => {
        try {
            setCarregando(true);
            const res = await axios.get(`${API_URL}/api/negocio/auditoria/logs/${empresaId}`);
            setLogs(res.data);
        } catch (erro) {
            console.error("Erro ao carregar logs:", erro);
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        if (empresaId) carregarLogs();
    }, [empresaId]);

    const logsFiltrados = logs.filter(l => 
        l.acao.toLowerCase().includes(busca.toLowerCase()) || 
        l.usuario.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <ShieldAlert className="text-rose-500" /> Auditoria e Logs
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Histórico de segurança detalhado. Saiba quem fez o quê.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar ocorrência..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 w-64"
                        />
                    </div>
                    <button className="p-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                                <th className="p-6">Data e Hora</th>
                                <th className="p-6">Usuário / Agente</th>
                                <th className="p-6">Descrição da Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {carregando ? (
                                <tr>
                                    <td colSpan="3" className="p-20 text-center">
                                        <Loader2 className="animate-spin inline-block text-indigo-500 mb-2" size={32} />
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Carregando histórico...</p>
                                    </td>
                                </tr>
                            ) : logsFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="p-20 text-center text-slate-300 font-bold uppercase text-xs tracking-widest italic">
                                        Nenhuma ocorrência encontrada...
                                    </td>
                                </tr>
                            ) : (
                                logsFiltrados.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-6 text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-2">
                                            <Clock size={14} className="opacity-50" /> {new Date(log.dataHora).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="p-6 text-sm font-black text-slate-700">
                                            {log.usuario}
                                        </td>
                                        <td className="p-6 text-sm font-medium text-slate-600">
                                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${log.tipo === 'DANGER' ? 'bg-rose-500' :
                                                    log.tipo === 'WARNING' ? 'bg-amber-500' : 'bg-indigo-500'
                                                }`}></span>
                                            {log.acao}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-400 font-medium">
                    Os logs de auditoria são mantidos por 90 dias.
                </div>
            </div>
        </div>
    );
}