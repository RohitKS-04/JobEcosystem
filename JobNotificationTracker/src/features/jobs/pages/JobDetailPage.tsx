import { useParams } from 'react-router-dom';
import { PlaceholderPage } from '../../../components/ui';

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <PlaceholderPage
      title={`Job #${id ?? 'unknown'}`}
      subtitle="Individual job detail view will be implemented in the next step."
    />
  );
}
