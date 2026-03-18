import React from 'react';
import { Briefcase } from 'lucide-react';

export default function VisaoEmConstrucao({ titulo }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-in fade-in duration-500 text-center p-8 mt-12 bg-white rounded-xl border border-slate-200">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
        <Briefcase size={32} className="text-indigo-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">{titulo}</h2>
      <p>Esta funcionalidade está em desenvolvimento e será conectada à API em breve.</p>
    </div>
  );
}
