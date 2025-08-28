
import PageTitle from '@/components/shared/PageTitle';
import SimpleLiveStreamClient from '@/components/client/SimpleLiveStreamClient';
import AdBanner from '@/components/shared/AdBanner';
import Section from '@/components/shared/Section';
import { Suspense } from 'react';
import { getLiveStreamSettings } from '@/lib/data';

async function getLiveStreamSettingsData() {
    try {
        const settings = await getLiveStreamSettings();
        return settings || { is_live: false, stream_title: "Próxima Carrera", iframe_url: null };
    } catch (error) {
        console.error("Error fetching live stream settings:", error);
        return { is_live: false, stream_title: "Próxima Carrera", iframe_url: null };
    }
}

export default async function LivePage() {
    const settings = await getLiveStreamSettingsData();

    return (
        <>
            <PageTitle title={settings.stream_title || "Carrera en Vivo"} subtitle="Sigue toda la acción minuto a minuto" />
            <Section className="py-8 md:py-12">
                <Suspense fallback={
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400">Cargando transmisión...</p>
                        </div>
                    </div>
                }>
                    <SimpleLiveStreamClient initialSettings={settings} />
                </Suspense>
            </Section>
            <AdBanner />
        </>
    );
}
