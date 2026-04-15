import React from "react";
import { useDepartments } from "../../common/hooks/useDepartments";
import { Card, Carousel } from "../../components/ui/apple-cards-carousel";

const DashboardPage: React.FC = () => {
    const { departments } = useDepartments();

    // Criamos o conteúdo para o modal (Foco em Performance e Métricas)
    const renderContent = (dept: any) => (
        <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-20 rounded-[3rem] mb-10 border border-gray-100 dark:border-white/5">
            <div className="max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-xs font-bold uppercase tracking-widest mb-10">
                    Setor em Monitoramento Ativo
                </div>
                
                <h3 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-10 tracking-tight leading-tight">
                    Análise de Performance: <br/>
                    <span className="text-primary-600 block mt-2">{dept.name}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="p-8 bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col items-center text-center transition-transform hover:scale-105">
                        <span className="text-5xl font-black text-gray-900 dark:text-white mb-2">{dept.messages || 0}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Atendimentos Hoje</span>
                    </div>
                    <div className="p-8 bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col items-center text-center transition-transform hover:scale-105">
                        <span className="text-5xl font-black text-primary-600 mb-2">{dept.growth || '+0%'}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Crescimento Semanal</span>
                    </div>
                    <div className="p-8 bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col items-center text-center transition-transform hover:scale-105">
                        <span className="text-5xl font-black text-gray-900 dark:text-white mb-2">{dept.members || 0}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Equipe Online</span>
                    </div>
                </div>

                <div className="p-10 bg-primary-600 rounded-[3rem] text-white shadow-2xl shadow-primary-200">
                    <h4 className="text-xl font-bold mb-4 flex items-center gap-3">
                        <i className="fa-solid fa-circle-check"></i>
                        Status JLConecta+
                    </h4>
                    <p className="text-primary-100 text-lg font-light leading-relaxed">
                        O monitoramento em tempo real do setor de {dept.name} indica que o fluxo de atendimento está 
                        dentro dos padrões de excelência JLConecta+. Os consultores estão respondendo em tempo recorde.
                    </p>
                </div>
            </div>
        </div>
    );

    // Mapeamos os departamentos para itens de carrosel
    const cards = departments.map((dept, index) => {
        // Lógica para categorias baseada no nome do departamento
        let category = "PERFORMANCE GERAL";
        const name = dept.name.toLowerCase();
        if (name.includes('fiscal')) category = "ESTRATÉGIA FISCAL";
        else if (name.includes('contábil') || name.includes('contabil')) category = "COMPLEXIDADE";
        else if (name.includes('financeiro')) category = "ESTRATÉGIA FINANCEIRA";
        else if (name.includes('bpo')) category = "ESPECIALIZADO";

        return (
            <Card 
                key={dept.id}
                card={{
                    id: dept.id,
                    category: category,
                    title: dept.name,
                    src: dept.src,
                    content: renderContent(dept),
                }} 
                index={index}
                layout={true}
            />
        );
    });

    return (
        <div className="flex-1 bg-white overflow-x-hidden p-10 overflow-y-auto custom-scrollbar font-sans font-light">
            <header className="mb-0 max-w-7xl mx-auto w-full pt-10 px-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest mb-6">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                    </span>
                    Indicadores Ativos
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-2">JL<span className="text-primary-600">Conecta+</span></h2>
                <p className="text-gray-400 text-lg font-light max-w-2xl leading-relaxed italic">Sua plataforma inteligente de monitoramento e conexões JLVIANA.</p>
            </header>

            {/* Carrosel Apple Style */}
            <div className="w-full -mt-4">
                <Carousel items={cards} />
            </div>

            <section className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 px-8 -mt-4">
                <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-100 group">
                    <div className="w-14 h-14 bg-white group-hover:bg-primary-500 group-hover:text-white rounded-[1.5rem] flex items-center justify-center text-primary-500 shadow-sm mb-8 transition-all">
                        <i className="fa-solid fa-users text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-normal text-gray-900 mb-3">Conexão Ativa</h3>
                    <p className="text-gray-400 text-sm font-light leading-relaxed">Consultores sincronizados com o workspace.</p>
                </div>
                <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-100 group">
                    <div className="w-14 h-14 bg-white group-hover:bg-primary-500 group-hover:text-white rounded-[1.5rem] flex items-center justify-center text-primary-500 shadow-sm mb-8 transition-all">
                        <i className="fa-solid fa-bolt text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-normal text-gray-900 mb-3">Performance</h3>
                    <p className="text-gray-400 text-sm font-light leading-relaxed">Indicadores em tempo real.</p>
                </div>
                <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-100 group">
                    <div className="w-14 h-14 bg-white group-hover:bg-primary-500 group-hover:text-white rounded-[1.5rem] flex items-center justify-center text-primary-500 shadow-sm mb-8 transition-all">
                        <i className="fa-solid fa-shield-check text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-normal text-gray-900 mb-3">Segurança</h3>
                    <p className="text-gray-400 text-sm font-light leading-relaxed">Proteção de dados avançada.</p>
                </div>
            </section>

            <footer className="mt-4 text-center pb-20 border-t border-gray-50 pt-16 max-w-7xl mx-auto w-full">
                <p className="text-[11px] text-gray-300 uppercase tracking-[0.6em] font-medium">JLConecta+ • Inteligência em Atendimento</p>
            </footer>
        </div>
    );
};

export default DashboardPage;
