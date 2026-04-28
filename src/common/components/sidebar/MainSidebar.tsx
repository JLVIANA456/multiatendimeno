import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";
import { useChatContext } from "pages/chat/context/chat";

interface MainSidebarProps {
    onLogout: () => void;
}

const MainSidebar: React.FC<MainSidebarProps> = ({ onLogout }) => {
    const { user } = useAuth();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const { inbox: inboxState } = useChatContext();

    const totalNotifications = (inboxState || []).reduce(
        (acc, curr) => acc + (curr.notificationsCount || 0),
        0
    );

    const userName =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email?.split("@")[0] ||
        "Usuário";

    const userRole = user?.user_metadata?.role || "Consultor JL+";

    const sections = [
        {
            title: "Principal",
            items: [
                {
                    path: "/dashboard",
                    icon: "fa-solid fa-house",
                    label: "Dashboard",
                },
            ],
        },
        {
            title: "Atendimento",
            items: [
                {
                    path: "/",
                    icon: "fa-solid fa-layer-group",
                    label: "Departamentos",
                },
                {
                    path: "/channels",
                    icon: "fa-solid fa-sitemap",
                    label: "Canais",
                },
                {
                    path: "/chat",
                    icon: "fa-solid fa-comments",
                    label: "Conversas",
                    badge:
                        totalNotifications > 0
                            ? totalNotifications.toString()
                            : undefined,
                },
            ],
        },
        {
            title: "Gestão",
            items: [
                {
                    path: "/clients",
                    icon: "fa-solid fa-address-card",
                    label: "Clientes",
                },
                {
                    path: "/contacts",
                    icon: "fa-solid fa-user-group",
                    label: "Contatos",
                },
            ],
        },
        {
            title: "Sistema",
            items: [
                {
                    path: "/profile",
                    icon: "fa-solid fa-user-gear",
                    label: "Perfil",
                },
                {
                    path: "/settings",
                    icon: "fa-solid fa-gear",
                    label: "Configurações",
                },
            ],
        },
    ];

    const isActive = (path: string) => {
        if (path === "/") {
            return location.pathname === "/";
        }

        return location.pathname === path;
    };

    return (
        <aside
            className={`
                h-screen
                bg-[#FCFCFD]
                border-r border-[#E5E7EB]
                flex flex-col
                transition-all duration-300
                relative z-[100]
                font-['Inter']
                ${isCollapsed ? "w-20" : "w-64"}
            `}
        >
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="
                    absolute -right-3 top-8
                    w-7 h-7
                    bg-white
                    border border-[#E5E7EB]
                    rounded-full
                    flex items-center justify-center
                    text-slate-400
                    hover:text-[#D2232A]
                    shadow-md
                    z-50
                    transition-all duration-300
                    hover:scale-110
                "
                style={{
                    transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
                }}
                title={isCollapsed ? "Expandir menu" : "Recolher menu"}
            >
                <i className="fa-solid fa-chevron-left text-[10px]" />
            </button>

            <div
                className={`
                    px-5 py-10
                    flex items-center gap-4
                    transition-all duration-300
                    ${isCollapsed ? "justify-center" : ""}
                `}
            >
                <div
                    className="
                        w-10 h-10
                        bg-[#D2232A]
                        rounded-2xl
                        flex items-center justify-center
                        shadow-lg shadow-[#D2232A]/20
                        shrink-0
                    "
                >
                    <i className="fa-solid fa-feather-pointed text-white text-lg" />
                </div>

                {!isCollapsed && (
                    <div className="overflow-hidden whitespace-nowrap opacity-100 transition-all duration-500">
                        <h1 className="text-[#D2232A] font-black text-xl tracking-tighter uppercase">
                            JLVIANA
                        </h1>

                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] -mt-1">
                            Conecta+
                        </p>
                    </div>
                )}
            </div>

            <nav className="flex-1 px-3 space-y-8 overflow-y-auto custom-scrollbar pb-10">
                {sections.map((section, sectionIndex) => (
                    <div key={section.title} className="space-y-2">
                        {!isCollapsed && (
                            <h3 className="px-5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">
                                {section.title}
                            </h3>
                        )}

                        {isCollapsed && sectionIndex > 0 && (
                            <div className="h-[1px] bg-slate-200 mx-4 mb-4" />
                        )}

                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const active = isActive(item.path);

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        title={isCollapsed ? item.label : undefined}
                                        className={
                                            active
                                                ? `
                                                        flex items-center gap-4 px-5 py-3 rounded-xl
                                                        bg-[#F3F4F6]
                                                        text-[#D2232A]
                                                        font-medium text-[14px]
                                                        relative
                                                    `
                                                : `
                                                        flex items-center gap-4 px-5 py-3 rounded-xl
                                                        text-slate-600
                                                        hover:bg-[#F3F4F6]
                                                        hover:text-slate-900
                                                        transition-all
                                                        font-medium text-[14px]
                                                    `
                                        }
                                    >
                                        {active && (
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#D2232A]" />
                                        )}

                                        <i
                                            className={`
                                                ${item.icon}
                                                text-lg w-6
                                                flex items-center justify-center
                                                transition-all duration-300
                                                ${active
                                                    ? "text-[#D2232A]"
                                                    : "text-slate-500 group-hover:text-slate-700"
                                                }
                                            `}
                                        />

                                        {!isCollapsed && (
                                            <span className="tracking-tight flex-1">
                                                {item.label}
                                            </span>
                                        )}

                                        {item.badge && (
                                            <span
                                                className={`
                                                    ${isCollapsed
                                                        ? "absolute -top-1 -right-1"
                                                        : ""
                                                    }
                                                    bg-green-500
                                                    text-white
                                                    text-[9px]
                                                    font-black
                                                    px-2 py-0.5
                                                    rounded-full
                                                    shadow-lg shadow-green-500/20
                                                `}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="p-6 border-t border-[#E2E8F0]">
                <div
                    className={`
                        flex items-center gap-3
                        p-3 rounded-3xl
                        transition-all duration-300
                        ${isCollapsed
                            ? "justify-center"
                            : "bg-white border border-[#E2E8F0] shadow-sm shadow-slate-200/60"
                        }
                    `}
                >
                    <div className="relative shrink-0">
                        <img
                            src={
                                user?.user_metadata?.avatar_url ||
                                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                    userName
                                )}&backgroundColor=d1d5db&textColor=ffffff`
                            }
                            className="w-10 h-10 rounded-2xl object-cover bg-slate-50 p-0.5 border border-slate-100"
                            alt="Avatar"
                        />

                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                    </div>

                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden">
                            <p className="text-slate-900 font-bold text-[13px] truncate tracking-tight leading-none mb-1">
                                {userName}
                            </p>

                            <p className="text-slate-400 font-medium text-[10px] truncate uppercase tracking-widest">
                                {userRole}
                            </p>
                        </div>
                    )}

                    {!isCollapsed && (
                        <button
                            onClick={onLogout}
                            className="
                                w-8 h-8
                                flex items-center justify-center
                                rounded-xl
                                bg-slate-50
                                text-slate-400
                                hover:bg-[#D2232A]/10
                                hover:text-[#D2232A]
                                transition-all
                            "
                            title="Sair do Sistema"
                        >
                            <i className="fa-solid fa-power-off text-sm" />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default MainSidebar;