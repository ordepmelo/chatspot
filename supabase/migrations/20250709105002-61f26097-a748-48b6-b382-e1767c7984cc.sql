-- Criar inbox padrão do WhatsApp se não existir
INSERT INTO public.inboxes (name, channel_type, account_id)
SELECT 'WhatsApp Principal', 'whatsapp', '00000000-0000-0000-0000-000000000000'
WHERE NOT EXISTS (
    SELECT 1 FROM public.inboxes 
    WHERE channel_type = 'whatsapp' 
    AND account_id = '00000000-0000-0000-0000-000000000000'
);