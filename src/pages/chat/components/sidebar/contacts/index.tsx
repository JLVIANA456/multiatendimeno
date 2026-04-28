import { memo, useCallback, useState, useRef, useEffect } from "react";
import Icon from "common/components/icons";
import { Inbox } from "common/types/common.type";
import { useChatContext } from "pages/chat/context/chat";
import {
  Avatar,
  AvatarWrapper,
  Contact,
  Content,
  MessageStatusIcon,
  MessageWrapper,
} from "./styles";

type ChatItemProps = {
  inbox: Inbox;
  isActive: boolean;
  onChangeChat: (inbox: Inbox) => void;
};

function ChatItem({ inbox, isActive, onChangeChat }: ChatItemProps) {
  const { setIsTransferModalOpen, togglePin } = useChatContext();
  const { name, lastMessage, image, timestamp, notificationsCount, isPinned, assignedTo, department } = inbox;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleClick = useCallback(() => {
    onChangeChat(inbox);
  }, [inbox, onChangeChat]);

  const handleOpenTransfer = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChangeChat(inbox);
    setIsTransferModalOpen(true);
    setIsMenuOpen(false);
  }, [inbox, onChangeChat, setIsTransferModalOpen]);

  const handleTogglePin = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    togglePin(inbox.id);
    setIsMenuOpen(false);
  }, [inbox.id, togglePin]);

  const toggleMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  return (
    <Contact 
      isActive={isActive} 
      onClick={handleClick} 
      className={`group relative !bg-white hover:!bg-gray-50 border-b border-gray-50/50 ${isMenuOpen ? '!z-[100]' : ''}`}
    >
      <AvatarWrapper>
        <Avatar src={image} />
      </AvatarWrapper>
      <Content>
        {/* Linha 1: Nome + Tags | Timestamp */}
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-1.5 overflow-hidden flex-1 min-w-0">
            <h3 className="text-gray-900 font-normal text-[15px] truncate shrink-0 max-w-[110px]">{name}</h3>
            {assignedTo ? (
              <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full font-semibold whitespace-nowrap flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block shrink-0"></span>
                {assignedTo}
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-full font-semibold whitespace-nowrap flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse inline-block shrink-0"></span>
                Aguardando
              </span>
            )}
            <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full font-semibold whitespace-nowrap shrink-0">
              {department || "Geral"}
            </span>
          </div>
          {timestamp && <span className="text-[11px] text-gray-900 font-normal ml-2 shrink-0">{timestamp}</span>}
        </div>

        {/* Linha 2: Última mensagem | Notificações + Menu */}
        <div className="flex justify-between items-center w-full relative">
          <MessageWrapper>
            <LastMessage lastMessage={lastMessage} messageStatus={inbox.messageStatus} />
          </MessageWrapper>
          <div className="flex items-center gap-1.5 ml-1 shrink-0">
            {isPinned && <Icon id="pinned" className="sidebar-contact__icon scale-75 opacity-100 text-gray-900" />}
            {notificationsCount !== undefined && notificationsCount > 0 && (
              <div className="w-5 h-5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm shrink-0">
                {notificationsCount}
              </div>
            )}
            <div ref={menuRef} className="relative">
              <button
                onClick={toggleMenu}
                className={`w-6 h-6 rounded-md hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-primary-600 transition-all ${isMenuOpen ? 'opacity-100 bg-gray-100' : 'opacity-0 group-hover:opacity-100'}`}
                title="Opções"
              >
                <i className="fa-solid fa-ellipsis text-xs"></i>
              </button>
              {isMenuOpen && (
                <div className="absolute bottom-7 right-0 w-44 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 z-[200] py-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <button 
                    onClick={handleOpenTransfer}
                    className="w-full px-5 py-3 text-left text-[11px] font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-600 flex items-center gap-3 transition-all border-b border-gray-50/50"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-500 flex items-center justify-center">
                      <i className="fa-solid fa-share-nodes text-[10px]"></i>
                    </div>
                    <span>Transferir</span>
                  </button>
                  <button 
                    onClick={handleTogglePin}
                    className="w-full px-5 py-3 text-left text-[11px] font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-600 flex items-center gap-3 transition-all"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isPinned ? 'bg-orange-50 text-orange-500' : 'bg-gray-50 text-gray-500'}`}>
                      <i className={`fa-solid fa-thumbtack text-[10px] ${isPinned ? 'rotate-45' : ''}`}></i>
                    </div>
                    <span>{isPinned ? 'Desafixar' : 'Fixar Conversa'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Content>
    </Contact>
  );
}

function LastMessage({ lastMessage, messageStatus }: Pick<Inbox, "messageStatus" | "lastMessage">) {
  if (!lastMessage) return null;
  return (
    <>
      <MessageStatusIcon
        isRead={messageStatus === "READ"}
        id={messageStatus === "SENT" ? "singleTick" : "doubleTick"}
        className="opacity-100"
      />
      <span className="text-gray-600 text-sm truncate max-w-[180px] font-normal">{lastMessage}</span>
    </>
  );
}

// Memoizado: só re-renderiza se a inbox ou isActive mudarem
export default memo(ChatItem, (prev, next) => {
  return (
    prev.isActive === next.isActive &&
    prev.inbox.id === next.inbox.id &&
    prev.inbox.lastMessage === next.inbox.lastMessage &&
    prev.inbox.notificationsCount === next.inbox.notificationsCount &&
    prev.inbox.assignedTo === next.inbox.assignedTo &&
    prev.inbox.timestamp === next.inbox.timestamp
  );
});
