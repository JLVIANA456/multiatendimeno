import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export const useTags = (conversaKey?: string) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const { user } = useAuth();

  // Busca todas as tags disponíveis
  const fetchAllTags = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) console.error(error);
    else setTags(data || []);
  }, [user]);

  // Busca as tags vinculadas a uma conversa específica
  const fetchSelectedTags = useCallback(async () => {
    if (!conversaKey) {
        setSelectedTags([]);
        return;
    }
    const { data, error } = await supabase
      .from('conversa_tags')
      .select('tag_id, tags(*)')
      .eq('conversa_key', conversaKey);

    if (error) console.error(error);
    else {
        const mapped = data.map(item => item.tags as unknown as Tag);
        setSelectedTags(mapped);
    }
  }, [conversaKey]);

  useEffect(() => {
    fetchAllTags();
    if (conversaKey) fetchSelectedTags();

    const tagChan = supabase.channel('tags-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tags' }, fetchAllTags)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'conversa_tags' }, fetchSelectedTags)
        .subscribe();

    return () => { supabase.removeChannel(tagChan); };
  }, [fetchAllTags, fetchSelectedTags, conversaKey]);

  const addTag = async (name: string, color: string) => {
    if (!user) return;
    await supabase.from('tags').insert({ name, color, user_id: user.id });
  };

  const deleteTag = async (id: string) => {
    await supabase.from('tags').delete().eq('id', id);
  };

  const toggleTagInConversa = async (tagId: string) => {
    if (!conversaKey) return;
    
    const isAlreadySelected = selectedTags.some(t => t.id === tagId);
    
    if (isAlreadySelected) {
        await supabase.from('conversa_tags')
            .delete()
            .match({ conversa_key: conversaKey, tag_id: tagId });
    } else {
        await supabase.from('conversa_tags')
            .insert({ conversa_key: conversaKey, tag_id: tagId });
    }
    fetchSelectedTags();
  };

  return { tags, selectedTags, addTag, deleteTag, toggleTagInConversa };
};
