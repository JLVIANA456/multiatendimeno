import { memo } from "react";
import { Inbox } from "common/types/common.type";
import ChatItem from "./contacts";
import { ContactContainer } from "./styles";

type ChatListProps = {
  inbox: Inbox[];
  activeChatId?: string;
  searchQuery: string;
  onChangeChat: (inbox: Inbox) => void;
};

/**
 * ChatList: responsável apenas por renderizar os itens da lista de conversas.
 * 
 * Cada ChatItem é memoizado individualmente, então quando uma mensagem nova
 * chega em uma conversa, apenas aquele item específico re-renderiza.
 */
function ChatList({ inbox, activeChatId, searchQuery, onChangeChat }: ChatListProps) {
  if (inbox.length === 0) {
    return (
      <div className="p-10 text-center">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <i className="fa-regular fa-comment-dots text-gray-300 text-xl" />
        </div>
        <p className="text-gray-400 text-[10px] font-normal italic uppercase tracking-widest">
          {searchQuery ? `Sem resultados para "${searchQuery}"` : "Nenhum chat aqui"}
        </p>
      </div>
    );
  }

  return (
    <ContactContainer className="mt-2">
      {inbox.map((item) => (
        <ChatItem
          key={item.id}
          inbox={item}
          isActive={item.id === activeChatId}
          onChangeChat={onChangeChat}
        />
      ))}
    </ContactContainer>
  );
}

export default memo(ChatList);
