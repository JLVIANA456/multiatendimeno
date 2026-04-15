-- 1. PERFIS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'Membro Platinum',
  phone TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Privado" ON public.profiles FOR ALL USING (auth.uid() = id);

-- 2. CONVERSAS (Lista de Chats)
CREATE TABLE IF NOT EXISTS public.conversas (
  key text not null PRIMARY KEY,
  message text null,
  messatype text null,
  name text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  id_canal integer null,
  phone text null,
  lid text null,
  connect_phone text null,
  photo text null,
  from_me boolean null,
  media_url text null,
  assigned_to text null,
  department text null,
  notifications_count integer default 0,
  deleted_at timestamp with time zone null,
  deleted_by uuid null REFERENCES auth.users (id) ON DELETE SET NULL
);
ALTER TABLE public.conversas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Público" ON public.conversas FOR ALL USING (true); -- Ajuste conforme necessidade

-- 3. MENSAGENS
CREATE TABLE IF NOT EXISTS public.mensagens (
  message_id text not null PRIMARY KEY,
  created_at timestamp with time zone not null default now(),
  from_me boolean null,
  message text null,
  phone text null,
  lid text null,
  connected_phone text null,
  messagetype text null,
  from_api boolean null,
  id_canal integer null,
  media_url text null,
  caption text null,
  filename text null
);
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Público" ON public.mensagens FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_mensagens_canal_lid ON public.mensagens (id_canal, lid);

-- 4. CLIENTES E RESPONSÁVEIS
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Privado Clientes" ON public.clients FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.responsibles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.responsibles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Privado Responsáveis" ON public.responsibles FOR ALL USING (auth.uid() = user_id);

-- 5. CANAIS E DEPARTAMENTOS
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'Ativo',
  number TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  members_count INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- 6. GATILHO DE PERFIL
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- SEED DATA (EXEMPLOS)
INSERT INTO public.conversas (key, name, message, photo, updated_at, lid, assigned_to, department)
VALUES 
('1-040723600788', 'Carlos Eduardo', 'Boa tarde! Tudo certo?', 'https://i.pravatar.cc/300?img=11', now(), '040723600788', 'Gabriel', 'Vendas');

-- 7. ETIQUETAS (TAGS)
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL, -- Hex code: #RRGGBB
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversa_tags (
  conversa_key TEXT REFERENCES public.conversas(key) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (conversa_key, tag_id)
);

-- ATUALIZAÇÃO PARA MODELO ESCRITÓRIO COMPARTILHADO (JLVIANA)


-- 1. PERFIS (Público para a equipe)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Privado" ON public.profiles;
DROP POLICY IF EXISTS "Perfil Privado" ON public.profiles;
CREATE POLICY "Acesso Equipe Perfis" ON public.profiles FOR ALL USING (auth.role() = 'authenticated');


-- 2. DEPARTAMENTOS (Compartilhados)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Privado Departments" ON public.departments;
CREATE POLICY "Acesso Equipe Departamentos" ON public.departments FOR ALL USING (auth.role() = 'authenticated');

-- 3. CLIENTES (Compartilhados)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Privado Clients" ON public.clients;
CREATE POLICY "Acesso Equipe Clientes" ON public.clients FOR ALL USING (auth.role() = 'authenticated');

-- 4. RESPONSÁVEIS (Compartilhados)
ALTER TABLE public.responsibles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Privado Responsibles" ON public.responsibles;
CREATE POLICY "Acesso Equipe Responsáveis" ON public.responsibles FOR ALL USING (auth.role() = 'authenticated');

-- 5. CONVERSAS & MENSAGENS (Compartilhadas para colaboração)
ALTER TABLE public.conversas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso Público" ON public.conversas;
CREATE POLICY "Acesso Equipe Conversas" ON public.conversas FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso Público" ON public.mensagens;
CREATE POLICY "Acesso Equipe Mensagens" ON public.mensagens FOR ALL USING (auth.role() = 'authenticated');

-- 6. TAGS (Compartilhadas)
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Privado Tags" ON public.tags;
CREATE POLICY "Acesso Equipe Tags" ON public.tags FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.conversa_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso Público Tags" ON public.conversa_tags;
CREATE POLICY "Acesso Equipe Vínculos Tags" ON public.conversa_tags FOR ALL USING (auth.role() = 'authenticated');


