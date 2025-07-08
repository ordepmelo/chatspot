-- Permitir INSERT e UPDATE em conversas
CREATE POLICY "Users can insert conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update conversations" 
ON public.conversations 
FOR UPDATE 
USING (true);

-- Permitir INSERT em mensagens
CREATE POLICY "Users can insert messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (true);

-- Criar conta padrão se não existir
INSERT INTO public.accounts (id, name) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Conta Padrão')
ON CONFLICT (id) DO NOTHING;

-- Criar inbox padrão do WhatsApp se não existir
INSERT INTO public.inboxes (id, name, channel_type, account_id) 
VALUES ('11111111-1111-1111-1111-111111111111', 'WhatsApp Padrão', 'whatsapp', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;