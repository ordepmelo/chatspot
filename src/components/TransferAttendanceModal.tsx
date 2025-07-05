import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

interface TransferAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  conversationName: string;
  onTransfer: (conversationId: string, userId: string) => void;
}

// Mock users - será substituído quando o sistema de usuários for implementado
const mockUsers = [
  { id: '1', name: 'João Silva', email: 'joao@empresa.com' },
  { id: '2', name: 'Maria Santos', email: 'maria@empresa.com' },
  { id: '3', name: 'Pedro Costa', email: 'pedro@empresa.com' },
];

const TransferAttendanceModal = ({
  isOpen,
  onClose,
  conversationId,
  conversationName,
  onTransfer,
}: TransferAttendanceModalProps) => {
  const [selectedUser, setSelectedUser] = useState<string>('');

  const handleTransfer = () => {
    if (selectedUser) {
      onTransfer(conversationId, selectedUser);
      setSelectedUser('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedUser('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Transferir Atendimento
          </DialogTitle>
          <DialogDescription>
            Selecione o usuário para quem deseja transferir a conversa com{' '}
            <strong>{conversationName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="user-select" className="text-sm font-medium">
              Selecionar Usuário
            </label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger id="user-select">
                <SelectValue placeholder="Escolha um usuário..." />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleTransfer} disabled={!selectedUser}>
            Transferir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferAttendanceModal;