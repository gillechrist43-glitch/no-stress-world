import React from 'react';
import { View, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../../theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export const Card: React.FC<Props> = ({ children, style }) => {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          padding: spacing.md,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
