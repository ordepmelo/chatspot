
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, Instagram, Search, MoreVertical, UserPlus, UserCheck, ArrowRightLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import SaveContactModal from './SaveContactModal';
import TransferAttendanceModal from './TransferAttendanceModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  channel: 'whatsapp' | 'instagram';
  status: 'online' | 'offline';
  queueStatus?: 'waiting' | 'assigned' | 'all';
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onAssumeAttendance?: (conversationId: string) => void;
  onTransferAttendance?: (conversationId: string, userId: string) => void;
  onNewConversation?: (conversation: Conversation) => void;
  onUpdateConversation?: (conversationId: string, updatedData: Partial<Conversation>) => void;
}

const ChatSidebar = ({ conversations, activeConversation, onSelectConversation, onAssumeAttendance, onTransferAttendance, onNewConversation, onUpdateConversation }: ChatSidebarProps) => {
  const [saveContactModalOpen, setSaveContactModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const { toast } = useToast();

  const handleSaveContact = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setSaveContactModalOpen(true);
  };

  const handleTransferAttendance = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setTransferModalOpen(true);
  };

  const handleAssumeAttendance = (conversation: Conversation) => {
    if (onAssumeAttendance) {
      onAssumeAttendance(conversation.id);
    }
  };

  const handleTransferConfirm = (conversationId: string, userId: string) => {
    if (onTransferAttendance) {
      onTransferAttendance(conversationId, userId);
    }
  };

  const handleStartConversation = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite um número de telefone",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Iniciando conversa com:', phoneNumber.trim());

      // Primeiro, verificar se já existe um contato com esse número
      const { data: existingContact, error: searchError } = await supabase
        .from('contacts')
        .select('*')
        .eq('phone', phoneNumber.trim())
        .eq('account_id', '00000000-0000-0000-0000-000000000000')
        .maybeSingle();

      console.log('Resultado busca contato:', { existingContact, searchError });

      if (searchError) {
        console.error('Erro ao buscar contato existente:', searchError);
      }

      let contactData;
      let contactName;

      if (existingContact) {
        // Usar contato existente
        contactData = existingContact;
        contactName = existingContact.last_name 
          ? `${existingContact.first_name} ${existingContact.last_name}`
          : existingContact.first_name;
        
        toast({
          title: "Contato encontrado",
          description: `Iniciando conversa com ${contactName}`,
        });
      } else {
        console.log('Criando novo contato...');
        // Criar novo contato com o número como nome
        const { data: newContact, error: contactError } = await supabase
          .from('contacts')
          .insert({
            phone: phoneNumber.trim(),
            first_name: phoneNumber.trim(), // Nome será o próprio número até ser editado
            account_id: '00000000-0000-0000-0000-000000000000'
          })
          .select()
          .single();

        console.log('Resultado criação contato:', { newContact, contactError });

        if (contactError) {
          console.error('Erro ao criar contato:', contactError);
          toast({
            title: "Erro",
            description: `Erro ao criar contato: ${contactError.message}`,
            variant: "destructive",
          });
          return;
        }

        contactData = newContact;
        contactName = phoneNumber.trim();
        
        toast({
          title: "Novo contato criado",
          description: `Contato criado para ${phoneNumber.trim()}`,
        });
      }

      // Buscar inbox padrão do WhatsApp
      const { data: inboxData, error: inboxError } = await supabase
        .from('inboxes')
        .select('*')
        .eq('channel_type', 'whatsapp')
        .eq('account_id', '00000000-0000-0000-0000-000000000000')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('Inbox data:', inboxData);
      console.log('Inbox error:', inboxError);

      if (inboxError || !inboxData) {
        console.error('Erro ao buscar inbox:', inboxError);
        toast({
          title: "Erro",
          description: "Erro ao buscar inbox do WhatsApp. Verifique a configuração.",
          variant: "destructive",
        });
        return;
      }

      // Verificar se já existe uma conversa ativa com este contato
      const { data: existingConversation, error: conversationSearchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('contact_id', contactData.id)
        .eq('inbox_id', inboxData.id)
        .eq('account_id', '00000000-0000-0000-0000-000000000000')
        .maybeSingle();

      if (conversationSearchError) {
        console.error('Erro ao buscar conversa existente:', conversationSearchError);
      }

      let conversationData;

      if (existingConversation) {
        // Usar conversa existente
        conversationData = existingConversation;
        
        toast({
          title: "Conversa existente",
          description: "Redirecionando para conversa existente",
        });
      } else {
        // Criar nova conversa
        const { data: newConversation, error: conversationError } = await supabase
          .from('conversations')
          .insert({
            contact_id: contactData.id,
            inbox_id: inboxData.id,
            account_id: '00000000-0000-0000-0000-000000000000',
            status: 'assigned' // Status em atendimento
          })
          .select()
          .single();

        if (conversationError) {
          console.error('Erro ao criar conversa:', conversationError);
          toast({
            title: "Erro",
            description: "Erro ao criar conversa",
            variant: "destructive",
          });
          return;
        }

        conversationData = newConversation;
      }

      // Criar nova conversa para a UI
      const newConversation = {
        id: conversationData.id,
        name: contactName,
        lastMessage: existingConversation ? 'Conversa retomada' : 'Nova conversa iniciada',
        timestamp: 'agora',
        unreadCount: 0,
        channel: 'whatsapp' as const,
        status: 'online' as const,
        queueStatus: 'assigned' as const
      };

      if (onNewConversation) {
        onNewConversation(newConversation);
      }

      setPhoneNumber('');
      
      if (!existingConversation) {
        toast({
          title: "Sucesso",
          description: "Conversa iniciada com sucesso",
        });
      }

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao iniciar conversa",
        variant: "destructive",
      });
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-500" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return 'bg-green-500';
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Buscar conversas..." 
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            Nenhuma conversa encontrada
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                activeConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conversation.avatar} alt={conversation.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {conversation.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${getChannelColor(conversation.channel)}`}>
                    {getChannelIcon(conversation.channel)}
                  </div>
                  {conversation.status === 'online' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">
                      {conversation.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-gray-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveContact(conversation);
                            }}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Salvar/Editar Contato
                          </DropdownMenuItem>
                          
                          {(conversation.queueStatus === 'waiting' || conversation.queueStatus === 'assigned') && (
                            <>
                              <DropdownMenuSeparator />
                              {conversation.queueStatus === 'waiting' && (
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAssumeAttendance(conversation);
                                  }}
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Assumir Atendimento
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTransferAttendance(conversation);
                                }}
                              >
                                <ArrowRightLeft className="mr-2 h-4 w-4" />
                                Transferir Atendimento
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate mb-2">
                    {conversation.lastMessage}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 capitalize">
                      {conversation.channel}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs rounded-full">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Phone Input */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <Input 
            placeholder="DDD + Telefone" 
            className="flex-1 h-8 text-sm"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <Button 
            size="sm" 
            className="h-8 px-3 text-xs"
            onClick={handleStartConversation}
          >
            Iniciar conversa
          </Button>
        </div>
      </div>

      {/* Save Contact Modal */}
      <SaveContactModal
        isOpen={saveContactModalOpen}
        onClose={() => setSaveContactModalOpen(false)}
        conversationId={selectedConversation?.id || ''}
        conversationName={selectedConversation?.name || ''}
        conversationPhone=""
        onContactUpdated={(conversationId, contactName) => {
          if (onUpdateConversation) {
            onUpdateConversation(conversationId, { name: contactName });
          }
        }}
      />
      
      {/* Transfer Attendance Modal */}
      <TransferAttendanceModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        conversationId={selectedConversation?.id || ''}
        conversationName={selectedConversation?.name || ''}
        onTransfer={handleTransferConfirm}
      />
    </div>
  );
};

export default ChatSidebar;
