import React from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Badge } from './ui/badge';
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

const OnlineStatusIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <Badge 
      variant="outline"
      className={cn(
        "transition-all duration-200 gap-1.5 px-3 py-1 text-sm font-medium",
        isOnline ? 
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800" : 
          "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800"
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-3.5 w-3.5" />
          Online
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          Offline
        </>
      )}
    </Badge>
  );
};

export default OnlineStatusIndicator;
