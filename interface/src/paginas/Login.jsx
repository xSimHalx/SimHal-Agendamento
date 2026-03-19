// ==========================================
// TELA DE AUTENTICAÇÃO DO SISTEMA SAAS (SimHal)
// Padrão: Sliding Overlay (Animação de Deslizamento)
// ==========================================

import React, { useState } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, 
  CalendarDays, ArrowRight, Loader2, ShieldCheck, User, Store, ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../servicos/api';

const API_BASE = `${API_URL}/api/autenticacao`;

export default function Login() {
  const navegar = useNavigate();
  // ==========================================
  // ESTADOS (Memória do Componente)
  // ==========================================
  const [estaNoLogin, setEstaNoLogin] = useState(true);
  const [estaCarregando, setEstaCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Estados Form Login
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');

  // Estados Form Cadastro
  const [nomeRegistro, setNomeRegistro] = useState('');
  const [empresaRegistro, setEmpresaRegistro] = useState('');
  const [emailRegistro, setEmailRegistro] = useState('');
  const [senhaRegistro, setSenhaRegistro] = useState('');

  // ==========================================
  // FUNÇÕES DE AÇÃO
  // ==========================================
  const tratarAutenticacao = async (e) => {
    e.preventDefault(); 
    setEstaCarregando(true);

    try {
      if (estaNoLogin) {
        const resposta = await axios.post(`${API_BASE}/login`, {
          email: emailLogin,
          senha: senhaLogin
        });
        
        localStorage.setItem('@SimHal:token', resposta.data.token);
        localStorage.setItem('@SimHal:usuario', JSON.stringify(resposta.data.usuario));
        alert('Bem-vindo ao sistema!');
        navegar('/admin');
      } else {
        await axios.post(`${API_BASE}/registrar`, {
          nome: nomeRegistro,
          empresa: empresaRegistro,
          email: emailRegistro,
          senha: senhaRegistro
        });
        alert('Cadastro realizado! Agora você pode fazer login.');
        setEstaNoLogin(true);
      }
    } catch (erro) {
      alert(erro.response?.data?.erro || 'Ocorreu um erro na autenticação.');
    } finally {
      setEstaCarregando(false);
    }
  };

  const alternarModo = () => {
    setEstaNoLogin(!estaNoLogin);
    setMostrarSenha(false);
  };

  // ==========================================
  // COMPONENTES DE FORMULÁRIO
  // ==========================================
  const renderizarFormularioLogin = () => (
    <form onSubmit={tratarAutenticacao} className="space-y-5">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Bem-vindo de volta!</h1>
        <p className="text-slate-500 text-sm">Faça login no sistema SimHal para gerenciar sua barbearia.</p>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">E-mail de Acesso</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="text-slate-400" size={18} /></div>
          <input type="email" required placeholder="admin@barbearia.com" value={emailLogin} onChange={(e) => setEmailLogin(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 font-medium" />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-bold text-slate-700">Senha</label>
          <button type="button" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Esqueceu a senha?</button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="text-slate-400" size={18} /></div>
          <input type={mostrarSenha ? "text" : "password"} required placeholder="••••••••" value={senhaLogin} onChange={(e) => setSenhaLogin(e.target.value)} className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 font-medium" />
          <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600 transition-colors">
            {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={estaCarregando || !emailLogin || !senhaLogin} className="w-full flex items-center justify-center bg-slate-900 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors mt-2">
        {estaCarregando ? <><Loader2 size={20} className="animate-spin mr-2" />Autenticando...</> : <>Entrar no Painel <ArrowRight size={20} className="ml-2" /></>}
      </button>

      <p className="mt-8 text-center text-sm text-slate-500">
        Ainda não tem uma conta?{' '}
        <button type="button" onClick={alternarModo} className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Cadastre sua barbearia</button>
      </p>
    </form>
  );

  const renderizarFormularioRegistro = () => (
    <form onSubmit={tratarAutenticacao} className="space-y-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Crie sua conta</h1>
        <p className="text-slate-500 text-sm">Comece a gerenciar seu negócio como um profissional hoje mesmo.</p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-bold text-slate-700 mb-1">Seu Nome</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="text-slate-400" size={18} /></div>
            <input type="text" required placeholder="Ex: SimHal" value={nomeRegistro} onChange={(e) => setNomeRegistro(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 font-medium text-sm" />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-slate-700 mb-1">Nome do Negócio</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Store className="text-slate-400" size={18} /></div>
            <input type="text" required placeholder="Sua Barbearia" value={empresaRegistro} onChange={(e) => setEmpresaRegistro(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 font-medium text-sm" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">E-mail Corporativo</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="text-slate-400" size={18} /></div>
          <input type="email" required placeholder="contato@barbearia.com" value={emailRegistro} onChange={(e) => setEmailRegistro(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 font-medium text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Crie uma Senha</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="text-slate-400" size={18} /></div>
          <input type={mostrarSenha ? "text" : "password"} required placeholder="Mínimo 8 caracteres" value={senhaRegistro} onChange={(e) => setSenhaRegistro(e.target.value)} className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 font-medium text-sm" />
          <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600 transition-colors">
            {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={estaCarregando || !nomeRegistro || !empresaRegistro || !emailRegistro || !senhaRegistro} className="w-full flex items-center justify-center bg-indigo-600 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors mt-4">
        {estaCarregando ? <><Loader2 size={20} className="animate-spin mr-2" />Criando conta...</> : <>Iniciar meu Teste Grátis <ArrowRight size={20} className="ml-2" /></>}
      </button>

      <p className="mt-6 text-center text-sm text-slate-500">
        Já possui uma conta?{' '}
        <button type="button" onClick={alternarModo} className="font-bold text-slate-800 hover:text-indigo-600 transition-colors">Faça Login</button>
      </p>
    </form>
  );

  // ==========================================
  // RENDERIZAÇÃO DA TELA (Layout Principal)
  // ==========================================
  return (
    // Container Principal: Overflow Hidden evita barras de rolagem durante a animação
    <div className="min-h-screen relative font-sans bg-white overflow-hidden flex flex-col lg:block">
      
      {/* ==========================================
          LADO 1: O FORMULÁRIO BRANCO
          z-10: Fica na camada de baixo no Desktop
          ========================================== */}
      <div 
        className={`
          w-full lg:w-1/2 min-h-screen flex flex-col justify-center
          px-8 sm:px-16 lg:px-24 py-12
          lg:absolute lg:top-0
          transition-transform duration-[800ms] ease-in-out z-10
          bg-white overflow-y-auto
          ${estaNoLogin ? 'lg:translate-x-0' : 'lg:translate-x-full'}
        `}
      >
        <div className="max-w-md w-full mx-auto">
          {/* Botão Voltar */}
          <button 
            onClick={() => navegar('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-sm mb-8 transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Voltar para lojas parceiras
          </button>

          {/* Logo fixa */}
          <div className="flex items-center gap-2 mb-10">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-colors duration-[800ms] ${estaNoLogin ? 'bg-indigo-600 shadow-indigo-200' : 'bg-slate-900 shadow-slate-200'}`}>
              <CalendarDays className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">SimHal</span>
          </div>

          {/* O "key" forca o React a dar fade no formulário enquanto o painel desliza */}
          <div key={estaNoLogin ? 'login' : 'registro'} className="animate-in fade-in duration-700">
            {estaNoLogin ? renderizarFormularioLogin() : renderizarFormularioRegistro()}
          </div>
        </div>
      </div>

      {/* ==========================================
          LADO 2: O PAINEL ESCURO DE BRANDING
          z-20 e shadow-2xl: Desliza por CIMA do formulário
          ========================================== */}
      <div 
        className={`
          hidden lg:flex lg:w-1/2 min-h-screen
          lg:absolute lg:top-0
          transition-transform duration-[800ms] ease-in-out z-20
          shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)]
          ${estaNoLogin ? 'lg:translate-x-full' : 'lg:translate-x-0'}
          bg-slate-900 relative overflow-hidden items-center justify-center
        `}
      >
        {/* Efeitos de fundo visuais */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-slate-900 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0"></div>
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

        <div className="relative z-10 max-w-lg px-8 text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20">
            <ShieldCheck className="text-indigo-400" size={40} />
          </div>
          
          {/* Animação suave para os textos da marca */}
          <div key={estaNoLogin ? 'texto-login' : 'texto-registro'} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
              {estaNoLogin ? (
                <>Gestão inteligente para negócios <span className="text-indigo-400">exigentes.</span></>
              ) : (
                <>Sua barbearia no <span className="text-emerald-400">piloto automático.</span></>
              )}
            </h2>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              {estaNoLogin 
                ? "O SimHal unifica sua agenda, controle financeiro e retenção de clientes em uma única plataforma na nuvem."
                : "Abandone o papel e a caneta. Crie sua conta grátis agora e veja a mágica acontecer na retenção dos seus clientes."}
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 py-3 px-6 rounded-full inline-flex">
            <div className="flex -space-x-3">
              <img src="https://i.pravatar.cc/100?img=33" alt="Usuário" className="w-8 h-8 rounded-full border-2 border-slate-900" />
              <img src="https://i.pravatar.cc/100?img=47" alt="Usuário" className="w-8 h-8 rounded-full border-2 border-slate-900" />
              <img src="https://i.pravatar.cc/100?img=12" alt="Usuário" className="w-8 h-8 rounded-full border-2 border-slate-900" />
            </div>
            <p className="text-sm font-medium text-slate-300">
              Junte-se a mais de <strong className="text-white">1.000+</strong> donos de salão.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
