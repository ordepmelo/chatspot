
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, Instagram, Search, MoreVertical, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import SaveContactModal from './SaveContactModal';

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
}

const ChatSidebar = ({ conversations, activeConversation, onSelectConversation }: ChatSidebarProps) => {
  const [saveContactModalOpen, setSaveContactModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const handleSaveContact = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setSaveContactModalOpen(true);
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
                            Salvar contato
                          </DropdownMenuItem>
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
          />
          <Button size="sm" className="h-8 px-3 text-xs">
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
      />
    </div>
  );
};

export default ChatSidebar;
