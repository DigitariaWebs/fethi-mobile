import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useColors, t } from '@/theme';
import { MSButton } from '@/components';

type Props = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

// Shown when a network call or operation fails. Same anatomy as
// `<EmptyState>` but with a terracotta accent and a default Retry CTA.
export function ErrorState({
  title = "Une erreur est survenue.",
  description = "Impossible de charger. Vérifie ta connexion et réessaie.",
  onRetry,
  retryLabel = 'Réessayer',
}: Props) {
  const C = useColors();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 48,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: C.dangerSoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
        }}
      >
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 3 L22 20 H 2 Z"
            stroke={C.danger}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <Path
            d="M12 10 V14 M12 17 V17.01"
            stroke={C.danger}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
      </View>
      <Text
        style={{
          fontFamily: 'InstrumentSans-SemiBold',
          fontSize: 20,
          color: C.ink,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Text
        style={[
          t('body'),
          {
            color: C.n600,
            textAlign: 'center',
            marginTop: 8,
            maxWidth: 320,
            lineHeight: 22,
          },
        ]}
      >
        {description}
      </Text>
      {onRetry ? (
        <View style={{ marginTop: 22 }}>
          <MSButton size="lg" onPress={onRetry}>
            {retryLabel}
          </MSButton>
        </View>
      ) : null}
    </View>
  );
}
