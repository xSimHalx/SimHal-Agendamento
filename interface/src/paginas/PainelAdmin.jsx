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

// Importação das Visões (Paineis)
import VisaoPainel from '../componentes/Paineis/VisaoPainel';
import VisaoAgenda from '../componentes/Paineis/VisaoAgenda';
import VisaoClientes from '../componentes/Paineis/VisaoClientes';
import VisaoServicos from '../componentes/Paineis/VisaoServicos';
import VisaoFuncionarios from '../componentes/Paineis/VisaoFuncionarios';
import VisaoConfiguracoes from '../componentes/Paineis/VisaoConfiguracoes';
import VisaoEmConstrucao from '../componentes/Paineis/VisaoEmConstrucao';

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
  return (
    <>
      {estaAberto && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setEstaAberto(false)} />}
      <aside className={`fixed lg:static top-0 left-0 z-50 h-full w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out flex flex-col ${estaAberto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
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
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2 custom-scrollbar">
          {ITENS_MENU.filter(item => {
            if (usuario?.role === 'PROFISSIONAL') {
              return ['agenda', 'suporte'].includes(item.id);
            }
            return true;
          }).map((item) => {
            const Icone = item.icon;
            const ativo = abaAtiva === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setAbaAtiva(item.id); setEstaAberto(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${ativo ? 'bg-primary text-white shadow-lg shadow-black/20' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <Icone size={18} className={ativo ? 'text-white' : 'text-slate-400'} /> {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

function Cabecalho({ setEstaAberto, nomeEmpresa, usuario }) {
  const navegar = useNavigate();

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
        <button className="relative p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors">
          <Bell size={20} /><span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <button 
            onClick={() => {
              const url = `${window.location.origin}/${usuario?.empresa?.slug}`;
              navigator.clipboard.writeText(url);
              alert('Link de agendamento copiado: ' + url);
            }}
            className="flex items-center gap-2 bg-[var(--cor-light)] text-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:brightness-95 transition-all border border-primary/20"
          >
            <LinkIcon size={14} /> Copiar Link Público
          </button>
          <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{nomeEmpresa}</p>
            <p className="text-xs text-slate-500">Plano Pro ({usuario?.role === 'ADMIN' ? 'Super Admin' : 'Dono'})</p>
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
        const resInfo = await axios.get(`http://localhost:3001/api/negocio/info/pelo-id/${user.empresaId}`);
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

    switch (abaAtiva) {
      case 'painel': return <VisaoPainel usuario={{...usuario, empresa}} setAbaAtiva={setAbaAtiva} />;
      case 'agenda': return <VisaoAgenda empresaId={empresa.id} profissionalId={usuario?.role === 'PROFISSIONAL' ? usuario.id : null} />;
      case 'clientes': return <VisaoClientes empresaId={empresa.id} />;
      case 'servicos': return <VisaoServicos empresaId={empresa.id} />;
      case 'funcionarios': return <VisaoFuncionarios empresaId={empresa.id} />;
      case 'configuracoes': return <VisaoConfiguracoes empresaId={empresa.id} />;
      default: 
        const item = ITENS_MENU.find(i => i.id === abaAtiva);
        return <VisaoEmConstrucao titulo={item ? item.label : 'Página'} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <style dangerouslySetInnerHTML={{__html: `
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
        usuario={{...usuario, empresa}}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Cabecalho 
          setEstaAberto={setMenuLateralAberto} 
          nomeEmpresa={empresa?.nome} 
          usuario={{...usuario, empresa}}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {renderizarConteudo()}
        </main>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
    </div>
  );
}
