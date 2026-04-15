import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export interface Channel {
  id: string;
  name: string;
  type: 'WhatsApp' | 'Instagram' | 'WebChat' | 'Facebook';
  status: 'Ativo' | 'Inativo';
  number?: string;
  lastSync?: string;
  zapi_instance?: string;
  zapi_token?: string;
  zapi_client_token?: string;
}

export const useChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const { user } = useAuth();

  const fetchChannels = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar canais:', error);
      return;
    }

    const mapped: Channel[] = data.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type || 'WhatsApp',
      status: c.status === 'CONNECTED' ? 'Ativo' : 'Inativo',
      number: c.number,
      lastSync: 'Visto agora',
      zapi_instance: c.zapi_instance,
      zapi_token: c.zapi_token,
      zapi_client_token: c.zapi_client_token
    }));

    setChannels(mapped);
  }, [user]);

  useEffect(() => {
    fetchChannels();
    const channel = supabase.channel('channels-db')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, fetchChannels)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchChannels]);

  const addChannel = async (chan: Partial<Channel>) => {
    if (!user) return;
    const { error } = await supabase.from('channels').insert({
      name: chan.name,
      type: chan.type,
      number: chan.number,
      zapi_instance: chan.zapi_instance,
      zapi_token: chan.zapi_token,
      zapi_client_token: chan.zapi_client_token,
      user_id: user.id
    });
    if (error) console.error('Erro ao adicionar:', error);
    else fetchChannels(); // Atualiza lista imediatamente
  };

  const deleteChannel = async (id: string) => {
    const { error } = await supabase.from('channels').delete().eq('id', id);
    if (error) console.error('Erro ao deletar:', error);
    else fetchChannels(); // Atualiza lista imediatamente
  };

  return { channels, addChannel, deleteChannel };
};

