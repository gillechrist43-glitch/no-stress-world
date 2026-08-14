import React from 'react';
import { TextInput, View, Text } from 'react-native';
import { colors, radii, spacing } from '../../theme';

type Props = {
  label?: string;
  value?: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
};

export const Input: React.FC<Props> = ({ label, value, onChangeText, placeholder, secureTextEntry }) => {
  return (
    <View style={{ marginBottom: spacing.sm }}>
      {label ? <Text style={{ color: colors.text, marginBottom: 6 }}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secureTextEntry}
        style={{ backgroundColor: colors.card, padding: 12, borderRadius: radii.sm, color: colors.text, borderWidth: 1, borderColor: colors.border }}
      />
    </View>
  );
};
