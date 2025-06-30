
export interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'customer';
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
}

export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  channel: 'whatsapp' | 'instagram';
  status: 'online' | 'offline';
  phone?: string;
  remoteJid?: string;
}

export interface Customer {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  location?: string;
  channel: 'whatsapp' | 'instagram';
  status: 'online' | 'offline';
  lastSeen?: string;
  joinDate: string;
  totalMessages: number;
  rating?: number;
  tags: string[];
  notes?: string;
  remoteJid?: string;
}

export interface Notification {
  id: string;
  type: 'message' | 'mention' | 'system';
  channel: 'whatsapp' | 'instagram';
  customerName: string;
  content: string;
  timestamp: string;
  read: boolean;
}
