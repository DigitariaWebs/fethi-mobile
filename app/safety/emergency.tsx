import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, t } from '@/theme';
import { MSButton, PageHeader } from '@/components';
import { useToast } from '@/lib/toast';

export default function Emergency() {
  const C = useColors();
  const router = useRouter();
  const toast = useToast();
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Je ne me sens pas en sécurité" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View
          style={{
            backgroundColor: C.dangerSoft,
            borderRadius: R.xl,
            padding: 22,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            marginBottom: 22,
          }}
        >
          <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 3 L22 20 H 2 Z"
              stroke={C.danger}
              strokeWidth={2.4}
              strokeLinejoin="round"
            />
            <Path d="M12 10 V14 M12 17 V17.01" stroke={C.danger} strokeWidth={2.4} strokeLinecap="round" />
          </Svg>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.danger }}>
              En danger immédiat ? Appelle le 17.
            </Text>
            <Text style={[t('bodySm'), { color: '#7A1F18', marginTop: 4 }]}>
              Numéro d'urgence de la police. Quitte l'appli — appelle-les en premier.
            </Text>
          </View>
        </View>

        <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink, marginBottom: 8 }}>
          Partager ma position en direct avec un proche
        </Text>
        <Text style={[t('body'), { color: C.n600, marginBottom: 16, lineHeight: 22 }]}>
          Il recevra un lien mis à jour toutes les 30 s pendant 1 heure. Nous ne voyons rien.
        </Text>
        <MSButton size="lg" fullWidth onPress={() => toast.success('Position partagée avec Anna · pendant 1 heure.')}>
          Partager avec Anna
        </MSButton>
        <MSButton
          size="md"
          fullWidth
          variant="secondary"
          onPress={() => toast.info('Choisir un autre contact (mock).')}
        >
          Choisir un autre contact
        </MSButton>

        <View style={{ height: 24 }} />

        <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink, marginBottom: 8 }}>
          Annuler la rencontre
        </Text>
        <Text style={[t('body'), { color: C.n600, marginBottom: 16, lineHeight: 22 }]}>
          Nous annulons la commande et te remboursons. L'autre personne voit simplement « annulée ».
        </Text>
        <MSButton
          size="md"
          fullWidth
          variant="ghost"
          onPress={() => {
            toast.success('Rencontre annulée. Remboursement en cours.');
            router.back();
          }}
        >
          Annuler et rembourser
        </MSButton>
      </ScrollView>
    </View>
  );
}
