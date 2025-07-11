-- Adicionar campos para urgente, fixado e data de fechamento nas conversas
ALTER TABLE public.conversations 
ADD COLUMN urgent boolean DEFAULT false,
ADD COLUMN pinned boolean DEFAULT false,
ADD COLUMN closed_at timestamp with time zone DEFAULT null;