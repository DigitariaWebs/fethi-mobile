import { useLocalSearchParams } from 'expo-router';

import { ReportFlow } from '@/components/report/ReportFlow';

export default function ReportUser() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Le nom du user pourra etre recupere via un futur /users/{id}/public
  // endpoint. Pour l'instant on laisse le header sans subtitle — le user
  // arrive ici depuis un profil ou un thread, donc il sait qui il signale.
  return (
    <ReportFlow
      title="Signaler l'utilisateur"
      subtitle={undefined}
      targetType="USER"
      targetId={id}
      reasons={[
        'Harcèlement / menaces',
        'Tentative d\'arnaque',
        'Ne s\'est pas présenté(e) à une remise confirmée',
        'Comportement inapproprié',
        'Spam / promo commerciale',
        'Autre',
      ]}
    />
  );
}
