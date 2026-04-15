import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

interface MainSidebarProps {
    onLogout: () => void;
}

const MainSidebar: React.FC<MainSidebarProps> = ({ onLogout }) => {
    const { user } = useAuth();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [totalNotifications, setTotalNotifications] = useState(0);

    // Busca total de notificações reais
    useEffect(() => {
        const fetchTotalNotifications = async () => {
            const { data, error } = await supabase
                .from('conversas')
                .select('notifications_count');
            
            if (error) return;
            
            const total = data.reduce((acc, curr) => acc + (curr.notifications_count || 0), 0);
            setTotalNotifications(total);
        };

        fetchTotalNotifications();

        // Realtime para atualizar o contador global
        const channel = supabase.channel('global-notifications')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversas' }, fetchTotalNotifications)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    // Pegamos o nome do metadata ou usamos o email como fallback
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Usuário";
    const userRole = user?.user_metadata?.role || "Consultor Equipe JL+";

    const menuItems = [
        { path: "/dashboard", icon: "fa-solid fa-house", label: "Dashboard" },
        { path: "/", icon: "fa-solid fa-layer-group", label: "Departamentos" },
        { path: "/channels", icon: "fa-solid fa-sitemap", label: "Canais" },
        { path: "/chat", icon: "fa-solid fa-comments", label: "Conversas", badge: totalNotifications > 0 ? totalNotifications.toString() : undefined },
        { path: "/clients", icon: "fa-solid fa-address-card", label: "Clientes" },
        { path: "/contacts", icon: "fa-solid fa-user-group", label: "Contatos" },
    ];



    const systemItems = [
        { path: "/profile", icon: "fa-solid fa-user-gear", label: "Perfil" },
        { path: "/settings", icon: "fa-solid fa-gear", label: "Configurações" },
    ];


    return (
        <aside 
            className={`bg-white h-screen transition-all duration-500 ease-in-out border-r border-gray-100 flex flex-col shadow-sm relative ${isCollapsed ? "w-20" : "w-72"}`}
        >
            {/* Collapse Toggle */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-10 w-6 h-6 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-primary-500 shadow-sm z-50 transition-transform duration-300"
                style={{ transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)" }}
            >
                <i className="fa-solid fa-chevron-left text-[10px]"></i>
            </button>

            {/* Header */}
            <div className={`p-8 border-b border-gray-50 flex items-center gap-4 transition-all duration-300 ${isCollapsed ? "justify-center" : ""}`}>
                <div className="w-10 h-10 bg-gradient-to-tr from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200 shrink-0">
                    <i className="fa-solid fa-feather-pointed text-white text-lg"></i>
                </div>
                {!isCollapsed && (
                    <div className="overflow-hidden whitespace-nowrap opacity-100 transition-all duration-500">
                        <h1 className="text-gray-900 font-light text-xl tracking-tight">JL<span className="font-normal">Conecta+</span></h1>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => (
                    <Link 
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                            location.pathname === item.path 
                            ? "bg-primary-50 text-primary-600" 
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        } ${isCollapsed ? "justify-center" : ""}`}
                    >
                        <i className={`${item.icon} text-lg w-6 transition-transform duration-300 group-hover:scale-110 ${
                            location.pathname === item.path ? "text-primary-500" : ""
                        }`}></i>
                        {!isCollapsed && (
                            <span className="font-normal text-sm tracking-wide flex-1">{item.label}</span>
                        )}
                        {!isCollapsed && item.badge && (
                            <span className="bg-primary-500 text-white text-[9px] font-medium px-2 py-0.5 rounded-full shadow-sm">
                                {item.badge}
                            </span>
                        )}
                        {isCollapsed && item.badge && (
                            <div className="absolute top-2 right-4 w-2 h-2 bg-primary-500 rounded-full border-2 border-white"></div>
                        )}
                    </Link>
                ))}

                <div className={`pt-8 pb-4 transition-all duration-300 ${isCollapsed ? "flex justify-center" : "px-4"}`}>
                    {!isCollapsed ? (
                        <p className="text-[10px] font-normal text-gray-700 uppercase tracking-[0.3em]">
                            Sistema
                        </p>
                    ) : (
                        <div className="w-4 h-[1px] bg-gray-200" />
                    )}
                </div>

                {systemItems.map((item) => (
                    <Link 
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                            location.pathname === item.path 
                            ? "bg-primary-50 text-primary-600 font-normal" 
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        } ${isCollapsed ? "justify-center" : ""}`}
                    >
                        <i className={`${item.icon} text-lg w-6 transition-transform duration-300 group-hover:scale-110 ${
                            location.pathname === item.path ? "text-primary-500" : ""
                        }`}></i>
                        {!isCollapsed && (
                            <span className="font-normal text-sm tracking-wide">{item.label}</span>
                        )}
                    </Link>
                ))}
            </nav>

            {/* User Footer */}
            <div className={`p-6 border-t border-gray-50 transition-all duration-300 ${isCollapsed ? "items-center" : ""}`}>
                <div className={`flex items-center gap-4 p-3 rounded-3xl transition-all duration-300 ${isCollapsed ? "justify-center bg-transparent" : "bg-gray-50/50 hover:bg-gray-50 border border-transparent hover:border-gray-100 shadow-sm shadow-gray-100/20"}`}>
                    <div className="relative shrink-0">
                        <img 
                            src={user?.user_metadata?.avatar_url || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                            className="w-10 h-10 rounded-2xl object-cover shadow-sm bg-white p-0.5"
                            alt="Avatar"
                        />

                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                    </div>
                     {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-gray-900 font-normal text-sm truncate tracking-tight">{userName}</p>
                            <p className="text-gray-600 font-normal text-[10px] truncate">{userRole}</p>
                        </div>
                    )}

                    {!isCollapsed && (
                        <button 
                            onClick={onLogout}
                            className="text-gray-400 hover:text-red-400 transition-colors p-1"
                            title="Sair"
                        >
                            <i className="fa-solid fa-door-open text-sm"></i>
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default MainSidebar;

