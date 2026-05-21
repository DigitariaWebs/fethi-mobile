import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { ReportFlow } from '@/components/report/ReportFlow';
import { listingsApi, type Listing } from '@/lib/api';

export default function ReportListing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);

  // Charge le titre de l'annonce depuis le backend pour l'afficher dans le
  // header du flow. Si le fetch echoue (annonce supprimee), on garde le
  // subtitle vide — le signalement reste envoyable.
  useEffect(() => {
    if (!id) return;
    listingsApi.get(id).then(setListing).catch(() => {});
  }, [id]);

  return (
    <ReportFlow
      title="Signaler l'annonce"
      subtitle={listing?.title}
      targetType="LISTING"
      targetId={id}
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
