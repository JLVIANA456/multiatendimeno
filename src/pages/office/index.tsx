import React, { useState, useEffect } from "react";
import { supabase } from "lib/supabase";

const OfficePage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        // Busca usuários e departamentos no banco de dados real
        const { data: profiles } = await supabase.from('profiles').select('*');
        const { data: depts } = await supabase.from('departments').select('*');
        
        if (profiles) setUsers(profiles);
        if (depts) setDepartments(depts);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateDept = async (userId: string, deptId: string) => {
        const { error } = await supabase.from('profiles').update({ department_id: deptId }).eq('id', userId);
        if (!error) fetchData(); // Recarrega os dados após a atualização
    };

    return (
        <div className="flex-1 bg-gray-50/30 p-10 overflow-y-auto custom-scrollbar font-sans font-light">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-light text-gray-900 tracking-tight mb-2">Escritório</h2>
                    <p className="text-gray-400 text-sm italic py-2 px-4 bg-white/50 inline-block rounded-full border border-gray-100">
                        🏢 Empresa: <span className="font-normal text-primary-600">JLVIANA Consultoria Contábil</span>
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Status do Escritório</p>
                    <span className="text-green-500 font-normal text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Operação Ativa
                    </span>
                </div>
            </header>

            <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="text-xl font-light text-gray-800">Consultores e Colaboradores</h3>
                    <p className="text-xs text-gray-400 font-light">{users.length} consultores ativos</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left font-light">
                        <thead>
                            <tr className="bg-gray-50/50 uppercase text-[10px] tracking-[0.2em] text-gray-600">
                                <th className="px-8 py-5 font-normal">Consultor</th>
                                <th className="px-8 py-5 font-normal">Cargo Equipe JL+</th>
                                <th className="px-8 py-5 font-normal">Departamento Atual</th>
                                <th className="px-8 py-5 font-normal text-right">Mudar Atribuição</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((user) => {
                                const userDept = departments.find(d => d.id === user.department_id);
                                return (
                                    <tr key={user.id} className="group hover:bg-gray-50/10 transition-colors">
                                        <td className="px-8 py-7">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-3xl bg-white p-1 border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center text-primary-500 group-hover:scale-110 transition-all duration-500">
                                                    <div className="w-full h-full bg-primary-50 rounded-[inherit] flex items-center justify-center">
                                                        <i className="fa-solid fa-user-tie text-lg"></i>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-normal text-gray-900">{user.full_name || user.email || 'Consultor JL'}</p>
                                                    <p className="text-[9px] text-gray-400 font-light truncate max-w-[150px] uppercase tracking-wider">{user.role || 'Membro Equipe JL+'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-gray-400 italic mb-1">Setor Atual:</span>
                                                {userDept ? (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-600 text-white text-[9px] rounded-full font-normal shadow-sm shadow-primary-200">
                                                        <i className="fa-solid fa-check-double text-[8px]"></i>
                                                        {userDept.name}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300 text-[9px] font-light italic">Pendente de Atribuição</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-7" colSpan={2}>
                                            <div className="flex items-center justify-end gap-3">
                                                <div className="relative">
                                                    <select 
                                                        id={`select-${user.id}`}
                                                        className="bg-white border border-gray-100 rounded-2xl pl-5 pr-10 py-3 text-[10px] font-normal text-gray-500 appearance-none focus:ring-4 focus:ring-primary-50/50 outline-none transition-all cursor-pointer shadow-sm hover:border-primary-100 min-w-[200px]"
                                                        defaultValue={user.department_id || ""}
                                                    >
                                                        <option value="">Selecione um Departamento...</option>
                                                        {departments.map(d => (
                                                            <option key={d.id} value={d.id}>{d.name}</option>
                                                        ))}
                                                    </select>
                                                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[8px] text-gray-300 pointer-events-none"></i>
                                                </div>
                                                
                                                <button 
                                                    onClick={() => {
                                                        const sel = document.getElementById(`select-${user.id}`) as HTMLSelectElement;
                                                        if (sel.value) handleUpdateDept(user.id, sel.value);
                                                    }}
                                                    className="bg-primary-500 hover:bg-primary-600 active:scale-95 text-white px-6 py-3 rounded-2xl text-[10px] font-normal tracking-wide transition-all shadow-lg shadow-primary-200 flex items-center gap-2"
                                                >
                                                    <i className="fa-solid fa-link-slash text-[9px]"></i>
                                                    Vincular Agora
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>

                    </table>
                </div>
            </section>
        </div>
    );
};

export default OfficePage;
