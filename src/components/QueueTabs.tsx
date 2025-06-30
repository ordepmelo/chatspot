
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Users } from 'lucide-react';

interface QueueTabsProps {
  activeQueue: 'waiting' | 'assigned' | 'all';
  onQueueChange: (queue: 'waiting' | 'assigned' | 'all') => void;
  counts: {
    waiting: number;
    assigned: number;
    all: number;
  };
}

const QueueTabs = ({ activeQueue, onQueueChange, counts }: QueueTabsProps) => {
  const tabs = [
    {
      id: 'waiting' as const,
      label: 'Aguardando Atendimento',
      icon: Clock,
      count: counts.waiting,
      color: 'bg-orange-100 text-orange-800',
      activeColor: 'bg-orange-500 text-white',
    },
    {
      id: 'assigned' as const,
      label: 'Meus Atendimentos',
      icon: User,
      count: counts.assigned,
      color: 'bg-blue-100 text-blue-800',
      activeColor: 'bg-blue-500 text-white',
    },
    {
      id: 'all' as const,
      label: 'Todos Atendimentos',
      icon: Users,
      count: counts.all,
      color: 'bg-gray-100 text-gray-800',
      activeColor: 'bg-gray-500 text-white',
    },
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeQueue === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onQueueChange(tab.id)}
              className={`flex-1 px-4 py-3 text-xs font-medium transition-all duration-200 border-b-2 ${
                isActive
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-1">
                  <Icon className="w-3 h-3" />
                  <span className="truncate">{tab.label}</span>
                </div>
                
                <Badge 
                  className={`${
                    isActive ? tab.activeColor : tab.color
                  } hover:${isActive ? tab.activeColor : tab.color} text-xs px-2 py-0.5`}
                >
                  {tab.count}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QueueTabs;
