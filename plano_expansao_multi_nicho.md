# Plano de Expansão Multi-Nicho 🚀

Este plano detalha as mudanças necessárias para que o SimHal atenda qualquer tipo de negócio baseado em agendamento, além de barbearias e salões.

## 1. Generalização de Terminologia (White-labeling de termos)
**Status**: ✅ CONCLUÍDO
- [x] **Modelo Empresa**: Campo `customLabels` (JSON) no Prisma.
- [x] **Frontend**: Hook `useTermos()` integrado em todo o sistema (Admin e Checkout).

---

## 2. Agendamentos Coletivos (Aulas e Workshops)
**Status**: ✅ CONCLUÍDO
- [x] **Modelo Servico**: Adicionado campo `capacidadeMaxima` (Int, default: 1).
- [x] **AgendamentoControlador**: Lógica de conflito atualizada para permitir múltiplos agendamentos por slot.
- [x] **Frontend**: Exibição de vagas restantes no checkout.

---

## 3. Campos Personalizados no Checkout (Form Builder)
**Status**: ✅ CONCLUÍDO
- [x] **Novo Modelo**: `CampoFormulario` (empresaId, label, tipo, obrigatorio).
- [x] **Backend**: `CampoFormularioControlador.js` e rotas criadas.
- [x] **Agendamento**: Suporte para salvar `respostasExtras` no controlador.
- [x] **Frontend (Gestão)**: Interface criada na `VisaoConfiguracoes`.
- [x] **Frontend (Checkout)**: Renderização dinâmica dos campos.

---

## 4. Tempo de Preparo / Buffer Time
**Status**: ✅ CONCLUÍDO
- [x] **Modelo Servico**: Campo `tempoBuffer` (Int) no Prisma.
- [x] **Backend**: Disponibilidade considera `duracao + tempoBuffer`.
- [x] **Frontend (Gestão)**: Campo de "Preparo" adicionado em `VisaoServicos.jsx`.

---

## 5. Múltiplas Unidades (Multi-unidades)

**Objetivo**: Uma única conta gerenciar várias lojas físicas.

### Mudanças no Backend

- [ ] **Novo Modelo**: `Unidade` (id, nome, endereco, telefone, empresaId).
- [ ] **Relações**: 
    - Vincular `Usuario` (Profissional) a uma `Unidade`.
    - Vincular `Agendamento` a uma `Unidade`.
- [ ] **API**: Rotas para CRUD de unidades.
- [ ] **Frontend**: Nova visão "Minhas Unidades" no painel.
- [ ] **Checkout**: Primeira etapa se torna "Escolha a Unidade" (somente se houver mais de uma).

---

## Cronograma Atualizado
1. **Fase 1 (Termos e Buffer)**: ✅ Finalizado.
2. **Fase 2 (Form Builder UI)**: ✅ Finalizado.
3. **Fase 3 (Capacidade)**: ✅ Finalizado.
4. **Fase 4 (Multi-unidades)**: 📅 Próxima etapa (Gestão de filiais).
