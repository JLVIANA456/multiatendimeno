import React, { useState } from "react";
import { useDepartments } from "../../common/hooks/useDepartments";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const DashboardPage: React.FC = () => {
    const { departments } = useDepartments();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [selectedDept, setSelectedDept] = useState<any>(null);
    const [deptStats, setDeptStats] = useState<{
        totalAtendimentos: number;
        totalMensagens: number;
        topUser: string;
        recentServices: any[];
    } | null>(null);

    const [loadingStats, setLoadingStats] = useState(false);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const [globalStats, setGlobalStats] = useState({
        openConversations: 0,
        unreadMessages: 0,
        waitingResponse: 0,
        lastUpdate: "Agora",
    });

    const [notifications, setNotifications] = useState<any[]>([]);
    const [allDeptStats, setAllDeptStats] = useState<
        Record<string, { open: number; unread: number }>
    >({});

    React.useEffect(() => {
        const fetchGlobalAndDeptStats = async () => {
            try {
                // A tabela conversas não tem coluna 'status'.
                // Buscamos todas as conversas não deletadas (deleted_at IS NULL)
                const { data: conversas, error: convError } = await supabase
                    .from("conversas")
                    .select("key, department, updated_at, notifications_count, assigned_to")
                    .is("deleted_at", null);

                if (convError) throw convError;

                const activeConversas = conversas || [];

                // Total de conversas abertas = todas as não deletadas
                const openChats = activeConversas.length;

                // Total de mensagens não lidas (soma de notifications_count)
                const totalUnread = activeConversas.reduce(
                    (sum, c) => sum + (c.notifications_count || 0),
                    0
                );

                // Conversas aguardando resposta = sem atendente OU com notificações pendentes
                const waitingResponse = activeConversas.filter(
                    (c) => !c.assigned_to || (c.notifications_count || 0) > 0
                ).length;

                // Busca mensagens recentes recebidas para o painel de notificações
                const { data: recentMsgs, error: msgError } = await supabase
                    .from("mensagens")
                    .select("message, created_at, from_me, lid, conversas(name)")
                    .eq("from_me", false)
                    .order("created_at", { ascending: false })
                    .limit(5);

                if (msgError) throw msgError;

                const formattedNotifs =
                    (recentMsgs as any[])?.map((m) => ({
                        from: (m.conversas as any)?.name || "Cliente",
                        msg: m.message || "Nova mensagem recebida",
                        time: new Date(m.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                        color: "bg-cyan-100 text-[#0077C8]",
                    })) || [];

                setNotifications(formattedNotifs);

                // Agrupa por departamento
                const deptMap: Record<string, { open: number; unread: number }> = {};

                activeConversas.forEach((c) => {
                    const department = c.department || "Geral";

                    if (!deptMap[department]) {
                        deptMap[department] = { open: 0, unread: 0 };
                    }

                    deptMap[department].open++;
                    deptMap[department].unread += c.notifications_count || 0;
                });

                setAllDeptStats(deptMap);

                setGlobalStats({
                    openConversations: openChats,
                    unreadMessages: totalUnread,
                    waitingResponse,
                    lastUpdate: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                });
            } catch (err) {
                console.error("Erro no fetch global:", err);
            }
        };

        fetchGlobalAndDeptStats();

        const interval = setInterval(fetchGlobalAndDeptStats, 30000);

        return () => clearInterval(interval);
    }, []);

    React.useEffect(() => {
        if (!selectedDept) {
            setDeptStats(null);
            return;
        }

        const fetchDeptStats = async () => {
            setLoadingStats(true);

            try {
                const { data: conversas, error: convError } = await supabase
                    .from("conversas")
                    .select("key, assigned_to, name, updated_at")
                    .eq("department", selectedDept.name);

                if (convError) throw convError;

                const conversationKeys =
                    conversas?.map((c) => c.key).filter(Boolean) || [];

                let totalMsg = 0;

                if (conversationKeys.length > 0) {
                    const { count, error: msgError } = await supabase
                        .from("mensagens")
                        .select("*", { count: "exact", head: true })
                        .in("lid", conversationKeys)
                        .eq("from_me", true);

                    if (!msgError) {
                        totalMsg = count || 0;
                    }
                }

                const userCounts: Record<string, number> = {};

                conversas?.forEach((c) => {
                    const assignedUser = c.assigned_to || "Não atribuído";
                    userCounts[assignedUser] = (userCounts[assignedUser] || 0) + 1;
                });

                let topUser = "Nenhum";
                let maxCount = 0;

                Object.entries(userCounts).forEach(([assignedUser, count]) => {
                    if (count > maxCount && assignedUser !== "Não atribuído") {
                        topUser = assignedUser;
                        maxCount = count;
                    }
                });

                const recentServices = [...(conversas || [])]
                    .sort(
                        (a, b) =>
                            new Date(b.updated_at || 0).getTime() -
                            new Date(a.updated_at || 0).getTime()
                    )
                    .slice(0, 5);

                setDeptStats({
                    totalAtendimentos: conversas?.length || 0,
                    totalMensagens: totalMsg,
                    topUser,
                    recentServices,
                });
            } catch (err) {
                console.error("Erro ao carregar estatísticas:", err);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchDeptStats();
    }, [selectedDept]);

    const searchableItems = [
        { label: "Dashboard", path: "/dashboard", icon: "fa-house" },
        { label: "Departamentos", path: "/", icon: "fa-layer-group" },
        { label: "Canais", path: "/channels", icon: "fa-sitemap" },
        { label: "Conversas / Chat", path: "/chat", icon: "fa-comments" },
        { label: "Clientes", path: "/clients", icon: "fa-address-card" },
        { label: "Contatos", path: "/contacts", icon: "fa-user-group" },
        { label: "Perfil de Usuário", path: "/profile", icon: "fa-user-gear" },
        { label: "Configurações", path: "/settings", icon: "fa-gear" },
    ];

    const filteredItems = searchableItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearchNavigate = (path: string) => {
        setIsSearchOpen(false);
        setSearchQuery("");
        navigate(path);
    };

    const userName =
        user?.user_metadata?.full_name?.split(" ")[0] ||
        user?.user_metadata?.name?.split(" ")[0] ||
        user?.email?.split("@")[0] ||
        "Consultor";

    const normalizeName = (name?: string) => (name || "").toLowerCase();

    const getDeptColor = (name?: string) => {
        const lowerName = normalizeName(name);

        if (lowerName.includes("fiscal")) return "bg-[#0077C8]";
        if (lowerName.includes("contábil") || lowerName.includes("contabil"))
            return "bg-[#FF4F4F]";
        if (lowerName.includes("financeiro") || lowerName.includes("finança"))
            return "bg-[#88C940]";
        if (lowerName.includes("pessoal") || lowerName.includes("rh"))
            return "bg-[#7B61FF]";
        if (lowerName.includes("qualidade")) return "bg-[#334155]";
        if (lowerName.includes("bpo")) return "bg-[#0f172a]";
        if (lowerName.includes("diretoria") || lowerName.includes("painel"))
            return "bg-[#00AEEF]";
        if (lowerName.includes("vendas")) return "bg-[#FF8C00]";
        if (lowerName.includes("serviço") || lowerName.includes("servico"))
            return "bg-[#00B5AD]";
        if (lowerName.includes("compras")) return "bg-[#0F766E]";

        return "bg-[#334155]";
    };

    const getDeptIconClass = (name?: string) => {
        const lowerName = normalizeName(name);

        if (lowerName.includes("fiscal")) return "fa-file-invoice";
        if (lowerName.includes("contábil") || lowerName.includes("contabil"))
            return "fa-calculator";
        if (lowerName.includes("financeiro") || lowerName.includes("finança"))
            return "fa-chart-line";
        if (lowerName.includes("pessoal") || lowerName.includes("rh"))
            return "fa-users";
        if (lowerName.includes("qualidade")) return "fa-circle-check";
        if (lowerName.includes("bpo")) return "fa-gears";
        if (lowerName.includes("diretoria") || lowerName.includes("painel"))
            return "fa-briefcase";
        if (lowerName.includes("vendas")) return "fa-chart-simple";
        if (lowerName.includes("serviço") || lowerName.includes("servico"))
            return "fa-check-double";
        if (lowerName.includes("compras")) return "fa-box-open";

        return "fa-layer-group";
    };

    return (
        <div className="relative h-screen w-full flex flex-col font-sans overflow-hidden bg-[#0a0a0a]">
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat animate-in fade-in duration-1000"
                style={{
                    backgroundImage:
                        "url('/imagem%20para%20fundo%20(1).jpg')",
                }}
            >
                <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-20 flex justify-between items-center px-8 py-6 text-white bg-black/15 backdrop-blur-md border-b border-white/10">
                <div className="flex items-center gap-3">
                    <span className="text-xl font-black tracking-tighter">
                        JL<span className="text-[#00E5FF]">VIANA</span> Conecta+
                    </span>

                    <span className="hidden md:block text-[10px] opacity-60 uppercase tracking-widest border-l border-white/20 pl-3">
                        JLVIANA Consultoria Contábil
                    </span>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setIsCalendarOpen(true)}
                        className="opacity-70 hover:opacity-100 transition-all hover:scale-110"
                    >
                        <i className="fa-solid fa-calendar-days" />
                    </button>

                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="opacity-70 hover:opacity-100 transition-all hover:scale-110"
                    >
                        <i className="fa-solid fa-magnifying-glass" />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="opacity-70 hover:opacity-100 transition-all hover:scale-110"
                        >
                            <i className="fa-solid fa-bell" />
                        </button>

                        {globalStats.unreadMessages > 0 && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF4F4F] rounded-full border-2 border-slate-900" />
                        )}
                    </div>

                    <div className="flex items-center gap-3 pl-6 border-l border-white/20">
                        <div className="text-right hidden md:block">
                            <p className="text-xs font-bold leading-none">{userName}</p>
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center">
                            <img
                                src={`https://ui-avatars.com/api/?name=${userName}&background=00E5FF&color=000`}
                                alt="User"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-8 md:p-16 scroll-smooth">
                <header className="mb-12">
                    <h1 className="text-white text-3xl md:text-4xl font-light mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Olá,{" "}
                        <span className="font-bold text-[#00E5FF]">
                            {userName}!
                        </span>
                    </h1>

                    <p className="text-white/80 text-xl font-light animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        Em que nós vamos trabalhar hoje?
                    </p>
                </header>

                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 w-full">
                        {departments.map((dept, index) => {
                            const stats = allDeptStats[dept.name] || {
                                open: 0,
                                unread: 0,
                            };

                            return (
                                <button
                                    key={dept.id}
                                    onClick={() => setSelectedDept(dept)}
                                    className={`
                                        ${getDeptColor(dept.name)}
                                        aspect-square rounded-[1.6rem] p-5 text-white
                                        flex flex-col justify-between items-start
                                        transition-all duration-300
                                        hover:scale-105
                                        hover:shadow-[0_20px_60px_rgba(0,0,0,0.45)]
                                        hover:ring-2 hover:ring-[#00E5FF]
                                        group animate-in fade-in zoom-in-95
                                    `}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="w-full flex justify-between items-start">
                                        <i
                                            className={`fa-solid ${getDeptIconClass(
                                                dept.name
                                            )} text-2xl opacity-80`}
                                        />

                                        {stats.open > 0 && (
                                            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest">
                                                {stats.open} ABERTOS
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <span className="block text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">
                                            {dept.name}
                                        </span>

                                        <span className="block text-[9px] font-bold opacity-50 uppercase tracking-widest group-hover:opacity-100 transition-opacity">
                                            {stats.unread > 0 ? (
                                                <span className="text-[#00E5FF]">
                                                    {stats.unread} Pendentes
                                                </span>
                                            ) : (
                                                "Tudo em dia"
                                            )}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="w-full lg:w-96 flex flex-col gap-6">
                        <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-white/60 flex flex-col animate-in fade-in slide-in-from-right-4 duration-700">
                            <div className="p-10">
                                <div className="flex items-start justify-between gap-4 mb-8">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#22C55E] mb-2.5">
                                            Central de Atendimento
                                        </p>

                                        <h3 className="text-slate-900 text-2xl font-black leading-tight tracking-tighter">
                                            JLVIANA <span className="text-[#22C55E]">Conecta+</span>
                                        </h3>
                                    </div>

                                    <div className="w-14 h-14 rounded-[1.25rem] bg-emerald-50 text-[#22C55E] flex items-center justify-center shadow-inner">
                                        <i className="fa-brands fa-whatsapp text-3xl" />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-[#16A34A] via-[#10B981] to-[#059669] rounded-[2rem] p-7 text-white shadow-[0_20px_40px_-10px_rgba(22,163,74,0.3)] relative overflow-hidden">
                                    {/* Decorative circles */}
                                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                                    <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl" />

                                    <div className="relative z-10 flex items-center justify-between mb-10">
                                        <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                                            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                                            Conexão Ativa
                                        </span>

                                        <span className="text-[9px] font-bold text-white/80 tracking-widest uppercase">
                                            Sync: {globalStats.lastUpdate}
                                        </span>
                                    </div>

                                    <div className="relative z-10 grid grid-cols-3 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[8px] opacity-70 uppercase font-black tracking-widest">
                                                Abertas
                                            </p>
                                            <p className="text-3xl font-black tracking-tighter">
                                                {globalStats.openConversations}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <p className="text-[8px] opacity-70 uppercase font-black tracking-widest">
                                                Aguardando
                                            </p>
                                            <p className="text-3xl font-black tracking-tighter text-emerald-100">
                                                {globalStats.waitingResponse}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <p className="text-[8px] opacity-70 uppercase font-black tracking-widest">
                                                Não Lidas
                                            </p>
                                            <p className="text-3xl font-black tracking-tighter text-white">
                                                {globalStats.unreadMessages}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-10 pb-10 flex flex-col gap-5">
                                <div className="flex items-center gap-4 rounded-2xl bg-slate-50/50 border border-slate-100 p-4 transition-colors hover:bg-slate-50">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100 shrink-0">
                                        <i className="fa-solid fa-rotate-right text-sm animate-[spin_3s_linear_infinite]" />
                                    </div>

                                    <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                                        Sincronização em tempo real ativa. Próximo ciclo em <span className="text-emerald-600 font-bold">30s</span>.
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate("/chat")}
                                    className="group w-full py-5 bg-[#16A34A] text-white font-black rounded-2xl hover:bg-[#15803D] transition-all uppercase text-[11px] tracking-[0.2em] shadow-[0_12px_24px_-8px_rgba(22,163,74,0.5)] hover:shadow-[0_16px_32px_-8px_rgba(22,163,74,0.6)] hover:scale-[1.02] flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    <span>Abrir Central de Chat</span>
                                    <i className="fa-solid fa-arrow-right-long transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {isSearchOpen && (
                    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-xl p-8 md:p-24 animate-in fade-in duration-300">
                        <div className="max-w-4xl mx-auto w-full">
                            <div className="flex justify-between items-center mb-12">
                                <h2 className="text-white text-2xl font-light uppercase tracking-[0.3em]">
                                    Busca Global
                                </h2>

                                <button
                                    onClick={() => {
                                        setIsSearchOpen(false);
                                        setSearchQuery("");
                                    }}
                                    className="text-white/50 hover:text-white transition-colors"
                                >
                                    <i className="fa-solid fa-xmark text-3xl" />
                                </button>
                            </div>

                            <input
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "Enter" &&
                                        filteredItems.length > 0
                                    ) {
                                        handleSearchNavigate(filteredItems[0].path);
                                    }
                                }}
                                placeholder="O que você procura? (ex: clientes, conversas...)"
                                className="w-full bg-transparent border-b-2 border-white/20 py-6 text-4xl md:text-6xl text-white font-light focus:outline-none focus:border-[#00E5FF] transition-all placeholder:text-white/10"
                            />

                            <div className="mt-16">
                                <p className="text-[#00E5FF] uppercase text-[10px] tracking-widest font-black mb-8 opacity-60">
                                    Resultados e Atalhos
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {filteredItems.length > 0 ? (
                                        filteredItems.map((item) => (
                                            <button
                                                key={item.path}
                                                onClick={() =>
                                                    handleSearchNavigate(item.path)
                                                }
                                                className="p-8 border border-white/10 rounded-3xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all hover:scale-105 group text-left"
                                            >
                                                <i
                                                    className={`fa-solid ${item.icon} text-2xl mb-4 block text-white/40 group-hover:text-[#00E5FF] transition-colors`}
                                                />

                                                <span className="text-white font-bold text-sm tracking-tight">
                                                    {item.label}
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-12 text-center text-white/20 text-xl font-light">
                                            Nenhum módulo encontrado para "
                                            {searchQuery}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isNotifOpen && (
                    <div className="fixed top-20 right-8 w-80 md:w-96 bg-white rounded-3xl shadow-2xl z-[120] border border-gray-100 overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
                                Notificações Recentes
                            </h3>

                            <span className="bg-[#0077C8] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {notifications.length} Novas
                            </span>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                notifications.map((notif, i) => (
                                    <div
                                        key={i}
                                        className="p-6 hover:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs ${notif.color ||
                                                    "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                {notif.from?.[0] || "?"}
                                            </div>

                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-gray-900 group-hover:text-[#0077C8] transition-colors">
                                                    {notif.from || "Cliente"} enviou uma
                                                    nova mensagem
                                                </p>

                                                <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">
                                                    "{notif.msg || "Mensagem recebida"}"
                                                </p>

                                                <p className="text-[9px] text-gray-300 mt-2 uppercase tracking-widest font-black">
                                                    Recebido às {notif.time || "--:--"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-gray-300">
                                    <i className="fa-solid fa-check-double text-2xl mb-2 block opacity-20" />

                                    <p className="text-[10px] font-black uppercase tracking-widest">
                                        Sem novas notificações
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => navigate("/chat")}
                            className="w-full p-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#0077C8] hover:bg-cyan-50 transition-colors"
                        >
                            Ver Todas as Conversas
                        </button>
                    </div>
                )}

                {isCalendarOpen && (
                    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-[3rem] p-12 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-300">
                            <button
                                onClick={() => setIsCalendarOpen(false)}
                                className="absolute top-8 right-8 text-gray-300 hover:text-gray-900"
                            >
                                <i className="fa-solid fa-xmark text-2xl" />
                            </button>

                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-8">
                                Resumo Operacional JLVIANA
                            </h3>

                            <div className="space-y-6">
                                <div className="p-6 bg-[#0077C8]/5 rounded-[2rem] border border-[#0077C8]/10 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[#0077C8] mb-2">
                                            Conversas em Aberto
                                        </p>

                                        <p className="text-sm font-bold text-gray-900">
                                            {globalStats.openConversations} conversas
                                            ativas no atendimento
                                        </p>

                                        <p className="text-[10px] text-gray-400 mt-1">
                                            Baseado nas conversas com status ativo.
                                        </p>
                                    </div>

                                    <i className="fa-solid fa-comments absolute -right-2 -bottom-2 text-[#0077C8]/10 text-6xl" />
                                </div>

                                <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-2">
                                            Aguardando Resposta
                                        </p>

                                        <p className="text-sm font-bold text-gray-900">
                                            {globalStats.waitingResponse} clientes com
                                            mensagens pendentes
                                        </p>

                                        <p className="text-[10px] text-amber-800/60 mt-1">
                                            Calculado com base nas conversas com
                                            notificações em aberto.
                                        </p>
                                    </div>

                                    <i className="fa-solid fa-user-clock absolute -right-2 -bottom-2 text-amber-200/30 text-6xl" />
                                </div>

                                <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-2">
                                            Mensagens Não Lidas
                                        </p>

                                        <p className="text-sm font-bold text-gray-900">
                                            {globalStats.unreadMessages} mensagens
                                            pendentes de leitura
                                        </p>

                                        <p className="text-[10px] text-emerald-800/60 mt-1">
                                            Última atualização às{" "}
                                            {globalStats.lastUpdate}.
                                        </p>
                                    </div>

                                    <i className="fa-solid fa-bell absolute -right-2 -bottom-2 text-emerald-200/30 text-6xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {selectedDept && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
                        <div
                            className={`${getDeptColor(
                                selectedDept.name
                            )} w-full md:w-1/3 p-12 text-white flex flex-col justify-between`}
                        >
                            <div>
                                <i
                                    className={`fa-solid ${getDeptIconClass(
                                        selectedDept.name
                                    )} text-3xl`}
                                />

                                <h2 className="text-3xl font-black mt-6 uppercase leading-tight">
                                    {selectedDept.name}
                                </h2>

                                <p className="opacity-75 text-sm mt-4 font-light leading-relaxed">
                                    Monitoramento estratégico de performance e métricas de atendimento.
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedDept(null)}
                                className="mt-8 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                            >
                                Fechar
                            </button>
                        </div>

                        <div className="flex-1 p-12 overflow-y-auto max-h-[80vh] custom-scrollbar bg-white">
                            {loadingStats ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                                    <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4" />

                                    <p className="text-xs font-black uppercase tracking-widest">
                                        Carregando Controle Real-time...
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-6 mb-12">
                                        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-2">
                                                Total Atendimentos
                                            </p>

                                            <p className="text-4xl font-black text-gray-900">
                                                {deptStats?.totalAtendimentos || 0}
                                            </p>
                                        </div>

                                        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-2">
                                                Mensagens Enviadas
                                            </p>

                                            <p className="text-4xl font-black text-[#0077C8]">
                                                {deptStats?.totalMensagens || 0}
                                            </p>
                                        </div>

                                        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 col-span-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-2">
                                                        Consultor Destaque
                                                    </p>

                                                    <p className="text-2xl font-black text-gray-900">
                                                        {deptStats?.topUser ||
                                                            "Nenhum Ativo"}
                                                    </p>
                                                </div>

                                                <div className="w-12 h-12 bg-cyan-100 rounded-2xl flex items-center justify-center text-[#0077C8]">
                                                    <i className="fa-solid fa-trophy text-xl" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-6">
                                        Atendimentos Recentes
                                    </h4>

                                    <div className="space-y-4">
                                        {deptStats?.recentServices &&
                                            deptStats.recentServices.length > 0 ? (
                                            deptStats.recentServices.map(
                                                (service, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-cyan-200 transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs uppercase">
                                                                {service.name?.[0] || "?"}
                                                            </div>

                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900 leading-none">
                                                                    {service.name ||
                                                                        "Atendimento sem nome"}
                                                                </p>

                                                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">
                                                                    Assumido por:{" "}
                                                                    <span className="text-[#0077C8]">
                                                                        {service.assigned_to ||
                                                                            "Pendente"}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() =>
                                                                navigate("/chat")
                                                            }
                                                            className="px-4 py-2 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-lg group-hover:bg-[#0077C8] group-hover:text-white transition-all"
                                                        >
                                                            Ver no Chat
                                                        </button>
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <div className="py-12 text-center text-gray-300">
                                                <i className="fa-solid fa-inbox text-4xl mb-4 block opacity-20" />

                                                <p className="text-[10px] font-black uppercase tracking-widest">
                                                    Nenhum atendimento neste setor
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;