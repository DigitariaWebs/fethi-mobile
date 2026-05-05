import { useLocalSearchParams } from 'expo-router';

import { ReportFlow } from '@/components/report/ReportFlow';
import { SELLERS } from '@/lib/fixtures';
import { BUYERS } from '@/lib/threads';

export default function ReportUser() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const u = SELLERS[id ?? ''] ?? BUYERS[id ?? ''];
  return (
    <ReportFlow
      title="Signaler l'utilisateur"
      subtitle={u?.name}
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
