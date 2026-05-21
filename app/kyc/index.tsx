import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { useColors, radius as R, shadow as Sh, t } from '@/theme';
import { Icon, MSButton, PageHeader } from '@/components';
import { useKYC } from '@/lib/kyc';
import { useMe } from '@/hooks/useMe';

export default function KYCHome() {
  const C = useColors();
  const router = useRouter();
  const localTier = useKYC((s) => s.tier);
  const localStatus = useKYC((s) => s.status);
  const me = useMe();

  // Source de verite = backend. Si /me dit VERIFIED on est au moins tier 1.
  // Le store local sert juste pour le flow d'upload en cours (capture state).
  const { tier, status } = useMemo(() => {
    const backend = me.data?.kycStatus;
    if (backend === 'VERIFIED') {
      // Tier 1 par defaut quand verifie ; tier 2 si on avait deja uploade
      // une preuve d'adresse en plus
      const tier = localTier === 2 ? 2 : 1;
      return { tier: tier as 0 | 1 | 2, status: 'approved' as const };
    }
    if (backend === 'PENDING') return { tier: 0 as const, status: 'pending' as const };
    if (backend === 'REJECTED') return { tier: 0 as const, status: 'rejected' as const };
    // UNVERIFIED = pas encore soumis ; on retombe sur le local (qui est
    // 'idle' tant que rien n'a ete envoye)
    return { tier: localTier, status: localStatus };
  }, [me.data?.kycStatus, localTier, localStatus]);

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Vérification" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View
          style={[
            Sh.medium,
            {
              backgroundColor: tier === 0 ? C.warningSoft : tier === 1 ? C.primarySoft : C.successSoft,
              borderRadius: R.xl,
              padding: 22,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: 'InstrumentSans-SemiBold',
              fontSize: 11,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: tier === 0 ? '#7A4F0E' : tier === 1 ? C.primaryInk : '#2F4F45',
            }}
          >
            {`Niveau actuel · ${tier}`}
          </Text>
          <Text
            style={{
              fontFamily: 'InstrumentSans-SemiBold',
              fontSize: 22,
              color: C.ink,
              marginTop: 4,
            }}
          >
            {tier === 0 ? 'Compte vérifié' : tier === 1 ? 'Identité vérifiée' : 'Identité et adresse vérifiées'}
          </Text>
          <Text style={[t('bodySm'), { color: C.n700, marginTop: 6, lineHeight: 20 }]}>
            {tier === 0 ? 'Tu peux parcourir et envoyer des messages — niveau 1 requis avant le premier versement.'
              : tier === 1 ? 'Tu peux vendre jusqu\'à 1 000 € par mois. Passe au niveau 2 pour lever la limite.'
              : 'Aucun plafond. Stripe verse selon ta fréquence.'}
          </Text>
        </View>

        <View style={{ marginTop: 22, gap: 10 }}>
          <Tier
            label="Niveau 1 — Identité"
            sub="Photo d'une pièce d'identité + selfie. Obligatoire pour les versements."
            done={tier >= 1}
            onPress={() => router.push('/kyc/intro' as any)}
          />
          <Tier
            label="Niveau 2 — Adresse"
            sub="Facture ou relevé bancaire. Lève le plafond."
            done={tier >= 2}
            onPress={() => router.push('/kyc/address-proof' as any)}
            locked={tier === 0}
          />
        </View>

        {status === 'pending' ? (
          <Text style={[t('caption'), { color: C.n500, marginTop: 22, textAlign: 'center' }]}>
            Nous vérifions tes documents — généralement sous 1 jour ouvré.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Tier({
  label,
  sub,
  done,
  locked,
  onPress,
}: {
  label: string;
  sub: string;
  done: boolean;
  locked?: boolean;
  onPress: () => void;
}) {
  const C = useColors();
  return (
    <Pressable
      onPress={() => (locked ? null : onPress())}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        backgroundColor: C.surface,
        borderRadius: R.lg,
        borderWidth: 1,
        borderColor: C.divider,
        opacity: locked ? 0.5 : 1,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: done ? C.success : C.n100,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {done ? (
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M5 12 L 10 17 L 19 7" stroke="#FFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        ) : (
          <Text style={{ fontFamily: 'InstrumentSans-Bold', color: C.n500, fontSize: 12 }}>—</Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 15, color: C.ink }}>{label}</Text>
        <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]}>{sub}</Text>
      </View>
      {!done && !locked ? <Icon.Chevron size={14} color={C.n400} /> : null}
    </Pressable>
  );
}
