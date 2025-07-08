
import React, { useState, useEffect } from 'react';
import ChatSidebar from '@/components/ChatSidebar';
import ChatArea from '@/components/ChatArea';
import CustomerProfile from '@/components/CustomerProfile';
import NotificationCenter from '@/components/NotificationCenter';
import QueueTabs from '@/components/QueueTabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, BarChart3, User } from 'lucide-react';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  channel: 'whatsapp' | 'instagram';
  status: 'online' | 'offline';
  queueStatus: 'waiting' | 'assigned' | 'all';
}

// Mock data
const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Maria Silva',
    avatar: '',
    lastMessage: 'Olá, gostaria de saber sobre os produtos...',
    timestamp: '14:32',
    unreadCount: 3,
    channel: 'whatsapp',
    status: 'online',
    queueStatus: 'waiting',
  },
  {
    id: '2',
    name: 'João Santos',
    avatar: '',
    lastMessage: 'Obrigado pelo atendimento!',
    timestamp: '14:15',
    unreadCount: 0,
    channel: 'instagram',
    status: 'offline',
    queueStatus: 'assigned',
  },
  {
    id: '3',
    name: 'Ana Costa',
    avatar: '',
    lastMessage: 'Quando vocês fazem entrega?',
    timestamp: '13:45',
    unreadCount: 1,
    channel: 'whatsapp',
    status: 'online',
    queueStatus: 'waiting',
  },
  {
    id: '4',
    name: 'Pedro Lima',
    avatar: '',
    lastMessage: 'Vi a promoção no Instagram...',
    timestamp: '13:22',
    unreadCount: 2,
    channel: 'instagram',
    status: 'offline',
    queueStatus: 'all',
  },
];

const mockMessages = [
  {
    id: '1',
    content: 'Olá! Como posso ajudá-lo hoje?',
    timestamp: '14:30',
    sender: 'user' as const,
    status: 'read' as const,
    type: 'text' as const,
  },
  {
    id: '2',
    content: 'Olá, gostaria de saber sobre os produtos disponíveis.',
    timestamp: '14:31',
    sender: 'customer' as const,
    status: 'delivered' as const,
    type: 'text' as const,
  },
  {
    id: '3',
    content: 'Claro! Temos várias opções disponíveis. Que tipo de produto você está procurando?',
    timestamp: '14:32',
    sender: 'user' as const,
    status: 'delivered' as const,
    type: 'text' as const,
  },
];

const mockCustomer = {
  id: '1',
  name: 'Maria Silva',
  avatar: '',
  phone: '+55 11 99999-9999',
  email: 'maria.silva@email.com',
  location: 'São Paulo, SP',
  channel: 'whatsapp' as const,
  status: 'online' as const,
  lastSeen: 'há 2 minutos',
  joinDate: '15 Jan 2024',
  totalMessages: 47,
  rating: 5,
  tags: ['VIP', 'Recorrente', 'Satisfeito'],
  notes: 'Cliente muito educado e sempre satisfeito com o atendimento.',
};

const mockNotifications = [
  {
    id: '1',
    type: 'message' as const,
    channel: 'whatsapp' as const,
    customerName: 'Maria Silva',
    content: 'Nova mensagem recebida',
    timestamp: '2 min',
    read: false,
  },
  {
    id: '2',
    type: 'message' as const,
    channel: 'instagram' as const,
    customerName: 'Pedro Lima',
    content: 'Cliente mencionou sua empresa',
    timestamp: '5 min',
    read: false,
  },
];

const Index = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>('1');
  const [showProfile, setShowProfile] = useState(false);
  const [conversations, setConversations] = useState(mockConversations);
  const [messages, setMessages] = useState(mockMessages);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeQueue, setActiveQueue] = useState<'waiting' | 'assigned' | 'all'>('waiting');
  const [currentQueueFilter, setCurrentQueueFilter] = useState<'waiting' | 'assigned' | 'all'>('waiting');

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    // Simulate loading messages for the selected conversation
    console.log(`Loading conversation ${id}`);
  };

  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      sender: 'user' as const,
      status: 'delivered' as const,
      type: 'text' as const,
    };
    setMessages([...messages, newMessage]);
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleAssumeAttendance = (conversationId: string) => {
    setConversations(prevConversations =>
      prevConversations.map(conversation =>
        conversation.id === conversationId
          ? { ...conversation, queueStatus: 'assigned' as const }
          : conversation
      )
    );
    // Muda para a aba de atendimento após assumir
    setActiveQueue('assigned');
  };

  const handleUpdateConversation = (conversationId: string, updatedData: Partial<Conversation>) => {
    setConversations(prevConversations =>
      prevConversations.map(conversation =>
        conversation.id === conversationId
          ? { ...conversation, ...updatedData }
          : conversation
      )
    );
  };

  const handleTransferAttendance = (conversationId: string, userId: string) => {
    // Por enquanto, mantém na aba de aguardando até que seja implementado o sistema de usuários
    console.log(`Transferindo conversa ${conversationId} para usuário ${userId}`);
    // Aqui você pode implementar a lógica de transferência quando o sistema de usuários estiver pronto
  };

  const filteredConversations = conversations.filter(conversation => {
    if (activeQueue === 'waiting') return conversation.queueStatus === 'waiting';
    if (activeQueue === 'assigned') return conversation.queueStatus === 'assigned';
    return true; // 'all' shows everything
  });

  const activeCustomer = activeConversation ? mockCustomer : null;

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">Chat Omnichannel</h1>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              Sistema Ativo
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Relatórios
            </Button>
            
            <Button variant="ghost" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Equipe
            </Button>
            
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={handleMarkNotificationAsRead}
              onMarkAllAsRead={handleMarkAllNotificationsAsRead}
              onDismiss={handleDismissNotification}
            />
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowProfile(!showProfile)}
              className={showProfile ? 'bg-blue-50 text-blue-600' : ''}
            >
              <User className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-full">
          <QueueTabs
            activeQueue={activeQueue}
            onQueueChange={setActiveQueue}
            counts={{
              waiting: conversations.filter(c => c.queueStatus === 'waiting').length,
              assigned: conversations.filter(c => c.queueStatus === 'assigned').length,
              all: conversations.length,
            }}
          />
          
          <ChatSidebar
            conversations={filteredConversations}
            activeConversation={activeConversation}
            onSelectConversation={handleSelectConversation}
            onAssumeAttendance={handleAssumeAttendance}
            onTransferAttendance={handleTransferAttendance}
            onUpdateConversation={handleUpdateConversation}
            onNewConversation={(newConversation) => {
              const conversation: Conversation = {
                id: newConversation.id,
                name: newConversation.name,
                avatar: '',
                lastMessage: newConversation.lastMessage,
                timestamp: newConversation.timestamp,
                unreadCount: newConversation.unreadCount,
                channel: newConversation.channel,
                status: newConversation.status,
                queueStatus: 'assigned'
              };
              setConversations(prev => [conversation, ...prev]);
              setActiveConversation(newConversation.id);
              setActiveQueue('assigned');
            }}
          />
        </div>
        
        <ChatArea
          customer={activeCustomer}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
        
        {showProfile && (
          <CustomerProfile
            customer={activeCustomer}
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
          />
        )}
      </div>

      {/* Status Bar */}
      <footer className="bg-white border-t border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Conectado a 2 canais</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>WhatsApp</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
              <span>Instagram</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span>{filteredConversations.length} conversas ativas</span>
            <span>Última sincronização: agora</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
