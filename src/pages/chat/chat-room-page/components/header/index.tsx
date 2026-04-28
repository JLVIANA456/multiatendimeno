import { useState } from "react";
import Icon from "common/components/icons";
import OptionsMenu from "pages/chat/components/option-menu";
import { useTags } from "common/hooks/useTags";
import { supabase } from "lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  Action,
  Actions,
  actionStyles,
  Avatar,
  AvatarWrapper,
  Container,
  Name,
  ProfileWrapper,
  Subtitle,
} from "./styles";

type HeaderProps = {
  id: string;
  onSearchClick: Function;
  onProfileClick: Function;
  title: string;
  image: string;
  subTitle: string;
  onMessagesCleared?: () => void;
  onConversationDeleted?: () => void;
};

export default function Header(props: HeaderProps) {
  const { id, title, subTitle, image, onProfileClick, onSearchClick, onMessagesCleared, onConversationDeleted } = props;
  const { tags, selectedTags, toggleTagInConversa } = useTags(id);
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleOptionSelect = async (option: string) => {
    switch (option) {
      case "Informações do Contato":
        onProfileClick();
        break;

      case "Selecionar Mensagens":
        // Dispara evento global para ativar modo seleção de mensagens
        window.dispatchEvent(new CustomEvent("toggleSelectMessages"));
        break;

      case "Excluir Conversa":
        if (window.confirm("Deseja realmente excluir esta conversa? Esta ação não pode ser desfeita.")) {
          // Extrai o lid (parte após o hífen, ex: "5521999999999@c.us" -> "5521999999999@c.us")
          const lid = id.includes("-") ? id.split("-").slice(1).join("-") : id;

          // Deleta mensagens da conversa
          await supabase.from("mensagens").delete().eq("lid", lid);

          // Deleta a conversa
          const { error } = await supabase.from("conversas").delete().eq("key", id);

          if (error) {
            alert("Erro ao excluir conversa: " + error.message);
          } else {
            onConversationDeleted?.();
            // Fica na aba de conversas sem redirecionar para fora
            navigate("/chat");
          }
        }
        break;

      case "Limpar Mensagens":
        if (window.confirm("Limpar todas as mensagens desta conversa?")) {
          const lid = id.includes("-") ? id.split("-").slice(1).join("-") : id;
          const { error } = await supabase.from("mensagens").delete().eq("lid", lid);

          if (error) {
            alert("Erro ao limpar mensagens: " + error.message);
          } else {
            onMessagesCleared?.();
          }
        }
        break;

      case "Silenciar Notificações":
        alert("Notificações silenciadas!");
        break;

      default:
        break;
    }
  };

  return (
    <Container className="relative">
      <AvatarWrapper>
        <Avatar src={image} />
      </AvatarWrapper>
      <ProfileWrapper onClick={onProfileClick}>
        <div className="flex items-center gap-3">
            <Name className="text-lg font-bold">{title}</Name>
            {/* Etiquetas Selecionadas */}
            <div className="flex gap-1">
                {selectedTags.map(tag => (
                    <div
                        key={tag.id}
                        className="w-2.5 h-2.5 rounded-full shadow-sm"
                        style={{ backgroundColor: tag.color }}
                        title={tag.name}
                    />
                ))}
            </div>
        </div>
        {subTitle && <Subtitle className="text-gray-400 font-normal">{subTitle}</Subtitle>}
      </ProfileWrapper>

      <Actions>
        {/* Seletor de Etiquetas */}
        <div className="relative">
            <button
                onClick={() => setIsTagMenuOpen(!isTagMenuOpen)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isTagMenuOpen ? 'bg-primary-500 text-white shadow-lg scale-105' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-primary-600'}`}
                title="Etiquetas"
            >
                <i className="fa-solid fa-tag text-lg"></i>
            </button>

            {isTagMenuOpen && (
                <div className="absolute top-14 right-0 w-56 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 z-[150] animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3 px-2 font-black">Categorizar Conversa</p>
                    <div className="space-y-1">
                        {tags.length > 0 ? tags.map(tag => {
                            const isSelected = selectedTags.some(t => t.id === tag.id);
                            return (
                                <button
                                    key={tag.id}
                                    onClick={() => toggleTagInConversa(tag.id)}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-[13px] transition-all flex items-center gap-3 ${isSelected ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}
                                >
                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: tag.color }} />
                                    <span className="flex-1 truncate">{tag.name}</span>
                                    {isSelected && <i className="fa-solid fa-check text-[10px]"></i>}
                                </button>
                            );
                        }) : (
                            <p className="text-[10px] text-gray-400 italic p-2">Nenhuma etiqueta configurada</p>
                        )}
                    </div>
                </div>
            )}
        </div>

        <button
           className="bg-primary-50 text-primary-600 text-[13px] px-6 py-2.5 rounded-xl font-bold hover:bg-primary-500 hover:text-white transition-all mx-3 flex items-center gap-2 shadow-sm border border-primary-100 group"
           onClick={() => (window as any).openTransferModal && (window as any).openTransferModal()}
        >
            <i className="fa-solid fa-share text-sm group-hover:translate-x-0.5 transition-transform"></i>
            Transferir
        </button>
        <Action onClick={onSearchClick} className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all">
          <Icon id="search" className="icon search-icon scale-125" />
        </Action>
        <OptionsMenu
          styles={actionStyles}
          ariaLabel="Menu"
          iconId="menu"
          iconClassName="icon"
          onSelect={handleOptionSelect}
          options={[
            "Informações do Contato",
            "Limpar Mensagens",
            "Excluir Conversa",
          ]}
        />
      </Actions>
    </Container>
  );
}
