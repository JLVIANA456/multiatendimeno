import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatar, setAvatar] = useState(user?.user_metadata?.avatar_url || DEFAULT_AVATAR);
    
    // Estados para os campos
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        telefone: "",
        cargo: ""
    });

    useEffect(() => {
        if (user) {
            setFormData({
                nome: user.user_metadata?.full_name || "",
                email: user.email || "",
                telefone: user.user_metadata?.phone || "+55 (11) 98765-4321",
                cargo: user.user_metadata?.role || "Membro Equipe JL+"
            });
            if (user.user_metadata?.avatar_url) {
                setAvatar(user.user_metadata.avatar_url);
            }
        }
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        if (window.confirm("Deseja remover sua foto de perfil?")) {
            setAvatar(DEFAULT_AVATAR);
        }
    };

    const handleSave = async () => {
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: formData.nome,
                    role: formData.cargo,
                    phone: formData.telefone,
                    avatar_url: avatar
                }
            });

            if (error) throw error;
            alert("Alterações salvas com sucesso no Supabase!");
        } catch (err: any) {
            alert("Erro ao salvar: " + err.message);
        }
    };


    const handleDiscard = () => {
        if (window.confirm("Deseja descartar todas as alterações feitas neste formulário?")) {
            setFormData({
                nome: user?.user_metadata?.full_name || "",
                email: user?.email || "",
                telefone: user?.user_metadata?.phone || "+55 (11) 98765-4321",
                cargo: user?.user_metadata?.role || "Membro Equipe JL+"
            });
        }
    };


    return (
        <div className="flex-1 bg-gray-50/30 p-10 overflow-y-auto font-sans font-light">
            <header className="mb-12">
                <h2 className="text-3xl font-light text-gray-900 tracking-tight mb-2">Meu Perfil</h2>
                <p className="text-gray-600 font-normal text-sm italic">Gerencie suas informações pessoais e profissionais</p>
            </header>

            <div className="max-w-4xl mx-auto space-y-12">
                <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 -mr-20 -mt-20 rounded-full blur-3xl"></div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-10 mb-12 relative z-10">
                        <div className="relative group">
                            <img 
                                src={avatar} 
                                alt="Profile" 
                                className="w-32 h-32 rounded-[2.5rem] object-cover shadow-xl shadow-gray-200 border-2 border-white" 
                            />
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <div className="absolute -bottom-2 -right-2 flex gap-2">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-10 h-10 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-primary-500 shadow-md hover:scale-110 transition-transform cursor-pointer"
                                    title="Alterar Foto"
                                >
                                    <i className="fa-solid fa-camera-retro text-sm"></i>
                                </button>
                                {avatar !== DEFAULT_AVATAR && (
                                    <button 
                                        onClick={handleRemovePhoto}
                                        className="w-10 h-10 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-red-500 shadow-md hover:scale-110 transition-transform cursor-pointer"
                                        title="Remover Foto"
                                    >
                                        <i className="fa-solid fa-trash-can text-sm"></i>
                                    </button>
                                )}
                            </div>

                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-normal text-gray-900 mb-1">{formData.nome}</h3>
                            <p className="text-gray-600 font-normal text-sm italic mb-4">{formData.cargo} • Membro Equipe JL+</p>
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <span className="px-4 py-1.5 bg-green-50 text-green-600 text-[10px] font-normal uppercase tracking-widest rounded-full border border-green-100">Online</span>
                                <span className="px-4 py-1.5 bg-primary-50 text-primary-600 text-[10px] font-normal uppercase tracking-widest rounded-full border border-primary-100">Administrador</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        {[
                            { label: "Nome Completo", key: "nome", val: formData.nome, icon: "fa-user" },
                            { label: "Endereço de Email", key: "email", val: formData.email, icon: "fa-envelope" },
                            { label: "Telefone de Contato", key: "telefone", val: formData.telefone, icon: "fa-phone" },
                            { label: "Cargo na Empresa", key: "cargo", val: formData.cargo, icon: "fa-briefcase" },
                        ].map((field) => (
                            <div key={field.label} className="space-y-2">
                                <label className="text-[10px] font-normal text-gray-700 uppercase tracking-widest ml-4">{field.label}</label>
                                <div className="relative">
                                    <i className={`fa-solid ${field.icon} absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xs`}></i>
                                    <input 
                                        type="text" 
                                        value={field.val} 
                                        onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                                        className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-200 text-sm font-normal text-gray-900 transition-all"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 flex justify-end gap-4 relative z-10">
                        <button 
                            onClick={handleDiscard}
                            className="px-8 py-3.5 bg-gray-100 text-gray-700 font-normal text-sm rounded-2xl hover:bg-gray-200 transition-all"
                        >
                            Descartar
                        </button>
                        <button 
                            onClick={handleSave}
                            className="px-10 py-3.5 bg-primary-500 text-white font-normal text-sm rounded-2xl shadow-lg shadow-primary-200 hover:bg-primary-600 transition-all"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </section>

                <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-500 shadow-sm border border-primary-50">
                            <i className="fa-solid fa-lock-open text-xl"></i>
                        </div>
                        <div>
                            <h3 className="text-xl font-normal text-gray-900 mb-1">Trocar Senha</h3>
                            <p className="text-gray-600 font-normal text-sm italic">Atualize suas credenciais de acesso ao sistema</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        {[
                            { label: "Nova Senha", icon: "fa-key", placeholder: "••••••••" },
                            { label: "Confirmar Senha", icon: "fa-shield", placeholder: "••••••••" },
                        ].map((field) => (
                            <div key={field.label} className="space-y-2">
                                <label className="text-[10px] font-normal text-gray-700 uppercase tracking-widest ml-4">{field.label}</label>
                                <div className="relative">
                                    <i className={`fa-solid ${field.icon} absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xs`}></i>
                                    <input 
                                        type="password" 
                                        placeholder={field.placeholder}
                                        className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-200 text-sm font-normal text-gray-900 transition-all placeholder:text-gray-300"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 flex justify-end relative z-10">
                        <button className="px-10 py-3.5 bg-gray-900 text-white font-normal text-sm rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200">
                            Atualizar Senha
                        </button>
                    </div>
                </section>
             </div>
        </div>
    );
};

export default ProfilePage;
