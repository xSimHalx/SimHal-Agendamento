# 🗺️ Plano de Expansão: Módulos Administrativos SimHal

Este plano detalha a estratégia para implementar as abas que atualmente estão em modo "Em Construção". O foco é transformar o SimHal em um ERP/CRM completo para barbearias e salões.

---

## 💰 1. Módulo: Financeiro
Transformar os agendamentos em dinheiro real e gerenciar gastos da loja.

*   **O que terá**: 
    *   Fluxo de Caixa (Entradas vs Saídas).
    *   Botão "Nova Despesa" (Água, Luz, Aluguel).
    *   Extrato detalhado de transações.
*   **Dados Necessários**:
    *   Tabela `Transacao`: Já existe no `schema.prisma` com `tipo` (ENTRADA/SAIDA), `valor` e `categoria`.
    *   Tabela `Agendamento`: Para gerar entradas automáticas quando um serviço for marcado como "CONCLUIDO".
*   **Arquivos Envolvidos**:
    *   `servidor/src/controladores/FinanceiroControlador.js` (Novo).
    *   `servidor/src/rotas/financeiroRotas.js` (Novo).
    *   `interface/src/componentes/Paineis/VisaoFinanceiro.jsx` (Novo).

---

## 📊 2. Módulo: Relatórios
Visão analítica para tomada de decisão do dono.

*   **O que terá**:
    *   Ranking de Serviços: "O que mais dá dinheiro?".
    *   Desempenho por Barbeiro: "Quem mais atende?".
    *   Ticket Médio Mensal.
*   **Dados Necessários**:
    *   Agregações SQL (COUNT/SUM) sobre a tabela `Agendamento` filtrando por `EmpresaId`.
*   **Arquivos Envolvidos**:
    *   `servidor/src/controladores/RelatorioControlador.js` (Novo).
    *   `interface/src/componentes/Paineis/VisaoRelatorios.jsx` (Novo).

---

## 📣 3. Módulo: Marketing & CRM
Ferramentas para trazer o cliente de volta.

*   **O que terá**:
    *   Lista de "Clientes Sumidos" (não aparecem há +30 dias).
    *   Botão de disparo rápido para WhatsApp com template pronto.
    *   Gestão de Cupons de Desconto.
*   **Dados Necessários**:
    *   `Cliente`: Cruzar `criadoEm` com a data do último `Agendamento`.
*   **Arquivos Envolvidos**:
    *   `interface/src/componentes/Paineis/VisaoMarketing.jsx` (Novo).
    *   Integração frontal com `https://wa.me/`.

---

## 💳 4. Módulo: Assinatura (SaaS)
Área onde o dono paga pelo uso do SimHal.

*   **O que terá**:
    *   Status do Plano (Trial, Bronze, Prata, Ouro).
    *   Data de Vencimento e Botão de Renovação.
    *   Histórico de Faturas.
*   **Dados Necessários**:
    *   `Empresa`: Campos `planoAtual`, `statusAssinatura` e `dataVencimento` (já existem no schema).
*   **Arquivos Envolvidos**:
    *   `interface/src/componentes/Paineis/VisaoAssinatura.jsx` (Novo).

---

## 🔗 5. Módulo: Integrações
Conectar o SimHal com o mundo exterior.

*   **O que terá**:
    *   Google Calendar: Sincronizar agenda pessoal do barbeiro.
    *   Instagram: Colocar botão de agendamento na Bio.
    *   Meios de Pagamento: Configurar Mercado Pago ou Stripe.
*   **Arquivos Envolvidos**:
    *   `interface/src/componentes/Paineis/VisaoIntegracoes.jsx` (Novo).

---

## 🤖 6. Módulo: Automação
Deixar o sistema trabalhando sozinho.

*   **O que terá**:
    *   Lembretes de WhatsApp (2h antes do horário).
    *   Mensagem de "Feliz Aniversário".
    *   Confirmação automática de agendamento.
*   **Arquivos Envolvidos**:
    *   `servidor/src/jobs/` (Scripts que rodarão em background).
    *   `interface/src/componentes/Paineis/VisaoAutomacao.jsx` (Novo).

---

## 🛡️ 7. Módulo: Auditoria / Logs
Segurança para o dono saber quem fez o quê.

*   **O que terá**:
    *   Histórico de Logs: "Barbeiro X deletou agendamento de Cliente Y".
    *   Alterações de Configuração.
*   **Dados Necessários**:
    *   Nova tabela `LogAuditoria` no Prisma.

---

## 🆘 8. Módulo: Suporte
Canal direto com a equipe do SimHal.

*   **O que terá**:
    *   Chat de Ajuda.
    *   Vídeos Tutoriais.
    *   Abertura de Tickets de Erro.
