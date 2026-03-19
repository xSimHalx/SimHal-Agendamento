import React, { useState, useEffect } from 'react';
import { Zap, MessageSquare, Clock, Gift, ToggleLeft, ToggleRight, Star, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function VisaoAutomacao({ empresaId }) {
    const [regras, setRegras] = useState({
        autoLembrete: true,
        autoAniversario: false,
        autoAvaliacao: true,
        autoBloqueioFalta: false
    });
    const [carregando, setCarregando] = useState(true);

    const carregarConfiguracoes = async () => {
        try {
            setCarregando(true);
            const res = await axios.get(`http://localhost:3001/api/negocio/automacao/${empresaId}`);
            setRegras(res.data);
        } catch (erro) {
            console.error("Erro ao carregar automações:", erro);
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        if (empresaId) carregarConfiguracoes();
    }, [empresaId]);

    const toggleRegra = async (campo) => {
        const novoValor = !regras[campo];
        try {
            // Atualização otimista
            setRegras(prev => ({ ...prev, [campo]: novoValor }));
            await axios.patch(`http://localhost:3001/api/negocio/automacao/${empresaId}`, {
                campo,
                valor: novoValor
            });
        } catch (erro) {
            alert("Erro ao atualizar regra de automação.");
            setRegras(prev => ({ ...prev, [campo]: !novoValor }));
        }
    };

    const automacoes = [
        {
            id: 'autoLembrete',
            titulo: 'Lembrete de Agendamento',
            descricao: 'Envia uma mensagem no WhatsApp do cliente 2 horas antes do horário marcado para evitar esquecimentos.',
            icone: Clock,
            cor: 'text-blue-500',
            bg: 'bg-blue-50'
        },
        {
            id: 'autoAvaliacao',
            titulo: 'Pesquisa de Satisfação',
            descricao: 'Envia uma mensagem pedindo avaliação (1 a 5 estrelas) no dia seguinte ao atendimento concluído.',
            icone: Star,
            cor: 'text-amber-500',
            bg: 'bg-amber-50'
        },
        {
            id: 'autoAniversario',
            titulo: 'Feliz Aniversário Automático',
            descricao: 'Manda os parabéns com um possível cupom de desconto na data de nascimento do cliente.',
            icone: Gift,
            cor: 'text-rose-500',
            bg: 'bg-rose-50'
        },
        {
            id: 'autoBloqueioFalta',
            titulo: 'Proteção contra No-Show',
            descricao: 'Bloqueia automaticamente clientes de agendarem online se faltarem (status Cancelado pelo Salão) 3 vezes.',
            icone: Zap,
            cor: 'text-indigo-500',
            bg: 'bg-indigo-50'
        }
    ];

    if (carregando) {
        return (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p className="font-bold uppercase tracking-widest text-xs tracking-widest text-center">Carregando regras inteligentes...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Zap className="text-amber-500" /> Regras de Automação
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Deixe o sistema trabalhar por você nos bastidores.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {automacoes.map((auto) => {
                    const Icone = auto.icone;
                    const ativo = regras[auto.id];

                    return (
                        <div key={auto.id} className={`p-6 rounded-[2rem] border-2 transition-all flex items-start gap-4 ${ativo ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-70'}`}>
                            <div className={`p-3 rounded-2xl ${auto.bg} ${auto.cor} shrink-0`}>
                                <Icone size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-black text-slate-800">{auto.titulo}</h3>
                                    <button onClick={() => toggleRegra(auto.id)} className={`transition-colors ${ativo ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-400'}`}>
                                        {ativo ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                    </button>
                                </div>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{auto.descricao}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}