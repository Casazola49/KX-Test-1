
import PageTitle from '@/components/shared/PageTitle';
import StandingForm from './StandingForm';
import { getPilots, getRaceEvents } from '../actions';

export default async function AddStandingPage() {
  const pilots = await getPilots();
  const events = await getRaceEvents();

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle title="Add New Standing" />
      <div className="max-w-2xl mx-auto">
        <StandingForm pilots={pilots} events={events} />
      </div>
    </div>
  );
}
