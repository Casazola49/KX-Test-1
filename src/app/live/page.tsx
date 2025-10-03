
import PageTitle from '@/components/shared/PageTitle';
import SimpleLiveStreamClient from '@/components/client/SimpleLiveStreamClient';
import HorizontalAd from '@/components/shared/HorizontalAd';
import Section from '@/components/shared/Section';
import { Suspense } from 'react';
import ResourcePreloader from '@/components/optimization/ResourcePreloader';
import InvisibleOptimizations from '@/components/optimization/InvisibleOptimizations';
import LiveOptimizations from '@/components/optimization/LiveOptimizations';


// Función optimizada para cargar configuración de live stream
async function getOptimizedLiveStreamSettings() {
    try {
        // Usar la función correcta de data-service
        const { getLiveStreamConfig } = await import('@/lib/data-service');
        const settings = await getLiveStreamConfig();
        return settings || { is_live: false, stream_title: "Próxima Carrera", iframe_url: null };
    } catch (error) {
        console.error("Error fetching live stream settings:", error);
        return { is_live: false, stream_title: "Próxima Carrera", iframe_url: null };
    }
}

export default async function LivePage() {
    const settings = await getOptimizedLiveStreamSettings();

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
            <HorizontalAd section="live" />
            
            {/* Optimizaciones invisibles de rendimiento */}
            <ResourcePreloader />
            <InvisibleOptimizations />
            <LiveOptimizations />
        </>
    );
}
