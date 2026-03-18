# Guia de Arquitetura e Implementação - SaaS Agendamento SimHal

Este guia descreve tecnicamente como implementar cada módulo do nosso SaaS. Ele serve como o mapa do tesouro para o desenvolvimento das próximas fases. Lembre-se que cada módulo envolve três camadas: **Banco de Dados (Prisma)**, **Backend (Express)** e **Frontend (React)**.

---

## 🏗️ 0. Arquitetura Básica (Regras do Jogo)
Como somos um SaaS (Multi-tenant), todos os dados pertencem a uma `Empresa`.
- **Regra de Ouro (Backend):** Toda rota de API precisa receber o `empresaId`, extraído do Token JWT ou do Slug da URL. Nenhuma query no banco de dados pode ser feita sem filtrar por `empresaId` (ex: `prisma.agendamento.findMany({ where: { empresaId: id } })`), para evitar vazamento de dados entre salões.
- **Regra de Ouro (Frontend):** O `PainelAdmin` usa o contexto de autenticação para saber qual empresa logou. O `AgendamentoCliente` usa o parâmetro na URL (`/:slug`) para buscar os dados corretos da empresa.

---

## 📅 1. Módulo: Agenda e Agendamento Público (Core)

Onde o cliente visualiza os horários e onde o dono os aprova.

### Backend (Node.js)
- **Arquivo de Rota:** `servidor/src/rotas/agendamentoRotas.js`
- **Arquivo Controlador:** `servidor/src/controladores/AgendamentoControlador.js`
- **O que fazer:** Criar rotas para `listarAgendamentos(empresaId)`, `listarHorariosDisponiveis(profissionalId, data)`, `criarAgendamento(dados)`.
- **Regra de Negócio (Horários Disponíveis):** O backend deve checar o horário de trabalho do profissional na tabela de funcionários, subtrair os agendamentos já existentes no dia, e retornar apenas os horários livres.

### Frontend (React)
- **Arquivo da Página Pública:** `interface/src/paginas/AgendamentoCliente.jsx`
- **O que fazer:**
  - Alterar o `App.jsx` para rotear como `<Route path="/agendar/:slug" element={<AgendamentoCliente />} />`.
  - No `AgendamentoCliente`, pegar o `:slug` da URL via `useParams()`.
  - Fazer uma requisição `GET /api/negocio/info/:slug` para pegar o Nome, Logo e ID da Empresa no banco.
  - Carregar os barbeiros dessa empresa. Quando clicar no calendário, chamar a API de horários disponíveis mencionada acima.

---

## 👥 2. Módulo: Clientes (CRM)

### Backend (Node.js)
- **Arquivo de Rota:** `servidor/src/rotas/clienteRotas.js`
- **Arquivo Controlador:** `servidor/src/controladores/ClienteControlador.js`
- **O que fazer:** Rota genérica de listagem paginada `GET /api/clientes/:empresaId`. Um endpoint para `GET /api/clientes/estatisticas/:clienteId` que cruza a tabela `Agendamento` para contar quantas vezes ele foi atendido e a última visita.

### Frontend (React)
- **Arquivo do Componente:** `interface/src/componentes/Paineis/VisaoClientes.jsx` (Dica: Vamos tirar as `Visao` do arquivo principal `PainelAdmin.jsx` para não deixar ele gigante).
- **O que fazer:**
  - Tabela com chamadas via AXIOS (ex: `axios.get('/api/clientes')`).
  - Botão "Novo Cliente" abrindo o `<ModalNovoCliente />` (`interface/src/componentes/Modais/...`).

---

## ✂️ 3. Módulo: Serviços

### Backend (Node.js)
- **Modelagem Atual (Schema):** Tabela `Servico`.
- **Criar Controlador novo:** `servidor/src/controladores/ServicoControlador.js`
- **O que fazer:** Endpoints de CRUD Padrão. `criar_servico`, `editar_servico`, `listar_servicos`, `excluir_servico` (na verdade seria melhor um *soft delete* atualizando `ativo: false`).

### Frontend (React)
- **Arquivo do Componente:** `interface/src/componentes/Paineis/VisaoServicos.jsx`
- **O que fazer:** Os Cards de serviços mostram apenas os serviços "Ativos". Formulário de criação deve ter validações de preço (transformar string com vírgula para número real antes de enviar).

