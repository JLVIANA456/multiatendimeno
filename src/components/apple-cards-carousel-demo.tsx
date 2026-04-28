"use client";

import React, { useState, useEffect } from "react";
import { Carousel, Card } from "components/ui/apple-cards-carousel";
import { useDepartments } from "common/hooks/useDepartments";
import { supabase } from "lib/supabase";

const DepartmentDetails = ({ dept }: { dept: any }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Busca todos os consultores do escritório
  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*');
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserDept = async (userId: string, isCurrentlyIn: boolean) => {
    const newDeptId = isCurrentlyIn ? null : dept.id;
    const { error } = await supabase
      .from('profiles')
      .update({ department_id: newDeptId })
      .eq('id', userId);

    if (!error) fetchUsers();
  };

  return (
    <div className="space-y-12 py-10 font-sans font-light">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-light text-primary-600 mb-2">{dept.messages || 0}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-normal">Mensagens</span>
        </div>
        <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-light text-primary-600 mb-2">{users.filter(u => u.department_id === dept.id).length}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-normal">No Setor</span>
        </div>
        <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-light text-green-500 mb-2">{dept.growth || '0%'}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-normal">Eficiência</span>
        </div>
      </div>

      {/* Gestão de Equipe */}
      <section>
        <div className="flex justify-between items-center mb-8 px-4">
          <h4 className="text-xl font-light text-gray-900 leading-none">Gestão da <span className="font-normal italic text-primary-600">Equipe JL+</span></h4>
          <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Vincule consultores a este departamento</p>
        </div>

        <div className="space-y-3 px-2">
          {users.map((user) => {
            const isInDept = user.department_id === dept.id;
            return (
              <div key={user.id} className={`flex items-center gap-6 p-5 rounded-3xl border transition-all duration-500 ${isInDept ? 'bg-primary-500 text-white border-primary-500 shadow-xl shadow-primary-200' : 'bg-white border-gray-50 hover:border-primary-100 shadow-sm'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${isInDept ? 'bg-white/20' : 'bg-gray-50 text-primary-500'}`}>
                  <i className="fa-solid fa-user-tie"></i>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-normal truncate">{user.full_name || user.email}</p>
                  <p className={`text-[10px] font-light italic truncate opacity-60`}>{user.role || 'Member'}</p>
                </div>
                <button
                  onClick={() => toggleUserDept(user.id, isInDept)}
                  className={`px-6 py-3 rounded-2xl text-[9px] font-normal uppercase tracking-widest transition-all ${isInDept
                      ? 'bg-white text-primary-600 hover:bg-red-50 hover:text-red-500'
                      : 'bg-primary-500 text-white hover:bg-primary-600'
                    }`}
                >
                  {isInDept ? 'Remover' : 'Vincular'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <div className="bg-primary-50/10 p-8 rounded-[2.5rem] border border-primary-100/30 text-center">
        <p className="text-[11px] text-gray-500 font-light italic leading-relaxed">
          Configuração de visibilidade da JLVIANA Consultoria Contábil. Membros vinculados a este setor terão acesso priorizado às mensagens e clientes correspondentes.
        </p>
      </div>
    </div>
  );
};

export default function AppleCardsCarouselDemo() {
  const { departments } = useDepartments();

  const cards = departments.map((dept, index) => (
    <Card key={dept.id} card={{
      id: dept.id,
      category: dept.category,
      title: dept.title,
      src: dept.src,
      content: <DepartmentDetails dept={dept} />
    }} index={index} />
  ));

  return (
    <div className="w-full h-full py-6">
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-2xl font-light text-neutral-800 font-sans tracking-tight mb-4 px-4">
        Overview dos <span className="text-primary-600 font-normal italic">Departamentos JLVIANA</span>
      </h2>
      <Carousel items={cards} />
    </div>
  );
}

