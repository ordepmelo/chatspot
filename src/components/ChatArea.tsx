
import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  X,
  MessageCircle,
  Instagram,
  Check,
  CheckCheck
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'customer';
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
}

interface Customer {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  channel: 'whatsapp' | 'instagram';
  status: 'online' | 'offline';
  lastSeen?: string;
}

interface ChatAreaProps {
  customer: Customer | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onFinishConversation?: (customerId: string) => void;
  onReopenConversation?: (customerId: string) => void;
  conversationStatus?: 'resolved' | 'open' | 'assigned' | 'waiting' | 'all';
}

const ChatArea = ({ customer, messages, onSendMessage, onFinishConversation, onReopenConversation, conversationStatus }: ChatAreaProps) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  if (!customer) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Selecione uma conversa
          </h3>
          <p className="text-gray-500">
            Escolha uma conversa da lista para começar a atender o cliente
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={customer.avatar} alt={customer.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {customer.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1">
                {getChannelIcon(customer.channel)}
              </div>
            </div>
            
            <div>
              <h2 className="font-semibold text-gray-900">{customer.name}</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full ${
                  customer.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
                <span>
                  {customer.status === 'online' ? 'Online' : `Visto por último ${customer.lastSeen || 'há pouco'}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="w-4 h-4" />
            </Button>
            {conversationStatus === 'resolved' ? (
              <Button 
                variant="outline" 
                size="sm"
                className="text-green-600 border-green-300 hover:bg-green-50"
                onClick={() => onReopenConversation?.(customer.id)}
              >
                <Check className="w-4 h-4 mr-1" />
                Reabrir Atendimento
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => onFinishConversation?.(customer.id)}
              >
                <X className="w-4 h-4 mr-1" />
                Finalizar Atendimento
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                <span>{message.timestamp}</span>
                {message.sender === 'user' && getStatusIcon(message.status)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
