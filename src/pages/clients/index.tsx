import React, { useState } from "react";
import { useClients, Client, Responsible } from "common/hooks/useClients";

const ClientsPage: React.FC = () => {
    const { clients, addClient, updateClient, deleteClient } = useClients();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        whatsapp: "",
        responsibles: [{ id: Date.now().toString(), name: "" }] as Responsible[]
    });

    const handleOpenModal = (client?: Client) => {
        if (client) {
            setEditingClient(client);
            setFormData({
                name: client.name,
                whatsapp: client.whatsapp,
                responsibles: client.responsibles.length > 0 ? [...client.responsibles] : [{ id: Date.now().toString(), name: "" }]
            });
        } else {
            setEditingClient(null);
            setFormData({ name: "", whatsapp: "", responsibles: [{ id: Date.now().toString(), name: "" }] });
        }
        setIsModalOpen(true);
    };

    const handleAddResponsible = () => {
        setFormData({
            ...formData,
            responsibles: [...formData.responsibles, { id: Date.now().toString(), name: "" }]
        });
    };

    const handleRemoveResponsible = (id: string) => {
        setFormData({
            ...formData,
            responsibles: formData.responsibles.filter(r => r.id !== id)
        });
    };

    const handleResponsibleChange = (id: string, name: string) => {
        setFormData({
            ...formData,
            responsibles: formData.responsibles.map(r => r.id === id ? { ...r, name } : r)
        });
    };

    const handleSave = async () => {
        const filteredResponsibles = formData.responsibles.filter(r => r.name.trim() !== "");
        
        if (!formData.name || !formData.whatsapp) {
            alert("Nome da Empresa e WhatsApp são obrigatórios");
            return;
        }

        const dataToSave = { ...formData, responsibles: filteredResponsibles };

        try {
            if (editingClient) {
                await updateClient(editingClient.id, dataToSave);
                alert("Cliente atualizado com sucesso!");
            } else {
                await addClient(dataToSave);
                alert("Cliente cadastrado com sucesso!");
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar: Verifique sua conexão ou permissões no Supabase.");
        }
    };


    return (
        <div className="flex-1 bg-gray-50/30 p-10 overflow-y-auto font-sans font-light">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-light text-gray-900 tracking-tight mb-2">Clientes</h2>
                    <p className="text-gray-600 font-normal text-sm italic">Gestão completa de contas e responsáveis Platinum</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-primary-500 hover:bg-primary-600 text-white font-normal px-8 py-3 rounded-2xl transition-all shadow-lg shadow-primary-200 flex items-center gap-3"
                >
                    <i className="fa-solid fa-plus text-xs"></i>
                    Novo Cliente
                </button>
            </header>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-gray-50">
                            <th className="px-8 py-6 text-left text-[10px] font-normal text-gray-700 uppercase tracking-widest">Empresa</th>
                            <th className="px-8 py-6 text-left text-[10px] font-normal text-gray-700 uppercase tracking-widest">WhatsApp Principal</th>
                            <th className="px-8 py-6 text-left text-[10px] font-normal text-gray-700 uppercase tracking-widest">Responsáveis Vinculados</th>
                            <th className="px-8 py-6 text-right text-[10px] font-normal text-gray-700 uppercase tracking-widest">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {clients.map((client) => (
                            <tr key={client.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <p className="text-sm font-normal text-gray-900">{client.name}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-green-600">
                                        <i className="fa-brands fa-whatsapp text-sm"></i>
                                        <p className="text-sm font-normal">{client.whatsapp}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-wrap gap-2">
                                        {client.responsibles.map(r => (
                                            <span key={r.id} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded-md font-normal">
                                                {r.name}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                        <button 
                                            onClick={() => handleOpenModal(client)}
                                            className="w-10 h-10 bg-gray-50 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all"
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button 
                                            onClick={() => deleteClient(client.id)}
                                            className="w-10 h-10 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Cliente */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/40 backdrop-blur-md">
                    <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 relative z-10 shadow-2xl border border-gray-50 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <h3 className="text-2xl font-light text-gray-900 mb-8 tracking-tight">
                            {editingClient ? 'Editar Cliente e Responsáveis' : 'Cadastrar Cliente'}
                        </h3>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 block font-normal px-1">Nome da Empresa</label>
                                <input 
                                    type="text" 
                                    placeholder="Razão social"
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-normal focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all text-gray-900"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 block font-normal px-1">WhatsApp Principal</label>
                                <div className="relative">
                                    <i className="fa-brands fa-whatsapp absolute left-6 top-1/2 -translate-y-1/2 text-green-500"></i>
                                    <input 
                                        type="text" 
                                        placeholder="+55 (11) 00000-0000"
                                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-normal focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all text-gray-900"
                                        value={formData.whatsapp}
                                        onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-100 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-[10px] text-gray-400 uppercase tracking-widest block font-normal px-1">Responsáveis da Empresa</label>
                                    <button 
                                        onClick={handleAddResponsible}
                                        className="text-primary-500 text-[10px] font-normal uppercase tracking-widest hover:text-primary-600 flex items-center gap-2"
                                    >
                                        <i className="fa-solid fa-circle-plus"></i>
                                        Adicionar outro
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.responsibles.map((res, index) => (
                                        <div key={res.id} className="flex gap-2">
                                            <div className="relative flex-1">
                                                <i className="fa-solid fa-user absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
                                                <input 
                                                    type="text" 
                                                    placeholder={`Nome do responsável ${index + 1}`}
                                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-normal focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all text-gray-900"
                                                    value={res.name}
                                                    onChange={e => handleResponsibleChange(res.id, e.target.value)}
                                                />
                                            </div>
                                            {formData.responsibles.length > 1 && (
                                                <button 
                                                    onClick={() => handleRemoveResponsible(res.id)}
                                                    className="w-14 h-14 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all flex items-center justify-center shrink-0"
                                                >
                                                    <i className="fa-solid fa-trash-can text-sm"></i>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-6">
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-4 bg-gray-50 text-gray-700 rounded-2xl text-sm font-normal hover:bg-gray-100 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="px-8 py-4 bg-primary-500 text-white rounded-2xl text-sm font-normal hover:bg-primary-600 shadow-lg shadow-primary-200 transition-all"
                                >
                                    {editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientsPage;
