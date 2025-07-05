-- Create accounts table (empresas/organizações)
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create users table (atendentes/agentes)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contacts table (clientes/usuários externos)
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT NOT NULL,
  city TEXT,
  country TEXT,
  biography TEXT,
  company TEXT,
  cnpj TEXT,
  instagram TEXT,
  facebook TEXT,
  linkedin TEXT,
  other_social TEXT,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inboxes table (canais de comunicação)
CREATE TABLE public.inboxes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  channel_type TEXT NOT NULL,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversations table (conversas)
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  inbox_id UUID NOT NULL REFERENCES public.inboxes(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table (mensagens)
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_users_account_id ON public.users(account_id);
CREATE INDEX idx_contacts_account_id ON public.contacts(account_id);
CREATE INDEX idx_inboxes_account_id ON public.inboxes(account_id);
CREATE INDEX idx_conversations_contact_id ON public.conversations(contact_id);
CREATE INDEX idx_conversations_assignee_id ON public.conversations(assignee_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);

-- Create RLS policies (basic policies for authenticated users)
CREATE POLICY "Users can view all accounts" ON public.accounts FOR SELECT USING (true);
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can view all contacts" ON public.contacts FOR SELECT USING (true);
CREATE POLICY "Users can insert contacts" ON public.contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update contacts" ON public.contacts FOR UPDATE USING (true);
CREATE POLICY "Users can view all inboxes" ON public.inboxes FOR SELECT USING (true);
CREATE POLICY "Users can view all conversations" ON public.conversations FOR SELECT USING (true);
CREATE POLICY "Users can view all messages" ON public.messages FOR SELECT USING (true);