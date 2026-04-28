import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Inbox } from "common/types/common.type";
import { Message } from "../chat-room-page/components/messages-list/data/get-messages";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "lib/supabase";
import { zapiService } from "common/services/zapi.service";

type User = {
  name: string;
  image: string;
};

type ChatContextProp = {
  user: User;
  inbox: Inbox[];
  activeChat?: Inbox;
  messages: Message[];
  loading: boolean;
  onChangeChat: (chat: Inbox) => void;
  sendMessage: (body: string, mediaData?: { url: string; name: string; type: any }) => void;
  takeChat: (chatId: string) => Promise<void>;
  selectChatByPhone: (phone: string) => string | null;
  startOutboundChat: (phone: string, clientName: string) => Promise<string | null>;
  clearMessages: (chatId?: string) => Promise<void>;
  deleteActiveChat: () => void;
  isTransferModalOpen: boolean;
  setIsTransferModalOpen: (isOpen: boolean) => void;
  togglePin: (chatId: string) => Promise<void>;
};

const initialValue: ChatContextProp = {
  user: { name: "Usuário", image: "/assets/images/girl.jpeg" },
  inbox: [],
  messages: [],
  loading: false,
  onChangeChat() {},
  sendMessage() {},
  async takeChat() {},
  selectChatByPhone: () => null,
  async startOutboundChat() { return null; },
  async clearMessages() {},
  deleteActiveChat() {},
  isTransferModalOpen: false,
  setIsTransferModalOpen() {},
  async togglePin() {},
};

export const ChatContext = React.createContext<ChatContextProp>(initialValue);

