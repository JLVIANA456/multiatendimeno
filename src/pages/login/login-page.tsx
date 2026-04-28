import React, { useState, useEffect } from "react";

import { supabase } from "../../lib/supabase";


interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'cadastro' | 'forgot'>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);


    const [selectedDept, setSelectedDept] = useState('');
    const [depts, setDepts] = useState<any[]>([]);

    // Busca departamentos reais do escritório
    useEffect(() => {
        const fetchDepts = async () => {
            const { data } = await supabase.from('departments').select('*');
            if (data) setDepts(data);
        };
        fetchDepts();
    }, []);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            onLogin();
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar login');
            setTimeout(() => setError(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDept) {
            setError('Por favor, selecione seu departamento.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        department_id: selectedDept, // Vínculo automático
                    }
                }
            });

            if (error) throw error;

            setSuccess('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
            setTimeout(() => {
                setSuccess('');
                setActiveTab('login');
            }, 5000);
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar cadastro');
        } finally {
            setLoading(false);
        }
    };


    const handleForgot = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password',
            });

            if (error) throw error;

            setSuccess('Link de recuperação enviado para o seu e-mail.');
            setTimeout(() => {
                setSuccess('');
                setActiveTab('login');
            }, 4000);
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar e-mail de recuperação');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#FDFDFD] flex font-sans selection:bg-primary-100 overflow-hidden">
            {/* Lado Esquerdo: Visual & Branding */}
            <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gray-900">
                {/* Imagem de Fundo de Alta Qualidade */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[10000ms] hover:scale-110"
                    style={{
                        backgroundImage: "url('/tela%20de%20login.png')",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent" />
                </div>

                {/* Conteúdo do Lado Esquerdo */}
                <div className="relative z-10 w-full h-full flex flex-col justify-between p-16">
                    <div>
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8">
                            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                            <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">SISTEMA ATIVO</span>
                        </div>

                        <h2 className="text-6xl font-black text-white leading-tight tracking-tighter mb-6">
                            JL<span className="text-primary-500">VIANA</span><br />
                            <span className="font-light italic text-white/90">Conecta+</span>
                        </h2>

                        <div className="w-20 h-1 bg-primary-500 rounded-full mb-12" />

                        <p className="text-xl text-white/60 font-light max-w-md leading-relaxed">
                            A arte de conectar pessoas e negócios através de um ecossistema digital inteligente.
                        </p>
                    </div>

                    <div className="flex items-center gap-12">
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold text-white mb-1"></span>
                            <span className="text-[10px] text-white/40 uppercase tracking-widest"></span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold text-white mb-1"></span>
                            <span className="text-[10px] text-white/40 uppercase tracking-widest"></span>
                        </div>
                    </div>
                </div>

                {/* Efeito Decorativo */}
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-500/20 rounded-full blur-[100px]" />
            </div>

            {/* Lado Direito: Formulário */}
            <div className="w-full lg:w-2/5 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-20 relative bg-white">
                <div className="w-full max-w-[440px]">
                    {/* Logo Mobile */}
                    <div className="lg:hidden text-center mb-12">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">
                            JL<span className="text-primary-500">VIANA</span>
                        </h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Conecta+</p>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
                            {activeTab === 'login' ? 'Bem-vindo ao JLVIANA Conecta+' : activeTab === 'cadastro' ? 'Crie sua conta' : 'Recuperar senha'}
                        </h3>
                        <p className="text-gray-400 text-sm font-light">
                            {activeTab === 'login' ? 'Insira suas credenciais para acessar o workspace.' : activeTab === 'cadastro' ? 'Preencha os dados abaixo para começar.' : 'Enviaremos um link para o seu e-mail cadastrado.'}
                        </p>
                    </div>

                    {/* Tabs */}
                    {activeTab !== 'forgot' && (
                        <div className="flex bg-gray-50 p-1 rounded-2xl mb-10 border border-gray-100">
                            <button
                                onClick={() => setActiveTab('login')}
                                className={`flex-1 py-3 px-6 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all duration-300 ${activeTab === 'login' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setActiveTab('cadastro')}
                                className={`flex-1 py-3 px-6 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all duration-300 ${activeTab === 'cadastro' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Registro
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 text-red-500 text-[11px] font-bold uppercase tracking-wider rounded-2xl flex items-center border border-red-100 animate-in fade-in slide-in-from-top-2">
                            <i className="fa-solid fa-circle-exclamation mr-3"></i>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-8 p-4 bg-emerald-50 text-emerald-600 text-[11px] font-bold uppercase tracking-wider rounded-2xl flex items-center border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                            <i className="fa-solid fa-circle-check mr-3"></i>
                            {success}
                        </div>
                    )}

                    {activeTab === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email</label>
                                <div className="relative group">
                                    <i className="fa-solid fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-xs transition-colors group-focus-within:text-primary-500"></i>
                                    <input
                                        type="email"
                                        placeholder="seu@email.com"
                                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-50/50 focus:bg-white focus:border-primary-200 text-sm font-medium text-gray-800 transition-all placeholder:text-gray-300"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Senha</label>
                                <div className="relative group">
                                    <i className="fa-solid fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-xs transition-colors group-focus-within:text-primary-500"></i>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-14 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-50/50 focus:bg-white focus:border-primary-200 text-sm font-medium text-gray-800 transition-all placeholder:text-gray-300"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary-500 transition-colors"
                                    >
                                        <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} text-xs`}></i>
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-50 transition-all" />
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-600">Lembrar</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('forgot')}
                                    className="text-[11px] font-black text-primary-600 uppercase tracking-wider hover:text-primary-700 hover:underline"
                                >
                                    Esqueci a senha
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 mt-2 bg-primary-500 text-white font-bold text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-600 transition-all duration-300 shadow-xl shadow-primary-200 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <i className="fa-solid fa-circle-notch animate-spin"></i>
                                        <span>Processando</span>
                                    </div>
                                ) : 'Entrar no Sistema'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'cadastro' && (
                        <form onSubmit={handleRegister} className="space-y-5 animate-in slide-in-from-right-4 duration-500">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nome Completo</label>
                                <div className="relative group">
                                    <i className="fa-solid fa-user absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-xs transition-colors group-focus-within:text-primary-500"></i>
                                    <input
                                        type="text"
                                        placeholder="Seu nome"
                                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-50/50 focus:bg-white focus:border-primary-200 text-sm font-medium text-gray-800 transition-all placeholder:text-gray-300"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email</label>
                                <div className="relative group">
                                    <i className="fa-solid fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-xs transition-colors group-focus-within:text-primary-500"></i>
                                    <input
                                        type="email"
                                        placeholder="seu@empresa.com"
                                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-50/50 focus:bg-white focus:border-primary-200 text-sm font-medium text-gray-800 transition-all placeholder:text-gray-300"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Departamento</label>
                                <div className="relative group">
                                    <i className="fa-solid fa-building-user absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-xs transition-colors group-focus-within:text-primary-500"></i>
                                    <select
                                        className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-50/50 focus:bg-white focus:border-primary-200 text-sm font-medium text-gray-800 transition-all appearance-none cursor-pointer"
                                        value={selectedDept}
                                        onChange={(e) => setSelectedDept(e.target.value)}
                                        disabled={loading}
                                        required
                                    >
                                        <option value="" disabled>Selecione seu setor...</option>
                                        {depts.map((d) => (
                                            <option key={d.id} value={d.id} className="text-gray-900">{d.name}</option>
                                        ))}
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 text-[10px] pointer-events-none"></i>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Senha</label>
                                <div className="relative group">
                                    <i className="fa-solid fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-xs transition-colors group-focus-within:text-primary-500"></i>
                                    <input
                                        type="password"
                                        placeholder="Mínimo 8 caracteres"
                                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-50/50 focus:bg-white focus:border-primary-200 text-sm font-medium text-gray-800 transition-all placeholder:text-gray-300"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 mt-2 bg-gray-900 text-white font-bold text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all duration-300 shadow-xl shadow-gray-200 transform hover:-translate-y-1 disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Criando conta...' : 'Registrar Acesso'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'forgot' && (
                        <form onSubmit={handleForgot} className="space-y-6 animate-in zoom-in-95 duration-500">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">E-mail Cadastrado</label>
                                <div className="relative group">
                                    <i className="fa-solid fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-xs transition-colors group-focus-within:text-primary-500"></i>
                                    <input
                                        type="email"
                                        placeholder="seu@email.com"
                                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-50/50 focus:bg-white focus:border-primary-200 text-sm font-medium text-gray-800 transition-all placeholder:text-gray-300"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-primary-500 text-white font-bold text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-600 transition-all duration-300 shadow-xl shadow-primary-200 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? 'Enviando...' : 'Recuperar Senha'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('login')}
                                    className="text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                                >
                                    Voltar para o Login
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Footer */}
                    <div className="mt-16 pt-8 border-t border-gray-50 flex justify-between items-center">
                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.3em]">
                            JLConecta+ v3.0 • 2026
                        </p>
                        <div className="flex gap-4">
                            <i className="fa-solid fa-shield-halved text-gray-200 text-xs"></i>
                            <i className="fa-solid fa-globe text-gray-200 text-xs"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
