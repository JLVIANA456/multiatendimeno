"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDepartments, Department } from "common/hooks/useDepartments";

const WorkspacesPage: React.FC = () => {
    const navigate = useNavigate();
    const { departments, addDepartment, updateDepartment, deleteDepartment } = useDepartments();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        desc: "",
        color: "from-blue-400 to-blue-600"
    });

    const colors = [
        { label: "Azul", value: "from-blue-400 to-blue-600" },
        { label: "Roxo", value: "from-purple-400 to-purple-600" },
        { label: "Verde", value: "from-emerald-400 to-emerald-600" },
        { label: "Laranja", value: "from-orange-400 to-orange-600" },
        { label: "Rosa", value: "from-pink-400 to-pink-600" },
    ];

    const handleSave = () => {
        if (!formData.name) return;
        
        if (editingDept) {
            updateDepartment(editingDept.id, {
                name: formData.name,
                desc: formData.desc,
                color: formData.color
            });
        } else {
            addDepartment({
                name: formData.name,
                desc: formData.desc,
                color: formData.color,
                category: "Departamento Interno",
                title: `Setor de ${formData.name} Platinum`,
                src: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2601&auto=format&fit=crop",
                members: Math.floor(Math.random() * 20) + 1
            });
        }
        closeModal();
    };

    const openEdit = (dept: Department) => {
        setEditingDept(dept);
        setFormData({ name: dept.name, desc: dept.desc || "", color: dept.color });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingDept(null);
        setFormData({ name: "", desc: "", color: "from-blue-400 to-blue-600" });
    };

    return (
        <div className="flex-1 bg-gray-50/30 p-10 overflow-y-auto font-sans font-light">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-light text-gray-900 tracking-tight mb-2">Departamentos</h2>
                    <p className="text-gray-400 font-light text-sm italic">Organize suas equipes e fluxos de trabalho por setor</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-500 hover:bg-primary-600 text-white font-normal px-8 py-3 rounded-2xl transition-all shadow-lg shadow-primary-100 flex items-center gap-3"
                >
                    <i className="fa-solid fa-plus text-xs"></i>
                    Novo Departamento
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {/* Create New Department (Dashed) */}
                <div 
                    onClick={() => setIsModalOpen(true)}
                    className="h-64 border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-primary-300 hover:bg-white transition-all duration-500 group"
                >
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                        <i className="fa-solid fa-plus text-2xl text-gray-300 group-hover:text-primary-500"></i>
                    </div>
                    <p className="text-gray-400 font-light text-sm">Adicionar Novo Setor</p>
                </div>

                {departments.map((dept) => (
                    <div 
                        key={dept.id}
                        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 hover:-translate-y-1 transition-all duration-500 group cursor-pointer relative overflow-hidden"
                    >
                        <div 
                           onClick={() => navigate("/dashboard")}
                           className="absolute inset-0 z-0"
                        />
                        
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${dept.color} opacity-[0.03] -mr-10 -mt-10 rounded-full transition-transform duration-700 group-hover:scale-150`} />
                        
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className={`w-14 h-14 bg-gradient-to-br ${dept.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-200`}>
                                <i className="fa-solid fa-folder-tree text-xl"></i>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); openEdit(dept); }}
                                    className="text-gray-200 hover:text-primary-400 transition-colors relative z-20"
                                >
                                    <i className="fa-solid fa-pen-to-square text-sm"></i>
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); deleteDepartment(dept.id); }}
                                    className="text-gray-200 hover:text-red-400 transition-colors relative z-20"
                                >
                                    <i className="fa-solid fa-trash-can text-sm"></i>
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-normal text-gray-800 mb-2 relative z-10">{dept.name}</h3>
                        <p className="text-gray-400 font-light text-xs leading-relaxed mb-8 relative z-10 line-clamp-2">
                            {dept.desc || "Sem descrição definida para este departamento."}
                        </p>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-50 relative z-10">
                            <span className="text-[10px] font-light text-gray-300 tracking-widest uppercase">
                                {dept.members} Membros {dept.messages > 0 && `• ${dept.messages} Atendimentos`}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-primary-500 hover:bg-primary-50 transition-colors">
                                <i className="fa-solid fa-arrow-right text-xs"></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal CRUD Departamento */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/5 opacity-50 backdrop-blur-sm" onClick={closeModal} />
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 relative z-10 shadow-2xl animate-in fade-in zoom-in duration-300 border border-gray-50">
                        <h3 className="text-2xl font-light text-gray-900 mb-8 tracking-tight">
                            {editingDept ? 'Editar Departamento' : 'Novo Departamento'}
                        </h3>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 block font-normal px-1">Nome do Setor</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Comercial, Suporte, TI..."
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-light focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-100 transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 block font-normal px-1">Descrição Breve</label>
                                <textarea 
                                    placeholder="O que este setor faz?"
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-light focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-100 transition-all h-32 resize-none"
                                    value={formData.desc}
                                    onChange={e => setFormData({...formData, desc: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-4 block font-normal px-1">Paleta de Cor Representativa</label>
                                <div className="flex gap-4">
                                    {colors.map((c) => (
                                        <button 
                                            key={c.value}
                                            onClick={() => setFormData({...formData, color: c.value})}
                                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.value} transition-all ${formData.color === c.value ? 'scale-125 ring-4 ring-primary-50' : 'opacity-40 hover:opacity-100'}`}
                                            title={c.label}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-6">
                                <button 
                                    onClick={closeModal}
                                    className="px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl text-sm font-light hover:bg-gray-100 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="px-8 py-4 bg-primary-500 text-white rounded-2xl text-sm font-normal hover:bg-primary-600 shadow-lg shadow-primary-100 transition-all"
                                >
                                    {editingDept ? 'Salvar Alterações' : 'Criar Departamento'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspacesPage;
