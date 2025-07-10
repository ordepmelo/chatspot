-- Primeiro, vamos identificar e manter apenas um contato por telefone/email
-- Criar uma tabela temporária com os contatos únicos (mantendo o mais antigo)
CREATE TEMP TABLE unique_contacts AS
SELECT DISTINCT ON (phone, account_id) id, phone, email, account_id, created_at
FROM contacts 
WHERE account_id = '00000000-0000-0000-0000-000000000000'
ORDER BY phone, account_id, created_at ASC;

-- Atualizar conversas para referenciar o contato correto (mais antigo)
UPDATE conversations 
SET contact_id = uc.id
FROM unique_contacts uc
JOIN contacts c ON c.phone = uc.phone AND c.account_id = uc.account_id
WHERE conversations.contact_id = c.id 
AND conversations.contact_id != uc.id
AND conversations.account_id = '00000000-0000-0000-0000-000000000000';

-- Deletar contatos duplicados, mantendo apenas os únicos
DELETE FROM contacts 
WHERE account_id = '00000000-0000-0000-0000-000000000000'
AND id NOT IN (SELECT id FROM unique_contacts);

-- Adicionar constraint única para telefone por conta
ALTER TABLE contacts 
ADD CONSTRAINT unique_phone_per_account 
UNIQUE (phone, account_id);

-- Adicionar constraint única para email por conta (quando não for null)
CREATE UNIQUE INDEX unique_email_per_account 
ON contacts (email, account_id) 
WHERE email IS NOT NULL;