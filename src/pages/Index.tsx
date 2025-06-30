
import React, { useState, useEffect } from 'react';
import ChatSidebar from '@/components/ChatSidebar';
import ChatArea from '@/components/ChatArea';
import CustomerProfile from '@/components/CustomerProfile';
import NotificationCenter from '@/components/NotificationCenter';
import EvolutionApiConfig from '@/components/EvolutionApiConfig';
import { useEvolutionApi } from '@/hooks/useEvolutionApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, BarChart3, User, RefreshCw } from 'lucide-react';
import { Conversation, Message, Customer, Notification } from '@/types/chat';

// Mock notifications para exemplo
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    channel: 'whatsapp',
    customerName: 'Maria Silva',
    content: 'Nova mensagem recebida',
    timestamp: '2 min',
    read: false,
  },
  {
    id: '2',
    type: 'message',
    channel: 'instagram',
    customerName: 'Pedro Lima',
    content: 'Cliente mencionou sua empresa',
    timestamp: '5 min',
    read: false,
  },
];

const Index = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [apiConfig, setApiConfig] = useState({
    baseUrl: '',
    apiKey: '',
    instanceName: ''
  });

  const {
    conversations,
    messages,
    isLoading,
    isConnected,
    loadConversations,
    loadMessages,
    sendMessage,
    checkConnection
  } = useEvolutionApi(apiConfig);

  useEffect(() => {
    if (isConnected && apiConfig.apiKey) {
      loadConversations();
    }
  }, [isConnected, loadConversations, apiConfig.apiKey]);

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    const conversation = conversations.find(c => c.id === id);
    if (conversation?.remoteJid) {
      loadMessages(conversation.remoteJid);
    }
  };

  const handleSendMessage = async (content: string) => {
    const conversation = conversations.find(c => c.id === activeConversation);
    if (conversation?.remoteJid) {
      await sendMessage(conversation.remoteJid, content);
    }
  };

  const handleConfigSave = (config: { baseUrl: string; apiKey: string; instanceName: string }) => {
    setApiConfig(config);
    setShowConfig(false);
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

  const activeCustomer: Customer | null = activeConversation ? {
    id: activeConversation,
    name: conversations.find(c => c.id === activeConversation)?.name || 'Cliente',
    avatar: conversations.find(c => c.id === activeConversation)?.avatar || '',
    phone: conversations.find(c => c.id === activeConversation)?.phone || '',
    email: '',
    location: 'Brasil',
    channel: 'whatsapp',
    status: 'online',
    lastSeen: 'há 2 minutos',
    joinDate: '15 Jan 2024',
    totalMessages: messages.length,
    rating: 5,
    tags: ['WhatsApp', 'Cliente'],
    notes: 'Cliente conectado via Evolution API.',
    remoteJid: conversations.find(c => c.id === activeConversation)?.remoteJid
  } : null;

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">Chat Omnichannel - Evolution API</h1>
            <Badge className={isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => loadConversations()}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            
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
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowConfig(!showConfig)}
              className={showConfig ? 'bg-blue-50 text-blue-600' : ''}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="bg-white border-b border-gray-200 p-4">
          <EvolutionApiConfig
            onConfigSave={handleConfigSave}
            isConnected={isConnected}
            onTestConnection={checkConnection}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ChatSidebar
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={handleSelectConversation}
        />
        
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
            <span>Evolution API Integration</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span>{conversations.length} conversas ativas</span>
            <span>Última sincronização: {isLoading ? 'Carregando...' : 'Agora'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
