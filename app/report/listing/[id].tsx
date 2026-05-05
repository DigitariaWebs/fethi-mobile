import { useLocalSearchParams } from 'expo-router';

import { ReportFlow } from '@/components/report/ReportFlow';
import { LISTINGS } from '@/lib/fixtures';

export default function ReportListing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listing = LISTINGS.find((l) => l.id === id);
  return (
    <ReportFlow
      title="Signaler l'annonce"
      subtitle={listing?.title}
      reasons={[
        'Objet interdit',
        'Mauvaise catégorie',
        'Arnaque / fraude',
        'Objet volé',
        'Haine / harcèlement',
        'Autre',
      ]}
    />
  );
}
