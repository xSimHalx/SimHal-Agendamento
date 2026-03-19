import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, ShoppingCart, Clock, Contact,
  ChevronLeft, X, ArrowRight, Check, Calendar as CalendarIcon,
  MapPin, Instagram, Facebook, Smartphone, ArrowLeft,
  QrCode, Copy, ShieldCheck, Loader2, Plus
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isBefore, 
  startOfDay,
  getDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';
import { useTermos } from '../hooks/useTermos';
import API_URL from '../servicos/api';

// Formatador de Moeda
const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor) / 100);
};

// Removido MOCK_DIAS estático

export default function AgendamentoCliente() {
  const navigate = useNavigate();
  const { slug: urlSlug } = useParams();
  
  // ==========================================
  // ESTADOS (API E DADOS)
  // ==========================================
  const [empresa, setEmpresa] = useState(null);
  const t = useTermos(empresa);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [adicionais, setAdicionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [camposFormulario, setCamposFormulario] = useState([]);
  
  // Disponibilidade
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [disponibilidadeMensal, setDisponibilidadeMensal] = useState({});
  const [carregandoMes, setCarregandoMes] = useState(false);

  // ==========================================
  // ESTADOS (WIZARD)
  // ==========================================
  const [etapa, setEtapa] = useState(1);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState([]); 
  const [mesReferencia, setMesReferencia] = useState(new Date());
  const [dataSelecionada, setDataSelecionada] = useState(null); // Agora é um objeto Date
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [dadosCliente, setDadosCliente] = useState({ nome: '', sobrenome: '', telefone: '' });
  const [respostasExtras, setRespostasExtras] = useState({});
  const [linkWhatsApp, setLinkWhatsApp] = useState(null);
  
  // Checkout
  const [pagamento, setPagamento] = useState(null);
  const [carregandoPagamento, setCarregandoPagamento] = useState(false);

  const CORES_TEMA = {
    indigo: { primary: '#4f46e5', secondary: '#4338ca', light: '#eef2ff' },
    rose: { primary: '#e11d48', secondary: '#be123c', light: '#fff1f2' },
    emerald: { primary: '#10b981', secondary: '#047857', light: '#ecfdf5' },
    slate: { primary: '#334155', secondary: '#1e293b', light: '#f8fafc' }
  };

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const slug = urlSlug || 'barbearia-simhal';
        
        // 1. Buscar Info da Empresa (pelo slug)
        // Nota: Criaremos esta rota se não existir, por enquanto vamos buscar direto pelo ID fixo do Seed
        // Mas o correto é buscar por slug. Vamos assumir que buscar pelo ID do seed por enquanto.
        const resEmpresa = await axios.get(`${API_URL}/api/negocio/info/${slug}`);
        const dadosEmpresa = resEmpresa.data;
        setEmpresa(dadosEmpresa);

        // 2. Buscar Profissionais e Serviços desta empresa
        const [resPros, resServsData] = await Promise.all([
          axios.get(`${API_URL}/api/negocio/profissionais/${dadosEmpresa.id}`),
          axios.get(`${API_URL}/api/negocio/servicos/${dadosEmpresa.id}`)
        ]);

        const { servicos: servicosApi, adicionais: adicionaisApi } = resServsData.data || {};

        setProfissionais(Array.isArray(resPros.data) ? resPros.data : []);
        setServicos(Array.isArray(servicosApi) ? servicosApi : []);
        setAdicionais(Array.isArray(adicionaisApi) ? adicionaisApi : []);

        // 3. Buscar Campos Personalizados do Formulário
        try {
          const resCampos = await axios.get(`${API_URL}/api/negocio/campos-formulario/${dadosEmpresa.id}`);
          setCamposFormulario(resCampos.data || []);
        } catch (e) {
          console.error("Erro ao buscar campos extras:", e);
        }
      } catch (erro) {
        console.error("Erro ao carregar dados do agendamento:", erro);
        // Resetar para arrays vazios em caso de erro crítico
        setProfissionais([]);
        setServicos([]);
        setAdicionais([]);
      } finally {
        setCarregando(false);
      }
    };

    carregarDadosIniciais();
  }, []);

  
  // Buscar Disponibilidade Mensal
  useEffect(() => {
    const buscarMensal = async () => {
      if (!profissionalSelecionado || !servicoSelecionado) return;
      setCarregandoMes(true);
      try {
        const mesStr = format(mesReferencia, 'yyyy-MM');
        const response = await axios.get(`${API_URL}/api/negocio/disponibilidade-mensal`, {
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

  // Buscar Disponibilidade Real
  useEffect(() => {
    const buscarDisponibilidade = async () => {
      if (!profissionalSelecionado || !servicoSelecionado || !dataSelecionada) return;

      setCarregandoHorarios(true);
      try {
        const response = await axios.get(`${API_URL}/api/negocio/disponibilidade`, {
          params: {
            profissionalId: profissionalSelecionado.id,
            servicoId: servicoSelecionado.id,
            data: format(dataSelecionada, 'yyyy-MM-dd')
          }
        });
        setHorariosDisponiveis(Array.isArray(response.data) ? response.data : []);
      } catch (erro) {
        console.error("Erro ao buscar disponibilidade:", erro);
        setHorariosDisponiveis([]);
      } finally {
        setCarregandoHorarios(false);
      }
    };

    buscarDisponibilidade();
  }, [profissionalSelecionado, servicoSelecionado, dataSelecionada]);

  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 bg-[var(--cor-light)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="text-primary" />
          </div>
          <p className="text-slate-500 font-medium">Carregando agendamento...</p>
        </div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-red-500 font-bold">Empresa não encontrada ou erro de conexão.</p>
      </div>
    );
  }

  // Funções de Navegação
  const proximaEtapa = () => setEtapa(etapa + 1);
  const etapaAnterior = () => setEtapa(etapa - 1);

  // Alternar Adicionais (Checkbox)
  const alternarAdicional = (adicional) => {
    if (adicionaisSelecionados.find(e => e.id === adicional.id)) {
      setAdicionaisSelecionados(adicionaisSelecionados.filter(e => e.id !== adicional.id));
    } else {
      setAdicionaisSelecionados([...adicionaisSelecionados, adicional]);
    }
  };

  // Validação: Desabilitar o próximo se não houver seleção
  const proximoDesabilitado = () => {
    switch (etapa) {
      case 1: return !profissionalSelecionado;
      case 2: return !servicoSelecionado;
      case 4: return !dataSelecionada || !horarioSelecionado;
      case 5: {
        const baseValido = dadosCliente.nome && dadosCliente.telefone;
        if (!baseValido) return true;
        
        // Validar campos obrigatórios dinâmicos
        const faltamObrigatorios = camposFormulario.some(campo => 
          campo.obrigatorio && !respostasExtras[campo.id]
        );
        return faltamObrigatorios;
      }
      default: return false;
    }
  };

  // Ação Final: Confirmar Agendamento no Banco
  const confirmarAgendamento = async () => {
    // Se a empresa exige pagamento e ainda não foi gerado/pago
    if (empresa.exigirPagamentoAntecipado && !pagamento) {
      gerarCobranca();
      return;
    }

    setCarregando(true);
    try {
      const payload = {
        empresaId: empresa.id,
        profissionalId: profissionalSelecionado.id,
        servicoId: servicoSelecionado.id,
        cliente: {
          nome: dadosCliente.nome,
          sobrenome: dadosCliente.sobrenome,
          telefone: dadosCliente.telefone,
          empresaId: empresa.id
        },
        dataHora: new Date(
          dataSelecionada.getFullYear(),
          dataSelecionada.getMonth(),
          dataSelecionada.getDate(),
          parseInt(horarioSelecionado.split(':')[0]),
          parseInt(horarioSelecionado.split(':')[1])
        ).toISOString(),
        adicionaisIds: adicionaisSelecionados.map(a => a.id),
        valorTotal: calcularTotal(),
        respostasExtras
      };

      const response = await axios.post(`${API_URL}/api/negocio/agendamentos`, payload);
      if (response.data.linkWhatsApp) {
        setLinkWhatsApp(response.data.linkWhatsApp);
      }
      setEtapa(7); // Sucesso é agora 7
    } catch (erro) {
      console.error("Erro ao confirmar agendamento:", erro);
      const msg = erro.response?.data?.erro || "Houve um erro ao realizar o agendamento.";
      const detalhe = erro.response?.data?.detalhe || "Tente novamente.";
      alert(`${msg}\n${detalhe}`);
    } finally {
      setCarregando(false);
    }
  };

  const gerarCobranca = async () => {
    setCarregandoPagamento(true);
    try {
        const res = await axios.post(`${API_URL}/api/negocio/checkout/preferencia`, {
            empresaId: empresa.id,
            valorCentavos: calcularTotal(),
            servicoNome: servicoSelecionado.nome
        });
        setPagamento(res.data);
        setEtapa(6); // Etapa de Pagamento
    } catch (erro) {
        alert("Erro ao gerar pagamento. Tente novamente.");
    } finally {
        setCarregandoPagamento(false);
    }
  };

  const verificarPagamento = async () => {
    setCarregandoPagamento(true);
    try {
        // Simulação de verificação
        await axios.get(`${API_URL}/api/negocio/checkout/status/${pagamento.id}`);
        // Após "verificar", procedemos com a confirmação do agendamento
        confirmarAgendamento();
    } catch (erro) {
        alert("Pagamento não identificado.");
    } finally {
        setCarregandoPagamento(false);
    }
  };

  // Cálculo do Total
  const calcularTotal = () => {
    let total = 0;
    if (servicoSelecionado) total += servicoSelecionado.preco;
    adicionaisSelecionados.forEach(extra => total += extra.preco);
    return total;
  };

  // ==========================================
  // COMPONENTES DE LAYOUT (As 3 Colunas)
  // ==========================================

  // 1. COLUNA ESQUERDA / CABEÇALHO (Dinâmico Mobile/Desktop)
  const renderizarPainelEsquerdo = () => {
    const infoEtapa = {
      1: { icone: Users, titulo: t.Profissional, desc: `Escolha quem vai te atender.` },
      2: { icone: BookOpen, titulo: t.Servico, desc: `O que vamos fazer hoje?` },
      3: { icone: ShoppingCart, titulo: `Adicionais`, desc: `Deseja algo mais?` },
      4: { icone: Clock, titulo: 'Horário', desc: `Escolha o melhor momento.` },
      5: { icone: Contact, titulo: 'Seus Dados', desc: `Quase lá! Só precisamos te identificar.` },
      6: { icone: ShieldCheck, titulo: 'Pagamento', desc: 'Garanta sua vaga pelo PIX.' },
      7: { icone: Check, titulo: 'Sucesso!', desc: `Agendamento confirmado.` }
    }[etapa];

    const Icone = infoEtapa.icone;
    const porcentagemProgresso = (etapa / 6) * 100;

    return (
      <>
        {/* HEADER MOBILE (Fixo no topo) */}
        <div className="lg:hidden w-full bg-white border-b border-slate-100 p-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-3">
                {empresa.logo ? (
                  <img src={empresa.logo} alt={empresa.nome} className="w-10 h-10 object-contain rounded-xl border border-slate-100 p-1" />
                ) : (
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Check size={20} />
                  </div>
                )}
                <div>
                  <h1 className="text-sm font-black text-slate-800 leading-tight">{empresa.nome}</h1>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">{infoEtapa.titulo} • Passo {etapa}/6</p>
                </div>
             </div>
             <button onClick={() => navigate('/')} className="w-8 h-8 flex items-center justify-center text-slate-400">
                <X size={20} />
             </button>
          </div>
          
          {/* Barra de Progresso Mobile */}
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
             <div 
                className="h-full bg-primary transition-all duration-500 ease-out" 
                style={{ width: `${porcentagemProgresso}%` }}
             />
          </div>
        </div>

        {/* PAINEL LATERAL DESKTOP */}
        <div className="hidden lg:flex w-[280px] bg-[#f8f9fa] p-8 flex-col items-center text-center border-r border-slate-200">
          <button 
            onClick={() => navigate('/')}
            className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold text-[11px] uppercase tracking-widest transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Lojas
          </button>

          <div className="w-full h-1 bg-slate-200 rounded-full mb-12 overflow-hidden">
             <div className="h-full bg-primary transition-all duration-500" style={{ width: `${porcentagemProgresso}%` }} />
          </div>

          <div className="flex flex-col items-center flex-1">
            {empresa.logo ? (
              <img src={empresa.logo} alt={empresa.nome} className="w-24 h-24 object-contain mb-6 p-3 bg-white rounded-3xl shadow-sm border border-slate-100" />
            ) : (
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6">
                <Icone size={40} strokeWidth={2} />
              </div>
            )}
            <h2 className="text-xl font-black text-slate-800 mb-2">{infoEtapa.titulo}</h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">{infoEtapa.desc}</p>
          </div>

          <div className="mt-auto pt-8 w-full border-t border-slate-200 space-y-4">
            {empresa.endereco && (
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                  <MapPin size={10} /> Onde ficamos
                </p>
                <p className="text-[11px] font-bold text-slate-600 leading-tight px-2">{empresa.endereco}</p>
              </div>
            )}

            <div className="flex justify-center gap-2">
              {[empresa.instagram, empresa.facebook, empresa.telefone].filter(Boolean).map((social, i) => (
                <div key={i} className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                  {i === 0 ? <Instagram size={16}/> : i === 1 ? <Facebook size={16}/> : <Smartphone size={16}/>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  // 2. COLUNA CENTRAL (Conteúdo Dinâmico)
  const renderizarPainelCentral = () => {
    const titulos = {
      1: `Selecione o ${t.Profissional}`, 
      2: `Selecione o ${t.Servico}`, 
      3: `${t.Servicos} Adicionais`, 
      4: 'Selecione a Data e Horário', 
      5: 'Preencha Seus Dados', 
      6: 'Pagamento via PIX', 
      7: `${t.Agendamento} Confirmado`
    };

    const proximoDesabilitado = () => {
      if (etapa === 1 && !profissionalSelecionado) return true;
      if (etapa === 2 && !servicoSelecionado) return true;
      if (etapa === 4 && (!dataSelecionada || !horarioSelecionado)) return true;
      if (etapa === 5) {
        if (!dadosCliente.nome || !dadosCliente.telefone) return true;
        const faltamObrigatorios = camposFormulario.some(c => c.obrigatorio && !respostasExtras[c.id]);
        return faltamObrigatorios;
      }
      return false;
    };

    return (
      <div className="flex-1 flex flex-col bg-white min-h-[450px] lg:h-[600px]">
        <div className="hidden lg:flex px-8 py-6 border-b border-slate-200 justify-between items-center bg-white/50 backdrop-blur-sm">
          <h2 className="text-lg font-black text-slate-800 tracking-tight">{titulos[etapa]}</h2>
          <button onClick={() => navigate('/')} className="text-slate-300 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-10 py-6 sm:py-10 custom-scrollbar">
          
          {etapa === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 pb-20 lg:pb-0">
                {Array.isArray(profissionais) && profissionais.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setProfissionalSelecionado(p); proximaEtapa(); }}
                    className={`group relative flex flex-col items-center p-5 rounded-[2rem] border-2 transition-all duration-300 ${
                      profissionalSelecionado?.id === p.id 
                        ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10' 
                        : 'border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-20 h-20 rounded-[1.5rem] bg-slate-100 mb-4 overflow-hidden relative transition-transform duration-300 group-hover:scale-105 ${profissionalSelecionado?.id === p.id ? 'ring-4 ring-primary/20' : ''}`}>
                      {p.foto ? (
                        <img src={p.foto} alt={p.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-black text-2xl uppercase">
                          {p.nome?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <span className="font-black text-slate-800 text-sm sm:text-base mb-1">{p.nome}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.cargo || t.Profissional}</span>
                    
                    {profissionalSelecionado?.id === p.id && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center scale-110 animate-in zoom-in-50">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
            </div>
          )}

          {etapa === 2 && (
            <div className="space-y-4 pb-20 lg:pb-0">
                {Array.isArray(servicos) && servicos.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setServicoSelecionado(s); proximaEtapa(); }}
                    className={`w-full flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all duration-300 text-left relative overflow-hidden group ${
                      servicoSelecionado?.id === s.id 
                        ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10' 
                        : 'border-slate-100 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <BookOpen size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-800 text-sm sm:text-base leading-tight mb-1">{s.nome}</h4>
                      <div className="flex items-center gap-3">
                         <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                           <Clock size={12} /> {s.duracao} min
                         </span>
                         <span className="w-1 h-1 bg-slate-200 rounded-full" />
                         <span className="text-[11px] font-black text-primary uppercase tracking-wider">{formatarMoeda(s.preco)}</span>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${servicoSelecionado?.id === s.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <ArrowRight size={16} />
                    </div>
                  </button>
                ))}
            </div>
          )}

          {etapa === 3 && (
            <div className="space-y-3 pb-20 lg:pb-0">
                  {adicionais.map((ad) => (
                  <button
                    key={ad.id}
                    onClick={() => alternarAdicional(ad)}
                    className={`w-full flex items-center justify-between p-5 rounded-[2rem] border-2 transition-all duration-300 ${
                      adicionaisSelecionados.find(a => a.id === ad.id)
                        ? 'border-primary bg-primary/5 shadow-lg' 
                        : 'border-slate-100 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${adicionaisSelecionados.find(a => a.id === ad.id) ? 'bg-primary border-primary scale-110' : 'border-slate-300'}`}>
                        {adicionaisSelecionados.find(a => a.id === ad.id) && <Check size={16} className="text-white" strokeWidth={3} />}
                      </div>
                      <div className="text-left">
                        <p className="font-black text-slate-800 text-sm">{ad.nome}</p>
                        <p className="text-[10px] font-bold text-slate-400">{formatarMoeda(ad.preco)} • +{ad.duracao || 0} min</p>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          )}

          {etapa === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 h-full flex flex-col pb-24 lg:pb-0">
              {!dataSelecionada ? (
                <div className="bg-white rounded-[2.5rem] p-4 sm:p-6 border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-8 px-2">
                    <button 
                      onClick={() => setMesReferencia(subMonths(mesReferencia, 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                      disabled={isBefore(startOfMonth(mesReferencia), startOfMonth(new Date()))}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-[0.2em]">
                      {format(mesReferencia, "MMMM yyyy", { locale: ptBR })}
                    </h3>
                    <button 
                      onClick={() => setMesReferencia(addMonths(mesReferencia, 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                    >
                      <ChevronLeft className="rotate-180" size={20} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-y-3 gap-x-2 text-center mb-4 relative">
                    {carregandoMes && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-xl">
                         <Loader2 size={24} className="text-primary animate-spin" />
                      </div>
                    )}
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                      <div key={d} className="text-[10px] font-black text-slate-300 tracking-widest">{d}</div>
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
                      if (status === 'disponivel') corDot = 'bg-emerald-500';
                      if (status === 'lotado') corDot = 'bg-rose-500';

                      return (
                        <button 
                          key={dia.toISOString()}
                          disabled={passado || status === 'fechado' || status === 'lotado'}
                          onClick={() => { setDataSelecionada(dia); setHorarioSelecionado(null); }}
                          className={`h-11 w-11 mx-auto rounded-[1.2rem] font-black flex flex-col items-center justify-center transition-all relative ${
                            selecionado ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-110 z-10' : 
                            !passado && status === 'disponivel' ? 'bg-slate-50 hover:bg-white hover:border-primary/30 text-slate-700 border border-slate-100' : 'bg-transparent text-slate-300 cursor-not-allowed opacity-40 text-xs'
                          }`}
                        >
                          <span className="text-[13px]">{format(dia, 'd')}</span>
                          {!passado && status === 'disponivel' && (
                            <div className={`absolute bottom-1.5 w-1 h-1 rounded-full ${selecionado ? 'bg-white' : corDot}`}></div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center justify-between mb-8">
                    <button 
                      onClick={() => { setDataSelecionada(null); setHorarioSelecionado(null); }}
                      className="text-[10px] font-black uppercase text-primary hover:bg-primary/5 px-4 py-2.5 rounded-xl transition-colors border border-primary/20 flex items-center gap-2"
                    >
                      <ChevronLeft size={14} strokeWidth={3} /> Calendário
                    </button>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dia Selecionado</p>
                      <p className="text-sm font-black text-slate-800">
                        {format(dataSelecionada, "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {carregandoHorarios ? (
                      <div className="col-span-3 py-10 flex flex-col items-center justify-center text-slate-400 animate-pulse">
                        <Loader2 size={24} className="text-primary animate-spin mb-3" />
                        <p className="font-bold text-xs">Sincronizando agenda...</p>
                      </div>
                    ) : horariosDisponiveis.length > 0 ? (
                      horariosDisponiveis.map(slot => {
                        const isObject = typeof slot === 'object';
                        const horaTexto = isObject ? slot.inicio : slot;
                        const selecionado = horarioSelecionado === horaTexto;

                        return (
                          <button
                            key={horaTexto}
                            onClick={() => setHorarioSelecionado(horaTexto)}
                            className={`flex flex-col items-center justify-center py-4 rounded-2xl font-black transition-all border-2 ${
                              selecionado 
                              ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105' 
                              : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-sm">{horaTexto}</span>
                            {isObject && slot.vagasRestantes > 1 && (
                              <span className={`text-[8px] uppercase font-black mt-1 ${selecionado ? 'text-white/60' : 'text-primary'}`}>
                                {slot.vagasRestantes} Vagas
                              </span>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="col-span-3 py-16 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50 flex flex-col items-center gap-3">
                        <CalendarIcon size={32} strokeWidth={1.5} className="text-slate-200" />
                        <div className="space-y-1">
                          <p className="font-black text-slate-800 text-sm">Nenhum horário livre</p>
                          <p className="text-[10px] uppercase font-bold text-slate-400 px-8">Tente outra data no calendário ou entre em contato.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {etapa === 5 && (
            <div className="space-y-6 pb-24 lg:pb-0 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest pl-1">Seu Nome</label>
                  <input 
                    type="text" 
                    placeholder="Ex: João"
                    value={dadosCliente.nome}
                    onChange={(e) => setDadosCliente({...dadosCliente, nome: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-0 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest pl-1">Sobrenome</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Silva"
                    value={dadosCliente.sobrenome}
                    onChange={(e) => setDadosCliente({...dadosCliente, sobrenome: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-0 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest pl-1">Celular / WhatsApp</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Smartphone size={18} />
                  </div>
                  <input 
                    type="tel" 
                    placeholder="(00) 00000-0000"
                    value={dadosCliente.telefone}
                    onChange={(e) => setDadosCliente({...dadosCliente, telefone: e.target.value})}
                    className="w-full pl-12 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-0 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  />
                </div>
              </div>

              {camposFormulario.length > 0 && (
                <div className="pt-8 border-t border-dashed border-slate-200 mt-8 space-y-6">
                  <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.1em] flex items-center gap-2">
                    <Plus size={14} className="text-primary" /> Informações Complementares
                  </h5>
                  <div className="grid grid-cols-1 gap-4">
                    {camposFormulario.map(campo => (
                      <div key={campo.id}>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest pl-1">
                          {campo.label} {campo.obrigatorio && <span className="text-rose-500">*</span>}
                        </label>
                        <input 
                          type={campo.tipo === 'NUMBER' ? 'number' : 'text'}
                          value={respostasExtras[campo.id] || ''}
                          onChange={(e) => setRespostasExtras({...respostasExtras, [campo.id]: e.target.value})}
                          placeholder={campo.placeholder || (campo.obrigatorio ? 'Resposta obrigatória' : 'Sua resposta aqui...')}
                          className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-0 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 shadow-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {etapa === 6 && (
            <div className="flex flex-col items-center justify-center h-full space-y-6 py-4 animate-in fade-in zoom-in-95">
               <div className="bg-[var(--cor-light)] p-4 rounded-3xl border-2 border-primary/20 text-center space-y-2">
                  <p className="text-[10px] font-black uppercase text-primary tracking-widest">Valor a Pagar</p>
                  <p className="text-3xl font-black text-slate-800">{formatarMoeda(calcularTotal())}</p>
               </div>

               <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm relative group">
                  <div className="w-48 h-48 bg-slate-50 flex items-center justify-center rounded-xl overflow-hidden border border-slate-200">
                     <QrCode size={140} className="text-slate-800" />
                     {/* Overlay Simulado */}
                     <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-[10px] font-black uppercase text-slate-600">Escaneie o código no seu app do banco</p>
                     </div>
                  </div>
               </div>

               <div className="w-full max-w-xs space-y-3">
                  <button 
                    onClick={() => { navigator.clipboard.writeText(pagamento?.pixCopiaECola); alert("Código PIX copiado!"); }}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-600 p-3 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all"
                  >
                    <Copy size={16} /> Copiar Código PIX
                  </button>
                  
                  <button 
                    disabled={carregandoPagamento}
                    onClick={verificarPagamento}
                    className="w-full bg-emerald-500 text-white p-4 rounded-xl font-black text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                  >
                    {carregandoPagamento ? <Loader2 className="animate-spin" size={20} /> : 'Já realizei o pagamento'}
                  </button>
               </div>
               
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic">
                  * Sua vaga será confirmada instantaneamente após o pagamento.
               </p>
            </div>
          )}

          {etapa === 7 && (
            <div className="text-center py-12 flex flex-col items-center justify-center h-full">
               <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <Check size={48} strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">{t.Agendamento} Confirmado!</h2>
              <p className="text-slate-600 mb-8 max-w-sm">
                Tudo certo, {dadosCliente.nome}! Te esperamos em breve.
              </p>
              
              {linkWhatsApp && (
                <div className="mb-8 w-full max-w-xs space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação Necessária</p>
                  <a 
                    href={linkWhatsApp}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-xl font-black text-sm shadow-lg shadow-emerald-100 transition-all active:scale-95"
                  >
                    <Smartphone size={18} /> Confirmar via WhatsApp
                  </a>
                  <p className="text-[10px] text-slate-400 font-medium">Clique para nos avisar que está vindo!</p>
                </div>
              )}

              <button onClick={() => window.location.reload()} className="text-primary hover:underline font-bold text-sm">
                Realizar outro Agendamento
              </button>
            </div>
          )}

        </div>

        {etapa < 7 && (
          <div className="px-6 py-5 border-t border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-xl sticky bottom-0 lg:relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] lg:shadow-none animate-in fade-in slide-in-from-bottom-2">
            {(etapa > 1 && etapa !== 6) ? (
              <button 
                onClick={etapaAnterior} 
                className="flex items-center gap-2 text-slate-400 font-black hover:text-slate-800 transition-all text-[11px] uppercase tracking-widest active:scale-95"
              >
                <ChevronLeft size={18} strokeWidth={3} /> Voltar
              </button>
            ) : (
               <div className="flex flex-col">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total</p>
                  <p className="text-lg font-black text-slate-800 leading-tight">{formatarMoeda(calcularTotal())}</p>
               </div>
            )}

            <button 
              disabled={proximoDesabilitado() || carregandoPagamento}
              onClick={etapa === 5 ? confirmarAgendamento : proximaEtapa} 
              className="group flex items-center bg-primary hover:brightness-110 disabled:grayscale disabled:opacity-30 text-white pl-8 pr-6 py-4 rounded-[2rem] font-black transition-all shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 text-xs uppercase tracking-[0.15em]"
            >
              {carregandoPagamento ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  {etapa === 5 ? (empresa.exigirPagamentoAntecipado ? 'Ir para Pagamento' : 'Confirmar Reserva') : 'Próximo'}
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  // 3. COLUNA DIREITA (Resumo do Carrinho)
  const renderizarPainelDireito = () => {
    return (
      <div className="hidden lg:flex w-[280px] bg-[#f8f9fa] border-l border-slate-200 flex-col p-8">
        <h3 className="text-xs tracking-[0.2em] font-bold text-slate-500 uppercase flex items-center gap-2 mb-8 whitespace-nowrap overflow-hidden">
          <span className="opacity-30">:::::::::::::::::</span> RESUMO
        </h3>

        <div className="space-y-6 flex-1">
          {profissionalSelecionado && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.Profissional}</p>
              <p className="font-bold text-slate-800 border-b border-slate-200 pb-2">{profissionalSelecionado.nome}</p>
            </div>
          )}

          {servicoSelecionado && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.Servico}</p>
              <p className="font-bold text-slate-800 border-b border-slate-200 pb-2">{servicoSelecionado.nome}</p>
            </div>
          )}

          {adicionaisSelecionados.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.Servicos} Adicionais</p>
              <div className="border-b border-slate-200 pb-2">
                {adicionaisSelecionados.map(ex => (
                  <p key={ex.id} className="font-bold text-slate-800 flex justify-between">
                    <span>+ {ex.nome}</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {dataSelecionada && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Data</p>
              <p className="font-bold text-slate-800 border-b border-slate-200 pb-2">
                {format(dataSelecionada, "dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
          )}
          {horarioSelecionado && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hora</p>
              <p className="font-bold text-slate-800 border-b border-slate-200 pb-2">{horarioSelecionado}</p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-slate-300 mt-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-bold text-slate-800">{formatarMoeda(calcularTotal())}</p>
        </div>
      </div>
    );
  };

  const tema = CORES_TEMA[empresa?.corPrimaria] || CORES_TEMA.indigo;

  const [resumoAberto, setResumoAberto] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-0 sm:p-4 lg:p-8 font-sans selection:bg-primary/20" style={{ backgroundImage: 'radial-gradient(circle at top right, #1e293b 0%, #020617 100%)' }}>
      
      {/* BOTÃO FLUTUANTE DE RESUMO (MOBILE) */}
      {etapa > 1 && etapa < 7 && (
        <button 
          onClick={() => setResumoAberto(!resumoAberto)}
          className="lg:hidden fixed right-6 bottom-24 z-40 bg-white text-slate-800 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center border-4 border-primary transition-all active:scale-90"
        >
          <ShoppingCart size={24} className={resumoAberto ? 'text-rose-500' : 'text-primary'} />
        </button>
      )}

      {/* OVERLAY RESUMO MOBILE */}
      {resumoAberto && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm p-6 flex flex-col justify-end animate-in fade-in">
           <div className="bg-white rounded-[2.5rem] p-8 space-y-6 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-10">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                 <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Seu Agendamento</h3>
                 <button onClick={() => setResumoAberto(false)} className="text-slate-400 p-2"><X size={24}/></button>
              </div>
              
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {profissionalSelecionado && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{t.Profissional}</span>
                    <span className="text-sm font-black text-slate-800">{profissionalSelecionado.nome}</span>
                  </div>
                )}
                {servicoSelecionado && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{t.Servico}</span>
                    <span className="text-sm font-black text-slate-800">{servicoSelecionado.nome}</span>
                  </div>
                )}
                {adicionaisSelecionados.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Adicionais</p>
                    {adicionaisSelecionados.map(ad => (
                       <div key={ad.id} className="flex justify-between text-xs font-bold text-slate-600">
                          <span>+ {ad.nome}</span>
                          <span>{formatarMoeda(ad.preco)}</span>
                       </div>
                    ))}
                  </div>
                )}
                {dataSelecionada && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Data/Hora</span>
                    <span className="text-sm font-black text-slate-800">{format(dataSelecionada, 'dd/MM')} {horarioSelecionado ? ` às ${horarioSelecionado}` : ''}</span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                 <span className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Total</span>
                 <span className="text-2xl font-black text-primary">{formatarMoeda(calcularTotal())}</span>
              </div>
              
              <button 
                onClick={() => setResumoAberto(false)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest"
              >
                Fechar Resumo
              </button>
           </div>
        </div>
      )}
      
      <div className="bg-white rounded-none sm:rounded-xl shadow-2xl overflow-hidden flex flex-col lg:flex-row w-full max-w-[1000px] min-h-screen sm:min-h-0 lg:h-[650px] animate-in zoom-in-95 duration-300">
        <style dangerouslySetInnerHTML={{__html: `
          :root {
            --cor-primaria: ${tema.primary};
            --cor-secundaria: ${tema.secondary};
            --cor-light: ${tema.light};
          }
          .bg-primary { background-color: var(--cor-primaria); }
          .text-primary { color: var(--cor-primaria); }
          .border-primary { border-color: var(--cor-primaria); }
          .hover-bg-primary:hover { background-color: var(--cor-secundaria); }
        `}} />
        {renderizarPainelEsquerdo()}
        {renderizarPainelCentral()}
        {renderizarPainelDireito()}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}
