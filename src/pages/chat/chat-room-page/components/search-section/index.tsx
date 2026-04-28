import React, { useState, useMemo } from "react";
import { useChatContext } from "pages/chat/context/chat";
import { Content, Search } from "./styles";

export default function SearchSection() {
  const { messages } = useChatContext();
  const [query, setQuery] = useState("");

  const filteredMessages = useMemo(() => {
    if (!query.trim()) return [];
    return messages.filter((msg) =>
      msg.body.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, messages]);

  return (
    <React.Fragment>
      <div className="p-4 border-b border-gray-100">
        <Search
          placeholder="Pesquisar mensagens ..."
          value={query}
          onChange={(e: any) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {query.trim() === "" ? (
          <Content>
            <p className="text-gray-400 mt-10">Digite algo para pesquisar mensagens nesta conversa.</p>
          </Content>
        ) : filteredMessages.length > 0 ? (
          <div className="flex flex-col">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                  const element = document.getElementById(`msg-${msg.id}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Adiciona um efeito temporário de destaque
                    element.style.backgroundColor = 'rgba(0, 229, 255, 0.15)';
                    setTimeout(() => {
                      element.style.backgroundColor = '';
                    }, 2000);
                  }
                }}
                className="p-4 hover:bg-gray-50 border-b border-gray-50 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">
                    {msg.isOpponent ? "Cliente" : "Você"}
                  </span>
                  <span className="text-[9px] text-gray-400 font-light">
                    {msg.date} às {msg.timestamp}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                  {msg.body}
                </p>
              </div>
            ))}
            <div className="p-8 text-center">
              <p className="text-[10px] text-gray-300 uppercase tracking-[0.2em]">Fim dos resultados</p>
            </div>
          </div>
        ) : (
          <Content>
            <p className="text-gray-400 mt-10">Nenhuma mensagem encontrada para "{query}"</p>
          </Content>
        )}
      </div>
    </React.Fragment>
  );
}
