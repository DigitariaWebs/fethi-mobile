// Implementation WEB — utilise un iframe natif.
// Metro choisit ce fichier sur web (vs JitsiEmbed.tsx sur iOS/Android).

import { View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function JitsiEmbed({
  url,
  onEnd,
}: {
  url: string;
  onEnd: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <iframe
        src={url}
        // @ts-ignore — attribut HTML standard, accepte par react-native-web
        allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
        style={
          { flex: 1, border: 'none', width: '100%', height: '100%' } as any
        }
      />
      <Pressable
        onPress={onEnd}
        style={{
          position: 'absolute',
          bottom: 24 + insets.bottom,
          alignSelf: 'center',
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: '#D94545',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <Text style={{ color: '#FFF', fontSize: 24 }}>✕</Text>
      </Pressable>
    </View>
  );
}
