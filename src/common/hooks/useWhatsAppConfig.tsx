import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface WhatsAppConfig {
  id: string;
  name: string;
  instance_id: string;
  instance_token: string;
  client_token?: string;
  is_active: boolean;
  created_at?: string;
}

export const useWhatsAppConfig = () => {
  const [configs, setConfigs] = useState<WhatsAppConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('whatsapp_config')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar configurações WhatsApp:', error);
    } else {
      setConfigs(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConfigs();
    
    // Realtime setup
    const channel = supabase.channel('whatsapp_config_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_config' }, fetchConfigs)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchConfigs]);

  const addConfig = async (config: Omit<WhatsAppConfig, 'id' | 'is_active'>) => {
    const { error } = await supabase.from('whatsapp_config').insert([config]);
    if (error) throw error;
    fetchConfigs();
  };

  const deleteConfig = async (id: string) => {
    const { error } = await supabase.from('whatsapp_config').delete().eq('id', id);
    if (error) throw error;
    fetchConfigs();
  };

  const toggleActive = async (id: string) => {
    // Primeiro, desativa todos
    await supabase.from('whatsapp_config').update({ is_active: false }).neq('id', id);
    // Depois, ativa o selecionado
    const { error } = await supabase.from('whatsapp_config').update({ is_active: true }).eq('id', id);
    if (error) throw error;
    fetchConfigs();
  };

  return { configs, loading, addConfig, deleteConfig, toggleActive, refresh: fetchConfigs };
};
