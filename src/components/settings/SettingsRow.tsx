import type { ReactNode } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';

import { useColors, t } from '@/theme';
import { Icon } from '@/components';

// Generic row used across settings sub-screens. Three modes:
//
//   - link  : navigates somewhere (chevron trailing)
//   - toggle: boolean switch (controlled)
//   - value : displays a value on the right (e.g. current language)
export type SettingsRowProps =
  | {
      kind: 'link';
      label: string;
      hint?: string;
      glyph?: ReactNode;
      onPress: () => void;
      tint?: string;
      last?: boolean;
    }
  | {
      kind: 'toggle';
      label: string;
      hint?: string;
      glyph?: ReactNode;
      value: boolean;
      onChange: (v: boolean) => void;
      last?: boolean;
    }
  | {
      kind: 'value';
      label: string;
      value: string;
      hint?: string;
      glyph?: ReactNode;
      onPress?: () => void;
      last?: boolean;
    };

export function SettingsRow(props: SettingsRowProps) {
  const C = useColors();
  const inner = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderBottomWidth: props.last ? 0 : 1,
        borderBottomColor: C.divider,
      }}
    >
      {props.glyph ? <View style={{ width: 22, alignItems: 'center' }}>{props.glyph}</View> : null}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: 'InstrumentSans-Medium',
            fontSize: 15,
            color: 'tint' in props && props.tint ? props.tint : C.ink,
          }}
        >
          {props.label}
        </Text>
        {props.hint ? (
          <Text style={[t('caption'), { color: C.n500, marginTop: 2 }]}>{props.hint}</Text>
        ) : null}
      </View>
      {props.kind === 'toggle' ? (
        <Switch
          value={props.value}
          onValueChange={props.onChange}
          // Brand terracotta for the ON state — keeps high contrast on both
          // light and dark surfaces (where `ink` flips to cream and would
          // blend with the white thumb).
          trackColor={{ true: C.primary, false: C.n200 }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={C.n200}
        />
      ) : null}
      {props.kind === 'value' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[t('bodySm'), { color: C.n500 }]}>{props.value}</Text>
          {props.onPress ? <Icon.Chevron size={14} color={C.n400} /> : null}
        </View>
      ) : null}
      {props.kind === 'link' ? <Icon.Chevron size={14} color={C.n400} /> : null}
    </View>
  );

  if (props.kind === 'link' || (props.kind === 'value' && props.onPress)) {
    return <Pressable onPress={(props as any).onPress}>{inner}</Pressable>;
  }
  return <View>{inner}</View>;
}

// Convenience wrapper that puts rows in a card-shaped group.
export function SettingsGroup({ title, children }: { title?: string; children: ReactNode }) {
  const C = useColors();
  return (
    <View style={{ marginTop: 18 }}>
      {title ? (
        <Text
          style={{
            fontFamily: 'InstrumentSans-SemiBold',
            fontSize: 11,
            color: C.n500,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            marginBottom: 8,
            paddingHorizontal: 6,
          }}
        >
          {title}
        </Text>
      ) : null}
      <View
        style={{
          backgroundColor: C.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: C.divider,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  );
}
