import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClients } from "common/hooks/useClients";
import { useChatContext } from "pages/chat/context/chat";

const ContactsPage: React.FC = () => {
    const navigate = useNavigate();
    const { clients } = useClients();
    const { inbox, startOutboundChat } = useChatContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [isRespModalOpen, setIsRespModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [noConvToast, setNoConvToast] = useState<string | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.whatsapp.includes(searchTerm) ||
        c.responsibles.some(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    /**
     * Encontra uma conversa pelo número de telefone (apenas para exibição dos badges).
     */
    const findChatByPhone = (phone: string) => {
        if (!phone) return null;
        const digits = phone.replace(/\D/g, "");
        return inbox.find(chat => {
            const idDigits = chat.id.replace(/\D/g, "");
            const last11 = digits.slice(-11);
            const last8  = digits.slice(-8);
            return idDigits.includes(last11) || (last8.length >= 8 && idDigits.includes(last8));
        }) || null;
    };

    /** Inicia a conversa (encontra ou cria) */
    const handleSelectChat = async (nome: string, whatsappResponsavel?: string, whatsappCliente?: string) => {
        const numero = whatsappResponsavel || whatsappCliente;
        if (!numero) {
            showToast("Número de WhatsApp não encontrado para este contato");
            return;
        }

        setLoading(numero);
        try {
            const chatId = await startOutboundChat(numero, nome);
            if (chatId) {
                navigate(`/chat/${chatId}`);
            } else {
                showToast("Erro ao iniciar conversa no banco de dados");
            }
        } catch (error) {
            console.error(error);
            showToast("Erro de conexão ao iniciar chat");
        } finally {
            setLoading(null);
        }
    };

    const showToast = (msg: string) => {
        setNoConvToast(msg);
        setTimeout(() => setNoConvToast(null), 4000);
    };

    const handleContactClick = (client: any) => {
        if (client.responsibles && client.responsibles.length > 1) {
            setSelectedClient(client);
            setIsRespModalOpen(true);
        } else {
            const singleResp = client.responsibles?.[0];
            handleSelectChat(singleResp?.name || client.name, singleResp?.whatsapp, client.whatsapp);
        }
    };

    return (
        <div className="flex-1 bg-gray-50/30 p-10 overflow-y-auto custom-scrollbar relative">

            {/* Toast de aviso */}
            {noConvToast && (
                <div className="fixed top-6 right-6 z-[200] bg-gray-900 text-white text-sm font-light px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
                    <i className="fa-solid fa-circle-info text-primary-400"></i>
                    {noConvToast}
                    <button onClick={() => setNoConvToast(null)} className="ml-2 text-gray-400 hover:text-white">
                        <i className="fa-solid fa-xmark text-xs"></i>
                    </button>
                </div>
            )}

            <header className="mb-12">
                <h2 className="text-3xl font-light text-gray-900 tracking-tight mb-2">Contatos</h2>
                <p className="text-gray-400 font-light text-sm italic">Busque clientes cadastrados para iniciar uma nova conversa</p>
            </header>

            <div className="max-w-3xl mx-auto space-y-8">
                <div className="relative group">
                    <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-400 transition-colors"></i>
                    <input
                        type="text"
                        placeholder="Pesquisar por cliente, WhatsApp ou responsável..."
                        className="w-full pl-16 pr-6 py-5 bg-white border border-gray-100 rounded-3xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-200 transition-all font-light text-gray-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredClients.length > 0 ? filteredClients.map((client) => {
                        const hasChat = !!findChatByPhone(client.responsibles?.[0]?.whatsapp || "") ||
                                        !!findChatByPhone(client.whatsapp);
                        const isThisLoading = loading === client.whatsapp;

                        return (
                            <div
                                key={client.id}
                                className="bg-white p-5 rounded-[2rem] border border-gray-100 flex items-center justify-between hover:border-primary-100 hover:shadow-md hover:shadow-primary-100/10 transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-primary-50 p-0.5 border border-primary-100 shadow-sm overflow-hidden flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all">
                                        <i className="fa-solid fa-building text-xl"></i>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-normal text-gray-800 group-hover:text-primary-600 transition-colors">{client.name}</h3>
                                            {hasChat && (
                                                <span className="px-2 py-0.5 bg-green-50 text-green-500 text-[10px] rounded-lg font-normal flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>
                                                    Ativo
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs font-light text-gray-400 tracking-wide flex items-center gap-2">
                                            <i className="fa-brands fa-whatsapp text-green-500"></i>
                                            {client.whatsapp}
                                            <span className="mx-1">•</span>
                                            <span className="text-gray-300 italic truncate max-w-[200px]">
                                                {client.responsibles.map(r => r.name).join(", ")}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleContactClick(client); }}
                                    disabled={loading !== null}
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm cursor-pointer ${
                                        isThisLoading
                                            ? "bg-gray-100 text-primary-500"
                                            : "bg-primary-500 text-white hover:bg-primary-600"
                                    }`}
                                >
                                    {isThisLoading ? (
                                        <i className="fa-solid fa-circle-notch animate-spin text-sm"></i>
                                    ) : (
                                        <i className="fa-solid fa-message text-sm"></i>
                                    )}
                                </button>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-100">
                             <p className="text-gray-400 font-light italic">Nenhum cliente encontrado</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Seleção de Responsável */}
            {isRespModalOpen && selectedClient && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-white/40 backdrop-blur-md">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 relative z-10 shadow-2xl border border-gray-50 animate-in fade-in zoom-in duration-300">
                        <h3 className="text-xl font-light text-gray-900 mb-2 tracking-tight">Falar com quem?</h3>
                        <p className="text-gray-400 text-[11px] font-light mb-8 italic">A empresa {selectedClient.name} possui vários contatos</p>

                        <div className="space-y-2">
                            {selectedClient.responsibles.map((res: any) => (
                                <button
                                    key={res.id}
                                    type="button"
                                    onClick={() => {
                                        setIsRespModalOpen(false);
                                        handleSelectChat(res.name, res.whatsapp, selectedClient.whatsapp);
                                    }}
                                    className="w-full text-left px-5 py-4 rounded-2xl border border-gray-50 hover:border-primary-100 hover:bg-primary-50 transition-all flex items-center justify-between group"
                                >
                                    <div>
                                        <span className="text-sm text-gray-700 font-normal group-hover:text-primary-700 block">{res.name}</span>
                                        {res.whatsapp && (
                                            <span className="text-[10px] text-gray-400 font-light flex items-center gap-1 mt-0.5">
                                                <i className="fa-brands fa-whatsapp text-green-400"></i>
                                                {res.whatsapp}
                                            </span>
                                        )}
                                    </div>
                                    <i className="fa-solid fa-chevron-right text-[10px] text-gray-200 group-hover:text-primary-400"></i>
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsRespModalOpen(false)}
                            className="w-full mt-6 py-4 text-gray-400 text-xs font-light hover:underline"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactsPage;
