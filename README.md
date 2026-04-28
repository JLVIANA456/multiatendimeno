# JLConecta+ • Inteligência em Atendimento e Conexões

JLConecta+ é uma plataforma profissional de multiatendimento, projetada para unificar diversos canais de comunicação (WhatsApp, Instagram, WebChat) em um único dashboard inteligente. Desenvolvida com as tecnologias mais modernas do ecossistema React, a plataforma oferece uma experiência de usuário (UX) premium com foco em performance, agilidade e branding corporativo.

## 🚀 Funcionalidades Principais

- **Multiatendimento em Tempo Real**: Gerencie várias conversas simultaneamente com atualizações instantâneas via Supabase Realtime.
- **Divisão por Departamentos**: Organize sua equipe em setores (Financeiro, Comercial, Suporte, etc.) com visibilidade restrita e controle de atribuição de chats.
- **Dashboard de Performance**: Acompanhe o fluxo de mensagens, crescimento semanal e eficiência da equipe através de indicadores dinâmicos e carrosséis interativos.
- **Gestão de Canais**: Conecte múltiplos números de WhatsApp e outras plataformas de forma centralizada e intuitiva.
- **Transferência de Chat**: Encaminhe atendimentos entre consultores ou setores diferentes com facilidade para otimizar o fluxo de trabalho.
- **Interface Premium**: Design moderno com suporte para Dark Mode (Modo Escuro), animações suaves e componentes de alta performance.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React.js](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Backend & Realtime**: [Supabase](https://supabase.com/)
- **Estilização**: [Styled-Components](https://styled-components.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Animações**: [Framer Motion](https://www.framer.com/motion/)
- **Roteamento**: [React Router Dom](https://reactrouter.com/)

## 📦 Estrutura do Projeto

- `/src/common`: Componentes reutilizáveis, hooks customizados, temas e definições de tipos.
- `/src/pages`: Páginas centrais da aplicação (Dashboard, Chat, Login, Gestão de Clientes, Configurações).
- `/src/context`: Gerenciamento de estado global (Autenticação, Dados do Chat e Preferências).
- `/src/lib`: Configurações de serviços externos e integração com Supabase.

## ⚙️ Como Executar

Siga os passos abaixo para rodar a aplicação em seu ambiente local:

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/JLVIANA456/multiatendimeno.git
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto com as suas credenciais do Supabase:
   ```env
   REACT_APP_SUPABASE_URL=sua_url_do_supabase
   REACT_APP_SUPABASE_ANON_KEY=sua_chave_anon_key
   ```

4. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm start
   ```

## 🎨 Temas e Personalização

A aplicação suporta nativamente os modos **Claro (Light)** e **Escuro (Dark)**. O estado do tema é gerenciado via Context API e pode ser facilmente personalizado ou expandido através das definições em `src/common/theme`.

## 🛡️ Segurança

O **JLConecta+** utiliza as melhores práticas de segurança oferecidas pelo Supabase (RLS - Row Level Security) para garantir que cada consultor tenha acesso apenas aos dados e conversas permitidos pelo seu nível de permissão ou departamento.

---
Desenvolvido por **JLVIANA Consultoria** • 2024
