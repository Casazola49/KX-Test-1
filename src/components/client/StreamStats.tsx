"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, Wifi, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface StreamStatsProps {
  isLive: boolean;
  connectionStatus: 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';
  startTime?: Date;
  className?: string;
}

export default function StreamStats({ 
  isLive, 
  connectionStatus, 
  startTime, 
  className = '' 
}: StreamStatsProps) {
  const [duration, setDuration] = useState('00:00:00');
  const [viewerCount, setViewerCount] = useState(0);

  // Update duration every second when live
  useEffect(() => {
    if (!isLive || !startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - startTime.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setDuration(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, startTime]);

  // Simulate viewer count (in a real app, this would come from your analytics)
  useEffect(() => {
    if (!isLive) {
      setViewerCount(0);
      return;
    }

    const baseViewers = 15;
    const randomVariation = Math.floor(Math.random() * 20);
    setViewerCount(baseViewers + randomVariation);

    const interval = setInterval(() => {
      const variation = Math.floor(Math.random() * 6) - 3; // -3 to +3
      setViewerCount(prev => Math.max(1, prev + variation));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'connecting': 
      case 'reconnecting': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Conectado';
      case 'connecting': return 'Conectando...';
      case 'reconnecting': return 'Reconectando...';
      case 'error': return 'Error';
      default: return 'Desconectado';
    }
  };

  if (!isLive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}
    >
      {/* Duration */}
      <Card className="bg-black/20 border-primary/20">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-primary mr-2" />
            <span className="text-sm text-gray-400">Duración</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {duration}
          </div>
        </CardContent>
      </Card>

      {/* Viewers */}
      <Card className="bg-black/20 border-primary/20">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-primary mr-2" />
            <span className="text-sm text-gray-400">Espectadores</span>
          </div>
          <div className="text-xl font-bold text-white">
            {viewerCount}
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card className="bg-black/20 border-primary/20">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Wifi className={`w-5 h-5 mr-2 ${getConnectionColor()}`} />
            <span className="text-sm text-gray-400">Estado</span>
          </div>
          <div className={`text-sm font-medium ${getConnectionColor()}`}>
            {getConnectionText()}
          </div>
        </CardContent>
      </Card>

      {/* Live Indicator */}
      <Card className="bg-black/20 border-red-500/20">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-3 h-3 bg-red-500 rounded-full mr-2"
            />
            <span className="text-sm text-gray-400">Estado</span>
          </div>
          <div className="text-sm font-bold text-red-500">
            EN VIVO
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}