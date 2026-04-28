import { useState, useRef, useCallback, useEffect } from "react";
import Icon from "common/components/icons";
import { useChatContext } from "pages/chat/context/chat";
import { supabase } from "lib/supabase";
import {
  AttachButton,
  Button,
  ButtonsContainer,
  IconsWrapper,
  Input,
  SendMessageButton,
  Wrapper,
} from "./styles";

const BUCKET = "chat-attachments";

type AttachType = "document" | "image" | "camera";

const attachButtons: { icon: string; label: string; type: AttachType; accept: string }[] = [
  { icon: "attachDocument", label: "Documento",  type: "document", accept: ".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip" },
  { icon: "attachCamera",   label: "Câmera",     type: "camera",   accept: "image/*;capture=camera" },
  { icon: "attachImage",    label: "Imagem",     type: "image",    accept: "image/*" },
];

export default function Footer() {
  const [showIcons, setShowIcons] = useState(false);
  const [message, setMessage]     = useState("");
  const [uploading, setUploading] = useState(false);
  const { sendMessage, activeChat } = useChatContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Refs para inputs de arquivo (um por tipo)
  const inputRefs = useRef<{ [key in AttachType]?: HTMLInputElement | null }>({});

  // Auto-resize do textarea conforme usuário digita
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [message]);

  const handleSendMessage = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setMessage("");
    // Reseta altura após envio
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [message, sendMessage]);

  /**
   * Enter → envia | Shift+Enter → quebra linha
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    // Shift+Enter: deixa o comportamento padrão do textarea (nova linha)
  }, [handleSendMessage]);

  /** Faz upload do arquivo no Supabase Storage e envia o link como mensagem */
  const handleFileUpload = useCallback(async (file: File, type: AttachType) => {
    if (!activeChat) {
      alert("Selecione uma conversa antes de enviar arquivos.");
      return;
    }

    setUploading(true);
    setShowIcons(false);

    try {
      const ext   = file.name.split(".").pop();
      const path  = `${activeChat.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true });

      if (uploadError) {
        console.error("Erro no upload:", uploadError);
        alert("Erro ao enviar arquivo: " + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);

      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) {
        alert("Não foi possível obter o link do arquivo.");
        return;
      }

      // Envia como mídia estruturada para o ChatProvider
      sendMessage("", {
          url: publicUrl,
          name: file.name,
          type: type === "document" ? "document" : (type === "image" || type === "camera" ? "image" : "conversation")
      });
    } finally {
      setUploading(false);
    }
  }, [activeChat, sendMessage]);

  const handleButtonClick = (type: AttachType) => {
    inputRefs.current[type]?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: AttachType) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, type);
    e.target.value = "";
  };

  return (
    <Wrapper>
      {/* Inputs ocultos de arquivo */}
      {attachButtons.map((btn) => (
        <input
          key={btn.type}
          type="file"
          accept={btn.accept}
          style={{ display: "none" }}
          ref={(el) => { inputRefs.current[btn.type] = el; }}
          onChange={(e) => handleFileChange(e, btn.type)}
        />
      ))}

      <IconsWrapper>
        <AttachButton
          onClick={() => setShowIcons(!showIcons)}
          title="Anexar arquivo"
          disabled={uploading}
        >
          {uploading ? (
            <span style={{ fontSize: 12, color: "#999" }}>...</span>
          ) : (
            <Icon id="attach" className="icon" />
          )}
        </AttachButton>

        <ButtonsContainer>
          {attachButtons.map((btn) => (
            <Button
              showIcon={showIcons}
              key={btn.label}
              title={btn.label}
              onClick={() => handleButtonClick(btn.type)}
              disabled={uploading}
            >
              <Icon id={btn.icon} />
            </Button>
          ))}
        </ButtonsContainer>
      </IconsWrapper>

      <Input
        ref={textareaRef}
        placeholder="Digite uma mensagem..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
      />
      <SendMessageButton onClick={handleSendMessage} disabled={uploading || !message.trim()}>
        <Icon id="send" className="icon" />
      </SendMessageButton>
    </Wrapper>
  );
}
