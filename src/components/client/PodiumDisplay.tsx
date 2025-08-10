
'use client';

import type { FullPodium } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface PodiumDisplayProps {
    podium: FullPodium;
}

const positionSuffix = (pos: number) => {
    if (!pos) return '';
    const j = pos % 10, k = pos % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
}

const PodiumCard = ({ result, position }: { result: FullPodium['results'][0], position: number }) => {
    const pilot = result.pilot;
    // Mostrar tarjeta incluso si es invitado (sin piloto registrado)
    if (!pilot && !result.guest_name) return null; // Safety check
    
    const teamColor = pilot?.teamColor || '#333333';
    
    const backgroundStyle = {
        background: `radial-gradient(circle at 50% 0%, ${teamColor} 0%, #111 100%)`
    };

    const cardSizeClass = "min-h-[420px] md:min-h-[480px]";
    const firstPlaceEffect = position === 1 ? 'scale-105 hover:scale-110 z-10' : 'hover:scale-105';

    return (
        <div 
            className={`relative rounded-2xl shadow-2xl overflow-hidden text-white transition-transform duration-300 ease-in-out transform ${cardSizeClass} ${firstPlaceEffect}`}
            style={backgroundStyle}
        >
            <div className="p-6 flex flex-col justify-between items-center h-full relative z-10">
                <div className="absolute top-4 right-4 text-5xl font-black opacity-50">
                    {position}<span className="text-3xl align-top">{positionSuffix(position)}</span>
                </div>
                
                <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white/20 mt-8 bg-black/30">
                    {pilot ? (
                        <Image
                            src={pilot.imageUrl || '/pilotos/piloto.png'}
                            alt={`Foto de ${pilot.firstName} ${pilot.lastName}`}
                            fill
                            style={{objectFit: 'cover', objectPosition: 'center top'}}
                            sizes="(max-width: 768px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold">
                            {result.guest_name?.slice(0,1) || 'G'}
                        </div>
                    )}
                </div>

                <div className="text-center w-full mt-4">
                    <h3 className="text-3xl font-bold truncate w-full">{pilot ? `${pilot.firstName ?? ''} ${pilot.lastName ?? ''}`.trim() : (result.guest_name || 'Invitado')}</h3>
                    <p className="text-md opacity-70" style={{ color: teamColor }}>
                        {pilot ? (pilot.teamName || 'Independiente') : 'Invitado'}
                    </p>
                    <div className="mt-4 text-4xl font-bold bg-black/40 px-6 py-2 rounded-lg inline-block">
                        {result.result_value} <span className="text-xl font-normal opacity-70">PTS</span>
                    </div>
                </div>
            </div>
            <div className="absolute inset-0 opacity-[3%]" style={{backgroundImage: 'url(/patterns/noise.svg)', backgroundSize: '300px'}}></div>
        </div>
    );
};


export default function PodiumDisplay({ podium }: PodiumDisplayProps) {
    if (!podium || !podium.results || podium.results.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    Aún no hay resultados disponibles para este podio.
                </CardContent>
            </Card>
        );
    }

    const sortedResults = [...podium.results].sort((a, b) => a.position - b.position);
    const topThree = sortedResults.slice(0, 3);
    const others = sortedResults.slice(3);

    const podiumOrder = [
        topThree.find(r => r.position === 2),
        topThree.find(r => r.position === 1),
        topThree.find(r => r.position === 3),
    ].filter((r): r is FullPodium['results'][0] => !!r); // Correct type assertion

    return (
        <div className="py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-12">
                {podiumOrder.map(result => (
                    result ? <PodiumCard key={result.id} result={result} position={result.position} /> : null
                ))}
            </div>

            {others.length > 0 && (
                 <Card className="overflow-hidden mt-8 bg-background/50 backdrop-blur-sm">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px] text-center">Pos.</TableHead>
                                    <TableHead>Piloto</TableHead>
                                    <TableHead className="text-right">
                                        {podium.determination_method === 'TIEMPO' ? 'Tiempo' : 'Puntos'}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {others.map(result => (
                                    <TableRow key={result.id} className="hover:bg-white/5">
                                        <TableCell className="text-center font-bold text-lg">{result.position}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-black/30">
                                                    {result.pilot ? (
                                                        <Image
                                                            src={result.pilot.imageUrl || '/pilotos/piloto.png'}
                                                            alt={`Foto de ${result.pilot.firstName} ${result.pilot.lastName}`}
                                                            fill
                                                            style={{objectFit: 'cover'}}
                                                            sizes="48px"
                                                         />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-lg font-bold">
                                                            {(result.guest_name || 'G').slice(0,1)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{result.pilot ? `${result.pilot.firstName} ${result.pilot.lastName}` : (result.guest_name || 'Invitado')}</div>
                                                    {result.pilot && (
                                                        <div className="text-sm text-muted-foreground" style={{ color: result.pilot.teamColor || '#888' }}>
                                                             {result.pilot.teamName || 'Independiente'}{result.pilot.number ? ` - #${result.pilot.number}` : ''}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{result.result_value}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