export default function ChatProvider(props: { children: any }) {
  const { children } = props;
  const { user: authUser } = useAuth();

  const [user, setUser] = useState<User>(initialValue.user);
  const [inboxState, setInboxState] = useState<Inbox[]>([]);
  const [activeChat, setActiveChat] = useState<Inbox>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeConfig, setActiveConfig] = useState<any>(null);

  // ─── Refs para sistema de notificações ───────────────────────────────────
  const previousInboxRef = useRef<Inbox[]>([]);
  const activeChatRef = useRef<Inbox | undefined>(undefined);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Mantém activeChatRef atualizado sem re-renderizações
  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  // ─── Solicitar permissão de notificação do navegador ──────────────────────
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // ─── Som de notificação (Web Audio API — sem arquivo externo) ────────────
  const playNotificationSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Silencioso — usuário pode ter bloqueado áudio
    }
  }, []);

  // ─── Notificação push do navegador ───────────────────────────────────────
  const showBrowserNotification = useCallback((name: string, body: string, icon?: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const notif = new Notification(`💬 ${name}`, {
      body: body || 'Nova mensagem recebida',
      icon: icon || '/logo192.png',
      tag: name, // Agrupa notificações do mesmo contato
      silent: true, // Som já tratado pelo nosso Web Audio
    });
    notif.onclick = () => { window.focus(); notif.close(); };
    setTimeout(() => notif.close(), 6000);
  }, []);

  // ─── Busca Configuração Ativa da Z-API ────────────────────────────────────
  const fetchActiveConfig = useCallback(async () => {
    const { data, error } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (data && !error) {
      setActiveConfig({
        instance: data.instance_id,
        token: data.instance_token,
        clientToken: data.client_token
      });
    }
  }, []);

  // ─── Sincroniza usuário autenticado ───────────────────────────────────────
  useEffect(() => {
    if (authUser) {
      setUser({
        name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Usuário",
        image: authUser.user_metadata?.avatar_url || "/assets/images/girl.jpeg",
      });
      fetchActiveConfig();

      // Listener para troca de instância ativa em tempo real
      const channel = supabase.channel('active-config-change')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_config' }, fetchActiveConfig)
        .subscribe();
      
      return () => { supabase.removeChannel(channel); };
    }
  }, [authUser, fetchActiveConfig]);

  // ─── Carrega lista de conversas ──────────────────────────────────────────
  const fetchInbox = useCallback(async () => {
    if (!authUser) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("department_id, departments(name)")
      .eq("id", authUser.id)
      .single();

    const userDeptName = (profile?.departments as any)?.name;

    let query = supabase.from("conversas").select("*");
    if (userDeptName) query = query.eq("department", userDeptName);

    const { data, error } = await query
      .order("updated_at", { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar conversas:", error);
      return;
    }

    const mappedInbox: Inbox[] = data.map((item) => ({
      id: item.key,
      name: item.name || "Sem Nome",
      image: item.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.name || "C")}&backgroundColor=e8f0fe&textColor=3b5bdb`,
      lastMessage: item.message,
      timestamp: new Date(item.updated_at || item.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      messageStatus: item.from_me ? "SENT" : "READ",
      notificationsCount: item.notifications_count || 0,
      assignedTo: item.assigned_to,
      department: item.department,
      isOutbound: item.from_me === true,
      channelId: item.id_canal,
      isPinned: item.is_pinned
    }));

    // ── Detectar novas mensagens e disparar notificações ────────────────────
    const prevInbox = previousInboxRef.current;
    if (prevInbox.length > 0) {
      mappedInbox.forEach(newItem => {
        const prev = prevInbox.find(p => p.id === newItem.id);
        const newCount = newItem.notificationsCount || 0;
        const prevCount = prev?.notificationsCount || 0;
        const isActiveChat = activeChatRef.current?.id === newItem.id;

        if (newCount > prevCount && !isActiveChat) {
          playNotificationSound();
          showBrowserNotification(
            newItem.name,
            newItem.lastMessage || 'Nova mensagem recebida',
            newItem.image
          );
        }
      });
    }
    previousInboxRef.current = mappedInbox;

    // ── Atualizar título da aba com total de não lidas ───────────────────────
    const totalUnread = mappedInbox.reduce((sum, c) => sum + (c.notificationsCount || 0), 0);
    document.title = totalUnread > 0 ? `(${totalUnread}) JLVIANA Conecta+` : 'JLVIANA Conecta+';

    setInboxState(mappedInbox);
  }, [authUser, playNotificationSound, showBrowserNotification]);

  const togglePin = useCallback(async (chatId: string) => {
    const chat = inboxState.find(c => c.id === chatId);
    if (!chat) return;
    const newPinnedStatus = !chat.isPinned;
    
    await supabase.from("conversas").update({ is_pinned: newPinnedStatus }).eq("key", chatId);
    setInboxState(prev => prev.map(c => c.id === chatId ? { ...c, isPinned: newPinnedStatus } : c));
  }, [inboxState]);

  useEffect(() => {
    fetchInbox();
    const channel = supabase.channel("inbox-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversas" }, fetchInbox)
      .subscribe();

    // Polling fallback: garante que novas conversas apareçam mesmo sem Realtime habilitado
    const poll = setInterval(fetchInbox, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [fetchInbox]);

  // ─── Carrega mensagens do chat ativo ──────────────────────────────────────
  useEffect(() => {
    if (!activeChat) return;

    const lid = activeChat.id;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("mensagens")
        .select("*")
        .eq("lid", lid)
        .order("created_at", { ascending: true });

      if (!error && data) {
        const mapped: Message[] = data.map((msg) => ({
          id: msg.message_id,
          body: msg.message || msg.body || msg.caption || "",
          date: new Date(msg.created_at).toLocaleDateString("pt-BR"),
          timestamp: new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          messageStatus: msg.from_me ? "READ" : "SENT",
          isOpponent: !msg.from_me,
          isPending: false,
          mediaUrl: msg.media_url,
          fileName: msg.filename,
          mediaType: msg.messagetype,
        }));
        // Mantém mensagens pendentes (optimistic) que ainda não confirmadas no banco
        setMessages(prev => {
          const pendingMsgs = prev.filter(m => m.isPending);
          const confirmedIds = new Set(mapped.map(m => m.id));
          const stillPending = pendingMsgs.filter(m => !confirmedIds.has(m.id));
          return [...mapped, ...stillPending];
        });
      }
    };

    // Carga inicial
    setLoading(true);
    fetchMessages().finally(() => setLoading(false));

    // Canal Realtime (caminho rápido — mensagens instantâneas)
    const channel = supabase.channel(`chat-${activeChat.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mensagens", filter: `lid=eq.${lid}` },
        (payload) => {
          const msg = payload.new;
          const confirmed: Message = {
            id: msg.message_id,
            body: msg.message || msg.body || msg.caption || "",
            date: new Date(msg.created_at).toLocaleDateString("pt-BR"),
            timestamp: new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            messageStatus: msg.from_me ? "READ" : "SENT",
            isOpponent: !msg.from_me,
            isPending: false,
            mediaUrl: msg.media_url,
            fileName: msg.filename,
            mediaType: msg.messagetype,
          };
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === msg.message_id);
            if (idx !== -1) {
              const next = [...prev];
              next[idx] = confirmed;
              return next;
            }
            return [...prev, confirmed];
          });
        }
      )
      .subscribe();

    // Polling fallback: garante que mensagens apareçam mesmo sem Realtime ativo
    const poll = setInterval(fetchMessages, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [activeChat]);



  // ─── Aceitar atendimento ──────────────────────────────────────────────────
  const takeChat = useCallback(async (chatId: string) => {
    if (!authUser) return;
    const name = authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Consultor";
    await supabase.from("conversas").update({ assigned_to: name }).eq("key", chatId);
    if (activeChat?.id === chatId) setActiveChat(prev => prev ? { ...prev, assignedTo: name } : prev);
    setInboxState(prev => prev.map(c => c.id === chatId ? { ...c, assignedTo: name } : c));
  }, [authUser, activeChat]);

  const markAsRead = useCallback(async (chatId: string) => {
    await supabase.from("conversas").update({ notifications_count: 0 }).eq("key", chatId);
    setInboxState(prev => prev.map(c => c.id === chatId ? { ...c, notificationsCount: 0 } : c));
  }, []);

  const handleChangeChat = useCallback((chat: Inbox) => {
    setActiveChat(chat);
    if (chat.notificationsCount && chat.notificationsCount > 0) {
      markAsRead(chat.id);
    }
  }, [markAsRead]);

  // ─── Enviar mensagem (Texto ou Mídia) ───────────────────────────────────
  const sendMessage = useCallback(async (body: string, mediaData?: { url: string; name: string; type: any }) => {
    if (!activeChat || !authUser) return;
    const lid = activeChat.id; // Usa o ID completo (1-55...@c.us) para o banco
    const zapiPhone = activeChat.id.split("-")[1]?.split("@")[0] || activeChat.id.split("@")[0]; // Apenas o número para a Z-API
    const tempId = `pending-${Date.now()}`;

    // ── Auto-atribuir ao atendente que enviar a primeira mensagem ──────────
    const userName = authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Consultor";
    if (!activeChat.assignedTo) {
      await supabase.from("conversas").update({ assigned_to: userName }).eq("key", lid);
      setInboxState(prev => prev.map(c => c.id === lid ? { ...c, assignedTo: userName } : c));
      setActiveChat(prev => prev ? { ...prev, assignedTo: userName } : prev);
    }
    const now = new Date();

    // 1. UI Otimista (aparece na tela na hora)
    const optimistic: Message = {
      id: tempId, body, date: now.toLocaleDateString("pt-BR"),
      timestamp: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      messageStatus: "SENT", isOpponent: false, isPending: true,
      mediaUrl: mediaData?.url, fileName: mediaData?.name, mediaType: mediaData?.type
    };
    setMessages((prev) => [...prev, optimistic]);

    // 2. Salva no Banco de Dados (Supabase)
    const { data, error } = await supabase.from("mensagens").insert({
      message_id: tempId,
      message: body || "",
      media_url: mediaData?.url,
      filename: mediaData?.name,
      messagetype: mediaData?.type || "conversation",
      from_me: true,
      lid,
    }).select().single();

    if (error) {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, isPending: false } : m));
      return;
    }

    // 3. Dispara para o WhatsApp via Z-API
    try {
      if (mediaData) {
        if (mediaData.type === 'document') {
          await zapiService.sendDocument(zapiPhone, mediaData.url, mediaData.name, activeConfig);
        } else if (mediaData.type === 'image') {
          await zapiService.sendImage(zapiPhone, mediaData.url, activeConfig);
        }
      } else {
        await zapiService.sendText(zapiPhone, body, activeConfig);
      }
    } catch (zapiErr) {
      console.error("Z-API Send error:", zapiErr);
    }

    setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: data?.message_id || tempId, isPending: false } : m));
  }, [activeChat, authUser, activeConfig]);

  const selectChatByPhone = useCallback((phone: string) => {
      const chat = inboxState.find((c) => {
        const idDigits = c.id.replace(/\D/g, "");
        const inputDigits = phone.replace(/\D/g, "");
        return idDigits.includes(inputDigits.slice(-11)) || (inputDigits.length >= 8 && idDigits.includes(inputDigits.slice(-8)));
      });
      if (chat) { handleChangeChat({ ...chat, isOutbound: true }); return chat.id; }
      return null;
  }, [inboxState, handleChangeChat]);

  const startOutboundChat = useCallback(async (phone: string, clientName: string) => {
      if (!authUser) return null;
      const existingId = selectChatByPhone(phone);
      if (existingId) return existingId;

      const cleanPhone = phone.replace(/\D/g, "");
      const key = `1-55${cleanPhone.slice(-11)}@c.us`;

      const { data: profile } = await supabase.from('profiles').select('departments(name)').eq('id', authUser.id).single();
      const userDept = (profile?.departments as any)?.name;
      const userName = authUser.user_metadata?.full_name || authUser.email?.split("@")[0];

      const { error } = await supabase.from('conversas').insert({
        key, name: clientName, phone: cleanPhone, from_me: true,
        assigned_to: userName, department: userDept || "Geral",
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      });

      if (error) return null;
      const mapped = { id: key, name: clientName, image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(clientName)}`, timestamp: "Agora", notificationsCount: 0, assignedTo: userName, department: userDept || "Geral", isOutbound: true };
      setInboxState(prev => [mapped, ...prev]);
      setActiveChat(mapped);
      return key;
  }, [authUser, selectChatByPhone]);

  const clearMessages = useCallback(async (chatId?: string) => {
      const targetId = chatId || activeChat?.id;
      if (!targetId) return;
      await supabase.from("conversas").update({ message: null, notifications_count: 0 }).eq("key", targetId);
      setInboxState(prev => prev.map(c => c.id === targetId ? { ...c, lastMessage: undefined, notificationsCount: 0 } : c));
      setMessages([]);
  }, [activeChat]);

  const deleteActiveChat = useCallback(() => {
    setActiveChat(undefined);
    setMessages([]);
    if (activeChat) setInboxState(prev => prev.filter(c => c.id !== activeChat.id));
  }, [activeChat]);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const contextValue = useMemo<ChatContextProp>(() => ({
      user, inbox: inboxState, activeChat, messages, loading,
      onChangeChat: handleChangeChat, sendMessage, takeChat, selectChatByPhone, startOutboundChat, clearMessages, deleteActiveChat,
      isTransferModalOpen, setIsTransferModalOpen, togglePin
  }), [user, inboxState, activeChat, messages, loading, startOutboundChat, takeChat, handleChangeChat, clearMessages, deleteActiveChat, sendMessage, selectChatByPhone, isTransferModalOpen, togglePin]);

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

export const useChatContext = () => React.useContext(ChatContext);
