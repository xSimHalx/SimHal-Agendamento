import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Check, HelpCircle, Sparkles } from 'lucide-react';

const OnboardingTour = ({ abaAtiva, config }) => {
  const [passoAtual, setPassoAtual] = useState(0);
  const [visivel, setVisivel] = useState(false);
  const chaveStorage = `simhal_onboarding_${abaAtiva}`;

  useEffect(() => {
    const jaVisto = localStorage.getItem(chaveStorage);
    if (!jaVisto && config[abaAtiva]) {
      setVisivel(true);
      setPassoAtual(0);
    } else {
      setVisivel(false);
    }
  }, [abaAtiva, config, chaveStorage]);

  const fechar = () => {
    localStorage.setItem(chaveStorage, 'true');
    setVisivel(false);
  };

  const proximo = () => {
    if (passoAtual < config[abaAtiva].length - 1) {
      setPassoAtual(passoAtual + 1);
    } else {
      fechar();
    }
  };

  if (!visivel || !config[abaAtiva]) return null;

  const step = config[abaAtiva][passoAtual];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header Colorido/Premium */}
        <div 
          className="h-32 bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] relative overflow-hidden flex items-center px-8"
          style={{ background: 'linear-gradient(135deg, var(--cor-primaria, #4f46e5) 0%, var(--cor-secundaria, #7c3aed) 100%)' }}
        >
           <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
           <div className="absolute bottom-[-10px] left-[-10px] w-24 h-24 bg-white/5 rounded-full blur-xl" />
           
           <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mr-4 shadow-xl border border-white/30">
              {step.icone || <Sparkles size={28} />}
           </div>
           <div>
              <h4 className="text-white/70 font-black uppercase tracking-[0.2em] text-[10px]">Dica Express</h4>
              <h3 className="text-white font-black text-xl leading-tight uppercase tracking-tight shadow-sm">{step.titulo}</h3>
           </div>
           
           <button 
            onClick={fechar}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:rotate-90 shadow-lg border border-white/10"
           >
              <X size={18} strokeWidth={3} />
           </button>
        </div>

        {/* Conteúdo */}
        <div className="p-8">
          <p className="text-slate-600 font-medium leading-relaxed mb-8">
            {step.texto}
          </p>

          <div className="flex items-center justify-between">
            {/* Dots de Progresso */}
            <div className="flex gap-1.5">
              {config[abaAtiva].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === passoAtual ? 'w-6 bg-primary' : 'w-1.5 bg-slate-200'}`} 
                />
              ))}
            </div>

            <button 
              onClick={proximo}
              className="group flex items-center bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-black/10"
            >
              {passoAtual === config[abaAtiva].length - 1 ? (
                <>Entendi <Check size={16} className="ml-2" strokeWidth={3} /></>
              ) : (
                <>Próximo <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" strokeWidth={3} /></>
              )}
            </button>
          </div>
        </div>

        {/* Footer com botão de ajuda */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-center">
            <button onClick={fechar} className="text-[10px] font-black text-slate-300 hover:text-slate-500 uppercase tracking-widest transition-colors flex items-center gap-1">
               <HelpCircle size={10} /> Pular todos os tutoriais
            </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
