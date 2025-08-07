
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import PdfViewer from '@/components/client/PdfViewer';
import AdBanner from '@/components/shared/AdBanner';
import React from 'react';

const regulations = [
  {
    title: "Reglamento F200 STANDARD 2025",
    pdfForView: "/reglamentos/visual reglamentos/reglamento f200 standar 2025 oficial.pdf",
    pdfForDownload: "/reglamentos/Reglamento F200  STANDAR 2025.pdf",
  },
  {
    title: "Reglamento F200 SUPER 2025",
    pdfForView: "/reglamentos/visual reglamentos/reglamento f200 super 2025 oficial.pdf",
    pdfForDownload: "/reglamentos/Reglamento F200 SUPER 2025.pdf",
  },
  {
    title: "Reglamento 125cc PROFESIONAL 2025",
    pdfForView: "/reglamentos/visual reglamentos/reglamento 125 cc profesional 2025.pdf",
    pdfForDownload: "/reglamentos/Reglamento 125 CC PROFESIONAL 2025.pdf",
  },
  {
    title: "Reglamento 100cc JUNIOR 2025",
    pdfForView: "/reglamentos/visual reglamentos/reglamento 100cc junior 2025.pdf",
    pdfForDownload: "/reglamentos/Reglamento 100cc JUNIOR 2025.pdf",
  },
  {
    title: "Reglamento INFANTIL 6.5 2025",
    pdfForView: "/reglamentos/visual reglamentos/reglamento infantil 6.5 2025.pdf",
    pdfForDownload: "/reglamentos/Reglamento INFANTIL 6.5 2025.pdf",
  },
  {
    title: "Reglamento MINI 60 2025",
    pdfForView: "/reglamentos/visual reglamentos/reglamento mini 60 2025.pdf",
    pdfForDownload: "/reglamentos/Reglamento MINI 60 2025.pdf",
  },
  {
    title: "Reglamento BABY KART 2025",
    pdfForView: "/reglamentos/visual reglamentos/reglamento baby kart 2025.pdf",
    pdfForDownload: "/reglamentos/Reglamento BABY KART 2025.pdf",
  }
];

export default function ReglamentoPage() {
  const middleIndex = Math.floor(regulations.length / 2);

  return (
    <>
      <PageTitle title="Reglamentos Oficiales" subtitle="KartXperience Bolivia 2025" />
      <Section className="py-8 md:py-12">
        <p className="text-center text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
          Conoce las normativas que rigen las competencias de karting en Bolivia para la temporada 2025. 
          Es fundamental que todos los participantes estén familiarizados con estos reglamentos.
        </p>
        
        <div className="space-y-12">
          {regulations.map((reg, index) => (
            <React.Fragment key={index}>
              <div className="bg-card p-4 md:p-6 rounded-lg shadow-lg border border-border">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                  <div className="flex items-center flex-grow">
                    <div className="p-2 bg-primary/10 rounded-full mr-3">
                      <FileText size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-foreground">{reg.title}</h3>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto flex-shrink-0">
                    <a
                      href={reg.pdfForDownload}
                      download={reg.title.replace(/ /g, '-') + '-Oficial.pdf'}
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full">
                        <Download size={16} className="mr-2" />
                        Descargar Reglamento Oficial
                      </Button>
                    </a>
                  </div>
                </div>
                
                <PdfViewer pdfUrl={reg.pdfForView} />

              </div>
              {/* Insert ad banner after the middle item */}
              {index === middleIndex -1 && <AdBanner />}
            </React.Fragment>
          ))}
        </div>
        
        <AdBanner />

        <div className="mt-12 text-center p-6 bg-card rounded-lg border border-border">
          <h3 className="text-xl font-semibold mb-2">Nota Importante</h3>
          <p className="text-muted-foreground">
            Los reglamentos pueden estar sujetos a cambios. Asegúrate de consultar siempre la última versión publicada por la
            entidad organizadora correspondiente.
          </p>
        </div>
      </Section>
    </>
  );
}
