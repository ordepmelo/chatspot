import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SaveContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  conversationName: string;
  conversationPhone?: string;
  onContactUpdated?: (conversationId: string, contactName: string) => void;
}

const SaveContactModal = ({ isOpen, onClose, conversationId, conversationName, conversationPhone, onContactUpdated }: SaveContactModalProps) => {
  const [formData, setFormData] = useState({
    firstName: conversationName || '',
    lastName: '',
    email: '',
    phone: conversationPhone || '',
    city: '',
    country: 'Brasil',
    biography: '',
    company: '',
    cnpj: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    otherSocial: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const { toast } = useToast();

  // Carregar dados do contato quando o modal abrir
  React.useEffect(() => {
    const loadContactData = async () => {
      if (!isOpen || !conversationId) return;

      setLoadingData(true);
      try {
        // Buscar conversa e contato associado
        const { data: conversation, error: conversationError } = await supabase
          .from('conversations')
          .select(`
            contact_id,
            contacts (
              first_name,
              last_name,
              email,
              phone,
              city,
              country,
              biography,
              company,
              cnpj,
              instagram,
              facebook,
              linkedin,
              other_social
            )
          `)
          .eq('id', conversationId)
          .single();

        if (conversationError) {
          console.error('Erro ao buscar conversa:', conversationError);
          return;
        }

        if (conversation?.contacts) {
          const contact = conversation.contacts;
          setFormData({
            firstName: contact.first_name || '',
            lastName: contact.last_name || '',
            email: contact.email || '',
            phone: contact.phone || '',
            city: contact.city || '',
            country: contact.country || 'Brasil',
            biography: contact.biography || '',
            company: contact.company || '',
            cnpj: contact.cnpj || '',
            instagram: contact.instagram || '',
            facebook: contact.facebook || '',
            linkedin: contact.linkedin || '',
            otherSocial: contact.other_social || ''
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do contato:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadContactData();
  }, [isOpen, conversationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.phone) {
      toast({
        title: "Erro",
        description: "Primeiro nome e telefone são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Verificar se já existe um contato com esse telefone
      const { data: existingContact, error: searchError } = await supabase
        .from('contacts')
        .select('*')
        .eq('phone', formData.phone)
        .maybeSingle();

      if (searchError) {
        console.error('Erro ao buscar contato:', searchError);
      }

      let contact;
      let operationType = '';

      if (existingContact) {
        // Atualizar contato existente
        const { data: updatedContact, error: updateError } = await supabase
          .from('contacts')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email || null,
            city: formData.city || null,
            country: formData.country || null,
            biography: formData.biography || null,
            company: formData.company || null,
            cnpj: formData.cnpj || null,
            instagram: formData.instagram || null,
            facebook: formData.facebook || null,
            linkedin: formData.linkedin || null,
            other_social: formData.otherSocial || null,
          })
          .eq('id', existingContact.id)
          .select()
          .single();

        if (updateError) throw updateError;
        contact = updatedContact;
        operationType = 'atualizado';
      } else {
        // Criar novo contato
        const { data: newContact, error: insertError } = await supabase
          .from('contacts')
          .insert({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email || null,
            phone: formData.phone,
            city: formData.city || null,
            country: formData.country || null,
            biography: formData.biography || null,
            company: formData.company || null,
            cnpj: formData.cnpj || null,
            instagram: formData.instagram || null,
            facebook: formData.facebook || null,
            linkedin: formData.linkedin || null,
            other_social: formData.otherSocial || null,
            account_id: '00000000-0000-0000-0000-000000000000'
          })
          .select()
          .single();

        if (insertError) throw insertError;
        contact = newContact;
        operationType = 'salvo';

        // Se não há conversa vinculada, criar uma nova
        if (!conversationId) {
          // Buscar inbox padrão do WhatsApp
          const { data: inboxData } = await supabase
            .from('inboxes')
            .select('*')
            .eq('channel_type', 'whatsapp')
            .eq('account_id', '00000000-0000-0000-0000-000000000000')
            .maybeSingle();

          if (inboxData) {
            // Criar nova conversa
            await supabase
              .from('conversations')
              .insert({
                contact_id: contact.id,
                inbox_id: inboxData.id,
                account_id: '00000000-0000-0000-0000-000000000000',
                status: 'assigned'
              });
          }
        }
      }

      toast({
        title: "Sucesso",
        description: `Contato ${operationType} com sucesso!`
      });

      // Chamar callback para atualizar o nome na conversa se existir
      if (onContactUpdated && conversationId && contact) {
        const fullName = contact.last_name 
          ? `${contact.first_name} ${contact.last_name}` 
          : contact.first_name;
        onContactUpdated(conversationId, fullName);
      }

      onClose();
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        city: '',
        country: 'Brasil',
        biography: '',
        company: '',
        cnpj: '',
        instagram: '',
        facebook: '',
        linkedin: '',
        otherSocial: ''
      });
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar contato. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Salvar Contato</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Primeiro Nome *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="country">País</Label>
              <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o país" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Brasil">Brasil</SelectItem>
                  <SelectItem value="Argentina">Argentina</SelectItem>
                  <SelectItem value="Chile">Chile</SelectItem>
                  <SelectItem value="Colombia">Colombia</SelectItem>
                  <SelectItem value="Peru">Peru</SelectItem>
                  <SelectItem value="Uruguay">Uruguay</SelectItem>
                  <SelectItem value="Paraguay">Paraguay</SelectItem>
                  <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Mexico">Mexico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="biography">Biografia</Label>
            <Textarea
              id="biography"
              value={formData.biography}
              onChange={(e) => handleInputChange('biography', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => handleInputChange('cnpj', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Redes Sociais</Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  placeholder="@usuario"
                />
              </div>
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={formData.facebook}
                  onChange={(e) => handleInputChange('facebook', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="otherSocial">Outros</Label>
                <Input
                  id="otherSocial"
                  value={formData.otherSocial}
                  onChange={(e) => handleInputChange('otherSocial', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Contato'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SaveContactModal;