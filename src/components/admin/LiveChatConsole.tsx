
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sendChatMessage } from '@/app/admin/live/actions';
import { useToast } from '@/hooks/use-toast';
import { Send, MessageSquare } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

export default function LiveChatConsole() {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const { toast } = useToast();
  const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Cargar mensajes iniciales y suscribirse a nuevos mensajes
  useEffect(() => {
    const fetchInitialMessages = async () => {
      const { data } = await supabase
        .from('live_chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setMessages(data.reverse());
    };

    fetchInitialMessages();

    const channel = supabase
      .channel('live_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_chat_messages' }, (payload) => {
        setMessages((prevMessages) => [...prevMessages, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);


  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    const result = await sendChatMessage(message);
    setIsSending(false);

    if (result.success) {
      setMessage(''); // Limpiar el input si el envío es exitoso
    } else {
      toast({
        title: "Error al enviar",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-3" />
          Relato en Vivo
        </CardTitle>
        <CardDescription>
          Escribe las actualizaciones aquí. Aparecerán en tiempo real en la página del "En Vivo".
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
            disabled={isSending}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} disabled={isSending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
