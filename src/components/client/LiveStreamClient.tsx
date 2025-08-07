
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radio, MessageSquare, Info } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const LiveChatFeed = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const fetchInitialMessages = async () => {
      const { data } = await supabase.from('live_chat_messages').select('*').order('created_at', { ascending: true }).limit(50);
      if (data) setMessages(data);
    };
    fetchInitialMessages();

    const channel = supabase
      .channel('live_chat_feed_public_v3')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_chat_messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);
  
  return (
    <Card className="h-full flex flex-col bg-black/20 border-2 border-primary/20 backdrop-blur-xl shadow-2xl shadow-primary/10">
      <CardHeader className="border-b-2 border-primary/20">
        <CardTitle className="flex items-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-white">
            <MessageSquare className="mr-3"/> Relato en Vivo
        </CardTitle>
      </CardHeader>
      <CardContent ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-black/40 p-3 rounded-lg border border-white/10"
              >
                  {/* ---- CORRECCIÓN DE ESTILO ---- */}
                  <p className="font-bold text-primary text-md">{msg.author}</p>
                  <p className="text-gray-200 text-md whitespace-pre-wrap mt-1">{msg.message}</p>
              </motion.div>
            ))}
        </AnimatePresence>
        {messages.length === 0 && <p className="text-center text-gray-400 text-lg pt-10">Esperando el inicio del relato...</p>}
      </CardContent>
    </Card>
  );
};

export default function LiveStreamClient({ initialSettings }: { initialSettings: any }) {

  if (!initialSettings.is_live || !initialSettings.iframe_url) {
    return (
        <div className="text-center p-8 md:p-12 flex items-center justify-center h-[60vh]">
             <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, ease: "easeOut" }}>
                <Card className="inline-block bg-black/20 border-2 border-primary/20 backdrop-blur-xl shadow-2xl shadow-primary/10 p-8">
                    <CardHeader>
                        <Info className="mx-auto h-20 w-20 text-primary mb-6" />
                        <CardTitle className="text-5xl font-bold text-white">Transmisión No Activa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-400 text-xl mt-4">La carrera en vivo aparecerá aquí cuando comience. ¡Vuelve pronto!</p>
                    </CardContent>
                </Card>
             </motion.div>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
      <motion.div className="xl:col-span-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: "easeOut" }}>
        <Card className="overflow-hidden shadow-2xl bg-black/20 border-2 border-white/10 aspect-video relative">
            <CardHeader className="bg-black/30 z-10 relative">
                <CardTitle className="flex items-center text-2xl text-white">
                    <Radio className="mr-3 text-red-500 animate-pulse" />
                    {initialSettings.stream_title || "Transmisión en Vivo"}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-full">
                <iframe
                    src={initialSettings.iframe_url}
                    className="w-full h-full border-0 absolute top-0 left-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
                {/* ---- CAPA DE BLOQUEO ---- */}
                <div className="absolute inset-0 z-20" title="Transmisión en vivo"></div>
            </CardContent>
        </Card>
      </motion.div>

      <motion.div className="xl:col-span-1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}>
        <LiveChatFeed />
      </motion.div>
    </div>
  );
}
