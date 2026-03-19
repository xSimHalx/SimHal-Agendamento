import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, ArrowRight, Scissors, Star, ShieldCheck, Zap } from 'lucide-react';

export default function PaginaInicial() {
  const [empresas, setEmpresas] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const carregarEmpresas = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/negocio/todas');
        setEmpresas(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Erro ao carregar lojas:", error);
      } finally {
        setCarregando(false);
      }
    };
    carregarEmpresas();
  }, []);

  const empresasFiltradas = empresas.filter(emp => 
    emp.nome.toLowerCase().includes(busca.toLowerCase()) || 
    (emp.endereco && emp.endereco.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navbar Minimalista */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black italic">S</div>
            <span className="text-xl font-black text-slate-800 tracking-tight">SimHal<span className="text-indigo-600">.</span></span>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            Sou um Profissional
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-16 px-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full text-indigo-700 text-xs font-black uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap size={14} className="fill-indigo-600" />
            Agendamento Rápido & Fácil
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Encontre o estilo que <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">combina com você.</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
            Descubra as melhores barbearias e salões da sua região e agende seu horário em poucos cliques. Simples, rápido e no seu tempo.
          </p>

          {/* Barra de Busca Premium */}
          <div className="max-w-2xl mx-auto relative group animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
            <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center bg-white border-2 border-slate-100 p-2 rounded-[2rem] shadow-2xl shadow-slate-200 focus-within:border-indigo-500 transition-all">
              <Search className="ml-4 text-slate-400" size={24} />
              <input 
                type="text" 
                placeholder="Qual barbearia você está procurando?" 
                className="flex-1 bg-transparent border-none outline-none px-4 py-3 font-bold text-slate-800 placeholder:text-slate-400"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-[1.5rem] font-black shadow-lg shadow-indigo-100 transition-all active:scale-95 hidden md:block">
                Descobrir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Grid de Empresas */}
      <main className="max-w-7xl mx-auto px-6 pb-32">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Scissors className="text-indigo-600" />
            Estabelecimentos Disponíveis
          </h2>
          <span className="text-sm font-bold text-slate-400">{empresasFiltradas.length} parceiros encontrados</span>
        </div>

        {carregando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 h-80 animate-pulse">
                <div className="h-40 bg-slate-50 rounded-t-[2.5rem]"></div>
                <div className="p-8 space-y-4">
                  <div className="h-6 w-3/4 bg-slate-100 rounded-lg"></div>
                  <div className="h-4 w-1/2 bg-slate-50 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : empresasFiltradas.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Poxa, não encontramos nada!</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto">Tente buscar por um nome diferente ou confira se digitou corretamente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {empresasFiltradas.map((emp) => (
              <div 
                key={emp.id}
                onClick={() => navigate(`/${emp.slug}`)}
                className="group cursor-pointer bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 transition-all duration-500"
              >
                {/* Capa / Banner */}
                <div className="h-44 bg-indigo-50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  {emp.logo ? (
                    <img src={emp.logo} alt={emp.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-black text-6xl italic">
                      {emp.nome.charAt(0)}
                    </div>
                  )}
                  {/* Badge de Verificado */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck size={14} className="text-indigo-600" />
                    <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Verificado</span>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-8 relative">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{emp.nome}</h3>
                        <p className="flex items-center gap-1.5 text-slate-400 font-bold text-xs mt-1">
                          <MapPin size={12} />
                          {emp.endereco || "Endereço não informado"}
                        </p>
                     </div>
                     <div className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-2xl flex items-center gap-1 font-black text-sm">
                        <Star size={14} className="fill-amber-600" />
                        5.0
                     </div>
                   </div>

                   <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-slate-400">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-indigo-600">
                          <Zap size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Agendamento Real-time</span>
                     </div>
                     <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <ArrowRight size={20} />
                     </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Minimalista */}
      <footer className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black italic text-xl">S</div>
            <span className="text-2xl font-black tracking-tight">SimHal App<span className="text-indigo-500">.</span></span>
          </div>
          <p className="text-slate-400 font-medium text-sm">© 2026 SimHal Technologies. Todos os direitos reservados.</p>
          <div className="flex gap-6">
             <button className="text-slate-400 hover:text-white transition-colors">Termos</button>
             <button className="text-slate-400 hover:text-white transition-colors">Privacidade</button>
             <button className="text-slate-400 hover:text-white transition-colors">Contato</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
