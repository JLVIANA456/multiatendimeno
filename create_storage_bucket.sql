-- ============================================================
-- EXECUTAR ESTE SCRIPT NO SUPABASE SQL EDITOR
-- Dashboard > Project > SQL Editor > New Query
-- URL: https://supabase.com/dashboard/project/mciqvnyaargmcmweumnl/sql/new
-- ============================================================

-- 1. Cria o bucket de anexos do chat (se não existir)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, allowed_mime_types)
VALUES (
    'chat-attachments',
    'chat-attachments',
    true,      -- bucket PÚBLICO (acesso de leitura sem autenticação)
    false,
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        'application/zip',
        'application/x-zip-compressed'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- 2. Política: usuários autenticados podem fazer UPLOAD
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-attachments');

-- 3. Política: qualquer pessoa pode LER os arquivos (público)
CREATE POLICY "Public read access for chat-attachments"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'chat-attachments');

-- 4. Política: usuários autenticados podem DELETAR seus próprios arquivos
CREATE POLICY "Authenticated users can delete attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'chat-attachments');

-- Verificar se o bucket foi criado
SELECT id, name, public, allowed_mime_types FROM storage.buckets WHERE id = 'chat-attachments';
