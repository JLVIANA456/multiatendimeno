"use client";

import React, { useState, useEffect } from "react";
import ChatLayout from "../layouts";
import Header from "./components/header";
import Footer from "./components/footer";
import Sidebar from "./components/sidebar";
import Icon from "common/components/icons";
import useChatRoom from "./hooks/useChatRoom";
import ProfileSection from "./components/profile";
import MessagesList from "./components/messages-list";
import SearchSection from "./components/search-section";
import useNavigateToChat from "./hooks/useNavigateToChat";
import { useChatContext } from "pages/chat/context/chat";
import { useDepartments } from "common/hooks/useDepartments";
import { supabase } from "lib/supabase";


import { Container, Body, Background, FooterContainer, ScrollButton } from "./styles";

export default function ChatRoomPage() {
  const {
    activeInbox,
    handleMenuOpen,
    handleShowIcon,
    isProfileOpen,
    isSearchOpen,
    isShowIcon,
    setIsProfileOpen,
    setIsSearchOpen,
    setShouldScrollToBottom,
    shouldScrollToBottom,
  } = useChatRoom();
  
  const chatCtx = useChatContext();
  const { departments } = useDepartments();

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState({ type: 'Setor', id: '' });

  useNavigateToChat(activeInbox);

  useEffect(() => {
    (window as any).openTransferModal = () => setIsTransferModalOpen(true);
    return () => { delete (window as any).openTransferModal; };
  }, []);

  const [realUsers, setRealUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchRealUsers = async () => {
        const { data } = await supabase.from('profiles').select('*');
        if (data) setRealUsers(data);
    };
    fetchRealUsers();
  }, []);

  const handleTransfer = (targetName: string) => {
    const confirmed = window.confirm(`Deseja transferir esta conversa para ${targetName}?`);
    if (confirmed) {
        alert(`Conversa transferida com sucesso para ${targetName}`);
        setIsTransferModalOpen(false);
    }
  };


  return (
    <ChatLayout>
      <Container>
        <Body>
          <Background />
          <Header
            id={activeInbox?.id ?? ""}
            title={activeInbox?.name ?? ""}
            image={activeInbox?.image ?? ""}
            subTitle={activeInbox?.isOnline ? "Online" : ""}
            onSearchClick={() => handleMenuOpen("search")}
            onProfileClick={() => handleMenuOpen("profile")}
            onMessagesCleared={() => chatCtx.clearMessages(activeInbox?.id)}
            onConversationDeleted={() => chatCtx.deleteActiveChat()}
          />

          <div className="flex-1 overflow-hidden relative border-t border-gray-100">
             <div className="w-full h-full transition-all duration-700">
                <MessagesList
                    onShowBottomIcon={handleShowIcon}
                    shouldScrollToBottom={shouldScrollToBottom}
                />
             </div>
          </div>

          <FooterContainer>
            {isShowIcon && (
              <ScrollButton onClick={() => setShouldScrollToBottom(true)}>
                <Icon id="downArrow" />
              </ScrollButton>
            )}
            <Footer />
          </FooterContainer>

        </Body>
        <Sidebar title="Pesquisar" isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)}>
          <SearchSection />
        </Sidebar>
        <Sidebar
          title="Informações do Contato"
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        >
          <ProfileSection 
            name={activeInbox?.name ?? ""} 
            image={activeInbox?.image ?? ""} 
            phone={activeInbox?.phone ?? ""} 
          />
        </Sidebar>

        {/* Modal de Transferência */}
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-white/60 backdrop-blur-xl" onClick={() => setIsTransferModalOpen(false)} />
             <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 relative z-[120] shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-300">
                <h3 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">Transferir Conversa</h3>
                <p className="text-gray-400 text-xs font-light mb-8 italic">Selecione o destino para este atendimento</p>

                <div className="space-y-6">
                    <div>
                        <div className="flex bg-gray-50 p-1 rounded-2xl mb-6">
                            <button 
                                onClick={() => setTransferTarget({...transferTarget, type: 'Setor'})}
                                className={`flex-1 py-3 rounded-xl text-xs transition-all ${transferTarget.type === 'Setor' ? 'bg-white shadow-sm text-primary-600 font-normal' : 'text-gray-400'}`}
                            >
                                Por Setor
                            </button>
                            <button 
                                onClick={() => setTransferTarget({...transferTarget, type: 'Usuario'})}
                                className={`flex-1 py-3 rounded-xl text-xs transition-all ${transferTarget.type === 'Usuario' ? 'bg-white shadow-sm text-primary-600 font-normal' : 'text-gray-400'}`}
                            >
                                Por Usuário
                            </button>
                        </div>

                        <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {transferTarget.type === 'Setor' ? (
                                <div className="space-y-2">
                                    {departments.map(dept => (
                                        <button 
                                           key={dept.id}
                                           onClick={() => setTransferTarget({...transferTarget, id: dept.name})}
                                           className={`w-full text-left px-5 py-4 rounded-2xl border transition-all flex items-center justify-between group ${transferTarget.id === dept.name ? 'border-primary-500 bg-primary-50' : 'border-gray-50 hover:border-primary-200'}`}
                                        >
                                            <span className={`text-sm ${transferTarget.id === dept.name ? 'text-primary-700 font-normal' : 'text-gray-600 font-light'}`}>{dept.name}</span>
                                            <i className="fa-solid fa-chevron-right text-[10px] text-gray-200 group-hover:text-primary-400"></i>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {realUsers.map(user => {
                                        const displayName = user.full_name || user.email || "Consultor";
                                        return (
                                            <button 
                                               key={user.id}
                                               onClick={() => setTransferTarget({...transferTarget, id: displayName})}
                                               className={`w-full text-left px-5 py-4 rounded-2xl border transition-all flex items-center justify-between group ${transferTarget.id === displayName ? 'border-primary-500 bg-primary-50' : 'border-gray-50 hover:border-primary-200'}`}
                                            >
                                                <div>
                                                    <p className={`text-sm ${transferTarget.id === displayName ? 'text-primary-700 font-normal' : 'text-gray-600 font-light'}`}>{displayName}</p>
                                                    <p className="text-[9px] text-gray-400 font-light">{user.role || 'Consultor Equipe JL+'}</p>
                                                </div>
                                                <i className="fa-solid fa-chevron-right text-[10px] text-gray-200 group-hover:text-primary-400"></i>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                        <button 
                            onClick={() => setIsTransferModalOpen(false)}
                            className="px-6 py-4 bg-gray-50 text-gray-400 rounded-2xl text-sm font-light hover:bg-gray-100 transition-all"
                        >
                            Cancelar
                        </button>
                        <button 
                            disabled={!transferTarget.id}
                            onClick={() => handleTransfer(transferTarget.id)}
                            className={`px-6 py-4 rounded-2xl text-sm font-normal transition-all shadow-lg shadow-primary-100 ${transferTarget.id ? 'bg-primary-500 text-white hover:bg-primary-600' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                        >
                            Confirmar
                        </button>
                    </div>

                </div>
             </div>
          </div>
        )}
      </Container>
    </ChatLayout>
  );
}
