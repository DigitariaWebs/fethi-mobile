// FavoriteButton — coeur pour sauvegarder/dessauvegarder une annonce.
//
// Wrappe `useToggleFavorite` avec un peu d'animation + un toast confirmatif.
// Conçu pour etre place sur:
//   - Le hero du listing detail (overlay glass en haut a droite)
//   - Les cartes du feed (overlay petit en haut a droite de la photo)
//   - L'ecran search results
//
// Utilise les Reanimated shared values pour le tap "pop" — l'icone grossit
// brievement et revient. Pas d'aller-retour serveur dans cette animation,
// c'est purement decoratif.

import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useColors } from '@/theme';
import { useToggleFavorite } from '@/hooks/useFavorites';
import { useToast } from '@/lib/toast';

type Variant = 'overlay' | 'inline';

export function FavoriteButton({
  listingId,
  variant = 'inline',
  size = 22,
}: {
  listingId: string;
  variant?: Variant;
  size?: number;
}) {
  const C = useColors();
  const toast = useToast();
  const { isFavorite, toggle, pending } = useToggleFavorite(listingId);
  const scale = useSharedValue(1);

  // Petit pop a chaque change d'etat
  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.25, { duration: 120 }),
      withTiming(1, { duration: 140 }),
    );
  }, [isFavorite, scale]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onPress = () => {
    if (pending) return;
    toggle();
    if (!isFavorite) {
      toast.success('Ajouté à tes favoris');
    }
    // Pas de toast au retrait pour eviter la fatigue (Instagram fait pareil)
  };

  // Style du conteneur — overlay (glass blanc semi-translucide sur photo)
  // ou inline (transparent, pour les barres d'actions)
  const containerStyle =
    variant === 'overlay'
      ? {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: 'rgba(255,255,255,0.88)',
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
        }
      : {
          width: 36,
          height: 36,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
        };

  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <View style={containerStyle}>
        <Animated.View style={animStyle}>
          <Heart filled={isFavorite} size={size} color={isFavorite ? C.danger : C.ink} />
        </Animated.View>
      </View>
    </Pressable>
  );
}

function Heart({ filled, size, color }: { filled: boolean; size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21s-7-4.5-9.3-9.1C1.2 8.9 3 5 6.5 5c2 0 3.5 1 4.5 2.5C12 6 13.5 5 15.5 5 19 5 20.8 8.9 19.3 11.9 17 16.5 12 21 12 21z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
