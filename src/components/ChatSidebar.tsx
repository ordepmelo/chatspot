import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, Instagram, Search, MoreVertical, UserPlus, UserCheck, ArrowRightLeft, X, Clock, AlertTriangle, Pin, Filter } from 'lucide-react';
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
  queueStatus?: 'waiting' | 'assigned' | 'all' | 'resolved';
  urgent?: boolean;
  pinned?: boolean;
  closed_at?: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onAssumeAttendance?: (conversationId: string) => void;
  onTransferAttendance?: (conversationId: string, userId: string) => void;
  onNewConversation?: (conversation: Conversation) => void;
  onUpdateConversation?: (conversationId: string, updatedData: Partial<Conversation>) => void;
  onConversationListUpdated?: () => void;
}

const ChatSidebar = ({ conversations, activeConversation, onSelectConversation, onAssumeAttendance, onTransferAttendance, onNewConversation, onUpdateConversation, onConversationListUpdated }: ChatSidebarProps) => {
  const [saveContactModalOpen, setSaveContactModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    showClosed: false,
    sortOldestFirst: false,
    urgentFirst: false,
  });
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

  const handleFinishConversation = async (conversation: Conversation) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ 
          status: 'resolved',
          closed_at: new Date().toISOString()
        })
        .eq('id', conversation.id);

      if (error) {
        console.error('Erro ao finalizar conversa:', error);
        toast({
          title: "Erro",
          description: "Erro ao finalizar conversa",
          variant: "destructive",
        });
        return;
      }

      if (onUpdateConversation) {
        onUpdateConversation(conversation.id, { 
          queueStatus: 'resolved' as any,
          closed_at: new Date().toISOString()
        });
      }

      toast({
        title: "Sucesso",
        description: "Conversa finalizada com sucesso",
      });

      if (onConversationListUpdated) {
        onConversationListUpdated();
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao finalizar conversa",
        variant: "destructive",
      });
    }
  };

  const handleSendToQueue = async (conversation: Conversation) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ 
          status: 'open',
          assignee_id: null 
        })
        .eq('id', conversation.id);

      if (error) {
        console.error('Erro ao enviar para fila:', error);
        toast({
          title: "Erro",
          description: "Erro ao enviar conversa para fila",
          variant: "destructive",
        });
        return;
      }

      if (onUpdateConversation) {
        onUpdateConversation(conversation.id, { queueStatus: 'waiting' });
      }

      toast({
        title: "Sucesso",
        description: "Conversa enviada para fila de aguardo",
      });

      if (onConversationListUpdated) {
        onConversationListUpdated();
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao enviar para fila",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsUrgent = async (conversation: Conversation) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ urgent: !conversation.urgent })
        .eq('id', conversation.id);

      if (error) {
        console.error('Erro ao marcar como urgente:', error);
        toast({
          title: "Erro",
          description: "Erro ao marcar conversa como urgente",
          variant: "destructive",
        });
        return;
      }

      if (onUpdateConversation) {
        onUpdateConversation(conversation.id, { urgent: !conversation.urgent });
      }

      toast({
        title: "Sucesso",
        description: conversation.urgent ? "Conversa desmarcada como urgente" : "Conversa marcada como urgente",
      });

      if (onConversationListUpdated) {
        onConversationListUpdated();
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao marcar como urgente",
        variant: "destructive",
      });
    }
  };

  const handlePinConversation = async (conversation: Conversation) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ pinned: !conversation.pinned })
        .eq('id', conversation.id);

      if (error) {
        console.error('Erro ao fixar conversa:', error);
        toast({
          title: "Erro",
          description: "Erro ao fixar conversa no topo",
          variant: "destructive",
        });
        return;
      }

      if (onUpdateConversation) {
        onUpdateConversation(conversation.id, { pinned: !conversation.pinned });
      }

      toast({
        title: "Sucesso",
        description: conversation.pinned ? "Conversa removida do topo" : "Conversa fixada no topo",
      });

      if (onConversationListUpdated) {
        onConversationListUpdated();
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao fixar conversa",
        variant: "destructive",
      });
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

      const isEmail = phoneNumber.includes('@');
      
      let existingContact = null;
      if (isEmail) {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('email', phoneNumber.trim())
          .eq('account_id', '00000000-0000-0000-0000-000000000000')
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar contato por email:', error);
        }
        existingContact = data;
      } else {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('phone', phoneNumber.trim())
          .eq('account_id', '00000000-0000-0000-0000-000000000000')
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar contato por telefone:', error);
        }
        existingContact = data;
      }

      console.log('Resultado busca contato:', { existingContact });

      if (existingContact) {
        const { data: activeConversations, error: convSearchError } = await supabase
          .from('conversations')
          .select('id, status')
          .eq('contact_id', existingContact.id)
          .eq('account_id', '00000000-0000-0000-0000-000000000000')
          .in('status', ['open', 'assigned']);

        if (convSearchError) {
          console.error('Erro ao buscar conversas ativas:', convSearchError);
        }

        if (activeConversations && activeConversations.length > 0) {
          const contactName = existingContact.last_name 
            ? `${existingContact.first_name} ${existingContact.last_name}`
            : existingContact.first_name;
          
          toast({
            title: "Conversa já existe",
            description: `Já existe uma conversa ativa com ${contactName}. Finalize a conversa atual antes de iniciar uma nova.`,
            variant: "destructive",
          });
          return;
        }
      }

      let contactData;
      let contactName;

      if (existingContact) {
        contactData = existingContact;
        contactName = existingContact.last_name 
          ? `${existingContact.first_name} ${existingContact.last_name}`
          : existingContact.first_name;
        
        toast({
          title: "Contato encontrado",
          description: `Iniciando nova conversa com ${contactName}`,
        });
      } else {
        console.log('Criando novo contato...');
        const contactInsert = {
          first_name: phoneNumber.trim(),
          account_id: '00000000-0000-0000-0000-000000000000'
        } as any;

        if (isEmail) {
          contactInsert.email = phoneNumber.trim();
          contactInsert.phone = '';
        } else {
          contactInsert.phone = phoneNumber.trim();
        }

        const { data: newContact, error: contactError } = await supabase
          .from('contacts')
          .insert(contactInsert)
          .select()
          .single();

        console.log('Resultado criação contato:', { newContact, contactError });

        if (contactError) {
          console.error('Erro ao criar contato:', contactError);
          
          if (contactError.code === '23505') {
            toast({
              title: "Erro",
              description: "Já existe um contato com esse telefone/email.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erro",
              description: `Erro ao criar contato: ${contactError.message}`,
              variant: "destructive",
            });
          }
          return;
        }

        contactData = newContact;
        contactName = phoneNumber.trim();
        
        toast({
          title: "Novo contato criado",
          description: `Contato criado para ${phoneNumber.trim()}`,
        });
      }

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

      const { data: newConversationData, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          contact_id: contactData.id,
          inbox_id: inboxData.id,
          account_id: '00000000-0000-0000-0000-000000000000',
          status: 'assigned'
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

      const uiConversation = {
        id: newConversationData.id,
        name: contactName,
        lastMessage: 'Nova conversa iniciada',
        timestamp: 'agora',
        unreadCount: 0,
        channel: 'whatsapp' as const,
        status: 'online' as const,
        queueStatus: 'assigned' as const
      };

      if (onNewConversation) {
        onNewConversation(uiConversation);
      }

      setPhoneNumber('');
      
      toast({
        title: "Sucesso",
        description: "Conversa iniciada com sucesso",
      });

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

  // Filtrar e ordenar conversas
  const filteredConversations = conversations
    .filter(conv => {
      if (!filters.showClosed && conv.queueStatus === 'resolved') {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Fixadas no topo
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      
      // Urgentes no topo (se filtro ativo)
      if (filters.urgentFirst) {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
      }
      
      // Ordenação por data
      if (filters.sortOldestFirst) {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filter */}
      <div className="p-4">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Buscar conversas..." 
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
          <DropdownMenu open={showFilter} onOpenChange={setShowFilter}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-3">
                <Filter className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="p-2 space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showClosed}
                    onChange={(e) => setFilters(prev => ({ ...prev, showClosed: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Exibir conversas finalizadas</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.sortOldestFirst}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortOldestFirst: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Exibir mais antigas no topo</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.urgentFirst}
                    onChange={(e) => setFilters(prev => ({ ...prev, urgentFirst: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Exibir urgentes no topo</span>
                </label>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            Nenhuma conversa encontrada
          </div>
        ) : (
          filteredConversations.map((conversation) => (
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
                    <div className="flex items-center space-x-1 flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {conversation.name}
                      </h3>
                      {conversation.pinned && (
                        <Pin className="w-3 h-3 text-blue-500 flex-shrink-0" />
                      )}
                      {conversation.urgent && (
                        <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
                      )}
                      {conversation.queueStatus === 'resolved' && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          Finalizada
                        </Badge>
                      )}
                    </div>
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

                              {conversation.queueStatus === 'assigned' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSendToQueue(conversation);
                                    }}
                                  >
                                    <Clock className="mr-2 h-4 w-4" />
                                    Enviar para Fila
                                  </DropdownMenuItem>

                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFinishConversation(conversation);
                                    }}
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Finalizar Atendimento
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsUrgent(conversation);
                                    }}
                                  >
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    {conversation.urgent ? 'Desmarcar como urgente' : 'Marcar como urgente'}
                                  </DropdownMenuItem>

                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePinConversation(conversation);
                                    }}
                                  >
                                    <Pin className="mr-2 h-4 w-4" />
                                    {conversation.pinned ? 'Desfixar do topo' : 'Fixar no topo'}
                                  </DropdownMenuItem>
                                </>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate mb-1">
                    {conversation.lastMessage}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-blue-500 text-white px-2 py-1 text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Start Conversation - Fixed position */}
      <div className="sticky bottom-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <Input
            placeholder="Telefone ou email"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleStartConversation}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Iniciar
          </Button>
        </div>
      </div>

      {/* Modals */}
      <SaveContactModal
        conversationId={selectedConversation?.id || ''}
        conversationName={selectedConversation?.name || ''}
        isOpen={saveContactModalOpen}
        onClose={() => setSaveContactModalOpen(false)}
      />
      
      <TransferAttendanceModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onTransfer={handleTransferConfirm}
        conversationId={selectedConversation?.id || ''}
        conversationName={selectedConversation?.name || ''}
      />
    </div>
  );
};

export default ChatSidebar;