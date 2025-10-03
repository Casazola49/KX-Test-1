
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sendChatMessage } from '@/app/admin/live/actions';
import { useToast } from '@/hooks/use-toast';
// import { usePageCleanup } from '@/hooks/usePageCleanup';
import { Send, MessageSquare, Trash2 } from 'lucide-react';
import { getChatMessages, createChatMessage, clearChatMessages } from '@/lib/data-service';

export default function LiveChatConsole() {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);
  const { toast } = useToast();
  // Migrado a Firebase - ya no necesitamos cliente de Supabase

  // Migrado a Firebase - funcionalidad de limpieza simplificada

  // Cargar mensajes iniciales y configurar polling (migrado a Firebase)
  useEffect(() => {
    const fetchInitialMessages = async () => {
      try {
        const data = await getChatMessages(20); // Solo últimos 20 mensajes
        setMessages(data || []);
      } catch (error) {
        console.error('❌ Error fetching initial messages:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los mensajes iniciales",
          variant: "destructive",
        });
      }
    };

    fetchInitialMessages();
    setIsConnected(true);
    
    // Polling cada 3 segundos para actualizar mensajes
    const intervalId = setInterval(fetchInitialMessages, 3000);
    
    return () => {
      setIsConnected(false);
      clearInterval(intervalId);
    };
  }, [toast]);


  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    try {
      const result = await sendChatMessage(message);
      
      if (result.success) {
        setMessage(''); // Limpiar el input si el envío es exitoso
        toast({
          title: "Mensaje enviado",
          description: "El mensaje se ha enviado correctamente",
        });
      } else {
        toast({
          title: "Error al enviar",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error inesperado al enviar el mensaje",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleClearMessages = async () => {
    try {
      await clearChatMessages();
      setMessages([]);
      toast({
        title: "Mensajes eliminados",
        description: "Todos los mensajes han sido eliminados",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron eliminar los mensajes",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="mr-3" />
            Relato en Vivo
            <div className={`ml-2 w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearMessages}
            className="text-red-600 hover:text-red-700"
            title="Limpiar todos los mensajes"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Escribe el relato de la carrera. Los mensajes aparecen en tiempo real y se mantienen solo los últimos 20.
          {!isConnected && (
            <span className="text-red-500 block mt-1">⚠️ Desconectado - Los mensajes pueden no enviarse</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto border rounded-md p-3 bg-muted/50 min-h-[300px] max-h-[400px]">
          <div className="space-y-2">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No hay mensajes aún</p>
                <p className="text-xs mt-1">Escribe el primer mensaje del relato</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="text-sm bg-background/50 p-2 rounded border border-border">
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-semibold text-primary">{msg.author || 'KX'}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="text-foreground whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Los mensajes antiguos se eliminan automáticamente. Solo se mantienen los últimos 20 para que el relato sea dinámico.
        </div>
        
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ej: ¡Vuelta 5! El piloto #23 toma la delantera..."
            disabled={isSending || !isConnected}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className={!isConnected ? 'border-red-300' : ''}
            maxLength={500}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isSending || !isConnected || !message.trim()}
            size="lg"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Presiona Enter para enviar • {message.length}/500 caracteres
        </p>
      </CardContent>
    </Card>
  );
}
