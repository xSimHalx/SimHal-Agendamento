import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Lock, Shield } from 'lucide-react';

export default function NavegacaoDebug() {
  const localizacao = useLocation();

  const links = [
    { path: '/', label: 'Agendamento', icon: Calendar },
    { path: '/login', label: 'Login', icon: Lock },
    { path: '/admin', label: 'Painel Admin', icon: Shield },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-slate-200 px-6 py-3 rounded-full shadow-2xl z-[9999] flex gap-8 items-center">
      {links.map((link) => {
        const Icone = link.icon;
        const ativo = localizacao.pathname === link.path;
        return (
          <Link 
            key={link.path} 
            to={link.path}
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${ativo ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Icone size={18} />
            <span className="hidden sm:inline">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
