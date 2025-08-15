"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Wifi, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StreamStatsProps {
  isLive: boolean;
  connectionStatus: string;
  startTime?: Date;
  className?: string;
}

export default function StreamStats({ 
  isLive, 
  connectionStatus, 
  startTime,
  className = "" 
}: StreamStatsProps) {
  const [viewerCount, setViewerCount] = useState(0);
  const [duration, setDuration] = useState('00:00:00');
  const [uptime, setUptime] = useState(0);

  // Simulate viewer count (in a real app, this would come from analytics)
  useEffect(() => {
    if (!isLive) {
      setViewerCount(0);
      return;
    }

    const interval = setInterval(() => {
      // Simulate realistic viewer fluctuation
      const baseViewers = 25;
      const variation = Math.floor(Math.random() * 30) - 15; // -15 to +15
      const newCount = Math.max(1, baseViewers + variation);
      setViewerCount(newCount);
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Calculate stream duration
  useEffect(() => {
    if (!isLive || !startTime) {
      setDuration('00:00:00');
      setUptime(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - startTime.getTime();
      const seconds = Math.floor(diff / 1000);
      
      setUptime(seconds);
      
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      setDuration(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, startTime]);

  if (!isLive) return null;

  const stats = [
    {
      icon: Users,
      label: 'Espectadores',
      value: viewerCount.toString(),
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      icon: Clock,
      label: 'Duración',
      value: duration,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      icon: Activity,
      label: 'Estado',
      value: connectionStatus === 'connected' ? 'Estable' : 'Reconectando',
      color: connectionStatus === 'connected' ? 'text-green-400' : 'text-yellow-400',
      bgColor: connectionStatus === 'connected' ? 'bg-green-400/10' : 'bg-yellow-400/10'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${className}`}
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-black/20 border border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className={`text-lg font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}