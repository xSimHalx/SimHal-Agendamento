// ==========================================
// PAINEL PRINCIPAL DO SAAS DE AGENDAMENTO
// Desenvolvido em React com Tailwind CSS
// ==========================================

import React, { useState } from 'react';
import axios from 'axios';
import {
  Menu, X, Plus, Edit, Trash2, Download, CheckCircle, XCircle, Search, Bell, UserCircle,
  LayoutDashboard, CalendarDays, Users, Briefcase, UserCheck,
  DollarSign, BarChart3, Megaphone, CreditCard, Settings,
  Link as LinkIcon, Zap, ShieldAlert, HelpCircle, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../servicos/api';

// Importação das Visões (Paineis)
import VisaoPainel from '../componentes/Paineis/VisaoPainel';
import VisaoAgenda from '../componentes/Paineis/VisaoAgenda';
import VisaoClientes from '../componentes/Paineis/VisaoClientes';
import VisaoServicos from '../componentes/Paineis/VisaoServicos';
import VisaoFuncionarios from '../componentes/Paineis/VisaoFuncionarios';
import VisaoConfiguracoes from '../componentes/Paineis/VisaoConfiguracoes';
import VisaoFinanceiro from '../componentes/Paineis/VisaoFinanceiro';
import VisaoRelatorios from '../componentes/Paineis/VisaoRelatorios';
import VisaoMarketing from '../componentes/Paineis/VisaoMarketing';
import VisaoAssinatura from '../componentes/Paineis/VisaoAssinatura';
import VisaoIntegracoes from '../componentes/Paineis/VisaoIntegracoes';
import VisaoAutomacao from '../componentes/Paineis/VisaoAutomacao';
import VisaoAuditoria from '../componentes/Paineis/VisaoAuditoria';
import VisaoSuporte from '../componentes/Paineis/VisaoSuporte';
import VisaoEmConstrucao from '../componentes/Paineis/VisaoEmConstrucao';

import { useTermos } from '../hooks/useTermos';

const CORES_TEMA = {
  indigo: { primary: '#4f46e5', secondary: '#4338ca', gradient: 'from-indigo-600 to-indigo-800' },
  rose: { primary: '#e11d48', secondary: '#be123c', gradient: 'from-rose-600 to-rose-800' },
  emerald: { primary: '#10b981', secondary: '#047857', gradient: 'from-emerald-600 to-emerald-800' },
  slate: { primary: '#334155', secondary: '#1e293b', gradient: 'from-slate-700 to-slate-900' }
};

const ITENS_MENU = [
  { id: 'painel', label: 'Painel', icon: LayoutDashboard },
  { id: 'agenda', label: 'Agenda', icon: CalendarDays },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'servicos', label: 'Serviços', icon: Briefcase },
  { id: 'funcionarios', label: 'Funcionários', icon: UserCheck },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'assinatura', label: 'Assinatura (SaaS)', icon: CreditCard },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
  { id: 'integracoes', label: 'Integrações', icon: LinkIcon },
  { id: 'automacao', label: 'Automação', icon: Zap },
  { id: 'auditoria', label: 'Auditoria / Logs', icon: ShieldAlert },
  { id: 'suporte', label: 'Suporte', icon: HelpCircle },
];