---

## 👨‍💼 4. Módulo: Equipe (Funcionários)

### Backend (Node.js)
- **Modelagem Atual:** Tabela `Profissional` ou extensão da tabela `Usuario`. (Recomendação: Transformar `Usuario` para ter coluna `isProfissional: true` e `horariosDeTrabalho: JSON`).
- **Arquivo Controlador:** `servidor/src/controladores/EquipeControlador.js`.
- **O que fazer:** Endpoint que aceita um array de dias da semana e horários para que o profissional defina quando atende. Ex: Segunda (Oculto), Terça a Sexta (09h-18h).

### Frontend (React)
- **Arquivo do Componente:** `interface/src/componentes/Paineis/VisaoFuncionarios.jsx`
- **O que fazer:** Uma tabela de lista. Ao clicar em "Convidar Membro", deve enviar um convite por e-mail ou gerar uma senha temporária exibida na tela (mais simples para V1).

---

## 💰 5. Módulo: Financeiro

### Backend (Node.js)
- **Alteração Prisma:** Módulo novo, precisa adicionar Modelo `Transacao { id, tipo(ENTRADA/SAIDA), categoria, valor, empresaId, responsavelId, agendamentoId? }` no `schema.prisma`.
- **Controlador:** `servidor/src/controladores/FinanceiroControlador.js`
- **O que fazer:** Ao confirmar um agendamento cujo `status` vá para `CONCLUIDO`, um _trigger_ ou código no backend deve criar automaticamente uma `Transacao` de ENTRADA no financeiro.

### Frontend (React)
- **Arquivo:** `interface/src/componentes/Paineis/VisaoFinanceiro.jsx`
- **O que fazer:** Tela principal no formato Dashboard com Gráficos de barra (usar biblioteca como `recharts`). Listagem de Entradas e Saídas diárias.

---

## 💳 6. Módulo: Assinatura (A Receita do Criador - Você)

Como você é o dono da plataforma (Super Admin), você precisa de controle. Todas as empresas têm um status de assinatura.

### Backend (Node.js)
- **Alteração Prisma:** No modelo `Empresa`, adicionar campos `planoAtualId`, `statusAssinatura`, `dataVencimento`.
- **O que fazer:** Integrar o webhook do Mercado Pago (ou Stripe) no Express (`POST /api/webhooks/assinatura`). Quando o cliente pagar, o status atualiza.
- **Middleware:** `servidor/src/middlewares/verificarAssinatura.js`. Antes de qualquer rota (exeto pública), o backend passa nesse arquivo e verifica se a empresa está com a mensalidade em dia. Se não, retorna Erro 402 Payment Required.

### Frontend (React)
- **Arquivo:** `interface/src/componentes/Paineis/VisaoAssinatura.jsx`
- **O que fazer:** Tela de checkout. Usa a API do Mercado Pago Checkout Bricks e renderiza dentro desse componente as opções de Cartão e PIX.

---

## 🛠️ Plano Rápido: Como começamos? (Ação Imediata)

Para sair dos mocks e ir para a realidade, a sequência correta de codificação sugerida é:

1. **Sementes do Banco (Seeds):** Criar um scriptzinho rápido na pasta do sevidor (`servidor/prisma/seed.js`) para popular 5 serviços e 3 profissionais no ID da empresa de teste.
2. **Rota do Cliente (`slug`):** Alterar o `App.jsx` e o `AgendamentoCliente.jsx` para que a tela veja a URL, leia o `:slug` (ex: `localhost:3000/barbeariaX`), puxe do servidor (usando o recém-criado `NegocioControlador`) o UUID da empresa, seus profissionais e serviços, e armazene no estado.
3. **Enviar a Reserva:** Fazer a função do botão final do formulário público chamar a API `POST` de agendamentos.
4. **Ver a Reserva (Painel):** Fazer a `VisaoPainel` e `VisaoAgenda` chamarem um `GET` e pararem de pular direto do `const MOCK = []`.
5. **Divisão de Arquivos:** Pegar a monstruosidade do `PainelAdmin.jsx` (250 linhas) e quebrar em pedacinhos para a pasta `/componentes/Paineis/` para não ficarmos loucos na manutenção.
