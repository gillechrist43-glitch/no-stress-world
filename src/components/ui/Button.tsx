import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import { colors, spacing, radii } from '../../theme';

type Props = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
};

export const Button: React.FC<Props> = ({ title, onPress, style, disabled = false }) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[
        {
          backgroundColor: disabled ? '#BDBDBD' : colors.accent,
          padding: spacing.md,
          borderRadius: radii.md,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      <Text style={{ color: colors.text, fontWeight: '700', textAlign: 'center' }}>{title}</Text>
    </TouchableOpacity>
  );
};
