import { useMemo } from 'react';

// Termos padrão do sistema (Barbearia)
const TERMOS_PADRAO = {
    profissional: 'Profissional',
    profissionais: 'Profissionais',
    servico: 'Serviço',
    servicos: 'Serviços',
    cliente: 'Cliente',
    clientes: 'Clientes',
    agendamento: 'Agendamento',
    agendamentos: 'Agendamentos',
    agenda: 'Agenda'
};

export function useTermos(empresa) {
    const termos = useMemo(() => {
        if (!empresa || !empresa.customLabels) {
            return TERMOS_PADRAO;
        }

        const labels = typeof empresa.customLabels === 'string' 
            ? JSON.parse(empresa.customLabels) 
            : empresa.customLabels;

        return {
            ...TERMOS_PADRAO,
            ...labels
        };
    }, [empresa?.customLabels]);

    // Função auxiliar para capitalizar a primeira letra
    const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    return {
        ...termos,
        Profissional: capitalizar(termos.profissional),
        Profissionais: capitalizar(termos.profissionais),
        Servico: capitalizar(termos.servico),
        Servicos: capitalizar(termos.servicos),
        Cliente: capitalizar(termos.cliente),
        Clientes: capitalizar(termos.clientes),
        Agendamento: capitalizar(termos.agendamento),
        Agendamentos: capitalizar(termos.agendamentos),
        Agenda: capitalizar(termos.agenda)
    };
}
