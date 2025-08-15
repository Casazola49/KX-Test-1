"use client";

import { Wifi, WifiOff, RotateCcw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ConnectionStatus as ConnectionStatusType } from '@/hooks/useRealtimeConnection';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  error?: string | null;
  lastConnected?: Date | null;
  onReconnect?: () => void;
  className?: string;
  showDetails?: boolean;
}

export default function ConnectionStatus({
  status,
  error,
  lastConnected,
  onReconnect,
  className = "",
  showDetails = false
}: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          text: 'Conectado',
          pulse: true
        };
      case 'connecting':
        return {
          icon: Wifi,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          text: 'Conectando...',
          pulse: false
        };
      case 'reconnecting':
        return {
          icon: RotateCcw,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          text: 'Reconectando...',
          pulse: false,
          spin: true
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
          text: 'Desconectado',
          pulse: false
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          text: 'Error de conexión',
          pulse: false
        };
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
          text: 'Desconocido',
          pulse: false
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const formatLastConnected = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'hace un momento';
    if (minutes === 1) return 'hace 1 minuto';
    if (minutes < 60) return `hace ${minutes} minutos`;
    
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}
      >
        <div className="relative">
          <Icon 
            className={`w-4 h-4 ${config.color} ${config.spin ? 'animate-spin' : ''}`} 
          />
          {config.pulse && (
            <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-20" />
          )}
        </div>
        
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${config.color}`}>
            {config.text}
          </span>
          
          {showDetails && (
            <div className="text-xs text-gray-400 space-y-1">
              {lastConnected && status === 'connected' && (
                <div>Conectado {formatLastConnected(lastConnected)}</div>
              )}
              
              {error && (status === 'error' || status === 'reconnecting') && (
                <div className="text-red-400">{error}</div>
              )}
              
              {status === 'reconnecting' && (
                <div>Reintentando conexión...</div>
              )}
            </div>
          )}
        </div>

        {(status === 'error' || status === 'disconnected') && onReconnect && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReconnect}
            className="ml-2 h-6 px-2 text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reintentar
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}