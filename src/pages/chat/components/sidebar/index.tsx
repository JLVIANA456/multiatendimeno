import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAlert from "./alert";
import ChatList from "./ChatList";
import SearchInput from "./SearchInput";
import { Inbox } from "common/types/common.type";
import { useChatContext } from "pages/chat/context/chat";
import { useAuth } from "../../../../context/AuthContext";
import { supabase } from "lib/supabase";
import {
  Header,
  SidebarContainer,
} from "./styles";

type FilterType = "Todas" | "Minhas" | "Aguardando" | "Departamento";

export default function Sidebar() {
  const navigate = useNavigate();
  const chatCtx = useChatContext();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterType>("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [userDept, setUserDept] = useState<string | null>(null);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0];

  // Busca o departamento do usuário logado uma única vez
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("departments(name)")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.departments) {
          setUserDept((data.departments as any).name);
        }
      });
  }, [user]);

  // Navega e muda o chat ativo
  const handleChangeChat = useCallback(
    (chat: Inbox) => {
      chatCtx.onChangeChat(chat);
      navigate("/chat/" + chat.id);
    },
    [chatCtx, navigate]
  );

  // A filtragem é memoizada — só recalcula quando inbox, filtro ou busca muda
  // O Sidebar NÃO re-renderiza quando o usuário está digitando no MessageInput
  // pois o value do ChatProvider é memoizado com useMemo
  const filteredInbox = useMemo(() => {
    return chatCtx.inbox.filter((item) => {
      let passesTab = true;
      if (activeFilter === "Minhas") passesTab = item.assignedTo === userName;
      if (activeFilter === "Aguardando") passesTab = !item.assignedTo;
      if (activeFilter === "Departamento") passesTab = item.department === userDept;

      if (!passesTab) return false;

      if (searchQuery) {
        return item.name?.toLowerCase().includes(searchQuery.toLowerCase());
      }

      return true;
    });
  }, [chatCtx.inbox, activeFilter, searchQuery, userName, userDept]);

  const filters = [
    { id: "Todas",       label: "Todas",    icon: "fa-layer-group"  },
    { id: "Minhas",      label: "Minhas",   icon: "fa-user"         },
    { id: "Aguardando",  label: "Aguard.",  icon: "fa-clock"        },
    { id: "Departamento", label: userDept || "Setor", icon: "fa-building-user" },
  ];

  return (
    <SidebarContainer className="bg-white">
      <Header className="!h-auto flex-col !items-start gap-4 p-6 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <h2 className="text-gray-900 font-normal text-xl tracking-tight">Suas Mensagens</h2>
        </div>

        {/* Filtros de Aba */}
        <div className="flex gap-1.5 w-full">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as FilterType)}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl text-[9px] transition-all border ${
                activeFilter === f.id
                  ? "bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-100 ring-2 ring-primary-100 ring-offset-1"
                  : "bg-white text-gray-500 border-gray-100 hover:border-primary-200"
              }`}
            >
              <i className={`fa-solid ${f.icon} text-[11px]`} />
              <span className="font-normal uppercase tracking-wider">{f.label}</span>
            </button>
          ))}
        </div>
      </Header>

      <SidebarAlert />

      {/* SearchInput isolado — apenas ele re-renderiza enquanto o usuário digita */}
      <div className="pt-3 pb-1">
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* ChatList memoizado — só re-renderiza quando filteredInbox muda */}
      <ChatList
        inbox={filteredInbox}
        activeChatId={chatCtx.activeChat?.id}
        searchQuery={searchQuery}
        onChangeChat={handleChangeChat}
      />
    </SidebarContainer>
  );
}
