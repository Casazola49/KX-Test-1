
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sendChatMessage } from '@/app/admin/live/actions';
import { useToast } from '@/hooks/use-toast';
// import { usePageCleanup } from '@/hooks/usePageCleanup';
import { Send, MessageSquare, Trash2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

export default function LiveChatConsole() {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);
  const { toast } = useToast();
  const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Use page cleanup hook
  // usePageCleanup({
  //   onCleanup: () => {
  //     console.log('🧹 LiveChatConsole cleaning up...');
  //     if (channelRef.current) {
  //       try {
  //         channelRef.current.unsubscribe();
  //         supabase.removeChannel(channelRef.current);
  //       } catch (error) {
  //         console.warn('⚠️ Error cleaning up chat console:', error);
  //       }
  //       channelRef.current = null;
  //     }
  //     setIsConnected(false);
  //   },
  //   enabled: true
  // });

  // Cargar mensajes iniciales y suscribirse a nuevos mensajes
  useEffect(() => {
    const fetchInitialMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('live_chat_messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        if (data) setMessages(data.reverse());
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

    const channel = supabase
      .channel('admin_live_chat')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'live_chat_messages' 
      }, (payload) => {
        console.log('📨 New message in admin console:', payload.new);
        setMessages((prevMessages) => [...prevMessages, payload.new]);
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'live_chat_messages' 
      }, (payload) => {
        console.log('🗑️ Message deleted in admin console:', payload.old);
        setMessages((prevMessages) => prevMessages.filter(msg => msg.id !== payload.old.id));
      })
      .subscribe((status) => {
        console.log('🔌 Admin chat console connection status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      console.log('🧹 Cleaning up admin chat console subscription');
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe();
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.warn('⚠️ Error during cleanup:', error);
        }
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [supabase, toast]);


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
      const { error } = await supabase
        .from('live_chat_messages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;
      
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="mr-3" />
            Relato en Vivo
            <div className={`ml-2 w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearMessages}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Escribe las actualizaciones aquí. Aparecerán en tiempo real en la página del "En Vivo".
          {!isConnected && (
            <span className="text-red-500 block mt-1">⚠️ Desconectado - Los mensajes pueden no enviarse</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-48 overflow-y-auto border rounded-md p-2 flex flex-col-reverse bg-muted/50">
           <div className="space-y-2">
            {messages.map((msg) => (
                <div key={msg.id} className="text-sm">
                    <span className="font-semibold text-primary">{msg.author || 'Admin'}: </span>
                    <span>{msg.message}</span>
                </div>
            ))}
           </div>
        </div>
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu relato..."
            disabled={isSending || !isConnected}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            className={!isConnected ? 'border-red-300' : ''}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isSending || !isConnected || !message.trim()}
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
