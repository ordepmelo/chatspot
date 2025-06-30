
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  MessageCircle,
  Instagram,
  Clock,
  Star,
  Tag
} from 'lucide-react';

interface Customer {
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
}

interface CustomerProfileProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerProfile = ({ customer, isOpen, onClose }: CustomerProfileProps) => {
  if (!customer || !isOpen) return null;

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

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">WhatsApp</Badge>;
      case 'instagram':
        return <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">Instagram</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Perfil do Cliente</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center mb-6">
              <Avatar className="w-20 h-20 mb-4">
                <AvatarImage src={customer.avatar} alt={customer.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                  {customer.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {customer.name}
              </h3>
              
              <div className="flex items-center space-x-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${
                  customer.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm text-gray-600">
                  {customer.status === 'online' ? 'Online agora' : `Visto ${customer.lastSeen || 'há pouco'}`}
                </span>
              </div>
              
              {getChannelBadge(customer.channel)}
            </div>

            <div className="space-y-4">
              {customer.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{customer.phone}</span>
                </div>
              )}
              
              {customer.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{customer.email}</span>
                </div>
              )}
              
              {customer.location && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{customer.location}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-700">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Cliente desde</span>
              </div>
              <span className="text-sm font-medium">{customer.joinDate}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Total de mensagens</span>
              </div>
              <span className="text-sm font-medium">{customer.totalMessages}</span>
            </div>
            
            {customer.rating && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Avaliação</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < customer.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        {customer.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {customer.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <Button className="w-full bg-blue-500 hover:bg-blue-600">
            Iniciar Chamada
          </Button>
          <Button variant="outline" className="w-full">
            Bloquear Cliente
          </Button>
          <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
            Encerrar Conversa
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
