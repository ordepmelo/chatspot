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
      label: 'Aguardando',
      icon: Clock,
      count: counts.waiting,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      activeColor: 'border-orange-500 bg-orange-50',
    },
    {
      id: 'assigned' as const,
      label: 'Atendimento',
      icon: User,
      count: counts.assigned,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      activeColor: 'border-blue-500 bg-blue-50',
    },
    {
      id: 'all' as const,
      label: 'Todos',
      icon: Users,
      count: counts.all,
      color: 'bg-gray-500',
      lightColor: 'bg-gray-100',
      textColor: 'text-gray-600',
      activeColor: 'border-gray-500 bg-gray-50',
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeQueue === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onQueueChange(tab.id)}
              className={`
                flex-1 px-3 py-2 text-xs font-medium transition-all duration-200 
                border-b-2 hover:bg-gray-50 relative
                ${isActive 
                  ? `${tab.activeColor} ${tab.textColor} border-b-${tab.color.split('-')[1]}-500` 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <div className="flex items-center justify-center space-x-1">
                <Icon className={`w-3 h-3 ${isActive ? tab.textColor : 'text-gray-400'}`} />
                <span className="text-xs font-medium truncate">{tab.label}</span>
                <Badge 
                  className={`
                    px-1.5 py-0.5 text-xs font-medium rounded-full min-w-[20px] h-5
                    ${isActive 
                      ? `${tab.color} text-white` 
                      : `${tab.lightColor} ${tab.textColor}`
                    }
                  `}
                >
                  {tab.count}
                </Badge>
              </div>
              
              {isActive && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${tab.color}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QueueTabs;
