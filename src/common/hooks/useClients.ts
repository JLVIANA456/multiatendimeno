import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export interface Responsible {
    id: string;
    name: string;
    whatsapp?: string;
}

export interface Client {
    id: string;
    name: string;
    whatsapp: string;
    responsibles: Responsible[];
}

export const useClients = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const { user } = useAuth();

    // fetchClients depende de [user] para re-executar quando o auth carregar
    const fetchClients = useCallback(async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('clients')
            .select(`
                id,
                name,
                whatsapp,
                responsibles (id, name, whatsapp)
            `)
            .order('name', { ascending: true });

        if (error) {
            console.error('Erro ao buscar clientes:', error);
            return;
        }

        setClients(data || []);
    }, [user]);

    // Carrega na montagem e escuta mudanças em tempo real
    useEffect(() => {
        fetchClients();

        const clientChan = supabase
            .channel('clients-db')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, fetchClients)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'responsibles' }, fetchClients)
            .subscribe();

        return () => { supabase.removeChannel(clientChan); };
    }, [fetchClients]);

    // ─── Adicionar cliente + responsáveis ─────────────────────────────────────
    const addClient = useCallback(async (clientData: Omit<Client, 'id'>) => {
        if (!user) return;

        // 1. Inserir o cliente
        const { data: client, error: cError } = await supabase
            .from('clients')
            .insert({
                name: clientData.name,
                whatsapp: clientData.whatsapp,
                user_id: user.id,
            })
            .select()
            .single();

        if (cError) {
            console.error('Erro ao inserir cliente:', cError);
            throw cError; // propaga para o try/catch da página
        }

        // 2. Inserir responsáveis (se houver)
        if (clientData.responsibles && clientData.responsibles.length > 0) {
            const resData = clientData.responsibles.map(r => ({
                client_id: client.id,
                name: r.name,
                whatsapp: r.whatsapp || null,
                user_id: user.id,
            }));

            const { error: rError } = await supabase
                .from('responsibles')
                .insert(resData);

            if (rError) {
                console.error('Erro ao inserir responsáveis:', rError);
                // Não faz throw aqui — cliente já foi salvo
            }
        }

        // 3. Atualiza a lista imediatamente
        await fetchClients();
    }, [user, fetchClients]);

    // ─── Atualizar cliente ────────────────────────────────────────────────────
    const updateClient = useCallback(async (id: string, updated: Partial<Client>) => {
        if (!user) return;

        const { error: uError } = await supabase
            .from('clients')
            .update({ name: updated.name, whatsapp: updated.whatsapp })
            .eq('id', id);

        if (uError) {
            console.error('Erro ao atualizar cliente:', uError);
            throw uError;
        }

        // Re-sincroniza responsáveis
        if (updated.responsibles !== undefined) {
            await supabase.from('responsibles').delete().eq('client_id', id);

            if (updated.responsibles.length > 0) {
                const resData = updated.responsibles.map(r => ({
                    client_id: id,
                    name: r.name,
                    whatsapp: r.whatsapp || null,
                    user_id: user.id,
                }));
                await supabase.from('responsibles').insert(resData);
            }
        }

        await fetchClients();
    }, [user, fetchClients]);

    // ─── Deletar cliente ──────────────────────────────────────────────────────
    const deleteClient = useCallback(async (id: string) => {
        if (!window.confirm('Deseja realmente remover este cliente?')) return;
        await supabase.from('clients').delete().eq('id', id);
        await fetchClients();
    }, [fetchClients]);

    return { clients, addClient, updateClient, deleteClient, fetchClients };
};