// ==========================================
// COMPONENTES DE ESTRUTURA (SIDEBAR E HEADER)
// ==========================================
function MenuLateral({ abaAtiva, setAbaAtiva, estaAberto, setEstaAberto, usuario }) {
  const t = useTermos(usuario?.empresa);
  
  const itensFiltrados = ITENS_MENU.filter(item => {
    if (usuario?.role === 'PROFISSIONAL') {
      return ['agenda', 'suporte'].includes(item.id);
    }
    return true;
  });

  const getLabelDinamica = (id, labelPadrao) => {
    if (id === 'funcionarios') return t.Profissionais;
    if (id === 'servicos') return t.Servicos;
    if (id === 'clientes') return t.Clientes;
    if (id === 'agenda') return t.Agenda;
    return labelPadrao;
  };

  return (
    <>
      {estaAberto && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setEstaAberto(false)} />}
      <aside className={`fixed lg:static top-0 left-0 z-50 h-full w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out flex flex-col ${estaAberto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 flex flex-col border-b border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-white flex items-center gap-2">
              {usuario?.empresa?.logo ? (
                <img src={usuario.empresa.logo} className="w-8 h-8 object-cover rounded-lg" alt="Logo" />
              ) : (
                <CalendarDays className="text-primary" />
              )}
              <span className="truncate max-w-[140px] text-sm uppercase tracking-tighter">
                {usuario?.empresa?.nome || 'SimHal SaaS'}
              </span>
            </span>
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setEstaAberto(false)}><X size={20} /></button>
          </div>
          <div className="mt-2 px-1">
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
                Acesso: {usuario?.role || 'Carregando...'}
             </span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2 custom-scrollbar">
          {itensFiltrados.length > 0 ? itensFiltrados.map((item) => {
            const Icone = item.icon;
            const ativo = abaAtiva === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setAbaAtiva(item.id); setEstaAberto(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${ativo ? 'bg-primary text-white shadow-lg shadow-black/20' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <Icone size={18} className={ativo ? 'text-white' : 'text-slate-400'} /> {getLabelDinamica(item.id, item.label)}
              </button>
            );
          }) : (
            <div className="p-4 text-center text-xs text-slate-500 italic">Nenhum item disponível</div>
          )}
        </nav>
      </aside>
    </>
  );
}

function Cabecalho({ setEstaAberto, nomeEmpresa, usuario }) {
  const navegar = useNavigate();
  const t = useTermos(usuario?.empresa);

  const handleLogout = () => {
    localStorage.removeItem('@SimHal:token');
    localStorage.removeItem('@SimHal:usuario');
    navegar('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 shadow-sm z-30">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-slate-500 hover:text-slate-800" onClick={() => setEstaAberto(true)}><Menu size={24} /></button>
        <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">Painel de Controle</h2>
      </div>
      <div className="flex items-center gap-4">
        <DropdownNotificacoes empresaId={usuario?.empresaId} />
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          {usuario?.role === 'ADMIN' && (
            <button
              onClick={() => {
                const url = `${window.location.origin}/${usuario?.empresa?.slug}`;
                navigator.clipboard.writeText(url);
                alert('Link de agendamento copiado: ' + url);
              }}
              className="flex items-center gap-2 bg-[var(--cor-light)] text-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:brightness-95 transition-all border border-primary/20"
            >
              <LinkIcon size={14} /> {t.CopiarLink || 'Copiar Link Público'}
            </button>
          )}
          <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{nomeEmpresa}</p>
            <p className="text-xs text-slate-500">
              {usuario?.role === 'ADMIN' ? 'Dono (Admin)' : 
               usuario?.role === 'PROFISSIONAL' ? t.Profissional : 'Operador'}
            </p>
          </div>
          <UserCircle size={32} className="text-slate-400" />
          <button
            onClick={handleLogout}
            title="Sair do Sistema"
            className="ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default function PainelAdmin() {
  const [abaAtiva, setAbaAtiva] = useState('painel');
  const [menuLateralAberto, setMenuLateralAberto] = useState(false);
  const [empresa, setEmpresa] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const tema = CORES_TEMA[usuario?.empresa?.corPrimaria] || CORES_TEMA.indigo;

  React.useEffect(() => {
    const dadosUsuario = localStorage.getItem('@SimHal:usuario');
    const token = localStorage.getItem('@SimHal:token');

    if (!dadosUsuario || !token) {
      window.location.href = '/login';
      return;
    }

    const user = JSON.parse(dadosUsuario);
    setUsuario(user);

    if (user.role === 'PROFISSIONAL') {
      setAbaAtiva('agenda');
    }

    const carregarEmpresa = async () => {
      try {
        console.log("Usuário logado:", user);
        if (!user.empresaId) {
          console.error("ERRO: empresaId não encontrado no usuário logado.");
          // Se não tem empresaId, o login foi incompleto. Vamos forçar re-login.
          localStorage.removeItem('@SimHal:usuario');
          window.location.href = '/login';
          return;
        }

        // Agora buscamos pela empresa associada ao usuário logado
        const resInfo = await axios.get(`${API_URL}/api/negocio/info/pelo-id/${user.empresaId}`);
        setEmpresa(resInfo.data);
      } catch (erro) {
        console.error("Erro ao carregar dados do admin:", erro);
        if (erro.response?.status === 404) {
          localStorage.removeItem('@SimHal:usuario');
          localStorage.removeItem('@SimHal:token');
          window.location.href = '/login';
        }
      } finally {
        setCarregando(false);
      }
    };
    carregarEmpresa();
  }, []);

  const renderizarConteudo = () => {
    if (carregando) return <div className="p-8 text-center text-slate-500 animate-pulse">Carregando dados da empresa...</div>;
    if (!empresa) return <div className="p-8 text-center text-red-500">Erro ao carregar empresa. Verifique se o servidor está rodando.</div>;

    const secaoProibida = usuario?.role === 'PROFISSIONAL' && !['agenda', 'suporte', 'clientes'].includes(abaAtiva);
    const abaEfetiva = secaoProibida ? 'agenda' : abaAtiva;

    switch (abaEfetiva) {
      case 'painel': return <VisaoPainel usuario={{ ...usuario, empresa }} setAbaAtiva={setAbaAtiva} />;
      case 'agenda': return <VisaoAgenda empresa={empresa} profissionalId={usuario?.role === 'PROFISSIONAL' ? usuario.id : null} />;
      case 'clientes': return <VisaoClientes empresa={empresa} />;
      case 'servicos': return <VisaoServicos empresa={empresa} />;
      case 'funcionarios': return <VisaoFuncionarios empresa={empresa} />;
      case 'configuracoes': return <VisaoConfiguracoes empresaId={empresa.id} />;
      case 'financeiro': return <VisaoFinanceiro empresaId={empresa.id} />;
      case 'relatorios': return <VisaoRelatorios empresaId={empresa.id} />;
      case 'marketing': return <VisaoMarketing empresaId={empresa.id} />;
      case 'assinatura': return <VisaoAssinatura empresaId={empresa.id} />;
      case 'integracoes': return <VisaoIntegracoes empresaId={empresa.id} />;
      case 'automacao': return <VisaoAutomacao empresaId={empresa.id} />;
      case 'auditoria': return <VisaoAuditoria empresaId={empresa.id} />;
      case 'suporte': return <VisaoSuporte empresaId={empresa.id} />;
      default:
        const item = ITENS_MENU.find(i => i.id === abaAtiva);
        return <VisaoEmConstrucao titulo={item ? item.label : 'Página'} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
          --cor-primaria: ${tema.primary};
          --cor-secundaria: ${tema.secondary};
          --cor-light: ${tema.primary}15; /* 15 opacidade para o light */
        }
        .bg-primary { background-color: var(--cor-primaria); }
        .text-primary { color: var(--cor-primaria); }
        .border-primary { border-color: var(--cor-primaria); }
        .hover-bg-primary:hover { background-color: var(--cor-secundaria); }
      `}} />

      <MenuLateral
        abaAtiva={abaAtiva}
        setAbaAtiva={setAbaAtiva}
        estaAberto={menuLateralAberto}
        setEstaAberto={setMenuLateralAberto}
        usuario={{ ...usuario, empresa }}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Cabecalho
          setEstaAberto={setMenuLateralAberto}
          nomeEmpresa={empresa?.nome}
          usuario={{ ...usuario, empresa }}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {renderizarConteudo()}
        </main>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
    </div>
  );
}

