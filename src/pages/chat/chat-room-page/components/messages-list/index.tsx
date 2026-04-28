import { useMemo } from "react";
import Icon from "common/components/icons";
import useScrollToBottom from "./hooks/useScrollToBottom";
import { useChatContext } from "pages/chat/context/chat";
import MessageBubble from "./MessageBubble";
import {
  Container,
  Date,
  DateWrapper,
  EncryptionMessage,
  MessageGroup,
} from "./styles";

type MessagesListProps = {
  onShowBottomIcon: (show: boolean) => void;
  shouldScrollToBottom: boolean;
};

export default function MessagesList({ onShowBottomIcon, shouldScrollToBottom }: MessagesListProps) {
  const { messages, activeChat, takeChat } = useChatContext();
  const { containerRef, bottomRef } = useScrollToBottom(
    onShowBottomIcon,
    shouldScrollToBottom,
    messages
  );

  const isUnassigned = !activeChat?.assignedTo;

  // Lógica para agrupar mensagens e decidir se mostra o rabicho (estilo WhatsApp)
  // Agrupa se: mesmo remetente E mesma data/minuto
  const renderedMessages = useMemo(() => {
    return messages.map((msg, idx) => {
      const prevMsg = messages[idx - 1];
      
      // É a primeira do grupo se for a primeira da lista OU se o remetente mudou 
      // OU se o tempo de diferença for maior que 1 minuto
      const isFirstInGroup = !prevMsg || 
                             prevMsg.isOpponent !== msg.isOpponent || 
                             prevMsg.timestamp !== msg.timestamp;

      return (
        <MessageBubble 
          key={msg.id} 
          message={msg} 
          isFirstInGroup={isFirstInGroup} 
        />
      );
    });
  }, [messages]);

  return (
    <Container ref={containerRef}>
      
      <EncryptionMessage>
        <Icon id="lock" className="icon" />
        As mensagens são protegidas com criptografia de ponta a ponta. Ninguém fora desta conversa pode ler ou ouvi-las.
      </EncryptionMessage>

      <DateWrapper>
        <Date> HOJE </Date>
      </DateWrapper>

      <MessageGroup>
        {renderedMessages}
        {/* Âncora para o scroll automático */}
        <div ref={bottomRef} style={{ height: 1 }} />
      </MessageGroup>
    </Container>
  );
}
