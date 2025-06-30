
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Wifi, WifiOff } from 'lucide-react';

interface EvolutionApiConfigProps {
  onConfigSave: (config: { baseUrl: string; apiKey: string; instanceName: string }) => void;
  isConnected: boolean;
  onTestConnection: () => void;
}

const EvolutionApiConfig = ({ onConfigSave, isConnected, onTestConnection }: EvolutionApiConfigProps) => {
  const [config, setConfig] = useState({
    baseUrl: 'https://sua-evolution-api.com',
    apiKey: '',
    instanceName: 'default'
  });

  const handleSave = () => {
    if (config.baseUrl && config.apiKey && config.instanceName) {
      onConfigSave(config);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Configuração Evolution API</span>
          <Badge className={`ml-auto ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Conectado
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Desconectado
              </>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="baseUrl">URL da API</Label>
            <Input
              id="baseUrl"
              placeholder="https://sua-evolution-api.com"
              value={config.baseUrl}
              onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Sua API Key"
              value={config.apiKey}
              onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instanceName">Nome da Instância</Label>
            <Input
              id="instanceName"
              placeholder="default"
              value={config.instanceName}
              onChange={(e) => setConfig(prev => ({ ...prev, instanceName: e.target.value }))}
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600">
            Salvar Configuração
          </Button>
          <Button variant="outline" onClick={onTestConnection}>
            Testar Conexão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvolutionApiConfig;
