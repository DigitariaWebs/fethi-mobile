import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { useColors, radius as R, t } from '@/theme';
import { Icon, MSButton, PageHeader } from '@/components';
import { useToast } from '@/lib/toast';

const FAQ = [
  { q: 'Quand suis-je payé(e) ?', a: 'Les fonds sont versés sur ton solde Stripe dès que les deux parties confirment la remise. Les versements arrivent sur ton compte sous 1 à 2 jours ouvrés.' },
  { q: 'Comment annuler une commande ?', a: "Ouvre la commande, descends en bas, et appuie sur « Remboursement ». Tu seras guidé(e) à travers le remboursement." },
  { q: 'Et si l\'acheteur ne se présente pas ?', a: "Reprogramme via le chat. S'il disparaît deux fois, ouvre un litige et nous regarderons." },
  { q: 'Les cautions sont-elles vraiment remboursables ?', a: 'Oui — retenue par Stripe puis rendue au loueur quand tu confirmes le retour de l\'objet en bon état.' },
  { q: 'Puis-je vendre en dehors de Lille ?', a: "Pas encore — nous déployons ville par ville. Abonne-toi à la newsletter pour être prévenu(e) quand ta ville arrive." },
];

export default function HelpCenter() {
  const C = useColors();
  const toast = useToast();
  const [q, setQ] = useState('');
  const visible = FAQ.filter((it) => it.q.toLowerCase().includes(q.toLowerCase()) || it.a.toLowerCase().includes(q.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <PageHeader title="Centre d'aide" />
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: C.surface,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: C.divider,
            paddingHorizontal: 14,
            height: 44,
          }}
        >
          <Icon.Search size={16} color={C.n500} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Rechercher dans l'aide"
            placeholderTextColor={C.n500}
            style={{ flex: 1, fontFamily: 'InstrumentSans-Medium', fontSize: 15, color: C.ink, padding: 0 }}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        {visible.map((it, i) => (
          <Pressable
            key={i}
            style={{
              backgroundColor: C.surface,
              borderRadius: R.md,
              borderWidth: 1,
              borderColor: C.divider,
              padding: 14,
            }}
          >
            <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 14, color: C.ink, marginBottom: 4 }}>
              {it.q}
            </Text>
            <Text style={[t('bodySm'), { color: C.n600, lineHeight: 20 }]}>{it.a}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <MSButton size="md" fullWidth variant="secondary" onPress={() => toast.info('Boîte de support ouverte (mock).')}>
          Contacter le support
        </MSButton>
      </View>
    </View>
  );
}
