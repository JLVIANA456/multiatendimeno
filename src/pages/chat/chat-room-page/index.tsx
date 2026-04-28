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

  const { departments } = useDepartments();
  const { isTransferModalOpen, setIsTransferModalOpen, ...chatCtx } = useChatContext();

  const [transferTarget, setTransferTarget] = useState({ type: 'Setor', id: '' });

  useNavigateToChat(activeInbox);

  const [realUsers, setRealUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchRealUsers = async () => {
      const { data } = await supabase.from('profiles').select('*');
      if (data) setRealUsers(data);
    };
    fetchRealUsers();
  }, []);

  const getDeptStyles = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('fiscal')) return { color: '#ef4444', icon: 'fa-file-invoice-dollar' };
    if (n.includes('contabil') || n.includes('contábil')) return { color: '#3b82f6', icon: 'fa-calculator' };
    if (n.includes('pessoal')) return { color: '#10b981', icon: 'fa-users-gear' };
    if (n.includes('bpo')) return { color: '#0f172a', icon: 'fa-briefcase' };
    if (n.includes('financeiro')) return { color: '#f59e0b', icon: 'fa-coins' };
    if (n.includes('qualidade')) return { color: '#334155', icon: 'fa-medal' };
    return { color: '#6366f1', icon: 'fa-building-user' };
  };

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

          <div className="flex-1 relative border-t border-gray-100 flex flex-col min-h-0">
            <MessagesList
              onShowBottomIcon={handleShowIcon}
              shouldScrollToBottom={shouldScrollToBottom}
            />
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
        </Sidebar>        {/* Modal de Transferência */}
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setIsTransferModalOpen(false)} />
            <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[3.5rem] flex flex-col relative z-[210] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/20 animate-in fade-in zoom-in duration-500 overflow-hidden">

              {/* Header do Modal */}
              <div className="px-12 py-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.8rem] bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-200">
                    <i className="fa-solid fa-share-nodes text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-4xl font-light text-gray-900 tracking-tight uppercase leading-none mb-2">Transferir Conversa</h3>
                    <p className="text-sm text-primary-600 font-bold uppercase tracking-[0.3em] opacity-70">Painel de Transferência de Conversas</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsTransferModalOpen(false)}
                  className="w-12 h-12 rounded-full bg-white border border-gray-100 text-gray-400 flex items-center justify-center hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-90"
                >
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Lado Esquerdo: Filtros e Categorias */}
                <div className="w-80 border-r border-gray-50 p-8 bg-gray-50/30 flex flex-col gap-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Filtrar por</p>
                  <button
                    onClick={() => setTransferTarget({ ...transferTarget, type: 'Setor' })}
                    className={`w-full p-5 rounded-[1.5rem] flex items-center gap-4 transition-all ${transferTarget.type === 'Setor' ? 'bg-white shadow-xl text-primary-600 ring-1 ring-primary-100' : 'text-gray-400 hover:bg-white/50 hover:text-gray-600'}`}
                  >
                    <i className="fa-solid fa-layer-group text-xl"></i>
                    <span className="font-light text-sm uppercase tracking-wider">Departamentos</span>
                  </button>
                  <button
                    onClick={() => setTransferTarget({ ...transferTarget, type: 'Usuario' })}
                    className={`w-full p-5 rounded-[1.5rem] flex items-center gap-4 transition-all ${transferTarget.type === 'Usuario' ? 'bg-white shadow-xl text-primary-600 ring-1 ring-primary-100' : 'text-gray-400 hover:bg-white/50 hover:text-gray-600'}`}
                  >
                    <i className="fa-solid fa-user-tie text-xl"></i>
                    <span className="font-light text-sm uppercase tracking-wider">Colaboradores</span>
                  </button>
                </div>

                {/* Centro: Lista de Opções */}
                <div className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-white">
                  <div className="mb-8 flex justify-between items-end">
                    <h4 className="text-xl font-light text-gray-900 uppercase tracking-tight">
                      {transferTarget.type === 'Setor' ? 'Lista de Departamentos' : 'Equipe Disponível'}
                    </h4>
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                      {transferTarget.type === 'Setor' ? `${departments.length} Setores` : `${realUsers.length} Membros`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {transferTarget.type === 'Setor' ? (
                      departments.map(dept => {
                        const style = getDeptStyles(dept.name);
                        const isActive = transferTarget.id === dept.name;

                        return (
                          <button
                            key={dept.id}
                            onClick={() => setTransferTarget({ ...transferTarget, id: dept.name })}
                            className={`group text-left p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between ${isActive ? 'border-primary-500 bg-primary-50/50 shadow-2xl shadow-primary-100/50 translate-x-1' : 'border-gray-50 hover:border-primary-100 hover:bg-gray-50/50'}`}
                          >
                            <div className="flex items-center gap-5">
                              <div
                                style={{ backgroundColor: style.color }}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl text-white shadow-lg transition-all ${isActive ? 'scale-110 rotate-3' : 'opacity-40 group-hover:opacity-100'}`}
                              >
                                <i className={`fa-solid ${style.icon}`}></i>
                              </div>
                              <div>
                                <span className={`block text-lg tracking-tight ${isActive ? 'text-primary-900 font-bold' : 'text-gray-700 font-light'}`}>{dept.name}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Disponibilidade Imediata</span>
                              </div>
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-primary-500 text-white' : 'bg-gray-50 text-gray-200 group-hover:text-primary-300'} transition-all`}>
                              <i className={`fa-solid ${isActive ? 'fa-check' : 'fa-chevron-right'} text-[10px]`}></i>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      realUsers.map(user => {
                        const displayName = user.full_name || user.email || "Consultor";
                        const isActive = transferTarget.id === displayName;

                        return (
                          <button
                            key={user.id}
                            onClick={() => setTransferTarget({ ...transferTarget, id: displayName })}
                            className={`group text-left p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between ${isActive ? 'border-primary-500 bg-primary-50/50 shadow-2xl shadow-primary-100/50 translate-x-1' : 'border-gray-50 hover:border-primary-100 hover:bg-gray-50/50'}`}
                          >
                            <div className="flex items-center gap-5">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${isActive ? 'bg-primary-500 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-400 group-hover:bg-primary-100 group-hover:text-primary-500'} transition-all`}>
                                <i className="fa-solid fa-user"></i>
                              </div>
                              <div>
                                <p className={`text-lg tracking-tight leading-none mb-2 ${isActive ? 'text-primary-900 font-bold' : 'text-gray-700 font-light'}`}>{displayName}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user.role || 'Equipe JLVIANA'}</p>
                              </div>
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-primary-500 text-white' : 'bg-gray-50 text-gray-200 group-hover:text-primary-300'} transition-all`}>
                              <i className={`fa-solid ${isActive ? 'fa-check' : 'fa-chevron-right'} text-[10px]`}></i>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Footer do Modal */}
              <div className="px-12 py-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-circle-info text-primary-500"></i>
                  <p className="text-xs text-gray-400 font-medium italic">
                    O destinatário será notificado imediatamente sobre o novo atendimento.
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setIsTransferModalOpen(false)}
                    className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 transition-all active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={!transferTarget.id}
                    onClick={() => handleTransfer(transferTarget.id)}
                    className={`px-12 py-5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center gap-3 active:scale-95 ${transferTarget.id ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-primary-200' : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'}`}
                  >
                    <span>Realizar a Transferência</span>
                    <i className="fa-solid fa-paper-plane text-[10px]"></i>
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
