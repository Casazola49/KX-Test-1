// Página de prueba para debuggear eventos
import { getEventWithPodiumsSimple } from '@/lib/data-service-simple';

export default async function TestEventPage() {
  try {
    // Usar el ID del evento que sabemos que funciona
    const eventId = '4442350b-4cb5-4af5-878b-cac38f84835d';
    const eventData = await getEventWithPodiumsSimple(eventId);

    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Test Event Data</h1>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Raw Event Data:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(eventData, null, 2)}
          </pre>
        </div>

        {eventData && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Parsed Data:</h2>
            <p><strong>ID:</strong> {eventData.id}</p>
            <p><strong>Name:</strong> {eventData.name}</p>
            <p><strong>Podiums:</strong> {eventData.podiums ? eventData.podiums.length : 0}</p>
            <p><strong>Podiums is Array:</strong> {Array.isArray(eventData.podiums) ? 'Yes' : 'No'}</p>
            
            {eventData.podiums && eventData.podiums.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold">First Podium:</h3>
                <pre className="text-sm bg-gray-50 p-2 rounded">
                  {JSON.stringify(eventData.podiums[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
        <pre className="bg-red-100 p-4 rounded">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}