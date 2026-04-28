"use client";

import React, { useState } from "react";
import { useWhatsAppConfig, WhatsAppConfig } from "../../common/hooks/useWhatsAppConfig";
import { zapiService } from "../../common/services/zapi.service";

const ChannelsPage: React.FC = () => {
    const { configs, addConfig, deleteConfig, toggleActive, loading: globalLoading } = useWhatsAppConfig();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusLoading, setStatusLoading] = useState<string | null>(null);
    const [channelStatuses, setChannelStatuses] = useState<Record<string, any>>({});
    const [formData, setFormData] = useState<Omit<WhatsAppConfig, 'id' | 'is_active' | 'created_at'>>({
        name: "",
        instance_id: "",
        instance_token: "",
        client_token: ""
    });

    const handleCheckStatus = async (conf: WhatsAppConfig) => {
        setStatusLoading(conf.id);
        try {
            const status = await zapiService.getStatus({ 
                instance: conf.instance_id, 
                token: conf.instance_token, 
                clientToken: conf.client_token 
            });
            setChannelStatuses(prev => ({ ...prev, [conf.id]: status }));
        } catch (error) {
            console.error("Erro ao checar status:", error);
            alert("Erro ao conectar à Z-API. Verifique as chaves.");
        } finally {
            setStatusLoading(null);
        }
    };

    const handleAdd = async () => {
        if (!formData.name || !formData.instance_id || !formData.instance_token) {
            alert("Preencha os campos obrigatórios.");
            return;
        }
        try {
            await addConfig(formData);
            setIsModalOpen(false);
            setFormData({ name: "", instance_id: "", instance_token: "", client_token: "" });
        } catch (err) {
            alert("Erro ao adicionar instância.");
        }
    };

    return (
        <div className="flex-1 bg-gray-50/30 p-10 overflow-y-auto font-sans font-light">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-light text-gray-900 tracking-tight mb-2">Instâncias WhatsApp</h2>
                    <p className="text-gray-400 font-light text-sm italic">Gerencie múltiplos números e instâncias Z-API</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-500 hover:bg-primary-600 text-white font-normal px-8 py-3 rounded-2xl transition-all shadow-lg shadow-primary-100 flex items-center gap-3"
                >
                    <i className="fa-solid fa-plus text-xs"></i>
                    Nova Instância
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {configs.map((conf) => (
                    <div 
                        key={conf.id}
                        className={`bg-white p-8 rounded-[2.5rem] border ${conf.is_active ? 'border-primary-200 ring-2 ring-primary-50' : 'border-gray-100'} shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500 group relative overflow-hidden`}
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border ${conf.is_active ? 'bg-primary-50 text-primary-500' : 'bg-gray-50 text-gray-300'}`}>
                                <i className="fa-brands fa-whatsapp"></i>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => toggleActive(conf.id)}
                                    className={`px-3 py-1 rounded-full text-[9px] font-normal tracking-widest uppercase transition-all ${conf.is_active ? 'bg-primary-500 text-white shadow-lg shadow-primary-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                >
                                    {conf.is_active ? 'Ativa (Produção)' : 'Ativar'}
                                </button>
                                <button 
                                    onClick={() => deleteConfig(conf.id)}
                                    className="text-gray-200 hover:text-red-400 transition-colors"
                                >
                                    <i className="fa-solid fa-trash-can text-sm"></i>
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-normal text-gray-800 mb-1">{conf.name}</h3>
                        <p className="text-gray-400 font-light text-xs mb-8">ID: {conf.instance_id.slice(0, 8)}...</p>
                        
                        <div className="space-y-3">
                             {channelStatuses[conf.id] ? (
                                <div className="flex gap-4 p-4 bg-primary-50/30 rounded-3xl border border-primary-50 animate-in fade-in duration-300">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] text-primary-400 uppercase tracking-tighter">Bateria</span>
                                        <span className="text-xs text-primary-700 font-normal">{channelStatuses[conf.id].battery}%</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] text-primary-400 uppercase tracking-tighter">Status</span>
                                        <span className="text-xs text-primary-700 font-normal">{channelStatuses[conf.id].connected ? 'Conectado' : 'Desconectado'}</span>
                                    </div>
                                </div>
                             ) : (
                                <div className="p-4 bg-gray-50/50 rounded-3xl border border-dashed border-gray-100 flex items-center justify-center">
                                     <p className="text-[10px] text-gray-400 uppercase italic">Aguardando Verificação</p>
                                </div>
                             )}
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-8">
                            <span className="text-[10px] text-gray-300 uppercase tracking-widest">
                                {channelStatuses[conf.id] ? (channelStatuses[conf.id].phone || 'N/A') : 'Clique para validar'}
                            </span>
                            <button 
                                onClick={() => handleCheckStatus(conf)}
                                disabled={statusLoading === conf.id}
                                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 hover:bg-primary-500 hover:text-white transition-all shadow-sm"
                            >
                                <i className={`fa-solid fa-arrows-rotate text-xs ${statusLoading === conf.id ? 'animate-spin' : ''}`}></i>
                            </button>
                        </div>
                    </div>
                ))}

                {/* Card de Adicionar (Apenas ícone se for menor) */}
                {configs.length === 0 && !globalLoading && (
                    <div 
                        onClick={() => setIsModalOpen(true)}
                        className="h-full min-h-[300px] border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-primary-300 hover:bg-white transition-all duration-500 group"
                    >
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                            <i className="fa-solid fa-plus text-2xl text-gray-300 group-hover:text-primary-500"></i>
                        </div>
                        <p className="text-gray-400 font-light text-sm">Nenhuma instância cadastrada</p>
                    </div>
                )}
            </div>

            {/* Modal Nova Instância */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 relative z-10 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-300">
                        <h3 className="text-2xl font-light text-gray-900 mb-8 tracking-tight">Configurar Instância</h3>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 block px-1">Nome Identificador</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Celular de Teste"
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-light focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all border-none"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 block px-1">ID da Instância (Z-API)</label>
                                <input 
                                    type="text" 
                                    placeholder="3F1A..."
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-light focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all border-none"
                                    value={formData.instance_id}
                                    onChange={e => setFormData({...formData, instance_id: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 block px-1">Token</label>
                                <input 
                                    type="text" 
                                    placeholder="C99B..."
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-light focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all border-none"
                                    value={formData.instance_token}
                                    onChange={e => setFormData({...formData, instance_token: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 block px-1">Client Token (Opcional)</label>
                                <input 
                                    type="text" 
                                    placeholder="F717..."
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-light focus:outline-none focus:ring-4 focus:ring-primary-50 transition-all border-none"
                                    value={formData.client_token}
                                    onChange={e => setFormData({...formData, client_token: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-6">
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl text-sm font-light hover:bg-gray-100 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleAdd}
                                    className="px-8 py-4 bg-primary-500 text-white rounded-2xl text-sm font-normal hover:bg-primary-600 shadow-lg shadow-primary-100 transition-all"
                                >
                                    Salvar Configuração
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChannelsPage;
