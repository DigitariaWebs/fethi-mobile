import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius as R, t } from '@/theme';
import { MSAvatar } from '@/components';
import { callsApi, tokenStore, type ApiCall } from '@/lib/api';
import { JitsiEmbed } from '@/components/call/JitsiEmbed';

/**
 * Ecran d'appel VoIP. Embarque la salle Jitsi correspondant a l'appel
 * dans un iframe (web) ou une WebView (native).
 *
 * Le caller arrive ici juste apres avoir initie l'appel (status RINGING).
 * Le callee arrive ici quand il accepte une notif d'appel entrant.
 *
 * Quand l'user raccroche -> POST /me/calls/{id}/end + retour au chat.
 */
export default function CallScreen() {
  const C = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [call, setCall] = useState<ApiCall | null>(null);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [ended, setEnded] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Charge l'appel + poll son statut pour detecter accept/decline/end cote autre
  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoading(true);

    tokenStore.getUserId().then(setMyUserId);

    const fetchOnce = async () => {
      try {
        const c = await callsApi.get(id);
        if (!alive) return;
        setCall(c);
        if (c.status === 'DECLINED' || c.status === 'ENDED' || c.status === 'MISSED') {
          setEnded(true);
          // Auto-retour apres 1.5s
          setTimeout(() => router.back(), 1500);
        }
      } catch (err) {
        console.warn('call fetch failed', err);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchOnce();
    pollRef.current = setInterval(fetchOnce, 2000);
    return () => {
      alive = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [id, router]);

  const handleEnd = useCallback(async () => {
    if (!id) return;
    try {
      await callsApi.end(id);
    } catch {}
    router.back();
  }, [id, router]);

  // Auto-fin si on quitte l'ecran
  useEffect(() => {
    return () => {
      if (id && !ended) {
        callsApi.end(id).catch(() => {});
      }
    };
  }, [id, ended]);

  if (loading || !call) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: C.ink,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color="#FFF" size="large" />
      </View>
    );
  }

  const isCaller = call.callerId === myUserId;
  const otherId = isCaller ? call.calleeId : call.callerId;
  const otherShortName = otherId.slice(0, 6).toUpperCase();

  // ---------------------------------------------------------------------------
  // Statut RINGING -> ecran d'attente avec animation
  // ---------------------------------------------------------------------------
  if (call.status === 'RINGING') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: C.ink,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ alignItems: 'center', marginTop: 80 }}>
          <Text style={[t('caption'), { color: C.n300, letterSpacing: 1, marginBottom: 8 }]}>
            {isCaller ? 'APPEL EN COURS' : 'APPEL ENTRANT'}
          </Text>
          <MSAvatar name={otherShortName} size={120} />
          <Text
            style={{
              color: '#FFF',
              fontSize: 22,
              fontFamily: 'InstrumentSans-SemiBold',
              marginTop: 24,
            }}
          >
            Voisin·e
          </Text>
          <Text style={[t('body'), { color: C.n300, marginTop: 8 }]}>
            {isCaller ? 'Sonnerie…' : 'Vous appelle'}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: 48,
            paddingBottom: 32,
          }}
        >
          {!isCaller && (
            <Pressable
              onPress={async () => {
                try {
                  await callsApi.accept(call.id);
                } catch {}
              }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: '#3FA66B',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 28 }}>📞</Text>
            </Pressable>
          )}
          <Pressable
            onPress={async () => {
              if (!isCaller) {
                try {
                  await callsApi.decline(call.id);
                } catch {}
              } else {
                await handleEnd();
              }
            }}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: '#D94545',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 28 }}>✕</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // Statut ACCEPTED -> ecran avec Jitsi embed
  // ---------------------------------------------------------------------------
  if (call.status === 'ACCEPTED') {
    const params = new URLSearchParams({
      config: JSON.stringify({
        startWithAudioMuted: false,
        startWithVideoMuted: call.kind === 'AUDIO',
        prejoinPageEnabled: false,
        disableInviteFunctions: true,
      }),
    });
    const jitsiUrlWithParams = `${call.jitsiUrl}#${params.toString()}`;
    return <JitsiEmbed url={jitsiUrlWithParams} onEnd={handleEnd} />;
  }

  // ---------------------------------------------------------------------------
  // Statut ENDED / DECLINED / MISSED -> message + retour auto
  // ---------------------------------------------------------------------------
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.ink,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: '#FFF',
          fontSize: 20,
          fontFamily: 'InstrumentSans-SemiBold',
        }}
      >
        {call.status === 'DECLINED'
          ? 'Appel refusé'
          : call.status === 'MISSED'
            ? 'Appel manqué'
            : 'Appel terminé'}
      </Text>
      {call.durationSeconds != null && (
        <Text style={[t('body'), { color: C.n300, marginTop: 8 }]}>
          Durée : {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
        </Text>
      )}
    </View>
  );
}

