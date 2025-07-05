-- Insert a default account for the system
INSERT INTO public.accounts (id, name) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Default Account')
ON CONFLICT (id) DO NOTHING;