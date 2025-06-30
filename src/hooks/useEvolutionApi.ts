
import { useState, useEffect, useCallback } from 'react';
import EvolutionApiService from '@/services/evolutionApi';
import { Conversation, Message, Customer } from '@/types/chat';

interface UseEvolutionApiProps {
  baseUrl: string;
  apiKey: string;
  instanceName: string;
}

export const useEvolutionApi = ({ baseUrl, apiKey, instanceName }: UseEvolutionApiProps) => {
  const [evolutionApi] = useState(() => new EvolutionApiService({ baseUrl, apiKey, instanceName }));
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Converter dados da Evolution API para o formato interno
  const convertEvolutionMessageToMessage = useCallback((evolutionMsg: any): Message => {
    const messageText = evolutionMsg.message?.conversation || 
                       evolutionMsg.message?.extendedTextMessage?.text || 
                       'Mensagem não suportada';

    return {
      id: evolutionMsg.key.id,
      content: messageText,
      timestamp: new Date(evolutionMsg.messageTimestamp * 1000).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      sender: evolutionMsg.key.fromMe ? 'user' : 'customer',
      status: evolutionMsg.status || 'delivered',
      type: 'text'
    };
  }, []);

  const convertEvolutionChatToConversation = useCallback((chat: any): Conversation => {
    const lastMessage = chat.lastMessage?.message?.conversation || 
                       chat.lastMessage?.message?.extendedTextMessage?.text || 
                       'Nova conversa';

    return {
      id: chat.id,
      name: chat.name || chat.id.split('@')[0],
      avatar: chat.profilePictureUrl || '',
      lastMessage: lastMessage,
      timestamp: chat.lastMessage ? 
        new Date(chat.lastMessage.messageTimestamp * 1000).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : 'Agora',
      unreadCount: chat.unreadCount || 0,
      channel: 'whatsapp' as const,
      status: 'offline' as const,
      phone: chat.id.split('@')[0],
      remoteJid: chat.id
    };
  }, []);

  // Carregar conversas
  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const chats = await evolutionApi.getChats();
      const convertedConversations = chats.map(convertEvolutionChatToConversation);
      setConversations(convertedConversations);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [evolutionApi, convertEvolutionChatToConversation]);

  // Carregar mensagens de uma conversa
  const loadMessages = useCallback(async (remoteJid: string) => {
    setIsLoading(true);
    try {
      const evolutionMessages = await evolutionApi.getMessages(remoteJid);
      const convertedMessages = evolutionMessages.map(convertEvolutionMessageToMessage);
      setMessages(convertedMessages.reverse()); // Mostrar mensagens mais recentes por último
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setIsLoading(false);
    }
  }, [evolutionApi, convertEvolutionMessageToMessage]);

  // Enviar mensagem
  const sendMessage = useCallback(async (remoteJid: string, text: string) => {
    try {
      const success = await evolutionApi.sendTextMessage(remoteJid, text);
      if (success) {
        // Adicionar mensagem localmente para feedback imediato
        const newMessage: Message = {
          id: Date.now().toString(),
          content: text,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          sender: 'user',
          status: 'sent',
          type: 'text'
        };
        setMessages(prev => [...prev, newMessage]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return false;
    }
  }, [evolutionApi]);

  // Verificar conexão
  const checkConnection = useCallback(async () => {
    try {
      const status = await evolutionApi.getInstanceStatus();
      setIsConnected(status?.instance?.state === 'open');
      return status?.instance?.state === 'open';
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      setIsConnected(false);
      return false;
    }
  }, [evolutionApi]);

  // Configurar webhook (opcional)
  const setupWebhook = useCallback(async (webhookUrl: string) => {
    try {
      return await evolutionApi.setWebhook(webhookUrl);
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      return false;
    }
  }, [evolutionApi]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    conversations,
    messages,
    isLoading,
    isConnected,
    loadConversations,
    loadMessages,
    sendMessage,
    checkConnection,
    setupWebhook
  };
};