function DropdownNotificacoes({ empresaId }) {
  const [aberto, setAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const fetchNotificacoes = async () => {
    try {
      setCarregando(true);
      const response = await axios.get(`${API_URL}/api/negocio/notificacoes/${empresaId}`);
      setNotificacoes(response.data);
    } catch (e) {
      console.error("Erro ao buscar notificações:", e);
    } finally {
      setCarregando(false);
    }
  };

  const marcarComoLidas = async () => {
    try {
      await axios.put(`${API_URL}/api/negocio/notificacoes/lidas/${empresaId}`);
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
    } catch (e) {
      console.error("Erro ao marcar como lidas:", e);
    }
  };

  React.useEffect(() => {
    if (empresaId) {
      fetchNotificacoes();
      const interval = setInterval(fetchNotificacoes, 30000); // Polling simples a cada 30s
      return () => clearInterval(interval);
    }
  }, [empresaId]);

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <div className="relative">
      <button 
        onClick={() => {
          setAberto(!aberto);
          if (!aberto && naoLidas > 0) marcarComoLidas();
        }}
        className="relative p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
      >
        <Bell size={20} />
        {naoLidas > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
            {naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-800 text-sm">Notificações</h3>
              {naoLidas > 0 && <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold">{naoLidas} novas</span>}
            </div>
            
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {carregando && notificacoes.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium">Carregando...</div>
              ) : (notificacoes.length === 0) ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto text-slate-200 mb-2" size={32} />
                  <p className="text-slate-400 text-xs font-medium">Nenhuma notificação por aqui.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {notificacoes.map(n => (
                    <div key={n.id} className={`p-4 hover:bg-slate-50 transition-colors cursor-default ${!n.lida ? 'bg-indigo-50/30' : ''}`}>
                      <div className="flex gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          n.tipo === 'SUCCESS' ? 'bg-emerald-500' :
                          n.tipo === 'WARNING' ? 'bg-amber-500' :
                          n.tipo === 'DANGER' ? 'bg-rose-500' : 'bg-indigo-500'
                        }`} />
                        <div>
                          <p className="text-xs font-black text-slate-800 mb-0.5">{n.titulo}</p>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{n.mensagem}</p>
                          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">
                            {new Date(n.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest transition-colors">
                Ver todo o histórico
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
