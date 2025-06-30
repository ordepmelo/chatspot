
interface EvolutionApiConfig {
  baseUrl: string;
  apiKey: string;
  instanceName: string;
}

interface EvolutionMessage {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  pushName?: string;
  message: {
    conversation?: string;
    extendedTextMessage?: {
      text: string;
    };
  };
  messageTimestamp: number;
  status?: string;
}

interface EvolutionContact {
  id: string;
  pushName: string;
  remoteJid: string;
  profilePictureUrl?: string;
}

class EvolutionApiService {
  private config: EvolutionApiConfig;

  constructor(config: EvolutionApiConfig) {
    this.config = config;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'apikey': this.config.apiKey,
    };
  }

  private getApiUrl(endpoint: string) {
    return `${this.config.baseUrl}/${endpoint}`;
  }

  // Buscar todas as conversas
  async getChats(): Promise<any[]> {
    try {
      const response = await fetch(
        this.getApiUrl(`chat/findChats/${this.config.instanceName}`),
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      return [];
    }
  }

  // Buscar mensagens de uma conversa específica
  async getMessages(remoteJid: string, limit: number = 50): Promise<EvolutionMessage[]> {
    try {
      const response = await fetch(
        this.getApiUrl(`chat/findMessages/${this.config.instanceName}`),
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            where: {
              key: {
                remoteJid: remoteJid
              }
            },
            limit: limit
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      return [];
    }
  }

  // Enviar mensagem de texto
  async sendTextMessage(remoteJid: string, text: string): Promise<boolean> {
    try {
      const response = await fetch(
        this.getApiUrl(`message/sendText/${this.config.instanceName}`),
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            number: remoteJid,
            text: text
          })
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return false;
    }
  }

  // Buscar contatos
  async getContacts(): Promise<EvolutionContact[]> {
    try {
      const response = await fetch(
        this.getApiUrl(`chat/findContacts/${this.config.instanceName}`),
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      return [];
    }
  }

  // Configurar webhook para receber mensagens em tempo real
  async setWebhook(webhookUrl: string): Promise<boolean> {
    try {
      const response = await fetch(
        this.getApiUrl(`webhook/set/${this.config.instanceName}`),
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            webhook: {
              url: webhookUrl,
              events: [
                'MESSAGES_UPSERT',
                'MESSAGE_UPDATE',
                'PRESENCE_UPDATE',
                'CHATS_UPSERT',
                'CONTACTS_UPSERT'
              ]
            }
          })
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      return false;
    }
  }

  // Verificar status da instância
  async getInstanceStatus(): Promise<any> {
    try {
      const response = await fetch(
        this.getApiUrl(`instance/connect/${this.config.instanceName}`),
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao verificar status da instância:', error);
      return null;
    }
  }
}

export default EvolutionApiService;
