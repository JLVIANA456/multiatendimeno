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
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 py-12 selection:bg-primary-100 font-sans font-light overflow-y-auto">
            <div className="w-full max-w-lg">
                {/* Branding */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-primary-400 to-primary-600 rounded-[2rem] shadow-xl shadow-primary-100 mb-8">
                        <i className="fa-solid fa-feather-pointed text-white text-2xl"></i>
                    </div>
                    <h1 className="text-4xl font-light text-gray-900 tracking-tight mb-3">JL<span className="font-normal">Conecta+</span></h1>
                    <p className="text-gray-400 font-light text-sm italic tracking-wide">A arte de conectar pessoas e negócios</p>
                </div>

                <div className="bg-gray-50/50 p-10 rounded-[3rem] border border-gray-50 flex flex-col items-stretch shadow-sm">
                    {/* Tabs (Hidden if in Forgot mode) */}
                    {activeTab !== 'forgot' && (
                        <div className="flex bg-white rounded-2xl p-1 mb-10 shadow-sm border border-gray-50">
                            <button 
                                onClick={() => setActiveTab('login')}
                                className={`flex-1 py-3 px-6 rounded-xl font-light text-sm transition-all duration-300 ${activeTab === 'login' ? 'bg-primary-500 text-white shadow-lg shadow-primary-200' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Acesso
                            </button>
                            <button 
                                onClick={() => setActiveTab('cadastro')}
                                className={`flex-1 py-3 px-6 rounded-xl font-light text-sm transition-all duration-300 ${activeTab === 'cadastro' ? 'bg-primary-500 text-white shadow-lg shadow-primary-200' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Cadastro
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="mb-8 p-4 bg-red-50/50 border border-red-50 text-red-500 text-xs font-light rounded-2xl flex items-center animate-pulse">
                            <i className="fa-solid fa-circle-exclamation mr-3"></i>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-8 p-4 bg-green-50/50 border border-green-50 text-green-600 text-xs font-light rounded-2xl flex items-center animate-in fade-in slide-in-from-top-4 duration-500">
                            <i className="fa-solid fa-circle-check mr-3"></i>
                            {success}
                        </div>
                    )}

                    {activeTab === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-normal text-gray-700 uppercase tracking-[0.2em] ml-4">Email Corporativo</label>
                                <div className="relative">
                                    <i className="fa-solid fa-envelope absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                                    <input 
                                        type="email" 
                                        placeholder="seu@email.com" 
                                        className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-200 text-sm font-normal text-gray-800 transition-all placeholder:text-gray-300"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>


                            <div className="space-y-2">
                                <label className="text-[10px] font-normal text-gray-700 uppercase tracking-[0.2em] ml-4">Senha Segura</label>
                                <div className="relative">
                                    <i className="fa-solid fa-lock absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="••••••••" 
                                        className="w-full pl-14 pr-14 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-200 text-sm font-normal text-gray-800 transition-all placeholder:text-gray-300" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        required
                                    />

                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-400 transition-colors"
                                    >
                                        <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} text-xs`}></i>
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-2 pt-2">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-200 text-primary-500 focus:ring-primary-50" />
                                    <span className="text-xs font-normal text-gray-600">Lembrar acesso</span>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => setActiveTab('forgot')}
                                    className="text-xs font-normal text-primary-500 hover:underline"
                                >
                                    Esqueci a senha
                                </button>
                            </div>
                            <button 
                                type="submit" 
                                className="w-full py-4 mt-4 bg-gray-900 text-white font-normal text-sm rounded-2xl hover:bg-black transition-all duration-300 shadow-xl shadow-gray-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? 'Processando...' : 'Entrar no Workspace'}
                            </button>


                        </form>
                    )}

                    {activeTab === 'cadastro' && (
                        <form onSubmit={handleRegister} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                             <div className="space-y-2">
                                <label className="text-[10px] font-normal text-gray-700 uppercase tracking-[0.2em] ml-4">Nome Completo</label>
                                <div className="relative">
                                    <i className="fa-solid fa-user absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                                    <input 
                                        type="text" 
                                        placeholder="Seu nome" 
                                        className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-200 text-sm font-normal text-gray-800 transition-all placeholder:text-gray-300"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={loading}
                                        required
                                    />

                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-normal text-gray-700 uppercase tracking-[0.2em] ml-4">Email Corporativo</label>
                                <div className="relative">
                                    <i className="fa-solid fa-envelope absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                                    <input 
                                        type="email" 
                                        placeholder="seu@empresa.com" 
                                        className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-200 text-sm font-normal text-gray-800 transition-all placeholder:text-gray-300"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        required
                                    />

                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-normal text-gray-700 uppercase tracking-[0.2em] ml-4">Atribuição de Setor</label>
                                <div className="relative">
                                    <i className="fa-solid fa-building-user absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xs text-[12px]"></i>
                                    <select 
                                        className="w-full pl-14 pr-10 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-200 text-sm font-normal text-gray-800 transition-all appearance-none cursor-pointer"
                                        value={selectedDept}
                                        onChange={(e) => setSelectedDept(e.target.value)}
                                        disabled={loading}
                                        required
                                    >
                                        <option value="" disabled>Escolha seu departamento...</option>
                                        {depts.map((d) => (
                                            <option key={d.id} value={d.id} className="text-gray-900">{d.name}</option>
                                        ))}
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 text-[10px] pointer-events-none"></i>
                                </div>
                            </div>


                            <div className="space-y-2">
                                <label className="text-[10px] font-normal text-gray-700 uppercase tracking-[0.2em] ml-4">Criar Senha</label>
                                <div className="relative">
                                    <i className="fa-solid fa-lock absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                                    <input 
                                        type="password" 
                                        placeholder="No mínimo 8 caracteres" 
                                        className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-200 text-sm font-normal text-gray-800 transition-all placeholder:text-gray-300"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        required
                                    />

                                </div>
                            </div>
                            <button 
                                type="submit" 
                                className="w-full py-4 mt-4 bg-primary-500 text-white font-normal text-sm rounded-2xl hover:bg-primary-600 transition-all duration-300 shadow-xl shadow-primary-200 transform hover:-translate-y-0.5 disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Criando conta...' : 'Criar Minha Conta'}
                            </button>


                        </form>
                    )}

                    {activeTab === 'forgot' && (
                        <form onSubmit={handleForgot} className="space-y-6 animate-in zoom-in-95 duration-500">
                             <div className="mb-4">
                                <h3 className="text-gray-900 font-normal text-lg mb-2">Esqueceu a senha?</h3>
                                <p className="text-gray-500 text-xs leading-relaxed">Não se preocupe! Insira seu e-mail abaixo e enviaremos as instruções para você criar uma nova senha.</p>
                             </div>

                             <div className="space-y-2">
                                <label className="text-[10px] font-normal text-gray-700 uppercase tracking-[0.2em] ml-4">E-mail Cadastrado</label>
                                <div className="relative">
                                    <i className="fa-solid fa-envelope absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                                    <input 
                                        type="email" 
                                        placeholder="seu@email.com" 
                                        className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-200 text-sm font-normal text-gray-800 transition-all placeholder:text-gray-300"
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
                                className="w-full py-4 bg-gray-900 text-white font-normal text-sm rounded-2xl hover:bg-black transition-all duration-300 shadow-xl shadow-gray-200 disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                            </button>


                                <button 
                                    type="button" 
                                    onClick={() => setActiveTab('login')}
                                    className="text-xs font-normal text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Voltar para o Login
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-12 pt-8 border-t border-gray-50 text-center">
                        <p className="text-xs font-light text-gray-300">
                            JLConecta+ v3.0 • 2024
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
