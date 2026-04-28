import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export interface Department {
  id: string;
  name: string;
  category: string;
  title: string;
  desc?: string;
  src: string;
  active: number;
  messages: number;
  growth: string;
  color: string;
  members: number;
}

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const { user } = useAuth();

  const fetchDepartments = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar departamentos:', error);
      return;
    }

    const mapped: Department[] = data.map(d => {
      const name = d.name.toLowerCase();
      console.log('Mapeando departamento:', d.name);
      
      let localSrc = d.src;
      if (!d.src || d.src.includes('unsplash.com') || d.src.includes('pravatar.cc')) {
        if (name.includes('bpo')) localSrc = "/assets/dashboard/Departamento%20BPO.jpg";
        else if (name.includes('contabil') || name.includes('contábil')) localSrc = "/assets/dashboard/Departamento%20Contabil.jpg";
        else if (name.includes('financeiro')) localSrc = "/assets/dashboard/Departamento%20Financeiro.jpg";
        else if (name.includes('fiscal')) localSrc = "/assets/dashboard/Departamento%20Fiscal.jpg";
        else if (name.includes('pessoal')) localSrc = "/assets/dashboard/Departamento%20PESSOAL.jpg";
        else if (name.includes('diretoria')) localSrc = "/assets/dashboard/Departamento%20diretoria.jpg";
        else if (name.includes('qualidade')) localSrc = "/assets/dashboard/Departamento%20qualidade.jpg";
        else localSrc = "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2601&auto=format&fit=crop";
      }

      return {
        id: d.id,
        name: d.name,
        category: "Departamento Platinum",
        title: `Departamento de ${d.name}`,
        desc: d.description,
        src: localSrc,
        active: 0,
        messages: 0,
        growth: "+0%",
        color: d.color || "from-blue-400 to-blue-600",
        members: d.members_count || 0
      };
    });

    setDepartments(mapped);
  }, [user]);

  useEffect(() => {
    fetchDepartments();

    const channel = supabase.channel('departments-db')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, fetchDepartments)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchDepartments]);

  const addDepartment = async (dept: Partial<Department>) => {
    if (!user) return;
    const { error } = await supabase.from('departments').insert({
      name: dept.name,
      description: dept.desc,
      color: dept.color,
      user_id: user.id
    });
    if (error) console.error('Erro ao adicionar:', error);
    else fetchDepartments(); // Atualiza lista imediatamente
  };

  const updateDepartment = async (id: string, updates: Partial<Department>) => {
    const { error } = await supabase.from('departments').update({
      name: updates.name,
      description: updates.desc,
      color: updates.color
    }).eq('id', id);
    if (error) console.error('Erro ao atualizar:', error);
    else fetchDepartments(); // Atualiza lista imediatamente
  };

  const deleteDepartment = async (id: string) => {
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) console.error('Erro ao deletar:', error);
    else fetchDepartments(); // Atualiza lista imediatamente
  };

  return { departments, addDepartment, updateDepartment, deleteDepartment };
};

