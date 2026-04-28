import React, { useState, useEffect } from "react";
import { useTags } from "../../common/hooks/useTags";
import { zapiService, ZapiStatus } from "../../common/services/zapi.service";

const SettingsPage: React.FC = () => {
    const { tags, addTag, deleteTag } = useTags();
    const [newTag, setNewTag] = useState({ name: "", color: "#25D366" });
    
    // Estados da Z-API
    const [zapiStatus, setZapiStatus] = useState<ZapiStatus | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loadingZapi, setLoadingZapi] = useState(false);

    const colors = ["#25D366", "#34B7F1", "#F1C40F", "#E67E22", "#E74C3C", "#9B59B6", "#1ABC9C", "#2C3E50"];

    const handleAddTag = async () => {
        if (!newTag.name) return;
        await addTag(newTag.name, newTag.color);
        setNewTag({ name: "", color: "#25D366" });
    };

    // Busca status da Z-API
    const checkZapiStatus = async () => {
        if (!process.env.REACT_APP_ZAPI_INSTANCE || !process.env.REACT_APP_ZAPI_TOKEN) return;
        
        setLoadingZapi(true);
        try {
            console.log("Checando status da Z-API...");
            const status = await zapiService.getStatus();
            setZapiStatus(status);
            
            // Se não estiver conectado, busca o QR Code
            if (status.connected === false) {
                console.log("Buscando QR Code...");
                const qr = await zapiService.getQRCode();
                if (qr && qr.value) {
                    setQrCode(qr.value);
                }
            } else {
                setQrCode(null);
            }
        } catch (error: any) {
            console.error("Erro detalhado Z-API:", error?.response?.data || error.message);
        } finally {
            setLoadingZapi(false);
        }
    };

    useEffect(() => {
        checkZapiStatus();
        const interval = setInterval(checkZapiStatus, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex-1 bg-gray-50/30 p-10 overflow-y-auto custom-scrollbar font-sans font-light">
            <header className="mb-12">
                <h2 className="text-3xl font-light text-gray-900 tracking-tight mb-2">Configurações</h2>
                <p className="text-gray-400 text-sm italic">Personalize seu ambiente de atendimento Platinum</p>
            </header>

            <div className="max-w-4xl space-y-8">
                
                {/* CONFIGURAÇÃO Z-API (WhatsApp) */}
                <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm animate-in fade-in duration-700">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-xl font-light text-gray-900 flex items-center gap-3">
                                <i className="fa-brands fa-whatsapp text-green-500"></i>
                                Conexão WhatsApp (Z-API)
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">Gerencie a conexão do seu número mestre</p>
                        </div>
                        <button 
                            onClick={checkZapiStatus}
                            disabled={loadingZapi}
                            className="bg-gray-50 hover:bg-gray-100 p-3 rounded-xl text-gray-400 transition-all hover:text-primary-500"
                        >
                            <i className={`fa-solid fa-arrows-rotate ${loadingZapi ? 'animate-spin' : ''}`}></i>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Status da Conexão */}
                        <div className="space-y-6">
                            <div className={`p-8 rounded-3xl border ${zapiStatus?.connected ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'} transition-all`}>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-3 h-3 rounded-full animate-pulse ${zapiStatus?.connected ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className={`text-sm font-normal ${zapiStatus?.connected ? 'text-green-700' : 'text-red-700'}`}>
                                        {zapiStatus?.connected ? 'Instância Conectada' : 'Aguardando Conexão'}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 font-normal">Instância ID: <span className="font-mono text-gray-700 uppercase">{process.env.REACT_APP_ZAPI_INSTANCE || 'Não configurada'}</span></p>
                                    {zapiStatus && (
                                        <>
                                            <p className="text-xs text-gray-500 font-normal">Número: <span className="text-gray-700">{zapiStatus.phone || 'N/A'}</span></p>
                                            <p className="text-xs text-gray-500 font-normal">Bateria: <span className="text-gray-700">{zapiStatus.battery || '0'}%</span></p>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            {!zapiStatus?.connected && (
                                <p className="text-xs text-gray-400 italic px-2">
                                    Escaneie o QR Code ao lado com seu WhatsApp para ativar o sistema.
                                </p>
                            )}
                        </div>

                        {/* QR Code */}
                        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200 min-h-[250px] relative overflow-hidden">
                            {loadingZapi && !qrCode && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                                    <i className="fa-solid fa-circle-notch animate-spin text-primary-500 text-2xl"></i>
                                </div>
                            )}

                            {zapiStatus?.connected ? (
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
                                        <i className="fa-solid fa-link text-3xl"></i>
                                    </div>
                                    <p className="text-sm text-gray-500 font-light">Sua conexão está ativa e estável.</p>
                                </div>
                            ) : qrCode ? (
                                <div className="space-y-4 text-center">
                                    <img src={qrCode} alt="Z-API QR Code" className="w-48 h-48 rounded-xl shadow-lg border-4 border-white mx-auto shadow-primary-200" />
                                    <p className="text-[10px] uppercase text-gray-400 tracking-widest font-normal">Atualiza automaticamente</p>
                                </div>
                            ) : (
                                <div className="text-center space-y-3">
                                    <i className="fa-solid fa-qrcode text-4xl text-gray-200"></i>
                                    <p className="text-xs text-gray-400 italic">Configure as chaves no arquivo .env</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Perfil (Simplificado) */}
                    <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm col-span-1">
                        <h3 className="text-xl font-light text-gray-900 mb-8">Informações da Conta</h3>
                        <div className="flex gap-4 items-center p-6 bg-gray-50 rounded-3xl">
                            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
                                <i className="fa-solid fa-shield-halved text-2xl"></i>
                            </div>
                            <div>
                                <p className="text-sm font-normal text-gray-900">Nível de Acesso</p>
                                <p className="text-xs text-gray-500">Administrador Platinum</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Etiquetas */}
                <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-light text-gray-900">Gerenciamento de Etiquetas</h3>
                            <p className="text-xs text-gray-400 mt-1">Crie etiquetas para organizar suas conversas</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Nova Etiqueta */}
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 block font-normal px-1">Nome da Etiqueta</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Novo Cliente, Pendente..."
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-light focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-100 transition-all"
                                    value={newTag.name}
                                    onChange={e => setNewTag({...newTag, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-4 block font-normal px-1">Cor</label>
                                <div className="flex flex-wrap gap-3">
                                    {colors.map(c => (
                                        <button 
                                            key={c}
                                            onClick={() => setNewTag({...newTag, color: c})}
                                            className={`w-8 h-8 rounded-full transition-all ${newTag.color === c ? 'scale-125 ring-4 ring-gray-100' : 'opacity-60 hover:opacity-100'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <button 
                                onClick={handleAddTag}
                                className="w-full py-4 bg-primary-500 text-white rounded-2xl text-sm font-normal hover:bg-primary-600 shadow-lg shadow-primary-100 transition-all"
                            >
                                Adicionar Etiqueta
                            </button>
                        </div>

                        {/* Lista de Etiquetas */}
                        <div className="bg-gray-50/50 rounded-3xl p-6 space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                            {tags.length > 0 ? tags.map(tag => (
                                <div key={tag.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                                        <span className="text-sm font-light text-gray-700">{tag.name}</span>
                                    </div>
                                    <button 
                                        onClick={() => deleteTag(tag.id)}
                                        className="text-gray-200 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <i className="fa-solid fa-trash-can text-xs"></i>
                                    </button>
                                </div>
                            )) : (
                                <p className="text-center text-gray-400 text-[11px] py-10 italic">Nenhuma etiqueta criada</p>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SettingsPage;
