
import { createClient } from '@supabase/supabase-js';
import PageTitle from '@/components/shared/PageTitle';
import LiveStreamClient from '@/components/client/LiveStreamClient';
import AdBanner from '@/components/shared/AdBanner';
import Section from '@/components/shared/Section';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getLiveStreamSettings() {
    const { data, error } = await supabase
        .from('live_stream')
        .select('*')
        .single();
    
    if (error) {
        console.error("Error fetching live stream settings:", error);
        return { is_live: false, stream_title: "Próxima Carrera", iframe_url: null };
    }
    return data;
}

export default async function LivePage() {
    const settings = await getLiveStreamSettings();

    return (
        <>
            <PageTitle title={settings.stream_title || "Carrera en Vivo"} subtitle="Sigue toda la acción minuto a minuto" />
            <Section className="py-8 md:py-12">
                <LiveStreamClient initialSettings={settings} />
            </Section>
            <AdBanner />
        </>
    );
}
