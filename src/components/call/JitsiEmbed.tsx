// Implementation NATIVE (iOS / Android) — utilise react-native-webview.
// Metro charge ce fichier sur les plateformes mobiles uniquement (le
// fichier .web.tsx prend le relais sur le web).

import { View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { WebView } = require('react-native-webview');

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
      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
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
        }}
      >
        <Text style={{ color: '#FFF', fontSize: 24 }}>✕</Text>
      </Pressable>
    </View>
  );
}
