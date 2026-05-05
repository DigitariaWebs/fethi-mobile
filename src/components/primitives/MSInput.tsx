import { useState, type ReactNode } from 'react';
import { TextInput, View, Text, type TextInputProps } from 'react-native';
import { useColors, radius as R, t } from '@/theme';

type Props = Omit<TextInputProps, 'onChangeText'> & {
  label?: string;
  error?: string;
  icon?: ReactNode;
  value?: string;
  onChangeText?: (v: string) => void;
};

export function MSInput({
  label,
  error,
  icon,
  value,
  onChangeText,
  placeholder,
  ...rest
}: Props) {
  const C = useColors();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? C.danger : focused ? C.ink : C.n200;

  return (
    <View style={{ gap: 6 }}>
      {label && (
        <Text style={[t('label'), { color: C.n700, textTransform: 'none' }]}>
          {label}
        </Text>
      )}
      <View
        style={{
          height: 52,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: C.surface,
          borderWidth: 1.5,
          borderColor,
          borderRadius: R.full,
          shadowColor: '#1F2421',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 2,
        }}
      >
        {icon && <View>{icon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.n400}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[t('bodyLg'), { flex: 1, color: C.ink, padding: 0 }]}
          {...rest}
        />
      </View>
      {focused && !error && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: -4,
            right: -4,
            top: label ? 24 : 0,
            bottom: error ? 22 : 0,
            borderRadius: R.full,
            borderWidth: 4,
            borderColor: C.primarySoft,
            zIndex: -1,
          }}
        />
      )}
      {error && <Text style={[t('bodySm'), { color: C.danger }]}>{error}</Text>}
    </View>
  );
}
