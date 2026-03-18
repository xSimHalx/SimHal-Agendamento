const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'interface/src/paginas/AgendamentoCliente.jsx');
let content = fs.readFileSync(target, 'utf8');

// 1. Add state variable
content = content.replace(
  'const [carregandoHorarios, setCarregandoHorarios] = useState(false);',
  'const [carregandoHorarios, setCarregandoHorarios] = useState(false);\n  const [disponibilidadeMensal, setDisponibilidadeMensal] = useState({});\n  const [carregandoMes, setCarregandoMes] = useState(false);'
);

// 2. Add useEffect for monthly
const mensalEffect = `
  // Buscar Disponibilidade Mensal
  useEffect(() => {
    const buscarMensal = async () => {
      if (!profissionalSelecionado || !servicoSelecionado) return;
      setCarregandoMes(true);
      try {
        const mesStr = format(mesReferencia, 'yyyy-MM');
        const response = await axios.get('http://localhost:3001/api/negocio/disponibilidade-mensal', {
          params: {
            profissionalId: profissionalSelecionado.id,
            servicoId: servicoSelecionado.id,
            mes: mesStr
          }
        });
        setDisponibilidadeMensal(response.data || {});
      } catch (erro) {
        console.error("Erro ao buscar disp mensal:", erro);
      } finally {
        setCarregandoMes(false);
      }
    };
    buscarMensal();
  }, [profissionalSelecionado, servicoSelecionado, mesReferencia]);

  // Buscar Disponibilidade Real`;
content = content.replace('// Buscar Disponibilidade Real', mensalEffect);

// 3. Replace Stage 4
const stage4Target = content.substring(content.indexOf('{etapa === 4 && ('), content.indexOf('{etapa === 5 && ('));

const stage4Replacement = `{etapa === 4 && (
            <div className="animate-in fade-in h-full flex flex-col">
              {!dataSelecionada ? (
                <>
                  <div className="flex justify-between items-center mb-6 px-4">
                    <button 
                      onClick={() => setMesReferencia(subMonths(mesReferencia, 1))}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                      disabled={isBefore(startOfMonth(mesReferencia), startOfMonth(new Date()))}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">
                      {format(mesReferencia, "MMMM yyyy", { locale: ptBR })}
                    </h3>
                    <button 
                      onClick={() => setMesReferencia(addMonths(mesReferencia, 1))}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                    >
                      <ChevronLeft className="rotate-180" size={20} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-y-2 gap-x-2 text-center mb-8 relative">
                    {carregandoMes && (
                      <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-xl">
                         <span className="text-xs font-bold text-slate-400 animate-pulse">Carregando mês...</span>
                      </div>
                    )}
                    {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(d => (
                      <div key={d} className="text-[10px] font-black text-slate-400 tracking-widest">{d}</div>
                    ))}
                    
                    {Array.from({ length: getDay(startOfMonth(mesReferencia)) }).map((_, i) => (
                      <div key={'empty-'+i} />
                    ))}

                    {eachDayOfInterval({
                      start: startOfMonth(mesReferencia),
                      end: endOfMonth(mesReferencia)
                    }).map(dia => {
                      const hoje = startOfDay(new Date());
                      const passado = isBefore(dia, hoje);
                      const selecionado = dataSelecionada && isSameDay(dataSelecionada, dia);
                      const dataStrFormat = format(dia, 'yyyy-MM-dd');
                      const status = disponibilidadeMensal[dataStrFormat];
                      
                      let corDot = 'bg-slate-200';
                      if (status === 'disponivel') corDot = 'bg-emerald-400';
                      if (status === 'lotado') corDot = 'bg-rose-400';
                      if (status === 'fechado' || passado) corDot = 'bg-slate-200';

                      return (
                        <button 
                          key={dia.toISOString()}
                          disabled={passado || status === 'fechado' || status === 'lotado'}
                          onClick={() => { setDataSelecionada(dia); setHorarioSelecionado(null); }}
                          className={\`h-10 w-10 mx-auto rounded-xl font-bold flex flex-col items-center justify-center transition-all relative \${
                            selecionado ? 'bg-primary text-white shadow-lg scale-110 z-10' : 
                            !passado && status === 'disponivel' ? 'bg-white hover:bg-[var(--cor-light)] text-slate-700 hover:text-primary border border-slate-100' : 'bg-slate-50 text-slate-300 cursor-not-allowed opacity-60 text-xs shadow-none border-none'
                          }\`}
                        >
                          {format(dia, 'd')}
                          {!passado && (status === 'disponivel' || status === 'lotado') && (
                            <div className={\`absolute bottom-1.5 w-3 h-1 rounded-full \${corDot}\`}></div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col animate-in slide-in-from-right-4">
                  <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-4 mb-6">
                    <button 
                      onClick={() => { setDataSelecionada(null); setHorarioSelecionado(null); }}
                      className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors border border-slate-200"
                    >
                      <ChevronLeft size={14} /> Voltar ao Calendário
                    </button>
                    <p className="text-right text-xs font-black text-slate-600 uppercase tracking-widest pl-2">
                      {format(dataSelecionada, "dd/MM/yyyy")}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 overflow-y-auto pr-2 custom-scrollbar pb-4" style={{ maxHeight: '350px' }}>
                    {carregandoHorarios ? (
                      <div className="col-span-3 py-10 flex flex-col items-center justify-center text-slate-400 animate-pulse">
                        <Clock size={24} className="mb-2 text-slate-300" />
                        <p className="font-bold text-sm">Buscando horários...</p>
                      </div>
                    ) : horariosDisponiveis.length > 0 ? (
                      horariosDisponiveis.map(hora => (
                        <button
                          key={hora}
                          onClick={() => setHorarioSelecionado(hora)}
                          className={\`py-3 rounded-xl font-bold text-sm transition-all \${
                            horarioSelecionado === hora 
                            ? 'bg-emerald-500 text-white shadow-lg scale-105 border-emerald-600' 
                            : 'bg-white text-slate-600 hover:bg-[var(--cor-light)] hover:text-primary border border-slate-200 shadow-sm'
                          }\`}
                        >
                          {horarioSelecionado === hora && <span className="block text-[9px] uppercase font-black text-emerald-100 mb-0.5 tracking-wider">Selecionado</span>}
                          {hora}
                        </button>
                      ))
                    ) : (
                      <div className="col-span-3 py-10 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center gap-2">
                        <CalendarIcon size={24} className="text-slate-300" />
                        <p className="text-xs">Agenda cheia ou fechada.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          `;

content = content.replace(stage4Target, stage4Replacement);

fs.writeFileSync(target, content, 'utf8');
console.log('Update finished!');
