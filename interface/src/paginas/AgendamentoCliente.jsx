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
        const resEmpresa = await axios.get(`http://localhost:3001/api/negocio/info/${slug}`);
        const dadosEmpresa = resEmpresa.data;
        setEmpresa(dadosEmpresa);

        // 2. Buscar Profissionais e Serviços desta empresa
        const [resPros, resServsData] = await Promise.all([
          axios.get(`http://localhost:3001/api/negocio/profissionais/${dadosEmpresa.id}`),
          axios.get(`http://localhost:3001/api/negocio/servicos/${dadosEmpresa.id}`)
        ]);

        const { servicos: servicosApi, adicionais: adicionaisApi } = resServsData.data || {};

        setProfissionais(Array.isArray(resPros.data) ? resPros.data : []);
        setServicos(Array.isArray(servicosApi) ? servicosApi : []);
        setAdicionais(Array.isArray(adicionaisApi) ? adicionaisApi : []);

        // 3. Buscar Campos Personalizados do Formulário
        try {
          const resCampos = await axios.get(`http://localhost:3001/api/negocio/campos-formulario/${dadosEmpresa.id}`);
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

  // Buscar Disponibilidade Real
  useEffect(() => {
    const buscarDisponibilidade = async () => {
      if (!profissionalSelecionado || !servicoSelecionado || !dataSelecionada) return;

      setCarregandoHorarios(true);
      try {
        const response = await axios.get(`http://localhost:3001/api/negocio/disponibilidade`, {
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

      const response = await axios.post('http://localhost:3001/api/negocio/agendamentos', payload);
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
        const res = await axios.post('http://localhost:3001/api/negocio/checkout/preferencia', {
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
        await axios.get(`http://localhost:3001/api/negocio/checkout/status/${pagamento.id}`);
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

  // 1. COLUNA ESQUERDA (Informativa)
  const renderizarPainelEsquerdo = () => {
    const infoEtapa = {
      1: { icone: Users, titulo: t.Profissional, desc: `Selecione o ${t.profissional} que deseja ser atendido.` },
      2: { icone: BookOpen, titulo: t.Servico, desc: `Selecione o ${t.servico} que deseja agendar um horário.` },
      3: { icone: ShoppingCart, titulo: `${t.Servicos} Adicionais`, desc: `Selecione ${t.servicos} adicionais caso queira incluir no ${t.agendamento}.` },
      4: { icone: Clock, titulo: 'Data e Horário', desc: `Datas em verde possuem disponibilidade de horário para ${t.agendamento}.` },
      5: { icone: Contact, titulo: 'Cadastro', desc: `Por favor, digite suas informações de contato para confirmarmos o ${t.agendamento}.` },
      6: { icone: ShieldCheck, titulo: 'Pagamento', desc: 'Sua reserva está quase pronta! Realize o pagamento via PIX para garantir sua vaga.' },
      7: { icone: Check, titulo: 'Concluído', desc: `Seu ${t.agendamento} foi realizado com sucesso!` }
    }[etapa];

    const Icone = infoEtapa.icone;

    return (
      <div className="w-full lg:w-[280px] bg-[#f8f9fa] p-8 flex flex-col items-center text-center border-r border-slate-200">
        <button 
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold text-[11px] uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Ver outras lojas
        </button>

        <div className="flex gap-2 mb-12">
          {[1, 2, 3, 4, 5, 6].map(s => (
            <div key={s} className={`w-2 h-2 rounded-full transition-colors ${s === etapa ? 'bg-primary' : 'bg-slate-300'}`} />
          ))}
        </div>
        <div className="flex flex-col items-center flex-1">
          {empresa.logo ? (
            <img src={empresa.logo} alt={empresa.nome} className="w-20 h-20 object-contain mb-4 p-2 bg-white rounded-2xl shadow-sm border border-slate-100" />
          ) : (
            <Icone size={48} className="text-primary mb-6" strokeWidth={1.5} />
          )}
          <h2 className="text-xl font-bold text-slate-800 mb-2">{infoEtapa.titulo}</h2>
          <p className="text-sm text-slate-500 leading-relaxed">{infoEtapa.desc}</p>
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

          <div className="flex justify-center gap-3">
            {empresa.instagram && (
              <a 
                href={`https://instagram.com/${empresa.instagram}`} 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all hover:scale-110"
                title="Siga no Instagram"
              >
                <Instagram size={18} />
              </a>
            )}
            {empresa.facebook && (
              <a 
                href={`https://facebook.com/${empresa.facebook}`} 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all hover:scale-110"
                title="Visite no Facebook"
              >
                <Facebook size={18} />
              </a>
            )}
            {empresa.telefone && (
              <a 
                href={`https://wa.me/${empresa.telefone.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all hover:scale-110"
                title="Chamar no WhatsApp"
              >
                <Smartphone size={18} />
              </a>
            )}
          </div>
          
          <div className="pt-2 text-center">
            <p className="font-bold text-slate-800 text-[10px]">Dúvidas?</p>
            <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Fale conosco pelas redes sociais!</p>
          </div>
        </div>
      </div>
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
      <div className="flex-1 flex flex-col bg-white h-[600px]">
        <div className="px-8 py-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">{titulos[etapa]}</h2>
          <button className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {etapa === 1 && (
            <div className="flex justify-center gap-6">
                {Array.isArray(profissionais) && profissionais.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setProfissionalSelecionado(p); proximaEtapa(); }}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      profissionalSelecionado?.id === p.id 
                        ? 'border-primary bg-[var(--cor-light)]' 
                        : 'border-slate-100 hover:border-primary bg-white'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-200 mb-3 overflow-hidden">
                      {p.foto ? (
                        <img src={p.foto} alt={p.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--cor-light)] text-primary font-bold text-xl">
                          {p.nome?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-slate-800">{p.nome}</span>
                  </button>
                ))}
                {(!Array.isArray(profissionais) || profissionais.length === 0) && (
                  <p className="text-slate-500 py-8">Nenhum profissional disponível no momento.</p>
                )}
            </div>
          )}

          {etapa === 2 && (
            <div className="space-y-3">
                {Array.isArray(servicos) && servicos.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setServicoSelecionado(s); proximaEtapa(); }}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      servicoSelecionado?.id === s.id 
                        ? 'border-primary bg-[var(--cor-light)]' 
                        : 'border-slate-100 hover:border-primary bg-white'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-bold text-slate-800">{s.nome}</p>
                      {s.descricao && <p className="text-sm text-slate-500">{s.descricao}</p>}
                    </div>
                    <span className="font-bold text-primary">{formatarMoeda(s.preco)}</span>
                  </button>
                ))}
                {(!Array.isArray(servicos) || servicos.length === 0) && (
                  <p className="text-slate-500 py-8">Nenhum serviço disponível.</p>
                )}
            </div>
          )}

          {etapa === 3 && (
            <div className="space-y-3">
                  {adicionais.map((ad) => (
                  <button
                    key={ad.id}
                    onClick={() => alternarAdicional(ad)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      adicionaisSelecionados.find(a => a.id === ad.id)
                        ? 'border-primary bg-[var(--cor-light)]' 
                        : 'border-slate-100 hover:border-primary bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${adicionaisSelecionados.find(a => a.id === ad.id) ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                        {adicionaisSelecionados.find(a => a.id === ad.id) && <Check size={14} className="text-white" />}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800">{ad.nome}</p>
                        {ad.descricao && <p className="text-sm text-slate-500">{ad.descricao}</p>}
                      </div>
                    </div>
                    <span className="font-bold text-primary">+{formatarMoeda(ad.preco)}</span>
                  </button>
                ))}
            </div>
          )}

          {etapa === 4 && (
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
                          className={`h-10 w-10 mx-auto rounded-xl font-bold flex flex-col items-center justify-center transition-all relative ${
                            selecionado ? 'bg-primary text-white shadow-lg scale-110 z-10' : 
                            !passado && status === 'disponivel' ? 'bg-white hover:bg-[var(--cor-light)] text-slate-700 hover:text-primary border border-slate-100' : 'bg-slate-50 text-slate-300 cursor-not-allowed opacity-60 text-xs shadow-none border-none'
                          }`}
                        >
                          {format(dia, 'd')}
                          {!passado && (status === 'disponivel' || status === 'lotado') && (
                            <div className={`absolute bottom-1.5 w-3 h-1 rounded-full ${corDot}`}></div>
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
                      horariosDisponiveis.map(slot => {
                        const isObject = typeof slot === 'object';
                        const horaTexto = isObject ? slot.inicio : slot;
                        const selecionado = horarioSelecionado === horaTexto;

                        return (
                          <button
                            key={horaTexto}
                            onClick={() => setHorarioSelecionado(horaTexto)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl font-bold transition-all border ${
                              selecionado 
                              ? 'bg-primary text-white shadow-lg scale-105 border-primary/20' 
                              : 'bg-white text-slate-600 hover:bg-[var(--cor-light)] hover:text-primary border-slate-200 shadow-sm'
                            }`}
                          >
                            <span className="text-sm">{horaTexto}</span>
                            {isObject && slot.vagasRestantes !== undefined && (
                              <span className={`text-[9px] uppercase font-black mt-1 ${selecionado ? 'text-white/80' : 'text-slate-400'}`}>
                                {slot.vagasRestantes} {slot.vagasRestantes === 1 ? 'vaga' : 'vagas'}
                              </span>
                            )}
                          </button>
                        );
                      })
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
          {etapa === 5 && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Primeiro Nome</label>
                  <input 
                    type="text" 
                    value={dadosCliente.nome}
                    onChange={(e) => setDadosCliente({...dadosCliente, nome: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-2 focus:ring-[var(--cor-light)] outline-none transition-all font-medium text-slate-800"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Sobrenome</label>
                  <input 
                    type="text" 
                    value={dadosCliente.sobrenome}
                    onChange={(e) => setDadosCliente({...dadosCliente, sobrenome: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-2 focus:ring-[var(--cor-light)] outline-none transition-all font-medium text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Digite seu Celular / WhatsApp</label>
                <input 
                  type="tel" 
                  placeholder="(00) 00000-0000"
                  value={dadosCliente.telefone}
                  onChange={(e) => setDadosCliente({...dadosCliente, telefone: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-2 focus:ring-[var(--cor-light)] outline-none transition-all font-medium text-slate-800"
                />
              </div>

              {/* CAMPOS PERSONALIZADOS (DINÂMICOS) */}
              {camposFormulario.length > 0 && (
                <div className="pt-4 border-t border-dashed border-slate-200 mt-4 space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Plus size={10} /> Informações Adicionais
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    {camposFormulario.map(campo => (
                      <div key={campo.id}>
                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                          {campo.label} {campo.obrigatorio && <span className="text-rose-400">*</span>}
                        </label>
                        <input 
                          type={campo.tipo === 'NUMBER' ? 'number' : 'text'}
                          value={respostasExtras[campo.id] || ''}
                          onChange={(e) => setRespostasExtras({...respostasExtras, [campo.id]: e.target.value})}
                          placeholder={campo.obrigatorio ? '(Obrigatório)' : ''}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-2 focus:ring-[var(--cor-light)] outline-none transition-all font-medium text-slate-800"
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
          <div className="px-8 py-5 border-t border-slate-200 flex justify-between items-center bg-white">
            {(etapa > 1 && etapa !== 6) ? (
              <button onClick={etapaAnterior} className="flex items-center text-slate-600 font-bold hover:text-slate-800 transition-colors">
                <ChevronLeft size={20} className="mr-1" /> Voltar
              </button>
            ) : <div />}

            <button 
              disabled={proximoDesabilitado() || carregandoPagamento}
              onClick={etapa === 5 ? confirmarAgendamento : proximaEtapa} 
              className="flex items-center bg-primary hover:brightness-110 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-lg font-bold transition-colors shadow-lg"
            >
              {carregandoPagamento ? <Loader2 className="animate-spin" size={18} /> : (etapa === 5 ? (empresa.exigirPagamentoAntecipado ? 'Ir para Pagamento' : 'Confirmar Reserva') : 'Próximo')} <ArrowRight size={18} className="ml-2" />
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

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-8 font-sans" style={{ backgroundImage: 'radial-gradient(circle at center, #334155 0%, #0f172a 100%)' }}>
      
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col lg:flex-row w-full max-w-[1000px] h-[750px] lg:h-[650px] animate-in zoom-in-95 duration-300">
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
