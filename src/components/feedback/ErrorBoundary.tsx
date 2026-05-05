import { Component, type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { useColors, t } from '@/theme';
import { MSButton } from '@/components';

// App-wide JS error boundary. Wrapped around the root navigator so any
// uncaught render error surfaces a friendly fallback instead of a white
// screen of death. In dev the original error still shows up in Metro.
//
// React class boundary keeps the error-catching lifecycle, but the
// rendered fallback is delegated to a functional child so it can read
// the live theme via `useColors()`.
type State = { error: Error | null };

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    if (__DEV__) console.error('Caught by ErrorBoundary:', error);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return <Fallback onReset={this.reset} />;
  }
}

function Fallback({ onReset }: { onReset: () => void }) {
  const C = useColors();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.paper,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: 'InstrumentSans-SemiBold', fontSize: 22, color: C.ink, textAlign: 'center' }}>
        Une erreur est survenue.
      </Text>
      <Text style={[t('body'), { color: C.n600, marginTop: 8, textAlign: 'center', maxWidth: 320, lineHeight: 22 }]}>
        Nous avons enregistré l'incident et nous regardons. Réessaie — tu ne devrais rien perdre.
      </Text>
      <View style={{ marginTop: 22 }}>
        <MSButton size="lg" onPress={onReset}>
          Réessayer
        </MSButton>
      </View>
    </View>
  );
}
