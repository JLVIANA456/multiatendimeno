import { useEffect, useRef } from "react";
import { Message } from "../data/get-messages";

/**
 * Gerencia o scroll da lista de mensagens.
 *
 * - Rola para o fim automaticamente sempre que `messages` muda.
 * - Usa scrollIntoView "smooth" quando o usuário clicou no botão de scroll;
 *   caso contrário, usa "auto" (instantâneo) para a transição de chat.
 * - Calcula se o botão de scroll ↓ deve aparecer.
 */
export default function useScrollToBottom(
  onShowBottomIcon: (show: boolean) => void,
  shouldScrollToBottom: boolean,
  messages: Message[]
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Rola para o fim toda vez que a lista de mensagens muda
  useEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({
      behavior: shouldScrollToBottom ? "smooth" : "auto",
    });
  }, [messages, shouldScrollToBottom]);

  // Escuta scroll do container para controlar ícone ↓
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      onShowBottomIcon(distanceFromBottom > 150);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [onShowBottomIcon]);

  return { containerRef, bottomRef };
}
