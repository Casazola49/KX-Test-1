
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getStandings } from './actions';
import StandingsListClient from './StandingsListClient';
import PageTitle from '@/components/shared/PageTitle';
import { Button } from '@/components/ui/button';

export default async function AdminStandingsPage() {
  // Fetch both types of standings
  const pointsStandings = await getStandings('points');
  const timeTrialStandings = await getStandings('time_trial');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <PageTitle title="Manage Standings" />
        <Button asChild>
          <Link href="/admin/standings/add">
            <Plus className="mr-2 h-4 w-4" /> Add New Standing
          </Link>
        </Button>
      </div>

      <div className="space-y-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">Official Standings (By Points)</h2>
          <StandingsListClient standings={pointsStandings} />
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">Qualifying Standings (By Time)</h2>
          <StandingsListClient standings={timeTrialStandings} />
        </div>
      </div>
    </div>
  );
}
